'use strict';

/*
 * Suburban rest analysis router.
 *
 *   POST /upload            multipart, field "files" (1..n CMS Sign On/Off xlsx) -> analysis JSON
 *   POST /runs              persist an analysis as a run
 *   GET  /runs              run history
 *   GET  /runs/:id          one stored run with its findings
 *   POST /export/xlsx       workbook of the two reports
 *
 * Unlike /clicms this module DOES persist: runs are kept so rest can be compared and
 * trended across dates. Findings store computed minutes, so a later retiming of
 * `details` does not silently rewrite history.
 */

const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const pool = require('../config/database');
const { parseSignOnFile } = require('../lib/suburbanSignOn');
const { analyse, DEFAULTS } = require('../lib/restAnalysis');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 30 },
});

// ---- helpers ----

async function loadDetails() {
  const [rows] = await pool.query(
    `SELECT detail_id, detail_number, line, sign_on_time, sign_off_time,
            total_duty_hours, detail_type, next_detail_id, cycle_anchor
       FROM details
      WHERE detail_number IS NOT NULL AND detail_number <> ''`
  );
  // detail_number uniqueness is incidental (PK is detail_id). If a number ever repeats,
  // the SET NO join is ambiguous — drop it rather than pick one arbitrarily.
  const map = new Map();
  const dupes = new Set();
  for (const r of rows) {
    const k = String(r.detail_number).trim();
    if (map.has(k)) dupes.add(k);
    map.set(k, r);
  }
  for (const k of dupes) map.delete(k);
  return { map, dupes: [...dupes] };
}

const clampInt = (v, min, max, dflt) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= min && n <= max ? n : dflt;
};

function optionsFrom(src) {
  return {
    floorMinutes: clampInt(src.floorMinutes, 0, 24 * 60, DEFAULTS.floorMinutes),
    extraDutyMaxGapMinutes: clampInt(src.extraDutyMaxGapMinutes, 0, 24 * 60, DEFAULTS.extraDutyMaxGapMinutes),
  };
}

// MySQL DATETIME from a Date/ISO string, in local (IST) wall-clock — never toISOString(),
// which would shift every time by -5:30.
function sqlDateTime(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
         `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// ---- upload + analyse ----

router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded (field name must be "files").' });
    }

    const parsed = [];
    for (const f of req.files) {
      parsed.push(await parseSignOnFile(f.buffer, f.originalname));
    }

    const { map, dupes } = await loadDetails();
    const result = analyse({ files: parsed, details: map, options: optionsFrom(req.body || {}) });

    if (dupes.length) {
      result.warnings.push(
        `Detail number(s) ${dupes.join(', ')} appear more than once in the detail book — ` +
        `pairs using them could not be matched to a booked detail.`
      );
    }

    result.files = parsed.map((p) => ({
      fileName: p.fileName, lobby: p.lobby, periodFrom: p.periodFrom, periodTo: p.periodTo, rows: p.rows.length,
    }));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not process the files.' });
  }
});

// ---- persist a run ----

router.post('/runs', async (req, res) => {
  const body = req.body || {};
  const doubles = Array.isArray(body.doubles) ? body.doubles : [];
  const extras = Array.isArray(body.extras) ? body.extras : [];
  if (doubles.length === 0 && extras.length === 0) {
    return res.status(400).json({ error: 'Nothing to save — the analysis produced no findings.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const t = body.totals || {};
    const cov = body.coverage || {};
    const opt = optionsFrom(body.options || {});

    const [ins] = await conn.query(
      `INSERT INTO suburban_rest_runs
         (uploaded_by, file_count, file_names, period_from, period_to, coverage_gaps,
          floor_minutes, extra_duty_max_gap_minutes, duty_rows, crew_count, unpaired_crew,
          double_pairs, extra_duty_pairs, ordinary_rests, warnings)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        (req.session && req.session.user && req.session.user.username) || null,
        (body.files || []).length,
        JSON.stringify((body.files || []).map((f) => f.fileName)),
        sqlDateTime(cov.from), sqlDateTime(cov.to),
        JSON.stringify((cov.gaps || []).map((g) => ({ from: sqlDateTime(g.from), to: sqlDateTime(g.to) }))),
        opt.floorMinutes, opt.extraDutyMaxGapMinutes,
        t.dutyRows || 0, t.crew || 0, t.unpairedCrew || 0,
        doubles.length, extras.length, t.ordinaryRests || 0,
        JSON.stringify(body.warnings || []),
      ]
    );
    const runId = ins.insertId;

    const rows = [...doubles, ...extras].map((f) => ([
      runId, f.report === 'extra' ? 'extra' : 'double',
      f.office || null, f.crewId, f.crewName || null,
      f.det1, f.det1Line || null, sqlDateTime(f.det1On), sqlDateTime(f.det1Off),
      f.det2, f.det2Line || null, sqlDateTime(f.det2On), sqlDateTime(f.det2Off),
      f.bookedRestMinutes == null ? null : f.bookedRestMinutes,
      f.actualRestMinutes,
      f.shortfallMinutes == null ? null : f.shortfallMinutes,
      f.spanMinutes == null ? null : f.spanMinutes,
      f.chainingIncomplete ? 1 : 0,
      ['red', 'amber', 'ok'].includes(f.severity) ? f.severity : 'ok',
    ]));

    await conn.query(
      `INSERT INTO suburban_rest_findings
         (run_id, report, office, crew_id, crew_name,
          det1, det1_line, det1_on, det1_off, det2, det2_line, det2_on, det2_off,
          booked_rest_minutes, actual_rest_minutes, shortfall_minutes, span_minutes,
          chaining_incomplete, severity)
       VALUES ?`,
      [rows]
    );

    await conn.commit();
    res.json({ runId, saved: rows.length });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message || 'Could not save the run.' });
  } finally {
    conn.release();
  }
});

