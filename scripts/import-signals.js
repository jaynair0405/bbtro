/**
 * Import Signal Master Excel into div_signals + div_signal_aliases
 *
 * Dry run:
 *   node scripts/import-signals.js ./signal.xlsx
 *
 * Commit import:
 *   node scripts/import-signals.js ./signal.xlsx --commit
 *
 * Required npm packages:
 *   npm install xlsx mysql2 dotenv
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mysql = require('mysql2/promise');

const filePath = process.argv[2];
const shouldCommit = process.argv.includes('--commit');

if (!filePath) {
  console.error('Usage: node scripts/import-signals.js ./signal.xlsx [--commit]');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Schema-strict minimum. Everything else is optional — blank cells get a
// schema default or stay NULL, and the end-of-run summary reports coverage
// so partial beats can be backfilled later.
const REQUIRED_HEADERS = [
  'signal_number',
  'section',
  'line'
];

const ALLOWED_DIRECTION = ['UP', 'DN', 'BOTH', 'UNKNOWN'];

const ALLOWED_SIGNAL_TYPE = [
  'Automatic',
  'Semi-Automatic',
  'Manual',
  'Gate',
  'IBS',
  'Repeater',
  'Board',
  'Other'
];

const ALLOWED_SIGNAL_FUNCTION = [
  '',
  'Double Distant',
  'Distant',
  'Inner Distant',
  'Home',
  'Inner Home',
  'Starter',
  'Starter (Loop)',
  'Advanced Starter',
  'IBS',
  'IBS Distant',
  'Gate Distant',
  'Repeater',
  'Other'
];

const ALLOWED_PLACEMENT = [
  'Left',
  'Right',
  'Extreme Right',
  'Extreme Left',
  'Gantry',
  'Unknown'
];

const ALLOWED_ON_CURVE = [
  'Left',
  'Right',
  'None',
  'Unknown'
];

const BOOL_COLUMNS = [
  'is_rhs',
  'is_ext_rhs',
  'is_lhs',
  'is_ext_lhs',
  'has_legend_board',
  'has_calling_on',
  'has_shunt_signal',
  'is_active'
];

// NOT NULL ints — blank means "no arms", store 0.
const REQUIRED_INT_COLUMNS = [
  'ri_left_arms',
  'ri_right_arms'
];

// Nullable ints — blank stays NULL so we can tell "not measured" from "0".
const OPTIONAL_INT_COLUMNS = [
  'aspects',
  'visibility_distance_m'
];

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function nullableString(value) {
  const v = clean(value);
  return v === '' ? null : v;
}

function nullableNumber(value) {
  const v = clean(value);
  if (v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function nullableInt(value) {
  const v = clean(value);
  if (v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function toBool01(value) {
  const v = clean(value).toLowerCase();

  if (v === '' || v === '0' || v === 'no' || v === 'false' || v === 'n') {
    return 0;
  }

  if (v === '1' || v === 'yes' || v === 'true' || v === 'y') {
    return 1;
  }

  return null;
}

function normalizeSignalNumber(signalNumber) {
  return clean(signalNumber)
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[\/\-_.]/g, '');
}

function normalizeAlias(value) {
  return clean(value)
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[\/\-_.]/g, '');
}

function normalizeHeader(header) {
  return clean(header)
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function validatePlacementFlags(row, rowNo, errors, warnings) {
  const placement = clean(row.placement);
  const isRhs = row.is_rhs;
  const isExtRhs = row.is_ext_rhs;
  const isLhs = row.is_lhs;
  const isExtLhs = row.is_ext_lhs;

  const flagTotal = isRhs + isExtRhs + isLhs + isExtLhs;

  if (flagTotal > 1) {
    errors.push(`Row ${rowNo}: only one placement flag can be 1`);
  }

  if (placement === 'Right' && isRhs !== 1) {
    warnings.push(`Row ${rowNo}: placement is Right but is_rhs is not 1`);
  }

  if (placement === 'Extreme Right' && isExtRhs !== 1) {
    warnings.push(`Row ${rowNo}: placement is Extreme Right but is_ext_rhs is not 1`);
  }

  if (placement === 'Left' && isLhs !== 1) {
    warnings.push(`Row ${rowNo}: placement is Left but is_lhs is not 1`);
  }

  if (placement === 'Extreme Left' && isExtLhs !== 1) {
    warnings.push(`Row ${rowNo}: placement is Extreme Left but is_ext_lhs is not 1`);
  }
}

function validateRiText(row, rowNo, warnings) {
  const leftArms = Number(row.ri_left_arms || 0);
  const rightArms = Number(row.ri_right_arms || 0);
  const desc = clean(row.book_description).toUpperCase();

  if (leftArms > 0 || rightArms > 0) {
    if (!desc.includes('RI:')) {
      warnings.push(`Row ${rowNo}: RI arms present but book_description does not start/include RI:`);
    }
  }

  for (let i = 1; i <= leftArms; i++) {
    if (!desc.includes(`L${i}=`)) {
      warnings.push(`Row ${rowNo}: ri_left_arms=${leftArms} but L${i}= not found in book_description`);
    }
  }

  for (let i = 1; i <= rightArms; i++) {
    if (!desc.includes(`R${i}=`)) {
      warnings.push(`Row ${rowNo}: ri_right_arms=${rightArms} but R${i}= not found in book_description`);
    }
  }
}

function buildRow(raw, rowNo, errors, warnings) {
  const row = {};

  for (const [key, value] of Object.entries(raw)) {
    row[normalizeHeader(key)] = value;
  }

  for (const required of REQUIRED_HEADERS) {
    if (clean(row[required]) === '') {
      errors.push(`Row ${rowNo}: missing required field "${required}"`);
    }
  }

  const signalNumber = clean(row.signal_number);
  const normalizedSignalNumber = normalizeSignalNumber(signalNumber);

  const direction = clean(row.direction) || 'UNKNOWN';
  const signalType = clean(row.signal_type) || 'Automatic';
  const signalFunction = clean(row.signal_function);
  const placement = clean(row.placement) || 'Unknown';
  const onCurve = clean(row.on_curve) || 'Unknown';

  if (!ALLOWED_DIRECTION.includes(direction)) {
    errors.push(`Row ${rowNo}: invalid direction "${direction}"`);
  }

  if (!ALLOWED_SIGNAL_TYPE.includes(signalType)) {
    errors.push(`Row ${rowNo}: invalid signal_type "${signalType}"`);
  }

  if (!ALLOWED_SIGNAL_FUNCTION.includes(signalFunction)) {
    errors.push(`Row ${rowNo}: invalid signal_function "${signalFunction}"`);
  }

  if (!ALLOWED_PLACEMENT.includes(placement)) {
    errors.push(`Row ${rowNo}: invalid placement "${placement}"`);
  }

  if (!ALLOWED_ON_CURVE.includes(onCurve)) {
    errors.push(`Row ${rowNo}: invalid on_curve "${onCurve}"`);
  }

  for (const col of BOOL_COLUMNS) {
    const raw = clean(row[col]);
    if (raw === '') {
      // is_active defaults to 1 (active); all other flags default to 0.
      row[col] = col === 'is_active' ? 1 : 0;
      continue;
    }
    const parsed = toBool01(raw);
    if (parsed === null) {
      errors.push(`Row ${rowNo}: invalid boolean value for "${col}" — "${raw}"`);
    } else {
      row[col] = parsed;
    }
  }

  for (const col of REQUIRED_INT_COLUMNS) {
    if (clean(row[col]) === '') {
      row[col] = 0;
      continue;
    }
    const parsed = Number(row[col]);
    if (!Number.isInteger(parsed) || parsed < 0) {
      errors.push(`Row ${rowNo}: invalid integer value for "${col}"`);
    } else {
      row[col] = parsed;
    }
  }

  for (const col of OPTIONAL_INT_COLUMNS) {
    const raw = clean(row[col]);
    if (raw === '') {
      row[col] = null;
      continue;
    }
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0) {
      errors.push(`Row ${rowNo}: invalid integer value for "${col}"`);
    } else {
      row[col] = parsed;
    }
  }

  const latitude = nullableNumber(row.latitude);
  const longitude = nullableNumber(row.longitude);

  // lat/long are optional. Only validate range when a value was provided.
  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    errors.push(`Row ${rowNo}: latitude out of range (${latitude})`);
  }

  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    errors.push(`Row ${rowNo}: longitude out of range (${longitude})`);
  }

  // km_from_csmt is optional — many signals don't have a clean KM measurement yet.
  const kmFromCsmt = nullableNumber(row.km_from_csmt);

  const finalRow = {
    signal_number: signalNumber,
    normalized_signal_number: normalizedSignalNumber,

    station_code: nullableString(row.station_code),
    station_name: nullableString(row.station_name),

    section: clean(row.section),
    line: clean(row.line),
    direction,

    location_text: nullableString(row.location_text),
    km_text: nullableString(row.km_text),
    km_from_csmt: kmFromCsmt,

    latitude,
    longitude,

    signal_type: signalType,
    signal_function: signalFunction === '' ? null : signalFunction,
    aspects: nullableInt(row.aspects),

    placement,
    on_curve: onCurve,
    curve_remarks: nullableString(row.curve_remarks),

    is_rhs: row.is_rhs,
    is_ext_rhs: row.is_ext_rhs,
    is_lhs: row.is_lhs,
    is_ext_lhs: row.is_ext_lhs,

    has_legend_board: row.has_legend_board,
    has_calling_on: row.has_calling_on,
    has_shunt_signal: row.has_shunt_signal,

    ri_left_arms: row.ri_left_arms,
    ri_right_arms: row.ri_right_arms,

    book_description: nullableString(row.book_description),
    route_indicator_notes: nullableString(row.route_indicator_notes),
    technical_remarks: nullableString(row.technical_remarks),

    visibility_distance_m: nullableInt(row.visibility_distance_m),
    sighting_remarks: nullableString(row.sighting_remarks),

    is_active: row.is_active
  };

  validatePlacementFlags(finalRow, rowNo, errors, warnings);
  validateRiText(finalRow, rowNo, warnings);

  return finalRow;
}

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

async function importSignals(rows) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    let insertedOrUpdated = 0;
    let aliasesTouched = 0;

    for (const row of rows) {
      const sql = `
        INSERT INTO div_signals (
          signal_number,
          normalized_signal_number,
          station_code,
          station_name,
          section,
          line,
          direction,
          location_text,
          km_text,
          km_from_csmt,
          latitude,
          longitude,
          signal_type,
          signal_function,
          aspects,
          placement,
          on_curve,
          curve_remarks,
          is_rhs,
          is_ext_rhs,
          is_lhs,
          is_ext_lhs,
          has_legend_board,
          has_calling_on,
          has_shunt_signal,
          ri_left_arms,
          ri_right_arms,
          book_description,
          route_indicator_notes,
          technical_remarks,
          visibility_distance_m,
          sighting_remarks,
          is_active
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        ON DUPLICATE KEY UPDATE
          id = LAST_INSERT_ID(id),
          signal_number = VALUES(signal_number),
          station_code = VALUES(station_code),
          station_name = VALUES(station_name),
          direction = VALUES(direction),
          location_text = VALUES(location_text),
          km_text = VALUES(km_text),
          km_from_csmt = VALUES(km_from_csmt),
          latitude = VALUES(latitude),
          longitude = VALUES(longitude),
          signal_type = VALUES(signal_type),
          signal_function = VALUES(signal_function),
          aspects = VALUES(aspects),
          placement = VALUES(placement),
          on_curve = VALUES(on_curve),
          curve_remarks = VALUES(curve_remarks),
          is_rhs = VALUES(is_rhs),
          is_ext_rhs = VALUES(is_ext_rhs),
          is_lhs = VALUES(is_lhs),
          is_ext_lhs = VALUES(is_ext_lhs),
          has_legend_board = VALUES(has_legend_board),
          has_calling_on = VALUES(has_calling_on),
          has_shunt_signal = VALUES(has_shunt_signal),
          ri_left_arms = VALUES(ri_left_arms),
          ri_right_arms = VALUES(ri_right_arms),
          book_description = VALUES(book_description),
          route_indicator_notes = VALUES(route_indicator_notes),
          technical_remarks = VALUES(technical_remarks),
          visibility_distance_m = VALUES(visibility_distance_m),
          sighting_remarks = VALUES(sighting_remarks),
          is_active = VALUES(is_active)
      `;

      const values = [
        row.signal_number,
        row.normalized_signal_number,
        row.station_code,
        row.station_name,
        row.section,
        row.line,
        row.direction,
        row.location_text,
        row.km_text,
        row.km_from_csmt,
        row.latitude,
        row.longitude,
        row.signal_type,
        row.signal_function,
        row.aspects,
        row.placement,
        row.on_curve,
        row.curve_remarks,
        row.is_rhs,
        row.is_ext_rhs,
        row.is_lhs,
        row.is_ext_lhs,
        row.has_legend_board,
        row.has_calling_on,
        row.has_shunt_signal,
        row.ri_left_arms,
        row.ri_right_arms,
        row.book_description,
        row.route_indicator_notes,
        row.technical_remarks,
        row.visibility_distance_m,
        row.sighting_remarks,
        row.is_active
      ];

      const [result] = await connection.execute(sql, values);
      const signalId = result.insertId;
      insertedOrUpdated++;

      const aliasText = row.signal_number;
      const normalizedAlias = normalizeAlias(row.signal_number);

      await connection.execute(
        `
        INSERT INTO div_signal_aliases (
          signal_id,
          alias_text,
          normalized_alias,
          source,
          confidence,
          remarks,
          is_active
        ) VALUES (?, ?, ?, 'excel_import', 'HIGH', 'Auto alias from signal import', 1)
        ON DUPLICATE KEY UPDATE
          signal_id = VALUES(signal_id),
          alias_text = VALUES(alias_text),
          source = VALUES(source),
          confidence = VALUES(confidence),
          is_active = 1
        `,
        [signalId, aliasText, normalizedAlias]
      );

      aliasesTouched++;
    }

    await connection.commit();

    return {
      insertedOrUpdated,
      aliasesTouched
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

function readExcelRows() {
  const workbook = xlsx.readFile(filePath, {
    cellDates: false,
    raw: false
  });

  if (!workbook.SheetNames.includes('signals')) {
    throw new Error(`Sheet "signals" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
  }

  const sheet = workbook.Sheets.signals;

  const rows = xlsx.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false
  });

  return rows;
}

function validateHeaders(rows) {
  if (rows.length === 0) {
    throw new Error('No data rows found in signals sheet');
  }

  const headers = Object.keys(rows[0]).map(normalizeHeader);

  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

  if (missing.length > 0) {
    throw new Error(`Missing required headers: ${missing.join(', ')}`);
  }
}

async function main() {
  console.log('============================================================');
  console.log('Signal Import Script');
  console.log('============================================================');
  console.log(`File      : ${path.resolve(filePath)}`);
  console.log(`Mode      : ${shouldCommit ? 'COMMIT' : 'DRY RUN'}`);
  console.log('Sheet     : signals');
  console.log('============================================================');

  const rawRows = readExcelRows();
  validateHeaders(rawRows);

  const errors = [];
  const warnings = [];
  const parsedRows = [];

  const seenKeys = new Set();

  rawRows.forEach((raw, index) => {
    const rowNo = index + 2;

    if (Object.values(raw).every((v) => clean(v) === '')) {
      return;
    }

    const row = buildRow(raw, rowNo, errors, warnings);

    const key = `${row.normalized_signal_number}|${row.section}|${row.line}`;

    if (seenKeys.has(key)) {
      errors.push(`Row ${rowNo}: duplicate in Excel for signal + section + line: ${row.signal_number}, ${row.section}, ${row.line}`);
    }

    seenKeys.add(key);
    parsedRows.push(row);
  });

  console.log(`Rows read : ${rawRows.length}`);
  console.log(`Rows used : ${parsedRows.length}`);
  console.log(`Warnings  : ${warnings.length}`);
  console.log(`Errors    : ${errors.length}`);
  console.log('============================================================');

  printCoverageReport(parsedRows);

  if (warnings.length > 0) {
    console.log('\nWARNINGS:');
    warnings.slice(0, 100).forEach((w) => console.log(`- ${w}`));

    if (warnings.length > 100) {
      console.log(`... ${warnings.length - 100} more warnings not shown`);
    }
  }

  if (errors.length > 0) {
    console.log('\nERRORS:');
    errors.slice(0, 100).forEach((e) => console.log(`- ${e}`));

    if (errors.length > 100) {
      console.log(`... ${errors.length - 100} more errors not shown`);
    }

    console.log('\nImport stopped because validation errors were found.');
    process.exit(1);
  }

  if (!shouldCommit) {
    console.log('\nDry run successful. No database changes made.');
    console.log('Run again with --commit to insert/update div_signals and div_signal_aliases.');
    return;
  }

  const result = await importSignals(parsedRows);

  console.log('\nImport completed successfully.');
  console.log(`Signals inserted/updated : ${result.insertedOrUpdated}`);
  console.log(`Aliases inserted/updated : ${result.aliasesTouched}`);
}

// Per-field count of rows with missing/default values. Lets the user see at
// a glance how much backfill is pending after a partial import (e.g. when
// lat/long aren't ready yet).
function printCoverageReport(rows) {
  if (rows.length === 0) return;

  const trackedNullable = [
    'station_code', 'station_name', 'location_text', 'km_text', 'km_from_csmt',
    'latitude', 'longitude', 'signal_function', 'aspects', 'curve_remarks',
    'book_description', 'technical_remarks', 'visibility_distance_m', 'sighting_remarks'
  ];

  const trackedDefaulted = {
    direction: 'UNKNOWN',
    signal_type: 'Automatic',
    placement: 'Unknown',
    on_curve: 'Unknown'
  };

  const total = rows.length;
  const lines = [];

  for (const col of trackedNullable) {
    const missing = rows.filter((r) => r[col] === null || r[col] === undefined).length;
    if (missing > 0) {
      lines.push(`  ${col.padEnd(24)} : ${missing}/${total} blank`);
    }
  }

  for (const [col, defVal] of Object.entries(trackedDefaulted)) {
    const defaulted = rows.filter((r) => r[col] === defVal).length;
    if (defaulted > 0) {
      lines.push(`  ${col.padEnd(24)} : ${defaulted}/${total} = "${defVal}" (default)`);
    }
  }

  if (lines.length === 0) {
    console.log('\nCoverage  : every tracked field populated — no backfill pending.');
    return;
  }

  console.log('\nCoverage  : missing / defaulted fields (backfill candidates):');
  lines.forEach((l) => console.log(l));
}

main().catch((error) => {
  console.error('\nFAILED:', error.message);
  process.exit(1);
});