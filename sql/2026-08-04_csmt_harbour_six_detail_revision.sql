-- =====================================================================
-- CSMT Harbour detail book revision — 304, 343, 363, 371, 382, 402.
--
-- Not six independent edits: two rotations of work driven by an
-- underlying timetable change, plus relief remarks the old book lacked.
--
--   Rotation A (night Panvel / Beypur arms)
--     PL1          343 -> 304   verbatim
--     PL3          363 -> 343   RETIMED 00:24 -> 23:42  (-42 min)
--     PLGN1        363 -> 304   now ends VDLR 06:58 (R/B 207), was CSMT 07:39
--     P/GN14       363 -> 304   verbatim
--     BRVD1        304 -> 363   verbatim
--     BR12         304 -> 363   RETIMED 06:08 -> 06:02  (-6 min)
--     P/B1          -  -> 363   new deadhead (B1 is worked by 396)
--     P/PL1        304 -> (gone) 304 now WORKS PL1 instead of piloting on it
--
--   Rotation B (Vashi night stabling)
--     V71          382 -> 402   verbatim
--     V69          402 -> 382   RETIMED 23:42 -> 00:24  (+42 min)
--
--   PL3 and V69 have swapped departure slots exactly (00:24 <-> 23:42),
--   both DN out of CSMT, both keeping their run times. That slot swap is
--   the root cause of most of these six moving.
--
-- Headers: duty / wheel / piloting are DERIVED from the leg times using
-- the rules the existing data already follows, and each was verified to
-- reproduce the current stored value before the change:
--   sign-on  = first departure - 30 min   (- 45 when starting ex car shed)
--   sign-off = last arrival    + 15 min   (+ 45 when stabling to car shed)
--   duty     = sign-on -> sign-off elapsed, cross-midnight aware
--   wheel    = sum of working legs;  piloting = sum of piloting legs
-- Cross-check against the book's printed totals before deploying to prod.
--
-- Night duty hours are NOT stored — the reports derive NDH from the
-- header, so they follow automatically.
--
-- 382 carries the LPC standby in a remark rather than a separate leg, per
-- instruction: crew stables at Sanpada car shed and waits there until
-- 05:30 for a Loco Power Controller assignment; if none comes he returns
-- spare on V16.
--
-- PREVIOUS STATE (for rollback reference):
--   HB87-304 | CSMT 23:43 -> CSMT 07:28 | duty 7:45 wheel 1:53 pilot 0:18
--   HB87-343 | CSMT 23:43 -> CSMT 07:05 | duty 7:22 wheel 2:39 pilot 0:00
--   HB87-363 | CSMT 23:54 -> CSMT 07:45 | duty 7:51 wheel 2:21 pilot 0:18
--   HB87-371 | SCS  05:31 -> CSMT 09:41 | duty 4:10 wheel 1:51 pilot 0:00
--   HB87-382 | CSMT 23:27 -> CSMT 07:20 | duty 7:53 wheel 0:49 pilot 0:49
--   HB87-402 | CSMT 18:11 -> SCS  01:16 | duty 7:05 wheel 3:10 pilot 0:18
--
-- AFTER RUNNING THIS, re-derive and refresh:
--   node scripts/classify_details.js --commit
--   node scripts/chain_details.js    --commit
--   node scripts/build_page_snapshots.js --commit
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------- 304
-- Beypur arm out, Panvel siding turn in. Now WORKS PL1 (was piloting on it),
-- which is where the extra 28 min of wheel movement comes from.
UPDATE details
   SET sign_on_time='23:43:00', sign_on_place='CSMT',
       sign_off_time='07:45:00', sign_off_place='CSMT',
       total_duty_hours='8:02', total_wheel_movement='2:21', total_piloting='0:18'
 WHERE detail_id='HB87-304';

DELETE FROM trains WHERE detail_id='HB87-304';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-304','harbour','PL1',    'CSMT','00:13:00','PNVL','01:33:00','working', 'TO SDG'),
  ('HB87-304','harbour','PLGN1',  'PNVL','05:57:00','VDLR','06:58:00','working', 'R/B 207 EX SDG'),
  ('HB87-304','harbour','P/GN14', 'VDLR','07:12:00','CSMT','07:30:00','piloting', NULL);

-- ---------------------------------------------------------------- 343
-- Sign-on 31 min earlier; PL1 out, PL3 in. Wheel unchanged (both run 1:20).
UPDATE details
   SET sign_on_time='23:12:00', sign_on_place='CSMT',
       sign_off_time='07:05:00', sign_off_place='CSMT',
       total_duty_hours='7:53', total_wheel_movement='2:39', total_piloting='0:00'
 WHERE detail_id='HB87-343';

