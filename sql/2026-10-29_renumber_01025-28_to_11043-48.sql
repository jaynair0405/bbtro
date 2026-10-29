-- Renumbering of the LTT holiday specials into regular trains (Aug 2026)
--
--   01025 DR-BUI H/SPL  -> 11043 DR-BUI Tri Weekly   (first sheet entry 17 Aug)
--   01026 BUI-DR H/SPL  -> 11044 BUI-DR Tri Weekly
--   01027 DR-GKP H/SPL  -> 11047 DR-GKP              (first sheet entry 18 Aug)
--   01028 GKP-DR H/SPL  -> 11048 GKP-DR
--
-- The LPC added 11043/44/47/48 as new trains on 17 Aug, but the old rows were
-- never ended, so both numbers sat on the LTT sheets and some runs were logged
-- under the old number (mostly blank "TRAIN NO CHANGED" placeholders).
--
-- This file:
--   1. ends the old link rows the day before the new number started
--      (16 Aug; 17 Aug for 01027) and makes the old trains inactive;
--   2. deletes old-number sheet entries after that date that are placeholders
--      or duplicates of the new-number entry for the same day;
--   3. renumbers the 4 old-number entries that are the only record of a run;
--   4. renumbers the 8 loco-position rows written by those runs.
-- Everything up to the cut-off stays under 01025-28 (real special runs).
-- div_ctr_legs rows for 01025-28 are all May 2026 and are left alone.
--
-- Rows matched by id AND old train_no, so a re-run is a no-op.
-- Verified against PROD 2026-10-29. Local is older; fewer rows may match.

START TRANSACTION;

-- ---------------------------------------------------------------- backups
CREATE TABLE IF NOT EXISTS div_loco_link_log_bak_20261029_renum AS
SELECT * FROM div_loco_link_log
 WHERE id IN (19525,20589,21152,21438,25404,32132,
              19740,20206,25333,28571,
              18903,19118,19878,20367,20900,21523,22527,22975,25839,27889,28313,28578,29275,31823,
              18484,19080,19420,19816,20605,27825,28240,29244,29623,31346,
              18915);

CREATE TABLE IF NOT EXISTS div_loco_position_history_bak_20261029_renum AS
SELECT * FROM div_loco_position_history
 WHERE id IN (9267,8760,8765,8799,8859,9027,9062,9303);

CREATE TABLE IF NOT EXISTS div_loco_link_master_bak_20261029_renum AS
SELECT * FROM div_loco_link_master WHERE id IN (105,106,205,206);

CREATE TABLE IF NOT EXISTS div_trains_bak_20261029_renum AS
SELECT * FROM div_trains WHERE train_no IN ('01025','01026','01027','01028');

-- ------------------------------------------- 1. end the old trains
UPDATE div_loco_link_master SET effective_until = '2026-08-16' WHERE id = 205 AND train_no = '01025';
UPDATE div_loco_link_master SET effective_until = '2026-08-16' WHERE id = 106 AND train_no = '01026';
UPDATE div_loco_link_master SET effective_until = '2026-08-17' WHERE id = 206 AND train_no = '01027';
UPDATE div_loco_link_master SET effective_until = '2026-08-16' WHERE id = 105 AND train_no = '01028';

UPDATE div_trains SET is_active = 0 WHERE train_no IN ('01025','01026','01027','01028');

-- ------------------------------- 2. delete placeholders and duplicates
-- Old entry blank (or same loco) and the new number has that day's run.
DELETE FROM div_loco_link_log WHERE train_no = '01025'
   AND id IN (19525,20589,21152,21438,25404,32132);          -- 20589 = dup of 11043 22212
DELETE FROM div_loco_link_log WHERE train_no = '01026'
   AND id IN (19740,20206,25333,28571);
DELETE FROM div_loco_link_log WHERE train_no = '01027'
   AND id IN (19118,19878,20367,20900,21523,22527,22975,25839,27889,28313,28578,29275,31823);  -- 20900 = dup of 11047 32172
DELETE FROM div_loco_link_log WHERE train_no = '01028'
   AND id IN (18484,20605,27825,28240,29244,29623,31346);    -- 18484 blank under both numbers

-- 18 Aug: the run (loco 22314) is under 01027 and the 11047 row is blank.
-- Drop the blank 11047 row and renumber the real one, keeping all its loco fields.
DELETE FROM div_loco_link_log WHERE id = 18915 AND train_no = '11047' AND actual_loco_no IS NULL;

-- --------------------------------------------- 3. renumber the real runs
UPDATE div_loco_link_log
   SET train_no = '11047', train_no_snapshot = '11047', train_id = 593, master_id = 439
 WHERE id = 18903 AND train_no = '01027';

UPDATE div_loco_link_log
   SET train_no = '11048', train_no_snapshot = '11048', train_id = 594, master_id = 440
 WHERE id IN (19080,19420,19816) AND train_no = '01028';     -- 43637, 42177, 28147

-- ------------------------------------------ 4. loco position history
UPDATE div_loco_position_history SET train_no = '11044' WHERE id = 9267 AND train_no = '01026';
UPDATE div_loco_position_history SET train_no = '11047' WHERE id IN (8760,8765,8799) AND train_no = '01027';
UPDATE div_loco_position_history SET train_no = '11048' WHERE id IN (8859,9027,9062,9303) AND train_no = '01028';

-- ------------------------------------------------------------- verify
-- Expect: no old-number sheet entries after the cut-off; 4 link rows ended.
SELECT train_no, COUNT(*) AS after_cutoff FROM div_loco_link_log
 WHERE (train_no IN ('01025','01026','01028') AND working_date > '2026-08-16')
    OR (train_no = '01027' AND working_date > '2026-08-17')
 GROUP BY train_no;
SELECT id, train_no, effective_until FROM div_loco_link_master WHERE id IN (105,106,205,206);

COMMIT;

-- Rollback (after COMMIT):
--   restore rows from the four *_bak_20261029_renum tables
--   (DELETE the matching ids, INSERT ... SELECT * FROM the backup).
