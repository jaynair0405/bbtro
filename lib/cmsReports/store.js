'use strict';

/*
 * Storage for the CMS daily position (tables: sql/2026-10-12_cms_daily_storage.sql).
 *
 *   saveLoad(...)      one load of one report for one data date, with its counts and
 *                      crew, in one transaction. An earlier current load of the same
 *                      report + date is kept but marked is_current = 0.
 *   loadDay(sheetDate) the current load of every report for that sheet date, in the
 *                      same shape the upload routes return, so the page renders it as is.
 *
 * Dates go in and out as 'YYYY-MM-DD' strings — mysql2 returns DATE as a JS Date at
 * local midnight, which shifts a day in IST, so SELECTs format them in SQL.
 */

const crypto = require('crypto');
const pool = require('../../config/database');

const ISO = /^\d{4}-\d{2}-\d{2}$/;

// Sheet date minus the report's offset, as plain calendar arithmetic (no time zone).
function dataDateFor(sheetDate, offset) {
  if (!ISO.test(String(sheetDate))) throw new Error('Sheet date must be YYYY-MM-DD.');
  const d = new Date(`${sheetDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - (offset || 0));
  return d.toISOString().slice(0, 10);
}

// One CSV as is; several (slot reports) as a JSON bundle { slot: base64 } so one column holds either.
function packFiles(files) {
  if (!files || files.length === 0) return null;
  if (files.length === 1 && !files[0].slot) return files[0].buffer;
  const bundle = {};
  files.forEach((f) => { bundle[f.slot || f.name] = { name: f.name, data: f.buffer.toString('base64') }; });
  return Buffer.from(JSON.stringify(bundle));
}

const json = (v) => (v == null ? null : JSON.stringify(v));
const cut = (v, n) => (v == null ? null : String(v).slice(0, n));

/*
 * report  = a processed report ({ key, dateOffset, tables, warnings })
 * facts   = { counts: [{ lobby, measure, value }], crew: [{ lobby, cmsId, name, measure, eventTime, detail }] }
 * files   = [{ name, buffer, slot? }]   hand = typed values or null   user = username
 * Returns { id, dataDate, replaced: { loadedBy, loadedAt } | null }.
 */
async function saveLoad({ report, facts, sheetDate, files, hand, user }) {
  const dataDate = dataDateFor(sheetDate, report.dateOffset);
  const raw = packFiles(files);
  const source = raw && hand ? 'mixed' : raw ? 'file' : 'hand';
  const counts = (facts && facts.counts) || [];
  const crew = (facts && facts.crew) || [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [prev] = await conn.query(
      `SELECT id, loaded_by, DATE_FORMAT(loaded_at, '%Y-%m-%d %H:%i') AS loaded_at
         FROM cms_daily_loads
        WHERE report_key = ? AND data_date = ? AND is_current = 1
        FOR UPDATE`, [report.key, dataDate]);
    if (prev.length) {
      await conn.query('UPDATE cms_daily_loads SET is_current = 0 WHERE id IN (?)', [prev.map((p) => p.id)]);
    }
    const [ins] = await conn.query(
      `INSERT INTO cms_daily_loads
         (report_key, data_date, sheet_date, source, file_names, file_sha256, raw_file,
          hand_values, tables_json, warnings, loaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [report.key, dataDate, sheetDate, source,
        cut((files || []).map((f) => f.name).join(', ') || null, 500),
        raw ? crypto.createHash('sha256').update(raw).digest('hex') : null,
        raw, json(hand), json(report.tables), json(report.warnings || []), cut(user || 'unknown', 50)]);
    const id = ins.insertId;

    if (counts.length) {
      await conn.query(
        'INSERT INTO cms_daily_counts (load_id, report_key, data_date, lobby, measure, value) VALUES ?',
        [counts.map((c) => [id, report.key, dataDate, cut(c.lobby, 20), cut(c.measure, 60), Number(c.value) || 0])]);
    }
    if (crew.length) {
      await conn.query(
        `INSERT INTO cms_daily_crew
           (load_id, report_key, data_date, lobby, cms_id, crew_name, measure, event_time, detail) VALUES ?`,
        [crew.map((c) => [id, report.key, dataDate, cut(c.lobby, 20), cut(c.cmsId, 15) || null,
          cut(c.name, 100) || null, cut(c.measure, 60), c.eventTime || null, json(c.detail)])]);
    }
    await conn.commit();
    const p = prev[prev.length - 1];
    return { id, dataDate, replaced: p ? { loadedBy: p.loaded_by, loadedAt: p.loaded_at } : null };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/*
 * reports = [{ key, label, order, dateOffset }] (the registry). For each, the current load
 * for sheetDate - its offset. Returns page-shaped reports plus saved: { by, at, earlier }.
 */
async function loadDay(sheetDate, reports) {
  const wanted = reports.map((r) => [r.key, dataDateFor(sheetDate, r.dateOffset)]);
  if (wanted.length === 0) return [];
  const [rows] = await pool.query(
    `SELECT l.id, l.report_key, DATE_FORMAT(l.data_date, '%Y-%m-%d') AS data_date, l.source,
            l.file_names, l.tables_json, l.warnings, l.loaded_by,
            DATE_FORMAT(l.loaded_at, '%Y-%m-%d %H:%i') AS loaded_at,
            (SELECT COUNT(*) FROM cms_daily_loads e
              WHERE e.report_key = l.report_key AND e.data_date = l.data_date AND e.is_current = 0) AS earlier
       FROM cms_daily_loads l
      WHERE l.is_current = 1 AND (l.report_key, l.data_date) IN (?)`, [wanted]);
  const byKey = new Map(reports.map((r) => [r.key, r]));
  return rows.map((row) => {
    const r = byKey.get(row.report_key);
    const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);   // mysql2 may already parse JSON
    return {
      key: r.key, label: r.label, order: r.order, dateOffset: r.dateOffset,
      file: row.file_names || (row.source === 'hand' ? 'entered by hand' : ''),
      tables: parse(row.tables_json) || [],
      warnings: parse(row.warnings) || [],
      saved: { id: row.id, by: row.loaded_by, at: row.loaded_at, source: row.source, earlier: Number(row.earlier) },
    };
  }).sort((a, b) => a.order - b.order);
}

/*
 * The parts held by the current load of a slot report (night working, without
 * biometric) for one data date: { files: { slot: { name, buffer } }, hand }. A day opened
 * from storage no longer has its files in the browser, so adding one part must keep the
 * others — the route fills the missing slots from here. null when nothing is stored.
 */
async function currentParts(reportKey, dataDate) {
  const [[row]] = await pool.query(
    `SELECT raw_file, hand_values FROM cms_daily_loads
      WHERE report_key = ? AND data_date = ? AND is_current = 1`, [reportKey, dataDate]);
  if (!row) return null;
  const files = {};
  if (row.raw_file) {
    let bundle;
    try { bundle = JSON.parse(row.raw_file.toString()); } catch (e) { bundle = null; }
    if (bundle && typeof bundle === 'object') {
      Object.entries(bundle).forEach(([slot, f]) => {
        if (f && f.data) files[slot] = { name: f.name, buffer: Buffer.from(f.data, 'base64') };
      });
    }
  }
  const hand = typeof row.hand_values === 'string' ? JSON.parse(row.hand_values) : row.hand_values;
  return { files, hand: hand || null };
}

/*
 * The current load's stored counts for one report + data date, and how many crew rows
 * it carries (0 = a counts-only load, e.g. suburban working hours from the CMS count
 * report). { counts: Map('lobby|measure' -> value), crew } or null when nothing is stored.
 */
async function currentCounts(reportKey, dataDate) {
  const [[load]] = await pool.query(
    `SELECT l.id, (SELECT COUNT(*) FROM cms_daily_crew c WHERE c.load_id = l.id) AS crew
       FROM cms_daily_loads l
      WHERE l.report_key = ? AND l.data_date = ? AND l.is_current = 1`, [reportKey, dataDate]);
  if (!load) return null;
  const [rows] = await pool.query('SELECT lobby, measure, value FROM cms_daily_counts WHERE load_id = ?', [load.id]);
  return { counts: new Map(rows.map((r) => [`${r.lobby}|${r.measure}`, Number(r.value)])), crew: Number(load.crew) };
}

module.exports = { saveLoad, loadDay, dataDateFor, currentParts, currentCounts };
