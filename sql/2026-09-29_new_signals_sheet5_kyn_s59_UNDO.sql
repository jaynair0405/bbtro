-- Undo of 2026-09-29_new_signals_sheet5_kyn_s59.sql (KYN S-59 did not exist before it).
START TRANSACTION;
DELETE FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet5, 2026-09-29';
UPDATE div_signal_successors SET from_signal_id = NULL                 -- the two 14 Jun routes go back to unresolved
 WHERE from_signal_text = 'KYN S-59' AND from_line = 'DN TH' AND to_signal_text IN ('KYN S-72','KYN S-82');
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id WHERE s.normalized_signal_number = 'KYNS59';
DELETE FROM div_signals WHERE normalized_signal_number = 'KYNS59';
COMMIT;
