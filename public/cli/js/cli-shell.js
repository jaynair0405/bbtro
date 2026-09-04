/* ============================================================================
 * cli-shell.js — window.CliShell
 *
 * The NAV array below IS the module's table of contents. Adding a page to this
 * app = one NAV entry + one HTML file + one page-*.js. The "soon" entries are
 * the rest of the HQ daily-positions sheet; they are shown greyed rather than
 * hidden so every CLI can see what is coming.
 * ==========================================================================*/
(function () {
  'use strict';

  var I = {
    home:   'M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5',
    plus:   'M12 5v14M5 12h14',
    list:   'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
    sheet:  'M3 4h18v16H3zM3 9h18M9 9v11M15 9v11',
    ambush: 'M12 3l8 4v5c0 4.5-3.2 7.9-8 9-4.8-1.1-8-4.5-8-9V7z',
    chart:  'M4 20V10M10 20V4M16 20v-7M22 20H2',
    boot:   'M4 4v10a4 4 0 0 0 4 4h5l4 2h3v-3l-3-2v-3a4 4 0 0 0-4-4H8V4z',
    key:    'M14 7a4 4 0 1 1-3.9 5H7v3H4v-3l6.1 0A4 4 0 0 1 14 7z',
    users:  'M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-2a4 4 0 0 0-3-3.9',
    orphan: 'M12 3a4 4 0 1 1-4 4M4 21v-2a5 5 0 0 1 5-5h1M17 14v7M20.5 17.5h-7'
  };

  var NAV = [
    { group: 'Counselling' },
    { id: 'home',    label: 'Signal Vigilance', href: '/cli/index.html',   icon: I.home,  countKey: 'pending' },
    { id: 'session', label: 'New Counselling',  href: '/cli/session.html', icon: I.plus },
    { id: 'history', label: 'My Sessions',      href: '/cli/history.html', icon: I.list },

    { group: 'Coming soon' },
    { id: 'ambush',  label: 'Ambush Check',      icon: I.ambush, soon: true },
    { id: 'spm',     label: 'SPM / RTIS',        icon: I.chart,  soon: true },
    { id: 'foot',    label: 'CLI Footplate',     icon: I.boot,   soon: true },

    { group: 'HQ', hq: true },
    { id: 'sheet',    label: 'Consolidated Sheet', href: '/cli/sheet.html',    icon: I.sheet, hq: true },
    { id: 'accounts', label: 'CLI Logins',         href: '/cli/accounts.html', icon: I.users, hq: true },
    { id: 'unassigned', label: 'Unassigned Staff', href: '/cli/unassigned.html', icon: I.orphan, hq: true },
    { id: 'subjects',   label: 'Subjects',         href: '/cli/subjects.html',   icon: I.list,   hq: true },

    { group: 'Account' },
    { id: 'password', label: 'Change Password', href: '/cli/password.html', icon: I.key }
  ];

  // The three the thumb reaches for. Kept short on purpose — a bottom bar with
  // six items is a bar nobody hits accurately. Their own short labels: the
  // sidebar can afford "SPAD Counselling", a 3-up bottom bar cannot.
  var TABS = [
    { id: 'home',    label: 'Home' },
    { id: 'session', label: 'New' },
    { id: 'history', label: 'Sessions' }
  ];

  function svg(d) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var state = { active: null, isHQ: false, counts: {} };

  /* A couple of labels read differently for HQ, who has no CLI of their own:
     "My Sessions" is the whole division to them. Kept here rather than in the
     page so the sidebar and the page never disagree. */
  var HQ_LABEL = { history: 'All Sessions' };

  function itemHtml(n) {
    if (state.isHQ && HQ_LABEL[n.id]) n = Object.assign({}, n, { label: HQ_LABEL[n.id] });
    var cnt = n.countKey && state.counts[n.countKey];
    var badge = cnt ? '<span class="count">' + esc(cnt) + '</span>' : '';
    if (n.soon) {
      return '<span class="nav-item soon">' + svg(n.icon) + esc(n.label) + '<span class="pill">soon</span></span>';
    }
    return '<a href="' + n.href + '"' + (n.id === state.active ? ' class="active"' : '') + '>' +
           svg(n.icon) + esc(n.label) + badge + '</a>';
  }

  function render() {
    var side = document.querySelector('[data-cli-nav]');
    if (!side) return;

    var items = NAV.filter(function (n) { return !n.hq || state.isHQ; });
    var body = items.map(function (n) {
      return n.group ? '<div class="nav-group">' + esc(n.group) + '</div>' : itemHtml(n);
    }).join('');

    side.innerHTML =
      '<div class="brand">' +
      '<button class="rail-toggle" data-rail-hide title="Hide the sidebar">&#10094;</button>' +
      '<div class="brand-mark"><span class="brand-dot"></span>' +
      '<div><div class="brand-name">CLI Daily Positions</div>' +
      '<div class="brand-sub">BB Division</div></div></div>' +
      '<div class="motto">Mission Zero SPAD</div></div>' +
      '<nav class="nav">' + body + '</nav>' +
      '<div class="side-foot" data-cli-who></div>';

    var tabs = document.querySelector('[data-cli-tabs]');
    if (tabs) {
      tabs.innerHTML = TABS.map(function (t) {
        var n = NAV.find(function (x) { return x.id === t.id; });
        return '<a href="' + n.href + '"' + (t.id === state.active ? ' class="active"' : '') + '>' +
               svg(n.icon) + '<span>' + esc(t.label) + '</span></a>';
      }).join('');
    }
    paintWho();

    // Also in the top bar. On a phone the sidebar footer is behind the burger
    // and below the whole nav, which is a long way to go to sign out.
    var bar = document.querySelector('.topbar');
    if (bar && !bar.querySelector('[data-signout]')) {
      var out = document.createElement('a');
      out.className = 'icon-btn';
      out.href = '/api/logout';
      out.title = 'Sign out';
      out.setAttribute('data-signout', '');
      out.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>';
      bar.appendChild(out);
    }
  }

  function paintWho() {
    var el = document.querySelector('[data-cli-who]');
    if (!el || !state.me) return;
    var m = state.me;
    el.innerHTML =
      '<div class="who">' + esc(m.cli_name || m.full_name || m.username) + '</div>' +
      '<div class="where">' + esc(m.is_hq ? 'HQ · all lobbies' : (m.office_code || 'no lobby')) + '</div>' +
      '<a href="/api/logout">Sign out</a>';
  }

  /* Desktop only: collapse the 272px rail. The consolidated sheet is the widest
     thing in the app and wants the room. Remembered in localStorage, wrapped
     because a private window or blocked site data throws on access. */
  var RAIL_KEY = 'cli.railHidden';
  function railGet() { try { return localStorage.getItem(RAIL_KEY) === '1'; } catch (e) { return false; } }
  function railSet(v) { try { localStorage.setItem(RAIL_KEY, v ? '1' : '0'); } catch (e) {} }

  function wireRail() {
    var app = document.querySelector('.app');
    if (!app) return;
    if (!document.querySelector('.rail-show')) {
      var b = document.createElement('button');
      b.className = 'rail-show';
      b.title = 'Show the sidebar';
      b.innerHTML = '&#9776;';
      b.addEventListener('click', function () { app.classList.remove('rail-hidden'); railSet(false); });
      document.body.appendChild(b);
    }
    if (railGet()) app.classList.add('rail-hidden');
    var hide = document.querySelector('[data-rail-hide]');
    if (hide) hide.addEventListener('click', function () {
      app.classList.add('rail-hidden'); railSet(true);
    });
  }

  // The drawer must close on navigation-ish gestures, or a mis-tap leaves the
  // scrim covering the page with no obvious way out.
  function wireDrawer() {
    var side = document.querySelector('[data-cli-nav]');
    var scrim = document.querySelector('[data-cli-scrim]');
    var btn = document.querySelector('[data-cli-burger]');
    if (!side || !btn) return;
    function close() { side.classList.remove('open'); if (scrim) scrim.classList.remove('on'); }
    btn.addEventListener('click', function () {
      side.classList.toggle('open');
      if (scrim) scrim.classList.toggle('on', side.classList.contains('open'));
    });
    if (scrim) scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  window.CliShell = {
    NAV: NAV,
    esc: esc,
    icon: svg,
    init: function (activeId) {
      state.active = activeId;
      render();
      wireDrawer();
      wireRail();
    },
    setUser: function (me) { state.me = me; state.isHQ = !!(me && me.is_hq); render(); },
    setCounts: function (c) { state.counts = c || {}; render(); }
  };
}());
