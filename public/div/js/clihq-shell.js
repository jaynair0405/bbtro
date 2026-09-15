/* ===========================================================================
 * CLI (HQ) pages — the bit the three pages share and the SSE-HQ editor does not.
 *
 * Which desk (ML / DSL / SUB) a page works for comes from the account
 * (users.clihq_desk). A division admin whose account has no desk picks one,
 * and the choice rides on the URL as ?desk= so every page and every API call
 * on that page agree; the editor appends it to each request (CFG.apiQuery).
 * =========================================================================== */
(function (window, document) {
    'use strict';

    var params = new URLSearchParams(window.location.search);
    var DESK_PARAM = (params.get('desk') || '').toUpperCase();

    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* Keep ?desk= on the way to another CLI-HQ page so an admin is not asked
     * again on every page. Links carry data-keep-desk. */
    function carryDesk(desk) {
        if (!desk) return;
        document.querySelectorAll('a[data-keep-desk]').forEach(function (a) {
            var href = a.getAttribute('href');
            if (!href || href.charAt(0) === '#') return;
            a.setAttribute('href', href + (href.indexOf('?') < 0 ? '?' : '&') + 'desk=' + desk);
        });
    }

    /* The chooser: shown when the server says the account has no desk and
     * none was asked for. Reloads the page with ?desk= — the simplest thing
     * that makes the desk true for every call that follows. */
    function chooseDesk(desks) {
        var veil = document.createElement('div');
        veil.className = 'modal-veil open';
        veil.innerHTML = '<div class="modal"><h4>Which desk?</h4>' +
            '<p style="margin:0 0 12px;color:#93a5c4;font-size:13px">Your login is not tied to a CLI (HQ) desk. ' +
            'Choose the desk this note is written for.</p>' +
            '<div class="btns" style="justify-content:flex-start;flex-wrap:wrap">' +
            Object.keys(desks).map(function (k) {
                return '<button class="btn btn-amber" data-desk="' + esc(k) + '">' + esc(desks[k].label) + '</button>';
            }).join('') + '</div></div>';
        document.body.appendChild(veil);
        veil.querySelectorAll('[data-desk]').forEach(function (b) {
            b.onclick = function () {
                params.set('desk', b.dataset.desk);
                window.location.search = params.toString();
            };
        });
    }

    /* Called by each page with the /clihq/config payload. Returns the desk the
     * page is now working for (or null, in which case the chooser is up). */
    function applyConfig(cfg) {
        var desk = cfg.desk;
        var tag = document.getElementById('deskTag');
        if (!desk) { chooseDesk(cfg.desks || {}); return null; }
        var d = cfg.desks[desk];
        if (tag) tag.textContent = d ? d.label : desk;
        // Only an unbound admin needs the parameter carried along.
        if (!cfg.user.clihq_desk) carryDesk(desk);
        return desk;
    }

    window.ClihqShell = {
        deskParam: DESK_PARAM,
        apiQuery: DESK_PARAM ? 'desk=' + encodeURIComponent(DESK_PARAM) : '',
        applyConfig: applyConfig,
        esc: esc,
    };
}(window, document));
