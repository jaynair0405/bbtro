-- =====================================================================
-- trains.status — partial backfill of the legs left NULL.
--
-- WHAT status MEANS (undocumented until now):
--   It is NOT a general record state. It is the SUNDAY / NOMINATED HOLIDAY
--   position of that leg, and it is read in exactly one place —
--   routes/wheelMovementRoutes.js, the sundayDeductions branch:
--       else if (isSundayOrHoliday && train.status === 'cancelled')
--   'cancelled' = this train does not run on Sundays/nominated holidays.
--   'active'    = it runs.
--   Because the test is `=== 'cancelled'`, a NULL silently counts as RUNNING.
--
-- HOW THE NULLs GOT THERE
--   87 legs had no status: 63 working + 24 piloting. They are not scattered —
--   they are exactly the legs inserted by the detail-book revisions, whose
--   INSERT column lists omitted `status` (the July PNVL files, and
--   2026-08-04_csmt_harbour_six_detail_revision.sql). Nothing else in the
--   book is affected.
--
-- THIS FILE fixes only the unambiguous ones. 62 working legs remain NULL
-- pending their Sunday position from the WTT (which marks X for cancelled).
-- Do NOT make the column NOT NULL until those are filled, or MySQL will turn
-- every unknown into 'active' and make a guess look like a fact.
-- =====================================================================

START TRANSACTION;

-- ------------------------------------------------- 1. piloting legs
-- A piloting leg is not bound to its nominal train. If that train is
-- cancelled but the train the crew is travelling to WORK still runs, the crew
-- simply goes by whatever is available in order to reach the station in time.
-- So a piloting leg is never 'cancelled' on account of its own train — and the
-- book agrees: 0 of 548 piloting legs are marked cancelled.
UPDATE trains SET status = 'active'
 WHERE status IS NULL AND train_type = 'piloting';
-- expect: 24 rows

-- ------------------------------------------- 2. PLGN1 in detail 304
-- Inferred from evidence, not assumed: detail 207 works the same train and
-- has it 'active'. It is the only one of the 63 NULL working legs whose train
-- carries a known status elsewhere in the book.
UPDATE trains SET status = 'active'
 WHERE detail_id = 'HB87-304' AND train_number = 'PLGN1';
-- expect: 1 row

COMMIT;

-- ------------------------------------------------------------ verify
SELECT 'status by leg type — piloting should have no NULLs left' AS chk;
SELECT train_type, IFNULL(status,'(NULL)') AS status, COUNT(*) n
  FROM trains GROUP BY train_type, status ORDER BY train_type, n DESC;

SELECT 'remaining NULL working legs (want 62)' AS chk;
SELECT COUNT(*) AS still_unknown FROM trains WHERE status IS NULL;

-- =====================================================================
-- ROLLBACK — restores the NULLs on exactly the legs this file set.
--   UPDATE trains SET status=NULL WHERE train_type='piloting'
--     AND detail_id IN (SELECT detail_id FROM (SELECT detail_id FROM details
--       WHERE detail_number IN ('304','343','363','371','382','402','454','466',
--       '467','479','490','504','522','547','548','549','550','551','552','553')) x);
--   UPDATE trains SET status=NULL WHERE detail_id='HB87-304' AND train_number='PLGN1';
-- =====================================================================
