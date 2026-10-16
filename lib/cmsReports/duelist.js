'use strict';

/*
 * CLI CMS Due List (Foot Plate / Grading / Counselling) — storage.
 * Tables: sql/2026-10-17_cms_duelist_storage.sql (rules in its header).
 *
 *   buildFacts(rows, dataDate)     counts per lobby + DIVISION, and the overdue crew
 *   buildReport(facts, warnings)   the `report` saveLoad wants (one totals table)
 *   saveUpload({...})              gzip the CSV, store.saveLoad, then upsertMonitoring
 *   upsertMonitoring(rows, loadId, dataDate)   versioned per-crew state (one transaction)
 *   currentState()                 the latest stored report in the page's own row shape
 *   monitoringFor(cmsId)           one crew's current row, for the bio-profile
 *
 * rows = parseCmsReport(...).rows (lib/cmsReport.js). Overdue is computed against the
 * DATA DATE passed in, never against today, so a stored day is reproducible.
 * Dates travel as 'YYYY-MM-DD' strings (mysql2 DATE trap: see store.js).
 */

const zlib = require('zlib');
const pool = require('../../config/database');
const store = require('./store');
const { ddmmyyyyToISO } = require('../cmsReport');

const KEY = 'duelist';
const PARAMS = ['footplate', 'grading', 'counselling'];
const GRADES = ['A', 'B', 'C', 'D'];
const MEASURES = [
  ...PARAMS.flatMap((p) => [`${p}.overdue`, `${p}.due30`, `${p}.total`]),
  ...GRADES.map((g) => `grade.${g}`), 'grade.none', 'crew.total',
];

// Lobby of a crew id = its letter prefix (CSMT2989 -> CSMT, KYNS0123 -> KYNS).
function lobbyOfCrewId(crewId) {
  const m = String(crewId || '').trim().toUpperCase().match(/^[A-Z]+/);
  return m ? m[0] : 'UNKNOWN';
}

// dd-mm-yyyy -> 'YYYY-MM-DD' only when it is a real calendar date, else null.
function toDateOrNull(dmy) {
  const iso = ddmmyyyyToISO(dmy);
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toISOString().slice(0, 10) === iso ? iso : null;
}

const cut = (v, n) => { const s = v == null ? '' : String(v).trim(); return s ? s.slice(0, n) : null; };
const dmy = (iso) => (iso ? iso.split('-').reverse().join('-') : '');

/*
 * counts: every lobby × every measure (zeros included, so trends never see a gap)
 * crew:   one row per (parameter, crew) that is overdue on dataDate
 */
function buildFacts(rows, dataDate) {
  const due30 = store.dataDateFor(dataDate, -30);
  const tally = new Map();
  const bump = (lobby, m, n = 1) => {
    if (!tally.has(lobby)) tally.set(lobby, Object.fromEntries(MEASURES.map((k) => [k, 0])));
    tally.get(lobby)[m] += n;
  };
  const crew = [];
  for (const r of rows) {
    const lobby = lobbyOfCrewId(r.crewId);
    for (const L of [lobby, 'DIVISION']) {
      bump(L, 'crew.total');
      bump(L, GRADES.includes(r.grade) ? `grade.${r.grade}` : 'grade.none');
      for (const p of PARAMS) {
        const due = r.params[p].dueISO;
        if (!due) continue;
        bump(L, `${p}.total`);
        if (due <= dataDate) bump(L, `${p}.overdue`);
        else if (due <= due30) bump(L, `${p}.due30`);
      }
    }
    for (const p of PARAMS) {
      const x = r.params[p];
      if (x.dueISO && x.dueISO <= dataDate) {
        crew.push({ lobby, cmsId: r.crewId, name: r.name, measure: `${p}.overdue`, eventTime: `${x.dueISO} 00:00:00`,
          detail: { cli: r.cliId, cliName: r.cliName, desig: r.desig, done: x.done, due: x.due } });
      }
    }
  }
  if (!tally.has('DIVISION')) bump('DIVISION', 'crew.total', 0);
  const counts = [];
  for (const [lobby, t] of tally) for (const m of MEASURES) counts.push({ lobby, measure: m, value: t[m] });
  return { counts, crew };
}

const LABEL = { footplate: 'Foot Plate Monitoring', grading: 'Grading', counselling: 'Counselling' };
function buildReport(facts, warnings) {
  const div = (m) => (facts.counts.find((c) => c.lobby === 'DIVISION' && c.measure === m) || { value: 0 }).value;
  return {
    key: KEY, dateOffset: 0, warnings: warnings || [],
    tables: [{ title: 'Due List totals', headers: ['Parameter', 'Overdue', 'Due in 30 days', 'With a due date'],
      rows: PARAMS.map((p) => [LABEL[p], div(`${p}.overdue`), div(`${p}.due30`), div(`${p}.total`)]), total: null }],
  };
}

