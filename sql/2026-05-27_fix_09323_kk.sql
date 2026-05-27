-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: correct id 295 — train 09323 KK-INDB H/SPL on BYPASS-LNL-BSR
-- Date: 2026-05-27
--
-- Original data stored a hack value "KK 04:40" in event_time. Per LPC:
--   - Train originates from KK (Kirkee), not PA (Pune) → from_station = 'KK'
--   - Actual takeover at LNL is at 05:42 (not 04:40)
--   - It halts at LNL like the rest of BYPASS-LNL-BSR rows → bypass_halts = 1
--
-- Note: test scheduled specials (01016/01017) that existed only on the local
-- DB during Settings UI verification were deleted directly on local — they
-- never reached the server, so no DELETE is needed here.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE div_loco_link_master
SET event_time   = '05:42',
    from_station = 'KK',
    bypass_halts = 1
WHERE id = 295 AND train_no = '09323';

-- Verification
-- SELECT * FROM div_loco_link_master WHERE id = 295;
-- SELECT COUNT(*) FROM div_loco_link_master WHERE event_time LIKE '%KK%';   -- expect 0
