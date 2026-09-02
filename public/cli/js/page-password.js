/* Change password. Also the forced first stop for a bulk-generated account —
   see the must_change_password gate in cli-data.js and counsellingRoutes.js. */
(function () {
  'use strict';
  var esc = CliShell.esc;

  function render(boot) {
    var forced = !!boot.me.must_change_password;
    document.querySelector('[data-cli-main]').innerHTML =
      (forced
        ? '<div class="banner warn"><div><strong>Set your own password before you start.</strong><br>' +
          'You are signed in with the password HQ issued you. Until you replace it, ' +
          'you can look around but not record any counselling.</div></div>'
        : '') +
      '<div class="card"><div class="card-body">' +
        '<div class="field"><label for="p-cur">Current password</label>' +
          '<input class="input" type="password" id="p-cur" autocomplete="current-password"></div>' +
        '<div class="field"><label for="p-new">New password</label>' +
          '<input class="input" type="password" id="p-new" autocomplete="new-password">' +
          '<div class="hint">At least 8 characters, and different from the current one.</div></div>' +
        '<div class="field" style="margin-bottom:0"><label for="p-c">Confirm new password</label>' +
          '<input class="input" type="password" id="p-c" autocomplete="new-password"></div>' +
      '</div>' +
      '<div class="sticky-foot">' +
        '<div style="flex:1;font-size:13px;color:var(--ink-3)">' + esc(boot.me.username) + '</div>' +
        '<button class="btn primary" data-save>Change password</button>' +
      '</div></div>';

    document.querySelector('[data-save]').addEventListener('click', function () {
      var cur = document.getElementById('p-cur').value;
      var nw = document.getElementById('p-new').value;
      var cf = document.getElementById('p-c').value;
      if (!cur || !nw || !cf) return Cli.toast('Fill in all three boxes.', 'alert');
      if (nw !== cf) return Cli.toast('The two new passwords do not match.', 'alert');
      if (nw.length < 8) return Cli.toast('The new password must be at least 8 characters.', 'alert');
      if (nw === cur) return Cli.toast('The new password must be different from the current one.', 'alert');

      var btn = this;
      btn.disabled = true; btn.textContent = 'Changing…';
      // The shared endpoint the rest of the portal uses; it also clears
      // must_change_password, which is what releases the write lock.
      fetch('/api/change-password', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: cur, newPassword: nw, confirmPassword: cf })
      }).then(function (r) { return r.json(); }).then(function (b) {
        if (!b.success) throw new Error(b.message || 'Could not change the password');
        Cli.toast('Password changed. You can record counselling now.', 'info');
        setTimeout(function () { location.href = '/cli/index.html'; }, 1200);
      }).catch(function (e) {
        btn.disabled = false; btn.textContent = 'Change password';
        Cli.toast(e.message, 'alert');
      });
    });
  }

  CliShell.init('password');
  Cli.boot(render);
}());
