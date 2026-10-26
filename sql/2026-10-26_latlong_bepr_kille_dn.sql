-- BEPR-KILLE DN BSU coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/BEPR-KILLE/bepr_kille_dn.csv (pasted in chat).
-- Names normalised: 'KILE S-n' -> 'KILLE S-n'. UP BSU (BEPR S-34, NU-6) not in source.

UPDATE div_signals SET latitude=19.0181, longitude=73.03801 WHERE signal_number='BEPR S-31' AND section='BEPR-KILLE' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01623, longitude=73.03057 WHERE signal_number='BEPR S-33' AND section='BEPR-KILLE' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01533, longitude=73.02583 WHERE signal_number='KILLE S-3' AND section='BEPR-KILLE' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.0119, longitude=73.02483 WHERE signal_number='KILLE S-4' AND section='BEPR-KILLE' AND line='DN BSU' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
