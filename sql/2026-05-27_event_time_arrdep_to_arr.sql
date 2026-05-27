-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: normalize compound event_time (arr/dep) → arrival only
-- Date: 2026-05-27
--
-- Some div_loco_link_master rows (mostly BYPASS sheets) store event_time as
-- "HH:MM HH:MM" representing arrival + departure at the bypass / loco-change
-- point. LPC only needs a single canonical time for time-sorting the sheet;
-- arrival is the operationally meaningful one (when they need to be ready).
--
-- This migration keeps only the arrival (first) time for rows matching the
-- exact arr/dep pattern. Other compound forms (e.g. "05:00 TH", "KK 04:40")
-- are NOT touched — they will be cleaned in a separate migration once their
-- semantics are reviewed row by row.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE div_loco_link_master
SET event_time = SUBSTRING_INDEX(event_time, ' ', 1)
WHERE event_time REGEXP '^[0-9]{1,2}:[0-9]{2}[[:space:]]+[0-9]{1,2}:[0-9]{2}$';

-- Verify: no arr/dep pattern should remain
-- SELECT COUNT(*) AS remaining
-- FROM div_loco_link_master
-- WHERE event_time REGEXP '^[0-9]{1,2}:[0-9]{2}[[:space:]]+[0-9]{1,2}:[0-9]{2}$';
