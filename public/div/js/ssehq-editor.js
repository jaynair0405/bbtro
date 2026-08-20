/* ===========================================================================
 * SSE-HQ report editor — shared runtime
 *
 * Drives both ssehq-opr.html and ssehq-note.html. Each page declares WHAT it
 * holds (a field list, its panels, its renderer) and this file supplies the
 * behaviour: load, live preview, save, file, reopen, delete, print, Word,
 * history drawer, staff and loco pickers, and the chronology grid.
 *
 * Written once and shared for the reason the module needed rebuilding at all:
 * the page it replaces carried its whole runtime minified onto four lines
 * inside the HTML, where a single failure took every button on the page down
 * with it and there was no way to see which. Here a handler that throws
 * reports itself in a toast and the rest keep working.
 *
 * A page boots by calling:
 *   SsehqEditor.init({
 *     kind:     'opr' | 'note',
 *     api:      '/api/division/ssehq/opr',
 *     label:    'OPR',
 *     fields:   ['report_no', 'report_date', ...],   // form field names
 *     dateCol:  'report_date',
 *     numberCol:'report_no',
 *     render:   (record, events) => html,            // from ssehq-report-render.js
 *   });
 * =========================================================================== */
(function (window, document) {
    'use strict';

    var CFG = null;         // page configuration, from init()
    var USER = null;        // { username, is_admin, ... }
    var RECORD_ID = null;   // null while the report has never been saved
    var STATUS = 'draft';
    var DOCUMENT_ID = null;
    var EVENTS = [];        // [{ event_time, description }]
    var DIRTY = false;

    var $ = function (id) { return document.getElementById(id); };

    // ── Server ──────────────────────────────────────────────────────────────
    // Every call goes through here so a dropped session lands on the login page
    // instead of silently failing behind a button that then looks broken.
    function api(path, options) {
        var opts = options || {};
        opts.credentials = 'same-origin';
        opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
        return fetch(path, opts).then(function (res) {
            if (res.status === 401) { window.location = '/'; throw new Error('Session expired'); }
            return res.text().then(function (text) {
                var body;
                try { body = JSON.parse(text); } catch (e) { body = { error: text.slice(0, 200) }; }
                if (!res.ok) throw new Error(body.error || ('Request failed (' + res.status + ')'));
                return body;
            });
        });
    }

    // ── Toast / modal ───────────────────────────────────────────────────────
    var toastTimer = null;
    function toast(message, kind) {
        var el = $('toast');
        el.textContent = message;
        el.className = 'toast show' + (kind ? ' ' + kind : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.className = 'toast'; }, 4200);
    }
    function fail(err) { toast(err && err.message ? err.message : String(err), 'err'); }

    var modalOk = null;
    function confirmModal(title, body, okLabel, okClass, onOk) {
        $('mTitle').textContent = title;
        $('mBody').innerHTML = body;
        var ok = $('mOk');
        ok.textContent = okLabel;
        ok.className = 'btn ' + (okClass || 'btn-amber');
        modalOk = onOk;
        $('modalVeil').classList.add('open');
    }
    function closeModal() { $('modalVeil').classList.remove('open'); modalOk = null; }

    // ── Form <-> record ─────────────────────────────────────────────────────
    function readForm() {
        var out = {};
        CFG.fields.forEach(function (name) {
            var el = document.querySelector('[name="' + name + '"]');
            out[name] = el && el.value !== '' ? el.value : null;
        });
        return out;
    }
    function writeForm(record) {
        CFG.fields.forEach(function (name) {
            var el = document.querySelector('[name="' + name + '"]');
            if (el) el.value = (record && record[name] != null) ? record[name] : '';
        });
    }
    function clearForm() {
        CFG.fields.forEach(function (name) {
            var el = document.querySelector('[name="' + name + '"]');
            if (el) el.value = el.dataset.default || '';
        });
        /* The forwarding chain is the same three officers on every note, so a
         * blank box is pure retyping. It comes from the server rather than the
         * markup because the renderer holds the canonical list — the note
         * arriving prefilled from an OPR already carried it, and a note
         * started from scratch should not be the odd one out. */
        if (CFG.forwardingField && CFG.forwardingDefault) {
            var fwd = document.querySelector('[name="' + CFG.forwardingField + '"]');
            if (fwd && !fwd.value) fwd.value = CFG.forwardingDefault;
        }
    }

    // ── Live preview ────────────────────────────────────────────────────────
    // Re-rendered on every keystroke from the SAME function the server uses to
    // file the report, so what is on screen is what gets archived.
    function render() {
        try {
            $('sheet').innerHTML = CFG.render(readForm(), EVENTS, { placeholders: true });
        } catch (e) {
            console.error('preview render failed', e);
            $('sheet').innerHTML = '<div class="bootfail"><h3>Preview failed</h3>' +
                '<div class="why">' + String(e.message || e) + '</div></div>';
        }
    }
    function touched() { DIRTY = true; render(); }

    // ── Chronology grid ─────────────────────────────────────────────────────
    function renderEvents() {
        var body = $('evRows');
        if (!EVENTS.length) {
            body.innerHTML = '<tr><td colspan="4"><div class="noev">No events yet — ' +
                'add the first one below.</div></td></tr>';
        } else {
            body.innerHTML = EVENTS.map(function (e, i) {
                return '<tr>' +
                    '<td class="srcell">' + (i + 1) + '</td>' +
                    '<td class="tcell"><input data-i="' + i + '" data-k="event_time" ' +
                        'placeholder="22:01" value="' + escapeAttr(e.event_time) + '"></td>' +
                    '<td><textarea data-i="' + i + '" data-k="description" rows="1" ' +
                        'placeholder="Event description">' + escapeText(e.description) + '</textarea></td>' +
                    '<td class="act">' +
                        '<button type="button" class="rowbtn" data-up="' + i + '" title="Move up">&#9650;</button>' +
                        '<button type="button" class="rowbtn rm" data-rm="' + i + '" title="Remove">&times;</button>' +
                    '</td></tr>';
            }).join('');
        }
        body.querySelectorAll('[data-k]').forEach(function (el) {
            el.oninput = function () {
                EVENTS[Number(el.dataset.i)][el.dataset.k] = el.value;
                DIRTY = true; render();
            };
        });
        body.querySelectorAll('[data-rm]').forEach(function (el) {
            el.onclick = function () {
                EVENTS.splice(Number(el.dataset.rm), 1);
                DIRTY = true; renderEvents(); render();
            };
        });
        body.querySelectorAll('[data-up]').forEach(function (el) {
            el.onclick = function () {
                var i = Number(el.dataset.up);
                if (i === 0) return;
                var moved = EVENTS.splice(i, 1)[0];
                EVENTS.splice(i - 1, 0, moved);
                DIRTY = true; renderEvents(); render();
            };
        });
        $('evCount').textContent = EVENTS.length ? EVENTS.length + ' event' + (EVENTS.length === 1 ? '' : 's') : '';
    }
    function addEvent() {
        EVENTS.push({ event_time: '', description: '' });
        DIRTY = true; renderEvents(); render();
        var inputs = $('evRows').querySelectorAll('[data-k="event_time"]');
        if (inputs.length) inputs[inputs.length - 1].focus();
    }
    function escapeAttr(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function escapeText(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Pickers ─────────────────────────────────────────────────────────────
    /* Free text is always allowed. A loco pilot who is not on the division's
     * roll, or a loco not yet in div_locos, still has to appear on the report —
     * the picker is a convenience, never a gate. */
    function attachPicker(input, drop, url, rowHtml, onPick) {
        var timer = null;
        input.addEventListener('input', function () {
            clearTimeout(timer);
            DIRTY = true; render();
            if (input.value.trim().length < 3) { drop.classList.remove('open'); return; }
            timer = setTimeout(function () {
                api(url + encodeURIComponent(input.value.trim())).then(function (data) {
                    var rows = data.staff || data.locos || [];
                    if (!rows.length) {
                        drop.innerHTML = '<div class="empty">No match — type it in freely</div>';
                    } else {
                        drop.innerHTML = rows.map(function (r, i) {
                            return '<div class="opt" data-i="' + i + '">' + rowHtml(r) + '</div>';
                        }).join('');
                        drop.querySelectorAll('.opt').forEach(function (el) {
                            el.onclick = function () {
                                onPick(rows[Number(el.dataset.i)]);
                                drop.classList.remove('open');
                                DIRTY = true; render();
                            };
                        });
                    }
                    drop.classList.add('open');
                }).catch(fail);
            }, 250);
        });
        input.addEventListener('blur', function () {
            setTimeout(function () { drop.classList.remove('open'); }, 180);
        });
    }

    function markDerived(el, value) {
        if (!el) return;
        el.value = value || '';
        el.classList.toggle('derived', !!value);
    }

    /* What the loco master can and cannot fill in.
     *
     * commission_date is populated for every loco, so DOC fills reliably —
     * that is the field the desk was retyping off a printout.
     *
     * The Schedule row is harder. The proforma wants the LAST major schedule.
     * div_locos.last_sched_type/date is populated for no loco at all, and the
     * only schedule column carrying data is schedule_due_date — a DUE date
     * the LPC enters, which for 178 of the 305 locos that have one is already
     * in the past. A due date that has passed is the schedule the loco has by
     * now had, so it is filled in as the Major schedule and marked derived;
     * one still ahead is not, because it has not happened yet. Either way the
     * box stays editable and the note says which case this loco is, so the
     * desk can correct it against the shed record. */
    function isPast(iso) {
        if (!iso) return false;
        return String(iso).slice(0, 10) < new Date().toISOString().slice(0, 10);
    }

    function applyLoco(loco) {
        if (!loco) return;
        markDerived(document.querySelector('[name="loco_type"]'), loco.loco_type);
        markDerived(document.querySelector('[name="loco_base"]'), loco.home_shed);
        markDerived(document.querySelector('[name="loco_commission_date"]'), loco.commission_date);

        var schedType = document.querySelector('[name="last_schedule_type"]');
        var schedDate = document.querySelector('[name="last_schedule_date"]');
        var flag = $('dueFlag');
        var bits = [];

        if (loco.last_sched_type || loco.last_sched_date) {
            // The column that actually means "last done". Empty across the
            // whole master today, but if it is ever backfilled it wins.
            markDerived(schedType, loco.last_sched_type);
            markDerived(schedDate, loco.last_sched_date);
            bits.push('Major schedule filled from the loco master&rsquo;s <b>last schedule</b> record.');
        } else if (isPast(loco.schedule_due_date)) {
            markDerived(schedType, loco.schedule_type);
            markDerived(schedDate, loco.schedule_due_date);
            bits.push('Major schedule filled from the loco master: <b>' +
                escapeText([loco.schedule_type, loco.schedule_due_date].filter(Boolean).join(' ')) +
                '</b> was due and that date has passed. Correct it if the shed record differs.');
        } else if (loco.schedule_due_date || loco.schedule_type) {
            markDerived(schedType, '');
            markDerived(schedDate, '');
            bits.push('The loco master shows <b>' +
                escapeText([loco.schedule_type, loco.schedule_due_date].filter(Boolean).join(' ')) +
                '</b> still <b>due</b> — it has not happened yet, so enter the last schedule done yourself.');
        } else {
            markDerived(schedType, '');
            markDerived(schedDate, '');
            bits.push('The loco master holds no schedule for this loco — ' +
                'enter Major and Last inspection from the shed record.');
        }

        if (!flag) { DIRTY = true; render(); return; }
        flag.innerHTML = bits.join('<br>');
        flag.classList.remove('none');
        // The boxes were filled programmatically, so no input event fired —
        // repaint the sheet here or DOC stays missing from the preview until
        // the next keystroke anywhere on the form.
        DIRTY = true;
        render();
    }

    function lookupLoco(numberInput) {
        var number = numberInput.value.trim();
        if (!number) return;
        api(CFG.locoApi + '/locos/' + encodeURIComponent(number))
            .then(function (data) { applyLoco(data.loco); toast('Loco ' + number + ' loaded from the master.', 'ok'); })
            .catch(function () {
                var flag = $('dueFlag');
                if (flag) {
                    flag.innerHTML = 'Loco <b>' + escapeText(number) + '</b> is not in the loco master — ' +
                        'type its type, base and DOC in yourself.';
                    flag.classList.remove('none');
                }
            });
    }

    // ── Load / save ─────────────────────────────────────────────────────────
    function applyStatus() {
        var filed = STATUS === 'final';
        $('desk').classList.toggle('readonly', filed);
        $('btnSave').style.display = filed ? 'none' : '';
        $('btnFile').style.display = filed ? 'none' : '';
        // The desk may reopen its own filed reports, so this is no longer
        // admin-only — see the unfinalize route for why.
        $('btnReopen').style.display = filed ? '' : 'none';
        $('btnFiled').style.display = (filed && DOCUMENT_ID) ? '' : 'none';
        $('btnDelete').disabled = filed;
        var chip = $('stChip');
        chip.textContent = filed ? 'Filed' : 'Draft';
        chip.className = 'chip ' + (filed ? 'final' : 'draft');
        $('stRef').textContent = readForm()[CFG.numberCol] || 'unsaved';
        $('roNote').textContent = '✓ Filed. This ' + CFG.label +
            ' is read-only — reopen it to edit.';
    }

    function load(id) {
        return api(CFG.api + '/' + id).then(function (data) {
            RECORD_ID = data.record.id;
            STATUS = data.record.status;
            DOCUMENT_ID = data.record.document_id;
            EVENTS = (data.events || []).map(function (e) {
                return { event_time: e.event_time || '', description: e.description || '' };
            });
            writeForm(data.record);
            renderEvents(); render(); applyStatus();
            DIRTY = false;
        }).catch(fail);
    }

    function save() {
        var payload = { id: RECORD_ID, record: readForm(), events: EVENTS };
        return api(CFG.api, { method: 'POST', body: JSON.stringify(payload) })
            .then(function (data) {
                RECORD_ID = data.id;
                DIRTY = false;
                applyStatus();
                loadHistory();
                return data.id;
            });
    }

    function newRecord() {
        var go = function () {
            RECORD_ID = null; STATUS = 'draft'; DOCUMENT_ID = null; EVENTS = [];
            clearForm();
            var dateEl = document.querySelector('[name="' + CFG.dateCol + '"]');
            if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
            var flag = $('dueFlag'); if (flag) flag.classList.add('none');
            document.querySelectorAll('.derived').forEach(function (el) { el.classList.remove('derived'); });
            api(CFG.locoApi + '/next-number').then(function (d) {
                var el = document.querySelector('[name="' + CFG.numberCol + '"]');
                if (el && !el.value) { el.value = d.number; render(); applyStatus(); }
            }).catch(function () { /* a suggested number is a convenience, not a requirement */ });
            renderEvents(); render(); applyStatus();
            DIRTY = false;
            history.replaceState(null, '', window.location.pathname);
        };
        if (DIRTY) {
            confirmModal('Discard unsaved changes?',
                '<p>This ' + CFG.label + ' has changes that have not been saved.</p>',
                'Discard', 'btn-red', function () { closeModal(); go(); });
        } else { go(); }
    }

    // ── History drawer ──────────────────────────────────────────────────────
    function loadHistory() {
        var params = [];
        if ($('hSearch').value.trim()) params.push('q=' + encodeURIComponent($('hSearch').value.trim()));
        if ($('hStatus').value) params.push('status=' + $('hStatus').value);
        api(CFG.api + (params.length ? '?' + params.join('&') : '')).then(function (data) {
            var list = $('hList');
            if (!data.records.length) {
                list.innerHTML = '<div class="emptylist">Nothing here yet.</div>';
                return;
            }
            list.innerHTML = data.records.map(function (r) {
                return '<div class="hist-card" data-id="' + r.id + '">' +
                    '<div class="l1"><span class="no">' + escapeText(r.number || (CFG.label + ' #' + r.id)) + '</span>' +
                    '<span class="chip ' + r.status + '">' + (r.status === 'final' ? 'Filed' : 'Draft') + '</span></div>' +
                    '<div class="l2">' + escapeText(r.report_date || '') +
                    (r.train_no ? ' &middot; Train ' + escapeText(r.train_no) : '') +
                    (r.loco_number ? ' &middot; Loco ' + escapeText(r.loco_number) : '') +
                    '</div></div>';
            }).join('');
            list.querySelectorAll('.hist-card').forEach(function (el) {
                el.onclick = function () {
                    load(el.dataset.id).then(function () { drawer(false); });
                };
            });
        }).catch(fail);
    }
    function drawer(open) { document.body.classList.toggle('drawer-open', open); if (open) loadHistory(); }

    // ── Buttons ─────────────────────────────────────────────────────────────
    function needSaved(then) {
        if (RECORD_ID && !DIRTY) return then(RECORD_ID);
        save().then(then).catch(fail);
    }

    function wire() {
        $('btnSave').onclick = function () {
            save().then(function () { toast(CFG.label + ' saved as a draft.', 'ok'); }).catch(fail);
        };
        $('btnNew').onclick = newRecord;
        $('btnPrint').onclick = function () { window.print(); };
        $('btnWord').onclick = function () {
            needSaved(function (id) { window.location = CFG.api + '/' + id + '/word'; });
        };
        $('btnFiled').onclick = function () {
            if (DOCUMENT_ID) window.open('/api/division/documents/' + DOCUMENT_ID + '/view', '_blank');
        };
        $('btnFile').onclick = function () {
            confirmModal('File this ' + CFG.label + '?',
                '<p>It will be rendered and filed into <b>Documents &rarr; SSE-HQ Reports</b>, ' +
                'and locked against further editing.</p>' +
                '<p>A division admin can reopen it if it needs correcting.</p>',
                'File it', 'btn-green', function () {
                    closeModal();
                    needSaved(function (id) {
                        api(CFG.api + '/' + id + '/finalize', { method: 'POST' })
                            .then(function (data) {
                                STATUS = 'final'; DOCUMENT_ID = data.document_id;
                                applyStatus(); loadHistory();
                                toast('Filed in Documents → SSE-HQ Reports.', 'ok');
                            }).catch(fail);
                    });
                });
        };
        $('btnReopen').onclick = function () {
            confirmModal('Reopen this ' + CFG.label + '?',
                '<p>It goes back to draft and <b>the filed copy is removed</b> from the ' +
                'Documents repository, so nobody is left reading a version that no longer matches.</p>',
                'Reopen', 'btn-amber', function () {
                    closeModal();
                    api(CFG.api + '/' + RECORD_ID + '/unfinalize', { method: 'POST' })
                        .then(function () {
                            STATUS = 'draft'; DOCUMENT_ID = null;
                            applyStatus(); loadHistory();
                            toast('Reopened as a draft.', 'ok');
                        }).catch(fail);
                });
        };
        $('btnDelete').onclick = function () {
            if (!RECORD_ID) { newRecord(); return; }
            confirmModal('Delete this draft?',
                '<p>The ' + CFG.label + ' and its chronology are deleted. This cannot be undone.</p>',
                'Delete', 'btn-red', function () {
                    closeModal();
                    api(CFG.api + '/' + RECORD_ID, { method: 'DELETE' })
                        .then(function () { toast('Draft deleted.', 'ok'); RECORD_ID = null; DIRTY = false; newRecord(); })
                        .catch(fail);
                });
        };

        $('btnHistory').onclick = function (e) { e.preventDefault(); drawer(true); };
        $('hSearch').oninput = loadHistory;
        $('hStatus').onchange = loadHistory;
        $('addEvent').onclick = addEvent;
        $('mCancel').onclick = closeModal;
        $('mOk').onclick = function () { if (modalOk) modalOk(); };
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeModal(); drawer(false); }
        });

        /* Fields the shed and the proforma always write in capitals — loco
         * type and base, schedule and inspection codes, section names. Forced
         * on the value rather than only with text-transform, so what is stored
         * and what is printed match what the box shows; the caret is put back
         * where it was or typing mid-word would jump to the end. */
        document.querySelectorAll('[data-upper]').forEach(function (el) {
            el.addEventListener('input', function () {
                var up = el.value.toUpperCase();
                if (up !== el.value) {
                    var at = el.selectionStart;
                    el.value = up;
                    if (at != null) { try { el.setSelectionRange(at, at); } catch (e) { /* not a text input */ } }
                }
            });
        });

        // any field edit repaints the sheet
        CFG.fields.forEach(function (name) {
            var el = document.querySelector('[name="' + name + '"]');
            if (el && !el.dataset.picker) el.addEventListener('input', touched);
        });

        // loco lookup on Enter or on leaving the box
        var locoInput = document.querySelector('[name="loco_number"]');
        if (locoInput) {
            locoInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); lookupLoco(locoInput); }
            });
            locoInput.addEventListener('blur', function () {
                setTimeout(function () { lookupLoco(locoInput); }, 200);
            });
            attachPicker(locoInput, $('locoDrop'), CFG.locoApi + '/search-loco/',
                function (l) {
                    return '<b>' + escapeText(l.loco_number) + '</b><small>' +
                        escapeText([l.loco_type, l.home_shed, l.commission_date].filter(Boolean).join(' · ')) +
                        '</small>';
                },
                function (l) { locoInput.value = l.loco_number; applyLoco(l); });
        }

        // staff pickers, declared by the page
        (CFG.staffPickers || []).forEach(function (p) {
            var input = document.querySelector('[name="' + p.name + '"]');
            var hidden = document.querySelector('[name="' + p.hrms + '"]');
            var drop = $(p.drop);
            if (!input || !drop) return;
            attachPicker(input, drop, CFG.locoApi + '/search-staff/',
                function (s) {
                    return '<b>' + escapeText(s.name) + '</b><small>' +
                        escapeText([s.hrms_id, s.designation_name, s.current_office_code].filter(Boolean).join(' · ')) +
                        '</small>';
                },
                function (s) { input.value = s.name; if (hidden) hidden.value = s.hrms_id || ''; });
        });
    }

    // ── Boot ────────────────────────────────────────────────────────────────
    function init(config) {
        CFG = config;
        CFG.locoApi = CFG.locoApi || '/api/division/ssehq';
        var style = document.createElement('style');
        style.textContent = window.SsehqReport.SHEET_CSS +
            '\n.sheet{padding:12mm;}';
        document.head.appendChild(style);

        api(CFG.locoApi + '/config').then(function (data) {
            USER = data.user;
            CFG.forwardingDefault = data.forwarding_default;
            $('who').innerHTML = '<b>' + escapeText(USER.full_name || USER.username) + '</b><br>' +
                escapeText(USER.div_role);
            // ssehq is scoped out of the division dashboard, so the link would
            // only bounce it back to this page. Everyone else gets it.
            var dash = $('dashLink');
            if (dash && USER.div_role !== 'ssehq') dash.style.display = '';
            wire();

            /* Corridor suggestions for Section / Major / Minor. Failure is not
             * fatal: the endpoint answers with an empty list rather than an
             * error, and the boxes stay free text either way. */
            api(CFG.locoApi + '/sections').then(function (d) {
                var list = $('sectionList');
                if (!list) return;
                list.innerHTML = (d.sections || []).map(function (sec) {
                    return '<option value="' + escapeAttr(sec) + '">';
                }).join('');
            }).catch(function () { /* suggestions are a convenience */ });

            var params = new URLSearchParams(window.location.search);
            if (params.get('id')) return load(params.get('id'));
            if (params.get('fromOpr') && CFG.prefillFrom) return CFG.prefillFrom(params.get('fromOpr'));
            newRecord();
        }).catch(function (e) {
            document.body.innerHTML = '<div class="bootfail"><h3>SSE-HQ reports could not start</h3>' +
                '<p>The portal could not confirm your access.</p>' +
                '<div class="why">' + escapeText(e.message) + '</div></div>';
        });
    }

    window.SsehqEditor = {
        init: init,
        api: api,
        toast: toast,
        fail: fail,
        render: render,
        renderEvents: renderEvents,
        applyStatus: applyStatus,
        writeForm: writeForm,
        setEvents: function (list) {
            EVENTS = (list || []).map(function (e) {
                return { event_time: e.event_time || '', description: e.description || '' };
            });
        },
        setDirty: function (v) { DIRTY = v; },
        getId: function () { return RECORD_ID; },
        needSaved: needSaved,
    };
}(window, document));
