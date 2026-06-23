-- ============================================================================
-- Add RVJ S-15 (Wadala Road, CSMT-PNVL, DN HB)
-- Date    : 2026-06-23
-- Why     : RVJ S-15 was missing from div_signals. It is the no-diversion route
--           hop from the VDLR platform starters:
--             VDLR PF2  S-7 -> S-15 -> S-22 -> PNVL
--             VDLR PF3  S-8 -> S-15 -> S-22 -> PNVL
--           (Diversion route S-7/S-8 -> S-21 stays on VDLR-GMN.)
--           Its successor edges (S-7/S-8 -> S-15, S-15 -> S-22) already exist in
--           div_signal_successors but sat unresolved with the signal absent.
-- After   : re-run scripts/import-signal-successors.js (section-aware resolver)
--           to link the chain to the CSMT-PNVL copies of S-7/S-8.
-- Idempotent: INSERT guarded by NOT EXISTS; seq_order recompute is re-runnable.
-- ============================================================================

INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name,
   section, `line`, direction, km_from_csmt, signal_type,
   placement, is_rhs, is_lhs,
   has_legend_board, has_calling_on, has_shunt_signal,
   ri_left_arms, ri_right_arms, visibility_distance_m, is_active)
SELECT 'RVJ S-15', 'RVJS15', 'VDLR', 'Wadala road',
       'CSMT-PNVL', 'DN HB', 'DN', 9.726, 'Semi-Automatic',
       'Right', 1, 0,
       0, 0, 0,
       0, 0, 300, 1
WHERE NOT EXISTS (
  SELECT 1 FROM div_signals
  WHERE signal_number = 'RVJ S-15' AND section = 'CSMT-PNVL' AND `line` = 'DN HB'
);

-- Recompute seq_order so S-15 slots between S-9 (km 9.636) and S-22 (km 10.191).
-- Same logic as 2026-06-05_aws_signal_succession.sql: running order in the
-- direction of travel (DN = km ASC, UP = km DESC), NULL km last.
UPDATE div_signals SET seq_order = NULL;

WITH ordered AS (
    SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY section, `line`, direction
            ORDER BY
                CASE WHEN km_from_csmt IS NULL THEN 1 ELSE 0 END,
                CASE WHEN direction = 'DN' THEN km_from_csmt ELSE -km_from_csmt END,
                normalized_signal_number
        ) AS rn
    FROM div_signals
    WHERE direction IN ('UP','DN')
)
UPDATE div_signals s
JOIN ordered o ON o.id = s.id
SET s.seq_order = o.rn;
