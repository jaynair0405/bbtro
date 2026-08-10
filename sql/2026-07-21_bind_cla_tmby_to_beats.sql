-- Bind the CLA-TMBY corridor sections to their beat.
-- Date: 2026-07-21
--
-- CLA-TMBY (Kurla -> Trombay branch, plain TMBY line, no MID, no stations/PSR/NS).
-- User decision 2026-07-21: bind to KYN_GOODS.
--
-- Append after the beat's current last section (max display_order 18), DN then UP:
--   CLA_TMBY_DN_TMBY -> 19
--   CLA_TMBY_UP_TMBY -> 20
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 19
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CLA_TMBY_DN_TMBY'
WHERE b.beat_code = 'KYN_GOODS';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 20
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CLA_TMBY_UP_TMBY'
WHERE b.beat_code = 'KYN_GOODS';
