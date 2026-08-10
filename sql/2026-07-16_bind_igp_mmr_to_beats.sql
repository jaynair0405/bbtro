-- Bind the IGP-MMR corridor sections to their beat.
-- Date: 2026-07-16
--
-- IGP-MMR (Igatpuri -> Manmad, plain NE mainline, no MID) continues the KSRA-IGP
-- ghat. User decision 2026-07-16: bind to CSMT_ML_MMR ONLY (same choice as
-- LNL-PUNE; not KYN_GOODS).
--
-- Append after the beat's current last section (max display_order 20), DN then UP:
--   IGP_MMR_DN_NE -> 21
--   IGP_MMR_UP_NE -> 22
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 21
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'IGP_MMR_DN_NE'
WHERE b.beat_code = 'CSMT_ML_MMR';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 22
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'IGP_MMR_UP_NE'
WHERE b.beat_code = 'CSMT_ML_MMR';
