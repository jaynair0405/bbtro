-- PNVL-KJT: km of the UP signals physically shifted by the Caution Orders of 12.08.2026 (user, 2026-09-29).
-- Book format: first OHE mast of the new position, "km/mast" with a 2-digit mast.
--   CHOK UP DIST (3036)  shifted towards Karjat  -> OHE 87/7-87/6  -> 87/07   (was 86/17)
--   CHOK S-50    (3037)  shifted towards Karjat  -> OHE 86/6-86/5  -> 86/06   (was 85/33)
--   PYJE S-47    (3046)  shifted towards Karjat  -> OHE 77/6-77/8  -> km 77/06 (had none; location stays UP/DN LOOP-1)
-- Undo: 3036 -> 86/17, 3037 -> 85/33 (location_text, km_text, display_location); 3046 km_text -> NULL.
START TRANSACTION;
UPDATE div_signals SET location_text = '87/07', km_text = '87/07' WHERE id = 3036 AND km_text = '86/17';
UPDATE div_signals SET location_text = '86/06', km_text = '86/06' WHERE id = 3037 AND km_text = '85/33';
UPDATE div_signals SET km_text = '77/06' WHERE id = 3046 AND km_text IS NULL;
UPDATE div_signal_book_rows SET display_location = CASE signal_id WHEN 3036 THEN '87/07' WHEN 3037 THEN '86/06' END
 WHERE signal_id IN (3036, 3037) AND display_location IN ('86/17', '85/33');
COMMIT;
SELECT s.id, s.signal_number, s.location_text, s.km_text, r.display_location FROM div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id WHERE s.id IN (3036, 3037, 3046);
