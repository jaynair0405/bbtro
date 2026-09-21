'use strict';

/*
 * CMS "Working Hours" (duty hours, sign-on to sign-off) processing core — mainline.
 *
 *   S.No. | LOBBY | <=4 | 04-06 | 06-08 | 08-09 | 09-10 | 10-11 | 11-12 | 12-14 | >14 Hours | Total
 *
 * One row per lobby, all COUNTS of duties by length, then a TOTAL row written by CMS.
 * The daily sheet prints three bands, which are sums of the CMS buckets:
 *
 *   >09<=12 Hours = 09-10 + 10-11 + 11-12      >12<=14 = 12-14      >14 = >14
 *
 * Gotchas
 * - The first bucket's header is CORRUPT in the download: CMS double-encodes the
 *   "<=" sign, so it arrives as mojibake ("â¤4 Hours"). It is therefore never matched
 *   by text — it is the column sitting between LOBBY and "04-06 Hours". Every other
 *   bucket is matched by name.
 * - S.No. is blank on every row; rows are numbered here.
 * - Nothing in the file says mainline or suburban — that is a filter on the CMS screen.
 *   A suburban download would carry the identical header and could not be told apart;
 *   when one arrives, that pair needs a choice at upload.
 * - Both sets of totals in the file are checked, not trusted: each row against its
 *   Total column, and the column sums against the CMS TOTAL row. A short download
 *   (see fsd.js) is otherwise indistinguishable from a quiet day.
 *
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record: left to auto-detect, csv-parse locks onto the first
// one it sees and silently merges any row that ends differently into the next.
const EOL = ['\r\n', '\n', '\r'];

// Named buckets, in file order. `first` (<=4) is located by position, see above.
const NAMED = ['04-06 HOURS', '06-08 HOURS', '08-09 HOURS', '09-10 HOURS', '10-11 HOURS',
  '11-12 HOURS', '12-14 HOURS', '>14 HOURS'];
// "Up to 4", not "≤4": the PDF's built-in Helvetica has no ≤ glyph and prints garbage.
const BUCKET_LABELS = ['Up to 4 Hours', '04-06 Hours', '06-08 Hours', '08-09 Hours', '09-10 Hours',
  '10-11 Hours', '11-12 Hours', '12-14 Hours', '>14 Hours'];
// Indexes into the nine buckets.
const BAND_9_12 = [4, 5, 6];
const BAND_12_14 = [7];
const BAND_14 = [8];

// Lobbies printed on the daily sheet, in sheet order. Others are reported separately.
const SHEET_LOBBIES = ['CSMT', 'IGP', 'KYN', 'LNL', 'LNLX', 'PNVL'];

function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, ' ');
}

// -> { lobby, buckets:[9 column indexes], total } or null
function columnMap(header) {
  const cells = (header || []).map(norm);
  const lobby = cells.indexOf('LOBBY');
  const total = cells.indexOf('TOTAL');
  const named = NAMED.map((n) => cells.indexOf(n));
  if (lobby === -1 || total === -1 || named.includes(-1)) return null;
  // The unnamed <=4 bucket must be exactly the one column between LOBBY and 04-06.
  if (named[0] !== lobby + 2) return null;
  return { lobby, buckets: [lobby + 1, ...named], total };
}

function matchesHeader(header) {
  return columnMap(header) !== null;
}

const sumAt = (arr, idxs) => idxs.reduce((s, i) => s + arr[i], 0);

/*
 * Parse a CSV buffer/string.
 * Returns { lobbies, totals, warnings }
 *   lobbies [{ lobby, buckets:[9], total }]   file order, CMS TOTAL row excluded
 *   totals  { buckets:[9], total }            our column sums
 */
