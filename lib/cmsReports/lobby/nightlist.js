'use strict';

/*
 * CMS "More Than 4 Continuous Night Duty (00:00 to 06:00)" crew list — a MONTH's record
 * for one lobby and one crew type (the CMS screen title says so; the file does not):
 *
 *   SNo. | CREW ID | FIRST NIGHT HRS | SECOND NIGHT HRS | ... | SIXTH NIGHT HRS
 *
 * Night cells are "11-10-2026/06:00" or blank. No name / designation: the page fills
 * them from the staff master. A streak that ended days ago may still be listed.
 */
const { parse } = require('csv-parse/sync');

const EOL = ['\r\n', '\n', '\r'];
const norm = (c) => String(c == null ? '' : c).trim().toUpperCase().replace(/\s+/g, ' ');
const NIGHTS = ['FIRST NIGHT HRS', 'SECOND NIGHT HRS', 'THIRD NIGHT HRS', 'FOURTH NIGHT HRS', 'FIFTH NIGHT HRS', 'SIXTH NIGHT HRS'];

function columnMap(header) {
  const cells = (header || []).map(norm);
  const crew = cells.indexOf('CREW ID');
  if (crew === -1) return null;
  const nights = NIGHTS.map((h) => cells.indexOf(h));
  if (nights.slice(0, 4).some((i) => i === -1)) return null;
  return { crew, nights: nights.filter((i) => i !== -1) };
}
const matchesHeader = (header) => columnMap(header) !== null;

// "11-10-2026/06:00" -> { iso: '2026-10-11', show: '11-10', month: '2026-10' }
function night(raw) {
  const m = String(raw == null ? '' : raw).trim().match(/^(\d{2})-(\d{2})-(\d{4})/);
  return m ? { iso: `${m[3]}-${m[2]}-${m[1]}`, show: `${m[1]}-${m[2]}`, month: `${m[3]}-${m[2]}` } : null;
}

function parseNights(buffer) {
  const recs = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (recs.length === 0) throw new Error('The file is empty.');
  const col = columnMap(recs[0]);
  if (!col) throw new Error('This is not the continuous night duty crew list.');
  const rows = recs.slice(1).map((rec, i) => {
    const crewId = norm(rec[col.crew]);
    if (!crewId) throw new Error(`Row ${i + 2} has no crew id.`);
    const nights = col.nights.map((c) => night(rec[c])).filter(Boolean);
    if (nights.length === 0) throw new Error(`Row ${i + 2} (${crewId}) has no night dates.`);
    return { crewId, lobby: crewId.replace(/\d.*$/, ''), nights };
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');
  return { rows, warnings: [] };
}

// Name is blank in the file; the page fills it from the staff master (lobbyDay.namesFromMaster).
const headers = ['Crew ID', 'Name', 'Nights', 'From', 'To'];

const items = (parsed) => parsed.rows.map((r) => ({
  lobby: r.lobby, cmsId: r.crewId, name: null, desig: null, measure: 'n5',
  itemKey: r.nights[0].iso, eventTime: `${r.nights[0].iso} 00:00:00`,
  cols: [r.crewId, '', String(r.nights.length), r.nights[0].show, r.nights[r.nights.length - 1].show],
}));

// A month's record: every night must fall in the sheet's month.
function checkDate(parsed, { sheetDate }) {
  const month = String(sheetDate).slice(0, 7);
  const other = [...new Set(parsed.rows.flatMap((r) => r.nights.map((n) => n.month)).filter((m) => m !== month))];
  return other.length ? { error: `nights fall in ${other.join(', ')} — this sheet is for ${month}.` } : null;
}

module.exports = { key: 'nightlist', label: 'Continuous Night Duty, more than 4 nights', drills: 'contnight', dateOffset: 1,
  measure: 'n5', headers, matchesHeader, parse: parseNights, items, checkDate };
