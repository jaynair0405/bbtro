-- Fix night streak calculation
-- Night window: 00:00-06:00
-- Run: mysql -u root -p bbtro < sql/2026-03-02_night_streak_fix.sql

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

    -- Check if duty overlaps 00:00-06:00 night window
    SET v_overlaps_night = (
        (TIME(p_sign_on_time) >= '00:00:00' AND TIME(p_sign_on_time) < '06:00:00')
        OR (TIME(p_sign_off_time) >= '00:00:00' AND TIME(p_sign_off_time) < '06:00:00')
        OR (TIME(p_sign_on_time) >= '06:00:00' AND TIME(p_sign_off_time) >= '06:00:00' AND TIME(p_sign_on_time) > TIME(p_sign_off_time))
    );

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

    SELECT current_night_streak INTO v_current_streak
    FROM div_staff_fatigue_tracker WHERE hrms_id = p_hrms_id;

    SELECT v_current_streak AS current_night_streak;
END //

DELIMITER ;

SELECT 'sp_update_night_streak updated successfully' AS status;
