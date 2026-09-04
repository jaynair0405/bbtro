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
          // The register is photographed AFTER the counselling, once everyone
          // has signed. On the entry form the control could only be used at
          // save time, which is the one moment the photo does not yet exist --
          // so attaching it belongs here.
          '<div class="photo-box">' +
            (s.has_photo
              ? '<a class="btn sm" target="_blank" href="/api/division/counselling/sessions/' +
                s.session_id + '/photo">View register photo</a>'
              : '<span style="color:var(--ink-3);font-size:13px">No register photo attached.</span>') +
            (d.can_edit
              ? '<label class="btn sm primary" style="margin-left:8px">' +
                (s.has_photo ? 'Replace' : 'Add photo') +
                '<input type="file" accept="image/*" capture="environment" hidden ' +
                'data-photo="' + s.session_id + '"></label>'
              : '') +
            '<span data-photo-status style="margin-left:10px;font-size:13px;color:var(--ink-3)"></span>' +
          '</div>' +
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

      var pick = host.querySelector('[data-photo]');
      if (pick) pick.addEventListener('change', function () {
        var file = pick.files[0];
        if (!file) return;
        var note = host.querySelector('[data-photo-status]');
        note.textContent = 'Uploading\u2026';
        var fd = new FormData();
        fd.append('photo', file);
        Cli.api('/sessions/' + pick.dataset.photo + '/photo', { method: 'POST', body: fd })
          .then(function () {
            note.textContent = '';
            Cli.toast('Register photo attached.', 'info');
            detail(pick.dataset.photo);   // redraw so it shows the View link
            load();                        // and the list, for the camera marker
          })
          .catch(function (err) {
            note.textContent = '';
            Cli.toast(err.status ? err.message
              : 'No network \u2014 photos cannot be queued. Try again when you are back online.', 'alert');
          });
      });
    }).catch(function (e) { Cli.toast(e.message, 'alert'); });
  }

  /* A session recorded offline lives only in the outbox until it syncs. Without
     this it would appear nowhere at all -- the CLI records staff, opens My
     Sessions, and sees no trace of what they just did. Shown at the top,
     clearly marked, and not tappable, because there is no server record to
     open yet. */
  function pendingCard(rec) {
    var pl = rec.payload || {};
    var clis = (Cli.boot_ && Cli.boot_.clis) || [];
    var cli = clis.filter(function (c) { return c.cli_id === pl.cli_id; })[0];
    var n = (pl.staff || []).length;
    return '<li class="pending-row">' +
      '<div class="who"><div class="nm">' + fmt(pl.session_date) + ' · ' + n +
        ' staff</div>' +
      '<div class="meta">' + esc((cli && cli.cli_name) || 'you') +
        (pl.office_code ? ' · ' + esc(pl.office_code) : '') +
        (pl.subject ? ' · ' + esc(pl.subject) : '') + '</div></div>' +
      '<span class="chip sync">Not yet synced</span></li>';
  }

  function load() {
    var host = document.querySelector('[data-sessions]');
    host.innerHTML = '<div class="state"><div class="spinner"></div>Loading…</div>';
    var p = new URLSearchParams();
    if (S.mine) p.set('mine', '1');
    if (S.from) p.set('from', S.from);
    if (S.to) p.set('to', S.to);
    if (S.office) p.set('office', S.office);

    Promise.all([
      Cli.apiCached('/sessions?' + p, 'sessions:' + p.toString()),
      Cli.outboxAll()
    ]).then(function (r) {
      var d = r[0];
      var queued = r[1] || [];
      var pend = queued.length ? '<ul class="rows">' + queued.map(pendingCard).join('') + '</ul>' : '';
      var stale = d._stale
        ? '<div class="banner warn" style="margin:12px 18px">Offline — this list is from ' +
          (d._cachedAt ? new Date(d._cachedAt).toLocaleString() : 'an earlier visit') +
          '.</div>'
        : '';
      host.innerHTML = pend + stale + (d.sessions.length
        ? '<ul class="rows">' + d.sessions.map(card).join('') + '</ul>'
        // HQ never gets the "create one" prompt: filing a session is the
        // lobby's job, and the button would put them on a form that then
        // demands they name a CLI.
        : (document.getElementById('h-office')
            ? '<div class="state"><h3>Nothing recorded</h3><p>' +
              (S.office ? 'No sessions filed by ' + esc(S.office) + ' for this period.'
                        : 'No sessions filed anywhere for this period.') + '</p></div>'
            : (queued.length
                ? ''
                : '<div class="state"><h3>Nothing recorded yet</h3>' +
                  '<p>Sessions you save will appear here.</p>' +
                  '<p style="margin-top:14px"><a class="btn primary" href="/cli/session.html">New counselling</a></p></div>')));
    }).catch(function (e) {
      // Even with nothing cached, anything queued on this phone must be visible.
      Cli.outboxAll().then(function (q) {
        host.innerHTML = (q && q.length ? '<ul class="rows">' + q.map(pendingCard).join('') + '</ul>' : '') +
          '<div class="state"><h3>' + (e.status ? 'Could not load' : 'Offline') + '</h3><p>' +
          (e.status ? esc(e.message)
                    : 'Your saved sessions have not been opened on this phone while online, so there is nothing to show from here yet.') +
          '</p></div>';
      });
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
    document.addEventListener('cli:synced', function (e) { if (e.detail.count) load(); });
  }

  CliShell.init('history');
  Cli.boot(render);
}());
