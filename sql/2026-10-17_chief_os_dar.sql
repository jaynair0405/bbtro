-- =====================================================================
-- Chief OS (Office Superintendent) — D&AR desk
--
-- Standard Forms under the Railway Servants (Discipline & Appeal) Rules 1968,
-- issued from the Sr. DEE (TRO) office: SF-1 suspension, SF-4 revocation,
-- SF-5 major-penalty chargesheet, SF-7 inquiry officer, SF-11 minor-penalty
-- memorandum. Samples in data/chief-os/ (untracked).
--
-- CASE FILE, NOT LOOSE LETTERS
-- The forms are stages of one action against one staff member, and they refer
-- to each other (SF-4 revokes an SF-1; SF-7 follows an SF-5). A case row holds
-- the staff and the subject; each letter hangs off it, optionally pointing at
-- the letter it follows. The pending-cases register falls out of this.
--
-- WHO
-- One account, chiefostro, div_role 'chiefos'. Confined by allowlist in
-- server.js (its own pages, the Documents repository it files into, and the
-- read-only Staff Bio-Profile report). The desk (ML/DSL/SUB) is chosen per
-- case — one person holds the post for all three — and drives the number
-- series BB.TRSO.DAR.<desk>.<yy>.<serial> seen on the samples.
--
-- Rollback at the bottom.
-- =====================================================================

-- 1. Role value.
ALTER TABLE users
  MODIFY div_role ENUM('division_admin','office_hr','trgcentre_admin','lpc','ctlc','clicms',
                       'ctlc_view','ssehq','trip_shed_operator','trip_shed_supervisor','cli',
                       'jrcc','chiefos') DEFAULT NULL;

-- 2. The account. Password set at creation (bcrypt, cost 12); the holder
--    changes it on first login. Idempotent on username.
INSERT INTO users
  (username, password, role, full_name, office, realm, div_role, div_office_code,
   training_center_id, can_access_rtis, can_access_sub_spm, must_change_password)
SELECT 'chiefostro', '$2b$12$4AhphGrgCwCG.SNnBl2hA.zrva0Is5ypDk2aCbh7TmUsAzMTx96pK',
       'user', 'Chief OS, Sr. DEE (TRO) BB', 'HQ', 'division', 'chiefos', 'CSMT-HQ',
       NULL, 0, 0, 1
 WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'chiefostro');

-- 3. Documents repository category (folders: one per form).
ALTER TABLE div_documents
  MODIFY category ENUM(
    'TRAINING_LETTER','INITIAL_APPOINTMENT','PROMOTION_ORDER',
    'SR_DEE_INSTRUCTION','CEE_OP_INSTRUCTION','SAFETY_CIRCULAR',
    'NEWS_LETTER','E_CASE_STUDY','STUDY_MATERIAL','MANUAL',
    'PRESENTATION','BROCHURE','MISC','TRANSFER_LETTER','CADRE_LETTER',
    'SSE_HQ_REPORT','CLI_HQ_NOTE','DAR_LETTER'
  ) NOT NULL;

-- 4. Cases.
CREATE TABLE IF NOT EXISTS div_dar_cases (
  id                INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  desk              ENUM('ML','DSL','SUB') NOT NULL,
  -- The charged official: from div_staff_master or div_cli_master (hrms_id is
  -- one key space across both); a copy of the name/designation/PF as they
  -- stood when the case opened, because letters quote them as of that date.
  staff_hrms_id     VARCHAR(10) DEFAULT NULL,
  staff_is_cli      TINYINT(1) NOT NULL DEFAULT 0,
  staff_name        VARCHAR(120) NOT NULL,
  staff_designation VARCHAR(120) DEFAULT NULL,
  staff_pf          VARCHAR(20) DEFAULT NULL,
  staff_office      VARCHAR(60) DEFAULT NULL,
  incident_date     DATE DEFAULT NULL,
  subject_text      VARCHAR(500) NOT NULL,
  status            ENUM('open','closed') NOT NULL DEFAULT 'open',
  opened_on         DATE NOT NULL,
  closed_on         DATE DEFAULT NULL,
  closing_remarks   TEXT,
  created_by        VARCHAR(50) DEFAULT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_dar_case_staff (staff_hrms_id),
  KEY idx_dar_case_status (status, desk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Letters. One row per Standard Form issued in a case. The form's own
--    blanks live in fields JSON (each form has different ones; a column per
--    blank per form would be five sparse tables). Shared columns are the ones
--    every form prints and the register searches on.
CREATE TABLE IF NOT EXISTS div_dar_letters (
  id                INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  case_id           INT NOT NULL,
  form_code         ENUM('SF1','SF4','SF5','SF7','SF11') NOT NULL,
  letter_no         VARCHAR(80) DEFAULT NULL,
  letter_date       DATE NOT NULL,
  place_of_issue    VARCHAR(120) DEFAULT NULL,
  signatory         VARCHAR(160) DEFAULT NULL,
  -- SF-4 -> the SF-1 it revokes; SF-7 -> the SF-5 it follows.
  follows_letter_id INT DEFAULT NULL,
  fields            JSON DEFAULT NULL,
  copy_to_text      TEXT,
  status            ENUM('draft','final') NOT NULL DEFAULT 'draft',
  document_id       INT DEFAULT NULL,
  finalized_at      DATETIME DEFAULT NULL,
  created_by        VARCHAR(50) DEFAULT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_dar_letter_case (case_id, form_code),
  CONSTRAINT fk_dar_letter_case FOREIGN KEY (case_id)
    REFERENCES div_dar_cases (id) ON DELETE CASCADE,
  CONSTRAINT fk_dar_letter_follows FOREIGN KEY (follows_letter_id)
    REFERENCES div_dar_letters (id) ON DELETE SET NULL,
  CONSTRAINT fk_dar_letter_doc FOREIGN KEY (document_id)
    REFERENCES div_documents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rollback:
--   DROP TABLE div_dar_letters; DROP TABLE div_dar_cases;
--   DELETE FROM users WHERE username = 'chiefostro';
--   ALTER TABLE users MODIFY div_role ENUM(...without 'chiefos'...);
--   ALTER TABLE div_documents MODIFY category ENUM(...without 'DAR_LETTER'...);
