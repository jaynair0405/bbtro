-- ============================================
-- div_locos — add traction columns for incremental diesel master
-- Created: 2026-05-04
-- Plan:    LOCO_MASTER_MIGRATION.md  +  LOCO_LINK_FEATURE.md
--
-- Existing rows are all electric (CSV upload). Diesel locos will be
-- appended one-by-one as LPC enters them in the loco-link daily log.
-- ============================================

ALTER TABLE `div_locos`
  ADD COLUMN `traction_type` ENUM('Electric','Diesel','Dual')
    DEFAULT 'Electric'
    AFTER `loco_type`,
  ADD COLUMN `data_source` ENUM('CSV_UPLOAD','LPC_ENTRY','MANUAL')
    DEFAULT 'CSV_UPLOAD'
    AFTER `hotel_load_oem`,
  ADD COLUMN `entered_by` VARCHAR(100) DEFAULT NULL
    AFTER `data_source`,
  ADD KEY `idx_traction` (`traction_type`),
  ADD KEY `idx_data_source` (`data_source`);
