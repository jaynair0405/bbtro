'use strict';

/*
 * CMS suburban duty list -> "Working Hours Suburban" processing core.
 *
 * Suburban has no count report like the mainline one; the download is the raw
 * duty list (~700 rows a day, all MMAN), one row per duty:
 *
 *   S.No. | CREW ID | NAME | DESIG | TOTAL DUTY | SIGNON DATE | SIGNON STTN | ... |
 *   SIGNOFF DATE | SIGNOFF STTN | DUTY HRS | DUTY TYPE | TRAIN NO | ...
 *
 * The sheet is derived here, banding DUTY HRS (sign-on to sign-off) exactly as the
 * mainline report does. Verified against the 20-09-2026 sheet (the only day with
 * cases): KYNS 1 in >14 (a 30:57 "duty" — almost certainly a missed sign-off, but
 * the sheet reports it and so do we), PNVS 1 in >09<=12 (a WG waiting duty, so duty
 * type is NOT filtered).
 *
 *   lobby   = letters of CREW ID (CSTS / KYNS / PNVS). Both proven cases signed on
 *             at their own lobby, so sign-on station would give the same answer.
 *             Duties away from home are reported separately, never dropped.
 *
 * Counts only — the file carries crew names, the page shows none. No date in the
 * header row; the caller supplies it (SIGNON DATE is per row, one has "-").
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

// Same nine buckets as dutyhours.js so the two can be stored alike.
const BUCKET_LABELS = ['Up to 4 Hours', '04-06 Hours', '06-08 Hours', '08-09 Hours', '09-10 Hours',
  '10-11 Hours', '11-12 Hours', '12-14 Hours', '>14 Hours'];
const BUCKET_MAX = [240, 360, 480, 540, 600, 660, 720, 840, Infinity]; // minutes, inclusive upper bound
const BAND_9_12 = [4, 5, 6];
const BAND_12_14 = [7];
const BAND_14 = [8];

// Lobbies printed on the daily sheet, in sheet order.
const SHEET_LOBBIES = ['CSTS', 'KYNS', 'PNVS'];

const FIELDS = [
  { key: 'crewId', aliases: ['CREW ID'] },
  { key: 'desig',  aliases: ['DESIG', 'DESIG.'] },
  { key: 'total',  aliases: ['TOTAL DUTY'] },
  { key: 'onSttn', aliases: ['SIGNON STTN'] },
  { key: 'offSttn', aliases: ['SIGNOFF STTN'] },
  { key: 'hrs',    aliases: ['DUTY HRS'] },
  { key: 'duty',   aliases: ['DUTY TYPE'] },
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

// TOTAL DUTY + SIGNON STTN + DUTY HRS together occur in no other CMS download.
function matchesHeader(header) {
  return columnMap(header) !== null;
}

// "8:5" / "30:57" -> minutes; anything else -> null
function hrsMinutes(raw) {
  const m = String(raw == null ? '' : raw).trim().match(/^(\d{1,3}):(\d{1,2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
const bucketOf = (mins) => BUCKET_MAX.findIndex((max) => mins <= max);
const sumAt = (arr, idxs) => idxs.reduce((s, i) => s + arr[i], 0);
const zeroBuckets = () => BUCKET_LABELS.map(() => 0);

/*
 * Parse a CSV buffer/string.
 * Returns { rows, warnings }
 *   rows [{ lobby, onSttn, atHome, desig, duty, mins, bucket }]  every row, no names
 */
