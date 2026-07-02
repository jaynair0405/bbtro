# Documents Repository — Implementation Plan

Replaces the static Documents page (`public/div/documents.html`, a hardcoded
grid of 4 PDF cards) with a database-backed, role-scoped document repository
supporting Training Letters, Promotion Orders, Manuals, Misc, and more.

Branch: `feature/documents-repo` (off `master`). One module, one branch.

---

## 1. Current state (what we're replacing)

- **Sidebar link**: `public/div/index.html:190` → `📁 Documents` → `/div/documents.html`
- **Page**: `public/div/documents.html` — 4 cards hardcoded directly in HTML.
- **Files**: 4 PDFs physically in `public/div/pdf/`, world-readable by raw URL
  via `express.static`.
- **No database, no upload, no metadata store.** "Adding a document" = drop a
  file in the folder by hand + hand-edit the HTML. Does not scale.

The only metadata that exists today is typed into the HTML (title, description,
category). It will be lifted into the new table as seed rows (see §6).

---

## 2. Storage decision (chosen: option a)

All documents — the existing 4 and every future upload — live in **one private
folder** `uploads/documents/`, served **only** through a login-gated download
route. Nothing under `public/`. The old 4 files are moved out of
`public/div/pdf/` so they stop being publicly reachable by raw URL.

- Stored filename: `<uuid>__<sanitized-original-name>` to avoid collisions.
- Original display name preserved in the DB.

---

## 3. Database

New table `div_documents`. DDL lands in `sql/2026-06-29_div_documents.sql`
(per the schema-documentation rule — every DDL goes into a dated sql/ file).

```sql
CREATE TABLE div_documents (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  category      ENUM('TRAINING_LETTER','PROMOTION_ORDER','MANUAL',
                     'PRESENTATION','BROCHURE','MISC') NOT NULL,
  description   VARCHAR(500) NULL,
  doc_date      DATE NULL,            -- issue date; drives Year/Month tree.
                                      -- NULL for manuals/misc (non-dated trees)
  folder        VARCHAR(120) NULL,    -- generic grouping (e.g. manual subject/
                                      -- department). Deferred — used when the
                                      -- Manuals tree is designed. No migration
                                      -- needed later.
  file_name     VARCHAR(255) NOT NULL,   -- stored name on disk (uuid-prefixed)
  original_name VARCHAR(255) NOT NULL,   -- name shown/downloaded
  file_type     VARCHAR(20)  NOT NULL,   -- pdf / pptx / docx / xlsx
  file_size     INT          NULL,       -- bytes
  uploaded_by   VARCHAR(20)  NULL,       -- hrms_id
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_doc_date (doc_date)
);
```

Why two date-ish fields:
- `doc_date` = the date *on the document* (when the letter/order was issued).
  The tree groups by this (Year → Month). User enters it at upload.
- `created_at` = when it was uploaded to the portal (audit only).

`folder` is the escape hatch for non-date trees (Manuals). Nullable now, so
adding the Manuals grouping later is pure UI work, no schema change.

---

## 4. Access control — role-scoped by category

**View & download**: any logged-in division user (all roles).

**Upload & delete**: gated per category by one config object in the route file:

```js
const CATEGORY_UPLOAD_ROLES = {
  TRAINING_LETTER: ['trgcentre_admin', 'division_admin'],
  PROMOTION_ORDER: ['office_hr',       'division_admin'],
  MANUAL:          ['division_admin'],
  PRESENTATION:    ['division_admin'],
  BROCHURE:        ['division_admin'],
  MISC:            ['division_admin'],
};
```

Trivial to tweak — it's the single source of truth for who can manage what.

---

## 5. Backend — `routes/division/documentRoutes.js`

Registered in `server.js` alongside the other division routes. Uses `multer`
for uploads (disk storage → `uploads/documents/`).

| Method & path | Who | Purpose |
|---|---|---|
| `GET /api/division/documents?category=&year=&month=` | all logged-in | List/filter metadata (no file bytes) |
| `GET /api/division/documents/tree?category=` | all logged-in | Returns the year→month→docs tree for the sidebar |
| `POST /api/division/documents` | per `CATEGORY_UPLOAD_ROLES` | multer upload + insert row |
| `GET /api/division/documents/:id/download` | all logged-in | Streams file from `uploads/documents/` with original name |
| `DELETE /api/division/documents/:id` | per category role | Delete row + unlink file |

- Upload validates: file type whitelist (pdf, pptx, docx, xlsx), size cap,
  required title + category, and that the caller's role is allowed for that
  category.
