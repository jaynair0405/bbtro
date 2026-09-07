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
    renderOprSheet, renderNoteSheet, renderOfficeSheet, oprSubject, noteSubject,
    SHEET_CSS, escapeHtml, fmtDate,
} = SsehqReport;

// A4 with the margins the division's own reports use. The OPR is a dense
// one-page form, so its side margins are tighter than a letter's.
const PAGE_MARGIN = {
    opr: '12mm 12mm 12mm 12mm',
    note: '16mm 18mm 14mm 22mm',
    office: '16mm 18mm 14mm 22mm',
};

// The office note's letterhead is Devanagari, so its pages must pull the font.
// Loaded for every kind rather than only that one: it costs nothing when
// unused, and a note that gains a Hindi line later should not render in
// fallback glyphs because someone forgot to add it here.
const DEVA_FONT =
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet">';

function oprTitle(report) {
    return ['OPR', report.report_no || '#' + report.id].filter(Boolean).join(' ');
}
function noteTitle(note) {
    return ['DElogging Note', note.note_no || '#' + note.id].filter(Boolean).join(' ');
}
function officeTitle(note) {
    return ['Office Note', note.note_no || '#' + note.id].filter(Boolean).join(' ');
}
/* An office note has no printed subject. The stored one is for filing only, so
 * the repository has something readable to list it under; falling back to the
 * opening words of the note itself is better than an empty description. */
function officeSubject(note) {
    if (note.subject_text) return note.subject_text;
    const body = String(note.body_text || '').replace(/\s+/g, ' ').trim();
    return body ? body.slice(0, 140) + (body.length > 140 ? '…' : '') : 'Office note';
}

/**
 * Full A4 HTML page — what gets stored in div_documents.body_html and served
 * by GET /api/division/documents/:id/view.
 *
 * The no-print toolbar carries the Print button, because that is how a PDF is
 * produced for this module. Without it the filed copy would be a page the user
 * can read but not turn into the file they have to attach to an email.
 */
const KIND_RENDER = {
    opr:    { title: oprTitle,    subject: oprSubject,    margin: 'opr',
              sheet: (r, e) => renderOprSheet(r, e, { placeholders: false }) },
    note:   { title: noteTitle,   subject: noteSubject,   margin: 'note',
              sheet: (r, e) => renderNoteSheet(r, e, { placeholders: false }) },
    office: { title: officeTitle, subject: officeSubject, margin: 'office',
              sheet: (r) => renderOfficeSheet(r, { placeholders: false }) },
};

function renderPage(kind, rec, events) {
    const k = KIND_RENDER[kind];
    const title = k.title(rec);
    const subject = k.subject(rec);
    const sheet = k.sheet(rec, events);

    return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — ${escapeHtml(subject)}</title>
${DEVA_FONT}
<style>
@page { size: A4; margin: ${PAGE_MARGIN[k.margin]}; }
body { margin:0; background:#5a5f66; font-family:"Times New Roman",Times,serif; }
.bar { position:sticky; top:0; z-index:5; background:#1b2333; color:#e7edf7;
       padding:10px 16px; display:flex; align-items:center; gap:14px;
       font-family:system-ui,-apple-system,sans-serif; font-size:13px; }
.bar b { font-weight:700; }
.bar .sp { flex:1; }
.bar button { background:#f5a524; border:none; color:#17130b; font-weight:700;
              border-radius:7px; padding:8px 15px; cursor:pointer; font:inherit; font-weight:700; }
.sheet { width:210mm; min-height:297mm; margin:22px auto; background:#fff;
         padding:${PAGE_MARGIN[k.margin]}; box-shadow:0 10px 40px rgba(0,0,0,.45); }
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
const renderOfficePage = (note) => renderPage('office', note, []);

/**
 * Word export. The same sheet in the mso WordSection1 shell, served as
 * application/msword — the convention already used by the cadre module. A true
 * .docx would need a new dependency and a second renderer that would drift
 * from this one.
 */
function renderWord(kind, rec, events) {
    const k = KIND_RENDER[kind];
    const title = k.title(rec);
    const sheet = k.sheet(rec, events);

    return `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
${DEVA_FONT}
<style>
@page WordSection1 { size:210.0mm 297.0mm; margin:${PAGE_MARGIN[k.margin]}; }
div.WordSection1 { page: WordSection1; }
body { font-family:"Times New Roman",Times,serif; }
.deva,.sheet .deva{font-family:"Nirmala UI","Mangal","Noto Sans Devanagari","Times New Roman",serif;}
${SHEET_CSS}
/* Word ignores the screen chrome; the sheet is the page itself here. */
.sheet { width:auto; margin:0; padding:0; border:none; box-shadow:none; }
</style></head>
<body><div class="WordSection1"><div class="sheet">${sheet}</div></div></body></html>`;
}

const renderOprWord = (report, events) => renderWord('opr', report, events);
const renderNoteWord = (note, events) => renderWord('note', note, events);
const renderOfficeWord = (note) => renderWord('office', note, []);

module.exports = {
    renderOprPage, renderNotePage, renderOfficePage,
    renderOprWord, renderNoteWord, renderOfficeWord,
    oprTitle, noteTitle, officeTitle,
    oprSubject, noteSubject, officeSubject,
    fmtDate,
};
