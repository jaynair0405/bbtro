-- Category Change Letters Feature
-- Date: 2026-02-15
-- Description: Track staff safety category changes via official letters

-- ============================================
-- 1. Category Change Letters table (stores letter metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS div_category_change_letters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  letter_date DATE NOT NULL,
  letter_no VARCHAR(50),                    -- e.g., BB.TRSO.ESTB.15 or BB.TRSO.EMU.15
  staff_type ENUM('MAINLINE', 'SUBURBAN') NOT NULL,

  -- Customizable content (supports Hindi - UTF8MB4)
  subject VARCHAR(500),
  subject_hindi VARCHAR(500),
  reference_text VARCHAR(500),              -- For Suburban: "Ref: L.NO.BB.TRO ESTB-15 dated..."
  content_text TEXT,
  content_text_hindi TEXT,
  footer_text TEXT,
  signing_designation VARCHAR(200),
  signing_designation_hindi VARCHAR(200),
  signing_place VARCHAR(200),
  signing_place_hindi VARCHAR(200),
  cc_text TEXT,                             -- CC recipients

  total_changes INT DEFAULT 0,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_letter_date_type (letter_date, staff_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 2. Category Change History table (tracks each staff's category changes)
-- ============================================
CREATE TABLE IF NOT EXISTS div_category_change_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_hrms_id VARCHAR(10) NOT NULL,
  old_category ENUM('A', 'B', 'C') NOT NULL,
  new_category ENUM('A', 'B', 'C') NOT NULL,
  letter_id INT NOT NULL,
  changed_date DATE NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_staff (staff_hrms_id),
  INDEX idx_letter (letter_id),
  INDEX idx_changed_date (changed_date),

  CONSTRAINT fk_cat_history_staff FOREIGN KEY (staff_hrms_id)
    REFERENCES div_staff_master(hrms_id) ON DELETE CASCADE,
  CONSTRAINT fk_cat_history_letter FOREIGN KEY (letter_id)
    REFERENCES div_category_change_letters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 3. Default content templates
-- ============================================

-- Main Line:
-- Letter No: BB.TRSO.ESTB.15
-- Subject: Review/Revision of Loco Pilots Category
-- Content: Keeping in view, the Safety performance of Loco Pilots and based on report of
--          Nominated Loco Inspector, safety category of the following Loco Pilot's is changed as under:-
-- Footer: This is approved by competent authority.
-- Signing: सहा.मं.वि.इं.(क.च.परि) / मुंबई छ.शि.म.ट.

-- Suburban:
-- Letter No: BB.TRSO.EMU.15
-- Subject: Revision of Motormen Category
-- Ref: L.NO.BB.TRO ESTB-15 dated 24/07/25 policy for categorization of Motortman.
-- Content: In connection with the above-referred proposal, the following category of Motorman
--          Has been revised as under: -
-- Footer: All concerned Depot in-charge at CSTM, KYN & PNVL to take note of the changes and
--         inform concerned M/Men. Nominated LI's will update performance book of above Motorman.
-- Signing: स.मं.वि. अभियंता (कर्षण.चल.स्टॉक परि) / छ.शि.म.ट., मुंबई
-- CC: C /- Sr. CC (Sub) CSTM / KYN / PNVL for RSOB.
--     C/- LPC (Sub) for Information to concerned M/ Men & LI's
