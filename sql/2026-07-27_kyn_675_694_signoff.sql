-- KYN sign-off corrections (per KYN sign-off rules).
-- 675: sign-off 11:09 -> 11:10 (pairing: relieving departure +15); duty span 4:03.
-- 694: sign-off 09:58 -> 09:45; raw duty 4:47 crosses 4:35 -> rounds to 5:00,
--      so sign-off = sign-on 04:45 + 5:00 = 09:45.
-- 686 already correct (23:56); no change.
UPDATE details SET sign_off_time='11:10:00', total_duty_hours='4:03' WHERE detail_id='ML89A-675';
UPDATE details SET sign_off_time='09:45:00', total_duty_hours='5:00' WHERE detail_id='ML89A-694';
