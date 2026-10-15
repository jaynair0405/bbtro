'use strict';

/*
 * CMS breach of rest -> "Lobbywise Breach of Rest".
 *
 * Two kinds of CMS download (user, 2026-10-15):
 *   summary   S.NO | ZONE | DIVISION | YESTERDAY | LAST FORTNIGHT | LAST MONTH
 *             one row per division (CMS always gives yesterday) + a zone [TOTAL] row;
 *             division figures only, no lobby split.
 *   crew list S.NO | Crew ID | Name | Crew Designation | Rest Given | Calculated BOR |
 *             Sign On Datetime | Call TNC ID | Auth Type | Auth Name
 *             the crew behind ONE period's count (clicked on the CMS summary). The three
 *             periods' lists look identical, so each is uploaded in its own box
 *             (slots y / fn / m); lobby = the letters of Crew ID.
 *
 * Per period: summary 0 -> every lobby 0, no list needed; above 0 -> the lobby split
 * comes from that period's list, "?" until it is added (or typed in, Fill by hand).
 *
 * Date checks — CMS's exact Fortnight / Month boundaries are not known yet (to be
 * learnt from a few days' lists), so only Yesterday is firm:
 *   Yesterday list : every sign-on = the data date, else the file is REFUSED
 *   Last FN list   : a sign-on more than 15 days back -> warning (looks like Last Month)
 *   Last Month list: every sign-on yesterday          -> warning (looks like Yesterday)
 *   any list       : crew count differs from the summary's figure -> warning
 * A file dropped with the other reports: the summary goes in; a list whose sign-ons are
 * all yesterday is the Yesterday list; any other list is refused ("use its box").
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

// The crew list behind one period's count.
const LIST_FIELDS = [
  { key: 'crewId', aliases: ['CREW ID'] },
  { key: 'name',   aliases: ['NAME'] },
  { key: 'desig',  aliases: ['CREW DESIGNATION'] },
  { key: 'rest',   aliases: ['REST GIVEN'] },
  { key: 'bor',    aliases: ['CALCULATED BOR'] },
  { key: 'signOn', aliases: ['SIGN ON DATETIME'] },
];
function listMap(header) {
  const cells = (header || []).map(norm);
  const map = {};
  for (const f of LIST_FIELDS) {
    const i = cells.findIndex((c) => f.aliases.includes(c));
    if (i === -1) return null;
    map[f.key] = i;
  }
  return map;
}

function matchesHeader(header) {
  return columnMap(header) !== null || listMap(header) !== null;
}

const PERIODS = [
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'fortnight', label: 'Last Fortnight' },
  { key: 'month',     label: 'Last Month' },
];

// Summary -> { div: { yesterday, fortnight, month }, warnings }
function parseSummary(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the breach of rest summary: DIVISION, YESTERDAY, LAST FORTNIGHT and LAST MONTH are required.');

  const rec = records.slice(1).find((r) => norm(r[col.division]) === OUR_DIVISION);
  if (!rec) throw new Error(`${OUR_DIVISION} is not in this download — check the CMS filter.`);
  const num = (k) => {
    const raw = String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
    if (!/^\d+$/.test(raw)) throw new Error(`${OUR_DIVISION} has a non-numeric count "${raw}".`);
    return Number(raw);
  };
  const div = {};
  PERIODS.forEach((p) => { div[p.key] = num(p.key); });
  return { div, warnings: [] };
}

// Crew list -> { rows: [{ crewId, lobby, name, desig, rest, bor, signOn, day }], days }
function parseList(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = listMap(records[0]);
  if (!col) throw new Error('This is not the breach of rest crew list: Crew ID, Calculated BOR and Sign On Datetime are required.');
  const rows = records.slice(1).map((rec, i) => {
    const get = (k) => String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
    const crewId = norm(get('crewId'));
    const m = crewId.match(/^[A-Z]+/);
    if (!m) throw new Error(`Row ${i + 2} has no usable crew id ("${crewId}").`);
    const d = get('signOn').match(/^(\d{2})-(\d{2})-(\d{4})/);
    return { crewId, lobby: m[0], name: get('name'), desig: get('desig'), rest: get('rest'), bor: get('bor'),
      signOn: get('signOn'), day: d ? `${d[3]}-${d[2]}-${d[1]}` : null };
  });
  return { rows, days: [...new Set(rows.map((r) => r.day).filter(Boolean))].sort() };
}

const isList = (input) => listMap(parse(input, { bom: true, relax_column_count: true, to: 1, record_delimiter: EOL })[0]) !== null;
const dmy = (iso) => iso.split('-').reverse().join('-');
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

// Upload slots, in page order.
const PARTS = [
  { slot: 'sum', label: 'Summary' },
  { slot: 'y',   label: 'Yesterday list', period: 'yesterday' },
  { slot: 'fn',  label: 'Last FN list',   period: 'fortnight' },
  { slot: 'm',   label: 'Last Month list', period: 'month' },
];

/*
 * A file dropped with the other reports -> the slot it belongs in, or throws.
 * dataDate = this sheet's BOR day (yesterday).
 */
