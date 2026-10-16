'use strict';

/*
 * CMS crew lists behind the WR / WOR booking counts (lobbywise and HQ-wise screens give
 * the same layouts). Two headers:
 *
 *   WOR list (23 cols):     ... | Final Booking Type | Org Booking Type |
 *                           Sys Booking Wor Reason | User Filled Booking Wor Reason | ...
 *   WR→WOR list (22 cols):  ... | Final Booking Type | Org Booking Type | SignOFF Wor Reason | ...
 *
 * Common: Sr.No. | Crew Id | Name | Desig | HQ | Ta No | Ord Time | TA Route No |
 * Book Route No | ServiceType | Call Book Lobby | ...  Case = Org→Final (WR→WOR or WOR).
 * Traffic: FGHT and DEPT = freight, CCHM = coaching (TA). HQ/OS = HQ equals Call Book Lobby.
 * The same booking appears in the lobbywise list (at the call lobby) and the HQ-wise list
 * (at the crew's HQ); merge() joins by Ta No so it is one item.
 */
const { parse } = require('csv-parse/sync');

const EOL = ['\r\n', '\n', '\r'];
const norm = (c) => String(c == null ? '' : c).trim().toUpperCase().replace(/\s+/g, ' ');
const COMMON = ['CREW ID', 'NAME', 'DESIG', 'HQ', 'TA NO', 'ORD TIME', 'SERVICETYPE', 'CALL BOOK LOBBY', 'FINAL BOOKING TYPE', 'ORG BOOKING TYPE'];
const REASON_WOR = ['SYS BOOKING WOR REASON', 'USER FILLED BOOKING WOR REASON'];
const REASON_W2W = ['SIGNOFF WOR REASON'];

function columnMap(header) {
  const cells = (header || []).map(norm);
  const map = {};
  for (const h of COMMON) { const i = cells.indexOf(h); if (i === -1) return null; map[h] = i; }
  if (REASON_WOR.every((h) => cells.includes(h))) map.reason = REASON_WOR.map((h) => cells.indexOf(h));
  else if (REASON_W2W.every((h) => cells.includes(h))) map.reason = REASON_W2W.map((h) => cells.indexOf(h));
  else return null;
  return map;
}
const matchesHeader = (header) => columnMap(header) !== null;

// "15-10-2026 21:40" -> parts
function dt(raw) {
  const m = String(raw == null ? '' : raw).trim().match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
  if (!m) return null;
  return { sql: `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}:00`, date: `${m[3]}-${m[2]}-${m[1]}`, show: `${m[1]}-${m[2]} ${m[4]}:${m[5]}` };
}
// Keys as in wrwor.js TRAFFIC: freight / coachLink / coachTa. The lists carry no LINK/TA
// distinction and Coaching LINK has been zero in every HQ file, so coaching -> coachTa.
const trafficOf = (svc) => (['FGHT', 'DEPT'].includes(svc) ? 'freight' : 'coachTa');

function parseList(buffer) {
  const recs = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (recs.length === 0) throw new Error('The file is empty.');
  const col = columnMap(recs[0]);
  if (!col) throw new Error('This is not a WR / WOR crew list.');
  const rows = recs.slice(1).map((rec, i) => {
    const crewId = norm(rec[col['CREW ID']]);
    if (!crewId) throw new Error(`Row ${i + 2} has no crew id.`);
    const ord = dt(rec[col['ORD TIME']]);
    if (!ord) throw new Error(`Row ${i + 2}: Ord Time "${rec[col['ORD TIME']]}" is not a date.`);
    const fin = norm(rec[col['FINAL BOOKING TYPE']]);
    const org = norm(rec[col['ORG BOOKING TYPE']]);
    const rule = fin === 'WOR' && org === 'WR' ? 'wrToWor' : fin === 'WOR' ? 'wor' : 'wr';
    return {
      crewId, name: String(rec[col['NAME']] || '').trim(), desig: norm(rec[col['DESIG']]),
      hq: norm(rec[col['HQ']]), ta: String(rec[col['TA NO']] || '').trim(), ord,
      svc: norm(rec[col['SERVICETYPE']]), callLobby: norm(rec[col['CALL BOOK LOBBY']]), rule,
      reason: col.reason.map((i) => String(rec[i] || '').trim()).filter(Boolean).join(' / '),
    };
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');
  return { rows, warnings: [] };
}

// Several lists (WOR + WR→WOR, lobbywise + HQ-wise) make one; the same TA is one booking.
function merge(a, b) {
  const seen = new Map(a.rows.map((r) => [r.ta, r]));
  b.rows.forEach((r) => { if (!seen.has(r.ta)) seen.set(r.ta, r); });
  return { rows: [...seen.values()], warnings: [...a.warnings, ...b.warnings] };
}

const headers = ['Crew ID', 'Name', 'Desig.', 'Case', 'Traffic', 'Booked at', 'Reason', 'TA'];
const CASE = { wrToWor: 'WR→WOR', wor: 'WOR', wr: 'WR' };

/*
 * Items that count for `lobby`: in the lobbywise block when the call lobby is it, in the
 * HQ-wise block when the crew's HQ is it. One item per booking either way.
 */
function items(parsed, { lobby }) {
  const L = norm(lobby);
  return parsed.rows.filter((r) => r.rule !== 'wr' && (r.callLobby === L || r.hq === L)).map((r) => {
    const blocks = [];
    if (r.callLobby === L) blocks.push('lobby');
    if (r.hq === L) blocks.push('hq');
    const base = r.hq === r.callLobby ? 'hq' : 'os';
    const traffic = trafficOf(r.svc);
    return {
      lobby: L, cmsId: r.crewId, name: r.name, desig: r.desig,
      measure: `${traffic}.${r.rule}.${base}`, blocks,
      itemKey: r.ta, eventTime: r.ord.sql,
      cols: [r.crewId, r.name, r.desig, CASE[r.rule], traffic === 'freight' ? 'Freight' : 'Coaching',
        `${r.callLobby} (${base.toUpperCase()})`, r.reason, r.ta],
      detail: { callLobby: r.callLobby, hqLobby: r.hq, svc: r.svc, reason: r.reason },
    };
  });
}

function checkDate(parsed, { dataDate }) {
  const dates = [...new Set(parsed.rows.map((r) => r.ord.date))];
  if (dates.length === 1 && dates[0] === dataDate) return null;
  const show = (d) => d.split('-').reverse().join('-');
  return { error: `bookings are ordered on ${dates.map(show).join(', ')} — this sheet needs ${show(dataDate)}.` };
}

module.exports = { key: 'wrworlist', label: 'WR / WOR Booking', drills: 'wrwor', alsoDrills: ['wrworhq'], dateOffset: 1,
  measure: null, headers, matchesHeader, parse: parseList, merge, items, checkDate };
