-- ============================================
-- div_loco_link_master + div_loco_link_log
-- Created: 2026-05-04
-- Plan:    LOCO_LINK_FEATURE.md
-- Source:  /Users/neeraja/loco-link/CO_Loco_link_final.xlsx (7 sheets)
--
-- master:   planning template — one row per scheduled train slot
--           (~282 canonical + ~146 bypass = ~430 rows)
-- log:      daily LPC entries — one row per (date, train_no, direction)
--           Grows ~100 rows/day, ~36k/year.
-- ============================================

-- ─────────────────────────────────────────────
-- 1. Master / planning template
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `div_loco_link_master` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `sheet_source`     VARCHAR(30) NOT NULL,              -- CSMT-DN / BYPASS-LNL-BSR / ...
  `sr_no`            VARCHAR(10) DEFAULT NULL,
  `section`          VARCHAR(20) DEFAULT NULL,          -- NE / SE / KR / BYPASS
  `direction`        ENUM('UP','DN','BYPASS') NOT NULL,
  `is_bypass`        TINYINT(1) DEFAULT 0,
  `from_station`     VARCHAR(10) DEFAULT NULL,          -- terminal or bypass entry
  `to_station`       VARCHAR(10) DEFAULT NULL,          -- bypass exit
  `route_label`      VARCHAR(30) DEFAULT NULL,          -- bypass: "LNL-BSR"
  `shed_code`        VARCHAR(10) DEFAULT NULL,          -- canonical home_shed
  `link_attr`        VARCHAR(30) DEFAULT NULL,          -- HOG / P/4 / DSL / 130 kmph
  `expected_hog`     TINYINT(1) DEFAULT 0,              -- derived: link_attr LIKE '%HOG%'
  `traction_type`    ENUM('Electric','Diesel','Other','Unknown') DEFAULT 'Electric',
  `rake_type`        VARCHAR(20) DEFAULT NULL,          -- LHB / ICF / GS+VPH / LVPH
  `train_no`         VARCHAR(20) NOT NULL,
  `train_name`       VARCHAR(120) DEFAULT NULL,         -- bypass only (for now)
  `event_time`       VARCHAR(30) DEFAULT NULL,          -- raw HH:MM[:SS] string from xlsx
  `via_stations`     JSON DEFAULT NULL,                 -- bypass intermediate timings
  `run_days`         VARCHAR(30) DEFAULT NULL,          -- DAILY / 1,3,5
  `remark`           VARCHAR(255) DEFAULT NULL,
  `active`           TINYINT(1) DEFAULT 1,
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_train_dir_origin` (`train_no`, `direction`, `from_station`),
  KEY `idx_shed`             (`shed_code`),
  KEY `idx_dir_section`      (`direction`, `section`, `is_bypass`),
  KEY `idx_active_direction` (`active`, `direction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────────
-- 2. Daily log — one row per (date, train, direction)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `div_loco_link_log` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `working_date`     DATE NOT NULL,
  `direction`        ENUM('UP','DN','BYPASS') NOT NULL,
  `train_no`         VARCHAR(20) NOT NULL,
  `master_id`        INT DEFAULT NULL,                  -- soft-FK to div_loco_link_master.id
  `actual_loco_no`   VARCHAR(20) DEFAULT NULL,          -- LPC types this; soft-FK to div_locos.loco_number
  `base_shed`        VARCHAR(10) DEFAULT NULL,          -- snapshot of div_locos.home_shed at entry
  `loco_type`        VARCHAR(20) DEFAULT NULL,          -- snapshot
  `traction_type`    ENUM('Electric','Diesel','Dual') DEFAULT NULL,
  `hog`              TINYINT(1) DEFAULT NULL,           -- LPC-filled: was loco run with HOG ON
  `incoming_train`   VARCHAR(20) DEFAULT NULL,          -- DN sheet
  `outgoing_train`   VARCHAR(20) DEFAULT NULL,          -- UP sheet
  `expected_shed`    VARCHAR(10) DEFAULT NULL,          -- snapshot from master
  `is_mislink`       TINYINT(1) DEFAULT 0,              -- expected_shed <> base_shed (both non-null)
  `remark`           VARCHAR(255) DEFAULT NULL,
  `entered_by`       VARCHAR(100) DEFAULT NULL,         -- LPC username
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_train_dir`     (`working_date`, `train_no`, `direction`),
  KEY `idx_loco_date`                (`actual_loco_no`, `working_date`),
  KEY `idx_train_date`               (`train_no`, `working_date`),
  KEY `idx_mislink_date`             (`is_mislink`, `working_date`),
  KEY `idx_base_shed_date`           (`base_shed`, `working_date`),
  KEY `idx_master`                   (`master_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