function parseSubHours(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the suburban duty list: CREW ID, DESIG, TOTAL DUTY, SIGNON STTN, SIGNOFF STTN, DUTY HRS and DUTY TYPE columns are all required.');

  const warnings = [];
  const bad = [];
  const long = [];
  const rows = records.slice(1).map((rec, i) => {
    const crewId = norm(rec[col.crewId]);
    const lobby = crewId.replace(/\d.*$/, '');
    if (!lobby) throw new Error(`Row ${i + 2} has no crew id.`);
    const onSttn = norm(rec[col.onSttn]);
    const mins = hrsMinutes(rec[col.hrs]);
    if (mins === null) bad.push(`row ${i + 2} "${String(rec[col.hrs]).trim()}"`);
    else if (mins > 24 * 60) long.push(`${lobby} row ${i + 2} (${String(rec[col.hrs]).trim()})`);
    return {
      lobby, onSttn, atHome: lobby === onSttn,
      desig: norm(rec[col.desig]), duty: norm(rec[col.duty]),
      mins, bucket: mins === null ? null : bucketOf(mins),
    };
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');

  if (bad.length) {
    warnings.push(`${bad.length} DUTY HRS value${bad.length > 1 ? 's are' : ' is'} not h:mm and ${bad.length > 1 ? 'were' : 'was'} left out of the bands: ${bad.slice(0, 5).join(', ')}${bad.length > 5 ? ', …' : ''}.`);
  }
  if (long.length) {
    warnings.push(`Duty over 24 hours — probably a missed sign-off, counted as the sheet does: ${long.join(', ')}.`);
  }
  if (!rows.some((r) => SHEET_LOBBIES.includes(r.lobby))) {
    warnings.push('No crew from CSTS, KYNS or PNVS in this download — check the CMS filter.');
  }
  return { rows, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows } = parsed;
  const bands = (b) => [sumAt(b, BAND_9_12), sumAt(b, BAND_12_14), sumAt(b, BAND_14)];
  const bucketsOf = (list) => { const b = zeroBuckets(); list.forEach((r) => { if (r.bucket !== null) b[r.bucket]++; }); return b; };

  const home = rows.filter((r) => r.atHome);
  const shownRows = SHEET_LOBBIES.map((l) => home.filter((r) => r.lobby === l));
  const main = {
    title: 'Working Hours Suburban',
    note: 'Duty hours from sign-on to sign-off, motormen at their own lobby. >09<=12 is the sum of the 09-10, 10-11 and 11-12 bands.',
    headers: ['Sr No.', 'Lobby', '>09<=12 Hours', '>12<=14 Hours', '>14 Hours'],
    rows: SHEET_LOBBIES.map((l, i) => [i + 1, l, ...bands(bucketsOf(shownRows[i]))]),
    total: ['', 'TOTAL', ...bands(bucketsOf(shownRows.flat()))],
    alertCols: [2, 3, 4],
  };

  // The cases themselves, counts only: lobby x duty type, with the longest duty.
  const over = home.filter((r) => SHEET_LOBBIES.includes(r.lobby) && r.mins !== null && r.mins > 540);
  const byKey = new Map();
  over.forEach((r) => {
    const k = `${r.lobby}|${r.duty}`;
    if (!byKey.has(k)) byKey.set(k, { n: 0, max: 0 });
    const c = byKey.get(k); c.n++; c.max = Math.max(c.max, r.mins);
  });
  const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const cases = {
    title: 'Duties over 9 hours — by lobby and duty type',
    headers: ['Lobby', 'Duty Type', 'Duties', 'Longest'],
    rows: [...byKey.entries()]
      .sort(([a], [b]) => SHEET_LOBBIES.indexOf(a.split('|')[0]) - SHEET_LOBBIES.indexOf(b.split('|')[0]) || a.localeCompare(b))
      .map(([k, c]) => [...k.split('|'), c.n, fmt(c.max)]),
    total: over.length ? ['TOTAL', '', over.length, ''] : null,
    emptyText: 'No duty over 9 hours.',
    alertCols: [2],
  };

  const out = [main, cases];
  const otherLobbies = [...new Set(home.map((r) => r.lobby))].filter((l) => !SHEET_LOBBIES.includes(l)).sort();
  const away = rows.filter((r) => !r.atHome);
  if (otherLobbies.length || away.length) {
    const restRows = otherLobbies.map((l) => [l, home.filter((r) => r.lobby === l).length, ...bands(bucketsOf(home.filter((r) => r.lobby === l)))]);
    if (away.length) restRows.push(['Signed on away from own lobby', away.length, ...bands(bucketsOf(away))]);
    const all = [...otherLobbies.flatMap((l) => home.filter((r) => r.lobby === l)), ...away];
    out.push({
      title: 'Other lobbies and away-from-home duties (not on the daily sheet)',
      note: `All duties in the download: ${rows.length}.`,
      headers: ['Lobby', 'Duties', '>09<=12 Hours', '>12<=14 Hours', '>14 Hours'],
      rows: restRows,
      total: ['TOTAL', all.length, ...bands(bucketsOf(all))],
      alertCols: [2, 3, 4],
    });
  }
  return out;
}

module.exports = {
  key: 'subhours',
  label: 'Working Hours Suburban',
  order: 50,
  matchesHeader,
  parse: parseSubHours,
  tables,
  SHEET_LOBBIES,
};
