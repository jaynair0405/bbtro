/**
 * Suburban Crew Ops — Overview.
 *
 * Reads /summary (blocks + counts only, ~700 B) rather than the full dataset:
 * this is the entry point to the module and should not pay for 2,653 legs it
 * never renders.
 *
 * Every number on this page came from a hardcoded literal in the mockup, and
 * several had gone stale (354/336 single/double when the book says 352/338,
 * "9 reports" when there are 8). They all derive from counts now.
 */
(function () {
  'use strict';

  var OFFN = SubDerive.OFFN;
  var LC = SubDerive.LINE_C;
  var OFFICES = ['CSMT-SUB', 'KYN-SUB', 'PNVL-SUB'];
  var esc = SubDerive.esc;

  /** [title, blurb, href, statKey, unit, accent, glow, icon] */
  var MODS = [
    ['Detail Book', 'Browse every duty by office & link — cycles drawn as connected chains with live rest.',
      'detail-book.html', 'details', 'details', 'var(--amber)', 'rgba(244,165,51,.12)',
      '<path d="M4 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-4-2.5L12 21l-2-2.5L6 21 4 19z"/><path d="M8 7h6M8 11h6"/>'],
    ['Rest Analysis', 'Double-detail rest between an evening sign-off and the next morning — computed on the fly.',
      null, 'double', 'doubles', 'var(--single)', 'rgba(90,169,230,.12)',
      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],
    ['Cycle Explorer', 'Single / double / triple crew cycles, chained by consecutive number with wrap.',
      null, 'triple', 'triples', 'var(--triple)', 'rgba(229,106,134,.12)',
      '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h3M14 12h3"/>'],
    ['Reports', 'Rest, night-duty hours, fast/semi/slow service mix — eight reports, sortable & exportable.',
      'reports.html', 8, 'reports', 'var(--amber)', 'rgba(244,165,51,.12)',
      '<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 9v11M14 9v11"/>'],
    ['Train Index', 'Search a train to see every detail that works it — many numbers are shared by more than one.',
      'train-index.html', 'trains', 'trains', 'var(--memu)', 'rgba(87,182,255,.12)',
      '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M8 11h6M11 8v6"/>'],
    ['Detail Blocks', 'Office · line · link-type ranges that drive the chaining — editable when a new book arrives.',
      null, 'blocksTotal', 'blocks', 'var(--cont)', 'rgba(79,209,165,.12)',
      '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M18 18h2"/>'
      + '<circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>'],
    ['Duty Roster', 'Assign motormen to rolling & fix links, track rest between turns.',
      null, null, 'soon', 'var(--fix)', 'rgba(185,140,255,.1)',
      '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>'],
    ['Wheel Movement', 'Per-crew wheel-movement & duty-hour analysis with cancellations.',
      null, null, 'soon', 'var(--memu)', 'rgba(87,182,255,.1)',
      '<path d="M4 17l6-6 4 4 6-7"/><path d="M4 21h16"/>'],
  ];

  function render(S) {
    var c = S.counts;
    var blocks = S.blocks;

    SubShell.setCounts(c);

    var h = new Date().getHours();
    document.getElementById('greet').textContent =
      h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

    // headline
    var set = function (id, v) { document.getElementById(id).textContent = v; };
    set('k-total', c.details);
    set('k-single', c.single);
    set('k-double', c.double);
    set('k-triple', c.triple);
    set('k-offices', c.offices);
    set('k-blocks', c.blocks);

    // classified details only — an unclassified one belongs in no segment
    var classified = c.single + c.double + c.triple;
    document.getElementById('seg').innerHTML = [
      ['single', c.single, 'var(--single)'],
      ['double', c.double, 'var(--double)'],
      ['triple', c.triple, 'var(--triple)'],
    ].map(function (r) {
      return '<i style="width:' + (r[1] / classified * 100) + '%;background:' + r[2]
        + '" title="' + r[1] + ' ' + r[0] + '"></i>';
    }).join('');

    // modules
    document.getElementById('mods').innerHTML = MODS.map(function (m) {
      var title = m[0], blurb = m[1], href = m[2], statKey = m[3], unit = m[4];
      var ac = m[5], gl = m[6], ic = m[7];
      var soon = !href;
      var stat = typeof statKey === 'number' ? statKey
        : statKey ? c[statKey] : '';
      return '<a class="mod' + (soon ? ' soon' : '') + '"'
        + (href ? ' href="' + href + '"' : '')
        + ' style="--ac:' + ac + ';--gl:' + gl + '">'
        + (soon ? '<span class="soonpill">soon</span>' : '')
        + '<div class="ic"><svg viewBox="0 0 24 24">' + ic + '</svg></div>'
        + '<div><h4>' + esc(title) + '</h4></div><p>' + esc(blurb) + '</p>'
        + '<div class="foot"><span class="stat">'
        + (stat === '' || stat === undefined ? '' : '<b>' + stat + '</b>' + unit) + '</span>'
        + '<span class="go"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>'
        + '</div></a>';
    }).join('');

    // by office — empty blocks are excluded here; the Detail Blocks page owns those
    document.getElementById('offs').innerHTML = OFFICES.map(function (o) {
      var bs = blocks.filter(function (b) { return b.office === o && b.n > 0; });
      var sum = function (k) { return bs.reduce(function (a, b) { return a + b[k]; }, 0); };
      var byLink = { continuous: 0, fix: 0, memu: 0 };
      bs.forEach(function (b) { byLink[b.link] += b.n; });
      var maxL = Math.max(byLink.continuous, byLink.fix, byLink.memu, 1);
      var links = Object.keys(byLink).filter(function (k) { return byLink[k] > 0; })
        .map(function (k) {
          return '<div class="lrow"><span class="k">' + k + '</span>'
            + '<span class="track"><i style="width:' + (byLink[k] / maxL * 100)
            + '%;background:' + LC[k] + '"></i></span>'
            + '<span class="v">' + byLink[k] + '</span></div>';
        }).join('');
      return '<div class="off">'
        + '<div class="oh"><span class="nm">' + OFFN[o] + '</span>'
        + '<span class="tot"><b>' + sum('n') + '</b>details</span></div>'
        + '<div class="types">'
        + '<div class="tp"><b style="color:var(--single)">' + sum('s') + '</b><span>Single</span></div>'
        + '<div class="tp"><b style="color:var(--double)">' + sum('d') + '</b><span>Double</span></div>'
        + '<div class="tp"><b style="color:var(--triple)">' + sum('t') + '</b><span>Triple</span></div>'
        + '</div><div class="links">' + links + '</div></div>';
    }).join('');
  }

  SubShell.render('overview', null);
  SubCrew.bootSummary(render);
})();
