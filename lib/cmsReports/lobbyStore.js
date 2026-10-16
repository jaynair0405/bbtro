'use strict';

/*
 * Storage for the Lobby page (spec: docs/superpowers/specs/2026-10-16-lobby-cms-design.md).
 * Lobby uploads are ordinary loads with cms_daily_loads.lobby set (store.saveLoad); this
 * file reads them back, reads HQ's figures and names for comparison, and keeps the remarks.
 */
const pool = require('../../config/database');

const parseJson = (v) => (typeof v === 'string' ? JSON.parse(v) : v);
const IST = (col) => `DATE_FORMAT(${col}, '%Y-%m-%d %H:%i')`;

// The lobby's current list for one report + date, with its crew rows.
async function currentList(reportKey, lobby, dataDate) {
  const [[load]] = await pool.query(
    `SELECT id, loaded_by, ${IST('loaded_at')} AS loaded_at, file_names FROM cms_daily_loads
      WHERE report_key = ? AND lobby = ? AND data_date = ? AND is_current = 1`, [reportKey, lobby, dataDate]);
  if (!load) return null;
  const [crew] = await pool.query(
    `SELECT lobby, cms_id, crew_name, measure, ${IST('event_time')} AS event_time, detail FROM cms_daily_crew
      WHERE load_id = ? ORDER BY id`, [load.id]);
  return { loadId: load.id, by: load.loaded_by, at: load.loaded_at, fileNames: load.file_names,
    crew: crew.map((c) => ({ ...c, detail: parseJson(c.detail) || {} })) };
}

// HQ's figure for one lobby: the sum of its stored counts over `measures`. null = HQ has
// no current load for that date, or no figure for that lobby (not the same as 0).
async function hqCount(reportKey, lobby, measures, dataDate) {
  const [[load]] = await pool.query(
    `SELECT id, ${IST('loaded_at')} AS loaded_at FROM cms_daily_loads
      WHERE report_key = ? AND lobby IS NULL AND data_date = ? AND is_current = 1`, [reportKey, dataDate]);
  if (!load) return null;
  const [[row]] = await pool.query(
    'SELECT SUM(value) AS v, COUNT(*) AS n FROM cms_daily_counts WHERE load_id = ? AND lobby = ? AND measure IN (?)',
    [load.id, lobby, measures]);
  if (!Number(row.n)) return null;
  return { value: Number(row.v) || 0, loadedAt: load.loaded_at };
}

// HQ's own crew rows for `lobbies` (reports whose HQ file names the crew).
async function hqNames(reportKey, lobbies, measureLike, dataDate) {
  const [[load]] = await pool.query(
    `SELECT id, loaded_by, ${IST('loaded_at')} AS loaded_at FROM cms_daily_loads
      WHERE report_key = ? AND lobby IS NULL AND data_date = ? AND is_current = 1`, [reportKey, dataDate]);
  if (!load) return null;
  const [crew] = await pool.query(
    `SELECT lobby, cms_id, crew_name, measure, ${IST('event_time')} AS event_time, detail FROM cms_daily_crew
      WHERE load_id = ? AND lobby IN (?) AND measure LIKE ? ORDER BY lobby, measure, cms_id`, [load.id, lobbies, measureLike]);
  return { loadId: load.id, by: load.loaded_by, at: load.loaded_at, crew: crew.map((c) => ({ ...c, detail: parseJson(c.detail) || {} })) };
}

// Current remarks for a report, keyed "<cms_id>|<item_key>".
async function remarksFor(reportKey, lobbies, { cmsIds }) {
  if (!cmsIds || cmsIds.length === 0 || !lobbies || lobbies.length === 0) return new Map();
  const [rows] = await pool.query(
    `SELECT cms_id, item_key, remark, written_by, ${IST('written_at')} AS written_at FROM cms_lobby_remarks
      WHERE report_key = ? AND lobby IN (?) AND cms_id IN (?) AND is_current = 1`, [reportKey, lobbies, cmsIds]);
  return new Map(rows.map((r) => [`${r.cms_id}|${r.item_key}`, { remark: r.remark, by: r.written_by, at: r.written_at }]));
}

// Write (new current row, old retired) or withdraw (empty text: retire only).
async function saveRemark({ reportKey, lobby, cmsId, itemKey, remark, user }) {
  const text = String(remark == null ? '' : remark).trim();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE cms_lobby_remarks SET is_current = 0
        WHERE report_key = ? AND lobby = ? AND cms_id = ? AND item_key = ? AND is_current = 1`,
      [reportKey, lobby, cmsId, itemKey]);
    let out = { withdrawn: true };
    if (text) {
      const [ins] = await conn.query(
        'INSERT INTO cms_lobby_remarks (report_key, lobby, cms_id, item_key, remark, written_by) VALUES (?, ?, ?, ?, ?, ?)',
        [reportKey, lobby, cmsId, itemKey, text.slice(0, 2000), String(user || 'unknown').slice(0, 50)]);
      const [[row]] = await conn.query(`SELECT ${IST('written_at')} AS at FROM cms_lobby_remarks WHERE id = ?`, [ins.insertId]);
      out = { id: ins.insertId, at: row.at, by: user };
    }
    await conn.commit();
    return out;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { currentList, hqCount, hqNames, remarksFor, saveRemark };
