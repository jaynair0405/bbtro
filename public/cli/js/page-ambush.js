/* ============================================================================
 * Ambush Check — the CLI's daily return.
 *
 * A tally, not a register: how many staff were checked against each subject.
 * Names appear only in the second half, where someone was caught.
 *
 * The form always opens on TODAY'S RETURN if one exists, because a CLI who
 * checked twenty in the morning and fifteen in the evening should end the day
 * with one return saying thirty-five, not two returns to reconcile.
 * ==========================================================================*/
(function () {
  'use strict';
  var esc = CliShell.esc;
  var S = { subjects: [], counts: {}, caught: [], date: null, line: null, roster: [], pickFor: null };

  function subjectName(id) {
    var s = S.subjects.filter(function (x) { return x.subject_id === Number(id); })[0];
    return s ? s.subject_name : '';
  }

  function countRow(s) {
    var v = S.counts[s.subject_id];
    return '<label class="check count-row" data-subj="' + s.subject_id + '">' +
      '<span class="who"><span class="nm">' + esc(s.subject_name) + '</span></span>' +
      '<input class="input cnt" type="number" inputmode="numeric" min="0" max="9999" ' +
        'value="' + (v == null ? '' : v) + '" placeholder="0" data-count="' + s.subject_id + '">' +
      '</label>';
  }

  function caughtRow(c, i) {
    return '<li>' +
      '<div class="who"><div class="nm">' + esc(c.name) + '</div>' +
      '<div class="meta">' + esc(c.current_cms_id || c.hrms_id) + ' · ' + esc(c.designation_code) +
        ' · <strong>' + esc(subjectName(c.subject_id)) + '</strong></div>' +
      '<input class="input viol-remark" maxlength="500" placeholder="What was found" ' +
        'value="' + esc(c.remarks || '') + '" data-remark="' + i + '"></div>' +
      '<button class="btn sm danger" data-drop="' + i + '">Remove</button>' +
      '</li>';
  }

  function paintCaught() {
    document.querySelector('[data-caught]').innerHTML =
      S.caught.length
        ? '<ul class="rows">' + S.caught.map(caughtRow).join('') + '</ul>'
        : '<div class="state" style="padding:22px"><p>Nobody recorded. ' +
          'Add someone only if a check found a fault.</p></div>';
  }

  function totalChecked() {
    return Object.keys(S.counts).reduce(function (a, k) { return a + (Number(S.counts[k]) || 0); }, 0);
  }
  function paintTotal() {
    document.querySelector('[data-total]').textContent =
      totalChecked() + ' checked' + (S.caught.length ? ' · ' + S.caught.length + ' caught' : '');
  }

  function render(boot) {
    var main = document.querySelector('[data-cli-main]');
    S.date = boot.today;

    return Cli.api('/ambush/bootstrap').then(function (b) {
      S.subjects = b.subjects;
      S.line = b.line;
      main.innerHTML =
        '<div class="card"><div class="card-body">' +
          '<div class="grid-2">' +
            '<div class="field"><label for="a-date">Date</label>' +
              '<input class="input" type="date" id="a-date" max="' + boot.today + '" value="' + boot.today + '"></div>' +
            '<div class="field"><label>Line</label>' +
              '<input class="input" value="' + esc(b.line || '—') + '" disabled>' +
              '<div class="hint">From your lobby. Suburban CLIs check motormen, mainline CLIs do not.</div></div>' +
          '</div>' +
        '</div></div>' +

        '<div class="card">' +
          '<div class="card-head"><h3>Staff checked</h3><div style="flex:1"></div>' +
            '<span class="tag" data-total>0 checked</span></div>' +
          '<div class="card-body" style="padding-bottom:6px">' +
            '<div class="hint">How many staff you checked against each. Leave blank for none.</div></div>' +
          '<div data-counts></div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head"><h3>Anyone caught</h3><div style="flex:1"></div>' +
            '<button class="btn sm" data-add-caught>Add</button></div>' +
          '<div data-caught></div>' +
        '</div>' +

        '<div class="card"><div class="card-body">' +
          '<div class="field" style="margin:0"><label for="a-remarks">Remarks</label>' +
            '<textarea class="input" id="a-remarks" maxlength="2000" ' +
              'placeholder="Anything about the day’s checks the officers should see."></textarea></div>' +
        '</div></div>' +

        '<div class="card" data-picker hidden></div>' +

        '<div class="sticky-foot">' +
          '<div style="flex:1;font-size:13px;color:var(--ink-3)" data-foot></div>' +
          '<button class="btn primary" data-save>Save return</button>' +
        '</div>';

      document.querySelector('[data-counts]').innerHTML = S.subjects.map(countRow).join('');
      document.querySelector('[data-foot]').textContent = (boot.me.office_code || '') + ' · ' + (b.line || '');
      wire();
      return loadDay(boot.today);
    });
  }

  /* Opening on the existing return is the whole point of the one-per-day key:
     the CLI adds to the morning's figures rather than starting again. */
  function loadDay(date) {
    return Cli.api('/ambush/return?date=' + encodeURIComponent(date)).then(function (d) {
      S.counts = {};
      Object.keys(d.counts || {}).forEach(function (k) { S.counts[k] = d.counts[k]; });
      S.caught = (d.violations || []).map(function (v) {
        return { subject_id: v.subject_id, hrms_id: v.staff_hrms_id, name: v.name,
                 current_cms_id: v.current_cms_id, designation_code: v.designation_code,
                 remarks: v.remarks };
      });
      document.getElementById('a-remarks').value = d.remarks || '';
      S.subjects.forEach(function (s) {
        var el = document.querySelector('[data-count="' + s.subject_id + '"]');
        if (el) el.value = S.counts[s.subject_id] == null ? '' : S.counts[s.subject_id];
      });
      paintCaught(); paintTotal();
      if (d.return_id) {
        Cli.toast('You already filed for this date — these are your figures so far. ' +
          'Change them and save again.', 'info');
      }
    });
  }

  function openPicker() {
    var host = document.querySelector('[data-picker]');
    host.hidden = false;
    host.innerHTML = '<div class="card-head"><h3>Who was caught?</h3><div style="flex:1"></div>' +
      '<button class="btn sm" data-close-pick>Cancel</button></div>' +
      '<div class="card-body">' +
        '<div class="field"><label for="p-subj">Against which check</label>' +
          '<select class="input" id="p-subj">' +
            S.subjects.map(function (s) {
              return '<option value="' + s.subject_id + '">' + esc(s.subject_name) + '</option>';
            }).join('') + '</select></div>' +
        '<input class="input" data-pq placeholder="Search name or CMS id…">' +
      '</div><div data-plist></div>';
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (S.roster.length) return paintPicker();
    document.querySelector('[data-plist]').innerHTML =
      '<div class="state"><div class="spinner"></div>Loading staff…</div>';
    Cli.apiCached('/lobby-roster', 'ambush-roster').then(function (d) {
      S.roster = d.staff; paintPicker();
    }).catch(function () {
      document.querySelector('[data-plist]').innerHTML =
        '<div class="state"><h3>No staff list</h3><p>Open this page online once and the list is kept.</p></div>';
    });
  }

  function paintPicker() {
    var q = (document.querySelector('[data-pq]') || {}).value || '';
    q = q.trim().toLowerCase();
    var rows = S.roster.filter(function (r) {
      if (!q) return true;
      return (r.name || '').toLowerCase().indexOf(q) >= 0 ||
             (r.current_cms_id || '').toLowerCase().indexOf(q) >= 0;
    }).slice(0, 200);
    document.querySelector('[data-plist]').innerHTML = rows.length
      ? '<ul class="rows">' + rows.map(function (r) {
          return '<li data-pick="' + esc(r.hrms_id) + '" style="cursor:pointer">' +
            '<div class="who"><div class="nm">' + esc(r.name) + '</div>' +
            '<div class="meta">' + esc(r.current_cms_id || r.hrms_id) + ' · ' +
            esc(r.designation_code) + ' · ' + esc(r.current_office_code) + '</div></div></li>';
        }).join('') + '</ul>'
      : '<div class="state"><h3>No match</h3></div>';
  }

  function wire() {
    var main = document.querySelector('[data-cli-main]');
    main.addEventListener('input', function (e) {
      if (e.target.matches('[data-count]')) {
        var id = e.target.dataset.count;
        var v = e.target.value.trim();
        if (v === '') delete S.counts[id]; else S.counts[id] = Number(v);
        paintTotal();
      }
      if (e.target.matches('[data-remark]')) {
        S.caught[Number(e.target.dataset.remark)].remarks = e.target.value;
      }
      if (e.target.matches('[data-pq]')) paintPicker();
    });
    main.addEventListener('change', function (e) {
      if (e.target.id === 'a-date') { S.date = e.target.value; loadDay(S.date); }
    });
    main.addEventListener('click', function (e) {
      if (e.target.matches('[data-add-caught]')) return openPicker();
      if (e.target.matches('[data-close-pick]')) { document.querySelector('[data-picker]').hidden = true; return; }
      var drop = e.target.closest('[data-drop]');
      if (drop) { S.caught.splice(Number(drop.dataset.drop), 1); paintCaught(); paintTotal(); return; }
      var pick = e.target.closest('[data-pick]');
      if (pick) {
        var r = S.roster.filter(function (x) { return x.hrms_id === pick.dataset.pick; })[0];
        var sid = Number(document.getElementById('p-subj').value);
        // The same person can be caught on two different subjects, but not
        // twice on the same one -- the table's unique key says so too.
        if (S.caught.some(function (c) { return c.hrms_id === r.hrms_id && c.subject_id === sid; })) {
          return Cli.toast(r.name + ' is already recorded against ' + subjectName(sid) + '.', 'alert');
        }
        S.caught.push({ subject_id: sid, hrms_id: r.hrms_id, name: r.name,
                        current_cms_id: r.current_cms_id, designation_code: r.designation_code, remarks: '' });
        document.querySelector('[data-picker]').hidden = true;
        paintCaught(); paintTotal();
        return;
      }
      if (e.target.matches('[data-save]')) return save(e.target);
    });
  }

  function save(btn) {
    if (!totalChecked() && !S.caught.length) {
      return Cli.toast('Enter how many you checked, or record someone caught.', 'alert');
    }
    var missing = S.caught.filter(function (c) { return !(c.remarks || '').trim(); });
    if (missing.length) {
      return Cli.toast('Say what was found for ' + missing[0].name + '.', 'alert');
    }
    btn.disabled = true; btn.textContent = 'Saving…';
    Cli.post('/ambush/return', {
      date: document.getElementById('a-date').value,
      counts: S.counts,
      remarks: document.getElementById('a-remarks').value,
      violations: S.caught.map(function (c) {
        return { subject_id: c.subject_id, hrms_id: c.hrms_id, remarks: c.remarks };
      }),
      client_uuid: Cli.uuid(),
    }).then(function (r) {
      btn.disabled = false; btn.textContent = 'Save return';
      Cli.toast('Saved. ' + r.total + ' checked' +
        (r.violations ? ', ' + r.violations + ' caught' : '') + '.', 'info');
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = 'Save return';
      Cli.toast(e.status ? e.message
        : 'No network. Ambush returns are not queued — try again when you are back online.', 'alert');
    });
  }

  document.body.classList.add('has-actionbar');
  CliShell.init('ambush');
  Cli.boot(render);
}());
