-- Documents Repository — div_documents
-- Backs the Documents page (public/div/documents.html). Replaces the old
-- hardcoded static PDF grid. See docs/DOCUMENTS_REPO_PLAN.md.
--
-- Files live in uploads/documents/ (private, served only via the login-gated
-- download route). This table holds the metadata.

CREATE TABLE IF NOT EXISTS div_documents (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  category      ENUM('TRAINING_LETTER','PROMOTION_ORDER','MANUAL',
                     'PRESENTATION','BROCHURE','MISC') NOT NULL,
  description   VARCHAR(500) NULL,
  doc_date      DATE NULL,             -- date ON the document (issue date);
                                       -- drives the Year/Month tree. NULL for
                                       -- non-dated categories (manuals/misc).
  folder        VARCHAR(120) NULL,     -- generic grouping (e.g. manual subject
                                       -- / department). Reserved for the
                                       -- Manuals tree; no migration needed later.
  file_name     VARCHAR(255) NOT NULL, -- stored filename on disk (uuid-prefixed)
  original_name VARCHAR(255) NOT NULL, -- name shown to the user / on download
  file_type     VARCHAR(20)  NOT NULL, -- pdf / pptx / docx / xlsx
  file_size     INT          NULL,     -- bytes
  uploaded_by   VARCHAR(50)  NULL,     -- login username of uploader
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_doc_date (doc_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Documents repository: training letters, promotion orders, manuals, etc.';
