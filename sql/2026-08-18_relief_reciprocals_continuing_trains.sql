-- =====================================================================
-- The six genuinely missing relief reciprocals.
--
-- WHY ONLY SIX, WHEN THE GAP REPORT FIRST SAID SEVENTY-FIVE
--
--   A reciprocal is owed only when the crew hands over the SAME train and
--   the other crew works it onward. That is mid-journey relief — VDLR on
--   the PLGN/GNPL services, occasionally KYN and TNA.
--
--   It is NOT owed at a terminal. At PNVL, TNA, CSMT and GMN the rake
--   reverses: the arriving crew walks off, and the next crew — already at
--   the station off another train — takes charge at the OTHER END and
--   works the rake out under a new number. The two crews never meet. The
--   marker records where the RAKE goes, not a relief, so the far detail
--   has no reason to print anything.
--
--   58 of the 75 were that. Some relinks do carry both sides anyway
--   (774 T 45 / 36 T 72 at TNA) — allowed, not required.
--
--   Of the 17 that remain, these 6 have the train continuing and the
--   counterpart leg identified. All six confirmed against the book.
--   The other 11 are unresolved and are NOT touched here.
--
-- EVERY TARGET IS THE COUNTERPART'S OWN LEG, STARTING AT THE HANDOVER
--   STATION, so the marker is R/T (relief given at the leg's start), and
--   every one is a working leg — trg_trains_relief_working_ins/_upd will
--   accept them. All six are NULL before this runs.
--
--     79  A 4    TNA  04:54  ->   78  A 4    TNA  04:54   (0 min)
--     215 PLGN7  VDLR 11:39  ->  233  PLGN7  VDLR 11:42   (3 min)
--     248 GNPL4  VDLR 09:17  ->  401  GNPL4  VDLR 09:20   (3 min)
--     296 PLGN15 VDLR 19:35  ->  272  PLGN15 VDLR 19:39   (4 min)
--     323 GNPL16 VDLR 20:56  ->  280  GNPL16 VDLR 21:03   (7 min)
--     329 GNPL6  VDLR 10:10  ->  386  GNPL6  VDLR 10:14   (4 min)
--
-- Idempotent. RUN ON BOTH DATABASES.
-- =====================================================================

START TRANSACTION;

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '79'
 WHERE d.detail_number = '78'  AND UPPER(REPLACE(t.train_number,' ','')) = 'A4';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '215'
 WHERE d.detail_number = '233' AND UPPER(REPLACE(t.train_number,' ','')) = 'PLGN7';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '248'
 WHERE d.detail_number = '401' AND UPPER(REPLACE(t.train_number,' ','')) = 'GNPL4';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '296'
 WHERE d.detail_number = '272' AND UPPER(REPLACE(t.train_number,' ','')) = 'PLGN15';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '323'
 WHERE d.detail_number = '280' AND UPPER(REPLACE(t.train_number,' ','')) = 'GNPL16';

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.rt_detail = '329'
 WHERE d.detail_number = '386' AND UPPER(REPLACE(t.train_number,' ','')) = 'GNPL6';

-- ---------------------------------------------------------------------
-- A 22nd instance of the PLGN/GNPL fault, found BY the reciprocity check.
--
--   365's PLGN11 was recorded PNVL 17:01 -> CSMT 18:02, the familiar
--   whole-train-run error. It ends at VDLR, where 279 takes over.
--
--   365's own next leg proves it without the book: P/B62 pilots FROM
--   VDLR at 18:19. You cannot arrive CSMT 18:02 and depart VDLR 18:19.
--
--   WHY THE WHEEL-MOVEMENT CROSS-CHECK NEVER CAUGHT IT: only the station
--   was wrong, not the times. 17:01-18:02 is 61 minutes either way, so
--   the total still reconciled. That check validates DURATIONS, not
--   geography — it cannot see a leg that ends in the wrong place.
--
--   And 279 has carried R/T 365 on its own PLGN11 all along, pointing at
--   the error. The reciprocity rule found what the arithmetic could not.
--
--   Confirmed against the book, along with 365 signing on at CSMT.
-- ---------------------------------------------------------------------

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_station = 'VDLR', t.rb_detail = '279'
 WHERE d.detail_number = '365' AND UPPER(REPLACE(t.train_number,' ','')) = 'PLGN11';

UPDATE details SET sign_on_place = 'CSMT'
 WHERE detail_number = '365' AND (sign_on_place IS NULL OR sign_on_place = '');

COMMIT;

-- =====================================================================
-- VERIFY
-- =====================================================================

SELECT '365 PLGN11 now ends VDLR and names 279; signs on CSMT' AS chk;
SELECT d.detail_number AS det, IFNULL(NULLIF(d.sign_on_place,''),'(blank)') AS son_place,
       t.train_number, t.start_station AS ss, LEFT(t.start_time,5) AS st,
       t.end_station AS es, LEFT(t.end_time,5) AS et,
       IFNULL(t.rt_detail,'-') AS r_t, IFNULL(t.rb_detail,'-') AS r_b
  FROM details d JOIN trains t ON t.detail_id = d.detail_id
 WHERE d.detail_number IN ('365','279')
   AND UPPER(REPLACE(t.train_number,' ','')) IN ('PLGN11','B62')
 ORDER BY t.start_time;

SELECT 'the six pairs, both sides — r_t and r_b must name each other' AS chk;
SELECT d.detail_number AS det, t.train_number,
       t.start_station AS ss, LEFT(t.start_time,5) AS st,
       t.end_station AS es, LEFT(t.end_time,5) AS et,
       IFNULL(t.rt_detail,'-') AS r_t, IFNULL(t.rb_detail,'-') AS r_b
  FROM details d JOIN trains t ON t.detail_id = d.detail_id
 WHERE (d.detail_number IN ('79','78')   AND UPPER(REPLACE(t.train_number,' ',''))='A4')
    OR (d.detail_number IN ('215','233') AND UPPER(REPLACE(t.train_number,' ',''))='PLGN7')
    OR (d.detail_number IN ('248','401') AND UPPER(REPLACE(t.train_number,' ',''))='GNPL4')
    OR (d.detail_number IN ('296','272') AND UPPER(REPLACE(t.train_number,' ',''))='PLGN15')
    OR (d.detail_number IN ('323','280') AND UPPER(REPLACE(t.train_number,' ',''))='GNPL16')
    OR (d.detail_number IN ('329','386') AND UPPER(REPLACE(t.train_number,' ',''))='GNPL6')
 ORDER BY t.train_number, t.start_time;

SELECT 'marker totals' AS chk;
SELECT SUM(rt_detail IS NOT NULL) AS rt_markers,
       SUM(rb_detail IS NOT NULL) AS rb_markers,
       SUM(train_type <> 'working'
           AND (rt_detail IS NOT NULL OR rb_detail IS NOT NULL)) AS on_non_working
  FROM trains;

-- Continuing-train gaps must now be 0. This is the report's own rule in
-- SQL: a marker whose counterpart leg carries the SAME train number and
-- does not name us back.
SELECT 'continuing-train gaps remaining (expect 0)' AS chk;
SELECT COUNT(*) AS gaps FROM (
  SELECT d.detail_number AS det, t.train_number AS tn, 'rt' AS kind, t.rt_detail AS names
    FROM details d JOIN trains t ON t.detail_id = d.detail_id WHERE t.rt_detail IS NOT NULL
  UNION ALL
  SELECT d.detail_number, t.train_number, 'rb', t.rb_detail
    FROM details d JOIN trains t ON t.detail_id = d.detail_id WHERE t.rb_detail IS NOT NULL
) g
 WHERE EXISTS (            -- the named detail works the same train ...
        SELECT 1 FROM details d2 JOIN trains t2 ON t2.detail_id = d2.detail_id
         WHERE d2.detail_number = g.names
           AND UPPER(REPLACE(t2.train_number,' ','')) = UPPER(REPLACE(g.tn,' ','')))
   AND NOT EXISTS (        -- ... but does not name us back
        SELECT 1 FROM details d2 JOIN trains t2 ON t2.detail_id = d2.detail_id
         WHERE d2.detail_number = g.names
           AND UPPER(REPLACE(t2.train_number,' ','')) = UPPER(REPLACE(g.tn,' ',''))
           AND (CASE WHEN g.kind='rt' THEN t2.rb_detail ELSE t2.rt_detail END) = g.det);

-- =====================================================================
-- ROLLBACK — all six were NULL before this ran.
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id SET t.rt_detail=NULL
--    WHERE (d.detail_number='78'  AND UPPER(REPLACE(t.train_number,' ',''))='A4')
--       OR (d.detail_number='233' AND UPPER(REPLACE(t.train_number,' ',''))='PLGN7')
--       OR (d.detail_number='401' AND UPPER(REPLACE(t.train_number,' ',''))='GNPL4')
--       OR (d.detail_number='272' AND UPPER(REPLACE(t.train_number,' ',''))='PLGN15')
--       OR (d.detail_number='280' AND UPPER(REPLACE(t.train_number,' ',''))='GNPL16')
--       OR (d.detail_number='386' AND UPPER(REPLACE(t.train_number,' ',''))='GNPL6');
--   UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--      SET t.end_station='CSMT', t.rb_detail=NULL
--    WHERE d.detail_number='365' AND UPPER(REPLACE(t.train_number,' ',''))='PLGN11';
--   UPDATE details SET sign_on_place='' WHERE detail_number='365';
-- =====================================================================
