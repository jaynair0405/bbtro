-- PNVL-ROHA UP KR coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/PNVL_ROHA/pnvl_roha_up.csv
-- Source uses generic names (S-2, DIST, S-20); mapped row-for-row to div_signals order, verified by location.
-- Source row 28 'S-2 (LX20)' 107/17 skipped: LX 20 has been removed (source out of date, confirmed by user).
-- Source 'S-2 (LX2)' 75/19 is GATE-4 (confirmed by user).
-- Copies filled (same magnet_id): PEN S-37/38/39 in PEN-TVSG UP TVSG; PNVL S-34/S-30 in PNVL-KJT UP KJT.
-- No coordinates in source, left NULL: GATE-4 REP (76/29).

UPDATE div_signals SET latitude=18.44731, longitude=73.12202 WHERE signal_number='ROHA S-25' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.44721, longitude=73.122 WHERE signal_number='ROHA S-26' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.44755, longitude=73.12149 WHERE signal_number='ROHA S-27' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.44758, longitude=73.12165 WHERE signal_number='ROHA S-28' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.44766, longitude=73.12156 WHERE signal_number='ROHA S-29' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.44882, longitude=73.11648 WHERE signal_number='ROHA S-24' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.45295, longitude=73.11089 WHERE signal_number='GATE-52' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.47635, longitude=73.10867 WHERE signal_number='ROHA IBS DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.48439, longitude=73.11265 WHERE signal_number='ROHA IBS S-20' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.50403, longitude=73.11878 WHERE signal_number='GATE-46 DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.50976, longitude=73.12868 WHERE signal_number='GATE-46 REP S-2' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.51095, longitude=73.12992 WHERE signal_number='GATE-46' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.52068, longitude=73.13194 WHERE signal_number='NGTN DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.5325, longitude=73.14127 WHERE signal_number='NGTN S-32' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.54363, longitude=73.13972 WHERE signal_number='NGTN S-25' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.54362, longitude=73.13967 WHERE signal_number='NGTN S-26' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.54991, longitude=73.13672 WHERE signal_number='NGTN S-24' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.6145, longitude=73.09105 WHERE signal_number='GATE-35 DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.62509, longitude=73.08675 WHERE signal_number='GATE-35' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.63336, longitude=73.08151 WHERE signal_number='KASU S-24' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.64357, longitude=73.07895 WHERE signal_number='KASU S-19' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.64357, longitude=73.07889 WHERE signal_number='KASU S-21' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.64727, longitude=73.07785 WHERE signal_number='KASU S-18' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.68019, longitude=73.06456 WHERE signal_number='GATE-26 DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.68597, longitude=73.05804 WHERE signal_number='GATE-26' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.70238, longitude=73.05006 WHERE signal_number='GATE-22 DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.71087, longitude=73.05258 WHERE signal_number='GATE-22' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.72262, longitude=73.07855 WHERE signal_number='PEN DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.72873, longitude=73.08525 WHERE signal_number='PEN S-45' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.74051, longitude=73.08768 WHERE signal_number='PEN S-35' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.74052, longitude=73.08762 WHERE signal_number='PEN S-36' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.7412, longitude=73.08767 WHERE signal_number='PEN S-37' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.7412, longitude=73.08767 WHERE signal_number='PEN S-37' AND section='PEN-TVSG' AND line='UP TVSG' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.74039, longitude=73.08751 WHERE signal_number='PEN S-38' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.74039, longitude=73.08751 WHERE signal_number='PEN S-38' AND section='PEN-TVSG' AND line='UP TVSG' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.74041, longitude=73.08746 WHERE signal_number='PEN S-39' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.74041, longitude=73.08746 WHERE signal_number='PEN S-39' AND section='PEN-TVSG' AND line='UP TVSG' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.74587, longitude=73.08876 WHERE signal_number='PEN S-34' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.77078, longitude=73.08393 WHERE signal_number='GATE-13 DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.77831, longitude=73.08127 WHERE signal_number='GATE-13' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.80468, longitude=73.07966 WHERE signal_number='JITE DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.81468, longitude=73.08603 WHERE signal_number='JITE S-24' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.82363, longitude=73.08703 WHERE signal_number='JITE S-19' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.82363, longitude=73.08699 WHERE signal_number='JITE S-21' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.8282, longitude=73.08763 WHERE signal_number='JITE S-18' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.85861, longitude=73.13992 WHERE signal_number='APTA DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.85966, longitude=73.15027 WHERE signal_number='APTA S-24' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.86942, longitude=73.154 WHERE signal_number='APTA S-19' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.86942, longitude=73.15396 WHERE signal_number='APTA S-21' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.8732, longitude=73.1546 WHERE signal_number='APTA S-18' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.87845, longitude=73.15334 WHERE signal_number='GATE-5' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.92304, longitude=73.14808 WHERE signal_number='GATE-4 DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.93165, longitude=73.14517 WHERE signal_number='GATE-4' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.94449, longitude=73.14576 WHERE signal_number='SMNE S-39' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.95622, longitude=73.14475 WHERE signal_number='SMNE S-32' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.95667, longitude=73.14466 WHERE signal_number='SMNE S-33' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.95449, longitude=73.14501 WHERE signal_number='SMNE S-34' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.9545, longitude=73.14506 WHERE signal_number='SMNE S-35' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.95937, longitude=73.14446 WHERE signal_number='SMNE S-31' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.96726, longitude=73.14225 WHERE signal_number='GATE-1 DIST' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.97527, longitude=73.137 WHERE signal_number='GATE-1' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98151, longitude=73.13129 WHERE signal_number='PNVL S-39' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98537, longitude=73.12734 WHERE signal_number='PNVL S-34' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98537, longitude=73.12734 WHERE signal_number='PNVL S-34' AND section='PNVL-KJT' AND line='UP KJT' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98541, longitude=73.12738 WHERE signal_number='PNVL S-30' AND section='PNVL-ROHA' AND line='UP KR' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98541, longitude=73.12738 WHERE signal_number='PNVL S-30' AND section='PNVL-KJT' AND line='UP KJT' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
