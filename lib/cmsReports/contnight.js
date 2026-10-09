'use strict';

/*
 * CMS "continuous night working" -> "Continuous Night Working".
 *
 * CMS gives this as THREE downloads — crew who worked 3, 4 and more than 4 nights
 * running — and all three have the identical header:
 *
 *   SNo. | Zone | Division | Lobby | Designation | Crew Count
 *
 * One row per lobby x designation, all-India. Nothing inside a file says which of
 * the three it is, and CMS names every download "CMS  REPORT (n).csv", so the user
 * says it instead: the page has a 3 / 4 / >4 slot per part and posts them together
 * (POST daily/upload-night). The main drop zone refuses this header for that reason.
 *
 * The sheet prints one combined table — a row per part, a column per lobby, CSTM
 * only. The other divisions are not shown (user, 2026-10-09).
 *
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

const OUR_DIVISION = 'CSTM';

// Lobbies printed on the daily sheet, in sheet order. Any other CSTM lobby is still
// counted and reported under "Other lobbies" — nothing is dropped.
const SHEET_LOBBIES = ['CSMT', 'IGP', 'KYN', 'LNLX', 'PNVL'];

// The three parts, in sheet order. `slot` is the form field the page posts.
const PARTS = [
  { slot: 'n3', label: '3 nights' },
  { slot: 'n4', label: '4 nights' },
  { slot: 'n5', label: '>4 nights' },
];

const FIELDS = [
  { key: 'division', aliases: ['DIVISION'] },
  { key: 'lobby',    aliases: ['LOBBY'] },
  { key: 'desig',    aliases: ['DESIGNATION'] },
  { key: 'count',    aliases: ['CREW COUNT'] },
];

function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, ' ');
}

function columnMap(header) {
  const cells = (header || []).map(norm);
  // Exactly these six columns: a looser match could claim some other lobby-wise count.
  if (cells.length !== 6 || cells[0] !== 'SNO.' || cells[1] !== 'ZONE') return null;
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
 * One part file -> { byLobby: {lobby: n}, byDesig: {"lobby|desig": n}, rows }
 * (CSTM rows only; `rows` is the all-India row count, for the warning text).
 */
function parsePart(buffer, label) {
  const records = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error(`${label}: the file is empty.`);
  const col = columnMap(records[0]);
  if (!col) throw new Error(`${label}: not the continuous night working report (SNo., Zone, Division, Lobby, Designation, Crew Count).`);

  const byLobby = {};
  const byDesig = {};
  records.slice(1).forEach((rec, i) => {
    if (norm(rec[col.division]) !== OUR_DIVISION) return;
    const lobby = norm(rec[col.lobby]);
    const desig = norm(rec[col.desig]);
    const raw = String(rec[col.count] == null ? '' : rec[col.count]).trim();
    if (!/^\d+$/.test(raw)) throw new Error(`${label}: row ${i + 2} (${lobby}) has a non-numeric crew count "${raw}".`);
    byLobby[lobby] = (byLobby[lobby] || 0) + Number(raw);
    byDesig[`${lobby}|${desig}`] = (byDesig[`${lobby}|${desig}`] || 0) + Number(raw);
  });
  return { byLobby, byDesig, rows: records.length - 1 };
}

/*
 * files: { n3?: Buffer, n4?: Buffer, n5?: Buffer } — at least one.
 * Returns { parts: { n3: part|null, ... }, warnings }
 */
function parseParts(files) {
  const parts = {};
  const warnings = [];
  PARTS.forEach((p) => { parts[p.slot] = files[p.slot] ? parsePart(files[p.slot], p.label) : null; });
  if (PARTS.every((p) => !parts[p.slot])) throw new Error('No night working file uploaded.');
  PARTS.forEach((p) => {
    if (!parts[p.slot]) warnings.push(`${p.label} not uploaded.`);
  });
  return { parts, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { parts } = parsed;
  const loaded = PARTS.filter((p) => parts[p.slot]);
  const lobbiesSeen = new Set(loaded.flatMap((p) => Object.keys(parts[p.slot].byLobby)));
  const others = [...lobbiesSeen].filter((l) => !SHEET_LOBBIES.includes(l)).sort();

  const main = {
    title: 'Continuous Night Working',
    note: 'CSTM crew who worked 3, 4 or more than 4 nights in a row.',
    headers: ['Nights', ...SHEET_LOBBIES],
    rows: PARTS.map((p) => (parts[p.slot]
      ? [p.label, ...SHEET_LOBBIES.map((l) => parts[p.slot].byLobby[l] || 0)]
      : [p.label, ...SHEET_LOBBIES.map(() => '—')])),
    total: null,
    alertCols: SHEET_LOBBIES.map((_, i) => i + 1),
  };

  const out = [main];
  if (others.length) {
    out.push({
      title: 'Other lobbies',
      headers: ['Nights', ...others],
      rows: loaded.map((p) => [p.label, ...others.map((l) => parts[p.slot].byLobby[l] || 0)]),
      total: null,
    });
  }

  // Lobby x designation, a column per loaded part.
  const keys = [...new Set(loaded.flatMap((p) => Object.keys(parts[p.slot].byDesig)))].sort();
  out.push({
    title: 'By lobby and designation',
    headers: ['Lobby', 'Designation', ...loaded.map((p) => p.label)],
    rows: keys.map((k) => [...k.split('|'), ...loaded.map((p) => parts[p.slot].byDesig[k] || 0)]),
    total: null,
    emptyText: `No ${OUR_DIVISION} crew in these files.`,
  });
  return out;
}

module.exports = {
  key: 'contnight',
  label: 'Continuous Night Working',
  order: 70,
  dateOffset: 1,          // data date = sheet date − 1 day(s)
  slotOnly: true,         // identical header across its 3 parts: uploaded via slots only
  PARTS,
  matchesHeader,
  parseParts,
  tables,
};
