-- ============================================================
-- Digital Slate & Detail Book Schema
-- Multi-Office Support: PNVL-ML, KYN-ML
-- Central Railway Mumbai Division
-- Created: 2026-02-24
-- ============================================================

-- ------------------------------------------------------------
-- 1. DETAIL BOOK LOG (Historical Arrivals)
-- Records every sign-off processed by Jr. CC
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_detail_book_log (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Office identification
    office_code VARCHAR(15) NOT NULL COMMENT 'Lobby code: PNVL-ML, KYN-ML, etc.',

    -- Shared incoming info (applies to both LP & ALP by default)
    incoming_detail VARCHAR(50) COMMENT 'Train number or pilot info (e.g., 12101, By 11001, By Sumo)',
    loco_no VARCHAR(20) COMMENT 'Locomotive number (NULL if pilot)',
    sign_on_time DATETIME NOT NULL COMMENT 'When staff started duty (from slate)',
    sign_off_time DATETIME NOT NULL COMMENT 'When staff finished duty',
    is_pilot BOOLEAN DEFAULT FALSE COMMENT 'True if came as pilot/spare (not working)',

    -- LP info
    lp_hrms_id VARCHAR(10) NOT NULL COMMENT 'FK to div_staff_master.hrms_id',
    lp_rest_type ENUM('NORMAL', 'PR', '1_DAY_LEAVE', 'MULTI_DAY_LEAVE') NOT NULL DEFAULT 'NORMAL',
    lp_next_slot_date DATE COMMENT 'Calculated next available date',
    lp_next_slot_time TIME COMMENT 'Calculated next available time',
    lp_actual_rest_hours DECIMAL(4,1) COMMENT 'Actual rest hours after collision avoidance',

    -- ALP info (nullable for single-man duties)
    alp_hrms_id VARCHAR(10) COMMENT 'FK to div_staff_master.hrms_id',
    alp_rest_type ENUM('NORMAL', 'PR', '1_DAY_LEAVE', 'MULTI_DAY_LEAVE') DEFAULT 'NORMAL',
    alp_next_slot_date DATE COMMENT 'Calculated next available date',
    alp_next_slot_time TIME COMMENT 'Calculated next available time',
    alp_actual_rest_hours DECIMAL(4,1) COMMENT 'Actual rest hours after collision avoidance',

    -- ALP override fields (NULL = same as LP)
    alp_incoming_detail VARCHAR(50) DEFAULT NULL COMMENT 'Override: ALP different incoming detail',
    alp_sign_off_time DATETIME DEFAULT NULL COMMENT 'Override: ALP different sign-off time',
    alp_is_pilot BOOLEAN DEFAULT NULL COMMENT 'Override: ALP different pilot flag (NULL = same as LP)',

    -- Metadata
    processed_by VARCHAR(50) COMMENT 'Jr. CC user who processed this entry',
    shift_date DATE NOT NULL COMMENT 'The shift date when this was processed',
    shift_code ENUM('00_08', '08_16', '16_24') NOT NULL COMMENT 'Which shift processed this',
    remarks TEXT COMMENT 'Any additional notes',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_office_date (office_code, shift_date),
    INDEX idx_sign_off_date (sign_off_time),
    INDEX idx_lp_hrms (lp_hrms_id),
    INDEX idx_alp_hrms (alp_hrms_id),
    INDEX idx_is_pilot (office_code, is_pilot),

    -- Foreign keys
    CONSTRAINT fk_detail_lp FOREIGN KEY (lp_hrms_id) REFERENCES div_staff_master(hrms_id),
    CONSTRAINT fk_detail_alp FOREIGN KEY (alp_hrms_id) REFERENCES div_staff_master(hrms_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Detail Book: Historical record of all arrivals/sign-offs';


-- ------------------------------------------------------------
-- 2. DAILY SLATE (Live Slot Assignments)
-- The board showing who is available at which slot
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_daily_slate (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Office identification
    office_code VARCHAR(15) NOT NULL COMMENT 'Lobby code: PNVL-ML, KYN-ML, etc.',

    -- Slot identification
    slot_date DATE NOT NULL COMMENT 'The date of this slot',
    slot_time TIME NOT NULL COMMENT 'The time of this slot (00:00, 00:15, etc.)',
    shift_code ENUM('00_08', '08_16', '16_24') NOT NULL COMMENT 'Which shift this slot belongs to',
    is_adhoc BOOLEAN DEFAULT FALSE COMMENT 'True if this is an ad-hoc inserted slot',

    -- LP assignment
    lp_hrms_id VARCHAR(10) COMMENT 'FK to div_staff_master.hrms_id',
    lp_status ENUM('AVAILABLE', 'FORECAST', 'SIGNED_ON', 'ONLINE') DEFAULT 'AVAILABLE',
    lp_exception ENUM('AUC', 'NF') DEFAULT NULL COMMENT 'AUC=Advised Unable to Come, NF=Not Found',
    lp_detail_book_id INT COMMENT 'FK to div_detail_book_log.id that created this slot',

    -- ALP assignment
    alp_hrms_id VARCHAR(10) COMMENT 'FK to div_staff_master.hrms_id',
    alp_status ENUM('AVAILABLE', 'FORECAST', 'SIGNED_ON', 'ONLINE') DEFAULT 'AVAILABLE',
    alp_exception ENUM('AUC', 'NF') DEFAULT NULL,
    alp_detail_book_id INT COMMENT 'FK to div_detail_book_log.id that created this slot',
    alp_cross_slot_time TIME COMMENT 'Original slot time if ALP pulled from different slot',

    -- Train assignment (filled by Supervisor)
    train_no VARCHAR(20) COMMENT 'Assigned train number',
    loco_no VARCHAR(20) COMMENT 'Assigned locomotive number',

    -- Timestamps for tracking
    train_assigned_at TIMESTAMP NULL COMMENT 'When train was assigned',
    lp_signed_on_at TIMESTAMP NULL COMMENT 'When LP signed on',
    alp_signed_on_at TIMESTAMP NULL COMMENT 'When ALP signed on',
    departed_at TIMESTAMP NULL COMMENT 'When train departed (status -> ONLINE)',

    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(50) COMMENT 'User who last modified this slot',

    -- Indexes
    INDEX idx_office_date (office_code, slot_date),
    INDEX idx_office_datetime (office_code, slot_date, slot_time),
    INDEX idx_lp_hrms (lp_hrms_id),
    INDEX idx_alp_hrms (alp_hrms_id),
    INDEX idx_lp_status (office_code, slot_date, lp_status),
    INDEX idx_alp_status (office_code, slot_date, alp_status),
    INDEX idx_shift (office_code, slot_date, shift_code),

    -- Unique constraint: one slot per office+date+time (unless ad-hoc)
    UNIQUE KEY uk_office_slot (office_code, slot_date, slot_time, is_adhoc),

    -- Foreign keys
    CONSTRAINT fk_slate_lp FOREIGN KEY (lp_hrms_id) REFERENCES div_staff_master(hrms_id),
    CONSTRAINT fk_slate_alp FOREIGN KEY (alp_hrms_id) REFERENCES div_staff_master(hrms_id),
    CONSTRAINT fk_slate_lp_detail FOREIGN KEY (lp_detail_book_id) REFERENCES div_detail_book_log(id),
    CONSTRAINT fk_slate_alp_detail FOREIGN KEY (alp_detail_book_id) REFERENCES div_detail_book_log(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Daily Slate: Live slot assignments for lobby display';


-- ------------------------------------------------------------
-- 3. OFFICE SLOT TEMPLATE
-- Predefined slot times per office (editable via admin UI)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_office_slot_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    office_code VARCHAR(15) NOT NULL COMMENT 'Lobby code: PNVL-ML, KYN-ML, etc.',
    shift_code ENUM('00_08', '08_16', '16_24') NOT NULL COMMENT 'Which shift this slot belongs to',
    slot_time TIME NOT NULL COMMENT 'The slot time (e.g., 08:00, 08:30)',
    slot_order SMALLINT DEFAULT 0 COMMENT 'Display order within shift',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Can disable without deleting',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_office_slot (office_code, slot_time),
    INDEX idx_office_shift (office_code, shift_code, slot_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Slot templates per office - editable via admin UI';


-- ------------------------------------------------------------
-- 4. STAFF FATIGUE TRACKER
-- Separate table for night streak tracking (only for relevant offices)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_staff_fatigue_tracker (
    hrms_id VARCHAR(10) PRIMARY KEY COMMENT 'FK to div_staff_master.hrms_id',
    office_code VARCHAR(15) NOT NULL COMMENT 'PNVL-ML, KYN-ML, etc.',
    current_night_streak TINYINT DEFAULT 0 COMMENT 'Consecutive night duties (00:00-05:00 overlap)',
    last_night_duty_date DATE COMMENT 'Date of last night duty',
    total_night_duties INT DEFAULT 0 COMMENT 'Total night duties (for reporting)',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_office (office_code),
    INDEX idx_streak (current_night_streak DESC),

    CONSTRAINT fk_fatigue_staff FOREIGN KEY (hrms_id) REFERENCES div_staff_master(hrms_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Fatigue tracking for PNVL-ML, KYN-ML staff only';


-- ------------------------------------------------------------
-- 5. STORED PROCEDURE: Populate slot template with fixed intervals
-- Quick setup for offices with regular intervals
-- Usage: CALL sp_populate_slot_template('PNVL-ML', 15);  -- 15-min intervals
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_populate_slot_template;

DELIMITER //

CREATE PROCEDURE sp_populate_slot_template(
    IN p_office_code VARCHAR(15),
    IN p_interval_minutes INT
)
BEGIN
    DECLARE v_total_minutes INT DEFAULT 0;
    DECLARE v_hour INT;
    DECLARE v_minute INT;
    DECLARE v_time TIME;
    DECLARE v_shift_code VARCHAR(5);
    DECLARE v_slot_order INT DEFAULT 0;
    DECLARE v_slots_created INT DEFAULT 0;

    -- Clear existing template for this office
    DELETE FROM div_office_slot_template WHERE office_code = p_office_code;

    -- Generate slots for 24 hours
    WHILE v_total_minutes < 1440 DO
        SET v_hour = FLOOR(v_total_minutes / 60);
        SET v_minute = v_total_minutes MOD 60;
        SET v_time = MAKETIME(v_hour, v_minute, 0);

        -- Determine shift code
        SET v_shift_code = CASE
            WHEN v_hour < 8 THEN '00_08'
            WHEN v_hour < 16 THEN '08_16'
            ELSE '16_24'
        END;

        -- Reset order for each shift
        IF v_minute = 0 AND (v_hour = 0 OR v_hour = 8 OR v_hour = 16) THEN
            SET v_slot_order = 0;
        END IF;

        INSERT INTO div_office_slot_template (office_code, shift_code, slot_time, slot_order)
        VALUES (p_office_code, v_shift_code, v_time, v_slot_order);

        SET v_slot_order = v_slot_order + 1;
        SET v_slots_created = v_slots_created + 1;
        SET v_total_minutes = v_total_minutes + p_interval_minutes;
    END WHILE;

    SELECT CONCAT('Created template for ', p_office_code, ' with ', v_slots_created, ' slots (', p_interval_minutes, '-min intervals)') AS result;
END //

DELIMITER ;


-- ------------------------------------------------------------
-- 6. STORED PROCEDURE: Add single slot to template
-- For admin UI - add custom slot time
-- Usage: CALL sp_add_template_slot('KYN-ML', '09:20');
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_add_template_slot;

DELIMITER //

CREATE PROCEDURE sp_add_template_slot(
    IN p_office_code VARCHAR(15),
    IN p_slot_time TIME
)
BEGIN
    DECLARE v_shift_code VARCHAR(5);
    DECLARE v_hour INT;
    DECLARE v_max_order INT;

    SET v_hour = HOUR(p_slot_time);

    -- Determine shift code
    SET v_shift_code = CASE
        WHEN v_hour < 8 THEN '00_08'
        WHEN v_hour < 16 THEN '08_16'
        ELSE '16_24'
    END;

    -- Get max order for this shift
    SELECT COALESCE(MAX(slot_order), 0) + 1 INTO v_max_order
    FROM div_office_slot_template
    WHERE office_code = p_office_code AND shift_code = v_shift_code;

    -- Insert slot
    INSERT INTO div_office_slot_template (office_code, shift_code, slot_time, slot_order)
    VALUES (p_office_code, v_shift_code, p_slot_time, v_max_order)
    ON DUPLICATE KEY UPDATE is_active = TRUE, slot_order = v_max_order;

    SELECT CONCAT('Added slot ', p_slot_time, ' to ', p_office_code, ' (', v_shift_code, ')') AS result;
END //

DELIMITER ;


-- ------------------------------------------------------------
-- 7. STORED PROCEDURE: Generate daily slots from template
-- Reads from div_office_slot_template and creates slots for a date
-- Usage: CALL sp_generate_daily_slots('PNVL-ML', '2026-02-25');
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_generate_daily_slots;

DELIMITER //

CREATE PROCEDURE sp_generate_daily_slots(IN p_office_code VARCHAR(15), IN p_date DATE)
BEGIN
    DECLARE v_count INT DEFAULT 0;

    -- Check if template exists
    SELECT COUNT(*) INTO v_count FROM div_office_slot_template
    WHERE office_code = p_office_code AND is_active = TRUE;

    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No slot template found for this office. Run sp_populate_slot_template first.';
    END IF;

    -- Generate slots from template
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

DELIMITER ;


-- ------------------------------------------------------------
-- 8. STORED PROCEDURE: Update night streak after sign-off
-- Called when processing arrival in detail book
-- Usage: CALL sp_update_night_streak('PNVL-ML', 'AAEXOX', '2026-02-24 22:00:00', '2026-02-25 06:00:00');
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_night_streak;

DELIMITER //

CREATE PROCEDURE sp_update_night_streak(
    IN p_office_code VARCHAR(15),
    IN p_hrms_id VARCHAR(10),
    IN p_sign_on_time DATETIME,
    IN p_sign_off_time DATETIME
)
BEGIN
    DECLARE v_overlaps_night BOOLEAN DEFAULT FALSE;
    DECLARE v_current_streak INT DEFAULT 0;

    -- Check if duty overlaps 00:00-05:00 window
    SET v_overlaps_night = (
        (TIME(p_sign_on_time) >= '00:00:00' AND TIME(p_sign_on_time) < '05:00:00')
        OR (TIME(p_sign_off_time) >= '00:00:00' AND TIME(p_sign_off_time) < '05:00:00')
        OR (TIME(p_sign_on_time) > '20:00:00' AND TIME(p_sign_off_time) < '08:00:00')
    );

    -- Insert or update fatigue tracker
    INSERT INTO div_staff_fatigue_tracker (hrms_id, office_code, current_night_streak, last_night_duty_date, total_night_duties)
    VALUES (
        p_hrms_id,
        p_office_code,
        IF(v_overlaps_night, 1, 0),
        IF(v_overlaps_night, DATE(p_sign_off_time), NULL),
        IF(v_overlaps_night, 1, 0)
    )
    ON DUPLICATE KEY UPDATE
        current_night_streak = IF(v_overlaps_night, current_night_streak + 1, 0),
        last_night_duty_date = IF(v_overlaps_night, DATE(p_sign_off_time), last_night_duty_date),
        total_night_duties = IF(v_overlaps_night, total_night_duties + 1, total_night_duties),
        updated_at = CURRENT_TIMESTAMP;

    -- Return current streak
    SELECT current_night_streak INTO v_current_streak
    FROM div_staff_fatigue_tracker WHERE hrms_id = p_hrms_id;

    SELECT v_current_streak AS current_night_streak;
END //

DELIMITER ;


-- ------------------------------------------------------------
-- 9. STORED PROCEDURE: Find next available slot
-- Returns the first available slot after minimum rest
-- Usage: CALL sp_find_available_slot('PNVL-ML', '2026-02-25', '06:00:00', 'LP', @out_date, @out_time);
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_find_available_slot;

DELIMITER //

CREATE PROCEDURE sp_find_available_slot(
    IN p_office_code VARCHAR(15),
    IN p_start_date DATE,
    IN p_start_time TIME,
    IN p_staff_type VARCHAR(3),  -- 'LP' or 'ALP'
    OUT p_slot_date DATE,
    OUT p_slot_time TIME
)
BEGIN
    DECLARE v_found BOOLEAN DEFAULT FALSE;
    DECLARE v_check_date DATE;
    DECLARE v_check_time TIME;
    DECLARE v_max_days INT DEFAULT 7;  -- Don't search more than 7 days ahead
    DECLARE v_day_counter INT DEFAULT 0;

    SET v_check_date = p_start_date;
    SET v_check_time = p_start_time;

    -- Round to nearest 15-minute slot
    SET v_check_time = MAKETIME(
        HOUR(v_check_time),
        FLOOR(MINUTE(v_check_time) / 15) * 15,
        0
    );

    -- Search for available slot
    WHILE NOT v_found AND v_day_counter < v_max_days DO
        IF p_staff_type = 'LP' THEN
            SELECT slot_date, slot_time INTO p_slot_date, p_slot_time
            FROM div_daily_slate
            WHERE office_code = p_office_code
              AND slot_date = v_check_date
              AND slot_time >= v_check_time
              AND lp_hrms_id IS NULL
              AND is_adhoc = FALSE
            ORDER BY slot_time
            LIMIT 1;
        ELSE
            SELECT slot_date, slot_time INTO p_slot_date, p_slot_time
            FROM div_daily_slate
            WHERE office_code = p_office_code
              AND slot_date = v_check_date
              AND slot_time >= v_check_time
              AND alp_hrms_id IS NULL
              AND is_adhoc = FALSE
            ORDER BY slot_time
            LIMIT 1;
        END IF;

        IF p_slot_date IS NOT NULL THEN
            SET v_found = TRUE;
        ELSE
            -- Move to next day, start from 00:00
            SET v_check_date = DATE_ADD(v_check_date, INTERVAL 1 DAY);
            SET v_check_time = '00:00:00';
            SET v_day_counter = v_day_counter + 1;
        END IF;
    END WHILE;
END //

DELIMITER ;


-- ------------------------------------------------------------
-- 10. VIEW: Active crews (for Click-to-Arrive cards)
-- Shows crews currently ONLINE with duty > 8 hours
-- Usage: SELECT * FROM v_active_crews WHERE office_code = 'PNVL-ML';
-- ------------------------------------------------------------
DROP VIEW IF EXISTS v_active_crews;

CREATE VIEW v_active_crews AS
SELECT
    ds.office_code,
    ds.id AS slate_id,
    ds.slot_date,
    ds.slot_time,
    ds.train_no,
    ds.loco_no,
    ds.lp_hrms_id,
    lp.name AS lp_name,
    lp.current_cms_id AS lp_cms_id,
    COALESCE(lp_fatigue.current_night_streak, 0) AS lp_night_streak,
    ds.alp_hrms_id,
    alp.name AS alp_name,
    alp.current_cms_id AS alp_cms_id,
    COALESCE(alp_fatigue.current_night_streak, 0) AS alp_night_streak,
    ds.departed_at,
    TIMESTAMPDIFF(HOUR, ds.departed_at, NOW()) AS duty_hours
FROM div_daily_slate ds
LEFT JOIN div_staff_master lp ON ds.lp_hrms_id = lp.hrms_id
LEFT JOIN div_staff_fatigue_tracker lp_fatigue ON ds.lp_hrms_id = lp_fatigue.hrms_id
LEFT JOIN div_staff_master alp ON ds.alp_hrms_id = alp.hrms_id
LEFT JOIN div_staff_fatigue_tracker alp_fatigue ON ds.alp_hrms_id = alp_fatigue.hrms_id
WHERE ds.lp_status = 'ONLINE'
  AND ds.departed_at IS NOT NULL
ORDER BY ds.office_code, ds.departed_at ASC;


-- ------------------------------------------------------------
-- 11. VIEW: Slot vacancy count by office, date, and shift
-- Usage: SELECT * FROM v_slot_vacancy WHERE office_code = 'PNVL-ML';
-- ------------------------------------------------------------
DROP VIEW IF EXISTS v_slot_vacancy;

CREATE VIEW v_slot_vacancy AS
SELECT
    office_code,
    slot_date,
    shift_code,
    COUNT(*) AS total_slots,
    SUM(CASE WHEN lp_hrms_id IS NULL THEN 1 ELSE 0 END) AS lp_vacant,
    SUM(CASE WHEN alp_hrms_id IS NULL THEN 1 ELSE 0 END) AS alp_vacant,
    SUM(CASE WHEN lp_hrms_id IS NOT NULL THEN 1 ELSE 0 END) AS lp_filled,
    SUM(CASE WHEN alp_hrms_id IS NOT NULL THEN 1 ELSE 0 END) AS alp_filled
FROM div_daily_slate
WHERE is_adhoc = FALSE
GROUP BY office_code, slot_date, shift_code
ORDER BY office_code, slot_date, shift_code;


-- ------------------------------------------------------------
-- 12. VIEW: Pilot arrivals report
-- Usage: SELECT * FROM v_pilot_report WHERE office_code = 'PNVL-ML';
-- ------------------------------------------------------------
DROP VIEW IF EXISTS v_pilot_report;

CREATE VIEW v_pilot_report AS
SELECT
    d.office_code,
    d.id,
    d.shift_date,
    d.incoming_detail,
    d.sign_off_time,
    d.is_pilot AS lp_is_pilot,
    COALESCE(d.alp_is_pilot, d.is_pilot) AS alp_is_pilot,
    d.lp_hrms_id,
    lp.name AS lp_name,
    lp.current_cms_id AS lp_cms_id,
    d.alp_hrms_id,
    alp.name AS alp_name,
    alp.current_cms_id AS alp_cms_id,
    d.alp_incoming_detail
FROM div_detail_book_log d
LEFT JOIN div_staff_master lp ON d.lp_hrms_id = lp.hrms_id
LEFT JOIN div_staff_master alp ON d.alp_hrms_id = alp.hrms_id
WHERE d.is_pilot = TRUE OR d.alp_is_pilot = TRUE
ORDER BY d.office_code, d.shift_date DESC, d.sign_off_time DESC;


-- ------------------------------------------------------------
-- 13. VIEW: Fatigue warnings (staff with high night streaks)
-- Usage: SELECT * FROM v_fatigue_warnings WHERE office_code = 'PNVL-ML';
-- ------------------------------------------------------------
DROP VIEW IF EXISTS v_fatigue_warnings;

CREATE VIEW v_fatigue_warnings AS
SELECT
    ft.office_code,
    ft.hrms_id,
    s.name,
    s.current_cms_id,
    ft.current_night_streak,
    ft.last_night_duty_date,
    ft.total_night_duties,
    CASE
        WHEN ft.current_night_streak >= 4 THEN 'CRITICAL'
        WHEN ft.current_night_streak = 3 THEN 'WARNING'
        ELSE 'OK'
    END AS fatigue_status
FROM div_staff_fatigue_tracker ft
JOIN div_staff_master s ON ft.hrms_id = s.hrms_id
WHERE ft.current_night_streak >= 3
ORDER BY ft.current_night_streak DESC, ft.office_code;


-- ============================================================
-- INITIAL DATA: Create slot templates and generate slots
-- ============================================================

-- Step 1: Create slot templates
-- PNVL-ML: 15-minute intervals (96 slots/day)
CALL sp_populate_slot_template('PNVL-ML', 15);

-- KYN-ML: 20-minute intervals (72 slots/day) - can be customized later via admin UI
CALL sp_populate_slot_template('KYN-ML', 20);

-- Step 2: Generate slots for today, tomorrow, day after
-- PNVL-ML
CALL sp_generate_daily_slots('PNVL-ML', CURDATE());
CALL sp_generate_daily_slots('PNVL-ML', DATE_ADD(CURDATE(), INTERVAL 1 DAY));
CALL sp_generate_daily_slots('PNVL-ML', DATE_ADD(CURDATE(), INTERVAL 2 DAY));

-- KYN-ML
CALL sp_generate_daily_slots('KYN-ML', CURDATE());
CALL sp_generate_daily_slots('KYN-ML', DATE_ADD(CURDATE(), INTERVAL 1 DAY));
CALL sp_generate_daily_slots('KYN-ML', DATE_ADD(CURDATE(), INTERVAL 2 DAY));


-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'Schema created successfully!' AS status;

SELECT 'Slot Templates:' AS info;
SELECT office_code, COUNT(*) AS slots_per_day
FROM div_office_slot_template
WHERE is_active = TRUE
GROUP BY office_code;

SELECT 'Daily Slots Generated:' AS info;
SELECT
    office_code,
    COUNT(*) AS total_slots,
    COUNT(DISTINCT slot_date) AS days_generated
FROM div_daily_slate
GROUP BY office_code;
