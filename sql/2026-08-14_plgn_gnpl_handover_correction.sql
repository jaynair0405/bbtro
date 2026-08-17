-- =====================================================================
-- PLGN / GNPL handover correction — 21 legs, 1 header, ~60 relief markers.
--
-- THE FAULT
--   The Panvel-Goregaon services (PLGN* down, GNPL* up) run via VDLR, and
--   the crew CHANGES there. One side of each handover was recorded as the
--   WHOLE TRAIN RUN instead of that crew's actual portion — almost always
--   ending "CSMT", which these trains never reach at all.
--
--   e.g. PLGN1 was recorded twice:
--        304  PNVL 05:57 -> VDLR 06:58   correct (entered 2026-08-04, R/B 207)
--        207  PNVL 05:57 -> CSMT 07:39   the whole run, never trimmed
--   so 207 claimed 102 minutes of running its crew never did.
--
-- HOW EACH CORRECTION WAS VERIFIED
--   Every affected detail was read line-by-line off the book, and in EVERY
--   case the corrected legs sum exactly to the detail's stored
--   total_wheel_movement. 18 details, 18 independent confirmations, no
--   fudging. 17 had a right header and wrong legs; exactly one (257) had
--   right legs and a wrong header.
--
--   Detail 248's B5 destination is corroborated a third way:
--   suburban_train_master train_code 98805 is CSMTH -> BA, not PNVL.
--
-- SIDE EFFECT
--   329's GNPL6 was also the sole "leg runs after sign-off" defect
--   (12:14-14:04 against a sign-off of 11:07). The book has it 09:30-10:10.
--   One fault, not two.
--
-- SAFETY
--   Idempotent: every UPDATE is keyed on (detail_number, train_number) and
--   sets absolute values, so a re-run is a no-op. Wrapped in a transaction.
--   All 39 target legs are train_type='working', so the relief triggers
--   (trg_trains_relief_working_ins/_upd) cannot reject them.
--
-- RUN ON BOTH DATABASES. Local and prod have diverged once already.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- A. LEG CORRECTIONS
--    Previous value in the comment on each line, for rollback.
-- ---------------------------------------------------------------------

