-- =============================================================
-- KYN-KJT SE line (DN SE / UP SE) — beat bindings
-- =============================================================
-- Sections imported from data/KYN_KJT/kyn_kjt_master.xlsx via:
--   node scripts/import-signal-section.js \
--     data/KYN_KJT/kyn_kjt_dn_se.xlsx --signals data/KYN_KJT/dnse_signals.xlsx --commit
--   node scripts/import-signal-section.js \
--     data/KYN_KJT/kyn_kjt_up_se.xlsx --signals data/KYN_KJT/upse_signals.xlsx --commit
--
-- Bound to KYN_SUB, CSMT_SUB_ML, CSMT_ML_MMR, KYN_GOODS (user directive 2026-06-15).
-- NE (KYN-KSRA) reads before SE, so the two slots before SE are reserved
-- for the NE sections (not yet imported):
--   KYN_SUB / CSMT_ML_MMR / KYN_GOODS (max order 6): NE→7,8  SE→9,10
--   CSMT_SUB_ML            (max order 4):             NE→5,6  SE→7,8
-- KYN_SUB ordering also matches its printed book index (NE 7-8, SE 9-10).
-- =============================================================

-- KYN_SUB, CSMT_ML_MMR, KYN_GOODS → SE at 9, 10
INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 9
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'KYN_KJT_DN_SE'
WHERE b.beat_code IN ('KYN_SUB', 'CSMT_ML_MMR', 'KYN_GOODS');

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 10
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'KYN_KJT_UP_SE'
WHERE b.beat_code IN ('KYN_SUB', 'CSMT_ML_MMR', 'KYN_GOODS');

-- CSMT_SUB_ML → SE at 7, 8
INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 7
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'KYN_KJT_DN_SE'
WHERE b.beat_code = 'CSMT_SUB_ML';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 8
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'KYN_KJT_UP_SE'
WHERE b.beat_code = 'CSMT_SUB_ML';

-- Verification:
-- SELECT b.beat_code, s.section_code, bs.display_order
-- FROM div_signal_beat_sections bs
-- JOIN div_signal_beats b ON b.id = bs.beat_id
-- JOIN div_signal_book_sections s ON s.id = bs.section_id
-- WHERE b.beat_code IN ('KYN_SUB','CSMT_SUB_ML','CSMT_ML_MMR','KYN_GOODS')
-- ORDER BY b.beat_code, bs.display_order;
