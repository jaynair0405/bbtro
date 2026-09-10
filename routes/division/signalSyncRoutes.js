/**
 * signalSyncRoutes.js — Signal sync outbox (prod → local)
 * Mounted at /api/division/signal-sync   (division_admin only)
 *
 *   GET  /pending      pending queue rows + their recent history entries
 *   GET  /sql          dated migration applying the pending rows to local
 *   POST /mark-synced  { signal_ids: [] } → set synced_at
 *
 * Why the SQL only touches the editor's columns: the snapshot holds every
 * column, but local carries data prod lacks (lat/long, km_from_csmt, magnet_id
 * uploads land on master first). Writing the whole snapshot would null those.
 * So an UPDATE sets exactly the fields the editor can change; only a CREATED
 * signal is inserted in full. See docs/SIGNAL_SYNC_PLAN.md.
 */

const express = require('express');
const { escape } = require('mysql2');
const { normalizeSignalNumber } = require('./signalBookRoutes');
const router = express.Router();

// The columns the signal-book editor writes (mirrors sigFields in publish).
const EDITOR_COLS = [
  'signal_number', 'normalized_signal_number', 'location_text', 'km_text',
  'placement', 'on_curve', 'is_rhs', 'is_ext_rhs', 'is_lhs', 'is_ext_lhs',
  'signal_type', 'signal_function', 'has_legend_board', 'visibility_distance_m',
  'ri_left_arms', 'ri_right_arms', 'book_description', 'route_indicator_notes',
];
// Never copied across: local owns these.
const SKIP_ON_CREATE = new Set(['created_at', 'updated_at']);
const QUEUE_META = new Set(['signal_id', 'old_signal_number', 'change_kind', 'queued_at', 'queued_by_user_id', 'synced_at']);

router.use((req, res, next) => {
  const u = req.session && req.session.user;
  if (!u) return res.status(401).json({ error: 'Not authenticated' });
  if (u.realm !== 'division' || u.div_role !== 'division_admin') return res.status(403).json({ error: 'division_admin only' });
  next();
});

async function loadPending(pool) {
  const [rows] = await pool.execute(
    `SELECT q.*, u.username AS queued_by
       FROM div_signal_sync_queue q
       LEFT JOIN users u ON u.id = q.queued_by_user_id
      WHERE q.synced_at IS NULL
      ORDER BY q.queued_at, q.signal_id`
  );
  if (!rows.length) return rows;
  const ids = rows.map(r => r.signal_id);
  const [hist] = await pool.query(
    `SELECT signal_id, change_type, old_value, new_value,
            DATE_FORMAT(change_date, '%Y-%m-%d') AS change_date, created_at
       FROM div_signal_history WHERE signal_id IN (?) ORDER BY id DESC`, // DATE as string: mysql2 Date objects shift a day in IST
    [ids]
  );
  const byId = {};
  for (const h of hist) (byId[h.signal_id] = byId[h.signal_id] || []).push(h);
  for (const r of rows) r.history = (byId[r.signal_id] || []).slice(0, 6);
  return rows;
}

// GET /pending
router.get('/pending', async (req, res) => {
  try {
    const rows = await loadPending(req.app.locals.pool);
    const [[tot]] = await req.app.locals.pool.execute(
      `SELECT COUNT(*) AS total, MAX(synced_at) AS last_synced FROM div_signal_sync_queue`
    );
    res.json({ pending: rows, total_ever: tot.total, last_synced: tot.last_synced });
  } catch (err) {
    console.error('signal-sync/pending failed:', err);
    res.status(500).json({ error: err.message });
  }
});

function ymd(d = new Date()) { return d.toISOString().slice(0, 10); }