-- 207  PLGN1   was PNVL 05:57 -> CSMT 07:39   (drift +65 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_station='VDLR', t.start_time='07:02:00',
       t.end_station='GMN',   t.end_time='07:39:00'
 WHERE d.detail_number='207' AND t.train_number='PLGN1';

-- 209  GNPL12  was GMN 18:55 -> CSMT 20:46    (drift +48 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_station='VDLR', t.start_time='19:43:00',
       t.end_station='PNVL',  t.end_time='20:46:00'
 WHERE d.detail_number='209' AND t.train_number='GNPL12';

-- 214  PLGN3   was PNVL 06:53 -> CSMT 08:43   (drift +49 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='07:54:00'
 WHERE d.detail_number='214' AND t.train_number='PLGN3';

-- 215  PLGN7   was PNVL 10:37 -> CSMT 12:19   (drift +40 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='11:39:00'
 WHERE d.detail_number='215' AND t.train_number='PLGN7';

-- 227  PLGN5   was PNVL 07:39 -> CSMT 09:22   (drift +42 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='08:40:00'
 WHERE d.detail_number='227' AND t.train_number='PLGN5';

-- 242  PLGN13  was VDLR 17:29 -> GMN 19:14    (start time only)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_time='18:37:00'
 WHERE d.detail_number='242' AND t.train_number='PLGN13';

-- 242  GNPL14  was GMN 19:40 -> VDLR 21:29    (both legs: drift +139 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_time='20:18:00'
 WHERE d.detail_number='242' AND t.train_number='GNPL14';

-- 246  PLGN9   was PNVL 16:34 -> CSMT 18:18   (drift +42 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='17:36:00'
 WHERE d.detail_number='246' AND t.train_number='PLGN9';

-- 248  B5      was CSMT 05:33 -> PNVL 06:02   (wrong destination; master says BA)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='BA'
 WHERE d.detail_number='248' AND t.train_number='B5';

-- 248  GN17    was CSMT 07:36 -> GMN 08:30    (one minute out)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_time='08:31:00'
 WHERE d.detail_number='248' AND t.train_number='GN17';

-- 248  GNPL4   was GMN 08:39 -> CSMT 10:22    (three fixes total: drift +64 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='09:17:00'
 WHERE d.detail_number='248' AND t.train_number='GNPL4';

-- 293  PLGN9   was PNVL 16:34 -> CSMT 18:18   (both legs: drift +134 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_station='VDLR', t.start_time='17:41:00',
       t.end_station='GMN',    t.end_time='18:18:00'
 WHERE d.detail_number='293' AND t.train_number='PLGN9';

-- 293  GNPL10  was GMN 18:27 -> CSMT 20:13
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='19:06:00'
 WHERE d.detail_number='293' AND t.train_number='GNPL10';

-- 296  PLGN15  was PNVL 18:33 -> CSMT 20:16   (drift +41 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='19:35:00'
 WHERE d.detail_number='296' AND t.train_number='PLGN15';

-- 297  GNPL14  was GMN 19:40 -> CSMT 21:29    (drift +46 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_station='VDLR', t.start_time='20:26:00',
       t.end_station='PNVL',   t.end_time='21:29:00'
 WHERE d.detail_number='297' AND t.train_number='GNPL14';

-- 323  GNPL16  was GMN 20:12 -> CSMT 22:05    (drift +69 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='20:56:00'
 WHERE d.detail_number='323' AND t.train_number='GNPL16';

-- 326  GNPL2   was GMN 07:30 -> CSMT 09:12    (drift +40 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_station='VDLR', t.start_time='08:10:00',
       t.end_station='PNVL',   t.end_time='09:12:00'
 WHERE d.detail_number='326' AND t.train_number='GNPL2';

-- 329  PLGN5   was PNVL 07:39 -> CSMT 09:22   (both legs: drift +136 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_station='VDLR', t.start_time='08:45:00',
       t.end_station='GMN',    t.end_time='09:22:00'
 WHERE d.detail_number='329' AND t.train_number='PLGN5';

-- 329  GNPL6   was GMN 12:14 -> CSMT 14:04    (also the leg-after-sign-off defect)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_time='09:30:00', t.end_station='VDLR', t.end_time='10:10:00'
 WHERE d.detail_number='329' AND t.train_number='GNPL6';

-- 350  GNPL2   was GMN 07:30 -> CSMT 09:12    (drift +66 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='08:06:00'
 WHERE d.detail_number='350' AND t.train_number='GNPL2';

-- 384  PLGN13  was PNVL 17:29 -> CSMT 19:14   (drift +42 -> 0)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station='VDLR', t.end_time='18:32:00'
 WHERE d.detail_number='384' AND t.train_number='PLGN13';

-- ---------------------------------------------------------------------
-- B. HEADER CORRECTION
--    The only detail whose LEGS were right and whose header was wrong.
--    Its legs sum to 227 min; duty arithmetic agrees:
--    06:47->13:30 = 403 = wheel 227 + piloting 18 + gaps 158.
-- ---------------------------------------------------------------------

-- 257  total_wheel_movement was 2:54
UPDATE details SET total_wheel_movement='3:47' WHERE detail_number='257';

-- ---------------------------------------------------------------------
-- C. RELIEF MARKERS, from the book pages.
--    R/T = this detail gives relief to the named detail, at the leg START.
--    R/B = the named detail takes over from us, at the leg END.
--    Note 279 and 304 needed markers but NO leg change — their times were
--    already right, so the relief gap is wider than the audit can see.
-- ---------------------------------------------------------------------

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = CASE
         WHEN d.detail_number='207' AND t.train_number='PLGN1'  THEN '304'
         WHEN d.detail_number='209' AND t.train_number='GNPL12' THEN '279'
         WHEN d.detail_number='209' AND t.train_number='PL178'  THEN '247'
         WHEN d.detail_number='214' AND t.train_number='PLGN3'  THEN '286'
         WHEN d.detail_number='215' AND t.train_number='PLGN7'  THEN '387'
         WHEN d.detail_number='215' AND t.train_number='GN41'   THEN '229'
         WHEN d.detail_number='227' AND t.train_number='PLGN5'  THEN '294'
         WHEN d.detail_number='242' AND t.train_number='PLGN13' THEN '384'
         WHEN d.detail_number='242' AND t.train_number='GNPL14' THEN '225'
         WHEN d.detail_number='246' AND t.train_number='PLGN9'  THEN '365'
         WHEN d.detail_number='257' AND t.train_number='PLGN3'  THEN '214'
         WHEN d.detail_number='279' AND t.train_number='PL104'  THEN '258'
         WHEN d.detail_number='279' AND t.train_number='PLGN11' THEN '365'
         WHEN d.detail_number='293' AND t.train_number='PLGN9'  THEN '246'
         WHEN d.detail_number='296' AND t.train_number='V36'    THEN '278'
         WHEN d.detail_number='296' AND t.train_number='PL141'  THEN '238'
         WHEN d.detail_number='296' AND t.train_number='PLGN15' THEN '201'
         WHEN d.detail_number='297' AND t.train_number='GNPL14' THEN '242'
         WHEN d.detail_number='297' AND t.train_number='PL188'  THEN '280'
         WHEN d.detail_number='326' AND t.train_number='GNPL2'  THEN '350'
         WHEN d.detail_number='326' AND t.train_number='PLVD16' THEN '377'
         WHEN d.detail_number='329' AND t.train_number='PLGN5'  THEN '227'
         WHEN d.detail_number='350' AND t.train_number='GNPL2'  THEN '376'
         WHEN d.detail_number='384' AND t.train_number='PLGN13' THEN '230'
         ELSE t.rt_detail END,
       t.rb_detail = CASE
         WHEN d.detail_number='209' AND t.train_number='GNPL12' THEN '311'
         WHEN d.detail_number='214' AND t.train_number='PL11'   THEN '202'
         WHEN d.detail_number='214' AND t.train_number='PLGN3'  THEN '257'
         WHEN d.detail_number='215' AND t.train_number='PL51'   THEN '334'
         WHEN d.detail_number='215' AND t.train_number='PLGN7'  THEN '233'
         WHEN d.detail_number='227' AND t.train_number='PL21'   THEN '333'
         WHEN d.detail_number='227' AND t.train_number='PLGN5'  THEN '329'
         WHEN d.detail_number='242' AND t.train_number='PLGN13' THEN '315'
         WHEN d.detail_number='242' AND t.train_number='GNPL14' THEN '297'
         WHEN d.detail_number='246' AND t.train_number='PL117'  THEN '242'
         WHEN d.detail_number='246' AND t.train_number='PLGN9'  THEN '293'
         WHEN d.detail_number='248' AND t.train_number='GNPL4'  THEN '401'
         WHEN d.detail_number='279' AND t.train_number='PL99'   THEN '299'
         WHEN d.detail_number='279' AND t.train_number='GNPL12' THEN '209'
         WHEN d.detail_number='293' AND t.train_number='GNPL10' THEN '400'
         WHEN d.detail_number='293' AND t.train_number='PL181'  THEN '539'
         WHEN d.detail_number='293' AND t.train_number='PL194'  THEN '255'
         WHEN d.detail_number='296' AND t.train_number='PLGN15' THEN '272'
         WHEN d.detail_number='297' AND t.train_number='GNPL14' THEN '285'
         WHEN d.detail_number='323' AND t.train_number='GNPL16' THEN '280'
         WHEN d.detail_number='326' AND t.train_number='GNPL2'  THEN '390'
         WHEN d.detail_number='326' AND t.train_number='PLVD16' THEN '369'
         WHEN d.detail_number='329' AND t.train_number='GNPL6'  THEN '386'
         WHEN d.detail_number='350' AND t.train_number='GN11'   THEN '395'
         WHEN d.detail_number='350' AND t.train_number='GNPL2'  THEN '326'
         WHEN d.detail_number='384' AND t.train_number='PLGN13' THEN '242'
         ELSE t.rb_detail END
 WHERE t.train_type = 'working'
   AND d.detail_number IN ('207','209','214','215','227','242','246','248','257',
                           '279','293','296','297','323','326','329','350','384');

COMMIT;

-- =====================================================================
-- VERIFY
-- =====================================================================

SELECT '1. every corrected detail: legs must equal the stored wheel movement' AS chk;
SELECT d.detail_number AS det, d.total_wheel_movement AS book_wm,
       SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(
         IF(t.end_time<t.start_time,ADDTIME(t.end_time,'24:00:00'),t.end_time),
         t.start_time)))) AS legs_hm,
       IF(SUM(TIME_TO_SEC(TIMEDIFF(
            IF(t.end_time<t.start_time,ADDTIME(t.end_time,'24:00:00'),t.end_time),
            t.start_time)))/60
          = SUBSTRING_INDEX(d.total_wheel_movement,':',1)*60
            + SUBSTRING_INDEX(d.total_wheel_movement,':',-1), 'MATCH', '** OFF **') AS verdict
  FROM details d
  JOIN trains t ON t.detail_id=d.detail_id AND t.train_type='working' AND t.start_time<>t.end_time
 WHERE d.detail_number IN ('207','209','214','215','227','242','246','248','257',
                           '279','293','296','297','304','323','326','329','350','384')
 GROUP BY d.detail_number, d.total_wheel_movement
 ORDER BY CAST(d.detail_number AS UNSIGNED);

SELECT '2. working-vs-working overlaps (want 0)' AS chk;
SELECT COUNT(*) AS overlaps FROM (
  SELECT 1 FROM trains a JOIN trains b ON b.id>a.id
    AND UPPER(REPLACE(IF(b.train_number LIKE 'P/%',SUBSTRING(b.train_number,3),b.train_number),' ',''))
      = UPPER(REPLACE(IF(a.train_number LIKE 'P/%',SUBSTRING(a.train_number,3),a.train_number),' ',''))
   WHERE a.train_type='working' AND b.train_type='working'
     AND a.start_time<a.end_time AND b.start_time<b.end_time
     AND a.start_time<b.end_time AND b.start_time<a.end_time
     AND UPPER(REPLACE(a.train_number,' ','')) NOT LIKE 'ER%'
     AND a.train_number <> 'MUCK SPL') z;

SELECT '3. wheel-movement drift > 15 min across the whole book' AS chk;
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

SELECT '4. relief markers now set (was 19 R/T, 18 R/B)' AS chk;
SELECT SUM(rt_detail IS NOT NULL) AS rt_markers,
       SUM(rb_detail IS NOT NULL) AS rb_markers,
       SUM(train_type<>'working' AND (rt_detail IS NOT NULL OR rb_detail IS NOT NULL)) AS on_non_working
  FROM trains;

SELECT '5. leg starting after sign-off (want 0)' AS chk;
SELECT COUNT(DISTINCT d.detail_id) AS n
  FROM details d JOIN trains t ON t.detail_id=d.detail_id
 WHERE d.sign_off_time>d.sign_on_time AND t.train_type<>'waiting'
   AND t.start_time<>t.end_time AND t.start_time>d.sign_off_time;

-- =====================================================================
-- ROLLBACK — previous values are in the comment on each UPDATE above.
-- The relief markers were all NULL before this ran, so:
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.rt_detail=NULL, t.rb_detail=NULL
--    WHERE d.detail_number IN (the 18 above) AND t.train_type='working';
--   ... except 304/PLGN1 R/B 207, which predates this file. Keep it.
--   UPDATE details SET total_wheel_movement='2:54' WHERE detail_number='257';
-- =====================================================================
