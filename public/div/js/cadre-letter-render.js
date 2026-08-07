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
 *         <banner>    NOTE | Reminder – I | *******
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

    // Body: blank line = new paragraph, single newline = line break inside one.
    function paragraphs(text) {
        if (!has(text)) return '';
        return String(text).split(/\r?\n\s*\r?\n/)
            .map(function (p) { return p.trim(); })
            .filter(Boolean)
            .map(function (p) { return '<p>' + nl2br(p) + '</p>'; })
            .join('');
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
        if (col.auto === 'index') return String(index + 1);
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
                var cls = (c.key === 'name' || c.align === 'left') ? ' class="l"' : '';
                return '<td' + cls + '>' + nl2br(cellValue(c, row, i)) + '</td>';
            }).join('') + '</tr>';
        }).join('');
        return '<table class="grid"><thead>' + renderHead(columns) + '</thead><tbody>' + body + '</tbody></table>';
    }

    // Non-staff grids: the Reminder cadre-position table and the MLD day-wise
    // schedule. A row with span:true is a full-width sub-heading (e.g. "DIESEL
    // (DTC KYN)" splitting the electric and diesel halves of the schedule).
    function renderAuxTable(letter) {
        var aux = parseJson(letter.aux_data, null);
        if (!aux) return '';
        var schema = aux.schema ? aux.schema : aux;
        var columns = schema && schema.columns;
        var rows = aux.rows || schema.rows;
        if (!columns || !columns.length || !rows || !rows.length) return '';
        var body = rows.map(function (row, i) {
            if (row.span) {
                return '<tr><td class="c" colspan="' + columns.length + '">' + nl2br(row.activity || row.label || '') + '</td></tr>';
            }
            return '<tr>' + columns.map(function (c) {
                var v = c.auto === 'index' ? String(i + 1) : (row[c.key] == null ? '' : row[c.key]);
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
            if (has(val)) return nl2br(val);
            return opts.placeholders ? '<span class="ph">' + esc(hint) + '</span>' : '';
        };

        var addressee = has(letter.addressee_text_hi) ? letter.addressee_text_hi : letter.addressee_text;
        var addrDeva = has(letter.addressee_text_hi);
        var subject = applyTokens(letter.subject_text, letter, staff);
        var refLines = lines(applyTokens(letter.ref_text, letter, staff));

        var out = '';

        // Letterhead — no logo and no rules; these letters have neither.
        out += '<div class="lh">' +
                 '<div class="l"><div class="hi">मध्य रेल</div></div>' +
                 '<div class="r deva">' + nl2br(letter.office_header_text) + '</div>' +
               '</div>';
        out += '<div class="noline">' +
                 '<div class="no">' + (has(letter.letter_no) ? 'No. ' + esc(letter.letter_no)
                       : (opts.placeholders ? '<span class="ph">No. …</span>' : '')) + '</div>' +
                 '<div class="dt">Date : ' + esc(fmtDate(letter.letter_date)) + '</div>' +
               '</div>';

        out += '<div class="addr' + (addrDeva ? ' deva' : '') + '">' + ph(addressee, 'Addressee') + '</div>';

        if (has(letter.banner_text)) {
            var b = String(letter.banner_text).trim();
            var bcls = b === '*******' ? 'banner stars' : 'banner';
            out += '<div class="' + bcls + '">' + esc(b) + '</div>';
        }

        if (has(subject) || opts.placeholders || refLines.length) {
            out += '<div class="subref">';
            out += '<div class="sub"><span class="lbl">Sub:</span> <span>' + ph(subject, 'Subject of the letter') + '</span></div>';
            refLines.forEach(function (r, i) {
                out += '<div class="ref"><span class="lbl">' + (i === 0 ? 'Ref:' : '') + '</span> <span>' + nl2br(r) + '</span></div>';
            });
            out += '</div>';
        }

        var bodyHtml = paragraphs(applyTokens(letter.body_text, letter, staff));
        if (bodyHtml) out += '<div class="body">' + bodyHtml + '</div>';
        else if (opts.placeholders) out += '<div class="body"><p class="ph">Body of the letter…</p></div>';

        out += renderStaffTable(letter, staff);
        out += renderAuxTable(letter);

        var footHtml = paragraphs(applyTokens(letter.footer_text, letter, staff));
        if (footHtml) out += '<div class="body foot-para">' + footHtml + '</div>';

        // Signature — designation only, no name, right-aligned
        out += '<div class="sig">';
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
            out += '<div class="encl"><b>Encl.:</b> ' + nl2br(applyTokens(letter.encl_text, letter, staff)) + '</div>';
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
        return out;
    }

    /* Paper styles. Shared so the editor preview, the print output and the
     * archived page are the same document. Sizes are in pt/mm because this is
     * a physical A4 page, not a web layout. */
    var SHEET_CSS = [
        '.sheet{font-family:"Times New Roman",Times,serif;font-size:12pt;line-height:1.45;color:#000;}',
        '.sheet .deva{font-family:"Noto Sans Devanagari","Times New Roman",serif;}',
        '.sheet .lh{display:flex;justify-content:space-between;align-items:flex-start;gap:10mm;}',
        '.sheet .lh .l .hi{font-family:"Noto Sans Devanagari","Times New Roman",serif;font-size:12pt;}',
        '.sheet .lh .r{text-align:left;font-size:11.5pt;line-height:1.5;white-space:nowrap;}',
        '.sheet .noline{display:flex;justify-content:space-between;align-items:baseline;margin:1mm 0 6mm;}',
        '.sheet .noline .dt{white-space:nowrap;}',
        '.sheet .addr{margin:0 0 6mm;line-height:1.5;}',
        '.sheet .banner{text-align:center;font-weight:700;margin:0 0 4mm;}',
        '.sheet .banner.stars{font-weight:400;letter-spacing:2px;}',
        '.sheet .subref{margin:0 0 5mm;padding-left:12mm;}',
        '.sheet .subref .sub,.sheet .subref .ref{display:flex;gap:2mm;align-items:flex-start;}',
        '.sheet .subref .lbl{flex:0 0 11mm;font-weight:400;}',
        '.sheet .subref .sub{font-weight:400;}',
        '.sheet .body{text-align:justify;}',
        '.sheet .body p{margin:0 0 3.5mm;text-indent:12mm;}',
        '.sheet .foot-para{margin-top:3mm;}',
        /* table-layout:fixed is load-bearing: it makes the per-column widths in
         * the schema actually apply. Under the default `auto`, a long heading
         * ("PROPOSED LOBBY OF POSTING") widens its own column and squeezes NAME
         * until every name wraps to two lines — which nearly doubles the height
         * of a 69-row letter and pushes it from 2 printed pages to 4. */
        '.sheet table.grid{border-collapse:collapse;table-layout:fixed;width:92%;margin:4mm auto 5mm;font-size:10.5pt;line-height:1.2;}',
        '.sheet table.grid th,.sheet table.grid td{border:1px solid #000;padding:0.8mm 1.4mm;text-align:center;vertical-align:middle;word-wrap:break-word;}',
        '.sheet table.grid th{font-weight:400;font-size:9.8pt;line-height:1.15;}',
        '.sheet table.grid td.l{text-align:left;}',
        '.sheet table.grid td.c{text-align:center;font-weight:600;}',
        '.sheet .sig{margin:12mm 0 0 auto;width:70mm;text-align:center;line-height:1.4;}',
        '.sheet .encl{margin-top:5mm;}',
        '.sheet .cc{margin-top:8mm;font-size:11pt;line-height:1.45;}',
        '.sheet .chain{margin-top:10mm;line-height:2.2;}',
        '.sheet .ph{color:#a09a86;font-style:italic;}',
        '.sheet .gen-credit{margin-top:8mm;font-size:6.5pt;color:#c9ced6;letter-spacing:.2px;}'
    ].join('\n');

    return {
        renderSheet: renderSheet,
        SHEET_CSS: SHEET_CSS,
        applyTokens: applyTokens,
        shortDesignation: shortDesignation,
        fmtDate: fmtDate,
        escapeHtml: esc
    };
}));
