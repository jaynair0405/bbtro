// routes/division/tsrRoutes.js
// Mounted at /api/division/tsr (division realm).
// Temporary speed restrictions / caution orders, DIVISION-WIDE, from the
// RTIS/ICMS "CAUTION/414" export or manual entry. Used by Ghat SPM
// (/div/ghat-spm) and available to RTIS.
//
//   GET  /list?section=KSRA-IGP[&on=YYYY-MM-DD]   cautions for a section (in force on a day; default today)
//   GET  /active?section=&dir=DN&at=YYYY-MM-DDTHH:MM:SS  cautions applying to one trip
//   POST /import  (multipart "file", optional "close_missing"=1)  ICMS xlsx upload
//   POST /        manual add        PUT /:id edit        DELETE /:id close (soft)
//   GET  /imports  last imports

const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const SHEET_EXT = /\.(xlsx|xlsm|xls|csv)$/i;

// Which ICMS line names belong to a running direction on a section. MIDDLE
// lines carry both directions and are reported to the page as advisory only
// (the recorder cannot tell which line the train used).
const SECTION_LINES = {
  'KSRA-IGP': { DN: ['DNNE'], UP: ['UPNE'], MID: ['MIDDLE'] },
  'KJT-LNL':  { DN: ['DNSE'], UP: ['UPSE'], MID: ['MIDSE'] }
};

function canWrite(u) {
  return !!u && (u.div_role === 'division_admin' || !!u.can_access_ghat_spm || !!u.can_access_rtis);
}
function requireWrite(req, res, next) {
  if (!canWrite(req.session && req.session.user)) return res.status(403).json({ success: false, error: 'No permission to change caution orders' });
  next();
}

// ── mast text → decimal km (caution-order convention: "131/162" → 131.162) ──
function mastToKm(text) {
  if (text === null || text === undefined) return null;
  const m = String(text).trim().match(/^(\d{1,3})\s*\/\s*(\d{1,3})/);
  if (!m) return null;
  return parseFloat(m[1] + '.' + m[2]);
}
// Excel serial → {y,m,d,hh,mm,ss} in the sheet's own wall-clock (UTC math on
// the 1899-12-30 epoch; no local-timezone shift).
function serialToParts(n) {
  const ms = Math.round((n - 25569) * 86400 * 1000);            // 25569 = 1970-01-01
  const d = new Date(ms);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), hh: d.getUTCHours(), mm: d.getUTCMinutes(), ss: d.getUTCSeconds() };
}
const p2 = n => String(n).padStart(2, '0');
function serialToMysql(n) { const t = serialToParts(n); return `${t.y}-${p2(t.m)}-${p2(t.d)} ${p2(t.hh)}:${p2(t.mm)}:${p2(t.ss)}`; }

// Excel turns "56/09" into a date (1 Sep 1956) — the cell arrives as a serial
// number. Recover km = year mod 100, mast = month zero-padded. A day other
// than 1 means the text had a third part ("1/2/3"): flag it.
function mastFromCell(v) {
  if (typeof v === 'number') {
    if (v > 1000) { const t = serialToParts(v); return { text: (t.y % 100) + '/' + p2(t.m), flag: t.d !== 1 }; }
    return { text: String(v), flag: true };
  }
  if (v === null || v === undefined) return { text: null, flag: false };
  return { text: String(v).trim() || null, flag: false };
}
function parseTimeWindow(remarks) {
  const m = String(remarks || '').toUpperCase().match(/FROM\s*(\d{2})[.:]?(\d{2})\s*HRS?\s*TO\s*(\d{2})[.:]?(\d{2})\s*HRS?/);
  if (!m) return { time_from: null, time_to: null };
  return { time_from: `${m[1]}:${m[2]}:00`, time_to: `${m[3]}:${m[4]}:00` };
}
function resType(v) {
  const s = String(v || '').toUpperCase();
  if (/OHS|WHISTLE/.test(s)) return 'OHS_WF';
  if (/CAUTIOUS/.test(s)) return 'CAUTIOUS';
  return 'SPEED';
}
function toMysqlDt(v) {
  if (!v) return null;
  if (typeof v === 'number') return v > 1000 ? serialToMysql(v) : null;          // Excel serial
  if (v instanceof Date) { if (isNaN(v)) return null; return `${v.getFullYear()}-${p2(v.getMonth() + 1)}-${p2(v.getDate())} ${p2(v.getHours())}:${p2(v.getMinutes())}:${p2(v.getSeconds())}`; }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T]?(\d{2}:\d{2}(:\d{2})?)?/);
  if (m) return `${m[1]}-${m[2]}-${m[3]} ${m[4] ? (m[4].length === 5 ? m[4] + ':00' : m[4]) : '00:00:00'}`;
  m = s.match(/^(\d{2}) (\w{3}) (\d{2}) (\d{2}:\d{2})$/);          // "01 Jan 26 18:25"
  if (m) { const d = new Date(`${m[1]} ${m[2]} 20${m[3]} ${m[4]}`); return isNaN(d) ? null : d.toISOString().slice(0, 19).replace('T', ' '); }
  return null;
}
// mysql2 returns DATETIME as JS Dates, which JSON would emit in UTC; send the
// wall-clock string instead so the page shows the day the office entered.
function dtOut(v) { return v instanceof Date ? toMysqlDt(v) : v; }
function rowOut(r) { r.date_from = dtOut(r.date_from); r.date_to = dtOut(r.date_to); r.created_at = dtOut(r.created_at); r.updated_at = dtOut(r.updated_at); return r; }

