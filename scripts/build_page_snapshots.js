/**
 * Rebuild the embedded data snapshots in the Crew-Ops mockup pages from the DB.
 *
 * The four public/div/*-mockup.html pages are still static — each carries its
 * data inline as `const NAME = [...]` so it can be opened without a server.
 * That means ANY change to `details` / `trains` (a retime, a new detail book,
 * a re-run of classify_details.js) leaves every page stale until this is run.
 *
 * Rebuilds:
 *   crew-dashboard-mockup.html  BLOCKS
 *   detail-book-mockup.html     CYCLES, LEGS
 *   reports-mockup.html         DETAILS, LEGS
 *   train-index-mockup.html     TRAINS, TDET, TLEGS   (see extract_train_index.js)
 *
 * Office + link_type come from the detail_blocks number ranges, the same rule
 * the classifier uses. Departmental dummies (410-412, 558, 999) are in no block
 * and so have office = null by design.
 *
 * Dry run (report only, writes nothing):  node scripts/build_page_snapshots.js
 * Write the pages:                        node scripts/build_page_snapshots.js --commit
 */
const mysql = require('mysql2/promise');
const fs = require('fs');

const DIV = 'public/div/';
const COMMIT = process.argv.includes('--commit');
const hhmm = (v) => (v == null ? null : String(v).slice(0, 5));

// replace `const NAME = <json>;` in place, leaving the rest of the page untouched
function splice(file, name, value) {
  const p = DIV + file;
  let h = fs.readFileSync(p, 'utf8');
  const re = new RegExp('(const ' + name + ' *= *)(\\[[\\s\\S]*?\\]|\\{[\\s\\S]*?\\})(;)');
  if (!re.test(h)) throw new Error(`${name} not found in ${file}`);
  h = h.replace(re, (_, a, __, c) => a + JSON.stringify(value) + c);
  if (COMMIT) fs.writeFileSync(p, h);
  return h.length;
}

