'use strict';

/*
 * CMS PR (pre-run counselling) due crew list — the "NO PR IN LAST 7 DAYS" names:
 *
 *   S. No. | CREW ID | CREW NAME | ORIGINAL DESG. | 1: NO PR IN LAST 7 DAYS ^ |
 *   2: LAST 3 NIGHT WORKING | 3: > 54 HRS SINCE LAST PR | SECOND LAST PR DATE |
 *   LAST AVAILED PR DATE | NEXT SIGNON AFTER PR | CREW STATUS | AVAILABLE STTN. |
 *   BOOKING WOR | ZONE CODE | DIVISION CODE | LOBBY CODE
 *
 * CMS pads CREW ID as "@<spaces>CSMT6162" and flag 1 as "Y/<spaces>7" (days). Lobby =
 * LOBBY CODE. The file carries no run date, so the date is not checked.
 *
 * The "NO PR IN LAST 3 MONTHS" list (17-10-2026) has the SAME header: its rows carry
 * "#<spaces>KYN6053", flag 1 "-/ -" and no last PR date (crew who never had a PR). So the
 * measure is read per row — 'Y/' = d7, otherwise m3 — and the two files merge into one
 * list for the card (lobbyDay CARDS prdue measures d7 + m3).
 */
const { parse } = require('csv-parse/sync');

const EOL = ['\r\n', '\n', '\r'];
const norm = (c) => String(c == null ? '' : c).trim().toUpperCase().replace(/\s+/g, ' ');
const COLS = { crew: 'CREW ID', name: 'CREW NAME', desig: 'ORIGINAL DESG.', last: 'LAST AVAILED PR DATE', status: 'CREW STATUS', lobby: 'LOBBY CODE' };

function columnMap(header) {
  const cells = (header || []).map(norm);
  const map = {};
  for (const [k, h] of Object.entries(COLS)) { const i = cells.indexOf(h); if (i === -1) return null; map[k] = i; }
  map.d7 = cells.findIndex((c) => c.startsWith('1: NO PR IN LAST 7 DAYS'));
  if (map.d7 === -1) return null;
  return map;
}
const matchesHeader = (header) => columnMap(header) !== null;

// "07-10-2026 16:04 : 30" -> parts (the trailing " : 30" is ignored)
function dt(raw) {
  const m = String(raw == null ? '' : raw).trim().match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
  if (!m) return null;
  return { sql: `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}:00`, min: `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}`, show: `${m[1]}-${m[2]} ${m[4]}:${m[5]}` };
}

function parsePr(buffer) {
  const recs = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (recs.length === 0) throw new Error('The file is empty.');
  const col = columnMap(recs[0]);
  if (!col) throw new Error('This is not the PR due crew list.');
  const rows = recs.slice(1).map((rec, i) => {
    const crewId = norm(rec[col.crew]).replace(/^[@#]\s*/, '');
    if (!crewId) throw new Error(`Row ${i + 2} has no crew id.`);
    const flag = norm(rec[col.d7]);                       // "Y/ 7" (7-day list) or "-/ -" (3-month list)
    const measure = /^Y\//.test(flag) ? 'd7' : 'm3';
    const days = (flag.match(/(\d+)\s*$/) || [])[1] || '';
    return {
      crewId, name: String(rec[col.name] || '').trim(), desig: norm(rec[col.desig]), measure, days,
      last: dt(rec[col.last]), status: norm(rec[col.status]), lobby: norm(rec[col.lobby]),
    };
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');
  return { rows, warnings: [] };
}

// The 7-day and the 3-month files make one list; the same crew in both (should not happen) counts once.
function merge(a, b) {
  const seen = new Map(a.rows.map((r) => [r.crewId, r]));
  b.rows.forEach((r) => { if (!seen.has(r.crewId)) seen.set(r.crewId, r); });
  return { rows: [...seen.values()], warnings: [...a.warnings, ...b.warnings] };
}

const headers = ['Crew ID', 'Name', 'Desig.', 'No PR for', 'Last PR', 'Status'];

const items = (parsed) => parsed.rows.map((r) => ({
  lobby: r.lobby, cmsId: r.crewId, name: r.name, desig: r.desig, measure: r.measure,
  itemKey: r.last ? r.last.min : `${r.crewId}|none`, eventTime: r.last ? r.last.sql : null,
  cols: [r.crewId, r.name, r.desig, r.measure === 'm3' ? '3 months' : `${r.days} d`, r.last ? r.last.show : '—', r.status],
}));

const checkDate = () => ({ unchecked: 'the PR due list carries no run date' });

module.exports = { key: 'prlist', label: 'PR Overdue, no PR in last 7 days / 3 months', drills: 'prdue', dateOffset: 1,
  measure: 'd7', headers, matchesHeader, parse: parsePr, merge, items, checkDate };
