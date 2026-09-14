// lib/ghatSpm/report.js — A4 trip report for the Ghat SPM module (pdfkit).
// The page sends the analysed numbers and the charts as PNG data URLs; this
// only lays them out. Page 1: header + tables. Page 2: charts. Page 3: halts.
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const LOGO_PATH = path.join(__dirname, '..', '..', 'public', 'img', 'railway-logo.png');

const M = 36;                    // margin
const W = 595.28 - 2 * M;        // usable width (A4 portrait)
const C = { text: '#111', dim: '#555', line: '#bbb', head: '#e8eef7', accent: '#1d4ed8', red: '#b91c1c', green: '#15803d', amber: '#b45309' };

function png(dataUrl) { const m = /^data:image\/png;base64,(.+)$/.exec(dataUrl || ''); return m ? Buffer.from(m[1], 'base64') : null; }

function buildTripReport(d, out) {
  const doc = new PDFDocument({ size: 'A4', margin: M, info: { Title: 'Ghat SPM report ' + (d.header.train || '') + ' ' + (d.header.date || ''), Author: 'CRTMS BB Division' } });
  doc.pipe(out);
  const h = d.header, st = d.stats;

  // ---------- helpers ----------
  const y0 = () => doc.y;
  function heading(t) { doc.moveDown(0.4); doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.accent).text(t); doc.moveTo(M, doc.y + 1).lineTo(M + W, doc.y + 1).strokeColor(C.line).lineWidth(0.5).stroke(); doc.moveDown(0.3); doc.fillColor(C.text); }
  function kv(pairs, cols) {
    cols = cols || 4; const cw = W / cols; const x0 = M; let y = doc.y;
    pairs.forEach((p, i) => {
      const x = x0 + (i % cols) * cw;
      if (i && i % cols === 0) y += 22;
      doc.font('Helvetica').fontSize(7).fillColor(C.dim).text(p[0], x, y, { width: cw - 6, lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.text).text(String(p[1] == null ? '-' : p[1]), x, y + 9, { width: cw - 6, lineBreak: false, ellipsis: true });
    });
    doc.y = y + 24; doc.x = M;
  }
  function table(cols, rows, opts) {
    opts = opts || {}; const widths = opts.widths || cols.map(() => W / cols.length);
    const rowH = opts.rowH || 13, fs = opts.fontSize || 7.5;
    const clean = v => String(v == null ? '' : v).replace(/\u2192/g, '-').replace(/\u2013/g, '-');   // Helvetica has no arrow / en dash
    const drawHead = () => {
      const top = doc.y; let x = M; doc.rect(M, top, W, rowH).fill(C.head);
      cols.forEach((c, i) => { doc.font('Helvetica-Bold').fontSize(fs).fillColor(C.text).text(clean(c), x + 3, top + 3, { width: widths[i] - 6, lineBreak: false }); x += widths[i]; });
      doc.y = top + rowH;
    };
    drawHead();
    rows.forEach((r) => {
      if (doc.y + rowH > doc.page.height - doc.page.margins.bottom) { doc.addPage(); drawHead(); }
      const top = doc.y; let x = M;
      const style = (opts.rowStyle && opts.rowStyle(r)) || {};
      if (style.fill) doc.rect(M, top, W, rowH).fill(style.fill);
      r.forEach((cell, i) => {
        const col = (style.color && style.color[i]) || C.text;
        doc.font(style.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fs).fillColor(col).text(clean(cell), x + 3, top + 3, { width: widths[i] - 6, lineBreak: false, ellipsis: true });
        x += widths[i];
      });
      doc.moveTo(M, top + rowH).lineTo(M + W, top + rowH).strokeColor(C.line).lineWidth(0.3).stroke();
      doc.y = top + rowH;
    });
    doc.x = M; doc.moveDown(0.5);
  }
  function footer(page) {
    // Inside the bottom margin: drop the margin for the call or pdfkit adds a page
    const saveY = doc.y, mb = doc.page.margins.bottom; doc.page.margins.bottom = 0;
    doc.font('Helvetica').fontSize(7).fillColor(C.dim)
      .text(`Ghat SPM · ${h.section || ''} · ${h.train || 'LE'} · ${h.date || ''} · loco ${h.loco || ''} · generated ${new Date().toLocaleString('en-IN', { hour12: false })} by ${h.generatedBy || ''} · page ${page}`, M, doc.page.height - 26, { width: W, align: 'center', lineBreak: false });
    doc.page.margins.bottom = mb; doc.y = saveY;
  }

  // ---------- page 1: header with CR logo ----------
  const top = doc.y;
  if (fs.existsSync(LOGO_PATH)) { try { doc.image(LOGO_PATH, M, top, { height: 44 }); } catch (e) { /* logo optional */ } }
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.dim).text('CENTRAL RAILWAY · MUMBAI DIVISION' + (h.office ? ' · ' + h.office : ''), M + 54, top + 2, { width: W - 54 });
  doc.font('Helvetica-Bold').fontSize(14).fillColor(C.text).text('Banker SPM Analysis — ' + (h.section === 'KJT-LNL' ? 'Lonavala (SE) Ghat' : 'Igatpuri (NE) Ghat'), M + 54, top + 14, { width: W - 54 });
  doc.font('Helvetica').fontSize(8).fillColor(C.dim).text('Speed Performance Monitoring of banker working · CRTMS', M + 54, top + 32, { width: W - 54 });
  doc.y = top + 52; doc.x = M;
  doc.moveTo(M, doc.y).lineTo(M + W, doc.y).strokeColor(C.accent).lineWidth(1).stroke(); doc.y += 6;

  // Header grid: 3 columns so long values (train name, driver) have room
  const trainLine = (h.train || 'LE') + (h.trainName ? '  ' + h.trainName : '');
  kv([['Date of working', h.date], ['Train', trainLine], ['Type / load', (h.trainType || '-') + (h.load ? ' · ' + h.load : '')],
      ['LP-Ghat', h.driverName || h.driverCms || '-'], ['CMS ID', h.driverCms || '-'], ['Nominated CLI', h.cli || '-'],
      ['Banker loco', h.loco], ['Direction / route', (h.direction || '') + ' · ' + (h.route || '')], ['Analysed by', h.analysedBy || h.generatedBy || '-'],
      ['Departure (recorder)', st.depTime + (h.depEntered ? '  (entered ' + h.depEntered + ')' : '')], ['Arrival (recorder)', st.arrTime + (h.arrEntered ? '  (entered ' + h.arrEntered + ')' : '')], ['Recorder / file', (h.spm || 'Medha') + (h.fileName ? ' · ' + h.fileName : '')]], 3);
  heading('Trip summary');
  kv([['Distance', st.totalDist + ' km'], ['Running time', st.runningTime], ['Max speed', st.maxSpeed + ' kmph'], ['Average speed', st.avgSpeed + ' kmph'], ['Halts', st.halts], ['Stood at halts', st.haltTime || '-'], ['Stood after arrival', st.stoodAfter || '-'], ['Max traction', (st.maxAmps != null ? st.maxAmps + ' A' : '-')]]);
  if (d.warnings && d.warnings.length) { doc.font('Helvetica-Bold').fontSize(8).fillColor(C.amber).text('⚠ ' + d.warnings.join('  ⚠ ')); doc.fillColor(C.text); }

  if (d.stations && d.stations.length) {
    heading('Station-wise readings');
    table(['Place', 'Km', 'Time', 'Speed', 'OHE kV', 'Amps'], d.stations.map(r => [r.name + (r.note ? ' (' + r.note + ')' : ''), r.km, r.time, r.speed, r.ohe, r.amps]), { widths: [W * 0.30, W * 0.12, W * 0.16, W * 0.14, W * 0.14, W * 0.14] });
  }
  if (d.sections && d.sections.length) {
    heading('Sectional running time' + (d.wttNote ? ' — ' + d.wttNote : ''));
    table(['Section', 'From', 'To', 'Elapsed', 'Stood (halts)', 'Moving', 'WTT', 'Diff'], d.sections.map(r => [r.section, r.from, r.to, r.elapsed, r.stood, r.moving, r.wtt, r.diff]),
      { widths: [W * 0.20, W * 0.11, W * 0.11, W * 0.11, W * 0.15, W * 0.11, W * 0.10, W * 0.11], rowStyle: r => r[0].indexOf('→') !== -1 && r === d.sections[d.sections.length - 1].raw ? { bold: true } : (String(r[7]).startsWith('+') ? { color: { 7: C.red } } : {}) });
  }
  if (d.compliance && d.compliance.length) {
    heading('Speed restriction compliance (PSR / MPS' + (d.tsr && d.tsr.length ? ' / TSR' : '') + ')');
    table(['Zone (km)', 'Section', 'Limit', 'Max', 'Excess', 'Over', 'Verdict'], d.compliance.map(r => [r.zone, r.section, r.limit, r.max, r.excess, r.over, r.verdict]),
      { widths: [W * 0.17, W * 0.16, W * 0.22, W * 0.09, W * 0.09, W * 0.15, W * 0.12], rowStyle: r => r[6] === 'over' ? { fill: '#fee2e2', color: { 6: C.red } } : (r[6] === 'marginal' ? { color: { 6: C.amber } } : {}) });
  }
  if (d.tsr && d.tsr.length) {
    heading('Caution orders applied (TSR)');
    table(['Caution', 'Line', 'Masts', 'Trip km', 'Limit', 'Window', 'Reason'], d.tsr.map(r => [r.id, r.line, r.mast, r.km, r.limit, r.window, r.reason]), { widths: [W * 0.14, W * 0.10, W * 0.16, W * 0.13, W * 0.11, W * 0.12, W * 0.24] });
  }
  footer(1);

  // ---------- page 2: charts ----------
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C.text).text('Charts — ' + (h.train || 'LE') + ' · ' + (h.direction || '') + ' · ' + (h.date || ''));
  const charts = d.charts || {};
  const order = [['profile', 'Speed vs distance with PSR / MPS band, signals and stations'], ['ohe', 'Speed, OHE voltage and traction current' + (h.direction === 'DN' ? ' (with 15/10 board and GR-0)' : '')], ['speedTime', 'Speed vs time']];
  order.forEach(([k, title]) => {
    const buf = png(charts[k]); if (!buf) return;
    if (doc.y + 190 > doc.page.height - doc.page.margins.bottom) doc.addPage();
    doc.moveDown(0.4); doc.font('Helvetica').fontSize(8).fillColor(C.dim).text(title); doc.moveDown(0.2);
    doc.image(buf, M, doc.y, { fit: [W, 200], align: 'center' }); doc.y += 204;
  });
  footer(2);

  // ---------- page 3: halts ----------
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C.text).text('Halts and driving — ' + (h.train || 'LE') + ' · ' + (h.direction || '') + ' · ' + (h.date || ''));
  if (h.direction === 'DN' && d.attach) {
    heading('Attaching halts at KSRA (before departure)');
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.text).text(d.attach.line || ''); doc.font('Helvetica').fontSize(8).fillColor(C.dim).text(d.attach.summary || ''); doc.moveDown(0.3); doc.fillColor(C.text);
    if (d.attach.rows && d.attach.rows.length) table(['Stop time', 'In rear of train', 'Stood', 'Creep to next', 'Creep max kmph'], d.attach.rows.map(r => [r.time, r.rear, r.stood, r.creep, r.creepMax]));
  }
  if (h.direction === 'DN' && d.depart && d.depart.cols) {
    heading('Departure notch-up profile (first 200 m from KSRA; 45–70 m = 2–3 coach lengths)');
    const cols = ['After departure'].concat(d.depart.cols.map(c => c === 0 ? 'Start' : c + ' m'));
    const wcol = [W * 0.16].concat(d.depart.cols.map(() => (W * 0.84) / d.depart.cols.length));
    table(cols, [['Amps (A)'].concat(d.depart.amps), ['Speed (kmph)'].concat(d.depart.speed), ['Time (s)'].concat(d.depart.secs)], { widths: wcol, fontSize: 7 });
  }
  heading('Halt analysis' + (h.direction === 'DN' ? ' — leading-driver / ghat-driver coordination' : ''));
  if (!d.halts || !d.halts.length) { doc.font('Helvetica').fontSize(9).fillColor(C.dim).text('No halts on this trip.'); doc.fillColor(C.text); }
  else {
    table(['#', 'Place', 'Time', 'Stood', 'Km', 'Profile'], d.halts.map(x => [x.num, x.place, x.time, x.stood, x.km, x.profile]), { widths: [W * 0.05, W * 0.38, W * 0.14, W * 0.17, W * 0.12, W * 0.14], rowStyle: r => r[5] === 'Abrupt' ? { color: { 5: C.red } } : { color: { 5: C.green } } });
    d.halts.forEach(x => {
      if (!x.approach) return;
      if (doc.y + 60 > doc.page.height - doc.page.margins.bottom) doc.addPage();
      doc.font('Helvetica-Bold').fontSize(8).fillColor(C.text).text('Halt ' + x.num + ' — ' + x.place + ' — ' + x.time + ', stood ' + x.stood + ' (' + x.profile + ')');
      const cols = ['Before halt'].concat(x.approach.cols.map(c => c + ' m')).concat(['Halt']);
      const wcol = [W * 0.14].concat(x.approach.cols.map(() => (W * 0.78) / x.approach.cols.length)).concat([W * 0.08]);
      table(cols, [['Speed (kmph)'].concat(x.approach.speed).concat([0]), ['Amps (A)'].concat(x.approach.amps).concat(['-'])], { widths: wcol, fontSize: 7, rowH: 12 });
    });
    const dec = png(charts.decel);
    if (dec) { if (doc.y + 190 > doc.page.height - doc.page.margins.bottom) doc.addPage(); doc.font('Helvetica').fontSize(8).fillColor(C.dim).text('Deceleration profile — speed over the last 1200 m before each halt'); doc.image(dec, M, doc.y + 2, { fit: [W, 190] }); doc.y += 194; }
  }
  footer(3);
  doc.end();
}

module.exports = { buildTripReport };
