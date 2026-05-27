-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: pad single-digit hours in event_time → HH:MM
-- Date: 2026-05-27
--
-- 57 rows store event_time as "H:MM" (e.g. "4:20", "7:55"). The frontend
-- already pads for display, but normalizing the stored value:
--   • makes raw-SQL queries consistent
--   • prevents future drift (new inserts already enforce 2-digit hours via
--     the inline-special form and the Settings UI HTML date/time inputs)
--   • aligns with the rest of the rows (HH:MM)
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE div_loco_link_master
SET event_time = LPAD(event_time, 5, '0')
WHERE event_time REGEXP '^[0-9]:[0-9]{2}$';

-- Verification
-- SELECT COUNT(*) FROM div_loco_link_master WHERE event_time REGEXP '^[0-9]:[0-9]{2}$';   -- expect 0
