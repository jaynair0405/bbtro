-- Add missing NEU S-32 (PF-2 starter, Nerul) — the trans-harbour departure toward
-- Panvel, between NEU S-31 (PF-1) and NEU S-41. One right route-indicator arm to
-- NEU S-41. Referenced by the TNA-PNVL route composer. Additive; local then prod.
INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name, section, line,
   direction, location_text, km_from_csmt, signal_type, signal_function,
   placement, on_curve, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs,
   has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms,
   book_description, route_indicator_notes, visibility_distance_m, is_active)
VALUES
  ('NEU S-32', 'NEUS32', 'NEU', 'Nerul', 'TNA-NEU', 'THB',
   'DN', 'PF-2 STR', 53.1975, 'Semi-Automatic', NULL,
   'Left', 'Unknown', 0, 0, 1, 0,
   0, 1, 0, 0, 1,
   'RI: R1= NEU S-41', 'Book shows one right arm on top of vertical stem', 280, 1);

SELECT id, signal_number, section, location_text, ri_right_arms, book_description, has_calling_on, visibility_distance_m
FROM div_signals WHERE signal_number = 'NEU S-32';
