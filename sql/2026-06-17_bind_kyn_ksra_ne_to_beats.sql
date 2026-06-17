-- =============================================================
-- KYN-KSRA NE line (DN NE / UP NE) — beat bindings
-- =============================================================
-- Sections imported from data/KYN_KSRA/kyn_ksra_master.xlsx.
-- Bound to KYN_SUB, CSMT_SUB_ML, CSMT_ML_MMR, KYN_GOODS (user directive 2026-06-17).
-- NE reads before SE; these fill the slots reserved when SE was bound:
--   KYN_SUB / CSMT_ML_MMR / KYN_GOODS : NE -> 7,8  (SE already at 9,10)
--   CSMT_SUB_ML                       : NE -> 5,6  (SE already at 7,8)
-- KYN_SUB ordering matches its printed book index (NE 7-8, SE 9-10).
-- =============================================================

-- KYN_SUB, CSMT_ML_MMR, KYN_GOODS -> NE at 7, 8
INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 7 FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'KYN_KSRA_DN_NE'
WHERE b.beat_code IN ('KYN_SUB','CSMT_ML_MMR','KYN_GOODS');

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 8 FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'KYN_KSRA_UP_NE'
WHERE b.beat_code IN ('KYN_SUB','CSMT_ML_MMR','KYN_GOODS');

-- CSMT_SUB_ML -> NE at 5, 6
INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 5 FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'KYN_KSRA_DN_NE'
WHERE b.beat_code = 'CSMT_SUB_ML';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 6 FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'KYN_KSRA_UP_NE'
WHERE b.beat_code = 'CSMT_SUB_ML';
