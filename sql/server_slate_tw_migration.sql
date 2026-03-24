-- ============================================================
-- SLATE, DETAIL BOOK & TW DETAIL - Server Migration Script
-- Run this on server before pulling code
-- ============================================================

-- 1. Main Slate Table
CREATE TABLE IF NOT EXISTS `div_daily_slate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL,
  `slate_date` date NOT NULL,
  `shift_code` enum('00_08','08_16','16_24') NOT NULL,
  `slot_time` time NOT NULL,
  `is_adhoc` tinyint(1) DEFAULT '0',
  `lp_hrms_id` varchar(20) DEFAULT NULL,
  `lp_cms_id` varchar(20) DEFAULT NULL,
  `lp_name` varchar(100) DEFAULT NULL,
  `lp_status` enum('AVAILABLE','FORECAST','ONLINE','SAFE') DEFAULT 'AVAILABLE',
  `lp_exception` enum('AUC','NF','LATE') DEFAULT NULL,
  `lp_exception_remark` varchar(200) DEFAULT NULL,
  `alp_hrms_id` varchar(20) DEFAULT NULL,
  `alp_cms_id` varchar(20) DEFAULT NULL,
  `alp_name` varchar(100) DEFAULT NULL,
  `alp_status` enum('AVAILABLE','FORECAST','ONLINE','SAFE') DEFAULT 'AVAILABLE',
  `alp_exception` enum('AUC','NF','LATE') DEFAULT NULL,
  `alp_exception_remark` varchar(200) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_office_date_shift` (`office_code`,`slate_date`,`shift_code`),
  KEY `idx_lp_hrms` (`lp_hrms_id`),
  KEY `idx_alp_hrms` (`alp_hrms_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Detail Book Log Table
CREATE TABLE IF NOT EXISTS `div_detail_book_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL,
  `log_date` date NOT NULL,
  `shift_code` enum('00_08','08_16','16_24') NOT NULL,
  `lp_hrms_id` varchar(20) DEFAULT NULL,
  `lp_cms_id` varchar(20) DEFAULT NULL,
  `lp_name` varchar(100) DEFAULT NULL,
  `lp_sign_on_time` time DEFAULT NULL,
  `lp_late_reason` varchar(200) DEFAULT NULL,
  `lp_sign_off_time` time DEFAULT NULL,
  `lp_next_slot_time` time DEFAULT NULL,
  `lp_next_slot_date` date DEFAULT NULL,
  `lp_rest_type` enum('NORMAL','PR') DEFAULT 'NORMAL',
  `alp_hrms_id` varchar(20) DEFAULT NULL,
  `alp_cms_id` varchar(20) DEFAULT NULL,
  `alp_name` varchar(100) DEFAULT NULL,
  `alp_sign_on_time` time DEFAULT NULL,
  `alp_late_reason` varchar(200) DEFAULT NULL,
  `alp_sign_off_time` time DEFAULT NULL,
  `alp_next_slot_time` time DEFAULT NULL,
  `alp_next_slot_date` date DEFAULT NULL,
  `alp_rest_type` enum('NORMAL','PR') DEFAULT 'NORMAL',
  `train_no` varchar(20) DEFAULT NULL,
  `loco_no` varchar(20) DEFAULT NULL,
  `from_station` varchar(50) DEFAULT NULL,
  `to_station` varchar(50) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `safe_processed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_office_date` (`office_code`,`log_date`),
  KEY `idx_lp_hrms` (`lp_hrms_id`),
  KEY `idx_alp_hrms` (`alp_hrms_id`),
  KEY `idx_safe_processed` (`safe_processed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. TW Detail Table
CREATE TABLE IF NOT EXISTS `div_tw_detail` (
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
  KEY `idx_office_date` (`office_code`,`detail_date`),
  KEY `idx_lp_hrms` (`lp_hrms_id`),
  KEY `idx_status` (`lp_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. TW Slots Table
CREATE TABLE IF NOT EXISTS `div_tw_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL,
  `yard_code` varchar(10) NOT NULL,
  `slot_time` time NOT NULL,
  `detail_timing` varchar(30) DEFAULT NULL,
  `shift_code` enum('00_08','08_16','16_24') NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_office_yard_slot` (`office_code`,`yard_code`,`slot_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. TW Yards Table
CREATE TABLE IF NOT EXISTS `div_tw_yards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL,
  `yard_code` varchar(10) NOT NULL,
  `yard_name` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_office_yard` (`office_code`,`yard_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Staff Fatigue Tracker (Night Streak)
CREATE TABLE IF NOT EXISTS `div_staff_fatigue_tracker` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL,
  `hrms_id` varchar(20) NOT NULL,
  `night_streak` int DEFAULT '0',
  `last_night_duty_date` date DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_office_hrms` (`office_code`,`hrms_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. Office Slot Template
CREATE TABLE IF NOT EXISTS `div_office_slot_template` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL,
  `shift_code` enum('00_08','08_16','16_24') NOT NULL,
  `slot_time` time NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_office_shift_slot` (`office_code`,`shift_code`,`slot_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- 8. SP: Generate Daily Slots from Template
DROP PROCEDURE IF EXISTS `sp_generate_daily_slots`;
DELIMITER //
CREATE PROCEDURE `sp_generate_daily_slots`(
    IN p_office_code VARCHAR(20),
    IN p_slate_date DATE
)
BEGIN
    DECLARE v_shift VARCHAR(10);

    -- Determine current shift based on time
    SET v_shift = CASE
        WHEN HOUR(NOW()) >= 0 AND HOUR(NOW()) < 8 THEN '00_08'
        WHEN HOUR(NOW()) >= 8 AND HOUR(NOW()) < 16 THEN '08_16'
        ELSE '16_24'
    END;

    -- Insert slots from template that don't exist
    INSERT INTO div_daily_slate (office_code, slate_date, shift_code, slot_time)
    SELECT p_office_code, p_slate_date, shift_code, slot_time
    FROM div_office_slot_template
    WHERE office_code = p_office_code
      AND is_active = 1
      AND NOT EXISTS (
          SELECT 1 FROM div_daily_slate ds
          WHERE ds.office_code = p_office_code
            AND ds.slate_date = p_slate_date
            AND ds.shift_code = div_office_slot_template.shift_code
            AND ds.slot_time = div_office_slot_template.slot_time
      );

    SELECT ROW_COUNT() AS slots_created;
END //
DELIMITER ;

-- 9. SP: Update Night Streak
DROP PROCEDURE IF EXISTS `sp_update_night_streak`;
DELIMITER //
CREATE PROCEDURE `sp_update_night_streak`(
    IN p_office_code VARCHAR(20),
    IN p_hrms_id VARCHAR(20),
    IN p_duty_date DATE,
    IN p_is_night_duty BOOLEAN
)
BEGIN
    DECLARE v_last_night_date DATE;
    DECLARE v_current_streak INT DEFAULT 0;

    -- Get current tracker record
    SELECT night_streak, last_night_duty_date
    INTO v_current_streak, v_last_night_date
    FROM div_staff_fatigue_tracker
    WHERE office_code = p_office_code AND hrms_id = p_hrms_id;

    IF p_is_night_duty THEN
        -- Check if consecutive night
        IF v_last_night_date IS NOT NULL AND DATEDIFF(p_duty_date, v_last_night_date) = 1 THEN
            SET v_current_streak = v_current_streak + 1;
        ELSE
            SET v_current_streak = 1;
        END IF;

        INSERT INTO div_staff_fatigue_tracker (office_code, hrms_id, night_streak, last_night_duty_date)
        VALUES (p_office_code, p_hrms_id, v_current_streak, p_duty_date)
        ON DUPLICATE KEY UPDATE
            night_streak = v_current_streak,
            last_night_duty_date = p_duty_date;
    ELSE
        -- Reset streak on non-night duty
        UPDATE div_staff_fatigue_tracker
        SET night_streak = 0
        WHERE office_code = p_office_code AND hrms_id = p_hrms_id;
    END IF;

    SELECT v_current_streak AS new_streak;
END //
DELIMITER ;

-- 10. SP: Populate Slot Template for Office
DROP PROCEDURE IF EXISTS `sp_populate_slot_template`;
DELIMITER //
CREATE PROCEDURE `sp_populate_slot_template`(
    IN p_office_code VARCHAR(20)
)
BEGIN
    -- Default 15-minute slots for each shift
    -- Shift 00_08: 00:00 to 07:45
    INSERT IGNORE INTO div_office_slot_template (office_code, shift_code, slot_time)
    SELECT p_office_code, '00_08', MAKETIME(h, m, 0)
    FROM (SELECT 0 h UNION SELECT 1 UNION SELECT 2 UNION SELECT 3
          UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7) hours,
         (SELECT 0 m UNION SELECT 15 UNION SELECT 30 UNION SELECT 45) minutes
    WHERE NOT (h = 7 AND m > 45);

    -- Shift 08_16: 08:00 to 15:45
    INSERT IGNORE INTO div_office_slot_template (office_code, shift_code, slot_time)
    SELECT p_office_code, '08_16', MAKETIME(h, m, 0)
    FROM (SELECT 8 h UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
          UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15) hours,
         (SELECT 0 m UNION SELECT 15 UNION SELECT 30 UNION SELECT 45) minutes
    WHERE NOT (h = 15 AND m > 45);

    -- Shift 16_24: 16:00 to 23:45
    INSERT IGNORE INTO div_office_slot_template (office_code, shift_code, slot_time)
    SELECT p_office_code, '16_24', MAKETIME(h, m, 0)
    FROM (SELECT 16 h UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
          UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) hours,
         (SELECT 0 m UNION SELECT 15 UNION SELECT 30 UNION SELECT 45) minutes;

    SELECT COUNT(*) AS total_slots FROM div_office_slot_template WHERE office_code = p_office_code;
END //
DELIMITER ;

-- ============================================================
-- DEFAULT DATA: TW Yards and Slots for CLI office
-- ============================================================

-- Insert default yards for CLI
INSERT IGNORE INTO div_tw_yards (office_code, yard_code, yard_name) VALUES
('CLI', 'PEN', 'Pen Yard'),
('CLI', 'NEU', 'Nerul Yard'),
('CLI', 'PNVL', 'Panvel Yard');

-- Insert default TW slots for CLI
INSERT IGNORE INTO div_tw_slots (office_code, yard_code, slot_time, detail_timing, shift_code) VALUES
-- PEN Yard slots
('CLI', 'PEN', '05:30:00', '06:30x13:30', '00_08'),
('CLI', 'PEN', '06:00:00', '07:00x14:00', '00_08'),
('CLI', 'PEN', '08:00:00', '09:00x16:00', '08_16'),
('CLI', 'PEN', '13:30:00', '14:30x21:30', '08_16'),
('CLI', 'PEN', '21:30:00', '22:30x05:30', '16_24'),
-- NEU Yard slots
('CLI', 'NEU', '05:30:00', '06:30x13:30', '00_08'),
('CLI', 'NEU', '08:15:00', '09:15x16:15', '08_16'),
('CLI', 'NEU', '13:30:00', '14:30x21:30', '08_16'),
('CLI', 'NEU', '21:30:00', '22:30x05:30', '16_24'),
-- PNVL Yard slots
('CLI', 'PNVL', '05:30:00', '06:30x13:30', '00_08'),
('CLI', 'PNVL', '08:30:00', '09:30x16:30', '08_16'),
('CLI', 'PNVL', '14:00:00', '15:00x22:00', '08_16'),
('CLI', 'PNVL', '22:00:00', '23:00x06:00', '16_24');

-- ============================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================
-- SELECT 'div_daily_slate' AS tbl, COUNT(*) AS cnt FROM div_daily_slate
-- UNION ALL SELECT 'div_detail_book_log', COUNT(*) FROM div_detail_book_log
-- UNION ALL SELECT 'div_tw_detail', COUNT(*) FROM div_tw_detail
-- UNION ALL SELECT 'div_tw_slots', COUNT(*) FROM div_tw_slots
-- UNION ALL SELECT 'div_tw_yards', COUNT(*) FROM div_tw_yards
-- UNION ALL SELECT 'div_staff_fatigue_tracker', COUNT(*) FROM div_staff_fatigue_tracker
-- UNION ALL SELECT 'div_office_slot_template', COUNT(*) FROM div_office_slot_template;

SELECT 'Migration complete. Tables and procedures created.' AS status;