// ---- run history ----

router.get('/runs', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, uploaded_at, uploaded_by, file_count, period_from, period_to,
              floor_minutes, extra_duty_max_gap_minutes, duty_rows, crew_count,
              double_pairs, extra_duty_pairs, ordinary_rests
         FROM suburban_rest_runs
        ORDER BY uploaded_at DESC, id DESC
        LIMIT 100`
    );
    res.json({ runs: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not read run history.' });
  }
});

router.get('/runs/:id', async (req, res) => {
  try {
    const id = clampInt(req.params.id, 1, Number.MAX_SAFE_INTEGER, 0);
    if (!id) return res.status(400).json({ error: 'Invalid run id.' });

    const [[run]] = await pool.query('SELECT * FROM suburban_rest_runs WHERE id = ?', [id]);
    if (!run) return res.status(404).json({ error: 'Run not found.' });

    const [findings] = await pool.query(
      `SELECT * FROM suburban_rest_findings
        WHERE run_id = ?
        ORDER BY report, FIELD(severity,'red','amber','ok'), actual_rest_minutes`,
      [id]
    );

    const safeJson = (v, dflt) => { try { return JSON.parse(v); } catch { return dflt; } };
    run.file_names = safeJson(run.file_names, []);
    run.coverage_gaps = safeJson(run.coverage_gaps, []);
    run.warnings = safeJson(run.warnings, []);

    res.json({
      run,
      doubles: findings.filter((f) => f.report === 'double'),
      extras: findings.filter((f) => f.report === 'extra'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not read the run.' });
  }
});

router.delete('/runs/:id', async (req, res) => {
  try {
    const id = clampInt(req.params.id, 1, Number.MAX_SAFE_INTEGER, 0);
    if (!id) return res.status(400).json({ error: 'Invalid run id.' });
    const [r] = await pool.query('DELETE FROM suburban_rest_runs WHERE id = ?', [id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Run not found.' });
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not delete the run.' });
  }
});

// ---- xlsx export ----

const hhmm = (mins) => {
  if (mins == null) return '';
  const s = mins < 0 ? '-' : '';
  const a = Math.abs(mins);
  return `${s}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}`;
};
const dt = (v) => {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}-${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function styleHead(ws, headers, widths) {
  const row = ws.addRow(headers);
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } }; });
  widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  ws.views = [{ state: 'frozen', ySplit: ws.rowCount }];
}

const SEV_FILL = { red: 'FFF6D2CA', amber: 'FFFDF0CE' };
function paint(row, severity) {
  const argb = SEV_FILL[severity];
  if (argb) row.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }; });
}

router.post('/export/xlsx', async (req, res) => {
  try {
    const body = req.body || {};
    const doubles = Array.isArray(body.doubles) ? body.doubles : [];
    const extras = Array.isArray(body.extras) ? body.extras : [];
    const opt = optionsFrom(body.options || {});

    const wb = new ExcelJS.Workbook();
    wb.creator = 'CRTMS';

    const ws1 = wb.addWorksheet('Double detail rest');
    ws1.addRow([`Double-detail rest — booked vs actual (hard floor ${hhmm(opt.floorMinutes)})`]).font = { bold: true, size: 13 };
    ws1.addRow([]);
    styleHead(ws1,
      ['Office', 'Crew ID', 'Name', 'Det 1', 'Sign on', 'Sign off', 'Det 2', 'Sign on', 'Sign off', 'Booked rest', 'Actual rest', 'Rest lost', 'Flag'],
      [9, 12, 26, 8, 13, 13, 8, 13, 13, 12, 12, 11, 8]);
    for (const d of doubles) {
      const r = ws1.addRow([
        d.office || '', d.crewId, d.crewName || '',
        d.det1, dt(d.det1On), dt(d.det1Off),
        d.det2, dt(d.det2On), dt(d.det2Off),
        hhmm(d.bookedRestMinutes), hhmm(d.actualRestMinutes), hhmm(d.shortfallMinutes),
        d.severity === 'red' ? 'BELOW FLOOR' : d.severity === 'amber' ? 'Short' : '',
      ]);
      paint(r, d.severity);
    }

    const ws2 = wb.addWorksheet('Interval between 2 duties');
    ws2.addRow([`Interval between two duties — second duty within ${hhmm(opt.extraDutyMaxGapMinutes)} of the first`]).font = { bold: true, size: 13 };
    ws2.addRow([]);
    styleHead(ws2,
      ['Office', 'Crew ID', 'Name', 'Duty 1', 'Sign on', 'Sign off', 'Duty 2', 'Sign on', 'Sign off', 'Interval', 'Combined span', 'Note'],
      [9, 12, 26, 8, 13, 13, 8, 13, 13, 11, 14, 24]);
    for (const e of extras) {
      const r = ws2.addRow([
        e.office || '', e.crewId, e.crewName || '',
        e.det1, dt(e.det1On), dt(e.det1Off),
        e.det2, dt(e.det2On), dt(e.det2Off),
        hhmm(e.actualRestMinutes), hhmm(e.spanMinutes),
        e.chainingIncomplete ? 'Detail chaining incomplete — verify' : '',
      ]);
      paint(r, e.severity);
    }

    // Coverage and caveats belong in the file: without them the counts read as complete.
    const ws3 = wb.addWorksheet('Coverage & notes');
    ws3.getColumn(1).width = 110;
    ws3.addRow(['Coverage']).font = { bold: true, size: 13 };
    for (const c of (body.coverage && body.coverage.covered) || []) ws3.addRow([`Covered: ${dt(c.from)} → ${dt(c.to)}`]);
    for (const g of (body.coverage && body.coverage.gaps) || []) ws3.addRow([`NOT covered: ${dt(g.from)} → ${dt(g.to)} — duties in this window are invisible to this report.`]);
    ws3.addRow([]);
    ws3.addRow(['Only pairs where BOTH duties fall inside a covered window can be reported. These figures are a floor on what happened, not a complete count.']);
    ws3.addRow([]);
    ws3.addRow(['Warnings']).font = { bold: true, size: 13 };
    for (const w of body.warnings || []) ws3.addRow([w]);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="suburban-rest-analysis.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not build the workbook.' });
  }
});

module.exports = router;
