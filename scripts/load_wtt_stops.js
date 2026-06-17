#!/usr/bin/env node
/**
 * load_wtt_stops.js
 *
 * Loads data/wtt_db_data.csv (working-timetable halt timings) into
 * div_train_stops, keyed by train_id. See WTT_LOADER_PLAN.md.
 *
 * Run sql/2026-06-17_wtt_stops_loader.sql FIRST (event_type enum +
 * direction column + TGR 2/3 stations).
 *
 * Per train (grouped by train_no):
 *   - resolve train_no -> train_id (alias-aware); create a minimal div_trains
 *     row + alias if uncatalogued (e.g. 61026, DO, MR).
 *   - order stops by a circular-gap time unwrap (robust to UP reverse-listing,
 *     appended-out-of-order stations, and midnight crossings) -> seq_order +
 *     day_offset.
 *   - normalize event_type, canonical (longest) train_name, per-stop direction.
 *   - idempotent: DELETE this train's stops, then INSERT fresh (so re-runs and
 *     JL/BSL top-ups are safe).
 *
 * Usage:  node scripts/load_wtt_stops.js [path-to-csv] [--dry]
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

const CSV = process.argv[2] && !process.argv[2].startsWith('--')
    ? process.argv[2]
    : path.join(__dirname, '..', 'data', 'wtt_db_data.csv');
const DRY = process.argv.includes('--dry');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'jay',
    password: process.env.DB_PASSWORD || '4310jay',
    database: process.env.DB_NAME || 'bbtro',
};

const clean = (s) => String(s == null ? '' : s).trim();

function normEventType(v) {
    v = clean(v).toLowerCase();
    if (v === 'halt') return 'halt';
    if (['pass_or_depart', 'pass/dep', 'pass', 'depart'].includes(v)) return 'pass_or_depart';
    if (['arrive_or_pass', 'arrive', 'arr'].includes(v)) return 'arrive_or_pass';
    return null;
}

// "HH:MM" -> minutes since midnight (0-1439); null if blank/invalid.
function toMin(s) {
    s = clean(s);
    const m = s.match(/^(\d{1,2}):\s*(\d{2})$/);
    if (!m) return null;
    return (parseInt(m[1], 10) % 24) * 60 + parseInt(m[2], 10);
}
// "HH:MM" -> "HH:MM:00" for the TIME column; null if blank.
function toSqlTime(s) {
    const mn = toMin(s);
    if (mn === null) return null;
    const h = String(Math.floor(mn / 60)).padStart(2, '0');
    const m = String(mn % 60).padStart(2, '0');
    return `${h}:${m}:00`;
}

/**
 * Order a train's stops by real journey time using a circular-gap unwrap.
 * Each stop's "primary" time = departure if present else arrival.
 * Returns the stops annotated with {abs, seq, dayOffset}, in journey order.
 */
function orderStops(stops) {
    const withT = stops.map((s, i) => {
        const t = s.depMin != null ? s.depMin : s.arrMin;
        return { s, i, t: t == null ? null : t };
    });
    // Stops with no parseable time at all sink to the end in original order.
    const timed = withT.filter(x => x.t != null);
    const untimed = withT.filter(x => x.t == null);
    if (timed.length === 0) {
        return stops.map((s, k) => ({ ...s, seq: k + 1, dayOffset: 0 }));
    }
    const sorted = [...timed].sort((a, b) => a.t - b.t || a.i - b.i);
    const n = sorted.length;
    // largest circular gap -> journey starts right after it
    let gapMax = -1, startPos = 0;
    for (let k = 0; k < n; k++) {
        const cur = sorted[k].t;
        const nxt = sorted[(k + 1) % n].t + (k + 1 === n ? 1440 : 0);
        const gap = nxt - cur;
        if (gap > gapMax) { gapMax = gap; startPos = (k + 1) % n; }
    }
    const order = [];
    for (let k = 0; k < n; k++) order.push(sorted[(startPos + k) % n]);
    // unwrap to monotonic absolute minutes
    let prevAbs = order[0].t;
    order[0].abs = prevAbs;
    for (let k = 1; k < n; k++) {
        let c = order[k].t;
        while (c < prevAbs) c += 1440;
        order[k].abs = c;
        prevAbs = c;
    }
    const out = order.map((x, k) => ({
        ...x.s, seq: k + 1, dayOffset: Math.floor(x.abs / 1440),
    }));
    // append any untimed stops after the timed ones
    untimed.forEach((x, k) => out.push({ ...x.s, seq: n + k + 1, dayOffset: 0 }));
    return out;
}

