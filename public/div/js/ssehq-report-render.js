/* ===========================================================================
 * SSE-HQ report renderer — SINGLE SOURCE OF TRUTH
 *
 * Loaded two ways on purpose, exactly as cadre-letter-render.js is:
 *   • browser  <script src="/div/js/ssehq-report-render.js">  → window.SsehqReport
 *   • node     require('../public/div/js/ssehq-report-render.js')
 *                                                  (utils/ssehqReportHtml.js)
 *
 * The live preview on ssehq-opr.html / ssehq-note.html, the printout, the Word
 * download and the copy filed into div_documents all call the same
 * renderOprSheet()/renderNoteSheet(), so they cannot drift. The module this
 * replaced built its output from template literals inside the route file, with
 * no preview at all — which is how the filed PDF came to be an unformatted
 * text dump that looked nothing like the proforma.
 *
 * Layout follows data/sample for OPR and DElogging note.docx verbatim:
 *
 *   OPR — "One page report of Detention of Train ___ with Loco no. ___"
 *     Date of Failure | Division/Rly
 *     Train No.       | Loco/Type/Base
 *     Schedule        : Major:- …   DOC:- …   Last inspection- …
 *     Load            | Loco Pilot/HQ ; ALP-
 *     Section         | Major- / Minor-
 *     Detention
 *     Chronological sequence of events  (Event time | Event description)
 *     Repercussion & Punctuality        <- ONE merged cell in the original
 *     Reported / Reason / Responsibility
 *                                                          DEE/TRO/BB
 *
 *   DELOGGING NOTE —
 *     Central Railway | Office of Sr.DEE(TRS)'O - CSMT
 *     No. …           | Date: …
 *              DELOGGING NOTE
 *     Sub.: …
 *     <intro para>  <events table>
 *     PUNCTUALITY : / REPERCUSSION :
 *     <statements>  <conclusion>
 *                                                          DEE(TRO)BB
 *     Sr.DEE(TRO)BB: / Sr.DOM(COG)BB: / ADRM (O&S) BB:
 * =========================================================================== */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.SsehqReport = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ── helpers ─────────────────────────────────────────────────────────────
    // Escapes the apostrophe too: the editor pages embed JSON in single-quoted
    // attributes (data-l='…'), and loco sheds like O'VALLEY are real enough.
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function nl2br(s) { return esc(s).replace(/\r?\n/g, '<br>'); }
    function has(s) { return s != null && String(s).trim() !== ''; }

    /* Blank line separates paragraphs, matching how the sample note reads and
     * how the cadre body textareas already behave — one convention across the
     * whole portal so a user who learns one editor knows the other. */
    function paras(s, cls) {
        if (!has(s)) return '';
        return String(s).split(/\r?\n\s*\r?\n/)
            .map(function (p) { return p.trim(); })
            .filter(Boolean)
            .map(function (p) { return '<p class="' + (cls || 'para') + '">' + nl2br(p) + '</p>'; })
            .join('');
    }

    /* The official documents write dates as 03.08.2026, not 2026-08-03. The
     * stored value is always 'YYYY-MM-DD' (every read aliases DATE_FORMAT), but
     * a Date slipping through used to render as
     * "Wed Aug 19 2026 00:00:00 GMT+0530" on the filed copy, so this normalises
     * defensively rather than trusting the caller. */
    function fmtDate(v) {
        if (!has(v)) return '';
        var s = String(v);
        if (Object.prototype.toString.call(v) === '[object Date]') {
            if (isNaN(v.getTime())) return '';
            s = v.getFullYear() + '-' + ('0' + (v.getMonth() + 1)).slice(-2) +
                '-' + ('0' + v.getDate()).slice(-2);
        }
        var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
        return m ? m[3] + '.' + m[2] + '.' + m[1] : s;
    }

    /* On screen an empty field shows a grey rule so the user can see what is
     * still blank; on paper it prints as nothing. Same convention as the cadre
     * renderer's placeholders option. */
    function val(v, opts, hint) {
        if (has(v)) return esc(v);
        return (opts && opts.placeholders)
            ? '<span class="ph">' + esc(hint || '—') + '</span>' : '';
    }
    function valDate(v, opts, hint) { return val(fmtDate(v), opts, hint); }

    /* "30699/WAP-7/SRCE" — the proforma writes loco, type and base as one
     * slash-joined value, and drops the separators for the parts not known
     * rather than printing "//". */
    function locoTriple(r) {
        return [r.loco_number, r.loco_type, r.loco_base].filter(has).join('/');
    }

    function crewLine(r) {
        var lp = has(r.lp_name) ? 'Mr. ' + esc(r.lp_name) : '';
        var alp = has(r.alp_name) ? 'ALP- ' + esc(r.alp_name) : '';
        return [lp, alp].filter(Boolean).join(' ; ');
    }

    /* The Schedule row of the proforma reads "Major: - DOC:- " on one line and
     * "Last inspection- IB:- " on the next. DOC is the Date Of Commissioning —
     * the module this replaced carried a separate free-text doc_text column
     * beside loco_commission_date, giving the form two boxes for one fact that
     * disagreed with each other the moment the loco lookup filled one of them. */
    function scheduleCell(r, opts) {
        var major = [r.last_schedule_type, fmtDate(r.last_schedule_date)].filter(has).join(' ');
        var insp = [r.last_inspection_type, fmtDate(r.last_inspection_date)].filter(has).join(' ');
        return '<div>Major:- ' + val(major, opts, 'schedule') +
               '&nbsp;&nbsp;&nbsp;DOC:- ' + valDate(r.loco_commission_date, opts, 'commissioned') + '</div>' +
               '<div>Last inspection- ' + val(insp, opts, 'IB / date') + '</div>';
    }

    /* The header is a real <thead> so that a chronology running past the foot
     * of page one repeats "Event time | Event description" at the top of page
     * two instead of starting mid-table with bare rows. */
    var EV_HEAD = '<thead><tr><th class="t">Event time</th><th>Event description</th></tr></thead>';

    function eventsTable(events, opts) {
        var rows = (events || []).filter(function (e) {
            return has(e.event_time) || has(e.description);
        });
        if (!rows.length) {
            return (opts && opts.placeholders)
                ? '<table class="ev">' + EV_HEAD + '<tbody><tr><td class="t"><span class="ph">—</span></td>' +
                  '<td><span class="ph">no events entered yet</span></td></tr></tbody></table>'
                : '';
        }
        return '<table class="ev">' + EV_HEAD + '<tbody>' +
            rows.map(function (e) {
                return '<tr><td class="t">' + esc(e.event_time) + '</td><td>' + nl2br(e.description) + '</td></tr>';
            }).join('') + '</tbody></table>';
    }

    // ── OPR ─────────────────────────────────────────────────────────────────
    function oprSubject(r) {
        return 'One page report of Detention of Train ' + (has(r.train_no) ? r.train_no : '________') +
               ' with Loco no. ' + (has(r.loco_number) ? r.loco_number : '________');
    }

    function renderOprSheet(report, events, opts) {
        var r = report || {};
        opts = opts || {};

        /* Repercussion and Punctuality are two columns but ONE cell in the
         * proforma — the original merges them, and splitting them on paper
         * would not match the document the division files. */
        var rp = [paras(r.repercussion_text), paras(r.punctuality_text)].filter(Boolean).join('');
        if (!rp && opts.placeholders) rp = '<span class="ph">—</span>';

        return '' +
        '<div class="sub">Sub: - ' + esc(oprSubject(r)) + '</div>' +
        '<table class="pf">' +
          '<tr><td class="k">Date of Failure</td><td>' + valDate(r.failure_date, opts) + '</td>' +
              '<td class="k">Division/Rly</td><td>' + val(r.division_railway || 'Mumbai/CR', opts) + '</td></tr>' +
          '<tr><td class="k">Train No.</td><td>' + val(r.train_no, opts) + '</td>' +
              '<td class="k">Loco/Type/Base</td><td>' + val(locoTriple(r), opts, 'loco/type/base') + '</td></tr>' +
          '<tr><td class="k">Schedule</td><td colspan="3">' + scheduleCell(r, opts) + '</td></tr>' +
          '<tr><td class="k">Load</td><td>' + val(r.load_text, opts) + '</td>' +
              '<td class="k">Loco Pilot/HQ</td><td>' + (crewLine(r) || val('', opts, 'LP ; ALP')) + '</td></tr>' +
          '<tr><td class="k">Section</td><td>' + val(r.section_text, opts) + '</td>' +
              '<td class="k">Major / Minor</td><td>Major- ' + val(r.major_text, opts) +
              '<br>Minor- ' + val(r.minor_text, opts) + '</td></tr>' +
          '<tr><td class="k">Detention</td><td colspan="3">' +
              (paras(r.detention_text) || val('', opts)) + '</td></tr>' +
          '<tr><td class="k evhead" colspan="4">Chronological sequence of events</td></tr>' +
          '<tr><td colspan="4" class="evcell">' + eventsTable(events, opts) + '</td></tr>' +
          '<tr><td class="k">Repercussion &amp;<br>Punctuality</td><td colspan="3">' + rp + '</td></tr>' +
          '<tr><td class="k">Reported</td><td colspan="3">' + (paras(r.reported_text) || val('', opts)) + '</td></tr>' +
          '<tr><td class="k">Reason</td><td colspan="3">' + (paras(r.reason_text) || val('', opts)) + '</td></tr>' +
          '<tr><td class="k">Responsibility</td><td colspan="3">' + (paras(r.responsibility_text) || val('', opts)) + '</td></tr>' +
        '</table>' +
        '<div class="sign">' + esc(r.signing_text || 'DEE/TRO/BB') + '</div>' +
        CREDIT;
    }

    // ── DElogging Note ──────────────────────────────────────────────────────
    function noteSubject(n) {
        if (has(n.subject_text)) return n.subject_text;
        return 'Delogging of Train No. ' + (has(n.train_no) ? n.train_no : '________') +
               (has(n.train_date) ? ' of dated ' + fmtDate(n.train_date) : '');
    }

    function renderNoteSheet(note, events, opts) {
        var n = note || {};
        opts = opts || {};

        var locoLine = has(locoTriple(n))
            ? '<div class="locoline">Loco No- ' + esc(locoTriple(n)) +
              (has(n.loco_commission_date) ? '&nbsp;&nbsp;DOC:- ' + fmtDate(n.loco_commission_date) : '') +
              '</div>' : '';

        return '' +
        '<table class="lh"><tr>' +
          '<td class="l"><b>Central Railway</b></td>' +
          '<td class="r">Office of<br>Sr.DEE(TRS)&rsquo;O - CSMT</td>' +
        '</tr></table>' +
        '<table class="noline"><tr>' +
          '<td>No.' + val(n.note_no, opts, 'BB/Tech/__') + '</td>' +
          '<td class="dt">Date: ' + valDate(n.note_date, opts) + '</td>' +
        '</tr></table>' +
        '<div class="title">DELOGGING NOTE</div>' +
        '<div class="sub">Sub.: ' + esc(noteSubject(n)) + '</div>' +
        locoLine +
        (paras(n.body_text) || (opts.placeholders ? '<p class="para"><span class="ph">details / opening paragraph</span></p>' : '')) +
        eventsTable(events, opts) +
        (has(n.punctuality_text) || opts.placeholders
            ? '<div class="hd">PUNCTUALITY :</div>' + (paras(n.punctuality_text) || '<p class="para"><span class="ph">—</span></p>') : '') +
        (has(n.repercussion_text) || opts.placeholders
            ? '<div class="hd">REPERCUSSION :</div>' + (paras(n.repercussion_text) || '<p class="para"><span class="ph">—</span></p>') : '') +
        paras(n.statements_text) +
        paras(n.conclusion_text) +
        '<div class="sign">' + esc(n.signing_text || 'DEE(TRO)BB') + '</div>' +
        (has(n.forwarding_text)
            ? '<div class="fwd">' + nl2br(n.forwarding_text) + '</div>'
            : (opts.placeholders ? '<div class="fwd"><span class="ph">forwarding chain</span></div>' : '')) +
        CREDIT;
    }

    /* The default forwarding chain from the sample. Offered by the editor as a
     * starting value rather than hard-coded into the renderer — a note that
     * goes somewhere else must be able to say so. */
    var DEFAULT_FORWARDING = 'Sr.DEE(TRO)BB :\nSr.DOM(COG)BB:\nADRM (O&S) BB:';

    /* The same quiet provenance line the cadre letters carry
     * (cadre-letter-render.js:395), so a report circulating as a printout can
     * be traced back to the portal it came from. */
    var CREDIT = '<div class="gen-credit">Prepared from crtms.in</div>';

    // ── paper styles ────────────────────────────────────────────────────────
    /* Times New Roman at 12pt, single spacing: these ARE Word documents, and
     * the same reasoning as cadre-letter-render.js applies — a web default
     * line-height pushes the one-page OPR onto a second page. The OPR must fit
     * one A4 sheet; that is the whole name of the report. */
    var SHEET_CSS = [
        '.sheet{font-family:"Times New Roman",Times,serif;font-size:11.5pt;line-height:1.2;color:#000;}',
        '.sheet p{margin:0 0 2.6mm;text-align:justify;}',
        '.sheet .para{margin:0 0 2.6mm;}',

        /* Letterhead and No./Date use tables, not flexbox: Word's HTML engine
         * ignores flexbox and stacked the office block under "Central Railway"
         * when the cadre letter tried it. */
        '.sheet table.lh{width:100%;border-collapse:collapse;margin:0 0 3mm;}',
        '.sheet table.lh td{border:none;padding:0;vertical-align:top;}',
        '.sheet table.lh td.l{width:auto;font-size:12pt;}',
        '.sheet table.lh td.r{width:1%;white-space:nowrap;text-align:center;font-size:11.5pt;line-height:1.35;}',
        '.sheet table.noline{width:100%;border-collapse:collapse;margin:0 0 5mm;}',
        '.sheet table.noline td{border:none;padding:0;vertical-align:baseline;}',
        '.sheet table.noline td.dt{width:1%;text-align:right;white-space:nowrap;}',

        '.sheet .title{text-align:center;font-weight:700;font-size:13pt;text-decoration:underline;margin:0 0 4mm;}',
        '.sheet .sub{margin:0 0 3.5mm;font-weight:700;}',
        '.sheet .locoline{margin:0 0 3mm;}',
        '.sheet .hd{font-weight:700;margin:3.5mm 0 1.5mm;letter-spacing:.4px;}',

        /* The proforma grid. Borders are hairlines so a dense one-page report
         * stays readable when the printer scales it. */
        '.sheet table.pf{width:100%;border-collapse:collapse;margin:0 0 4mm;table-layout:fixed;}',
        '.sheet table.pf>tbody>tr>td{border:0.6pt solid #000;padding:1.6mm 2mm;vertical-align:top;'
            + 'word-wrap:break-word;overflow-wrap:break-word;}',
        '.sheet table.pf td.k{font-weight:700;width:22%;}',
        '.sheet table.pf td.evhead{text-align:center;background:#f0efe8;width:auto;}',
        /* The events table sits inside a proforma cell; killing the padding
         * lets its own borders meet the outer grid instead of floating in it. */
        '.sheet table.pf td.evcell{padding:0;}',
        '.sheet table.ev{width:100%;border-collapse:collapse;table-layout:fixed;}',
        '.sheet table.ev th,.sheet table.ev td{border:0.6pt solid #000;padding:1.3mm 2mm;'
            + 'vertical-align:top;text-align:left;word-wrap:break-word;overflow-wrap:break-word;}',
        '.sheet table.ev th{font-weight:700;background:#f0efe8;}',
        '.sheet table.ev .t{width:20%;white-space:nowrap;}',
        /* Standalone events table on the note (not nested in the proforma). */
        '.sheet>table.ev{margin:0 0 3.5mm;}',

        /* Signature sits well clear of the last block: these go out on paper
         * and are signed by hand, and 12mm left barely a pen's width between
         * the final row and the name. Kept together with the name so a page
         * break cannot strand the signing line on its own sheet. */
        '.sheet .sign{margin-top:26mm;text-align:right;font-weight:700;page-break-inside:avoid;}',
        '.sheet .fwd{margin-top:14mm;line-height:2.4;page-break-inside:avoid;}',
        '.sheet .gen-credit{margin-top:8mm;font-size:6.5pt;color:#c9ced6;letter-spacing:.2px;}',
        '@media print{.sheet .gen-credit{position:fixed;bottom:0;left:0;margin:0;}}',

        /* Unfilled placeholder — loud on screen so it cannot be missed, plain
         * black on paper. Red ink on a report going to ADRM would be worse
         * than the omission it is flagging, and it should not be printed with
         * one of these in it at all. */
        '.sheet .ph{color:#c0221b;font-weight:700;}',
        '@media print{.sheet .ph{color:#000;font-weight:400;}}',
        /* ── Running past one page ──────────────────────────────────────
         * A long detention narrative or a 30-row chronology will not fit on
         * one sheet, and the report has to stay readable when it does not:
         *   • the events header repeats at the top of each new page
         *   • no row is split down the middle by the break
         *   • a break never lands straight after a heading
         * The OPR is meant to be one page, but "meant to" is not "always". */
        '@media print{',
        '  .sheet table.ev thead{display:table-header-group;}',
        '  .sheet table.ev tr, .sheet table.pf>tbody>tr{page-break-inside:avoid;}',
        '  .sheet .hd, .sheet .sub, .sheet .title{page-break-after:avoid;}',
        '  .sheet table.pf{page-break-inside:auto;}',
        '}'
    ].join('\n');

    return {
        renderOprSheet: renderOprSheet,
        renderNoteSheet: renderNoteSheet,
        oprSubject: oprSubject,
        noteSubject: noteSubject,
        DEFAULT_FORWARDING: DEFAULT_FORWARDING,
        SHEET_CSS: SHEET_CSS,
        escapeHtml: esc,
        fmtDate: fmtDate,
        locoTriple: locoTriple
    };
}));
