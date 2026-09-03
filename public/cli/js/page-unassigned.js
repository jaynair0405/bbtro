/* ============================================================================
 * HQ: Active running staff who belong to no CLI.
 *
 * They are still counsellable — the picker is scoped by lobby, not by
 * nomination — but nobody is accountable for them and they appear on no pending
 * list. On paper they were invisible; the point of this page is that they stop
 * being invisible and become a worklist.
 *
 * Two populations, never merged:
 *   NO CLI  — an omission. Someone should nominate them.
 *   PARKED  — deliberate, under the "Not Assigned" placeholder, while on long
 *             training or under punishment. Expected; only the old ones matter.
 *
 * Nominating happens in CLI Management, which writes the dated nomination and
 * its letter. This page does not duplicate that — it links to it.
 * ==========================================================================*/
(function () {
  'use strict';
  var esc = CliShell.esc;
  var S = { tab: 'no_cli', data: null, lobby: '', desig: '', q: '' };

  function months(n) {
    if (n == null) return '';           // reporting_date is not reliably filled
    if (n < 12) return '';              // only long service is worth stating here
    var y = Math.floor(n / 12);
    return y + (y === 1 ? ' year' : ' years') + ' in the division';
  }

  /* Only the long-uncovered are flagged.
     A tag on every row is not a signal, it is wallpaper — and reporting_date is
     not reliably filled, so "recent joiner" and "no reporting date" told the
     reader nothing they could act on. Someone two years in with no CLI has been
     uncovered the entire time, and that is worth a red tag. Everyone else gets
     none, and the row is judged on lobby and designation. */
  function cohort(r) {
    var m = r.months_since_reporting;
    if (m == null || m < 24) return null;
    return { label: 'Over 2 years', tone: 'warn' };
  }

  function rows() {
    var list = S.data ? (S.tab === 'no_cli' ? S.data.no_cli : S.data.parked) : [];
    var q = S.q.trim().toLowerCase();
    return list.filter(function (r) {
      if (S.lobby && r.current_office_code !== S.lobby) return false;
      if (S.desig && r.designation_code !== S.desig) return false;
      if (!q) return true;
      return (r.name || '').toLowerCase().indexOf(q) >= 0 ||
             (r.current_cms_id || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  function line(r) {
    if (S.tab === 'parked') {
      var d = r.days_parked;
      var stale = d != null && d > 180;
      return '<li>' +
        '<div class="who"><div class="nm">' + esc(r.name) + '</div>' +
        '<div class="meta">' + esc(r.current_cms_id || r.hrms_id) + ' · ' + esc(r.designation_code) +
          ' · ' + esc(r.current_office_code) +
          (r.parked_reason ? ' · ' + esc(r.parked_reason) : ' · no reason recorded') +
          (r.parked_by ? ' · by ' + esc(r.parked_by) : '') +
        '</div></div>' +
        '<span class="tag ' + (stale ? 'warn' : 'mute') + '">' +
          (d == null ? 'unknown' : d + 'd') + '</span></li>';
    }
    var c = cohort(r);
    var svc = months(r.months_since_reporting);
    return '<li>' +
      '<div class="who"><div class="nm">' + esc(r.name) + '</div>' +
      '<div class="meta">' + esc(r.current_cms_id || r.hrms_id) + ' · ' + esc(r.designation_code) +
        ' · ' + esc(r.current_office_code) + (svc ? ' · ' + esc(svc) : '') +
      '</div></div>' +
      (c ? '<span class="tag ' + c.tone + '">' + esc(c.label) + '</span>' : '') + '</li>';
  }

  function uniq(list, key) {
    var seen = {};
    list.forEach(function (r) { if (r[key]) seen[r[key]] = (seen[r[key]] || 0) + 1; });
    return Object.keys(seen).sort().map(function (k) { return { k: k, n: seen[k] }; });
  }

  function csv() {
    var list = rows();
    var head = S.tab === 'parked'
      ? ['CMS ID', 'Name', 'Designation', 'Lobby', 'Parked on', 'Days parked', 'Reason', 'Parked by']
      : ['CMS ID', 'Name', 'Designation', 'Lobby', 'Reporting date', 'Months in division'];
    var body = list.map(function (r) {
      var f = S.tab === 'parked'
        ? [r.current_cms_id, r.name, r.designation_code, r.current_office_code,
           r.parked_on, r.days_parked, r.parked_reason, r.parked_by]
        : [r.current_cms_id, r.name, r.designation_code, r.current_office_code,
           r.reporting_date, r.months_since_reporting];
      return f.map(function (v) {
        var t = v == null ? '' : String(v);
        return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
      }).join(',');
    });
    // A blob download, not a link to the server: the list is already in the
    // browser and this keeps HQ's filters applied to what they actually export.
    var blob = new Blob([[head.join(',')].concat(body).join('\n')], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'unassigned-staff-' + S.tab + '-' + Cli.boot_.today + '.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function paint() {
    var d = S.data;
    var list = rows();
    var all = S.tab === 'no_cli' ? d.no_cli : d.parked;
    var total = d.covered + d.no_cli.length + d.parked.length;
    var pct = total ? Math.round((d.covered / total) * 100) : 0;

    document.querySelector('[data-head]').innerHTML =
      '<div class="split">' +
        '<div class="split-stat"><div class="sv">' + d.covered + '</div>' +
          '<div class="sl">with a CLI</div></div>' +
        '<div class="split-stat mine"><div class="sv">' + d.no_cli.length + '</div>' +
          '<div class="sl">no CLI at all</div></div>' +
        '<div class="split-stat"><div class="sv">' + d.parked.length + '</div>' +
          '<div class="sl">parked (training / punishment)</div></div>' +
        '<div class="split-stat"><div class="sv">' + pct + '%</div>' +
          '<div class="sl">of running staff covered</div></div>' +
      '</div>';

    document.querySelector('[data-tabs2]').innerHTML =
      '<button class="btn sm' + (S.tab === 'no_cli' ? ' primary' : '') + '" data-t="no_cli">' +
        'No CLI ' + d.no_cli.length + '</button>' +
      '<button class="btn sm' + (S.tab === 'parked' ? ' primary' : '') + '" data-t="parked">' +
        'Parked ' + d.parked.length + '</button>';

    document.querySelector('[data-filters]').innerHTML =
      '<select class="input" data-lobby style="max-width:220px"><option value="">All lobbies</option>' +
        uniq(all, 'current_office_code').map(function (o) {
          return '<option value="' + esc(o.k) + '"' + (S.lobby === o.k ? ' selected' : '') + '>' +
                 esc(o.k) + ' (' + o.n + ')</option>'; }).join('') +
      '</select>' +
      '<select class="input" data-desig style="max-width:200px"><option value="">All designations</option>' +
        uniq(all, 'designation_code').map(function (o) {
          return '<option value="' + esc(o.k) + '"' + (S.desig === o.k ? ' selected' : '') + '>' +
                 esc(o.k) + ' (' + o.n + ')</option>'; }).join('') +
      '</select>';

    document.querySelector('[data-note]').innerHTML = S.tab === 'no_cli'
      ? '<div class="banner info">These staff were never nominated to anyone. They can still be ' +
        'counselled — the picker is scoped by lobby — but no CLI is accountable for them and they ' +
        'appear on no pending list. Nominate them in <a href="/div/cli-management.html">CLI Management</a>.</div>'
      : '<div class="banner info">Deliberately held under the “Not Assigned” placeholder while on long ' +
        'training or under punishment. Only the long-parked need attention — training ends.</div>';

    document.querySelector('[data-list]').innerHTML =
      list.length ? '<ul class="rows">' + list.map(line).join('') + '</ul>'
                  : '<div class="state"><h3>Nothing here</h3><p>No staff match that filter.</p></div>';
    document.querySelector('[data-count]').textContent =
      list.length + (list.length === all.length ? '' : ' of ' + all.length);
  }

  function render() {
    var main = document.querySelector('[data-cli-main]');
    main.innerHTML =
      '<div class="card"><div class="card-body" data-head></div></div>' +
      '<div class="card">' +
        '<div class="card-head">' +
          '<div class="chips" data-tabs2></div>' +
          '<div style="flex:1"></div>' +
          '<span class="tag" data-count>0</span>' +
          '<button class="btn sm" data-csv>Export CSV</button>' +
        '</div>' +
        '<div class="card-body" style="display:flex;gap:10px;flex-wrap:wrap">' +
          '<div data-filters style="display:flex;gap:10px;flex-wrap:wrap"></div>' +
          '<input class="input" data-q placeholder="Search name or CMS id…" style="max-width:260px">' +
        '</div>' +
        '<div class="card-body" style="padding-top:0" data-note></div>' +
        '<div class="card-body tight" data-list></div>' +
      '</div>';

    main.addEventListener('click', function (e) {
      var t = e.target.closest('[data-t]');
      if (t) { S.tab = t.dataset.t; S.lobby = ''; S.desig = ''; return paint(); }
      if (e.target.matches('[data-csv]')) return csv();
    });
    main.addEventListener('change', function (e) {
      if (e.target.matches('[data-lobby]')) { S.lobby = e.target.value; paint(); }
      if (e.target.matches('[data-desig]')) { S.desig = e.target.value; paint(); }
    });
    var tm = null;
    main.addEventListener('input', function (e) {
      if (!e.target.matches('[data-q]')) return;
      clearTimeout(tm); var v = e.target.value;
      tm = setTimeout(function () { S.q = v; paint(); }, 140);
    });

    return Cli.api('/unassigned').then(function (d) { S.data = d; paint(); });
  }

  CliShell.init('unassigned');
  Cli.boot(render);
}());