function num(v) { if (v === null || v === undefined || v === '') return null; const n = parseFloat(v); return isNaN(n) ? null : n; }

// ── ICMS workbook → rows ──
function parseIcms(buf) {
  const wb = XLSX.read(buf, { type: 'buffer', cellDates: false });          // serials, converted by hand (no tz shift)
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
  let reportTime = null;
  for (const c of (rows[0] || [])) if (typeof c === 'number' && c > 40000) { reportTime = serialToMysql(c); break; }
  // header row: the one whose second cell is "Caution ID"
  let h = rows.findIndex(r => r && String(r[1] || '').trim().toLowerCase() === 'caution id');
  if (h < 0) throw new Error('Not an ICMS caution report (no "Caution ID" header)');
  const out = []; let section = null;
  for (let i = h + 1; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue;
    const c0 = String(r[0] || '');
    const sec = c0.match(/Section:\s*([A-Z0-9-]+)/i);
    if (sec) { section = sec[1].toUpperCase(); continue; }
    if (!r[1]) continue;
    const fm = mastFromCell(r[11]), tm = mastFromCell(r[12]);
    const tw = parseTimeWindow(r[14]);
    out.push({
      caution_id: String(r[1]).trim(), section: section || 'UNKNOWN',
      from_stn: r[2] ? String(r[2]).trim() : null, to_stn: r[3] ? String(r[3]).trim() : null,
      line_no: r[8] !== undefined && r[8] !== null ? String(r[8]) : null, line_name: r[9] ? String(r[9]).trim().toUpperCase() : null,
      direction: ['UP', 'DN', 'BUP'].includes(String(r[16] || '').toUpperCase()) ? String(r[16]).toUpperCase() : 'BUP',
      from_mast: fm.text, to_mast: tm.text, from_km: mastToKm(fm.text), to_km: mastToKm(tm.text),
      speed_pass: num(r[6]), speed_goods: num(r[7]), res_type: (num(r[6]) === null && num(r[7]) === null) ? resType(r[15] || 'OHS') : resType(r[15]),
      co_type: ['TP', 'PP'].includes(String(r[18] || '').toUpperCase()) ? String(r[18]).toUpperCase() : 'TP',
      date_from: toMysqlDt(r[19]), date_to: toMysqlDt(r[20]),
      time_from: tw.time_from, time_to: tw.time_to,
      reason: r[23] ? String(r[23]).trim().slice(0, 255) : null, remarks: r[14] ? String(r[14]).trim().slice(0, 500) : null,
      distance_m: num(r[24]) === null ? null : Math.round(num(r[24])),
      mast_flag: (fm.flag || tm.flag) ? 1 : 0
    });
  }
  return { reportTime, rows: out.filter(x => x.date_from) };
}

// ── routes ──
router.get('/list', async (req, res) => {
  const section = String(req.query.section || '').toUpperCase();
  const on = req.query.on ? String(req.query.on) : new Date().toISOString().slice(0, 10);
  if (!section) return res.status(400).json({ success: false, error: 'section required' });
  try {
    const [rows] = await req.app.locals.pool.query(
      `SELECT * FROM div_tsr_cautions WHERE section = ? AND is_active = 1
         AND date_from <= ? AND (date_to IS NULL OR date_to >= ?)
        ORDER BY line_name, from_km`, [section, on + ' 23:59:59', on + ' 00:00:00']);
    res.json({ success: true, section, on, rows: rows.map(rowOut) });
  } catch (err) { console.error('tsr list error:', err); res.status(500).json({ success: false, error: 'Could not load cautions' }); }
});