- Download route is the only way to fetch a file — files never sit in `public/`.

---

## 6. Migration / seed (the existing 4 PDFs)

One-time script `sql/2026-06-29_div_documents_seed.sql` + a small move step:

1. Move the 4 files: `public/div/pdf/*` → `uploads/documents/` (uuid-renamed).
2. Insert 4 rows carrying the metadata currently hardcoded in the HTML:

| original_name | title | category | description |
|---|---|---|---|
| TRO PRESENTATION FOR GM INSPECTION-final.pdf | TRO Presentation | PRESENTATION | GM Inspection presentation covering TRO operations and achievements |
| ROHA RR presentation final-1.pdf | ROHA RR Presentation | PRESENTATION | Running Room presentation for ROHA section |
| CRTMS_Brochure_Revised 4.pdf | CRTMS Brochure | BROCHURE | Crew Resource & Time Management System - detailed brochure |
| signal broucher FINAL.pdf | Signal Brochure | BROCHURE | Signal department information brochure |

`doc_date` left NULL for these (unknown issue dates); they show under their
category without a year/month tree, or under an "Undated" node.

After this, the page renders all 4 from the API exactly as they look now.

---

## 7. Frontend — rework `public/div/documents.html`

Layout: **left sidebar of categories** + **main content pane**.

- Sidebar links: Training Letters · Promotion Orders · Manuals · Presentations ·
  Brochures · Misc.
- Click a category → it expands as a **tree view**:
  - **Training Letters / Promotion Orders**: Year → Month → document leaves.
    Built from `GET /documents/tree?category=`. Click a leaf → opens via the
    download route.
  - **Manuals**: tree shape TBD — designed together during UI building (will use
    the `folder` column). Until then, renders as a flat list.
  - **Misc / Presentations / Brochures**: flat list of cards.
- **Upload** button + modal: visible only if the current role can upload at
  least one category; the category dropdown is filtered to allowed categories.
  Date picker (`doc_date`) shown for date-tree categories.
- **Delete** (🗑) on a document shown only to roles allowed for its category.
- Role is read the same way other div pages read it (session role exposed to the
  page; see how `admin-centre-link`/`control-office-link` are toggled in
  `index.html`).

---

## 8. Build order

1. `feature/documents-repo` branch off `master`.
2. `sql/2026-06-29_div_documents.sql` — create table; run on local DB.
3. `routes/division/documentRoutes.js` + register in `server.js`; add `multer`
   dep if not present; create `uploads/documents/`.
4. Seed migration (move 4 files + insert rows); verify list API returns them.
5. Rework `documents.html` — sidebar + tree + cards from API.
6. Upload modal + delete, gated by role.
7. Manuals tree (with user, during UI building).
8. Test locally, then commit/push.

---

## 9. Open items to confirm before/while building

- Manuals tree grouping (deferred to UI building) — by subject? department?
- File type whitelist + max size (proposed: pdf/pptx/docx/xlsx, 25 MB).
- Should `doc_date` be required for Training/Promotion uploads (so the tree is
  never "Undated")? Proposed: yes, required for those two categories.

---

## 10. Future enhancement — user-creatable folders (DEFERRED)

Status as of **2026-07-02**: shipped sections are **hard-coded** (a DB `ENUM`
plus config: upload roles, layout, folders). Adding a section = ALTER + code +
deploy. This is fine for now — **decision: leave as-is.**

Discussed three ways to make it extensible (see chat id below):

1. **User-created sub-folders (PREFERRED direction).** Keep top-level sections
   code-defined, but let a user type a **new folder** within a section at upload
   (the `folder` column is already free-text, so no schema change — just a
   "＋ New folder" input + relaxed server validation for chosen sections).
   - **Prerequisite the user flagged:** first define **all the possible "parent
     folders" (top-level sections)** — the fixed set, like we have now — and
     only then allow user-created sub-folders beneath them. User will work out
     that parent-folder taxonomy and come back before we build this.
2. **Dynamic sections (bigger).** Replace the `category` ENUM with a
   `div_document_categories` table + a small "Manage Sections" admin page where
   an admin defines a section's name, layout (Year→Month / folders / flat) and
   which roles may upload. True self-service; not chosen now.
3. **Keep hard-coded.** I add each new section in code on request (~minutes +
   deploy). This is the current mode.

**Next step (when resumed):** user finalises the list of parent folders, then we
implement option 1 (user-typed sub-folders under those parents).

_Originating chat/session id: `2601e5bb-8233-482e-9270-6c39d9602123`._
