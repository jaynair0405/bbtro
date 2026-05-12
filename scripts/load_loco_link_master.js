#!/usr/bin/env node
/**
 * load_loco_link_master.js
 *
 * Loads /Users/neeraja/loco-link/CO_Loco_link_final.xlsx into div_loco_link_master.
 * Idempotent — uses INSERT … ON DUPLICATE KEY UPDATE keyed on
 * (train_no, direction, from_station). Re-running refreshes non-key fields.
 *
 * Sheets:
 *   1. CSMT-DN, CSMT-UP, VVH-UP, VVH-DN, KR-UP, KR-DN — flat canonical layout
 *      Cols: SR_NO | SECTION | DIRECTION | FROM_STATION | SHED_CODE |
 *            LINK_ATTR | RAKE_TYPE | TRAIN_NO | TIME | RUN_DAYS | REMARK
 *   2. BYPASS — side-by-side UP/DN, multiple route blocks; unpivoted into 1 row per train
 *
 * Defensive transforms:
 *   - TRIM all string cells
 *   - Strip embedded \n in TRAIN_NO; extract leading digits if "01149 (BIRD-…)"
 *   - traction_type derived from LINK_ATTR (DSL→Diesel, kmph→Electric, ----→Unknown)
 *   - expected_hog = link_attr matches /HOG/i
 *
 * Usage:
 *   node scripts/load_loco_link_master.js [path-to-xlsx]
 */

const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const xlsx = require('xlsx');
require('dotenv').config();

const DEFAULT_XLSX = '/Users/neeraja/loco-link/CO_Loco_link_final.xlsx';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'jay',
    password: process.env.DB_PASSWORD || '4310jay',
    database: process.env.DB_NAME || 'bbtro',
};

const CANONICAL_SHEETS = [
    'CSMT-DN', 'CSMT-UP', 'VVH-UP', 'VVH-DN', 'KR-UP', 'KR-DN',
];
const BYPASS_SHEET = 'BYPASS';

// ── helpers ──────────────────────────────────────────────────────────────

function clean(v) {
    if (v === null || v === undefined) return null;
    const s = String(v).replace(/\s+/g, ' ').trim();
    return s === '' ? null : s;
}

/**
 * Normalize a TRAIN_NO cell.
 * "01149 (BIRD-SGTY MIXED)" → train_no="01149", extra="BIRD-SGTY MIXED"
 * "11031\nAMRIT BHARAT"     → train_no="11031", extra="AMRIT BHARAT"
 * "22177"                   → train_no="22177", extra=null
 */
function parseTrainNo(v) {
    const s = clean(v);
    if (s === null) return [null, null];
    const m = s.match(/^(\d{4,6})\b\s*[\(\n]?\s*(.*?)\s*[\)\n]?$/);
    if (m) {
        const tn = m[1];
        const extra = m[2] && m[2] !== ')' ? m[2].replace(/[)\n]+/g, ' ').trim() : null;
        return [tn, extra || null];
    }
    return [s, null];
}

function deriveTraction(linkAttr) {
    if (!linkAttr) return 'Electric';
    const s = linkAttr.toLowerCase();
    if (s === 'dsl' || s.includes('diesel')) return 'Diesel';
    if (s.match(/^[\d.]+\s*kmph$/)) return 'Electric';
    if (s === '-----' || s === '--' || s === '-') return 'Unknown';
    return 'Electric';
}

function deriveExpectedHog(linkAttr) {
    // Detect the HOG intent BEFORE we normalize HOG → P/7 in link_attr text
    return linkAttr && /\bhog\b/i.test(linkAttr) ? 1 : 0;
}

// HOG is operational (not a loco-class spec). Both WAP7 and WAP5 are HOG-capable
// passenger locos and operationally interchangeable for any passenger service.
// Canonicalize link_attr by mapping HOG → P/7 so loco-type matching uses a
// clean P/7 / P/4 / P/5 vocabulary; HOG-ness lives in the expected_hog flag.
function normalizeLinkAttr(linkAttr) {
    if (!linkAttr) return linkAttr;
    return linkAttr.replace(/\bHOG\b/g, 'P/7');
}

