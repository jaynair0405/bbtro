/**
 * Classify suburban EMU details as single / double / triple crew cycles.
 *
 * Crews work `details` (one duty per row) in cycles chained by consecutive
 * detail_number within a line. This walks each line in numeric detail_number
 * order and tags every detail with its role in a cycle, the next detail in the
 * cycle, the rest after it, and the cycle anchor.
 *
 * Cycle shapes (see sql/2026-07-27_details_type_classification_schema.sql):
 *   single  [n]                          same-day, no midnight cross, > 16h rest to next
 *   double  [n ev] -> [n+1 mor]          soff_place(n) == son_place(n+1), rest 4-8h
 *   triple  [n ev] -> [n+1 mor] -> [n+2 night*] -> [n+3 night*]   (* both cross midnight)
 *           where n,n+1 tag 'double' and n+2,n+3 tag 'triple' (per-role).
 *
 * Reuses utils/helpers.js (parseTimeToMinutes, calculateCrossMidnightDutyHours,
 * minutesToTimeString) and the shared pool in config/database.js.
 *
 * Dry run (report only, no DB writes):  node scripts/classify_details.js
 * Commit (write DB + emit prod SQL):     node scripts/classify_details.js --commit
 */

const fs = require('fs');
const path = require('path');
const {
  parseTimeToMinutes,
  calculateCrossMidnightDutyHours,
  minutesToTimeString,
} = require('../utils/helpers');

const commit = process.argv.includes('--commit');

// --- tunable thresholds -----------------------------------------------------
const MORNING_START = 3 * 60;   // 03:00
const MORNING_END   = 7 * 60;   // 07:00
const DAY_END       = 14 * 60;  // 14:00
const EVENING_END   = 21 * 60;  // 21:00
const DOUBLE_REST_MIN = 4 * 60;  // 4h
const DOUBLE_REST_MAX = 8 * 60;  // 8h
const SINGLE_REST_MIN = 16 * 60; // > 16h

// Sign-on bucket by minute-of-day.
function bucket(minutes) {
  if (minutes >= MORNING_START && minutes < MORNING_END) return 'morning';
  if (minutes >= MORNING_END && minutes < DAY_END) return 'day';
  if (minutes >= DAY_END && minutes < EVENING_END) return 'evening';
  return 'night';
}

// Rest between a sign-off and the next sign-on (cross-midnight aware), in minutes.
function restMinutes(row, next) {
  if (!next) return Infinity;
  return calculateCrossMidnightDutyHours(row.sign_off_time, next.sign_on_time);
}

function placeEq(a, b) {
  return (a || '').trim().toUpperCase() === (b || '').trim().toUpperCase();
}

function annotate(row) {
  const on = parseTimeToMinutes(row.sign_on_time);
  const off = parseTimeToMinutes(row.sign_off_time);
  return { ...row, _bucket: bucket(on), _crosses: off <= on };
}

// Pure classifier — no DB/IO. Given raw detail rows, returns
// { assign, cycles, unclassified }. Exported for testing.
function classify(rows) {
  // Group by line, preserving the numeric order the caller supplied.
  const byLine = new Map();
  for (const r of rows) {
    if (!byLine.has(r.line)) byLine.set(r.line, []);
    byLine.get(r.line).push(annotate(r));
  }

  const cycles = [];       // { type, members: [row], anchor, links: [{from, to, rest}] }
  const unclassified = []; // rows left NULL

  // Assignments to apply: detail_id -> { detail_type, next_detail_id, rest_after, cycle_anchor }
  const assign = new Map();

  for (const [, line] of byLine) {
    let i = 0;
    while (i < line.length) {
      const a = line[i];
      const b = line[i + 1];
      const c = line[i + 2];
      const d = line[i + 3];

      const isDoubleHead =
        b &&
        a._bucket === 'evening' &&
        b._bucket === 'morning' &&
        placeEq(a.sign_off_place, b.sign_on_place) &&
        restMinutes(a, b) >= DOUBLE_REST_MIN &&
        restMinutes(a, b) <= DOUBLE_REST_MAX;

      if (isDoubleHead && c && d && c._crosses && d._crosses) {
        // Triple cycle: a,b = 'double'; c,d = 'triple'
        const members = [a, b, c, d];
        const anchor = a.detail_id;
        setChain(assign, cycles, members, ['double', 'double', 'triple', 'triple'], anchor);
        i += 4;
      } else if (isDoubleHead) {
        // Double cycle
        const members = [a, b];
        const anchor = a.detail_id;
        setChain(assign, cycles, members, ['double', 'double'], anchor);
        i += 2;
      } else if (!a._crosses && restMinutes(a, b) > SINGLE_REST_MIN) {
        // Single: standalone, same-day, long rest to next (or last in line)
        assign.set(a.detail_id, {
          detail_type: 'single',
          next_detail_id: null,
          rest_after: null,
          cycle_anchor: a.detail_id,
        });
        cycles.push({ type: 'single', members: [a], anchor: a.detail_id, links: [] });
        i += 1;
      } else {
        unclassified.push(a);
        i += 1;
      }
    }
  }

  return { assign, cycles, unclassified };
}

