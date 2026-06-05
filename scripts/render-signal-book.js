/**
 * Render a beat's signal book as a self-contained HTML file.
 *
 *   node scripts/render-signal-book.js <BEAT_CODE> [--out <path>]
 *
 * Example:
 *   node scripts/render-signal-book.js CSMT_SUB_ML
 *   open signal-book-CSMT_SUB_ML.html        # then Cmd+P → Save as PDF
 *
 * The script reads beat → div_signal_beat_sections → div_signal_book_sections
 * → div_signal_book_rows and writes an HTML page styled for A4 print.
 * Two-column flow per section, page-break between sections, colours match
 * the legend (purple station headers, red text for RHS signals, etc.).
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function getConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'bbtro'
  });
}

async function loadBook(beatCode, providedConn) {
  // If a connection is supplied (e.g. from the Express pool) use it and let
  // the caller manage its lifecycle. Otherwise spin up a one-shot connection
  // for CLI usage.
  const conn = providedConn || await getConnection();
  const ownConn = !providedConn;
  try {
    const [beats] = await conn.execute(
      `SELECT id, beat_code, beat_name, office_code, beat_category
         FROM div_signal_beats
        WHERE beat_code = ?`,
      [beatCode]
    );
    if (beats.length === 0) {
      throw new Error(`Beat not found: ${beatCode}`);
    }
    const beat = beats[0];

    const [sections] = await conn.execute(
      `SELECT s.id, s.section_code, s.section_title, s.direction, s.line,
              bs.display_order, bs.start_page_no, bs.end_page_no
         FROM div_signal_beat_sections bs
         JOIN div_signal_book_sections s ON s.id = bs.section_id
        WHERE bs.beat_id = ? AND bs.is_active = 1 AND s.is_active = 1
        ORDER BY bs.display_order`,
      [beat.id]
    );

    for (const section of sections) {
      const [rows] = await conn.execute(
        `SELECT row_order, row_type, signal_id, psr_id, neutral_section_id,
                display_signal_no, display_location, display_description,
                speed_kmph, km_range_text,
                station_code, station_name, station_km_text,
                highlight_color, text_color, icon_type, remarks
           FROM div_signal_book_rows
          WHERE book_section_id = ? AND is_active = 1
          ORDER BY row_order`,
        [section.id]
      );
      section.rows = rows;
    }

    return { beat, sections };
  } finally {
    if (ownConn) await conn.end();
  }
}

function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function descToHtml(text) {
  if (!text) return '';
  // Preserve line breaks; ";" separator from RI: descriptions becomes a soft break.
  return esc(text).replace(/\n/g, '<br>');
}

function renderRow(row) {
  const textCls = row.text_color === 'RED'  ? 'red'
                : row.text_color === 'BLUE' ? 'blue' : '';
  const iconBadge = row.icon_type && row.icon_type !== 'NONE'
    ? `<span class="badge badge-${row.icon_type.toLowerCase()}">${labelForIcon(row.icon_type)}</span>`
    : '';

  switch (row.row_type) {
    case 'STATION_HEADER':
      return `<div class="row station-header">${esc(row.display_description || stationLine(row))}</div>`;

    case 'PSR':
      return `<div class="row psr">
        <div class="psr-speed">${row.speed_kmph ?? ''}${row.speed_kmph != null ? ' KMPH' : ''}</div>
        <div class="psr-range">${esc(row.km_range_text || row.display_description || '')}</div>
      </div>`;

    case 'NEUTRAL_SECTION':
      return `<div class="row ns">
        <div class="ns-label">N/S</div>
        <div class="ns-loc">${esc(row.display_location || row.display_description || '')}</div>
      </div>`;

    case 'BOARD':
      return `<div class="row board">
        <div class="board-label">${esc(row.display_signal_no || 'BOARD')}</div>
        <div class="board-loc">${esc(row.display_location || '')}</div>
      </div>`;

    case 'SECTION_HEADER':
      return `<div class="row section-sub-header">${esc(row.display_description || '')}</div>`;

    case 'TEXT_NOTE':
      return `<div class="row note">${esc(row.display_description || '')}</div>`;

    case 'BLANK':
      return `<div class="row blank">&nbsp;</div>`;

    case 'SIGNAL':
    default:
      return `<div class="row signal ${textCls}">
        <div class="cell signal-no">${esc(row.display_signal_no || '')}${iconBadge}</div>
        <div class="cell signal-loc">${esc(row.display_location || '')}</div>
        <div class="cell signal-desc">${descToHtml(row.display_description)}</div>
      </div>`;
  }
}

function labelForIcon(icon) {
  switch (icon) {
    case 'LEGEND_BOARD':  return '⚐';
    case 'PSR':           return 'PSR';
    case 'NEUTRAL_SECTION': return 'N/S';
    case 'GATE':          return 'G';
    case 'IBS':           return 'IBS';
    case 'CURVE_LEFT':    return '↶';
    case 'CURVE_RIGHT':   return '↷';
    case 'GRADIENT':      return '∠';
    default:              return '';
  }
}

function stationLine(row) {
  if (!row.station_name) return '';
  const km = row.station_km_text ? ` ${row.station_km_text}` : '';
  const code = row.station_code ? ` (${row.station_code})` : '';
  return `${row.station_name}${code}${km}`;
}

function renderHtml({ beat, sections }) {
  const sectionsHtml = sections.map((section) => {
    const rowsHtml = section.rows.map(renderRow).join('\n');
    return `
<section class="book-section">
  <h2 class="section-title">${esc(section.section_title)}</h2>
  <div class="section-table-header">
    <div class="cell hd-no">SIGNAL NO.</div>
    <div class="cell hd-loc">LOCATION</div>
    <div class="cell hd-desc">DESCRIPTION</div>
  </div>
  <div class="section-body">
${rowsHtml}
  </div>
</section>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Signal Book — ${esc(beat.beat_name)}</title>
<style>
  @page { size: A4 portrait; margin: 10mm 8mm 12mm 8mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 9.5pt;
    color: #111;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .toolbar {
    background: #1f2937; color: #fff;
    padding: 10px 16px; font-size: 12px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .toolbar button {
    background: #f59e0b; color: #111; border: none;
    padding: 6px 14px; font-weight: 600; cursor: pointer;
    border-radius: 4px;
  }
  @media print { .toolbar { display: none; } }

  .book-section {
    break-before: page;
    page-break-before: always;
  }
  .book-section:first-of-type {
    break-before: auto;
    page-break-before: auto;
  }

  .section-title {
    column-span: all;
    -webkit-column-span: all;
    background: #1e3a8a;
    color: #fff;
    text-align: center;
    font-size: 11pt;
    margin: 0 0 4px 0;
    padding: 5px 8px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .section-table-header {
    column-span: all;
    -webkit-column-span: all;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6mm;
    margin-bottom: 4px;
  }
  .section-table-header::before, .section-table-header::after {
    /* span header text across both columns: render the 3-col head twice */
  }
  .section-table-header .cell { font-weight: 600; font-size: 8.5pt; }
  .section-table-header { display: none; } /* simpler: skip extra header, columns repeat title only */

  .section-body {
    columns: 2;
    column-gap: 6mm;
    column-rule: 1px solid #d1d5db;
  }

  .row {
    break-inside: avoid;
    page-break-inside: avoid;
    border-bottom: 1px solid #e5e7eb;
    padding: 2px 0;
  }

  /* SIGNAL — 3 columns within a row */
  .row.signal {
    display: grid;
    grid-template-columns: 30% 28% 42%;
    gap: 4px;
    align-items: start;
  }
  .row.signal .signal-no  { font-weight: 700; font-family: "Courier New", monospace; }
  .row.signal .signal-loc { font-family: "Courier New", monospace; }
  .row.signal .signal-desc{ font-size: 8.5pt; color: #444; }
  .row.signal.red   .signal-no, .row.signal.red .signal-loc { color: #c2410c; }
  .row.signal.blue  .signal-no, .row.signal.blue .signal-loc { color: #1d4ed8; }

  /* STATION_HEADER — purple band, spans both signal columns of the row */
  .row.station-header {
    background: #6d28d9;
    color: #fff;
    font-weight: 700;
    text-align: center;
    padding: 3px 6px;
    margin: 4px 0;
    border-radius: 2px;
    font-size: 9pt;
    letter-spacing: 0.3px;
  }

  /* PSR — yellow band */
  .row.psr {
    background: #fef3c7;
    display: grid;
    grid-template-columns: 30% auto;
    gap: 4px;
    padding: 3px 6px;
    border-left: 4px solid #f59e0b;
    margin: 2px 0;
  }
  .row.psr .psr-speed { font-weight: 700; }

  /* NEUTRAL_SECTION — light grey w/ N/S badge */
  .row.ns {
    background: #f3f4f6;
    display: grid;
    grid-template-columns: 30% auto;
    gap: 4px;
    padding: 3px 6px;
    border-left: 4px solid #6b7280;
    margin: 2px 0;
  }
  .row.ns .ns-label { font-weight: 700; }

  .row.board {
    display: grid;
    grid-template-columns: 50% 50%;
    gap: 4px;
    padding: 2px 6px;
    font-style: italic;
    color: #374151;
  }

  .row.section-sub-header {
    background: #e5e7eb;
    font-weight: 700;
    padding: 3px 6px;
    margin: 4px 0;
    text-align: center;
  }

  .row.note  { font-style: italic; color: #6b7280; padding: 4px 6px; }
  .row.blank { border: none; padding: 4px 0; }

  .badge {
    display: inline-block;
    margin-left: 4px;
    padding: 0 4px;
    font-size: 7.5pt;
    background: #fde68a;
    color: #92400e;
    border-radius: 3px;
    font-weight: 600;
  }
  .badge-legend_board { background: #fde68a; }

  .cover {
    text-align: center;
    padding: 40mm 10mm 20mm 10mm;
  }
  .cover .title { font-size: 20pt; font-weight: 700; letter-spacing: 1px; }
  .cover .beat  { font-size: 16pt; margin-top: 8mm; color: #1e3a8a; }
  .cover .sub   { font-size: 11pt; margin-top: 4mm; color: #6b7280; }
</style>
</head>
<body>
  <div class="toolbar">
    <div><strong>${esc(beat.beat_name)}</strong> · ${sections.length} section${sections.length === 1 ? '' : 's'} · ${sections.reduce((n, s) => n + s.rows.length, 0)} rows</div>
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="cover">
    <div class="title">SIGNAL LOCATION GUIDE</div>
    <div class="beat">${esc(beat.beat_name)} BEAT</div>
    <div class="sub">BB Division · Mumbai · Auto-generated draft</div>
  </div>

  ${sectionsHtml}
</body>
</html>`;
}

module.exports = { loadBook, renderHtml };

// Allow running directly as a CLI script.
if (require.main === module) {
  const beatCode = process.argv[2];
  const outIdx = process.argv.indexOf('--out');
  const outPath = outIdx > -1 ? process.argv[outIdx + 1] : `signal-book-${beatCode}.html`;

  if (!beatCode) {
    console.error('Usage: node scripts/render-signal-book.js <BEAT_CODE> [--out <path>]');
    process.exit(1);
  }

  (async () => {
    const book = await loadBook(beatCode);

    if (book.sections.length === 0) {
      console.error(`Beat ${beatCode} has no sections bound yet. Insert rows in div_signal_beat_sections first.`);
      process.exit(1);
    }

    const html = renderHtml(book);
    fs.writeFileSync(outPath, html, 'utf8');

    const totalRows = book.sections.reduce((n, s) => n + s.rows.length, 0);
    console.log('Wrote:', path.resolve(outPath));
    console.log(`Beat   : ${book.beat.beat_name}`);
    console.log(`Sections: ${book.sections.length}`);
    console.log(`Rows    : ${totalRows}`);
    console.log('\nOpen with:');
    console.log(`  open ${outPath}`);
  })().catch((err) => {
    console.error('FAILED:', err.message);
    process.exit(1);
  });
}
