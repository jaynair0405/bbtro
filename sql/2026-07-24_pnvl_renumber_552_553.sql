-- =====================================================================
-- New Panvel Detail from 15.12.2025 (ver 2) — reconcile DB with PDF
-- Uran-line details 552 & 553 are BRAND NEW in the PDF.
-- The DB rows currently numbered 552/553 are actually the new PDF 556/557
-- (PNVL-DW-PEN / PNVL-DW-BSR). And DB 556 is a MUCK SPL placeholder.
--
-- Renumber chain (Option A — preserves existing leg data):
--   DB 556 (MUCK SPL)      -> 558
--   DB 552 (DW-PEN split)  -> 556   (= PDF 556)
--   DB 553 (DW-BSR)        -> 557   (= PDF 557)
-- Then INSERT the genuinely new Uran-line 552 & 553 from the PDF.
--
-- Only FK on these ids is trains.detail_id -> details.detail_id.
-- waiting_details keys on detail_number and holds none of 552/553/556.
-- =====================================================================

START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;

-- 1) MUCK SPL: 556 -> 558  (free up 556)
UPDATE details SET detail_id = 'HB87-558', detail_number = '558' WHERE detail_id = 'HB87-556';
UPDATE trains  SET detail_id = 'HB87-558'                        WHERE detail_id = 'HB87-556';

-- 2) old 552 (PNVL-DW-PEN split) -> 556
UPDATE details SET detail_id = 'HB87-556', detail_number = '556' WHERE detail_id = 'HB87-552';
UPDATE trains  SET detail_id = 'HB87-556'                        WHERE detail_id = 'HB87-552';

-- 3) old 553 (PNVL-DW-BSR) -> 557
UPDATE details SET detail_id = 'HB87-557', detail_number = '557' WHERE detail_id = 'HB87-553';
UPDATE trains  SET detail_id = 'HB87-557'                        WHERE detail_id = 'HB87-553';

SET FOREIGN_KEY_CHECKS = 1;

-- 4) NEW Uran-line detail 552  (SIGN 17:03 PNVL -> 23:48 URAN, DUTY 6:45)
INSERT INTO details
  (detail_id, detail_number, line, sign_on_time, sign_on_place,
   sign_off_time, sign_off_place, total_duty_hours, total_wheel_movement, total_piloting)
VALUES
  ('HB87-552','552','harbour','17:03:00','PNVL','23:48:00','URAN','6:45','1:39','0:15');

INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks)
VALUES
  ('HB87-552','harbour','P/PL136','PNVL','17:33:00','BEPR','17:48:00','piloting','R/T 547'),
  ('HB87-552','harbour','UBR19','BEPR','18:30:00','URAN','19:03:00','working',NULL),
  ('HB87-552','harbour','UBR22','URAN','19:35:00','BEPR','20:08:00','working','R/B 466'),
  ('HB87-552','harbour','UBR25','BEPR','22:30:00','URAN','23:03:00','working','R/T 547 / TO SDG');

-- 5) NEW Uran-line detail 553  (SIGN 05:25 URAN -> 11:09 PNVL, DUTY 5:44)
INSERT INTO details
  (detail_id, detail_number, line, sign_on_time, sign_on_place,
   sign_off_time, sign_off_place, total_duty_hours, total_wheel_movement, total_piloting)
VALUES
  ('HB87-553','553','harbour','05:25:00','URAN','11:09:00','PNVL','5:44','1:42','0:23');

INSERT INTO trains
  (detail_id, line, train_number, start_station, start_time, end_station, end_time, train_type, remarks)
VALUES
  ('HB87-553','harbour','UNU2','URAN','06:10:00','NEU','06:44:00','working','EX SDG / R/B 503'),
  ('HB87-553','harbour','UNU5','NEU','08:15:00','URAN','08:49:00','working','R/T 549'),
  ('HB87-553','harbour','UNU8','URAN','09:15:00','NEU','09:49:00','working','R/B 522'),
  ('HB87-553','harbour','P/TPL17','NEU','10:31:00','PNVL','10:54:00','piloting',NULL);

COMMIT;
