/* New / edit a counselling session — the screen that replaces the register page. */
(function () {
  'use strict';
  var esc = CliShell.esc;

  var S = {
    boot: null, topic: null, roster: [], selected: {}, remarks: {},
    editId: null, locked: false, photo: null, q: '', onlyPending: false
  };

  var qs = new URLSearchParams(location.search);

  function selectedCount() { return Object.keys(S.selected).length; }

  function staffLine(r) {
    var on = !!S.selected[r.hrms_id];
    var tags = '';
    if (r.is_mine) tags += '<span class="tag mine">Mine</span> ';
    tags += '<span class="tag ' + (r.pending ? 'warn' : 'mute') + '">' +
            (r.last_counselled ? (r.pending ? r.days_since + 'd' : '✓') : 'never') + '</span>';
    return '<label class="check' + (on ? ' on' : '') + '" data-hrms="' + esc(r.hrms_id) + '">' +
      '<input type="checkbox"' + (on ? ' checked' : '') + '>' +
      '<span class="who"><span class="nm">' + esc(r.name) + '</span>' +
      '<span class="meta">' + esc(r.current_cms_id || r.hrms_id) + ' · ' + esc(r.designation_code) +
      ' · ' + esc(r.current_office_code) + '</span></span>' + tags + '</label>';
  }

  function visible() {
    var q = S.q.trim().toLowerCase();
    return S.roster.filter(function (r) {
      if (S.onlyPending && !r.pending) return false;
      if (!q) return true;
      return (r.name || '').toLowerCase().indexOf(q) >= 0 ||
             (r.current_cms_id || '').toLowerCase().indexOf(q) >= 0 ||
             (r.pf_number || '').toLowerCase().indexOf(q) >= 0;
    // Own nominees first: the CLI is looking for their own people most of the
    // time, and a lobby list of 800 names buries them otherwise.
    }).sort(function (a, b) {
      if (!!b.is_mine !== !!a.is_mine) return b.is_mine ? 1 : -1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }

  function paintList() {
    var rows = visible();
    document.querySelector('[data-list]').innerHTML =
      rows.length ? rows.map(staffLine).join('')
                  : '<div class="state"><h3>No match</h3><p>Nobody in this lobby matches “' + esc(S.q) + '”.</p></div>';
    document.querySelector('[data-count]').textContent =
      selectedCount() + ' selected' + (rows.length !== S.roster.length ? ' · showing ' + rows.length : '');
    document.querySelector('[data-submit]').disabled = selectedCount() === 0;
  }

  function form() {
    var b = S.boot, me = b.me;
    var t = b.topics[0] || {};
    return '' +
      '<div class="card"><div class="card-body">' +
        '<div class="grid-2">' +
          '<div class="field"><label for="f-date">Date</label>' +
            '<input class="input" type="date" id="f-date" max="' + b.today + '" value="' + b.today + '"></div>' +
          '<div class="field"><label for="f-cli">Counselled by</label>' +
            '<select class="input" id="f-cli">' +
              b.clis.map(function (c) {
                return '<option value="' + c.cli_id + '"' + (c.cli_id === me.cli_id ? ' selected' : '') + '>' +
                       esc(c.cli_name) + ' · ' + esc(c.current_office_code) + '</option>';
              }).join('') +
            '</select>' +
            '<div class="hint">Defaults to you. Change it only when recording on a colleague’s behalf.</div></div>' +
        '</div>' +
        '<div class="field"><label for="f-subject">Subject</label>' +
          '<input class="input" id="f-subject" maxlength="255" placeholder="' + esc(t.topic_name || 'SPAD Prevention') + '"></div>' +
        '<div class="grid-2">' +
          '<div class="field"><label for="f-venue">Venue</label>' +
            '<input class="input" id="f-venue" maxlength="100" placeholder="Lobby / crew booking"></div>' +
          '<div class="field"><label for="f-photo">Register photo</label>' +
            '<input class="input" type="file" id="f-photo" accept="image/*" capture="environment">' +
            '<div class="hint">Optional. Uploads after the entry is saved.</div></div>' +
        '</div>' +
        '<div class="field" style="margin-bottom:0"><label for="f-remarks">Remarks</label>' +
          '<textarea class="input" id="f-remarks" maxlength="2000" placeholder="Anything the officers should see with this session."></textarea></div>' +
      '</div></div>' +

      '<div class="card">' +
        '<div class="card-head"><h3>Staff counselled</h3>' +
          '<span class="tag" data-count>0 selected</span></div>' +
        '<div class="card-body" style="padding-bottom:10px">' +
          '<input class="input" data-q placeholder="Search name, CMS id or PF number…">' +
          '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
            '<button class="btn sm" data-only-pending>Only pending</button>' +
            '<button class="btn sm" data-select-visible>Select all shown</button>' +
            '<button class="btn sm" data-clear>Clear</button>' +
          '</div>' +
        '</div>' +
        '<div data-list></div>' +
      '</div>' +

      '<div class="sticky-foot">' +
        '<div style="flex:1;font-size:13px;color:var(--ink-3)" data-foot-note></div>' +
        '<button class="btn primary" data-submit disabled>Save session</button>' +
      '</div>';
  }

  function wire() {
    var list = document.querySelector('[data-list]');
    list.addEventListener('change', function (e) {
      var lab = e.target.closest('.check');
      if (!lab) return;
      var id = lab.dataset.hrms;
      if (e.target.checked) S.selected[id] = true; else delete S.selected[id];
      lab.classList.toggle('on', e.target.checked);
      document.querySelector('[data-count]').textContent = selectedCount() + ' selected';
      document.querySelector('[data-submit]').disabled = selectedCount() === 0;
    });

    var q = document.querySelector('[data-q]');
    var t = null;
    q.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { S.q = q.value; paintList(); }, 140);
    });

    document.querySelector('[data-only-pending]').addEventListener('click', function (e) {
      S.onlyPending = !S.onlyPending;
      e.target.classList.toggle('primary', S.onlyPending);
      paintList();
    });
    document.querySelector('[data-select-visible]').addEventListener('click', function () {
      visible().forEach(function (r) { S.selected[r.hrms_id] = true; });
      paintList();
    });
    document.querySelector('[data-clear]').addEventListener('click', function () {
      S.selected = {}; paintList();
    });
    document.querySelector('[data-submit]').addEventListener('click', submit);
  }

  function submit() {
    var btn = document.querySelector('[data-submit]');
    var payload = {
      client_uuid: Cli.uuid(),
      topic_code: (S.boot.topics[0] || {}).topic_code || 'SPAD',
      session_date: document.getElementById('f-date').value,
      cli_id: Number(document.getElementById('f-cli').value),
      subject: document.getElementById('f-subject').value,
      venue: document.getElementById('f-venue').value,
      remarks: document.getElementById('f-remarks').value,
      staff: Object.keys(S.selected).map(function (h) { return { hrms_id: h }; })
    };
    btn.disabled = true; btn.textContent = 'Saving…';

    Cli.submitSession(payload).then(function (res) {
      var file = document.getElementById('f-photo').files[0];
      if (res.queued) {
        Cli.toast('No network — saved on this phone and queued. It will sync automatically.', 'warn');
        setTimeout(function () { location.href = '/cli/history.html'; }, 1400);
        return;
      }
      if (!file || !res.session_id) return done(res);
      var fd = new FormData(); fd.append('photo', file);
      return Cli.api('/sessions/' + res.session_id + '/photo', { method: 'POST', body: fd })
        .catch(function () { Cli.toast('Entry saved, but the photo did not upload. Add it from My Sessions.', 'warn'); })
        .then(function () { done(res); });
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = 'Save session';
      Cli.toast(e.message + (e.details ? ' — ' + e.details : ''), 'alert');
    });

    function done(res) {
      Cli.toast(res.duplicate ? 'Already recorded.' : 'Saved. ' + payload.staff.length + ' staff recorded.', 'info');
      setTimeout(function () { location.href = '/cli/history.html'; }, 900);
    }
  }

  function render(boot) {
    S.boot = boot;
    var topic = (boot.topics[0] || {}).topic_code || 'SPAD';
    document.querySelector('[data-cli-main]').innerHTML = form();
    document.querySelector('[data-foot-note]').textContent =
      boot.me.office_code ? boot.me.office_code + ' lobby' : '';
    wire();

    return Cli.api('/lobby-roster?topic=' + encodeURIComponent(topic)).then(function (d) {
      S.roster = d.staff;
      Cli.cachePut('roster:' + topic, d.staff);   // so the picker survives a dead spot
      if (qs.get('pending') === '1') {
        S.onlyPending = true;
        document.querySelector('[data-only-pending]').classList.add('primary');
      }
      paintList();
    }).catch(function () {
      // Offline: fall back to whatever the last successful load left behind.
      return Cli.cacheGet('roster:' + topic).then(function (cached) {
        if (!cached || !cached.length) throw new Error('No staff list available offline yet. Connect once and reopen.');
        S.roster = cached;
        Cli.toast('Showing the staff list saved on this phone — it may be a few days old.', 'warn');
        paintList();
      });
    });
  }

  CliShell.init('session');
  Cli.boot(render);
}());
