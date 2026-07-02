-- Documents repository: add new categories.
-- Adds Sr.DEE Instructions, Safety Circulars, Study Materials to div_documents.
-- Reinstatements is NOT a category — it is a folder ('Reinstatements') within
-- PROMOTION_ORDER. Study Materials uses folders 'Main Line' / 'Suburban'.
-- The `folder` column already exists (see 2026-06-29_div_documents.sql).

ALTER TABLE div_documents
  MODIFY category ENUM(
    'TRAINING_LETTER','PROMOTION_ORDER','SR_DEE_INSTRUCTION','SAFETY_CIRCULAR',
    'STUDY_MATERIAL','MANUAL','PRESENTATION','BROCHURE','MISC'
  ) NOT NULL;
