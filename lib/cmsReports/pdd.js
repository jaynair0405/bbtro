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
 *   lobby of a row  = STTN FROM, the lobby the crew start from (user, 2026-10-15).
 *                     Only IGP, KYN, PNVL, JNPN and LNL are shown or stored.
 *   two downloads   = the lobby-wise SUMMARY page (Total Cases + bands, no names) and
 *                     the per-lobby, per-band crew LISTS behind it. The portal's summary
 *                     counts more >2/>3 cases than its own lists, so Total Cases comes
 *                     from the summary and the >2/>3 bands from the lists (merge()).
 *   total cases     = every row, including the ~120 whose PDD is "*" (the train had
 *                     not departed when the report was taken)
 *   "cases >2 hrs"  = PDD  > 2:00 and <= 3:00   (NOT everything over two hours)
 *   "cases >3 hrs"  = PDD  > 3:00
 *   (avg hrs)       = true mean of the PDD in that band, cut to the minute. The
 *                     hand-made sheet rounded these (2:20 for a true 2:22); we print
 *                     the true value by decision of 2026-09-22.
 *
 * The sheet prints counts. Clicking a count lists the crew behind it (user, 2026-10-09,
 * replacing the earlier counts-only rule); exports still print counts only.
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
  // For the drill-down only — optional, never required to recognise the file.
  [['name', 'CREW NAME'], ['train', 'TRAIN NO'], ['loco', 'LOCO NO'], ['signOn', 'SIGN ON'], ['depart', 'CREW DEPART']]
    .forEach(([k, h]) => { map[k] = cells.indexOf(h); });
  return map;
}

