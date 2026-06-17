-- =============================================================
-- UP LOCAL line (CSMT_KYN_UP_LOC) — beat bindings + render fix
-- =============================================================
-- Section imported from the KYN SUB beat signal book 2026 via:
--   node scripts/import-signal-section.js \
--     data/CSMT_KYN/csmt_kyn_up_loc.xlsx --signals uploc_signals.csv --commit
--
-- Bindings:
--   KYN_SUB      — display_order 2 (the slot reserved for UP LOCAL;
--                  book index: 1 DN LOC, 2 UP LOC, 3 DN TH, 4 UP TH).
--   CSMT_SUB_ML  — display_order 4, after DN TH / UP TH / DN LOC.
-- =============================================================

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 2
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_UP_LOC'
WHERE b.beat_code = 'KYN_SUB';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 4
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_UP_LOC'
WHERE b.beat_code = 'CSMT_SUB_ML';

-- -------------------------------------------------------------
-- Render-order fix: Mumbra approach (before L-3912).
-- Book order: 500M board, 250M board, N/S, PSR 80, MBQ header.
-- The importer always places PSR-sheet rows above same-target
-- inserts, so PSR 80 lands above the board block. Move it
-- between the N/S row (3140) and the MBQ header (3150).
-- NOTE: re-running the section import resets row_order for this
-- section — re-apply this UPDATE after any re-import of
-- CSMT_KYN_UP_LOC.
-- -------------------------------------------------------------
UPDATE div_signal_book_rows r
JOIN div_signal_book_sections s ON s.id = r.book_section_id
SET r.row_order = 3145
WHERE s.section_code = 'CSMT_KYN_UP_LOC'
  AND r.row_type = 'PSR' AND r.speed_kmph = 80 AND r.row_order = 3110;

-- Verification:
-- SELECT b.beat_code, s.section_code, bs.display_order
-- FROM div_signal_beat_sections bs
-- JOIN div_signal_beats b ON b.id = bs.beat_id
-- JOIN div_signal_book_sections s ON s.id = bs.section_id
-- ORDER BY b.beat_code, bs.display_order;
