-- =====================================================================
-- CLI (HQ) notes — Mainline, Diesel and Suburban HQ desks
--
-- The three CLI-HQ desks put up the same kind of short note the SSE-HQ desk
-- does (sql/2026-09-07_ssehq_office_notes.sql), plus two variants that the
-- SSE-HQ note never needed:
--   • award note     — same NOTE, longer approval chain (up to CEE OP)
--   • warning letter — addressed to a staff member, printed subject, signed by
--                      an officer by name, with C/- copies
-- Shapes follow data/NOTE FORMATS.docx (ML), data/Note format-dsl.docx (DSL)
-- and data/NOTE FORMAT-sub.docx (SUB).
--
-- WHICH DESK
-- The three accounts already exist (clihqmlbb, clidslhqbb, clihqsubbb) and are
-- division_admin. The desk is therefore NOT a role and NOT the office code:
-- div_office_code is CSMT-HQ on all three and trainingLetterRoutes.js maps
-- that value, so repurposing it would break training letters. A dedicated
-- nullable column carries it; an admin with no desk chooses one in the UI.
--
-- ONE TABLE, THREE FORMATS
-- note_kind picks the format. The letter-only columns (addressee_*, copy_to)
-- are NULL on notes; staff_rows (the DSL sample's Sr No / Name / PF / Desg
-- table) is optional on every kind. Per-desk defaults — letterhead variant,
-- number series, signatory, approval chain — live in the render module, not
-- here: they are starting values the desk edits, not data.
-- =====================================================================

-- 1. Desk marker on the account.
ALTER TABLE users
  ADD COLUMN clihq_desk ENUM('ML','DSL','SUB') NULL DEFAULT NULL AFTER div_office_code;

UPDATE users SET clihq_desk = 'ML'  WHERE username = 'clihqmlbb';
UPDATE users SET clihq_desk = 'DSL' WHERE username = 'clidslhqbb';
UPDATE users SET clihq_desk = 'SUB' WHERE username = 'clihqsubbb';

-- 2. Documents repository category (folders: NOTE, AWARD_NOTE, WARNING_LETTER).
ALTER TABLE div_documents
  MODIFY category ENUM(
    'TRAINING_LETTER','INITIAL_APPOINTMENT','PROMOTION_ORDER',
    'SR_DEE_INSTRUCTION','CEE_OP_INSTRUCTION','SAFETY_CIRCULAR',
    'NEWS_LETTER','E_CASE_STUDY','STUDY_MATERIAL','MANUAL',
    'PRESENTATION','BROCHURE','MISC','TRANSFER_LETTER','CADRE_LETTER',
    'SSE_HQ_REPORT','CLI_HQ_NOTE'
  ) NOT NULL;

-- 3. The notes.
CREATE TABLE IF NOT EXISTS div_clihq_notes (
  id                    INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  desk                  ENUM('ML','DSL','SUB') NOT NULL,
  note_kind             ENUM('note','award','warning') NOT NULL DEFAULT 'note',
  note_no               VARCHAR(80) DEFAULT NULL,
  note_date             DATE NOT NULL,
  -- Filing/search on notes (not printed); printed as "Subject:" on a letter.
  subject_text          VARCHAR(500) DEFAULT NULL,
  -- Warning letter only.
  staff_hrms_id         VARCHAR(10) DEFAULT NULL,
  addressee_name        VARCHAR(120) DEFAULT NULL,
  addressee_designation VARCHAR(120) DEFAULT NULL,
  addressee_pf          VARCHAR(20) DEFAULT NULL,
  -- Optional staff table inside the note: JSON array of
  -- {name, pf_number, designation_station}.
  staff_rows            JSON DEFAULT NULL,
  body_text             LONGTEXT,
  closing_text          VARCHAR(255) DEFAULT NULL,
  -- "CLI(HQ)" on a note; "(RAHUL KR MISHRA)\nDEE TRO BB" on a letter.
  signing_text          VARCHAR(255) DEFAULT NULL,
  -- Approval chain on a note; C/- copies on a letter. One per line.
  forwarding_text       TEXT,
  status                ENUM('draft','final') NOT NULL DEFAULT 'draft',
  document_id           INT DEFAULT NULL,
  created_by            VARCHAR(50) DEFAULT NULL,
  finalized_at          DATETIME DEFAULT NULL,
  created_at            TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_clihq_desk_date (desk, note_date),
  KEY idx_clihq_status (status),
  KEY idx_clihq_kind (note_kind),
  CONSTRAINT fk_clihq_note_doc FOREIGN KEY (document_id)
    REFERENCES div_documents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='CLI (HQ) ML/DSL/SUB notes, award notes and warning letters';

-- verify
SELECT username, div_role, clihq_desk FROM users WHERE clihq_desk IS NOT NULL;
SHOW TABLES LIKE 'div_clihq%';