(async () => {
  const db = await mysql.createConnection({
    host: 'localhost', user: 'jay', password: '4310jay', database: 'bbtro',
  });

  const [blocks] = await db.query('SELECT * FROM detail_blocks WHERE is_active=1 ORDER BY id');
  const [rawDetails] = await db.query(`
    SELECT d.detail_id, d.detail_number, d.line,
           d.sign_on_time, d.sign_on_place, d.sign_off_time, d.sign_off_place,
           d.total_duty_hours, d.total_wheel_movement, d.total_piloting,
           d.detail_type, d.next_detail_id, d.cycle_anchor
      FROM details d
     ORDER BY d.line, CAST(d.detail_number AS UNSIGNED)
  `);
  const [rawLegs] = await db.query(`
    SELECT t.detail_id, t.train_number, t.train_type,
           t.start_station, t.start_time, t.end_station, t.end_time, t.remarks,
           t.rt_detail, t.rb_detail,
           m.service_type, m.car_composition, m.ac_service, m.line_group, m.direction
      FROM trains t
      LEFT JOIN suburban_train_master m
        ON m.normalized_train_number =
           UPPER(REPLACE(CASE WHEN t.train_number LIKE 'P/%'
                              THEN SUBSTRING(t.train_number,3)
                              ELSE t.train_number END,' ',''))
     ORDER BY t.detail_id, t.start_time
  `);

  // office + link from the number-range blocks
  const blockOf = (line, num) => blocks.find(
    (b) => b.line === line && +num >= b.start_number && +num <= b.end_number);

  const DETAILS = rawDetails.map((d) => {
    const b = blockOf(d.line, d.detail_number);
    return {
      id: d.detail_id, wm: d.total_wheel_movement, num: d.detail_number,
      pil: d.total_piloting, son: hhmm(d.sign_on_time), duty: d.total_duty_hours,
      line: d.line, link: b ? b.link_type : null, next: d.next_detail_id,
      soff: hhmm(d.sign_off_time), sonp: d.sign_on_place, type: d.detail_type,
      soffp: d.sign_off_place, anchor: d.cycle_anchor, office: b ? b.office_code : null,
    };
  });

  // reports carries service info on each leg; the detail book doesn't need it
  const LEGS_FULL = rawLegs.map((l) => ({
    ac: l.ac_service, es: l.end_station, et: hhmm(l.end_time), lg: l.line_group,
    ss: l.start_station, st: hhmm(l.start_time), tn: l.train_number, ty: l.train_type,
    car: l.car_composition, did: l.detail_id, dir: l.direction, svc: l.service_type,
    rt: l.rt_detail, rb: l.rb_detail,
  }));
  const LEGS_BOOK = rawLegs.map((l) => ({
    es: l.end_station, et: hhmm(l.end_time), ss: l.start_station, st: hhmm(l.start_time),
    tn: l.train_number, ty: l.train_type, did: l.detail_id,
    rem: [l.rt_detail && 'R/T ' + l.rt_detail, l.rb_detail && 'R/B ' + l.rb_detail, l.remarks]
      .filter(Boolean).join(' \u00b7 '),
  }));

  // per-block totals for the dashboard: n = details in block, s/d/t = by type
  const BLOCKS = blocks.map((b) => {
    const inB = DETAILS.filter((d) => d.line === b.line && d.link === b.link_type
      && d.office === b.office_code
      && +d.num >= b.start_number && +d.num <= b.end_number);
    return {
      d: inB.filter((x) => x.type === 'double').length,
      n: inB.length,
      s: inB.filter((x) => x.type === 'single').length,
      t: inB.filter((x) => x.type === 'triple').length,
      line: b.line, link: b.link_type, label: b.label, office: b.office_code,
    };
  }).filter((b) => b.n > 0);

  // ---- train index (same shapes as extract_train_index.js) ----
  const norm = (tn) => (tn.startsWith('P/') ? tn.slice(2) : tn).toUpperCase().replace(/\s+/g, '');
  // A waiting/standby block is duty time, not a train — it still renders inside the
  // duty (TLEGS) but must never become an entry in the train index. Some legacy rows
  // are typed 'working' but named WAITING, so test both.
  const isTrain = (l) => l.train_type !== 'waiting' && norm(l.train_number) !== 'WAITING';
  const trains = new Map();
  const dByNum = Object.fromEntries(DETAILS.map((d) => [d.id, d]));
  for (const l of rawLegs) {
    if (!isTrain(l)) continue;
    const k = norm(l.train_number);
    if (!trains.has(k)) {
      trains.set(k, {
        t: k, disp: l.train_number, svc: l.service_type,
        car: l.car_composition ? l.car_composition.replace('_CAR', '') : null,
        ac: l.ac_service, lg: l.line_group, dir: l.direction,
        f: null, to: null, mm: l.service_type ? 1 : 0, w: 0, p: 0, ds: [],
      });
    }
    const T = trains.get(k);
    if (l.train_type === 'working') T.w++; else if (l.train_type === 'piloting') T.p++;
    const num = dByNum[l.detail_id] ? dByNum[l.detail_id].num : null;
    if (num && !T.ds.includes(num)) T.ds.push(num);
  }

  const TDET = {};
  for (const d of DETAILS) {
    TDET[d.id] = {
      num: d.num, ln: d.line, off: d.office, lk: d.link, dt: d.type,
      son: d.son, soff: d.soff, sonp: d.sonp, soffp: d.soffp, an: d.anchor,
    };
  }
  const TLEGS = rawLegs.map((l) => {
    const k = norm(l.train_number);
    const o = { t: k, ty: l.train_type, ss: l.start_station, st: hhmm(l.start_time),
      es: l.end_station, et: hhmm(l.end_time), did: l.detail_id };
    if (l.train_number !== k) o.tn = l.train_number;
    if (l.remarks) o.rmk = l.remarks;
    if (l.rt_detail) o.rt = l.rt_detail;
    if (l.rb_detail) o.rb = l.rb_detail;
    return o;
  });

  // from/to + display number come from the master where matched
  const [master] = await db.query(
    'SELECT normalized_train_number n, train_number tn, from_station f, to_station t FROM suburban_train_master');
  const mByN = Object.fromEntries(master.map((m) => [m.n, m]));
  const TRAINS = [...trains.values()].sort((a, b) => a.t.localeCompare(b.t)).map((x) => {
    const m = mByN[x.t];
    if (m) { x.disp = m.tn; x.f = m.f; x.to = m.t; }
    if (x.disp === x.t) delete x.disp;
    for (const k of Object.keys(x)) if (x[k] == null) delete x[k];
    return x;
  });

  splice('crew-dashboard-mockup.html', 'BLOCKS', BLOCKS);
  splice('detail-book-mockup.html', 'CYCLES', DETAILS);
  splice('detail-book-mockup.html', 'LEGS', LEGS_BOOK);
  splice('reports-mockup.html', 'DETAILS', DETAILS);
  splice('reports-mockup.html', 'LEGS', LEGS_FULL);
  splice('train-index-mockup.html', 'TRAINS', TRAINS);
  splice('train-index-mockup.html', 'TDET', TDET);
  splice('train-index-mockup.html', 'TLEGS', TLEGS);

  const byType = (t) => DETAILS.filter((d) => d.type === t).length;
  console.log(`${COMMIT ? 'WROTE' : 'DRY RUN'} — details ${DETAILS.length}` +
    ` (single ${byType('single')} / double ${byType('double')} / triple ${byType('triple')}` +
    ` / unclassified ${DETAILS.filter((d) => !d.type).length})`);
  console.log(`  legs ${LEGS_FULL.length} · trains ${TRAINS.length}` +
    ` (matched ${TRAINS.filter((t) => t.mm).length})` +
    ` · blocks ${BLOCKS.length} · no-office details ${DETAILS.filter((d) => !d.office).length}`);
  if (!COMMIT) console.log('  (nothing written — re-run with --commit)');
  await db.end();
})();
