'use strict';

/*
 * CLI-CMS due-list router (mountable into CRTMS).
 *
 * Mount example (in your main app, after your auth/role middleware):
 *   const clicms = require('./routes/clicms');
 *   app.use('/clicms', requireRole('aws_shed'... or your HQ-CLI role), clicms);
 *
 * NOTHING is persisted. Uploads are held in memory only for the duration of
 * the request and discarded. Exports are generated from the row set the client
 * posts back (already filtered to the overdue list and edited by the CLI).
 */

const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { parseCmsReport, PARAMETERS, istTodayISO } = require('../lib/cmsReport');

const router = express.Router();

// In-memory upload only; never written to disk. 10 MB ceiling (file is a few hundred KB).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ---- Upload + parse ----
router.post('/upload', upload.single('csv'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name must be "csv").' });
    const result = parseCmsReport(req.file.buffer);
    res.json({
      generatedAtIST: result.generatedAtIST,
      warnings: result.warnings,
      parameters: PARAMETERS,
      rows: result.rows,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not parse the file.' });
  }
});

// Dates arriving from the client are only used in labels/filenames — accept
// strict ISO or treat as absent.
function safeISO(v) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '';
}

// Shared validation for export requests
function readExportBody(req) {
  const { parameter, rows, generatedAtIST } = req.body || {};
  if (!PARAMETERS[parameter]) throw new Error('Invalid or missing parameter.');
  if (!Array.isArray(rows)) throw new Error('Missing rows.');
  const gen = safeISO(generatedAtIST);
  return {
    parameter,
    rows,
    generatedAtIST: gen,
    dueFrom: safeISO(req.body.dueFrom),
    dueTill: safeISO(req.body.dueTill) || gen,
  };
}

// "Overdue as on X" / "Due till X" / "Due X to Y" — mirrors the client's window label.
function windowText(dueFrom, dueTill, generatedAtIST) {
  if (!dueFrom && dueTill === generatedAtIST) return `overdue as on ${isoToDDMMYYYY(dueTill)}`;
  if (!dueFrom) return `due till ${isoToDDMMYYYY(dueTill)}`;
  return `due ${isoToDDMMYYYY(dueFrom)} to ${isoToDDMMYYYY(dueTill)}`;
}
function windowFileTag(dueFrom, dueTill) {
  return dueFrom ? `${dueFrom}_to_${dueTill}` : `till_${dueTill}`;
}

// Keep in step with rowToCells and with the width arrays in both exporters (they index positionally).
const EXPORT_HEADERS = ['S.No.', 'CLI ID', 'CLI NAME', 'CREW ID', 'NAME', 'DESIG.', 'STATUS', 'CATEGORY', 'DONE DATE', 'DUE DATE', 'REMARKS'];

function rowToCells(r, parameter, idx) {
  const p = r.params && r.params[parameter] ? r.params[parameter] : { done: '', due: '' };
  return [idx + 1, r.cliId, r.cliName, r.crewId, r.name, r.desig, r.status || '', r.grade, p.done, p.due, r.remark || ''];
}

// ---- Designation × category summary (shared by both PDF exports) ----
// Keep in step with CATS in public/clicms/clicms.js — both mirror
// div_staff_master.safety_category enum('A','B','C','D').
const SUMMARY_CATS = ['A', 'B', 'C', 'D'];
function summaryCatOf(grade) {
  const g = (grade || '').trim().toUpperCase();
  return SUMMARY_CATS.includes(g) ? g : 'Other';
}
// Aggregate a set of detail rows into a designation × category matrix.
function aggregateByDesig(rows) {
  const cats = rows.some((r) => summaryCatOf(r.grade) === 'Other')
    ? [...SUMMARY_CATS, 'Other'] : [...SUMMARY_CATS];
  const map = {};
  const totals = {};
  cats.forEach((c) => (totals[c] = 0));
  totals.total = 0;
  rows.forEach((r) => {
    const cat = summaryCatOf(r.grade);
    const d = r.desig || '—';
    if (!map[d]) { map[d] = {}; cats.forEach((c) => (map[d][c] = 0)); map[d].total = 0; }
    map[d][cat]++;
    map[d].total++;
    totals[cat]++;
    totals.total++;
  });
  const byDesig = Object.keys(map).sort().map((d) => ({ desig: d, ...map[d] }));
  return { cats, byDesig, totals };
}
// Draw a designation × category matrix at doc.y. opts: { x, width, usableBottom, title }
function drawDesigMatrix(doc, { cats, byDesig, totals }, opts) {
  const { x, width, usableBottom, title } = opts;
  const headers = ['Designation', ...cats, 'Total'];
  const catW = 46;
  const firstW = Math.max(110, width - catW * (cats.length + 1));
  const colW = [firstW, ...cats.map(() => catW), catW];
  const rowH = 16;

  if (title) {
    if (doc.y + 40 > usableBottom) doc.addPage();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#1F3A5F').text(title, x, doc.y);
    doc.fillColor('#000').moveDown(0.2);
  }
  let y = doc.y;

  const drawRow = (cells, o = {}) => {
    if (y + rowH > usableBottom) { doc.addPage(); y = doc.page.margins.top; }
    let cx = x;
    cells.forEach((c, i) => {
      if (o.fill) doc.rect(cx, y, colW[i], rowH).fillAndStroke(o.fill, o.fill);
      else doc.rect(cx, y, colW[i], rowH).stroke('#D0D5DD');
      doc.font(o.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5)
        .fillColor(o.color || '#000')
        .text(String(c), cx + 4, y + 4,
          { width: colW[i] - 8, align: i === 0 ? 'left' : 'center', ellipsis: true });
      cx += colW[i];
    });
    doc.fillColor('#000');
    y += rowH;
  };

  drawRow(headers, { fill: '#1F3A5F', color: '#FFFFFF', bold: true });
  byDesig.forEach((r) => drawRow([r.desig, ...cats.map((c) => r[c] || 0), r.total]));
  if (totals) drawRow(['TOTAL', ...cats.map((c) => totals[c] || 0), totals.total],
    { bold: true, fill: '#EEF2F7' });
  doc.y = y + 6;
}

function isoToDDMMYYYY(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : (iso || '');
}
const REPORT_FOOTER = (date) => `CMS Reports Analysis-Generated from crtms.in on ${isoToDDMMYYYY(date)}`;
function drawReportFooter(doc, x, generatedAtIST, usableBottom) {
  if (doc.y + 24 > usableBottom) doc.addPage();
  doc.moveDown(0.5);
  doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#5D6B7E')
    .text(REPORT_FOOTER(generatedAtIST), x, doc.y);
  doc.fillColor('#000000');
}

