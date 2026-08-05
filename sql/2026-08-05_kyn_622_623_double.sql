-- =====================================================================
-- ML89A-622 / 623 are a DOUBLE, not two singles.
--
-- Found by classify_details.js once its pairing bug was fixed: it proposed
-- 'double' where the stored value said 'single' twice.
--
-- Verified against "ML-HB-THB-KYN Double detail Rest.xlsx", sheet
-- "KYN M/L DOUBLE" — the double-detail list maintained by working KYN
-- motormen. 622 and 623 appear there as a consecutive pair (Sr 11 and 12),
-- with 623's row carrying "Rest as per DB 06:02:00", which is exactly
-- 622's sign-off (01:10) to 623's sign-on (07:12). The same sheet lists
-- 674/675 (Sr 37/38) in the identical shape, and that pair was already
-- stored as a double.
--
-- Cross-checked against KYN_Detail.pdf (also motormen-prepared): both
-- details' times and places match the DB exactly —
--   622  17.10 -> 1.10   08:00  KYN -> KYN
--   623   7.12 -> 12.12  05:00  KYN -> KYN
-- (That PDF lists Morning and Evening details as two independent sorted
-- columns, so adjacency in it does NOT indicate pairing — 674 and 675 sit
-- on different rows there.)
--
-- cycle_anchor is the first detail of the pair, matching how the classifier
-- anchors every other double.
--
-- 623 also needs its rolling next_detail_id: it was NULL because a 'single'
-- gets no next link, but the second leg of a double continues the rolling
-- chain. Compare the equivalent pair 674/675, where 675 -> 676. The next
-- continuous KYN mainline detail after 623 is 624.
-- =====================================================================

START TRANSACTION;

UPDATE details
   SET detail_type = 'double', cycle_anchor = 'ML89A-622'
 WHERE detail_id IN ('ML89A-622', 'ML89A-623');
-- expect: 2 rows affected

UPDATE details
   SET next_detail_id = 'ML89A-624'
 WHERE detail_id = 'ML89A-623';
-- expect: 1 row affected

COMMIT;

-- Verify: both double, both anchored on 622, rest 6h02 between them.
SELECT detail_number AS det, detail_type, cycle_anchor, next_detail_id,
       sign_on_place, sign_on_time, sign_off_place, sign_off_time
  FROM details
 WHERE detail_id IN ('ML89A-622', 'ML89A-623')
 ORDER BY detail_number;

-- =====================================================================
-- ROLLBACK
--   UPDATE details SET detail_type='single', cycle_anchor='ML89A-623',
--          next_detail_id=NULL WHERE detail_id='ML89A-623';
--   UPDATE details SET detail_type='single', cycle_anchor=NULL
--    WHERE detail_id='ML89A-622';
-- =====================================================================
