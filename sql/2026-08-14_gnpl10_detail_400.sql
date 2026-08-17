-- =====================================================================
-- Detail 400 — the last untrimmed PLGN/GNPL handover.
--
-- GNPL10 runs Goregaon -> Panvel via VDLR, where the crew changes:
--     GMN 18:27 ──293──▶ VDLR 19:06 · VDLR 19:11 ──400──▶ PNVL 20:13
--
-- 293's half was corrected in 2026-08-14_plgn_gnpl_handover_correction.sql.
-- 400 still held the whole run, ending "CSMT" — a station GNPL10 never
-- reaches.
--
-- The correction was PREDICTED from the arithmetic before the book page
-- was read: 400's stored wheel movement is 2:21 (141 min) and PL170 is
-- 79, so GNPL10 had to be 62 minutes; ending 20:13 that meant starting
-- 19:11. The book then gave exactly VDLR 19:11 -> PNVL 20:13.
--
-- Everything else on 400 was already right: sign on/off, the P/B61
-- piloting leg (0:19), and PL170.
--
-- With this, working-vs-working overlaps across the whole book reach ZERO.
--
-- Idempotent. RUN ON BOTH DATABASES.
-- =====================================================================

START TRANSACTION;

-- was GMN 18:27 -> CSMT 20:13 (106 min)
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.start_station='VDLR', t.start_time='19:11:00',
       t.end_station='PNVL',   t.end_time='20:13:00',
       t.rt_detail='293', t.rb_detail='349'
 WHERE d.detail_number='400' AND t.train_number='GNPL10';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail='336'
 WHERE d.detail_number='400' AND t.train_number='PL170';

COMMIT;

-- =====================================================================
-- VERIFY
-- =====================================================================

SELECT '400 — legs must equal 2:21' AS chk;
SELECT d.detail_number AS det, d.total_wheel_movement AS wm,
       SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(t.end_time,t.start_time)))) AS legs_hm,
       IF(SUM(TIME_TO_SEC(TIMEDIFF(t.end_time,t.start_time)))/60
          = SUBSTRING_INDEX(d.total_wheel_movement,':',1)*60
            + SUBSTRING_INDEX(d.total_wheel_movement,':',-1),'MATCH','** OFF **') AS verdict
  FROM details d JOIN trains t ON t.detail_id=d.detail_id AND t.train_type='working'
 WHERE d.detail_number='400' GROUP BY d.detail_number, d.total_wheel_movement;

SELECT 'working-vs-working overlaps across the whole book (want 0)' AS chk;
SELECT COUNT(*) AS overlaps FROM (
  SELECT 1 FROM trains a JOIN trains b ON b.id>a.id
    AND UPPER(REPLACE(IF(b.train_number LIKE 'P/%',SUBSTRING(b.train_number,3),b.train_number),' ',''))
      = UPPER(REPLACE(IF(a.train_number LIKE 'P/%',SUBSTRING(a.train_number,3),a.train_number),' ',''))
   WHERE a.train_type='working' AND b.train_type='working'
     AND a.start_time<a.end_time AND b.start_time<b.end_time
     AND a.start_time<b.end_time AND b.start_time<a.end_time
     AND UPPER(REPLACE(a.train_number,' ','')) NOT LIKE 'ER%'
     AND a.train_number<>'MUCK SPL') z;

SELECT 'GNPL10 end to end' AS chk;
SELECT d.detail_number AS det, t.start_station AS ss, LEFT(t.start_time,5) AS st,
       t.end_station AS es, LEFT(t.end_time,5) AS et,
       IFNULL(t.rt_detail,'-') AS r_t, IFNULL(t.rb_detail,'-') AS r_b
  FROM details d JOIN trains t ON t.detail_id=d.detail_id
 WHERE t.train_number='GNPL10' ORDER BY t.start_time;

-- =====================================================================
-- ROLLBACK
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.start_station='GMN', t.start_time='18:27:00',
--          t.end_station='CSMT', t.end_time='20:13:00',
--          t.rt_detail=NULL, t.rb_detail=NULL
--    WHERE d.detail_number='400' AND t.train_number='GNPL10';
-- =====================================================================
