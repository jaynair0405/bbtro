-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: bypass_halts flag + strip "TH" suffix from event_time
-- Date: 2026-05-27
--
-- Background
--   Some BYPASS rows in div_loco_link_master had a "TH" suffix on event_time
--   (e.g. "05:00 TH") meaning the train *passes through* the bypass point
--   without halting. Others had compound arr/dep times (collapsed to arrival
--   in the previous migration) meaning the train *halts* (loco change window).
--
--   "TH" inside event_time is hard to query and breaks time parsing. Instead,
--   introduce a dedicated flag:
--
--       bypass_halts:
--         1     train halts at the bypass / event point (loco swap possible)
--         0     train passes through without halting
--         NULL  not applicable (non-BYPASS rows, or unknown)
--
--   After this migration:
--     • TH rows  → event_time = "HH:MM",       bypass_halts = 0
--     • Other BYPASS rows → event_time unchanged, bypass_halts = 1
--     • Non-BYPASS rows → bypass_halts stays NULL
--
--   The single "KK 04:40" outlier (id ≈ 295) is intentionally left untouched
--   here — it'll be cleaned in a follow-up migration once its semantics are
--   confirmed.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── PART 1: Add the flag column ────────────────────────────────────────────
ALTER TABLE div_loco_link_master
    ADD COLUMN bypass_halts TINYINT NULL
        COMMENT '1=halts at event/bypass point, 0=passes through, NULL=N/A or unknown',
    ADD INDEX idx_bypass_halts (bypass_halts);

-- ── PART 2: Pass-through rows ("HH:MM TH") ─────────────────────────────────
UPDATE div_loco_link_master
SET event_time   = TRIM(SUBSTRING_INDEX(event_time, ' ', 1)),
    bypass_halts = 0
WHERE event_time REGEXP '^[0-9]{1,2}:[0-9]{2}[[:space:]]+TH$';

-- ── PART 3: Halting BYPASS rows (anything else in a BYPASS sheet with a
--          plain HH:MM time) ─────────────────────────────────────────────────
UPDATE div_loco_link_master
SET bypass_halts = 1
WHERE sheet_source LIKE 'BYPASS%'
  AND bypass_halts IS NULL
  AND event_time REGEXP '^[0-9]{1,2}:[0-9]{2}$';

-- ── Verification queries ───────────────────────────────────────────────────
-- SHOW COLUMNS FROM div_loco_link_master LIKE 'bypass_halts';
-- SELECT COUNT(*) FROM div_loco_link_master WHERE bypass_halts = 0;   -- expect ~20
-- SELECT COUNT(*) FROM div_loco_link_master WHERE bypass_halts = 1;   -- expect ~111
-- SELECT COUNT(*) FROM div_loco_link_master WHERE event_time REGEXP 'TH'; -- expect 0
