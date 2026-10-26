-- KILLE-URAN DN BSU (KILLE -> URAN) coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/BSU_LINE/uran_dn.csv
-- Names normalised: 'KHKR S-n' -> 'KARP S-n'. KILE S-4 skipped (BEPR-KILLE KILLE S-4, already filled, same value).
-- S-7/SH-7, S-8/SH-8 (URAN PF starters) skipped: not in div_signals. Extra note columns in the source ignored.

UPDATE div_signals SET latitude=19.00928, longitude=73.02499 WHERE signal_number='NU-3' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.00152, longitude=73.02853 WHERE signal_number='NU-5' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.99534, longitude=73.03568 WHERE signal_number='NU-7' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98816, longitude=73.03324 WHERE signal_number='NU-9' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.97942, longitude=73.0274 WHERE signal_number='NU-11' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.97198, longitude=73.02238 WHERE signal_number='NU-13' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.96449, longitude=73.01735 WHERE signal_number='KARP S-2' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.95875, longitude=73.01351 WHERE signal_number='KARP S-4' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.95883, longitude=73.01338 WHERE signal_number='KARP S-5' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.95027, longitude=73.01375 WHERE signal_number='NU-15' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.9413, longitude=73.01683 WHERE signal_number='NU-17' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.93418, longitude=73.023 WHERE signal_number='NU-19' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.92287, longitude=73.02288 WHERE signal_number='NU-21' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.91609, longitude=73.02165 WHERE signal_number='NU-23' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.91046, longitude=73.018 WHERE signal_number='NU-25' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.90616, longitude=73.00968 WHERE signal_number='NU-27' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.90263, longitude=73.00026 WHERE signal_number='NU-29' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.89908, longitude=72.99085 WHERE signal_number='NU-31' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.89476, longitude=72.9823 WHERE signal_number='NU-33' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88931, longitude=72.97525 WHERE signal_number='NU-35' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88443, longitude=72.96894 WHERE signal_number='NU-37' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88024, longitude=72.96341 WHERE signal_number='NU-39' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.87813, longitude=72.95893 WHERE signal_number='URAN S-2' AND section='KILLE-URAN' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