function dropSlot(input, { dataDate }) {
  if (!isList(input)) return 'sum';
  const { rows, days } = parseList(input);
  if (rows.length && days.length === 1 && days[0] === dataDate) return 'y';
  throw new Error('Breach of rest crew list for Last Fortnight or Last Month — add it in the Lobbywise Breach of Rest box, under its period.');
}

/*
 * files: { sum?, y?, fn?, m? } buffers (a part stored by an older load may come as
 * "file": told apart by its header). ctx = { dataDate }.
 * Returns { div|null, lobbies: { period: {lobby: n} | null }, lists: { period: rows|null }, warnings }
 */
function parseParts(files, ctx = {}) {
  const f = { ...files };
  if (f.file && !f.sum && !isList(f.file)) f.sum = f.file;
  if (PARTS.every((p) => !f[p.slot])) throw new Error('No file uploaded.');
  const warnings = [];
  let div = null;
  if (f.sum) {
    if (isList(f.sum)) throw new Error('Summary: this is a crew list — put it under its period.');
    div = parseSummary(f.sum).div;
  } else warnings.push('Breach of rest summary not uploaded — division figures are blank.');

  const lists = {};
  PARTS.filter((p) => p.period).forEach((p) => {
    lists[p.period] = null;
    if (!f[p.slot]) return;
    if (!isList(f[p.slot])) throw new Error(`${p.label}: this is the summary, not a crew list — put it under Summary.`);
    const { rows, days } = parseList(f[p.slot]);
    const dd = ctx.dataDate;
    if (dd && p.period === 'yesterday' && days.some((d) => d !== dd)) {
      throw new Error(`${p.label}: sign-ons on ${days.map(dmy).join(', ')} — not yesterday's (${dmy(dd)}). Put it under Last FN or Last Month.`);
    }
    if (dd && p.period === 'fortnight' && days.some((d) => daysBetween(d, dd) > 15)) {
      warnings.push(`${p.label}: has sign-ons more than 15 days back (${days.filter((d) => daysBetween(d, dd) > 15).map(dmy).join(', ')}) — is it the Last Month list?`);
    }
    if (dd && p.period === 'month' && rows.length && days.length === 1 && days[0] === dd) {
      warnings.push(`${p.label}: every sign-on is yesterday (${dmy(dd)}) — is it the Yesterday list?`);
    }
    const others = [...new Set(rows.map((r) => r.lobby).filter((l) => !SHEET_LOBBIES.includes(l)))];
    if (others.length) warnings.push(`${p.label}: crew of ${others.join(', ')} — not a sheet lobby, listed but not in the split.`);
    lists[p.period] = rows;
  });

  const lobbies = {};
  PERIODS.forEach((p) => {
    const list = lists[p.key];
    const fig = div ? div[p.key] : null;
    if (list) {
      lobbies[p.key] = Object.fromEntries(SHEET_LOBBIES.map((l) => [l, list.filter((r) => r.lobby === l).length]));
      if (fig !== null && list.length !== fig) warnings.push(`${p.label}: summary ${fig}, the list has ${list.length} crew — check both are the same day.`);
    } else if (fig === 0) {
      lobbies[p.key] = Object.fromEntries(SHEET_LOBBIES.map((l) => [l, 0]));
    } else {
      lobbies[p.key] = null;
    }
  });
  const wanting = PERIODS.filter((p) => !lobbies[p.key] && div).map((p) => `${p.label} ${div[p.key]}`);
  if (wanting.length) warnings.push(`Breach of rest ${wanting.join(', ')}: add the crew list for ${wanting.length > 1 ? 'each' : 'it'} in the Lobbywise Breach of Rest box (or enter the split under "Fill by hand").`);
  return { div, lobbies, lists, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { div, lobbies } = parsed;
  const lists = parsed.lists || {};
  const main = {
    title: 'Lobbywise Breach of Rest',
    headers: ['Period', ...SHEET_LOBBIES],
    rows: PERIODS.map((p) => [p.label, ...SHEET_LOBBIES.map((l) => (lobbies[p.key] ? lobbies[p.key][l] : '?'))]),
    total: null,
    alertCols: SHEET_LOBBIES.map((_, i) => i + 1),
    drill: [],
  };
  // Click a count: the crew in that period's list.
  PERIODS.forEach((p, ri) => SHEET_LOBBIES.forEach((l, li) => {
    const crew = (lists[p.key] || []).filter((r) => r.lobby === l);
    if (crew.length === 0) return;
    main.drill.push({
      r: ri, c: li + 1, title: `${l} — breach of rest, ${p.label.toLowerCase()}`,
      headers: ['Crew ID', 'Name', 'Desig.', 'Rest Given', 'Calculated BOR', 'Sign On'],
      rows: crew.map((r) => [r.crewId, r.name, r.desig, r.rest, r.bor, r.signOn]),
      sortCols: [2, 5],
    });
  }));
  const division = {
    title: `${OUR_DIVISION} division`,
    headers: ['Division', ...PERIODS.map((p) => p.label)],
    rows: [[OUR_DIVISION, ...PERIODS.map((p) => (div ? div[p.key] : ''))]],
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
    return { div, lobbies, lists: {}, warnings: [] };
  },
};

/*
 * What is stored (store.js): the division's yesterday / fortnight / month as DIVISION,
 * and the lobby split per period where it is known (file zero, a list, or typed in). An unknown
 * split stores nothing — not zeros — so it is not mistaken for "no breach".
 */
function facts(parsed) {
  const counts = [];
  PERIODS.forEach((p) => {
    if (parsed.div) counts.push({ lobby: 'DIVISION', measure: p.key, value: parsed.div[p.key] });
    const split = parsed.lobbies[p.key];
    if (split) Object.entries(split).forEach(([lobby, value]) => counts.push({ lobby, measure: p.key, value }));
  });
  // Crew of every list, with its sign-on — kept to learn CMS's fortnight / month lines.
  const crew = PERIODS.flatMap((p) => (parsed.lists && parsed.lists[p.key] || []).map((r) => ({
    lobby: r.lobby, cmsId: r.crewId, name: r.name, measure: p.key, eventTime: null,
    detail: { desig: r.desig, rest: r.rest, bor: r.bor, signOn: r.signOn },
  })));
  return { counts, crew };
}

module.exports = {
  key: 'bor',
  dateOffset: 1,          // data date = sheet date − 1 day(s)
  label: 'Lobbywise Breach of Rest',
  order: 130,
  slotOnly: true,         // summary + 3 look-alike period lists (a dropped file: dropSlot)
  PARTS,
  matchesHeader,
  parseParts,
  dropSlot,
  tables,
  facts,
  manual,
};
