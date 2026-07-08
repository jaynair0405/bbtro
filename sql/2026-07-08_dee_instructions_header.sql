-- Documents repository: header/letterhead extras for composed instructions.
-- Optional per-instruction fields shown on the letterhead (reference/file number,
-- addressee line, and a "revised" flag) are stored together as JSON so the
-- letterhead can grow without further migrations.
--   header = { "ref_no": "...", "addressee": "...", "revised": true|false }

ALTER TABLE div_documents
  ADD COLUMN header JSON NULL AFTER source_type;
