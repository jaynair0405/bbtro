-- Documents repository: add CEE_OP_INSTRUCTION category.
-- CEE-OP instructions are uploaded by division_admin only and displayed in a
-- descending Year -> Month tree using doc_date. Shown directly below Sr.DEE
-- Instructions in the category rail.

ALTER TABLE div_documents
  MODIFY category ENUM(
    'TRAINING_LETTER','INITIAL_APPOINTMENT','PROMOTION_ORDER',
    'SR_DEE_INSTRUCTION','CEE_OP_INSTRUCTION','SAFETY_CIRCULAR','NEWS_LETTER','E_CASE_STUDY',
    'STUDY_MATERIAL','MANUAL','PRESENTATION','BROCHURE','MISC','TRANSFER_LETTER'
  ) NOT NULL;
