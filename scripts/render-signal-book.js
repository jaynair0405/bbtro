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
            AND (r.exclude_beats IS NULL OR FIND_IN_SET(?, r.exclude_beats) = 0)
          ORDER BY r.row_order`,
        [section.id, beat.beat_code]
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

// Full-route BOOK for a beat: render every route assigned to the beat as
// consecutive sections (one heading per route), so a beat reads as a book of its
// full routes rather than the split segments. Each route keeps its own header
// because loadRoute gives every route a distinct display_group (= its title).
async function loadBeatRoutes(beatCode, beatName, providedConn) {
  const conn = providedConn || await getConnection();
  const ownConn = !providedConn;
  try {
    const book = await loadBook(beatCode, conn);
    const routeDefs = require('./signal-routes');

    // Explicit order takes precedence: render exactly the listed routes/sections,
    // in the given corridor order, each with both directions.
    const order = (routeDefs.__beatOrder || {})[beatCode];
    if (order) {
      const sectionMap = {};
      book.sections.forEach((s) => { sectionMap[s.section_code] = s; });
      const sections = [];
      for (const item of order) {
        if (item.route) {
          const rd = routeDefs[item.route];
          if (!rd) throw new Error(`route not defined: ${item.route}`);
          const r = await loadRoute(rd, conn);
          sections.push(...r.sections);
        } else if (item.section) {
          const s = sectionMap[item.section];
          // item.label overrides the heading (display_group is used as the title).
          if (s) { s.display_group = item.label || null; s.lead_in_note = null; sections.push(s); }
        }
      }
      return { beat: { beat_name: beatName || `${beatCode} — Full Routes` }, sections };
    }

    // Fallback (auto): start from the FULL beat book, replacing only the split
    // segments the beat's routes assemble — every other section stays in place.
    const routeNames = Object.keys(routeDefs).filter(
      (n) => Array.isArray(routeDefs[n].beats) && routeDefs[n].beats.includes(beatCode)
    );

    // section_codes consumed WHOLE by the beat's routes — these get replaced by the
    // routes. A route that uses only a slice of a section (from/to/exclude) does not
    // replace it: the section is a line in its own right (e.g. CSMT-PNVL HB, of which
    // the TNA-PNVL routes use only the NEU -> PNVL stretch) and was being dropped.
    const covered = new Set();
    for (const n of routeNames) {
      for (const seg of routeDefs[n].segments) {
        if (typeof seg === 'string') { covered.add(seg); continue; }
        if (seg.code && !seg.from && !seg.to && !seg.exclude) covered.add(seg.code);
      }
    }

    const routeSections = [];
    for (const n of routeNames) {
      const r = await loadRoute(routeDefs[n], conn);
      routeSections.push(...r.sections);
    }

    // Rebuild the book: keep non-covered sections in place; where the covered
    // (split) segments sit, drop them in favour of the assembled full routes (once).
    const sections = [];
    let inserted = false;
    for (const s of book.sections) {
      if (covered.has(s.section_code)) {
        if (!inserted) { sections.push(...routeSections); inserted = true; }
      } else {
        sections.push(s);
      }
    }
    if (!inserted && routeSections.length) sections.push(...routeSections);

    return { beat: { beat_name: beatName || `${beatCode} — Full Routes` }, sections };
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

// Consolidate consecutive bound sections that share a display_group into ONE
// rendered block (one heading = the display_group, rows concatenated) so a route
// reads as a single continuous list. A NULL display_group renders standalone with
// its own section_title (each in its own group).
function groupSections(sections) {
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
  return groups;
}

// Last page of a booklet (and the stand-alone report): every signal printed on the
// RHS / Ext RHS / Ext LHS, page by page in booklet order. Built from the rows the
// booklet itself prints, so exclude_beats and per-line placement are already applied.
// A full-route book can pass the same segment twice: one entry per heading + signal.
const PLACEMENT_SIDES = [['EXT_RHS', 'Ext RHS'], ['RHS', 'RHS'], ['EXT_LHS', 'Ext LHS'], ['LHS', 'LHS']];

// Pages beyond Mumbai division (the report hides them unless asked for).
const OUTSIDE_DIVISION = /^(IGP_MMR|MMR_BSL|MMR_SNSI|LNL_PUNE|ROHA_RN)_/;

function placementSide(row, withLhs) {
  if (row.is_ext_rhs) return 'EXT_RHS';
  if (row.is_rhs) return 'RHS';
  if (row.is_ext_lhs) return 'EXT_LHS';
  return withLhs ? 'LHS' : null;
}

// report: the stand-alone filterable page. Also lists normal LHS signals, and tags
// each page (line, direction, outside division) and row (side, beats that print it)
// for the filters.
function placementPageHtml(sections, { report = false } = {}) {
  const counts = { RHS: 0, EXT_RHS: 0, EXT_LHS: 0, LHS: 0 };
  const blocks = [];
  for (const group of groupSections(sections)) {
    const seen = new Set();
    const items = [];
    for (const s of group.sections) {
      for (const row of s.rows) {
        const side = row.row_type === 'SIGNAL' && placementSide(row, report);
        if (!side) continue;
        const key = row.signal_id || `${row.display_signal_no}|${row.display_location}`;
        if (seen.has(key)) continue;
        seen.add(key);
        counts[side]++;
        const excl = String(row.exclude_beats || '').split(',').map((b) => b.trim());
        const beats = (s.beats || []).filter((b) => !excl.includes(b));
        items.push({ row, side, beats });
      }
    }
    const first = group.sections[0];
    if (items.length) blocks.push({ title: group.title, first, items });
  }
  if (!blocks.length) return '';

  const label = Object.fromEntries(PLACEMENT_SIDES);
  // Count beside each page heading: total, then per side (only sides present).
  const pageCount = (items) => {
    const c = {};
    items.forEach((it) => { c[it.side] = (c[it.side] || 0) + 1; });
    const parts = PLACEMENT_SIDES.filter(([k]) => c[k])
      .map(([k, l]) => `<span class="pl-side ${k}">${l}</span> ${c[k]}`).join(' · ');
    return `<b>${items.length}</b>${parts ? ` &nbsp;(${parts})` : ''}`;
  };
  const summary = PLACEMENT_SIDES
    .filter(([k]) => counts[k])
    .map(([k, l]) => `<span class="pl-item" data-side="${k}"><span class="pl-side ${k}">${l}</span> <span class="pl-n">${counts[k]}</span></span>`)
    .join('');
  const blockAttrs = (b) => report
    ? ` data-line="${esc(b.first.line || '')}" data-dir="${esc(b.first.direction || '')}" data-out="${OUTSIDE_DIVISION.test(b.first.section_code || '') ? 1 : 0}"`
    : '';
  const rowAttrs = (it) => report ? ` data-side="${it.side}" data-beats=",${esc(it.beats.join(','))},"` : '';
  const tables = blocks.map((b) => `
  <div class="pl-block${b.items.length <= 80 ? ' pl-keep' : ''}"${blockAttrs(b)}>
    <div class="pl-page"><span>${esc(b.title)}</span><span class="pl-cnt">${pageCount(b.items)}</span></div>
    <div class="pl-rows">
