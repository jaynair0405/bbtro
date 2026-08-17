-- =====================================================================
-- Relief markers from the book — details 36 and 39.
-- First of the manual pass over the 64 legs the derivation could not reach.
--
-- FROM THE BOOK
--   39  N 35  R/B 740      36  T 72  R/T 774
--       S 4   R/T 799          K 67  R/B 730
--                              K 86  R/T 81
--
-- 39/S 4 was already set and 799 already carried the reciprocal R/B 39,
-- so that pair needed nothing.
--
-- TWO THINGS THIS TURNED UP
--
-- 1. A MIDNIGHT BLIND SPOT in the derivation
--    (2026-08-17_relief_marker_derivation.sql). 39's N 35 ends KYN 23:59
--    and 740's N 35 starts KYN 00:01 — a 2-minute handover, but the
--    derivation tests `b.start_time >= a.end_time`, and 00:01 >= 23:59 is
--    false. So it was skipped. A whole-book scan finds exactly ONE such
--    case, this one, so the derivation is not materially wrong — but any
--    future run of that rule should wrap past midnight.
--    740's reciprocal R/T 39 is set here, which closes it.
--
-- 2. THREE MISSING LEGS. 36's markers name 774, 730 and 81, and NONE of
--    those details has a leg for the train concerned:
--        774 has no T 72     730 has no K 67     81 has no K 86
--    The markers are right — the book says so — which means the
--    counterpart DETAILS are each missing a leg. That makes the
--    "R/T with no reciprocal R/B" count a missing-leg detector, not just
--    an untidiness metric. Those three need their book pages; they are
--    NOT fixed here.
--
-- Idempotent. RUN ON BOTH DATABASES.
-- =====================================================================

START TRANSACTION;

-- ------------------------------------------------------------- 39
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail = '740'
 WHERE d.detail_number = '39' AND t.train_number = 'N 35';

-- the reciprocal, and the one handover the midnight wrap hid
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '39'
 WHERE d.detail_number = '740' AND t.train_number = 'N 35';

-- ------------------------------------------------------------- 36
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '774'
 WHERE d.detail_number = '36' AND t.train_number = 'T 72';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail = '730'
 WHERE d.detail_number = '36' AND t.train_number = 'K 67';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '81'
 WHERE d.detail_number = '36' AND t.train_number = 'K 86';

COMMIT;

-- =====================================================================
-- VERIFY
-- =====================================================================

SELECT '36, 39 and the 740 reciprocal' AS chk;
SELECT d.detail_number AS det, t.train_number,
       t.start_station AS ss, LEFT(t.start_time,5) AS st,
       t.end_station AS es, LEFT(t.end_time,5) AS et,
       IFNULL(t.rt_detail,'-') AS r_t, IFNULL(t.rb_detail,'-') AS r_b
  FROM details d JOIN trains t ON t.detail_id = d.detail_id
 WHERE (d.detail_number IN ('36','39') AND t.train_type='working')
    OR (d.detail_number = '740' AND t.train_number = 'N 35')
 ORDER BY CAST(d.detail_number AS UNSIGNED), t.start_time;

SELECT 'N 35 end to end — the midnight handover' AS chk;
SELECT d.detail_number AS det, t.start_station AS ss, LEFT(t.start_time,5) AS st,
       t.end_station AS es, LEFT(t.end_time,5) AS et,
       IFNULL(t.rt_detail,'-') AS r_t, IFNULL(t.rb_detail,'-') AS r_b
  FROM details d JOIN trains t ON t.detail_id = d.detail_id
 WHERE t.train_number = 'N 35' AND t.train_type='working' ORDER BY t.start_time;

SELECT 'marker totals' AS chk;
SELECT SUM(rt_detail IS NOT NULL) AS rt_markers,
       SUM(rb_detail IS NOT NULL) AS rb_markers,
       SUM(train_type<>'working' AND (rt_detail IS NOT NULL OR rb_detail IS NOT NULL)) AS on_non_working
  FROM trains;

SELECT 'the three missing legs this exposed (each should return 0 rows)' AS chk;
SELECT '774 T 72' AS expected_leg, COUNT(*) AS found FROM trains t JOIN details d ON d.detail_id=t.detail_id
 WHERE d.detail_number='774' AND UPPER(REPLACE(t.train_number,' ',''))='T72'
UNION ALL SELECT '730 K 67', COUNT(*) FROM trains t JOIN details d ON d.detail_id=t.detail_id
 WHERE d.detail_number='730' AND UPPER(REPLACE(t.train_number,' ',''))='K67'
UNION ALL SELECT '81 K 86', COUNT(*) FROM trains t JOIN details d ON d.detail_id=t.detail_id
 WHERE d.detail_number='81' AND UPPER(REPLACE(t.train_number,' ',''))='K86';

-- =====================================================================
-- ROLLBACK — all five were NULL before this ran.
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.rb_detail=NULL WHERE d.detail_number='39'  AND t.train_number='N 35';
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.rt_detail=NULL WHERE d.detail_number='740' AND t.train_number='N 35';
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.rt_detail=NULL WHERE d.detail_number='36'  AND t.train_number='T 72';
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.rb_detail=NULL WHERE d.detail_number='36'  AND t.train_number='K 67';
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.rt_detail=NULL WHERE d.detail_number='36'  AND t.train_number='K 86';
-- =====================================================================
