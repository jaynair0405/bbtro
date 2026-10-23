-- CTR duties whose stored sign-off precedes the sign-on (a stale value from the pre-05667fc
-- glue, the legs themselves are right): set sign-off to the last leg's arrival (or departure)
-- and the sign-off station to that leg's destination. Idempotent. LOCAL 2026-10-23: 355 duties.
UPDATE div_ctr_duties d
JOIN (
    SELECT l.duty_id,
           SUBSTRING_INDEX(GROUP_CONCAT(COALESCE(l.arrival_datetime, l.departure_datetime) ORDER BY l.departure_datetime DESC, l.id DESC), ',', 1) last_end,
           SUBSTRING_INDEX(GROUP_CONCAT(l.to_station ORDER BY l.departure_datetime DESC, l.id DESC), ',', 1) last_to
    FROM div_ctr_legs l
    WHERE l.departure_datetime IS NOT NULL
    GROUP BY l.duty_id
) x ON x.duty_id = d.id
SET d.sign_off_datetime = x.last_end, d.sign_off_station = x.last_to
WHERE d.sign_off_datetime < d.sign_on_datetime AND x.last_end >= d.sign_on_datetime;
SELECT ROW_COUNT() AS duties_recomputed;
SELECT COUNT(*) AS signoff_before_signon_left FROM div_ctr_duties WHERE sign_off_datetime < sign_on_datetime;
