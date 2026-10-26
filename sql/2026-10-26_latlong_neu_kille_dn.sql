-- NEU-KILLE DN BSU coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/NEU-KILLE/neu_kille_dn.csv (pasted in chat; duplicate NEU S-35 row dropped).
-- Names normalised: 'S-43' -> 'NEU S-43', 'KILE S-2' -> 'KILLE S-2'. UP BSU (NEU S-44, NU-2, NU-4) not in source.

UPDATE div_signals SET latitude=19.03224, longitude=73.01791 WHERE signal_number='NEU S-35' AND section='NEU-KILLE' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03224, longitude=73.01777 WHERE signal_number='NEU S-36' AND section='NEU-KILLE' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.02652, longitude=73.01644 WHERE signal_number='NEU S-43' AND section='NEU-KILLE' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.02084, longitude=73.02045 WHERE signal_number='NU-1' AND section='NEU-KILLE' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01535, longitude=73.02439 WHERE signal_number='KILLE S-2' AND section='NEU-KILLE' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
