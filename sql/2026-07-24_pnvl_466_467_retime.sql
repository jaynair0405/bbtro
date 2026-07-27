-- =====================================================================
-- New Panvel Detail from 15.12.2025 (ver 2) — 466 & 467 revised in place.
-- Old DB rows are the pre-revision timetable (superseded, not renumbered:
-- old-467 pilot P/PL73 has 0 hits in new book; old-466 leg-set not carried).
-- Replace header + legs from PDF pages 4 (466) and 5 (467).
-- Note: new 466 shares piloting deadhead P/PL128 (16:38->NEU) with new 550
-- (two crews ride together to NEU, then split) — legitimate, not a clash.
-- =====================================================================

START TRANSACTION;

-- ---------- 466 ----------
UPDATE details
   SET sign_on_time='16:08:00', sign_on_place='PNVL',
       sign_off_time='23:45:00', sign_off_place='BEPR',
       total_duty_hours='7:37', total_wheel_movement='2:13', total_piloting='0:22'
 WHERE detail_id='HB87-466';

DELETE FROM trains WHERE detail_id='HB87-466';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-466','harbour','P/PL128','PNVL','16:38:00','NEU','17:00:00','piloting','R/T 490'),
  ('HB87-466','harbour','UNU15','NEU','17:30:00','URAN','18:04:00','working',NULL),
  ('HB87-466','harbour','UBR20','URAN','18:35:00','BEPR','19:08:00','working','R/B 547'),
  ('HB87-466','harbour','UBR23','BEPR','20:45:00','URAN','21:18:00','working','R/T 552'),
  ('HB87-466','harbour','UBR26','URAN','22:30:00','BEPR','23:03:00','working','TO SDG / HALT KILE CABIN KM 37/16');

-- ---------- 467 ----------
UPDATE details
   SET sign_on_time='04:45:00', sign_on_place='BEPR',
       sign_off_time='10:21:00', sign_off_place='PNVL',
       total_duty_hours='5:36', total_wheel_movement='2:12', total_piloting='0:15'
 WHERE detail_id='HB87-467';

DELETE FROM trains WHERE detail_id='HB87-467';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-467','harbour','UBR1','BEPR','05:30:00','URAN','06:03:00','working','EX SDG'),
  ('HB87-467','harbour','UBR4','URAN','06:40:00','BEPR','07:13:00','working',NULL),
  ('HB87-467','harbour','UBR5','BEPR','07:45:00','URAN','08:18:00','working','HALT KILE CABIN KM 37/16'),
  ('HB87-467','harbour','UBR8','URAN','08:45:00','BEPR','09:18:00','working','R/B 479'),
  ('HB87-467','harbour','P/TPL13','BEPR','09:51:00','PNVL','10:06:00','piloting',NULL);

COMMIT;
