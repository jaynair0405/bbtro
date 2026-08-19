-- =====================================================================
-- SSE-HQ reports v2 — schema corrections
--
-- Runs AFTER sql/2026-08-19_ssehq_reports.sql (which created the three
-- tables, the `ssehq` div_role and the SSE_HQ_REPORT document category).
-- Local has run v1 only; prod has run neither, so both files ship together
-- and this one is written to be safe either way.
--
-- WHY EACH CHANGE
--
-- 1. doc_text is dropped. In the loco proforma DOC *is* the Date Of
--    Commissioning — the sample's Schedule row reads "Major: - DOC:-",
--    "Last inspection- IB:-". Carrying both doc_text and
--    loco_commission_date gave the form two boxes for one fact, and the
--    typed one always disagreed with the one auto-filled from div_locos.
--    Only loco_commission_date survives; the renderer labels it "DOC".
--
-- 2. detention_text becomes TEXT. VARCHAR(255) truncates a real detention
--    description, and normaliseOpr did not cap it, so a long paste came
--    back as a bare 500 rather than a validation message.
--
-- 3. pdf_document_id + word_document_id collapse into one document_id.
--    Reports are now filed the way cadre letters are — one composed row in
--    div_documents holding the rendered A4 page (source_type='composed'),
--    printed to PDF from the browser. Word stays a live download and is
--    never archived, so a second FK had nothing to point at.
--
-- 4. div_ssehq_delogging_events is new. The note's chronology is a bordered
--    two-column table in the real document, and it is the same event list
--    the OPR already holds — storing it as rows is what lets "Create note
--    from this OPR" carry the events across instead of retyping them.
-- =====================================================================

-- ── 1. drop doc_text (duplicate of loco_commission_date) ───────────────
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_opr_reports'
      AND COLUMN_NAME = 'doc_text') > 0,
  'ALTER TABLE div_ssehq_opr_reports DROP COLUMN doc_text',
  'SELECT "doc_text already dropped" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ── 2. detention needs room ────────────────────────────────────────────
ALTER TABLE div_ssehq_opr_reports MODIFY detention_text TEXT;

-- ── 3. one document_id per report, replacing the pdf/word pair ─────────
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_opr_reports'
      AND COLUMN_NAME = 'document_id') = 0,
  'ALTER TABLE div_ssehq_opr_reports
     ADD COLUMN document_id INT DEFAULT NULL AFTER status,
     ADD CONSTRAINT fk_ssehq_opr_doc FOREIGN KEY (document_id)
         REFERENCES div_documents (id) ON DELETE SET NULL',
  'SELECT "opr.document_id present" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_delogging_notes'
      AND COLUMN_NAME = 'document_id') = 0,
  'ALTER TABLE div_ssehq_delogging_notes
     ADD COLUMN document_id INT DEFAULT NULL AFTER status,
     ADD CONSTRAINT fk_ssehq_note_doc FOREIGN KEY (document_id)
         REFERENCES div_documents (id) ON DELETE SET NULL',
  'SELECT "note.document_id present" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Carry anything already filed onto the new column before the old ones go.
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_opr_reports'
      AND COLUMN_NAME = 'pdf_document_id') > 0,
  'UPDATE div_ssehq_opr_reports
      SET document_id = COALESCE(document_id, pdf_document_id, word_document_id)
    WHERE document_id IS NULL',
  'SELECT "opr already carried over" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_delogging_notes'
      AND COLUMN_NAME = 'pdf_document_id') > 0,
  'UPDATE div_ssehq_delogging_notes
      SET document_id = COALESCE(document_id, pdf_document_id, word_document_id)
    WHERE document_id IS NULL',
  'SELECT "note already carried over" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- FKs must go before their columns.
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_ssehq_opr_pdf') > 0,
  'ALTER TABLE div_ssehq_opr_reports DROP FOREIGN KEY fk_ssehq_opr_pdf',
  'SELECT "fk_ssehq_opr_pdf gone" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_ssehq_opr_word') > 0,
  'ALTER TABLE div_ssehq_opr_reports DROP FOREIGN KEY fk_ssehq_opr_word',
  'SELECT "fk_ssehq_opr_word gone" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_ssehq_note_pdf') > 0,
  'ALTER TABLE div_ssehq_delogging_notes DROP FOREIGN KEY fk_ssehq_note_pdf',
  'SELECT "fk_ssehq_note_pdf gone" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_ssehq_note_word') > 0,
  'ALTER TABLE div_ssehq_delogging_notes DROP FOREIGN KEY fk_ssehq_note_word',
  'SELECT "fk_ssehq_note_word gone" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_opr_reports'
      AND COLUMN_NAME = 'pdf_document_id') > 0,
  'ALTER TABLE div_ssehq_opr_reports
     DROP COLUMN pdf_document_id, DROP COLUMN word_document_id',
  'SELECT "opr pdf/word columns gone" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_delogging_notes'
      AND COLUMN_NAME = 'pdf_document_id') > 0,
  'ALTER TABLE div_ssehq_delogging_notes
     DROP COLUMN pdf_document_id, DROP COLUMN word_document_id',
  'SELECT "note pdf/word columns gone" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ── 4. the note gets its own chronology, mirroring the OPR's ───────────
CREATE TABLE IF NOT EXISTS div_ssehq_delogging_events (
  id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  note_id     INT NOT NULL,
  event_no    INT NOT NULL,
  event_time  VARCHAR(20) DEFAULT NULL,
  description TEXT,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ssehq_note_event (note_id, event_no),
  CONSTRAINT fk_ssehq_note_event FOREIGN KEY (note_id)
    REFERENCES div_ssehq_delogging_notes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='DElogging Note chronological events';

-- ── 5. clear the empty draft the broken form left behind ───────────────
-- Guarded on every identifying field being NULL, so a real report is safe.
DELETE FROM div_ssehq_opr_reports
 WHERE report_no IS NULL AND train_no IS NULL AND loco_number IS NULL
   AND status = 'draft' AND document_id IS NULL;

-- ── verify ─────────────────────────────────────────────────────────────
SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME LIKE 'div_ssehq%'
   AND COLUMN_NAME IN ('doc_text','document_id','pdf_document_id','word_document_id')
 ORDER BY TABLE_NAME, COLUMN_NAME;
SHOW TABLES LIKE 'div_ssehq%';
