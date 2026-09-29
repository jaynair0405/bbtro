-- Undo of 2026-09-29_new_signals_sheet14_15_kopar_bsr.sql (the 11 numbers did not exist on these pages before it).
START TRANSACTION;
DELETE FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29';
UPDATE div_signals SET parallel_group_id = NULL WHERE section = 'KOPAR-BSR' AND (
   (line = 'BSR UP' AND signal_number IN ('BIRD S-5','KHBV S-6','KARD S-4'))
OR (line = 'BSR DN' AND signal_number IN ('KARD S-18','KHBV S-21','BIRD S-23')));
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id WHERE s.section = 'KOPAR-BSR' AND (
   (s.line = 'BSR UP' AND s.signal_number IN ('BIRD S-4','BIRD S-3','KHBV S-5','KARD S-3'))
OR (s.line = 'BSR DN' AND s.signal_number IN ('KARD S-19','KARD S-17','KHBV S-22','BIRD S-24','BIRD S-25','BIRD S-21','BIRD S-22')));
DELETE FROM div_signals WHERE section = 'KOPAR-BSR' AND (
   (line = 'BSR UP' AND signal_number IN ('BIRD S-4','BIRD S-3','KHBV S-5','KARD S-3'))
OR (line = 'BSR DN' AND signal_number IN ('KARD S-19','KARD S-17','KHBV S-22','BIRD S-24','BIRD S-25','BIRD S-21','BIRD S-22')));
COMMIT;
