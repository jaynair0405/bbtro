-- Documents repository: add NEWS_LETTER and E_CASE_STUDY categories.
-- Both categories require doc_date and display in descending Year -> Month trees.
-- Upload and delete access is restricted to division_admin in documentRoutes.js.

ALTER TABLE div_documents
  MODIFY category ENUM(
    'TRAINING_LETTER','INITIAL_APPOINTMENT','PROMOTION_ORDER',
    'SR_DEE_INSTRUCTION','SAFETY_CIRCULAR','NEWS_LETTER','E_CASE_STUDY',
    'STUDY_MATERIAL','MANUAL','PRESENTATION','BROCHURE','MISC','TRANSFER_LETTER'
  ) NOT NULL;
