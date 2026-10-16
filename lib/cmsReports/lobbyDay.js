'use strict';

/*
 * The Lobby page's cards for one sheet date and one office's lobbies. Pure assembly:
 * HQ's figure for the lobby, the names — HQ's own crew rows or the lobby's uploaded
 * list — and the current remark per item. The HQ drill (lobbyDrill.js) reuses itemsFor()
 * so both show the same rows.
 */
const pool = require('../../config/database');
const cmsReports = require('./index');
const lists = require('./lobbyLists');
const store = require('./store');
const ls = require('./lobbyStore');
const lobbyMap = require('./lobbies');

// The lobby whose office uploads for `lobby` (DR -> CSMT, LNL -> LNLX, CSMT -> CSMT).
function ownerLobby(lobby) {
  const office = lobbyMap.officeOfLobby(lobby);
  return office ? lobbyMap.lobbyOf(office).lobby : String(lobby || '').toUpperCase();
}
// Where remarks for `lobby`'s crew may be stored: under the owner (writers) — plus the lobby itself.
const remarkLobbies = (lobby) => [...new Set([ownerLobby(lobby), String(lobby || '').toUpperCase()])];

/*
 * Sheet order follows the HQ catalogue. drill = the lobby list module that explains the
 * count; measures = which stored HQ counts make the lobby's figure (null = every measure,
 * hqMeasureNot excludes a pattern); namesFromHq = measure pattern of HQ's own crew rows
 * when HQ's file names them; remarkKey = the report whose remarks this card shares.
 */
const WRWOR_MEASURES = ['freight', 'coachLink', 'coachTa'].flatMap((t) => ['wrToWor', 'wor'].flatMap((r) => ['hq', 'os'].map((b) => `${t}.${r}.${b}`)));
const CARDS = [
  { key: 'wrwor',          drill: 'wrworlist', measures: WRWOR_MEASURES, namesFromHq: null },
  { key: 'wrworhq',        drill: 'wrworlist', measures: WRWOR_MEASURES, namesFromHq: null, remarkKey: 'wrwor' }, // one booking, one remark, both blocks
  { key: 'fsd',            drill: 'fsdn',      measures: ['n'],  namesFromHq: null },
  { key: 'dutyhours',      drill: 'whlist',    measures: ['b8'], namesFromHq: null },
  { key: 'subhours',       drill: 'whlist',    measures: ['b8'], namesFromHq: 'b8' },
  { key: 'contnight',      drill: 'nightlist', measures: ['n5'], namesFromHq: null },
  { key: 'prdue',          drill: 'prlist',    measures: ['d7'], namesFromHq: null },
  { key: 'safetydue',      drill: null, measures: null, hqMeasureNot: 'excluded_%', namesFromHq: '%', hqFilter: (m) => !m.startsWith('excluded_') },
  { key: 'changeapproval', drill: null, measures: null, namesFromHq: '%' },
  { key: 'bor',            drill: null, measures: ['yesterday'], namesFromHq: 'yesterday' },
];

