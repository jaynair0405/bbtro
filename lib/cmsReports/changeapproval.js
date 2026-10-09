'use strict';

/*
 * CMS "change on approval" -> "Change on Approval".
 *
 * One row per change a supervisor made while approving a crew's sign-on:
 *
 *   SNO. | CREW ID | CREW NAME | Field Name | Old Value | Changed Value |
 *   Time Differencein Minutes | Lobby | SUP ID | SUP NAME | Remarks | Date
 *
 * The sheet prints only a count per lobby. The crew rows are kept as detail — they
 * are what the later click-a-count drill-down will show.
 *
 * Every row in the samples is a sign-on time (Field Name SIGN_ON_DATETIME_D), and
 * Time Difference = Old − Changed in minutes (positive = sign-on moved earlier).
 * Both are checked: another field, or a difference that does not add up, is warned
 * about rather than silently counted.
 *
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

// Lobbies printed on the daily sheet, in sheet order (25/09 and 08/10/2026 sheets).
const SHEET_LOBBIES = ['CSMT', 'IGP', 'KYN', 'LNL', 'LTT', 'JNPN', 'PNVL', 'ROHA', 'VVH'];
const SIGN_ON_FIELD = 'SIGN_ON_DATETIME_D';

const FIELDS = [
  { key: 'crewId',  aliases: ['CREW ID'] },
  { key: 'name',    aliases: ['CREW NAME'] },
  { key: 'field',   aliases: ['FIELD NAME'] },
  { key: 'oldV',    aliases: ['OLD VALUE'] },
  { key: 'newV',    aliases: ['CHANGED VALUE'] },
  { key: 'minutes', aliases: ['TIME DIFFERENCEIN MINUTES', 'TIME DIFFERENCE IN MINUTES'] },
  { key: 'lobby',   aliases: ['LOBBY'] },
  { key: 'supId',   aliases: ['SUP ID'] },
  { key: 'supName', aliases: ['SUP NAME'] },
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
  // When the supervisor approved — optional, shown in the drill-down only.
  map.approved = cells.indexOf('DATE');
  return map;
}

function matchesHeader(header) {
  return columnMap(header) !== null;
}

// "24-09-2026 00:01" -> minutes since epoch (UTC arithmetic; only differences matter).
function toMinutes(s) {
  const m = String(s || '').trim().match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/);
  return m ? Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]) / 60000 : null;
}

/*
 * Returns { rows, warnings }
 *   rows [{ crewId, name, field, oldV, newV, minutes, lobby, supId, supName }]
 */
