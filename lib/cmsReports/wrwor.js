'use strict';

/*
 * CMS "Call Book Lobby Wise -> Booked (W/WO Rule)" processing core.
 *
 * One row per lobby x designation; every value is a COUNT of bookings, not a
 * staff record. The download carries only the BOTTOM header row:
 *
 *   Sr No. | LOBBY | DESIG. | HQ | OS | HQ | OS | ... (nine HQ/OS pairs)
 *
 * The group headers that give those pairs their meaning exist only on the CMS
 * screen, so — unlike lib/cmsReport.js, which can match by header name — this
 * file can only be read by POSITION:
 *
 *   FREIGHT (FGHT,BLST,MTRL,CRAN,BKDN,DEPT,PSHT,SSHT,SHVN)   WR | WR TO WOR | WOR
 *   COACHING LINK (CCHR,CCHM,CCHP,CCHS)                      WR | WR TO WOR | WOR
 *   COACHING TA                                              WR | WR TO WOR | WOR
 *
 * each of the nine being an HQ/OS pair. WR = booked With Rule, WOR = Without Rule,
 * WR TO WOR = started with rule and was changed to without.
 *
 * Because position is all we have, the header is checked EXACTLY and anything else
 * is refused. A silently shifted column is what made the due list report ~1750
 * staff overdue; here it would just produce plausible wrong totals.
 *
 * The file carries no date either — the caller must supply it.
 */

const { parse } = require('csv-parse/sync');

const TRAFFIC = [
  { key: 'freight',   label: 'Freight' },
  { key: 'coachLink', label: 'Coaching (Link)' },
  { key: 'coachTa',   label: 'Coaching (TA)' },
];
const RULES = [
  { key: 'wr',      label: 'With Rule' },
  { key: 'wrToWor', label: 'WR to W/O Rule' },
  { key: 'wor',     label: 'Without Rule' },
];
const BASES = ['hq', 'os'];

const LEAD = ['SR NO.', 'LOBBY', 'DESIG.'];
const EXPECTED_WIDTH = LEAD.length + TRAFFIC.length * RULES.length * BASES.length; // 21

function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, ' ');
}

// True when a header row is this report's. Also lets an upload be recognised by content.
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

// Collapse a counts object to the three figures the daily sheet prints.
function ruleTotals(counts) {
  const out = {};
  RULES.forEach((r) => {
    out[r.key] = TRAFFIC.reduce((s, t) => s + counts[t.key][r.key].hq + counts[t.key][r.key].os, 0);
  });
  return out;
}

/*
 * Parse a CSV buffer/string.
 * Returns { rows, lobbies, totals, warnings }
 *   rows    [{ lobby, desig, counts }]            as downloaded
 *   lobbies [{ lobby, counts, wr, wrToWor, wor }] in file order
 *   totals  { counts, wr, wrToWor, wor }
 */
function parseWrWor(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true });
  if (records.length === 0) throw new Error('The file is empty.');

  if (!matchesHeader(records[0])) {
    throw new Error(
      `This is not the WR / WOR Booking report (CMS: Call Book Lobby Wise -> Booked W/WO Rule), or CMS has changed its layout: expected ` +
      `${EXPECTED_WIDTH} columns (Sr No., LOBBY, DESIG., then nine HQ/OS pairs), ` +
      `got ${records[0].length}. Nothing was read — the columns carry no names, so a ` +
      `changed layout cannot be read safely.`
    );
  }

  const warnings = [];
  const rows = [];
  const byLobby = new Map();
  const total = blankCounts();

  records.slice(1).forEach((rec, i) => {
    const lobby = norm(rec[1]);
    const desig = norm(rec[2]);
    // The CMS screen ends with a [TOTAL] row; the download has not carried it so far.
    if (!lobby || lobby.includes('TOTAL') || desig.includes('TOTAL')) return;
    if (rec.length !== EXPECTED_WIDTH) {
      throw new Error(`Row ${i + 2} (${lobby} ${desig}) has ${rec.length} columns, expected ${EXPECTED_WIDTH}.`);
    }

    const counts = blankCounts();
    let c = LEAD.length;
    TRAFFIC.forEach((t) => RULES.forEach((r) => BASES.forEach((b) => {
      const raw = String(rec[c++]).trim();
      if (!/^\d+$/.test(raw)) {
        throw new Error(`Row ${i + 2} (${lobby} ${desig}) has a non-numeric count "${raw}".`);
      }
      counts[t.key][r.key][b] = Number(raw);
    })));

    rows.push({ lobby, desig, counts });
    if (!byLobby.has(lobby)) byLobby.set(lobby, blankCounts());
    addCounts(byLobby.get(lobby), counts);
    addCounts(total, counts);
  });

  if (rows.length === 0) throw new Error('The file has a header but no data rows.');

  const lobbies = [...byLobby.entries()].map(([lobby, counts]) => ({ lobby, counts, ...ruleTotals(counts) }));
  return { rows, lobbies, totals: { counts: total, ...ruleTotals(total) }, warnings };
}

/*
 * The printable tables for this report — see lib/cmsReports/index.js for the shape.
 * Table 1 is the daily sheet's "WR WOR BOOKING" block, column order as circulated.
 */
function tables(parsed) {
  const { rows, lobbies, totals } = parsed;

  const main = {
    title: 'WR WOR Booking',
    headers: ['Sr No.', 'Lobby', 'With Rule (Cases)', 'Without Rule (Cases)', 'WR to W/O Rule (Cases)'],
    rows: lobbies.map((l, i) => [i + 1, l.lobby, l.wr, l.wor, l.wrToWor]),
    total: ['', 'TOTAL', totals.wr, totals.wor, totals.wrToWor],
  };

  const splitRow = (counts) => TRAFFIC.flatMap((t) => [counts[t.key].wr.hq, counts[t.key].wr.os]);
  const split = {
    title: 'With Rule — traffic and HQ / Outstation',
    headers: ['Lobby', ...TRAFFIC.flatMap((t) => [`${t.label} HQ`, `${t.label} OS`]), 'Total'],
    rows: lobbies.map((l) => [l.lobby, ...splitRow(l.counts), l.wr]),
    total: ['TOTAL', ...splitRow(totals.counts), totals.wr],
  };

  // Every non-WR booking, one line each — these are the cases someone has to explain.
  const cases = [];
  rows.forEach((row) => TRAFFIC.forEach((t) => RULES.forEach((r) => {
    if (r.key === 'wr') return;
    BASES.forEach((b) => {
      const n = row.counts[t.key][r.key][b];
      if (n > 0) cases.push([row.lobby, row.desig, t.label, b.toUpperCase(), r.label, n]);
    });
  })));
  const exceptions = {
    title: 'WR to W/O Rule and Without Rule — where they are',
    headers: ['Lobby', 'Desig.', 'Traffic', 'HQ / OS', 'Type', 'Cases'],
    rows: cases,
    total: cases.length ? ['TOTAL', '', '', '', '', totals.wrToWor + totals.wor] : null,
    emptyText: 'No WR to W/O Rule or Without Rule bookings.',
  };

  return [main, split, exceptions];
}

module.exports = {
  key: 'wrwor',
  label: 'WR / WOR Booking',
  order: 10,
  matchesHeader,
  parse: parseWrWor,
  tables,
  TRAFFIC, RULES, EXPECTED_WIDTH,
};
