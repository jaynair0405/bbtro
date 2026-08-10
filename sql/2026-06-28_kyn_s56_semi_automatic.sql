-- KYN S-56 / S-81 / S-82 / S-84: correct signal_type Manual -> Semi-Automatic
-- Date: 2026-06-28
--
-- User correction (KYN junction starters). Affected records:
--   KYN S-56  PF-4 starter — stored once per DN line (DN TH/NE/SE). DN TH was
--             already Semi-Automatic; DN NE (KYN-KSRA) + DN SE (KYN-KJT) were Manual.
--   KYN S-81  KYN-KJT / UP SE  (Manual)
--   KYN S-82  KYN-KJT / DN SE  (Manual)
--   KYN S-84  KYN-KJT / UP SE  (Manual)
-- Source spines/masters updated to match (dnne_signals.xlsx, kyn_ksra_master.xlsx,
-- dnse_signals.xlsx, upse_signals.xlsx, kyn_kjt_master.xlsx) so a re-import won't revert.
-- Idempotent: only rows still Manual are touched; re-run is a no-op.

-- Audit trail (one row per record actually changed)
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
SELECT id, 'Type Changed', 'Manual', 'Semi-Automatic', '2026-06-28',
       CONCAT(signal_number, ' on ', section, '/', `line`, ' corrected to Semi-Automatic')
  FROM div_signals
 WHERE signal_number IN ('KYN S-56','KYN S-81','KYN S-82','KYN S-84')
   AND signal_type = 'Manual';

UPDATE div_signals
   SET signal_type = 'Semi-Automatic'
 WHERE signal_number IN ('KYN S-56','KYN S-81','KYN S-82','KYN S-84')
   AND signal_type = 'Manual';
