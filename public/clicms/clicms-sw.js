'use strict';

/*
 * CMS Due List — service worker.
 *
 * Caches ONLY the app shell (page, css, js, manifest, icons). NEVER caches data:
 * uploads and exports always go to the network. This preserves the tool's
 * "nothing is stored" guarantee.
 *
 * IMPORTANT: bump CACHE_VERSION whenever index.html / clicms.css / clicms.js
 * (or this file) changes, so installed devices pick up the new shell.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `clicms-shell-${CACHE_VERSION}`;

// Paths are relative to the SW scope (/clicms/).
const SHELL = [
  './',
  './index.html',
  './clicms.css',
  './clicms.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('clicms-shell-') && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // uploads/exports are POST — never touched

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave cross-origin (fonts) alone

  // Data + auth endpoints always hit the network, never cached.
  if (url.pathname.includes('/upload') ||
      url.pathname.includes('/export') ||
      url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigations: network-first so auth redirects + fresh HTML work; offline → cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html', { ignoreSearch: true }))
    );
    return;
  }

  // Static shell assets: cache-first, refresh in the background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
