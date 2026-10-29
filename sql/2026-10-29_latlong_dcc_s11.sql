-- DCC S-11 (DAT-DCC DIVA UP) coordinates, given and confirmed by user in chat (local + prod). Date: 2026-10-29.
-- Note: the point lies ~3 km S of DCC, beside PNVL-DCC DP-3 (46/20), while master location_text says 43/21 — logged in docs/SIGNAL_LATLONG_ISSUES.md.

UPDATE div_signals SET latitude=19.171263969326837, longitude=73.07468321936092 WHERE signal_number='DCC S-11' AND section='DAT-DCC' AND line='DIVA UP' AND direction='UP' AND is_active=1 AND (latitude IS NULL OR longitude IS NULL);
