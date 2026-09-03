/* My Sessions — what this lobby has recorded, and a way back into any of it. */
(function () {
  'use strict';
  var esc = CliShell.esc;
  var S = { mine: true, from: null, to: null, office: null };

  function fmt(d) {
    if (!d) return '';
    var p = String(d).slice(0, 10).split('-');
    var M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return p[2] + ' ' + M[+p[1] - 1] + ' ' + p[0];
  }

  function card(s) {
    return '<li data-open="' + s.session_id + '" style="cursor:pointer">' +
      '<div class="who">' +
        '<div class="nm">' + fmt(s.session_date) + ' · ' + s.staff_count +
          ' staff' + (Number(s.has_photo) ? ' · 📷' : '') + '</div>' +
        '<div class="meta">' + esc(s.cli_name || '—') + ' · ' + esc(s.office_code) +
          (s.subject ? ' · ' + esc(s.subject) : '') + '</div>' +
      '</div>' +
      (Number(s.is_locked) ? '<span class="chip lock">Locked</span>' : '') +
      '</li>';
  }

  function detail(id) {
    var host = document.querySelector('[data-detail]');
    host.innerHTML = '<div class="state"><div class="spinner"></div>Loading…</div>';
    Cli.api('/sessions/' + id).then(function (d) {
      var s = d.session;
      host.innerHTML =
        '<div class="card-head"><h3>' + fmt(s.session_date) + ' · ' + esc(s.cli_name || '—') + '</h3>' +
          (d.locked ? '<span class="chip lock">Locked by HQ</span>' : '') +
          '<div style="flex:1"></div>' +
          (d.can_edit
            ? '<button class="btn sm danger" data-del="' + s.session_id + '">Delete</button>'
            : '') +
          '<button class="btn sm" data-close>Close</button></div>' +
        '<div class="card-body">' +
          (s.subject ? '<p><strong>' + esc(s.subject) + '</strong></p>' : '') +
          (s.venue ? '<p style="color:var(--ink-3);font-size:13px">Venue: ' + esc(s.venue) + '</p>' : '') +
          (s.remarks ? '<p style="margin-top:8px">' + esc(s.remarks) + '</p>' : '') +
          (s.has_photo
            ? '<p style="margin-top:12px"><a class="btn sm" target="_blank" href="/api/division/counselling/sessions/' +
              s.session_id + '/photo">View register photo</a></p>' : '') +
          (d.locked && !d.can_edit
            ? '<div class="banner warn" style="margin-top:14px">HQ has locked this date, so it can no longer be changed here. Ask HQ to reopen it.</div>'
            : '') +
        '</div>' +
        '<div class="card-body tight"><ul class="rows">' +
          d.attendees.map(function (a) {
            return '<li><div class="who"><div class="nm">' + esc(a.name) + '</div>' +
              '<div class="meta">' + esc(a.current_cms_id || a.staff_hrms_id) + ' · ' +
              esc(a.designation_code) + ' · ' + esc(a.office_code) +
              (a.remarks ? ' · ' + esc(a.remarks) : '') + '</div></div></li>';
          }).join('') +
        '</ul></div>';
      host.hidden = false;
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function (e) { Cli.toast(e.message, 'alert'); });
  }

  function load() {
    var host = document.querySelector('[data-sessions]');
    host.innerHTML = '<div class="state"><div class="spinner"></div>Loading…</div>';
    var p = new URLSearchParams();
    if (S.mine) p.set('mine', '1');
    if (S.from) p.set('from', S.from);
    if (S.to) p.set('to', S.to);
    if (S.office) p.set('office', S.office);
    Cli.api('/sessions?' + p).then(function (d) {
      host.innerHTML = d.sessions.length
        ? '<ul class="rows">' + d.sessions.map(card).join('') + '</ul>'
        // HQ never gets the "create one" prompt: filing a session is the
        // lobby's job, and the button would put them on a form that then
        // demands they name a CLI.
        : (document.getElementById('h-office')
            ? '<div class="state"><h3>Nothing recorded</h3><p>' +
              (S.office ? 'No sessions filed by ' + esc(S.office) + ' for this period.'
                        : 'No sessions filed anywhere for this period.') + '</p></div>'
            : '<div class="state"><h3>Nothing recorded yet</h3>' +
              '<p>Sessions you save will appear here.</p>' +
              '<p style="margin-top:14px"><a class="btn primary" href="/cli/session.html">New counselling</a></p></div>');
    }).catch(function (e) {
      host.innerHTML = '<div class="state"><h3>Could not load</h3><p>' + esc(e.message) + '</p></div>';
    });
  }

  function render(boot) {
    // HQ has no CLI and no lobby, so "Mine only / Whole lobby" is meaningless to
    // them — the page was silently listing the whole division under a heading
    // that said "My Sessions". Give them a lobby picker instead, and say so.
    var isHQ = !boot.me.cli_id;
    if (isHQ) {
      var h2 = document.querySelector('.page-head h2');
      var sub = document.querySelector('.page-head .sub');
      if (h2) h2.textContent = 'All Sessions';
      if (sub) sub.textContent = 'Everything recorded across the division. Filter by lobby.';
      var h1 = document.querySelector('.topbar h1');
      if (h1) h1.textContent = 'All Sessions';
      document.title = 'All Sessions \u00b7 CLI';
    }

    document.querySelector('[data-cli-main]').innerHTML =
      '<div class="card"><div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +
        '<div class="field" style="margin:0"><label for="h-from">From</label>' +
          '<input class="input" type="date" id="h-from"></div>' +
        '<div class="field" style="margin:0"><label for="h-to">To</label>' +
          '<input class="input" type="date" id="h-to"></div>' +
        (isHQ
          ? '<div class="field" style="margin:0"><label for="h-office">Lobby</label>' +
            '<select class="input" id="h-office" style="max-width:220px">' +
              '<option value="">All lobbies</option>' +
              (boot.offices || []).map(function (o) {
                return '<option value="' + CliShell.esc(o.office_code) + '">' +
                       CliShell.esc(o.office_name) + ' (' + CliShell.esc(o.office_code) + ')</option>';
              }).join('') +
            '</select></div>'
          : '<button class="btn" data-scope>Mine only</button>') +
      '</div></div>' +
      '<div class="card"><div class="card-body tight" data-sessions></div></div>' +
      '<div class="card" data-detail hidden></div>';

    S.mine = !!boot.me.cli_id;
    var scope = document.querySelector('[data-scope]');
    if (scope) {
      scope.classList.toggle('primary', S.mine);
      scope.addEventListener('click', function () {
        S.mine = !S.mine;
        scope.textContent = S.mine ? 'Mine only' : 'Whole lobby';
        scope.classList.toggle('primary', S.mine);
        load();
      });
    }
    var off = document.getElementById('h-office');
    if (off) off.addEventListener('change', function () { S.office = off.value || null; load(); });
    ['h-from', 'h-to'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', function () {
        S.from = document.getElementById('h-from').value || null;
        S.to = document.getElementById('h-to').value || null;
        load();
      });
    });

    document.querySelector('[data-cli-main]').addEventListener('click', function (e) {
      var open = e.target.closest('[data-open]');
      if (open) return detail(open.dataset.open);
      if (e.target.matches('[data-close]')) { document.querySelector('[data-detail]').hidden = true; return; }
      var del = e.target.closest('[data-del]');
      if (del) {
        if (!confirm('Delete this session and all the staff recorded in it?')) return;
        Cli.api('/sessions/' + del.dataset.del, { method: 'DELETE' }).then(function () {
          document.querySelector('[data-detail]').hidden = true;
          Cli.toast('Session deleted.', 'info');
          load();
        }).catch(function (err) { Cli.toast(err.message, 'alert'); });
      }
    });

    load();
  }

  CliShell.init('history');
  Cli.boot(render);
}());
