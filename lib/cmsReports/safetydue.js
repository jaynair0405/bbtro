'use strict';

/*
 * CMS safety-test due list -> "Monthly PME, REFT, ASIG Overdue".
 *
 *   SNO. | CREW ID | CREW NAME | CREW DESIGNATION | DUE DATE | TEST CODE | STATUS REASON
 *
 * One row per crew per test falling due. There is no lobby column: the lobby is the
 * letters of the CREW ID (CSMT5606 -> CSMT), as in pdd.js.
 *
 * Rules (user, 2026-10-09; 2026-10-15):
 *   - every row in the list is counted (it is CMS's due list; no date filter)
 *   - test codes PME, REFT, ASIG are counted; SFCM is left out
 *   - only STATUS REASON = ACTIVE is counted (TRANSFER, TEMP TRANSFER, TEMPORARY
 *     INACTIVE, DRAFTED … are left out)
 *   - ASIG excludes all IGP, LNLX and LNL crew (LNL has no Mumbai division crew now;
 *     excluded if one appears), and every SHT and SSHT
 * Anything left out is listed with its reason, never silently dropped. An unknown
 * test code is warned about.
 *
 * CMS writes "DUE DATE" with a non-breaking space; norm() folds it.
 *
 * Four months (user, 2026-10-15): CMS gives one file per due month; the sheet shows the
 * sheet's month and the 3 before it. Each file is ONE month (taken from DUE DATE; a
 * file with two months is refused) and the files join into one report (merge()): a
 * month loaded again replaces that month. Layout is month first, oldest at the top —
 * the older the month, the longer overdue — with only the lobbies that have a count,
 * a total per month and a grand total. parsed.window (set by the route from the sheet
 * date) names the 4 months, so a month with no file shows "file not loaded".
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

// Lobbies printed on the daily sheet, in sheet order (25/09 and 08/10/2026 sheets).
const SHEET_LOBBIES = ['CSMT', 'IGP', 'KYN', 'LNL', 'LNLX', 'PNVL', 'VVH', 'CSTS', 'KYNS', 'PNVS'];
const TESTS = ['PME', 'REFT', 'ASIG'];
const IGNORED_TESTS = ['SFCM'];
const ASIG_EXCLUDED_LOBBIES = ['IGP', 'LNLX', 'LNL'];
const ASIG_EXCLUDED_DESIGS = ['SHT', 'SSHT'];

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
  if (r.status !== 'ACTIVE') return `status ${r.status || 'blank'}`;
  if (r.test === 'ASIG' && ASIG_EXCLUDED_LOBBIES.includes(r.lobby)) return `ASIG not counted for ${r.lobby}`;
  if (r.test === 'ASIG' && ASIG_EXCLUDED_DESIGS.includes(r.desig)) return `ASIG not counted for ${r.desig}`;
  return null;
}

/*
 * Returns { rows, months, warnings }
 *   rows   [{ crewId, name, desig, lobby, due, month ("YYYY-MM"), test, status, excluded }]
 *   months the file's due month, as a one-entry list (merge() joins files)
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
    const due = get('due');
    const dm = due.match(/^\d{1,2}-(\d{2})-(\d{4})/);
    if (!dm) throw new Error(`Row ${i + 2} has no usable DUE DATE ("${due}").`);
    const r = {
      crewId, name: get('name'), desig: norm(get('desig')), lobby: m[0],
      due, month: `${dm[2]}-${dm[1]}`, test: norm(get('test')), status: norm(get('status')),
    };
    r.excluded = exclusion(r);
    if (!TESTS.includes(r.test) && !IGNORED_TESTS.includes(r.test)) unknown.set(r.test, (unknown.get(r.test) || 0) + 1);
    return r;
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');
  const months = [...new Set(rows.map((r) => r.month))].sort();
  if (months.length > 1) throw new Error(`This file has more than one due month (${months.map(monthName).join(', ')}) — download one month at a time from CMS.`);
  unknown.forEach((n, t) => warnings.push(`${n} row(s) with test code "${t}" — not counted; tell the developer if it should be.`));
  return { rows, months, warnings };
}

// "2026-07" -> "Jul 2026"
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthName(ym) {
  const [y, m] = String(ym).split('-');
  return `${MON[Number(m) - 1] || m} ${y}`;
}

// The sheet's month and the 3 before it, oldest first: "2026-10-15" -> ["2026-07", … "2026-10"].
function windowFor(sheetDate) {
  const [y, m] = sheetDate.split('-').map(Number);
  return [3, 2, 1, 0].map((back) => {
    const d = new Date(Date.UTC(y, m - 1 - back, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

// Join two parsed sets: b's months replace a's; other months kept.
function merge(a, b) {
  const rows = [...a.rows.filter((r) => !b.months.includes(r.month)), ...b.rows];
  return { rows, months: [...new Set(rows.map((r) => r.month))].sort(),
    window: b.window || a.window, warnings: [...a.warnings, ...b.warnings] };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows } = parsed;
  const counted = rows.filter((r) => !r.excluded);
  const months = parsed.window || parsed.months;
  const loaded = new Set(parsed.months);
  const line = (list) => {
    const c = TESTS.map((t) => list.filter((r) => r.test === t).length);
    return [...c, c.reduce((x, y) => x + y, 0)];
  };
  const at = (month, lobby) => counted.filter((r) => r.month === month && (!lobby || r.lobby === lobby));
  const onSheet = (month) => at(month).filter((r) => SHEET_LOBBIES.includes(r.lobby));

  const crewHeaders = ['Crew ID', 'Crew Name', 'Desig.', 'Test', 'Due Date', 'Status'];
  const crewRow = (r) => [r.crewId, r.name, r.desig, r.test, r.due, r.status];
  const main = {
    title: 'Monthly PME, REFT, ASIG Overdue',
    note: 'A lobby with nothing overdue in a month is not listed. Oldest due month first. ' +
      'Active crew only; ASIG excludes IGP and LNLX crew and all SHT / SSHT.',
    headers: ['Month', 'Lobby', ...TESTS, 'Total'],
    rows: [],
    total: null,
    alertCols: [2, 3, 4, 5],
    noteOnSheet: true,       // the one view prints this caption too (it hides the others)
    drill: [],
  };
  // One drill per non-zero count of a row: its test columns and its Total.
  const drillRow = (list, title, withLobby) => {
    const ri = main.rows.length;
    [...TESTS, null].forEach((test, ci) => {
      const pick = list.filter((r) => !test || r.test === test);
      if (pick.length === 0) return;
      main.drill.push({
        r: ri, c: 2 + ci, title: `${title} — ${test || 'PME, REFT, ASIG'} overdue`,
        headers: withLobby ? ['Lobby', ...crewHeaders] : crewHeaders,
        rows: pick.map((r) => (withLobby ? [r.lobby, ...crewRow(r)] : crewRow(r))),
        sortCols: withLobby ? [0, 3, 4, 5] : [2, 3, 4],
      });
    });
  };
  months.forEach((month) => {
    const name = monthName(month);
    if (!loaded.has(month)) { main.rows.push([name, 'file not loaded', '', '', '', '']); return; }
    const lobbies = SHEET_LOBBIES.filter((l) => at(month, l).length);
    if (lobbies.length === 0) { main.rows.push([name, 'None', 0, 0, 0, 0]); return; }
    lobbies.forEach((l, i) => {
      drillRow(at(month, l), `${l}, due ${name}`, false);
      main.rows.push([i === 0 ? name : '', l, ...line(at(month, l))]);
    });
    drillRow(onSheet(month), `All sheet lobbies, due ${name}`, true);
    main.rows.push(['', `${name} total`, ...line(onSheet(month))]);
  });
  const all = months.flatMap(onSheet);
  main.total = ['TOTAL', '', ...line(all)];
  TESTS.concat(null).forEach((test, ci) => {
    const pick = all.filter((r) => !test || r.test === test);
    if (pick.length) {
      main.drill.push({
        r: 'T', c: 2 + ci, title: `All months — ${test || 'PME, REFT, ASIG'} overdue`,
        headers: ['Lobby', ...crewHeaders], rows: pick.map((r) => [r.lobby, ...crewRow(r)]), sortCols: [0, 3, 4, 5],
      });
    }
  });
  const out = [main];

  const others = counted.filter((r) => !SHEET_LOBBIES.includes(r.lobby));
  if (others.length) {
    const keys = [...new Set(others.map((r) => `${r.month}|${r.lobby}`))].sort();
    out.push({
      title: 'Other lobbies',
      headers: ['Month', 'Lobby', ...TESTS, 'Total'],
      rows: keys.map((k) => { const [m, l] = k.split('|'); return [monthName(m), l, ...line(at(m, l))]; }),
      total: null,
    });
  }

  const byMonth = (a, b) => a.month.localeCompare(b.month) || a.lobby.localeCompare(b.lobby)
    || a.test.localeCompare(b.test) || a.crewId.localeCompare(b.crewId);
  out.push({
    title: 'Crew counted',
    headers: ['Month', 'Lobby', 'Crew ID', 'Crew Name', 'Desig.', 'Test', 'Due Date', 'Status'],
    rows: [...counted].sort(byMonth).map((r) => [monthName(r.month), r.lobby, r.crewId, r.name, r.desig, r.test, r.due, r.status]),
    total: null,
    emptyText: 'None.',
  });
  out.push({
    title: 'Not counted',
    headers: ['Month', 'Lobby', 'Crew ID', 'Crew Name', 'Desig.', 'Test', 'Due Date', 'Reason'],
    rows: rows.filter((r) => r.excluded).sort(byMonth)
      .map((r) => [monthName(r.month), r.lobby, r.crewId, r.name, r.desig, r.test, r.due, r.excluded]),
    total: null,
    emptyText: 'None.',
  });
  return out;
}

/*
 * What is stored (store.js). Counts per lobby (letters of CREW ID, every lobby) and due
 * month: pme_YYYY-MM / reft_… / asig_… as the sheet counts them, and excluded_… (left
 * out by the sheet's rules).
 * Crew: every row of the due list, measure = test in lower case, or "excluded"
 * with the reason in detail — a dated snapshot of who was due that day.
 */
