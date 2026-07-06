-- ============================================
-- div_locos — LPC-entered maintenance schedule
-- Created: 2026-07-03
-- Module:  Control Office / Loco-Link daily sheet
--
-- The LPC records each loco's current/next-due maintenance schedule while
-- filling the daily loco-link sheet. Stored on the loco master (keyed by
-- loco_number) so it auto-fills the next time that loco is entered on any
-- sheet / date. Latest entry wins (overwrite) — as a loco advances through
-- schedules the LPC updates the type + due date.
--
-- Schedule types (Indian Railways electric loco maintenance):
--   IA / IB / IC  — inspection schedules
--   IOH           — Intermediate Overhaul
--   TOH           — Trip / (T) Overhaul
--   POH           — Periodical Overhaul
--
-- These columns are LPC-owned and are NOT written by scripts/load_locos.js
-- (its ON DUPLICATE KEY UPDATE only refreshes CSV-sourced columns), so a
-- future master re-import will not wipe them.
-- ============================================

ALTER TABLE `div_locos`
  ADD COLUMN `schedule_type`       ENUM('IA','IB','IC','IOH','TOH','POH') DEFAULT NULL AFTER `hotel_load_oem`,
  ADD COLUMN `schedule_due_date`   DATE         DEFAULT NULL AFTER `schedule_type`,
  ADD COLUMN `schedule_updated_by` VARCHAR(100) DEFAULT NULL AFTER `schedule_due_date`,
  ADD COLUMN `schedule_updated_at` TIMESTAMP    NULL DEFAULT NULL AFTER `schedule_updated_by`;
