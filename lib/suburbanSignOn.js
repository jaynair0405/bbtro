'use strict';

/*
 * Parser for the CMS "SIGN ON/OFF DETAIL REPORT - KIOSK SIGN ON" Excel export.
 *
 * Layout of the sheet (one lobby, one time window per file):
 *   row 1  "CMS | REPORT"                                        (banner, merged)
 *   row 2  " SIGN ON/OFF DETAIL REPORT -KIOSK SIGN ON For Period-26-07-2026 13:00-27-07-2026
 *           00:00 LOBBY : CSTS  Print Date Time : 30-07-2026 10:03"
 *   row 3  header
 *   row 4+ data
 *
 * The header repeats a block of seven names twice — once for sign-on, once for
 * sign-off:
 *   S.NO | CREW ID | CREW NAME | SET NO |
 *   STTN | TIME | BA VALUE | BA TOKEN | PERSONAL MOBILE USED | IP | SUP APPROVAL | USER ID   <- sign ON
 *   STTN | TIME | BA VALUE | BA TOKEN | PERSONAL MOBILE USED | IP | SUP APPROVAL | USER ID   <- sign OFF
 *
 * So columns are resolved BY HEADER NAME, and the repeated ones by occurrence
 * (1st TIME = sign-on, 2nd TIME = sign-off). This is the lesson from lib/cmsReport.js:
 * a CMS export gained a column once and fixed indices parsed it silently wrong. If a
 * required header cannot be found we throw rather than guess.
 */

const ExcelJS = require('exceljs');

function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, ' ');
}

// Fields that appear once. First alias that matches wins.
const SIMPLE_FIELDS = [
  { key: 'sNo',      aliases: ['S.NO', 'S.NO.', 'SNO', 'SR.NO'] },
  { key: 'crewId',   aliases: ['CREW ID', 'CREW-ID', 'CREWID'] },
  { key: 'crewName', aliases: ['CREW NAME', 'NAME'] },
  { key: 'setNo',    aliases: ['SET NO', 'SET NO.', 'SETNO', 'DETAIL NO'] },
];

// Fields that appear twice — once per block. [signOnKey, signOffKey].
const PAIRED_FIELDS = [
  { aliases: ['STTN', 'STATION'], keys: ['onStation', 'offStation'] },
  { aliases: ['TIME'],            keys: ['onTime', 'offTime'] },
];

/*
 * Resolve the column map from the header row (array of cell values, 0-based).
 * Returns { map, warnings }. Throws if a required column is absent.
 */
function buildColumnMap(headerCells) {
  const cells = (headerCells || []).map(norm);
  const warnings = [];
  const map = {};
  const missing = [];

  const firstIdx = new Map();
  cells.forEach((c, i) => { if (c && !firstIdx.has(c)) firstIdx.set(c, i); });

  for (const f of SIMPLE_FIELDS) {
    const hit = f.aliases.find((a) => firstIdx.has(a));
    if (hit === undefined) missing.push(f.aliases[0]);
    else map[f.key] = firstIdx.get(hit);
  }

  for (const f of PAIRED_FIELDS) {
    const hit = f.aliases.find((a) => cells.includes(a));
    if (hit === undefined) { missing.push(`${f.aliases[0]} (×2)`); continue; }
    const idxs = cells.map((c, i) => (c === hit ? i : -1)).filter((i) => i >= 0);
    if (idxs.length < 2) {
      missing.push(`${hit} (found ${idxs.length}, need 2 — sign-on and sign-off)`);
      continue;
    }
    if (idxs.length > 2) {
      warnings.push(`Header has ${idxs.length} "${hit}" columns; using the first two (sign-on, sign-off).`);
    }
    map[f.keys[0]] = idxs[0];
    map[f.keys[1]] = idxs[1];
  }

  if (missing.length) {
    throw new Error(
      `This does not look like a CMS Sign On/Off report — could not find these columns ` +
      `by header name: ${missing.join(', ')}.`
    );
  }
  return { map, warnings };
}

