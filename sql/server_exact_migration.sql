-- ============================================================
-- EXACT SCHEMA MIGRATION FOR SLATE/DETAIL-BOOK/TW
-- Run on server to match local database exactly
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables (they have wrong schema)
DROP TABLE IF EXISTS div_daily_slate;
DROP TABLE IF EXISTS div_detail_book_log;
DROP TABLE IF EXISTS div_office_slot_template;
DROP TABLE IF EXISTS div_staff_fatigue_tracker;
DROP TABLE IF EXISTS div_tw_detail;
DROP TABLE IF EXISTS div_tw_slots;
DROP TABLE IF EXISTS div_tw_yards;

-- ============================================================
-- 1. div_office_slot_template
-- ============================================================
CREATE TABLE `div_office_slot_template` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(15) NOT NULL,
  `shift_code` enum('00_08','08_16','16_24') NOT NULL,
  `slot_time` time NOT NULL,
  `slot_order` smallint DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_office_slot` (`office_code`,`slot_time`),
  KEY `idx_office_shift` (`office_code`,`shift_code`,`slot_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 2. div_detail_book_log (before div_daily_slate due to FK)
-- ============================================================
CREATE TABLE `div_detail_book_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(15) NOT NULL,
  `incoming_detail` varchar(50) DEFAULT NULL,
  `loco_no` varchar(20) DEFAULT NULL,
  `sign_on_time` datetime DEFAULT NULL,
  `sign_off_time` datetime DEFAULT NULL,
  `is_pilot` tinyint(1) DEFAULT '0',
  `lp_hrms_id` varchar(10) DEFAULT NULL,
  `lp_rest_type` enum('NORMAL','PR','1_DAY_LEAVE','MULTI_DAY_LEAVE') DEFAULT NULL,
  `lp_next_slot_date` date DEFAULT NULL,
  `lp_next_slot_time` time DEFAULT NULL,
  `lp_actual_rest_hours` decimal(4,1) DEFAULT NULL,
  `alp_hrms_id` varchar(10) DEFAULT NULL,
  `alp_rest_type` enum('NORMAL','PR','1_DAY_LEAVE','MULTI_DAY_LEAVE') DEFAULT 'NORMAL',
  `alp_next_slot_date` date DEFAULT NULL,
  `alp_next_slot_time` time DEFAULT NULL,
  `alp_actual_rest_hours` decimal(4,1) DEFAULT NULL,
  `alp_incoming_detail` varchar(50) DEFAULT NULL,
  `alp_sign_off_time` datetime DEFAULT NULL,
  `alp_is_pilot` tinyint(1) DEFAULT NULL,
  `processed_by` varchar(50) DEFAULT NULL,
  `shift_date` date NOT NULL,
  `shift_code` enum('00_08','08_16','16_24') NOT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_safe_pending` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_office_date` (`office_code`,`shift_date`),
  KEY `idx_sign_off_date` (`sign_off_time`),
  KEY `idx_lp_hrms` (`lp_hrms_id`),
  KEY `idx_alp_hrms` (`alp_hrms_id`),
  KEY `idx_is_pilot` (`office_code`,`is_pilot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 3. div_daily_slate
