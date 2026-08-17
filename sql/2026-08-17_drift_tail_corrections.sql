-- =====================================================================
-- The tail of the wheel-movement drift — details 79, 88, 283, 335.
-- Fifth and final file of the detail-book correction set.
--
-- None of these is a PLGN/GNPL handover. Two shapes:
--
--   79, 88   ONE wrong arrival time each. Headers were right, and both
--            confirm on wheel movement AND piloting:
--              79  A 59  ABH 00:30 -> 00:50  (+20) => working 148 = 2:28,
--                                                     piloting  56 = 0:56
--              88  A 28  CSMT 12:21 -> 12:48 (+27) => working 240 = 4:00,
--                                                     piloting  44 = 0:44
--
--   283, 335 legs already match the book exactly; the DERIVED wheel
--            movement was wrong.
--              283  2:07 -> 2:39   (legs PL203 80 + PL10 79 = 159)
--              335  3:58 -> 3:41   (legs 31+31+80+79 = 221)
--
-- 335's PL105 times (13:30 -> 14:50) were confirmed correct by the user,
-- so the 17-minute gap is the header, not a missing leg — despite the
-- 2h14 hole between B30 arriving CSMT 11:16 and PL105 departing 13:30.
--
-- Worth recording from 79: A 4 ends TNA 04:54 and P/A 4 starts TNA 04:54
-- — the SAME train. The crew stops working it at Thane and rides on as
-- passengers. That is why a piloting leg shares a working leg's number,
-- and why zero-gap "overlaps" of that kind are legitimate.
--
-- Idempotent. RUN ON BOTH DATABASES.
-- =====================================================================

START TRANSACTION;

-- ----------------------------------------------------------------- 79
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_time='00:50:00', t.remarks='TO SDG'
 WHERE d.detail_number='79' AND t.train_number='A 59';        -- was ABH 00:30

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail='78', t.remarks='EX ABH SDG'
 WHERE d.detail_number='79' AND t.train_number='A 4';

-- ----------------------------------------------------------------- 88
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_time='12:48:00'
 WHERE d.detail_number='88' AND t.train_number='A 28';        -- was CSMT 12:21

-- ---------------------------------------------------------------- 283
UPDATE details SET total_wheel_movement='2:39' WHERE detail_number='283';  -- was 2:07

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.remarks='EX SDG'
 WHERE d.detail_number='283' AND t.train_number='PL10';

-- ---------------------------------------------------------------- 335
UPDATE details SET total_wheel_movement='3:41' WHERE detail_number='335';  -- was 3:58

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail='356'
 WHERE d.detail_number='335' AND t.train_number='PL105';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail='242'
 WHERE d.detail_number='335' AND t.train_number='PL110';

COMMIT;

-- =====================================================================
-- VERIFY
-- =====================================================================

SELECT '79, 88, 283, 335 — wheel movement' AS chk;
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
 WHERE d.detail_number IN ('79','88','283','335')
 GROUP BY d.detail_number, d.total_wheel_movement
 ORDER BY CAST(d.detail_number AS UNSIGNED);

SELECT '79 and 88 — piloting must match too' AS chk;
SELECT d.detail_number AS det, d.total_piloting AS pil,
       SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(t.end_time,t.start_time)))) AS pilot_legs
  FROM details d JOIN trains t ON t.detail_id=d.detail_id AND t.train_type='piloting'
 WHERE d.detail_number IN ('79','88') GROUP BY d.detail_number, d.total_piloting;

SELECT 'wheel-movement drift > 15 min across the whole book' AS chk;
SELECT COUNT(*) AS drifting FROM (
  SELECT d.detail_number FROM details d
    JOIN trains t ON t.detail_id=d.detail_id AND t.train_type='working' AND t.start_time<>t.end_time
   WHERE d.total_wheel_movement REGEXP '^[0-9]+:[0-9]+$'
   GROUP BY d.detail_number, d.total_wheel_movement
  HAVING ABS(SUM(TIME_TO_SEC(TIMEDIFF(
             IF(t.end_time<t.start_time,ADDTIME(t.end_time,'24:00:00'),t.end_time),
             t.start_time))/60)
           - (SUBSTRING_INDEX(d.total_wheel_movement,':',1)*60
              + SUBSTRING_INDEX(d.total_wheel_movement,':',-1))) > 15) f;

-- =====================================================================
-- ROLLBACK — previous values are in the comment on each statement.
-- =====================================================================

-- =====================================================================
-- ADDENDUM — detail 500, the last drifting detail in the book.
--   Book (New Panvel Detail ver 2, page for 500):
--     TPL 48   PNVL 16:14 -> TNA 17:08   R/TO 517  R/BY 465
--     TPL 43   TNA 17:23 -> PNVL 18:15   R/TO 514  R/BY 535
--     P/PLGN17 PNVL 19:35 -> VSH 20:05   (piloting)
--     TV 104   VSH 20:50 -> TNA 21:19    R/TO 486
--     TNU 67   TNA 21:30 -> NEU 22:02    R/BY 496
--     P/PL 189 NEU 22:40 -> PNVL 23:02   (piloting)
--   TPL48 was stored arriving 17:09; the book gives 17:08. Working legs
--   then total 54+52+29+32 = 167 = 2:47, against a stored 3:09.
--   Piloting (30+22 = 0:52) already matched and is untouched.
-- =====================================================================

START TRANSACTION;

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_time='17:08:00', t.rt_detail='517', t.rb_detail='465'
 WHERE d.detail_number='500' AND t.train_number='TPL48';      -- was TNA 17:09

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail='514', t.rb_detail='535'
 WHERE d.detail_number='500' AND t.train_number='TPL43';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail='486'
 WHERE d.detail_number='500' AND t.train_number='TV104';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail='496'
 WHERE d.detail_number='500' AND t.train_number='TNU67';

UPDATE details SET total_wheel_movement='2:47' WHERE detail_number='500';  -- was 3:09

COMMIT;

SELECT '500 — wheel movement and piloting' AS chk;
SELECT d.detail_number AS det, d.total_wheel_movement AS wm, d.total_piloting AS pil,
       SEC_TO_TIME(SUM(IF(t.train_type='working',  TIME_TO_SEC(TIMEDIFF(t.end_time,t.start_time)),0))) AS working_hm,
       SEC_TO_TIME(SUM(IF(t.train_type='piloting', TIME_TO_SEC(TIMEDIFF(t.end_time,t.start_time)),0))) AS piloting_hm
  FROM details d JOIN trains t ON t.detail_id=d.detail_id
 WHERE d.detail_number='500' GROUP BY d.detail_number, d.total_wheel_movement, d.total_piloting;
