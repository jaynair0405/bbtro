-- =====================================================================
-- Detail 134 — record the LPC standby at Nathani car shed.
--
-- 134 is the ONLY detail in the book that works no train at all yet is
-- not marked WAITING, which made it look like missing data. It is not.
--
--   Signs on NCS (Nathani car shed, Kurla) 06:41
--   Waits at the shed 06:41 -> 10:15 for a Loco Power Controller booking
--   If none comes, rides home spare on T 62 from VVH (Vidyavihar) 10:58
--   Signs off CSMT 11:46.  Wheel movement 0:00 — and the book agrees.
--
-- Same shape as detail 382, where the standby is carried as a REMARK
-- rather than a separate leg (see CLAUDE.md, "Waiting Details View"):
--   382  V69 ... 'TO SCS, LPC WTG UPTO 05:30 HRS'
-- 382's remark sits on the working leg that goes TO the shed. 134 has no
-- such leg — the wait precedes its only leg — so the remark goes there.
--
-- WHY THIS IS NOT A WAITING DETAIL. The 40 WAITING details are whole
-- spare duties with a single WAITING leg and zero movement. 134 has a
-- real piloting leg and 0:33 of piloting time, so marking it WAITING
-- would corrupt both the spare-duty count and the piloting totals.
--
-- CORROBORATION. Every other NCS duty departs exactly 35 minutes after
-- signing on — 2, 43, 91, 123, 147, 603, 798 — the shed-to-Vidyavihar
-- walk, against the 30 minutes used elsewhere. 134's 4h17 is the only
-- gap of its kind, so the standby is real and not a data omission.
--
-- Idempotent. RUN ON BOTH DATABASES.
-- =====================================================================

START TRANSACTION;

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.remarks = 'EX NCS, LPC WTG UPTO 10:15 HRS'
 WHERE d.detail_number = '134' AND t.train_number = 'P/T 62';

COMMIT;

SELECT '134 — the standby is now on the record' AS chk;
SELECT d.detail_number AS det, LEFT(d.sign_on_time,5) AS son, d.sign_on_place AS son_p,
       t.train_number, t.train_type AS ty, t.start_station AS ss, LEFT(t.start_time,5) AS st,
       t.end_station AS es, LEFT(t.end_time,5) AS et, t.remarks
  FROM details d JOIN trains t ON t.detail_id = d.detail_id
 WHERE d.detail_number = '134';

-- ROLLBACK:  UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
--               SET t.remarks=NULL
--             WHERE d.detail_number='134' AND t.train_number='P/T 62';
