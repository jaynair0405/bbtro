-- =====================================================================
-- New Panvel Detail from 15.12.2025 (ver 2) — 547 revised in place.
-- 546 already matches the PDF (PNVL-CSMT duty) -> no change.
-- Old 547 = pre-revision short BEPR-URAN afternoon duty (superseded).
-- Confirmed NOT renumbered: old opening pilot P/PL84 has 0 hits in new book.
-- Replace header + legs from PDF page 25.
-- =====================================================================

START TRANSACTION;

UPDATE details
   SET sign_on_time='14:15:00', sign_on_place='PNVL',
       sign_off_time='22:17:00', sign_off_place='PNVL',
       total_duty_hours='8:02', total_wheel_movement='2:13', total_piloting='0:30'
 WHERE detail_id='HB87-547';

DELETE FROM trains WHERE detail_id='HB87-547';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-547','harbour','P/PL104','PNVL','14:45:00','NEU','15:00:00','piloting','R/T 479'),
  ('HB87-547','harbour','UNU13','NEU','15:45:00','URAN','16:19:00','working','HALT KILE CABIN KM 37/16'),
  ('HB87-547','harbour','UBR18','URAN','17:15:00','BEPR','17:48:00','working','R/B 552'),
  ('HB87-547','harbour','UBR21','BEPR','19:30:00','URAN','20:03:00','working','R/T 466'),
  ('HB87-547','harbour','UBR24','URAN','20:50:00','BEPR','21:23:00','working','R/B 552'),
  ('HB87-547','harbour','P/TPL61','BEPR','21:47:00','PNVL','22:02:00','piloting',NULL);

COMMIT;
