-- Documents repository: add INITIAL_APPOINTMENT category.
-- Initial appointment documents are uploaded by office_hr/division_admin and
-- displayed in a descending Year -> Month tree using doc_date.

ALTER TABLE div_documents
  MODIFY category ENUM(
    'TRAINING_LETTER','INITIAL_APPOINTMENT','PROMOTION_ORDER',
    'SR_DEE_INSTRUCTION','SAFETY_CIRCULAR','STUDY_MATERIAL','MANUAL',
    'PRESENTATION','BROCHURE','MISC','TRANSFER_LETTER'
  ) NOT NULL;
