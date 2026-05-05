#!/usr/bin/env node
/**
 * load_locos.js
 *
 * Loads electric loco master data from locodb.csv into div_locos.
 * Idempotent: uses INSERT ... ON DUPLICATE KEY UPDATE keyed on loco_number,
 * so re-running refreshes the non-key fields with latest CSV values.
 *
 * Transforms applied on load:
 *   - railway_zone  → uppercase + trim
 *   - blanks        → NULL  (except hrpt_count which defaults to 0)
 *   - hrpt_count    → parsed integer, blank = 0
 *   - commission_date is already ISO YYYY-MM-DD in the CSV
 *
 * Usage:
 *   node scripts/load_locos.js <path-to-locodb.csv>
 *   node scripts/load_locos.js                     # uses default path
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const csv = require('csv-parser');
require('dotenv').config();

const DEFAULT_CSV =
    '/Users/neeraja/Desktop/rtis_files_only/mail-spm-project/locodb.csv';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'jay',
    password: process.env.DB_PASSWORD || '4310jay',
    database: process.env.DB_NAME || 'bbtro',
};

const BATCH_SIZE = 1000;

function cleanStr(v) {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
}

function cleanHrpt(v) {
    const s = cleanStr(v);
    if (s === null) return 0;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 0;
}

function cleanZone(v) {
    const s = cleanStr(v);
    return s === null ? null : s.toUpperCase();
}

function cleanDate(v) {
    const s = cleanStr(v);
    if (s === null) return null;
    // CSV is already ISO YYYY-MM-DD; guard against stray formats
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function rowToTuple(r) {
    return [
        cleanStr(r['Loco Number']),
        cleanStr(r['Type of Loco']),
        cleanZone(r['Rly']),
        cleanStr(r['Base Shed']),
        cleanDate(r['DOC']),
        cleanStr(r['Traction Converter']),
        cleanStr(r['ARNO/ SIV']),
        cleanStr(r['RTIS']),
        cleanHrpt(r['HRPT Nos']),
        cleanStr(r['Microprocessor/Relay']),
        cleanStr(r['Hotel Load']),
    ];
}

async function insertBatch(conn, rows) {
    const sql = `
        INSERT INTO div_locos
            (loco_number, loco_type, railway_zone, home_shed,
             commission_date, traction_converter, arno_siv,
             rtis_oem, hrpt_count, microprocessor_type, hotel_load_oem)
        VALUES ?
        ON DUPLICATE KEY UPDATE
            loco_type           = VALUES(loco_type),
            railway_zone        = VALUES(railway_zone),
            home_shed           = VALUES(home_shed),
            commission_date     = VALUES(commission_date),
            traction_converter  = VALUES(traction_converter),
            arno_siv            = VALUES(arno_siv),
            rtis_oem            = VALUES(rtis_oem),
            hrpt_count          = VALUES(hrpt_count),
            microprocessor_type = VALUES(microprocessor_type),
            hotel_load_oem      = VALUES(hotel_load_oem)
    `;
    const [result] = await conn.query(sql, [rows]);
    return result;
}

async function loadLocos(csvPath) {
    console.log('='.repeat(60));
    console.log('div_locos loader');
    console.log('='.repeat(60));
    console.log(`CSV:      ${csvPath}`);
    console.log(`Database: ${dbConfig.database}@${dbConfig.host}`);

    if (!fs.existsSync(csvPath)) {
        throw new Error(`CSV not found: ${csvPath}`);
    }

    const rows = await new Promise((resolve, reject) => {
        const out = [];
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (r) => out.push(rowToTuple(r)))
            .on('end', () => resolve(out))
            .on('error', reject);
    });

    console.log(`Parsed:   ${rows.length} rows`);

    // Sanity: loco_number must be present
    const bad = rows.filter((t) => !t[0]);
    if (bad.length) {
        throw new Error(`${bad.length} rows missing loco_number — aborting`);
    }

    const conn = await mysql.createConnection(dbConfig);
    try {
        const [[countBefore]] = await conn.query(
            'SELECT COUNT(*) AS n FROM div_locos'
        );
        console.log(`Before:   ${countBefore.n} rows in div_locos`);

        let inserted = 0;
        let affected = 0;
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);
            const result = await insertBatch(conn, batch);
            inserted += batch.length;
            affected += result.affectedRows;
            process.stdout.write(
                `\r  loaded ${inserted}/${rows.length}...`
            );
        }
        process.stdout.write('\n');

        const [[countAfter]] = await conn.query(
            'SELECT COUNT(*) AS n FROM div_locos'
        );
        const [[zoneCount]] = await conn.query(
            'SELECT COUNT(DISTINCT railway_zone) AS z FROM div_locos'
        );
        const [[crCount]] = await conn.query(
            "SELECT COUNT(*) AS n FROM div_locos WHERE railway_zone = 'CR'"
        );

        console.log(`After:    ${countAfter.n} rows in div_locos`);
        console.log(`Zones:    ${zoneCount.z} distinct`);
        console.log(`CR zone:  ${crCount.n} locos`);
        console.log(
            `Affected: ${affected} (1=insert, 2=update per mysql2 convention)`
        );
        console.log('Done.');
    } finally {
        await conn.end();
    }
}

(async () => {
    const csvPath = process.argv[2] || DEFAULT_CSV;
    try {
        await loadLocos(path.resolve(csvPath));
    } catch (err) {
        console.error('\n❌ Load failed:', err.message);
        process.exit(1);
    }
})();
