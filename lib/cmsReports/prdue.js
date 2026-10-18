'use strict';

/*
 * CMS PR (pre-run counselling) due -> "PR Overdue".
 *
 *   S. No. | LOBBY | NO PR IN LAST 7 DAYS | NO PR IN LAST 3 MONTHS
 *
 * Already a count per lobby. The sheet prints both columns as two rows across the
 * lobbies (7 days / 3 months — the 3-month row since 17-10-2026), LNL left out (user,
 * 2026-10-09); every lobby is in the detail table.
 *
 * Also fillable by hand from the page (manual.build) — same tables either way.
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

// Lobbies printed on the daily sheet, in sheet order (file order; suburban CSTS / KYNS /
// PNVS beside their mainline lobby since 18-10-2026). LNL is in the download but not on
// the sheet (user, 2026-10-09); it and any other lobby go to the detail table only.
const SHEET_LOBBIES = ['CSMT', 'CSTS', 'IGP', 'KYN', 'KYNS', 'LNLX', 'PNVL', 'PNVS', 'VVH'];

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

  const m3 = (l) => { const x = lobbies.find((x) => x.lobby === l); return x && x.m3 !== null ? x.m3 : ''; };   // '' = not entered

  const main = {
    title: 'PR Overdue',
    note: 'Crew with no PR in the last 7 days, and with none in the last 3 months.',
    headers: ['Crew / Lobby', ...SHEET_LOBBIES],
    rows: [['No PR in last 7 days', ...SHEET_LOBBIES.map(d7)], ['No PR in last 3 months', ...SHEET_LOBBIES.map(m3)]],
    total: null,
    alertCols: SHEET_LOBBIES.map((_, i) => i + 1),
  };
  const allM3 = lobbies.every((l) => l.m3 !== null);
  const detail = {
    title: 'All lobbies',
    headers: ['Lobby', 'No PR in last 7 days', 'No PR in last 3 months'],
    rows: lobbies.map((l) => [l.lobby, l.d7, l.m3 === null ? '' : l.m3]),
    total: ['TOTAL', lobbies.reduce((s, l) => s + l.d7, 0), allM3 ? lobbies.reduce((s, l) => s + l.m3, 0) : ''],
  };
  return [main, detail];
}

// Hand entry: one 7-day count per sheet lobby (required) and one 3-month count (optional:
// blank = not entered -> blank on the sheet, nothing stored; a 0 is a real 0).
const manual = {
  fields: [...SHEET_LOBBIES.map((l) => ({ key: l, label: `${l} · 7 days` })),
    ...SHEET_LOBBIES.map((l) => ({ key: `${l}_m3`, label: `${l} · 3 months`, blank: true }))],
  build(values) {
    const lobbies = SHEET_LOBBIES.map((l) => {
      const raw = String(values[l] == null ? '' : values[l]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`${l}: enter a whole number (0 if none).`);
      const raw3 = String(values[`${l}_m3`] == null ? '' : values[`${l}_m3`]).trim();
      if (raw3 && !/^\d+$/.test(raw3)) throw new Error(`${l} · 3 months: enter a whole number, or leave it blank.`);
      return { lobby: l, d7: Number(raw), m3: raw3 ? Number(raw3) : null };
    });
    return { lobbies, warnings: [] };
  },
};

/*
 * What is stored (store.js): per lobby (every lobby in the file, or the sheet lobbies
 * when typed in) d7 = no PR in the last 7 days, m3 = in the last 3 months (only where
 * known — a blank typed 3-month box stores nothing, rather than 0); their sums as
 * DIVISION (m3 only when every lobby has it).
 */
function facts(parsed) {
  const counts = [];
  parsed.lobbies.forEach((l) => {
    counts.push({ lobby: l.lobby, measure: 'd7', value: l.d7 });
    if (l.m3 !== null) counts.push({ lobby: l.lobby, measure: 'm3', value: l.m3 });
  });
  counts.push({ lobby: 'DIVISION', measure: 'd7', value: parsed.lobbies.reduce((s, l) => s + l.d7, 0) });
  if (parsed.lobbies.every((l) => l.m3 !== null)) {
    counts.push({ lobby: 'DIVISION', measure: 'm3', value: parsed.lobbies.reduce((s, l) => s + l.m3, 0) });
  }
  return { counts, crew: [] };
}

module.exports = {
  key: 'prdue',
  dateOffset: 1,          // data date = sheet date − 1 day(s)
  label: 'PR Overdue',
  order: 110,
  matchesHeader,
  parse: parsePrDue,
  tables,
  facts,
  manual,
};
