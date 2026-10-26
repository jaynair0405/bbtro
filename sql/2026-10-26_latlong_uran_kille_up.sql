-- KILLE-URAN UP BSU (URAN -> KILLE) coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/BSU_LINE/uran_kille_up.csv
-- Names normalised: 'KHKR S-n' -> 'KARP S-n' (locations agree). KILLE S-6 already filled (same value) from kille_bepr_up.csv.

UPDATE div_signals SET latitude=18.87827, longitude=72.95404 WHERE signal_number='URAN S-22' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.87834, longitude=72.95435 WHERE signal_number='URAN S-21' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88036, longitude=72.96322 WHERE signal_number='NU-42' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88564, longitude=72.97032 WHERE signal_number='NU-40' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.89119, longitude=72.97751 WHERE signal_number='NU-38' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.89666, longitude=72.98467 WHERE signal_number='NU-36' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.90042, longitude=72.99401 WHERE signal_number='NU-34' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.9036, longitude=73.00249 WHERE signal_number='NU-32' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.90686, longitude=73.01125 WHERE signal_number='NU-30' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.91079, longitude=73.01815 WHERE signal_number='NU-28' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.91752, longitude=73.02178 WHERE signal_number='NU-26' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.92912, longitude=73.02387 WHERE signal_number='NU-24' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.93668, longitude=73.01977 WHERE signal_number='NU-22' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.94459, longitude=73.0155 WHERE signal_number='NU-20' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.95275, longitude=73.01282 WHERE signal_number='KARP S-9' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.96114, longitude=73.01485 WHERE signal_number='KARP S-8' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.96107, longitude=73.01497 WHERE signal_number='KARP S-7' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.96879, longitude=73.02009 WHERE signal_number='NU-18' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.97638, longitude=73.02508 WHERE signal_number='NU-16' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98401, longitude=73.03033 WHERE signal_number='NU-14' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.99125, longitude=73.03504 WHERE signal_number='NU-12' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.99729, longitude=73.03367 WHERE signal_number='NU-10' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.00147, longitude=73.02843 WHERE signal_number='NU-8' AND section='KILLE-URAN' AND line='UP BSU' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
