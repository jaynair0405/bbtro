/**
 * Populate detail-cycle chaining columns on `details`:
 *   next_detail_id  - Continuous: next detail of the SAME (office,line,link_type=continuous),
 *                     wrapping last->first (skips missing numbers & other link_types).
 *                     Fix/MEMU: the next detail you entered in the FILLED csvs.
 *   cycle_anchor    - DOUBLE/TRIPLE only: first detail of the group.
 *
 * Rest (home rest / double-detail rest) is NOT stored — compute on the fly in the
 * page/report from next_detail_id + sign times (timetable changes make stored rest stale).
 *                     Sources: classifier cycles (continuous auto), chain notes "a-b-c-d"
 *                     in the FILLED csvs, and double-pair derivation.
 *
 * Link ranges come from the detail_blocks table (not hard-coded).
 * Dry run (report):  node scripts/chain_details.js
 * Commit:            node scripts/chain_details.js --commit
 */
require('dotenv').config();
const fs = require('fs');
const pool = require('../config/database');
const { classify } = require('./classify_details');

const commit = process.argv.includes('--commit');
const FILLED = [
  'data/suburban-detail/classify_fills_gaps.csv',
  'data/suburban-detail/classify_fills_fixmemu.csv',
];

// Read the user's next_detail_or_notes fills -> map detail_id -> raw note.
function readNotes() {
  const notes = new Map();
  for (const f of FILLED) {
    if (!fs.existsSync(f)) continue;
    const rows = fs.readFileSync(f, 'utf8').trim().split(/\r?\n/);
    const hdr = rows.shift().split(',');
    const iId = hdr.indexOf('detail_id');
    const iNote = hdr.indexOf('next_detail_or_notes');
    for (const ln of rows) {
      const c = ln.split(',');
      if (iNote >= 0 && (c[iNote] || '').trim()) notes.set(c[iId], c[iNote].trim());
    }
  }
  return notes;
}

