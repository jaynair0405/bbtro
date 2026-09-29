-- Signal book corrections, batch 4 (user, 2026-09-29). Every copy of each physical signal (same magnet_id) is corrected.
-- 1. LNL S-3 (KJT-LNL DN SE, only copy): add main route  Y= LINE NO.18
--    "RI: L1=PF-1; R1=PF-2; R2=PF-3; R3=PF-4" -> "...; Y= LINE NO.18".   Undo: remove "; Y= LINE NO.18".
-- 2. LNL S-64 / S-65 / S-66 (3 pages each: KJT-LNL UP SE, KJT-LNL UP SE MID, LNL-PUNE UP SE): add main route  Y= MID LINE.
--    Each page keeps its own wording of the left arm ("UP ML" / "UP SE").   Undo: remove "; Y= MID LINE".
START TRANSACTION;
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = CONCAT(s.book_description, '; Y= LINE NO.18'),
       r.display_description = CONCAT(r.display_description, '; Y= LINE NO.18')
 WHERE s.magnet_id = (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section='KJT-LNL' AND line='DN SE' AND signal_number='LNL S-3') x)
   AND s.book_description NOT LIKE '%Y=%' AND r.display_description = s.book_description;
SELECT ROW_COUNT() AS lnl3_rows;                                                -- expect 2 (1 signal + 1 book row)
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = CONCAT(s.book_description, '; Y= MID LINE'),
       r.display_description = CONCAT(r.display_description, '; Y= MID LINE')
 WHERE s.magnet_id IN (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section='KJT-LNL' AND line='UP SE'
                                        AND signal_number IN ('LNL S-64','LNL S-65','LNL S-66')) x)
   AND s.book_description NOT LIKE '%Y=%' AND r.display_description = s.book_description;
SELECT ROW_COUNT() AS lnl64_65_66_rows;                                         -- expect 18 (9 signals + 9 book rows)
COMMIT;

-- 3. PSR 20 km/h, 34/12D - 35/24, on TNA-TUH DN THB, printed just before PSK S-36 (between PSK S-32 and PSK S-36).
--    PSR master row (div_psr) + book row linked by psr_id, like the existing PSRs.
--    Undo: delete the book row (psr_id = the new id) and the div_psr row (section TNA-TUH, 34/12D-35/24, 20 km/h).
START TRANSACTION;
INSERT INTO div_psr (section, line, direction, start_km_text, end_km_text, speed_kmph, is_active)
  VALUES ('TNA-TUH', 'DN THB', 'DN', '34/12D', '35/24', 20, 1);
SET @psr = LAST_INSERT_ID();
SET @bs = (SELECT id FROM div_signal_book_sections WHERE section_code = 'TNA_TUH_DN_THB');
SET @at = (SELECT r.row_order FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
            WHERE r.book_section_id = @bs AND s.signal_number = 'PSK S-36');
SET @prev = (SELECT MAX(row_order) FROM div_signal_book_rows WHERE book_section_id = @bs AND row_order < @at);
INSERT INTO div_signal_book_rows (book_section_id, row_order, row_type, row_source, psr_id, speed_kmph, km_range_text, icon_type)
  VALUES (@bs, FLOOR((@prev + @at) / 2), 'PSR', 'manual', @psr, 20, '34/12D-35/24', 'PSR');
COMMIT;
SELECT r.row_order, r.row_type, COALESCE(s.signal_number, CONCAT(r.speed_kmph, ' KMPH ', r.km_range_text)) AS item
  FROM div_signal_book_rows r LEFT JOIN div_signals s ON s.id = r.signal_id
 WHERE r.book_section_id = (SELECT id FROM div_signal_book_sections WHERE section_code = 'TNA_TUH_DN_THB') AND r.row_order BETWEEN 200 AND 500 ORDER BY r.row_order;

-- 4. NEU S-32 (TUH-NEU DN THB, only copy): right diversion to NEU S-43 (Uran/BSU line), main route to NEU S-41
--    (Harbour line to Panvel). The signal record said "RI: R1= NEU S-41" and the page row "RI: R1= NEU S-43" —
--    both now "RI: R1= NEU S-43; Y= NEU S-41" (counts 0 L / 1 R).  Undo: record "RI: R1= NEU S-41", row "RI: R1= NEU S-43".
START TRANSACTION;
SET @neu32 = (SELECT id FROM div_signals WHERE section='TUH-NEU' AND line='DN THB' AND signal_number='NEU S-32');
UPDATE div_signals SET book_description = 'RI: R1= NEU S-43; Y= NEU S-41', ri_left_arms = 0, ri_right_arms = 1 WHERE id = @neu32;
UPDATE div_signal_book_rows SET display_description = 'RI: R1= NEU S-43; Y= NEU S-41' WHERE signal_id = @neu32;
SELECT ROW_COUNT() AS neu32_row_updated;                                         -- expect 1
UPDATE div_signal_successors SET route_condition = 'Y'
 WHERE from_signal_text = 'NEU S-32' AND to_signal_text = 'NEU S-41' AND route_condition = '';
COMMIT;
