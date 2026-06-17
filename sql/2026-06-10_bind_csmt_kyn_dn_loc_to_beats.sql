-- =============================================================
-- DN LOCAL line (CSMT_KYN_DN_LOC) — beat bindings + render fix
-- =============================================================
-- Section imported from the KYN SUB beat signal book 2026 via:
--   node scripts/import-signal-section.js \
--     data/CSMT_KYN/csmt_kyn_dn_loc.xlsx --signals dnloc_signals.csv --commit
--
-- Bindings:
--   KYN_SUB      — its book lists DN LOCAL as section 1, DN TH as 3,
--                  UP TH as 4 (display_order 2 reserved for UP LOCAL).
--   CSMT_SUB_ML  — shares the corridor; locals appended after TH lines.
-- =============================================================

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 1
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_DN_LOC'
WHERE b.beat_code = 'KYN_SUB';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 3
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_DN_TH'
WHERE b.beat_code = 'KYN_SUB';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 4
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_UP_TH'
WHERE b.beat_code = 'KYN_SUB';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 3
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_DN_LOC'
WHERE b.beat_code = 'CSMT_SUB_ML';

-- -------------------------------------------------------------
-- Render-order fix: Mumbra approach (before L-3911).
-- Book order: 500M board, 250M board, N/S, PSR 80, L-3911.
-- The importer always places PSR-sheet rows above same-target
-- inserts, so PSR 80 lands above the board block. Move it just
-- below the N/S row. NOTE: re-running the section import resets
-- row_order for this section — re-apply this UPDATE after any
-- re-import of CSMT_KYN_DN_LOC.
-- -------------------------------------------------------------
UPDATE div_signal_book_rows r
JOIN div_signal_book_sections s ON s.id = r.book_section_id
SET r.row_order = 10060
WHERE s.section_code = 'CSMT_KYN_DN_LOC'
  AND r.row_type = 'PSR' AND r.speed_kmph = 80 AND r.row_order = 10020;

-- Verification:
-- SELECT b.beat_code, s.section_code, bs.display_order
-- FROM div_signal_beat_sections bs
-- JOIN div_signal_beats b ON b.id = bs.beat_id
-- JOIN div_signal_book_sections s ON s.id = bs.section_id
-- ORDER BY b.beat_code, bs.display_order;