const GZ = Buffer.from([0x1f, 0x8b]);
function gunzipIfNeeded(buffer) {
  return buffer && buffer.length > 2 && buffer[0] === GZ[0] && buffer[1] === GZ[1] ? zlib.gunzipSync(buffer) : buffer;
}

/*
 * One HQ upload: the gzipped CSV + facts as a 'duelist' load for dataDate (= upload day),
 * then the per-crew state. Returns { id, dataDate, replaced, monitoring }. If the state
 * update fails after the load was stored, the error carries `loadId` so the caller can
 * report "stored, but…"; a re-upload the same day repairs it.
 */
const UPLOAD_LOCK = 'cms_duelist_upload';
async function saveUpload({ rows, warnings, file, user, dataDate }) {
  const facts = buildFacts(rows, dataDate);
  const report = buildReport(facts, warnings);
  const gz = zlib.gzipSync(file.buffer);
  const name = String(file.name || 'cms-report.csv').replace(/\.csv$/i, '') + '.csv.gz';
  // The load and the crew update are two transactions. A named lock, held on its own
  // connection, serialises whole uploads so a second one cannot store and update the crew
  // between the first one's two steps (crew rows would then point at a retired load).
  const lockConn = await pool.getConnection();
  try {
    const [[got]] = await lockConn.query('SELECT GET_LOCK(?, 60) AS ok', [UPLOAD_LOCK]);
    if (Number(got.ok) !== 1) throw new Error('another Due List upload is still being stored — try again in a minute');
    const out = await store.saveLoad({ report, facts, sheetDate: dataDate, files: [{ name, buffer: gz }], hand: null, user, lobby: null });
    try {
      out.monitoring = await upsertMonitoring(rows, out.id, dataDate);
    } catch (err) {
      err.loadId = out.id;
      throw err;
    }
    return out;
  } finally {
    await lockConn.query('SELECT RELEASE_LOCK(?)', [UPLOAD_LOCK]).catch(() => {});
    lockConn.release();
  }
}

// Tracked fields: a change in any of these starts a new version. status is deliberately out.
const TRACKED = ['crew_name', 'desig', 'lobby', 'cli_cms_id', 'cli_name', 'cli_alloted', 'grade', 'prev_grade',
  'prev_grade_date', 'gr_done', 'gr_due', 'co_done', 'co_due', 'co_subject', 'fp_done', 'fp_due', 'fp_remark'];
const COLS = ['cms_id', ...TRACKED, 'status'];
const DATE_COLS = ['cli_alloted', 'prev_grade_date', 'gr_done', 'gr_due', 'co_done', 'co_due', 'fp_done', 'fp_due'];

function toRecord(r) {
  const g = (v) => { const s = cut(v, 1); return s && GRADES.includes(s.toUpperCase()) ? s.toUpperCase() : null; };
  return {
    cms_id: String(r.crewId).trim().toUpperCase(),
    crew_name: cut(r.name, 100), desig: cut(r.desig, 20), lobby: lobbyOfCrewId(r.crewId),
    cli_cms_id: cut(r.cliId, 15), cli_name: cut(r.cliName, 100), cli_alloted: toDateOrNull(r.cliAlloted),
    grade: g(r.grade), prev_grade: g(r.prevGrade), prev_grade_date: toDateOrNull(r.prevGradeDate),
    gr_done: toDateOrNull(r.params.grading.done), gr_due: toDateOrNull(r.params.grading.due),
    co_done: toDateOrNull(r.params.counselling.done), co_due: toDateOrNull(r.params.counselling.due),
    co_subject: cut(r.params.counselling.subject, 500),
    fp_done: toDateOrNull(r.params.footplate.done), fp_due: toDateOrNull(r.params.footplate.due),
    fp_remark: cut(r.params.footplate.remark, 500),
    status: cut(r.status, 10),
  };
}
const fingerprint = (rec) => TRACKED.map((k) => (rec[k] == null ? '' : rec[k])).join('\u0001');
// Column list for a SELECT; `t` qualifies them when the query joins another table.
const selectCols = (t = '') => COLS.map((c) => (DATE_COLS.includes(c) ? `DATE_FORMAT(${t}${c}, '%Y-%m-%d') AS ${c}` : `${t}${c}`)).join(', ');