async function main() {
  require('dotenv').config();
  const pool = require('../config/database');
  try {
    const [rows] = await pool.query(
      `SELECT detail_id, detail_number, line,
              sign_on_time, sign_on_place, sign_off_time, sign_off_place,
              total_duty_hours
       FROM details
       ORDER BY line, CAST(detail_number AS UNSIGNED)`
    );

    const { assign, cycles, unclassified } = classify(rows);
    printReport(cycles, unclassified, rows.length);

    if (!commit) {
      console.log('\nDry run. Re-run with --commit to write the DB and emit prod SQL.');
      return;
    }

    await applyToDb(pool, assign);
    emitSql(assign);
    console.log(`\nCommitted ${assign.size} detail rows. Emitted prod SQL.`);
  } finally {
    await pool.end();
  }
}

// Build chain links + assignments for a cycle of `members` with per-role `tags`.
function setChain(assign, cycles, members, tags, anchor) {
  const links = [];
  members.forEach((row, idx) => {
    const next = members[idx + 1] || null;
    const rest = next ? minutesToTimeString(calculateCrossMidnightDutyHours(row.sign_off_time, next.sign_on_time)) : null;
    assign.set(row.detail_id, {
      detail_type: tags[idx],
      next_detail_id: next ? next.detail_id : null,
      rest_after: rest,
      cycle_anchor: anchor,
    });
    if (next) links.push({ from: row, to: next, rest });
  });
  const type = tags.includes('triple') ? 'triple' : 'double';
  cycles.push({ type, members, anchor, links });
}

function printReport(cycles, unclassified, total) {
  const counts = { single: 0, double: 0, triple: 0 };
  for (const cyc of cycles) counts[cyc.type] += 1;

  console.log('===== DETAIL CYCLE CLASSIFICATION (report) =====');
  console.log(`Total details: ${total}`);
  console.log(`Cycles: ${counts.single} single, ${counts.double} double, ${counts.triple} triple`);
  console.log(`Unclassified rows: ${unclassified.length}\n`);

  for (const cyc of cycles) {
    if (cyc.type === 'single') continue; // list singles compactly below
    console.log(`[${cyc.type.toUpperCase()}] line ${cyc.members[0].line}  anchor ${cyc.anchor}`);
    cyc.members.forEach((m, idx) => {
      const tag = idx < 2 || cyc.type === 'double' ? 'double' : 'triple';
      const link = cyc.links[idx];
      console.log(
        `   ${String(m.detail_number).padEnd(6)} ${tag.padEnd(6)}` +
        ` on ${fmt(m.sign_on_time)}@${(m.sign_on_place || '?').padEnd(6)}` +
        ` off ${fmt(m.sign_off_time)}@${(m.sign_off_place || '?').padEnd(6)}` +
        (link ? `  rest→ ${link.rest}` : '')
      );
    });
    console.log('');
  }

  const singles = cycles.filter((c) => c.type === 'single').map((c) => c.members[0].detail_number);
  if (singles.length) console.log(`Singles (${singles.length}): ${singles.join(', ')}\n`);

  if (unclassified.length) {
    console.log('----- UNCLASSIFIED — needs manual review -----');
    for (const u of unclassified) {
      console.log(
        `   line ${u.line} #${u.detail_number}  on ${fmt(u.sign_on_time)}@${u.sign_on_place}` +
        ` off ${fmt(u.sign_off_time)}@${u.sign_off_place}  bucket=${u._bucket} crosses=${u._crosses}`
      );
    }
  }
}

function fmt(t) {
  return (t || '').toString().slice(0, 5);
}

async function applyToDb(pool, assign) {
  const conn = await pool.getConnection();
  try {
    for (const [detailId, v] of assign) {
      await conn.query(
        `UPDATE details
         SET detail_type = ?, next_detail_id = ?, rest_after = ?, cycle_anchor = ?
         WHERE detail_id = ?`,
        [v.detail_type, v.next_detail_id, v.rest_after, v.cycle_anchor, detailId]
      );
    }
  } finally {
    conn.release();
  }
}

function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function emitSql(assign) {
  const out = path.join(__dirname, '..', 'sql', '2026-07-27_details_type_classification_data.sql');
  const lines = [
    '-- Suburban detail single/double/triple classification — DATA (generated)',
    '-- Populates detail_type, next_detail_id, rest_after, cycle_anchor on `details`.',
    '-- Run AFTER sql/2026-07-27_details_type_classification_schema.sql.',
    '-- Run: mysql -u jay -p bbtro < sql/2026-07-27_details_type_classification_data.sql',
    '',
  ];
  for (const [detailId, v] of assign) {
    lines.push(
      `UPDATE details SET detail_type = ${sqlVal(v.detail_type)}, ` +
      `next_detail_id = ${sqlVal(v.next_detail_id)}, ` +
      `rest_after = ${sqlVal(v.rest_after)}, ` +
      `cycle_anchor = ${sqlVal(v.cycle_anchor)} ` +
      `WHERE detail_id = ${sqlVal(detailId)};`
    );
  }
  lines.push('', `SELECT '${assign.size} details classified' AS status;`, '');
  fs.writeFileSync(out, lines.join('\n'));
  console.log(`Wrote ${out}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('FAILED:', e.message);
    process.exitCode = 1;
  });
}

module.exports = { classify, bucket, restMinutes, placeEq, annotate };