const HQ_HEADERS = {
  safetydue: ['Month', 'Crew ID', 'Name', 'Desig.', 'Test', 'Due', 'Status'],
  changeapproval: ['Crew ID', 'Name', 'Changed', 'Old', 'New', 'Minutes', 'Approved'],
  bor: ['Crew ID', 'Name', 'Desig.', 'Rest given', 'BOR', 'Sign on'],
  subhours: ['Crew ID', 'Name', 'Sign on', 'At', 'Sign off', 'At', 'Duty hrs'],
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthName = (m) => (/^\d{4}-\d{2}$/.test(m || '') ? `${MONTHS[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}` : m || '');
const s = (v) => (v == null ? '' : String(v));

// An HQ crew row -> { itemKey, cols } (item keys per spec §4: they name the event).
function hqItem(key, c) {
  const d = c.detail || {};
  switch (key) {
    case 'safetydue': return { itemKey: `${d.test}|${d.due}`, cols: [monthName(d.month), c.cms_id, c.crew_name, s(d.desig), s(d.test), s(d.due), s(d.status)] };
    case 'changeapproval': return { itemKey: s(d.approved) || c.event_time || `${d.field}|${d.new}`, cols: [c.cms_id, c.crew_name, s(d.field), s(d.old), s(d.new), s(d.minutes), s(d.approved)] };
    case 'bor': return { itemKey: s(d.signOn) || `${c.cms_id}|yesterday`, cols: [c.cms_id, c.crew_name, s(d.desig), s(d.rest), s(d.bor), s(d.signOn)] };
    case 'subhours': return { itemKey: c.event_time || `${c.cms_id}|b8`, cols: [c.cms_id, c.crew_name, s(d.on), s(d.onSttn), s(d.off), s(d.offSttn), s(d.hrs)] };
    default: return { itemKey: c.event_time || c.cms_id, cols: [c.cms_id, c.crew_name] };
  }
}

// Name / designation from the staff master for items whose file lacks them.
async function namesFromMaster(items) {
  const ids = [...new Set(items.filter((i) => !i.name || !i.desig).map((i) => i.cmsId))];
  if (!ids.length) return;
  const [rows] = await pool.query(
    `SELECT s.current_cms_id AS cms, s.name, d.designation_code AS desig
       FROM div_staff_master s LEFT JOIN designations d ON d.id = s.designation_id WHERE s.current_cms_id IN (?)`, [ids]);
  const by = new Map(rows.map((r) => [String(r.cms).toUpperCase(), r]));
  items.forEach((i) => {
    const m = by.get(i.cmsId);
    if (!m) return;
    if (!i.name) { i.name = m.name; i.fromMaster = true; }
    if (!i.desig) i.desig = m.desig;
    if (i.cols && !i.cols[1]) i.cols[1] = i.name;   // a list without names (night duty) shows the master's
  });
}

/*
 * HQ's figure for these lobbies on dataDate: the sum of HQ's stored counts. null only when
 * HQ has no current load for that date. A load with no row for these lobbies is a figure
 * of 0 — the report (say Working Hours Suburban for a mainline lobby) has nothing against
 * them, which is not the same as "HQ has not loaded this report".
 */
async function hqFigure(card, lobbies, dataDate) {
  const [[load]] = await pool.query(
    `SELECT id, DATE_FORMAT(loaded_at, '%Y-%m-%d %H:%i') AS loaded_at FROM cms_daily_loads
      WHERE report_key = ? AND lobby IS NULL AND data_date = ? AND is_current = 1`, [card.key, dataDate]);
  if (!load) return null;
  let where = 'load_id = ? AND lobby IN (?)';
  const params = [load.id, lobbies];
  if (card.measures) { where += ' AND measure IN (?)'; params.push(card.measures); }
  if (card.hqMeasureNot) { where += ' AND measure NOT LIKE ?'; params.push(card.hqMeasureNot); }
  const [[row]] = await pool.query(`SELECT SUM(value) AS v, COUNT(*) AS n FROM cms_daily_counts WHERE ${where}`, params);
  return { value: Number(row.v) || 0, loadedAt: load.loaded_at };
}

/*
 * One card's items for `lobbies` on `dataDate`: the lobby's list if uploaded, else HQ's
 * names where the HQ file has them. { source: 'lobby'|'hq'|null, list, items, headers }.
 */
async function itemsFor(card, lobbies, dataDate) {
  const mod = card.drill ? lists.byKey(card.drill) : null;
  if (mod) {
    // A list is stored under the office's own lobby; a covered lobby (DR, JNPN…) reads it
    // from there and keeps only its own rows.
    const cur = await ls.currentList(card.key, ownerLobby(lobbies[0]), dataDate);
    if (cur) {
      const items = cur.crew.filter((c) => lobbies.includes(c.lobby)).map((c) => ({ lobby: c.lobby, cmsId: c.cms_id, name: c.crew_name, desig: c.detail.desig || null,
        itemKey: c.detail.itemKey, cols: c.detail.cols || [c.cms_id, c.crew_name], blocks: c.detail.blocks || null }));
      return { source: 'lobby', list: { by: cur.by, at: cur.at, fileNames: cur.fileNames, count: items.length }, items, headers: mod.headers };
    }
  }
  if (card.namesFromHq) {
    const hq = await ls.hqNames(card.key, lobbies, card.namesFromHq, dataDate);
    if (hq && hq.crew.length) {
      const crew = card.hqFilter ? hq.crew.filter((c) => card.hqFilter(c.measure)) : hq.crew;
      const items = crew.map((c) => ({ lobby: c.lobby, cmsId: c.cms_id, name: c.crew_name, desig: (c.detail || {}).desig || null, ...hqItem(card.key, c) }));
      return { source: 'hq', list: { by: hq.by, at: hq.at, fileNames: null, count: items.length }, items, headers: HQ_HEADERS[card.key] || ['Crew ID', 'Name'] };
    }
  }
  return { source: null, list: null, items: [], headers: mod ? mod.headers : (HQ_HEADERS[card.key] || []) };
}

// The report a card's remarks are stored under (wrworhq shares wrwor's).
const remarkKeyOf = (key) => { const c = CARDS.find((x) => x.key === key); return (c && c.remarkKey) || key; };

async function build({ sheetDate, lobbies }) {
  const cat = new Map(cmsReports.catalogue().map((c) => [c.key, c]));
  const cards = [];
  for (const card of CARDS) {
    const hqr = cat.get(card.key);
    const dataDate = store.dataDateFor(sheetDate, hqr.dateOffset);
    const hq = await hqFigure(card, lobbies, dataDate);
    const got = await itemsFor(card, lobbies, dataDate);
    await namesFromMaster(got.items);
    const remarks = await ls.remarksFor(remarkKeyOf(card.key), lobbies, { cmsIds: got.items.map((i) => i.cmsId) });
    got.items.forEach((i) => { i.remark = remarks.get(`${i.cmsId}|${i.itemKey}`) || null; });
    const pending = got.items.filter((i) => !i.remark).length;
    const state = !hq && !got.list ? 'none'
      : !hq ? 'nohq'
      : hq.value === 0 && got.items.length === 0 ? 'none'
      : !got.list ? 'needed'
      : pending ? 'pending' : 'done';
    cards.push({ key: card.key, label: hqr.label, dateOffset: hqr.dateOffset, dataDate, drill: card.drill,
      upload: !!card.drill && got.source !== 'hq', headers: got.headers, hq, list: got.list, source: got.source,
      items: got.items, pending, state });
  }
  return { sheetDate, cards };
}

module.exports = { build, itemsFor, hqFigure, remarkKeyOf, ownerLobby, remarkLobbies, CARDS, WRWOR_MEASURES };
