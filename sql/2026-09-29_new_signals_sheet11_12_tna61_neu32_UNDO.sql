-- Undo of 2026-09-29_new_signals_sheet11_12_tna61_neu32.sql (puts the two signals back where they were on 19 Aug).
START TRANSACTION;
DELETE FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet11-12, 2026-09-29';
UPDATE div_signal_successors SET from_signal_id = NULL WHERE id = 493;
UPDATE div_signal_successors SET to_signal_id = NULL WHERE id = 471;
UPDATE div_signal_successors SET from_signal_id = NULL, to_signal_id = NULL, to_line = 'DN THB' WHERE id = 473;
UPDATE div_signal_successors SET to_signal_id = NULL, to_line = 'DN THB' WHERE id = 472;
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE (s.signal_number = 'TNA S-61' AND s.line = 'DN THB') OR (s.signal_number = 'NEU S-32' AND s.line = 'DN THB');
UPDATE div_signals SET parallel_group_id = NULL
 WHERE line = 'DN THB' AND signal_number IN ('TNA S-61','TNA S-62','NEU S-31','NEU S-32');
UPDATE div_signals SET section = 'TNA-VSH', line = 'THB' WHERE signal_number = 'TNA S-61' AND section = 'TNA-TUH' AND line = 'DN THB';
UPDATE div_signals SET section = 'TNA-NEU', line = 'THB' WHERE signal_number = 'NEU S-32' AND section = 'TUH-NEU' AND line = 'DN THB';
COMMIT;
