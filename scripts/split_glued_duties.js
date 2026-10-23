#!/usr/bin/env node
/**
 * split_glued_duties.js
 *
 * Repairs CTR duties that hold legs from another day ("glued" duties).
 *
 * The CMS sign-on export has one row per leg and only a duty's first row carries
 * the sign-on. Until 05667fc (2026-10-21) the parser dropped some first rows
 * (WT/YR type, zero km) and attached the rows that followed to the crew's
 * previous duty, so that duty ended up with legs days away from its sign-on, a
 * sign-off before its sign-on, and a km total of two duties. LRD coverage is
 * dated from the legs and does not care; this repairs the duty headers only.
 *
 * For every leg departing more than 2 h before its duty's sign-on or more than
 * 36 h after it:
 *   - if the same crew already holds the same leg (from, to, departure) in a
 *     duty where it fits, the glued copy is deleted;
 *   - if the crew has a duty whose window (sign-on -2 h .. +36 h) contains the
 *     leg, the leg is moved into that duty (its real home); an identical leg
 *     already there means the glued copy is deleted instead;
 *   - otherwise the legs of one duty are grouped (a gap of more than 12 h since
 *     the previous leg's end starts a new group) and each group becomes its own
 *     duty for the same crew: duty date and sign-on from the first leg's
 *     departure (the real sign-on row was never stored, so this is an estimate),
 *     sign-on station from its from station, sign-off from the last arrival,
 *     source_file with " [split from duty N]" appended (no new column);
 *   - the original duty is recomputed from the legs that stay (leg count, km,
 *     sign-off = last arrival, sequences renumbered).
 *
 * Dry run by default (prints the plan). --commit writes, after backing up both
 * tables as div_ctr_duties_bak_<date> / div_ctr_legs_bak_<date>. Re-running
 * after a commit finds nothing to do.
 *
 * Usage (LOCAL):
 *   set -a; . ./.env; set +a; node scripts/split_glued_duties.js            # dry run
 *   set -a; . ./.env; set +a; node scripts/split_glued_duties.js --commit
 */

const mysql = require('mysql2/promise');

const COMMIT = process.argv.includes('--commit');
const BEFORE_H = 2, AFTER_H = 36, GAP_H = 12;

