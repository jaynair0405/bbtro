// routes/division/ghatSpmRoutes.js
// Mounted at /api/division/ghat-spm (division realm; users.can_access_ghat_spm).
// Backs /div/ghat-spm/ — the IGP / LNL banker SPM analysis pages.
//
// The analysis itself runs in the browser (JS); this router only serves
// reference data from the div_ghat_spm_* tables and the WTT stops, and tells
// the page which sections the logged-in office may use.

const express = require('express');
const router = express.Router();

const SECTIONS = {
  'KSRA-IGP': { office: 'IGP', origin: 'KSRA', end: 'IGP' },   // NE ghat (Thal)
  'KJT-LNL':  { office: 'LNL', origin: 'KJT',  end: 'LNL' }    // SE ghat (Bhor) — data pending
};
const SEE_ALL_OFFICES = ['CSMT-HQ', 'CO-BB'];

// Division admins always have the module (to test and support); everyone
// else needs users.can_access_ghat_spm, and their office decides the section.
function isAdmin(user) { return !!user && user.div_role === 'division_admin'; }
function hasModule(user) { return !!user && (isAdmin(user) || !!user.can_access_ghat_spm); }

function sectionsFor(user) {
  const all = Object.keys(SECTIONS);
  if (!hasModule(user)) return [];
  if (isAdmin(user) || SEE_ALL_OFFICES.includes(user.div_office_code)) return all;
  return all.filter(s => SECTIONS[s].office === user.div_office_code);
}

function requireGhat(req, res, next) {
  const u = req.session && req.session.user;
  if (!u) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasModule(u)) return res.status(403).json({ success: false, error: 'Ghat SPM access denied' });
  next();
}
router.use(requireGhat);

function sectionParam(req, res) {
  const s = String(req.query.section || '').toUpperCase();
  if (!SECTIONS[s]) { res.status(400).json({ success: false, error: 'Unknown section' }); return null; }
  if (!sectionsFor(req.session.user).includes(s)) { res.status(403).json({ success: false, error: 'Section not available to this office' }); return null; }
  return s;
}

// GET /me — who am I, which sections may I open
router.get('/me', (req, res) => {
  const u = req.session.user;
  res.json({
    success: true,
    username: u.username, full_name: u.full_name, office: u.div_office_code, div_role: u.div_role,
    sections: sectionsFor(u)
  });
});

// GET /ref?section=KSRA-IGP — stations, PSR spans, signals, ghat markers
// Shapes match what the page's loaders build from the old CSVs.
router.get('/ref', async (req, res) => {
  const section = sectionParam(req, res); if (!section) return;
  const pool = req.app.locals.pool;
  try {
    const [stn] = await pool.query(
      'SELECT station_code, direction, trip_km FROM div_ghat_spm_stations WHERE section = ? AND is_active = 1 ORDER BY direction, seq', [section]);
    const [psr] = await pool.query(
      'SELECT route_section, psr_from_km, psr_to_km, span_km, speed_kmph FROM div_ghat_spm_psr WHERE section = ? AND is_active = 1 ORDER BY id', [section]);
    const [sig] = await pool.query(
      'SELECT route_section, isd_km, signal_name FROM div_ghat_spm_signals WHERE section = ? AND is_active = 1 ORDER BY id', [section]);
    const [mk] = await pool.query(
      'SELECT name, direction, anchor, offset_m, psr_km, note FROM div_ghat_spm_markers WHERE section = ? AND is_active = 1 ORDER BY id', [section]);

    // stations: one row per code with up/dn trip km (as the CSV had)
    const byCode = {};
    for (const r of stn) {
      byCode[r.station_code] = byCode[r.station_code] || { name: r.station_code, up: null, dn: null };
      byCode[r.station_code][r.direction.toLowerCase()] = Number(r.trip_km);
    }
    res.json({
      success: true, section,
      stations: Object.values(byCode),
      psr: psr.map(r => ({ section: r.route_section, psrFrom: Number(r.psr_from_km), psrTo: Number(r.psr_to_km), span: Number(r.span_km), speed: Number(r.speed_kmph) })),
      signals: sig.map(r => ({ section: r.route_section, isd: Number(r.isd_km), signal: r.signal_name })),
      markers: mk.map(r => ({ name: r.name, dir: r.direction, anchor: r.anchor || '', offsetM: Number(r.offset_m || 0), km: r.psr_km === null ? null : Number(r.psr_km), note: r.note || '' }))
    });
  } catch (err) {
    console.error('ghat-spm ref error:', err);
    res.status(500).json({ success: false, error: 'Could not load reference data' });
  }
});

