/* ===========================================================================
 * Cadre letter renderer — SINGLE SOURCE OF TRUTH
 *
 * Loaded two ways on purpose:
 *   • browser  <script src="/div/js/cadre-letter-render.js">  → window.CadreLetter
 *   • node     require('../public/div/js/cadre-letter-render.js')  (utils/cadreLetterHtml.js)
 *
 * The live preview on cadre-letter.html, the printout, and the copy filed into
 * div_documents all call renderSheet() with the same letter object, so they
 * cannot drift. SHEET_CSS is exported for the same reason — the editor page
 * injects it rather than keeping its own copy of the paper styles.
 *
 * Layout follows the HQ CLI (Cadre) letters in cadre-management/:
 *   मध्य रेल          | <office block, 3 Devanagari lines>
 *   No. …             | Date : …
 *   <addressee>       (no "To," — these letters don't use it)
 *         <banner>    NOTE | Reminder – I
 *         Sub: / Ref:
 *   <body>  <table>  <footer para>
 *                     <signature>
 *   Encl: / C/- / <NOTE approval chain>
 * =========================================================================== */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.CadreLetter = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ── helpers ─────────────────────────────────────────────────────────────
    // Escapes the apostrophe too: the editor embeds JSON in single-quoted
    // attributes (data-s='…'), and names like D'SOUZA are real.
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function nl2br(s) { return esc(s).replace(/\r?\n/g, '<br>'); }
    function has(s) { return s != null && String(s).trim() !== ''; }
    function lines(s) {
        return String(s == null ? '' : s).split(/\r?\n/).map(function (l) { return l.trim(); })
            .filter(function (l) { return l !== ''; });
    }

    // dd.mm.yyyy — the format every reference letter uses
    function fmtDate(d) {
        if (!d) return '';
        var dt = (d instanceof Date) ? d : new Date(d);
        if (isNaN(dt)) return String(d);
        var p = function (n) { return String(n).padStart(2, '0'); };
        return p(dt.getDate()) + '.' + p(dt.getMonth() + 1) + '.' + dt.getFullYear();
    }

    // Short-form designation, same convention as cli-nomination / transfer-letter
    function shortDesignation(designation) {
        if (!designation) return '';
        var d = String(designation).toLowerCase();
        var sr = d.indexOf('senior') >= 0 || /\bsr\b/.test(d);
        var assistant = d.indexOf('assistant') >= 0 || d.indexOf('asst') >= 0 || d.indexOf('astt') >= 0;
        var locoPilot = d.indexOf('loco') >= 0 && d.indexOf('pilot') >= 0;
        if (d.indexOf('motorman') >= 0) return 'MM';
        if (assistant && locoPilot) return sr ? 'Sr.ALP' : 'ALP';
        if (d.indexOf('shunter') >= 0) return sr ? 'Sr.LPS' : 'LPS';
        if (locoPilot && d.indexOf('goods') >= 0) return 'LPG';
        if (locoPilot && d.indexOf('ghat') >= 0) return 'LP Ghat';
        if (locoPilot && (d.indexOf('mail') >= 0 || d.indexOf('express') >= 0)) return 'LPM';
        if (locoPilot && d.indexOf('pass') >= 0) return 'LPP';
        return designation.length > 10 ? designation.substring(0, 8) + '..' : designation;
    }

    /* Token substitution. {{count}} and {{letter_date}} are always derived so a
     * transfer letter's "transfer 35 Sr.ALPs" stays true as rows are added or
     * removed; everything else comes from letter.tokens. An unfilled token is
     * left visible as ‹name› rather than blanked, so nothing ships half-written. */
    function applyTokens(text, letter, staff) {
        if (!has(text)) return '';
        var tokens = letter.tokens || {};
        if (typeof tokens === 'string') { try { tokens = JSON.parse(tokens); } catch (e) { tokens = {}; } }
        // A letter with a staff table counts its rows; a narrative letter with no
        // table (e.g. "transfer 35 Sr.ALPs") falls back to the typed token.
        var derived = {
            count: (staff && staff.length) ? staff.length : tokens.count,
            letter_date: fmtDate(letter.letter_date)
        };
        return String(text).replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, function (m, key) {
            var v = Object.prototype.hasOwnProperty.call(derived, key) ? derived[key] : tokens[key];
            return (v == null || String(v).trim() === '') ? '‹' + key + '›' : String(v);
        });
    }

    /* Body: blank line = new paragraph, single newline = line break inside one.
     *
     * **double asterisks** emphasise a run in bold. The reference letters rely
     * on this: the footplate-km letter (cadre-management/mis1.pdf) bolds the
     * cut-off date and both mentions of the 60,000-kilometre threshold, which
     * are the whole point of the letter. Markers are applied AFTER escaping, so
     * the text itself can never inject markup. */
    function inlineMarks(escaped) {
        return markTokens(escaped.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'));
    }

    /* An unfilled {{token}} renders as ‹name›. Wrap those so the preview can
     * shout about them — a placeholder that reaches a signed letter is the
     * worst kind of mistake, because it looks deliberate.
     *
     * Applied to text that is ALREADY escaped: ‹ and › are not HTML-special
     * and pass through esc() untouched, so the markers can be found afterwards
     * without the letter's own text ever being able to inject markup. */
    function markTokens(escaped) {
        return escaped.replace(/‹([a-z0-9_]+)›/gi, '<span class="tok">‹$1›</span>');
    }
    function paragraphs(text) {
        if (!has(text)) return '';
        return String(text).split(/\r?\n\s*\r?\n/)
            .map(function (p) { return p.trim(); })
            .filter(Boolean)
            .map(function (p) { return '<p>' + inlineMarks(nl2br(p)) + '</p>'; })
            .join('');
    }

    /* Page margins, measured off the scanned originals (ink extents, their
     * Letter page normalised to A4):
     *
     *     letter            left   right   text width
     *     LP-Shunter        33.2   32.1    150.3
     *     NOTE              31.8   20.5    163.3
     *     Reminder          31.0   21.2    163.3
     *     Footplate km      31.0   22.6    161.9
     *     Initial ALP       12.7   13.8    189.0   <- deliberately narrow
     *
     * Four of the five sit near 31mm left / 21mm right — left wider because
     * these get punched and filed. The initial-ALP letter is the exception on
     * purpose: its seven-column table needs the width, and at NORMAL margins
     * every name in it wraps and the letter runs to three pages. So this is a
     * property of the letter type, not one global setting.
     *
     * A keyword, not a free CSS string: the value is interpolated into an
     * @page rule, and a stored string would be an injection point the day the
     * type catalogue becomes editable in the UI. */
    var PAGE_MARGINS = {
        NORMAL: '16mm 19mm 14mm 28mm',   // top right bottom left
        WIDE:   '14mm 14mm 12mm 15mm'    // wide tables (initial-ALP family)
    };
    function pageMargin(letter) {
        return PAGE_MARGINS[letter && letter.page_margin] || PAGE_MARGINS.NORMAL;
    }

    // mm of blank space above the signature; see the comment at its use.
    function sigGap(letter) {
        var n = Number(letter && letter.sig_gap);
        return (isFinite(n) && n >= 0 && n <= 60) ? n : 18;
    }

    function parseJson(v, fallback) {
        if (v == null) return fallback;
        if (typeof v === 'object') return v;
        try { return JSON.parse(v); } catch (e) { return fallback; }
    }

    // ── table ───────────────────────────────────────────────────────────────
    // A column with `src` reads a real staff column; without one it reads
    // extra[key]. Adjacent columns sharing `group` render a merged header
    // (the footplate-km letter's TOTAL KM → As per Lobby / As per Employee).
    function cellValue(col, row, index) {
        // An auto-numbered column normally just counts, but a stored sr_no wins
        // when there is one. The footplate-km letter's list runs 1,2,3,4,6,7…
        // — it references an earlier list that row 5 dropped out of, and
        // renumbering it to 1-10 would quietly change what the letter says.
        if (col.auto === 'index') {
            var n = Number(row.sr_no);
            return (isFinite(n) && n > 0) ? String(n) : String(index + 1);
        }
        var extra = parseJson(row.extra, {}) || {};
        var v = col.src ? row[col.src] : extra[col.key];
        if ((v == null || v === '') && extra[col.key] != null) v = extra[col.key];
        if (v == null || v === '') v = col.default || '';
        return String(v);
    }

    function renderHead(columns) {
        var anyGroup = columns.some(function (c) { return has(c.group); });
        if (!anyGroup) {
            return '<tr>' + columns.map(function (c) {
                return '<th' + (c.w ? ' style="width:' + esc(c.w) + '"' : '') + '>' + nl2br(c.label) + '</th>';
            }).join('') + '</tr>';
        }
        var r1 = '', r2 = '', i = 0;
        while (i < columns.length) {
            var c = columns[i];
            if (!has(c.group)) {
                r1 += '<th rowspan="2"' + (c.w ? ' style="width:' + esc(c.w) + '"' : '') + '>' + nl2br(c.label) + '</th>';
                i++;
            } else {
                var g = c.group, span = 0;
                while (i + span < columns.length && columns[i + span].group === g) {
                    r2 += '<th' + (columns[i + span].w ? ' style="width:' + esc(columns[i + span].w) + '"' : '') +
                          '>' + nl2br(columns[i + span].label) + '</th>';
                    span++;
                }
                r1 += '<th colspan="' + span + '">' + nl2br(g) + '</th>';
                i += span;
            }
        }
        return '<tr>' + r1 + '</tr><tr>' + r2 + '</tr>';
    }

    function renderStaffTable(letter, staff) {
        var schema = parseJson(letter.table_columns, null);
        var columns = schema && schema.columns;
        if (!columns || !columns.length || !staff || !staff.length) return '';
        var body = staff.map(function (row, i) {
            return '<tr>' + columns.map(function (c) {
                // Name and PF are left-aligned in every reference letter; SR,
                // lobbies and codes are centred. `align` overrides either way.
                var leftByDefault = (c.key === 'name' || c.key === 'pf');
                var cls = (c.align === 'left' || (leftByDefault && c.align !== 'center'))
                    ? ' class="l"' : '';
                return '<td' + cls + '>' + nl2br(cellValue(c, row, i)) + '</td>';
            }).join('') + '</tr>';
        }).join('');
        return '<table class="grid"><thead>' + renderHead(columns) + '</thead><tbody>' + body + '</tbody></table>';
    }

    // Non-staff grids: the Reminder cadre-position table and the MLD day-wise
    // schedule. A row with span:true is a full-width sub-heading (e.g. "DIESEL
    // (DTC KYN)" splitting the electric and diesel halves of the schedule).
    /* A column declared {"auto":"sum","sum":["csmt","kyn","pnvl"]} is DERIVED,
     * never typed. The reminder letter's TOTAL is the lobby figures added up
     * (495+369+151=1015 and so on, in all four rows of the original), so
     * computing it removes a whole class of arithmetic slip from a letter that
     * goes to Personnel as a statement of fact.
     *
     * Blank if no source cell holds a number — better an empty cell than a
     * confident 0. Commas are tolerated so "1,015" still adds up. */
    function sumCells(row, keys) {
        if (!keys || !keys.length) return '';
        var total = 0, seen = false;
        for (var i = 0; i < keys.length; i++) {
            var raw = String(row[keys[i]] == null ? '' : row[keys[i]]).replace(/,/g, '').trim();
            if (raw === '') continue;
            var n = Number(raw);
            if (!isFinite(n)) return String(row[keys[i]]);   // not numeric — leave it alone
            total += n; seen = true;
        }
        return seen ? String(total) : '';
    }

    function renderAuxTable(letter) {
        var aux = parseJson(letter.aux_data, null);
        if (!aux) return '';
        var schema = aux.schema ? aux.schema : aux;
        var columns = schema && schema.columns;
        var rows = aux.rows || schema.rows;
        if (!columns || !columns.length || !rows || !rows.length) return '';
        var body = rows.map(function (row, i) {
            /* A divider row inside the grid — the field-training schedule splits
             * its days with a "DIESEL (DTC KYN)" band. It spans the first two
             * columns only; REMARK stays a cell of its own so that column's
             * ruling runs unbroken down the table, as in the original.
             * spanCols defaults to every column when not given. */
            if (row.span) {
                var n = Number(row.spanCols) || columns.length;
                n = Math.max(1, Math.min(n, columns.length));
                var band = '<tr><td class="c" colspan="' + n + '">' +
                           nl2br(row.activity || row.label || '') + '</td>';
                for (var k = n; k < columns.length; k++) band += '<td></td>';
                return band + '</tr>';
            }
            return '<tr>' + columns.map(function (c) {
                var v;
                if (c.auto === 'index') v = String(i + 1);
                else if (c.auto === 'sum') v = sumCells(row, c.sum);
                else v = (row[c.key] == null ? '' : row[c.key]);
                var cls = c.align === 'left' || c.key === 'particulars' ? ' class="l"' : '';
                return '<td' + cls + '>' + nl2br(v) + '</td>';
            }).join('') + '</tr>';
        }).join('');
        return '<table class="grid"><thead>' + renderHead(columns) + '</thead><tbody>' + body + '</tbody></table>';
    }

    // ── the sheet ───────────────────────────────────────────────────────────
    /**
     * @param {object} letter  a div_cadre_letters row (JSON columns may be
     *                         objects or strings — both accepted)
     * @param {Array}  staff   div_cadre_letter_staff rows, in sr_no order
     * @param {object} [opts]  {placeholders:true} shows grey hints for empty
     *                         fields — used by the live editor, never on print
     * @returns {string} the inner HTML of .sheet
     */
    function renderSheet(letter, staff, opts) {
        letter = letter || {};
        staff = staff || [];
        opts = opts || {};
        var ph = function (val, hint) {
            if (has(val)) return inlineMarks(nl2br(val));
            return opts.placeholders ? '<span class="ph">' + esc(hint) + '</span>' : '';
        };

        var addressee = has(letter.addressee_text_hi) ? letter.addressee_text_hi : letter.addressee_text;
        var addrDeva = has(letter.addressee_text_hi);
        var subject = applyTokens(letter.subject_text, letter, staff);
        var refLines = lines(applyTokens(letter.ref_text, letter, staff));

        var out = '';
        /* Body font size is per type. Most letters are 12pt, but a long one —
         * the field-training schedule, with a 16-row grid and five closing
         * blocks — is set smaller in Word so it still fits one page. The table
         * and its headers are sized in em, so one number scales the whole
         * sheet and 12pt reproduces the previous 10.5pt / 8.5pt exactly. */
        var fontPt = Number(letter.font_pt);
        if (!isFinite(fontPt) || fontPt < 7 || fontPt > 14) fontPt = 12;

        // Letterhead — no logo and no rules; these letters have neither.
        out += '<table class="lh"><tr>' +
                 '<td class="l"><div class="hi">मध्य रेल</div></td>' +
                 '<td class="r deva">' + nl2br(letter.office_header_text) + '</td>' +
               '</tr></table>';
        /* A NOTE labels itself ON the number line — "No. …   NOTE   Date : …"
         * (cadre-management/Exemption of Refersher.pdf). Every other banner
         * ("Reminder – I") is a centred line of its own further
         * down, below the addressee — see reminder.pdf. */
        var bannerInline = letter.doc_kind === 'NOTE' && has(letter.banner_text);
        out += '<table class="noline"><tr>' +
                 '<td class="no">' + (has(letter.letter_no) ? 'No. ' + esc(letter.letter_no)
                       : (opts.placeholders ? '<span class="ph">No. …</span>' : '')) + '</td>' +
                 (bannerInline ? '<td class="mid">' + esc(String(letter.banner_text).trim()) + '</td>' : '') +
                 '<td class="dt">Date : ' + esc(fmtDate(letter.letter_date)) + '</td>' +
               '</tr></table>';

        // A NOTE is internal and has no addressee at all — don't leave an empty
        // block holding its margin open.
        if (has(addressee) || opts.placeholders) {
            out += '<div class="addr' + (addrDeva ? ' deva' : '') + '">' + ph(addressee, 'Addressee') + '</div>';
        }

        if (has(letter.banner_text) && !bannerInline) {
            var b = String(letter.banner_text).trim();
            out += '<div class="banner">' + esc(b) + '</div>';
        }

        if (has(subject) || opts.placeholders || refLines.length) {
            out += '<table class="subref">';
            out += '<tr><td class="lbl">Sub:</td><td>' + ph(subject, 'Subject of the letter') + '</td></tr>';
            refLines.forEach(function (r, i) {
                out += '<tr><td class="lbl">' + (i === 0 ? 'Ref:' : '') + '</td><td>' + inlineMarks(nl2br(r)) + '</td></tr>';
            });
            out += '</table>';
        }

        var bodyHtml = paragraphs(applyTokens(letter.body_text, letter, staff));
        /* Most letters indent the first line of each paragraph; the
         * footplate-km letter sets them flush left. body_indent=0 on the type
         * (copied onto the letter) selects that. Default stays indented. */
        var bodyCls = 'body' + (Number(letter.body_indent) === 0 ? ' flush' : '');
        if (bodyHtml) out += '<div class="' + bodyCls + '">' + bodyHtml + '</div>';
        else if (opts.placeholders) out += '<div class="' + bodyCls + '"><p class="ph">Body of the letter…</p></div>';

        out += renderStaffTable(letter, staff);
        out += renderAuxTable(letter);

        var footHtml = paragraphs(applyTokens(letter.footer_text, letter, staff));
        if (footHtml) out += '<div class="body foot-para">' + footHtml + '</div>';

        // Signature — designation only, no name, right-aligned
        /* Space above the signature is where the pen goes. The originals vary
         * with how full the page is — 28.9mm on the LP-Shunter letter, 25.0 on
         * the Reminder, 14.5 on the footplate one, 13.4 on the NOTE — so this
         * is per type, defaulting to 18mm. Too small and there is nowhere to
         * sign, which is what 6mm looked like on a half-page posting letter. */
        out += '<div class="sig" style="margin-top:' + sigGap(letter) + 'mm">';
        if (has(letter.signing_designation_hindi)) {
            out += '<div class="deva">' + nl2br(letter.signing_designation_hindi) + '</div>';
        } else if (has(letter.signing_designation)) {
            out += '<div>' + nl2br(letter.signing_designation) + '</div>';
        }
        // No place line on an internal NOTE — it is signed "CLI (Cader ) CSMT" alone.
        if (has(letter.signing_place)) {
            out += '<div class="deva">' + nl2br(letter.signing_place) + '</div>';
        }
        out += '</div>';

        if (has(letter.encl_text)) {
            out += '<div class="encl"><b>Encl.:</b> ' + inlineMarks(nl2br(applyTokens(letter.encl_text, letter, staff))) + '</div>';
        }
        if (has(letter.cc_text)) {
            out += '<div class="cc">' + lines(letter.cc_text).map(function (l) {
                return '<div>' + nl2br(l) + '</div>';
            }).join('') + '</div>';
        }
        if (letter.doc_kind === 'NOTE' && has(letter.approval_chain_text)) {
            out += '<div class="chain">' + lines(letter.approval_chain_text).map(function (l) {
                return '<div>' + nl2br(l) + '</div>';
            }).join('') + '</div>';
        }

        out += '<div class="gen-credit">Prepared from crtms.in</div>';
        // Wrapped so the per-type font size cascades to everything, including
        // the tables, which are sized in em.
        return '<div class="sheet-body" style="font-size:' + fontPt + 'pt">' + out + '</div>';
    }

    /* Paper styles. Shared so the editor preview, the print output and the
     * archived page are the same document. Sizes are in pt/mm because this is
     * a physical A4 page, not a web layout. */
    var SHEET_CSS = [
        /* line-height follows Word's single spacing (~1.15-1.2 for 12pt Times), not
         * a web default: these letters ARE Word documents at single spacing.
         * At 1.45 the text-heavy footplate-km letter
         * (cadre-management/mis1.pdf) ran its body to 77.5mm where the original
         * uses ~55mm, and spilled onto a second page. Table-dominated letters
         * hid this because their height is mostly rows. 1.15 is what finally
         * let the refresher-exemption NOTE keep its ADEE/DEE/Sr.DEE approval
         * chain on page 1, as the original does. */
        '.sheet{font-family:"Times New Roman",Times,serif;font-size:12pt;line-height:1.15;color:#000;}',
        '.sheet .deva{font-family:"Noto Sans Devanagari","Times New Roman",serif;}',
        /* Tables, not flexbox, for the three side-by-side rows (letterhead,
         * No./Date, Sub/Ref). Word's HTML engine does not support flexbox: the
         * exported .doc stacked the office block under "मध्य रेल" and dropped
         * the date onto its own left-aligned line. Tables render the same in
         * the browser and survive Word. */
        '.sheet table.lh{width:100%;border-collapse:collapse;}',
        '.sheet table.lh td{border:none;padding:0;vertical-align:top;}',
        /* The office block hugs the right edge, as flex space-between did:
         * a 1% width plus nowrap shrink-wraps the cell to its content and
         * lets the left cell take the rest. A fixed percentage instead
         * parked it mid-page. */
        '.sheet table.lh td.l{width:auto;}',
        '.sheet table.lh td.r{width:1%;}',
        '.sheet table.lh .hi{font-family:"Noto Sans Devanagari","Times New Roman",serif;font-size:12pt;}',
        '.sheet table.lh td.r{text-align:left;font-size:11.5pt;line-height:1.5;white-space:nowrap;}',
        /* Preamble spacing is deliberately tight. The 28-row LP-Shunter letter
         * (cadre-management/trf of lps.pdf) is ONE page in Word; with looser
         * gaps it ended at 276.5mm against 269mm printable and threw just the
         * signature onto a second, near-empty page. The slack was spread across
         * these gaps, not in any one of them — measure the whole preamble
         * (table top should land near 68mm) before loosening any of them. */
        '.sheet table.noline{width:100%;border-collapse:collapse;margin:1mm 0 4mm;}',
        '.sheet table.noline td{border:none;padding:0;vertical-align:baseline;}',
        '.sheet table.noline td.dt{width:1%;text-align:right;white-space:nowrap;}',
        // the NOTE label, centred between the number and the date
        '.sheet table.noline td.mid{text-align:center;font-weight:400;}',
        '.sheet .addr{margin:0 0 4mm;line-height:1.4;}',
        '.sheet .banner{text-align:center;font-weight:700;margin:0 0 3mm;}',
        '.sheet table.subref{margin:0 0 4mm 12mm;border-collapse:collapse;}',
        '.sheet table.subref td{border:none;padding:0;vertical-align:top;}',
        '.sheet table.subref td.lbl{width:11mm;white-space:nowrap;}',
        '.sheet .body{text-align:justify;}',
        '.sheet .body p{margin:0 0 3mm;text-indent:12mm;}',
        '.sheet .body.flush p{text-indent:0;}',
        '.sheet .foot-para{margin-top:3mm;}',
        /* table-layout:fixed is load-bearing: it makes the per-column widths in
         * the schema actually apply. Under the default `auto`, a long heading
         * ("PROPOSED LOBBY OF POSTING") widens its own column and squeezes NAME
         * until every name wraps to two lines — which nearly doubles the height
         * of a 69-row letter and pushes it from 2 printed pages to 4.
         *
         * The row metrics below are measured, not guessed: the 69-row ALP letter
         * (cadre-management/Document 3.pdf) fits 32 rows on page 1 and 37 on
         * page 2. That needs a ~5.5mm row, which is padding 0.5mm x2 + one
         * 4.0mm line. Loosening either sends the letter onto a third page. */
        '.sheet table.grid{border-collapse:collapse;table-layout:fixed;width:92%;margin:3mm auto 4mm;font-size:0.875em;line-height:1.1;}',
        '.sheet table.grid th,.sheet table.grid td{border:1px solid #000;padding:0.5mm 1.2mm;text-align:center;vertical-align:middle;word-wrap:break-word;}',
        /* Headers are smaller and more tightly padded than the data cells so a
         * long label fits its narrow column WITHOUT word-wrap:break-word
         * snapping it mid-word — at 9.8pt the ALP letter printed "PROPOSE/D
         * LOBBY" and "REMA/RK". Check header labels still break only at spaces
         * if you narrow a column. */
        '.sheet table.grid th{font-weight:400;font-size:0.708em;line-height:1.15;padding:0.5mm 0.8mm;}',
        '.sheet table.grid td.l{text-align:left;}',
        '.sheet table.grid td.c{text-align:center;font-weight:600;}',
        '.sheet .sig{margin:0 0 0 auto;width:70mm;text-align:center;line-height:1.4;}',
        '.sheet .encl{margin-top:5mm;}',
        '.sheet .cc{margin-top:8mm;font-size:11pt;line-height:1.45;}',
        /* The approval chain is signing space, so its gaps are whitespace rather
         * than content — which is what gets trimmed when a NOTE is close to the
         * page edge. At 10mm/2.2 the refresher-exemption NOTE overran by 9.2mm
         * at the corrected page margins and threw the chain onto page 2. */
        '.sheet .chain{margin-top:6mm;line-height:2.0;}',
        '.sheet .ph{color:#a09a86;font-style:italic;}',
        /* Provenance line, the counterpart of the Word original's
         * "\\10.31.212.176\mydoc\word\tech 04.doc" footer — which sits at the
         * bottom of EVERY page, not after the signature.
         *
         * In print it is taken out of the flow and pinned to the page bottom.
         * In the flow it added ~11mm after the signature, which is what pushed
         * the one-page LP-Shunter letter onto a second, near-empty page: the
         * letter itself ended at 265.6mm, inside the 269mm printable area, and
         * only this line overran it. */
        /* Unfilled placeholder — loud on screen so it cannot be missed, plain
         * black on paper. Red ink on an official letter would be worse than
         * the omission it is flagging, and the letter should not be printed
         * with one of these in it at all. */
        '.sheet .tok{color:#c0221b;font-weight:700;}',
        '@media print{.sheet .tok{color:#000;font-weight:400;}}',
        '.sheet .gen-credit{margin-top:8mm;font-size:6.5pt;color:#c9ced6;letter-spacing:.2px;}',
        '@media print{.sheet .gen-credit{position:fixed;bottom:0;left:0;margin:0;}}'
    ].join('\n');

    return {
        renderSheet: renderSheet,
        SHEET_CSS: SHEET_CSS,
        applyTokens: applyTokens,
        shortDesignation: shortDesignation,
        fmtDate: fmtDate,
        escapeHtml: esc,
        pageMargin: pageMargin,
        sigGap: sigGap,
        PAGE_MARGINS: PAGE_MARGINS
    };
}));