const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const dt = (s) => new Date(String(s).replace(' ', 'T'));

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

    const MISPLACED = `
        l.departure_datetime IS NOT NULL
        AND (l.departure_datetime < d.sign_on_datetime - INTERVAL ${BEFORE_H} HOUR
             OR l.departure_datetime > d.sign_on_datetime + INTERVAL ${AFTER_H} HOUR)`;

    const [legs] = await pool.query(`
        SELECT l.id leg_id, l.duty_id, l.departure_datetime dep, l.arrival_datetime arr,
               l.from_station f, l.to_station t, l.duty_type, l.route_km km,
               d.staff_cms_id, d.sign_on_datetime son, d.source_file
        FROM div_ctr_legs l JOIN div_ctr_duties d ON d.id = l.duty_id
        WHERE ${MISPLACED}
        ORDER BY l.duty_id, l.departure_datetime`);

    const [dups] = await pool.query(`
        SELECT l.id leg_id
        FROM div_ctr_legs l JOIN div_ctr_duties d ON d.id = l.duty_id
        WHERE ${MISPLACED}
          AND EXISTS (SELECT 1 FROM div_ctr_legs o JOIN div_ctr_duties od ON od.id = o.duty_id
                      WHERE od.staff_cms_id = d.staff_cms_id
                        AND o.from_station = l.from_station AND o.to_station = l.to_station
                        AND o.departure_datetime = l.departure_datetime AND o.duty_id <> l.duty_id
                        AND o.departure_datetime >= od.sign_on_datetime - INTERVAL ${BEFORE_H} HOUR
                        AND o.departure_datetime <= od.sign_on_datetime + INTERVAL ${AFTER_H} HOUR)`);
    const dupSet = new Set(dups.map(r => r.leg_id));

    // legs that have an existing home duty (crew's duty whose window contains the departure)
    const [homes] = await pool.query(`
        SELECT l.id leg_id, (SELECT x.id FROM div_ctr_duties x
                             WHERE x.staff_cms_id = d.staff_cms_id AND x.id <> d.id
                               AND l.departure_datetime >= x.sign_on_datetime - INTERVAL ${BEFORE_H} HOUR
                               AND l.departure_datetime <= x.sign_on_datetime + INTERVAL ${AFTER_H} HOUR
                             ORDER BY x.sign_on_datetime DESC LIMIT 1) home_id
        FROM div_ctr_legs l JOIN div_ctr_duties d ON d.id = l.duty_id
        WHERE ${MISPLACED}`);
    const homeOf = new Map(homes.filter(r => r.home_id).map(r => [r.leg_id, r.home_id]));

    // group movable legs per duty
    const byDuty = new Map();
    const toHome = [];
    for (const l of legs) {
        if (dupSet.has(l.leg_id)) continue;
        if (homeOf.has(l.leg_id)) { toHome.push(l); continue; }
        if (!byDuty.has(l.duty_id)) byDuty.set(l.duty_id, []);
        byDuty.get(l.duty_id).push(l);
    }
    const plan = [];
    for (const [dutyId, ls] of byDuty) {
        const groups = [];
        let cur = null, lastEnd = null;
        for (const l of ls) {
            const dep = dt(l.dep);
            if (!cur || dep - lastEnd > GAP_H * 3600e3) { cur = []; groups.push(cur); }
            cur.push(l);
            lastEnd = dt(l.arr || l.dep);
        }
        plan.push({ dutyId, groups });
    }
    const newDuties = plan.reduce((s, p) => s + p.groups.length, 0);
    const toMove = plan.reduce((s, p) => s + p.groups.reduce((x, g) => x + g.length, 0), 0);

    console.log(`${COMMIT ? 'COMMIT' : 'DRY RUN'}: misplaced legs ${legs.length} | duplicates to delete ${dupSet.size} | legs to attach to an existing duty ${toHome.length} | legs to move into new duties ${toMove}`);
    console.log(`affected duties ${plan.length} | new duties to create ${newDuties}`);
    if (!COMMIT) {
        for (const p of plan.slice(0, 3)) {
            console.log(`duty ${p.dutyId}:`);
            for (const g of p.groups) console.log(`   -> new duty sign-on ~${g[0].dep} at ${g[0].f}, sign-off ${g[g.length - 1].arr || g[g.length - 1].dep}, legs ${g.map(x => `${x.duty_type} ${x.f}-${x.t}`).join(' | ')}`);
        }
        console.log('\nNothing written. Re-run with --commit to apply.');
        await pool.end();
        return;
    }

    // backups
    const tag = ymd(new Date()).replace(/-/g, '');
    await pool.query(`CREATE TABLE IF NOT EXISTS div_ctr_duties_bak_${tag} AS SELECT * FROM div_ctr_duties`);
    await pool.query(`CREATE TABLE IF NOT EXISTS div_ctr_legs_bak_${tag} AS SELECT id, duty_id, leg_sequence, from_station, to_station, route_name, matched_sections, departure_datetime, arrival_datetime, cto_datetime, cmo_datetime, route_km, duty_type, train_no, loco_no FROM div_ctr_legs`);
    console.log(`backups: div_ctr_duties_bak_${tag}, div_ctr_legs_bak_${tag}`);

    let deleted = 0, created = 0, moved = 0, recomputed = 0;
    if (dupSet.size) {
        const ids = [...dupSet];
        for (let i = 0; i < ids.length; i += 500) {
            const [r] = await pool.query(`DELETE FROM div_ctr_legs WHERE id IN (?)`, [ids.slice(i, i + 500)]);
            deleted += r.affectedRows;
        }
    }

    const conn = await pool.getConnection();
    let attached = 0, attachedDups = 0;
    const touched = new Set();
    try {
        // 1. legs with an existing home duty
        for (const l of toHome) {
            const home = homeOf.get(l.leg_id);
            try {
                await conn.query(`UPDATE div_ctr_legs SET duty_id = ? WHERE id = ?`, [home, l.leg_id]);
                attached++;
            } catch (e) {
                if (e.code !== 'ER_DUP_ENTRY') throw e;
                await conn.query(`DELETE FROM div_ctr_legs WHERE id = ?`, [l.leg_id]);   // identical leg already in the home duty
                attachedDups++;
            }
            touched.add(home); touched.add(l.duty_id);
        }
        // 2. legs with no home: their own new duties
        for (const p of plan) {
            await conn.beginTransaction();
            const [[orig]] = await conn.query(`SELECT * FROM div_ctr_duties WHERE id = ?`, [p.dutyId]);
            for (const g of p.groups) {
                const first = g[0], last = g[g.length - 1];
                const km = g.reduce((s, x) => s + Number(x.km || 0), 0);
                // a duty created earlier in this run (or any other) may already cover this group:
                // the same glued leg under two wrong duties with slightly different fields
                const [[existing]] = await conn.query(
                    `SELECT id FROM div_ctr_duties WHERE staff_cms_id = ? AND id <> ?
                       AND ? >= sign_on_datetime - INTERVAL ${BEFORE_H} HOUR AND ? <= sign_on_datetime + INTERVAL ${AFTER_H} HOUR
                     ORDER BY sign_on_datetime DESC LIMIT 1`, [orig.staff_cms_id, p.dutyId, first.dep, first.dep]);
                if (existing) {
                    for (const l of g) {
                        try { await conn.query(`UPDATE div_ctr_legs SET duty_id = ? WHERE id = ?`, [existing.id, l.leg_id]); attached++; }
                        catch (e) { if (e.code !== 'ER_DUP_ENTRY') throw e; await conn.query(`DELETE FROM div_ctr_legs WHERE id = ?`, [l.leg_id]); attachedDups++; }
                    }
                    touched.add(existing.id);
                    continue;
                }
                const [ins] = await conn.query(
                    `INSERT INTO div_ctr_duties
                     (upload_batch_id, staff_cms_id, staff_hrms_id, staff_name, designation,
                      duty_date, sign_on_datetime, sign_on_station, sign_off_datetime, sign_off_station,
                      total_legs, total_km, source_file, source_office, uploaded_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [orig.upload_batch_id, orig.staff_cms_id, orig.staff_hrms_id, orig.staff_name, orig.designation,
                     first.dep.slice(0, 10), first.dep, first.f, last.arr || last.dep, last.t,
                     g.length, km.toFixed(2), `${orig.source_file || ''} [split from duty ${p.dutyId}]`.trim(), orig.source_office, orig.uploaded_by]);
                created++;
                for (let i = 0; i < g.length; i++) {
                    await conn.query(`UPDATE div_ctr_legs SET duty_id = ?, leg_sequence = ? WHERE id = ?`, [ins.insertId, i + 1, g[i].leg_id]);
                    moved++;
                }
            }
            // recompute the original from what stays
            const [rest] = await conn.query(`SELECT id, arrival_datetime arr, departure_datetime dep, to_station t, route_km km FROM div_ctr_legs WHERE duty_id = ? ORDER BY departure_datetime, id`, [p.dutyId]);
            for (let i = 0; i < rest.length; i++) await conn.query(`UPDATE div_ctr_legs SET leg_sequence = ? WHERE id = ?`, [i + 1, rest[i].id]);
            const lastRest = rest[rest.length - 1];
            await conn.query(
                `UPDATE div_ctr_duties SET total_legs = ?, total_km = ?, sign_off_datetime = ?, sign_off_station = ? WHERE id = ?`,
                [rest.length, rest.reduce((s, x) => s + Number(x.km || 0), 0).toFixed(2),
                 lastRest ? (lastRest.arr || lastRest.dep) : orig.sign_on_datetime, lastRest ? lastRest.t : orig.sign_on_station, p.dutyId]);
            recomputed++;
            touched.delete(p.dutyId);
            await conn.commit();
        }
        // 3. recompute every other duty touched by step 1
        for (const id of touched) {
            const [rest] = await conn.query(`SELECT id, arrival_datetime arr, departure_datetime dep, to_station t, route_km km FROM div_ctr_legs WHERE duty_id = ? ORDER BY departure_datetime, id`, [id]);
            for (let i = 0; i < rest.length; i++) await conn.query(`UPDATE div_ctr_legs SET leg_sequence = ? WHERE id = ?`, [i + 1, rest[i].id]);
            const lastRest = rest[rest.length - 1];
            if (lastRest) await conn.query(`UPDATE div_ctr_duties SET total_legs = ?, total_km = ?, sign_off_datetime = ?, sign_off_station = ? WHERE id = ?`,
                [rest.length, rest.reduce((s, x) => s + Number(x.km || 0), 0).toFixed(2), lastRest.arr || lastRest.dep, lastRest.t, id]);
            recomputed++;
        }
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }

    const [[left]] = await pool.query(`SELECT COUNT(*) n FROM div_ctr_legs l JOIN div_ctr_duties d ON d.id = l.duty_id WHERE ${MISPLACED}`);
    console.log(`done: duplicates deleted ${deleted + attachedDups} | legs attached to existing duties ${attached} | duties created ${created} | legs moved into them ${moved} | duties recomputed ${recomputed} | misplaced legs left ${left.n}`);
    await pool.end();
})().catch(e => { console.error(e); process.exit(1); });
