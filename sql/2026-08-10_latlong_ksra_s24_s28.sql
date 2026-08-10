-- KYN-KSRA UP NE: the 2 remaining Kasara PF starters (local + prod). Date: 2026-08-10.
-- Not renumbered (KSRA, not ATG) -> same number on both DBs; match by number+direction.
UPDATE div_signals SET latitude=19.64463, longitude=73.47128 WHERE signal_number='KSRA S-24' AND section='KYN-KSRA' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.6468,  longitude=73.47293 WHERE signal_number='KSRA S-28' AND section='KYN-KSRA' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
SELECT line, direction, COUNT(*) total, SUM(latitude IS NOT NULL AND longitude IS NOT NULL) with_ll
FROM div_signals WHERE is_active=1 AND section='KYN-KSRA' GROUP BY line, direction;
