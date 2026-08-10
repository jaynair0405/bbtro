-- Bind the LNL-PUNE corridor sections to their beat.
-- Date: 2026-07-14
--
-- LNL-PUNE (Lonavala -> Pune, plain SE running line, no MID) is the direct
-- continuation of the KJT-LNL ghat. User decision 2026-07-14: bind to
-- CSMT_ML_MMR ONLY (unlike KJT-LNL, which is also on KYN_GOODS + PNVL_GOODS).
--
-- Order: append after the beat's current last section (max display_order 18),
-- DN then UP (same convention as KJT-LNL: DN_SE, UP_SE).
--   LNL_PUNE_DN_SE -> 19
--   LNL_PUNE_UP_SE -> 20
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 19
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'LNL_PUNE_DN_SE'
WHERE b.beat_code = 'CSMT_ML_MMR';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 20
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'LNL_PUNE_UP_SE'
WHERE b.beat_code = 'CSMT_ML_MMR';
