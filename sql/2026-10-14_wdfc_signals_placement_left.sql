-- WDFC JNPN-MPRN signals: placement Unknown -> Left (with the LHS flag to match).
--
-- The 407 WDFC signals were loaded from the DFCCIL chart, which does not show
-- sides (scripts/build-wdfc-signals.py: "arms/sides to be added"), so they had
-- placement='Unknown' and no side flag. Decision 2026-10-14: treat them all as
-- Left, the default side, so that no signal is left without a placement and
-- the editor / publish can refuse "Unknown" from now on. Individual signals
-- found to be on another side are corrected in the signal-book editor.
--
-- Run on local AND prod. Idempotent: re-running finds no Unknown rows.
--
-- Rollback:
--   UPDATE div_signals s JOIN div_signals_placement_bak_20261014 b ON b.id = s.id
--      SET s.placement = b.placement, s.is_rhs = b.is_rhs, s.is_ext_rhs = b.is_ext_rhs,
--          s.is_lhs = b.is_lhs, s.is_ext_lhs = b.is_ext_lhs;

CREATE TABLE IF NOT EXISTS div_signals_placement_bak_20261014 AS
SELECT id, signal_number, section, line, placement, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs
  FROM div_signals
 WHERE section = 'JNPN-MPRN' AND placement = 'Unknown';

UPDATE div_signals
   SET placement = 'Left', is_lhs = 1, is_rhs = 0, is_ext_rhs = 0, is_ext_lhs = 0
 WHERE section = 'JNPN-MPRN' AND placement = 'Unknown';

-- Expect 0 Unknown anywhere afterwards.
SELECT placement, COUNT(*) AS n FROM div_signals GROUP BY placement ORDER BY n DESC;
