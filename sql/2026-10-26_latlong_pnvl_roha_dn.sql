-- PNVL-ROHA DN KR coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/PNVL_ROHA/pnvl_roha_dn.csv
-- Source uses generic names (S-2, DIST, S-9) for gates/distants; mapped row-for-row to div_signals order, verified by location
-- (e.g. S-2 69/44 -> GATE-1, DIST 71/16 -> SMNE DIST). Source row 13 'S-2' (no location) -> GATE-2 by position.
-- Copies filled (same magnet_id): PNVL S-9/11/12/13/15 in PNVL-KJT, PNVL-DCC, PNVL-JNPT; PEN S-6 in PEN-TVSG.
-- No coordinates in source, left NULL: PEN S-7/8/9, NGTN S-7. ROHA S-3 not in source.

UPDATE div_signals SET latitude=18.98888605, longitude=73.12398771 WHERE signal_number='PNVL S-9' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98888605, longitude=73.12398771 WHERE signal_number='PNVL S-9' AND section='PNVL-KJT' AND line='DN KJT' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98888605, longitude=73.12398771 WHERE signal_number='PNVL S-9' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98888605, longitude=73.12398771 WHERE signal_number='PNVL S-9' AND section='PNVL-JNPT' AND line='JNPT DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98842747, longitude=73.12430066 WHERE signal_number='PNVL S-11' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98842747, longitude=73.12430066 WHERE signal_number='PNVL S-11' AND section='PNVL-KJT' AND line='DN KJT' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98842747, longitude=73.12430066 WHERE signal_number='PNVL S-11' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98842747, longitude=73.12430066 WHERE signal_number='PNVL S-11' AND section='PNVL-JNPT' AND line='JNPT DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98857518, longitude=73.12382291 WHERE signal_number='PNVL S-15' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98857518, longitude=73.12382291 WHERE signal_number='PNVL S-15' AND section='PNVL-KJT' AND line='DN KJT' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98857518, longitude=73.12382291 WHERE signal_number='PNVL S-15' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98857518, longitude=73.12382291 WHERE signal_number='PNVL S-15' AND section='PNVL-JNPT' AND line='JNPT DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98779446, longitude=73.12479692 WHERE signal_number='PNVL S-12' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98779446, longitude=73.12479692 WHERE signal_number='PNVL S-12' AND section='PNVL-KJT' AND line='DN KJT' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98779446, longitude=73.12479692 WHERE signal_number='PNVL S-12' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98779446, longitude=73.12479692 WHERE signal_number='PNVL S-12' AND section='PNVL-JNPT' AND line='JNPT DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98762254, longitude=73.12504093 WHERE signal_number='PNVL S-13' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98762254, longitude=73.12504093 WHERE signal_number='PNVL S-13' AND section='PNVL-KJT' AND line='DN KJT' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98762254, longitude=73.12504093 WHERE signal_number='PNVL S-13' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98762254, longitude=73.12504093 WHERE signal_number='PNVL S-13' AND section='PNVL-JNPT' AND line='JNPT DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98187, longitude=73.13104 WHERE signal_number='PNVL S-19' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.97813, longitude=73.13497 WHERE signal_number='GATE-1' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.96748, longitude=73.14234 WHERE signal_number='SMNE DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.95923, longitude=73.14461 WHERE signal_number='SMNE S-2' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.94829, longitude=73.14554 WHERE signal_number='SMNE S-3' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.9483, longitude=73.14559 WHERE signal_number='SMNE S-4' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.94429, longitude=73.14589 WHERE signal_number='SMNE S-8' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.93458, longitude=73.14555 WHERE signal_number='GATE-2' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.89132, longitude=73.15191 WHERE signal_number='GATE-5 DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88205, longitude=73.15237 WHERE signal_number='GATE-5' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.87319, longitude=73.15474 WHERE signal_number='APTA S-2' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.86224, longitude=73.15237 WHERE signal_number='APTA S-3' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.86254, longitude=73.15255 WHERE signal_number='APTA S-4' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.86261, longitude=73.1524 WHERE signal_number='APTA S-5' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.85955, longitude=73.15043 WHERE signal_number='APTA S-8' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.83525, longitude=73.09372 WHERE signal_number='JITE DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.82821, longitude=73.08783 WHERE signal_number='JITE S-2' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.81737, longitude=73.08644 WHERE signal_number='JITE S-3' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.81736, longitude=73.0865 WHERE signal_number='JITE S-4' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.81469, longitude=73.08616 WHERE signal_number='JITE S-8' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.79146, longitude=73.07853 WHERE signal_number='GATE-13 DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.78255, longitude=73.07995 WHERE signal_number='GATE-13' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75945, longitude=73.09146 WHERE signal_number='PEN DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.74683, longitude=73.08912 WHERE signal_number='PEN S-2' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.73381, longitude=73.0864 WHERE signal_number='PEN S-4' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.73381, longitude=73.08645 WHERE signal_number='PEN S-5' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.73405, longitude=73.08636 WHERE signal_number='PEN S-6' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.73405, longitude=73.08636 WHERE signal_number='PEN S-6' AND section='PEN-TVSG' AND line='DN TVSG' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.72987, longitude=73.08562 WHERE signal_number='PEN S-11' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.71744, longitude=73.06415 WHERE signal_number='GATE-22 DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.7131, longitude=73.05657 WHERE signal_number='GATE-22' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.69585, longitude=73.05119 WHERE signal_number='GATE-26 DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.68844, longitude=73.05539 WHERE signal_number='GATE-26' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.65568, longitude=73.074 WHERE signal_number='KASU DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.64724, longitude=73.07797 WHERE signal_number='KASU S-2' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.63717, longitude=73.08061 WHERE signal_number='KASU S-3' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.63776, longitude=73.08053 WHERE signal_number='KASU S-4' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.63718, longitude=73.0805 WHERE signal_number='KASU S-5' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.63352, longitude=73.0816 WHERE signal_number='KASU S-8' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.62784, longitude=73.08496 WHERE signal_number='GATE-35' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.5572, longitude=73.13058 WHERE signal_number='NGTN DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.54986, longitude=73.13693 WHERE signal_number='NGTN S-2' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.53642, longitude=73.14217 WHERE signal_number='NGTN S-3' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.53783, longitude=73.14182 WHERE signal_number='NGTN S-4' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.53784, longitude=73.14189 WHERE signal_number='NGTN S-5' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.53374, longitude=73.14252 WHERE signal_number='NGTN S-8' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.49574, longitude=73.11841 WHERE signal_number='NGTN IBS DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.48754, longitude=73.11436 WHERE signal_number='NGTN IBS' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.46358, longitude=73.10513 WHERE signal_number='GATE-52 DIST' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.45552, longitude=73.10856 WHERE signal_number='GATE-52' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.44938, longitude=73.11549 WHERE signal_number='ROHA S-2' AND section='PNVL-ROHA' AND line='DN KR' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