// Returns [expected_loco_type, accepted_loco_types] from the (already-normalized) link_attr.
// NULL for codes that don't pin a loco class (DSL, AC/DC, 130 kmph).
function deriveLocoTypes(normalizedLinkAttr) {
    if (!normalizedLinkAttr) return [null, null];
    if (/^P\/7/.test(normalizedLinkAttr)) return ['WAP7', 'WAP5,WAP7'];   // WAP5 ≡ WAP7
    if (/^P\/4/.test(normalizedLinkAttr)) return ['WAP4', 'WAP4'];        // strict
    if (/^P\/5/.test(normalizedLinkAttr)) return ['WAP5', 'WAP5'];        // strict
    return [null, null]; // DSL / 130 kmph / AC/DC / other — no type check
}

function deriveIsPushPull(linkAttr, remark) {
    const haystack = `${linkAttr || ''} ${remark || ''}`.toUpperCase();
    return /PUSH[\s-]?PULL|\bPP\b/.test(haystack) ? 1 : 0;
}

// ── canonical sheet → master rows ────────────────────────────────────────

function readCanonicalSheet(wb, sheetName) {
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];
    const grid = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
    if (!grid.length) return [];

    // Find header row (contains "SHED_CODE")
    let headerIdx = -1;
    for (let i = 0; i < Math.min(5, grid.length); i++) {
        if (grid[i].some(c => clean(c) === 'SHED_CODE')) { headerIdx = i; break; }
    }
    if (headerIdx < 0) {
        console.warn(`  ${sheetName}: no SHED_CODE header found, skipping`);
        return [];
    }
    const header = grid[headerIdx].map(c => clean(c));
    const col = name => header.indexOf(name);

    const idxs = {
        sr_no: col('SR_NO'), section: col('SECTION'), direction: col('DIRECTION'),
        from_station: col('FROM_STATION'), shed_code: col('SHED_CODE'),
        link_attr: col('LINK_ATTR'), rake_type: col('RAKE_TYPE'),
        train_no: col('TRAIN_NO'), time: col('TIME'),
        run_days: col('RUN_DAYS'), remark: col('REMARK'),
    };
    if (idxs.train_no < 0 || idxs.direction < 0) {
        console.warn(`  ${sheetName}: missing TRAIN_NO or DIRECTION column, skipping`);
        return [];
    }

    const out = [];
    for (let r = headerIdx + 1; r < grid.length; r++) {
        const row = grid[r];
        if (!row.some(c => clean(c) !== null)) continue;
        const [trainNo, trainNameExtra] = parseTrainNo(row[idxs.train_no]);
        if (!trainNo) continue;

        const linkAttr = clean(row[idxs.link_attr]);
        const fromStation = clean(row[idxs.from_station]);
        const direction = clean(row[idxs.direction]);
        if (!direction || !['UP', 'DN'].includes(direction.toUpperCase())) continue;

        out.push({
            sheet_source: sheetName,
            sr_no: clean(row[idxs.sr_no]),
            section: clean(row[idxs.section]),
            direction: direction.toUpperCase(),
            is_bypass: 0,
            from_station: fromStation,
            to_station: null,
            route_label: null,
            shed_code: clean(row[idxs.shed_code]),
            link_attr: normalizeLinkAttr(linkAttr),  // HOG → P/7
            expected_hog: deriveExpectedHog(linkAttr),  // computed from ORIGINAL value
            is_push_pull: deriveIsPushPull(linkAttr, clean(row[idxs.remark])),
            traction_type: deriveTraction(linkAttr),
            ...(() => {
                const [el, al] = deriveLocoTypes(normalizeLinkAttr(linkAttr));
                return { expected_loco_type: el, accepted_loco_types: al };
            })(),
            rake_type: clean(row[idxs.rake_type]),
            train_no: trainNo,
            train_name: trainNameExtra,
            event_time: clean(row[idxs.time]),
            via_stations: null,
            run_days: clean(row[idxs.run_days]),
            remark: clean(row[idxs.remark]),
        });
    }
    return out;
}

// ── BYPASS sheet → master rows (unpivot) ─────────────────────────────────
//
// Each block:
//   row N:   col B = "LNL-BSR" (left route),  col L = "BSR-LNL" (right route)
//   row N+1: cols  = SR_NO, TRAIN_NO, TRAIN_NAME, RUN_DAYS, LOCO_NO, BASE,
//                    <station1>, <station2>, <station3>, <station4>, '',
//                    TRAIN_NO, TRAIN_NAME, RUN_DAYS, LOCO_NO, BASE,
//                    <station1>, <station2>, <station3>, <station4>
//   row N+2…: data rows, blank row separates blocks

