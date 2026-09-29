-- Undo of 2026-09-29_new_signals_sheet6_kyn_kjt_dn_se.sql (the 9 numbers did not exist on KYN-KJT DN SE before it).
START TRANSACTION;
DELETE FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet6, 2026-09-29';
UPDATE div_signal_successors SET to_signal_id = NULL   WHERE id IN (151,154,160);          -- back to waiting
UPDATE div_signal_successors SET from_signal_id = NULL WHERE id IN (153,155,161);
UPDATE div_signal_successors SET from_signal_id = NULL, to_signal_id = NULL, section = NULL, direction = NULL WHERE id = 152;
UPDATE div_signals SET parallel_group_id = NULL
 WHERE section = 'KYN-KJT' AND line = 'DN SE'
   AND normalized_signal_number IN ('ABHS6','ABHS15','BUDS9','BUDS12','VGIS3','NRLS21','BVSS3');
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE s.section = 'KYN-KJT' AND s.line = 'DN SE'
   AND s.normalized_signal_number IN ('ABHS4','ABHS5','ABHS16','BUDS8','BUDS11','VGIS4','NRLS22','BVSS5','BVSS4');
DELETE FROM div_signals WHERE section = 'KYN-KJT' AND line = 'DN SE'
   AND normalized_signal_number IN ('ABHS4','ABHS5','ABHS16','BUDS8','BUDS11','VGIS4','NRLS22','BVSS5','BVSS4');
COMMIT;
