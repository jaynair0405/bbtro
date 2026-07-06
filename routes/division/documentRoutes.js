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

// ── Config ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'TRAINING_LETTER', 'PROMOTION_ORDER', 'SR_DEE_INSTRUCTION',
  'SAFETY_CIRCULAR', 'STUDY_MATERIAL', 'MANUAL',
  'PRESENTATION', 'BROCHURE', 'MISC', 'TRANSFER_LETTER',
];

// Who may upload/delete each category. Everyone logged-in can view/download.
// Single source of truth — tweak here.
const CATEGORY_UPLOAD_ROLES = {
  TRAINING_LETTER:    ['trgcentre_admin', 'division_admin'],
  PROMOTION_ORDER:    ['office_hr', 'division_admin'],
  SR_DEE_INSTRUCTION: ['division_admin'],
  SAFETY_CIRCULAR:    ['division_admin'],
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
  'TRAINING_LETTER', 'PROMOTION_ORDER', 'SR_DEE_INSTRUCTION', 'SAFETY_CIRCULAR',
  'TRANSFER_LETTER',
]);

// Folder ("section") config per category, used for upload validation and to
// tell the client how to build the folder dropdown.
//   required: user MUST pick one of these folders.
//   optional: user MAY pick one of these (else the doc is "general", folder NULL).
const FOLDER_CONFIG = {
  STUDY_MATERIAL:  { required: ['Main Line', 'Suburban'] },
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
             original_name, file_type, file_size, uploaded_by, created_at
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

// ── GET /:id/view — open inline (browser viewer) ───────────────────────────
router.get('/:id/view', async (req, res) => {
  try {
    const { doc, filePath, error } = await locateFile(req.app.locals.pool, req.params.id);
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
