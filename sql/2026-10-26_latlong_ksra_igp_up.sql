-- KSRA-IGP UP NE coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/KSRA-IGP/ksra_igp_up.csv
-- Source names differ from div_signals; mapped by location (e.g. 'TGR-2' 133/317 -> 'TGR-2 Distant', 'UP STR S-5' 134/339 -> 'TGR-1 S-5').
-- Copies filled: IGP S-40/S-32 on UP NE MID (same magnet_id, same station signal).
-- Skipped: KSRA PF2 STR S-23 belongs to KYN-KSRA, which already holds the same coordinates.
-- No coordinates in source, left NULL: IGP S-38, IGP S-36.

UPDATE div_signals SET latitude=19.69503, longitude=73.5589 WHERE signal_number='IGP S-40' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69503, longitude=73.5589 WHERE signal_number='IGP S-40' AND section='KSRA-IGP' AND line='UP NE MID' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69466, longitude=73.56001 WHERE signal_number='IGP S-32' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69466, longitude=73.56001 WHERE signal_number='IGP S-32' AND section='KSRA-IGP' AND line='UP NE MID' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69653, longitude=73.5549 WHERE signal_number='IGP S-58' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69773, longitude=73.5503 WHERE signal_number='TGR-1 S-6' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69797, longitude=73.54807 WHERE signal_number='TGR-1 S-5' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69887, longitude=73.5339 WHERE signal_number='TGR-2 Distant' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.70188, longitude=73.52377 WHERE signal_number='TGR-2 S-9' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.70011, longitude=73.51922 WHERE signal_number='TGR-2 S-5' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.69122, longitude=73.49618 WHERE signal_number='TGR-3 Distant' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.68249, longitude=73.49474 WHERE signal_number='TGR-3 S-9' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.67825, longitude=73.49115 WHERE signal_number='TGR-3 S-5' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.66557, longitude=73.48059 WHERE signal_number='KSRA Distant' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.65573, longitude=73.4792 WHERE signal_number='KSRA S-68' AND section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
