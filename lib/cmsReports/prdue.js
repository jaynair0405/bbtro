'use strict';

/*
 * CMS PR (pre-run counselling) due -> "PR Overdue".
 *
 *   S. No. | LOBBY | NO PR IN LAST 7 DAYS | NO PR IN LAST 3 MONTHS
 *
 * Already a count per lobby. The sheet prints the 7-day column only, in one row
 * across the lobbies, LNL left out (user, 2026-10-09); the 3-month column is kept
 * in the detail table.
 *
 * Also fillable by hand from the page (manual.build) — same tables either way.
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

// Lobbies printed on the daily sheet, in sheet order. LNL is in the download but
// not on the sheet; it and any other lobby go to the detail table only.
const SHEET_LOBBIES = ['CSMT', 'IGP', 'KYN', 'LNLX', 'PNVL', 'VVH'];

const FIELDS = [
  { key: 'lobby', aliases: ['LOBBY'] },
  { key: 'd7',    aliases: ['NO PR IN LAST 7 DAYS'] },
  { key: 'm3',    aliases: ['NO PR IN LAST 3 MONTHS'] },
];

function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, ' ');
}

function columnMap(header) {
  const cells = (header || []).map(norm);
  const map = {};
  for (const f of FIELDS) {
    const i = cells.findIndex((c) => f.aliases.includes(c));
    if (i === -1) return null;
    map[f.key] = i;
  }
  return map;
}

function matchesHeader(header) {
  return columnMap(header) !== null;
}

/*
 * Returns { lobbies: [{ lobby, d7, m3 }], warnings }   (m3 null when entered by hand)
 */
function parsePrDue(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the PR due report: LOBBY, NO PR IN LAST 7 DAYS and NO PR IN LAST 3 MONTHS are required.');

  const lobbies = [];
  records.slice(1).forEach((rec, i) => {
    const lobby = norm(rec[col.lobby]);
    if (!lobby || lobby.includes('TOTAL')) return;
    const num = (k) => {
      const raw = String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`Row ${i + 2} (${lobby}) has a non-numeric count "${raw}".`);
      return Number(raw);
    };
    lobbies.push({ lobby, d7: num('d7'), m3: num('m3') });
  });
  if (lobbies.length === 0) throw new Error('The file has a header but no lobby rows.');
  return { lobbies, warnings: [] };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { lobbies } = parsed;
  const d7 = (l) => (lobbies.find((x) => x.lobby === l) || { d7: 0 }).d7;

  const main = {
    title: 'PR Overdue',
    note: 'Crew with no PR in the last 7 days.',
    headers: ['Crew / Lobby', ...SHEET_LOBBIES],
    rows: [['TOTAL', ...SHEET_LOBBIES.map(d7)]],
    total: null,
    alertCols: SHEET_LOBBIES.map((_, i) => i + 1),
  };
  const manual = lobbies.every((l) => l.m3 === null);
  const detail = {
    title: 'All lobbies',
    headers: ['Lobby', 'No PR in last 7 days', 'No PR in last 3 months'],
    rows: lobbies.map((l) => [l.lobby, l.d7, l.m3 === null ? '' : l.m3]),
    total: ['TOTAL', lobbies.reduce((s, l) => s + l.d7, 0), manual ? '' : lobbies.reduce((s, l) => s + l.m3, 0)],
  };
  return [main, detail];
}

// Hand entry: one 7-day count per sheet lobby.
const manual = {
  fields: SHEET_LOBBIES.map((l) => ({ key: l, label: l })),
  build(values) {
    const lobbies = SHEET_LOBBIES.map((l) => {
      const raw = String(values[l] == null ? '' : values[l]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`${l}: enter a whole number (0 if none).`);
      return { lobby: l, d7: Number(raw), m3: null };
    });
    return { lobbies, warnings: [] };
  },
};

module.exports = {
  key: 'prdue',
  dateOffset: 1,          // data date = sheet date − 1 day(s)
  label: 'PR Overdue',
  order: 110,
  matchesHeader,
  parse: parsePrDue,
  tables,
  manual,
};
