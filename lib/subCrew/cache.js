/**
 * Suburban Crew Ops — in-process dataset cache.
 *
 * WHY THIS IS NOT AN OPTIMISATION
 *   Building the dataset is 4 queries + ~13k object allocations + JSON.stringify
 *   + gzip. Fine once; ruinous on every page load by every user. The pages are
 *   read-only views of a book that changes when a detail-book revision is
 *   imported — a handful of times a year — so the natural cache lifetime is
 *   "until something writes".
 *
 * WHY WE PRE-GZIP INSTEAD OF ADDING THE `compression` MIDDLEWARE
 *   The body is identical for every caller, so compressing per request burns
 *   ~20ms of event loop to produce bytes we already had. Gzipping once at build
 *   time gives the same ~58KB on the wire for 0ms per request, and adds no
 *   dependency to install on the server.
 *
 *   (Brotli was measured: 41KB but ~860ms to produce. Not worth blocking the
 *   loop for 17KB.)
 *
 * SINGLE FLIGHT
 *   Four pages opened at once on a cold cache would otherwise each start their
 *   own query storm. Concurrent callers await the same in-flight promise.
 *
 * INVALIDATION
 *   invalidate() is the hook every future write endpoint must call. There is
 *   also a TTL safety net (SUBCREW_CACHE_TTL_MS, default 10 min) so that hand-run
 *   SQL against details/trains surfaces without a server restart — this module
 *   cannot see writes that bypass the app.
 */
'use strict';

const zlib = require('zlib');
const crypto = require('crypto');
const { buildDataset, buildSummary } = require('./dataset');

const TTL_MS = parseInt(process.env.SUBCREW_CACHE_TTL_MS, 10) || 10 * 60 * 1000;

/** name -> {json, gzip, etag, builtAt, counts, warnings, ms} */
const entries = new Map();
/** name -> Promise, so concurrent cold callers share one build */
const inflight = new Map();

const BUILDERS = {
  dataset: buildDataset,
  summary: buildSummary,
};

function pack(name, payload, ms) {
  const json = Buffer.from(JSON.stringify(payload), 'utf8');
  // Hash the CONTENT, not the build timestamp. Otherwise a TTL expiry mints a
  // new ETag even when nothing in the book changed, and every browser refetches
  // 71KB it already has. Costs one extra stringify per rebuild, not per request.
  const { generatedAt, ...stable } = payload;   // eslint-disable-line no-unused-vars
  const digest = crypto.createHash('sha1').update(JSON.stringify(stable)).digest('hex');
  return {
    name,
    json,
    gzip: zlib.gzipSync(json, { level: 9 }),
    etag: '"' + name + '-' + digest.slice(0, 16) + '"',
    builtAt: new Date().toISOString(),
    builtMs: Date.now(),
    counts: payload.counts,
    warnings: payload.warnings,
    ms,
  };
}

function fresh(e) {
  return e && (Date.now() - e.builtMs) < TTL_MS;
}

/**
 * @param {string} name  'dataset' | 'summary'
 * @returns {Promise<{json:Buffer, gzip:Buffer, etag:string, builtAt:string, counts:object}>}
 */
async function get(pool, name) {
  const build = BUILDERS[name];
  if (!build) throw new Error('unknown crew-ops cache entry: ' + name);

  const hit = entries.get(name);
  if (fresh(hit)) return hit;

  const pending = inflight.get(name);
  if (pending) return pending;

  const p = (async () => {
    const t0 = Date.now();
    const payload = await build(pool);
    const e = pack(name, payload, Date.now() - t0);
    entries.set(name, e);
    return e;
  })().finally(() => inflight.delete(name));

  inflight.set(name, p);
  return p;
}

/** Drop everything. Call after any write to details/trains/detail_blocks. */
function invalidate() {
  const had = [...entries.keys()];
  entries.clear();
  return had;
}

function stats() {
  return {
    ttlMs: TTL_MS,
    entries: [...entries.values()].map((e) => ({
      name: e.name, builtAt: e.builtAt, etag: e.etag,
      bytes: e.json.length, gzipBytes: e.gzip.length, buildMs: e.ms,
      stale: !fresh(e),
    })),
  };
}

module.exports = { get, invalidate, stats };
