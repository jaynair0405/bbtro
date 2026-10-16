'use strict';

/*
 * CMS FSD (fog signal device) per-crew list, the one behind an "FSD N" count:
 *
 *   S.NO | ZONE | DIVISION | CREW ID | CREW NAME | SIGN ON DATETIME | SIGN ON STATION |
 *   SIGN OFF DATETIME | FSD RECEIVED
 *
 * Datetimes are "2026-10-15 23:49:00.0". Lobby = SIGN ON STATION (as HQ's count report
 * counts). Only N rows are items; a Y row in the file is ignored with a warning.
 */
const { parse } = require('csv-parse/sync');

const EOL = ['\r\n', '\n', '\r'];
const norm = (c) => String(c == null ? '' : c).trim().toUpperCase().replace(/\s+/g, ' ');
const COLS = ['CREW ID', 'CREW NAME', 'SIGN ON DATETIME', 'SIGN ON STATION', 'SIGN OFF DATETIME', 'FSD RECEIVED'];

function columnMap(header) {
  const cells = (header || []).map(norm);
  const map = {};
  for (const h of COLS) { const i = cells.indexOf(h); if (i === -1) return null; map[h] = i; }
  return map;
}
const matchesHeader = (header) => columnMap(header) !== null;

// "2026-10-15 23:49:00.0" -> { sql, min, date, show } | null
function dt(raw) {
  const m = String(raw == null ? '' : raw).trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return null;
  return { sql: `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:00`, min: `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}`, date: `${m[1]}-${m[2]}-${m[3]}`,
    show: `${m[3]}-${m[2]} ${m[4]}:${m[5]}` };
}

function parseFsdn(buffer) {
  const recs = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (recs.length === 0) throw new Error('The file is empty.');
  const col = columnMap(recs[0]);
  if (!col) throw new Error('This is not the FSD crew list.');
  const warnings = [];
  let yRows = 0;
  const rows = [];
  recs.slice(1).forEach((rec, i) => {
    const crewId = norm(rec[col['CREW ID']]);
    if (!crewId) throw new Error(`Row ${i + 2} has no crew id.`);
    if (norm(rec[col['FSD RECEIVED']]) !== 'N') { yRows++; return; }
    const on = dt(rec[col['SIGN ON DATETIME']]);
    if (!on) throw new Error(`Row ${i + 2}: SIGN ON DATETIME "${rec[col['SIGN ON DATETIME']]}" is not a date.`);
    const off = dt(rec[col['SIGN OFF DATETIME']]);
    rows.push({ crewId, name: String(rec[col['CREW NAME']] || '').trim(), lobby: norm(rec[col['SIGN ON STATION']]), on, off });
  });
  if (rows.length === 0) throw new Error('No "FSD RECEIVED = N" rows in this file — download the list behind the N count.');
  if (yRows) warnings.push(`${yRows} row${yRows > 1 ? 's' : ''} with FSD received (Y) ignored.`);
  return { rows, warnings };
}

const headers = ['Crew ID', 'Name', 'Sign on', 'At', 'Sign off'];

const items = (parsed) => parsed.rows.map((r) => ({
  lobby: r.lobby, cmsId: r.crewId, name: r.name, desig: null, measure: 'n',
  itemKey: r.on.min, eventTime: r.on.sql,
  cols: [r.crewId, r.name, r.on.show, r.lobby, r.off ? r.off.show : '—'],
}));

// Every sign-on must be on the data date (sheet − 1).
function checkDate(parsed, { dataDate }) {
  const dates = [...new Set(parsed.rows.map((r) => r.on.date))];
  if (dates.length === 1 && dates[0] === dataDate) return null;
  const show = (d) => d.split('-').reverse().join('-');
  return { error: `sign-ons are dated ${dates.map(show).join(', ')} — this sheet needs ${show(dataDate)}.` };
}

module.exports = { key: 'fsdn', label: 'FSD not carried', drills: 'fsd', dateOffset: 1, measure: 'n', headers,
  matchesHeader, parse: parseFsdn, items, checkDate };