// Cautions applying to one trip. `at` = the trip departure (YYYY-MM-DDTHH:MM:SS);
// the daily time window is checked against that time on the page per km.
router.get('/active', async (req, res) => {
  const section = String(req.query.section || '').toUpperCase(), dir = String(req.query.dir || '').toUpperCase();
  const at = toMysqlDt(req.query.at);
  const lines = SECTION_LINES[section];
  if (!lines || !['UP', 'DN'].includes(dir) || !at) return res.status(400).json({ success: false, error: 'section, dir and at required' });
  try {
    const [rows] = await req.app.locals.pool.query(
      `SELECT * FROM div_tsr_cautions WHERE section = ? AND is_active = 1
         AND date_from <= ? AND (date_to IS NULL OR date_to >= ?)
         AND (direction = ? OR direction = 'BUP')
         AND (line_name IN (?) OR line_name IN (?) OR line_name IS NULL)
        ORDER BY from_km`, [section, at, at, dir, lines[dir], lines.MID]);
    res.json({ success: true, rows: rows.map(r => Object.assign(rowOut(r), { advisory_line: lines.MID.includes(r.line_name) })) });
  } catch (err) { console.error('tsr active error:', err); res.status(500).json({ success: false, error: 'Could not load cautions' }); }
});

router.post('/import', requireWrite, upload.single('file'), async (req, res) => {
  if (!req.file || !SHEET_EXT.test(req.file.originalname)) return res.status(400).json({ success: false, error: 'Upload the ICMS caution report (.xlsx)' });
  const closeMissing = String(req.body.close_missing || '') === '1';
  const user = req.session.user.username;
  let parsed;
  try { parsed = parseIcms(req.file.buffer); } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  const pool = req.app.locals.pool; const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [ins] = await conn.query('INSERT INTO div_tsr_imports (file_name, report_time, rows_read, imported_by) VALUES (?,?,?,?)',
      [req.file.originalname.slice(0, 150), parsed.reportTime || null, parsed.rows.length, user]);
    const importId = ins.insertId;
    let added = 0, updated = 0, flagged = 0;
    for (const r of parsed.rows) {
      if (r.mast_flag) flagged++;
      const [ex] = await conn.query('SELECT id FROM div_tsr_cautions WHERE caution_id = ?', [r.caution_id]);
      const cols = ['section','from_stn','to_stn','line_no','line_name','direction','from_mast','to_mast','from_km','to_km','speed_pass','speed_goods','res_type','co_type','date_from','date_to','time_from','time_to','reason','remarks','distance_m','mast_flag'];
      const vals = cols.map(c => r[c]);
      if (ex.length) {
        await conn.query(`UPDATE div_tsr_cautions SET ${cols.map(c => c + ' = ?').join(', ')}, source = 'ICMS', is_active = 1, import_id = ?, updated_by = ? WHERE id = ?`, [...vals, importId, user, ex[0].id]);
        updated++;
      } else {
        await conn.query(`INSERT INTO div_tsr_cautions (caution_id, source, ${cols.join(', ')}, import_id, created_by) VALUES (?, 'ICMS', ${cols.map(() => '?').join(', ')}, ?, ?)`, [r.caution_id, ...vals, importId, user]);
        added++;
      }
    }
    let closed = 0;
    if (closeMissing && parsed.rows.length) {
      const ids = parsed.rows.map(r => r.caution_id);
      const rt = parsed.reportTime || toMysqlDt(new Date());
      const [cl] = await conn.query(
        `UPDATE div_tsr_cautions SET date_to = ?, updated_by = ? WHERE source = 'ICMS' AND is_active = 1 AND date_to IS NULL AND caution_id NOT IN (?)`, [rt, user, ids]);
      closed = cl.affectedRows;
    }
    await conn.query('UPDATE div_tsr_imports SET rows_added = ?, rows_updated = ?, rows_closed = ?, rows_flagged = ? WHERE id = ?', [added, updated, closed, flagged, importId]);
    await conn.commit();
    res.json({ success: true, import_id: importId, report_time: parsed.reportTime, rows_read: parsed.rows.length, added, updated, closed, flagged,
               sections: [...new Set(parsed.rows.map(r => r.section))] });
  } catch (err) {
    await conn.rollback(); console.error('tsr import error:', err);
    res.status(500).json({ success: false, error: 'Import failed: ' + err.message });
  } finally { conn.release(); }
});

