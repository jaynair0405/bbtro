-- MMR S-6 (UP starter, PF-3): location '259/26' -> 'PF-3 STR 259/26' on both book copies (local + prod). Date: 2026-10-26.
-- Copies (same magnet_id): IGP-MMR UP NE and MMR-BSL UP NE. Guarded on the old value, so re-running is a no-op.
-- The book prints div_signal_book_rows.display_location, so that is updated too. No section drafts existed for either page.
START TRANSACTION;

INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT id, 'Location Changed', location_text, 'PF-3 STR 259/26', CURDATE(), 'PF-3 UP starter named in location (user, 2026-10-26)'
    FROM div_signals
   WHERE signal_number = 'MMR S-6' AND line = 'UP NE' AND section IN ('IGP-MMR','MMR-BSL') AND location_text = '259/26';

UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.display_location = 'PF-3 STR 259/26'
 WHERE s.signal_number = 'MMR S-6' AND s.line = 'UP NE' AND s.section IN ('IGP-MMR','MMR-BSL') AND r.display_location = '259/26';
SELECT ROW_COUNT() AS book_rows;   -- expect 2

UPDATE div_signals SET location_text = 'PF-3 STR 259/26'
 WHERE signal_number = 'MMR S-6' AND line = 'UP NE' AND section IN ('IGP-MMR','MMR-BSL') AND location_text = '259/26';
SELECT ROW_COUNT() AS signals;     -- expect 2

COMMIT;
