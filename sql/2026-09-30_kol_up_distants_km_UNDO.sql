-- Undo 2026-09-30_kol_up_distants_km.sql
START TRANSACTION;
DELETE h FROM div_signal_history h JOIN div_signals s ON s.id = h.signal_id
 WHERE s.section = 'ROHA-RN' AND s.line = 'UP KR' AND s.signal_number IN ('KOL DIST', 'KOL INN DIST')
   AND h.change_type = 'Location Changed' AND h.old_value IN ('10/2', '11/2');
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.location_text = CASE s.signal_number WHEN 'KOL DIST' THEN '10/2' ELSE '11/2' END,
       s.km_text       = CASE s.signal_number WHEN 'KOL DIST' THEN '10/2' ELSE '11/2' END,
       r.display_location = CASE s.signal_number WHEN 'KOL DIST' THEN '10/2' ELSE '11/2' END
 WHERE s.section = 'ROHA-RN' AND s.line = 'UP KR' AND s.signal_number IN ('KOL DIST', 'KOL INN DIST');
COMMIT;
