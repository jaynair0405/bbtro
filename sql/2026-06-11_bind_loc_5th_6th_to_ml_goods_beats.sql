-- =============================================================
-- Bind LOCAL + 5TH/6TH sections to CSMT_ML_KR, CSMT_ML_MMR,
-- KYN_GOODS (user directive 2026-06-11).
-- =============================================================
-- All three beats already carry DN TH (1) / UP TH (2).
-- Appended: 3 = DN LOC, 4 = UP LOC, 5 = 5TH, 6 = 6TH —
-- same ordering as CSMT_SUB_ML/KYN_SUB.
-- =============================================================

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 3
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_DN_LOC'
WHERE b.beat_code IN ('CSMT_ML_KR', 'CSMT_ML_MMR', 'KYN_GOODS');

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 4
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_UP_LOC'
WHERE b.beat_code IN ('CSMT_ML_KR', 'CSMT_ML_MMR', 'KYN_GOODS');

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 5
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CLA_KYN_5TH'
WHERE b.beat_code IN ('CSMT_ML_KR', 'CSMT_ML_MMR', 'KYN_GOODS');

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 6
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CLA_KYN_6TH'
WHERE b.beat_code IN ('CSMT_ML_KR', 'CSMT_ML_MMR', 'KYN_GOODS');

-- Verification:
-- SELECT b.beat_code, s.section_code, bs.display_order
-- FROM div_signal_beat_sections bs
-- JOIN div_signal_beats b ON b.id = bs.beat_id
-- JOIN div_signal_book_sections s ON s.id = bs.section_id
-- WHERE b.beat_code IN ('CSMT_ML_KR','CSMT_ML_MMR','KYN_GOODS')
-- ORDER BY b.beat_code, bs.display_order;
