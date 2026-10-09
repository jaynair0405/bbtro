'use strict';

/*
 * CMS safety-test due list -> "Monthly PME, REFT, ASIG Overdue".
 *
 *   SNO. | CREW ID | CREW NAME | CREW DESIGNATION | DUE DATE | TEST CODE | STATUS REASON
 *
 * One row per crew per test falling due. There is no lobby column: the lobby is the
 * letters of the CREW ID (CSMT5606 -> CSMT), as in pdd.js.
 *
 * Rules (user, 2026-10-09):
 *   - every row in the list is counted (it is CMS's due list; no date filter)
 *   - test codes PME, REFT, ASIG are counted; SFCM is left out
 *   - STATUS REASON = TRANSFER is left out
 *   - ASIG excludes all LNLX and IGP crew, and every SHT
 * Anything left out is listed with its reason, never silently dropped. An unknown
 * test code is warned about.
 *
 * CMS writes "DUE DATE" with a non-breaking space; norm() folds it.
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

// Lobbies printed on the daily sheet, in sheet order (25/09 and 08/10/2026 sheets).
const SHEET_LOBBIES = ['CSMT', 'IGP', 'KYN', 'LNL', 'LNLX', 'PNVL', 'VVH', 'CSTS', 'KYNS', 'PNVS'];
const TESTS = ['PME', 'REFT', 'ASIG'];
const IGNORED_TESTS = ['SFCM'];
const ASIG_EXCLUDED_LOBBIES = ['LNLX', 'IGP'];
const ASIG_EXCLUDED_DESIGS = ['SHT'];

const FIELDS = [
  { key: 'crewId', aliases: ['CREW ID'] },
  { key: 'name',   aliases: ['CREW NAME'] },
  { key: 'desig',  aliases: ['CREW DESIGNATION'] },
  { key: 'due',    aliases: ['DUE DATE'] },
  { key: 'test',   aliases: ['TEST CODE'] },
  { key: 'status', aliases: ['STATUS REASON'] },
];

function norm(cell) {
  return String(cell == null ? '' : cell).replace(/ /g, ' ').trim().toUpperCase().replace(/\s+/g, ' ');
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

// Why a row is not counted, or null when it is.
function exclusion(r) {
  if (IGNORED_TESTS.includes(r.test)) return `${r.test} not reported`;
  if (!TESTS.includes(r.test)) return `unknown test code ${r.test}`;
  if (r.status === 'TRANSFER') return 'transferred';
  if (r.test === 'ASIG' && ASIG_EXCLUDED_LOBBIES.includes(r.lobby)) return `ASIG not counted for ${r.lobby}`;
  if (r.test === 'ASIG' && ASIG_EXCLUDED_DESIGS.includes(r.desig)) return `ASIG not counted for ${r.desig}`;
  return null;
}

/*
 * Returns { rows, warnings }
 *   rows [{ crewId, name, desig, lobby, due, test, status, excluded }]
 */
function parseSafetyDue(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the safety test due report: CREW ID, CREW DESIGNATION, DUE DATE, TEST CODE and STATUS REASON are all required.');

  const warnings = [];
  const unknown = new Map();
  const rows = records.slice(1).map((rec, i) => {
    const get = (k) => String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
    const crewId = norm(get('crewId'));
    const m = crewId.match(/^[A-Z]+/);
    if (!m) throw new Error(`Row ${i + 2} has no usable crew id ("${crewId}").`);
    const r = {
      crewId, name: get('name'), desig: norm(get('desig')), lobby: m[0],
      due: get('due'), test: norm(get('test')), status: norm(get('status')),
    };
    r.excluded = exclusion(r);
    if (!TESTS.includes(r.test) && !IGNORED_TESTS.includes(r.test)) unknown.set(r.test, (unknown.get(r.test) || 0) + 1);
    return r;
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');
  unknown.forEach((n, t) => warnings.push(`${n} row(s) with test code "${t}" — not counted; tell the developer if it should be.`));
  return { rows, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows } = parsed;
  const counted = rows.filter((r) => !r.excluded);
  const n = (lobby, test) => counted.filter((r) => r.lobby === lobby && r.test === test).length;
  const line = (lobby) => {
    const c = TESTS.map((t) => n(lobby, t));
    return [...c, c.reduce((a, b) => a + b, 0)];
  };
  const others = [...new Set(counted.map((r) => r.lobby))].filter((l) => !SHEET_LOBBIES.includes(l)).sort();
  const sum = (lines) => lines[0].map((_, i) => lines.reduce((s, l) => s + l[i], 0));

  const sheetLines = SHEET_LOBBIES.map(line);
  const main = {
    title: 'Monthly PME, REFT, ASIG Overdue',
    note: 'ASIG excludes LNLX and IGP crew and all SHT. SFCM and transferred crew are not counted.',
    headers: ['Sr No.', 'Lobby', ...TESTS, 'Total'],
    rows: SHEET_LOBBIES.map((l, i) => [i + 1, l, ...sheetLines[i]]),
    total: ['', 'TOTAL', ...sum(sheetLines)],
    alertCols: [2, 3, 4, 5],
  };
  const out = [main];

  if (others.length) {
    out.push({
      title: 'Other lobbies',
      headers: ['Lobby', ...TESTS, 'Total'],
      rows: others.map((l) => [l, ...line(l)]),
      total: null,
    });
  }

  const byLobby = (a, b) => a.lobby.localeCompare(b.lobby) || a.test.localeCompare(b.test) || a.crewId.localeCompare(b.crewId);
  out.push({
    title: 'Crew counted',
    headers: ['Lobby', 'Crew ID', 'Crew Name', 'Desig.', 'Test', 'Due Date', 'Status'],
    rows: [...counted].sort(byLobby).map((r) => [r.lobby, r.crewId, r.name, r.desig, r.test, r.due, r.status]),
    total: null,
    emptyText: 'None.',
  });
  out.push({
    title: 'Not counted',
    headers: ['Lobby', 'Crew ID', 'Crew Name', 'Desig.', 'Test', 'Due Date', 'Reason'],
    rows: rows.filter((r) => r.excluded).sort(byLobby)
      .map((r) => [r.lobby, r.crewId, r.name, r.desig, r.test, r.due, r.excluded]),
    total: null,
    emptyText: 'None.',
  });
  return out;
}

module.exports = {
  key: 'safetydue',
  dateOffset: 1,          // data date = sheet date − 1 day(s)
  label: 'Monthly PME, REFT, ASIG Overdue',
  order: 100,
  matchesHeader,
  parse: parseSafetyDue,
  tables,
};
