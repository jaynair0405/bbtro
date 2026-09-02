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
      if (e.target.matches('[data-close]')) document.querySelector('[data-issued]').hidden = true;
    });
    return load();
  }

  CliShell.init('accounts');
  Cli.boot(render);
}());
