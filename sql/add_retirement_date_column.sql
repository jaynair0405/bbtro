-- ============================================
-- Add retirement columns to div_staff_master
-- For tracking retirement date and type
-- Created: 2026-01-08
-- ============================================

ALTER TABLE `div_staff_master`
ADD COLUMN `retirement_date` date DEFAULT NULL COMMENT 'Actual retirement date' AFTER `status`,
ADD COLUMN `retirement_type` ENUM('Superannuation', 'VRS', 'CRS', 'Removal from Service', 'Dismissal') DEFAULT NULL COMMENT 'Type of retirement/separation' AFTER `retirement_date`;

-- Create index for efficient queries
CREATE INDEX `idx_retirement_date` ON `div_staff_master` (`retirement_date`);

-- ============================================
-- Usage:
-- For VRS:
--   UPDATE div_staff_master
--   SET status='Retired', retirement_date='2025-06-30', retirement_type='VRS'
--   WHERE hrms_id='ABC123';
--
-- For Superannuation:
--   UPDATE div_staff_master
--   SET status='Retired', retirement_date='2025-12-31', retirement_type='Superannuation'
--   WHERE hrms_id='XYZ789';
-- ============================================
