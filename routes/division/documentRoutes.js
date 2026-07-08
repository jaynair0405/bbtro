/**
 * documentRoutes.js — Documents Repository
 * Mounted at /api/division/documents
 *
 * Backs public/div/documents.html. Files are stored privately in
 * uploads/documents/ and served only through the login-gated download route.
 * See docs/DOCUMENTS_REPO_PLAN.md.
 *
 *   GET    /                       → list metadata (filter ?category=&year=&month=)
 *   GET    /tree?category=         → year → month → docs tree (for sidebar)
 *   GET    /permissions            → what the current user may upload/manage
 *   POST   /                       → upload a document (role-scoped by category)
 *   GET    /:id/view               → open the file inline (any logged-in user)
 *   GET    /:id/download           → download the file as attachment
 *   DELETE /:id                    → delete (role-scoped by category)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');

// ── Config ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'TRAINING_LETTER', 'INITIAL_APPOINTMENT', 'PROMOTION_ORDER', 'SR_DEE_INSTRUCTION',
  'CEE_OP_INSTRUCTION', 'SAFETY_CIRCULAR', 'NEWS_LETTER', 'E_CASE_STUDY', 'STUDY_MATERIAL', 'MANUAL',
  'PRESENTATION', 'BROCHURE', 'MISC', 'TRANSFER_LETTER',
];

// Who may upload/delete each category. Everyone logged-in can view/download.
// Single source of truth — tweak here.
const CATEGORY_UPLOAD_ROLES = {
  TRAINING_LETTER:    ['trgcentre_admin', 'division_admin'],
  INITIAL_APPOINTMENT:['office_hr', 'division_admin'],
  PROMOTION_ORDER:    ['office_hr', 'division_admin'],
  SR_DEE_INSTRUCTION: ['division_admin'],
  CEE_OP_INSTRUCTION: ['division_admin'],
  SAFETY_CIRCULAR:    ['division_admin'],
  NEWS_LETTER:        ['division_admin'],
  E_CASE_STUDY:       ['division_admin'],
  STUDY_MATERIAL:     ['trgcentre_admin', 'division_admin'],
  MANUAL:             ['division_admin'],
  PRESENTATION:       ['division_admin'],
  BROCHURE:           ['division_admin'],
  MISC:               ['division_admin'],
  TRANSFER_LETTER:    ['office_hr', 'division_admin'],
};

// Categories whose documents are organised by date (Year → Month tree).
// doc_date is required when uploading into these.
const DATE_TREE_CATEGORIES = new Set([
  'TRAINING_LETTER', 'INITIAL_APPOINTMENT', 'PROMOTION_ORDER',
  'SR_DEE_INSTRUCTION', 'CEE_OP_INSTRUCTION', 'SAFETY_CIRCULAR', 'NEWS_LETTER', 'E_CASE_STUDY',
  'TRANSFER_LETTER',
]);

// Folder ("section") config per category, used for upload validation and to
// tell the client how to build the folder dropdown.
//   required: user MUST pick one of these folders.
//   optional: user MAY pick one of these (else the doc is "general", folder NULL).
const FOLDER_CONFIG = {
  STUDY_MATERIAL:  { required: ['Main Line', 'Suburban'] },
  NEWS_LETTER:     { required: ['Main Line', 'Sub Urban'] },
  E_CASE_STUDY:    { required: ['Main Line', 'Sub Urban'] },
  PROMOTION_ORDER: { optional: ['Reinstatements'] },
  // Transfer letters: one folder per sending lobby (letter's from_office_code).
  // Mirrors active offices.office_code values (minus the OTHER sentinel).
  TRANSFER_LETTER: { required: [
    'CSMT-SUB', 'KYN-SUB', 'PNVL-SUB', 'CSMT-ML', 'KYN-ML', 'PNVL-ML',
    'IGP', 'CLA', 'LNL', 'NRL', 'KCS', 'NCS', 'SCS', 'MTN', 'VVH',
  ] },
};

// Validate/normalise a folder value for a category. Returns
// { ok, value } — value is the folder string or null.
function resolveFolder(category, raw) {
  const cfg = FOLDER_CONFIG[category];
  const folder = (raw || '').trim();
  if (!cfg) return { ok: true, value: null };            // category has no folders
  if (cfg.required) {
    return cfg.required.includes(folder)
      ? { ok: true, value: folder }
      : { ok: false };
  }
  // optional
  if (!folder) return { ok: true, value: null };
  return cfg.optional.includes(folder) ? { ok: true, value: folder } : { ok: false };
}

const ALLOWED_EXT = new Set(['pdf', 'pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls']);
const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'documents');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Helpers ─────────────────────────────────────────────────────────────--

function getRole(req) {
  return req.session?.user?.div_role || null;
}

function canUploadCategory(role, category) {
  const roles = CATEGORY_UPLOAD_ROLES[category];
  return !!roles && roles.includes(role);
}

function uploadableCategories(role) {
  return CATEGORIES.filter((c) => canUploadCategory(role, c));
}

function extOf(name) {
  return (path.extname(name || '').replace('.', '') || '').toLowerCase();
}

function sanitize(name) {
  return (name || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 180);
}

// ── Multer (disk storage → uploads/documents/) ─────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = crypto.randomUUID();
    cb(null, `${id}__${sanitize(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_EXT.has(extOf(file.originalname))) return cb(null, true);
    cb(new Error('UNSUPPORTED_TYPE'));
  },
});

// ── In-site composed instructions ──────────────────────────────────────────
// Categories that can be authored in the portal (rich text) instead of only
// uploaded as files. Composed rows carry source_type='composed', body_html
// (English) / body_html_hi (Hindi), and no file on disk.
const INSTRUCTION_COMPOSE_CATEGORIES = new Set(['SR_DEE_INSTRUCTION', 'CEE_OP_INSTRUCTION']);

// Instruction-number prefix per category, e.g. SR DEE/INST/2026/03.
const INSTRUCTION_NO_PREFIX = {
  SR_DEE_INSTRUCTION: 'SR DEE/INST',
  CEE_OP_INSTRUCTION: 'CEE OP/INST',
};

// Display labels for the server-rendered instruction viewer.
const CATEGORY_LABELS = {
  SR_DEE_INSTRUCTION: 'Sr.DEE Instruction',
  CEE_OP_INSTRUCTION: 'CEE-OP Instruction',
};

// Allowlist for editor HTML — matches what Quill can produce. Strips scripts,
// event handlers, styles, and anything else, so stored bodies are safe to render.
const SANITIZE_OPTS = {
  allowedTags: [
    'p', 'br', 'span', 'strong', 'em', 'u', 's', 'blockquote',
    'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a',
    'table', 'thead', 'tbody', 'tr', 'td', 'th', 'sub', 'sup', 'pre', 'code',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['class'],
    p: ['class'],
    ol: ['class'],
    li: ['class'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    // Force safe external links.
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

function cleanBody(html) {
  if (!html || !String(html).trim()) return null;
  const out = sanitizeHtml(String(html), SANITIZE_OPTS).trim();
  return out || null;
}

// Next sequential instruction number for a category within the current year,
// mirroring the training/transfer-letter scheme (…/YYYY/NN).
async function nextInstructionNo(pool, category) {
  const prefix = INSTRUCTION_NO_PREFIX[category] || 'INSTR';
  const year = new Date().getFullYear();
  const [[last]] = await pool.query(
    `SELECT title FROM div_documents
      WHERE category = ? AND source_type = 'composed' AND title LIKE ?
      ORDER BY id DESC LIMIT 1`,
    [category, `${prefix}/${year}/%`]
  );
  let n = 1;
  if (last && last.title) {
    const m = String(last.title).match(/\/(\d+)$/);
    if (m) n = parseInt(m[1], 10) + 1;
  }
  return `${prefix}/${year}/${String(n).padStart(2, '0')}`;
}

// ── GET / — list metadata ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { category, year, month } = req.query;
    const where = [];
    const params = [];
    if (category && CATEGORIES.includes(category)) {
      where.push('category = ?');
      params.push(category);
    }
    if (year) {
      where.push('YEAR(doc_date) = ?');
      params.push(Number(year));
    }
    if (month) {
      where.push('MONTH(doc_date) = ?');
      params.push(Number(month));
    }
    const sql = `
      SELECT id, title, category, description,
             DATE_FORMAT(doc_date, '%Y-%m-%d') AS doc_date, folder,
             original_name, file_type, file_size, uploaded_by, created_at,
             source_type, language
      FROM div_documents
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY (doc_date IS NULL), doc_date DESC, created_at DESC`;
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, documents: rows });
  } catch (err) {
    console.error('documents list error:', err);
    res.status(500).json({ success: false, error: 'Failed to list documents' });
  }
});

// ── GET /permissions — what the current user may upload/manage ──────────────
// Grouping (year/month trees, folders) is done client-side from the list
// endpoint, so there is no /tree route.
router.get('/permissions', (req, res) => {
  const role = getRole(req);
  const canUpload = uploadableCategories(role);
  res.json({
    success: true,
    role,
    categories: CATEGORIES,
    dateTreeCategories: [...DATE_TREE_CATEGORIES],
    folderConfig: FOLDER_CONFIG,                // { CATEGORY: {required|optional: [...] } }
    canUpload,                                  // categories this role may add
    canUploadAny: canUpload.length > 0,
  });
});

// ── GET /instruction-no — suggested next instruction number ─────────────────
router.get('/instruction-no', async (req, res) => {
  try {
    const { category } = req.query;
    if (!INSTRUCTION_COMPOSE_CATEGORIES.has(category)) {
      return res.status(400).json({ success: false, error: 'Category is not composable.' });
    }
    if (!canUploadCategory(getRole(req), category)) {
      return res.status(403).json({ success: false, error: 'Not allowed.' });
    }
    const number = await nextInstructionNo(req.app.locals.pool, category);
    res.json({ success: true, number });
  } catch (err) {
    console.error('instruction-no error:', err);
    res.status(500).json({ success: false, error: 'Failed to suggest a number.' });
  }
});

// ── POST /compose — author an instruction in-site (no file) ─────────────────
router.post('/compose', async (req, res) => {
  try {
    const role = getRole(req);
    const { category, subject, doc_date, body_html, body_html_hi } = req.body;
    let { title } = req.body;

    if (!INSTRUCTION_COMPOSE_CATEGORIES.has(category)) {
      return res.status(400).json({ success: false, error: 'Category is not composable.' });
    }
    if (!canUploadCategory(role, category)) {
      return res.status(403).json({ success: false, error: 'You are not allowed to add this category.' });
    }
    if (!doc_date) {
      return res.status(400).json({ success: false, error: 'Instruction date is required.' });
    }

    const bodyEn = cleanBody(body_html);
    const bodyHi = cleanBody(body_html_hi);
    if (!bodyEn && !bodyHi) {
      return res.status(400).json({ success: false, error: 'The instruction body is empty.' });
    }
    const language = bodyEn && bodyHi ? 'both' : bodyEn ? 'en' : 'hi';

    const pool = req.app.locals.pool;
    title = (title || '').trim() || await nextInstructionNo(pool, category);

    const [result] = await pool.query(
      `INSERT INTO div_documents
         (title, category, description, doc_date, body_html, body_html_hi,
          language, source_type, uploaded_by)
       VALUES (?,?,?,?,?,?,?, 'composed', ?)`,
      [
        title,
        category,
        (subject || '').trim() || null,
        doc_date,
        bodyEn,
        bodyHi,
        language,
        req.session?.user?.username || 'system',
      ]
    );
    res.json({ success: true, id: result.insertId, title });
  } catch (err) {
    console.error('document compose error:', err);
    res.status(500).json({ success: false, error: 'Failed to save the instruction.' });
  }
});

// ── POST / — upload ────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    // multer / filter errors
    if (err) {
      const msg = err.message === 'UNSUPPORTED_TYPE'
        ? 'Unsupported file type. Allowed: pdf, ppt(x), doc(x), xls(x).'
        : err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large (max 25 MB).'
          : 'Upload failed.';
      return res.status(400).json({ success: false, error: msg });
    }
    try {
      const role = getRole(req);
      const { title, category, description, doc_date, folder } = req.body;

      const cleanup = () => { if (req.file) fs.unlink(req.file.path, () => {}); };

      if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
      if (!title || !title.trim()) { cleanup(); return res.status(400).json({ success: false, error: 'Title is required.' }); }
      if (!CATEGORIES.includes(category)) { cleanup(); return res.status(400).json({ success: false, error: 'Invalid category.' }); }
      if (!canUploadCategory(role, category)) {
        cleanup();
        return res.status(403).json({ success: false, error: 'You are not allowed to upload this category.' });
      }
      if (DATE_TREE_CATEGORIES.has(category) && !doc_date) {
        cleanup();
        return res.status(400).json({ success: false, error: 'Document date is required for this category.' });
      }
      const folderRes = resolveFolder(category, folder);
      if (!folderRes.ok) {
        cleanup();
        return res.status(400).json({ success: false, error: 'A valid section/folder is required for this category.' });
      }

      const pool = req.app.locals.pool;
      const [result] = await pool.query(
        `INSERT INTO div_documents
           (title, category, description, doc_date, folder,
            file_name, original_name, file_type, file_size, uploaded_by)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          title.trim(),
          category,
          description?.trim() || null,
          doc_date || null,
          folderRes.value,
          req.file.filename,
          req.file.originalname,
          extOf(req.file.originalname),
          req.file.size,
          req.session?.user?.username || 'system',
        ]
      );
      res.json({ success: true, id: result.insertId });
    } catch (e) {
      console.error('document upload error:', e);
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(500).json({ success: false, error: 'Failed to save document.' });
    }
  });
});

// ── Shared file lookup ─────────────────────────────────────────────────────
async function locateFile(pool, id) {
  const [[doc]] = await pool.query(
    'SELECT file_name, original_name FROM div_documents WHERE id = ?', [id]
  );
  if (!doc) return { error: 404 };
  const filePath = path.join(UPLOAD_DIR, doc.file_name);
  if (!fs.existsSync(filePath)) return { error: 410 };
  return { doc, filePath };
}

function escapeText(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtDocDate(d) {
  if (!d) return '';
  const [y, m, day] = String(d).slice(0, 10).split('-').map(Number);
  if (!y) return '';
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(day).padStart(2, '0')} ${MON[m - 1]} ${y}`;
}

// Print-first HTML page for an in-site composed instruction. Bodies were
// sanitised on save, so they are injected as-is; text fields are escaped.
function renderInstructionPage(doc) {
  const en = doc.body_html || '';
  const hi = doc.body_html_hi || '';
  const hasEn = !!en.trim();
  const hasHi = !!hi.trim();
  const label = CATEGORY_LABELS[doc.category] || 'Instruction';
  const toggle = (hasEn && hasHi)
    ? `<div class="lang no-print">
         <button data-lang="en" class="active">English</button>
         <button data-lang="hi">हिंदी</button>
         <button data-lang="both">Both</button>
       </div>` : '';
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeText(doc.title)} — ${escapeText(label)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { --ink:#1e293b; --muted:#64748b; --line:#e2e8f0; --brand:#0b3d91; }
  * { box-sizing:border-box; }
  body { margin:0; background:#f1f5f9; color:var(--ink);
         font-family:'Segoe UI',system-ui,-apple-system,sans-serif; }
  .bar { position:sticky; top:0; display:flex; gap:12px; align-items:center;
         justify-content:space-between; background:#fff; border-bottom:1px solid var(--line);
         padding:10px 16px; }
  .lang button { border:1px solid var(--line); background:#fff; padding:6px 12px;
         border-radius:6px; cursor:pointer; font-size:13px; }
  .lang button.active { background:var(--brand); color:#fff; border-color:var(--brand); }
  .btn { border:1px solid var(--brand); background:var(--brand); color:#fff;
         padding:7px 14px; border-radius:6px; cursor:pointer; font-size:13px; }
  .sheet { max-width:800px; margin:20px auto; background:#fff; padding:40px 48px;
           border:1px solid var(--line); box-shadow:0 1px 3px rgba(0,0,0,.06); }
  .hd { text-align:center; border-bottom:2px solid var(--brand); padding-bottom:12px; margin-bottom:16px; }
  .hd .cat { color:var(--brand); font-weight:700; text-transform:uppercase; letter-spacing:.04em; font-size:13px; }
  .meta { display:flex; justify-content:space-between; font-size:13px; color:var(--muted); margin-bottom:8px; }
  .subj { font-weight:600; margin:14px 0 18px; }
  .body { line-height:1.6; }
  .body.hi, .subj.hi { font-family:'Noto Sans Devanagari','Segoe UI',sans-serif; }
  .body table { border-collapse:collapse; width:100%; }
  .body td, .body th { border:1px solid var(--line); padding:6px 8px; }
  .divider { border:none; border-top:1px dashed var(--line); margin:28px 0; }
  [hidden] { display:none !important; }
  @media print {
    body { background:#fff; }
    .no-print { display:none !important; }
    .sheet { margin:0; border:none; box-shadow:none; max-width:none; padding:0; }
  }
</style></head>
<body>
  <div class="bar no-print">
    ${toggle || '<span></span>'}
    <button class="btn" onclick="window.print()">🖨 Print / Save PDF</button>
  </div>
  <div class="sheet">
    <div class="hd">
      <div class="cat">${escapeText(label)}</div>
    </div>
    <div class="meta">
      <span><strong>No:</strong> ${escapeText(doc.title)}</span>
      <span><strong>Date:</strong> ${escapeText(fmtDocDate(doc.doc_date))}</span>
    </div>
    ${doc.description ? `<div class="subj" data-en>Sub: ${escapeText(doc.description)}</div>` : ''}
    ${hasEn ? `<div class="body" data-body="en">${en}</div>` : ''}
    ${(hasEn && hasHi) ? `<hr class="divider" data-body="both-sep" hidden>` : ''}
    ${hasHi ? `<div class="body hi" data-body="hi"${hasEn ? ' hidden' : ''}>${hi}</div>` : ''}
  </div>
<script>
  var buttons = document.querySelectorAll('.lang button');
  function show(lang) {
    document.querySelectorAll('[data-body]').forEach(function (el) {
      var k = el.getAttribute('data-body');
      var on = lang === 'both' ? true : (k === lang);
      el.hidden = !on;
    });
    buttons.forEach(function (b) { b.classList.toggle('active', b.dataset.lang === lang); });
  }
  buttons.forEach(function (b) { b.onclick = function () { show(b.dataset.lang); }; });
</script>
</body></html>`;
}

// ── GET /:id/view — open inline (browser viewer) ───────────────────────────
router.get('/:id/view', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    // Composed instructions have no file — render their stored HTML instead.
    const [[row]] = await pool.query(
      `SELECT title, category, description,
              DATE_FORMAT(doc_date, '%Y-%m-%d') AS doc_date,
              body_html, body_html_hi, source_type
         FROM div_documents WHERE id = ?`, [req.params.id]
    );
    if (!row) return res.status(404).json({ success: false, error: 'Not found' });
    if (row.source_type === 'composed') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(renderInstructionPage(row));
    }

    const { doc, filePath, error } = await locateFile(pool, req.params.id);
    if (error) return res.status(error).json({ success: false, error: error === 404 ? 'Not found' : 'File missing on server' });
    // inline disposition → browser opens (PDFs in the viewer) instead of saving.
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.original_name)}"`);
    res.sendFile(filePath); // Content-Type inferred from extension
  } catch (err) {
    console.error('document view error:', err);
    res.status(500).json({ success: false, error: 'Open failed' });
  }
});

// ── GET /:id/download — force download (attachment) ────────────────────────
router.get('/:id/download', async (req, res) => {
  try {
    const { doc, filePath, error } = await locateFile(req.app.locals.pool, req.params.id);
    if (error) return res.status(error).json({ success: false, error: error === 404 ? 'Not found' : 'File missing on server' });
    res.download(filePath, doc.original_name);
  } catch (err) {
    console.error('document download error:', err);
    res.status(500).json({ success: false, error: 'Download failed' });
  }
});

// ── DELETE /:id — role-scoped by category ──────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [[doc]] = await pool.query(
      'SELECT category, file_name FROM div_documents WHERE id = ?',
      [req.params.id]
    );
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
    if (!canUploadCategory(getRole(req), doc.category)) {
      return res.status(403).json({ success: false, error: 'Not allowed to delete this category.' });
    }
    await pool.query('DELETE FROM div_documents WHERE id = ?', [req.params.id]);
    const filePath = path.join(UPLOAD_DIR, doc.file_name);
    fs.unlink(filePath, () => {}); // best-effort; row is already gone
    res.json({ success: true });
  } catch (err) {
    console.error('document delete error:', err);
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
});

// Shared with the Transfer Letter module, which files generated PDFs into
// the same store with identical uuid__name naming (no multer involved).
router.UPLOAD_DIR = UPLOAD_DIR;
router.sanitize = sanitize;

module.exports = router;
