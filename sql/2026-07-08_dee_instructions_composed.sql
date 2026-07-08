-- Documents repository: support IN-SITE composed instructions (Sr.DEE / CEE-OP)
-- authored in a rich-text editor instead of uploaded as scanned PDFs.
--
-- A composed instruction is a div_documents row with source_type='composed' and
-- the HTML body stored in body_html (English) / body_html_hi (Hindi). It has no
-- file on disk, so the file columns are relaxed to NULL. Legacy uploaded rows
-- keep source_type='uploaded' and are untouched.
--
-- title       = instruction number   (already rendered inline by leafEl)
-- description = subject               (already rendered inline)
-- doc_date    = instruction date      (drives the Year -> Month tree)

ALTER TABLE div_documents
  ADD COLUMN body_html    LONGTEXT NULL AFTER folder,
  ADD COLUMN body_html_hi LONGTEXT NULL AFTER body_html,
  ADD COLUMN language     ENUM('en','hi','both') NULL AFTER body_html_hi,
  ADD COLUMN source_type  ENUM('uploaded','composed') NOT NULL DEFAULT 'uploaded' AFTER language,
  MODIFY file_name    VARCHAR(255) NULL,
  MODIFY original_name VARCHAR(255) NULL,
  MODIFY file_type    VARCHAR(20)  NULL;
