-- KYN-KSRA NE loop-line / extra starters — parallel grouping
-- Date: 2026-06-24
--
-- Context: 14 loop-line / UDL / extra platform starters added to KYN-KSRA NE
--   (DN NE 63->70, UP NE 67->74) from data/KJT-KHPI/Loop-Str/LOOP STR.xlsx via
--   re-import of dnne_signals.xlsx / upne_signals.xlsx (runbook re-import path).
-- Each loop/extra starter sits at the same km as its platform-starter anchor on a
--   parallel track, so they share a parallel_group_id with the anchor. This lets
--   the JPO rule-1 adjacency walker treat anchor + loop as one position.
-- Idempotent: pure UPDATE by (section, line, signal_number). Re-run safe.
--
-- 12 groups (ids 1-12). parallel_group_id was previously unused (all NULL).

-- ---- DN NE groups ----
UPDATE div_signals SET parallel_group_id = 1
  WHERE section='KYN-KSRA' AND line='DN NE' AND signal_number IN ('TLA S-5','TLA S-6');
UPDATE div_signals SET parallel_group_id = 2
  WHERE section='KYN-KSRA' AND line='DN NE' AND signal_number IN ('KDV S-12','KDV S-11');
UPDATE div_signals SET parallel_group_id = 3
  WHERE section='KYN-KSRA' AND line='DN NE' AND signal_number IN ('VSD S-3','VSD S-4','VSD S-5');
UPDATE div_signals SET parallel_group_id = 4
  WHERE section='KYN-KSRA' AND line='DN NE' AND signal_number IN ('ASO S-7','ASO S-6');
UPDATE div_signals SET parallel_group_id = 5
  WHERE section='KYN-KSRA' AND line='DN NE' AND signal_number IN ('ATG S-12','ATG S-11');
UPDATE div_signals SET parallel_group_id = 6
  WHERE section='KYN-KSRA' AND line='DN NE' AND signal_number IN ('KE S-12','KE S-11');

-- ---- UP NE groups ----
UPDATE div_signals SET parallel_group_id = 7
  WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number IN ('KE S-18','KE S-19');
UPDATE div_signals SET parallel_group_id = 8
  WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number IN ('ATG S-18','ATG S-19');
UPDATE div_signals SET parallel_group_id = 9
  WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number IN ('ASO S-22','ASO S-24');
UPDATE div_signals SET parallel_group_id = 10
  WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number IN ('VSD S-39','VSD S-36','VSD S-37');
UPDATE div_signals SET parallel_group_id = 11
  WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number IN ('KDV S-18','KDV S-19');
UPDATE div_signals SET parallel_group_id = 12
  WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number IN ('TLA S-22','TLA S-20');
