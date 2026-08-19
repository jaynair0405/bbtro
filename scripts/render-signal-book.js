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
const { parseRiSpec } = require('./ri-spec');

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
              bs.display_order, bs.display_group, bs.lead_in_note, bs.start_page_no, bs.end_page_no
         FROM div_signal_beat_sections bs
         JOIN div_signal_book_sections s ON s.id = bs.section_id
        WHERE bs.beat_id = ? AND bs.is_active = 1 AND s.is_active = 1
        ORDER BY bs.display_order`,
      [beat.id]
    );

    for (const section of sections) {
      const [rows] = await conn.execute(
        `SELECT r.row_order, r.row_type, r.signal_id, r.psr_id, r.neutral_section_id,
                r.display_signal_no, r.display_location, r.display_description,
                r.speed_kmph, r.km_range_text,
                r.station_code, r.station_name, r.station_km_text,
                r.highlight_color, r.text_color, r.icon_type, r.remarks,
                sg.ri_left_arms, sg.ri_right_arms, sg.route_indicator_notes,
                sg.is_rhs, sg.is_ext_rhs, sg.is_ext_lhs, sg.on_curve,
                sg.signal_type, sg.signal_function
           FROM div_signal_book_rows r
           LEFT JOIN div_signals sg ON sg.id = r.signal_id
          WHERE r.book_section_id = ? AND r.is_active = 1
          ORDER BY r.row_order`,
        [section.id]
      );
      section.rows = rows;
    }

    return { beat, sections };
  } finally {
    if (ownConn) await conn.end();
  }
}

// Approach-A "full route" view: assemble an ordered list of existing segment
// section_codes into ONE continuous section under a single route header. No data
// is duplicated — shared segments (e.g. the PNVL->DCC trunk) are simply referenced
// by every route that passes through them. All segments are forced into one
// display_group (= routeTitle) so renderHtml consolidates them into one block.
async function loadRoute(routeDef, providedConn) {
  const conn = providedConn || await getConnection();
  const ownConn = !providedConn;
  const routeTitle = routeDef.title;
  try {
    const sections = [];
    for (const rawSpec of routeDef.segments) {
      const spec = typeof rawSpec === 'string' ? { code: rawSpec } : rawSpec;
      // Standalone bridge signal: a route may reference a single div_signals row that
      // belongs to no shared segment (e.g. DCC S-5, the DW->PNVL diverging signal).
      if (spec.signal) {
        const [sigs] = await conn.execute(
          `SELECT id, signal_number, location_text, book_description, route_indicator_notes,
                  ri_left_arms, ri_right_arms, is_rhs, is_ext_rhs, is_ext_lhs,
                  on_curve, signal_type, signal_function
             FROM div_signals WHERE signal_number = ? AND is_active = 1`,
          [spec.signal]
        );
        if (sigs.length === 0) throw new Error(`bridge signal not found: ${spec.signal}`);
        const s = sigs[0];
        const sigRows = [];
        // Optional station header rendered ABOVE the bridge signal (e.g. THANE above
        // the PF-10 starter, with the segment's own header dropped to avoid a dup).
        if (spec.stationHeader) {
          sigRows.push({ row_order: 0, row_type: 'STATION_HEADER', display_description: spec.stationHeader });
        }
        sigRows.push({
          row_order: 1, row_type: 'SIGNAL', signal_id: s.id,
          display_signal_no: s.signal_number, display_location: s.location_text,
          // Prefer book_description (holds the "RI: ..." spec that drives the diversion
          // hand) over route_indicator_notes (which is a prose sighting note).
          display_description: s.book_description || s.route_indicator_notes || '',
          ri_left_arms: s.ri_left_arms, ri_right_arms: s.ri_right_arms,
          route_indicator_notes: s.route_indicator_notes,
          is_rhs: s.is_rhs, is_ext_rhs: s.is_ext_rhs, is_ext_lhs: s.is_ext_lhs,
          on_curve: s.on_curve, signal_type: s.signal_type, signal_function: s.signal_function,
        });
        sections.push({
          section_code: `SIG:${spec.signal}`, display_group: routeTitle, lead_in_note: null, rows: sigRows,
        });
        continue;
      }
      // Standalone neutral-section (OHE dead section) between segments — rendered as
      // the full approach board group 500M / 250M / N/S (matching the stored ones).
      if (spec.neutral) {
        const nsText = spec.neutral === true ? 'N/S' : spec.neutral;
        const nsRows = spec.boards === false
          ? [{ label: nsText }]
          : [{ label: '500M' }, { label: '250M' }, { label: nsText }];
        sections.push({
          section_code: `NS:${routeTitle}:${sections.length}`, display_group: routeTitle, lead_in_note: null,
          rows: nsRows.map((n, i) => ({
            row_order: i + 1, row_type: 'NEUTRAL_SECTION',
            display_description: n.label, display_location: spec.location || '',
          })),
        });
        continue;
      }
      const [secs] = await conn.execute(
        `SELECT id, section_code, section_title, direction, line
           FROM div_signal_book_sections WHERE section_code = ? AND is_active = 1`,
        [spec.code]
      );
      if (secs.length === 0) throw new Error(`Section not found: ${spec.code}`);
      const section = secs[0];
      const [rows] = await conn.execute(
        `SELECT r.row_order, r.row_type, r.signal_id, r.psr_id, r.neutral_section_id,
                r.display_signal_no, r.display_location, r.display_description,
                r.speed_kmph, r.km_range_text,
                r.station_code, r.station_name, r.station_km_text,
                r.highlight_color, r.text_color, r.icon_type, r.remarks,
                sg.ri_left_arms, sg.ri_right_arms, sg.route_indicator_notes,
                sg.is_rhs, sg.is_ext_rhs, sg.is_ext_lhs, sg.on_curve,
                sg.signal_type, sg.signal_function
           FROM div_signal_book_rows r
           LEFT JOIN div_signals sg ON sg.id = r.signal_id
          WHERE r.book_section_id = ? AND r.is_active = 1
          ORDER BY r.row_order`,
        [section.id]
      );
      // Signal-level trimming so a shared segment can diverge partway through.
      let kept = rows;
      const norm = (s) => String(s || '').trim().toUpperCase();
      if (spec.from || spec.to) {
        const idx = (sig) => kept.findIndex((r) => norm(r.display_signal_no) === norm(sig));
        const start = spec.from ? idx(spec.from) : 0;
        const endRaw = spec.to ? idx(spec.to) : kept.length - 1;
        const end = endRaw === -1 ? kept.length - 1 : endRaw;
        if (start === -1) throw new Error(`from-signal '${spec.from}' not in ${spec.code}`);
        kept = kept.slice(start, end + 1);
      }
      if (spec.exclude && spec.exclude.length) {
        const ex = new Set(spec.exclude.map(norm));
        kept = kept.filter((r) => !ex.has(norm(r.display_signal_no)));
      }
      // Drop a STATION_HEADER already rendered elsewhere (e.g. moved above a bridge signal).
      if (spec.dropStationHeader) {
        const key = norm(spec.dropStationHeader);
        kept = kept.filter((r) => !(r.row_type === 'STATION_HEADER' && norm(r.display_description).includes(key)));
      }
      // A branch DN segment authored junction->terminal is read terminal->junction
      // in a full "terminal -> PNVL" route. reverse:true flips the row order.
      if (spec.reverse) kept = kept.slice().reverse();
      section.rows = kept;
      section.display_group = routeTitle;   // force one heading for the whole route
      section.lead_in_note = null;          // drop split-view cross-references
      sections.push(section);
    }
    const beat = { beat_name: routeTitle, office_code: null, beat_category: null };
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

// ---------------------------------------------------------------------------
// Route-indicator (diversion hand) glyphs
// ---------------------------------------------------------------------------
// "RI:" strings come in two dialects (explicit L1=/R1=/MAIN= and positional);
// parseRiSpec (shared with the editor) lives in scripts/ri-spec.js.

// Vertical stem capped by a circle head, with arms slanting outward-up like
// the book's diversion-hand diagrams. The stem starts at the circle and ends
// just below the lowest arm — no bare overshoot above the topmost hand.
function riGlyphSvg(spec) {
  const ARM_STEP = 10;  // vertical gap between stacked arms
  const ARM_DX = 13;    // arm horizontal reach
  const ARM_DY = 9;     // arm vertical rise (tip sits above its attach point)
  const HEAD_R = 3.4;   // circle head radius
  const TAIL = 4;       // short stem tail below the lowest arm
  const CHAR_W = 5.4;   // crude label width estimate at 8.5px font
  const TOP_PAD = 7;    // headroom: the topmost arm's label rises above y=0

  const nMax = Math.max(spec.left.length, spec.right.length, 1);

  // Vertical layout (y grows downward).
  const mainTop = 1;                        // main label now sits at the BOTTOM (below the stem)
  const headCy = mainTop + HEAD_R + 0.5;    // circle centre
  const stemTop = headCy + HEAD_R;          // stem begins at bottom of circle
  const firstAttach = stemTop + 3;          // first arm attaches just below head
  const lastAttach = firstAttach + (nMax - 1) * ARM_STEP;
  const stemBottom = lastAttach + TAIL;
  const H = Math.max(stemBottom + (spec.main ? 13 : 2), headCy + HEAD_R + 4);

  const wL = Math.max(0, ...spec.left.map((s) => s.length)) * CHAR_W;
  const wR = Math.max(0, ...spec.right.map((s) => s.length)) * CHAR_W;
  const wM = (spec.main || '').length * CHAR_W;
  const cx = 4 + wL + ARM_DX + 2;
  const W = Math.max(cx + ARM_DX + 2 + wR + 4, cx + wM / 2 + 4, 30);

  let svg = `<svg class="ri-glyph" width="${Math.round(W)}" height="${Math.round(H + TOP_PAD)}" viewBox="0 ${-TOP_PAD} ${Math.round(W)} ${Math.round(H + TOP_PAD)}">`;
  svg += `<line x1="${cx}" y1="${stemTop.toFixed(1)}" x2="${cx}" y2="${stemBottom.toFixed(1)}"/>`;
  svg += `<circle class="ri-head" cx="${cx}" cy="${headCy.toFixed(1)}" r="${HEAD_R}"/>`;
  // Main / "Y=" route label at the BOTTOM of the stem (straight-ahead route) — clear of
  // the diverging hands, which is where it used to overlap.
  if (spec.main) svg += `<text x="${cx}" y="${(stemBottom + 10).toFixed(1)}" text-anchor="middle">${esc(spec.main)}</text>`;
  spec.left.forEach((label, i) => {
    const attach = firstAttach + i * ARM_STEP;
    const tipY = attach - ARM_DY;
    svg += `<line x1="${cx}" y1="${attach.toFixed(1)}" x2="${cx - ARM_DX}" y2="${tipY.toFixed(1)}"/>`;
    svg += `<text x="${cx - ARM_DX - 1}" y="${(tipY + 1.5).toFixed(1)}" text-anchor="end">${esc(label)}</text>`;
  });
  spec.right.forEach((label, i) => {
    const attach = firstAttach + i * ARM_STEP;
    const tipY = attach - ARM_DY;
    svg += `<line x1="${cx}" y1="${attach.toFixed(1)}" x2="${cx + ARM_DX}" y2="${tipY.toFixed(1)}"/>`;
    svg += `<text x="${cx + ARM_DX + 1}" y="${(tipY + 1.5).toFixed(1)}">${esc(label)}</text>`;
  });
  svg += '</svg>';
  return svg;
}


// Signal-class badge shown next to the number, matching the printed book:
//   Ⓟ = distant signal, ⒾⒷ = IBS, Ⓖ = gate signal.
// Distant takes priority (an "IBS Distant" prints the distant circle).
function classBadge(row) {
  const fn = String(row.signal_function || '').toLowerCase();
  const ty = String(row.signal_type || '').toLowerCase();
  if (fn.includes('distant')) return `<span class="sig-badge">P</span>`;
  if (ty === 'ibs' || fn === 'ibs') return `<span class="sig-badge ibs">IB</span>`;
  if (ty === 'gate') return `<span class="sig-badge">G</span>`;
  return '';
}

// Small semaphore-style flag for cross-references (e.g. "DN TH K-009").
function flagGlyphSvg(label, side) {
  const CHAR_W = 5.4;
  const HEAD_R = 3;
  const W = Math.round(20 + label.length * CHAR_W + 5);
  const dir = side === 'left' ? -1 : 1;         // flag/label direction
  const sx = side === 'left' ? W - 8 : 8;        // stem/head x
  const armX = sx + dir * 9;                      // flag tip
  const labelX = sx + dir * 12;
  const anchor = side === 'left' ? 'end' : 'start';
  return `<svg class="ri-glyph" width="${W}" height="22" viewBox="0 0 ${W} 22">` +
    `<circle class="ri-head" cx="${sx}" cy="4" r="${HEAD_R}"/>` +      // signal head at top
    `<line x1="${sx}" y1="7" x2="${sx}" y2="20"/>` +                   // post/stem
    `<line x1="${sx}" y1="11" x2="${armX}" y2="7"/>` +                 // flag arm
    `<text x="${labelX}" y="13" text-anchor="${anchor}">${esc(label)}</text></svg>`;
}

// DESCRIPTION cell for SIGNAL rows: curve arrow + glyph/text + RHS tag,
// mirroring what the printed book packs into that column.
function descCellHtml(row) {
  const parts = [];
  if (row.on_curve === 'Left') parts.push('<span class="curve-mark">↶</span>');
  if (row.on_curve === 'Right') parts.push('<span class="curve-mark">↷</span>');

  const text = (row.display_description || '').trim();
  const isFlag = /flag/i.test(row.route_indicator_notes || '');
  if (/^RI:/i.test(text)) {
    parts.push(riGlyphSvg(parseRiSpec(text, row.ri_left_arms, row.ri_right_arms)));
  } else if (text && isFlag) {
    // Flag side comes from the arm counts: left when ri_left_arms leads (else right).
    const flagSide = (Number(row.ri_left_arms) || 0) > (Number(row.ri_right_arms) || 0) ? 'left' : 'right';
    parts.push(flagGlyphSvg(text, flagSide));
  } else if (text) {
    parts.push(descToHtml(text));
  }

  const rhs = row.is_ext_rhs ? 'Ext RHS' : (row.is_rhs ? 'RHS' : null);
  if (rhs && !/RHS/i.test(text)) parts.push(`<span class="rhs-tag">${rhs}</span>`);
  // Extreme-left placement flagged too (left is the default side, so only the
  // unusual "extreme left" is marked — in blue, to distinguish from red RHS).
  if (row.is_ext_lhs && !/LHS/i.test(text)) parts.push(`<span class="lhs-tag">Ext LHS</span>`);
  return parts.join(' ');
}

function renderRow(row) {
  const textCls = row.text_color === 'RED'  ? 'red'
                : row.text_color === 'BLUE' ? 'blue' : '';
  const clsBadge = classBadge(row);
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
      // First column = the actual marker (500M / 250M / N/S), second = location/km.
      return `<div class="row ns">
        <div class="ns-label">${esc(row.display_description || 'N/S')}</div>
        <div class="ns-loc">${esc(row.display_location || '')}</div>
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
    default: {
      // Rows carrying a route-indicator diversion glyph need more vertical room so
      // the multi-arm hands aren't cramped. Taller when there are more arms.
      const isRi = /^RI:/i.test((row.display_description || '').trim());
      const arms = Math.max(Number(row.ri_left_arms) || 0, Number(row.ri_right_arms) || 0);
      const riCls = isRi ? (arms >= 3 ? 'has-ri ri-tall' : 'has-ri') : '';
      return `<div class="row signal ${textCls} ${riCls}">
        <div class="cell signal-no">${esc(row.display_signal_no || '')}${clsBadge}${iconBadge}</div>
        <div class="cell signal-loc">${esc(row.display_location || '')}</div>
        <div class="cell signal-desc">${descCellHtml(row)}</div>
      </div>`;
    }
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
  // Consolidate consecutive bound sections that share a display_group into ONE
  // rendered block (one heading = the display_group, rows concatenated) so a route
  // reads as a single continuous list. A NULL display_group renders standalone with
  // its own section_title (each in its own group).
  const groups = [];
  for (const section of sections) {
    const key = section.display_group && String(section.display_group).trim();
    const prev = groups[groups.length - 1];
    if (key && prev && prev.key === key) {
      prev.sections.push(section);
    } else {
      groups.push({ key: key || null, title: key || section.section_title, sections: [section] });
    }
  }

  const sectionsHtml = groups.map((group) => {
    const rowsHtml = group.sections.flatMap((s) => s.rows).map(renderRow).join('\n');
    // Lead-in / cross-reference captions ("From DCC S-3", "To DI S-5 for BSR")
    // carried on each binding, shown under the heading in book order.
    const notesHtml = group.sections
      .map((s) => s.lead_in_note && String(s.lead_in_note).trim())
      .filter(Boolean)
      .map((n) => `  <div class="section-note">${esc(n)}</div>`)
      .join('\n');
    return `
<section class="book-section">
  <h2 class="section-title">${esc(group.title)}</h2>
${notesHtml}
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

  .section-note {
    column-span: all;
    -webkit-column-span: all;
    text-align: center;
    font-style: italic;
    font-size: 8.5pt;
    color: #b45309;
    margin: 0 0 4px 0;
  }

  .section-table-header {
    column-span: all;
    -webkit-column-span: all;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6mm;
    margin-bottom: 4px;
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
    padding: 4px 0;
  }

  /* SIGNAL — 3 columns within a row. min-height keeps ~37-40 rows/page so the
     larger fonts breathe (was ~50). */
  .row.signal {
    display: grid;
    grid-template-columns: 30% 28% 42%;
    gap: 4px;
    align-items: center;
    min-height: 20px;
  }
  .row.signal .signal-no  { font-weight: 700; font-family: "Courier New", monospace; font-size: 11pt; }
  .sig-badge { display: inline-block; border: 1.2px solid #111; border-radius: 50%;
    width: 13px; height: 13px; line-height: 11px; text-align: center;
    font-size: 8px; font-weight: 700; font-family: Arial, sans-serif;
    margin-left: 3px; vertical-align: middle; }
  .sig-badge.ibs { border-radius: 7px; width: auto; min-width: 13px; padding: 0 3px; }
  .row.signal.red .sig-badge { border-color: #c2410c; color: #c2410c; }
  .row.signal .signal-loc { font-family: "Courier New", monospace; color: #111; font-weight: 600; font-size: 10pt; }
  .row.signal .signal-desc{ font-size: 8.5pt; color: #444; }
  /* Diversion rows: extra height + vertical-centre so the route-indicator hands
     have room. ri-tall (3+ arms) gets more. */
  .row.signal.has-ri  { padding: 8px 0; align-items: center; min-height: 40px; }
  .row.signal.ri-tall { padding: 12px 0; min-height: 56px; }
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
    background: #fde047;
    color: #451a03;
    display: grid;
    grid-template-columns: 30% auto;
    gap: 4px;
    padding: 3px 6px;
    border-left: 5px solid #a16207;
    margin: 2px 0;
  }
  .row.psr .psr-speed { font-weight: 700; }

  /* NEUTRAL_SECTION — light grey w/ N/S badge */
  .row.ns {
    background: #bae6fd;
    color: #082f49;
    display: grid;
    grid-template-columns: 30% auto;
    gap: 4px;
    padding: 3px 6px;
    border-left: 5px solid #0369a1;
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

  /* Route-indicator glyphs (diversion hands) */
  .ri-glyph { vertical-align: middle; }
  .ri-glyph line { stroke: #111; stroke-width: 1.6; stroke-linecap: round; }
  .ri-glyph .ri-head { fill: #111; stroke: #111; stroke-width: 1; }
  .ri-glyph text { font-size: 8.5px; font-family: Arial, sans-serif; fill: #111; }
  .row.signal.red .ri-glyph line { stroke: #c2410c; }
  .row.signal.red .ri-glyph .ri-head { fill: #c2410c; stroke: #c2410c; }
  .row.signal.red .ri-glyph text { fill: #c2410c; }
  .rhs-tag {
    color: #c2410c;
    font-weight: 700;
    font-size: 7.5pt;
    white-space: nowrap;
  }
  .lhs-tag {
    color: #1d4ed8;
    font-weight: 700;
    font-size: 7.5pt;
    white-space: nowrap;
  }
  .curve-mark { font-size: 15pt; font-weight: 900; color: #111; line-height: 1; vertical-align: middle;
    -webkit-text-stroke: 0.8px #111; text-stroke: 0.8px #111; }

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

module.exports = { loadBook, loadRoute, renderHtml };

// Allow running directly as a CLI script.
if (require.main === module) {
  const outIdx = process.argv.indexOf('--out');
  const routeIdx = process.argv.indexOf('--route');
  const isRoute = routeIdx > -1;
  const routeName = isRoute ? process.argv[routeIdx + 1] : null;
  const beatCode = isRoute ? null : process.argv[2];
  const routeDef = isRoute ? require('./signal-routes')[routeName] : null;
  const outPath = outIdx > -1 ? process.argv[outIdx + 1]
    : (isRoute ? 'signal-book-route.html' : `signal-book-${beatCode}.html`);

  if (!isRoute && !beatCode) {
    console.error('Usage: node scripts/render-signal-book.js <BEAT_CODE> [--out <path>]');
    console.error('   or: node scripts/render-signal-book.js --route "<ROUTE NAME>" [--out <path>]  (names from scripts/signal-routes.js)');
    process.exit(1);
  }
  if (isRoute && !routeDef) {
    console.error(`Route '${routeName}' not defined in scripts/signal-routes.js. Known: ${Object.keys(require('./signal-routes')).join(', ')}`);
    process.exit(1);
  }

  (async () => {
    const book = isRoute ? await loadRoute(routeDef) : await loadBook(beatCode);

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
