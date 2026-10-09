'use strict';

/*
 * CMS "Call Book HQ Wise -> Booked (W/WO Rule)" -> "WR WOR Booking HQ Wise".
 *
 * The same nine HQ/OS count pairs as wrwor.js, with one more lead column:
 *
 *   Sr No. | LOBBY | CALL LOBBY | DESIG. | HQ | OS | ... (nine HQ/OS pairs)
 *
 * LOBBY is the crew's HQ lobby, CALL LOBBY the lobby that booked them. The sheet's
 * HQ Wise block sums each HQ lobby over every call lobby, and prints only the
 * exceptions — WR to WOR ("WR/WOR") and WOR — for Freight and Coaching TA. Coaching
 * Link is read and kept but not printed. Verified cell for cell against the
 * 08/10/2026 sheet.
 *
 * Why it differs from the lobby-wise block: that one counts at the CALL lobby. KYN
 * crew booked WOR at BSR (not a CSTM lobby) show as KYN WOR OS 3 here, and nowhere
 * there.
 *
 * Read by POSITION, header checked exactly — see wrwor.js for why.
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');
const { TRAFFIC, RULES } = require('./wrwor');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];
const BASES = ['hq', 'os'];

const LEAD = ['SR NO.', 'LOBBY', 'CALL LOBBY', 'DESIG.'];
const EXPECTED_WIDTH = LEAD.length + TRAFFIC.length * RULES.length * BASES.length; // 22

// The sheet block: [traffic, rule, heading] in print order.
const SHEET_COLS = [
  ['freight', 'wrToWor', 'WR/WOR'],
  ['freight', 'wor', 'WOR'],
  ['coachTa', 'wrToWor', 'WR/WOR TA'],
  ['coachTa', 'wor', 'WOR TA'],
];
const TRAFFIC_HEAD = { freight: 'Freight', coachTa: 'Coaching' };

function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, ' ');
}

function matchesHeader(header) {
  const cells = (header || []).map(norm);
  if (cells.length !== EXPECTED_WIDTH) return false;
  if (!LEAD.every((h, i) => cells[i] === h)) return false;
  return cells.slice(LEAD.length).every((c, i) => c === (i % 2 === 0 ? 'HQ' : 'OS'));
}

function blankCounts() {
  const o = {};
  TRAFFIC.forEach((t) => {
    o[t.key] = {};
    RULES.forEach((r) => { o[t.key][r.key] = { hq: 0, os: 0 }; });
  });
  return o;
}

function addCounts(into, from) {
  TRAFFIC.forEach((t) => RULES.forEach((r) => BASES.forEach((b) => {
    into[t.key][r.key][b] += from[t.key][r.key][b];
  })));
}

/*
 * Returns { rows, lobbies, totals, warnings }
 *   rows    [{ lobby, callLobby, desig, counts }]  as downloaded
 *   lobbies [{ lobby, counts }]                    HQ lobbies, file order
 */
function parseWrWorHq(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  if (!matchesHeader(records[0])) {
    throw new Error(`This is not the WR / WOR Booking HQ Wise report: expected ${EXPECTED_WIDTH} columns ` +
      `(Sr No., LOBBY, CALL LOBBY, DESIG., then nine HQ/OS pairs), got ${records[0].length}.`);
  }

  const rows = [];
  const byLobby = new Map();
  const totals = blankCounts();
  records.slice(1).forEach((rec, i) => {
    const lobby = norm(rec[1]);
    const callLobby = norm(rec[2]);
    const desig = norm(rec[3]);
    if (!lobby || lobby.includes('TOTAL') || desig.includes('TOTAL')) return;
    if (rec.length !== EXPECTED_WIDTH) {
      throw new Error(`Row ${i + 2} (${lobby} ${callLobby} ${desig}) has ${rec.length} columns, expected ${EXPECTED_WIDTH}.`);
    }
    const counts = blankCounts();
    let c = LEAD.length;
    TRAFFIC.forEach((t) => RULES.forEach((r) => BASES.forEach((b) => {
      const raw = String(rec[c++]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`Row ${i + 2} (${lobby} ${callLobby} ${desig}) has a non-numeric count "${raw}".`);
      counts[t.key][r.key][b] = Number(raw);
    })));
    rows.push({ lobby, callLobby, desig, counts });
    if (!byLobby.has(lobby)) byLobby.set(lobby, blankCounts());
    addCounts(byLobby.get(lobby), counts);
    addCounts(totals, counts);
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');

  const lobbies = [...byLobby.entries()].map(([lobby, counts]) => ({ lobby, counts }));
  return { rows, lobbies, totals, warnings: [] };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows, lobbies, totals } = parsed;
  const cells = (counts) => SHEET_COLS.flatMap(([t, r]) => [counts[t][r].hq, counts[t][r].os]);
  const lead = [null, null];

  const main = {
    title: 'WR WOR Booking HQ Wise',
    note: 'By the crew\'s HQ lobby, wherever they were booked. WR/WOR = changed from with rule to without.',
    headers: ['Sr No.', 'Lobby', ...SHEET_COLS.flatMap(() => ['HQ', 'OS'])],
    groups: [
      [...lead, ...SHEET_COLS.flatMap(([t]) => [TRAFFIC_HEAD[t], TRAFFIC_HEAD[t]])],
      [...lead, ...SHEET_COLS.flatMap(([, , h]) => [h, h])],
    ],
    rows: lobbies.map((l, i) => [i + 1, l.lobby, ...cells(l.counts)]),
    total: ['', 'TOTAL', ...cells(totals)],
    alertCols: SHEET_COLS.flatMap((_, k) => [2 + 2 * k, 3 + 2 * k]),
  };

  // Every non-WR booking with where it was called — the drill-down list.
  const cases = [];
  rows.forEach((row) => TRAFFIC.forEach((t) => RULES.forEach((r) => {
    if (r.key === 'wr') return;
    BASES.forEach((b) => {
      const n = row.counts[t.key][r.key][b];
      if (n > 0) cases.push([row.lobby, row.callLobby, row.desig, t.label, b.toUpperCase(), r.label, n]);
    });
  })));
  const detail = {
    title: 'WR to W/O Rule and Without Rule — HQ lobby and call lobby',
    headers: ['HQ Lobby', 'Call Lobby', 'Desig.', 'Traffic', 'HQ / OS', 'Type', 'Cases'],
    rows: cases,
    total: null,
    emptyText: 'No WR to W/O Rule or Without Rule bookings.',
  };

  return [main, detail];
}

module.exports = {
  key: 'wrworhq',
  dateOffset: 1,          // data date = sheet date − 1 day(s)
  label: 'WR WOR Booking HQ Wise',
  order: 15,
  matchesHeader,
  parse: parseWrWorHq,
  tables,
};
