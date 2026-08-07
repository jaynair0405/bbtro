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
  'PRESENTATION', 'BROCHURE', 'MISC', 'TRANSFER_LETTER', 'CADRE_LETTER',
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
  CADRE_LETTER:       ['office_hr', 'division_admin'],
};

// Categories whose documents are organised by date (Year → Month tree).
// doc_date is required when uploading into these.
const DATE_TREE_CATEGORIES = new Set([
  'TRAINING_LETTER', 'INITIAL_APPOINTMENT', 'PROMOTION_ORDER',
  'SR_DEE_INSTRUCTION', 'CEE_OP_INSTRUCTION', 'SAFETY_CIRCULAR', 'NEWS_LETTER', 'E_CASE_STUDY',
  'TRANSFER_LETTER', 'CADRE_LETTER',
]);

// Folder ("section") config per category, used for upload validation and to
// tell the client how to build the folder dropdown.
//   required: user MUST pick one of these folders.
//   optional: user MAY pick one of these (else the doc is "general", folder NULL).
const FOLDER_CONFIG = {
  STUDY_MATERIAL:  { required: ['Main Line', 'Suburban'] },
  NEWS_LETTER:     { required: ['Main Line', 'Sub Urban'] },
  E_CASE_STUDY:    { required: ['Main Line', 'Sub Urban'] },
  // Posting-change orders: plain promotions live at the top level; punishment
  // demotions and later reinstatements get their own sub-folder.
  PROMOTION_ORDER: { optional: ['Demotions', 'Reinstatements'] },
  // Transfer letters: one folder per sending lobby (letter's from_office_code).
  // Mirrors active offices.office_code values (minus the OTHER sentinel).
  TRANSFER_LETTER: { required: [
    'CSMT-SUB', 'KYN-SUB', 'PNVL-SUB', 'CSMT-ML', 'KYN-ML', 'PNVL-ML',
    'IGP', 'CLA', 'LNL', 'NRL', 'KCS', 'NCS', 'SCS', 'MTN', 'VVH',
  ] },
  // Cadre letters (HQ CLI cadre desk): one folder per letter family, so the
  // repo groups them the way the desk thinks about them.
  CADRE_LETTER: { required: ['TRANSFER', 'POSTING', 'TRAINING', 'CADRE', 'MISC'] },
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

// Who may DELETE each category. Defaults to the upload roles, except where
// overridden below. Transfer letters are auto-filed formal records — only the
// division admin may delete them, even though office_hr may still file them.
const CATEGORY_DELETE_ROLES = {
  TRANSFER_LETTER: ['division_admin'],
  CADRE_LETTER:    ['division_admin'],
};

function canDeleteCategory(role, category) {
  const roles = CATEGORY_DELETE_ROLES[category] || CATEGORY_UPLOAD_ROLES[category];
  return !!roles && roles.includes(role);
}

function deletableCategories(role) {
  return CATEGORIES.filter((c) => canDeleteCategory(role, c));
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
// CEE-OP instructions are prepared by another office and only uploaded here, so
// only Sr.DEE instructions are composable in-site.
const INSTRUCTION_COMPOSE_CATEGORIES = new Set(['SR_DEE_INSTRUCTION']);

// Letterhead per category — the fixed office block (right side, Devanagari) and
// the signatory block (bottom right). Single source of truth; edit here.
// Instruction numbers are per-category serials: <n>/<year>, e.g. 11/2026.
const LETTERHEAD = {
  SR_DEE_INSTRUCTION: {
    label: 'Sr.DEE Instruction',
    // right-hand office block, one line each (Devanagari)
    office: ['मंडल कार्यालय', 'वरि.मं.वि.इं. (क.च.स्टाक/परि) का कार्यालय,', 'मुंबई छ.शि.ट.'],
    signName: 'व.मं.वि.इं. (क.च.स्टाक/परि)',
    signSub: 'मुंबई छ.शि.म.ट.',
  },
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

// Next per-category instruction serial for the current year, formatted <n>/<year>
// (e.g. 11/2026) to match the official "INSTRUCTION No. 11/2026" convention.
async function nextInstructionNo(pool, category) {
  const year = new Date().getFullYear();
  const [rows] = await pool.query(
    `SELECT title FROM div_documents
      WHERE category = ? AND source_type = 'composed' AND status = 'final'
        AND title REGEXP ?`,
    [category, `^[0-9]+/${year}$`]
  );
  let max = 0;
  for (const r of rows) {
    const m = String(r.title).match(/^(\d+)\//);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${max + 1}/${year}`;
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
    // Draft instructions are private — never in the shared listing.
    where.push("(status IS NULL OR status <> 'draft')");
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
  const canDelete = deletableCategories(role);
  res.json({
    success: true,
    role,
    categories: CATEGORIES,
    dateTreeCategories: [...DATE_TREE_CATEGORIES],
    folderConfig: FOLDER_CONFIG,                // { CATEGORY: {required|optional: [...] } }
    canUpload,                                  // categories this role may add
    canUploadAny: canUpload.length > 0,
    canDelete,                                  // categories this role may delete
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

// Validate + clean an instruction payload from the compose form.
// Returns { data } or { error: [status, message] }.
function buildInstruction(req) {
  const { category, subject, doc_date, body_html, body_html_hi,
          ref_no, addressee, revised } = req.body;
  const status = req.body.status === 'final' ? 'final' : 'draft';

  if (!INSTRUCTION_COMPOSE_CATEGORIES.has(category)) {
    return { error: [400, 'Category is not composable.'] };
  }
  if (!doc_date) return { error: [400, 'Instruction date is required.'] };

  const bodyEn = cleanBody(body_html);
  const bodyHi = cleanBody(body_html_hi);
  if (!bodyEn && !bodyHi) return { error: [400, 'The instruction body is empty.'] };
  const language = bodyEn && bodyHi ? 'both' : bodyEn ? 'en' : 'hi';

  const header = {
    ref_no: (ref_no || '').trim() || null,
    addressee: (addressee || '').trim() || null,
    revised: !!revised,
  };
  const hasHeader = header.ref_no || header.addressee || header.revised;

  return {
    data: {
      category,
      title: (req.body.title || '').trim(),
      subject: (subject || '').trim() || null,
      doc_date,
      bodyEn, bodyHi, language,
      header: hasHeader ? JSON.stringify(header) : null,
      status,
    },
  };
}

// Owner check for a composed draft: only the author may see/edit their drafts.
function ownsDraft(row, req) {
  return row && row.source_type === 'composed'
    && row.uploaded_by === (req.session?.user?.username || null);
}

// ── POST /compose — create an instruction (draft by default) ────────────────
router.post('/compose', async (req, res) => {
  try {
    const { data, error } = buildInstruction(req);
    if (error) return res.status(error[0]).json({ success: false, error: error[1] });
    if (!canUploadCategory(getRole(req), data.category)) {
      return res.status(403).json({ success: false, error: 'You are not allowed to add this category.' });
    }
    const pool = req.app.locals.pool;
    // Only assign a real number when finalising; drafts may stay unnumbered.
    const title = data.title || (data.status === 'final' ? await nextInstructionNo(pool, data.category) : null);

    const [result] = await pool.query(
      `INSERT INTO div_documents
         (title, category, description, doc_date, body_html, body_html_hi,
          language, source_type, status, header, uploaded_by)
       VALUES (?,?,?,?,?,?,?, 'composed', ?, ?, ?)`,
      [title, data.category, data.subject, data.doc_date, data.bodyEn, data.bodyHi,
       data.language, data.status, data.header, req.session?.user?.username || 'system']
    );
    res.json({ success: true, id: result.insertId, title, status: data.status });
  } catch (err) {
    console.error('document compose error:', err);
    res.status(500).json({ success: false, error: 'Failed to save the instruction.' });
  }
});

// ── POST /compose/:id — update a draft (save again or finalise) ─────────────
router.post('/compose/:id', async (req, res) => {
  try {
    const { data, error } = buildInstruction(req);
    if (error) return res.status(error[0]).json({ success: false, error: error[1] });
    if (!canUploadCategory(getRole(req), data.category)) {
      return res.status(403).json({ success: false, error: 'Not allowed.' });
    }
    const pool = req.app.locals.pool;
    const [[row]] = await pool.query(
      'SELECT category, source_type, status, uploaded_by, title FROM div_documents WHERE id = ?',
      [req.params.id]
    );
    if (!row) return res.status(404).json({ success: false, error: 'Not found' });
    if (!ownsDraft(row, req)) {
      return res.status(403).json({ success: false, error: 'This is not your draft.' });
    }
    if (row.status === 'final') {
      return res.status(409).json({ success: false, error: 'This instruction is already finalized.' });
    }
    // Keep any number the draft already had; assign one on finalise if still blank.
    const title = data.title || row.title
      || (data.status === 'final' ? await nextInstructionNo(pool, data.category) : null);

    await pool.query(
      `UPDATE div_documents
          SET title = ?, description = ?, doc_date = ?, body_html = ?, body_html_hi = ?,
              language = ?, header = ?, status = ?
        WHERE id = ?`,
      [title, data.subject, data.doc_date, data.bodyEn, data.bodyHi,
       data.language, data.header, data.status, req.params.id]
    );
    res.json({ success: true, id: Number(req.params.id), title, status: data.status });
  } catch (err) {
    console.error('document update error:', err);
    res.status(500).json({ success: false, error: 'Failed to save the instruction.' });
  }
});

// ── GET /compose/:id — load a draft back into the editor (author only) ──────
router.get('/compose/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [[row]] = await pool.query(
      `SELECT id, title, category, description,
              DATE_FORMAT(doc_date, '%Y-%m-%d') AS doc_date,
              body_html, body_html_hi, header, status, source_type, uploaded_by
         FROM div_documents WHERE id = ?`, [req.params.id]
    );
    if (!row) return res.status(404).json({ success: false, error: 'Not found' });
    if (!ownsDraft(row, req)) {
      return res.status(403).json({ success: false, error: 'This is not your draft.' });
    }
    if (row.status === 'final') {
      return res.status(409).json({ success: false, error: 'Finalized instructions cannot be edited.' });
    }
    delete row.uploaded_by; delete row.source_type;
    res.json({ success: true, instruction: row });
  } catch (err) {
    console.error('draft load error:', err);
    res.status(500).json({ success: false, error: 'Failed to load the draft.' });
  }
});

// ── GET /drafts — the current user's unfinalised instructions ───────────────
router.get('/drafts', async (req, res) => {
  try {
    const { category } = req.query;
    if (category && !INSTRUCTION_COMPOSE_CATEGORIES.has(category)) {
      return res.status(400).json({ success: false, error: 'Not a composable category.' });
    }
    const pool = req.app.locals.pool;
    const params = [req.session?.user?.username || null];
    let sql = `
      SELECT id, title, category, description,
             DATE_FORMAT(doc_date, '%Y-%m-%d') AS doc_date, created_at
        FROM div_documents
       WHERE source_type = 'composed' AND status = 'draft' AND uploaded_by = ?`;
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, drafts: rows });
  } catch (err) {
    console.error('drafts list error:', err);
    res.status(500).json({ success: false, error: 'Failed to list drafts' });
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

// Print-first, A4 letterhead page for an in-site composed instruction, matching
// the official Sr.DEE/CEE-OP format. Bodies were sanitised on save (injected
// as-is); all text fields are escaped.
function renderInstructionPage(doc) {
  const en = doc.body_html || '';
  const hi = doc.body_html_hi || '';
  const hasEn = !!en.trim();
  const hasHi = !!hi.trim();
  const lh = LETTERHEAD[doc.category] || { label: 'Instruction', office: [], signName: '', signSub: '' };
  const hdr = doc.header || {};          // mysql2 parses JSON columns to objects
  const officeHtml = lh.office.map(escapeText).join('<br>');
  const titleLine = `INSTRUCTION No. ${escapeText(doc.title)}${hdr.revised ? ' (REVISED)' : ''}`;
  const toggle = (hasEn && hasHi)
    ? `<div class="lang no-print">
         <button data-lang="en" class="active">English</button>
         <button data-lang="hi">हिंदी</button>
         <button data-lang="both">Both</button>
       </div>` : '';
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titleLine} — ${escapeText(lh.label)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { --brand:#0b3d91; --line:#e2e8f0; --ink:#17181a;
          --serif:'Times New Roman',Georgia,serif;
          --deva:'Noto Sans Devanagari','Times New Roman',serif; }
  * { box-sizing:border-box; }
  body { margin:0; background:#eef2f7; color:#334155;
         font-family:'Segoe UI',system-ui,sans-serif; }
  .bar { position:sticky; top:0; z-index:5; display:flex; gap:12px; align-items:center;
         justify-content:space-between; background:#fff; border-bottom:1px solid var(--line); padding:10px 16px; }
  .lang button { border:1px solid var(--line); background:#fff; padding:6px 12px;
         border-radius:6px; cursor:pointer; font-size:13px; }
  .lang button.active { background:var(--brand); color:#fff; border-color:var(--brand); }
  .btn { border:1px solid var(--brand); background:var(--brand); color:#fff;
         padding:7px 14px; border-radius:6px; cursor:pointer; font-size:13px; }

  .sheet { width:min(210mm,96%); margin:18px auto; background:#fff; color:var(--ink);
           padding:16mm 15mm 18mm; border:1px solid var(--line);
           box-shadow:0 8px 30px rgba(0,0,0,.12); font-family:var(--serif);
           font-size:12.2pt; line-height:1.5; position:relative; }
  .lh { display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:start; }
  .lh .l .hi { font-size:13pt; font-weight:700; font-family:var(--deva); }
  .lh .l .en { font-size:12pt; font-weight:700; letter-spacing:.5px; }
  .lh img { width:20mm; height:20mm; object-fit:contain; }
  .lh .r { justify-self:end; text-align:left; font-weight:700; font-size:11.5pt;
           font-family:var(--deva); line-height:1.35; }
  .lh .r .dt { margin-top:3px; font-family:var(--serif); }
  .rule { border:0; border-top:2.2px solid var(--ink); margin:4mm 0 0; }
  .rule2 { border:0; border-top:1px solid var(--ink); margin:.8mm 0 5mm; }
  .refline { font-weight:700; margin-bottom:2mm; }
  .addr { margin-bottom:4mm; }
  .addr.deva { font-family:var(--deva); }
  .title { text-align:center; font-weight:700; text-decoration:underline;
           margin:2mm 0 3mm; font-size:12.5pt; }
  .subj { text-align:center; font-weight:700; margin:0 0 5mm; }
  .body { text-align:justify; }
  .body.deva, .subj.deva, .addr.deva { font-family:var(--deva); }
  .body :is(ol,ul) { margin:0 0 3mm 6mm; }
  .body table { border-collapse:collapse; width:100%; }
  .body td, .body th { border:1px solid var(--ink); padding:1.6mm 1.4mm; }
  .divider { border:0; border-top:1px dashed #999; margin:7mm 0; }
  .sig { text-align:center; width:70mm; margin:16mm 0 0 auto; font-weight:700; }
  .sig .sp { height:16mm; }
  .sig .nm { font-family:var(--deva); }
  .foot { display:flex; justify-content:space-between; margin-top:14mm;
          font-size:6.5pt; color:#c9ced6; letter-spacing:.2px; }
  [hidden] { display:none !important; }

  @media print {
    @page { size:A4; margin:0; }
    body { background:#fff; }
    .no-print { display:none !important; }
    .sheet { width:auto; margin:0; border:none; box-shadow:none; }
  }
</style></head>
<body>
  <div class="bar no-print">
    ${toggle || '<span></span>'}
    <button class="btn" onclick="window.print()">🖨 Print / Save PDF</button>
  </div>
  <div class="sheet">
    <div class="lh">
      <div class="l"><div class="hi">मध्य रेल</div><div class="en">CENTRAL RAILWAY</div></div>
      <img src="/img/railway-logo.png" alt="" onerror="this.style.visibility='hidden'">
      <div class="r">${officeHtml}<div class="dt">Date: ${escapeText(fmtDocDate(doc.doc_date))}</div></div>
    </div>
    <hr class="rule"><hr class="rule2">
    ${hdr.ref_no ? `<div class="refline">No. ${escapeText(hdr.ref_no)}</div>` : ''}
    ${hdr.addressee ? `<div class="addr deva">${escapeText(hdr.addressee)}</div>` : ''}
    <div class="title">${titleLine}</div>
    ${doc.description ? `<div class="subj">Sub: ${escapeText(doc.description)}</div>` : ''}
    ${hasEn ? `<div class="body" data-body="en">${en}</div>` : ''}
    ${(hasEn && hasHi) ? `<hr class="divider" data-body="both" hidden>` : ''}
    ${hasHi ? `<div class="body deva" data-body="hi"${hasEn ? ' hidden' : ''}>${hi}</div>` : ''}
    <div class="sig">
      <div class="sp"></div>
      <div class="nm">${escapeText(lh.signName)}</div>
      <div class="nm">${escapeText(lh.signSub)}</div>
    </div>
    <div class="foot"><span>@sr dee tro bb</span><span>crtms.in</span></div>
  </div>
<script>
  var buttons = document.querySelectorAll('.lang button');
  function show(lang) {
    document.querySelectorAll('[data-body]').forEach(function (el) {
      var k = el.getAttribute('data-body');   // 'en', 'hi', or 'both' (the divider)
      el.hidden = lang === 'both' ? false : (k !== lang);
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
              body_html, body_html_hi, source_type, status, header, uploaded_by
         FROM div_documents WHERE id = ?`, [req.params.id]
    );
    if (!row) return res.status(404).json({ success: false, error: 'Not found' });
    if (row.source_type === 'composed') {
      // A draft is a private preview — only its author may open it.
      if (row.status === 'draft' && !ownsDraft(row, req)) {
        return res.status(403).json({ success: false, error: 'This draft is not yours to view.' });
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      // Cadre letters are filed as a COMPLETE page (their own letterhead,
      // tables and print CSS, rendered by utils/cadreLetterHtml.js) — serve it
      // as-is. renderInstructionPage() is the Sr.DEE/CEE-OP instruction format
      // and would wrap them in the wrong document.
      if (row.category === 'CADRE_LETTER') return res.send(row.body_html || '');
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
    if (!canDeleteCategory(getRole(req), doc.category)) {
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