async function main() {
  const [details] = await pool.query(
    `SELECT detail_id, detail_number, line, detail_type,
            sign_on_time, sign_off_time
     FROM details ORDER BY line, CAST(detail_number AS UNSIGNED)`
  );
  const [blocks] = await pool.query('SELECT office_code, line, link_type, start_number, end_number FROM detail_blocks');

  const idByKey = new Map();               // `${line}#${num}` -> detail_id
  const byId = new Map();
  for (const d of details) { idByKey.set(d.line + '#' + (+d.detail_number), d); byId.set(d.detail_id, d); }

  const blockFor = (line, num) => blocks.find(b => b.line === line && num >= b.start_number && num <= b.end_number);

  // Ordered lists of continuous detail_numbers per (office_code, line) for wrap.
  const contLists = new Map();             // key `${office}#${line}` -> [numbers asc]
  for (const d of details) {
    const b = blockFor(d.line, +d.detail_number);
    if (b && b.link_type === 'continuous') {
      const k = b.office_code + '#' + d.line;
      if (!contLists.has(k)) contLists.set(k, []);
      contLists.get(k).push(+d.detail_number);
    }
  }
  for (const arr of contLists.values()) arr.sort((a, b) => a - b);

  const notes = readNotes();

  // cycle_anchor sources ------------------------------------------------------
  const anchor = new Map();                // detail_id -> anchor detail_id
  // (a) classifier cycles (continuous auto doubles/triples)
  const { cycles } = classify(details);
  for (const cyc of cycles) {
    if (cyc.type === 'single') continue;
    for (const m of cyc.members) anchor.set(m.detail_id, cyc.anchor);
  }
  // (b) chain notes "a-b-c-d" -> anchor = first
  for (const [id, note] of notes) {
    const m = note.match(/^\s*(\d+)(?:\s*-\s*\d+)+\s*$/);
    if (m) {
      const nums = note.split('-').map(s => +s.trim());
      const first = idByKey.get(byId.get(id).line + '#' + nums[0]);
      if (first) for (const n of nums) { const dd = idByKey.get(byId.get(id).line + '#' + n); if (dd) anchor.set(dd.detail_id, first.detail_id); }
    }
  }

  // Compute assignments -------------------------------------------------------
  const plan = [];       // {id, next, rest, anchor}
  const noBlock = [];
  for (const d of details) {
    const num = +d.detail_number;
    const b = blockFor(d.line, num);
    if (!b) { noBlock.push(d.detail_number); continue; }

    // next_detail_id
    let nextId = null;
    if (b.link_type === 'continuous') {
      const arr = contLists.get(b.office_code + '#' + d.line);
      const i = arr.indexOf(num);
      const nextNum = arr[(i + 1) % arr.length];        // wrap last->first
      const nd = idByKey.get(d.line + '#' + nextNum);
      nextId = nd ? nd.detail_id : null;
    } else {                                            // fix / memu: user note if it's a plain number
      const note = notes.get(d.detail_id);
      const mm = note && note.match(/^\s*(\d+)\s*$/);
      if (mm) { const nd = idByKey.get(d.line + '#' + (+mm[1])); nextId = nd ? nd.detail_id : null; }
    }

    // cycle_anchor: double/triple only
    let anc = null;
    if (d.detail_type === 'double' || d.detail_type === 'triple') {
      anc = anchor.get(d.detail_id) || null;
      // derive pair anchor for doubles not otherwise anchored
      if (!anc && d.detail_type === 'double') {
        if (nextId && byId.get(nextId) && byId.get(nextId).detail_type === 'double') anc = d.detail_id;
      }
    }

    plan.push({ id: d.detail_id, num: d.detail_number, line: d.line, type: d.detail_type, link: b.link_type, next: nextId, anchor: anc });
  }

  // Second pass: doubles that are the "morning" half inherit anchor from whoever points to them.
  const pointedBy = new Map();
  for (const p of plan) if (p.next) pointedBy.set(p.next, p.id);
  for (const p of plan) {
    if ((p.type === 'double' || p.type === 'triple') && !p.anchor) {
      const prev = pointedBy.get(p.id);
      if (prev) { const pp = plan.find(x => x.id === prev); if (pp && pp.anchor) p.anchor = pp.anchor; }
    }
  }

  report(plan, noBlock);

  if (!commit) { console.log('\nDry run. Re-run with --commit to write.'); await pool.end(); return; }

  const conn = await pool.getConnection();
  try {
    for (const p of plan) {
      await conn.query('UPDATE details SET next_detail_id=?, cycle_anchor=? WHERE detail_id=?',
        [p.next, p.anchor, p.id]);
    }
  } finally { conn.release(); }
  console.log(`\nCommitted chaining for ${plan.length} details.`);
  await pool.end();
}

function report(plan, noBlock) {
  const withNext = plan.filter(p => p.next).length;
  const anchored = plan.filter(p => (p.type === 'double' || p.type === 'triple') && p.anchor).length;
  const dtNoAnchor = plan.filter(p => (p.type === 'double' || p.type === 'triple') && !p.anchor);
  console.log('===== CHAINING (report) =====');
  console.log(`Details chained: ${plan.length}  |  with next_detail_id: ${withNext}  |  no block (skipped): ${noBlock.join(',')}`);
  console.log(`Double/Triple with cycle_anchor: ${anchored}  (missing: ${dtNoAnchor.map(p=>p.num).join(',')||'none'})`);
  const samp = (n) => plan.find(p => String(p.num) === String(n));
  console.log('\nSamples:');
  for (const n of ['201','217','218','219','220','384','545','546','552','553','158','871']) {
    const p = samp(n); if (p) console.log(`  ${p.line} ${String(p.num).padEnd(4)} ${p.type.padEnd(6)} ${p.link.padEnd(10)} next=${p.next||'-'} anchor=${p.anchor||'-'}`);
  }
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
