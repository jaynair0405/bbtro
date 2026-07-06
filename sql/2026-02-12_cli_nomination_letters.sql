-- CLI Nomination Letters Feature
-- Date: 2026-02-12
-- Description: Track nomination changes via letters, support for NA CLI

-- ============================================
-- 1. Add NA CLI (for unassigned staff)
-- ============================================
INSERT INTO div_cli_master (cli_name, cmsid, cli_hrms_id, is_active, current_office_code)
VALUES ('Not Assigned', NULL, NULL, 1, NULL)
ON DUPLICATE KEY UPDATE cli_name = 'Not Assigned';

-- ============================================
-- 2. Nomination Letters table (stores letter metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS div_cli_nomination_letters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  letter_date DATE NOT NULL,
  letter_no VARCHAR(50),                    -- e.g., BB.TRSO.ESTB.15
  staff_type ENUM('SUBURBAN', 'NON_SUBURBAN') NOT NULL,

  -- Customizable content (supports Hindi - UTF8MB4)
  subject VARCHAR(500) DEFAULT 'Sub: Changes in nomination.',
  subject_hindi VARCHAR(500) DEFAULT 'विषय: नामांकन में परिवर्तन।',
  content_text TEXT,                        -- "Due to posting & rotation of Loco Pilot..."
  content_text_hindi TEXT,
  footer_text VARCHAR(500) DEFAULT 'C/ CLPC & CLI CO: for information',
  signing_designation VARCHAR(200),         -- Sr.DEE(C.Ch.Pari)
  signing_designation_hindi VARCHAR(200),   -- मं.वि.इं.(क.च.परि)
  signing_place VARCHAR(200),               -- Mumbai CST
  signing_place_hindi VARCHAR(200),         -- मुंबई छ.शि.म.ट.

  total_changes INT DEFAULT 0,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_letter_date_type (letter_date, staff_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Add letter_id to nominations table
-- ============================================
ALTER TABLE div_cli_nominations
ADD COLUMN letter_id INT DEFAULT NULL,
ADD INDEX idx_letter_id (letter_id);

-- ============================================
-- 4. Default letter content templates
-- ============================================
-- These can be used as defaults when creating new letters

-- For Non-Suburban (ALP/LPG/LPS):
-- Subject: Sub: Changes in nomination.
-- Content: Due to posting & rotation of Assistant Loco Pilot changes are made in Loco Inspectors nomination list with immediate effect.
-- OR
-- Content: Due to posting & rotation of Loco Pilot changes are made in Loco Inspectors nomination list with immediate effect.

-- For Suburban (Motorman):
-- Subject: Sub: Changes in nomination.
-- Content: Due to posting & rotation of Motorman changes are made in Loco Inspectors nomination list with immediate effect.

-- ============================================
-- 5. View for letter with changes
-- ============================================
CREATE OR REPLACE VIEW v_cli_letter_changes AS
SELECT
    l.id as letter_id,
    l.letter_date,
    l.letter_no,
    l.staff_type,
    l.subject,
    l.content_text,
    l.footer_text,
    l.signing_designation,
    l.signing_place,
    n.nomination_id,
    n.staff_hrms_id,
    s.name as staff_name,
    s.current_cms_id as pf_no,
    d.designation_name,
    s.current_office_code as depot,
    s.safety_category as category,
    old_cli.cli_name as old_cli_name,
    new_cli.cli_name as new_cli_name,
    n.remarks
FROM div_cli_nomination_letters l
JOIN div_cli_nominations n ON n.letter_id = l.id
JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
JOIN div_cli_master new_cli ON n.cli_id = new_cli.cli_id
LEFT JOIN designations d ON s.designation_id = d.id
LEFT JOIN (
    -- Get the expired nomination that was replaced by this one
    SELECT n1.staff_hrms_id, n1.cli_id, n1.nominated_to_date
    FROM div_cli_nominations n1
    WHERE n1.status = 'Expired'
) expired_nom ON expired_nom.staff_hrms_id = n.staff_hrms_id
    AND expired_nom.nominated_to_date = DATE_SUB(n.nominated_from_date, INTERVAL 1 DAY)
LEFT JOIN div_cli_master old_cli ON expired_nom.cli_id = old_cli.cli_id
ORDER BY l.letter_date DESC, n.nomination_id;

-- ============================================
-- 6. Useful queries
-- ============================================

-- Get all real CLIs (exclude NA)
-- SELECT * FROM div_cli_master WHERE cli_hrms_id IS NOT NULL;

-- Get CLI load view (staff count per CLI)
-- SELECT c.cli_id, c.cli_name, c.current_office_code, COUNT(n.nomination_id) as staff_count
-- FROM div_cli_master c
-- LEFT JOIN div_cli_nominations n ON c.cli_id = n.cli_id AND n.status = 'Active'
-- WHERE c.cli_hrms_id IS NOT NULL AND c.is_active = 1
-- GROUP BY c.cli_id
-- ORDER BY staff_count DESC;

-- Get unassigned staff (NA CLI)
-- SELECT s.hrms_id, s.name, s.current_cms_id, s.current_office_code, n.remarks
-- FROM div_cli_nominations n
-- JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
-- JOIN div_cli_master c ON n.cli_id = c.cli_id
-- WHERE c.cli_hrms_id IS NULL AND n.status = 'Active';

-- Get suburban staff (by CMS prefix)
-- SELECT * FROM div_staff_master
-- WHERE current_cms_id REGEXP '^(PNVS|KYNS|CSTS)';

-- Get non-suburban staff
-- SELECT * FROM div_staff_master
-- WHERE current_cms_id NOT REGEXP '^(PNVS|KYNS|CSTS)' OR current_cms_id IS NULL;
