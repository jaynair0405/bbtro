-- Bind the PEN-TVSG corridor sections to their beat.
-- Date: 2026-07-17
--
-- PEN-TVSG (Pen -> Thal/TVSG branch, plain TVSG line, no MID, no stations/PSR/NS).
-- User decision 2026-07-17: bind to PNVL_GOODS.
--
-- Append after the beat's current last section (max display_order 4), DN then UP:
--   PEN_TVSG_DN_TVSG -> 5
--   PEN_TVSG_UP_TVSG -> 6
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 5
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'PEN_TVSG_DN_TVSG'
WHERE b.beat_code = 'PNVL_GOODS';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 6
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'PEN_TVSG_UP_TVSG'
WHERE b.beat_code = 'PNVL_GOODS';
