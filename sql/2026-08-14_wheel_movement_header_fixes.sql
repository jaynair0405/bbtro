-- =====================================================================
-- Wheel-movement header fixes, and the remarks/relief markers that go
-- with them. Companion to 2026-08-14_plgn_gnpl_handover_correction.sql,
-- which fixed LEGS; this file fixes HEADERS whose legs were already right.
--
-- 309 / 310 — the stored wheel movements are swapped.
--
--   309  legs V13 (50) + V40 (49)                  =  99 = 1:39
--        stored                                            3:28   <- wrong
--   310  legs PL79 (80) + PL84 (79) + V31 (49)     = 208 = 3:28
--        stored                                            1:39   <- wrong
--
--   Each detail's sign-on/off fits its OWN legs (30 min prep, 15 min
--   after last arrival) and the PILOTING totals are already correct
--   (309 has none; 310's 0:49 is P/BR60 exactly). So nothing is
--   misfiled — only the two wheel-movement figures are crossed.
--
--   Confirmed against the book and against PROD: both databases hold the
--   identical arrangement, so this applies unchanged to both.
--
--   Deliberately NOT renumbering the details. That was considered — the
--   symptom looks like a swap — but 309 really is the 09:18 / V13 duty.
--   Renumbering would also silently rewrite 142 duty_roster rows across
--   71 dates, plus a reassignment_history row and two cycle_anchor refs.
--
-- 309's 4h55m gap at Vashi is genuine, not missing legs: V13 runs "To
-- SCS" and V40 "Ex SCS", so the rake stables at Sanpada car shed and the
-- crew waits for it — the same shape as detail 382's LPC standby.
--
-- 220 / 286 — the hours digit was typed wrong.
--
--   220  legs PL201 (80) + PL8  (79) = 159 = 2:39   stored 1:39
--   286  legs PL15  (80) + PL28 (79) = 159 = 2:39   stored 1:39
--
--   Both drift by exactly 60 minutes, both have exactly two legs, and in
--   both the legs match the book precisely — stations, times, all of it.
--   So it is the header alone: 2:39 entered as 1:39.
--
--   A scan for the same signature across the whole book found only these
--   two and 491 (-60, 3:45 stored against 2:45 of legs). 491 has five
--   legs, so it could equally be a missing leg — left alone pending its
--   book page rather than assumed.
--
-- Idempotent: absolute values, keyed on detail_number / train_number.
-- RUN ON BOTH DATABASES.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------- the swap
UPDATE details SET total_wheel_movement = '1:39' WHERE detail_number = '309';  -- was 3:28
UPDATE details SET total_wheel_movement = '3:28' WHERE detail_number = '310';  -- was 1:39

-- ------------------------------------------- the hours-digit typos
UPDATE details SET total_wheel_movement = '2:39' WHERE detail_number = '220';  -- was 1:39
UPDATE details SET total_wheel_movement = '2:39' WHERE detail_number = '286';  -- was 1:39

-- ------------------------------------- 309: the car-shed remarks
-- These are why the 4h55m gap exists; without them the duty reads as an
-- unexplained hole.
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.remarks = 'TO SCS'
 WHERE d.detail_number = '309' AND t.train_number = 'V13';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.remarks = 'EX SCS'
 WHERE d.detail_number = '309' AND t.train_number = 'V40';

-- --------------------------------------- 310: relief markers
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail = '360'
 WHERE d.detail_number = '310' AND t.train_number = 'PL79';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '504'
 WHERE d.detail_number = '310' AND t.train_number = 'PL84';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail = '357'
 WHERE d.detail_number = '310' AND t.train_number = 'V31';

-- --------------------------------- 220: the Panvel siding remarks
-- Same shape as 309's car shed: the rake stables overnight at Panvel
-- siding, which is why the duty has a 4h31m gap in the middle.
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.remarks = 'TO SDG'
 WHERE d.detail_number = '220' AND t.train_number = 'PL201';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.remarks = 'EX SDG'
 WHERE d.detail_number = '220' AND t.train_number = 'PL8';

-- --------------------------------------- 286: relief markers
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail = '214'
 WHERE d.detail_number = '286' AND t.train_number = 'PL15';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '252'
 WHERE d.detail_number = '286' AND t.train_number = 'PL28';

COMMIT;

-- =====================================================================
-- VERIFY
-- =====================================================================

SELECT '220, 286, 309, 310: legs must equal the stored wheel movement' AS chk;
-- NB the +24h wrap: 220's PL201 runs 22:58 -> 00:18 across midnight, and a
-- plain TIMEDIFF would report it as -22:40.
SELECT d.detail_number AS det, d.total_wheel_movement AS wm,
       SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(
         IF(t.end_time < t.start_time, ADDTIME(t.end_time,'24:00:00'), t.end_time),
         t.start_time)))) AS legs_hm,
       IF(SUM(TIME_TO_SEC(TIMEDIFF(
            IF(t.end_time < t.start_time, ADDTIME(t.end_time,'24:00:00'), t.end_time),
            t.start_time)))/60
          = SUBSTRING_INDEX(d.total_wheel_movement,':',1)*60
            + SUBSTRING_INDEX(d.total_wheel_movement,':',-1), 'MATCH', '** OFF **') AS verdict
  FROM details d
  JOIN trains t ON t.detail_id = d.detail_id AND t.train_type = 'working'
 WHERE d.detail_number IN ('220','286','309','310')
 GROUP BY d.detail_number, d.total_wheel_movement;

SELECT 'the remarks and markers' AS chk;
SELECT d.detail_number AS det, t.train_number, IFNULL(t.remarks,'-') AS remarks,
       IFNULL(t.rt_detail,'-') AS r_t, IFNULL(t.rb_detail,'-') AS r_b
  FROM details d JOIN trains t ON t.detail_id = d.detail_id
 WHERE d.detail_number IN ('220','286','309','310')
 ORDER BY CAST(d.detail_number AS UNSIGNED), t.start_time;

-- =====================================================================
-- ROLLBACK
--   UPDATE details SET total_wheel_movement='3:28' WHERE detail_number='309';
--   UPDATE details SET total_wheel_movement='1:39' WHERE detail_number='310';
--   ...and NULL the three markers and two remarks set above.
-- =====================================================================
