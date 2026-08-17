-- =====================================================================
-- PNVL trans-harbour + CSMT harbour corrections — details 276, 453, 461,
-- 463, 491. Third file of the 2026-08-14 detail-book correction set.
--
-- SOURCE
--   data/suburban-detail/New Panvel Detail from 15.12.2025 ver 2.pdf
--   read page by page. Note the book prints SIGN ON/OFF, DUTY, KMS and
--   NDH — it does NOT print wheel movement. total_wheel_movement is a
--   DERIVED column, which is exactly why it is a good cross-check: when
--   the legs are right it equals their sum, and 4 of these 5 details
--   prove that by landing on it to the minute.
--
-- WHAT EACH ONE WAS
--   276  header typo: wheel 3:30 entered as 6:30 (the hours digit again,
--        as with 220 and 286). Legs match the book exactly. 6:30 was also
--        impossible — it exceeded the 5:45 duty.
--   453  all FOUR working legs had wrong times, each compressed to ~18
--        minutes where the book gives 29-53. Header was right.
--   461  P/TPL50 was recorded as WORKING and running PNVL->TNA 16:26-17:20.
--        The book has it piloting, PNVL->NEU 16:26-16:49. Fixing it makes
--        BOTH stored figures land: working 163 = 2:43, piloting 23 = 0:23.
--        It also clears the detail's internal overlap with TNU46.
--        NB the train NUMBER also differs between databases: prod already
--        has 'P/TPL50', local was corrupted to 'T/TPL50' — the only 'T/'
--        prefixed row in the entire table. This file repairs local and is
--        a no-op on prod.
--   463  legs match the book exactly; the derived wheel movement was
--        wrong. 3:08 -> 2:16.
--   491  same. 3:45 -> 2:45 (hours digit).
--
-- Idempotent. RUN ON BOTH DATABASES.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------- 276
UPDATE details SET total_wheel_movement = '3:30' WHERE detail_number = '276';  -- was 6:30

-- ---------------------------------------------------------------- 453
-- Four working legs, all with compressed times. Header (2:44 / 0:55) was right.
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_time='08:01:00', t.end_time='08:31:00', t.rb_detail='462'
 WHERE d.detail_number='453' AND t.train_number='TNU8';        -- was 08:20 -> 08:38

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_time='08:41:00', t.end_time='09:33:00'
 WHERE d.detail_number='453' AND t.train_number='TPL11';       -- was 08:55 -> 09:13

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_time='11:02:00', t.end_time='11:55:00', t.rt_detail='473', t.rb_detail='509'
 WHERE d.detail_number='453' AND t.train_number='TPL32';       -- was 09:22 -> 09:40

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_time='12:06:00', t.end_time='12:35:00', t.rt_detail='469'
 WHERE d.detail_number='453' AND t.train_number='TV47';        -- was 09:55 -> 10:13

-- ---------------------------------------------------------------- 461
-- The one leg that was wrong in three ways at once: number (local only),
-- type, and destination.
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.train_number='P/TPL50', t.train_type='piloting',
       t.end_station='NEU', t.end_time='16:49:00'
 WHERE d.detail_number='461' AND t.train_number IN ('T/TPL50','P/TPL50');
                                       -- was working, PNVL 16:26 -> TNA 17:20
-- NB: the book page shows "R/TO 510" on the line beneath P/TPL50, but it is
-- NOT set here. Relief cannot sit on a piloting leg — the rule is enforced by
-- trg_trains_relief_working_ins, which rejected the write when first attempted.
-- In the PDF the markers sit BETWEEN two rows, so the extracted text cannot say
-- whether a marker belongs to the leg above or the working leg below. Left for
-- the user to place. Same situation on 463 (R/TO 502 by P/TPL10) and 491
-- (R/TO 515 by P/PL128).

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail='501'
 WHERE d.detail_number='461' AND t.train_number='TNU46';

-- ---------------------------------------------------------------- 463
UPDATE details SET total_wheel_movement = '2:16' WHERE detail_number = '463';  -- was 3:08

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = CASE t.train_number
         WHEN 'TPL9' THEN '487' WHEN 'TPL28' THEN '464'
         ELSE t.rt_detail END,
       t.rb_detail = CASE t.train_number
         WHEN 'TNU4' THEN '492' WHEN 'TPL9' THEN '459'
         ELSE t.rb_detail END,
       t.remarks = IF(t.train_number='TPL28','TO SDG', t.remarks)
 WHERE d.detail_number='463';

-- ---------------------------------------------------------------- 491
UPDATE details SET total_wheel_movement = '2:45' WHERE detail_number = '491';  -- was 3:45

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = CASE t.train_number
         WHEN 'TNU53' THEN '510' WHEN 'TNU58' THEN '531'
         WHEN 'TPL57'   THEN '505' WHEN 'ERTPL65' THEN '456'
         ELSE t.rt_detail END,
       t.rb_detail = CASE t.train_number
         WHEN 'TV82' THEN '523' WHEN 'TNU53' THEN '465' WHEN 'TNU58' THEN '486'
         WHEN 'TPL57' THEN '461'
         ELSE t.rb_detail END,
       t.remarks = IF(t.train_number='ERTPL65','TO SCS', t.remarks)
 WHERE d.detail_number='491';

COMMIT;

-- =====================================================================
-- VERIFY — working legs must equal total_wheel_movement, and for 461 the
-- piloting legs must equal total_piloting too.
-- =====================================================================

SELECT '276, 453, 461, 463, 491 — wheel movement' AS chk;
SELECT d.detail_number AS det, d.total_wheel_movement AS wm,
       SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(
         IF(t.end_time<t.start_time,ADDTIME(t.end_time,'24:00:00'),t.end_time),
         t.start_time)))) AS legs_hm,
       IF(SUM(TIME_TO_SEC(TIMEDIFF(
            IF(t.end_time<t.start_time,ADDTIME(t.end_time,'24:00:00'),t.end_time),
            t.start_time)))/60
          = SUBSTRING_INDEX(d.total_wheel_movement,':',1)*60
            + SUBSTRING_INDEX(d.total_wheel_movement,':',-1),'MATCH','** OFF **') AS verdict
  FROM details d
  JOIN trains t ON t.detail_id=d.detail_id AND t.train_type='working' AND t.start_time<>t.end_time
 WHERE d.detail_number IN ('276','453','461','463','491')
 GROUP BY d.detail_number, d.total_wheel_movement
 ORDER BY CAST(d.detail_number AS UNSIGNED);

SELECT '461 — piloting must now be 0:23' AS chk;
SELECT d.detail_number AS det, d.total_piloting AS pil,
       SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(t.end_time,t.start_time)))) AS pilot_legs
  FROM details d JOIN trains t ON t.detail_id=d.detail_id AND t.train_type='piloting'
 WHERE d.detail_number='461' GROUP BY d.detail_number, d.total_piloting;

SELECT 'no T/ prefixed rows remain (local repair)' AS chk;
SELECT COUNT(*) AS t_prefixed FROM trains WHERE train_number LIKE 'T/%';

-- =====================================================================
-- ROLLBACK — previous values are in the comment on each statement.
-- =====================================================================
