-- ============================================================================
-- Staff hrms_id Correction - 2026-06-10
-- ============================================================================
-- Two staff were created with the WRONG hrms_id. Correct it in div_staff_master
-- (PRIMARY KEY) and EVERY related table that stores it.
--
--   Staff 1: Manoj Kumar Singh  (current_cms_id KYN5711)  PMQHDW -> PMQHOW
--   Staff 2: SUBODH KUMAR       (current_cms_id IGP2588)  ZWIGKE -> ZWIGLE
--
-- WHY THIS IS NOT A SIMPLE UPDATE:
--   * hrms_id is the PRIMARY KEY of div_staff_master and is referenced by 19
--     foreign keys, ALL with UPDATE_RULE = NO ACTION. A plain UPDATE (parent or
--     child first) is REJECTED. We run with FOREIGN_KEY_CHECKS = 0 inside one
--     transaction so parent + children move together.
--   * The SERVER may have MORE tables than local. So instead of a hand-picked
--     list, STEP 2 updates EVERY base-table column whose name contains "hrms",
--     and STEP 1 + STEP 3 let you confirm/extend against the live schema.
--   * `motormen` is a VIEW over div_staff_master -> updates automatically.
--
-- RUN IN MySQL Workbench, step by step. Read the BEFORE / discovery / AFTER output.
-- ============================================================================


-- ============================================================================
-- STEP 0 — BEFORE: confirm the two staff and their current ids
-- ============================================================================
SELECT hrms_id, current_cms_id, name FROM div_staff_master
WHERE hrms_id IN ('PMQHDW','ZWIGKE');


