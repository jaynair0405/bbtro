-- =====================================================================
-- SSE-HQ Office Note
--
-- The third thing this desk writes. Unlike the OPR (a fixed proforma) and
-- the DElogging Note (a structured argument), an Office Note is a short
-- free-text note put up for orders: what happened, which instruction was
-- breached, "Put up for necessary action please", then the approval chain.
-- The portal supplies the format; the desk types the content.
--
-- Shape follows "Sample for Office note.docx":
--   मध्य रेल / मंडल कार्यालय / व. म. वि. इं. (क. च. स्टॉक/परि) / छ. शि. म. ट. मुंबई
--   No.BB.TRSO.ESTB.01            Date: 18-07-2025
--                  NOTE
--   <body, free text, several paragraphs>
--   Put up for necessary action please.
--                                    SSE/TRSO/CSMT
--   ADEE/TRSO/CSMT: / DEE/TRSO/CSMT: / Sr.DEE/TRSO/CSMT:
--
-- NOTE ON FIELDS
-- There is no train/loco/staff block. Both samples mention locos, trains and
-- crew, but as prose inside the narrative, not as headed fields — inventing
-- structure the document does not have would make the desk fill in boxes that
-- never appear on the paper. subject_text is the one addition: it is NOT
-- printed, and exists so the note is findable in the history list and reads
-- as something in the Documents repository other than a bare number.
--
-- No events table either: an Office Note has no chronology.
-- =====================================================================

CREATE TABLE IF NOT EXISTS div_ssehq_office_notes (
  id              INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  note_no         VARCHAR(80) DEFAULT NULL,
  note_date       DATE NOT NULL,
  -- Filing/search only; never rendered on the sheet.
  subject_text    VARCHAR(500) DEFAULT NULL,
  body_text       LONGTEXT,
  closing_text    VARCHAR(255) DEFAULT NULL,
  signing_text    VARCHAR(255) DEFAULT NULL,
  forwarding_text TEXT,
  status          ENUM('draft','final') NOT NULL DEFAULT 'draft',
  document_id     INT DEFAULT NULL,
  created_by      VARCHAR(50) DEFAULT NULL,
  finalized_at    DATETIME DEFAULT NULL,
  created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ssehq_office_date (note_date),
  KEY idx_ssehq_office_status (status),
  CONSTRAINT fk_ssehq_office_doc FOREIGN KEY (document_id)
    REFERENCES div_documents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='SSE-HQ office notes put up for orders';

-- verify
SHOW TABLES LIKE 'div_ssehq%';
