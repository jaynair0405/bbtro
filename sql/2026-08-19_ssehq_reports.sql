-- SSE-HQ reports: OPR and DElogging Note
-- Idempotent schema/access migration. Run after the existing Documents and
-- div_locos migrations.

-- 1. Keep SSEHQ separate from CTLC while allowing the account to retain the
-- read-only Control Office portal.
ALTER TABLE users
  MODIFY div_role ENUM(
    'division_admin','office_hr','trgcentre_admin','lpc','ctlc','clicms',
    'ctlc_view','ssehq'
  ) NULL;

INSERT INTO users
  (username, password, role, full_name, office, realm, div_role, div_office_code,
   training_center_id, can_access_rtis, can_access_sub_spm)
VALUES
  ('ssehq', '$2b$10$6yA3HLcDUr718aw.hXzGzONvIGg4PT23UWmbPdct3n3FlEszSynRa', 'user', 'SSE HQ BB TRO', NULL, 'division', 'ssehq', 'CO-BB',
   NULL, 0, 0)
ON DUPLICATE KEY UPDATE
  div_role = 'ssehq',
  realm = 'division',
  div_office_code = 'CO-BB';

-- 2. Documents repository category. Existing file metadata is sufficient for
-- generated PDF/DOCX files; the report tables below retain the relationships.
ALTER TABLE div_documents
  MODIFY category ENUM(
    'TRAINING_LETTER','INITIAL_APPOINTMENT','PROMOTION_ORDER',
    'SR_DEE_INSTRUCTION','CEE_OP_INSTRUCTION','SAFETY_CIRCULAR',
    'NEWS_LETTER','E_CASE_STUDY','STUDY_MATERIAL','MANUAL',
    'PRESENTATION','BROCHURE','MISC','TRANSFER_LETTER','CADRE_LETTER',
    'SSE_HQ_REPORT'
  ) NOT NULL;

-- 3. OPR: one-page detention report.
CREATE TABLE IF NOT EXISTS div_ssehq_opr_reports (
  id                    INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  report_no             VARCHAR(80) DEFAULT NULL,
  report_date           DATE NOT NULL,
  failure_date          DATE DEFAULT NULL,
  division_railway      VARCHAR(120) DEFAULT 'Mumbai/CR',
  train_no              VARCHAR(40) DEFAULT NULL,
  loco_number           VARCHAR(20) DEFAULT NULL,
  loco_type             VARCHAR(30) DEFAULT NULL,
  loco_base             VARCHAR(30) DEFAULT NULL,
  loco_commission_date  DATE DEFAULT NULL,
  doc_text              VARCHAR(120) DEFAULT NULL,
  last_inspection_type  VARCHAR(30) DEFAULT NULL,
  last_inspection_date  DATE DEFAULT NULL,
  last_schedule_type    VARCHAR(30) DEFAULT NULL,
  last_schedule_date    DATE DEFAULT NULL,
  load_text             VARCHAR(120) DEFAULT NULL,
  lp_staff_hrms_id      VARCHAR(10) DEFAULT NULL,
  lp_name               VARCHAR(120) DEFAULT NULL,
  alp_staff_hrms_id     VARCHAR(10) DEFAULT NULL,
  alp_name              VARCHAR(120) DEFAULT NULL,
  section_text          VARCHAR(120) DEFAULT NULL,
  major_text            VARCHAR(255) DEFAULT NULL,
  minor_text            VARCHAR(255) DEFAULT NULL,
  detention_text        VARCHAR(255) DEFAULT NULL,
  repercussion_text     TEXT,
  punctuality_text      TEXT,
  reported_text         TEXT,
  reason_text           TEXT,
  responsibility_text   TEXT,
  status                ENUM('draft','final') NOT NULL DEFAULT 'draft',
  pdf_document_id       INT DEFAULT NULL,
  word_document_id      INT DEFAULT NULL,
  created_by             VARCHAR(50) DEFAULT NULL,
  finalized_at          DATETIME DEFAULT NULL,
  created_at             TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ssehq_opr_date (report_date),
  KEY idx_ssehq_opr_train (train_no),
  KEY idx_ssehq_opr_loco (loco_number),
  KEY idx_ssehq_opr_status (status),
  CONSTRAINT fk_ssehq_opr_pdf FOREIGN KEY (pdf_document_id)
    REFERENCES div_documents (id) ON DELETE SET NULL,
  CONSTRAINT fk_ssehq_opr_word FOREIGN KEY (word_document_id)
    REFERENCES div_documents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='SSE-HQ one-page detention reports';

CREATE TABLE IF NOT EXISTS div_ssehq_opr_events (
  id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  report_id   INT NOT NULL,
  event_no    INT NOT NULL,
  event_time  VARCHAR(20) DEFAULT NULL,
  description TEXT,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ssehq_opr_event_report (report_id, event_no),
  CONSTRAINT fk_ssehq_opr_event_report FOREIGN KEY (report_id)
    REFERENCES div_ssehq_opr_reports (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='OPR chronological detention events';

-- 4. DElogging Note: independent detailed report, as requested.
CREATE TABLE IF NOT EXISTS div_ssehq_delogging_notes (
  id                    INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  note_no               VARCHAR(80) DEFAULT NULL,
  note_date             DATE NOT NULL,
  subject_text          VARCHAR(500) DEFAULT NULL,
  train_no              VARCHAR(40) DEFAULT NULL,
  train_date            DATE DEFAULT NULL,
  loco_number           VARCHAR(20) DEFAULT NULL,
  loco_type             VARCHAR(30) DEFAULT NULL,
  loco_base             VARCHAR(30) DEFAULT NULL,
  loco_commission_date  DATE DEFAULT NULL,
  staff_hrms_id         VARCHAR(10) DEFAULT NULL,
  staff_name            VARCHAR(120) DEFAULT NULL,
  body_text             LONGTEXT,
  punctuality_text      TEXT,
  repercussion_text     TEXT,
  statements_text       LONGTEXT,
  conclusion_text       LONGTEXT,
  signing_text          VARCHAR(255) DEFAULT NULL,
  forwarding_text       TEXT,
  status                ENUM('draft','final') NOT NULL DEFAULT 'draft',
  pdf_document_id       INT DEFAULT NULL,
  word_document_id      INT DEFAULT NULL,
  created_by             VARCHAR(50) DEFAULT NULL,
  finalized_at          DATETIME DEFAULT NULL,
  created_at             TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ssehq_note_date (note_date),
  KEY idx_ssehq_note_train (train_no),
  KEY idx_ssehq_note_loco (loco_number),
  KEY idx_ssehq_note_status (status),
  CONSTRAINT fk_ssehq_note_pdf FOREIGN KEY (pdf_document_id)
    REFERENCES div_documents (id) ON DELETE SET NULL,
  CONSTRAINT fk_ssehq_note_word FOREIGN KEY (word_document_id)
    REFERENCES div_documents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='SSE-HQ detailed DElogging Notes';
