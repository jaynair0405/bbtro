/**
 * Suburban Crew Ops — the sidebar, once.
 *
 * All four pages used to hand-code this markup, each with its own copy of the
 * inline SVGs and its own hardcoded badge numbers (which had already drifted —
 * "9 reports" when there are 8, "354 single" when there are 352). One NAV array
 * now drives it, and the badges come from the dataset counts.
 *
 * Adding a page to this module = one NAV entry + one HTML file + one page-*.js.
 *
 * Usage:  <aside class="side" data-sub-nav="reports"></aside>
 *         SubShell.render('reports', counts);   // counts optional; badges fill later
 */
(function (root) {
  'use strict';

  var BASE = '/div/suburban/';

  /**
   * countKey is resolved against the dataset `counts` object. A number instead
   * is a literal (report definitions are code, not data — keep it next to the
   * page it describes).
   */
  var NAV = [
    { group: 'Operations' },
    { id: 'overview', label: 'Overview', href: 'index.html',
      icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>'
          + '<rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>' },
    { id: 'detail-book', label: 'Detail Book', href: 'detail-book.html', countKey: 'details',
      icon: '<path d="M4 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-4-2.5L12 21l-2-2.5L6 21 4 19z"/><path d="M8 7h6M8 11h6"/>' },
    { id: 'rest', label: 'Rest Analysis', soon: true, countKey: 'double',
      icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
    { id: 'cycles', label: 'Cycle Explorer', soon: true, countKey: 'triple',
      icon: '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h3M14 12h3"/>' },
    { id: 'reports', label: 'Reports', href: 'reports.html', count: 8,
      icon: '<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 9v11M14 9v11"/>' },
    { id: 'train-index', label: 'Train Index', href: 'train-index.html', countKey: 'trains',
      icon: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M8 11h6M11 8v6"/>' },
    { group: 'Planning' },
    { id: 'roster', label: 'Duty Roster', soon: true,
      icon: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>' },
    { id: 'wheel', label: 'Wheel Movement', soon: true,
      icon: '<path d="M4 17l6-6 4 4 6-7"/><path d="M4 21h16"/>' },
    { group: 'Configure' },
    { id: 'blocks', label: 'Detail Blocks', soon: true, countKey: 'blocksTotal',
      icon: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M18 18h2"/>'
          + '<circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>' },
  ];

  function badge(n, counts) {
    if (n.soon && n.countKey === undefined && n.count === undefined) return 'soon';
    if (n.count !== undefined) return String(n.count);
    if (!n.countKey) return null;
    var v = counts && counts[n.countKey];
    return v === undefined || v === null ? '·' : String(v);
  }

  function render(activeId, counts) {
    var el = document.querySelector('[data-sub-nav]');
    if (!el) return;

    var html = '<a class="brand" href="' + BASE + 'index.html">'
      + '<div class="kick">BB Division</div>'
      + '<h1>CREW<em>·</em>OPS</h1>'
      + '<div class="sub">Suburban motormen / LP</div></a><nav class="nav">';

    NAV.forEach(function (n) {
      if (n.group) { html += '<div class="ngroup">' + n.group + '</div>'; return; }
      var b = badge(n, counts);
      var cls = 'item' + (n.id === activeId ? ' on' : '') + (n.soon ? ' soon' : '');
      var open = n.href && n.id !== activeId ? '<a class="' + cls + '" href="' + BASE + n.href + '">'
        : '<a class="' + cls + '">';
      html += open
        + '<svg viewBox="0 0 24 24">' + n.icon + '</svg>'
        + '<b>' + n.label + '</b>'
        + (b ? '<span class="b" data-count="' + (n.countKey || '') + '">' + b + '</span>' : '')
        + '</a>';
    });

    html += '</nav>'
      + '<a class="back" href="/div/index.html">'
      + '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2">'
      + '<path d="M19 12H5M11 18l-6-6 6-6"/></svg>Division Portal</a>'
      + '<div class="who"><div class="av" id="subAv">··</div>'
      + '<div><div class="n" id="subWho">Loading…</div><div class="r" id="subRole"></div></div></div>';

    el.innerHTML = html;
    whoAmI();
  }

  /** Fill the badges once the dataset lands. */
  function setCounts(counts) {
    NAV.forEach(function (n) {
      if (!n.countKey) return;
      var el = document.querySelector('[data-count="' + n.countKey + '"]');
      if (el) el.textContent = badge(n, counts);
    });
  }

  /** Real signed-in user in the footer, not the mockup's placeholder. */
  function whoAmI() {
    fetch('/api/current-user', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var u = j && (j.user || j);
        if (!u || !u.username) return;
        var name = u.name || u.full_name || u.username;
        var initials = String(name).trim().split(/\s+/).slice(0, 2)
          .map(function (w) { return w[0]; }).join('').toUpperCase();
        var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
        set('subAv', initials || '··');
        set('subWho', name);
        set('subRole', [u.div_role || u.role, u.div_office_code].filter(Boolean).join(' · '));
      })
      .catch(function () { /* the sidebar is not worth failing a page over */ });
  }

  root.SubShell = { NAV: NAV, render: render, setCounts: setCounts };
})(window);