function readBypassSheet(wb) {
    const ws = wb.Sheets[BYPASS_SHEET];
    if (!ws) return [];
    const grid = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });

    const out = [];
    let block = null; // { leftRoute, rightRoute, leftStations, rightStations, leftStCols, rightStCols }

    const HEADER_TOKENS = new Set(['SR_NO', 'SR. NO.', 'TRAIN_NO', 'TRAIN NO.']);

    for (let r = 0; r < grid.length; r++) {
        const row = grid[r];
        const colB = clean(row[1]);
        const colL = clean(row[11]);

        // Detect route-header row: col B and col L look like "X-Y" route labels
        const looksLikeRoute = (s) => s && /^[A-Z]{2,5}-[A-Z]{2,5}(-[A-Z]{2,5})?$/.test(s);
        if (looksLikeRoute(colB) && looksLikeRoute(colL)) {
            // Next row should be the column header with stations
            const headerRow = grid[r + 1] || [];
            const leftStCols = [6, 7, 8, 9].filter(i => clean(headerRow[i]));
            const rightStCols = [16, 17, 18, 19].filter(i => clean(headerRow[i]));
            block = {
                leftRoute: colB,
                rightRoute: colL,
                leftStations: leftStCols.map(i => clean(headerRow[i])),
                rightStations: rightStCols.map(i => clean(headerRow[i])),
                leftStCols,
                rightStCols,
            };
            r += 1; // skip the column-header row in next iteration
            continue;
        }

        if (!block) continue;
        if (!row.some(c => clean(c) !== null)) continue;

        // Process LEFT half (cols 1=train_no, 2=name, 3=days, station times in leftStCols)
        const [leftTrain, leftExtra] = parseTrainNo(row[1]);
        if (leftTrain) {
            const stationTimings = block.leftStCols
                .map((c, idx) => ({ station: block.leftStations[idx], time: clean(row[c]) }))
                .filter(x => x.time);
            const fromStation = stationTimings.length ? stationTimings[0].station : null;
            const toStation = stationTimings.length ? stationTimings[stationTimings.length - 1].station : null;
            out.push({
                sheet_source: `BYPASS-${block.leftRoute}`,
                sr_no: clean(row[0]),
                section: 'BYPASS',
                direction: 'BYPASS',
                is_bypass: 1,
                from_station: fromStation,
                to_station: toStation,
                route_label: block.leftRoute,
                shed_code: null,
                link_attr: null,
                expected_hog: 0,
                is_push_pull: 0,
                traction_type: 'Electric',
                expected_loco_type: null,
                accepted_loco_types: null,
                rake_type: null,
                train_no: leftTrain,
                train_name: leftExtra || clean(row[2]),
                event_time: stationTimings.length ? stationTimings[0].time : null,
                via_stations: stationTimings.length > 2 ? stationTimings.slice(1, -1) : null,
                run_days: clean(row[3]),
                remark: null,
            });
        }

        // Process RIGHT half (cols 11=train_no, 12=name, 13=days, station times in rightStCols)
        const [rightTrain, rightExtra] = parseTrainNo(row[11]);
        if (rightTrain) {
            const stationTimings = block.rightStCols
                .map((c, idx) => ({ station: block.rightStations[idx], time: clean(row[c]) }))
                .filter(x => x.time);
            const fromStation = stationTimings.length ? stationTimings[0].station : null;
            const toStation = stationTimings.length ? stationTimings[stationTimings.length - 1].station : null;
            out.push({
                sheet_source: `BYPASS-${block.rightRoute}`,
                sr_no: clean(row[0]),
                section: 'BYPASS',
                direction: 'BYPASS',
                is_bypass: 1,
                from_station: fromStation,
                to_station: toStation,
                route_label: block.rightRoute,
                shed_code: null,
                link_attr: null,
                expected_hog: 0,
                is_push_pull: 0,
                traction_type: 'Electric',
                expected_loco_type: null,
                accepted_loco_types: null,
                rake_type: null,
                train_no: rightTrain,
                train_name: rightExtra || clean(row[12]),
                event_time: stationTimings.length ? stationTimings[0].time : null,
                via_stations: stationTimings.length > 2 ? stationTimings.slice(1, -1) : null,
                run_days: clean(row[13]),
                remark: null,
            });
        }
    }
    return out;
}

// ── main ─────────────────────────────────────────────────────────────────