async function main() {
    const rawText = fs.readFileSync(CSV, 'utf8');
    const records = parse(rawText, { columns: true, skip_empty_lines: true, trim: false });
    console.log(`Read ${records.length} rows from ${CSV}`);

    // group by train_no, preserving file order
    const trains = new Map();
    for (const r of records) {
        const tno = clean(r.train_no);
        if (!trains.has(tno)) trains.set(tno, []);
        trains.get(tno).push(r);
    }
    console.log(`${trains.size} distinct train numbers`);

    const conn = await mysql.createConnection(dbConfig);

    // pre-load known station codes for FK safety
    const [stnRows] = await conn.query('SELECT station_code FROM div_stations');
    const knownStations = new Set(stnRows.map(s => s.station_code));

    let created = 0, loadedTrains = 0, loadedStops = 0, skippedStn = 0;
    const createdList = [], missingStn = new Set();

    for (const [tno, rows] of trains) {
        // canonical name = longest train_name among rows
        const name = rows.map(r => clean(r.train_name)).sort((a, b) => b.length - a.length)[0] || null;
        // majority direction (for div_trains.direction on create)
        const dcount = {};
        for (const r of rows) { const d = clean(r.direction); if (d) dcount[d] = (dcount[d] || 0) + 1; }
        const majDir = Object.keys(dcount).sort((a, b) => dcount[b] - dcount[a])[0] || null;

        // resolve train_id (alias-aware), else create
        let trainId = null;
        const [res] = await conn.query(
            `SELECT a.train_id FROM div_train_aliases a
             WHERE a.train_no = ?
             ORDER BY (a.valid_until IS NULL) DESC, a.valid_until DESC LIMIT 1`, [tno]);
        if (res.length) {
            trainId = res[0].train_id;
        } else {
            if (DRY) { createdList.push(tno); created++; }
            else {
                const dir = (majDir === 'UP' || majDir === 'DN') ? majDir : null;
                const [ins] = await conn.query(
                    `INSERT INTO div_trains (train_no, train_name, direction, is_regular, is_active)
                     VALUES (?, ?, ?, 1, 1)`, [tno, name, dir]);
                trainId = ins.insertId;
                await conn.query(
                    `INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until)
                     VALUES (?, ?, NULL, NULL)`, [trainId, tno]);
                created++; createdList.push(tno);
            }
        }

        // build stops
        const stops = rows.map(r => ({
            station_code: clean(r.station_code),
            direction: (clean(r.direction) === 'UP' || clean(r.direction) === 'DN') ? clean(r.direction) : null,
            arr: clean(r.arr_time), dep: clean(r.dep_time),
            arrMin: toMin(r.arr_time), depMin: toMin(r.dep_time),
            event_type: normEventType(r.event_type),
        }));
        // FK warn
        for (const s of stops) if (!knownStations.has(s.station_code)) { missingStn.add(s.station_code); }

        const ordered = orderStops(stops);

        if (DRY || trainId == null) { loadedTrains++; loadedStops += ordered.length; continue; }

        await conn.beginTransaction();
        try {
            await conn.query('DELETE FROM div_train_stops WHERE train_id = ?', [trainId]);
            for (const s of ordered) {
                if (!knownStations.has(s.station_code)) { skippedStn++; continue; }
                await conn.query(
                    `INSERT INTO div_train_stops
                       (train_id, direction, seq_order, station_code, arrival_time, departure_time,
                        event_type, day_offset)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [trainId, s.direction, s.seq, s.station_code,
                     toSqlTime(s.arr), toSqlTime(s.dep), s.event_type || 'halt', s.dayOffset]);
                loadedStops++;
            }
            await conn.commit();
            loadedTrains++;
        } catch (e) {
            await conn.rollback();
            console.error(`  ! ${tno}: ${e.message}`);
        }
    }

    console.log(`\n${DRY ? '[DRY] ' : ''}trains processed: ${loadedTrains} | stops: ${loadedStops}`);
    console.log(`trains auto-created in div_trains: ${created} ${createdList.length ? '(' + createdList.join(', ') + ')' : ''}`);
    if (missingStn.size) console.log(`station codes NOT in div_stations (rows skipped: ${skippedStn}): ${[...missingStn].join(', ')}`);
    await conn.end();
}

main().catch(e => { console.error(e); process.exit(1); });
