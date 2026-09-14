-- ============================================================
-- Temporary Speed Restrictions (caution orders) — DIVISION-WIDE
-- 2026-09-14  branch feature/ghat-spm
--
-- One row per caution, keyed by the ICMS caution ID (the RTIS/ICMS
-- "CAUTION/414" export) or a generated MAN-… id for manual entries.
-- Validity is a range (date_from .. date_to, NULL = in force) plus an
-- optional time-of-day window. Used by Ghat SPM (KSRA-IGP, KJT-LNL) and
-- available to RTIS for every other section in the export.
-- Apply: mysql -u jay -p4310jay bbtro < sql/2026-09-14_tsr_cautions.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS `div_tsr_imports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(150) DEFAULT NULL,
  `report_time` DATETIME DEFAULT NULL COMMENT 'ICMS report generation time (cell C1)',
  `rows_read` INT NOT NULL DEFAULT 0,
  `rows_added` INT NOT NULL DEFAULT 0,
  `rows_updated` INT NOT NULL DEFAULT 0,
  `rows_closed` INT NOT NULL DEFAULT 0 COMMENT 'Cautions absent from this report and closed (only when requested)',
  `rows_flagged` INT NOT NULL DEFAULT 0 COMMENT 'Mast cells Excel had turned into dates and could not be recovered cleanly',
  `imported_by` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Log of ICMS caution-order imports';

CREATE TABLE IF NOT EXISTS `div_tsr_cautions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `caution_id` VARCHAR(20) NOT NULL COMMENT 'ICMS id (BB062668) or MAN-YYYYMMDD-nnn for manual entries',
  `source` ENUM('ICMS','MANUAL') NOT NULL DEFAULT 'ICMS',
  `section` VARCHAR(20) NOT NULL COMMENT 'ICMS section code: CSMT-KYN, KYN-KSRA, KSRA-IGP, KJT-LNL, …',
  `from_stn` VARCHAR(10) DEFAULT NULL COMMENT 'Station/cabin code as in ICMS (X101 = TGR1, X102 = TGR2, X103 = TGR3)',
  `to_stn` VARCHAR(10) DEFAULT NULL,
  `line_no` VARCHAR(5) DEFAULT NULL,
  `line_name` VARCHAR(20) DEFAULT NULL COMMENT 'DNNE / UPNE / MIDDLE / DNSE / UPSE / MIDSE / 5THLN …',
  `direction` ENUM('UP','DN','BUP') NOT NULL DEFAULT 'BUP' COMMENT 'BUP = both',
  `from_mast` VARCHAR(20) DEFAULT NULL COMMENT 'OHE mast ref as text, e.g. 131/162',
  `to_mast` VARCHAR(20) DEFAULT NULL,
  `from_km` DECIMAL(8,3) DEFAULT NULL COMMENT 'km.mast read as a decimal (GAS / caution-order convention), raw WTT datum',
  `to_km` DECIMAL(8,3) DEFAULT NULL,
  `speed_pass` TINYINT UNSIGNED DEFAULT NULL COMMENT 'kmph for passenger; NULL for advisories',
  `speed_goods` TINYINT UNSIGNED DEFAULT NULL,
  `res_type` ENUM('SPEED','OHS_WF','CAUTIOUS') NOT NULL DEFAULT 'SPEED' COMMENT 'OHS_WF / CAUTIOUS = advisory (whistle, be cautious), no limit',
  `co_type` ENUM('TP','PP') DEFAULT 'TP' COMMENT 'Temporary / permanent (as ICMS)',
  `date_from` DATETIME NOT NULL,
  `date_to` DATETIME DEFAULT NULL COMMENT 'NULL = still in force',
  `time_from` TIME DEFAULT NULL COMMENT 'Daily window start, from remarks "FROM 0800 HRS TO 1800 HRS ONLY"',
  `time_to` TIME DEFAULT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `remarks` VARCHAR(500) DEFAULT NULL,
  `distance_m` INT DEFAULT NULL,
  `mast_flag` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = mast recovered from an Excel-mangled date; check by hand',
  `import_id` INT DEFAULT NULL COMMENT 'div_tsr_imports.id of the last import that touched the row',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` VARCHAR(50) DEFAULT NULL,
  `updated_by` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tsr_caution_id` (`caution_id`),
  KEY `idx_tsr_section_dates` (`section`,`date_from`,`date_to`),
  KEY `idx_tsr_active` (`is_active`,`section`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Temporary speed restrictions / caution orders, division-wide';
