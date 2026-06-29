/**
 * migrate-documents-seed.js — one-time seed for the Documents repository.
 *
 * Lifts the 4 PDFs that were hardcoded in public/div/documents.html into the
 * div_documents table, moving the files from the public folder into the
 * private uploads/documents/ store. Idempotent: skips a file whose row already
 * exists, so it is safe to run on both local and prod.
 *
 *   node scripts/migrate-documents-seed.js
 *
 * See docs/DOCUMENTS_REPO_PLAN.md.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../config/database');

const PUBLIC_PDF_DIR = path.join(__dirname, '..', 'public', 'div', 'pdf');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'documents');

const SEED = [
  {
    file: 'TRO PRESENTATION FOR GM INSPECTION-final.pdf',
    title: 'TRO Presentation',
    category: 'PRESENTATION',
    description: 'GM Inspection presentation covering TRO operations and achievements',
  },
  {
    file: 'ROHA RR presentation final-1.pdf',
    title: 'ROHA RR Presentation',
    category: 'PRESENTATION',
    description: 'Running Room presentation for ROHA section',
  },
  {
    file: 'CRTMS_Brochure_Revised 4.pdf',
    title: 'CRTMS Brochure',
    category: 'BROCHURE',
    description: 'Crew Resource & Time Management System - detailed brochure',
  },
  {
    file: 'signal broucher FINAL.pdf',
    title: 'Signal Brochure',
    category: 'BROCHURE',
    description: 'Signal department information brochure',
  },
];

function sanitize(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 180);
}

async function main() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  let inserted = 0, skipped = 0, missing = 0;

  for (const s of SEED) {
    const [[existing]] = await pool.query(
      'SELECT id FROM div_documents WHERE original_name = ? AND category = ?',
      [s.file, s.category]
    );
    if (existing) {
      console.log(`skip (already seeded): ${s.file}`);
      skipped++;
      continue;
    }

    const src = path.join(PUBLIC_PDF_DIR, s.file);
    if (!fs.existsSync(src)) {
      console.warn(`MISSING source, cannot seed: ${src}`);
      missing++;
      continue;
    }

    const storedName = `${crypto.randomUUID()}__${sanitize(s.file)}`;
    const dest = path.join(UPLOAD_DIR, storedName);
    fs.copyFileSync(src, dest);
    const size = fs.statSync(dest).size;

    await pool.query(
      `INSERT INTO div_documents
         (title, category, description, doc_date, folder,
          file_name, original_name, file_type, file_size, uploaded_by)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [s.title, s.category, s.description, null, null,
        storedName, s.file, 'pdf', size, 'system']
    );

    fs.rmSync(src); // remove the now-private file from the public folder
    console.log(`seeded: ${s.file} -> ${storedName}`);
    inserted++;
  }

  console.log(`\nDone. inserted=${inserted} skipped=${skipped} missing=${missing}`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
