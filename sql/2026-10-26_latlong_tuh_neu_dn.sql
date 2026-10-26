-- TUH-NEU DN THB coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/TNA_VSH/tuh_neu_dn.csv
-- TUH S-11, TN-25, NEU S-32 given by user in chat (appended to the CSV). TUH S-12 / TN-27 / TN-29 rows are TUH-VSH, already filled with the same values - skipped.

UPDATE div_signals SET latitude=19.05944643, longitude=73.018504 WHERE signal_number='TN-31' AND section='TUH-NEU' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.05453931, longitude=73.0186514 WHERE signal_number='JNJ S-3' AND section='TUH-NEU' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.04552897, longitude=73.01902126 WHERE signal_number='TN-33' AND section='TUH-NEU' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03961925, longitude=73.01878703 WHERE signal_number='NEU S-2' AND section='TUH-NEU' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03226896, longitude=73.01845119 WHERE signal_number='NEU S-31' AND section='TUH-NEU' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.074737824547327, longitude=73.01817595767945 WHERE signal_number='TUH S-11' AND section='TUH-NEU' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.069131, longitude=73.018791 WHERE signal_number='TN-25' AND section='TUH-NEU' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.032266413265678, longitude=73.01799093373313 WHERE signal_number='NEU S-32' AND section='TUH-NEU' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
