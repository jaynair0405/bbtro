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

  /**
   * Opening IndexedDB can hang indefinitely rather than fail: an upgrade blocked
   * by another tab fires `onblocked` and then simply waits, and a pending
   * deleteDatabase blocks every subsequent open the same way. Nothing times it
   * out for you.
   *
   * That mattered here because boot() awaits the cache before it can fall back
   * offline -- a wedged open left the app on "Loading..." for ever, which is
   * worse than either the data or an honest error. So the open races a timeout,
   * and a database that will not answer is treated as one that is not there.
   */
  var DB_TIMEOUT_MS = 2000;

  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('no indexedDB'));
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('indexedDB did not open within ' + DB_TIMEOUT_MS + 'ms'));
      }, DB_TIMEOUT_MS);
      var done = function (fn, arg) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn(arg);
      };
      var r = indexedDB.open(DB_NAME, DB_VER);
      r.onupgradeneeded = function () {
        var d = r.result;
        if (!d.objectStoreNames.contains(STORE_KV)) d.createObjectStore(STORE_KV);
        if (!d.objectStoreNames.contains(STORE_OUT)) d.createObjectStore(STORE_OUT, { keyPath: 'client_uuid' });
      };
      r.onsuccess = function () { done(resolve, r.result); };
      r.onerror = function () { done(reject, r.error || new Error('indexedDB open failed')); };
      r.onblocked = function () { done(reject, new Error('indexedDB blocked by another tab')); };
    // A failed open must not be retried on every call, but it must not be
    // remembered for ever either -- the blocking tab may close.
    }).catch(function (e) { dbp = null; throw e; });
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

  /**
   * GET that survives a dead network.
   *
   * Stores each successful response and falls back to the stored copy when the
   * request fails at the TRANSPORT level -- no status, i.e. nothing reached the
   * server. A 401 or a 500 is NOT a fallback case: the server answered, and
   * showing stale data over a real error would hide it.
   *
   * Returns the body with `_stale` and `_cachedAt` set when it came from cache,
   * so the page can say so rather than quietly presenting old figures as current.
   */
  function apiCached(path, key) {
    return api(path).then(function (body) {
      kvPut('cache:' + key, { at: Date.now(), body: body });
      return body;
    }).catch(function (e) {
      if (e.status) throw e;                 // the server spoke; do not paper over it
      return kvGet('cache:' + key).then(function (hit) {
        if (!hit || !hit.body) throw e;
        var b = hit.body;
        b._stale = true;
        b._cachedAt = hit.at;
        return b;
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

    return apiCached('/bootstrap', 'bootstrap').then(function (b) {
      Cli.boot_ = b;
      // A bulk-generated account starts on a password HQ read out over the
      // phone. Send it to change that before anything else — the server refuses
      // writes until it is done, so landing anywhere else would only confuse.
      if (b.me.must_change_password && !/\/password\.html$/.test(location.pathname)) {
        location.replace('/cli/password.html');
        return;
      }
      window.CliShell.setUser(b.me);
      if (host) host.innerHTML = '';
      if (body) body.hidden = false;
      paintStatus();
      flush();
      if (b._stale) {
        Cli.toast('Offline — showing what was saved on this phone' +
          (b._cachedAt ? ' on ' + new Date(b._cachedAt).toLocaleString() : '') +
          '. You can still record; entries will sync when you are back online.', 'warn');
      }
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
    api: api, apiCached: apiCached, post: post, boot: boot, toast: toast, uuid: uuid,
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