async function main() {
    const xlsxPath = process.argv[2] || DEFAULT_XLSX;
    if (!fs.existsSync(xlsxPath)) throw new Error(`xlsx not found: ${xlsxPath}`);

    console.log('='.repeat(60));
    console.log('div_loco_link_master loader');
    console.log('='.repeat(60));
    console.log(`xlsx:     ${xlsxPath}`);
    console.log(`Database: ${dbConfig.database}@${dbConfig.host}`);

    const wb = xlsx.readFile(xlsxPath);

    let allRows = [];
    for (const sn of CANONICAL_SHEETS) {
        const rows = readCanonicalSheet(wb, sn);
        console.log(`  ${sn.padEnd(10)} → ${rows.length} rows`);
        allRows.push(...rows);
    }
    const bypassRows = readBypassSheet(wb);
    console.log(`  ${BYPASS_SHEET.padEnd(10)} → ${bypassRows.length} rows (unpivoted)`);
    allRows.push(...bypassRows);

    console.log(`\nTotal: ${allRows.length} master rows to upsert\n`);

    // Dedup defense — UNIQUE(train_no, direction, from_station)
    const seen = new Map();
    for (const r of allRows) {
        const k = `${r.train_no}|${r.direction}|${r.from_station || ''}`;
        if (seen.has(k)) {
            console.warn(`  duplicate key in source: ${k}  — keeping first, dropping ${r.sheet_source}`);
            continue;
        }
        seen.set(k, r);
    }
    const dedup = Array.from(seen.values());
    if (dedup.length !== allRows.length) {
        console.log(`After dedup: ${dedup.length} rows\n`);
    }

    const conn = await mysql.createConnection(dbConfig);
    try {
        const sql = `
            INSERT INTO div_loco_link_master
                (sheet_source, sr_no, section, direction, is_bypass,
                 from_station, to_station, route_label, shed_code, link_attr,
                 expected_hog, is_push_pull, traction_type,
                 expected_loco_type, accepted_loco_types,
                 rake_type, train_no, train_name,
                 event_time, via_stations, run_days, remark)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                sheet_source         = VALUES(sheet_source),
                sr_no                = VALUES(sr_no),
                section              = VALUES(section),
                is_bypass            = VALUES(is_bypass),
                to_station           = VALUES(to_station),
                route_label          = VALUES(route_label),
                shed_code            = VALUES(shed_code),
                link_attr            = VALUES(link_attr),
                expected_hog         = VALUES(expected_hog),
                is_push_pull         = VALUES(is_push_pull),
                traction_type        = VALUES(traction_type),
                expected_loco_type   = VALUES(expected_loco_type),
                accepted_loco_types  = VALUES(accepted_loco_types),
                rake_type            = VALUES(rake_type),
                train_name           = VALUES(train_name),
                event_time           = VALUES(event_time),
                via_stations         = VALUES(via_stations),
                run_days             = VALUES(run_days),
                remark               = VALUES(remark)
        `;
        const tuples = dedup.map(r => [
            r.sheet_source, r.sr_no, r.section, r.direction, r.is_bypass,
            r.from_station, r.to_station, r.route_label, r.shed_code, r.link_attr,
            r.expected_hog, r.is_push_pull, r.traction_type,
            r.expected_loco_type ?? null, r.accepted_loco_types ?? null,
            r.rake_type, r.train_no, r.train_name,
            r.event_time, r.via_stations ? JSON.stringify(r.via_stations) : null,
            r.run_days, r.remark,
        ]);

        const [{ affectedRows }] = await conn.query(sql, [tuples]);
        const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM div_loco_link_master');
        const [[{ b }]] = await conn.query("SELECT COUNT(*) AS b FROM div_loco_link_master WHERE is_bypass=1");
        const [[{ shed_match }]] = await conn.query(`
            SELECT COUNT(*) AS shed_match FROM div_loco_link_master m
            WHERE m.shed_code IS NOT NULL
              AND EXISTS (SELECT 1 FROM div_locos l WHERE l.home_shed = m.shed_code)
        `);
        const [[{ shed_total }]] = await conn.query(
            'SELECT COUNT(*) AS shed_total FROM div_loco_link_master WHERE shed_code IS NOT NULL'
        );

        console.log('Upsert complete.');
        console.log(`  affectedRows:  ${affectedRows}  (1=insert, 2=update per mysql2)`);
        console.log(`  master total:  ${n}  (bypass: ${b}, terminal: ${n - b})`);
        console.log(`  shed_code → div_locos.home_shed match: ${shed_match}/${shed_total}`);
        console.log('Done.');
    } finally {
        await conn.end();
    }
}

main().catch(err => { console.error('\n❌', err.message, '\n', err.stack); process.exit(1); });
