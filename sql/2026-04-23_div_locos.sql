-- ============================================
-- div_locos — All-India electric loco master
-- Created: 2026-04-23
-- Source:  locodb.csv (13,792 rows, 16 zones)
-- Plan:    LOCO_MASTER_MIGRATION.md
--
-- Phase 1: create empty table; load rows via scripts/load_locos.js
-- Phases 2-4 (view over div_cr_locos, table renames, UI migration)
-- are tracked in LOCO_MASTER_MIGRATION.md and applied later.
-- ============================================

CREATE TABLE IF NOT EXISTS `div_locos` (
  `id`                   INT NOT NULL AUTO_INCREMENT,
  `loco_number`          VARCHAR(20) NOT NULL,
  `loco_type`            VARCHAR(20) DEFAULT NULL,
  `railway_zone`         VARCHAR(10) DEFAULT NULL,
  `home_shed`            VARCHAR(20) DEFAULT NULL,
  `status`               ENUM('Active','Transferred Out','Condemned') DEFAULT 'Active',
  `commission_date`      DATE DEFAULT NULL,
  `traction_converter`   VARCHAR(30) DEFAULT NULL,
  `arno_siv`             VARCHAR(30) DEFAULT NULL,
  `rtis_oem`             VARCHAR(20) DEFAULT NULL,
  `hrpt_count`           TINYINT DEFAULT 0,
  `microprocessor_type`  VARCHAR(30) DEFAULT NULL,
  `hotel_load_oem`       VARCHAR(30) DEFAULT NULL,
  `remarks`              VARCHAR(255) DEFAULT NULL,
  `created_at`           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loco_number` (`loco_number`),
  KEY `idx_railway_zone` (`railway_zone`),
  KEY `idx_loco_type` (`loco_type`),
  KEY `idx_home_shed` (`home_shed`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