async function upsertMonitoring(rows, loadId, dataDate) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [cur] = await conn.query(`SELECT id, ${selectCols()} FROM cms_crew_monitoring WHERE is_current = 1 FOR UPDATE`);
    const current = new Map(cur.map((c) => [c.cms_id, c]));
    const seen = new Set();
    const same = new Map();            // status -> [ids] (unchanged rows, grouped for one UPDATE each)
    const retire = [];
    const insert = [];
    const res = { added: 0, changed: 0, unchanged: 0, absent: 0, dupes: 0 };
    for (const r of rows) {
      if (!String(r.crewId || '').trim()) continue;
      const rec = toRecord(r);
      if (seen.has(rec.cms_id)) { res.dupes++; continue; }
      seen.add(rec.cms_id);
      const old = current.get(rec.cms_id);
      if (old && fingerprint(old) === fingerprint(rec)) {
        res.unchanged++;
        const k = rec.status || '';
        if (!same.has(k)) same.set(k, []);
        same.get(k).push(old.id);
      } else {
        if (old) { res.changed++; retire.push(old.id); } else res.added++;
        insert.push(rec);
      }
    }
    for (const id of current.keys()) if (!seen.has(id)) res.absent++;

    for (const [status, ids] of same) {
      await conn.query('UPDATE cms_crew_monitoring SET last_seen = ?, last_load_id = ?, status = ? WHERE id IN (?)',
        [dataDate, loadId, status || null, ids]);
    }
    if (retire.length) await conn.query('UPDATE cms_crew_monitoring SET is_current = 0 WHERE id IN (?)', [retire]);
    for (let i = 0; i < insert.length; i += 500) {
      const chunk = insert.slice(i, i + 500);
      await conn.query(
        `INSERT INTO cms_crew_monitoring (${COLS.join(', ')}, first_load_id, last_load_id, first_seen, last_seen) VALUES ?`,
        [chunk.map((rec) => [...COLS.map((c) => rec[c]), loadId, loadId, dataDate, dataDate])]);
    }
    await conn.commit();
    return res;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/*
 * The latest stored report: { stored: { id, dataDate, by, at, earlier }, generatedAtIST, rows, warnings }
 * or null. rows = every crew's CURRENT version in the shape parseCmsReport returns, so the
 * Due List page renders it exactly as an upload. generatedAtIST = the report's data date,
 * so "overdue as on" is the day the report was taken.
 */
async function currentState() {
  const [[load]] = await pool.query(
    `SELECT l.id, DATE_FORMAT(l.data_date, '%Y-%m-%d') AS data_date, l.loaded_by,
            DATE_FORMAT(l.loaded_at, '%Y-%m-%d %H:%i') AS loaded_at, l.warnings,
            (SELECT COUNT(*) FROM cms_daily_loads e WHERE e.report_key = l.report_key AND e.data_date = l.data_date
               AND e.lobby IS NULL AND e.is_current = 0) AS earlier
       FROM cms_daily_loads l
      WHERE l.report_key = ? AND l.lobby IS NULL AND l.is_current = 1
      ORDER BY l.data_date DESC LIMIT 1`, [KEY]);
  if (!load) return null;
  const dataDate = load.data_date;
  // Only crew the latest file confirmed: a crew absent from it (transferred, retired) keeps its
  // current row for the bio-profile but is not in the report, exactly as a fresh upload shows it.
  const [crew] = await pool.query(
    `SELECT ${selectCols()} FROM cms_crew_monitoring WHERE is_current = 1 AND last_load_id = ? ORDER BY cli_name, crew_name, cms_id`, [load.id]);
  const param = (done, due, extra) => ({ done: dmy(done), due: dmy(due), dueISO: due || null,
    overdue: !!due && due <= dataDate, ...extra });
  const rows = crew.map((c, i) => ({
    id: String(i + 1), cliId: c.cli_cms_id || '', cliName: c.cli_name || '', crewId: c.cms_id, name: c.crew_name || '',
    desig: c.desig || '', status: c.status || '', grade: c.grade || '', cliAlloted: dmy(c.cli_alloted),
    prevGrade: c.prev_grade || '', prevGradeDate: dmy(c.prev_grade_date),
    params: {
      footplate: param(c.fp_done, c.fp_due, { remark: c.fp_remark || '' }),
      grading: param(c.gr_done, c.gr_due, {}),
      counselling: param(c.co_done, c.co_due, { subject: c.co_subject || '' }),
    },
  }));
  let warnings = [];
  try { warnings = typeof load.warnings === 'string' ? JSON.parse(load.warnings) : (load.warnings || []); } catch (e) { warnings = []; }
  return { stored: { id: load.id, dataDate, by: load.loaded_by, at: load.loaded_at, earlier: Number(load.earlier) || 0 },
    generatedAtIST: dataDate, rows, warnings };
}

// One crew's current state for the bio-profile, or null.
async function monitoringFor(cmsId) {
  const [[m]] = await pool.query(
    `SELECT ${selectCols('m.')}, DATE_FORMAT(l.data_date, '%Y-%m-%d') AS as_of
       FROM cms_crew_monitoring m JOIN cms_daily_loads l ON l.id = m.last_load_id
      WHERE m.is_current = 1 AND m.cms_id = ? LIMIT 1`, [String(cmsId || '').trim().toUpperCase()]);
  if (!m) return null;
  return { fpDone: m.fp_done, fpDue: m.fp_due, coDone: m.co_done, coDue: m.co_due, grDone: m.gr_done, grDue: m.gr_due,
    grade: m.grade, cli: m.cli_cms_id, cliName: m.cli_name, asOf: m.as_of };
}

module.exports = { KEY, PARAMS, MEASURES, lobbyOfCrewId, toDateOrNull, buildFacts, buildReport, gunzipIfNeeded,
  saveUpload, upsertMonitoring, currentState, monitoringFor };
