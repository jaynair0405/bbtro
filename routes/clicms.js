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
const multer = require('multer');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { parseCmsReport, PARAMETERS } = require('../lib/cmsReport');

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

// Shared validation for export requests
function readExportBody(req) {
  const { parameter, rows, generatedAtIST } = req.body || {};
  if (!PARAMETERS[parameter]) throw new Error('Invalid or missing parameter.');
  if (!Array.isArray(rows)) throw new Error('Missing rows.');
  return { parameter, rows, generatedAtIST: generatedAtIST || '' };
}

const EXPORT_HEADERS = ['S.No.', 'CLI ID', 'CLI NAME', 'CREW ID', 'NAME', 'DESIG.', 'CATEGORY', 'DONE DATE', 'DUE DATE', 'REMARKS'];

function rowToCells(r, parameter, idx) {
  const p = r.params && r.params[parameter] ? r.params[parameter] : { done: '', due: '' };
  return [idx + 1, r.cliId, r.cliName, r.crewId, r.name, r.desig, r.grade, p.done, p.due, r.remark || ''];
}

// ---- Designation × category summary (shared by both PDF exports) ----
const SUMMARY_CATS = ['A', 'B', 'C'];
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
    const { parameter, rows, generatedAtIST } = readExportBody(req);
    const meta = PARAMETERS[parameter];

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Due List');

    ws.mergeCells('A1', 'J1');
    ws.getCell('A1').value = `CMS Report — ${meta.label} Due List (overdue as on ${generatedAtIST})`;
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

    const widths = [7, 12, 22, 12, 26, 9, 10, 13, 13, 32];
    ws.columns.forEach((c, i) => { c.width = widths[i] || 12; });
    ws.views = [{ state: 'frozen', ySplit: 2 }];
    ws.autoFilter = { from: 'A2', to: 'J2' };

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
      `attachment; filename="CMS_${meta.key}_due_${generatedAtIST}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(400).json({ error: err.message || 'Export failed.' });
  }
});

// ---- PDF export (landscape A4, simple repeating-header table) ----
router.post('/export/pdf', (req, res) => {
  try {
    const { parameter, rows, generatedAtIST } = readExportBody(req);
    const meta = PARAMETERS[parameter];

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 28 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="CMS_${meta.key}_due_${generatedAtIST}.pdf"`);
    doc.pipe(res);

    const colW = [28, 54, 108, 52, 132, 42, 42, 64, 64, 130]; // 10 cols incl. Remarks; sums to 716, fits ~786 usable
    const startX = doc.page.margins.left;
    const usableBottom = doc.page.height - doc.page.margins.bottom;

    doc.font('Helvetica-Bold').fontSize(13)
      .text(`CMS Report — ${meta.label} Due List`, { align: 'center' });
    doc.font('Helvetica').fontSize(9)
      .text(`Overdue as on ${generatedAtIST}  ·  ${rows.length} staff`, { align: 'center' });
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
    const { parameter, generatedAtIST = '', cats, byDesig, totals, byCli } = req.body || {};
    if (!PARAMETERS[parameter]) throw new Error('Invalid or missing parameter.');
    if (!Array.isArray(cats) || !Array.isArray(byDesig) || !Array.isArray(byCli)) {
      throw new Error('Malformed summary payload.');
    }
    const meta = PARAMETERS[parameter];

    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="CMS_${meta.key}_summary_${generatedAtIST}.pdf"`);
    doc.pipe(res);

    const left = doc.page.margins.left;
    const fullW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const usableBottom = doc.page.height - doc.page.margins.bottom;

    doc.font('Helvetica-Bold').fontSize(14)
      .text(`CMS Report — ${meta.label} Due List`, { align: 'center' });
    doc.font('Helvetica').fontSize(10)
      .text(`Summary · overdue as on ${generatedAtIST} · ${(totals && totals.total) || 0} staff`,
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
      const title = `${cli.cliName || '—'}${cli.cliId ? ` (${cli.cliId})` : ''} — ${cli.total} overdue`;
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

module.exports = router;
