-- Undo of 2026-09-29_new_signals_sheet4_up_th.sql (the 3 numbers did not exist before it).
START TRANSACTION;
DELETE FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet4, 2026-09-29';
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE s.section = 'CSMT-KYN' AND s.normalized_signal_number IN ('DRS38','CSMTS55','CSMTS63');
DELETE FROM div_signals WHERE section = 'CSMT-KYN' AND normalized_signal_number IN ('DRS38','CSMTS55','CSMTS63');
COMMIT;
