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
const cmsReports = require('../lib/cmsReports');

router.post('/daily/upload', upload.array('files', 20), (req, res) => {
  const files = req.files || [];
  if (files.length === 0) return res.status(400).json({ error: 'No files uploaded (field name must be "files").' });

  const reports = [];
  const rejected = [];
  files.forEach((f) => {
    try {
      const r = cmsReports.processFile(f.buffer);
      const dup = reports.find((x) => x.key === r.key);
      // Two files of one report are two different days — the file carries no date to tell which.
      if (dup) throw new Error(`Same report as "${dup.file}". Upload one day at a time.`);
      reports.push({ file: f.originalname, ...r });
    } catch (err) {
      rejected.push({ file: f.originalname, error: err.message || 'Could not read the file.' });
    }
  });
  reports.sort((a, b) => a.order - b.order);
  res.json({ catalogue: cmsReports.catalogue(), reports, rejected });
});

function readDailyBody(req) {
  const date = safeISO((req.body || {}).date);
  if (!date) throw new Error('Missing report date.');
  const reports = (req.body || {}).reports;
  if (!Array.isArray(reports) || reports.length === 0) throw new Error('Nothing to export.');
  reports.forEach((r) => {
    if (typeof r.label !== 'string' || !Array.isArray(r.tables)) throw new Error('Malformed report payload.');
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
      ws.getCell(1, 1).value = `${rep.label} — ${isoToDDMMYYYY(date)}`;
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
          if (Number(cells[ci]) > 0) row.getCell(ci + 1).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFC8462F' } };
        });
        const head = ws.addRow(t.headers);
        head.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
        head.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        head.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } }; });
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

// Title + note + header + rows + total, in points. Keep in step with headH/rowH below.
function dailyTableHeight(t) {
  return 34 + 28 + 16 * (Math.max(t.rows.length, 1) + (Array.isArray(t.total) ? 1 : 0));
}

// Draw one generic table at doc.y. Text columns are left-aligned and wider; counts centred.
function drawDailyTable(doc, t, { x, width, usableBottom }) {
  const n = t.headers.length;
  const isText = t.headers.map((_, i) =>
    t.rows.length > 0 && t.rows.every((r) => !/^\d+$/.test(String(r[i] == null ? '' : r[i]))));
  const weights = isText.map((tx) => (tx ? 1.6 : 1));
  const wSum = weights.reduce((a, b) => a + b, 0);
  const colW = weights.map((w) => (width * w) / wSum);
  const headH = 28;
  const rowH = 16;

  // Keep a table whole: if it will not fit in what is left of this page but would fit
  // on a fresh one, start it there. Longer tables flow on, repeating their header.
  const fullH = dailyTableHeight(t);
  const pageH = usableBottom - doc.page.margins.top;
  const room = usableBottom - doc.y;
  if ((fullH > room && fullH <= pageH) || headH + rowH * 2 + 20 > room) doc.addPage();
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#1F3A5F').text(t.title, x, doc.y);
  if (typeof t.note === 'string' && t.note) {
    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#5D6B7E').text(t.note, x, doc.y + 1, { width });
  }
  doc.fillColor('#000').moveDown(0.25);
  let y = doc.y;
  const alertCols = Array.isArray(t.alertCols) ? t.alertCols : [];

  const drawHead = () => {
    let cx = x;
    t.headers.forEach((h, i) => {
      doc.rect(cx, y, colW[i], headH).fillAndStroke('#1F3A5F', '#FFFFFF');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
        .text(String(h), cx + 3, y + 5, { width: colW[i] - 6, height: headH - 6, align: 'center' });
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
      const alert = alertCols.includes(i) && Number(cells[i]) > 0;
      doc.font(o.bold || alert ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).fillColor(alert ? '#C8462F' : '#000')
        .text(String(cells[i] == null ? '' : cells[i]), cx + 4, y + 4,
          { width: colW[i] - 8, height: rowH - 4, align: isText[i] ? 'left' : 'center', ellipsis: true });
      cx += colW[i];
    }
    y += rowH;
  };

  drawHead();
  if (t.rows.length === 0) {
    doc.rect(x, y, width, rowH).stroke('#D0D5DD');
    doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#5D6B7E')
      .text(t.emptyText || 'None.', x + 4, y + 4, { width: width - 8 });
    doc.fillColor('#000');
    y += rowH;
  }
  t.rows.forEach((r) => drawRow(r));
  if (Array.isArray(t.total)) drawRow(t.total, { bold: true, fill: '#EEF2F7' });
  doc.y = y + 12;
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
      doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#000').text(rep.label, x, doc.y);
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

module.exports = router;
