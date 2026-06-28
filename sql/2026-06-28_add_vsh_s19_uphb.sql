-- ============================================================================
-- Duplicate VSH S-19 (PF-2 starter) into UP HB / CSMT-PNVL
-- Date : 2026-06-28
-- Why  : VSH S-19 is the Vashi PF-2 starter. It exists in div_signals only on
--        DN THB (TUH-VSH) because the Trans-Harbour section ends there, but from
--        PF-2 a train also departs towards CSMT on UP HB (like PF-3/PF-4). Same
--        physical signal serving two routes -> one row per section (the same
--        model as RVJ S-7/S-8). This lets the UP HB parallel list (VSH S-30 ->
--        S-17/S-19) and AWS UP HB events resolve.
-- Attrs : mirrored from the parallel sibling VSH S-17 (UP HB) at km 29.255.
--         (placement/RHS-LHS copied from S-17 — verify per-platform if needed.)
-- Note  : numbering kept as VSH S-19 to match the CSV + the existing THB copy;
--         renumber both copies + CSV together later if required.
-- Idempotent: guarded by NOT EXISTS.
-- ============================================================================

INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name,
   section, `line`, direction, km_from_csmt, signal_type,
   placement, is_rhs, is_lhs, is_ext_rhs, is_ext_lhs,
   has_legend_board, has_calling_on, has_shunt_signal, visibility_distance_m, is_active)
SELECT 'VSH S-19', 'VSHS19', 'VSH', 'Vashi',
       'CSMT-PNVL', 'UP HB', 'UP', 29.255, 'Semi-Automatic',
       'Left', 0, 1, 0, 0,
       0, 0, 0, 250, 1
WHERE NOT EXISTS (
  SELECT 1 FROM div_signals
  WHERE signal_number = 'VSH S-19' AND section = 'CSMT-PNVL' AND `line` = 'UP HB'
);

-- Recompute seq_order (slots VSH S-19 next to S-17 at km 29.255).
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
UPDATE div_signals s JOIN ordered o ON o.id = s.id SET s.seq_order = o.rn;
