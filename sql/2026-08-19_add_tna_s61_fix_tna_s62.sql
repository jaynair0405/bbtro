-- Add missing TNA S-61 (PF-10 starter, Thane) for the TNA-VSH route, and correct
-- TNA S-62 (PF-9) placement to the right. Additive/idempotent-ish; local then prod.
INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name, section, line,
   direction, location_text, km_from_csmt, signal_type, signal_function,
   placement, on_curve, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs,
   has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, is_active)
VALUES
  ('TNA S-61', 'TNAS61', 'TNA', 'Thane', 'TNA-VSH', 'THB',
   'DN', 'PF-10 STR', 33.023, 'Semi-Automatic', NULL,
   'Left', 'Unknown', 0, 0, 1, 0,
   0, 0, 1, 0, 0, 1);

-- Correct PF-9 starter placement (it sits on the right).
UPDATE div_signals SET is_rhs = 1, placement = 'Right' WHERE signal_number = 'TNA S-62';

SELECT signal_number, section, line, location_text, placement, is_rhs, is_lhs, has_shunt_signal
FROM div_signals WHERE signal_number IN ('TNA S-61','TNA S-62') ORDER BY signal_number;
