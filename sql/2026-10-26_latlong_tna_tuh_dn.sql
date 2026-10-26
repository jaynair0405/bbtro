-- TNA-TUH DN THB coordinates (+ TUH S-12 on TUH-VSH DN THB) (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/TNA_VSH/tna-tuh_dn.csv
-- Names normalised: 'TN - n' -> 'TN-n', 'TN - 1' -> 'TN-01'. TUH S-12 lives on TUH-VSH.

UPDATE div_signals SET latitude=19.18607, longitude=72.97709 WHERE signal_number='TNA S-62' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18603, longitude=72.97715 WHERE signal_number='TNA S-61' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18781, longitude=72.98182 WHERE signal_number='TN-01' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.19002, longitude=72.99026 WHERE signal_number='PSK S-32' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18881, longitude=72.99651 WHERE signal_number='PSK S-36' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18304, longitude=72.99513 WHERE signal_number='PSK S-38' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.17918, longitude=72.9941 WHERE signal_number='TN-3' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.17161, longitude=72.99849 WHERE signal_number='TN-5' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.16354, longitude=72.99953 WHERE signal_number='TN-7' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15721, longitude=72.99949 WHERE signal_number='TN-9' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.14856, longitude=73.00028 WHERE signal_number='TN-11' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.13967, longitude=73.00237 WHERE signal_number='TN-13' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.13036, longitude=73.00323 WHERE signal_number='TN-15' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.12111, longitude=73.00542 WHERE signal_number='TN-17' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.11512, longitude=73.00762 WHERE signal_number='TN-19' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.10999, longitude=73.00955 WHERE signal_number='KPHN S-2' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.10194, longitude=73.01183 WHERE signal_number='KPHN S-9' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.09433, longitude=73.01676 WHERE signal_number='TN-21' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.08749, longitude=73.01701 WHERE signal_number='TN-23' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.08323, longitude=73.01674 WHERE signal_number='TUH S-2' AND section='TNA-TUH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07471, longitude=73.01801 WHERE signal_number='TUH S-12' AND section='TUH-VSH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
