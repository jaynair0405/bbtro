// Transfer Letter PDF renderer (pdfkit) — used by POST /:id/finalize to
// auto-file the letter into the Documents repository. Layout mirrors the
// uniform letter format (reference: tmp/transfer_letter_new_format.jpeg).
//
// NOTE: pdfkit's built-in fonts are WinAnsi-encoded and cannot render
// Devanagari, so the filed PDF signature block is English-only. The
// browser print view of the letter page remains bilingual.

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '..', 'public', 'img', 'railway-logo.png');

function fmtDate(d) {
    if (!d) return '';
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt)) return String(d);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${dt.getFullYear()}`;
}

function lines(text) {
    return String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
}

// Short-form designation (same convention used on cli-nomination / transfer-letter.html)
function shortDesignation(designation) {
    if (!designation) return '';
    const d = designation.toLowerCase();
    const sr = d.includes('senior') || /\bsr\b/.test(d);
    const assistant = d.includes('assistant') || d.includes('asst') || d.includes('astt');
    const locoPilot = d.includes('loco') && d.includes('pilot');
    if (d.includes('motorman')) return 'MM';
    if (assistant && locoPilot) return sr ? 'Sr.ALP' : 'ALP';
    if (d.includes('shunter')) return sr ? 'Sr.LPS' : 'LPS';
    if (locoPilot && d.includes('goods')) return 'LPG';
    if (locoPilot && d.includes('ghat')) return 'LP Ghat';
    if (locoPilot && (d.includes('mail') || d.includes('express'))) return 'LPM';
    if (locoPilot && d.includes('pass')) return 'LPP';
    return designation.length > 10 ? designation.substring(0, 8) + '..' : designation;
}

/**
 * @param {object} letter    div_transfer_letters row (+ from_office_name/to_office_name)
 * @param {Array}  staffRows div_transfer_letter_staff rows (snapshots preferred)
 * @returns {Promise<Buffer>}
 */
function renderTransferLetterPdf(letter, staffRows) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const left = doc.page.margins.left;
        const usableW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const usableBottom = doc.page.height - doc.page.margins.bottom;

        // ── Letterhead: name left · logo centre · office block + date right ──
        const headTop = doc.y;
        doc.font('Helvetica-Bold').fontSize(12)
            .text('CENTRAL RAILWAY', left, headTop + 8, { width: 200 });

        if (fs.existsSync(LOGO_PATH)) {
            try {
                doc.image(LOGO_PATH, left + usableW / 2 - 28, headTop, { width: 56 });
            } catch (e) { /* logo optional */ }
        }

        const rightX = left + usableW - 220;
        doc.font('Helvetica-Bold').fontSize(10);
        let ry = headTop;
        for (const l of lines(letter.office_header_text)) {
            doc.text(l, rightX, ry, { width: 220 });
            ry = doc.y;
        }
        doc.font('Helvetica').fontSize(10)
            .text(`Date: ${fmtDate(letter.letter_date)}`, rightX, ry, { width: 220 });

        // Double rule under the header
        let y = Math.max(doc.y, headTop + 62) + 6;
        doc.moveTo(left, y).lineTo(left + usableW, y).lineWidth(1).stroke('#000000');
        doc.moveTo(left, y + 2.5).lineTo(left + usableW, y + 2.5).lineWidth(0.8).stroke('#000000');
        y += 14;

        // ── No. / To / Sub / Ref ─────────────────────────────────────────────
        doc.font('Helvetica').fontSize(11);
        if (letter.letter_no) {
            doc.text(`No. ${letter.letter_no}`, left, y, { width: usableW });
            y = doc.y + 6;
        }
        doc.text('To,', left, y);
        y = doc.y;
        for (const l of lines(letter.addressee_text)) {
            doc.font('Helvetica-Bold').text(l, left + 18, y, { width: usableW - 18 });
            y = doc.y;
        }
        y += 10;

        doc.font('Helvetica-Bold')
            .text(`Sub.: ${letter.subject_text || ''}`, left + 30, y, { width: usableW - 30 });
        y = doc.y + 4;
        if (letter.ref_text) {
            doc.font('Helvetica-Bold')
                .text(`Ref.: ${letter.ref_text}`, left + 30, y, { width: usableW - 30 });
            y = doc.y + 4;
        }
        y += 8;

        // ── Body paragraph ───────────────────────────────────────────────────
        doc.font('Helvetica').fontSize(11)
            .text(String(letter.body_text || ''), left, y, {
                width: usableW, align: 'justify', indent: 36, lineGap: 2,
            });
        y = doc.y + 12;

        // ── Staff table (Remarks column only when any staff has one) ────────
        const anyRemarks = staffRows.some(s => (s.remarks || '').trim());
        const headers = ['S.N', 'PF No.', 'Name', 'Reporting date of existing lobby',
            'Relieving date', 'Actual footplate KM of present Lobby', 'Reporting Date'];
        const colW = [26, 78, 118, 78, 68, 82, 68];
        if (anyRemarks) { headers.push('Remarks'); colW.push(88); }
        const scale = usableW / colW.reduce((a, b) => a + b, 0);
        const cw = colW.map(w => w * scale);

        const drawTableHeader = (ty) => {
            doc.font('Helvetica-Bold').fontSize(8.5);
            const headH = anyRemarks ? 48 : 40; // narrower columns wrap one line more
            let x = left;
            headers.forEach((h, i) => {
                doc.rect(x, ty, cw[i], headH).stroke('#000000');
                doc.text(h, x + 3, ty + 6, { width: cw[i] - 6, align: 'center' });
                x += cw[i];
            });
            return ty + headH;
        };

        y = drawTableHeader(y);
        doc.font('Helvetica').fontSize(9.5);
        staffRows.forEach((s, i) => {
            const cells = [
                String(i + 1),
                s.pf_number_snapshot || '',
                s.name_snapshot || '',
                fmtDate(s.existing_reporting_date),
                fmtDate(s.relieving_date),
                (s.footplate_km ?? '') === '' ? '' : String(s.footplate_km),
                fmtDate(s.new_reporting_date),
            ];
            if (anyRemarks) cells.push(s.remarks || '');
            const desig = s.designation_name ? shortDesignation(s.designation_name) : '';
            // Two-line PF cell (number + designation) needs a taller row.
            const rowH = Math.max(28, anyRemarks && (s.remarks || '').length > 24 ? 30 : 20);
            if (y + rowH > usableBottom) {
                doc.addPage();
                y = drawTableHeader(doc.page.margins.top);
                doc.font('Helvetica').fontSize(9.5);
            }
            let x = left;
            cells.forEach((c, ci) => {
                doc.rect(x, y, cw[ci], rowH).stroke('#000000');
                doc.text(c, x + 3, y + 5.5, { width: cw[ci] - 6, align: ci === 2 ? 'left' : 'center', ellipsis: true });
                if (ci === 1 && desig) {
                    doc.fontSize(7.5).fillColor('#555555')
                        .text(desig, x + 3, y + 17, { width: cw[ci] - 6, align: 'center', ellipsis: true });
                    doc.fontSize(9.5).fillColor('#000000');
                }
                x += cw[ci];
            });
            y += rowH;
        });
        y += 12;

        // ── Bullets + footer line ────────────────────────────────────────────
        const ensureSpace = (need) => {
            if (y + need > usableBottom) { doc.addPage(); y = doc.page.margins.top; }
        };
        doc.font('Helvetica').fontSize(10);
        for (const b of lines(letter.bullets_text)) {
            ensureSpace(16);
            doc.text(`•  ${b}`, left + 14, y, { width: usableW - 14 });
            y = doc.y + 2;
        }
        doc.fontSize(11);
        if (letter.footer_text) {
            ensureSpace(20);
            doc.text(letter.footer_text, left, y + 4, { width: usableW });
            y = doc.y;
        }

        // ── Signature (right) + C/- (left, below) ────────────────────────────
        ensureSpace(90);
        y += 46; // space for the physical signature
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text(letter.signing_designation || 'Chief Crew Controller', rightX, y, { width: 220, align: 'center' });
        doc.text(letter.from_office_code || '', rightX, doc.y + 1, { width: 220, align: 'center' });
        y = doc.y + 18;

        doc.font('Helvetica').fontSize(10.5);
        for (const c of lines(letter.cc_text)) {
            ensureSpace(16);
            doc.text(c, left, y, { width: usableW - 230 });
            y = doc.y + 2;
        }

        // Small credit at the very bottom of the last page (cli-nomination convention)
        doc.font('Helvetica').fontSize(6.5).fillColor('#9aa0a6')
            .text('Prepared from crtms.in', left, doc.page.height - doc.page.margins.bottom - 10,
                { width: usableW, align: 'center' });
        doc.fillColor('#000000');

        doc.end();
    });
}

module.exports = { renderTransferLetterPdf };
