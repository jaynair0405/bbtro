-- ROHA-RN UP KR (RN -> ROHA): KOL DIST and KOL INN DIST carried the DN distants' km (10/2, 11/2), so on the UP page
-- they sat after KOL home S-46 (14/4) with km rising. User 2026-09-30, from the book: UP distant 16/5, inner distant 15/4.
-- UP page only; the DN distants (10/2, 11/2) are separate signals and unchanged.
-- Undo: 2026-09-30_kol_up_distants_km_UNDO.sql
START TRANSACTION;
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.location_text = CASE s.signal_number WHEN 'KOL DIST' THEN '16/5' ELSE '15/4' END,
       s.km_text       = CASE s.signal_number WHEN 'KOL DIST' THEN '16/5' ELSE '15/4' END,
       r.display_location = CASE s.signal_number WHEN 'KOL DIST' THEN '16/5' ELSE '15/4' END
 WHERE s.section = 'ROHA-RN' AND s.line = 'UP KR' AND s.is_active = 1
   AND ((s.signal_number = 'KOL DIST' AND s.km_text = '10/2') OR (s.signal_number = 'KOL INN DIST' AND s.km_text = '11/2'));
SELECT ROW_COUNT() AS rows_changed;                                             -- expect 4 (2 signals + 2 book rows)
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT id, 'Location Changed', CASE signal_number WHEN 'KOL DIST' THEN '10/2' ELSE '11/2' END, km_text, CURDATE(),
         'UP distant carried the DN distant km; corrected from the book (user 30 Sep)'
    FROM div_signals WHERE section = 'ROHA-RN' AND line = 'UP KR' AND signal_number IN ('KOL DIST', 'KOL INN DIST');
COMMIT;
SELECT r.row_order, s.signal_number, s.km_text, r.display_location FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE r.book_section_id = (SELECT id FROM div_signal_book_sections WHERE section_code = 'ROHA_RN_UP_KR') AND r.row_order BETWEEN 9800 AND 10300 ORDER BY r.row_order;
