#!/usr/bin/env node
/**
 * fix_csv_date_swap.js
 *
 * Repairs the dates of CTR duties uploaded from CSV files before 219c711.
 *
 * xlsx.readFile on a CSV guessed dates American-style: "01-02-2026" became
 * 2 January whenever the day was 12 or less, while "15-02-2026" stayed text and
 * was read correctly. NOT every such date was swapped, though: the same file
 * holds "01-02-2026" rows read correctly as well (seen on LOCAL, duty 2469 of
 * PNVL2657 beside its glued copy in duty 58259), so the day alone cannot tell.
 *
 * Rule: each CSV file covers a known window — from its earliest unambiguous
 * date (day > 12, over sign-ons and departures) less one day, to the file's own
 * date (from its name) plus one day. A datetime with day <= 12 that lies inside
 * the window is correct and kept; one outside it whose day/month swap lands
 * inside is swapped; one that fits neither way is left and reported (35 legs
 * stored as 3 March on LOCAL).
 *
 * Applied to sign-on, sign-off, departure, arrival, CTO, CMO of every
 * CSV-sourced duty (source_file LIKE '%.csv%'), per duty in one transaction:
 *   - a leg that then equals another leg of the same duty is deleted;
 *   - duty_date follows the sign-on; if the crew already has a duty at the
 *     corrected sign-on (uploaded again correctly later), the legs move to it
 *     (identical ones deleted) and the CSV duty is removed;
 *   - source_file gets " [dates fixed]" appended so a re-run skips the duty.
 *
 * Dry run by default; --commit writes after backing up both tables as
 * div_ctr_duties_bak_csvfix / div_ctr_legs_bak_csvfix (kept if they exist).
 * Run split_glued_duties.js afterwards and one coverage rebuild.
 *
 * Usage (LOCAL):
 *   set -a; . ./.env; set +a; node scripts/fix_csv_date_swap.js            # dry run
 *   set -a; . ./.env; set +a; node scripts/fix_csv_date_swap.js --commit
 */

const mysql = require('mysql2/promise');

const COMMIT = process.argv.includes('--commit');
const MARK = ' [dates fixed]';
const DAY = 24 * 3600e3;

