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
    users:  'M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-2a4 4 0 0 0-3-3.9'
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

  function itemHtml(n) {
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
      '<div class="brand"><div class="brand-mark"><span class="brand-dot"></span>' +
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
    },
    setUser: function (me) { state.me = me; state.isHQ = !!(me && me.is_hq); render(); },
    setCounts: function (c) { state.counts = c || {}; render(); }
  };
}());
