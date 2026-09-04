/* ============================================================================
 * cli-sw.js — service worker for the CLI app.
 *
 * Caches the SHELL only. Never caches /api/* : a stale roster or a stale
 * consolidated sheet is worse than an honest error, because the CLI cannot tell
 * that what they are reading is old. Fresh data comes from the network, and
 * cli-data.js keeps its own IndexedDB copy of the roster on purpose, where the
 * UI can label it as cached.
 *
 * Navigations are network-first so an expired session gets its redirect to the
 * login page instead of a cached shell that then 401s on every call.
 *
 * ⚠ BUMP CACHE_VERSION AND THE ?v= TAGS IN THE HTML TOGETHER. If they drift, a
 *   fresh page can pair with stale cached JS — the failure documented in
 *   public/clicms/clicms-sw.js and worth not repeating.
 * ==========================================================================*/
const CACHE_VERSION = 'cli-v16';

const SHELL = [
  '/cli/',
  '/cli/index.html',
  '/cli/session.html',
  '/cli/history.html',
  '/cli/sheet.html',
  '/cli/password.html',
  '/cli/accounts.html',
  '/cli/unassigned.html',
  '/cli/css/cli.css?v16',
  '/cli/js/cli-derive.js?v16',
  '/cli/js/cli-shell.js?v16',
  '/cli/js/cli-data.js?v16',
  '/cli/js/page-home.js?v16',
  '/cli/js/page-session.js?v16',
  '/cli/js/page-history.js?v16',
  '/cli/js/page-sheet.js?v16',
  '/cli/js/page-password.js?v16',
  '/cli/js/page-accounts.js?v16',
  '/cli/js/page-unassigned.js?v16',
  '/cli/manifest.json',
  '/cli/img/icon-192.png',
  '/cli/img/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    // addAll rejects the whole install if any one file 404s, which would leave
    // the app permanently uninstallable. Cache what we can.
    caches.open(CACHE_VERSION)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      // Tell whoever is open that they are now running against a new cache.
      // Without this a page keeps the assets it started with, and a deployed
      // fix does not reach anyone until they clear the site data by hand --
      // which is not a thing to ask of 122 CLIs on a phone.
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((cs) => cs.forEach((c) => c.postMessage({ type: 'sw-updated', version: CACHE_VERSION })))
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;          // never cache data
  if (!url.pathname.startsWith('/cli')) return;

  // Navigations: network first, cached shell only as a fallback.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/cli/index.html')))
    );
    return;
  }

  // Assets: cache first, refresh in the background.
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
