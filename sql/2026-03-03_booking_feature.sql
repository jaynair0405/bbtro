-- ============================================================
-- Booking Feature Schema Updates
-- Adds BOOKED/SAFE status and booking-related columns
-- Central Railway Mumbai Division - Digital Slate
-- Created: 2026-03-03
-- ============================================================

-- ------------------------------------------------------------
-- 1. Update status enum to include BOOKED and SAFE
-- Run these first - they modify existing columns
-- ------------------------------------------------------------
ALTER TABLE div_daily_slate
MODIFY COLUMN lp_status ENUM('AVAILABLE', 'FORECAST', 'SIGNED_ON', 'ONLINE', 'BOOKED', 'SAFE') DEFAULT 'AVAILABLE';

ALTER TABLE div_daily_slate
MODIFY COLUMN alp_status ENUM('AVAILABLE', 'FORECAST', 'SIGNED_ON', 'ONLINE', 'BOOKED', 'SAFE') DEFAULT 'AVAILABLE';

-- ------------------------------------------------------------
-- 2. Add booking-related columns
-- Run each separately - if column exists, skip that line
-- ------------------------------------------------------------
ALTER TABLE div_daily_slate ADD COLUMN is_pilot BOOLEAN DEFAULT FALSE COMMENT 'True if booked as pilot';
ALTER TABLE div_daily_slate ADD COLUMN booking_remarks TEXT COMMENT 'Optional remarks for the booking';
ALTER TABLE div_daily_slate ADD COLUMN booked_at TIMESTAMP NULL COMMENT 'When booking was given';
ALTER TABLE div_daily_slate ADD COLUMN booked_by VARCHAR(50) COMMENT 'User who gave the booking';

-- ------------------------------------------------------------
-- 3. SAFE sign-off tracking
-- ------------------------------------------------------------
ALTER TABLE div_daily_slate ADD COLUMN lp_safe_sign_off_time TIME NULL COMMENT 'Sign-off time when marked SAFE';
ALTER TABLE div_daily_slate ADD COLUMN alp_safe_sign_off_time TIME NULL COMMENT 'Sign-off time when marked SAFE';

-- ------------------------------------------------------------
-- 4. ALP source tracking (for out-of-slate / other depot)
-- ------------------------------------------------------------
ALTER TABLE div_daily_slate ADD COLUMN alp_source ENUM('SLATE', 'OUT_OF_SLATE', 'OTHER_DEPOT') DEFAULT 'SLATE' COMMENT 'Where ALP came from';
ALTER TABLE div_daily_slate ADD COLUMN alp_source_name VARCHAR(100) NULL COMMENT 'Manual name entry for OTHER_DEPOT ALP';
ALTER TABLE div_daily_slate ADD COLUMN alp_source_depot VARCHAR(50) NULL COMMENT 'Depot name if OTHER_DEPOT';

-- ------------------------------------------------------------
-- 5. Extra ALP columns (for operational double ALP requirement)
-- ------------------------------------------------------------
ALTER TABLE div_daily_slate ADD COLUMN extra_alp_hrms_id VARCHAR(20) NULL COMMENT 'HRMS ID for extra ALP if needed';
ALTER TABLE div_daily_slate ADD COLUMN extra_alp_source ENUM('SLATE', 'OUT_OF_SLATE', 'OTHER_DEPOT') DEFAULT NULL COMMENT 'Where extra ALP came from';
ALTER TABLE div_daily_slate ADD COLUMN extra_alp_source_name VARCHAR(100) NULL COMMENT 'Manual name entry for extra ALP';
ALTER TABLE div_daily_slate ADD COLUMN extra_alp_source_depot VARCHAR(50) NULL COMMENT 'Depot name if extra ALP from other depot';
ALTER TABLE div_daily_slate ADD COLUMN extra_alp_original_slot_id INT NULL COMMENT 'Original slot ID if extra ALP from slate';

-- ------------------------------------------------------------
-- 6. Verification
-- ------------------------------------------------------------
-- DESCRIBE div_daily_slate;