function parseChangeApproval(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the Change on Approval report: CREW ID, Field Name, Old Value, Changed Value, Lobby and SUP ID are all required.');

  const warnings = [];
  const otherFields = new Map();
  let badDiff = 0;
  const rows = records.slice(1).map((rec, i) => {
    const get = (k) => String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
    const r = {
      crewId: norm(get('crewId')), name: get('name'), field: norm(get('field')),
      oldV: get('oldV'), newV: get('newV'), minutes: null,
      lobby: norm(get('lobby')), supId: norm(get('supId')), supName: get('supName'),
      approved: col.approved === -1 ? '' : String(rec[col.approved] == null ? '' : rec[col.approved]).trim(),
    };
    if (!r.lobby) throw new Error(`Row ${i + 2} (${r.crewId || 'no crew id'}) has no lobby.`);
    const raw = get('minutes');
    if (/^-?\d+$/.test(raw)) r.minutes = Number(raw);
    if (r.field !== SIGN_ON_FIELD) otherFields.set(r.field, (otherFields.get(r.field) || 0) + 1);
    const a = toMinutes(r.oldV);
    const b = toMinutes(r.newV);
    if (a !== null && b !== null && r.minutes !== null && a - b !== r.minutes) badDiff++;
    return r;
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');

  otherFields.forEach((n, f) => warnings.push(`${n} change(s) to "${f}", not sign-on time — counted, but check what they are.`));
  if (badDiff) warnings.push(`${badDiff} row(s) where Time Difference is not Old − Changed — CMS may have changed how it computes it.`);
  return { rows, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows } = parsed;
  const count = new Map();
  rows.forEach((r) => count.set(r.lobby, (count.get(r.lobby) || 0) + 1));
  const others = [...count.keys()].filter((l) => !SHEET_LOBBIES.includes(l)).sort();
  const sheetTotal = SHEET_LOBBIES.reduce((s, l) => s + (count.get(l) || 0), 0);

  const main = {
    title: 'Change on Approval',
    note: 'Sign-on times changed by the supervisor while approving.',
    headers: ['Sr No.', 'Lobby', 'Count'],
    rows: SHEET_LOBBIES.map((l, i) => [i + 1, l, count.get(l) || 0]),
    total: ['', 'TOTAL', sheetTotal],
  };
  // Click a count: that lobby's changes (the total: every sheet lobby's).
  // Largest change first, as the full list below.
  const drillRows = (list) => [...list].sort((a, b) => Math.abs(b.minutes || 0) - Math.abs(a.minutes || 0))
    .map((r) => [r.crewId, r.name, r.oldV, r.newV, r.minutes == null ? '' : String(r.minutes), r.supId, r.approved]);
  const drillHeaders = ['Crew ID', 'Crew Name', 'Old', 'Changed', 'Minutes', 'Sup ID', 'Approved'];
  main.drill = SHEET_LOBBIES.map((l, i) => ({
    r: i, c: 2, title: `${l} — changes on approval`, headers: drillHeaders, sortCols: [2, 4], crewCol: 0,
    rows: drillRows(rows.filter((r) => r.lobby === l)),
  }));
  main.drill.push({
    r: 'T', c: 2, title: 'All sheet lobbies — changes on approval', headers: ['Lobby', ...drillHeaders], sortCols: [0, 3, 5], crewCol: 1,
    rows: rows.filter((r) => SHEET_LOBBIES.includes(r.lobby)).map((r) => [r.lobby, ...drillRows([r])[0]]),
  });
  const out = [main];

  if (others.length) {
    out.push({
      title: 'Other lobbies',
      headers: ['Lobby', 'Count'],
      rows: others.map((l) => [l, count.get(l)]),
      total: null,
    });
  }

  // Per supervisor: who is changing how many, and by how much at most.
  const bySup = new Map();
  rows.forEach((r) => {
    const k = `${r.lobby}|${r.supId}`;
    const s = bySup.get(k) || { lobby: r.lobby, supId: r.supId, supName: r.supName, n: 0, max: 0 };
    s.n++;
    if (r.minutes !== null) s.max = Math.max(s.max, Math.abs(r.minutes));
    bySup.set(k, s);
  });
  out.push({
    title: 'By supervisor',
    headers: ['Lobby', 'Sup ID', 'Sup Name', 'Changes', 'Largest change (min)'],
    rows: [...bySup.values()].sort((a, b) => a.lobby.localeCompare(b.lobby) || b.n - a.n)
      .map((s) => [s.lobby, s.supId, s.supName, s.n, s.max]),
    total: null,
  });

  // Every change, largest first — the crew behind each count.
  out.push({
    title: 'Every change',
    note: 'Minutes = Old − Changed: positive means the sign-on was moved earlier.',
    headers: ['Lobby', 'Crew ID', 'Crew Name', 'Old', 'Changed', 'Minutes', 'Sup ID'],
    rows: [...rows].sort((a, b) => Math.abs(b.minutes || 0) - Math.abs(a.minutes || 0))
      .map((r) => [r.lobby, r.crewId, r.name, r.oldV, r.newV, r.minutes == null ? '' : String(r.minutes), r.supId]),
    total: null,
  });
  return out;
}

module.exports = {
  key: 'changeapproval',
  dateOffset: 1,          // data date = sheet date − 1 day(s)
  label: 'Change on Approval',
  order: 80,
  matchesHeader,
  parse: parseChangeApproval,
  tables,
};
