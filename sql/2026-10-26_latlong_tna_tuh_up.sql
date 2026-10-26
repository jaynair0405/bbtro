-- TNA-TUH UP THB coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/TNA_VSH/tna_tuh_up.csv
-- Names normalised: 'TN - n' -> 'TN-n', with leading zero for 2/4/8 (TN-02, TN-04, TN-08).
-- TNA S-53 / S-54 matched by name: source (S-53 = PF-9, S-54 = PF-10) confirmed correct; master location_text has them swapped.

UPDATE div_signals SET latitude=19.0873, longitude=73.0169 WHERE signal_number='TN-24' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.0961, longitude=73.01554 WHERE signal_number='KPHN S-14' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.10457, longitude=73.01082 WHERE signal_number='KPHN S-7' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.11297, longitude=73.00833 WHERE signal_number='KPHN S-3' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.11756, longitude=73.00643 WHERE signal_number='TN-22' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.12219, longitude=73.00504 WHERE signal_number='TN-20' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.13006, longitude=73.00313 WHERE signal_number='TN-18' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.13799, longitude=73.00236 WHERE signal_number='TN-16' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.14672, longitude=73.00022 WHERE signal_number='TN-14' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15563, longitude=72.99938 WHERE signal_number='TN-12' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15999, longitude=72.9993 WHERE signal_number='TN-10' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.16806, longitude=72.99899 WHERE signal_number='TN-08' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.17576, longitude=72.99473 WHERE signal_number='PSK S-40' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18227, longitude=72.99476 WHERE signal_number='PSK S-39' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.19041, longitude=72.99385 WHERE signal_number='TN-04' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18957, longitude=72.98869 WHERE signal_number='TN-02' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.1877, longitude=72.98184 WHERE signal_number='TNA S-84' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18526, longitude=72.97449 WHERE signal_number='TNA S-54' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18535, longitude=72.97446 WHERE signal_number='TNA S-53' AND section='TNA-TUH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