// CREW ID + TA NO + PDD together occur in no other CMS download; the summary page is
// told by its "Cases >03:00 HRS" column.
function matchesHeader(header) {
  if (columnMap(header) !== null) return true;
  return summaryMap(header) !== null && (header || []).some((c) => /^CASES\s*>\s*0?3:00 HRS$/.test(norm(c)));
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

// The lobby-wise summary page: one row per lobby, Total Cases + five PDD bands.
function summaryMap(header) {
  const cells = (header || []).map(norm);
  const lobby = cells.indexOf('LOBBY');
  const total = cells.indexOf('TOTAL CASES');
  return lobby === -1 || total === -1 ? null : { lobby, total };
}

/*
 * Parse a CSV buffer/string — either kind of PDD download.
 * Returns { rows, summary, warnings }
 *   rows    [{ lobby, home, desig, duty, taNo, mins, band, crewId, name, train, loco, signOn, depart, pddText }]
 *           lobby = STTN FROM (user, 2026-10-15); home = the crew id's letters, kept for reference.
 *   summary { LOBBY: total cases } from the summary page, or null for a crew list.
 *   signOnDate  "YYYY-MM-DD" every crew signed on (a file with two days is refused);
 *               null for the summary and an empty list — they carry no date.
 */
function parsePdd(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const warnings = [];

  const sm = summaryMap(records[0]);
  if (sm) {
    const summary = {};
    records.slice(1).forEach((rec) => {
      const lobby = norm(rec[sm.lobby]);
      if (lobby) summary[lobby] = Number(String(rec[sm.total]).trim()) || 0;
    });
    return { rows: [], summary, signOnDate: null, warnings };
  }

  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not a PDD report: CREW ID, DESIG, TA NO, DUTY TYPE, STTN FROM and PDD columns are all required.');

  const odd = [];
  const rows = records.slice(1).map((rec, i) => {
    const crewId = norm(rec[col.crewId]);
    const from = norm(rec[col.from]);
    if (!from) throw new Error(`Row ${i + 2} has no STTN FROM.`);
    const { mins, odd: isOdd } = pddMinutes(rec[col.pdd]);
    if (isOdd) odd.push(`row ${i + 2} "${String(rec[col.pdd]).trim()}"`);
    return {
      lobby: from, home: crewId.replace(/\d.*$/, ''),
      desig: norm(rec[col.desig]), duty: norm(rec[col.duty]), taNo: String(rec[col.taNo] || '').trim(),
      mins, band: band(mins),
      crewId, pddText: String(rec[col.pdd] == null ? '' : rec[col.pdd]).trim(),
      ...Object.fromEntries(['name', 'train', 'loco', 'signOn', 'depart']
        .map((k) => [k, col[k] === -1 ? '' : String(rec[col[k]] == null ? '' : rec[col[k]]).trim()])),
    };
  });

  if (odd.length) {
    warnings.push(`${odd.length} PDD value${odd.length > 1 ? 's are' : ' is'} not plain h:mm and ${odd.length > 1 ? 'were' : 'was'} read as the time shown: ${odd.slice(0, 5).join(', ')}${odd.length > 5 ? ', …' : ''}.`);
  }
  // The day the crew signed on = the report's data date; one file is one day.
  // "13-10-2026 17:00" -> "2026-10-13". null for an empty list (nothing to check).
  const days = [...new Set(rows.map((r) => {
    const m = r.signOn.match(/^(\d{2})-(\d{2})-(\d{4})/);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
  }).filter(Boolean))].sort();
  if (days.length > 1) throw new Error(`Crew in this file signed on different days (${days.join(', ')}) — download one day at a time from CMS.`);
  return { rows, summary: null, signOnDate: days[0] || null, warnings };
}

/*
 * Several PDD files make one day's report: the summary page plus a crew list per lobby
 * and band. Rows are joined; a row in two files (same crew id + TA no.) is counted once,
 * the later file's copy kept. A later summary replaces an earlier one.
 */
function merge(a, b) {
  // Same crew + TA in both: the later file's row wins (a later download carries the
  // departures and PDD that were still "*" earlier).
  const byKey = new Map();
  [...a.rows, ...b.rows].forEach((r) => byKey.set(`${r.crewId}|${r.taNo}`, r));
  return { rows: [...byKey.values()], summary: b.summary || a.summary,
    signOnDate: b.signOnDate || a.signOnDate, warnings: [...a.warnings, ...b.warnings] };
}

/*
 * Per sheet lobby: Total Cases from the summary when one is loaded (the crew lists only
 * hold the cases over 2 hrs), otherwise every row; the bands always from the crew rows.
 * The portal's summary counts more >2/>3 cases than its own detail lists show
 * (user, 2026-10-15: a portal fault) — the lists are taken as right.
 */
function perLobby(parsed) {
  const per = new Map(SHEET_LOBBIES.map((l) => [l, blank()]));
  parsed.rows.forEach((r) => { if (per.has(r.lobby)) addRow(per.get(r.lobby), r); });
  if (parsed.summary) per.forEach((c, l) => { c.total = parsed.summary[l] || 0; });
  return per;
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const per = perLobby(parsed);
  const home = parsed.rows.filter((r) => per.has(r.lobby));
  const t = blank();
  per.forEach((c) => { t.total += c.total; t.over2 += c.over2; t.over3 += c.over3; });

  const main = {
    title: 'PDD',
    note: 'Pre-departure detention, by the lobby the crew start from (STTN FROM). ' +
      'Cases >2 Hrs is over 2:00 up to 3:00; >3 Hrs is over 3:00. Brackets: true average, to the minute.' +
      (parsed.summary ? ' Total Cases from the CMS summary; >2 and >3 Hrs from the lobby detail lists.' : ''),
    headers: ['Sr No.', 'Lobby', 'Total Cases', 'Cases >2 Hrs (Avg Hrs)', 'Cases >3 Hrs (Avg Hrs)'],
    rows: SHEET_LOBBIES.map((l, i) => { const c = per.get(l); return [i + 1, l, c.total, withAvg(c.over2, c.over2Sum), withAvg(c.over3, c.over3Sum)]; }),
    total: ['', 'TOTAL', t.total, t.over2, t.over3],
    alertCols: [3, 4],
  };

  // Click a count: the crew behind it. Longest PDD first. Total Cases drills only
  // when it was counted from the rows, not taken from the summary.
  const crewHeaders = ['Crew ID', 'Crew Name', 'Desig.', 'Train', 'Loco', 'Sign On', 'Depart', 'PDD'];
  const crewRow = (r) => [r.crewId, r.name, r.desig, r.train, r.loco, r.signOn, r.depart, r.pddText];
  const longest = (a, b) => (b.mins == null ? -1 : b.mins) - (a.mins == null ? -1 : a.mins);
  const pick = (lobby, which) => home.filter((r) => (!lobby || r.lobby === lobby)
    && (which === 'total' || r.band === which)).sort(longest);
  const COLS = [[3, 'over2', 'over 2 up to 3 hrs'], [4, 'over3', 'over 3 hrs']];
  if (!parsed.summary) COLS.unshift([2, 'total', 'all cases']);
  main.drill = [];
  [...SHEET_LOBBIES, null].forEach((lobby, ri) => COLS.forEach(([c, which, what]) => {
    const list = pick(lobby, which);
    if (list.length === 0) return;
    main.drill.push({
      r: lobby ? ri : 'T', c, title: `${lobby || 'All sheet lobbies'} — PDD, ${what}`,
      headers: lobby ? crewHeaders : ['Lobby', ...crewHeaders],
      rows: list.map((r) => (lobby ? crewRow(r) : [r.lobby, ...crewRow(r)])),
      sortCols: lobby ? [2, 5, 7] : [0, 3, 6, 8],
    });
  }));

  // Where the long detentions are — by lobby and designation, counts only.
  const byDesig = new Map();
  home.filter((r) => r.band === 'over2' || r.band === 'over3')
    .forEach((r) => { const k = `${r.lobby}|${r.desig}`; if (!byDesig.has(k)) byDesig.set(k, blank()); addRow(byDesig.get(k), r); });
  const cases = {
    title: 'Cases over 2 hours — by designation',
    headers: ['Lobby', 'Desig.', 'Cases >2 Hrs (Avg Hrs)', 'Cases >3 Hrs (Avg Hrs)'],
    rows: [...byDesig.entries()]
      .sort(([a], [b]) => SHEET_LOBBIES.indexOf(a.split('|')[0]) - SHEET_LOBBIES.indexOf(b.split('|')[0]) || a.localeCompare(b))
      .map(([k, c]) => [...k.split('|'), withAvg(c.over2, c.over2Sum), withAvg(c.over3, c.over3Sum)]),
    total: byDesig.size ? ['TOTAL', '', t.over2, t.over3] : null,
    emptyText: 'No detention over 2 hours.',
    alertCols: [2, 3],
  };

  return [main, cases];
}

/*
 * What is stored (lib/cmsReports/store.js), sheet lobbies only (user, 2026-10-15):
 * total, over2, over3, notdep ("*", not departed), and over2_min / over3_min = summed
 * PDD minutes, so any average can be rebuilt. Crew: every sheet-lobby row, measure =
 * band (upto2 / over2 / over3 / notdep).
 */
function facts(parsed) {
  const counts = [];
  perLobby(parsed).forEach((c, lobby) => {
    const notdep = parsed.rows.filter((r) => r.lobby === lobby && r.band === null).length;
    [['total', c.total], ['over2', c.over2], ['over3', c.over3], ['over2_min', c.over2Sum], ['over3_min', c.over3Sum], ['notdep', notdep]]
      .forEach(([measure, value]) => counts.push({ lobby, measure, value }));
  });
  const crew = parsed.rows.filter((r) => SHEET_LOBBIES.includes(r.lobby)).map((r) => ({
    lobby: r.lobby, cmsId: r.crewId, name: r.name, measure: r.band || 'notdep', eventTime: null,
    detail: { desig: r.desig, duty: r.duty, ta: r.taNo, train: r.train, loco: r.loco, home: r.home,
      signOn: r.signOn, depart: r.depart, pdd: r.pddText },
  }));
  return { counts, crew };
}

// SIGN ON date = the data date; a summary or empty list has none to check.
const dmy = (iso) => iso.split('-').reverse().join('-');
function checkDate(parsed, { sheetDate, dataDate, dateOffset }) {
  if (!parsed.signOnDate) return { unchecked: 'no sign-on date in the file (a summary, or a list with no crew) — its day could not be checked.' };
  if (parsed.signOnDate === dataDate) return null;
  return { error: `crew signed on ${dmy(parsed.signOnDate)}, but this sheet's PDD is for ${dmy(dataDate)} ` +
    `(sheet date ${dmy(sheetDate)} − ${dateOffset} day${dateOffset === 1 ? '' : 's'}). Download the right day from CMS.` };
}

module.exports = {
  checkDate,
  key: 'pdd',
  dateOffset: 2,          // data date = sheet date − 2 day(s)
  label: 'PDD',
  order: 40,
  matchesHeader,
  parse: parsePdd,
  tables,
  facts,
  merge,
  SHEET_LOBBIES,
};
