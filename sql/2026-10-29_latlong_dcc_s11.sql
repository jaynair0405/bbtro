-- DCC S-11 (43/21, DAT-DCC DIVA UP) coordinates, given by user in chat (local + prod). Date: 2026-10-29.
-- Corrected point at Dativali (~45 m from the signal department's DCC-S11); an earlier value near PNVL-DCC DP-3 was wrong
-- and only ever reached the local DB (fixed there by a one-off UPDATE). NULL-guarded.

UPDATE div_signals SET latitude=19.193162808459753, longitude=73.05383310653157 WHERE signal_number='DCC S-11' AND section='DAT-DCC' AND line='DIVA UP' AND direction='UP' AND is_active=1 AND (latitude IS NULL OR longitude IS NULL);
