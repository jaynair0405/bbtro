-- Signal book corrections, batch 6 (user, 2026-09-29). Every copy of each physical signal corrected.
-- 1. BUD S-28 (KYN-KJT UP SE, only copy): had 1 left arm recorded but no RI text, so nothing was drawn.
--    -> "RI: L1= UP LOOP (BUD S-23); Y= BUD S-24" (counts 1 L / 0 R); main route S-24 recorded (Y).
--    Undo: text NULL; delete the BUD S-28 -> BUD S-24 route with remarks 'corrections batch6, 2026-09-29'.
START TRANSACTION;
SET @bud28 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND signal_number='BUD S-28');
SET @bud24 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND signal_number='BUD S-24');
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= UP LOOP (BUD S-23); Y= BUD S-24', s.ri_left_arms = 1, s.ri_right_arms = 0,
       r.display_description = 'RI: L1= UP LOOP (BUD S-23); Y= BUD S-24'
 WHERE s.magnet_id = (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE id = @bud28) x);
SELECT ROW_COUNT() AS bud28_rows;                                                 -- expect 2 (signal + book row)
UPDATE div_signal_successors SET route_condition = 'L1'
 WHERE from_signal_text = 'BUD S-28' AND to_signal_text = 'BUD S-23' AND route_condition = 'BUD UP LOOP';
INSERT IGNORE INTO div_signal_successors
  (from_signal_id, from_signal_text, from_line, to_signal_id, to_signal_text, to_line, succession_type, route_condition, section, direction, remarks)
  VALUES (@bud28, 'BUD S-28', 'UP SE', @bud24, 'BUD S-24', 'UP SE', 'PLATFORM_ROUTING', 'Y', 'KYN-KJT', 'UP', 'corrections batch6, 2026-09-29');
COMMIT;
