// Build the Train Index data snapshot: every train worked in the detail book,
// with the detail(s) that work it, joined to suburban_train_master for service info.
const mysql = require('mysql2/promise');
const fs = require('fs');

const t = (v) => (v == null ? null : String(v).slice(0, 5)); // TIME -> HH:MM

(async () => {
  const db = await mysql.createConnection({
    host: 'localhost', user: 'jay', password: '4310jay', database: 'bbtro',
  });

  // office/link come from the number-range blocks, same rule as the classifier
  const [legs] = await db.query(`
    SELECT
      t.train_number                                        AS tn,
      UPPER(REPLACE(CASE WHEN t.train_number LIKE 'P/%'
                         THEN SUBSTRING(t.train_number,3)
                         ELSE t.train_number END,' ',''))    AS norm,
      t.train_type                                          AS ty,
      t.start_station AS ss, t.start_time AS st,
      t.end_station   AS es, t.end_time   AS et,
      t.remarks                                             AS rmk,
      d.detail_id AS did, d.detail_number AS num, d.line AS line,
      d.sign_on_time AS son, d.sign_off_time AS soff,
      d.sign_on_place AS sonp, d.sign_off_place AS soffp,
      d.detail_type AS dtype, d.cycle_anchor AS anchor,
      b.office_code AS office, b.link_type AS link,
      m.service_type AS svc, m.car_composition AS car, m.ac_service AS ac,
      m.line_group AS lg, m.direction AS dir,
      m.from_station AS mf, m.to_station AS mt, m.train_number AS mtn
    FROM trains t
    JOIN details d ON d.detail_id = t.detail_id
    LEFT JOIN detail_blocks b
      ON b.line = d.line
     AND CAST(d.detail_number AS UNSIGNED) BETWEEN b.start_number AND b.end_number
    LEFT JOIN suburban_train_master m
      ON m.normalized_train_number =
         UPPER(REPLACE(CASE WHEN t.train_number LIKE 'P/%'
                            THEN SUBSTRING(t.train_number,3)
                            ELSE t.train_number END,' ',''))
    ORDER BY t.train_number, d.detail_number, t.start_time
  `);

  // TRAINS: one entry per normalized train number
  const trains = new Map();
  for (const r of legs) {
    if (!r.norm) continue;
    if (!trains.has(r.norm)) {
      trains.set(r.norm, {
        t: r.norm,            // normalized number = the index key
        disp: r.mtn || r.tn,  // display number (master's spaced form when matched)
        svc: r.svc, car: r.car ? r.car.replace('_CAR', '') : null, ac: r.ac,
        lg: r.lg, dir: r.dir, f: r.mf, to: r.mt,
        mm: r.svc ? 1 : 0,    // matched to train master?
        w: 0, p: 0,           // working / piloting leg counts
        ds: [],               // detail numbers that touch it
      });
    }
    const T = trains.get(r.norm);
    if (r.ty === 'working') T.w++; else if (r.ty === 'piloting') T.p++;
    if (!T.ds.includes(r.num)) T.ds.push(r.num);
  }

  // DETAILS: the per-detail fields, lifted out of the legs so they aren't
  // repeated 2653 times (keyed by detail_id)
  const dets = {};
  for (const r of legs) {
    if (dets[r.did]) continue;
    dets[r.did] = {
      num: r.num, ln: r.line, off: r.office, lk: r.link, dt: r.dtype,
      son: t(r.son), soff: t(r.soff), sonp: r.sonp, soffp: r.soffp,
      an: r.anchor,
    };
  }

  // LEGS: just the leg itself + a pointer to its detail
  const out = legs.filter((r) => r.norm).map((r) => {
    const o = { t: r.norm, ty: r.ty, ss: r.ss, st: t(r.st), es: r.es, et: t(r.et), did: r.did };
    if (r.tn !== r.norm) o.tn = r.tn;   // only when it differs (P/ prefix, spacing)
    if (r.rmk) o.rmk = r.rmk;
    return o;
  });

  const trainsArr = [...trains.values()]
    .sort((a, b) => a.t.localeCompare(b.t))
    .map((x) => {
      if (x.disp === x.t) delete x.disp;
      for (const k of Object.keys(x)) if (x[k] == null) delete x[k];
      return x;
    });

  fs.writeFileSync(
    process.argv[2],
    'const TRAINS=' + JSON.stringify(trainsArr) +
    ';\nconst TDET=' + JSON.stringify(dets) +
    ';\nconst TLEGS=' + JSON.stringify(out) + ';\n'
  );

  const multiW = trainsArr.filter((x) => x.ds.length > 1).length;
  console.log('trains', trainsArr.length,
    '| matched', trainsArr.filter((x) => x.mm).length,
    '| legs', out.length,
    '| multi-detail', multiW,
    '| unblocked legs', out.filter((x) => !x.off).length);
  await db.end();
})();
