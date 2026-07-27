-- =====================================================================
-- PROD CATCH-UP: re-applies the 4 files that did not land on prod.
-- Idempotent (all absolute sets) — safe to run in full.
-- Covers: 547, 454, 479, 490, 504, 522 (full retimes),
--         509, 510, 511, 517, 539, 543 (field fixes),
--         556 (split-header soff fix + leg 18:05).
-- =====================================================================
START TRANSACTION;

-- ===== 547 (full retime) =====
UPDATE details SET sign_on_time='14:15:00',sign_on_place='PNVL',sign_off_time='22:17:00',sign_off_place='PNVL',
 total_duty_hours='8:02',total_wheel_movement='2:13',total_piloting='0:30' WHERE detail_id='HB87-547';
DELETE FROM trains WHERE detail_id='HB87-547';
INSERT INTO trains (detail_id,line,train_number,start_station,start_time,end_station,end_time,train_type,remarks) VALUES
 ('HB87-547','harbour','P/PL104','PNVL','14:45:00','NEU','15:00:00','piloting','R/T 479'),
 ('HB87-547','harbour','UNU13','NEU','15:45:00','URAN','16:19:00','working','HALT KILE CABIN KM 37/16'),
 ('HB87-547','harbour','UBR18','URAN','17:15:00','BEPR','17:48:00','working','R/B 552'),
 ('HB87-547','harbour','UBR21','BEPR','19:30:00','URAN','20:03:00','working','R/T 466'),
 ('HB87-547','harbour','UBR24','URAN','20:50:00','BEPR','21:23:00','working','R/B 552'),
 ('HB87-547','harbour','P/TPL61','BEPR','21:47:00','PNVL','22:02:00','piloting',NULL);

-- ===== 556 split-header fix =====
UPDATE details SET sign_off_time='21:15:00',sign_off_place='PNVL' WHERE detail_id='HB87-556';
UPDATE trains SET start_time='18:05:00' WHERE detail_id='HB87-556' AND train_number='PENDW61026';

-- ===== field fixes (509,510,511,517,539,543) =====
UPDATE details SET total_duty_hours='7:16' WHERE detail_id='HB87-509';
UPDATE details SET total_duty_hours='7:35' WHERE detail_id='HB87-510';
UPDATE details SET total_duty_hours='6:21' WHERE detail_id='HB87-511';
UPDATE details SET sign_off_time='16:13:00' WHERE detail_id='HB87-517';
UPDATE details SET total_duty_hours='6:07' WHERE detail_id='HB87-539';
UPDATE details SET total_duty_hours='6:45' WHERE detail_id='HB87-543';

-- ===== Group 1 full retimes (454,479,490,504,522) =====
UPDATE details SET sign_on_time='07:25:00',sign_on_place='PNVL',sign_off_time='15:24:00',sign_off_place='PNVL',
 total_duty_hours='7:59',total_wheel_movement='2:12',total_piloting='0:30' WHERE detail_id='HB87-454';
DELETE FROM trains WHERE detail_id='HB87-454';
INSERT INTO trains (detail_id,line,train_number,start_station,start_time,end_station,end_time,train_type,remarks) VALUES
 ('HB87-454','harbour','P/PLVD8','PNVL','07:55:00','BEPR','08:10:00','piloting','R/T 551'),
 ('HB87-454','harbour','UBR7','BEPR','08:45:00','URAN','09:18:00','working',NULL),
 ('HB87-454','harbour','UBR10','URAN','09:45:00','BEPR','10:18:00','working',NULL),
 ('HB87-454','harbour','UBR11','BEPR','11:30:00','URAN','12:03:00','working',NULL),
 ('HB87-454','harbour','UBR14','URAN','13:15:00','BEPR','13:48:00','working','R/B 490'),
 ('HB87-454','harbour','P/PL107','BEPR','14:54:00','PNVL','15:09:00','piloting',NULL);

UPDATE details SET sign_on_time='08:31:00',sign_on_place='PNVL',sign_off_time='16:27:00',sign_off_place='PNVL',
 total_duty_hours='7:56',total_wheel_movement='2:13',total_piloting='0:38' WHERE detail_id='HB87-479';