-- ============================================================================
-- STEP 1 — DISCOVERY: which tables on THIS (server) DB actually hold the old ids?
-- Run this first. It scans every base-table *hrms* column in the live schema and
-- lists only those that currently contain PMQHDW / ZWIGKE. Compare the result to
-- the tables covered by STEP 2 below. (Local had: div_staff_master,
-- div_cli_nominations, div_ctr_duties, div_lrd_segment_coverage,
-- div_training_records, motormen_old.)
-- ============================================================================
SET SESSION group_concat_max_len = 1000000;
SET @sql = NULL;
SELECT GROUP_CONCAT(
  CONCAT('SELECT ''', TABLE_NAME, ''' AS tbl, ''', COLUMN_NAME,
         ''' AS col, COUNT(*) AS n FROM `', TABLE_NAME,
         '` WHERE `', COLUMN_NAME, '` IN (''PMQHDW'',''ZWIGKE'')')
  SEPARATOR ' UNION ALL ')
INTO @sql
FROM information_schema.COLUMNS c
JOIN information_schema.TABLES t USING (TABLE_SCHEMA, TABLE_NAME)
WHERE c.TABLE_SCHEMA = DATABASE() AND t.TABLE_TYPE = 'BASE TABLE'
  AND c.COLUMN_NAME LIKE '%hrms%';
SET @sql = CONCAT('SELECT * FROM (', @sql, ') x WHERE n > 0 ORDER BY tbl');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;


-- ============================================================================
-- STEP 2 — APPLY: correct hrms_id everywhere (server-complete)
-- Covers EVERY base-table *hrms* column that exists in the schema as of this
-- file. Updating a table that has 0 matching rows is harmless (0 rows affected).
-- If STEP 1 listed a table NOT present below, the server has an extra table:
-- run STEP 3 to regenerate the full list, then re-run.
-- ============================================================================
START TRANSACTION;
SET FOREIGN_KEY_CHECKS = 0;

UPDATE `div_adas_reports` SET `cli_hrms_id` = CASE `cli_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `cli_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_adas_reports` SET `mman_hrms_id` = CASE `mman_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `mman_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_aws_events` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_category_change_history` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_cli_master` SET `cli_hrms_id` = CASE `cli_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `cli_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_cli_nominations` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_ctr_duties` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_cvvrs_reports` SET `alp_hrms_id` = CASE `alp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `alp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_cvvrs_reports` SET `cli_hrms_id` = CASE `cli_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `cli_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_cvvrs_reports` SET `lp_hrms_id` = CASE `lp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `lp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_daily_slate` SET `alp_hrms_id` = CASE `alp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `alp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_daily_slate` SET `extra_alp_hrms_id` = CASE `extra_alp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `extra_alp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_daily_slate` SET `lp_hrms_id` = CASE `lp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `lp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_detail_book_log` SET `alp_hrms_id` = CASE `alp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `alp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_detail_book_log` SET `lp_hrms_id` = CASE `lp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `lp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_detonator_usage_log` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_family_members` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_leave_tracking` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_lrd_segment_coverage` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_lrd_status` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_midnight_position_staff` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_promotion_history` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_rtis_analyses` SET `alp_hrms_id` = CASE `alp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `alp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_rtis_analyses` SET `lp_hrms_id` = CASE `lp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `lp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_rtis_braking_runs` SET `alp_hrms_id` = CASE `alp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `alp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_rtis_braking_runs` SET `lp_hrms_id` = CASE `lp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `lp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_rtis_daily_entries` SET `alp_hrms_id` = CASE `alp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `alp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_rtis_daily_entries` SET `lp_hrms_id` = CASE `lp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `lp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_rtis_violations` SET `alp_hrms_id` = CASE `alp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `alp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_rtis_violations` SET `lp_hrms_id` = CASE `lp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `lp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_runsafe_dev_plans` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_runsafe_sessions` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_staff_awards` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_staff_detonator_stock` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_staff_drafting_records` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_staff_fatigue_tracker` SET `hrms_id` = CASE `hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_staff_master` SET `hrms_id` = CASE `hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_staff_personnel_stores` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_staff_punishments` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_sub_spm_runs` SET `motorman_hrms_id` = CASE `motorman_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `motorman_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_training_letter_staff` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_training_records` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_transfer_history` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_transfer_requests` SET `staff_hrms_id` = CASE `staff_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `staff_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `div_tw_detail` SET `lp_hrms_id` = CASE `lp_hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `lp_hrms_id` IN ('PMQHDW','ZWIGKE');
UPDATE `motormen_old` SET `hrms_id` = CASE `hrms_id` WHEN 'PMQHDW' THEN 'PMQHOW' WHEN 'ZWIGKE' THEN 'ZWIGLE' END WHERE `hrms_id` IN ('PMQHDW','ZWIGKE');

SET FOREIGN_KEY_CHECKS = 1;

-- AFTER: verify — new ids present, old ids gone everywhere
SELECT hrms_id, current_cms_id, name FROM div_staff_master
WHERE hrms_id IN ('PMQHOW','ZWIGLE','PMQHDW','ZWIGKE');

-- Re-run STEP 1 discovery now: it MUST return 0 rows.
-- COMMIT is intentionally NOT run by this file. After `source` finishes the
-- transaction stays OPEN — review the output above, then type ONE of these
-- yourself at the mysql> prompt:
--   COMMIT;     -- if AFTER shows PMQHOW + ZWIGLE and discovery is 0 rows
--   ROLLBACK;   -- if anything looks wrong


-- ============================================================================
-- STEP 3 (FALLBACK) — regenerate the full UPDATE list from the LIVE schema
-- Only needed if STEP 1 revealed a table not covered by STEP 2 (i.e. the server
-- has extra tables). Run this; it OUTPUTS the complete set of UPDATE statements
-- for the live schema. Copy the output, paste between the
-- SET FOREIGN_KEY_CHECKS=0 / =1 lines of a transaction, and run.
-- ============================================================================
-- SELECT CONCAT('UPDATE `', TABLE_NAME, '` SET `', COLUMN_NAME,
--   '` = CASE `', COLUMN_NAME,
--   '` WHEN ''PMQHDW'' THEN ''PMQHOW'' WHEN ''ZWIGKE'' THEN ''ZWIGLE'' END WHERE `',
--   COLUMN_NAME, '` IN (''PMQHDW'',''ZWIGKE'');') AS stmt
-- FROM information_schema.COLUMNS c
-- JOIN information_schema.TABLES t USING (TABLE_SCHEMA, TABLE_NAME)
-- WHERE c.TABLE_SCHEMA = DATABASE() AND t.TABLE_TYPE = 'BASE TABLE'
--   AND c.COLUMN_NAME LIKE '%hrms%'
-- ORDER BY TABLE_NAME, COLUMN_NAME;


-- ============================================================================
-- OPTIONAL: current_cms_id correction (NOT performed here)
-- ----------------------------------------------------------------------------
-- cms ids are UNCHANGED for this fix (Manoj -> KYN5711, Subodh -> IGP2588).
-- If a cms id ever needs correcting, current_cms_id is NOT a PK, so NO
-- FOREIGN_KEY_CHECKS toggle is needed. Discover/generate the same way, swapping
-- the column filter to cms. See docs/STAFF_HRMS_ID_CORRECTION.md for the full
-- cms-keyed table list and a ready generator.
-- ============================================================================
