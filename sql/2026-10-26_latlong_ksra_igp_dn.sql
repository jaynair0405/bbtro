-- KSRA-IGP DN NE coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/KSRA-IGP/ksra_igp_dn.csv
-- Source names differ from div_signals; mapped by location (e.g. 'TGR-3 HOME S-2' -> 'TGR-3 S-2', 'IGP PF1 STR S-64' -> 'IGP S-64').
-- Copies filled: KSRA S-46/S-48 on DN NE MID; IGP S-64/66/67 on IGP-MMR DN NE (same magnet_id, same station signal).
-- Not copied: TGR Distants on DN NE MID (separate signals at different locations).
-- No coordinates in source, left NULL: KSRA S-43/44/45/49.

UPDATE div_signals SET latitude=19.6508, longitude=73.47371 WHERE signal_number='KSRA S-46' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.6508, longitude=73.47371 WHERE signal_number='KSRA S-46' AND section='KSRA-IGP' AND line='DN NE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.6508, longitude=73.47378 WHERE signal_number='KSRA S-48' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.6508, longitude=73.47378 WHERE signal_number='KSRA S-48' AND section='KSRA-IGP' AND line='DN NE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.65544, longitude=73.47811 WHERE signal_number='KSRA S-65' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.66836, longitude=73.48019 WHERE signal_number='TGR-3 Distant' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.67485, longitude=73.48589 WHERE signal_number='TGR-3 S-2' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.68081, longitude=73.49263 WHERE signal_number='TGR-3 S-6' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.70149, longitude=73.50383 WHERE signal_number='TGR-2 Distant' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.7013, longitude=73.51285 WHERE signal_number='TGR-2 S-2' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.70141, longitude=73.52064 WHERE signal_number='TGR-2 S-6' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69879, longitude=73.53909 WHERE signal_number='TGR-1 Distant' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69837, longitude=73.54881 WHERE signal_number='TGR-1 S-1' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.6979, longitude=73.55269 WHERE signal_number='IGP S-1' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.6944, longitude=73.56505 WHERE signal_number='IGP S-66' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.6944, longitude=73.56505 WHERE signal_number='IGP S-66' AND section='IGP-MMR' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69439, longitude=73.56543 WHERE signal_number='IGP S-64' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69439, longitude=73.56543 WHERE signal_number='IGP S-64' AND section='IGP-MMR' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69377, longitude=73.56681 WHERE signal_number='IGP S-67' AND section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69377, longitude=73.56681 WHERE signal_number='IGP S-67' AND section='IGP-MMR' AND line='DN NE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
