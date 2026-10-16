/* ===========================================================================
 * Chief OS pages — what the dashboard, the case page and the letter page share.
 *
 * The letter page itself runs on SsehqEditor (ssehq-editor.js); this file is
 * for the two pages that are not an editor: fetch with the session, dates,
 * the toast, and a staff picker for the New-case form that behaves like the
 * editor's (staff master by default, "Search CLI master instead", "Not in
 * staff master" kept as typed).
 * =========================================================================== */
(function (window, document) {
    'use strict';
    var API = '/api/division/chiefos';

    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function fmtDate(v) {
        var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ''));
        return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
    }
    function api(path, options) {
        var opts = options || {};
        opts.credentials = 'same-origin';
        opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
        return fetch(API + path, opts).then(function (res) {
            if (res.status === 401) { window.location = '/'; throw new Error('Session expired'); }
            return res.text().then(function (text) {
                var body;
                try { body = JSON.parse(text); } catch (e) { body = { error: text.slice(0, 200) }; }
                if (!res.ok) throw new Error(body.error || ('Request failed (' + res.status + ')'));
                return body;
            });
        });
    }
    var toastTimer = null;
    function toast(message, kind) {
        var el = document.getElementById('toast');
        if (!el) return;
        el.textContent = message;
        el.className = 'toast show' + (kind ? ' ' + kind : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.className = 'toast'; }, 4200);
    }
    function fail(e) { toast(e && e.message ? e.message : String(e), 'err'); }

    /* Staff picker for a plain input. onPick(staffRow | null-for-temporary). */
    function staffPicker(input, drop, onPick) {
        var timer = null, cli = false;
        function row(s) {
            return '<div class="opt" data-i><b>' + esc(s.name) + '</b><small>' +
                esc([s.hrms_id, s.designation_name, s.current_office_code, s.pf_number ? 'PF ' + s.pf_number : '']
                    .filter(Boolean).join(' · ')) + '</small></div>';
        }
        function search() {
            var q = input.value.trim();
            api((cli ? '/search-cli/' : '/search-staff/') + encodeURIComponent(q)).then(function (d) {
                var rows = d.staff || [];
                drop.innerHTML = (rows.length ? rows.map(row).join('')
                        : '<div class="empty">No match in the ' + (cli ? 'CLI' : 'staff') + ' master</div>') +
                    '<div class="opt swap"><b>' + (cli ? 'Search staff master instead' : 'Search CLI master instead') + '</b>' +
                    '<span class="sub">' + (cli ? 'back to running staff' : 'CLIs are kept in their own master') + '</span></div>' +
                    '<div class="opt tmp"><b>Not in staff master</b><span class="sub">keep the name as typed — marked temporary</span></div>';
                drop.querySelectorAll('.opt[data-i]').forEach(function (el, i) {
                    el.onclick = function () { onPick(rows[i]); drop.classList.remove('open'); };
                });
                drop.querySelector('.opt.swap').onclick = function () { cli = !cli; search(); };
                drop.querySelector('.opt.tmp').onclick = function () { onPick(null); drop.classList.remove('open'); };
                drop.classList.add('open');
            }).catch(fail);
        }
        input.addEventListener('input', function () {
            clearTimeout(timer);
            cli = false;
            onPick(undefined);   // typed: no longer linked
            if (input.value.trim().length < 3) { drop.classList.remove('open'); return; }
            timer = setTimeout(search, 250);
        });
        drop.addEventListener('mousedown', function (e) { e.preventDefault(); });
        input.addEventListener('blur', function () { setTimeout(function () { drop.classList.remove('open'); }, 180); });
    }

    /* The desk's badge for a form code, same colours everywhere. */
    function formPill(code, status) {
        return '<span class="pill ' + (status === 'final' ? 'green' : 'grey') + '">' + esc(code) + (status === 'final' ? '' : ' draft') + '</span>';
    }

    window.ChiefOs = { api: api, esc: esc, fmtDate: fmtDate, toast: toast, fail: fail, staffPicker: staffPicker, formPill: formPill, API: API };
}(window, document));
