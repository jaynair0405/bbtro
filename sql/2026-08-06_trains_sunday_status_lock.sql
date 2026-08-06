-- =====================================================================
-- trains.status — finish the backfill, then make it impossible to omit.
--
-- WHAT status MEANS
--   The SUNDAY / NOMINATED HOLIDAY position of a leg. Read in exactly one
--   place, routes/wheelMovementRoutes.js:
--       else if (isSundayOrHoliday && train.status === 'cancelled')
--   'cancelled' = this train does not run on Sundays/nominated holidays.
--   'active'    = it runs.
--   It is NOT a general record state, and NOT a whole-detail day-off marker.
--
-- HOW IT MAPS TO THE DETAIL BOOK — established from the data, three ways:
--   * A train is 'cancelled' exactly when the detail's SUN / HOLIDAY line
--     names it "CD". The three fully-cancelled Panvel details all do:
--       482  VVD 2/PLVD 1 CD, P/PNVL
--       512  VVD4/PLVD3 CD STAFF P/PNVL
--       516  ER PNVL/ TPL 8/ TNU 5 CD WAITING & P/PNVL
--   * "DO" means the CREW rests; the trains still run. Across every detail
--     whose SUN/HOLIDAY says DO: 234 legs active, 0 cancelled.
--   * Independently corroborated by the AC circular of 13.01.2026, whose
--     SUN/HOL column marks VVD 2, PL 20 and PLVD 1 with X — the same trains
--     the book has as CD and the DB has as 'cancelled'.
--   229 details are MIXED (some legs run, some do not), which is why this is
--   a per-leg fact and not a per-detail one.
--
-- WHY THE NULLs EXISTED
--   87 legs had none: exactly the legs inserted by the detail-book revisions
--   whose INSERT column list omitted `status` (the July PNVL files and
--   2026-08-04_csmt_harbour_six_detail_revision.sql). Because the code tests
--   `=== 'cancelled'`, a NULL silently counted as RUNNING. The NOT NULL below
--   is what stops that recurring.
-- =====================================================================

START TRANSACTION;

-- ------------------------------------------------ 1. Uran branch (50)
-- Confirmed by the LPC: the whole Uran branch works on Sundays, no
-- cancellations. Covers details 454-553 including 552/553, whose SUN/HOLIDAY
-- line is absent from the Panvel PDF.
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.status = 'active'
 WHERE t.status IS NULL AND t.train_type = 'working'
   AND UPPER(REPLACE(t.train_number,' ','')) REGEXP '^(UBR|UNU)[0-9]+$';
-- expect: 50 rows

-- --------------------------------------------- 2. CSMT harbour (12)
-- Details 304, 343, 363, 371, 382 and 402 — every one of their book pages
-- reads "SUN / HOLIDAY : DO", and no page names any of these trains as CD.
-- By the rule above that makes them 'active'. If any of these twelve should
-- be cancelled it is a one-line correction; nothing else depends on it.
UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.status = 'active'
 WHERE t.status IS NULL AND t.train_type = 'working'
   AND d.detail_number IN ('304','343','363','371','382','402');
-- expect: 12 rows

-- --------------------------------------------------------- 3. the lock
-- No NULLs remain, so the column can carry NOT NULL. ENUM replaces a free
-- varchar(20) that accepted anything. DEFAULT 'active' means an INSERT that
-- omits the column now gets the safe common case instead of silence.
ALTER TABLE trains
  MODIFY status ENUM('active','cancelled') NOT NULL DEFAULT 'active'
  COMMENT 'Sunday/nominated-holiday position of this leg. cancelled = does not run that day (book: named CD in the detail SUN/HOLIDAY line). Read by wheelMovementRoutes.js sundayDeductions.';

COMMIT;

-- ------------------------------------------------------------ verify
SELECT 'no NULLs anywhere (want 0)' AS chk;
SELECT COUNT(*) AS nulls_ FROM trains WHERE status IS NULL;

SELECT 'final distribution by leg type' AS chk;
SELECT train_type, status, COUNT(*) n FROM trains GROUP BY train_type, status ORDER BY train_type, n DESC;

SELECT 'column definition' AS chk;
SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='trains' AND COLUMN_NAME='status';

SELECT 'the three known Sunday-cancelled trains still cancelled' AS chk;
SELECT d.detail_number AS det, t.train_number, t.status
  FROM trains t JOIN details d ON d.detail_id=t.detail_id
 WHERE UPPER(REPLACE(t.train_number,' ','')) IN ('VVD2','PLVD1','PL20') AND t.train_type='working';

-- =====================================================================
-- ROLLBACK
--   ALTER TABLE trains MODIFY status VARCHAR(20) DEFAULT NULL;
--   (the backfilled values are left in place — they were corrections)
-- =====================================================================
