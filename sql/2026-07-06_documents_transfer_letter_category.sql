-- ============================================================================
-- Documents repository: add TRANSFER_LETTER category.
-- Date: 2026-07-06
--
-- Transfer letters prepared by the new Prepare Transfer Letter feature are
-- auto-filed here (folder = sending lobby office_code, doc_date = letter
-- date -> lobby folder + Year/Month tree, the 'folderdate' hybrid mode).
-- Signed/stamped scans may also be uploaded manually by office_hr.
-- Pattern follows sql/2026-07-02_documents_add_categories.sql.
-- ============================================================================

ALTER TABLE div_documents
  MODIFY category ENUM(
    'TRAINING_LETTER','PROMOTION_ORDER','SR_DEE_INSTRUCTION','SAFETY_CIRCULAR',
    'STUDY_MATERIAL','MANUAL','PRESENTATION','BROCHURE','MISC','TRANSFER_LETTER'
  ) NOT NULL;
