/**
 * Standalone runner for the JPO AWS classifier — mirrors the logic of
 * POST /api/division/aws/classify-period (routes/division/awsUploadRoutes.js)
 * so classification can be re-run from the CLI without an authenticated
 * session. Idempotent: resets the window to NOT_DETERMINED, then re-applies
 * Rules 1-4 from scratch.
 *
 * Usage:
 *   node scripts/aws-classify.js 2026-04-06 2026-04-14
 *
 * Keep in sync with classify-period if the rule logic there changes.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const from = process.argv[2];
const to   = process.argv[3];

if (!from || !to) {
  console.error('Usage: node scripts/aws-classify.js <from YYYY-MM-DD> <to YYYY-MM-DD>');
  process.exit(1);
}

// ── Rule 1 helpers (verbatim from awsUploadRoutes.js) ───────────────────────
function normalizeTrainNumber(text) {
  if (!text) return '';
  return String(text).toUpperCase().replace(/[\s/.\-]+/g, '');
}

function serviceDateOf(abnDate, abnTime, trainInfo) {
  const ymd = abnDate instanceof Date ? abnDate.toISOString().slice(0, 10) : String(abnDate).slice(0, 10);
  const t = abnTime ? String(abnTime) : null;
  if (trainInfo && trainInfo.hasWrap && trainInfo.morningCutoff && t && t <= trainInfo.morningCutoff) {
    const d = new Date(ymd + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  return ymd;
}

function signalsAreConsecutive(aId, bId, meta, succSet) {
  if (!aId || !bId || aId === bId) return false;
  if (succSet.has(`${aId}-${bId}`) || succSet.has(`${bId}-${aId}`)) return true;
  const a = meta.get(aId);
  const b = meta.get(bId);
  if (!a || !b) return false;
  if (a.group != null && a.group === b.group) return true;
  if (a.section === b.section && a.line === b.line && a.direction === b.direction
      && a.seq != null && b.seq != null
      && Math.abs(a.seq - b.seq) === 1) return true;
  return false;
}

function longestConsecutiveRun(tripEvents, meta, succSet) {
  const sorted = [...tripEvents].sort((x, y) => {
    const tx = x.abn_time || '';
    const ty = y.abn_time || '';
    if (tx !== ty) return tx < ty ? -1 : 1;
    const sx = meta.get(x.signal_id)?.seq ?? Number.MAX_SAFE_INTEGER;
    const sy = meta.get(y.signal_id)?.seq ?? Number.MAX_SAFE_INTEGER;
    return sx - sy;
  });
  let best = { length: sorted.length ? 1 : 0, signals: sorted.length ? [sorted[0].signal_id] : [] };
  let curLen = 1;
  let curSignals = sorted.length ? [sorted[0].signal_id] : [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].signal_id;
    const cur  = sorted[i].signal_id;
    if (signalsAreConsecutive(prev, cur, meta, succSet)) {
      curLen++; curSignals.push(cur);
    } else {
      curLen = 1; curSignals = [cur];
    }
    if (curLen > best.length) best = { length: curLen, signals: [...curSignals] };
  }
  return best;
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.DB_USER || 'jay',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '4310jay',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'bbtro'
  });

  try {
    await conn.beginTransaction();

    const [resetRes] = await conn.execute(
      `UPDATE div_aws_events SET responsibility='NOT_DETERMINED', root_cause=NULL
       WHERE abn_date BETWEEN ? AND ?`, [from, to]);

    // Rule 1
    let rule1Count = 0;
    const rule1Trips = [];
    {
      const [sigRows] = await conn.query(
        `SELECT id, section, \`line\` AS line, direction, seq_order AS seq, parallel_group_id AS grp FROM div_signals`);
      const meta = new Map();
      for (const s of sigRows) meta.set(s.id, { section: s.section, line: s.line, direction: s.direction, seq: s.seq, group: s.grp });

      const [edgeRows] = await conn.query(
        `SELECT from_signal_id AS f, to_signal_id AS t FROM div_signal_successors
         WHERE from_signal_id IS NOT NULL AND to_signal_id IS NOT NULL`);
      const succSet = new Set();
      for (const e of edgeRows) { succSet.add(`${e.f}-${e.t}`); succSet.add(`${e.t}-${e.f}`); }

      // Timetable digest: legs sharing a normalized train_number = one trip;
      // has_wrap/morning_cutoff drive the overnight service-date rollback.
      const [trainRows] = await conn.query(
        `SELECT UPPER(REGEXP_REPLACE(train_number,'[[:space:]/.-]','')) AS ntn,
                MAX(end_time < start_time)                         AS has_wrap,
                MAX(CASE WHEN end_time < '06:00:00' THEN end_time END) AS morning_cutoff
         FROM trains WHERE train_number IS NOT NULL AND train_number <> ''
         GROUP BY ntn`);
      const schedule = new Map();
      for (const r of trainRows) {
        schedule.set(r.ntn, { hasWrap: Number(r.has_wrap) === 1, morningCutoff: r.morning_cutoff != null ? String(r.morning_cutoff) : null });
      }

      const [evRows] = await conn.query(
        `SELECT id, signal_id, abn_date, abn_time, train_number,
                COALESCE(matched_coach_id, matched_rake_id) AS cab_key
         FROM div_aws_events
         WHERE abn_date BETWEEN ? AND ? AND signal_id IS NOT NULL`, [from, to]);

      // Group into trips: (train_number, service_date), timetable-derived.
      const trips = new Map();
      for (const ev of evRows) {
        const ntn = normalizeTrainNumber(ev.train_number);
        const svcDate = serviceDateOf(ev.abn_date, ev.abn_time, ntn ? schedule.get(ntn) : null);
        const tripKey = ntn ? `T:${ntn}|${svcDate}` : (ev.cab_key != null ? `C:${ev.cab_key}|${svcDate}` : null);
        if (!tripKey) continue;
        if (!trips.has(tripKey)) trips.set(tripKey, []);
        trips.get(tripKey).push(ev);
      }

      // Rule 1: ≥3 acts in a trip (C2) AND ≥2 on consecutive signals (C1).
      const rule1EventIds = [];
      for (const [key, events] of trips) {
        if (events.length < 3) continue;
        const run = longestConsecutiveRun(events, meta, succSet);
        if (run.length >= 2) { events.forEach((e) => rule1EventIds.push(e.id)); rule1Trips.push({ trip: key, events: events.length, run: run.length }); }
      }

      if (rule1EventIds.length > 0) {
        const placeholders = rule1EventIds.map(() => '?').join(',');
        const [r1] = await conn.execute(
          `UPDATE div_aws_events SET responsibility='CAB_SIDE',
              root_cause='JPO Rule 1: >=3 on consecutive signals in one trip'
           WHERE id IN (${placeholders}) AND responsibility='NOT_DETERMINED'`, rule1EventIds);
        rule1Count = r1.affectedRows;
      }
    }

    // Rule 2
    const [rule2Res] = await conn.execute(
      `UPDATE div_aws_events e JOIN (
          SELECT signal_id, abn_date FROM div_aws_events
          WHERE abn_date BETWEEN ? AND ? AND signal_id IS NOT NULL
          GROUP BY signal_id, abn_date HAVING COUNT(*) > 2
       ) flagged ON flagged.signal_id=e.signal_id AND flagged.abn_date=e.abn_date
       SET e.responsibility='S&T', e.root_cause='JPO Rule 2: >2/day on same signal'
       WHERE e.abn_date BETWEEN ? AND ? AND e.signal_id IS NOT NULL AND e.responsibility='NOT_DETERMINED'`,
      [from, to, from, to]);

    // AWS review week runs Friday → Thursday (meetings on Fridays), not ISO
    // Mon–Sun. Map each date to the Friday that starts its week.
    const fridayWeek = (col) => `DATE_SUB(${col}, INTERVAL ((DAYOFWEEK(${col}) + 1) % 7) DAY)`;

    // Rule 3b
    const [rule3bRes] = await conn.execute(
      `UPDATE div_aws_events e JOIN (
          SELECT signal_id, ${fridayWeek('abn_date')} AS wk FROM div_aws_events
          WHERE abn_date BETWEEN ? AND ? AND signal_id IS NOT NULL AND responsibility='NOT_DETERMINED'
          GROUP BY signal_id, ${fridayWeek('abn_date')} HAVING COUNT(*) >= 3
       ) flagged ON flagged.signal_id=e.signal_id AND ${fridayWeek('e.abn_date')}=flagged.wk
       SET e.responsibility='S&T', e.root_cause='JPO Rule 3b: >=3/week on same magnet'
       WHERE e.abn_date BETWEEN ? AND ? AND e.signal_id IS NOT NULL AND e.responsibility='NOT_DETERMINED'`,
      [from, to, from, to]);

    // Rule 3a — per (Fri–Thu) week, per cab, count > 3 (≥4). Confirmed >3, not
    // ≥3 (the magnet rule); JPO cab wording is garbled. Do not change to >=3.
    const [rule3aRes] = await conn.execute(
      `UPDATE div_aws_events e JOIN (
          SELECT COALESCE(matched_coach_id, matched_rake_id) AS cab_key, ${fridayWeek('abn_date')} AS wk
          FROM div_aws_events
          WHERE abn_date BETWEEN ? AND ? AND COALESCE(matched_coach_id, matched_rake_id) IS NOT NULL
            AND responsibility='NOT_DETERMINED'
          GROUP BY COALESCE(matched_coach_id, matched_rake_id), ${fridayWeek('abn_date')} HAVING COUNT(*) > 3
       ) flagged ON COALESCE(e.matched_coach_id, e.matched_rake_id)=flagged.cab_key AND ${fridayWeek('e.abn_date')}=flagged.wk
       SET e.responsibility='CAB_SIDE', e.root_cause='JPO Rule 3a: >3/week on same cab'
       WHERE e.abn_date BETWEEN ? AND ? AND COALESCE(e.matched_coach_id, e.matched_rake_id) IS NOT NULL
         AND e.responsibility='NOT_DETERMINED'`,
      [from, to, from, to]);

    // Rule 4
    const [rule4Res] = await conn.execute(
      `UPDATE div_aws_events SET responsibility='TRANSIENT', root_cause='JPO Rule 4: transient (no rule matched)'
       WHERE abn_date BETWEEN ? AND ? AND responsibility='NOT_DETERMINED'`, [from, to]);

    await conn.commit();

    console.log(JSON.stringify({
      from, to,
      total_in_window: resetRes.affectedRows,
      rule1_consecutive_trip_cab: rule1Count,
      rule2_per_day_signal: rule2Res.affectedRows,
      rule3a_per_week_cab: rule3aRes.affectedRows,
      rule3b_per_week_magnet: rule3bRes.affectedRows,
      rule4_transient: rule4Res.affectedRows,
      rule1_trips: rule1Trips
    }, null, 2));
  } catch (err) {
    await conn.rollback();
    console.error('Classification failed:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
