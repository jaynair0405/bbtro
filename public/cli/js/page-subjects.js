/* ============================================================================
 * HQ: the subjects counselling can be recorded against.
 *
 * These used to be a hardcoded array in counsellingRoutes.js, so a new circular
 * type meant a code change and a deploy. HQ asked what happens when a new
 * subject comes along; this is the answer.
 *
 * Subjects are NOT topics. A topic carries the cycle that decides who is due;
 * a subject is what was talked about. Adding "Monsoon Precautions Circular"
 * gives CLIs something to tick, and does not create a second thing everyone is
 * suddenly overdue on.
 * ==========================================================================*/
(function () {
  'use strict';
  var esc = CliShell.esc;
  var S = { subjects: [] };

  function row(x) {
    return '<li>' +
      '<div class="who">' +
        '<div class="nm">' + esc(x.subject_name) +
          (x.needs_number ? ' <span class="tag">number required</span>' : '') +
          (x.is_active ? '' : ' <span class="tag mute">retired</span>') + '</div>' +
        '<div class="meta">' + esc(x.subject_code) + ' · ' + esc(x.topic_name) +
          ' · used in ' + x.times_used + ' session' + (x.times_used === 1 ? '' : 's') + '</div>' +
      '</div>' +
      '<button class="btn sm" data-edit="' + x.subject_id + '">Edit</button>' +
      '<button class="btn sm' + (x.is_active ? ' danger' : '') + '" data-toggle="' + x.subject_id + '">' +
        (x.is_active ? 'Retire' : 'Restore') + '</button>' +
      '</li>';
  }

  function paint() {
    var live = S.subjects.filter(function (x) { return x.is_active; }).length;
    document.querySelector('[data-summary]').innerHTML =
      '<span class="tag ok">' + live + ' in use</span> ' +
      (S.subjects.length - live ? '<span class="tag mute">' + (S.subjects.length - live) + ' retired</span>' : '');
    document.querySelector('[data-list]').innerHTML =
      '<ul class="rows">' + S.subjects.map(row).join('') + '</ul>';
  }

  function load() {
    return Cli.api('/subjects').then(function (d) { S.subjects = d.subjects; paint(); });
  }

  function edit(id) {
    var x = S.subjects.filter(function (y) { return String(y.subject_id) === String(id); })[0];
    if (!x) return;
    var host = document.querySelector('[data-issued]');
    host.innerHTML =
      '<div class="card-head"><h3>Edit subject</h3><div style="flex:1"></div>' +
        '<button class="btn sm" data-close>Cancel</button></div>' +
      '<div class="card-body">' +
        '<div class="field"><label for="s-name">Name</label>' +
          '<input class="input" id="s-name" maxlength="150" value="' + esc(x.subject_name) + '"></div>' +
        '<label class="check" style="border:1px solid var(--line);border-radius:10px">' +
          '<input type="checkbox" id="s-num"' + (x.needs_number ? ' checked' : '') + '>' +
          '<span class="who"><span class="nm">Needs an instruction or circular number</span>' +
          '<span class="meta">The CLI must type it, and it is shown as “Name-14” on the sheet.</span></span>' +
        '</label>' +
        '<button class="btn primary" style="margin-top:14px" data-save="' + x.subject_id + '">Save</button>' +
      '</div>';
    host.hidden = false;
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function render() {
    var main = document.querySelector('[data-cli-main]');
    main.innerHTML =
      '<div class="card"><div class="card-body">' +
        '<div data-summary style="margin-bottom:14px"></div>' +
        '<div class="field"><label for="n-name">Add a subject</label>' +
          '<input class="input" id="n-name" maxlength="150" placeholder="e.g. Monsoon Precautions Circular"></div>' +
        '<label class="check" style="border:1px solid var(--line);border-radius:10px">' +
          '<input type="checkbox" id="n-num">' +
          '<span class="who"><span class="nm">Needs an instruction or circular number</span>' +
          '<span class="meta">Tick for anything numbered, like an instruction or a circular.</span></span>' +
        '</label>' +
        '<button class="btn primary" style="margin-top:14px" data-add>Add</button>' +
      '</div></div>' +
      '<div class="card" data-issued hidden></div>' +
      '<div class="card"><div class="card-body tight" data-list></div></div>' +
      '<p style="color:var(--ink-3);font-size:12px;margin-top:12px">' +
        'Retiring a subject hides it from the entry form. Sessions already recorded ' +
        'against it keep naming it, so nothing in the history changes.</p>';

    main.addEventListener('click', function (e) {
      if (e.target.matches('[data-close]')) { document.querySelector('[data-issued]').hidden = true; return; }
      if (e.target.matches('[data-add]')) {
        var name = document.getElementById('n-name').value.trim();
        if (!name) return Cli.toast('Give the subject a name.', 'alert');
        return Cli.post('/subjects', { subject_name: name, needs_number: document.getElementById('n-num').checked })
          .then(function () {
            document.getElementById('n-name').value = '';
            document.getElementById('n-num').checked = false;
            Cli.toast('Added. It is on every CLI’s form now.', 'info');
            load();
          }).catch(function (err) { Cli.toast(err.message, 'alert'); });
      }
      var ed = e.target.closest('[data-edit]');
      if (ed) return edit(ed.dataset.edit);
      var sv = e.target.closest('[data-save]');
      if (sv) {
        return Cli.api('/subjects/' + sv.dataset.save, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject_name: document.getElementById('s-name').value.trim(),
            needs_number: document.getElementById('s-num').checked,
          })
        }).then(function () {
          document.querySelector('[data-issued]').hidden = true;
          Cli.toast('Saved.', 'info'); load();
        }).catch(function (err) { Cli.toast(err.message, 'alert'); });
      }
      var tg = e.target.closest('[data-toggle]');
      if (tg) {
        var x = S.subjects.filter(function (y) { return String(y.subject_id) === tg.dataset.toggle; })[0];
        return Cli.api('/subjects/' + tg.dataset.toggle, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !x.is_active })
        }).then(load).catch(function (err) { Cli.toast(err.message, 'alert'); });
      }
    });
    return load();
  }

  CliShell.init('subjects');
  Cli.boot(render);
}());