function facts(parsed) {
  const per = new Map();
  const bump = (lobby, measure) => { const k = `${lobby}|${measure}`; per.set(k, (per.get(k) || 0) + 1); };
  const crew = parsed.rows.map((r) => {
    // Per due month since 2026-10-15: "asig_2026-07" (earlier loads: plain "asig").
    const measure = `${r.excluded ? 'excluded' : r.test.toLowerCase()}_${r.month}`;
    bump(r.lobby, measure);
    return {
      lobby: r.lobby, cmsId: r.crewId, name: r.name, measure, eventTime: null,
      detail: { desig: r.desig, test: r.test, due: r.due, month: r.month, status: r.status, excluded: r.excluded },
    };
  });
  const counts = [...per.entries()].map(([key, value]) => { const [lobby, measure] = key.split('|'); return { lobby, measure, value }; });
  return { counts, crew };
}

// The file's due month must be one of the sheet's 4 months.
function checkDate(parsed, { sheetDate }) {
  const win = windowFor(sheetDate);
  const out = parsed.months.filter((m) => !win.includes(m));
  if (out.length === 0) return null;
  return { error: `due month ${out.map(monthName).join(', ')} is outside this sheet's 4 months (${monthName(win[0])} – ${monthName(win[3])}).` };
}
const atSheet = (parsed, sheetDate) => { parsed.window = windowFor(sheetDate); };

module.exports = {
  checkDate,
  atSheet,
  key: 'safetydue',
  dateOffset: 0,          // data date = sheet date (taken the same day, user 2026-10-15)
  label: 'Monthly PME, REFT, ASIG Overdue',
  order: 100,
  matchesHeader,
  parse: parseSafetyDue,
  tables,
  facts,
  merge,
  windowFor,
  monthName,
};
