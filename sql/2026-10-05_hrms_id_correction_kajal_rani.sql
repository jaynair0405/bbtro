-- ============================================================================
-- Staff hrms_id Correction - 2026-10-05  (playbook: docs/STAFF_HRMS_ID_CORRECTION.md)
-- ============================================================================
--   KAJAL RANI  (current_cms_id PNVL5753, unchanged)
--     hrms_id    EAMSHY        -> EAMSHX        (verified in HRMS 2026-10-05)
--     pf_number  002229810299  -> 00229810299   (extra '2'; HRMS has 00229810299)
--
-- hrms_id is the PRIMARY KEY of div_staff_master, referenced by FKs with
-- ON UPDATE NO ACTION -> rename parent + children together with
-- FOREIGN_KEY_CHECKS = 0 inside one transaction. STEP 2 covers EVERY base-table
-- *hrms* column in the schema as of this file (backup tables included, as in June).
--
-- RUN INTERACTIVELY (mysql> source <file>), NOT "mysql < file": the transaction
-- is left OPEN and you COMMIT or ROLLBACK by hand. Piping the file in would end
-- the session and silently roll everything back.
-- ============================================================================


-- STEP 0 — BEFORE
SELECT hrms_id, pf_number, current_cms_id, name, current_office_code
FROM div_staff_master WHERE hrms_id IN ('EAMSHY','EAMSHX');


-- STEP 1 — DISCOVERY: which tables on THIS DB hold EAMSHY?
-- (Local 2026-10-05: div_cli_nominations 2, div_ctr_duties 92, div_daily_slate 25,
--  div_detail_book_log 85, div_leave_tracking 1, div_lrd_segment_coverage 68,
--  div_staff_master 1, div_training_records 7)
SET SESSION group_concat_max_len = 1000000;
SET @sql = NULL;
SELECT GROUP_CONCAT(
  CONCAT('SELECT ''', TABLE_NAME, ''' AS tbl, ''', COLUMN_NAME,
         ''' AS col, COUNT(*) AS n FROM `', TABLE_NAME,
         '` WHERE `', COLUMN_NAME, '` = ''EAMSHY''')
  SEPARATOR ' UNION ALL ')
INTO @sql
FROM information_schema.COLUMNS c
JOIN information_schema.TABLES t USING (TABLE_SCHEMA, TABLE_NAME)
WHERE c.TABLE_SCHEMA = DATABASE() AND t.TABLE_TYPE = 'BASE TABLE'
  AND c.COLUMN_NAME LIKE '%hrms%';
SET @sql = CONCAT('SELECT * FROM (', @sql, ') x WHERE n > 0 ORDER BY tbl');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;


