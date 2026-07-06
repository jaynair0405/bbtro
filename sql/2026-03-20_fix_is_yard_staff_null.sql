-- Fix: Allow NULL for is_yard_staff column
-- Issue: CSMT-SUB users couldn't add Motorman (designation_id=8) because
--        is_yard_staff was being sent as NULL but column had NOT NULL constraint
-- The is_yard_staff flag only applies to CSMT-ML staff, so NULL is correct for other offices

ALTER TABLE div_staff_master
  MODIFY COLUMN is_yard_staff TINYINT(1) NULL DEFAULT NULL
  COMMENT '1=yard staff, 0=mainline, NULL=not applicable (non-CSMT-ML)';