// "DD-MM-YYYY HH:MM" -> Date (local). Returns null when unparseable.
// Also accepts a real Date, in case Excel typed the cell.
function parseCmsDateTime(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const m = String(value).trim().match(/^(\d{2})-(\d{2})-(\d{4})[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const [, dd, mo, yyyy, hh, mi, ss] = m;
  const d = new Date(Number(yyyy), Number(mo) - 1, Number(dd), Number(hh), Number(mi), Number(ss || 0));
  return isNaN(d.getTime()) ? null : d;
}

// Lobby + window out of the row-2 title line.
function parseTitle(title) {
  const t = String(title || '');
  const out = { lobby: null, periodFrom: null, periodTo: null };
  const period = t.match(
    /For\s*Period\s*-?\s*(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})\s*-\s*(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})/i
  );
  if (period) {
    out.periodFrom = parseCmsDateTime(period[1]);
    out.periodTo = parseCmsDateTime(period[2]);
  }
  const lobby = t.match(/LOBBY\s*:\s*([A-Z0-9]+)/i);
  if (lobby) out.lobby = lobby[1].toUpperCase();
  return out;
}

// exceljs row.values is 1-based with a null at index 0 — drop it.
function rowCells(row) {
  const v = row.values || [];
  return Array.isArray(v) ? v.slice(1) : [];
}

// Find the header row within the first few rows (the banner rows above it vary).
function findHeaderRow(ws) {
  const limit = Math.min(10, ws.rowCount);
  for (let i = 1; i <= limit; i++) {
    const cells = rowCells(ws.getRow(i)).map(norm);
    if (cells.includes('CREW ID')) return i;
  }
  return null;
}

/*
 * Parse one workbook (Buffer or file path).
 * Returns { fileName, lobby, periodFrom, periodTo, rows: [...], warnings: [...] }
 * Each row: { crewId, crewName, setNo, onStation, signOn, offStation, signOff, sourceFile }
 */
async function parseSignOnFile(input, fileName) {
  const wb = new ExcelJS.Workbook();
  if (Buffer.isBuffer(input)) await wb.xlsx.load(input);
  else await wb.xlsx.readFile(input);

  const ws = wb.worksheets[0];
  if (!ws) throw new Error(`${fileName || 'file'}: the workbook has no sheets.`);

  const headerRowNo = findHeaderRow(ws);
  if (!headerRowNo) {
    throw new Error(
      `${fileName || 'file'}: no header row found in the first rows — ` +
      `expected a "CREW ID" column. Is this a CMS Sign On/Off report?`
    );
  }

  const { map, warnings } = buildColumnMap(rowCells(ws.getRow(headerRowNo)));

  // The title sits above the header; scan up for the "For Period" line.
  let meta = { lobby: null, periodFrom: null, periodTo: null };
  for (let i = headerRowNo - 1; i >= 1; i--) {
    const first = rowCells(ws.getRow(i)).find((c) => c != null && String(c).trim() !== '');
    const m = parseTitle(first);
    if (m.periodFrom || m.lobby) { meta = m; break; }
  }
  if (!meta.lobby) warnings.push(`${fileName || 'file'}: lobby not found in the report title.`);
  if (!meta.periodFrom || !meta.periodTo) {
    warnings.push(`${fileName || 'file'}: report period not found in the title — coverage for this file is unknown.`);
  }

  const rows = [];
  let skipped = 0;
  for (let i = headerRowNo + 1; i <= ws.rowCount; i++) {
    const c = rowCells(ws.getRow(i));
    const crewId = String(c[map.crewId] == null ? '' : c[map.crewId]).trim().toUpperCase();
    if (!crewId) continue; // blank / footer row

    const signOn = parseCmsDateTime(c[map.onTime]);
    const signOff = parseCmsDateTime(c[map.offTime]);
    const setNo = String(c[map.setNo] == null ? '' : c[map.setNo]).trim();

    if (!signOn || !signOff || !setNo) { skipped++; continue; }

    rows.push({
      crewId,
      crewName: String(c[map.crewName] == null ? '' : c[map.crewName]).trim(),
      setNo,
      onStation: String(c[map.onStation] == null ? '' : c[map.onStation]).trim().toUpperCase(),
      signOn,
      offStation: String(c[map.offStation] == null ? '' : c[map.offStation]).trim().toUpperCase(),
      signOff,
      sourceFile: fileName || null,
    });
  }

  if (skipped) {
    warnings.push(
      `${fileName || 'file'}: ${skipped} row(s) skipped — missing sign-on time, sign-off time or SET NO ` +
      `(an open duty that had not signed off when the report was taken looks like this).`
    );
  }
  if (rows.length === 0) warnings.push(`${fileName || 'file'}: no usable duty rows found.`);

  return { fileName: fileName || null, lobby: meta.lobby, periodFrom: meta.periodFrom, periodTo: meta.periodTo, rows, warnings };
}

module.exports = { buildColumnMap, parseCmsDateTime, parseTitle, parseSignOnFile };
