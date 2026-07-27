-- =====================================================================
-- New Panvel Detail from 15.12.2025 (ver 2) — 548 & 549 revised in place.
-- Old DB rows are the pre-revision BEPR-URAN shuttle timetable (superseded).
-- Confirmed NOT renumbered: old pilots (P/TPL44, P/PL61) appear only as
-- shared trains in unrelated trans-harbour details, not as whole leg-sets.
-- Replace header + legs from PDF page 25.
-- =====================================================================

START TRANSACTION;

-- ---------- 548 ----------
UPDATE details
   SET sign_on_time='14:58:00', sign_on_place='PNVL',
       sign_off_time='22:54:00', sign_off_place='NEU',
       total_duty_hours='7:56', total_wheel_movement='2:15', total_piloting='0:15'
 WHERE detail_id='HB87-548';

DELETE FROM trains WHERE detail_id='HB87-548';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-548','harbour','P/PL114','PNVL','15:28:00','BEPR','15:43:00','piloting','R/T 522'),
  ('HB87-548','harbour','UBR17','BEPR','17:00:00','URAN','17:33:00','working',NULL),
  ('HB87-548','harbour','UNU18','URAN','18:00:00','NEU','18:34:00','working','R/B 490'),
  ('HB87-548','harbour','UNU21','NEU','20:00:00','URAN','20:34:00','working','R/T 550'),
  ('HB87-548','harbour','UNU24','URAN','21:35:00','NEU','22:09:00','working','TO SDG');

-- ---------- 549 ----------
UPDATE details
   SET sign_on_time='05:30:00', sign_on_place='NEU',
       sign_off_time='09:11:00', sign_off_place='PNVL',
       total_duty_hours='3:41', total_wheel_movement='1:08', total_piloting='0:23'
 WHERE detail_id='HB87-549';

DELETE FROM trains WHERE detail_id='HB87-549';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-549','harbour','UNU1','NEU','06:15:00','URAN','06:49:00','working','EX SDG'),
  ('HB87-549','harbour','UNU4','URAN','07:15:00','NEU','07:49:00','working','R/B 553'),
  ('HB87-549','harbour','P/TPL9','NEU','08:33:00','PNVL','08:56:00','piloting',NULL);

COMMIT;
