#!/usr/bin/env node
/**
 * import_staff_csv.js
 *
 * Bulk import staff from a CSV file into div_staff_master.
 *
 * Features:
 *   - Pre-flight FK validation (office_code, designation_id, cli_id)
 *   - Date format coercion (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
 *   - Enum validation
 *   - Whitespace trimming on all string fields
 *   - Empty-string → NULL for optional fields
 *   - INSERT ... ON DUPLICATE KEY UPDATE (idempotent re-runs)
 *   - Transaction: all-or-nothing
 *   - --dry-run flag: validates without writing
 *
 * Usage:
 *   node scripts/import_staff_csv.js <path-to-csv>
 *   node scripts/import_staff_csv.js <path-to-csv> --dry-run
 *   node scripts/import_staff_csv.js <path-to-csv> --skip-existing
 *
 * Flags:
 *   --dry-run         Validate only, no writes
 *   --skip-existing   Skip rows whose hrms_id already exists in div_staff_master
 *                     (default: upsert — existing rows get overwritten)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

// --- DB config, from .env only ---
// No credential fallback on purpose. A default that silently works on the dev
// box is how a password ends up committed, and on the server it would let the
// script connect somewhere unintended instead of telling you .env is missing.
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
for (const k of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!process.env[k]) {
        console.error(`Missing ${k}. This script reads the DB from .env — run it from the repo root.`);
        process.exit(1);
    }
}

// --- Enum values (must match div_staff_master schema) ---
const ENUM_VALUES = {
    caste: ['GEN', 'OBC', 'SC', 'ST'],
    vision: ['Normal', 'NV', 'DV', 'Both'],
    gender: ['Male', 'Female', 'Other'],
    marital_status: ['Married', 'Unmarried'],
    safety_category: ['A', 'B', 'C'],
    assignment_status: ['permanent', 'officiating', 'transferred'],
};

// --- Columns to insert, in order ---
const COLUMNS = [
    'hrms_id', 'name', 'original_cms_id', 'current_cms_id',
    'current_office_code', 'home_office_code', 'designation_id', 'current_cli_id',
    'pf_number', 'date_of_birth', 'date_of_appointment', 'reporting_date',
    'hq_station', 'dept_rrb', 'cug_number', 'phone_number',
    'fathers_name', 'qualification', 'caste', 'email',
    'pan_card_no', 'vision', 'gender', 'aadhar_card_no',
    'marital_status', 'blood_group', 'id_card_no', 'safety_category',
    'assignment_status', 'current_assignment_start_date', 'status',
    'is_yard_staff', 'remarks',
];

const DATE_FIELDS = new Set([
    'date_of_birth', 'date_of_appointment', 'reporting_date', 'current_assignment_start_date',
]);

const INT_FIELDS = new Set(['designation_id', 'current_cli_id', 'is_yard_staff']);

// --- Helpers ---
function clean(v) {
    if (v === undefined || v === null) return null;
    const t = String(v).trim();
    return t === '' ? null : t;
}

function parseDate(value, field, rowNum) {
    const v = clean(value);
    if (v === null) return null;

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        const d = new Date(v);
        if (isNaN(d.getTime())) throw new Error(`Row ${rowNum}: invalid ${field} "${v}"`);
        return v;
    }
    // DD/MM/YYYY or DD-MM-YYYY
    const m = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
        const dd = m[1].padStart(2, '0');
        const mm = m[2].padStart(2, '0');
        const yyyy = m[3];
        return `${yyyy}-${mm}-${dd}`;
    }
    throw new Error(`Row ${rowNum}: unrecognised ${field} date format "${v}"`);
}

function toInt(value, field, rowNum) {
    const v = clean(value);
    if (v === null) return null;
    const n = parseInt(v, 10);
    if (isNaN(n)) throw new Error(`Row ${rowNum}: ${field} "${v}" is not an integer`);
    return n;
}

function validateEnum(field, value, rowNum) {
    const v = clean(value);
    if (v === null) return null;
    const allowed = ENUM_VALUES[field];
    if (!allowed.includes(v)) {
        throw new Error(
            `Row ${rowNum}: invalid ${field} "${v}". Allowed: ${allowed.join(', ')}`
        );
    }
    return v;
}

function readCsv(filePath) {
    return new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => resolve(rows))
            .on('error', reject);
    });
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const skipExisting = args.includes('--skip-existing');
    const filePath = args.find((a) => !a.startsWith('--'));

    if (!filePath) {
        console.error('Usage: node scripts/import_staff_csv.js <csv-path> [--dry-run]');
        process.exit(1);
    }
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`📂 Reading CSV: ${filePath}`);
    if (dryRun) console.log('🧪 DRY RUN — no writes will be performed');

    const raw = await readCsv(filePath);
    console.log(`   Parsed ${raw.length} rows`);

    // --- Normalise + validate each row ---
    const normalised = [];
    const errors = [];

    for (let i = 0; i < raw.length; i++) {
        const rowNum = i + 2; // +1 for header, +1 for 1-based
        const r = raw[i];
        try {
            const row = {};

            // Required
            row.hrms_id = clean(r.hrms_id);
            row.name = clean(r.name);
            if (!row.hrms_id) throw new Error(`Row ${rowNum}: hrms_id is required`);
            if (!row.name) throw new Error(`Row ${rowNum}: name is required`);

            // Plain strings
            for (const f of [
                'original_cms_id', 'current_cms_id', 'current_office_code', 'home_office_code',
                'pf_number', 'hq_station', 'dept_rrb', 'cug_number', 'phone_number',
                'fathers_name', 'qualification', 'email', 'pan_card_no',
                'aadhar_card_no', 'blood_group', 'id_card_no', 'remarks',
            ]) {
                row[f] = clean(r[f]);
            }

            // Ints
            for (const f of INT_FIELDS) row[f] = toInt(r[f], f, rowNum);

            // Dates
            for (const f of DATE_FIELDS) row[f] = parseDate(r[f], f, rowNum);

            // Enums
            row.caste = validateEnum('caste', r.caste, rowNum);
            row.vision = validateEnum('vision', r.vision, rowNum);
            row.gender = validateEnum('gender', r.gender, rowNum);
            row.marital_status = validateEnum('marital_status', r.marital_status, rowNum);
            row.safety_category = validateEnum('safety_category', r.safety_category, rowNum);
            row.assignment_status = validateEnum('assignment_status', r.assignment_status, rowNum) || 'permanent';

            // status: varchar with default 'Active'
            row.status = clean(r.status) || 'Active';

            normalised.push({ rowNum, row });
        } catch (e) {
            errors.push(e.message);
        }
    }

    if (errors.length) {
        console.error(`\n❌ ${errors.length} validation errors:`);
        for (const e of errors) console.error('   ' + e);
        console.error('\nFix these in the CSV and re-run. Aborting.');
        process.exit(1);
    }
    console.log('✅ All rows passed row-level validation');

    // --- Connect to DB ---
    const conn = await mysql.createConnection(dbConfig);
    console.log(`🔌 Connected to ${dbConfig.database}@${dbConfig.host}`);

    // --- Pre-flight FK checks ---
    const officeCodes = new Set();
    const designationIds = new Set();
    const cliIds = new Set();
    const hrmsIds = new Set();
    const cmsIds = new Set();

    for (const { rowNum, row } of normalised) {
        if (row.current_office_code) officeCodes.add(row.current_office_code);
        if (row.home_office_code) officeCodes.add(row.home_office_code);
        if (row.designation_id !== null) designationIds.add(row.designation_id);
        if (row.current_cli_id !== null) cliIds.add(row.current_cli_id);

        if (hrmsIds.has(row.hrms_id)) {
            console.error(`❌ Duplicate hrms_id "${row.hrms_id}" in CSV (row ${rowNum})`);
            process.exit(1);
        }
        hrmsIds.add(row.hrms_id);

        if (row.original_cms_id) {
            if (cmsIds.has(row.original_cms_id)) {
                console.error(`❌ Duplicate original_cms_id "${row.original_cms_id}" in CSV (row ${rowNum})`);
                process.exit(1);
            }
            cmsIds.add(row.original_cms_id);
        }
    }

    async function checkExists(label, table, column, values) {
        if (values.size === 0) return;
        const arr = [...values];
        const placeholders = arr.map(() => '?').join(',');
        const [rows] = await conn.query(
            `SELECT ${column} FROM ${table} WHERE ${column} IN (${placeholders})`,
            arr
        );
        const found = new Set(rows.map((r) => r[column]));
        const missing = arr.filter((v) => !found.has(v));
        if (missing.length) {
            throw new Error(
                `${label}: missing ${missing.length} reference(s) in ${table}.${column}: ${missing.join(', ')}`
            );
        }
        console.log(`   ✓ ${label}: all ${arr.length} references exist`);
    }

    try {
        console.log('🔍 Pre-flight FK checks:');
        await checkExists('office codes', 'offices', 'office_code', officeCodes);
        await checkExists('designations', 'designations', 'id', designationIds);
        await checkExists('CLIs', 'div_cli_master', 'cli_id', cliIds);
    } catch (e) {
        console.error(`❌ ${e.message}`);
        await conn.end();
        process.exit(1);
    }

    // Check for hrms_id collisions
    const [existingRows] = await conn.query(
        `SELECT hrms_id FROM div_staff_master WHERE hrms_id IN (?)`,
        [[...hrmsIds]]
    );
    const existingSet = new Set(existingRows.map((r) => r.hrms_id));

    let toImport = normalised;
    let skippedCount = 0;

    if (existingRows.length) {
        if (skipExisting) {
            toImport = normalised.filter(({ row }) => !existingSet.has(row.hrms_id));
            skippedCount = normalised.length - toImport.length;
            console.log(`   ⏭️  Skipping ${skippedCount} existing hrms_id (--skip-existing)`);
        } else {
            console.log(`   ⚠️  ${existingRows.length} hrms_id already exist — will be UPDATED:`);
            console.log('      ' + existingRows.map((r) => r.hrms_id).join(', '));
        }
    }

    if (dryRun) {
        console.log('\n🧪 Dry run complete. No writes performed.');
        console.log(`   Would insert/update ${toImport.length} rows` +
            (skippedCount ? ` (${skippedCount} skipped as already existing)` : '') + '.');
        await conn.end();
        return;
    }

    // --- Build INSERT ... ON DUPLICATE KEY UPDATE ---
    const placeholders = COLUMNS.map(() => '?').join(', ');
    const updateClause = COLUMNS
        .filter((c) => c !== 'hrms_id')
        .map((c) => `${c} = VALUES(${c})`)
        .join(', ');

    const sql = `INSERT INTO div_staff_master (${COLUMNS.join(', ')})
                 VALUES (${placeholders})
                 ON DUPLICATE KEY UPDATE ${updateClause}`;

    // --- Transactional insert ---
    let inserted = 0;
    let updated = 0;
    try {
        await conn.beginTransaction();
        console.log(`📝 Importing ${toImport.length} rows...`);

        for (const { rowNum, row } of toImport) {
            const values = COLUMNS.map((c) => row[c] ?? null);
            const [result] = await conn.execute(sql, values);
            // mysql2: affectedRows=1 for INSERT, =2 for UPDATE on duplicate key
            if (result.affectedRows === 1) inserted++;
            else if (result.affectedRows === 2) updated++;
        }

        await conn.commit();
        console.log(`\n✅ Import complete`);
        console.log(`   Inserted: ${inserted}`);
        console.log(`   Updated:  ${updated}`);
        if (skippedCount) console.log(`   Skipped:  ${skippedCount} (already existed)`);
        console.log(`   Processed: ${toImport.length} / ${normalised.length} rows`);
    } catch (e) {
        await conn.rollback();
        console.error(`\n❌ Import failed, rolled back: ${e.message}`);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

main().catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
});