function manualFromBody(b) {
  const fm = String(b.from_mast || '').trim() || null, tm = String(b.to_mast || '').trim() || null;
  const tw = (b.time_from && b.time_to) ? { time_from: b.time_from + (b.time_from.length === 5 ? ':00' : ''), time_to: b.time_to + (b.time_to.length === 5 ? ':00' : '') } : { time_from: null, time_to: null };
  return {
    section: String(b.section || '').toUpperCase(), from_stn: b.from_stn || null, to_stn: b.to_stn || null,
    line_no: b.line_no || null, line_name: b.line_name ? String(b.line_name).toUpperCase() : null,
    direction: ['UP', 'DN', 'BUP'].includes(String(b.direction || '').toUpperCase()) ? String(b.direction).toUpperCase() : 'BUP',
    from_mast: fm, to_mast: tm, from_km: b.from_km !== undefined && b.from_km !== '' ? num(b.from_km) : mastToKm(fm), to_km: b.to_km !== undefined && b.to_km !== '' ? num(b.to_km) : mastToKm(tm),
    speed_pass: num(b.speed_pass), speed_goods: num(b.speed_goods) !== null ? num(b.speed_goods) : num(b.speed_pass),
    res_type: ['SPEED', 'OHS_WF', 'CAUTIOUS'].includes(String(b.res_type || '').toUpperCase()) ? String(b.res_type).toUpperCase() : (num(b.speed_pass) === null ? 'OHS_WF' : 'SPEED'),
    co_type: b.co_type === 'PP' ? 'PP' : 'TP', date_from: toMysqlDt(b.date_from), date_to: toMysqlDt(b.date_to),
    time_from: tw.time_from, time_to: tw.time_to, reason: b.reason ? String(b.reason).slice(0, 255) : null, remarks: b.remarks ? String(b.remarks).slice(0, 500) : null,
    distance_m: num(b.distance_m) === null ? null : Math.round(num(b.distance_m))
  };
}

router.post('/', requireWrite, async (req, res) => {
  const r = manualFromBody(req.body || {});
  if (!r.section || !r.date_from || (r.from_km === null && r.to_km === null)) return res.status(400).json({ success: false, error: 'section, date_from and from/to mast (or km) are required' });
  const pool = req.app.locals.pool;
  try {
    const day = r.date_from.slice(0, 10).replace(/-/g, '');
    const [[{ n }]] = await pool.query("SELECT COUNT(*) n FROM div_tsr_cautions WHERE caution_id LIKE ?", ['MAN-' + day + '-%']);
    const cid = 'MAN-' + day + '-' + String(n + 1).padStart(3, '0');
    const cols = Object.keys(r);
    const [ins] = await pool.query(`INSERT INTO div_tsr_cautions (caution_id, source, ${cols.join(', ')}, created_by) VALUES (?, 'MANUAL', ${cols.map(() => '?').join(', ')}, ?)`, [cid, ...cols.map(c => r[c]), req.session.user.username]);
    res.json({ success: true, id: ins.insertId, caution_id: cid });
  } catch (err) { console.error('tsr add error:', err); res.status(500).json({ success: false, error: 'Could not save the caution' }); }
});

router.put('/:id', requireWrite, async (req, res) => {
  const r = manualFromBody(req.body || {});
  if (!r.date_from) return res.status(400).json({ success: false, error: 'date_from required' });
  try {
    const cols = Object.keys(r);
    const [u] = await req.app.locals.pool.query(`UPDATE div_tsr_cautions SET ${cols.map(c => c + ' = ?').join(', ')}, updated_by = ? WHERE id = ?`, [...cols.map(c => r[c]), req.session.user.username, req.params.id]);
    res.json({ success: true, updated: u.affectedRows });
  } catch (err) { console.error('tsr edit error:', err); res.status(500).json({ success: false, error: 'Could not update the caution' }); }
});

// Close = set date_to now (keeps history); ?hard=1 deactivates a wrong entry
router.delete('/:id', requireWrite, async (req, res) => {
  try {
    const sql = String(req.query.hard || '') === '1'
      ? 'UPDATE div_tsr_cautions SET is_active = 0, updated_by = ? WHERE id = ?'
      : 'UPDATE div_tsr_cautions SET date_to = NOW(), updated_by = ? WHERE id = ? AND date_to IS NULL';
    const [u] = await req.app.locals.pool.query(sql, [req.session.user.username, req.params.id]);
    res.json({ success: true, updated: u.affectedRows });
  } catch (err) { console.error('tsr close error:', err); res.status(500).json({ success: false, error: 'Could not close the caution' }); }
});

router.get('/imports', async (req, res) => {
  try {
    const [rows] = await req.app.locals.pool.query('SELECT * FROM div_tsr_imports ORDER BY id DESC LIMIT 20');
    res.json({ success: true, rows: rows.map(r => { r.report_time = dtOut(r.report_time); r.created_at = dtOut(r.created_at); return r; }) });
  } catch (err) { res.status(500).json({ success: false, error: 'Could not load imports' }); }
});

module.exports = router;
