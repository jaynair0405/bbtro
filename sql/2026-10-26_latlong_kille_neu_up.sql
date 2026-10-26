-- NEU-KILLE UP BSU (KILLE -> NEU) coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/NEU-KILLE/kille_neu_up.csv (pasted in chat).

UPDATE div_signals SET latitude=19.01735, longitude=73.02357 WHERE signal_number='NU-4' AND section='NEU-KILLE' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.02305, longitude=73.01765 WHERE signal_number='NU-2' AND section='NEU-KILLE' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.02653, longitude=73.01632 WHERE signal_number='NEU S-44' AND section='NEU-KILLE' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