${b.items.map((it) => `      <div class="pl-row"${rowAttrs(it)}><span class="pl-no">${esc(it.row.display_signal_no || '')}</span><span class="pl-loc">${esc(it.row.display_location || '')}</span><span class="pl-side ${it.side}">${label[it.side]}</span></div>`).join('\n')}
    </div>
  </div>`).join('\n');

  return `
<section class="book-section placement-list">
  <h2 class="section-title">RHS / Ext RHS / Ext LHS Signals</h2>
  <div class="pl-summary">${summary}</div>
  <div class="pl-filters-note"></div>
  <div class="pl-wrap">
${tables}
  </div>
</section>`;
}

// Filter bar + script for the stand-alone report (hidden when printing; the chosen
// filters print under the title instead). Filters: beat, line, direction, side, and
// pages outside Mumbai division (off by default). ?beat=CODE preselects a beat.
function placementFiltersHtml(sections, beats) {
  const lines = [...new Set(sections.map((s) => s.line).filter(Boolean))].sort();
  const opt = (v, l) => `<option value="${esc(v)}">${esc(l)}</option>`;
  return `
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <div class="pl-filters">
    <label>Beat <select id="f-beat"><option value="">All beats</option>${beats.map((b) => opt(b.beat_code, b.beat_name || b.beat_code)).join('')}</select></label>
    <label>Line <select id="f-line"><option value="">All lines</option>${lines.map((l) => opt(l, l)).join('')}</select></label>
    <label>Direction <select id="f-dir"><option value="">UP + DN</option>${opt('UP', 'UP')}${opt('DN', 'DN')}</select></label>
    <span class="f-sides">
      <label><input type="checkbox" class="f-side" value="RHS" checked> RHS</label>
      <label><input type="checkbox" class="f-side" value="EXT_RHS" checked> Ext RHS</label>
      <label><input type="checkbox" class="f-side" value="EXT_LHS" checked> Ext LHS</label>
      <label><input type="checkbox" class="f-side" value="LHS"> LHS</label>
    </span>
    <label><input type="checkbox" id="f-out"> Include outside Mumbai division (IGP–BSL, MMR–SNSI, LNL–PUNE, ROHA–RN)</label>
    <button type="button" id="f-clear">Clear filters</button>
  </div>
