'use strict';

/*
 * CMS "PDD" (pre-departure detention) processing core.
 *
 * Unlike the count reports, this download is a PER-CREW LIST: one row per crew
 * member per call (TA) — the LP and the ALP of one train are two rows. ~470 rows a
 * day, all freight. The daily sheet is a summary someone makes from it, so the
 * counting happens here.
 *
 *   SNO. | CREW ID | CREW NAME | DESIG | TA NO | SERVICE TYPE | DUTY TYPE | TA ORD. TIME |
 *   TRAIN NO | LOCO NO | STTN FROM | ... | SIGN ON | ... | CREW DEPART | ... |
 *   SignOn To CTO | CTO To Departure | PDD | DETENTION FROM TRAIN ORDERING
 *
 * The sheet's rules, each verified against the 19-09-2026 sheet (15/15 figures):
 *
 *   lobby of a row  = the letters of CREW ID (home lobby), and the row counts for
 *                     that lobby only when STTN FROM is the same station — i.e.
 *                     home-lobby crew starting from their own lobby. Rows where crew
 *                     start away from home are reported separately, never dropped.
 *   total cases     = every row, including the ~120 whose PDD is "*" (the train had
 *                     not departed when the report was taken)
 *   "cases >2 hrs"  = PDD  > 2:00 and <= 3:00   (NOT everything over two hours)
 *   "cases >3 hrs"  = PDD  > 3:00
 *   (avg hrs)       = true mean of the PDD in that band, cut to the minute. The
 *                     hand-made sheet rounded these (2:20 for a true 2:22); we print
 *                     the true value by decision of 2026-09-22.
 *
 * Counts only are printed — the file carries crew names, and this page shows none.
 * PDD is h:mm; one value in the sample was "00:53*" (read as 0:53, with a warning).
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

// Lobbies printed on the daily sheet, in sheet order.
const SHEET_LOBBIES = ['KYN', 'PNVL', 'IGP', 'JNPN', 'LNL'];

const FIELDS = [
  { key: 'crewId', aliases: ['CREW ID'] },
  { key: 'desig',  aliases: ['DESIG', 'DESIG.'] },
  { key: 'taNo',   aliases: ['TA NO'] },
  { key: 'duty',   aliases: ['DUTY TYPE'] },
  { key: 'from',   aliases: ['STTN FROM'] },
  { key: 'pdd',    aliases: ['PDD'] },
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

// CREW ID + TA NO + PDD together occur in no other CMS download.
function matchesHeader(header) {
  return columnMap(header) !== null;
}

// "2:30" / "0:5" / "00:53*" -> minutes; "*" or blank -> null (not departed)
function pddMinutes(raw) {
  const v = String(raw == null ? '' : raw).trim();
  if (v === '' || v === '*' || v === '-') return { mins: null, odd: false };
  const m = v.match(/^(\d{1,2}):(\d{1,2})(\*?)$/);
  if (!m) return { mins: null, odd: true };
  return { mins: Number(m[1]) * 60 + Number(m[2]), odd: m[3] === '*' };
}

const fmtHM = (mins) => `${Math.floor(mins / 60)}:${String(Math.floor(mins % 60)).padStart(2, '0')}`;
const band = (mins) => (mins === null ? null : mins > 180 ? 'over3' : mins > 120 ? 'over2' : 'upto2');

function blank() {
  return { total: 0, over2: 0, over2Sum: 0, over3: 0, over3Sum: 0 };
}
function addRow(into, r) {
  into.total++;
  if (r.band === 'over2') { into.over2++; into.over2Sum += r.mins; }
  if (r.band === 'over3') { into.over3++; into.over3Sum += r.mins; }
}
// "24 (2:22)" — count with the band's true average, or just the count.
const withAvg = (n, sum) => (n ? `${n} (${fmtHM(sum / n)})` : '0');

/*
 * Parse a CSV buffer/string.
 * Returns { rows, warnings }
 *   rows [{ lobby, from, atHome, desig, duty, taNo, mins, band }]  every row, no names
 */
