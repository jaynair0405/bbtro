-- =====================================================================
-- The reciprocals for detail 36 — and a correction to how relief works.
--
-- WHAT I HAD WRONG
--   2026-08-17_relief_details_36_39.sql claimed 774, 730 and 81 were each
--   MISSING A LEG, because none of them had a leg for the train named on
--   36's markers. That was the wrong premise. They are not missing
--   anything: 730 works K 82 and 81 works K 73 / K 92, exactly as the
--   book says.
--
-- RELIEF ALSO HAPPENS AT RAKE TURNAROUNDS
--   The rake arrives under one number and departs under another, and the
--   crew changes with it:
--
--     TNA   774 arrives T 45 11:26   ->   36 departs T 72 11:36   (10 min)
--     KYN    36 arrives K 67 15:14   ->  730 departs K 82 15:30   (16 min)
--     KYN    81 arrives K 73 15:53   ->   36 departs K 86 16:04   (11 min)
--
--   Every one is DN in / UP out on a slow service — the rake reverses.
--   So a reciprocal marker does NOT sit on a leg with the same train
--   number, which is why the earlier search found nothing.
--
--   Consequence: "R/T with no reciprocal R/B" is NOT the missing-leg
--   detector the previous file called it. It is mostly detecting
--   turnaround relief. That claim is withdrawn.
--
--   Consequence for the derivation
--   (2026-08-17_relief_marker_derivation.sql): it matched on the same
--   train number, so it found mid-journey relief (A 13 CSMT->KYN->ABH)
--   and was blind to this whole second class. The 149 it produced remain
--   correct — they were validated 15/15 against book markers — but they
--   are not the whole picture.
--
-- STILL OPEN: the book line for 774 reads T 75 to the user; the DB has
--   T 45. The timings favour the DB — 774 signs on THK 07:03 and off KYN
--   12:33, whereas T 75 runs CSMT 15:28 -> TNA 16:24, hours outside that
--   duty, while T 45 (10:27 -> 11:26) is the only train that can connect
--   to T 72 at 11:36. Both are real CSMT->TNA slows, so a 4/7 misreading
--   is plausible. NOT changed here.
--
-- Idempotent. RUN ON BOTH DATABASES.
-- =====================================================================

START TRANSACTION;

-- 36 relieves 774 at TNA: 774's ARRIVING leg is relieved by 36
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail = '36'
 WHERE d.detail_number = '774' AND t.train_number = 'T 45';

-- 730 relieves 36 at KYN: 730's DEPARTING leg gives relief to 36
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '36'
 WHERE d.detail_number = '730' AND t.train_number = 'K 82';

-- 36 relieves 81 at KYN: 81's ARRIVING leg is relieved by 36
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rb_detail = '36'
 WHERE d.detail_number = '81' AND t.train_number = 'K 73';

COMMIT;

-- =====================================================================
-- VERIFY
-- =====================================================================

SELECT 'the three turnarounds, both sides' AS chk;
SELECT d.detail_number AS det, t.train_number,
       t.start_station AS ss, LEFT(t.start_time,5) AS st,
       t.end_station AS es, LEFT(t.end_time,5) AS et,
       IFNULL(t.rt_detail,'-') AS r_t, IFNULL(t.rb_detail,'-') AS r_b
  FROM details d JOIN trains t ON t.detail_id = d.detail_id
 WHERE (d.detail_number='36'  AND t.train_number IN ('T 72','K 67','K 86'))
    OR (d.detail_number='774' AND t.train_number='T 45')
    OR (d.detail_number='730' AND t.train_number='K 82')
    OR (d.detail_number='81'  AND t.train_number='K 73')
 ORDER BY t.start_time;

SELECT 'marker totals' AS chk;
SELECT SUM(rt_detail IS NOT NULL) AS rt_markers,
       SUM(rb_detail IS NOT NULL) AS rb_markers,
       SUM(train_type<>'working' AND (rt_detail IS NOT NULL OR rb_detail IS NOT NULL)) AS on_non_working
  FROM trains;

-- =====================================================================
-- ROLLBACK — all three were NULL before this ran.
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.rb_detail=NULL WHERE d.detail_number='774' AND t.train_number='T 45';
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.rt_detail=NULL WHERE d.detail_number='730' AND t.train_number='K 82';
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.rb_detail=NULL WHERE d.detail_number='81'  AND t.train_number='K 73';
-- =====================================================================