function parseDutyHours(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the Working Hours report: LOBBY, the 04-06 … >14 Hours bands and Total columns are all required.');

  const warnings = [];
  const lobbies = [];
  let cmsTotal = null;

  records.slice(1).forEach((rec, i) => {
    const lobby = norm(rec[col.lobby]);
    const where = `Row ${i + 2} (${lobby || 'no lobby'})`;
    if (rec.length !== records[0].length) {
      throw new Error(`${where} has ${rec.length} columns, the header has ${records[0].length}.`);
    }
    const num = (ci) => {
      const raw = String(rec[ci] == null ? '' : rec[ci]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`${where} has a non-numeric count "${raw}".`);
      return Number(raw);
    };
    const row = { lobby, buckets: col.buckets.map(num), total: num(col.total) };
    if (!lobby) throw new Error(`Row ${i + 2} has no lobby.`);

    const own = sumAt(row.buckets, row.buckets.map((_, k) => k));
    if (own !== row.total) warnings.push(`${where}: the bands add up to ${own} but its Total column says ${row.total}.`);

    if (lobby === 'TOTAL') cmsTotal = row;
    else lobbies.push(row);
  });

  if (lobbies.length === 0) throw new Error('The file has a header but no data rows.');

  const totals = { buckets: BUCKET_LABELS.map((_, k) => lobbies.reduce((s, l) => s + l.buckets[k], 0)), total: 0 };
  totals.total = lobbies.reduce((s, l) => s + l.total, 0);

  if (!cmsTotal) warnings.push('The download has no CMS TOTAL row — it may have been cut short.');
  else {
    const off = BUCKET_LABELS.filter((_, k) => cmsTotal.buckets[k] !== totals.buckets[k]);
    if (cmsTotal.total !== totals.total) off.push('Total');
    if (off.length) warnings.push(`The lobbies do not add up to the CMS TOTAL row in: ${off.join(', ')} — the download may be incomplete.`);
  }

  SHEET_LOBBIES.filter((s) => !lobbies.some((l) => l.lobby === s))
    .forEach((s) => warnings.push(`${s} is on the daily sheet but not in this download — shown as 0. Check the CMS filter.`));

  return { lobbies, totals, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { lobbies } = parsed;
  const blank = (name) => ({ lobby: name, buckets: BUCKET_LABELS.map(() => 0), total: 0 });
  const shown = SHEET_LOBBIES.map((s) => lobbies.find((l) => l.lobby === s) || blank(s));
  const others = lobbies.filter((l) => !SHEET_LOBBIES.includes(l.lobby));

  const bands = (b) => [sumAt(b, BAND_9_12), sumAt(b, BAND_12_14), sumAt(b, BAND_14)];
  const colSum = (rows, k) => rows.reduce((s, l) => s + l.buckets[k], 0);
  const sumBuckets = (rows) => BUCKET_LABELS.map((_, k) => colSum(rows, k));

  const main = {
    title: 'Working Hours Mainline',
    note: 'Duty hours from sign-on to sign-off. >09<=12 is the sum of the 09-10, 10-11 and 11-12 bands.',
    headers: ['Sr No.', 'Lobby', '>09<=12 Hours', '>12<=14 Hours', '>14 Hours'],
    rows: shown.map((l, i) => [i + 1, l.lobby, ...bands(l.buckets)]),
    total: ['', 'TOTAL', ...bands(sumBuckets(shown))],
    alertCols: [3, 4],
  };

  // Only the sheet's three bands are printed. The nine CMS buckets are still parsed —
  // the totals check needs them, and they are what gets stored once tables exist.
  const out = [main];
  if (others.length) {
    out.push({
      title: 'Other lobbies in the download (not on the daily sheet)',
      headers: ['Lobby', '>09<=12 Hours', '>12<=14 Hours', '>14 Hours'],
      rows: others.map((l) => [l.lobby, ...bands(l.buckets)]),
      total: ['TOTAL', ...bands(sumBuckets(others))],
      alertCols: [2, 3],
    });
  }
  return out;
}

module.exports = {
  key: 'dutyhours',
  label: 'Working Hours Mainline',
  order: 30,
  matchesHeader,
  parse: parseDutyHours,
  tables,
  SHEET_LOBBIES,
};
