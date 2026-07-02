-- Late Arrival Tracking Columns
-- Add to div_daily_slate table
-- Note: lp_signed_on_at and alp_signed_on_at already exist for actual sign-on time
-- Run: mysql -u jay -p bbtro < sql/2026-03-02_late_arrival_columns.sql

-- LP late tracking (sign-on time already exists as lp_signed_on_at)
ALTER TABLE div_daily_slate
ADD COLUMN lp_late_reason VARCHAR(100) DEFAULT NULL COMMENT 'Reason for late arrival',
ADD COLUMN lp_detention ENUM('YES', 'NO') DEFAULT NULL COMMENT 'Train detained due to late arrival?',
ADD COLUMN lp_detention_remark VARCHAR(200) DEFAULT NULL COMMENT 'Detention details (e.g., JNPT-TKD late by 20 min)';

-- ALP late tracking (sign-on time already exists as alp_signed_on_at)
ALTER TABLE div_daily_slate
ADD COLUMN alp_late_reason VARCHAR(100) DEFAULT NULL COMMENT 'Reason for late arrival',
ADD COLUMN alp_detention ENUM('YES', 'NO') DEFAULT NULL COMMENT 'Train detained due to late arrival?',
ADD COLUMN alp_detention_remark VARCHAR(200) DEFAULT NULL COMMENT 'Detention details';

SELECT 'Late arrival columns added successfully' AS status;