DELETE FROM trains WHERE detail_id='HB87-479';
INSERT INTO trains (detail_id,line,train_number,start_station,start_time,end_station,end_time,train_type,remarks) VALUES
 ('HB87-479','harbour','P/TPL24','PNVL','09:01:00','BEPR','09:16:00','piloting','R/T 467'),
 ('HB87-479','harbour','UBR9','BEPR','09:45:00','URAN','10:18:00','working',NULL),
 ('HB87-479','harbour','UBR12','URAN','11:15:00','BEPR','11:48:00','working',NULL),
 ('HB87-479','harbour','UBR13','BEPR','13:00:00','URAN','13:33:00','working',NULL),
 ('HB87-479','harbour','UNU14','URAN','14:15:00','NEU','14:49:00','working','R/B 547'),
 ('HB87-479','harbour','P/TPL35','NEU','15:49:00','PNVL','16:12:00','piloting',NULL);

UPDATE details SET sign_on_time='13:31:00',sign_on_place='PNVL',sign_off_time='21:36:00',sign_off_place='PNVL',
 total_duty_hours='8:05',total_wheel_movement='2:15',total_piloting='0:37' WHERE detail_id='HB87-490';
DELETE FROM trains WHERE detail_id='HB87-490';
INSERT INTO trains (detail_id,line,train_number,start_station,start_time,end_station,end_time,train_type,remarks) VALUES
 ('HB87-490','harbour','P/TPL38','PNVL','14:01:00','BEPR','14:16:00','piloting','R/T 454'),
 ('HB87-490','harbour','UBR15','BEPR','14:45:00','URAN','15:18:00','working',NULL),
 ('HB87-490','harbour','UNU16','URAN','16:15:00','NEU','16:49:00','working','R/B 466 / HALT KILE CABIN KM 37/16'),
 ('HB87-490','harbour','UNU19','NEU','19:00:00','URAN','19:34:00','working','R/T 550'),
 ('HB87-490','harbour','UNU22','URAN','20:05:00','NEU','20:39:00','working','R/B 548'),
 ('HB87-490','harbour','P/PL175','NEU','20:59:00','PNVL','21:21:00','piloting',NULL);

UPDATE details SET sign_on_time='05:47:00',sign_on_place='PNVL',sign_off_time='12:39:00',sign_off_place='PNVL',
 total_duty_hours='6:52',total_wheel_movement='2:16',total_piloting='0:44' WHERE detail_id='HB87-504';
DELETE FROM trains WHERE detail_id='HB87-504';
INSERT INTO trains (detail_id,line,train_number,start_station,start_time,end_station,end_time,train_type,remarks) VALUES
 ('HB87-504','harbour','P/PL20','PNVL','06:17:00','NEU','06:39:00','piloting','R/T 553'),
 ('HB87-504','harbour','UNU3','NEU','07:15:00','URAN','07:49:00','working',NULL),
 ('HB87-504','harbour','UNU6','URAN','08:15:00','NEU','08:49:00','working','HALT KILE CABIN KM 37/16'),
 ('HB87-504','harbour','UNU7','NEU','09:15:00','URAN','09:49:00','working',NULL),
 ('HB87-504','harbour','UNU10','URAN','10:15:00','NEU','10:49:00','working','TO SDG'),
 ('HB87-504','harbour','P/PL79','NEU','12:02:00','PNVL','12:24:00','piloting',NULL);

UPDATE details SET sign_on_time='09:10:00',sign_on_place='PNVL',sign_off_time='16:51:00',sign_off_place='PNVL',
 total_duty_hours='7:41',total_wheel_movement='2:15',total_piloting='0:37' WHERE detail_id='HB87-522';
DELETE FROM trains WHERE detail_id='HB87-522';
INSERT INTO trains (detail_id,line,train_number,start_station,start_time,end_station,end_time,train_type,remarks) VALUES
 ('HB87-522','harbour','P/PL52','PNVL','09:40:00','NEU','10:02:00','piloting','R/T 553'),
 ('HB87-522','harbour','UNU9','NEU','10:45:00','URAN','11:19:00','working',NULL),
 ('HB87-522','harbour','UNU12','URAN','12:15:00','NEU','12:49:00','working',NULL),
 ('HB87-522','harbour','UNU11','NEU','13:45:00','URAN','14:19:00','working',NULL),
 ('HB87-522','harbour','UBR16','URAN','15:15:00','BEPR','15:48:00','working','R/B 548'),
 ('HB87-522','harbour','P/PL125','BEPR','16:21:00','PNVL','16:36:00','piloting',NULL);

COMMIT;
