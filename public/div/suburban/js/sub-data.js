/**
 * Suburban Crew Ops — data loading for every page in the module.
 *
 * The pages used to carry their dataset inline, so "render" and "have data"
 * were the same moment. They now fetch, so every page needs the same three
 * states (loading / failed / ready) and the same freshness stamp. That lives
 * here once rather than four times.
 *
 * Usage — the whole contract:
 *
 *   SubCrew.boot(function (D) {  ...render using D...  });   // full dataset
 *   SubCrew.bootSummary(function (S) { ... });               // Overview only
 *
 * D is { blocks, details, legs, master, counts, warnings, generatedAt }.
 * Derivations (train index, rest, remarks) come from SubDerive — the same
 * module the server uses, so a page cannot disagree with the builder.
 */
(function (root) {
  'use strict';

  var API = '/api/division/suburban';
  var cached = null;          // the dataset, once
  var cachedSummary = null;

  function icon(paths) {
    return '<svg viewBox="0 0 24 24">' + paths + '</svg>';
  }

  var IC_LOAD = '<path d="M4 17V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10"/>'
    + '<path d="M4 13h16"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/>';
  var IC_ERR = '<path d="M12 8v5"/><circle cx="12" cy="16.5" r="1"/>'
    + '<path d="M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>';

  /**
   * The loading/error overlay is a SEPARATE element from the page body — the
   * renderers write into markup that is already in the document (#seg, #mods,
   * …), so a state that replaced <main> would delete the very nodes it is
   * waiting to fill. The body is hidden until the data lands instead.
   */
  function host() {
    var el = document.querySelector('[data-sub-host]');
    if (el) return el;
    el = document.createElement('div');
    el.setAttribute('data-sub-host', '');
    (document.querySelector('main.main') || document.body).appendChild(el);
    return el;
  }

  /** A page may have several regions to hide — train-index has two columns. */
  function bodies() { return document.querySelectorAll('[data-sub-body]'); }
  function setBodies(hidden) {
    Array.prototype.forEach.call(bodies(), function (b) { b.hidden = hidden; });
  }

  function showState(html) {
    setBodies(true);
    var h = host();
    h.hidden = false;
    h.innerHTML = html;
  }

  function showReady() {
    var h = document.querySelector('[data-sub-host]');
    if (h) { h.hidden = true; h.innerHTML = ''; }
    setBodies(false);
  }

  function showLoading(msg) {
    showState('<div class="sub-state">'
      + '<div><div class="ic">' + icon(IC_LOAD) + '</div>'
      + '<h4>' + (msg || 'Loading the detail book') + '</h4>'
      + '<p>Reading details, legs and the train master.</p>'
      + '<div class="sub-track"><i></i></div></div></div>');
  }

  function showError(err, retry) {
    var detail = err && err.status === 401
      ? 'Your session has expired. Sign in again to continue.'
      : 'The server could not build the suburban dataset. '
        + 'It is safe to retry — nothing was changed.';
    showState('<div class="sub-state err">'
      + '<div><div class="ic">' + icon(IC_ERR) + '</div>'
      + '<h4>Could not load the data</h4>'
      + '<p>' + detail + '<br><code>' + SubDerive.esc(err && err.message || err) + '</code></p>'
      + '<button type="button" id="subRetry">Retry</button></div></div>');
    var b = document.getElementById('subRetry');
    if (b) {
      b.onclick = function () {
        if (err && err.status === 401) { location.replace('/'); return; }
        retry();
      };
    }
  }

  /** fetch + parse, turning a non-2xx into an Error carrying the status. */
  function getJSON(path) {
    return fetch(API + path, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) {
        var e = new Error('HTTP ' + r.status);
        e.status = r.status;
        throw e;
      }
      return r.json();
    });
  }

  function load() {
    if (cached) return Promise.resolve(cached);
    return getJSON('/dataset').then(function (d) { cached = d; return d; });
  }

  function summary() {
    if (cachedSummary) return Promise.resolve(cachedSummary);
    if (cached) return Promise.resolve(cached);        // superset will do
    return getJSON('/summary').then(function (d) { cachedSummary = d; return d; });
  }

  /** Warnings banner + "built at" stamp — shown on every page, same way. */
  function chrome(D, target) {
    if (D.warnings && D.warnings.length && target) {
      var ul = D.warnings.map(function (w) {
        return '<li>' + SubDerive.esc(w) + '</li>';
      }).join('');
      target.insertAdjacentHTML('afterbegin',
        '<div class="sub-warn">'
        + '<svg viewBox="0 0 24 24"><path d="M12 9v4"/><circle cx="12" cy="16.5" r="1"/>'
        + '<circle cx="12" cy="12" r="9"/></svg>'
        + '<div><div class="t">Data notes</div><ul>' + ul + '</ul></div></div>');
    }
    if (D.generatedAt) {
      var t = new Date(D.generatedAt);
      var old = document.querySelector('.sub-built');
      if (old) old.remove();
      var el = document.createElement('div');
      el.className = 'sub-built';
      el.textContent = 'data as of ' + t.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      document.body.appendChild(el);
    }
  }

  function makeBoot(loader, label) {
    return function boot(render) {
      function attempt() {
        showLoading(label);
        loader().then(function (D) {
          showReady();
          render(D);
          chrome(D, document.querySelector('[data-sub-warn]'));
        }).catch(function (err) {
          console.error('SubCrew load failed:', err);
          showError(err, attempt);
        });
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attempt);
      } else {
        attempt();
      }
    };
  }

  root.SubCrew = {
    API: API,
    load: load,
    summary: summary,
    boot: makeBoot(load, 'Loading the detail book'),
    bootSummary: makeBoot(summary, 'Loading'),
    /** force a refetch on the next load() — for a future "refresh" button */
    drop: function () { cached = null; cachedSummary = null; },
  };
})(window);
