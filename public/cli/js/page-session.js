/* New / edit a counselling session — the screen that replaces the register page. */
(function () {
  'use strict';
  var esc = CliShell.esc;

  var S = {
    boot: null, topic: null, roster: [], selected: {}, remarks: {},
    editId: null, locked: false, photo: null, q: '', onlyPending: false,
    desig: null,        // designation filter key, null = all
    onlyMine: false,    // the Nominated chip
    designations: [], counts: {}
  };

  var qs = new URLSearchParams(location.search);

  function selectedCount() { return Object.keys(S.selected).length; }

  function staffLine(r) {
    var on = !!S.selected[r.hrms_id];
    // How many times in the last 90 days. Zero is left blank rather than shown
    // as "0" — an empty circle beside every uncounselled name is noise, and the
    // "never / Nd" tag already says it.
    var n = Number(r.count_90d || 0);
    var circle = n ? '<span class="circle' + (n > 1 ? ' many' : '') + '" ' +
                     'title="' + n + ' counselling' + (n === 1 ? '' : 's') + ' in the last 90 days">' +
                     n + '</span>' : '';
    var tags = '<span class="tag ' + (r.pending ? 'warn' : 'mute') + '">' +
               (r.last_counselled ? (r.pending ? r.days_since + 'd' : '✓') : 'never') + '</span>';
    return '<label class="check' + (on ? ' on' : '') + (r.is_mine ? ' mine' : '') +
      '" data-hrms="' + esc(r.hrms_id) + '">' +
      '<input type="checkbox"' + (on ? ' checked' : '') + '>' +
      '<span class="who"><span class="nm">' + esc(r.name) +
        (r.is_mine ? '<span class="tag mine">Mine</span>' : '') + '</span>' +
      '<span class="meta">' + esc(r.current_cms_id || r.hrms_id) + ' · ' + esc(r.designation_code) +
      ' · ' + esc(r.current_office_code) + '</span></span>' + circle + tags + '</label>';
  }

  function visible() {
    var q = S.q.trim().toLowerCase();
    var col = S.desig && S.designations.filter(function (d) { return d.key === S.desig; })[0];
    return S.roster.filter(function (r) {
      if (S.onlyMine && !r.is_mine) return false;
      if (S.onlyPending && !r.pending) return false;
      if (col && col.ids.indexOf(Number(r.designation_id)) < 0) return false;
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

  /* Selected, split by whether they are this CLI's own nominees. Only the
     nominated half moves the coverage figures on the Home screen, so showing one
     combined number would make the two look interchangeable when they are not. */
  function selectedSplit() {
    var mine = 0, others = 0;
    S.roster.forEach(function (r) {
      if (!S.selected[r.hrms_id]) return;
      if (r.is_mine) mine++; else others++;
    });
    return { mine: mine, others: others, total: mine + others };
  }

  function paintCounts() {
    var sp = selectedSplit();
    var rows = visible();
    document.querySelector('[data-count]').innerHTML =
      sp.total + ' selected' +
      (sp.total ? ' <span class="sub-count">(' + sp.mine + ' mine · ' + sp.others + ' other)</span>' : '') +
      (rows.length !== S.roster.length ? ' · showing ' + rows.length : '');
    document.querySelector('[data-submit]').disabled = sp.total === 0;
  }

  function paintChips() {
    var host = document.querySelector('[data-desig]');
    if (!host) return;
    var mineN = (S.counts && S.counts.mine) || 0;
    // An account with no CLI of its own has no nominees, so this chip could only
    // ever read 0. A filter that can never match is worse than no filter.
    var showMine = !!(S.boot && S.boot.me && S.boot.me.cli_id);
    host.innerHTML =
      (showMine
        ? '<button class="btn sm chip-mine' + (S.onlyMine ? ' primary' : '') + '" data-mine>' +
          '★ Nominated ' + mineN + '</button><span class="chip-div"></span>'
        : '') +
      '<button class="btn sm' + (S.desig ? '' : ' primary') + '" data-d="">All ' +
        S.roster.length + '</button>' +
      S.designations.map(function (d) {
        return '<button class="btn sm' + (S.desig === d.key ? ' primary' : '') +
               '" data-d="' + esc(d.key) + '">' + esc(d.label) + ' ' + d.n + '</button>';
      }).join('');
  }

  function paintList() {
    var rows = visible();
    document.querySelector('[data-list]').innerHTML =
      rows.length ? rows.map(staffLine).join('')
                  : '<div class="state"><h3>No match</h3><p>' +
                    (S.onlyMine ? 'None of your nominated staff match that filter.'
                                : 'Nobody in this lobby matches that filter.') + '</p></div>';
    paintChips();
    paintCounts();
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
              // An account with no CLI of its own (HQ) must pick one. Without
              // this placeholder the select silently lands on whoever is first
              // alphabetically, and the session is filed against them.
              (me.cli_id ? '' : '<option value="" selected>— choose the CLI who counselled —</option>') +
              b.clis.map(function (c) {
                return '<option value="' + c.cli_id + '" data-office="' + esc(c.current_office_code) + '"' +
                       (c.cli_id === me.cli_id ? ' selected' : '') + '>' +
                       esc(c.cli_name) + ' · ' + esc(c.current_office_code) + '</option>';
              }).join('') +
            '</select>' +
            '<div class="hint">' + (me.cli_id
              ? 'Defaults to you. Change it only when recording on another CLI\u2019s behalf.'
              : 'Their lobby decides which staff you can pick.') + '</div></div>' +
        '</div>' +
        '<div class="field"><label for="f-subject">Subject</label>' +
          '<select class="input" id="f-subject">' +
            (b.subjects || []).map(function (o, i) {
              return '<option value="' + esc(o.key) + '" data-numbered="' + (o.numbered ? '1' : '') + '"' +
                     (i === 0 ? ' selected' : '') + '>' + esc(o.label) + (o.numbered ? ' — …' : '') + '</option>';
            }).join('') +
          '</select>' +
          // Only appears for the three numbered instruction types. Kept as its own
          // input rather than making the CLI type the whole subject line, so the
          // wording on the officers' sheet stays identical across every lobby.
          '<div data-num-wrap hidden style="margin-top:10px">' +
            '<input class="input" id="f-subject-no" maxlength="30" placeholder="Instruction / circular number">' +
          '</div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="field"><label for="f-venue">Lobby</label>' +
            '<select class="input" id="f-venue">' +
              (b.offices || []).map(function (o) {
                return '<option value="' + esc(o.office_code) + '"' +
                       (o.office_code === me.office_code ? ' selected' : '') + '>' +
                       esc(o.office_name) + ' (' + esc(o.office_code) + ')</option>';
              }).join('') +
            '</select>' +
            '<div class="hint">Where the counselling took place. Defaults to your own; ' +
              'changing it loads that lobby\u2019s staff.</div></div>' +
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
          '<div class="chips" data-desig></div>' +
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
      paintCounts();
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

    var subj = document.getElementById('f-subject');
    function syncSubject() {
      var numbered = !!subj.selectedOptions[0].dataset.numbered;
      document.querySelector('[data-num-wrap]').hidden = !numbered;
      if (!numbered) document.getElementById('f-subject-no').value = '';
    }
    subj.addEventListener('change', syncSubject);
    syncSubject();

    var venSel = document.getElementById('f-venue');
    venSel.addEventListener('change', function () {
      var office = venSel.value;
      if (!office) return;
      var scopeNote = { motorman: ' \u00b7 motormen', 'non-motorman': ' \u00b7 excl. motormen', all: '' };
      document.querySelector('[data-foot-note]').textContent =
        office + (scopeNote[CliDerive.staffScopeFor(office)] || '');
      loadRoster((S.boot.topics[0] || {}).topic_code || 'SPAD', office);
    });

    var cliSel = document.getElementById('f-cli');
    cliSel.addEventListener('change', function () {
      var opt = cliSel.selectedOptions[0];
      var office = opt && opt.dataset.office;
      if (!office) return;
      // Keep the venue with the CLI, and reload the picker for their lobby.
      if (!S.boot.me.cli_id) {
        var ven = document.getElementById('f-venue');
        if (ven) { ven.value = office; ven.dispatchEvent(new Event('change')); }
      }
    });

    document.querySelector('[data-desig]').addEventListener('click', function (e) {
      if (e.target.closest('[data-mine]')) { S.onlyMine = !S.onlyMine; return paintList(); }
      var b2 = e.target.closest('[data-d]');
      if (!b2) return;
      S.desig = b2.dataset.d || null;
      paintList();
    });
  }

  /* The stored subject string. A numbered instruction becomes
     "Sr DEE Instruction-14", which is what the officers' sheet should read. */
  function subjectText() {
    var sel = document.getElementById('f-subject').selectedOptions[0];
    var label = sel.text.replace(/ — …$/, '');
    var no = (document.getElementById('f-subject-no').value || '').trim();
    return sel.dataset.numbered && no ? label + '-' + no : label;
  }

  function submit() {
    var btn = document.querySelector('[data-submit]');
    var payload = {
      client_uuid: Cli.uuid(),
      topic_code: (S.boot.topics[0] || {}).topic_code || 'SPAD',
      session_date: document.getElementById('f-date').value,
      cli_id: Number(document.getElementById('f-cli').value),
      subject: subjectText(),
      venue: document.getElementById('f-venue').value,
      office_code: document.getElementById('f-venue').value,
      remarks: document.getElementById('f-remarks').value,
      staff: Object.keys(S.selected).map(function (h) { return { hrms_id: h }; })
    };
    if (!document.getElementById('f-cli').value) {
      Cli.toast('Choose the CLI who did the counselling.', 'alert');
      document.getElementById('f-cli').focus();
      return;
    }
    var sel = document.getElementById('f-subject').selectedOptions[0];
    if (sel.dataset.numbered && !document.getElementById('f-subject-no').value.trim()) {
      Cli.toast('Enter the ' + sel.text.replace(/ — …$/, '') + ' number.', 'alert');
      document.getElementById('f-subject-no').focus();
      return;
    }
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
    var scopeNote = { 'motorman': ' · motormen', 'non-motorman': ' · excl. motormen', 'all': '' };
    document.querySelector('[data-foot-note]').textContent = boot.me.cli_id
      ? (boot.me.office_code || '') + (scopeNote[CliDerive.staffScopeFor(boot.me.office_code)] || '')
      : 'No CLI chosen yet';
    wire();

    // An account with its own CLI loads its own lobby straight away. HQ waits
    // until it has said whose session this is.
    if (!boot.me.cli_id) {
      document.querySelector('[data-list]').innerHTML =
        '<div class="state"><h3>Choose a CLI first</h3>' +
        '<p>Pick who did the counselling above, and their lobby\u2019s staff will load here.</p></div>';
      return;
    }
    return loadRoster(topic, document.getElementById('f-venue').value || undefined);
  }

  function loadRoster(topic, office) {
    document.querySelector('[data-list]').innerHTML =
      '<div class="state"><div class="spinner"></div>Loading staff\u2026</div>';
    var path = '/lobby-roster?topic=' + encodeURIComponent(topic) +
               (office ? '&office=' + encodeURIComponent(office) : '');
    return Cli.apiCached(path, 'lobby-roster:' + topic + ':' + (office || 'own')).then(function (d) {
      S.roster = d.staff;
      S.designations = d.designations || [];
      S.counts = d.counts || {};
      if (d._stale) {
        Cli.toast('Offline — this staff list was saved on ' +
          (d._cachedAt ? new Date(d._cachedAt).toLocaleDateString() : 'an earlier visit') +
          '. Anyone posted since will be missing.', 'warn');
      }
      if (qs.get('pending') === '1') {
        S.onlyPending = true;
        var op = document.querySelector('[data-only-pending]');
        if (op) op.classList.add('primary');
      }
      S.selected = {};
      paintList();
    }).catch(function (e) {
      document.querySelector('[data-list]').innerHTML =
        '<div class="state"><h3>No staff list</h3><p>' +
        (e.status ? CliShell.esc(e.message)
                  : 'This lobby has not been opened on this phone while online, so there is nothing saved to work from.') +
        '</p></div>';
    });
  }

  CliShell.init('session');
  Cli.boot(render);
}());
