/**
 * Import one signal-book section: signals (master) + section (master) +
 * inserts (station headers + PSRs + N/S + boards) → div_signal_book_rows.
 *
 *   node scripts/import-signal-section.js <section_xlsx> --signals <file> [--commit]
 *
 * Example:
 *   node scripts/import-signal-section.js \
 *     data/CSMT_KYN/csmt_kyn_up.xlsx \
 *     --signals upth_signals.csv
 *
 * The section xlsx must have these sheets:
 *   section_info — 1 row: section_code, section_title, direction, line
 *   inserts      — optional: station_header text + before_signal pattern
 *   PSR          — optional: div_psr cols + insert_before_signal
 *
 * The signals file (csv or xlsx) is the spine — row order in the file
 * decides the book order. Signal row N gets book row_order = N * 100.
 * Inserts slot in just before the named target signal.
 *
 * What gets written (on --commit):
 *   div_signals               — upserted from signals file (relaxed validation)
 *   div_signal_aliases        — auto-alias on signal_number
 *   div_psr                   — upserted from PSR sheet
 *   div_signal_book_sections  — upserted from section_info
 *   div_signal_book_rows      — replaced atomically for this section_id
 *
 * Beat assignment is separate (one SQL line per beat — see decisions log
 * sql/2026-06-03_bind_csmt_kyn_dn_th_to_beats.sql for the pattern).
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mysql = require('mysql2/promise');

const args = process.argv.slice(2);
const sectionXlsxPath = args[0];
const signalsIdx = args.indexOf('--signals');
const signalsPath = signalsIdx > -1 ? args[signalsIdx + 1] : null;
const shouldCommit = args.includes('--commit');

if (!sectionXlsxPath || !signalsPath) {
  console.error('Usage: node scripts/import-signal-section.js <section_xlsx> --signals <csv-or-xlsx> [--commit]');
  process.exit(1);
}

for (const p of [sectionXlsxPath, signalsPath]) {
  if (!fs.existsSync(p)) {
    console.error(`File not found: ${p}`);
    process.exit(1);
  }
}

// ----------------------------------------------------------------------------
// Helpers (shared shape with import-signals.js but inlined to keep this script
// standalone)
// ----------------------------------------------------------------------------
const ALLOWED_DIRECTION = ['UP', 'DN', 'BOTH', 'UNKNOWN'];
const ALLOWED_SIGNAL_TYPE = ['Automatic', 'Semi-Automatic', 'Manual', 'Gate', 'IBS', 'Repeater', 'Board', 'Other'];
const ALLOWED_PLACEMENT = ['Left', 'Right', 'Extreme Right', 'Extreme Left', 'Gantry', 'Unknown'];
const ALLOWED_ON_CURVE = ['Left', 'Right', 'None', 'Unknown'];

function clean(v) { return v === undefined || v === null ? '' : String(v).trim(); }
function nullableString(v) { const s = clean(v); return s === '' ? null : s; }
function nullableNumber(v) { const s = clean(v); if (s === '') return null; const n = Number(s); return Number.isFinite(n) ? n : null; }
function nullableInt(v) { const s = clean(v); if (s === '') return null; const n = Number(s); return Number.isInteger(n) ? n : null; }
function toBool01(v) {
  const s = clean(v).toLowerCase();
  if (s === '' || s === '0' || s === 'no' || s === 'false' || s === 'n') return 0;
  if (s === '1' || s === 'yes' || s === 'true' || s === 'y') return 1;
  return null;
}
function normalizeSignalNumber(s) {
  return clean(s).toUpperCase().replace(/\s+/g, '').replace(/[\/\-_.]/g, '');
}
function normalizeHeader(h) {
  return clean(h).toLowerCase().replace(/\s+/g, '_');
}

function readSheet(workbook, sheetName) {
  if (!workbook.SheetNames.includes(sheetName)) return null;
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', raw: false });
  return rows.map((raw) => {
    const obj = {};
    for (const [k, v] of Object.entries(raw)) {
      obj[normalizeHeader(k)] = v;
    }
    return obj;
  });
}

// ----------------------------------------------------------------------------
// Signal parsing (matches relaxed import-signals.js validation)
// ----------------------------------------------------------------------------
function parseSignalRow(raw, rowNo, errors) {
  const signalNumber = clean(raw.signal_number);
  const section = clean(raw.section);
  const line = clean(raw.line);

  if (signalNumber === '') errors.push(`Signals row ${rowNo}: blank signal_number`);
  if (section === '') errors.push(`Signals row ${rowNo}: blank section`);
  if (line === '') errors.push(`Signals row ${rowNo}: blank line`);

  const direction = clean(raw.direction) || 'UNKNOWN';
  const signalType = clean(raw.signal_type) || 'Automatic';
  const placement = clean(raw.placement) || 'Unknown';
  const onCurve = clean(raw.on_curve) || 'Unknown';

  if (!ALLOWED_DIRECTION.includes(direction)) errors.push(`Signals row ${rowNo}: invalid direction "${direction}"`);
  if (!ALLOWED_SIGNAL_TYPE.includes(signalType)) errors.push(`Signals row ${rowNo}: invalid signal_type "${signalType}"`);
  if (!ALLOWED_PLACEMENT.includes(placement)) errors.push(`Signals row ${rowNo}: invalid placement "${placement}"`);
  if (!ALLOWED_ON_CURVE.includes(onCurve)) errors.push(`Signals row ${rowNo}: invalid on_curve "${onCurve}"`);

  const boolCols = ['is_rhs', 'is_ext_rhs', 'is_lhs', 'is_ext_lhs', 'has_legend_board', 'has_calling_on', 'has_shunt_signal', 'is_active'];
  const bools = {};
  for (const col of boolCols) {
    const raw_val = clean(raw[col]);
    if (raw_val === '') {
      bools[col] = col === 'is_active' ? 1 : 0;
    } else {
      const parsed = toBool01(raw_val);
      if (parsed === null) errors.push(`Signals row ${rowNo}: invalid bool for ${col} "${raw_val}"`);
      bools[col] = parsed;
    }
  }

  const reqInts = { ri_left_arms: 0, ri_right_arms: 0 };
  for (const [col, def] of Object.entries(reqInts)) {
    if (clean(raw[col]) === '') reqInts[col] = def;
    else {
      const n = Number(raw[col]);
      if (!Number.isInteger(n) || n < 0) errors.push(`Signals row ${rowNo}: invalid int for ${col}`);
      else reqInts[col] = n;
    }
  }

  const lat = nullableNumber(raw.latitude);
  const lon = nullableNumber(raw.longitude);
  if (lat !== null && (lat < -90 || lat > 90)) errors.push(`Signals row ${rowNo}: latitude out of range`);
  if (lon !== null && (lon < -180 || lon > 180)) errors.push(`Signals row ${rowNo}: longitude out of range`);

  return {
    signal_number: signalNumber,
    normalized_signal_number: normalizeSignalNumber(signalNumber),
    station_code: nullableString(raw.station_code),
    station_name: nullableString(raw.station_name),
    section, line, direction,
    location_text: nullableString(raw.location_text),
    km_text: nullableString(raw.km_text),
    km_from_csmt: nullableNumber(raw.km_from_csmt),
    latitude: lat, longitude: lon,
    signal_type: signalType,
    signal_function: nullableString(raw.signal_function),
    aspects: nullableInt(raw.aspects),
    placement, on_curve: onCurve,
    curve_remarks: nullableString(raw.curve_remarks),
    ...bools,
    ri_left_arms: reqInts.ri_left_arms,
    ri_right_arms: reqInts.ri_right_arms,
    book_description: nullableString(raw.book_description),
    route_indicator_notes: nullableString(raw.route_indicator_notes),
    technical_remarks: nullableString(raw.technical_remarks),
    visibility_distance_m: nullableInt(raw.visibility_distance_m),
    sighting_remarks: nullableString(raw.sighting_remarks)
  };
}

// ----------------------------------------------------------------------------
// PSR parsing
// ----------------------------------------------------------------------------
function parsePsrRow(raw, rowNo, errors) {
  const section = clean(raw.section);
  const line = clean(raw.line);
  const direction = clean(raw.direction) || 'UNKNOWN';
  const startKm = clean(raw.start_km_text);
  const endKm = clean(raw.end_km_text);
  const speed = nullableInt(raw.speed_kmph);
  const insertBefore = clean(raw.insert_before_signal);

  if (section === '') errors.push(`PSR row ${rowNo}: blank section`);
  if (line === '') errors.push(`PSR row ${rowNo}: blank line`);
  if (!ALLOWED_DIRECTION.includes(direction)) errors.push(`PSR row ${rowNo}: invalid direction`);
  if (startKm === '') errors.push(`PSR row ${rowNo}: blank start_km_text`);
  if (endKm === '') errors.push(`PSR row ${rowNo}: blank end_km_text`);
  if (speed === null) errors.push(`PSR row ${rowNo}: missing speed_kmph`);
  if (insertBefore === '') errors.push(`PSR row ${rowNo}: blank insert_before_signal`);

  return {
    psr_code: nullableString(raw.psr_code),
    section, line, direction,
    start_km_text: startKm,
    end_km_text: endKm,
    start_km_decimal: nullableNumber(raw.start_km_decimal),
    end_km_decimal: nullableNumber(raw.end_km_decimal),
    speed_kmph: speed,
    start_latitude: nullableNumber(raw.start_latitude),
    start_longitude: nullableNumber(raw.start_longitude),
    end_latitude: nullableNumber(raw.end_latitude),
    end_longitude: nullableNumber(raw.end_longitude),
    reason: nullableString(raw.reason),
    remarks: nullableString(raw.remarks),
    insert_before_signal: insertBefore
  };
}

// ----------------------------------------------------------------------------
// Inserts (station headers + boards + N/S — simple text rows)
// ----------------------------------------------------------------------------
function parseInsertRow(raw, rowNo, errors) {
  const text = clean(raw.station_header || raw.display_description || raw.text);
  const before = clean(raw.before_signal || raw.insert_before_signal);
  const rowTypeIn = clean(raw.row_type).toUpperCase();
  const rowType = rowTypeIn || 'STATION_HEADER';
  const validTypes = ['STATION_HEADER', 'BOARD', 'NEUTRAL_SECTION', 'TEXT_NOTE', 'BLANK', 'SECTION_HEADER'];

  if (!validTypes.includes(rowType)) {
    errors.push(`Inserts row ${rowNo}: invalid row_type "${rowType}"`);
  }
  if (text === '' && rowType !== 'BLANK') {
    errors.push(`Inserts row ${rowNo}: blank text`);
  }
  // before_signal may be blank for terminal stations — they append at end.

  // Sensible defaults based on type
  let highlight = clean(raw.highlight_color).toUpperCase() || (rowType === 'STATION_HEADER' ? 'PURPLE' : 'NONE');
  let textColor = clean(raw.text_color).toUpperCase() || 'BLACK';
  let iconType = clean(raw.icon_type).toUpperCase() || 'NONE';

  return {
    row_type: rowType,
    display_description: text,
    display_location: nullableString(raw.display_location),
    display_signal_no: nullableString(raw.display_signal_no),
    station_code: nullableString(raw.station_code),
    station_name: nullableString(raw.station_name),
    station_km_text: nullableString(raw.station_km_text),
    highlight_color: highlight,
    text_color: textColor,
    icon_type: iconType,
    remarks: nullableString(raw.remarks),
    insert_before_signal: before
  };
}

// ----------------------------------------------------------------------------
// DB ops
// ----------------------------------------------------------------------------
async function getConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'bbtro',
    multipleStatements: false
  });
}

async function upsertSignal(conn, row) {
  const sql = `
    INSERT INTO div_signals (
      signal_number, normalized_signal_number, station_code, station_name,
      section, line, direction, location_text, km_text, km_from_csmt,
      latitude, longitude, signal_type, signal_function, aspects,
      placement, on_curve, curve_remarks,
      is_rhs, is_ext_rhs, is_lhs, is_ext_lhs,
      has_legend_board, has_calling_on, has_shunt_signal,
      ri_left_arms, ri_right_arms,
      book_description, route_indicator_notes, technical_remarks,
      visibility_distance_m, sighting_remarks, is_active
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      id = LAST_INSERT_ID(id),
      signal_number = VALUES(signal_number),
      station_code = VALUES(station_code), station_name = VALUES(station_name),
      direction = VALUES(direction),
      location_text = VALUES(location_text), km_text = VALUES(km_text),
      km_from_csmt = VALUES(km_from_csmt),
      latitude = VALUES(latitude), longitude = VALUES(longitude),
      signal_type = VALUES(signal_type), signal_function = VALUES(signal_function),
      aspects = VALUES(aspects),
      placement = VALUES(placement), on_curve = VALUES(on_curve),
      curve_remarks = VALUES(curve_remarks),
      is_rhs = VALUES(is_rhs), is_ext_rhs = VALUES(is_ext_rhs),
      is_lhs = VALUES(is_lhs), is_ext_lhs = VALUES(is_ext_lhs),
      has_legend_board = VALUES(has_legend_board),
      has_calling_on = VALUES(has_calling_on),
      has_shunt_signal = VALUES(has_shunt_signal),
      ri_left_arms = VALUES(ri_left_arms), ri_right_arms = VALUES(ri_right_arms),
      book_description = VALUES(book_description),
      route_indicator_notes = VALUES(route_indicator_notes),
      technical_remarks = VALUES(technical_remarks),
      visibility_distance_m = VALUES(visibility_distance_m),
      sighting_remarks = VALUES(sighting_remarks),
      is_active = VALUES(is_active)
  `;
  const [res] = await conn.execute(sql, [
    row.signal_number, row.normalized_signal_number, row.station_code, row.station_name,
    row.section, row.line, row.direction, row.location_text, row.km_text, row.km_from_csmt,
    row.latitude, row.longitude, row.signal_type, row.signal_function, row.aspects,
    row.placement, row.on_curve, row.curve_remarks,
    row.is_rhs, row.is_ext_rhs, row.is_lhs, row.is_ext_lhs,
    row.has_legend_board, row.has_calling_on, row.has_shunt_signal,
    row.ri_left_arms, row.ri_right_arms,
    row.book_description, row.route_indicator_notes, row.technical_remarks,
    row.visibility_distance_m, row.sighting_remarks, row.is_active
  ]);
  return res.insertId;
}

async function upsertSignalAlias(conn, signalId, signalNumber) {
  await conn.execute(`
    INSERT INTO div_signal_aliases
      (signal_id, alias_text, normalized_alias, source, confidence, remarks, is_active)
    VALUES (?, ?, ?, 'excel_import', 'HIGH', 'Auto alias from section import', 1)
    ON DUPLICATE KEY UPDATE
      signal_id = VALUES(signal_id), alias_text = VALUES(alias_text),
      source = VALUES(source), confidence = VALUES(confidence), is_active = 1
  `, [signalId, signalNumber, normalizeSignalNumber(signalNumber)]);
}

async function upsertSection(conn, info) {
  await conn.execute(`
    INSERT INTO div_signal_book_sections
      (section_code, section_title, direction, line, is_active)
    VALUES (?, ?, ?, ?, 1)
    ON DUPLICATE KEY UPDATE
      section_title = VALUES(section_title),
      direction = VALUES(direction),
      line = VALUES(line),
      is_active = 1
  `, [info.section_code, info.section_title, info.direction, info.line]);
  const [rows] = await conn.execute(
    `SELECT id FROM div_signal_book_sections WHERE section_code = ?`,
    [info.section_code]
  );
  return rows[0].id;
}

async function upsertPsr(conn, p) {
  // No natural unique key on div_psr beyond id, so use section+line+direction+
  // start_km_text+end_km_text+speed as a logical match for upsert.
  const [existing] = await conn.execute(`
    SELECT id FROM div_psr
    WHERE section = ? AND line = ? AND direction = ?
      AND start_km_text = ? AND end_km_text = ? AND speed_kmph = ?
  `, [p.section, p.line, p.direction, p.start_km_text, p.end_km_text, p.speed_kmph]);

  if (existing.length > 0) {
    const id = existing[0].id;
    await conn.execute(`
      UPDATE div_psr SET
        psr_code = ?, start_km_decimal = ?, end_km_decimal = ?,
        start_latitude = ?, start_longitude = ?,
        end_latitude = ?, end_longitude = ?,
        reason = ?, remarks = ?
      WHERE id = ?
    `, [
      p.psr_code, p.start_km_decimal, p.end_km_decimal,
      p.start_latitude, p.start_longitude, p.end_latitude, p.end_longitude,
      p.reason, p.remarks, id
    ]);
    return id;
  }

  const [res] = await conn.execute(`
    INSERT INTO div_psr (
      psr_code, section, line, direction,
      start_km_text, end_km_text, start_km_decimal, end_km_decimal,
      speed_kmph, start_latitude, start_longitude, end_latitude, end_longitude,
      reason, remarks
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `, [
    p.psr_code, p.section, p.line, p.direction,
    p.start_km_text, p.end_km_text, p.start_km_decimal, p.end_km_decimal,
    p.speed_kmph, p.start_latitude, p.start_longitude, p.end_latitude, p.end_longitude,
    p.reason, p.remarks
  ]);
  return res.insertId;
}

async function replaceSectionRows(conn, sectionId, bookRows) {
  await conn.execute(`DELETE FROM div_signal_book_rows WHERE book_section_id = ?`, [sectionId]);

  for (const r of bookRows) {
    await conn.execute(`
      INSERT INTO div_signal_book_rows (
        book_section_id, row_order, row_type, row_source,
        signal_id, psr_id, neutral_section_id,
        display_signal_no, display_location, display_description,
        speed_kmph, km_range_text,
        station_code, station_name, station_km_text,
        highlight_color, text_color, icon_type, remarks, is_active
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
    `, [
      sectionId, r.row_order, r.row_type, 'import',
      r.signal_id || null, r.psr_id || null, r.neutral_section_id || null,
      r.display_signal_no, r.display_location, r.display_description,
      r.speed_kmph || null, r.km_range_text || null,
      r.station_code, r.station_name, r.station_km_text,
      r.highlight_color, r.text_color, r.icon_type, r.remarks
    ]);
  }
}

// ----------------------------------------------------------------------------
// Row-order computation: signals get 100, 200, 300...; inserts slot in
// before the named target at (target_row_order - 50, -60, -70 for siblings).
// Blank before_signal on a STATION_HEADER means terminus → append at end.
// ----------------------------------------------------------------------------
function buildBookRows(parsedSignals, signalIdByNumber, inserts, parsedPsrs, psrIdByKey) {
  const ROW_STEP = 100;
  const INSERT_BASE_OFFSET = -50;
  const INSERT_SIBLING_STEP = -10;

  const signalRowOrder = {};
  const signalRows = parsedSignals.map((s, idx) => {
    const ro = (idx + 1) * ROW_STEP;
    signalRowOrder[s.signal_number] = ro;
    return {
      row_order: ro,
      row_type: 'SIGNAL',
      signal_id: signalIdByNumber[s.signal_number] || null,
      display_signal_no: s.signal_number,
      display_location: s.location_text || s.km_text || null,
      display_description: s.book_description || null,
      station_code: s.station_code, station_name: s.station_name,
      station_km_text: null,
      highlight_color: 'NONE',
      text_color: (s.is_rhs || s.is_ext_rhs) ? 'RED' : 'BLACK',
      icon_type: s.has_legend_board ? 'LEGEND_BOARD' : 'NONE',
      remarks: null
    };
  });

  const lastSignalOrder = signalRows.length > 0 ? signalRows[signalRows.length - 1].row_order : 0;

  // Group inserts by target so siblings can use sub-offsets
  const insertsByTarget = new Map();
  for (const ins of inserts) {
    const t = ins.insert_before_signal || '__END__';
    if (!insertsByTarget.has(t)) insertsByTarget.set(t, []);
    insertsByTarget.get(t).push({ kind: 'insert', payload: ins });
  }
  for (const p of parsedPsrs) {
    const t = p.insert_before_signal;
    if (!insertsByTarget.has(t)) insertsByTarget.set(t, []);
    insertsByTarget.get(t).push({ kind: 'psr', payload: p });
  }

  const insertRows = [];
  for (const [target, group] of insertsByTarget) {
    const baseOrder = target === '__END__'
      ? lastSignalOrder + ROW_STEP
      : (signalRowOrder[target] || 0) + INSERT_BASE_OFFSET;

    if (target !== '__END__' && !signalRowOrder[target]) {
      throw new Error(`Insert target signal not found in spine: "${target}"`);
    }

    group.forEach((entry, i) => {
      const ro = baseOrder + (i * INSERT_SIBLING_STEP);

      if (entry.kind === 'insert') {
        const ins = entry.payload;
        insertRows.push({
          row_order: ro,
          row_type: ins.row_type,
          display_signal_no: ins.display_signal_no,
          display_location: ins.display_location,
          display_description: ins.display_description,
          station_code: ins.station_code,
          station_name: ins.station_name,
          station_km_text: ins.station_km_text,
          highlight_color: ins.highlight_color,
          text_color: ins.text_color,
          icon_type: ins.icon_type,
          remarks: ins.remarks,
          signal_id: null, psr_id: null, neutral_section_id: null
        });
      } else {
        const p = entry.payload;
        insertRows.push({
          row_order: ro,
          row_type: 'PSR',
          psr_id: psrIdByKey[psrKey(p)] || null,
          display_signal_no: null,
          display_location: null,
          display_description: p.reason || null,
          speed_kmph: p.speed_kmph,
          km_range_text: `${p.start_km_text}-${p.end_km_text}`,
          station_code: null, station_name: null, station_km_text: null,
          highlight_color: 'YELLOW',
          text_color: 'BLACK',
          icon_type: 'PSR',
          remarks: p.remarks
        });
      }
    });
  }

  return [...signalRows, ...insertRows].sort((a, b) => a.row_order - b.row_order);
}

function psrKey(p) {
  return `${p.section}|${p.line}|${p.direction}|${p.start_km_text}|${p.end_km_text}|${p.speed_kmph}`;
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  console.log('='.repeat(60));
  console.log('Per-Section Signal Book Import');
  console.log('='.repeat(60));
  console.log(`Section : ${path.resolve(sectionXlsxPath)}`);
  console.log(`Signals : ${path.resolve(signalsPath)}`);
  console.log(`Mode    : ${shouldCommit ? 'COMMIT' : 'DRY RUN'}`);
  console.log('='.repeat(60));

  const errors = [];
  const warnings = [];

  // --- read & parse section xlsx ---
  const sectionWb = xlsx.readFile(sectionXlsxPath, { cellDates: false, raw: false });
  const sectionInfoRows = readSheet(sectionWb, 'section_info') || [];
  const insertsRaw = readSheet(sectionWb, 'inserts') || [];
  const psrRaw = readSheet(sectionWb, 'PSR') || readSheet(sectionWb, 'psr') || [];

  if (sectionInfoRows.length !== 1) {
    errors.push(`section_info sheet must have exactly 1 row, found ${sectionInfoRows.length}`);
  }
  const info = sectionInfoRows[0] || {};
  for (const k of ['section_code', 'section_title', 'direction', 'line']) {
    if (clean(info[k]) === '') errors.push(`section_info missing "${k}"`);
  }
  if (info.direction && !ALLOWED_DIRECTION.includes(clean(info.direction))) {
    errors.push(`section_info: invalid direction "${info.direction}"`);
  }

  const inserts = insertsRaw.map((r, i) => parseInsertRow(r, i + 2, errors));
  const psrs = psrRaw.map((r, i) => parsePsrRow(r, i + 2, errors));

  // --- read & parse signals file (csv or xlsx) ---
  const signalsWb = xlsx.readFile(signalsPath, { cellDates: false, raw: false });
  const signalsSheetName = signalsWb.SheetNames.includes('signals')
    ? 'signals'
    : signalsWb.SheetNames[0];
  const signalsRaw = readSheet(signalsWb, signalsSheetName) || [];
  if (signalsRaw.length === 0) errors.push('Signals file has no rows');

  const parsedSignals = [];
  const seenSignalKeys = new Set();
  signalsRaw.forEach((raw, i) => {
    if (Object.values(raw).every((v) => clean(v) === '')) return; // skip blank lines
    const row = parseSignalRow(raw, i + 2, errors);
    const key = `${row.normalized_signal_number}|${row.section}|${row.line}`;
    if (seenSignalKeys.has(key)) {
      errors.push(`Signals row ${i + 2}: duplicate signal+section+line "${row.signal_number}"`);
    }
    seenSignalKeys.add(key);
    parsedSignals.push(row);
  });

  // --- cross-validate inserts and PSRs target real signals ---
  const signalNumberSet = new Set(parsedSignals.map((s) => s.signal_number));
  for (const ins of inserts) {
    if (ins.insert_before_signal && !signalNumberSet.has(ins.insert_before_signal)) {
      errors.push(`Insert references unknown signal: "${ins.insert_before_signal}"`);
    }
  }
  for (const p of psrs) {
    if (p.insert_before_signal && !signalNumberSet.has(p.insert_before_signal)) {
      errors.push(`PSR references unknown signal: "${p.insert_before_signal}"`);
    }
  }

  // --- report ---
  console.log(`Section_info     : ${sectionInfoRows.length === 1 ? 'OK — ' + info.section_code : 'MISSING/INVALID'}`);
  console.log(`Signals rows     : ${parsedSignals.length}`);
  console.log(`Inserts rows     : ${inserts.length}`);
  console.log(`PSR rows         : ${psrs.length}`);
  console.log(`Warnings         : ${warnings.length}`);
  console.log(`Errors           : ${errors.length}`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('\nERRORS:');
    errors.slice(0, 50).forEach((e) => console.log(' -', e));
    if (errors.length > 50) console.log(`... ${errors.length - 50} more`);
    console.log('\nImport stopped due to validation errors.');
    process.exit(1);
  }

  if (!shouldCommit) {
    console.log('\nDry run successful. Re-run with --commit to write.');
    return;
  }

  // --- commit ---
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // 1. Upsert signal master + aliases
    const signalIdByNumber = {};
    for (const s of parsedSignals) {
      const id = await upsertSignal(conn, s);
      signalIdByNumber[s.signal_number] = id;
      await upsertSignalAlias(conn, id, s.signal_number);
    }

    // 2. Upsert section
    const sectionId = await upsertSection(conn, {
      section_code: clean(info.section_code),
      section_title: clean(info.section_title),
      direction: clean(info.direction),
      line: clean(info.line)
    });

    // 3. Upsert PSRs
    const psrIdByKey = {};
    for (const p of psrs) {
      const id = await upsertPsr(conn, p);
      psrIdByKey[psrKey(p)] = id;
    }

    // 4. Build + replace book rows
    const bookRows = buildBookRows(parsedSignals, signalIdByNumber, inserts, psrs, psrIdByKey);
    await replaceSectionRows(conn, sectionId, bookRows);

    await conn.commit();

    console.log('\nImport complete.');
    console.log(`Signals upserted : ${parsedSignals.length}`);
    console.log(`PSRs upserted    : ${psrs.length}`);
    console.log(`Section          : id=${sectionId} (${info.section_code})`);
    console.log(`Book rows        : ${bookRows.length} (replaced atomically)`);
    console.log(`  SIGNAL         : ${bookRows.filter((r) => r.row_type === 'SIGNAL').length}`);
    console.log(`  STATION_HEADER : ${bookRows.filter((r) => r.row_type === 'STATION_HEADER').length}`);
    console.log(`  PSR            : ${bookRows.filter((r) => r.row_type === 'PSR').length}`);
    console.log(`  Other          : ${bookRows.filter((r) => !['SIGNAL', 'STATION_HEADER', 'PSR'].includes(r.row_type)).length}`);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('\nFAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
