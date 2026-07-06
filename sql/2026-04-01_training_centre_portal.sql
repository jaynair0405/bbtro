-- ============================================================
-- Training Centre Portal - Migration Script
-- Date: 2026-04-01
-- ============================================================

-- 1. ALTER users table: add training_center_id and expand div_role enum
-- ============================================================

-- First expand div_role enum to include trgcentre_admin
ALTER TABLE users
  MODIFY COLUMN div_role ENUM('division_admin', 'office_hr', 'trgcentre_admin') DEFAULT NULL;

-- Add training_center_id column
ALTER TABLE users
  ADD COLUMN training_center_id INT NULL AFTER div_office_code,
  ADD CONSTRAINT fk_users_training_center
    FOREIGN KEY (training_center_id) REFERENCES div_training_centers(center_id);

-- 2. INSERT 3 training centre users
-- ============================================================
-- Passwords: plain text, will be auto-upgraded to bcrypt on first login
INSERT INTO users (username, password, role, full_name, realm, div_role, training_center_id)
VALUES
  ('mtc_cla', 'mtccla@2026', 'user', 'MTC Kurla (CLA)', 'division', 'trgcentre_admin', 3),
  ('mtc_kyn', 'mtckyn@2026', 'user', 'MTC Kalyan', 'division', 'trgcentre_admin', 2),
  ('dtc_kyn', 'dtckyn@2026', 'user', 'DTC Kalyan', 'division', 'trgcentre_admin', 4);

-- 3. ALTER div_training_letters: add status and workflow timestamps
-- ============================================================
ALTER TABLE div_training_letters
  ADD COLUMN status ENUM('draft', 'sent', 'attendance_confirmed', 'completed') DEFAULT 'draft' AFTER total_staff,
  ADD COLUMN training_center_id INT NULL AFTER status,
  ADD COLUMN attendance_confirmed_at TIMESTAMP NULL AFTER training_center_id,
  ADD COLUMN completed_at TIMESTAMP NULL AFTER attendance_confirmed_at,
  ADD CONSTRAINT fk_letters_training_center
    FOREIGN KEY (training_center_id) REFERENCES div_training_centers(center_id);

-- 4. ALTER div_training_letter_staff: add attendance and completion fields
-- ============================================================
ALTER TABLE div_training_letter_staff
  ADD COLUMN attendance_status ENUM('pending', 'present', 'absent') DEFAULT 'pending' AFTER remarks,
  ADD COLUMN attendance_marked_at TIMESTAMP NULL AFTER attendance_status,
  ADD COLUMN completion_status ENUM('pending', 'completed', 'not_completed') DEFAULT 'pending' AFTER attendance_marked_at,
  ADD COLUMN completion_date DATE NULL AFTER completion_status,
  ADD COLUMN completion_marked_at TIMESTAMP NULL AFTER completion_date,
  ADD COLUMN completion_remarks TEXT NULL AFTER completion_marked_at;

-- 5. CREATE div_training_calendar: centre's course scheduling
-- ============================================================
CREATE TABLE IF NOT EXISTS div_training_calendar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  training_center_id INT NOT NULL,
  training_id INT NULL COMMENT 'FK to div_training_types (26=MMPRC, 17=MEMU, 5=AUTOMATIC)',
  course_type VARCHAR(30) NOT NULL COMMENT 'REFRESHER, PROMOTION, ONE_DAY_INTENSIVE, MEMU_INITIAL, MEMU_REFRESHER',
  batch_code VARCHAR(20) NOT NULL COMMENT 'e.g. MMRC-61, MMOD-45',
  from_date DATE NOT NULL,
  to_date DATE NULL COMMENT 'Completion date, filled by centre',
  status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
  remarks TEXT NULL,
  created_by VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_calendar_center FOREIGN KEY (training_center_id) REFERENCES div_training_centers(center_id),
  CONSTRAINT fk_calendar_training FOREIGN KEY (training_id) REFERENCES div_training_types(training_id),
  UNIQUE KEY uk_batch_code (batch_code),
  INDEX idx_center_date (training_center_id, from_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. CREATE batch_code_sequences: track running numbers per prefix per centre
-- ============================================================
CREATE TABLE IF NOT EXISTS div_training_batch_sequences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  training_center_id INT NOT NULL,
  prefix VARCHAR(10) NOT NULL COMMENT 'MMRC, MMPC, MMOD, MMMI, MMMR',
  last_number INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_batch_seq_center FOREIGN KEY (training_center_id) REFERENCES div_training_centers(center_id),
  UNIQUE KEY uk_center_prefix (training_center_id, prefix)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Pre-populate sequence rows for MTC CLA (center_id=3)
INSERT INTO div_training_batch_sequences (training_center_id, prefix, last_number) VALUES
  (3, 'MMRC', 0),
  (3, 'MMPC', 0),
  (3, 'MMOD', 0),
  (3, 'MMMI', 0),
  (3, 'MMMR', 0);

-- Pre-populate for MTC KYN (center_id=2)
INSERT INTO div_training_batch_sequences (training_center_id, prefix, last_number) VALUES
  (2, 'MMRC', 0),
  (2, 'MMPC', 0),
  (2, 'MMOD', 0),
  (2, 'MMMI', 0),
  (2, 'MMMR', 0);

-- Pre-populate for DTC KYN (center_id=4)
INSERT INTO div_training_batch_sequences (training_center_id, prefix, last_number) VALUES
  (4, 'MMRC', 0),
  (4, 'MMPC', 0),
  (4, 'MMOD', 0),
  (4, 'MMMI', 0),
  (4, 'MMMR', 0);

-- ============================================================
-- Done. Summary:
-- 1. users: added training_center_id, expanded div_role enum
-- 2. 3 centre users created (mtc_cla, mtc_kyn, dtc_kyn)
-- 3. div_training_letters: added status, training_center_id, timestamps
-- 4. div_training_letter_staff: added attendance & completion fields
-- 5. div_training_calendar: new table for course scheduling
-- 6. div_training_batch_sequences: tracks running batch numbers
-- ============================================================

-- ----------------------------------------------------------------------
-- div_training_centers was created directly in the DB in the same era;
-- DDL recovered from SHOW CREATE TABLE on 2026-07-06 for the record.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `div_training_centers` (
  `center_id` int NOT NULL AUTO_INCREMENT,
  `center_code` varchar(20) DEFAULT NULL,
  `center_name` varchar(50) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `center_type` enum('ZRTI','MTC','DTC','Other') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`center_id`),
  UNIQUE KEY `center_code` (`center_code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
;