// ---- Excel export ----
router.post('/export/xlsx', async (req, res) => {
  try {
    const { parameter, rows, generatedAtIST, dueFrom, dueTill } = readExportBody(req);
    const meta = PARAMETERS[parameter];

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Due List');

    ws.mergeCells('A1', 'J1');
    ws.getCell('A1').value = `CMS Report — ${meta.label} Due List (${windowText(dueFrom, dueTill, generatedAtIST)})`;
    ws.getCell('A1').font = { name: 'Arial', size: 13, bold: true };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    const headerRow = ws.addRow(EXPORT_HEADERS);
    headerRow.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    rows.forEach((r, i) => {
      const row = ws.addRow(rowToCells(r, parameter, i));
      row.font = { name: 'Arial', size: 10 };
    });

    const widths = [7, 12, 22, 12, 26, 9, 10, 10, 13, 13, 32]; // one per EXPORT_HEADERS entry
    ws.columns.forEach((c, i) => { c.width = widths[i] || 12; });
    ws.views = [{ state: 'frozen', ySplit: 2 }];
    // Derived from the header count so adding a column can't leave the filter short.
    const lastCol = String.fromCharCode(64 + EXPORT_HEADERS.length);
    ws.autoFilter = { from: 'A2', to: `${lastCol}2` };

    // Totals: designation × category, below the list (spacer row keeps it separate).
    const agg = aggregateByDesig(rows);
    ws.addRow([]);
    const sTitle = ws.addRow(['Totals — Designation × Category']);
    sTitle.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1F3A5F' } };
    const sHead = ws.addRow(['Designation', ...agg.cats, 'Total']);
    sHead.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
    sHead.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
    sHead.alignment = { horizontal: 'center' };
    sHead.getCell(1).alignment = { horizontal: 'left' };
    agg.byDesig.forEach((r) => {
      ws.addRow([r.desig, ...agg.cats.map((c) => r[c] || 0), r.total]).font = { name: 'Arial', size: 10 };
    });
    const sTotal = ws.addRow(['TOTAL', ...agg.cats.map((c) => agg.totals[c] || 0), agg.totals.total]);
    sTotal.font = { name: 'Arial', bold: true };
    sTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2F7' } };

    // Footer.
    ws.addRow([]);
    ws.addRow([REPORT_FOOTER(generatedAtIST)]).font =
      { name: 'Arial', size: 8, italic: true, color: { argb: 'FF5D6B7E' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',
      `attachment; filename="CMS_${meta.key}_due_${windowFileTag(dueFrom, dueTill)}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(400).json({ error: err.message || 'Export failed.' });
  }
});

// ---- PDF export (landscape A4, simple repeating-header table) ----
router.post('/export/pdf', (req, res) => {
  try {
    const { parameter, rows, generatedAtIST, dueFrom, dueTill } = readExportBody(req);
    const meta = PARAMETERS[parameter];

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 28 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="CMS_${meta.key}_due_${windowFileTag(dueFrom, dueTill)}.pdf"`);
    doc.pipe(res);

    const colW = [26, 52, 104, 50, 126, 40, 46, 52, 62, 62, 122]; // one per EXPORT_HEADERS entry; sums to 742, fits ~786 usable
    const startX = doc.page.margins.left;
    const usableBottom = doc.page.height - doc.page.margins.bottom;

    doc.font('Helvetica-Bold').fontSize(13)
      .text(`CMS Report — ${meta.label} Due List`, { align: 'center' });
    doc.font('Helvetica').fontSize(9)
      .text(`${windowText(dueFrom, dueTill, generatedAtIST)}  ·  ${rows.length} staff`, { align: 'center' });
    doc.moveDown(0.6);

    const drawHeader = (y) => {
      doc.font('Helvetica-Bold').fontSize(8);
      let x = startX;
      EXPORT_HEADERS.forEach((h, i) => {
        doc.rect(x, y, colW[i], 18).fillAndStroke('#1F3A5F', '#1F3A5F');
        doc.fillColor('#FFFFFF').text(h, x + 3, y + 5, { width: colW[i] - 6, ellipsis: true });
        x += colW[i];
      });
      doc.fillColor('#000000');
      return y + 18;
    };

    let y = drawHeader(doc.y);
    doc.font('Helvetica').fontSize(8);

    rows.forEach((r, i) => {
      const cells = rowToCells(r, parameter, i).map(String);
      const rowH = 16;
      if (y + rowH > usableBottom) {
        doc.addPage();
        y = drawHeader(doc.page.margins.top);
        doc.font('Helvetica').fontSize(8);
      }
      let x = startX;
      if (i % 2 === 1) {
        doc.rect(startX, y, colW.reduce((a, b) => a + b, 0), rowH).fill('#F0F3F7');
        doc.fillColor('#000000');
      }
      cells.forEach((c, ci) => {
        doc.rect(x, y, colW[ci], rowH).stroke('#D0D5DD');
        doc.fillColor('#000000').text(c, x + 3, y + 4, { width: colW[ci] - 6, height: rowH - 4, ellipsis: true });
        x += colW[ci];
      });
      y += rowH;
    });

    // Totals block: designation × category breakdown of the printed list.
    const agg = aggregateByDesig(rows);
    doc.y = y + 14;
    const sumW = 130 + 46 * (agg.cats.length + 1);
    drawDesigMatrix(doc, agg, {
      x: startX, width: sumW, usableBottom,
      title: 'Totals — Designation × Category',
    });

    drawReportFooter(doc, startX, generatedAtIST, usableBottom);
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(400).json({ error: err.message || 'Export failed.' });
  }
});

// ---- Summary PDF export (designation×category + per-CLI breakdown) ----
// Receives aggregates the client already computed (nothing stored).
function totalRowOf(cats, rows) {
  const t = {};
  cats.forEach((c) => (t[c] = 0));
  t.total = 0;
  rows.forEach((r) => {
    cats.forEach((c) => (t[c] += Number(r[c] || 0)));
    t.total += Number(r.total || 0);
  });
  return t;
}

router.post('/export/summary/pdf', (req, res) => {
  try {
    const { parameter, cats, byDesig, totals, byCli } = req.body || {};
    if (!PARAMETERS[parameter]) throw new Error('Invalid or missing parameter.');
    if (!Array.isArray(cats) || !Array.isArray(byDesig) || !Array.isArray(byCli)) {
      throw new Error('Malformed summary payload.');
    }
    const meta = PARAMETERS[parameter];
    const generatedAtIST = safeISO(req.body.generatedAtIST);
    const dueFrom = safeISO(req.body.dueFrom);
    const dueTill = safeISO(req.body.dueTill) || generatedAtIST;

    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="CMS_${meta.key}_summary_${windowFileTag(dueFrom, dueTill)}.pdf"`);
    doc.pipe(res);

    const left = doc.page.margins.left;
    const fullW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const usableBottom = doc.page.height - doc.page.margins.bottom;

    doc.font('Helvetica-Bold').fontSize(14)
      .text(`CMS Report — ${meta.label} Due List`, { align: 'center' });
    doc.font('Helvetica').fontSize(10)
      .text(`Summary · ${windowText(dueFrom, dueTill, generatedAtIST)} · ${(totals && totals.total) || 0} staff`,
        { align: 'center' });
    doc.moveDown(0.8);

    // Table 1 — by designation
    drawDesigMatrix(doc, { cats, byDesig, totals },
      { x: left, width: fullW, usableBottom, title: 'By designation × category' });
    doc.moveDown(0.4);

    // Table 2 — per CLI
    if (doc.y + 30 > usableBottom) doc.addPage();
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1F3A5F').text('By CLI', left, doc.y);
    doc.fillColor('#000').moveDown(0.3);

    byCli.forEach((cli) => {
      if (doc.y + 60 > usableBottom) doc.addPage();
      const title = `${cli.cliName || '—'}${cli.cliId ? ` (${cli.cliId})` : ''} — ${cli.total} due`;
      drawDesigMatrix(doc, { cats, byDesig: cli.rows || [], totals: totalRowOf(cats, cli.rows || []) },
        { x: left, width: fullW, usableBottom, title });
      doc.moveDown(0.3);
    });

    drawReportFooter(doc, left, generatedAtIST, usableBottom);
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(400).json({ error: err.message || 'Export failed.' });
  }
});

// =====================================================================
// Daily Position — the day's CMS count reports, stacked on one sheet.
// Same contract as the due list: parsed in memory, nothing stored; exports are
// built from the tables the browser posts back. Paths keep "/upload" and
// "/export" in them on purpose — that is what clicms-sw.js never caches.
// =====================================================================
const pool = require('../config/database');
const { headLayout } = require('../lib/cmsReports/headLayout');
const cmsReports = require('../lib/cmsReports');
const store = require('../lib/cmsReports/store');

/*
 * Auto-save (lib/cmsReports/store.js): every report built by an upload or hand entry is
 * saved for its data date (sheet date − dateOffset). A failed save never loses the
 * upload — the report still comes back, with a warning that it was NOT saved.
 * r.saved = { at, by, dataDate, replaced } tells the page what happened.
 */
/*
 * Slot reports: fill the parts this request did not bring from the day's stored load,
 * so adding one file to a day opened from storage does not drop the others.
 * got = { slot: { name, buffer } } (changed in place); returns the stored hand values.
 */
async function fillStoredParts(reportKey, req, got) {
  const sheetDate = safeISO((req.body || {}).sheetDate);
  if (!sheetDate) return null;
  const report = cmsReports.catalogue().find((c) => c.key === reportKey);
  const stored = await store.currentParts(reportKey, store.dataDateFor(sheetDate, report.dateOffset));
  if (!stored) return null;
  Object.entries(stored.files).forEach(([slot, f]) => { if (!got[slot]) got[slot] = f; });
  return stored.hand;
}

/*
 * Working Hours Suburban can come from CMS's count report (no names) or the duty list
 * (names). When a duty list replaces a stored counts-only load for the same day, say
 * where the two disagree — the later download usually carries late sign-offs.
 * Compares the sheet bands only (>09<=12, >12<=14, >14), lobby by lobby.
 */
const SUB_BANDS = [['>09<=12', ['b4', 'b5', 'b6']], ['>12<=14', ['b7']], ['>14', ['b8']]];
async function compareSubhoursCounts(r, sheetDate) {
  if (r.key !== 'subhours' || !r.facts || r.facts.crew.length === 0) return;
  const report = cmsReports.catalogue().find((c) => c.key === 'subhours');
  const prev = await store.currentCounts('subhours', store.dataDateFor(sheetDate, report.dateOffset));
  if (!prev || prev.crew > 0) return;
  const now = new Map(r.facts.counts.map((c) => [`${c.lobby}|${c.measure}`, c.value]));
  const sum = (m, lobby, ms) => ms.reduce((s, x) => s + (m.get(`${lobby}|${x}`) || 0), 0);
  const diffs = [];
  ['CSTS', 'KYNS', 'PNVS'].forEach((lobby) => SUB_BANDS.forEach(([label, ms]) => {
    const a = sum(prev.counts, lobby, ms), b = sum(now, lobby, ms);
    if (a !== b) diffs.push(`${lobby} ${label}: ${a} → ${b}`);
  }));
  r.warnings.push(diffs.length
    ? `Replaces the counts from the CMS count report for this day. Changed: ${diffs.join('; ')}.`
    : 'Replaces the counts from the CMS count report for this day — same figures, now with names.');
}

/*
 * A mergeable report's files for this upload: the day's stored files first, then the
 * new ones; a file sent again (same bytes) counts once. -> [{ name, buffer, parsed }]
 * Body pddMode=replace leaves the stored files out.
 */
async function joinStoredFiles(r, req) {
  const sheetDate = safeISO((req.body || {}).sheetDate);
  const out = [];
  const seen = new Set();
  const add = (name, buffer, parsed) => {
    const h = crypto.createHash('sha256').update(buffer).digest('hex');
    if (seen.has(h)) return;
    seen.add(h);
    out.push({ name, buffer, parsed, check: sheetDate ? cmsReports.checkFile(r.key, parsed, sheetDate) : null });
  };
  // pddMode=replace (the confirm box's "Replace saved"): only this upload's files.
  if (sheetDate && (req.body || {}).pddMode !== 'replace') {
    const stored = await store.currentParts(r.key, store.dataDateFor(sheetDate, r.dateOffset));
    if (stored) {
      Object.values(stored.files).forEach((f) => {
        // A stored file that no longer reads is dropped, not fatal.
        try { add(f.name, f.buffer, cmsReports.parseStored(r.key, f.buffer)); } catch (e) { /* skip */ }
      });
    }
  }
  r.uploads.forEach((f, i) => add(f.originalname, f.buffer, r.parts[i]));
  return out;
}

/*
 * Check only (body check=1): the page's confirm box. Every upload route builds the report
 * as usual but saves nothing; r.check = { dataDate, existing: { by, at } | null } says where
 * it WOULD be saved and whether that replaces a saved one. The page then posts again to save.
 */
const isCheck = (req) => ['1', 'true', true].includes((req.body || {}).check);

async function autoSave(r, req, files, hand) {
  const sheetDate = safeISO((req.body || {}).sheetDate);
  if (!sheetDate) {
    r.warnings.push('Not saved — this page did not send the sheet date. Reload the page (it may be an old copy) and load again.');
    return r;
  }
  if (isCheck(req)) {
    const dataDate = store.dataDateFor(sheetDate, r.dateOffset);
    // mergeable: the page offers Add to saved / Replace saved instead of "replaces saved".
    r.check = { dataDate, existing: null, mergeable: cmsReports.canMerge(r.key) };
    try { r.check.existing = await store.currentLoad(r.key, dataDate); } catch (err) { r.check.error = err.message; }
    return r;
  }
  try {
    await compareSubhoursCounts(r, sheetDate);
  } catch (err) {
    r.warnings.push(`Could not compare with the stored counts (${err.message}).`);
  }
  try {
    const user = (req.session && req.session.user && req.session.user.username) || 'unknown';
    const out = await store.saveLoad({ report: r, facts: r.facts, sheetDate, files, hand, user });
    const at = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()).replace(',', '');
    r.saved = { id: out.id, dataDate: out.dataDate, by: user, at, replaced: out.replaced };
  } catch (err) {
    r.warnings.push(`Not saved (${err.message}) — the figures shown are fine; load again later to save them.`);
  }
  return r;
}

router.post('/daily/upload', upload.array('files', 20), async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) return res.status(400).json({ error: 'No files uploaded (field name must be "files").' });

  const reports = [];
  const rejected = [];
  const sheetDate = safeISO((req.body || {}).sheetDate);
  const slotted = {};                 // slot reports' files dropped here: { key: { slot: file } }
  files.forEach((f) => {
    try {
      // A slot report's file (BOR summary / Yesterday list) goes to its slot.
      const place = sheetDate && cmsReports.dropSlot(f.buffer, sheetDate);
      if (place) {
        const held = slotted[place.key] || (slotted[place.key] = {});
        if (held[place.slot]) throw new Error(`Same part as "${held[place.slot].name}" — upload one day at a time.`);
        held[place.slot] = { name: f.originalname, buffer: f.buffer };
        return;
      }
      // One file can hold several reports (Working Hours: mainline + suburban lobbies).
      const got = cmsReports.processFile(f.buffer);
      // A file that says which day it is must fit this sheet (PDD: SIGN ON date = data
      // date; PME/REFT/ASIG: due month within the sheet's 4 months) — a wrong day would
      // otherwise be joined in unnoticed.
      got.forEach((r) => {
        const c = sheetDate && cmsReports.checkFile(r.key, r.parsed, sheetDate);
        if (c && c.error) throw new Error(`${r.label}: ${c.error}`);
      });
      // Two files of one report are two different days — the file carries no date to tell which.
      // A mergeable report (PDD: summary + lobby lists) takes any number of files.
      got.forEach((r) => {
        const dup = reports.find((x) => x.key === r.key);
        if (dup && !cmsReports.canMerge(r.key)) throw new Error(`${r.label}: same report as "${dup.file}". Upload one day at a time.`);
      });
      got.forEach((r) => {
        const dup = reports.find((x) => x.key === r.key);
        if (dup) { dup.parts.push(r.parsed); dup.uploads.push(f); return; }
        const out = { file: f.originalname, ...r };
        Object.defineProperty(out, 'facts', { value: r.facts, enumerable: false });
        Object.defineProperty(out, 'uploads', { value: [f], enumerable: false });
        Object.defineProperty(out, 'parts', { value: [r.parsed], enumerable: false });
        reports.push(out);
      });
    } catch (err) {
      rejected.push({ file: f.originalname, error: err.message || 'Could not read the file.' });
    }
  });
  if (slotted.bor) {
    try {
      reports.push(await buildBor(req, slotted.bor));
    } catch (err) {
      rejected.push({ file: Object.values(slotted.bor).map((x) => x.name).join(', '), error: err.message || 'Could not read the file.' });
    }
  }
  // Mergeable reports: join this upload's files with the day's stored ones.
  for (let i = 0; i < reports.length; i++) {
    const r = reports[i];
    if (!cmsReports.canMerge(r.key)) continue;
    try {
      const all = await joinStoredFiles(r, req);
      const built = cmsReports.mergeReport(r.key, all.map((x) => x.parsed), safeISO((req.body || {}).sheetDate));
      const unchecked = all.filter((x) => x.check && x.check.unchecked);
      if (unchecked.length) built.warnings.push(`${unchecked.map((x) => x.name).join(', ')}: ${unchecked[0].check.unchecked}`);
      const out = { file: all.map((x) => x.name).join(', '), ...built };
      Object.defineProperty(out, 'facts', { value: built.facts, enumerable: false });
      Object.defineProperty(out, 'uploads', { value: all.map((x) => ({ originalname: x.name, buffer: x.buffer })), enumerable: false });
      reports[i] = out;
    } catch (err) {
      rejected.push({ file: r.uploads.map((f) => f.originalname).join(', '), error: err.message || 'Could not read the files.' });
      reports.splice(i--, 1);
    }
  }
  reports.sort((a, b) => a.order - b.order);
  try {
    await addDesignations(reports);
  } catch (err) {
    // The counts stand without it; say so rather than fail the upload.
    reports.forEach((r) => r.warnings.push(`Designation lookup failed (${err.message}) — drill-down lists show none.`));
  }
  // Saved after the designation lookup, so the stored tables match what is shown.
  // A mergeable report keeps every file, numbered, so the next upload can join them again.
  for (const r of reports) {
    if (r.slotFiles) { await autoSave(r, req, r.slotFiles, null); continue; }
    const many = r.uploads.length > 1 || cmsReports.canMerge(r.key);
    await autoSave(r, req, r.uploads.map((f, i) => ({ name: f.originalname, buffer: f.buffer, slot: many ? `f${i + 1}` : undefined })), null);
  }
  res.json({ catalogue: cmsReports.catalogue(), reports, rejected });
});

/*
 * CMS drill-down lists often carry no designation. Where a drill names its crew-id
 * column (crewCol), look each id up in the staff master (current_cms_id) and insert
 * a sortable "Desig." column after the name. One query for the whole upload.
 */
async function addDesignations(reports) {
  const drills = reports.flatMap((r) => r.tables.flatMap((t) => t.drill || []))
    .filter((d) => Number.isInteger(d.crewCol));
  const ids = [...new Set(drills.flatMap((d) => d.rows.map((row) => String(row[d.crewCol] || '').toUpperCase())))].filter(Boolean);
  if (ids.length === 0) return;
  const [found] = await pool.query(
    `SELECT s.current_cms_id AS cms, d.designation_code AS desig
       FROM div_staff_master s JOIN designations d ON d.id = s.designation_id
      WHERE s.current_cms_id IN (?)`, [ids]);
  const desig = new Map(found.map((f) => [String(f.cms).toUpperCase(), f.desig]));
  drills.forEach((d) => {
    const at = d.crewCol + 2;                    // after crew id and name
    d.headers = [...d.headers.slice(0, at), 'Desig.', ...d.headers.slice(at)]; // drills may share one array
    let missing = 0;
    d.rows.forEach((row) => {
      const v = desig.get(String(row[d.crewCol] || '').toUpperCase());
      if (!v) missing++;
      row.splice(at, 0, v || '—');
    });
    d.sortCols = [...(d.sortCols || []).map((c) => (c >= at ? c + 1 : c)), at];
    if (missing) d.note = `${missing} crew not found in the staff master (shown as —).`;
  });
}

// Continuous night working: 3 / 4 / >4 parts posted by slot (their headers are identical).
// The page re-posts every part it holds, so the answer is the whole report each time.
router.post('/daily/upload-night', upload.fields([{ name: 'n3', maxCount: 1 }, { name: 'n4', maxCount: 1 }, { name: 'n5', maxCount: 1 }]), async (req, res) => {
  const up = req.files || {};
  const got = {};
  ['n3', 'n4', 'n5'].forEach((k) => { if (up[k] && up[k][0]) got[k] = { name: up[k][0].originalname, buffer: up[k][0].buffer }; });
  const files = {};
  const names = {};
  try {
    await fillStoredParts('contnight', req, got);
    Object.entries(got).forEach(([k, f]) => { files[k] = f.buffer; names[k] = f.name; });
    const r = cmsReports.processNight(files);
    const out = { file: Object.values(names).join(', '), ...r };
    await autoSave(withFactsOf(out, r), req, Object.keys(files).map((slot) => ({ slot, name: names[slot], buffer: files[slot] })), null);
    res.json({ catalogue: cmsReports.catalogue(), report: out });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not read the file.' });
  }
});

// Sign on/off without biometric: lobby summary + CSTS / KYNS / PNVS crew lists + the
// D-1 44-column file for DR / LTT, posted by slot (look-alike headers). Same contract as upload-night.
const NONBIO_SLOTS = ['sum', 'csts', 'kyns', 'pnvs', 'drltt'];
router.post('/daily/upload-nonbio', upload.fields(NONBIO_SLOTS.map((name) => ({ name, maxCount: 1 }))), async (req, res) => {
  const up = req.files || {};
  const got = {};
  NONBIO_SLOTS.forEach((k) => { if (up[k] && up[k][0]) got[k] = { name: up[k][0].originalname, buffer: up[k][0].buffer }; });
  const files = {};
  const names = [];
  const raw = [];
  try {
    const storedHand = await fillStoredParts('subsonoff', req, got);
    // DR / LTT now typed by hand replaces a DR / LTT file stored earlier (the newer wins).
    if (req.body && req.body.drlttHand && !(up.drltt && up.drltt[0])) delete got.drltt;
    NONBIO_SLOTS.forEach((k) => {
      if (!got[k]) return;
      files[k] = got[k].buffer; names.push(got[k].name);
      raw.push({ slot: k, name: got[k].name, buffer: got[k].buffer });
    });
    // DR / LTT typed in on the page (Fill by hand) comes as a JSON text field; failing
    // that, the hand values already stored for the day (unless a DR / LTT file came now).
    if (req.body && req.body.drlttHand) {
      try { files.drlttHand = JSON.parse(req.body.drlttHand); } catch (e) { throw new Error('DR / LTT hand entry could not be read.'); }
    } else if (storedHand && !(up.drltt && up.drltt[0])) {
      files.drlttHand = storedHand;
    }
    if (files.drlttHand) names.push('DR / LTT by hand');
    const r = cmsReports.processSlots('subsonoff', files);
    const out = { file: names.join(', '), ...r };
    await autoSave(withFactsOf(out, r), req, raw, files.drlttHand || null);
    res.json({ catalogue: cmsReports.catalogue(), report: out });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not read the file.' });
  }
});

/*
 * Breach of rest: summary + Yesterday / Last FN / Last Month crew lists (look-alike
 * headers), posted by slot. Same contract as upload-nonbio. Also reached from the main
 * upload for a dropped summary or Yesterday list (got = { slot: { name, buffer } }).
 */
const BOR_SLOTS = ['sum', 'y', 'fn', 'm'];
async function buildBor(req, got) {
  await fillStoredParts('bor', req, got);
  // A summary stored on its own by an older load comes back unnamed.
  if (got.file) { if (!got.sum) got.sum = got.file; delete got.file; }
  const files = {};
  const raw = [];
  BOR_SLOTS.forEach((k) => {
    if (!got[k]) return;
    files[k] = got[k].buffer;
    raw.push({ slot: k, name: got[k].name, buffer: got[k].buffer });
  });
  const sheetDate = safeISO((req.body || {}).sheetDate);
  const report = cmsReports.catalogue().find((c) => c.key === 'bor');
  const r = cmsReports.processSlots('bor', files, { dataDate: sheetDate ? store.dataDateFor(sheetDate, report.dateOffset) : null });
  const out = withFactsOf({ file: raw.map((f) => f.name).join(', '), ...r }, r);
  Object.defineProperty(out, 'slotFiles', { value: raw, enumerable: false });
  return out;
}
router.post('/daily/upload-bor', upload.fields(BOR_SLOTS.map((name) => ({ name, maxCount: 1 }))), async (req, res) => {
  const up = req.files || {};
  const got = {};
  BOR_SLOTS.forEach((k) => { if (up[k] && up[k][0]) got[k] = { name: up[k][0].originalname, buffer: up[k][0].buffer }; });
  try {
    const out = await buildBor(req, got);
    await autoSave(out, req, out.slotFiles, null);
    res.json({ catalogue: cmsReports.catalogue(), report: out });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not read the file.' });
  }
});

// The report list, for the page's "Fill by hand" picker before anything is uploaded.
// POST so the service worker never caches it.
// Also the one-view layout, so the page lays its blocks out exactly as the PDF does.
router.post('/daily/catalogue', (req, res) => res.json({ catalogue: cmsReports.catalogue(), layout: require('../lib/cmsReports/position').PAGES }));

// A spread copy loses the non-enumerable facts; carry them over for saving.
function withFactsOf(out, r) {
  Object.defineProperty(out, 'facts', { value: r.facts, enumerable: false });
  return out;
}

// A stored day: the current load of every report for this SHEET date (each report at
// its own data date). Empty list = nothing stored for that date yet.
router.post('/daily/day', async (req, res) => {
  const sheetDate = safeISO((req.body || {}).sheetDate);
  if (!sheetDate) return res.status(400).json({ error: 'Choose a valid sheet date.' });
  try {
    const reports = await store.loadDay(sheetDate, cmsReports.catalogue().filter((c) => !c.slotOf));
    res.json({ catalogue: cmsReports.catalogue(), sheetDate, reports });
  } catch (err) {
    res.status(500).json({ error: `Could not read the stored day (${err.message}).` });
  }
});

/*
 * Change date of a saved report (store.moveLoad: copy to the new date, the old one kept as
 * history). Body { loadId, dataDate, replace }: dataDate is the report's correct DATA date;
 * its sheet date follows from the report's offset. 409 + conflict when that date already
 * has the report and replace was not given.
 */
router.post('/daily/move', async (req, res) => {
  const { loadId, replace } = req.body || {};
  const dataDate = safeISO((req.body || {}).dataDate);
  if (!Number.isInteger(Number(loadId)) || !dataDate) return res.status(400).json({ error: 'Choose a valid date.' });
  try {
    const [[row]] = await pool.query('SELECT report_key FROM cms_daily_loads WHERE id = ?', [Number(loadId)]);
    const report = row && cmsReports.catalogue().find((c) => c.key === row.report_key && !c.slotOf);
    if (!report) return res.status(404).json({ error: 'That saved report was not found.' });
    // sheet = data + offset (dataDateFor with a negative offset adds days)
    const sheetDate = store.dataDateFor(dataDate, -report.dateOffset);
    const user = (req.session && req.session.user && req.session.user.username) || 'unknown';
    const out = await store.moveLoad({ loadId: Number(loadId), newDataDate: dataDate, newSheetDate: sheetDate, user, replace: !!replace });
    if (out.conflict) return res.status(409).json({ conflict: out.conflict, label: report.label, dataDate, sheetDate });
    res.json({ ...out, label: report.label });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not change the date.' });
  }
});

// A count-only report typed in on the page (reports with a `manual` entry only).
router.post('/daily/manual', async (req, res) => {
  const { key, values } = req.body || {};
  try {
    const r = cmsReports.processManual(String(key || ''), values);
    const out = { file: 'entered by hand', ...r };
    await autoSave(withFactsOf(out, r), req, [], values);
    res.json({ catalogue: cmsReports.catalogue(), report: out });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not build the report.' });
  }
});

function readDailyBody(req) {
  const date = safeISO((req.body || {}).date);
  if (!date) throw new Error('Missing report date.');
  const reports = (req.body || {}).reports;
  if (!Array.isArray(reports) || reports.length === 0) throw new Error('Nothing to export.');
  reports.forEach((r) => {
    if (typeof r.label !== 'string' || !Array.isArray(r.tables)) throw new Error('Malformed report payload.');
    const dd = safeISO(r.dataDate);
    r.heading = dd ? `${r.label} (${isoToDDMMYYYY(dd)})` : r.label;
    r.tables.forEach((t) => {
      if (typeof t.title !== 'string' || !Array.isArray(t.headers) || !Array.isArray(t.rows)) {
        throw new Error('Malformed table payload.');
      }
    });
  });
  return { date, reports };
}
const DAILY_TITLE = (date) => `CSMT Division — CMS Daily Position (${isoToDDMMYYYY(date)})`;
function dailyFileName(date, reports, ext) {
  const tag = reports.length === 1 && /^[a-z0-9_-]+$/i.test(reports[0].key || '') ? reports[0].key : 'daily_position';
  return `CMS_${tag}_${date}.${ext}`;
}

// One sheet per report; a single-report body is how the per-report button downloads.
router.post('/daily/export/xlsx', async (req, res) => {
  try {
    const { date, reports } = readDailyBody(req);
    const wb = new ExcelJS.Workbook();

    reports.forEach((rep, ri) => {
      // Excel: max 31 chars, none of \ / ? * [ ] :
      const name = rep.label.replace(/[\\/?*[\]:]/g, '-').slice(0, 28) || `Report ${ri + 1}`;
      const ws = wb.addWorksheet(wb.getWorksheet(name) ? `${name} ${ri + 1}` : name);
      const width = Math.max(...rep.tables.map((t) => t.headers.length), 2);

      ws.mergeCells(1, 1, 1, width);
      ws.getCell(1, 1).value = rep.heading;
      ws.getCell(1, 1).font = { name: 'Arial', size: 13, bold: true };
      ws.getCell(1, 1).alignment = { horizontal: 'center' };

      rep.tables.forEach((t) => {
        ws.addRow([]);
        ws.addRow([t.title]).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1F3A5F' } };
        if (typeof t.note === 'string' && t.note) {
          ws.addRow([t.note]).font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF5D6B7E' } };
        }
        const alertCols = Array.isArray(t.alertCols) ? t.alertCols : [];
        // A non-zero count in an alert column is a case to explain — red, as on the page.
        const markAlerts = (row, cells) => alertCols.forEach((ci) => {
          if (leadingCount(cells[ci]) > 0) row.getCell(ci + 1).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFC8462F' } };
        });
        const styleHead = (row) => {
          row.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
          row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          for (let ci = 1; ci <= t.headers.length; ci++) {
            row.getCell(ci).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
          }
        };
        const lay = headLayout(t);
        if (lay) {
          const hrows = [];
          for (let r = 0; r < lay.rows; r++) { hrows.push(ws.addRow([])); styleHead(hrows[r]); }
          lay.cells.forEach((c) => {
            const r0 = hrows[c.r].number;
            hrows[c.r].getCell(c.c + 1).value = c.label;
            if (c.rs > 1 || c.cs > 1) ws.mergeCells(r0, c.c + 1, r0 + c.rs - 1, c.c + c.cs);
          });
        } else {
          styleHead(ws.addRow(t.headers));
        }
        if (t.rows.length === 0) {
          ws.addRow([t.emptyText || 'None.']).font = { name: 'Arial', size: 10, italic: true };
        }
        t.rows.forEach((r) => { const row = ws.addRow(r); row.font = { name: 'Arial', size: 10 }; markAlerts(row, r); });
        if (Array.isArray(t.total)) {
          const tot = ws.addRow(t.total);
          tot.font = { name: 'Arial', bold: true };
          markAlerts(tot, t.total);
          tot.eachCell({ includeEmpty: true }, (c, n) => {
            if (n <= t.headers.length) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2F7' } };
          });
        }
      });

      for (let i = 1; i <= width; i++) ws.getColumn(i).width = 18;
      ws.addRow([]);
      // Generated today, about `date` — the two differ here, unlike the due list.
      ws.addRow([REPORT_FOOTER(istTodayISO())]).font = { name: 'Arial', size: 8, italic: true, color: { argb: 'FF5D6B7E' } };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${dailyFileName(date, reports, 'xlsx')}"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    if (!res.headersSent) res.status(400).json({ error: err.message || 'Export failed.' });
  }
});

// "24" or "24 (2:22)" -> 24; anything else -> null. Keep in step with isCount in daily.js.
function leadingCount(v) {
  const m = String(v == null ? '' : v).match(/^(\d+)(\s*\(.*\))?$/);
  return m ? Number(m[1]) : null;
}

// Table sizes in points. The one-view position export draws compact (POS_SIZE).
const DAILY_SIZE = { headH: 28, rowH: 16, bandH: 16, font: 8.5, headFont: 8, titleFont: 10, titleH: 34, gap: 12 };
const POS_SIZE = { headH: 20, rowH: 9.8, bandH: 10, font: 6.8, headFont: 6.3, titleFont: 7.5, titleH: 12, gap: 5, noNote: true };

// Title + note + header + rows + total, in points. Keep in step with drawDailyTable.
function dailyTableHeight(t, z = DAILY_SIZE) {
  const lay = headLayout(t);
  const title = t.title ? z.titleH : (z === DAILY_SIZE ? z.titleH : 2);
  // A note the one view prints anyway (noteOnSheet): about two small lines.
  const note = z.noNote && t.noteOnSheet && t.note ? z.rowH * 2 : 0;
  return title + note + z.headH + (lay ? z.bandH * (lay.rows - 1) : 0) + z.rowH * (Math.max(t.rows.length, 1) + (Array.isArray(t.total) ? 1 : 0)) + z.gap;
}

// Draw one generic table at doc.y. Text columns are left-aligned and wider; counts centred.
function drawDailyTable(doc, t, { x, width, usableBottom, size = DAILY_SIZE }) {
  const z = size;
  const n = t.headers.length;
  const isText = t.headers.map((_, i) =>
    t.rows.length > 0 && t.rows.every((r) => leadingCount(r[i]) === null));
  // Text columns get room by their longest entry (1.6 .. 4 times a count column).
  const longest = (i) => Math.max(...t.rows.map((r) => String(r[i] == null ? '' : r[i]).length), 1);
  // A mixed column (Kiosk "Lobby Detail": 61 / "CSTS, DR, KYNS…") is sized by its text too.
  const weights = isText.map((tx, i) => Math.min(4, Math.max(tx ? 1.6 : 1, longest(i) / 8)));
  const wSum = weights.reduce((a, b) => a + b, 0);
  const colW = weights.map((w) => (width * w) / wSum);
  const { headH, rowH } = z;

  // Keep a table whole: if it will not fit in what is left of this page but would fit
  // on a fresh one, start it there. Longer tables flow on, repeating their header.
  const fullH = dailyTableHeight(t, z);
  const pageH = usableBottom - doc.page.margins.top;
  const room = usableBottom - doc.y;
  if ((fullH > room && fullH <= pageH) || headH + rowH * 2 + 20 > room) doc.addPage();
  if (t.title) doc.font('Helvetica-Bold').fontSize(z.titleFont).fillColor('#1F3A5F').text(t.title, x, doc.y);
  if (typeof t.note === 'string' && t.note && (!z.noNote || t.noteOnSheet)) {
    doc.font('Helvetica-Oblique').fontSize(z.noNote ? z.font : 8).fillColor('#5D6B7E').text(t.note, x, doc.y + 1, { width });
  }
  doc.fillColor('#000');
  if (t.title || z === DAILY_SIZE) doc.moveDown(0.25); else doc.y += 2;
  let y = doc.y;
  const alertCols = Array.isArray(t.alertCols) ? t.alertCols : [];

  const lay = headLayout(t);
  const bandH = z.bandH;            // each group level; the last row is headH tall
  const colX = colW.reduce((a, w, i) => { a.push(a[i] + w); return a; }, [x]);
  const headCell = (cx, cy, w, h, label) => {
    doc.rect(cx, cy, w, h).fillAndStroke('#1F3A5F', '#FFFFFF');
    doc.font('Helvetica-Bold').fontSize(z.headFont).fillColor('#FFFFFF')
      .text(String(label), cx + 2, cy + 2, { width: w - 4, height: h - 3, align: 'center' });
  };
  const drawHead = () => {
    if (lay) {
      // Group bands on top; a cell reaching the last row also takes its taller height.
      const last = lay.rows - 1;
      const rowY = (r) => y + bandH * r;
      lay.cells.forEach((c) => {
        const end = c.r + c.rs - 1;
        const h = bandH * (Math.min(end, last - 1) - c.r + 1) * (c.r < last ? 1 : 0) + (end === last ? headH : 0);
        headCell(colX[c.c], rowY(c.r), colX[c.c + c.cs] - colX[c.c], h, c.label);
      });
      doc.fillColor('#000');
      y += bandH * last + headH;
      return;
    }
    let cx = x;
    t.headers.forEach((h, i) => {
      doc.rect(cx, y, colW[i], headH).fillAndStroke('#1F3A5F', '#FFFFFF');
      doc.font('Helvetica-Bold').fontSize(z.headFont).fillColor('#FFFFFF')
        .text(String(h), cx + 2, y + 3, { width: colW[i] - 4, height: headH - 4, align: 'center' });
      cx += colW[i];
    });
    doc.fillColor('#000');
    y += headH;
  };
  const drawRow = (cells, o = {}) => {
    if (y + rowH > usableBottom) { doc.addPage(); y = doc.page.margins.top; drawHead(); }
    let cx = x;
    for (let i = 0; i < n; i++) {
      if (o.fill) doc.rect(cx, y, colW[i], rowH).fillAndStroke(o.fill, '#D0D5DD');
      else doc.rect(cx, y, colW[i], rowH).stroke('#D0D5DD');
      const alert = alertCols.includes(i) && leadingCount(cells[i]) > 0;
      doc.font(o.bold || alert ? 'Helvetica-Bold' : 'Helvetica').fontSize(z.font).fillColor(alert ? '#C8462F' : '#000')
        .text(String(cells[i] == null ? '' : cells[i]), cx + 3, y + (rowH - z.font) / 2,
          { width: colW[i] - 6, height: rowH - 2, align: isText[i] ? 'left' : 'center', ellipsis: true, lineBreak: false });
      cx += colW[i];
    }
    y += rowH;
  };

  drawHead();
  if (t.rows.length === 0) {
    doc.rect(x, y, width, rowH).stroke('#D0D5DD');
    doc.font('Helvetica-Oblique').fontSize(z.font).fillColor('#5D6B7E')
      .text(t.emptyText || 'None.', x + 3, y + (rowH - z.font) / 2, { width: width - 6, lineBreak: false });
    doc.fillColor('#000');
    y += rowH;
  }
  t.rows.forEach((r) => drawRow(r));
  if (Array.isArray(t.total)) drawRow(t.total, { bold: true, fill: '#EEF2F7' });
  doc.y = y + z.gap;
}

router.post('/daily/export/pdf', (req, res) => {
  try {
    const { date, reports } = readDailyBody(req);
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${dailyFileName(date, reports, 'pdf')}"`);
    doc.pipe(res);

    const x = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const usableBottom = doc.page.height - doc.page.margins.bottom;

    doc.font('Helvetica-Bold').fontSize(14).text(DAILY_TITLE(date), { align: 'center' });
    doc.moveDown(0.6);

    reports.forEach((rep) => {
      // Never leave a report heading stranded: it travels with its first table.
      const firstH = 30 + (rep.tables[0] ? dailyTableHeight(rep.tables[0]) : 60);
      const pageH = usableBottom - doc.page.margins.top;
      if (doc.y + Math.min(firstH, pageH) > usableBottom) doc.addPage();
      doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#000').text(rep.heading, x, doc.y);
      doc.moveTo(x, doc.y + 2).lineTo(x + width, doc.y + 2).stroke('#1F3A5F');
      doc.moveDown(0.5);
      rep.tables.forEach((t) => drawDailyTable(doc, t, { x, width, usableBottom }));
    });

    drawReportFooter(doc, x, istTodayISO(), usableBottom);
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(400).json({ error: err.message || 'Export failed.' });
  }
});