<script>
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  if (q.get('beat')) $('f-beat').value = q.get('beat');
  if (q.get('outside') === '1') $('f-out').checked = true;
  var LABEL = { RHS: 'RHS', EXT_RHS: 'Ext RHS', EXT_LHS: 'Ext LHS', LHS: 'LHS' };

  // Beat, line and direction lists narrow each other: each list offers only the
  // choices that still show something with the other filters, with that count.
  // If a combination shows nothing (e.g. after unticking outside division), the latest
  // choice is kept and whichever older choice conflicts with it goes back to All.
  var ROWS = null, BASE = {}, LAST = 'beat';
  function index() {
    ROWS = [];
    [].forEach.call(document.querySelectorAll('.pl-block'), function (b) {
      [].forEach.call(b.querySelectorAll('.pl-row'), function (tr) {
        ROWS.push({ side: tr.dataset.side, beats: tr.dataset.beats, line: b.dataset.line, dir: b.dataset.dir, out: b.dataset.out === '1' });
      });
    });
    ['f-beat', 'f-line', 'f-dir'].forEach(function (id) {
      BASE[id] = [].map.call($(id).options, function (o) { return { v: o.value, t: o.text }; });
    });
  }
  function fits(r, f, skip) {
    return f.sides[r.side] && (f.out || !r.out) &&
      (skip === 'beat' || !f.beat || r.beats.indexOf(',' + f.beat + ',') !== -1) &&
      (skip === 'line' || !f.line || r.line === f.line) &&
      (skip === 'dir' || !f.dir || r.dir === f.dir);
  }
  function syncOptions(f) {
    var order = [LAST].concat(['beat', 'line', 'dir'].filter(function (k) { return k !== LAST; }));
    var want = { beat: f.beat, line: f.line, dir: f.dir };
    f.beat = f.line = f.dir = '';
    order.forEach(function (k) {
      if (!want[k]) return;
      f[k] = want[k];
      if (!ROWS.some(function (r) { return fits(r, f); })) f[k] = '';
    });
    var facets = [['f-beat', 'beat'], ['f-line', 'line'], ['f-dir', 'dir']];
    facets.forEach(function (fc) {
      var id = fc[0], key = fc[1], cnt = {}, all = 0;
      ROWS.forEach(function (r) {
        if (!fits(r, f, key)) return;
        all++;
        if (key === 'beat') r.beats.split(',').forEach(function (b) { if (b) cnt[b] = (cnt[b] || 0) + 1; });
        else cnt[r[key]] = (cnt[r[key]] || 0) + 1;
      });
      var sel = $(id), keep = f[key];
      sel.innerHTML = BASE[id].filter(function (o) { return !o.v || cnt[o.v]; }).map(function (o) {
        var n = o.v ? cnt[o.v] : all;
        return '<option value="' + o.v + '">' + o.t + ' (' + n + ')</option>';
      }).join('');
      sel.value = keep;
    });
  }

  function apply() {
    if (!ROWS) index();
    var sides = {};
    [].forEach.call(document.querySelectorAll('.f-side'), function (c) { if (c.checked) sides[c.value] = 1; });
    var f = { beat: $('f-beat').value, line: $('f-line').value, dir: $('f-dir').value, out: $('f-out').checked, sides: sides };
    syncOptions(f);
    var beat = f.beat, line = f.line, dir = f.dir, out = f.out;
    var counts = { RHS: 0, EXT_RHS: 0, EXT_LHS: 0, LHS: 0 }, total = 0;
    [].forEach.call(document.querySelectorAll('.pl-block'), function (b) {
      var pageOk = (!line || b.dataset.line === line) && (!dir || b.dataset.dir === dir) && (out || b.dataset.out !== '1');
      var shown = 0, bc = {};
      [].forEach.call(b.querySelectorAll('.pl-row'), function (tr) {
        var ok = pageOk && sides[tr.dataset.side] && (!beat || tr.dataset.beats.indexOf(',' + beat + ',') !== -1);
        tr.style.display = ok ? '' : 'none';
        if (ok) { shown++; counts[tr.dataset.side]++; bc[tr.dataset.side] = (bc[tr.dataset.side] || 0) + 1; }
      });
      b.style.display = shown ? '' : 'none';
      var parts = [];
      ['EXT_RHS', 'RHS', 'EXT_LHS', 'LHS'].forEach(function (k) {
        if (bc[k]) parts.push('<span class="pl-side ' + k + '">' + LABEL[k] + '</span> ' + bc[k]);
      });
      b.querySelector('.pl-cnt').innerHTML = '<b>' + shown + '</b>' + (parts.length ? ' &nbsp;(' + parts.join(' · ') + ')' : '');
      total += shown;
    });
    [].forEach.call(document.querySelectorAll('.pl-item'), function (it) {
      it.querySelector('.pl-n').textContent = counts[it.dataset.side];
      it.style.display = sides[it.dataset.side] ? '' : 'none';
    });
    var parts = [];
    if (beat) parts.push('Beat: ' + $('f-beat').selectedOptions[0].text.replace(/ \\(\\d+\\)$/, ''));
    if (line) parts.push('Line: ' + line);
    if (dir) parts.push(dir);
    parts.push(Object.keys(sides).map(function (k) { return LABEL[k]; }).join(', ') || 'no side selected');
    parts.push(out ? 'including outside Mumbai division' : 'Mumbai division only');
    document.querySelector('.pl-filters-note').textContent = parts.join(' · ');
    $('pl-total').textContent = total;
    var u = new URL(location.href);
    beat ? u.searchParams.set('beat', beat) : u.searchParams.delete('beat');
    out ? u.searchParams.set('outside', '1') : u.searchParams.delete('outside');
    history.replaceState(null, '', u);
  }
  [].forEach.call(document.querySelectorAll('.pl-filters select, .pl-filters input'), function (el) {
    el.addEventListener('change', function () {
      var k = { 'f-beat': 'beat', 'f-line': 'line', 'f-dir': 'dir' }[el.id];
      if (k) LAST = k;
      apply();
    });
  });
  // The list comes after this script in the page.
  document.addEventListener('DOMContentLoaded', function () {
    apply();
    $('f-clear').addEventListener('click', function () {
      $('f-beat').value = ''; $('f-line').value = ''; $('f-dir').value = ''; $('f-out').checked = false;
      [].forEach.call(document.querySelectorAll('.f-side'), function (c) { c.checked = c.value !== 'LHS'; });
      apply();
    });
  });

  // Excel: exactly what the filters show. Sheet 1 every signal, sheet 2 counts per page.
  function exportXlsx() {
    if (!window.XLSX) { $('pl-xlsx').textContent = 'Excel library did not load — check internet'; return; }
    var note = document.querySelector('.pl-filters-note').textContent;
    var list = [['RHS / Ext RHS / Ext LHS signals — BB Division'], [note], [],
                ['Page', 'Line', 'Direction', 'Signal No.', 'Location', 'Side']];
    var summary = [['Counts per page — BB Division'], [note], [],
                   ['Page', 'Line', 'Direction', 'Total', 'Ext RHS', 'RHS', 'Ext LHS', 'LHS']];
    var tot = { n: 0, EXT_RHS: 0, RHS: 0, EXT_LHS: 0, LHS: 0 };
    [].forEach.call(document.querySelectorAll('.pl-block'), function (b) {
      if (b.style.display === 'none') return;
      var page = b.querySelector('.pl-page span').textContent;
      var c = { n: 0, EXT_RHS: 0, RHS: 0, EXT_LHS: 0, LHS: 0 };
      [].forEach.call(b.querySelectorAll('.pl-row'), function (tr) {
        if (tr.style.display === 'none') return;
        var td = tr.children;
        list.push([page, b.dataset.line, b.dataset.dir, td[0].textContent, td[1].textContent, LABEL[tr.dataset.side]]);
        c.n++; c[tr.dataset.side]++;
      });
      summary.push([page, b.dataset.line, b.dataset.dir, c.n, c.EXT_RHS, c.RHS, c.EXT_LHS, c.LHS]);
      Object.keys(tot).forEach(function (k) { tot[k] += c[k]; });
    });
    summary.push(['Total', '', '', tot.n, tot.EXT_RHS, tot.RHS, tot.EXT_LHS, tot.LHS]);
    var wb = XLSX.utils.book_new();
    var ws1 = XLSX.utils.aoa_to_sheet(list);
    ws1['!cols'] = [{ wch: 30 }, { wch: 11 }, { wch: 9 }, { wch: 16 }, { wch: 20 }, { wch: 9 }];
    ws1['!autofilter'] = { ref: 'A4:F' + list.length };
    var ws2 = XLSX.utils.aoa_to_sheet(summary);
    ws2['!cols'] = [{ wch: 30 }, { wch: 11 }, { wch: 9 }, { wch: 7 }, { wch: 8 }, { wch: 6 }, { wch: 8 }, { wch: 6 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Signals');
    XLSX.utils.book_append_sheet(wb, ws2, 'Counts per page');
    var beat = $('f-beat').value;
    XLSX.writeFile(wb, 'RHS_Ext_Signals_' + (beat || 'BB_Division') + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
  }
  document.addEventListener('DOMContentLoaded', function () { $('pl-xlsx').addEventListener('click', exportXlsx); });
})();
</script>`;
}

function renderHtml({ beat, sections }, opts = {}) {
  const groups = groupSections(sections);

  const sectionsHtml = opts.placementOnly ? '' : groups.map((group) => {
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

  const placementHtml = (opts.placementPage || opts.placementOnly)
    ? placementPageHtml(sections, { report: !!opts.report }) : '';
  const placementCount = (placementHtml.match(/class="pl-row"/g) || []).length;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${opts.placementOnly ? 'RHS / Ext Signals' : 'Signal Book'} — ${esc(beat.beat_name)}</title>
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

  /* RHS / Ext list page — compact, two page-columns of small tables. */
  .placement-list .pl-summary { text-align: center; font-size: 9pt; margin: 2px 0 8px; }
  /* Each page: heading across the full width, its signals in two columns below it. */
  .placement-list .pl-block { margin-bottom: 10px; }
  /* A page's list that fits on one sheet (~40 lines of two columns) is not split. */
  .placement-list .pl-block.pl-keep { break-inside: avoid; page-break-inside: avoid; }
  .placement-list .pl-rows { column-count: 2; column-gap: 8mm; column-rule: 1px solid #e5e7eb; }
  .placement-list .pl-row {
    display: grid; grid-template-columns: 38% 42% 20%;
    padding: 1.5px 4px; border-bottom: 1px solid #e5e7eb; font-size: 9pt;
    break-inside: avoid; page-break-inside: avoid;
  }
  .placement-list .pl-page {
    font-weight: 700; font-size: 8.5pt; color: #1e3a8a; text-transform: uppercase;
    border-bottom: 1px solid #1e3a8a; padding: 2px 4px; margin-bottom: 2px; background: #eef2ff;
    break-after: avoid; page-break-after: avoid;
    display: flex; justify-content: space-between; align-items: baseline; gap: 6px;
  }
  .placement-list .pl-cnt { font-size: 7.5pt; font-weight: 400; color: #374151; text-transform: none; white-space: nowrap; }
  .placement-list .pl-cnt b { color: #1e3a8a; }
  .placement-list .pl-cnt .pl-side { font-size: 7.5pt; }
  .placement-list .pl-no { font-weight: 700; overflow-wrap: anywhere; }
  .placement-list .pl-loc { overflow-wrap: anywhere; }
  .placement-list .pl-side { font-weight: 700; font-size: 8pt; white-space: nowrap; }
  .pl-side.RHS, .pl-side.EXT_RHS { color: #c2410c; }
  .pl-side.EXT_LHS { color: #1d4ed8; }
  .pl-side.LHS { color: #374151; }
  .placement-list .pl-item { margin: 0 8px; white-space: nowrap; }
  @media screen { .placement-list { padding: 0 16px 16px; } }
  .placement-list .pl-filters-note:empty { display: none; }
  .placement-list .pl-filters-note { text-align: center; font-size: 8.5pt; color: #374151; margin: -4px 0 8px; }
  .pl-filters {
    display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center;
    padding: 10px 16px; background: #f3f4f6; border-bottom: 1px solid #d1d5db; font-size: 12px;
  }
  .pl-filters select { font-size: 12px; padding: 3px 6px; margin-left: 4px; }
  .pl-filters .f-sides { display: inline-flex; gap: 10px; }
  .pl-filters label { white-space: nowrap; }
  .pl-filters #f-clear { font-size: 12px; padding: 3px 10px; cursor: pointer; }
  @media print { .pl-filters { display: none; } }
</style>
</head>
<body>
  <div class="toolbar">
    <div><strong>${esc(beat.beat_name)}</strong> · ${opts.placementOnly
      ? `RHS / Ext RHS / Ext LHS list · <span id="pl-total">${placementCount}</span> signals`
      : `${sections.length} section${sections.length === 1 ? '' : 's'} · ${sections.reduce((n, s) => n + s.rows.length, 0)} rows`}</div>
    <div>${opts.report ? '<button id="pl-xlsx" style="margin-right:8px">Export to Excel</button>' : ''}<button onclick="window.print()">Print / Save as PDF</button></div>
  </div>
${opts.report ? placementFiltersHtml(sections, opts.report.beats || []) : ''}
${opts.placementOnly ? '' : `
  <div class="cover">
    <div class="title">SIGNAL LOCATION GUIDE</div>
    <div class="beat">${esc(beat.beat_name)} BEAT</div>
    <div class="sub">BB Division · Mumbai · Auto-generated draft</div>
  </div>
`}
  ${sectionsHtml}
  ${placementHtml || (opts.placementOnly ? '<p style="padding:20px">No RHS / Ext RHS / Ext LHS signals in this book.</p>' : '')}
</body>
</html>`;
}

