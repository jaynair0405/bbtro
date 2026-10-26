-- KILLE -> BEPR UP BSU coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/BEPR-KILLE/kille_bepr_up.csv (pasted in chat).
-- 'KILE S-6' is KILLE S-6, which lives in KILLE-URAN UP BSU.

UPDATE div_signals SET latitude=19.00938, longitude=73.02486 WHERE signal_number='KILLE S-6' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01461, longitude=73.02507 WHERE signal_number='NU-6' AND section='BEPR-KILLE' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01659, longitude=73.03295 WHERE signal_number='BEPR S-34' AND section='BEPR-KILLE' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