-- ============================================================
CREATE TABLE `div_daily_slate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(15) NOT NULL,
  `slot_date` date NOT NULL,
  `slot_time` time NOT NULL,
  `shift_code` enum('00_08','08_16','16_24') NOT NULL,
  `is_adhoc` tinyint(1) DEFAULT '0',
  `lp_hrms_id` varchar(10) DEFAULT NULL,
  `lp_status` enum('AVAILABLE','FORECAST','SIGNED_ON','ONLINE','BOOKED','SAFE') DEFAULT 'AVAILABLE',
  `lp_exception` enum('AUC','NF') DEFAULT NULL,
  `lp_exception_remark` varchar(200) DEFAULT NULL,
  `lp_detail_book_id` int DEFAULT NULL,
  `alp_hrms_id` varchar(10) DEFAULT NULL,
  `alp_status` enum('AVAILABLE','FORECAST','SIGNED_ON','ONLINE','BOOKED','SAFE') DEFAULT 'AVAILABLE',
  `alp_exception` enum('AUC','NF') DEFAULT NULL,
  `alp_exception_remark` varchar(200) DEFAULT NULL,
  `alp_detail_book_id` int DEFAULT NULL,
  `alp_cross_slot_time` time DEFAULT NULL,
  `train_no` varchar(20) DEFAULT NULL,
  `loco_no` varchar(20) DEFAULT NULL,
  `train_assigned_at` timestamp NULL DEFAULT NULL,
  `lp_signed_on_at` timestamp NULL DEFAULT NULL,
  `alp_signed_on_at` timestamp NULL DEFAULT NULL,
  `departed_at` timestamp NULL DEFAULT NULL,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` varchar(50) DEFAULT NULL,
  `lp_late_reason` varchar(100) DEFAULT NULL,
  `lp_detention` enum('YES','NO') DEFAULT NULL,
  `lp_detention_remark` varchar(200) DEFAULT NULL,
  `alp_late_reason` varchar(100) DEFAULT NULL,
  `alp_detention` enum('YES','NO') DEFAULT NULL,
  `alp_detention_remark` varchar(200) DEFAULT NULL,
  `is_pilot` tinyint(1) DEFAULT '0',
  `booking_remarks` text,
  `booked_at` timestamp NULL DEFAULT NULL,
  `booked_by` varchar(50) DEFAULT NULL,
  `lp_safe_sign_off_time` time DEFAULT NULL,
  `alp_safe_sign_off_time` time DEFAULT NULL,
  `alp_source` enum('SLATE','OUT_OF_SLATE','OTHER_DEPOT') DEFAULT 'SLATE',
  `alp_source_name` varchar(100) DEFAULT NULL,
  `alp_source_depot` varchar(50) DEFAULT NULL,
  `extra_alp_hrms_id` varchar(20) DEFAULT NULL,
  `extra_alp_source` enum('SLATE','OUT_OF_SLATE','OTHER_DEPOT') DEFAULT NULL,
  `extra_alp_source_name` varchar(100) DEFAULT NULL,
  `extra_alp_source_depot` varchar(50) DEFAULT NULL,
  `extra_alp_original_slot_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_office_date` (`office_code`,`slot_date`),
  KEY `idx_office_datetime` (`office_code`,`slot_date`,`slot_time`),
  KEY `idx_lp_hrms` (`lp_hrms_id`),
  KEY `idx_alp_hrms` (`alp_hrms_id`),
  KEY `idx_lp_status` (`office_code`,`slot_date`,`lp_status`),
  KEY `idx_alp_status` (`office_code`,`slot_date`,`alp_status`),
  KEY `idx_shift` (`office_code`,`slot_date`,`shift_code`),
  KEY `fk_slate_lp_detail` (`lp_detail_book_id`),
  KEY `fk_slate_alp_detail` (`alp_detail_book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 4. div_staff_fatigue_tracker
-- ============================================================
CREATE TABLE `div_staff_fatigue_tracker` (
  `hrms_id` varchar(10) NOT NULL,
  `office_code` varchar(15) NOT NULL,
  `current_night_streak` tinyint DEFAULT '0',
  `last_night_duty_date` date DEFAULT NULL,
  `total_night_duties` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`hrms_id`),
  KEY `idx_office` (`office_code`),
  KEY `idx_streak` (`current_night_streak` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 5. div_tw_yards
-- ============================================================
CREATE TABLE `div_tw_yards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL DEFAULT 'PNVL-ML',
  `yard_code` varchar(10) NOT NULL,
  `yard_name` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tw_yard` (`office_code`,`yard_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 6. div_tw_slots
-- ============================================================
CREATE TABLE `div_tw_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL DEFAULT 'PNVL-ML',
  `yard_code` varchar(10) NOT NULL,
  `slot_time` time NOT NULL,
  `detail_timing` varchar(20) NOT NULL,
  `shift_code` enum('00_08','08_16','16_24') NOT NULL,
  `slot_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tw_slot` (`office_code`,`yard_code`,`slot_time`),
  KEY `idx_tw_slots_yard` (`yard_code`),
  KEY `idx_tw_slots_office` (`office_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 7. div_tw_detail
-- ============================================================
CREATE TABLE `div_tw_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL,
  `detail_date` date NOT NULL,
  `slot_time` time NOT NULL,
  `shift_code` enum('00_08','08_16','16_24') NOT NULL,
  `yard_code` varchar(10) NOT NULL,
  `detail_timing` varchar(20) DEFAULT NULL,
  `lp_hrms_id` varchar(20) DEFAULT NULL,
  `lp_cms_id` varchar(20) DEFAULT NULL,
  `lp_name` varchar(100) DEFAULT NULL,
  `lp_status` enum('AVAILABLE','FORECAST','ONLINE','SAFE') DEFAULT 'AVAILABLE',
  `lp_signed_on_at` datetime DEFAULT NULL,
  `lp_late_reason` varchar(200) DEFAULT NULL,
  `lp_exception` enum('AUC','NF') DEFAULT NULL,
  `lp_exception_remark` varchar(200) DEFAULT NULL,
  `tr_no` varchar(50) DEFAULT NULL,
  `loco_no` varchar(20) DEFAULT NULL,
  `lp_signed_off_at` datetime DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tw_office_date` (`office_code`,`detail_date`),
  KEY `idx_tw_lp_hrms` (`lp_hrms_id`),
  KEY `idx_tw_status` (`lp_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DROP PROCEDURE IF EXISTS sp_generate_daily_slots;
DROP PROCEDURE IF EXISTS sp_populate_slot_template;

DELIMITER //

CREATE PROCEDURE sp_generate_daily_slots(IN p_office_code VARCHAR(15), IN p_date DATE)
BEGIN
    DECLARE v_count INT DEFAULT 0;

    SELECT COUNT(*) INTO v_count FROM div_office_slot_template
    WHERE office_code = p_office_code AND is_active = TRUE;

    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No slot template found for this office. Run sp_populate_slot_template first.';
    END IF;

    INSERT IGNORE INTO div_daily_slate (office_code, slot_date, slot_time, shift_code, is_adhoc)
    SELECT
        office_code,
        p_date,
        slot_time,
        shift_code,
        FALSE
    FROM div_office_slot_template
    WHERE office_code = p_office_code AND is_active = TRUE
    ORDER BY slot_time;

    SELECT CONCAT('Generated ', ROW_COUNT(), ' slots for ', p_office_code, ' on ', p_date) AS result;
END //

CREATE PROCEDURE sp_populate_slot_template(IN p_office_code VARCHAR(15))
BEGIN
    DECLARE slot_order INT DEFAULT 0;

    DELETE FROM div_office_slot_template WHERE office_code = p_office_code;

    INSERT INTO div_office_slot_template (office_code, shift_code, slot_time, slot_order)
    SELECT p_office_code, '00_08', MAKETIME(h, m, 0), (@row := @row + 1)
    FROM (SELECT 0 h UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7) hours,
         (SELECT 0 m UNION SELECT 15 UNION SELECT 30 UNION SELECT 45) minutes,
         (SELECT @row := 0) r
    WHERE h < 8;

    INSERT INTO div_office_slot_template (office_code, shift_code, slot_time, slot_order)
    SELECT p_office_code, '08_16', MAKETIME(h, m, 0), (@row2 := @row2 + 1)
    FROM (SELECT 8 h UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15) hours,
         (SELECT 0 m UNION SELECT 15 UNION SELECT 30 UNION SELECT 45) minutes,
         (SELECT @row2 := 32) r
    WHERE h >= 8 AND h < 16;

    INSERT INTO div_office_slot_template (office_code, shift_code, slot_time, slot_order)
    SELECT p_office_code, '16_24', MAKETIME(h, m, 0), (@row3 := @row3 + 1)
    FROM (SELECT 16 h UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) hours,
         (SELECT 0 m UNION SELECT 15 UNION SELECT 30 UNION SELECT 45) minutes,
         (SELECT @row3 := 64) r
    WHERE h >= 16;

    SELECT COUNT(*) AS slots_created FROM div_office_slot_template WHERE office_code = p_office_code;
END //

DELIMITER ;

-- ============================================================
-- DEFAULT DATA
-- ============================================================

-- Populate slot template for PNVL-ML
CALL sp_populate_slot_template('PNVL-ML');

-- TW Yards
INSERT INTO div_tw_yards (office_code, yard_code, yard_name, display_order) VALUES
('PNVL-ML', 'PEN', 'Pen Yard', 1),
('PNVL-ML', 'NEU', 'Nerul Yard', 2),
('PNVL-ML', 'PNVL', 'Panvel Yard', 3);

-- TW Slots
INSERT INTO div_tw_slots (office_code, yard_code, slot_time, detail_timing, shift_code, slot_order) VALUES
('PNVL-ML', 'PEN', '05:30:00', '06:30x13:30', '00_08', 1),
('PNVL-ML', 'PEN', '13:30:00', '14:30x21:30', '08_16', 2),
('PNVL-ML', 'PEN', '21:30:00', '22:30x05:30', '16_24', 3),
('PNVL-ML', 'NEU', '05:30:00', '06:30x13:30', '00_08', 1),
('PNVL-ML', 'NEU', '13:30:00', '14:30x21:30', '08_16', 2),
('PNVL-ML', 'NEU', '21:30:00', '22:30x05:30', '16_24', 3),
('PNVL-ML', 'PNVL', '05:30:00', '06:30x13:30', '00_08', 1),
('PNVL-ML', 'PNVL', '13:30:00', '14:30x21:30', '08_16', 2);

SELECT 'Migration complete!' AS status;
