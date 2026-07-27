-- =====================================================================
-- PNVL single-field DB corrections found by internal consistency sweep
-- (sign-off - sign-on != stored duty) and confirmed against the PDF.
-- Legs unaffected; wheel movement unaffected.
--   509 & 510 duty values were transposed.
--   517 is a sign-off TIME typo (not duty): 16:43 -> 16:13 makes span=duty 7:47.
-- =====================================================================

START TRANSACTION;

UPDATE details SET total_duty_hours='7:16' WHERE detail_id='HB87-509';  -- was 7:35
UPDATE details SET total_duty_hours='7:35' WHERE detail_id='HB87-510';  -- was 7:16
UPDATE details SET total_duty_hours='6:21' WHERE detail_id='HB87-511';  -- was 7:21
UPDATE details SET sign_off_time='16:13:00' WHERE detail_id='HB87-517'; -- was 16:43
UPDATE details SET total_duty_hours='6:07' WHERE detail_id='HB87-539';  -- was 6:37
UPDATE details SET total_duty_hours='6:45' WHERE detail_id='HB87-543';  -- was 6:15

COMMIT;
