-- Undo 2026-09-30_link_me_copies_dcc_pages.sql
START TRANSACTION;
UPDATE div_signals SET magnet_id = id
 WHERE section = 'DCC-KYN' AND line = 'DIVA UP' AND signal_number IN ('ME 4515', 'ME 4809', 'ME 4903', 'ME 4913', 'ME 5007');
UPDATE div_signals SET magnet_id = id WHERE section = 'DCC-DIVA' AND line = 'DIVA DN' AND signal_number = 'ME 4310';
UPDATE div_signals SET visibility_distance_m = NULL WHERE section = 'CLA-KYN' AND line = '6TH' AND signal_number = 'ME 4310';
COMMIT;