// Division-wide data for the stand-alone RHS / Ext report: every signal row on every
// active page (normal LHS too, for the LHS filter), each page's beats, and each row's
// exclude_beats, so the page can filter by beat exactly as the booklets print.
async function loadAllSections(providedConn) {
  const conn = providedConn || await getConnection();
  const ownConn = !providedConn;
  try {
    const [sections] = await conn.query(
      `SELECT id, section_code, section_title, direction, line
         FROM div_signal_book_sections WHERE is_active = 1 ORDER BY section_code`
    );
    const [beats] = await conn.query(
      `SELECT id, beat_code, beat_name FROM div_signal_beats WHERE is_active = 1 ORDER BY id`
    );
    const [links] = await conn.query(
      `SELECT bs.section_id, b.beat_code
         FROM div_signal_beat_sections bs JOIN div_signal_beats b ON b.id = bs.beat_id AND b.is_active = 1
        WHERE bs.is_active = 1`
    );
    const [rows] = await conn.query(
      `SELECT r.book_section_id, r.row_order, r.row_type, r.signal_id,
              r.display_signal_no, r.display_location, r.exclude_beats,
              sg.is_rhs, sg.is_ext_rhs, sg.is_ext_lhs
         FROM div_signal_book_rows r
         JOIN div_signals sg ON sg.id = r.signal_id
        WHERE r.is_active = 1 AND r.row_type = 'SIGNAL'
        ORDER BY r.book_section_id, r.row_order`
    );
    const bySection = {};
    rows.forEach((r) => { (bySection[r.book_section_id] = bySection[r.book_section_id] || []).push(r); });
    const beatsBySection = {};
    links.forEach((l) => { (beatsBySection[l.section_id] = beatsBySection[l.section_id] || []).push(l.beat_code); });
    sections.forEach((s) => { s.rows = bySection[s.id] || []; s.beats = beatsBySection[s.id] || []; });
    // Several pages share a title (DIVA DN LINE x4, BSR UP LINE x4...); the booklets
    // tell them apart by their beat heading, the report by the stretch in the page code.
    const titleUse = {};
    sections.forEach((s) => { titleUse[s.section_title] = (titleUse[s.section_title] || 0) + 1; });
    sections.forEach((s) => {
      if (titleUse[s.section_title] > 1) {
        const [from, to] = String(s.section_code).split('_');
        s.section_title = `${s.section_title} (${from}–${to})`;
      }
    });
    return { beat: { beat_name: 'BB Division' }, sections, beats };
  } finally {
    if (ownConn) await conn.end();
  }
}

module.exports = { loadBook, loadRoute, loadBeatRoutes, loadAllSections, renderHtml, placementPageHtml };

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