-- STEP 2 — APPLY
START TRANSACTION;
SET FOREIGN_KEY_CHECKS = 0;
UPDATE `bak_20260902_cli_nominations` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `bak_20260902_motnom_nominations` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `bak_20260902_motnom_staff` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `bak_20260902_staff_cli_id` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `bak_20260907_nom4` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `div_adas_reports` SET `cli_hrms_id` = 'EAMSHX' WHERE `cli_hrms_id` = 'EAMSHY';
UPDATE `div_adas_reports` SET `mman_hrms_id` = 'EAMSHX' WHERE `mman_hrms_id` = 'EAMSHY';
UPDATE `div_ambush_violations` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_aws_events` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_cadre_letter_staff` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_category_change_history` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_cli_master` SET `cli_hrms_id` = 'EAMSHX' WHERE `cli_hrms_id` = 'EAMSHY';
UPDATE `div_cli_nominations` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_cli_nominations_bak_20260915_lnl` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_clihq_notes` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_counselling_attendees` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_ctr_duties` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_cvvrs_reports` SET `alp_hrms_id` = 'EAMSHX' WHERE `alp_hrms_id` = 'EAMSHY';
UPDATE `div_cvvrs_reports` SET `cli_hrms_id` = 'EAMSHX' WHERE `cli_hrms_id` = 'EAMSHY';
UPDATE `div_cvvrs_reports` SET `lp_hrms_id` = 'EAMSHX' WHERE `lp_hrms_id` = 'EAMSHY';
UPDATE `div_daily_slate` SET `alp_hrms_id` = 'EAMSHX' WHERE `alp_hrms_id` = 'EAMSHY';
UPDATE `div_daily_slate` SET `extra_alp_hrms_id` = 'EAMSHX' WHERE `extra_alp_hrms_id` = 'EAMSHY';
UPDATE `div_daily_slate` SET `lp_hrms_id` = 'EAMSHX' WHERE `lp_hrms_id` = 'EAMSHY';
UPDATE `div_detail_book_log` SET `alp_hrms_id` = 'EAMSHX' WHERE `alp_hrms_id` = 'EAMSHY';
UPDATE `div_detail_book_log` SET `lp_hrms_id` = 'EAMSHX' WHERE `lp_hrms_id` = 'EAMSHY';
UPDATE `div_detonator_usage_log` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_family_members` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_leave_tracking` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_lrd_segment_coverage` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_lrd_status` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_midnight_position_staff` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_promotion_history` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_promotion_history_bak_20260721` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_promotion_history_bak_20260721_janfix` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_promotion_history_bak_20260722_lpg` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_promotion_history_bak_20260722_lpm` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_rtis_analyses` SET `alp_hrms_id` = 'EAMSHX' WHERE `alp_hrms_id` = 'EAMSHY';
UPDATE `div_rtis_analyses` SET `lp_hrms_id` = 'EAMSHX' WHERE `lp_hrms_id` = 'EAMSHY';
UPDATE `div_rtis_braking_runs` SET `alp_hrms_id` = 'EAMSHX' WHERE `alp_hrms_id` = 'EAMSHY';
UPDATE `div_rtis_braking_runs` SET `lp_hrms_id` = 'EAMSHX' WHERE `lp_hrms_id` = 'EAMSHY';
UPDATE `div_rtis_daily_entries` SET `alp_hrms_id` = 'EAMSHX' WHERE `alp_hrms_id` = 'EAMSHY';
UPDATE `div_rtis_daily_entries` SET `lp_hrms_id` = 'EAMSHX' WHERE `lp_hrms_id` = 'EAMSHY';
UPDATE `div_rtis_violations` SET `alp_hrms_id` = 'EAMSHX' WHERE `alp_hrms_id` = 'EAMSHY';
UPDATE `div_rtis_violations` SET `lp_hrms_id` = 'EAMSHX' WHERE `lp_hrms_id` = 'EAMSHY';
UPDATE `div_runsafe_dev_plans` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_runsafe_sessions` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_ssehq_delogging_notes` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_ssehq_opr_reports` SET `alp_staff_hrms_id` = 'EAMSHX' WHERE `alp_staff_hrms_id` = 'EAMSHY';
UPDATE `div_ssehq_opr_reports` SET `lp_staff_hrms_id` = 'EAMSHX' WHERE `lp_staff_hrms_id` = 'EAMSHY';
UPDATE `div_staff_awards` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_staff_detonator_stock` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_staff_drafting_records` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_staff_fatigue_tracker` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `div_staff_line_clearance` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `div_staff_master` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `div_staff_master_backup` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `div_staff_master_bak_20260915_lnl` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `div_staff_personnel_stores` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_staff_punishments` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_sub_spm_runs` SET `motorman_hrms_id` = 'EAMSHX' WHERE `motorman_hrms_id` = 'EAMSHY';
UPDATE `div_training_letter_staff` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_training_records` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_training_trainees` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `div_training_trainees` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_transfer_history` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_transfer_letter_staff` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_transfer_requests` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_transfer_requests_bak_20260915_lnl` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE `div_trip_inspections` SET `supervisor_hrms_id` = 'EAMSHX' WHERE `supervisor_hrms_id` = 'EAMSHY';
UPDATE `div_trip_inspections` SET `technician_hrms_id` = 'EAMSHX' WHERE `technician_hrms_id` = 'EAMSHY';
UPDATE `div_trip_shed_staff` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `div_tw_detail` SET `lp_hrms_id` = 'EAMSHX' WHERE `lp_hrms_id` = 'EAMSHY';
UPDATE `motormen_old` SET `hrms_id` = 'EAMSHX' WHERE `hrms_id` = 'EAMSHY';
UPDATE `stg_motnom_28aug` SET `staff_hrms_id` = 'EAMSHX' WHERE `staff_hrms_id` = 'EAMSHY';
UPDATE div_staff_master SET pf_number = '00229810299'
WHERE hrms_id = 'EAMSHX' AND pf_number = '002229810299';
SET FOREIGN_KEY_CHECKS = 1;



-- AFTER: EAMSHX with PF 00229810299 present, EAMSHY gone
SELECT hrms_id, pf_number, current_cms_id, name FROM div_staff_master
WHERE hrms_id IN ('EAMSHY','EAMSHX');

-- Discovery again: MUST return 0 rows (empty set)
SET SESSION group_concat_max_len = 1000000;
SET @sql = NULL;
SELECT GROUP_CONCAT(
  CONCAT('SELECT ''', TABLE_NAME, ''' AS tbl, ''', COLUMN_NAME,
         ''' AS col, COUNT(*) AS n FROM `', TABLE_NAME,
         '` WHERE `', COLUMN_NAME, '` = ''EAMSHY''')
  SEPARATOR ' UNION ALL ')
INTO @sql
FROM information_schema.COLUMNS c
JOIN information_schema.TABLES t USING (TABLE_SCHEMA, TABLE_NAME)
WHERE c.TABLE_SCHEMA = DATABASE() AND t.TABLE_TYPE = 'BASE TABLE'
  AND c.COLUMN_NAME LIKE '%hrms%';
SET @sql = CONCAT('SELECT * FROM (', @sql, ') x WHERE n > 0 ORDER BY tbl');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Transaction is still OPEN. Type ONE of these yourself:
--   COMMIT;     -- AFTER shows EAMSHX / 00229810299 and discovery is empty
--   ROLLBACK;   -- anything looks wrong, or discovery still lists a table
--               -- (a server-only table: add its UPDATE line above, re-run)
