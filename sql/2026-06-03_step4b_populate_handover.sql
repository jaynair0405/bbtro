-- ═══════════════════════════════════════════════════════════════════════════
-- Architecture rebuild — STEP 4b: populate loco_handover_station
-- Date: 2026-06-03
--
-- Populates loco_handover_station on every segment row so each segment
-- clearly shows BOTH boundaries of Mumbai's loco link (takeover + handover).
--
-- Standard rule (single-segment trains, no en-route loco change):
--   UP   → handover = Mumbai terminal (CSMT/LTT/PNVL/KR-UP destination)
--   DN   → handover = the boundary where Mumbai's link ends
--          (SE→LNL, NE→IGP, KR→ROHA)
--   BYPASS → handover = the bypass exit station
--
-- Multi-leg override (currently only 22149 / 22150):
--   Identified by div_trains.loco_change_station IS NOT NULL.
--   For each such train's two segments:
--     - The leg whose takeover ≠ loco_change_station → handover = loco_change_station
--       (i.e. it hands off to the OTHER loco at PNVL)
--     - The leg whose takeover  = loco_change_station → handover = the OTHER
--       segment's takeover (i.e. it goes out at the standard boundary on
--       the other side: LNL for 22149-SE-leg, ROHA for 22150-KR-leg)
--
-- After this, the doc's worked example for 22149/22150 should map cleanly:
--   22149: ROHA → PNVL  +  PNVL → LNL
--   22150: LNL  → PNVL  +  PNVL → ROHA
-- ═══════════════════════════════════════════════════════════════════════════

SET SQL_SAFE_UPDATES = 0;

-- ── 1. Standard rule for every segment ─────────────────────────────────────
UPDATE div_train_segments s
JOIN div_loco_link_master m ON m.segment_id = s.segment_id
SET s.loco_handover_station = CASE
    WHEN s.segment_direction = 'UP' THEN
        CASE
            WHEN s.sheet_source = 'CSMT-UP' THEN 'CSMT'
            WHEN s.sheet_source = 'LTT-UP'  THEN 'LTT'
            WHEN s.sheet_source = 'PNVL-UP' THEN 'PNVL'
            WHEN s.sheet_source = 'KR-UP'   THEN m.to_station
            ELSE NULL
        END
    WHEN s.segment_direction = 'DN' THEN
        CASE s.section_label
            WHEN 'SE' THEN 'LNL'
            WHEN 'NE' THEN 'IGP'
            WHEN 'KR' THEN 'ROHA'
            ELSE NULL
        END
    WHEN s.segment_direction = 'BYPASS' THEN m.to_station
    ELSE NULL
END;

-- ── 2a. Multi-leg override: leg with non-PNVL takeover hands off AT PNVL ───
UPDATE div_train_segments s
JOIN div_trains t ON t.train_id = s.train_id
SET s.loco_handover_station = t.loco_change_station
WHERE t.loco_change_station IS NOT NULL
  AND s.loco_takeover_station <> t.loco_change_station;

-- ── 2b. Multi-leg override: leg with PNVL takeover hands off at the
--        boundary OPPOSITE to the other segment's takeover.
--        (PNVL is the loco-change midpoint; one leg ends on the SE side,
--         the other on the KR side — they're opposites.)
--        Boundary opposites: LNL ↔ ROHA, IGP ↔ ROHA.
UPDATE div_train_segments s1
JOIN div_trains t ON t.train_id = s1.train_id
JOIN div_train_segments s2
    ON s2.train_id   = s1.train_id
   AND s2.segment_id <> s1.segment_id
   AND s2.loco_takeover_station <> t.loco_change_station
SET s1.loco_handover_station = CASE s2.loco_takeover_station
    WHEN 'ROHA' THEN 'LNL'   -- other leg is KR side, so this is SE side → LNL
    WHEN 'LNL'  THEN 'ROHA'  -- other leg is SE side, so this is KR side → ROHA
    WHEN 'IGP'  THEN 'ROHA'  -- (hypothetical NE+KR multi-leg)
    ELSE s2.loco_takeover_station
END
WHERE t.loco_change_station IS NOT NULL
  AND s1.loco_takeover_station = t.loco_change_station;

SET SQL_SAFE_UPDATES = 1;

-- ── Verification ────────────────────────────────────────────────────────────
-- SELECT t.train_no, s.sheet_source, s.segment_direction,
--        s.loco_takeover_station, s.loco_handover_station, s.event_time_takeover
-- FROM div_train_segments s
-- JOIN div_trains t ON t.train_id = s.train_id
-- WHERE t.train_no IN ('22149','22150')
-- ORDER BY t.train_no, s.sheet_source;
--
-- SELECT 'segments with handover populated' AS info,
--        SUM(loco_handover_station IS NOT NULL) AS populated,
--        SUM(loco_handover_station IS NULL) AS still_null,
--        COUNT(*) AS total
-- FROM div_train_segments;
