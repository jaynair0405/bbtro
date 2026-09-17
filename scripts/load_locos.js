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

// hotel_load_oem is not free text in effect: HOG capability is derived from it
// being non-empty (is_hog = !!hotel_load_oem). So a value that MEANS "not
// fitted" must arrive as NULL, or the loco reads as HOG-capable — the opposite
// of what the sheet said. Four locos were in exactly that state until
// sql/2026-09-17_hotel_load_hog_fix.sql, and a stale CSV would put them back.
const NOT_HOG = new Set(['NO', 'N', 'NIL', 'NONE', 'NA', '-']);
// Fold maker spellings onto the ones already in the table so the column does
// not sprout SIEMENS alongside Siemens.
const HOTEL_CANON = {
    SIEMENS: 'Siemens', MEDHA: 'Medha', AAL: 'AAL', BHEL: 'BHEL', ABB: 'ABB',
    'ABB(COMPOSITE)': 'ABB(Composite)', 'BHEL(COMPOSITE)': 'BHEL(Composite)',
    HIRECT: 'HIRECT', HIND: 'HIND', CUMMINS: 'Cummins',
};
function cleanHotelLoad(v) {
    const s = (v === undefined || v === null) ? '' : String(v).trim();
    if (!s) return null;
    const u = s.toUpperCase();
    if (NOT_HOG.has(u)) return null;          // "not fitted" is NULL, never text
    return HOTEL_CANON[u] || s;
}

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
        cleanHotelLoad(r['Hotel Load']),
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

        // ── Refuse an obviously stale CSV ─────────────────────────────
        // The transfer guard below saves deliberate MOVES, but nothing saves a
        // correction the CSV simply predates. Loading the April 2026 file over
        // the September reconciliation reverts 1,170 rows of class and zone —
        // silently, because an upsert cannot tell stale from new.
        //
        // A genuine refresh changes a handful of rows. Thousands means the file
        // is older than the database. Count first, and stop.
        const [existing] = await conn.query(
            'SELECT loco_number, loco_type, railway_zone, home_shed, hotel_load_oem FROM div_locos'
        );
        const have = new Map(existing.map((r) => [String(r.loco_number), r]));
        const eq = (a, b) => String(a ?? '').trim().toUpperCase() === String(b ?? '').trim().toUpperCase();
        let wouldChange = 0;
        for (const t of rows) {
            const cur = have.get(String(t[0]));
            if (!cur) continue;                       // a new loco is an addition, not a change
            if (!eq(cur.loco_type, t[1]) || !eq(cur.railway_zone, t[2]) ||
                !eq(cur.home_shed, t[3]) || !eq(cur.hotel_load_oem, t[10])) wouldChange++;
        }
        const newRows = rows.filter((t) => !have.has(String(t[0]))).length;
        console.log(`Changes:  ${wouldChange} existing rows would change, ${newRows} would be added`);
        const LIMIT = parseInt(process.env.LOCO_RELOAD_MAX_CHANGES || '250', 10);
        if (wouldChange > LIMIT && process.env.LOCO_RELOAD_FORCE !== '1') {
            throw new Error(
                `this CSV would change ${wouldChange} existing rows (limit ${LIMIT}).\n` +
                '  That usually means the file is OLDER than the database and would\n' +
                '  revert corrections made since it was cut. Check the CSV is current.\n' +
                '  To override:  LOCO_RELOAD_FORCE=1 ALLOW_LOCO_RELOAD=1 node scripts/load_locos.js <csv>\n' +
                '  To raise the bar instead:  LOCO_RELOAD_MAX_CHANGES=<n>'
            );
        }

        // ── Protect deliberate transfers ──────────────────────────────
        // The CSV is a point-in-time snapshot. A loco moved AFTER it was cut
        // still reads at its old shed in the file, so the upsert below would
        // silently undo the move — which is what happened to 30081 and 30186:
        // transferred BRCE -> KYNE on 2026-06-23, reverted by a later load,
        // while div_loco_transfers went on recording the move as done.
        //
        // A loco is protected when its CURRENT shed and zone are exactly what
        // its latest recorded transfer set. That is the signal the value was
        // put there deliberately. If it has since moved again without being
        // recorded, it will not match, and the CSV rightly wins.
        const [protectedRows] = await conn.query(`
            SELECT l.loco_number, l.home_shed, l.railway_zone
              FROM div_locos l
              JOIN div_loco_transfers t ON t.loco_number = l.loco_number
              JOIN (SELECT loco_number, MAX(changed_at) AS mx
                      FROM div_loco_transfers
                     WHERE action = 'TRANSFER'
                     GROUP BY loco_number) last
                ON last.loco_number = t.loco_number AND last.mx = t.changed_at
             WHERE t.action = 'TRANSFER'
               AND l.home_shed <=> t.to_shed
               AND l.railway_zone <=> t.to_zone
        `);
        console.log(`Guarded:  ${protectedRows.length} locos whose shed/zone came from a recorded transfer`);

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

        // Put the deliberate transfers back where the snapshot moved them.
        let restored = 0;
        for (const r of protectedRows) {
            const [res] = await conn.query(
                `UPDATE div_locos SET home_shed = ?, railway_zone = ?
                  WHERE loco_number = ?
                    AND NOT (home_shed <=> ? AND railway_zone <=> ?)`,
                [r.home_shed, r.railway_zone, r.loco_number, r.home_shed, r.railway_zone]
            );
            if (res.affectedRows) {
                restored++;
                console.log(`  kept ${r.loco_number} at ${r.home_shed}/${r.railway_zone} (CSV would have moved it back)`);
            }
        }
        if (restored) console.log(`Restored: ${restored} transfer(s) the CSV would have undone`);

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
    // ── SAFETY GUARD ──────────────────────────────────────────────────────
    // This is a ONE-TIME bulk importer. div_locos is now a live table that also
    // holds LPC-entered data (schedule_type / schedule_due_date, data_source,
    // etc.). Re-running this refreshes the CSV columns and is NOT part of any
    // day-to-day workflow. Disabled by default to prevent an accidental run.
    // To intentionally re-import:  ALLOW_LOCO_RELOAD=1 node scripts/load_locos.js
    if (process.env.ALLOW_LOCO_RELOAD !== '1') {
        console.error(
            'load_locos.js is a one-time importer and is disabled by default.\n' +
            'It refreshes CSV-sourced div_locos columns (loco_type, home_shed, etc.);\n' +
            'it does NOT touch LPC columns like schedule_type/schedule_due_date.\n' +
            'If you really mean to re-import, run:\n' +
            '  ALLOW_LOCO_RELOAD=1 node scripts/load_locos.js [csv-path]'
        );
        process.exit(1);
    }

    const csvPath = process.argv[2] || DEFAULT_CSV;
    try {
        await loadLocos(path.resolve(csvPath));
    } catch (err) {
        console.error('\n❌ Load failed:', err.message);
        process.exit(1);
    }
})();
