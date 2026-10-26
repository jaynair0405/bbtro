-- TUH-NEU UP THB coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/TNA_VSH/tuh_neu_up.csv
-- Not in source: NEU S-26 (PF-1 STR).

UPDATE div_signals SET latitude=19.03493594, longitude=73.01838352 WHERE signal_number='NEU S-25' AND section='TUH-NEU' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03972012, longitude=73.01869294 WHERE signal_number='TN-36' AND section='TUH-NEU' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.04492683, longitude=73.01893261 WHERE signal_number='TN-34' AND section='TUH-NEU' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.05341529, longitude=73.0184985 WHERE signal_number='TN-32' AND section='TUH-NEU' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.05724612, longitude=73.01842917 WHERE signal_number='JNJ S-22' AND section='TUH-NEU' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06396301, longitude=73.01823546 WHERE signal_number='TN-26' AND section='TUH-NEU' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07236826, longitude=73.01847625 WHERE signal_number='TUH S-13' AND section='TUH-NEU' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07766666, longitude=73.0175514 WHERE signal_number='TUH S-5' AND section='TUH-NEU' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
