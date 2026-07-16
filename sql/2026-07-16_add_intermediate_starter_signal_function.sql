-- Add 'Intermediate Starter' to div_signals.signal_function enum.
-- Date: 2026-07-16
-- The IGP-MMR (UP) master has 2 signals with function 'Intermediate Starter'
-- (LS S-27, NK S-55) — a legitimate IR signalling term not yet in the enum, which
-- caused a "Data truncated" failure on import. Additive change: existing rows and
-- the NULL default are unaffected. Deploy to prod before importing IGP-MMR there.

ALTER TABLE div_signals
  MODIFY signal_function ENUM(
    'Double Distant','Distant','Inner Distant','Home','Inner Home',
    'Starter','Starter (Loop)','Advance Starter','Advanced Starter',
    'IBS','IBS Distant','Gate Distant','Repeater','Other',
    'Intermediate Starter'
  ) DEFAULT NULL;
