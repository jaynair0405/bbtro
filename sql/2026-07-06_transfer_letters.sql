-- ============================================================================
-- Transfer Letter module — schema
-- Date: 2026-07-06
--
-- Uniform inter-lobby transfer letters (reference: CC Lobby IGP letter,
-- tmp/transfer_letter_new_format.jpeg). One row per letter + ordered staff
-- child rows with per-staff letter fields. On "Transfer staff now" the
-- letter creates div_transfer_requests rows (status Pending) so the staff
-- appear in the receiving lobby's existing transfer inbox; letter_id on the
-- request traces it back to the letter.
--
-- Lifecycle: draft -> finalized (PDF filed into div_documents,
-- category TRANSFER_LETTER, folder = from_office_code) -> transferred.
-- IDEMPOTENT: safe to re-run (CREATE IF NOT EXISTS + guarded ALTER).
-- ============================================================================

CREATE TABLE IF NOT EXISTS div_transfer_letters (
    id                  INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    letter_no           VARCHAR(80)  DEFAULT NULL,       -- auto-suggested, office-editable free text
    letter_date         DATE NOT NULL,
    from_office_code    VARCHAR(15) NOT NULL,            -- sending lobby (issuing office)
    to_office_code      VARCHAR(15) NOT NULL,            -- receiving lobby
    transfer_category   ENUM('Promotion','Permanent Transfer','Temporary Transfer')
                        NOT NULL DEFAULT 'Permanent Transfer',
    office_header_text  VARCHAR(255) DEFAULT NULL,       -- issuing-office block, newline-separated
    addressee_text      VARCHAR(255) DEFAULT NULL,       -- "The Senior Crew Controller\nKYN\nMumbai Division"
    subject_text        VARCHAR(255) DEFAULT NULL,
    ref_text            VARCHAR(255) DEFAULT NULL,       -- office order no./date, free text
    body_text           TEXT,
    bullets_text        TEXT,                            -- newline-separated bullet lines
    footer_text         VARCHAR(255) DEFAULT 'Please report their arrival.',
    signing_designation        VARCHAR(100) DEFAULT NULL,
    signing_designation_hindi  VARCHAR(100) DEFAULT NULL,
    cc_text             TEXT,                            -- newline-separated C/- lines
    total_staff         INT DEFAULT 0,
    status              ENUM('draft','finalized','transferred') NOT NULL DEFAULT 'draft',
    document_id         INT DEFAULT NULL,                -- filed PDF in div_documents
    finalized_at        DATETIME DEFAULT NULL,
    transferred_at      DATETIME DEFAULT NULL,
    created_by          VARCHAR(50) DEFAULT NULL,
    created_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_tl_office_date (from_office_code, letter_date),
    KEY idx_tl_status (status),
    CONSTRAINT fk_tl_from FOREIGN KEY (from_office_code) REFERENCES offices (office_code),
    CONSTRAINT fk_tl_to   FOREIGN KEY (to_office_code)   REFERENCES offices (office_code),
    CONSTRAINT fk_tl_doc  FOREIGN KEY (document_id) REFERENCES div_documents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS div_transfer_letter_staff (
    id                      INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    letter_id               INT NOT NULL,
    staff_hrms_id           VARCHAR(10) NOT NULL,
    sr_no                   INT NOT NULL,
    pf_number_snapshot      VARCHAR(20) DEFAULT NULL,    -- snapshots keep old letters stable
    name_snapshot           VARCHAR(100) DEFAULT NULL,
    existing_reporting_date DATE DEFAULT NULL,           -- prefilled from div_staff_master.reporting_date, editable
    relieving_date          DATE DEFAULT NULL,           -- manual
    footplate_km            INT DEFAULT NULL,            -- manual (no source in schema)
    new_reporting_date      DATE DEFAULT NULL,           -- manual (reporting date at new lobby)
    created_at              TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_letter_staff (letter_id, staff_hrms_id),
    CONSTRAINT fk_tls_letter FOREIGN KEY (letter_id) REFERENCES div_transfer_letters (id) ON DELETE CASCADE,
    CONSTRAINT fk_tls_staff  FOREIGN KEY (staff_hrms_id) REFERENCES div_staff_master (hrms_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Trace transfer requests back to the letter that created them
SET @have_letter_id := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'div_transfer_requests'
     AND COLUMN_NAME = 'letter_id');
SET @sql := IF(@have_letter_id = 0,
  'ALTER TABLE div_transfer_requests
     ADD COLUMN letter_id INT DEFAULT NULL AFTER remarks,
     ADD CONSTRAINT fk_tr_letter FOREIGN KEY (letter_id)
         REFERENCES div_transfer_letters (id) ON DELETE SET NULL',
  'SELECT ''div_transfer_requests.letter_id already present'' AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
