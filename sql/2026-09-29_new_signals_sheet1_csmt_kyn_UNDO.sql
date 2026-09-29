-- Undo of 2026-09-29_new_signals_sheet1_csmt_kyn.sql (the 6 numbers did not exist before it).
START TRANSACTION;
DELETE FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet1, 2026-09-29';
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE s.section = 'CSMT-KYN' AND s.normalized_signal_number IN ('CSMTS76','CSMTS62','CSMTS59','DRS14','BNDS28','TNAS66');
UPDATE div_signals SET parallel_group_id = NULL
 WHERE section = 'CSMT-KYN' AND normalized_signal_number IN ('DRS15','DRS14','BNDS27','BNDS28');
DELETE FROM div_signals
 WHERE section = 'CSMT-KYN' AND normalized_signal_number IN ('CSMTS76','CSMTS62','CSMTS59','DRS14','BNDS28','TNAS66');
COMMIT;
