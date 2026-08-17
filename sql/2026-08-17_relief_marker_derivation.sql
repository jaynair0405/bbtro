-- =====================================================================
-- Relief markers derived from contiguous crew handovers — 149 pairs,
-- ~298 markers.
--
-- THE RULE (CLAUDE.md, "Relief Markers"):
--   R/T = "Relief To"   — this detail GIVES relief to the named detail;
--                         our crew takes over at the leg's START station.
--   R/B = "Relieved By" — the named detail takes over from us, at the
--                         leg's END station.
--   They are reciprocal: if A carries R/T B then B carries R/B A.
--
-- THE DERIVATION
--   A handover is provable from the data alone: the SAME train, one
--   crew's leg ending at a station, another crew's leg on that train
--   starting at that station within 20 minutes. Then:
--       outgoing leg -> rb_detail = incoming detail
--       incoming leg -> rt_detail = outgoing detail
--
-- WHY THIS IS SAFE TO DERIVE RATHER THAN READ FROM THE BOOK
--   Run against the 15 legs whose markers WERE read from the book, the
--   rule reproduces every one — 15/15, zero differences, including all
--   the PLGN/GNPL handovers and 79/A 4. See the verification below,
--   which re-runs that check.
--
--   Quality of the 149: 144 have a gap of 0-2 minutes; the 5 longest are
--   6-9 minutes and all at VDLR on PLGN/GNPL services, matching
--   book-confirmed cases there (304->207 is 4 min, 242->297 is 8).
--   Every outgoing leg has EXACTLY ONE candidate — no ambiguity.
--
-- SCOPE GUARDS
--   * Only pairs where BOTH sides are currently NULL. Never overwrites a
--     value read from the book.
--   * Working legs only, so trg_trains_relief_working_ins/_upd cannot be
--     violated (relief on a piloting leg is rejected by design).
--   * ER% and MUCK SPL excluded — generic labels, not train numbers.
--
-- The pairs are materialised FIRST, because the second UPDATE's guard
-- would no longer match once the first has run.
--
-- Idempotent: a re-run finds nothing left NULL and does nothing.
-- RUN ON BOTH DATABASES.
-- =====================================================================

-- The pair list is kept as a REAL table, not a temporary one: it is both
-- the audit record of what was derived (as opposed to read from the book)
-- and the means of reversing it exactly. 149 rows.
CREATE TABLE IF NOT EXISTS relief_pairs_derived_20260817 (
  out_leg  INT PRIMARY KEY,
  out_det  VARCHAR(20),
  in_leg   INT,
  in_det   VARCHAR(20),
  train    VARCHAR(50),
  station  VARCHAR(10),
  gap_min  INT
) COMMENT 'Relief markers derived from contiguous handovers 2026-08-17; see sql/2026-08-17_relief_marker_derivation.sql';

INSERT IGNORE INTO relief_pairs_derived_20260817
       (out_leg, out_det, in_leg, in_det, train, station, gap_min)
SELECT a.id, da.detail_number, b.id, db.detail_number,
       a.train_number, a.end_station,
       TIMESTAMPDIFF(MINUTE, a.end_time, b.start_time)
  FROM trains a
  JOIN details da ON da.detail_id = a.detail_id
  JOIN trains b
    ON b.id <> a.id
   AND b.train_type = 'working'
   AND UPPER(REPLACE(IF(b.train_number LIKE 'P/%', SUBSTRING(b.train_number,3), b.train_number),' ',''))
     = UPPER(REPLACE(IF(a.train_number LIKE 'P/%', SUBSTRING(a.train_number,3), a.train_number),' ',''))
   AND b.start_station = a.end_station
   AND b.start_time >= a.end_time
   AND b.start_time <= ADDTIME(a.end_time, '00:20:00')
  JOIN details db ON db.detail_id = b.detail_id
 WHERE a.train_type = 'working'
   AND a.rb_detail IS NULL
   AND b.rt_detail IS NULL
   AND UPPER(REPLACE(a.train_number,' ','')) NOT LIKE 'ER%'
   AND a.train_number <> 'MUCK SPL';

