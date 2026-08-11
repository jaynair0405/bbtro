/**
 * subCrewRoutes.js — Suburban Crew Ops
 * Mounted at /api/division/suburban
 *
 * Backs the pages under public/div/suburban/ (Overview, Detail Book, Train
 * Index, Reports). Read-only over details / trains / detail_blocks /
 * suburban_train_master.
 *
 * ONE DATASET, NOT FOUR ENDPOINTS. Every page needs the whole corpus — their
 * value is instant client-side filter/sort/search over all 2,653 legs — so
 * per-page endpoints would each ship the same superset and give four cache
 * entries to keep coherent. The derivations (train index, block totals) are pure
 * and run in the browser from public/div/suburban/js/sub-derive.js, the same
 * module the server uses.
 *
 *   GET  /summary   → { blocks, counts, warnings }  ~5KB, for the Overview
 *   GET  /dataset   → { blocks, details, legs, master, counts, warnings }
 *   GET  /meta      → { counts, warnings, builtAt, etag }  ~1KB, cheap poll
 *   GET  /stats     → cache state (division_admin)
 *   POST /refresh   → drop the cache and rebuild (division_admin)
 *
 * Not to be confused with /div/detail-book.html, which is the unrelated
 * mainline goods Digital Slate board.
 */

const express = require('express');
const router = express.Router();
const cache = require('../../lib/subCrew/cache');

// Only a division admin may force a rebuild or read cache internals.
function requireDivisionAdmin(req, res, next) {
  const u = req.session && req.session.user;
  const role = u && (u.div_role || u.role);
  if (role === 'division_admin' || role === 'admin') return next();
  return res.status(403).json({ success: false, error: 'Division admin only' });
}

/**
 * Send a cached buffer with revalidation.
 *
 * server.js does app.disable('etag'), so Express will not generate one and
 * req.fresh would always be false — the ETag here has to be ours. With
 * `no-cache` the browser revalidates rather than refetches, so moving between
 * the four pages costs a 304 with an empty body instead of the payload.
 * Vary is required or a proxy could hand gzipped bytes to a client that did
 * not ask for them.
 */
function sendCached(req, res, entry) {
  res.set('ETag', entry.etag);
  res.set('Cache-Control', 'private, no-cache');
  res.set('Vary', 'Accept-Encoding');
  res.set('X-Built-At', entry.builtAt);
  res.type('application/json');
  if (req.fresh) return res.status(304).end();
  if (req.acceptsEncodings('gzip')) {
    res.set('Content-Encoding', 'gzip');
    return res.send(entry.gzip);
  }
  return res.send(entry.json);
}

// ── GET /dataset ──────────────────────────────────────────────────────────
router.get('/dataset', async (req, res) => {
  try {
    const entry = await cache.get(req.app.locals.pool, 'dataset');
    return sendCached(req, res, entry);
  } catch (err) {
    console.error('subCrew dataset error:', err);
    return res.status(500).json({ success: false, error: 'Failed to build the suburban dataset' });
  }
});

// ── GET /summary ──────────────────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const entry = await cache.get(req.app.locals.pool, 'summary');
    return sendCached(req, res, entry);
  } catch (err) {
    console.error('subCrew summary error:', err);
    return res.status(500).json({ success: false, error: 'Failed to build the suburban summary' });
  }
});

// ── GET /meta ─────────────────────────────────────────────────────────────
router.get('/meta', async (req, res) => {
  try {
    const entry = await cache.get(req.app.locals.pool, 'summary');
    res.set('Cache-Control', 'no-store');   // it is a freshness poll; never cache it
    return res.json({
      success: true,
      counts: entry.counts,
      warnings: entry.warnings,
      builtAt: entry.builtAt,
      etag: entry.etag,
    });
  } catch (err) {
    console.error('subCrew meta error:', err);
    return res.status(500).json({ success: false, error: 'Failed to read suburban metadata' });
  }
});

// ── GET /stats ────────────────────────────────────────────────────────────
router.get('/stats', requireDivisionAdmin, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, cache: cache.stats() });
});

// ── POST /refresh ─────────────────────────────────────────────────────────
router.post('/refresh', requireDivisionAdmin, async (req, res) => {
  try {
    const dropped = cache.invalidate();
    const entry = await cache.get(req.app.locals.pool, 'summary');
    return res.json({
      success: true, dropped,
      counts: entry.counts, warnings: entry.warnings, builtAt: entry.builtAt,
    });
  } catch (err) {
    console.error('subCrew refresh error:', err);
    return res.status(500).json({ success: false, error: 'Failed to refresh the suburban cache' });
  }
});

module.exports = router;
