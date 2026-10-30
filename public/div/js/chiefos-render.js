/* ===========================================================================
 * Chief OS — D&AR Standard Forms, rendered as HTML.
 *
 * UMD like ssehq-report-render.js: the letter page loads it as a <script> for
 * the live preview, and routes/division/chiefOsRoutes.js require()s it to file
 * the same markup into div_documents and to build the Word download. One
 * renderer, so the preview, the filed copy and the Word file cannot drift.
 *
 * Shapes follow the office's own blank forms in data/chief-os/ (SF-1, 4, 5, 7,
 * 11 of the Railway Servants (Discipline & Appeal) Rules, 1968). Fixed text is
 * reproduced as printed there; blanks come from the record. The record is the
 * letter row with the case's staff columns and the form's own fields (f_*)
 * flattened onto it — see flattenLetter() in the route.
 * =========================================================================== */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.ChiefOsRender = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function has(s) { return s != null && String(s).trim() !== ''; }
    function paras(text) {
        return String(text || '').split(/\r?\n\s*\r?\n/).filter(function (p) { return p.trim(); })
            .map(function (p) { return '<p>' + esc(p.trim()).replace(/\r?\n/g, '<br>') + '</p>'; }).join('');
    }
    function fmtDate(v) {
        if (!v) return '';
        var s = String(v);
        var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
        if (m) return m[3] + '.' + m[2] + '.' + m[1];
        if (v instanceof Date && !isNaN(v)) {
            return String(v.getDate()).padStart(2, '0') + '.' + String(v.getMonth() + 1).padStart(2, '0') + '.' + v.getFullYear();
        }
        return s;
    }

    // ── Reference data ──────────────────────────────────────────────────────
    var DESKS = {
        ML:  { label: 'Mainline', series: 'BB.TRSO.DAR.ML.',  copy_to: 'C/- DRM (P) Loco & Sr. CC (ML) CSMT for inf. & necessary action.' },
        SUB: { label: 'Suburban', series: 'BB.TRSO.DAR.SUB.', copy_to: 'C/- DRM (P) Loco & Sr. CC (SUB) CSMT for inf. & necessary action.' },
    };
    /* "Name / Designation". Picked from a list on the letter; the list is a
     * starting point the desk edits, not a rule. */
    var SIGNATORIES = [
        'Sr. DEE (TRO) BB',
        'RAJESH TRIPATHI / ADEE (TRO) CSMT',
        'Sr. DEE (TRS.O) CSMT',
    ];
    var PLACE_DEFAULT = 'Sr. DEE (TRO) CSMT office';

    /* The five forms. `fields` are the f_* keys the letter saves in its JSON;
     * `follows` names the form a letter of this kind may point back to. */
    var FORMS = {
        SF1:  { label: 'Order of Suspension', short: 'SF-1', rule: 'Rule 5 (1) of the RS (D&A) Rules, 1968', gf: 'G. 531 F.',
                fields: ['f_body', 'f_mode', 'f_effective', 'f_effective_date', 'f_authority_text'], follows: null },
        SF4:  { label: 'Revocation of Suspension', short: 'SF-4', rule: 'Rule 5 (5) (c) of the RS (D&A) Rules, 1968', gf: 'G. 534 F.',
                fields: ['f_body', 'f_susp_order_date', 'f_revoke_from'], follows: 'SF1' },
        SF5:  { label: 'Chargesheet (major penalty)', short: 'SF-5', rule: 'Rule 9 of the Railway Servants (Discipline and Appeal) Rules, 1968', gf: '',
                fields: ['f_body', 'f_days', 'f_articles', 'f_imputations', 'f_documents', 'f_witnesses'], follows: 'SF1' },
        SF7:  { label: 'Appointment of Inquiry Officer', short: 'SF-7', rule: 'Rule 9 (2) of the RS (D&A) Rules, 1968', gf: 'G. 536 F.',
                fields: ['f_body', 'f_io_mode', 'f_io_name', 'f_io_designation', 'f_board_rows'], follows: 'SF5' },
        SF11: { label: 'Memorandum of charge (minor penalty)', short: 'SF-11', rule: 'Rule 11 of RS (D & A) Rules, 1968', gf: 'G. 540 F',
                fields: ['f_body', 'f_days', 'f_imputation'], follows: null },
    };
    var FORM_ORDER = ['SF1', 'SF5', 'SF11', 'SF7', 'SF4'];

    // ── Shared pieces ───────────────────────────────────────────────────────
    function ph(v, opts, text) {
        if (has(v)) return esc(v);
        return opts && opts.placeholders ? '<span class="ph">' + esc(text) + '</span>' : '<span class="blank">' + '&nbsp;'.repeat(28) + '</span>';
    }
    /* "Shri NAME, Designation, Office" — the person the order is about. */
    function staffLine(r, opts) {
        var bits = [r.staff_designation, r.staff_office].filter(has).join(', ');
        return 'Shri ' + ph(r.staff_name, opts, 'name of the Railway Servant') + (bits ? ', ' + esc(bits) : '');
    }
    function shri(r, opts) { return 'Shri ' + ph(r.staff_name, opts, 'name'); }
    function sigBlock(r, opts, extraLabel) {
        var parts = String(r.signatory || '').split('/').map(function (s) { return s.trim(); });
        var name = parts.length > 1 ? parts[0] : '';
        var desig = parts.length > 1 ? parts.slice(1).join(' / ') : parts[0];
        return '<table class="sig"><tr><td class="l"></td><td class="r">' +
            'Signature ' + '<span class="blank">' + '&nbsp;'.repeat(24) + '</span><br>' +
            'Name ' + (has(name) ? esc(name) : '<span class="blank">' + '&nbsp;'.repeat(28) + '</span>') + '<br>' +
            '<b>' + ph(desig, opts, 'designation of the authority') + '</b><br>' +
            '<small>' + esc(extraLabel || '(Designation of the authority making this order)') + '</small>' +
            '</td></tr></table>';
    }
    function headBlock(r, opts, f) {
        return '<div class="gf">' + esc(f.gf) + (f.gf ? '<br>' : '') + esc('Standard Form No. ' + f.short.replace('SF-', '')) + '</div>' +
            '<div class="ftitle">' + esc('Standard Form of ' + f.label.replace(/\s*\(.*\)$/, '')) + ' [' + esc(f.rule) + ']</div>' +
            '<table class="noline"><tr><td><b>CENTRAL RAILWAY</b></td>' +
            '<td class="dt">No. ' + ph(r.letter_no, opts, 'BB.TRSO.DAR.ML.26.01') + '<br>' +
            'Place of issue: ' + ph(r.place_of_issue, opts, 'Sr. DEE (TRO) CSMT office') + '<br>' +
            'Date: ' + ph(fmtDate(r.letter_date), opts, 'dd.mm.yyyy') + '</td></tr></table>';
    }
    function copyTo(r, opts) {
        return '<div class="copyto">Copy to :-<br>' + staffLine(r, opts) +
            '<br><small>(Name and designation of the Railway Servant).</small>' +
            (has(r.copy_to_text) ? '<br>' + esc(r.copy_to_text).replace(/\r?\n/g, '<br>') : '') + '</div>';
    }
    function followsLine(r, opts, what) {
        // the letter this one acts on: number and date from the linked row
        return (has(r.follows_no) ? 'No. ' + esc(r.follows_no) : ph('', opts, what + ' no.')) +
            ' dated ' + ph(fmtDate(r.follows_date), opts, 'dd.mm.yyyy');
    }

    // ── Standard wording ────────────────────────────────────────────────────
    /* The body of each form, as printed on the Government form, with the
     * blanks as tokens. A new letter starts with this text in an editable box
     * (f_body); the desk may rewrite any sentence, and the tokens keep
     * resolving live from the boxes above. A blank line starts a paragraph; a
     * paragraph that is only {{io}} prints the Inquiry Officer / Board block. */
    var TEMPLATES = {
        SF1: 'Whereas {{ground}}.\n\n' +
             'Now, therefore, the undersigned {{authority}}, in exercise of the powers conferred by Rule 5 (1) of the RS (D&A) Rules, 1968, hereby places the said {{name}} under suspension {{effective}}.\n\n' +
             'It is further ordered that during the period this order shall remain in force, the said {{name}} shall not leave the headquarters without obtaining the previous permission of the competent authority.',
        SF4: 'Whereas an order placing {{staff}} under suspension was made / was deemed to have been made by {{signatory_desig}} on {{susp_date}}{{follows_vide}}.\n\n' +
             'Now, therefore, the undersigned (the authority which made or is deemed to have made the order of suspension, or any other authority to which that authority is subordinate), in exercise of the powers conferred by clause (c) of sub-rule (5) of Rule 5 of the RS (D&A) Rules, 1968, hereby revokes the suspension with effect from {{revoke_from}}.',
        SF5: '1. The undersigned proposes to hold an enquiry against {{name}}, under Rule 9 of the Railway Servants (Discipline & Appeal) Rules, 1968. The substance of the imputations of misconduct or misbehaviour in respect of which the enquiry is proposed to be held is set out in the enclosed statement of Articles of Charge (Annexure-I). A statement of the imputations of misconduct or misbehaviour in support of each article of charge is enclosed (Annexure-II). A list of documents by which and a list of witnesses by whom the Articles of Charge are proposed to be sustained are also enclosed (Annexure-III & IV). Further copies of documents mentioned in the list of documents as per Annexure-III are enclosed.\n\n' +
             '2. {{name}} is hereby informed that if he so desires, he can inspect and take extracts from the documents mentioned in the enclosed list of documents (Annexure-III) at any time during office hours within {{days}} days of receipt of this Memorandum. For this purpose, he may contact the undersigned immediately after the receipt of this memorandum.\n\n' +
             '3. {{name}} is further informed that he may, if he so desires, take the assistance of any other railway servant / an official of a Railway Trade Union (who satisfies the requirements of Rule 9 (13) of the Railway Servants (Discipline and Appeal) Rules, 1968 and Note 1 and/or Note 2 thereunder, as the case may be) for inspecting the documents and assisting him in presenting his case before the Inquiring Authority in the event of an oral enquiry being held. For this purpose, he should nominate one or more persons / official(s). {{name}} should obtain an undertaking from the nominee(s) that he (they) is (are) willing to assist him during the disciplinary proceedings. The undertaking should also contain the particulars of other case(s), if any, in which the nominee(s) had already undertaken to assist, and the undertaking should be furnished to the undersigned along with the nomination.\n\n' +
             '4. {{name}} is hereby directed to submit to the undersigned a written statement of his defence within {{days}} days of receipt of this memorandum, if he does not require to inspect any documents for the preparation of his defence, and within {{days}} days after completion of inspection of documents if he desires to inspect documents, and also:\n(a) to state whether he wishes to be heard in person, and\n(b) to furnish the names and addresses of the witnesses, if any, whom he wishes to call in support of his defence.\n\n' +
             '5. {{name}} is informed that an enquiry will be held only in respect of those articles of charge as are not admitted. He should, therefore, specifically admit or deny each article of charge.\n\n' +
             '6. {{name}} is further informed that if he does not submit his written statement of defence within the period specified in para 4, or does not appear in person before the inquiring authority, or otherwise fails or refuses to comply with the provisions of Rule 9 of the Railway Servants (Discipline & Appeal) Rules, 1968 or the orders/directions issued in pursuance of the said rule, the inquiring authority may hold the inquiry ex-parte.\n\n' +
             '7. The attention of {{name}} is invited to Rule 20 of the Railway Servants (Conduct) Rules, 1966, under which no railway servant shall bring or attempt to bring any political or other influence to bear upon any superior authority to further his interests in respect of matters pertaining to his service under the Government. If any representation is received on his behalf from another person in respect of any matter dealt with in these proceedings, it will be presumed that {{name}} is aware of such a representation and that it has been made at his instance, and action will be taken against him for violation of Rule 20 of the Railway Servants (Conduct) Rules, 1966.\n\n' +
             '8. The receipt of this memorandum may be acknowledged.',
        SF7: 'Whereas an inquiry under Rule 9 of the Railway Servants (Discipline and Appeal) Rules, 1968 is being held against {{staff}}{{follows_vide}}.\n\n' +
             'AND WHEREAS the undersigned considers that {{io_kind}} should be appointed to inquire into the charges framed against him.\n\n' +
             'NOW, THEREFORE, the undersigned, in exercise of the powers conferred by sub-rule (2) of the said Rule, hereby appoints\n\n' +
             '{{io}}\n\n' +
             'as {{io_kind_cap}} to inquire into the charges framed against the said {{name}}.',
        SF11: '1. श्री {{name_only}} (पदनाम) (कार्यालय जिसमें काम करते हो) {{designation}}, {{office}} एतद्द्वारा सूचित किया जाता है कि निम्नहस्ताक्षरी द्वारा उसके विरुद्ध रेलसेवक (अनुशासन और अपील) नियम 1968 के नियम 11 के अंतर्गत कार्रवाई करने की प्रस्थापना की गई है। दुर्व्यवहार व अवचार के लांछनों का एक विवरण संलग्न है, जिस पर उपयुक्त कार्रवाई करने की प्रस्थापना है।\n\n' +
              '{{staff}} (Name, designation and office in which working) is hereby informed that the undersigned proposes to take action against him under Rule 11 of the Railway Servants (Discipline and Appeal) Rules, 1968. A statement of the imputation of misconduct or misbehaviour on which action is proposed to be taken as mentioned above is enclosed.\n\n' +
              '2. श्री {{name_only}} को एतद्द्वारा यह अवसर दिया जाता है कि इस प्रस्ताव के विरुद्ध वह जो भी अभ्यावेदन देना चाहे वे दे। अभ्यावेदन यदि देना हो, निम्नहस्ताक्षरी को इस तरह प्रस्तुत किया जाना चाहिए ताकि वह इस ज्ञापन की प्राप्ति के दस दिन के भीतर पहुँच जाये।\n\n' +
              '{{name}} is hereby given an opportunity to make such representation as he may wish to make against the proposal. The representation, if any, should be submitted to the undersigned so as to reach within {{days}} days of receipt of this memorandum.\n\n' +
              '3. यदि श्री {{name_only}} पैरा दो में विनिर्दिष्ट अवधि के भीतर अभ्यावेदन प्रस्तुत नहीं करते तो यह मान लिया जायेगा कि उन्हें कोई अभ्यावेदन नहीं देना है और श्री {{name_only}} के विरुद्ध एकपक्षीय आदेश पारित किये जा सकेंगे।\n\n' +
              'If {{name}} fails to submit his representation within the period specified in para 2, it will be presumed that he has no representation to make and orders will be liable to be passed against {{name}} ex-parte.\n\n' +
              '4. श्री {{name_only}} इस ज्ञापन की पावती दे।\n\n' +
              'The receipt of this Memorandum should be acknowledged by {{name}}.',
    };

    /* Token values are HTML (escaped, or a placeholder span). */
    function tokens(r, opts) {
        var desig = String(r.signatory || '').split('/').pop().trim();
        var mode = r.f_mode || 'contemplated';
        var ground = mode === 'criminal'
            ? 'a case against ' + staffLine(r, opts) + ' in respect of a criminal offence is under investigation / inquiry / trial'
            : 'a disciplinary proceeding against ' + staffLine(r, opts) + ' is ' + (mode === 'pending' ? 'pending' : 'contemplated');
        var isBoard = r.f_io_mode === 'board';
        var board = r.f_board_rows;
        if (typeof board === 'string') { try { board = JSON.parse(board); } catch (e) { board = null; } }
        board = Array.isArray(board) ? board.filter(function (b) { return b && (has(b.name) || has(b.designation)); }) : [];
        var io;
        if (isBoard) {
            io = '<p>A Board of Inquiry consisting of :-</p><table class="st board"><tr><th class="n"></th><th>Name of Member</th><th>Designation</th></tr>' +
                (board.length ? board : [{}, {}, {}]).map(function (b, i) {
                    return '<tr><td class="n">' + (i + 1) + '.</td><td>' + ph(b.name, opts, 'name of member') + '</td><td>' + ph(b.designation, opts, 'designation') + '</td></tr>';
                }).join('') + '</table>';
        } else {
            io = '<p>Shri ' + ph(r.f_io_name, opts, 'name of the Inquiry Officer') + ', ' + ph(r.f_io_designation, opts, 'designation') +
                '<br><small>(Name and designation of the Inquiry Officer)</small></p>';
        }
        var suspDate = has(r.f_susp_order_date) ? r.f_susp_order_date : r.follows_date;
        return {
            name: shri(r, opts),
            name_only: ph(r.staff_name, opts, 'name'),
            staff: staffLine(r, opts),
            designation: ph(r.staff_designation, opts, 'designation'),
            office: ph(r.staff_office, opts, 'office'),
            pf: ph(r.staff_pf, opts, 'PF number'),
            letter_no: ph(r.letter_no, opts, 'letter no.'),
            date: ph(fmtDate(r.letter_date), opts, 'dd.mm.yyyy'),
            signatory_desig: ph(desig, opts, 'Sr. DEE (TRO) BB'),
            ground: ground,
            authority: has(r.f_authority_text) ? esc(r.f_authority_text)
                : '[the authority competent to place the Railway Servant under suspension in terms of Schedule II and III appended to RS (D&A) Rules, 1968]',
            effective: r.f_effective === 'from' && has(r.f_effective_date) ? 'with effect from ' + esc(fmtDate(r.f_effective_date)) : 'with immediate effect',
            susp_date: ph(fmtDate(suspDate), opts, 'date of suspension order'),
            follows_vide: has(r.follows_no) ? ' vide No. ' + esc(r.follows_no) + (has(r.follows_date) ? ' dated ' + esc(fmtDate(r.follows_date)) : '') : '',
            revoke_from: ph(fmtDate(r.f_revoke_from), opts, 'dd.mm.yyyy'),
            days: has(r.f_days) ? esc(r.f_days) : (r.form_code === 'SF11' ? '10' : 'ten'),
            io_kind: isBoard ? 'a Board of Inquiry' : 'an Inquiry Officer',
            io_kind_cap: isBoard ? 'Board of Inquiry' : 'Inquiry Officer',
            io: io,
        };
    }
    var BLOCK_TOKENS = { io: true };

    function body(r, opts) {
        var text = has(r.f_body) ? r.f_body : (TEMPLATES[r.form_code] || '');
        var t = tokens(r, opts);
        return String(text).split(/\r?\n\s*\r?\n/).map(function (p) {
            var trimmed = p.trim();
            if (!trimmed) return '';
            var only = /^\{\{(\w+)\}\}$/.exec(trimmed);
            if (only && BLOCK_TOKENS[only[1]]) return t[only[1]] || '';
            var html = esc(trimmed).replace(/\{\{(\w+)\}\}/g, function (m, k) { return t[k] != null ? t[k] : m; }).replace(/\r?\n/g, '<br>');
            return '<p' + (/[ऀ-ॿ]/.test(trimmed) ? ' class="deva"' : '') + '>' + html + '</p>';
        }).join('');
    }

    // ── SF-1 ────────────────────────────────────────────────────────────────
    function sf1(r, opts) {
        return headBlock(r, opts, FORMS.SF1) + '<div class="title">ORDER</div>' + body(r, opts) +
            sigBlock(r, opts, '(Designation of the suspending authority)') + copyTo(r, opts) +
            '<p class="fine">Order regarding subsistence allowance admissible to him during the period of suspension will be issued separately.</p>';
    }
    // ── SF-4 ────────────────────────────────────────────────────────────────
    function sf4(r, opts) {
        return headBlock(r, opts, FORMS.SF4) + '<div class="title">ORDER</div>' + body(r, opts) + sigBlock(r, opts) + copyTo(r, opts);
    }
    // ── SF-5 ────────────────────────────────────────────────────────────────
    function sf5(r, opts) {
        var memo = '<div class="gf"></div>' +
            '<div class="ftitle">STANDARD FORM NO. 5<br>STANDARD FORM OF CHARGESHEET<br><small>RULE 9 OF THE RAILWAY SERVANTS (DISCIPLINE AND APPEAL) RULES, 1968</small></div>' +
            '<table class="noline"><tr><td><b>CENTRAL RAILWAY</b><br>No. ' + ph(r.letter_no, opts, 'BB/TRSO/DAR/ML/26/08') + '</td>' +
            '<td class="dt">OFFICE: ' + ph(r.place_of_issue, opts, 'Sr. DEE (TRS.O) CSMT') + '<br>DATE: ' + ph(fmtDate(r.letter_date), opts, 'dd.mm.yyyy') + '</td></tr></table>' +
            '<div class="title">MEMORANDUM</div>' + body(r, opts) +
            sigBlock(r, opts, 'Competent Authority') +
            '<div class="addr">To,<br>' + staffLine(r, opts) + '<br>PF No. ' + ph(r.staff_pf, opts, 'PF number') + '</div>';
        var ann = function (no, title, text, hint) {
            return '<div class="annex"><div class="title">ANNEXURE-' + no + '</div><div class="atitle">' + esc(title) + '</div>' +
                (has(text) ? paras(text) : (opts && opts.placeholders ? '<p class="ph">' + esc(hint) + '</p>' : '')) + '</div>';
        };
        return memo +
            ann('I', 'Statement of Articles of Charge framed against ' + (r.staff_name ? 'Shri ' + r.staff_name : 'the Railway Servant'), r.f_articles, 'Article I … Article II … — one article per paragraph') +
            ann('II', 'Statement of imputations of misconduct or misbehaviour in support of the Articles of Charge', r.f_imputations, 'the facts, one paragraph per article') +
            ann('III', 'List of documents by which the Articles of Charge are proposed to be sustained', r.f_documents, 'one document per line') +
            ann('IV', 'List of witnesses by whom the Articles of Charge are proposed to be sustained', r.f_witnesses, 'one witness per line');
    }
    // ── SF-7 ────────────────────────────────────────────────────────────────
    function sf7(r, opts) {
        var isBoard = r.f_io_mode === 'board';
        return headBlock(r, opts, FORMS.SF7) + '<div class="title">ORDER</div>' + body(r, opts) + sigBlock(r, opts) +
            '<div class="copyto">Copy to :-<br>' +
            (isBoard ? 'Members of the Board of Inquiry as above.' : 'Shri ' + ph(r.f_io_name, opts, 'Inquiry Officer') + ', ' + ph(r.f_io_designation, opts, 'designation') + '<br><small>(Name and designation of the Inquiry Officer)</small>') +
            '<br>' + staffLine(r, opts) +
            (has(r.copy_to_text) ? '<br>' + esc(r.copy_to_text).replace(/\r?\n/g, '<br>') : '') + '</div>';
    }
    // ── SF-11 (bilingual) ───────────────────────────────────────────────────
    /* Hindi transcribed from data/chief-os/SF-11.pdf (a legacy-font PDF) into
     * Unicode; the desk verifies it against the printed sheet before first use. */
    function sf11(r, opts) {
        var H = function (t) { return '<span class="deva">' + t + '</span>'; };
        return '<div class="gf">' + H('जी 540 एफ') + ' / G.540 F<br>' + H('मानक फार्म II') + ' / Standard Form No. 11</div>' +
            '<div class="ftitle">' + H('छोटी शास्तियां अधिरोपित करने के लिए आरोप के ज्ञापन का मानक फार्म') + '<br>' +
            H('[(रेलसेवक) (अनु. और अपी.) नियम, 1968 का नियम 11]') + '<br>' +
            'Standard Form of Memorandum of charge for imposing minor penalties<br>[Rule 11 of RS. (D & A) Rules, 1968]</div>' +
            '<table class="noline"><tr><td>' + H('सं') + ' / No. ' + ph(r.letter_no, opts, 'BB.TRSO.DAR.SUB.26.12') + '<br>' + H('मध्य रेल') + ' / CENTRAL RAILWAY</td>' +
            '<td class="dt">' + H('निर्गमस्थान') + ' / Place of Issue: ' + ph(r.place_of_issue, opts, 'Sr. DEE TRS (O) CSMT') + '<br>' +
            H('दिनांक') + ' / Date: ' + ph(fmtDate(r.letter_date), opts, 'dd.mm.yyyy') + '</td></tr></table>' +
            '<div class="title">' + H('ज्ञापन') + ' / MEMORANDUM</div>' + body(r, opts) +
            sigBlock(r, opts, 'Designation of the competent authority / (सक्षम प्राधिकारी का नाम और पदनाम)') +
            '<div class="addr">' + H('सेवा में') + ' / To,<br>' + H('श्री') + ' / ' + staffLine(r, opts) +
            '<br><small>(' + H('रेल कर्मचारी का नाम, पदनाम और कार्यालय') + ' / Name, Designation & office of the Railway servant).</small></div>' +
            (has(r.copy_to_text) ? '<div class="copyto"><b>' + esc(r.copy_to_text).replace(/\r?\n/g, '<br>') + '</b></div>' : '') +
            '<div class="annex"><div class="title">STATEMENT OF IMPUTATION OF MISCONDUCT OR MISBEHAVIOUR</div>' +
            '<div class="atitle">against ' + staffLine(r, opts) + '</div>' +
            (has(r.f_imputation) ? paras(r.f_imputation) : (opts && opts.placeholders ? '<p class="ph">the facts — what was observed, which rule or instruction was violated</p>' : '')) + '</div>';
    }

    var SHEETS = { SF1: sf1, SF4: sf4, SF5: sf5, SF7: sf7, SF11: sf11 };

    function renderDarSheet(record, opts) {
        var fn = SHEETS[record.form_code];
        if (!fn) return '<p>Unknown form.</p>';
        return fn(record, opts || {});
    }
    function darTitle(r) {
        var f = FORMS[r.form_code] || {};
        return [f.short || r.form_code, f.label, r.staff_name ? '— Shri ' + r.staff_name : '', r.letter_no || ('#' + r.id)]
            .filter(Boolean).join(' ');
    }
    function darSubject(r) {
        return (r.subject_text || (FORMS[r.form_code] || {}).label || 'D&AR letter');
    }

    /* Extra CSS over SsehqReport.SHEET_CSS. */
    var DAR_CSS = [
        '.sheet .gf{text-align:right;font-size:10.5pt;line-height:1.3;}',
        '.sheet .ftitle{text-align:center;font-weight:700;font-size:12pt;margin:2mm 0 4mm;line-height:1.35;}',
        '.sheet .ftitle small{font-weight:600;font-size:10.5pt;}',
        '.sheet .blank{display:inline-block;border-bottom:0.6pt dotted #000;line-height:1;}',
        '.sheet .ph{color:#b32020;font-weight:700;}',
        '.sheet table.sig{width:100%;border-collapse:collapse;margin:12mm 0 6mm;}',
        '.sheet table.sig td{border:none;padding:0;vertical-align:top;}',
        '.sheet table.sig td.r{width:46%;line-height:1.7;}',
        '.sheet table.sig small{font-size:9.5pt;font-weight:400;}',
        '.sheet .copyto{margin:4mm 0 0;line-height:1.5;}',
        '.sheet .copyto small,.sheet .addr small{font-size:9.5pt;}',
        '.sheet .addr{margin:5mm 0 0;line-height:1.5;}',
        '.sheet .fine{margin-top:3mm;font-size:10.5pt;}',
        '.sheet .annex{page-break-before:always;margin-top:6mm;}',
        '.sheet .annex .atitle{text-align:center;font-weight:600;margin:0 0 4mm;}',
        '.sheet table.board{width:90%;}',
        '.sheet p.deva{font-family:"Noto Sans Devanagari","Nirmala UI","Mangal",serif;font-size:11pt;}',
        '@media print{.sheet .ph{display:none;}}',
    ].join('\n');

    return {
        renderDarSheet: renderDarSheet,
        darTitle: darTitle,
        darSubject: darSubject,
        FORMS: FORMS,
        TEMPLATES: TEMPLATES,
        FORM_ORDER: FORM_ORDER,
        DESKS: DESKS,
        SIGNATORIES: SIGNATORIES,
        PLACE_DEFAULT: PLACE_DEFAULT,
        DAR_CSS: DAR_CSS,
        fmtDate: fmtDate,
        escapeHtml: esc,
    };
}));
