-- Follow-up to sheet 7 (user, 2026-09-29):
--   ABH S-21 is the PF-2 starter: function 'Starter' (the sheet said 'Starter (Loop)').
--   BVS S-17 location: 'MID LOOP LINE' (blank in the sheet).
-- Undo: set ABH S-21 signal_function back to 'Starter (Loop)'; BVS S-17 location_text and display_location back to NULL.
START TRANSACTION;
UPDATE div_signals SET signal_function = 'Starter'
 WHERE section = 'KYN-KJT' AND line = 'UP SE' AND direction = 'UP' AND normalized_signal_number = 'ABHS21' AND signal_function = 'Starter (Loop)';
SELECT ROW_COUNT() AS abh21_updated;                                             -- expect 1
UPDATE div_signals SET location_text = 'MID LOOP LINE'
 WHERE section = 'KYN-KJT' AND line = 'UP SE' AND direction = 'UP' AND normalized_signal_number = 'BVSS17' AND location_text IS NULL;
UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id SET r.display_location = 'MID LOOP LINE'
 WHERE s.section = 'KYN-KJT' AND s.line = 'UP SE' AND s.normalized_signal_number = 'BVSS17' AND r.display_location IS NULL;
SELECT ROW_COUNT() AS bvs17_row_updated;                                         -- expect 1
COMMIT;
SELECT s.signal_number, s.signal_function, s.location_text, r.display_location FROM div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
 WHERE s.section = 'KYN-KJT' AND s.line = 'UP SE' AND s.normalized_signal_number IN ('ABHS21','BVSS17');