// GET /wtt?section=KSRA-IGP — notified dep/arr and run minutes per train over
// the section, both directions, from the WTT stops (mail/express only).
router.get('/wtt', async (req, res) => {
  const section = sectionParam(req, res); if (!section) return;
  const { origin, end } = SECTIONS[section];
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.query(
      `SELECT t.train_no, t.train_name, s.direction, s.station_code, s.arrival_time, s.departure_time, s.day_offset
         FROM div_train_stops s JOIN div_trains t ON t.train_id = s.train_id
        WHERE s.station_code IN (?, ?) AND t.is_active = 1
        ORDER BY t.train_no, s.seq_order`, [origin, end]);
    const byTrain = {};
    for (const r of rows) {
      const k = r.train_no + '|' + (r.direction || '');
      byTrain[k] = byTrain[k] || { train: r.train_no, name: r.train_name, dir: r.direction, stops: {} };
      byTrain[k].stops[r.station_code] = r;
    }
    const hhmm = v => (v ? String(v).slice(0, 5) : null);
    const toMin = v => { const p = String(v).split(':'); return (+p[0]) * 60 + (+p[1]); };
    const out = [];
    for (const k in byTrain) {
      const t = byTrain[k];
      const a = t.stops[origin], b = t.stops[end];
      if (!a || !b || !t.dir) continue;
      const fromCode = t.dir === 'DN' ? origin : end, toCode = t.dir === 'DN' ? end : origin;
      const f = t.stops[fromCode], g = t.stops[toCode];
      const dep = f.departure_time || f.arrival_time, arr = g.arrival_time || g.departure_time;
      if (!dep || !arr) continue;
      let minutes = toMin(arr) - toMin(dep) + ((g.day_offset || 0) - (f.day_offset || 0)) * 1440;
      if (minutes < 0) minutes += 1440;
      out.push({ train: t.train, dir: t.dir, from: fromCode, to: toCode, dep: hhmm(dep), arr: hhmm(arr), minutes, note: t.name || '' });
    }
    res.json({ success: true, section, rows: out });
  } catch (err) {
    console.error('ghat-spm wtt error:', err);
    res.status(500).json({ success: false, error: 'Could not load WTT timings' });
  }
});

// GET /staff?cms=IGP1340 — driver name, designation and nominated CLI for the report header
router.get('/staff', async (req, res) => {
  const cms = String(req.query.cms || '').trim().toUpperCase();
  if (!cms) return res.status(400).json({ success: false, error: 'cms required' });
  try {
    const [rows] = await req.app.locals.pool.query(
      `SELECT s.hrms_id, s.current_cms_id, s.name, s.current_office_code, s.status,
              d.designation_name, d.designation_code,
              c.cli_id, c.cli_name, c.cmsid AS cli_cms
         FROM div_staff_master s
         LEFT JOIN designations d ON d.id = s.designation_id
         LEFT JOIN div_cli_master c ON c.cli_id = s.current_cli_id
        WHERE UPPER(s.current_cms_id) = ? OR UPPER(s.hrms_id) = ? OR UPPER(s.original_cms_id) = ?
        LIMIT 1`, [cms, cms, cms]);
    if (!rows.length) return res.json({ success: true, found: false });
    const r = rows[0];
    let cli = r.cli_name ? { cli_id: r.cli_id, name: r.cli_name, cms: r.cli_cms } : null;
    if (!cli) {   // fall back to the latest active nomination
      const [n] = await req.app.locals.pool.query(
        `SELECT c.cli_id, c.cli_name, c.cmsid FROM div_cli_nominations n JOIN div_cli_master c ON c.cli_id = n.cli_id
          WHERE n.staff_hrms_id = ? AND n.status = 'Active' ORDER BY n.nominated_from_date DESC LIMIT 1`, [r.hrms_id]);
      if (n.length) cli = { cli_id: n[0].cli_id, name: n[0].cli_name, cms: n[0].cmsid };
    }
    res.json({ success: true, found: true, hrms_id: r.hrms_id, cms_id: r.current_cms_id, name: r.name, designation: r.designation_name || '', designation_code: r.designation_code || '', office: r.current_office_code, status: r.status, cli });
  } catch (err) { console.error('ghat-spm staff error:', err); res.status(500).json({ success: false, error: 'Lookup failed' }); }
});

// POST /report — build the trip PDF (pdfkit) from the analysed results + chart PNGs sent by the page
const { buildTripReport } = require('../../lib/ghatSpm/report');
router.post('/report', express.json({ limit: '25mb' }), async (req, res) => {
  const body = req.body || {};
  if (!body.header || !body.stats) return res.status(400).json({ success: false, error: 'header and stats required' });
  try {
    body.header.office = body.header.office || req.session.user.div_office_code || '';
    body.header.generatedBy = req.session.user.full_name || req.session.user.username;
    const name = ['GHAT', body.header.section === 'KJT-LNL' ? 'LNL' : 'IGP', (body.header.train || 'LE').replace(/[^A-Za-z0-9]/g, ''), body.header.date || '', body.header.loco || ''].filter(Boolean).join('_') + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + name + '"');
    buildTripReport(body, res);
  } catch (err) { console.error('ghat-spm report error:', err); if (!res.headersSent) res.status(500).json({ success: false, error: 'Could not build the report' }); }
});

module.exports = router;