const parse = (s) => (s ? new Date(String(s).replace(' ', 'T')) : null);
const dayOf = (s) => Number(String(s).slice(8, 10));
function swapStr(s) {
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})( .*)?$/);
    return m ? `${m[1]}-${m[3]}-${m[2]}${m[4] || ''}` : s;
}
const fileOf = (sf) => String(sf || '').split(' [')[0];
function fileDate(f) {
    const m = f.match(/SIGNON-(\d{2})-(\d{2})-(\d{4})/);
    return m ? new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00`) : null;
}

(async () => {
    const pool = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'bbtro',
        dateStrings: true,
        waitForConnections: true,
        connectionLimit: 3,
    });

    const [duties] = await pool.query(
        `SELECT id, staff_cms_id, sign_on_datetime, sign_off_datetime, source_file
         FROM div_ctr_duties
         WHERE source_file LIKE '%.csv%' AND source_file NOT LIKE '%${MARK}%'
         ORDER BY id`);
    const [legs] = await pool.query(
        `SELECT l.id, l.duty_id, l.departure_datetime dep, l.arrival_datetime arr, l.cto_datetime cto, l.cmo_datetime cmo, d.source_file
         FROM div_ctr_legs l JOIN div_ctr_duties d ON d.id = l.duty_id
         WHERE d.source_file LIKE '%.csv%' AND d.source_file NOT LIKE '%${MARK}%'`);

    // per-file window from the unambiguous dates
    const win = new Map();
    const note = (f, s) => {
        if (!s || dayOf(s) <= 12) return;
        const t = parse(s);
        const w = win.get(f) || { from: null, to: null };
        if (!w.from || t < w.from) w.from = t;
        win.set(f, w);
    };
    for (const d of duties) { note(fileOf(d.source_file), d.sign_on_datetime); }
    for (const l of legs) { note(fileOf(l.source_file), l.dep); }
    for (const [f, w] of win) {
        w.from = new Date(w.from.getTime() - DAY);
        const fd = fileDate(f);
        w.to = fd ? new Date(fd.getTime() + 2 * DAY) : null;      // file date + 1 day, end of day
    }

    // decide a value: returns { value, action } with action keep | swap | unresolved | n/a
    const stats = new Map();
    const tally = (f, a) => { const s = stats.get(f) || { keep: 0, swap: 0, unresolved: 0 }; s[a]++; stats.set(f, s); };
    function decide(f, s) {
        if (!s || dayOf(s) > 12) return { value: s, action: 'n/a' };
        const w = win.get(f);
        if (!w || !w.to) return { value: s, action: 'unresolved' };
        const t = parse(s);
        if (t >= w.from && t <= w.to) { tally(f, 'keep'); return { value: s, action: 'keep' }; }
        const sw = swapStr(s), ts = parse(sw);
        if (ts >= w.from && ts <= w.to) { tally(f, 'swap'); return { value: sw, action: 'swap' }; }
        tally(f, 'unresolved');
        return { value: s, action: 'unresolved' };
    }

    const legsByDuty = new Map();
    for (const l of legs) { if (!legsByDuty.has(l.duty_id)) legsByDuty.set(l.duty_id, []); legsByDuty.get(l.duty_id).push(l); }

    // plan
    const plan = [];
    const mergeTargets = new Map();
    for (const d of duties) {
        const f = fileOf(d.source_file);
        const son = decide(f, d.sign_on_datetime).value, soff = decide(f, d.sign_off_datetime).value;
        const legPlan = (legsByDuty.get(d.id) || []).map(l => ({
            id: l.id, dep: decide(f, l.dep).value, arr: decide(f, l.arr).value, cto: decide(f, l.cto).value, cmo: decide(f, l.cmo).value,
            changed: false,
        })).map((p, i) => { const l = legsByDuty.get(d.id)[i]; p.changed = p.dep !== l.dep || p.arr !== l.arr || p.cto !== l.cto || p.cmo !== l.cmo; return p; });
        if (son !== d.sign_on_datetime) {
            const [[other]] = await pool.query(`SELECT id FROM div_ctr_duties WHERE staff_cms_id = ? AND sign_on_datetime = ? AND id <> ?`, [d.staff_cms_id, son, d.id]);
            if (other) mergeTargets.set(d.id, other.id);
        }
        plan.push({ d, son, soff, legPlan });
    }
    const dutyChanges = plan.filter(p => p.son !== p.d.sign_on_datetime || p.soff !== p.d.sign_off_datetime).length;
    const legChanges = plan.reduce((s, p) => s + p.legPlan.filter(x => x.changed).length, 0);

    console.log(`${COMMIT ? 'COMMIT' : 'DRY RUN'}: CSV-sourced duties ${duties.length} (legs ${legs.length}) | duty headers to change ${dutyChanges} | legs to change ${legChanges} | duties merging into an existing correct duty ${mergeTargets.size}`);
    for (const [f, w] of win) {
        const s = stats.get(f) || { keep: 0, swap: 0, unresolved: 0 };
        console.log(`  ${f}: window ${w.from.toISOString().slice(0, 10)} .. ${w.to ? w.to.toISOString().slice(0, 10) : '?'} | day<=12 values: keep ${s.keep}, swap ${s.swap}, unresolved ${s.unresolved}`);
    }
    if (!COMMIT) {
        console.log('\nNothing written. Re-run with --commit to apply.');
        await pool.end();
        return;
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS div_ctr_duties_bak_csvfix AS SELECT * FROM div_ctr_duties`);
    await pool.query(`CREATE TABLE IF NOT EXISTS div_ctr_legs_bak_csvfix AS SELECT id, duty_id, leg_sequence, from_station, to_station, route_name, matched_sections, departure_datetime, arrival_datetime, cto_datetime, cmo_datetime, route_km, duty_type, train_no, loco_no FROM div_ctr_legs`);
    console.log('backups: div_ctr_duties_bak_csvfix, div_ctr_legs_bak_csvfix (kept if already present)');

    const conn = await pool.getConnection();
    let fixedDuties = 0, fixedLegs = 0, deletedLegs = 0, mergedDuties = 0;
    try {
        for (const p of plan) {
            await conn.beginTransaction();
            for (const l of p.legPlan) {
                if (!l.changed) continue;
                try {
                    await conn.query(`UPDATE div_ctr_legs SET departure_datetime = ?, arrival_datetime = ?, cto_datetime = ?, cmo_datetime = ? WHERE id = ?`, [l.dep, l.arr, l.cto, l.cmo, l.id]);
                    fixedLegs++;
                } catch (e) {
                    if (e.code !== 'ER_DUP_ENTRY') throw e;
                    await conn.query(`DELETE FROM div_ctr_legs WHERE id = ?`, [l.id]);
                    deletedLegs++;
                }
            }
            const target = mergeTargets.get(p.d.id);
            if (target) {
                const [rest] = await conn.query(`SELECT id FROM div_ctr_legs WHERE duty_id = ?`, [p.d.id]);
                for (const l of rest) {
                    try { await conn.query(`UPDATE div_ctr_legs SET duty_id = ? WHERE id = ?`, [target, l.id]); }
                    catch (e) { if (e.code !== 'ER_DUP_ENTRY') throw e; await conn.query(`DELETE FROM div_ctr_legs WHERE id = ?`, [l.id]); deletedLegs++; }
                }
                await conn.query(`DELETE FROM div_ctr_duties WHERE id = ?`, [p.d.id]);
                const [tl] = await conn.query(`SELECT id, arrival_datetime arr, departure_datetime dep, to_station t, route_km km FROM div_ctr_legs WHERE duty_id = ? ORDER BY departure_datetime, id`, [target]);
                for (let i = 0; i < tl.length; i++) await conn.query(`UPDATE div_ctr_legs SET leg_sequence = ? WHERE id = ?`, [i + 1, tl[i].id]);
                const last = tl[tl.length - 1];
                if (last) await conn.query(`UPDATE div_ctr_duties SET total_legs = ?, total_km = ?, sign_off_datetime = ?, sign_off_station = ? WHERE id = ?`,
                    [tl.length, tl.reduce((s, x) => s + Number(x.km || 0), 0).toFixed(2), last.arr || last.dep, last.t, target]);
                mergedDuties++;
            } else {
                await conn.query(
                    `UPDATE div_ctr_duties SET sign_on_datetime = ?, sign_off_datetime = ?, duty_date = DATE(?), source_file = CONCAT(source_file, ?) WHERE id = ?`,
                    [p.son, p.soff, p.son, MARK, p.d.id]);
                fixedDuties++;
            }
            await conn.commit();
        }
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
    console.log(`done: duties marked ${fixedDuties} | duties merged into a correct copy ${mergedDuties} | legs changed ${fixedLegs} | duplicate legs deleted ${deletedLegs}`);
    await pool.end();
})().catch(e => { console.error(e); process.exit(1); });
