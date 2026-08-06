-- =====================================================================
-- AC services on the Harbour line: 28 trains, plus the day dimension.
--
-- SOURCE
--   Batch B (14) — Central Railway, Divisional Office Operations Branch,
--   No. BB/T/232/C/TT/Proposal dated 13.01.2026, ref HQ approval message
--   T.649.A/AC Local dated 12.01.2026, effective 26.01.2026 (Monday).
--   File: data/suburban-detail/ALL CONCERNED AC ON HBR LINE 26JAN.pdf
--   Every code, train number and route in that order was verified against
--   suburban_train_master before writing this. Note 3 of the order gives
--   80 existing AC services -> 94, a difference of exactly 14.
--
--   Batch A (14) — supplied by the LPC from an earlier conversion; no
--   circular on file. 98003 (PL 3) was in the original list and has been
--   REPLACED by 98573 (V 69) on instruction. Corroborated by the detail book
--   pages for 371 and 402, which mark V 16 and V 71 with "AC".
--
-- WHY ac_on_sun_hol
--   The order states: "Services running on Sundays/nominated holidays will
--   run with Non AC Rake." AC is therefore NOT a fixed property of a train —
--   it depends on the day. A bare ac_service='AC' would make every report
--   claim these are air-conditioned on a Sunday, which the order denies.
--
--   This is a DIFFERENT fact from trains.status, and neither substitutes for
--   the other:
--     trains.status          — does the train RUN on Sun/Hol at all?  (per leg)
--     ac_service             — is it an AC service on a normal day?   (per train)
--     ac_on_sun_hol          — if it runs on Sun/Hol, is it AC?       (per train)
--   Of the order's 14, three (VVD 2, PL 20, PLVD 1) are marked X in its
--   SUN/HOL column: they do not run at all. The book already has those three
--   as status='cancelled', so no leg change is needed here.
--
--   "Is it AC today?"  =  ac_service='AC' AND (NOT isSunHol OR ac_on_sun_hol=1)
--
-- WHY THE COLUMN IS NULLABLE
--   78 trains are already AC in the master and we have no order on file
--   describing their Sunday behaviour. NOT NULL DEFAULT 0 would silently
--   assert all 78 revert to non-AC — plausible, but unevidenced. NULL means
--   "no order on file", so the gap stays visible and countable instead of
--   becoming a fact by default. Set them to 0 in one statement if confirmed.
-- =====================================================================

START TRANSACTION;

-- --------------------------------------------------------- 1. column
ALTER TABLE suburban_train_master
  ADD COLUMN ac_on_sun_hol TINYINT(1) NULL DEFAULT NULL
      COMMENT 'Runs with an AC rake on Sundays/nominated holidays? 1=yes, 0=no (reverts to non-AC), NULL=no order on file';

-- ------------------------------------------------- 2. batch A (14)
UPDATE suburban_train_master
   SET ac_service = 'AC', ac_on_sun_hol = 0
 WHERE train_code IN ('98052','98092','98166','98204','98242','98356','98520',
                      '98045','98083','98157','98201','98239','98339','98573');
-- expect: 14 rows  (PL 42, PL 70, PL 132, PL 162, PL 196, BR 52, V 16,
--                   PL 39, PL 69, PL 131, PL 161, PL 187, BR 29, V 69)

-- ------------------------------------------------- 3. batch B (14)
UPDATE suburban_train_master
   SET ac_service = 'AC', ac_on_sun_hol = 0
 WHERE train_code IN ('98506','98020','98058','98096','98128','98558','98184',
                      '98009','98051','98089','98119','98533','98181','98221');
-- expect: 14 rows  (VVD 2, PL 20, PL 46, PLVD 24, PL 100, VVD 14, PL 144,
--                   PLVD 1, PL 43, PL 73, PLVD 21, V 29, PLVD 35, PL 175)

COMMIT;

-- ------------------------------------------------------------ verify
SELECT 'AC totals — want 78 + 28 = 106' AS chk;
SELECT ac_service, COUNT(*) n FROM suburban_train_master GROUP BY ac_service;

SELECT 'the 28, with their Sunday position from the book' AS chk;
SELECT m.train_code, m.train_number, m.direction AS dir, m.ac_service, m.ac_on_sun_hol,
       IFNULL(GROUP_CONCAT(DISTINCT t.status),'(not worked)') AS leg_status
  FROM suburban_train_master m
  LEFT JOIN trains t
    ON UPPER(REPLACE(CASE WHEN t.train_number LIKE 'P/%' THEN SUBSTRING(t.train_number,3)
                          ELSE t.train_number END,' ','')) = m.normalized_train_number
   AND t.train_type = 'working'
 WHERE m.train_code IN ('98052','98092','98166','98204','98242','98356','98520',
                        '98045','98083','98157','98201','98239','98339','98573',
                        '98506','98020','98058','98096','98128','98558','98184',
                        '98009','98051','98089','98119','98533','98181','98221')
 GROUP BY m.train_code, m.train_number, m.direction, m.ac_service, m.ac_on_sun_hol
 ORDER BY m.direction, m.train_code;

SELECT 'AC trains with no Sunday rake position on file (the existing 78)' AS chk;
SELECT COUNT(*) AS unknown_sun_hol FROM suburban_train_master
 WHERE ac_service='AC' AND ac_on_sun_hol IS NULL;

-- =====================================================================
-- ROLLBACK
--   UPDATE suburban_train_master SET ac_service='NON_AC'
--    WHERE train_code IN (the 28 above);
--   ALTER TABLE suburban_train_master DROP COLUMN ac_on_sun_hol;
--
-- 98575 (V 71) — RESOLVED, deliberately NOT AC.
--   The detail book page for 402 marks it "AC", but that annotation predates
--   this revision. 402 previously worked V 69 (CSMT 23:42), which IS an AC
--   conversion; the 2026-08-04 revision swapped V 69 out to 382 (retimed to
--   00:24) and brought V 71 in. The AC marking stayed on the page with the
--   slot rather than moving with the train. Confirmed non-AC by the LPC.
--   Easy to flip later if an order says otherwise.
-- =====================================================================