DELETE FROM trains WHERE detail_id='HB87-343';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-343','harbour','PL3',  'CSMT','23:42:00','PNVL','01:02:00','working','TO SDG'),
  ('HB87-343','harbour','PL14', 'PNVL','05:31:00','CSMT','06:50:00','working','EX SDG');

-- ---------------------------------------------------------------- 363
-- Takes over the Beypur arm from 304. Deadheads out on B1 (worked by 396)
-- because PL1 is no longer available to pilot on.
UPDATE details
   SET sign_on_time='23:47:00', sign_on_place='CSMT',
       sign_off_time='07:21:00', sign_off_place='CSMT',
       total_duty_hours='7:34', total_wheel_movement='1:52', total_piloting='0:18'
 WHERE detail_id='HB87-363';

DELETE FROM trains WHERE detail_id='HB87-363';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-363','harbour','P/B1',  'CSMT','00:17:00','VDLR','00:35:00','piloting',NULL),
  ('HB87-363','harbour','BRVD1', 'VDLR','00:50:00','BEPR','01:38:00','working', 'R/T 315 TO SDG'),
  ('HB87-363','harbour','BR12',  'BEPR','06:02:00','CSMT','07:06:00','working', 'EX SDG');

-- ---------------------------------------------------------------- 371
-- Pure retime: V16 shifts +7. Sign-on shifts the same +7, preserving the
-- 45-min car-shed preparation allowance. Double rest off 370: 5:27 -> 5:34.
UPDATE details
   SET sign_on_time='05:38:00', sign_on_place='SCS',
       sign_off_time='09:41:00', sign_off_place='CSMT',
       total_duty_hours='4:03', total_wheel_movement='1:52', total_piloting='0:00'
 WHERE detail_id='HB87-371';

DELETE FROM trains WHERE detail_id='HB87-371';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-371','harbour','V16', 'VSH', '06:23:00','CSMT','07:13:00','working','EX SCS'),
  ('HB87-371','harbour','B17', 'CSMT','08:16:00','BA',  '08:45:00','working',NULL),
  ('HB87-371','harbour','B20', 'BA',  '08:53:00','CSMT','09:26:00','working',NULL);

-- ---------------------------------------------------------------- 382
-- V71 out, V69 in (retimed +42). Picks up 371's retimed V16 to come home
-- spare — the 05:30 standby ends by riding V16's rake out of the shed.
UPDATE details
   SET sign_on_time='23:54:00', sign_on_place='CSMT',
       sign_off_time='07:28:00', sign_off_place='CSMT',
       total_duty_hours='7:34', total_wheel_movement='0:49', total_piloting='0:50'
 WHERE detail_id='HB87-382';

DELETE FROM trains WHERE detail_id='HB87-382';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-382','harbour','V69',   'CSMT','00:24:00','VSH', '01:13:00','working', 'TO SCS, LPC WTG UPTO 05:30 HRS'),
  ('HB87-382','harbour','P/V16', 'VSH', '06:23:00','CSMT','07:13:00','piloting', NULL);

-- ---------------------------------------------------------------- 402
-- Legs 1-3 unchanged in timing; relief remarks are new. V69 -> V71 on the
-- last leg. Double rest to 403: 5:55 -> 5:40.
UPDATE details
   SET sign_on_time='18:11:00', sign_on_place='CSMT',
       sign_off_time='01:31:00', sign_off_place='SCS',
       total_duty_hours='7:20', total_wheel_movement='3:10', total_piloting='0:18'
 WHERE detail_id='HB87-402';

DELETE FROM trains WHERE detail_id='HB87-402';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-402','harbour','P/PL163','CSMT','18:41:00','VDLR','18:59:00','piloting',NULL),
  ('HB87-402','harbour','PLVD41', 'VDLR','19:27:00','PNVL','20:29:00','working', 'R/T 229 R/B 254'),
  ('HB87-402','harbour','PL174',  'PNVL','21:05:00','CSMT','22:24:00','working', 'R/T 357'),
  ('HB87-402','harbour','V71',    'CSMT','23:57:00','VSH', '00:46:00','working', 'TO SCS');

COMMIT;

-- Verify
SELECT detail_id, sign_on_place, sign_on_time, sign_off_place, sign_off_time,
       total_duty_hours, total_wheel_movement, total_piloting,
       (SELECT COUNT(*) FROM trains t WHERE t.detail_id=d.detail_id) AS legs
  FROM details d
 WHERE detail_id IN ('HB87-304','HB87-343','HB87-363','HB87-371','HB87-382','HB87-402')
 ORDER BY detail_id;
