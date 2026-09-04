/* HQ: who has a login, and the password reset.
 *
 * These accounts have no email or SMS behind them, so a forgotten password can
 * only be fixed by HQ issuing a new one and reading it out — the same way the
 * first one was distributed. The new password is shown ONCE and never stored in
 * the clear, and the CLI is forced to replace it at first use. */
(function () {
  'use strict';
  var esc = CliShell.esc;
  var S = { clis: [], q: '' };

  function row(c) {
    var status = c.has_login
      ? (c.must_change_password
          ? '<span class="tag warn">Not yet used</span>'
          : '<span class="tag ok">Active</span>')
      : '<span class="tag mute">No login</span>';
    return '<li>' +
      '<div class="who"><div class="nm">' + esc(c.cli_name) + '</div>' +
      '<div class="meta">' + esc(c.current_office_code || 'no lobby') +
        ' · ' + (c.has_login ? esc(c.username) : esc(c.cmsid || 'no CMS id')) +
        ' · ' + c.nominees + ' nominated' +
        (c.last_session ? ' · last session ' + esc(c.last_session) : ' · never counselled') +
      '</div></div>' + status +
      '<button class="btn sm" data-move="' + c.cli_id + '">Move</button>' +
      '<button class="btn sm" data-reset="' + c.cli_id + '">' +
        (c.has_login ? 'Reset' : 'Create') + '</button>' +
      '</li>';
  }

  function visible() {
    var q = S.q.trim().toLowerCase();
    if (!q) return S.clis;
    return S.clis.filter(function (c) {
      return (c.cli_name || '').toLowerCase().indexOf(q) >= 0 ||
             (c.current_office_code || '').toLowerCase().indexOf(q) >= 0 ||
             (c.username || c.cmsid || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  function paint() {
    var rows = visible();
    var noLogin = S.clis.filter(function (c) { return !c.has_login; }).length;
    var unused = S.clis.filter(function (c) { return c.has_login && c.must_change_password; }).length;
    document.querySelector('[data-summary]').innerHTML =
      '<span class="tag">' + S.clis.length + ' active CLIs</span> ' +
      '<span class="tag ok">' + (S.clis.length - noLogin) + ' with a login</span> ' +
      (unused ? '<span class="tag warn">' + unused + ' never signed in</span> ' : '') +
      (noLogin ? '<span class="tag mute">' + noLogin + ' without</span>' : '');
    document.querySelector('[data-list]').innerHTML =
      rows.length ? '<ul class="rows">' + rows.map(row).join('') + '</ul>'
                  : '<div class="state"><h3>No match</h3></div>';
  }

  function load() {
    return Cli.api('/cli-users').then(function (d) { S.clis = d.clis; paint(); });
  }

  /* The shortcut the HQ desks asked for: moving a CLI without going through
     Settings -> CLI Management -> find -> Edit -> office -> save. It posts to
     the same code that screen uses, so the posting is recorded and the login
     follows. */
  function move(cliId) {
    var c = S.clis.filter(function (x) { return String(x.cli_id) === String(cliId); })[0];
    if (!c) return;
    var offices = (Cli.boot_ && Cli.boot_.offices) || [];
    var host = document.querySelector('[data-issued]');
    host.innerHTML =
      '<div class="card-head"><h3>Move ' + esc(c.cli_name) + '</h3>' +
        '<div style="flex:1"></div><button class="btn sm" data-close>Cancel</button></div>' +
      '<div class="card-body">' +
        '<p style="color:var(--ink-3);font-size:13px;margin-bottom:12px">Currently at <strong>' +
          esc(c.current_office_code || 'no lobby') + '</strong>' +
          (c.nominees ? ' with ' + c.nominees + ' nominated staff' : '') + '.</p>' +
        '<div class="field"><label for="mv-office">Move to</label>' +
          '<select class="input" id="mv-office">' +
            offices.filter(function (o) { return o.office_code !== c.current_office_code; })
              .map(function (o) {
                return '<option value="' + esc(o.office_code) + '">' + esc(o.office_name) +
                       ' (' + esc(o.office_code) + ')</option>'; }).join('') +
          '</select></div>' +
        '<div class="field"><label for="mv-note">Remark</label>' +
          '<input class="input" id="mv-note" maxlength="200" placeholder="Optional \u2014 shown in the office history"></div>' +
        '<div class="banner info">Their nominated staff do <strong>not</strong> move. A nomination ' +
          'follows the staff member\u2019s own posting, so anyone left behind stays with this CLI ' +
          'until they are re-nominated.</div>' +
        '<button class="btn primary" data-move-go="' + c.cli_id + '">Move</button>' +
      '</div>';
    host.hidden = false;
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function doMove(cliId) {
    var office = document.getElementById('mv-office').value;
    var note = document.getElementById('mv-note').value;
    var btn = document.querySelector('[data-move-go]');
    btn.disabled = true; btn.textContent = 'Moving\u2026';
    Cli.post('/cli-users/' + cliId + '/transfer', { office_code: office, remarks: note })
      .then(function (r) {
        document.querySelector('[data-issued]').hidden = true;
        Cli.toast(r.message + (r.nominees ? ' ' + r.nominees + ' nominated staff stay with them.' : ''), 'info');
        load();
      })
      .catch(function (e) {
        btn.disabled = false; btn.textContent = 'Move';
        Cli.toast(e.message, 'alert');
      });
  }

  function reset(cliId) {
    var c = S.clis.filter(function (x) { return String(x.cli_id) === String(cliId); })[0];
    if (!c) return;
    var verb = c.has_login ? 'Reset the password for' : 'Create a login for';
    if (!confirm(verb + ' ' + c.cli_name + '?\n\nThe new password is shown once. Write it down before closing.')) return;

    Cli.api('/cli-users/' + cliId + '/reset-password', { method: 'POST' }).then(function (r) {
      // Shown once, deliberately not dismissable by a stray tap elsewhere.
      document.querySelector('[data-issued]').innerHTML =
        '<div class="card-head"><h3>' + esc(c.cli_name) + ' — new password</h3>' +
          '<div style="flex:1"></div><button class="btn sm" data-close>Done</button></div>' +
        '<div class="card-body">' +
          '<div class="banner warn">This is shown once. Write it down or read it out now — ' +
            'it cannot be recovered afterwards.</div>' +
          '<div class="cred"><span class="cred-k">Username</span>' +
            '<span class="cred-v">' + esc(r.username) + '</span></div>' +
          '<div class="cred"><span class="cred-k">Password</span>' +
            '<span class="cred-v">' + esc(r.password) + '</span></div>' +
          '<p style="margin-top:12px;color:var(--ink-3);font-size:13px">' +
            'They must change it the first time they sign in, and cannot record ' +
            'any counselling until they do.</p>' +
        '</div>';
      document.querySelector('[data-issued]').hidden = false;
      document.querySelector('[data-issued]').scrollIntoView({ behavior: 'smooth', block: 'center' });
      load();
    }).catch(function (e) { Cli.toast(e.message, 'alert'); });
  }

  function render() {
    var main = document.querySelector('[data-cli-main]');
    main.innerHTML =
      '<div class="card"><div class="card-body">' +
        '<div data-summary style="margin-bottom:12px"></div>' +
        '<input class="input" data-q placeholder="Search CLI name, lobby or username…">' +
      '</div></div>' +
      '<div class="card" data-issued hidden></div>' +
      '<div class="card"><div class="card-body tight" data-list></div></div>';

    var t = null;
    main.querySelector('[data-q]').addEventListener('input', function (e) {
      clearTimeout(t);
      var v = e.target.value;
      t = setTimeout(function () { S.q = v; paint(); }, 140);
    });
    main.addEventListener('click', function (e) {
      var b = e.target.closest('[data-reset]');
      if (b) return reset(b.dataset.reset);
      var m = e.target.closest('[data-move]');
      if (m) return move(m.dataset.move);
      var g = e.target.closest('[data-move-go]');
      if (g) return doMove(g.dataset.moveGo);
      if (e.target.matches('[data-close]')) document.querySelector('[data-issued]').hidden = true;
    });
    return load();
  }

  CliShell.init('accounts');
  Cli.boot(render);
}());
