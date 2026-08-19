// SSE-HQ report — standalone printable page and Word export.
//
// The sheet itself is rendered by the shared UMD module under public/, which
// the editor pages also load as a <script>. Requiring it from here (rather
// than keeping a second copy) is what guarantees the live preview, the
// printout and the archived copy are the same document.
//
// Deliberately NOT pdfkit. The module this replaced ran the rendered HTML
// through a tag-stripping regex and poured the remains into
// doc.fontSize(10).text(plain) — so the filed copy of a "one page report"
// arrived as a wall of unformatted text with no proforma grid and no events
// table. The OPR is a bordered form; reproducing it in pdfkit would mean a
// second renderer that drifts from the preview. Reports are filed into
// div_documents as source_type='composed' and printed to PDF from the browser,
// exactly as cadre letters are (utils/cadreLetterHtml.js:8-13).

const SsehqReport = require('../public/div/js/ssehq-report-render.js');

const {
    renderOprSheet, renderNoteSheet, oprSubject, noteSubject,
    SHEET_CSS, escapeHtml, fmtDate,
} = SsehqReport;

// A4 with the margins the division's own reports use. The OPR is a dense
// one-page form, so its side margins are tighter than a letter's.
const PAGE_MARGIN = { opr: '12mm 12mm 12mm 12mm', note: '16mm 18mm 14mm 22mm' };

function oprTitle(report) {
    return ['OPR', report.report_no || '#' + report.id].filter(Boolean).join(' ');
}
function noteTitle(note) {
    return ['DElogging Note', note.note_no || '#' + note.id].filter(Boolean).join(' ');
}

/**
 * Full A4 HTML page — what gets stored in div_documents.body_html and served
 * by GET /api/division/documents/:id/view.
 *
 * The no-print toolbar carries the Print button, because that is how a PDF is
 * produced for this module. Without it the filed copy would be a page the user
 * can read but not turn into the file they have to attach to an email.
 */
function renderPage(kind, rec, events) {
    const isOpr = kind === 'opr';
    const title = isOpr ? oprTitle(rec) : noteTitle(rec);
    const subject = isOpr ? oprSubject(rec) : noteSubject(rec);
    const sheet = isOpr ? renderOprSheet(rec, events, { placeholders: false })
                        : renderNoteSheet(rec, events, { placeholders: false });

    return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — ${escapeHtml(subject)}</title>
<style>
@page { size: A4; margin: ${PAGE_MARGIN[isOpr ? 'opr' : 'note']}; }
body { margin:0; background:#5a5f66; font-family:"Times New Roman",Times,serif; }
.bar { position:sticky; top:0; z-index:5; background:#1b2333; color:#e7edf7;
       padding:10px 16px; display:flex; align-items:center; gap:14px;
       font-family:system-ui,-apple-system,sans-serif; font-size:13px; }
.bar b { font-weight:700; }
.bar .sp { flex:1; }
.bar button { background:#f5a524; border:none; color:#17130b; font-weight:700;
              border-radius:7px; padding:8px 15px; cursor:pointer; font:inherit; font-weight:700; }
.sheet { width:210mm; min-height:297mm; margin:22px auto; background:#fff;
         padding:${PAGE_MARGIN[isOpr ? 'opr' : 'note']}; box-shadow:0 10px 40px rgba(0,0,0,.45); }
${SHEET_CSS}
@media print {
  body { background:#fff; }
  .bar { display:none !important; }
  .sheet { width:auto; min-height:auto; margin:0; padding:0; box-shadow:none; }
}
</style></head>
<body>
<div class="bar"><b>${escapeHtml(title)}</b><span class="sp"></span>
  <button onclick="window.print()">&#128424; Print / Save PDF</button></div>
<div class="sheet">${sheet}</div>
</body></html>`;
}

const renderOprPage = (report, events) => renderPage('opr', report, events);
const renderNotePage = (note, events) => renderPage('note', note, events);

/**
 * Word export. The same sheet in the mso WordSection1 shell, served as
 * application/msword — the convention already used by the cadre module. A true
 * .docx would need a new dependency and a second renderer that would drift
 * from this one.
 */
function renderWord(kind, rec, events) {
    const isOpr = kind === 'opr';
    const title = isOpr ? oprTitle(rec) : noteTitle(rec);
    const sheet = isOpr ? renderOprSheet(rec, events, { placeholders: false })
                        : renderNoteSheet(rec, events, { placeholders: false });

    return `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
@page WordSection1 { size:210.0mm 297.0mm; margin:${PAGE_MARGIN[isOpr ? 'opr' : 'note']}; }
div.WordSection1 { page: WordSection1; }
body { font-family:"Times New Roman",Times,serif; }
${SHEET_CSS}
/* Word ignores the screen chrome; the sheet is the page itself here. */
.sheet { width:auto; margin:0; padding:0; border:none; box-shadow:none; }
</style></head>
<body><div class="WordSection1"><div class="sheet">${sheet}</div></div></body></html>`;
}

const renderOprWord = (report, events) => renderWord('opr', report, events);
const renderNoteWord = (note, events) => renderWord('note', note, events);

module.exports = {
    renderOprPage, renderNotePage,
    renderOprWord, renderNoteWord,
    oprTitle, noteTitle,
    oprSubject, noteSubject,
    fmtDate,
};
