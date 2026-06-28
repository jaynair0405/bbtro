-- ============================================================================
-- Add VSH S-22 (PF-3 starter) on UP HB / CSMT-PNVL
-- Date : 2026-06-28
-- Why  : Vashi PF-3 starter, parallel to PF-4 (S-17) and PF-2 (S-19), all fed
--        from VSH S-30. It was missing from div_signals. Per the signal-book
--        renumbering it is old S-18 -> new S-22; the CSV and the CMS abnormality
--        log (event 394) already use the new number S-22, so it is added as such.
--        (PF-4/PF-2 still carry old S-17/S-19 in the data; full renumber to
--        S-23/S-21 to be done later in one pass.)
-- Attrs : mirrored from the parallel sibling VSH S-17 (UP HB) at km 29.255.
-- Idempotent: guarded by NOT EXISTS.
-- ============================================================================

INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name,
   section, `line`, direction, km_from_csmt, signal_type,
   placement, is_rhs, is_lhs, is_ext_rhs, is_ext_lhs,
   has_legend_board, has_calling_on, has_shunt_signal, visibility_distance_m, is_active)
SELECT 'VSH S-22', 'VSHS22', 'VSH', 'Vashi',
       'CSMT-PNVL', 'UP HB', 'UP', 29.255, 'Semi-Automatic',
       'Left', 0, 1, 0, 0,
       0, 0, 0, 250, 1
WHERE NOT EXISTS (
  SELECT 1 FROM div_signals
  WHERE signal_number = 'VSH S-22' AND section = 'CSMT-PNVL' AND `line` = 'UP HB'
);

-- Recompute seq_order (slots VSH S-22 next to S-17/S-19 at km 29.255).
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
