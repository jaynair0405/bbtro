/* ===========================================================================
 * Control Office — send the back link home
 *
 * Every page here has a back link to /control-office/, which is right for the
 * roles whose home that is (ctlc, ctlc_view, lpc, division_admin). It is wrong
 * for SSE-HQ: that desk reaches these reports from its own dashboard, and
 * "back" was dropping it into the Control Office portal, from which it had to
 * find the SSE-HQ card to get home again — on every single report.
 *
 * Loaded by every control-office page, so a report added later inherits the
 * behaviour by including the script rather than by anyone remembering this.
 * Roles other than ssehq are left completely untouched.
 * =========================================================================== */
(function () {
    'use strict';

    var HOMES = {
        // div_role -> where "back" should actually go
        ssehq: { href: '/div/ssehq.html', label: '← SSE-HQ' },
    };

    fetch('/api/division/loco-link/me', { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (me) {
            var home = me && HOMES[me.div_role];
            if (!home) return;

            var links = document.querySelectorAll(
                'a[href="/control-office/"], a[href="/control-office"], a[href="/control-office/index.html"]'
            );
            Array.prototype.forEach.call(links, function (a) {
                a.setAttribute('href', home.href);
                a.setAttribute('title', 'Back to the SSE-HQ dashboard');
                // Relabel only where the text is the label itself. Icon-only
                // back arrows keep their icon; replacing their contents would
                // wipe the <i> and leave a bare word in a round button.
                var text = (a.textContent || '').trim();
                if (!text || a.querySelector('img, svg')) return;
                if (a.querySelector('i')) {
                    // icon + text: keep the icon, retitle the words after it
                    Array.prototype.forEach.call(a.childNodes, function (n) {
                        if (n.nodeType === 3 && n.textContent.trim()) n.textContent = ' SSE-HQ';
                    });
                } else {
                    a.textContent = home.label;
                }
            });
        })
        .catch(function () { /* navigation courtesy only; never block the page */ });
}());
