-- Bind the CLA-VDLR (BPT / Bombay Port Trust line) sections to their beat.
-- Date: 2026-07-31
--
-- CLA-VDLR (Kurla -> Wadala, BPT goods line). Shares CSMT-PNVL harbour-line signals
-- and CLA-yard (CLA-TMBY) signals — those overlap rows are same-magnet copies, to be
-- magnet-linked in the deferred pass (like the KYN-BSR 6th-line copies). User
-- decision 2026-07-31: bind to KYN_GOODS. Appended after the beat's current last (33).
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 34
FROM div_signal_beats b JOIN div_signal_book_sections s ON s.section_code = 'CLA_VDLR_BPT_UP'
WHERE b.beat_code = 'KYN_GOODS';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 35
FROM div_signal_beats b JOIN div_signal_book_sections s ON s.section_code = 'CLA_VDLR_BPT_DN'
WHERE b.beat_code = 'KYN_GOODS';