function buildSql(rows) {
  const out = [];
  const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  out.push(`-- ${ymd()}  Signal sync: ${rows.length} signal(s) edited on prod through the signal-book editor.`);
  out.push(`-- Generated ${stamp} UTC from div_signal_sync_queue by /api/division/signal-sync/sql.`);
  out.push(`-- Apply on LOCAL:  save into sql/ and run   mysql <local credentials> bbtro < sql/${ymd()}_signal_sync_from_prod.sql`);
  out.push(`-- Then press "Mark synced" on /div/audit-log.html so the rows leave the pending list.`);
  out.push(`-- Idempotent: every statement is guarded, re-running it is safe.`);
  out.push('');
  out.push('START TRANSACTION;');
  out.push('');

  for (const r of rows) {
    const label = `${r.section} ${r.signal_number} (id ${r.signal_id})`;
    if (r.change_kind === 'created') {
      const cols = Object.keys(r).filter(k => !QUEUE_META.has(k) && !SKIP_ON_CREATE.has(k) && k !== 'queued_by' && k !== 'history');
      out.push(`-- CREATED on prod: ${label}`);
      out.push(`INSERT INTO div_signals (id, ${cols.map(c => `\`${c}\``).join(', ')})`);
      out.push(`SELECT ${r.signal_id}, ${cols.map(c => escape(r[c])).join(', ')}`);
      out.push(`  FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_signals WHERE id = ${r.signal_id});`);
      // If the id is already taken locally by a different signal, say so loudly.
      out.push(`SELECT CONCAT('CONFLICT: local id ${r.signal_id} is ', signal_number, ' in ', section, ', not ${r.signal_number.replace(/'/g, "''")} — insert skipped, resolve by hand') AS warning`);
      out.push(`  FROM div_signals WHERE id = ${r.signal_id} AND normalized_signal_number <> ${escape(r.normalized_signal_number)};`);
    } else {
      const renumbered = r.old_signal_number && r.old_signal_number !== r.signal_number;
      out.push(`-- UPDATED on prod: ${label}${renumbered ? `  [was ${r.old_signal_number}]` : ''}`);
      const sets = EDITOR_COLS.map(c => `\`${c}\` = ${escape(r[c])}`).join(',\n       ');
      const guard = renumbered
        ? `signal_number IN (${escape(r.old_signal_number)}, ${escape(r.signal_number)})`
        : `signal_number = ${escape(r.signal_number)}`;
      out.push(`UPDATE div_signals\n   SET ${sets}\n WHERE id = ${r.signal_id} AND ${guard};`);
      if (renumbered) {
        // Same two alias rows the editor writes on prod (see publish endpoint).
        out.push(`INSERT IGNORE INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks) VALUES`);
        out.push(`  (${r.signal_id}, ${escape(r.signal_number)}, ${escape(r.normalized_signal_number)}, 'manual', 'HIGH', 'New number (editor renumber)'),`);
        out.push(`  (${r.signal_id}, ${escape(r.old_signal_number)}, ${escape(normalizeSignalNumber(r.old_signal_number))}, 'manual', 'HIGH', 'Old number kept (editor renumber)');`);
      }
    }
    out.push('');
  }
  out.push('COMMIT;');
  out.push('');
  return out.join('\n');
}

// GET /sql — download
router.get('/sql', async (req, res) => {
  try {
    const rows = await loadPending(req.app.locals.pool);
    if (!rows.length) return res.status(404).type('text/plain').send('-- nothing pending\n');
    const name = `${ymd()}_signal_sync_from_prod.sql`;
    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.send(buildSql(rows));
  } catch (err) {
    console.error('signal-sync/sql failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /mark-synced { signal_ids: [..] }
router.post('/mark-synced', async (req, res) => {
  try {
    const ids = (Array.isArray(req.body && req.body.signal_ids) ? req.body.signal_ids : [])
      .map(Number).filter(Number.isInteger);
    if (!ids.length) return res.status(400).json({ error: 'signal_ids required' });
    const [r] = await req.app.locals.pool.query(
      `UPDATE div_signal_sync_queue SET synced_at = NOW() WHERE synced_at IS NULL AND signal_id IN (?)`,
      [ids]
    );
    res.json({ ok: true, marked: r.affectedRows });
  } catch (err) {
    console.error('signal-sync/mark-synced failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
