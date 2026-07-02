-- Check current slate data
SELECT id, slot_date, slot_time, train_no, lp_hrms_id, lp_status, alp_status,
       TIMESTAMPDIFF(HOUR, CONCAT(slot_date, ' ', slot_time), NOW()) AS duty_hours
FROM div_daily_slate
WHERE lp_hrms_id IS NOT NULL
ORDER BY slot_date, slot_time;
