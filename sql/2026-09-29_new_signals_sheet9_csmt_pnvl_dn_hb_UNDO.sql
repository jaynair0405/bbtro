-- Undo of 2026-09-29_new_signals_sheet9_csmt_pnvl_dn_hb.sql
START TRANSACTION;
UPDATE div_signal_successors SET from_signal_id = NULL WHERE id = 787;
UPDATE div_signal_successors SET to_signal_id = NULL   WHERE id = 486;
UPDATE div_signals SET parallel_group_id = NULL WHERE section = 'CSMT-PNVL' AND line = 'DN HB' AND signal_number IN ('CLA S-12','PNVL S-403');
UPDATE div_signals SET has_calling_on = 0 WHERE section = 'CSMT-PNVL' AND line = 'DN HB' AND signal_number = 'RVJ S-15';
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE s.section = 'CSMT-PNVL' AND s.line = 'DN HB' AND s.normalized_signal_number IN ('CLAS13','PNVLS404');
DELETE FROM div_signals WHERE section = 'CSMT-PNVL' AND line = 'DN HB' AND normalized_signal_number IN ('CLAS13','PNVLS404');
COMMIT;
