/* ============================================================================
 * cli-data.js — window.Cli
 *
 * The only fetch layer, plus the small offline story.
 *
 * OFFLINE, deliberately sized
 * ---------------------------
 * The lobbies have a usable network essentially all the time; this is not a
 * field-survey app. So there is no sync engine, no conflict resolution and no
 * merge. There is:
 *   1. a service worker caching the app shell,
 *   2. the lobby roster cached in IndexedDB so the staff picker still works,
 *   3. an OUTBOX — a submitted session that could not reach the server is kept
 *      and re-sent on reconnect.
 *
 * The outbox is safe because every session carries a client_uuid generated on
 * the phone BEFORE the first attempt, and the server upserts on it. A double
 * flush therefore lands one session. Without that key, a flaky lobby network
 * would show up as double counts on the officers' sheet — the exact failure the
 * paper workflow never had.
 *
 * Photos are NOT queued. A session syncs without its photo and the image is
 * uploaded separately once online, so the outbox never carries megabytes.
 * ==========================================================================*/
(function () {
  'use strict';

  var DB_NAME = 'cli-app', DB_VER = 1;
  var STORE_KV = 'kv', STORE_OUT = 'outbox';
  var dbp = null;

  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('no indexedDB'));
      var r = indexedDB.open(DB_NAME, DB_VER);
      r.onupgradeneeded = function () {
        var d = r.result;
        if (!d.objectStoreNames.contains(STORE_KV)) d.createObjectStore(STORE_KV);
        if (!d.objectStoreNames.contains(STORE_OUT)) d.createObjectStore(STORE_OUT, { keyPath: 'client_uuid' });
      };
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
    });
    return dbp;
  }

  function tx(store, mode, fn) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        var t = d.transaction(store, mode);
        var req = fn(t.objectStore(store));
        t.oncomplete = function () { resolve(req && req.result); };
        t.onerror = function () { reject(t.error); };
      });
    // Private windows and "block site data" throw on open. The app must still
    // work — it just loses the cache and the outbox.
    }).catch(function () { return null; });
  }

  var kvGet = function (k) { return tx(STORE_KV, 'readonly', function (s) { return s.get(k); }); };
  var kvPut = function (k, v) { return tx(STORE_KV, 'readwrite', function (s) { return s.put(v, k); }); };

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  var BASE = '/api/division/counselling';

  function api(path, opts) {
    opts = opts || {};
    return fetch(BASE + path, Object.assign({ credentials: 'same-origin' }, opts))
      .then(function (r) {
        if (r.status === 401) {
          var e = new Error('Your session has expired. Sign in again.');
          e.status = 401; throw e;
        }
        return r.json().catch(function () { return {}; }).then(function (body) {
          if (!r.ok) {
            var err = new Error(body.error || ('Request failed (' + r.status + ')'));
            err.status = r.status; err.details = body.details; throw err;
          }
          return body;
        });
      });
  }

  function post(path, body) {
    return api(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  /* ── outbox ─────────────────────────────────────────────────────────── */

  function outboxAll() {
    return tx(STORE_OUT, 'readonly', function (s) { return s.getAll(); }).then(function (r) { return r || []; });
  }
  function outboxPut(rec) { return tx(STORE_OUT, 'readwrite', function (s) { return s.put(rec); }); }
  function outboxDel(id) { return tx(STORE_OUT, 'readwrite', function (s) { return s.delete(id); }); }

  var flushing = false;
  function flush() {
    if (flushing || !navigator.onLine) return Promise.resolve(0);
    flushing = true;
    return outboxAll().then(function (items) {
      return items.reduce(function (p, rec) {
        return p.then(function (n) {
          return post('/sessions', rec.payload)
            .then(function () { return outboxDel(rec.client_uuid).then(function () { return n + 1; }); })
            // A 4xx means the server will never accept this record — keeping it
            // would retry forever. Drop it and say so, loudly.
            .catch(function (e) {
              if (e.status && e.status >= 400 && e.status < 500 && e.status !== 408) {
                return outboxDel(rec.client_uuid).then(function () {
                  Cli.toast('A queued entry was rejected: ' + e.message, 'alert');
                  return n;
                });
              }
              return n; // network still down — leave it queued
            });
        });
      }, Promise.resolve(0));
    }).then(function (n) {
      flushing = false;
      if (n) { Cli.toast(n + ' queued ' + (n === 1 ? 'entry' : 'entries') + ' synced.', 'info'); }
      paintStatus();
      document.dispatchEvent(new CustomEvent('cli:synced', { detail: { count: n } }));
      return n;
    }).catch(function () { flushing = false; return 0; });
  }

  /* ── connection / sync chips in the header ──────────────────────────── */

  function paintStatus() {
    var host = document.querySelector('[data-cli-status]');
    if (!host) return;
    outboxAll().then(function (items) {
      var bits = [];
      if (!navigator.onLine) bits.push('<span class="chip off">Offline</span>');
      if (items.length) bits.push('<span class="chip sync">' + items.length + ' pending sync</span>');
      host.innerHTML = bits.join(' ');
    });
  }

  /* ── boot ───────────────────────────────────────────────────────────── */

  function boot(render) {
    var host = document.querySelector('[data-cli-host]');
    var body = document.querySelector('[data-cli-body]');
    function show(html) { if (host) host.innerHTML = html; }

    show('<div class="state"><div class="spinner"></div>Loading…</div>');

    return api('/bootstrap').then(function (b) {
      Cli.boot_ = b;
      window.CliShell.setUser(b.me);
      if (host) host.innerHTML = '';
      if (body) body.hidden = false;
      paintStatus();
      flush();
      return Promise.resolve(render(b)).catch(function (e) { throw e; });
    }).catch(function (e) {
      if (body) body.hidden = true;
      show(
        '<div class="state"><h3>' + window.CliShell.esc(
          e.status === 401 ? 'Signed out' : 'Could not load'
        ) + '</h3><p>' + window.CliShell.esc(e.message) + '</p>' +
        (e.status === 401
          ? '<p style="margin-top:14px"><a class="btn primary" href="/">Sign in</a></p>'
          : '<p style="margin-top:14px"><button class="btn" onclick="location.reload()">Try again</button></p>') +
        '</div>'
      );
    });
  }

  /* ── toast ──────────────────────────────────────────────────────────── */

  var toastTimer = null;
  function toast(msg, kind) {
    var el = document.querySelector('[data-cli-toast]');
    if (!el) return alert(msg);
    el.className = 'banner ' + (kind || 'info');
    el.textContent = msg;
    el.style.display = 'flex';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.style.display = 'none'; }, 5000);
  }

  window.addEventListener('online', function () { paintStatus(); flush(); });
  window.addEventListener('offline', paintStatus);

  var Cli = window.Cli = {
    api: api, post: post, boot: boot, toast: toast, uuid: uuid,
    flush: flush, outboxAll: outboxAll, paintStatus: paintStatus,
    cacheGet: kvGet, cachePut: kvPut,

    /** Submit a session. Falls back to the outbox when the network is down. */
    submitSession: function (payload) {
      if (!payload.client_uuid) payload.client_uuid = uuid();
      if (!navigator.onLine) {
        return outboxPut({ client_uuid: payload.client_uuid, payload: payload, queued_at: Date.now() })
          .then(function () { paintStatus(); return { queued: true, client_uuid: payload.client_uuid }; });
      }
      return post('/sessions', payload).catch(function (e) {
        // Only a transport failure is queueable. A 400 means the server has
        // judged the data wrong, and queueing it would just retry the mistake.
        if (e.status) throw e;
        return outboxPut({ client_uuid: payload.client_uuid, payload: payload, queued_at: Date.now() })
          .then(function () { paintStatus(); return { queued: true, client_uuid: payload.client_uuid }; });
      });
    }
  };

  // Register the service worker. Failure is not fatal — the app is a normal web
  // page first and an installable one second.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/cli/cli-sw.js', { scope: '/cli/' }).catch(function () {});
    });
  }
}());
