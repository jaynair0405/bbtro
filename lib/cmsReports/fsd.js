'use strict';

/*
 * CMS "Lobbywise FSD details" processing core.
 *
 * FSD = Fog Signal Device. The crew collect one from the lobby at sign-on and
 * return it at sign-off: FSD Y = collected, FSD N = signed on without it. N is the
 * column that matters — those are the cases someone has to explain.
 *
 *   S.NO | ZONE | DIVISION | SIGN ON STATION | CREW DESIGNATION | FSD Y | FSD N | FSD ALL
 *
 * One row per lobby x designation, all COUNTS. Unlike wrwor.js this download names
 * its columns, so they are located by header name.
 *
 * CMS also writes its own totals INTO the data: a "Z[TOTAL]_<lobby>" row after each
 * lobby (in the CREW DESIGNATION column) and a final "Z[TOTAL]_<division>" row (in
 * the SIGN ON STATION column). They are never counted — read as a designation they
 * would double every lobby — but they are not thrown away either: each is compared
 * with our own sum, which is the only check we have that the download is complete.
 * The first FSD file received was short of five lobbies and looked perfectly valid.
 *
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record: left to auto-detect, csv-parse locks onto the first
// one it sees and silently merges any row that ends differently into the next.
const EOL = ['\r\n', '\n', '\r'];

const CAPTION = 'Fog Signal Device — collected from the lobby at sign-on, returned at sign-off. ' +
  'Y = collected, N = not collected.';

// Lobbies printed on the daily sheet, in sheet order. Every other lobby in the
// download is still parsed and reported under "Other lobbies" — nothing is dropped.
const SHEET_LOBBIES = ['CSMT', 'IGP', 'KYN', 'PNVL', 'VVH'];

const FIELDS = [
  { key: 'lobby', aliases: ['SIGN ON STATION'] },
  { key: 'desig', aliases: ['CREW DESIGNATION'] },
  { key: 'y',     aliases: ['FSD Y'] },
  { key: 'n',     aliases: ['FSD N'] },
  { key: 'all',   aliases: ['FSD ALL'] },
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

// This report, and no other, carries all three FSD columns.
function matchesHeader(header) {
  return columnMap(header) !== null;
}

const isTotal = (cell) => /^Z\[TOTAL\]/.test(cell);
const zero = () => ({ y: 0, n: 0, all: 0 });
const add = (into, from) => { into.y += from.y; into.n += from.n; into.all += from.all; };
const same = (a, b) => a.y === b.y && a.n === b.n && a.all === b.all;
const fmt = (c) => `${c.y} / ${c.n} / ${c.all}`;

/*
 * Parse a CSV buffer/string.
 * Returns { rows, lobbies, division, warnings }
 *   rows     [{ lobby, desig, y, n, all }]        designation rows only
 *   lobbies  [{ lobby, y, n, all }]               every lobby in the file, file order
 *   division { y, n, all }                        our sum over every lobby
 */
