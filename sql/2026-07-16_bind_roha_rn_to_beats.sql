-- Bind the ROHA-RN corridor sections to their beat.
-- Date: 2026-07-16
--
-- ROHA-RN (Roha -> Ratnagiri, Konkan Railway, plain KR line, no MID). User decision
-- 2026-07-16: bind to CSMT_ML_KR ONLY (KR = Konkan Railway; matches the DN KR/UP KR
-- line).
--
-- Append after the beat's current last section (max display_order 6), DN then UP:
--   ROHA_RN_DN_KR -> 7
--   ROHA_RN_UP_KR -> 8
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 7
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'ROHA_RN_DN_KR'
WHERE b.beat_code = 'CSMT_ML_KR';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 8
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'ROHA_RN_UP_KR'
WHERE b.beat_code = 'CSMT_ML_KR';
