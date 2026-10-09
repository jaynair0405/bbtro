'use strict';

/*
 * CMS breach of rest -> "Lobbywise Breach of Rest".
 *
 *   S.NO | ZONE | DIVISION | YESTERDAY | LAST FORTNIGHT | LAST MONTH
 *
 * One row per division (CMS always gives yesterday — there is no date choice) plus a
 * zone [TOTAL] row. There is NO lobby split, yet the sheet prints one per lobby:
 * The sheet table is lobby x period (Yesterday / Last fortnight / Last month):
 *   - a period at 0 in the file -> every lobby 0
 *   - a period above 0          -> "?" per lobby, and a warning asks for the split,
 *                                  typed in through "Fill by hand" (manual below)
 * The division's three figures print as a second sheet table (user, 2026-10-09).
 *
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

const OUR_DIVISION = 'CSTM';
// Lobbies printed on the daily sheet, in sheet order (25/09 and 08/10/2026 sheets).
const SHEET_LOBBIES = ['CSMT', 'IGP', 'KYN', 'LNLX', 'PNVL'];

const FIELDS = [
  { key: 'division',  aliases: ['DIVISION'] },
  { key: 'yesterday', aliases: ['YESTERDAY'] },
  { key: 'fortnight', aliases: ['LAST FORTNIGHT'] },
  { key: 'month',     aliases: ['LAST MONTH'] },
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

const PERIODS = [
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'fortnight', label: 'Last Fortnight' },
  { key: 'month',     label: 'Last Month' },
];

/*
 * Returns { div: { yesterday, fortnight, month }, lobbies: { period: {lobby: n} | null }, warnings }
 *   a period's lobby split is null when unknown (file figure above 0).
 */
function parseBor(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the breach of rest report: DIVISION, YESTERDAY, LAST FORTNIGHT and LAST MONTH are required.');

  const rec = records.slice(1).find((r) => norm(r[col.division]) === OUR_DIVISION);
  if (!rec) throw new Error(`${OUR_DIVISION} is not in this download — check the CMS filter.`);
  const num = (k) => {
    const raw = String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
    if (!/^\d+$/.test(raw)) throw new Error(`${OUR_DIVISION} has a non-numeric count "${raw}".`);
    return Number(raw);
  };
  const div = {};
  const lobbies = {};
  PERIODS.forEach((p) => {
    div[p.key] = num(p.key);
    // Zero splits itself; anything else needs the lobbies typed in.
    lobbies[p.key] = div[p.key] === 0 ? Object.fromEntries(SHEET_LOBBIES.map((l) => [l, 0])) : null;
  });
  const unknown = PERIODS.filter((p) => !lobbies[p.key]).map((p) => `${p.label.toLowerCase()} ${div[p.key]}`);
  const warnings = unknown.length
    ? [`${OUR_DIVISION} has breaches of rest (${unknown.join(', ')}) but the file gives no lobby split — enter it under "Fill by hand".`]
    : [];
  return { div, lobbies, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { div, lobbies } = parsed;
  const main = {
    title: 'Lobbywise Breach of Rest',
    headers: ['Period', ...SHEET_LOBBIES],
    rows: PERIODS.map((p) => [p.label, ...SHEET_LOBBIES.map((l) => (lobbies[p.key] ? lobbies[p.key][l] : '?'))]),
    total: null,
    alertCols: SHEET_LOBBIES.map((_, i) => i + 1),
  };
  const division = {
    title: `${OUR_DIVISION} division`,
    headers: ['Division', ...PERIODS.map((p) => p.label)],
    rows: [[OUR_DIVISION, ...PERIODS.map((p) => div[p.key])]],
    total: null,
    alertCols: [1, 2, 3],
    sheet: true,               // printed with the lobby table
  };
  return [main, division];
}

// Hand entry: every lobby x period, shown as the sheet table; the division figures are the sums.
const manual = {
  fields: SHEET_LOBBIES.flatMap((l) => PERIODS.map((p) => ({ key: `${l}|${p.key}`, label: `${l} ${p.label.replace('Last ', '')}` }))),
  grid: {
    rows: PERIODS.map((p) => ({ key: p.key, label: p.label })),
    cols: SHEET_LOBBIES.map((l) => ({ key: l, label: l })),
  },
  build(values) {
    const div = {};
    const lobbies = {};
    PERIODS.forEach((p) => {
      lobbies[p.key] = {};
      SHEET_LOBBIES.forEach((l) => {
        const raw = String(values[`${l}|${p.key}`] == null ? '' : values[`${l}|${p.key}`]).trim();
        if (!/^\d+$/.test(raw)) throw new Error(`${l} ${p.label}: enter a whole number (0 if none).`);
        lobbies[p.key][l] = Number(raw);
      });
      div[p.key] = SHEET_LOBBIES.reduce((s, l) => s + lobbies[p.key][l], 0);
    });
    return { div, lobbies, warnings: [] };
  },
};

module.exports = {
  key: 'bor',
  dateOffset: 1,          // data date = sheet date − 1 day(s)
  label: 'Lobbywise Breach of Rest',
  order: 130,
  matchesHeader,
  parse: parseBor,
  tables,
  manual,
};