function parseFsd(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the Lobbywise FSD report: SIGN ON STATION, CREW DESIGNATION, FSD Y, FSD N and FSD ALL columns are all required.');

  const warnings = [];
  const rows = [];
  const byLobby = new Map();
  const cmsLobbyTotal = new Map();
  let cmsDivisionTotal = null;

  records.slice(1).forEach((rec, i) => {
    const lobby = norm(rec[col.lobby]);
    const desig = norm(rec[col.desig]);
    const where = `Row ${i + 2} (${lobby} ${desig})`;
    const counts = {};
    ['y', 'n', 'all'].forEach((k) => {
      const raw = String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`${where} has a non-numeric count "${raw}".`);
      counts[k] = Number(raw);
    });
    if (counts.y + counts.n !== counts.all) {
      warnings.push(`${where}: FSD Y ${counts.y} + FSD N ${counts.n} does not equal FSD ALL ${counts.all}.`);
    }

    if (isTotal(lobby)) { cmsDivisionTotal = counts; return; }
    if (isTotal(desig)) { cmsLobbyTotal.set(lobby, counts); return; }
    if (!lobby || !desig) throw new Error(`Row ${i + 2} has no lobby or designation.`);

    rows.push({ lobby, desig, ...counts });
    if (!byLobby.has(lobby)) byLobby.set(lobby, zero());
    add(byLobby.get(lobby), counts);
  });

  if (rows.length === 0) throw new Error('The file has a header but no data rows.');

  const lobbies = [...byLobby.entries()].map(([lobby, c]) => ({ lobby, ...c }));
  const division = zero();
  lobbies.forEach((l) => add(division, l));

  // Cross-check against the totals CMS wrote into the file.
  lobbies.forEach((l) => {
    const cms = cmsLobbyTotal.get(l.lobby);
    if (!cms) warnings.push(`${l.lobby}: the download has no CMS total row for this lobby — it may be incomplete.`);
    else if (!same(cms, l)) warnings.push(`${l.lobby}: rows add up to ${fmt(l)} (Y / N / All) but the CMS total row says ${fmt(cms)} — the download may be incomplete.`);
  });
  if (!cmsDivisionTotal) warnings.push('The download has no CMS division total row — it may have been cut short.');
  else if (!same(cmsDivisionTotal, division)) {
    warnings.push(`All lobbies add up to ${fmt(division)} (Y / N / All) but the CMS division total says ${fmt(cmsDivisionTotal)} — the download may be incomplete.`);
  }

  // A sheet lobby absent from the file prints as zeros, which reads as "nobody signed
  // on" — say so, since that is exactly how the short download went unnoticed.
  SHEET_LOBBIES.filter((s) => !byLobby.has(s))
    .forEach((s) => warnings.push(`${s} is on the daily sheet but not in this download — shown as 0. Check the CMS filter.`));

  return { rows, lobbies, division, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows, lobbies, division } = parsed;
  const find = (name) => lobbies.find((l) => l.lobby === name) || { lobby: name, ...zero() };

  const shown = SHEET_LOBBIES.map(find);
  const shownTotal = zero();
  shown.forEach((l) => add(shownTotal, l));
  const main = {
    title: 'Lobbywise FSD Details',
    note: CAPTION,
    headers: ['Sr No.', 'Lobby', 'FSD (Y)', 'FSD (N)', 'Total'],
    rows: shown.map((l, i) => [i + 1, l.lobby, l.y, l.n, l.all]),
    total: ['', 'TOTAL', shownTotal.y, shownTotal.n, shownTotal.all],
    alertCols: [3],
  };

  // N first: this table exists to show where crew signed on without the device.
  const byDesig = {
    title: 'By designation — daily-sheet lobbies',
    headers: ['Lobby', 'Desig.', 'FSD (N)', 'FSD (Y)', 'Total'],
    rows: rows.filter((r) => SHEET_LOBBIES.includes(r.lobby))
      .sort((a, b) => SHEET_LOBBIES.indexOf(a.lobby) - SHEET_LOBBIES.indexOf(b.lobby))
      .map((r) => [r.lobby, r.desig, r.n, r.y, r.all]),
    total: ['TOTAL', '', shownTotal.n, shownTotal.y, shownTotal.all],
    alertCols: [2],
  };

  const others = lobbies.filter((l) => !SHEET_LOBBIES.includes(l.lobby));
  const otherTotal = zero();
  others.forEach((l) => add(otherTotal, l));
  const rest = {
    title: 'Other lobbies in the download (not on the daily sheet)',
    headers: ['Lobby', 'FSD (Y)', 'FSD (N)', 'Total'],
    rows: others.map((l) => [l.lobby, l.y, l.n, l.all]),
    total: others.length ? ['TOTAL', otherTotal.y, otherTotal.n, otherTotal.all] : null,
    note: `Division total, all lobbies: FSD (Y) ${division.y}, FSD (N) ${division.n}, Total ${division.all}.`,
    emptyText: 'The download has no other lobbies.',
    alertCols: [2],
  };

  return [main, byDesig, rest];
}

module.exports = {
  key: 'fsd',
  label: 'Lobbywise FSD Details',
  order: 20,
  matchesHeader,
  parse: parseFsd,
  tables,
  SHEET_LOBBIES,
};
