-- ============================================
-- Loco-link extras: push-pull support + sick-loco workflow + LPC role
-- Created: 2026-05-04
-- Plan:    LOCO_LINK_FEATURE.md
-- ============================================

-- ─── 1. Push-pull on master ──────────────────────
ALTER TABLE `div_loco_link_master`
  ADD COLUMN `is_push_pull` TINYINT(1) DEFAULT 0 AFTER `expected_hog`,
  ADD KEY `idx_push_pull` (`is_push_pull`);

-- ─── 2. Push-pull on log (4 columns, Option A) ───
ALTER TABLE `div_loco_link_log`
  ADD COLUMN `actual_loco_no_rear` VARCHAR(20) DEFAULT NULL AFTER `actual_loco_no`,
  ADD COLUMN `base_shed_rear`      VARCHAR(10) DEFAULT NULL AFTER `base_shed`,
  ADD COLUMN `loco_type_rear`      VARCHAR(20) DEFAULT NULL AFTER `loco_type`,
  ADD COLUMN `is_mislink_rear`     TINYINT(1)  DEFAULT 0    AFTER `is_mislink`,
  ADD KEY `idx_loco_rear_date` (`actual_loco_no_rear`, `working_date`);

-- ─── 3. Sick-loco records ────────────────────────
CREATE TABLE IF NOT EXISTS `div_loco_sick_records` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `loco_number`    VARCHAR(20) NOT NULL,
  `sick_from`      DATE NOT NULL,
  `sick_at_shed`   VARCHAR(10) DEFAULT NULL,
  `sick_reason`    VARCHAR(255) DEFAULT NULL,
  `sicked_by`      VARCHAR(100) DEFAULT NULL,
  `fit_from`       DATE DEFAULT NULL,
  `fitted_by`      VARCHAR(100) DEFAULT NULL,
  `fit_remarks`    VARCHAR(255) DEFAULT NULL,
  `remarks`        VARCHAR(255) DEFAULT NULL,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_loco`            (`loco_number`),
  KEY `idx_currently_sick`  (`loco_number`, `fit_from`),
  KEY `idx_dates`           (`sick_from`, `fit_from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
