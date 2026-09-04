/* Home — "how is my patch doing, and who do I still owe?" */
(function () {
  'use strict';
  var esc = CliShell.esc;

  function ago(row) {
    if (!row.last_counselled) return 'never counselled';
    if (row.days_since === 0) return 'counselled today';
    if (row.days_since === 1) return 'counselled yesterday';
    return row.days_since + ' days ago';
  }

  function staffRow(r) {
    var n = Number(r.count_90d || 0);
    var circle = n ? '<span class="circle' + (n > 1 ? ' many' : '') + '" title="' + n +
                     ' counselling' + (n === 1 ? '' : 's') + ' in the last 90 days">' + n + '</span>' : '';
    return '<li>' +
      '<div class="who"><div class="nm">' + esc(r.name) + '</div>' +
      '<div class="meta">' + esc(r.current_cms_id || r.hrms_id) + ' · ' + esc(r.designation_code) +
      ' · ' + esc(ago(r)) +
      ((r.off_lobby || r.off_scope) ? ' · <span class="away">' + esc(r.current_office_code) + '</span>' : '') +
      '</div></div>' + circle +
      '<span class="tag ' + (r.pending ? 'warn' : 'ok') + '">' + (r.pending ? 'Due' : 'Done') + '</span>' +
      '</li>';
  }

  function render(boot) {
    var main = document.querySelector('[data-cli-main]');
    var topic = (boot.topics[0] || {}).topic_code || 'SPAD';

    return Cli.apiCached('/roster?topic=' + encodeURIComponent(topic), 'roster:' + topic).then(function (d) {
      var c = d.counts;
      var pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
      CliShell.setCounts({ pending: c.pending });

      // HQ has no nominees of its own, so the coverage hero would read 0/0 and
      // look broken. Send them where their work actually is.
      if (!d.cli_id) {
        main.innerHTML =
          '<div class="banner info">This account is not linked to a CLI, so it has no nominated staff. ' +
          'Coverage figures belong to the lobby CLIs.</div>' +
          (boot.me.is_hq
            ? '<a class="btn primary big block" href="/cli/sheet.html">Open the consolidated sheet</a>'
            : '<div class="card"><div class="state"><h3>Nothing to show yet</h3>' +
              '<p>Ask HQ to link your login to your CLI record.</p></div></div>');
        return;
      }

      var pending = d.staff.filter(function (s) { return s.pending; });
      var outside = d.staff.filter(function (s) { return s.off_lobby || s.off_scope; });
      var cycle = d.topic.cycle_days;
      var a = d.activity || {};

      main.innerHTML =
        (d._stale
          ? '<div class="banner warn">Offline. These figures are from ' +
            (d._cachedAt ? new Date(d._cachedAt).toLocaleString() : 'an earlier visit') +
            ' and will not include anything recorded since.</div>'
          : '') +
        '<section class="hero">' +
          '<div class="label">' + esc(d.topic.topic_name) + '</div>' +
          '<div class="motto">Mission Zero SPAD</div>' +
          '<div class="hero-stats">' +
            '<div class="hero-stat"><div class="stat-value">' + c.done + '</div>' +
              '<div class="stat-label">Counselled</div></div>' +
            '<div class="hero-stat' + (c.pending ? ' alert' : '') + '"><div class="stat-value">' + c.pending + '</div>' +
              '<div class="stat-label">Pending</div></div>' +
            '<div class="hero-stat"><div class="stat-value">' + c.total + '</div>' +
              '<div class="stat-label">My staff</div></div>' +
          '</div>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
          '<div class="bar-note"><span>' + pct + '% within cycle</span>' +
            '<span>' + (cycle ? 'every ' + cycle + ' days' : 'no cycle set') + '</span></div>' +
        '</section>' +

        '<a class="btn primary big block" style="margin-top:16px" href="/cli/session.html">' +
          CliShell.icon('M12 5v14M5 12h14') + 'New counselling</a>' +

        // What this CLI has actually done, split by nominated vs not. Coverage
        // above only moves for nominated staff, so without this a CLI who spends
        // the month counselling other people's staff appears to have done nothing.
        '<div class="card" style="margin-top:16px">' +
          '<div class="card-head"><h3>Counselled by me · last ' + (a.window_days || 90) + ' days</h3></div>' +
          '<div class="card-body">' +
            '<div class="split">' +
              '<div class="split-stat"><div class="sv">' + (a.staff_total || 0) + '</div>' +
                '<div class="sl">staff</div></div>' +
              '<div class="split-stat mine"><div class="sv">' + (a.staff_mine || 0) + '</div>' +
                '<div class="sl">nominated to me</div></div>' +
              '<div class="split-stat"><div class="sv">' + (a.staff_others || 0) + '</div>' +
                '<div class="sl">other CLIs’ staff</div></div>' +
              '<div class="split-stat"><div class="sv">' + (a.sessions || 0) + '</div>' +
                '<div class="sl">sessions</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Nominees this CLI cannot reach. Not hidden: they are the reason a
        // roster of 46 shows "my staff 41", and only HQ can re-nominate them.
        // Informational only. Cross-lobby nomination is normal in suburban, so
        // these staff are still counsellable and still count toward coverage —
        // the note just says where they are, and the picker keeps them selectable.
        (outside.length
          ? '<div class="banner info" style="margin-top:16px">' +
            '<div><strong>' + outside.length + ' of your nominated staff are outside your own lobby.</strong> ' +
            (c.off_lobby ? c.off_lobby + ' at another depot' : '') +
            (c.off_lobby && c.off_scope ? ', ' : '') +
            (c.off_scope ? c.off_scope + ' on the other side of the mainline/suburban split' : '') +
            '. They remain yours to counsel and are included in your figures.</div></div>'
          : '') +

        '<div class="card" style="margin-top:16px">' +
          '<div class="card-head"><h3>Pending</h3>' +
            '<span class="tag ' + (pending.length ? 'warn' : 'ok') + '">' + pending.length + '</span>' +
            '<div style="flex:1"></div>' +
            '<a class="btn sm" href="/cli/session.html?pending=1">Counsel these</a></div>' +
          (pending.length
            ? '<div class="card-body tight"><ul class="rows">' + pending.map(staffRow).join('') + '</ul></div>'
            : '<div class="state"><h3>All clear</h3><p>Every one of your ' + c.total +
              ' staff is within the ' + (cycle || '—') + '-day cycle.</p></div>') +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head"><h3>Within cycle</h3>' +
            '<span class="tag ok">' + c.done + '</span></div>' +
          '<div class="card-body tight"><ul class="rows">' +
            d.staff.filter(function (s) { return !s.pending; })
                   .sort(function (a, b) { return (b.days_since || 0) - (a.days_since || 0); })
                   .map(staffRow).join('') +
          '</ul></div>' +
        '</div>';
    });
  }

  CliShell.init('home');
  Cli.boot(render);
  // A queued entry that syncs while this page is open should update the counts.
  document.addEventListener('cli:synced', function (e) { if (e.detail.count) location.reload(); });
}());
