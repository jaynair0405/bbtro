-- =====================================================================
-- New Panvel Detail from 15.12.2025 (ver 2)
--  * 550 & 551 revised in place (Uran line) — old timetable superseded.
--    Confirmed NOT renumbered: old-550 pilot P/PL122 has 0 hits in the new
--    book; shared trains (UNU/UBR/TPL) appear elsewhere only as shared
--    physical trains with different times. Replace header + legs.
--  * 554 cosmetic: DW-PEN 61017 leg actually ends at PNVL -> label DW-PN.
-- =====================================================================

START TRANSACTION;

-- ---------- 550 ----------
UPDATE details
   SET sign_on_time='16:08:00', sign_on_place='PNVL',
       sign_off_time='22:49:00', sign_off_place='URAN',
       total_duty_hours='6:41', total_wheel_movement='1:42', total_piloting='0:22'
 WHERE detail_id='HB87-550';

DELETE FROM trains WHERE detail_id='HB87-550';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-550','harbour','P/PL128','PNVL','16:38:00','NEU','17:00:00','piloting',NULL),
  ('HB87-550','harbour','UNU17','NEU','18:00:00','URAN','18:34:00','working','EX SDG'),
  ('HB87-550','harbour','UNU20','URAN','19:05:00','NEU','19:39:00','working','R/B 548'),
  ('HB87-550','harbour','UNU23','NEU','21:30:00','URAN','22:04:00','working','R/T 490 / TO SDG / HALT KILE CABIN KM 37/16');

-- ---------- 551 ----------
UPDATE details
   SET sign_on_time='04:45:00', sign_on_place='URAN',
       sign_off_time='09:27:00', sign_off_place='PNVL',
       total_duty_hours='4:42', total_wheel_movement='1:39', total_piloting='0:15'
 WHERE detail_id='HB87-551';

DELETE FROM trains WHERE detail_id='HB87-551';
INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks) VALUES
  ('HB87-551','harbour','UBR2','URAN','05:30:00','BEPR','06:03:00','working','EX SDG'),
  ('HB87-551','harbour','UBR3','BEPR','06:45:00','URAN','07:18:00','working',NULL),
  ('HB87-551','harbour','UBR6','URAN','07:45:00','BEPR','08:18:00','working','R/B 454'),
  ('HB87-551','harbour','P/GNPL2','BEPR','08:57:00','PNVL','09:12:00','piloting',NULL);

-- ---------- 554 cosmetic label ----------
UPDATE trains
   SET train_number='DW-PN 61017'
 WHERE detail_id='HB87-554' AND train_number='DW-PEN 61017' AND start_time='09:10:00';

COMMIT;