function parsePdd(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the PDD report: CREW ID, DESIG, TA NO, DUTY TYPE, STTN FROM and PDD columns are all required.');

  const warnings = [];
  const odd = [];
  const rows = records.slice(1).map((rec, i) => {
    const crewId = norm(rec[col.crewId]);
    const lobby = crewId.replace(/\d+$/, '');
    if (!lobby) throw new Error(`Row ${i + 2} has no crew id.`);
    const from = norm(rec[col.from]);
    const { mins, odd: isOdd } = pddMinutes(rec[col.pdd]);
    if (isOdd) odd.push(`row ${i + 2} "${String(rec[col.pdd]).trim()}"`);
    return {
      lobby, from, atHome: lobby === from,
      desig: norm(rec[col.desig]), duty: norm(rec[col.duty]), taNo: String(rec[col.taNo] || '').trim(),
      mins, band: band(mins),
    };
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');

  if (odd.length) {
    warnings.push(`${odd.length} PDD value${odd.length > 1 ? 's are' : ' is'} not plain h:mm and ${odd.length > 1 ? 'were' : 'was'} read as the time shown: ${odd.slice(0, 5).join(', ')}${odd.length > 5 ? ', …' : ''}.`);
  }
  if (!rows.some((r) => SHEET_LOBBIES.includes(r.lobby))) {
    warnings.push('No crew from any daily-sheet lobby in this download — check the CMS filter.');
  }
  return { rows, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows } = parsed;
  const home = rows.filter((r) => r.atHome);

  const per = new Map();
  home.forEach((r) => { if (!per.has(r.lobby)) per.set(r.lobby, blank()); addRow(per.get(r.lobby), r); });
  const get = (l) => per.get(l) || blank();
  const sum = (list) => { const t = blank(); list.forEach((c) => { t.total += c.total; t.over2 += c.over2; t.over2Sum += c.over2Sum; t.over3 += c.over3; t.over3Sum += c.over3Sum; }); return t; };

  const shownTotal = sum(SHEET_LOBBIES.map(get));
  const main = {
    title: 'PDD',
    note: 'Pre-departure detention per crew booking, home-lobby crew starting from their own lobby. ' +
      'Cases >2 Hrs is over 2:00 up to 3:00; >3 Hrs is over 3:00. Brackets: true average, to the minute.',
    headers: ['Sr No.', 'Lobby', 'Total Cases', 'Cases >2 Hrs (Avg Hrs)', 'Cases >3 Hrs (Avg Hrs)'],
    rows: SHEET_LOBBIES.map((l, i) => { const c = get(l); return [i + 1, l, c.total, withAvg(c.over2, c.over2Sum), withAvg(c.over3, c.over3Sum)]; }),
    total: ['', 'TOTAL', shownTotal.total, shownTotal.over2, shownTotal.over3],
    alertCols: [3, 4],
  };

  // Where the long detentions are — by lobby and designation, counts only.
  const byDesig = new Map();
  home.filter((r) => SHEET_LOBBIES.includes(r.lobby) && (r.band === 'over2' || r.band === 'over3'))
    .forEach((r) => { const k = `${r.lobby}|${r.desig}`; if (!byDesig.has(k)) byDesig.set(k, blank()); addRow(byDesig.get(k), r); });
  const cases = {
    title: 'Cases over 2 hours — by designation, daily-sheet lobbies',
    headers: ['Lobby', 'Desig.', 'Cases >2 Hrs (Avg Hrs)', 'Cases >3 Hrs (Avg Hrs)'],
    rows: [...byDesig.entries()]
      .sort(([a], [b]) => SHEET_LOBBIES.indexOf(a.split('|')[0]) - SHEET_LOBBIES.indexOf(b.split('|')[0]) || a.localeCompare(b))
      .map(([k, c]) => [...k.split('|'), withAvg(c.over2, c.over2Sum), withAvg(c.over3, c.over3Sum)]),
    total: byDesig.size ? ['TOTAL', '', shownTotal.over2, shownTotal.over3] : null,
    emptyText: 'No detention over 2 hours.',
    alertCols: [2, 3],
  };

  // Everything else in the file, so all rows are accounted for.
  const otherLobbies = [...per.keys()].filter((l) => !SHEET_LOBBIES.includes(l)).sort();
  const away = sum([]); rows.filter((r) => !r.atHome).forEach((r) => addRow(away, r));
  const restRows = otherLobbies.map((l) => { const c = get(l); return [l, c.total, withAvg(c.over2, c.over2Sum), withAvg(c.over3, c.over3Sum)]; });
  if (away.total) restRows.push(['Crew starting away from home lobby', away.total, withAvg(away.over2, away.over2Sum), withAvg(away.over3, away.over3Sum)]);
  const restTotal = sum([...otherLobbies.map(get), away]);
  const rest = {
    title: 'Other lobbies and away-from-home crew (not on the daily sheet)',
    note: `All rows in the download: ${rows.length}.`,
    headers: ['Lobby', 'Total Cases', 'Cases >2 Hrs (Avg Hrs)', 'Cases >3 Hrs (Avg Hrs)'],
    rows: restRows,
    total: restRows.length ? ['TOTAL', restTotal.total, restTotal.over2, restTotal.over3] : null,
    emptyText: 'Every row belongs to a daily-sheet lobby.',
    alertCols: [2, 3],
  };

  return [main, cases, rest];
}

module.exports = {
  key: 'pdd',
  label: 'PDD',
  order: 40,
  matchesHeader,
  parse: parsePdd,
  tables,
  SHEET_LOBBIES,
};
