-- 2026-09-11 — restore coach type on two scheduled specials wiped by an edit
--
-- WHY
-- Until fba3de9 the Scheduled Specials list query did not return rake_type,
-- so the edit modal opened with Coach Type blank and saving wrote NULL. On
-- prod 16 active specials had rake_type NULL; div_trains held nothing for any
-- of them. Fourteen are blank in BOTH directions of their pair, which reads
-- as never entered, not wiped — the LPC enters those in Settings when known.
-- Two have a partner that still carries a value, so those are restored from
-- the partner:
--   483  09124 VS-RN Ganpati SPL   <- 484 09123 RN-VS Ganpati SPL   ICF
--   421  04104 PNVL-SFG EXP        <- 420 04103 SFG-PNVL EXP        LHB
-- Set by id and guarded on train_no, so a DB without these rows (local) is a
-- no-op and a re-run changes nothing.

-- Step 1 — preview.
SELECT id, train_no, train_name, rake_type
FROM div_loco_link_master
WHERE id IN (421, 483) AND train_no IN ('04104', '09124');

-- Step 2 — restore.
UPDATE div_loco_link_master
SET rake_type = CASE id WHEN 483 THEN 'ICF' WHEN 421 THEN 'LHB' END
WHERE id IN (421, 483) AND train_no IN ('04104', '09124') AND rake_type IS NULL;

-- Step 3 — verify. Expect ICF on 483 and LHB on 421.
SELECT id, train_no, train_name, rake_type
FROM div_loco_link_master
WHERE id IN (421, 483) AND train_no IN ('04104', '09124');

-- Rollback:
-- UPDATE div_loco_link_master SET rake_type = NULL
-- WHERE id IN (421, 483) AND train_no IN ('04104', '09124');
