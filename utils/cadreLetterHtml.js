// Cadre letter — standalone printable page.
//
// The letter body itself is rendered by the shared UMD module under public/,
// which the browser also loads as a <script>. Requiring it from here (rather
// than keeping a second copy) is what guarantees the live preview, the
// printout and the archived copy are the same document.
//
// Deliberately NOT pdfkit: its built-in fonts are WinAnsi and cannot render
// Devanagari (see utils/transferLetterPdf.js:5-7, where the transfer letter's
// filed PDF silently loses its Hindi signature). Cadre letters are Devanagari
// in the letterhead, addressee and signature, so they are filed into
// div_documents as source_type='composed' and printed from the browser.

const CadreLetter = require('../public/div/js/cadre-letter-render.js');

const { renderSheet, SHEET_CSS, escapeHtml, fmtDate } = CadreLetter;

/**
 * Full A4 HTML page for a cadre letter — what gets stored in
 * div_documents.body_html and served by GET /api/division/documents/:id/view.
 *
 * @param {object} letter div_cadre_letters row
 * @param {Array}  staff  div_cadre_letter_staff rows in sr_no order
 * @returns {string} a complete <!doctype html> document
 */
function renderCadreLetterPage(letter, staff) {
    const title = [letter.letter_no, letter.subject_text].filter(Boolean).join(' — ')
        || 'Cadre letter';

    return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;}
  body{margin:0;background:#eef2f7;font-family:'Segoe UI',system-ui,sans-serif;}
  .bar{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;
       align-items:center;background:#fff;border-bottom:1px solid #e2e8f0;padding:10px 16px;}
  .meta{font-size:13px;color:#64748b;}
  .btn{border:1px solid #0b3d91;background:#0b3d91;color:#fff;padding:7px 14px;
       border-radius:6px;cursor:pointer;font-size:13px;}
  .sheet{width:min(210mm,96%);margin:18px auto;background:#fff;
         padding:16mm 15mm 18mm;border:1px solid #e2e8f0;
         box-shadow:0 8px 30px rgba(0,0,0,.12);}
${SHEET_CSS}
  @media print{
    @page{size:A4;margin:14mm 15mm;}
    body{background:#fff;}
    .no-print{display:none !important;}
    .sheet{width:auto;margin:0;padding:0;border:none;box-shadow:none;}
    .sheet .ph{visibility:hidden;}
    table.grid{page-break-inside:auto;}
    table.grid tr{page-break-inside:avoid;}
    /* the 69-row ALP letters run to page 2 — repeat the header there */
    table.grid thead{display:table-header-group;}
    .sheet .sig,.sheet .cc,.sheet .chain,.sheet .encl{page-break-inside:avoid;}
  }
</style></head>
<body>
  <div class="bar no-print">
    <span class="meta">${escapeHtml(letter.letter_no || '')} &nbsp;·&nbsp; ${escapeHtml(fmtDate(letter.letter_date))}</span>
    <button class="btn" onclick="window.print()">🖨 Print / Save PDF</button>
  </div>
  <div class="sheet">${renderSheet(letter, staff, { placeholders: false })}</div>
</body></html>`;
}

module.exports = {
    renderCadreLetterPage,
    renderSheet,
    SHEET_CSS,
    shortDesignation: CadreLetter.shortDesignation,
    fmtDate,
};
