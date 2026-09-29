-- Undo of 2026-09-29_new_signals_sheet7_kjt_kyn_up_se.sql (the 8 numbers did not exist on KYN-KJT UP SE before it).
START TRANSACTION;
DELETE FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet7, 2026-09-29';
UPDATE div_signal_successors SET to_signal_id = NULL   WHERE id IN (162,206,207,211,212);   -- back to waiting
UPDATE div_signal_successors SET from_signal_id = NULL WHERE id IN (163,209,214);
UPDATE div_signal_successors SET from_signal_id = NULL, to_signal_id = NULL WHERE id IN (208,213);
UPDATE div_signals SET parallel_group_id = NULL
 WHERE section = 'KYN-KJT' AND line = 'UP SE' AND signal_number IN ('BVS S-19','NRL S-12','VGI S-24','BUD S-24','ABH S-25','ABH S-22');
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE s.section = 'KYN-KJT' AND s.line = 'UP SE'
   AND s.normalized_signal_number IN ('BVSS18','BVSS17','NRLS11','NRLS23','VGIS23','BUDS23','ABHS26','ABHS21');
DELETE FROM div_signals WHERE section = 'KYN-KJT' AND line = 'UP SE'
   AND normalized_signal_number IN ('BVSS18','BVSS17','NRLS11','NRLS23','VGIS23','BUDS23','ABHS26','ABHS21');
COMMIT;
