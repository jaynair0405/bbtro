-- Undo 2026-09-30_signal_corrections_batch9.sql
START TRANSACTION;
DELETE FROM div_signal_history WHERE change_type = 'Description Changed' AND remarks = 'Diversion text added (user 30 Sep, batch 9)';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = NULL, r.display_description = NULL
 WHERE s.book_description IN ('RI: R1= UP TH (DW S-46); R2= UP LOC (DW S-45)', 'RI: L1= DN HB; L2= CLA YD S-2', 'RI: R1= PF-5; R2= PF-4; R3= PF-2; Y= PF-1', 'RI: L1= 5TH LINE (DCC S-8); R1= DCC S-5');
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1=PF-2;MAIN=PF-3', r.display_description = NULL
 WHERE s.section = 'CSMT-PNVL' AND s.line = 'DN HB' AND s.signal_number = 'VSH S-2' AND s.book_description = 'RI: L1= PF-2; Y= PF-3';
COMMIT;
