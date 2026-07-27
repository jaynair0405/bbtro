-- KYN 814: mileage 150 (>=120) => no duty rounding; actual arrival ~22:50 +15 = 23:05.
-- sign-off 23:08 -> 23:05, duty 6:45 -> 6:42 (span 16:23->23:05).
-- 746 confirmed correct at 23:21 (no change).
UPDATE details SET sign_off_time='23:05:00', total_duty_hours='6:42' WHERE detail_id='ML89A-814';
