-- Add missing signal DCC S-5 — the diverging signal on the DW (Diva) -> PNVL route,
-- between the Diva departure starters (DW S-15/16/19/23/24) and GATE-1 -> PNVL.
-- It exists on no current book section (DW-BSR goes via DCC S-8; the PNVL trunk via
-- DCC S-20/S-4), so it is added to div_signals only and referenced by the DW-PNVL
-- route composer. Additive; local first, then prod. Details handed over by Jayakumar.
INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name, section, line,
   direction, location_text, km_text, km_from_csmt, signal_type, signal_function,
   placement, on_curve, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs,
   has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms,
   visibility_distance_m, is_active)
VALUES
  ('DCC S-5', 'DCCS5', 'DCC', 'Dativali', 'PNVL-DW', 'DN ML',
   'DN', '43/26', '43/26', 43.262, 'Semi-Automatic', NULL,
   'Left', 'Right', 0, 0, 1, 0,
   0, 1, 0, 0, 0,
   200, 1);

-- magnet_id left NULL (importer does not set it); recompute via the magnet backfill
-- when the next backfill runs. Route composer references DCC S-5 by number, not id.
SELECT id, signal_number, section, line, direction, on_curve, is_lhs, has_calling_on, visibility_distance_m
FROM div_signals WHERE signal_number = 'DCC S-5';