// ---- Position (one view): the whole day as the officers receive it ----
// Blocks in left/right pairs on A4 portrait, per lib/cmsReports/position.js.
const position = require('../lib/cmsReports/position');
const POSITION_TITLE = (date) => `CSMT DIVISION CMS POSITION ${position.slashDate(date)}`;

function readPositionBody(req) {
  const { date, reports } = readDailyBody(req);
  return { date, pages: position.layout(reports, cmsReports.catalogue()) };
}

router.post('/daily/export/position/pdf', (req, res) => {
  try {
    const { date, pages } = readPositionBody(req);
    const doc = new PDFDocument({ size: 'A4', margin: 24 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CMS_position_${date}.pdf"`);
    doc.pipe(res);

    const z = POS_SIZE;
    const left = doc.page.margins.left;
    const fullW = doc.page.width - left - doc.page.margins.right;
    const gutter = 10;
    const halfW = (fullW - gutter) / 2;
    const usableBottom = doc.page.height - doc.page.margins.bottom - 12;   // room for the footer
    const blockH = (b) => 14 + (b.missing ? z.rowH + z.gap : b.tables.reduce((h, t) => h + dailyTableHeight(t, z), 0));
    const sideH = (bs) => bs.reduce((h, b) => h + blockH(b), 0);

    const pageHead = () => {
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#000')
        .text(POSITION_TITLE(date), left, doc.page.margins.top, { width: fullW, align: 'center' });
      doc.y += 4;
    };
    const drawBlock = (b, x, width) => {
      const y0 = doc.y;
      doc.rect(x, y0, width, 12).fill(b.missing ? '#C8CDD5' : '#BFD3EA');
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1F3A5F')
        .text(b.heading, x + 3, y0 + 3, { width: width - 6, align: 'center', lineBreak: false, ellipsis: true });
      doc.fillColor('#000');
      doc.y = y0 + 14;
      if (b.missing) {
        doc.rect(x, doc.y, width, z.rowH).stroke('#D0D5DD');
        doc.font('Helvetica-Oblique').fontSize(z.font).fillColor('#C8462F')
          .text('Not uploaded', x + 3, doc.y + (z.rowH - z.font) / 2, { width: width - 6, lineBreak: false });
        doc.fillColor('#000');
        doc.y += z.rowH + z.gap;
        return;
      }
      b.tables.forEach((t) => drawDailyTable(doc, t, { x, width, usableBottom, size: z }));
    };

    pages.forEach((rows, pi) => {
      if (pi > 0) doc.addPage();
      pageHead();
      rows.forEach((row) => {
        const h = row.full ? blockH(row.full) : Math.max(sideH(row.left), sideH(row.right));
        if (doc.y + h > usableBottom) { doc.addPage(); pageHead(); }   // overflow: never split a row
        const y0 = doc.y;
        if (row.full) { drawBlock(row.full, left, fullW); return; }
        row.left.forEach((b) => drawBlock(b, left, halfW));
        const yl = doc.y;
        doc.y = y0;
        row.right.forEach((b) => drawBlock(b, left + halfW + gutter, halfW));
        doc.y = Math.max(yl, doc.y);
      });
    });

    doc.font('Helvetica-Oblique').fontSize(6.5).fillColor('#5D6B7E')
      .text(REPORT_FOOTER(istTodayISO()), left, Math.min(doc.y + 4, usableBottom + 2), { lineBreak: false });
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(400).json({ error: err.message || 'Export failed.' });
  }
});

// The same layout on ONE Excel sheet: left blocks from column A, right blocks after a
// gap column, full-width blocks from A; a page break between the two pages, A4
// portrait fit to one page wide, so it prints as the PDF does.
router.post('/daily/export/position/xlsx', async (req, res) => {
  try {
    const { date, pages } = readPositionBody(req);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('CMS Position', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
        margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 } },
    });
    const widest = (side) => Math.max(1, ...pages.flat().filter((r) => !r.full)
      .flatMap((r) => r[side]).flatMap((b) => b.tables.map((t) => t.headers.length)));
    const L = widest('left');
    const R0 = L + 2;                                   // right side's first column (1-based)
    const GAP = L + 1;                                  // narrow column between the sides
    // Full-width tables step over GAP, so they take one column more than they have.
    const lastCol = Math.max(R0 + widest('right') - 1, ...pages.flat().filter((r) => r.full)
      .flatMap((r) => r.full.tables.map((t) => t.headers.length + (t.headers.length > L ? 1 : 0))));

    const thin = { style: 'thin', color: { argb: 'FFD0D5DD' } };
    const box = { top: thin, left: thin, bottom: thin, right: thin };
    const cell = (r, c) => ws.getRow(r).getCell(c);
    const navy = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };

    // One table at (row, col); returns the next free row. skip = a column to step over.
    const putTable = (row, col0, t, skip = 0) => {
      const at = (i) => col0 + i + (skip && col0 + i >= skip ? 1 : 0);
      if (t.title) { const c = cell(row, col0); c.value = t.title; c.font = { name: 'Arial', size: 8, bold: true, color: { argb: 'FF1F3A5F' } }; row++; }
      if (t.noteOnSheet && t.note) {
        // Across the table's own columns, wrapped — never spilling into the other side.
        const c = cell(row, col0);
        c.value = t.note;
        c.font = { name: 'Arial', size: 7, italic: true, color: { argb: 'FF5D6B7E' } };
        c.alignment = { wrapText: true, vertical: 'top' };
        ws.mergeCells(row, col0, row, at(t.headers.length - 1));
        ws.getRow(row).height = 30;
        row++;
      }
      const lay = headLayout(t);
      const hRows = lay ? lay.rows : 1;
      for (let r = 0; r < hRows; r++) for (let i = 0; i < t.headers.length; i++) {
        const c = cell(row + r, at(i));
        c.fill = navy; c.border = box;
        c.font = { name: 'Arial', size: 8, bold: true, color: { argb: 'FFFFFFFF' } };
        c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
      if (lay) {
        lay.cells.forEach((h) => {
          cell(row + h.r, at(h.c)).value = h.label;
          if (h.rs > 1 || h.cs > 1) ws.mergeCells(row + h.r, at(h.c), row + h.r + h.rs - 1, at(h.c + h.cs - 1));
        });
      } else t.headers.forEach((h, i) => { cell(row, at(i)).value = h; });
      ws.getRow(row + hRows - 1).height = 30;
      row += hRows;
      const alertCols = Array.isArray(t.alertCols) ? t.alertCols : [];
      const body = [...t.rows.map((r) => ({ r })), ...(Array.isArray(t.total) ? [{ r: t.total, total: true }] : [])];
      if (t.rows.length === 0) body.unshift({ r: [t.emptyText || 'None.'], empty: true });
      body.forEach(({ r, total, empty }) => {
        for (let i = 0; i < t.headers.length; i++) {
          const c = cell(row, at(i));
          if (!empty || i === 0) c.value = r[i] == null ? '' : r[i];
          c.border = box;
          c.alignment = { horizontal: i < 2 && typeof r[i] === 'string' ? 'left' : 'center' };
          const alert = alertCols.includes(i) && leadingCount(r[i]) > 0;
          c.font = { name: 'Arial', size: 8, bold: !!total || alert, italic: !!empty, color: alert ? { argb: 'FFC8462F' } : undefined };
          if (total) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2F7' } };
        }
        row++;
      });
      return row + 1;
    };
    // A block: its heading bar across `width` columns, then its tables.
    const putBlock = (row, col, width, b, skip = 0) => {
      ws.mergeCells(row, col, row, col + width - 1);
      const h = cell(row, col);
      h.value = b.heading;
      h.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1F3A5F' } };
      h.alignment = { horizontal: 'center' };
      h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: b.missing ? 'FFC8CDD5' : 'FFBFD3EA' } };
      row++;
      if (b.missing) {
        const c = cell(row, col); c.value = 'Not uploaded';
        c.font = { name: 'Arial', size: 8, italic: true, color: { argb: 'FFC8462F' } };
        return row + 2;
      }
      b.tables.forEach((t) => { row = putTable(row, col, t, t.headers.length > L ? skip : 0); });
      return row;
    };

    let row = 1;
    pages.forEach((rows, pi) => {
      if (pi > 0) ws.getRow(row - 1).addPageBreak();
      ws.mergeCells(row, 1, row, lastCol);
      const t = cell(row, 1);
      t.value = POSITION_TITLE(date);
      t.font = { name: 'Arial', size: 12, bold: true };
      t.alignment = { horizontal: 'center' };
      row += 2;
      rows.forEach((r) => {
        if (r.full) { row = putBlock(row, 1, lastCol, r.full, GAP); return; }
        let yl = row; let yr = row;
        r.left.forEach((b) => { yl = putBlock(yl, 1, L, b); });
        r.right.forEach((b) => { yr = putBlock(yr, R0, lastCol - R0 + 1, b); });
        row = Math.max(yl, yr);
      });
      row += 1;
    });
    // Width by content: the longest value, or the longest WORD of a header (headers wrap).
    const need = new Array(lastCol + 1).fill(6);
    ws.eachRow((r) => r.eachCell((c, n) => {
      if (c.isMerged) return;                    // headings / group bands span several columns
      const v = String(c.value == null ? '' : c.value);
      const len = c.fill === navy ? Math.max(...v.split(/\s+/).map((w) => w.length)) : v.length;
      need[n] = Math.max(need[n], len + 2);
    }));
    for (let i = 1; i <= lastCol; i++) ws.getColumn(i).width = i === GAP ? 2 : Math.min(need[i], 40);
    // After the widths: the footer line may run across columns.
    cell(row, 1).value = REPORT_FOOTER(istTodayISO());
    cell(row, 1).font = { name: 'Arial', size: 7, italic: true, color: { argb: 'FF5D6B7E' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="CMS_position_${date}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    if (!res.headersSent) res.status(400).json({ error: err.message || 'Export failed.' });
  }
});

module.exports = router;
