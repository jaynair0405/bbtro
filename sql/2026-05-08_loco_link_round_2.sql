-- ============================================
-- Loco-link feature — round 2 (consolidated post-baseline ALTERs)
-- Created: 2026-05-08
-- Plan:    LOCO_LINK_FEATURE.md
--
-- Bundles every schema change made AFTER the 2026-05-04 baseline:
--   div_loco_link_master :  expected_loco_type, accepted_loco_types
--                           link_attr canonicalization (HOG → P/7)
--                           is_push_pull index
--   div_loco_link_log    :  sheet_source, section, secondary_role,
--                           main_loco_dead, failed_in_division,
--                           outgoing_train_rear, remarks_rear
--   div_loco_sick_records:  full xlsx-parity fields (11 new columns)
--
-- Run once on a fresh post-baseline DB, after:
--   2026-05-04_div_loco_link.sql
--   2026-05-04_loco_link_extras.sql
-- This file is not fully idempotent; rerunning will error on existing columns
-- or indexes. Guard externally if a re-run is needed.
-- ============================================

-- ─── div_loco_link_master extras ──────────────────────────────────
ALTER TABLE `div_loco_link_master`
  ADD COLUMN `expected_loco_type`  VARCHAR(20)  DEFAULT NULL AFTER `traction_type`,
  ADD COLUMN `accepted_loco_types` VARCHAR(100) DEFAULT NULL AFTER `expected_loco_type`,
  ADD KEY `idx_expected_type` (`expected_loco_type`);

-- Canonicalize link_attr: HOG → P/7 (the loco-type expectation; HOG-ness lives in expected_hog flag)
UPDATE `div_loco_link_master`
SET `link_attr` = REPLACE(`link_attr`, 'HOG', 'P/7')
WHERE `link_attr` LIKE '%HOG%';

-- Populate expected_loco_type + accepted_loco_types
UPDATE `div_loco_link_master`
SET `expected_loco_type` = 'WAP7', `accepted_loco_types` = 'WAP5,WAP7'
WHERE `link_attr` LIKE 'P/7%';

UPDATE `div_loco_link_master`
SET `expected_loco_type` = 'WAP4', `accepted_loco_types` = 'WAP4'
WHERE `link_attr` LIKE 'P/4%';

UPDATE `div_loco_link_master`
SET `expected_loco_type` = 'WAP5', `accepted_loco_types` = 'WAP5'
WHERE `link_attr` LIKE 'P/5%';

-- LTT rename (VVH shed → LTT station naming convention):
-- VVH-DN  → LTT-DN  (70 rows + 3 pre-moved = 73)
-- VVH-UP  → LTT-UP  (70 rows + 3 pre-moved = 73)
-- 6 mail-express trains (16339/16331/16351 + 16340/16332/16352) moved from CSMT-DN/UP
-- to the new LTT sheets with from_station updated.
UPDATE `div_loco_link_master` SET `sheet_source` = 'LTT-DN'   WHERE `sheet_source` = 'VVH-DN';
UPDATE `div_loco_link_master` SET `sheet_source` = 'LTT-UP'   WHERE `sheet_source` = 'VVH-UP';
UPDATE `div_loco_link_master` SET `from_station` = 'LTT'      WHERE `from_station` = 'VVH';

-- ─── div_loco_link_log: special-train + propagation + secondary-role ──
ALTER TABLE `div_loco_link_log`
  ADD COLUMN `sheet_source`        VARCHAR(30) DEFAULT NULL  AFTER `master_id`,
  ADD COLUMN `section`             VARCHAR(20) DEFAULT NULL  AFTER `sheet_source`,
  ADD COLUMN `main_loco_dead`      TINYINT(1)  DEFAULT 0     AFTER `actual_loco_no`,
  ADD COLUMN `failed_in_division`  TINYINT(1)  DEFAULT NULL  AFTER `main_loco_dead`,
  ADD COLUMN `secondary_role`
    ENUM('rear','coupler','assist','dead_in_tow')
    DEFAULT NULL  AFTER `actual_loco_no_rear`,
  ADD COLUMN `outgoing_train_rear` VARCHAR(20)  DEFAULT NULL AFTER `outgoing_train`,
  ADD COLUMN `remarks_rear`        VARCHAR(500) DEFAULT NULL AFTER `remark`,
  ADD KEY `idx_sheet_date`        (`sheet_source`, `working_date`),
  ADD KEY `idx_secondary_role`    (`secondary_role`),
  ADD KEY `idx_main_dead`         (`main_loco_dead`);

-- Backfill: any existing rear loco rows belong to push-pull masters → role='rear'
UPDATE `div_loco_link_log`
SET `secondary_role` = 'rear'
WHERE `actual_loco_no_rear` IS NOT NULL;

-- Backfill log.sheet_source + section from joined master (master-linked rows only)
UPDATE `div_loco_link_log` l
JOIN `div_loco_link_master` m ON m.id = l.master_id
SET l.`sheet_source` = m.`sheet_source`, l.`section` = m.`section`
WHERE l.`master_id` IS NOT NULL;

-- ─── div_loco_sick_records: full xlsx-parity ───────────────────────
ALTER TABLE `div_loco_sick_records`
  ADD COLUMN `ineffective_time`   TIME         DEFAULT NULL  AFTER `sick_from`,
  ADD COLUMN `sick_train_no`      VARCHAR(20)  DEFAULT NULL  AFTER `sick_at_shed`,
  ADD COLUMN `current_location`   VARCHAR(30)  DEFAULT NULL  AFTER `sick_train_no`,
  ADD COLUMN `status`
    ENUM('U/R','RDY','WKG','DEAD','H/O')
    DEFAULT 'U/R' AFTER `current_location`,
  ADD COLUMN `category`
    ENUM('COG','GOODS','COG-DSL','GOODS-DSL','OTHER')
    DEFAULT NULL  COMMENT 'Manual override; NULL = use auto-detect'  AFTER `status`,
  ADD COLUMN `shed_arr_date`      DATE         DEFAULT NULL  AFTER `category`,
  ADD COLUMN `shed_arr_time`      TIME         DEFAULT NULL  AFTER `shed_arr_date`,
  ADD COLUMN `ready_time`         TIME         DEFAULT NULL  AFTER `fit_from`,
  ADD COLUMN `hoc_train_no`       VARCHAR(20)  DEFAULT NULL  AFTER `fit_remarks`,
  ADD COLUMN `hoc_date`           DATE         DEFAULT NULL  AFTER `hoc_train_no`,
  ADD COLUMN `sch_done`           VARCHAR(50)  DEFAULT NULL  AFTER `hoc_date`,
  ADD COLUMN `paired_with_id`     INT          DEFAULT NULL  AFTER `sch_done`,
  MODIFY COLUMN `remarks`         VARCHAR(500);

-- ─── Verify ─────────────────────────────────────────────────────────
SELECT 'div_loco_link_master' AS table_name,
       COUNT(*) AS rows,
       SUM(CASE WHEN link_attr LIKE 'P/7%' THEN 1 ELSE 0 END) AS p7_rows,
       SUM(CASE WHEN expected_loco_type IS NOT NULL THEN 1 ELSE 0 END) AS with_type,
       SUM(CASE WHEN sheet_source LIKE 'LTT%' THEN 1 ELSE 0 END) AS ltt_rows
FROM div_loco_link_master WHERE active = 1
UNION ALL
SELECT 'div_loco_link_log', COUNT(*), NULL, NULL, NULL FROM div_loco_link_log
UNION ALL
SELECT 'div_loco_sick_records', COUNT(*), NULL, NULL, NULL FROM div_loco_sick_records;
