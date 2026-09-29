-- Undo of 2026-09-29_new_signals_sheet8_igp_yard.sql (none of these 13 numbers existed at IGP before it).
START TRANSACTION;
DELETE FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet8, 2026-09-29';
UPDATE div_signals SET parallel_group_id = NULL
 WHERE station_code = 'IGP' AND signal_number IN ('IGP S-64','IGP S-66','IGP S-67','IGP S-32','IGP S-38');
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE s.section IN ('KSRA-IGP','IGP-MMR') AND s.signal_number IN
   ('IGP S-69','IGP S-61','IGP S-62','IGP S-63','IGP S-71','IGP S-45','IGP S-40','IGP S-26','IGP S-27','IGP S-28','IGP S-29','IGP S-31','IGP S-37');
DELETE FROM div_signals WHERE section IN ('KSRA-IGP','IGP-MMR') AND signal_number IN
   ('IGP S-69','IGP S-61','IGP S-62','IGP S-63','IGP S-71','IGP S-45','IGP S-40','IGP S-26','IGP S-27','IGP S-28','IGP S-29','IGP S-31','IGP S-37');
COMMIT;
