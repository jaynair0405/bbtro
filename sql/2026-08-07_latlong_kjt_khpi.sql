-- KJT-KHPI coordinates. Date: 2026-08-07. Local + prod.
-- File cols shifted: col0=signal_number, col2=latitude, col3=longitude, col6=direction.
-- Source: data/KJT-KHPI/kjt_khpi_lat_long.csv. 3 blanks pending (KJT S-38, S-63, PDI S-3).

UPDATE div_signals SET latitude=18.79085, longitude=73.3436 WHERE signal_number='KHPI S-17' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.79088, longitude=73.34368 WHERE signal_number='KHPI S-16' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.79538, longitude=73.34002 WHERE signal_number='KHPI S-18' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.79811, longitude=73.33887 WHERE signal_number='GATE-7' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.82393, longitude=73.32701 WHERE signal_number='GATE-5 DIST' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.83118, longitude=73.32131 WHERE signal_number='GATE-5' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.87184, longitude=73.32063 WHERE signal_number='PDI DIST' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88046, longitude=73.32212 WHERE signal_number='PDI S-19' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88583, longitude=73.32019 WHERE signal_number='PDI S-5' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88954, longitude=73.32013 WHERE signal_number='KJT S-71' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.89828, longitude=73.32032 WHERE signal_number='KJT S-82' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.9028, longitude=73.32001 WHERE signal_number='KJT S-95' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.91393, longitude=73.32073 WHERE signal_number='KJT S-132' AND section='KJT-KHPI' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.90948, longitude=73.32085 WHERE signal_number='KJT S-16' AND section='KJT-KHPI' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88212, longitude=73.32175 WHERE signal_number='PDI S-16' AND section='KJT-KHPI' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.8469, longitude=73.3187 WHERE signal_number='GATE-5 DIST' AND section='KJT-KHPI' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.83589, longitude=73.31977 WHERE signal_number='GATE-5 S-3' AND section='KJT-KHPI' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.811, longitude=73.33475 WHERE signal_number='GATE-7 DIST' AND section='KJT-KHPI' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.8013, longitude=73.33789 WHERE signal_number='GATE-7' AND section='KJT-KHPI' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.79757, longitude=73.33912 WHERE signal_number='KHPI S-2' AND section='KJT-KHPI' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);

-- Copy coords for signals shared with KYN-KJT (by number+direction; KYN-KJT already has coords on both DBs)
UPDATE div_signals k JOIN div_signals src ON src.signal_number=k.signal_number AND src.direction=k.direction AND src.section='KYN-KJT' AND src.latitude IS NOT NULL AND src.longitude IS NOT NULL SET k.latitude=src.latitude, k.longitude=src.longitude WHERE k.section='KJT-KHPI' AND k.is_active=1 AND (k.latitude IS NULL OR k.longitude IS NULL);

SELECT line, direction, COUNT(*) total, SUM(latitude IS NOT NULL AND longitude IS NOT NULL) with_ll FROM div_signals WHERE is_active=1 AND section="KJT-KHPI" GROUP BY line, direction;