-- ============================================================================
-- TEST DATA: Populate Slate for Testing
-- ============================================================================
-- Purpose: Fills a day's slate with LP+ALP crews, all marked ONLINE
-- Usage: Run this script to create test data for Detail Book / Slate testing
--
-- Variables to set:
--   @test_date  - The date to populate (e.g., '2026-03-03')
--   @office     - Office code (e.g., 'PNVL-ML')
--   @num_slots  - Number of slots to create (max 96 for 15-min intervals)
-- ============================================================================

-- Step 1: Set variables
SET @test_date = '2026-03-03';
SET @office = 'PNVL-ML';
SET @num_slots = 96;

-- Step 2: Clear existing data for that date (OPTIONAL - uncomment if needed)
-- DELETE FROM div_daily_slate WHERE office_code = @office AND slot_date = @test_date;

-- Step 3: Create temporary tables for LP staff
DROP TEMPORARY TABLE IF EXISTS temp_lp;
CREATE TEMPORARY TABLE temp_lp AS
SELECT s.hrms_id
FROM div_staff_master s
JOIN designations d ON s.designation_id = d.id
WHERE s.current_office_code = @office
  AND d.designation_name IN ('Loco Pilot Goods', 'Loco Pilot Shunter', 'Loco Pilot Mail')
  AND s.status = 'Active'
ORDER BY RAND()
LIMIT 96;

-- Step 4: Create temporary tables for ALP staff
DROP TEMPORARY TABLE IF EXISTS temp_alp;
CREATE TEMPORARY TABLE temp_alp AS
SELECT s.hrms_id
FROM div_staff_master s
JOIN designations d ON s.designation_id = d.id
WHERE s.current_office_code = @office
  AND d.designation_name IN ('Assistant Loco Pilot', 'Senior Assistant Loco Pilot')
  AND s.status = 'Active'
ORDER BY RAND()
LIMIT 96;

-- Step 5: Add row numbers using variables
SET @lp_rn = 0;
SET @alp_rn = 0;

DROP TEMPORARY TABLE IF EXISTS lp_numbered;
CREATE TEMPORARY TABLE lp_numbered AS
SELECT @lp_rn := @lp_rn + 1 as rn, hrms_id FROM temp_lp;

DROP TEMPORARY TABLE IF EXISTS alp_numbered;
CREATE TEMPORARY TABLE alp_numbered AS
SELECT @alp_rn := @alp_rn + 1 as rn, hrms_id FROM temp_alp;

-- Step 6: Generate slot numbers (1-96 for full day)
DROP TEMPORARY TABLE IF EXISTS slot_numbers;
CREATE TEMPORARY TABLE slot_numbers (slot_num INT);
INSERT INTO slot_numbers VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),
(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),(31),(32),
(33),(34),(35),(36),(37),(38),(39),(40),(41),(42),(43),(44),(45),(46),(47),(48),
(49),(50),(51),(52),(53),(54),(55),(56),(57),(58),(59),(60),(61),(62),(63),(64),
(65),(66),(67),(68),(69),(70),(71),(72),(73),(74),(75),(76),(77),(78),(79),(80),
(81),(82),(83),(84),(85),(86),(87),(88),(89),(90),(91),(92),(93),(94),(95),(96);

-- Step 7: Insert the slots
INSERT INTO div_daily_slate (
    office_code,
    slot_date,
    slot_time,
    lp_hrms_id,
    lp_status,
    alp_hrms_id,
    alp_status,
    train_no,
    loco_no
)
SELECT
    @office,
    @test_date,
    SEC_TO_TIME((sn.slot_num - 1) * 900),  -- 900 seconds = 15 minutes
    lp.hrms_id,
    'ONLINE',
    alp.hrms_id,
    'ONLINE',
    CONCAT(10000 + FLOOR(RAND() * 90000)),  -- Random 5-digit train no
    CONCAT('WAP', FLOOR(RAND() * 9), '-', 30000 + FLOOR(RAND() * 10000))  -- Random loco
FROM slot_numbers sn
JOIN lp_numbered lp ON lp.rn = sn.slot_num
JOIN alp_numbered alp ON alp.rn = sn.slot_num
WHERE sn.slot_num <= @num_slots;

-- Step 8: Verify the results
SELECT
    'Summary' as info,
    COUNT(*) as total_slots,
    SUM(CASE WHEN lp_status = 'ONLINE' THEN 1 ELSE 0 END) as lp_online,
    SUM(CASE WHEN alp_hrms_id IS NOT NULL THEN 1 ELSE 0 END) as with_alp
FROM div_daily_slate
WHERE office_code = @office AND slot_date = @test_date;

-- Show sample data
SELECT
    ds.slot_time,
    s1.name as lp_name,
    s2.name as alp_name,
    ds.train_no,
    ds.lp_status,
    ds.alp_status
FROM div_daily_slate ds
JOIN div_staff_master s1 ON ds.lp_hrms_id = s1.hrms_id
JOIN div_staff_master s2 ON ds.alp_hrms_id = s2.hrms_id
WHERE ds.office_code = @office AND ds.slot_date = @test_date
ORDER BY ds.slot_time
LIMIT 5;


-- ============================================================================
-- QUICK REFERENCE: Table Structures
-- ============================================================================
--
-- div_daily_slate columns:
--   id, office_code, slot_date, slot_time
--   lp_hrms_id, lp_status, alp_hrms_id, alp_status
--   train_no, loco_no, incoming_detail, incoming_loco, is_pilot, pilot_station
--   sign_off_time, extra_alp_hrms_id, extra_alp_status
--   is_adhoc, safe_arrival_pending, exception_type, exception_note
--   created_at, updated_at
--
-- div_staff_master key columns:
--   hrms_id (PK), name, current_cms_id, current_office_code
--   designation_id (FK to designations), status
--
-- designations columns:
--   id, designation_code, designation_name, department
--
-- Designation names for crew:
--   LP: 'Loco Pilot Goods', 'Loco Pilot Shunter', 'Loco Pilot Mail'
--   ALP: 'Assistant Loco Pilot', 'Senior Assistant Loco Pilot'
--
-- Status values:
--   lp_status/alp_status: 'ONLINE', 'AVAILABLE', 'FORECAST', 'SAFE'
-- ============================================================================


-- ============================================================================
-- HELPER QUERIES
-- ============================================================================

-- Count staff by designation for an office:
-- SELECT d.designation_name, COUNT(*) as cnt
-- FROM div_staff_master s
-- JOIN designations d ON s.designation_id = d.id
-- WHERE s.current_office_code = 'PNVL-ML'
-- GROUP BY d.designation_name;

-- Delete all slate data for an office:
-- DELETE FROM div_daily_slate WHERE office_code = 'PNVL-ML';

-- Delete slate for specific date:
-- DELETE FROM div_daily_slate WHERE office_code = 'PNVL-ML' AND slot_date = '2026-03-03';

-- Check ONLINE crews with 5+ hours duty (for active-crews API):
-- SELECT ds.id, ds.slot_time, s.name as lp_name,
--        TIMESTAMPDIFF(HOUR, CONCAT(ds.slot_date, ' ', ds.slot_time), NOW()) as duty_hours
-- FROM div_daily_slate ds
-- JOIN div_staff_master s ON ds.lp_hrms_id = s.hrms_id
-- WHERE ds.office_code = 'PNVL-ML'
--   AND ds.lp_status = 'ONLINE'
--   AND TIMESTAMPDIFF(HOUR, CONCAT(ds.slot_date, ' ', ds.slot_time), NOW()) >= 5
-- ORDER BY ds.slot_time;