SELECT CONCAT('pairs to apply: ', COUNT(*)) AS plan FROM relief_pairs_derived_20260817;

START TRANSACTION;

UPDATE trains t JOIN relief_pairs_derived_20260817 p ON t.id = p.out_leg
   SET t.rb_detail = p.in_det
 WHERE t.rb_detail IS NULL;

UPDATE trains t JOIN relief_pairs_derived_20260817 p ON t.id = p.in_leg
   SET t.rt_detail = p.out_det
 WHERE t.rt_detail IS NULL;

COMMIT;

-- =====================================================================
-- VERIFY
-- =====================================================================

SELECT '1. marker totals' AS chk;
SELECT SUM(rt_detail IS NOT NULL) AS rt_markers,
       SUM(rb_detail IS NOT NULL) AS rb_markers,
       SUM(rt_detail IS NOT NULL OR rb_detail IS NOT NULL) AS legs_with_a_marker,
       SUM(train_type <> 'working' AND (rt_detail IS NOT NULL OR rb_detail IS NOT NULL)) AS on_non_working
  FROM trains;

SELECT '2. the derived pairs must be reciprocal' AS chk;
SELECT COUNT(*) AS non_reciprocal
  FROM relief_pairs_derived_20260817 p
  JOIN trains o ON o.id = p.out_leg
  JOIN trains i ON i.id = p.in_leg
 WHERE o.rb_detail <> p.in_det OR i.rt_detail <> p.out_det;

SELECT '3. reciprocity across the WHOLE book' AS chk;
SELECT 'R/T with no reciprocal R/B' AS gap, COUNT(*) AS n
  FROM trains t JOIN details d ON d.detail_id = t.detail_id
 WHERE t.rt_detail IS NOT NULL AND NOT EXISTS (
   SELECT 1 FROM trains t2 JOIN details d2 ON d2.detail_id = t2.detail_id
    WHERE d2.detail_number = t.rt_detail AND t2.rb_detail = d.detail_number)
UNION ALL
SELECT 'R/B with no reciprocal R/T', COUNT(*)
  FROM trains t JOIN details d ON d.detail_id = t.detail_id
 WHERE t.rb_detail IS NOT NULL AND NOT EXISTS (
   SELECT 1 FROM trains t2 JOIN details d2 ON d2.detail_id = t2.detail_id
    WHERE d2.detail_number = t.rb_detail AND t2.rt_detail = d.detail_number);

SELECT '4. the rule still reproduces every book-read marker' AS chk;
SELECT SUM(a.rb_detail = db.detail_number) AS agree,
       SUM(a.rb_detail <> db.detail_number) AS differ
  FROM trains a JOIN details da ON da.detail_id = a.detail_id
  JOIN trains b ON b.id <> a.id AND b.train_type = 'working'
   AND UPPER(REPLACE(IF(b.train_number LIKE 'P/%',SUBSTRING(b.train_number,3),b.train_number),' ',''))
     = UPPER(REPLACE(IF(a.train_number LIKE 'P/%',SUBSTRING(a.train_number,3),a.train_number),' ',''))
   AND b.start_station = a.end_station
   AND b.start_time >= a.end_time AND b.start_time <= ADDTIME(a.end_time,'00:20:00')
  JOIN details db ON db.detail_id = b.detail_id
 WHERE a.train_type = 'working' AND a.rb_detail IS NOT NULL;

-- =====================================================================
-- ROLLBACK
--   Exact, because relief_pairs_derived_20260817 records every leg this
--   file touched and nothing else:
--
--     UPDATE trains t JOIN relief_pairs_derived_20260817 p ON t.id=p.out_leg
--        SET t.rb_detail = NULL;
--     UPDATE trains t JOIN relief_pairs_derived_20260817 p ON t.id=p.in_leg
--        SET t.rt_detail = NULL;
--     DROP TABLE relief_pairs_derived_20260817;
--
--   Markers read from the book are untouched by that, since this file
--   only ever wrote where both sides were already NULL.
-- =====================================================================
