-- =============================================================
-- Bind CSMT_KYN_UP_TH (KYN-CSMT UP TH LINE) to beats.
-- Same set as the DN TH section: CSMT_ML_KR, CSMT_ML_MMR,
-- CSMT_SUB_ML, KYN_GOODS.
-- display_order = 2 because each of those beats already has the
-- DN TH section at display_order = 1.
-- =============================================================

INSERT INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 2
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_UP_TH'
WHERE b.beat_code IN ('CSMT_ML_KR', 'CSMT_ML_MMR', 'CSMT_SUB_ML', 'KYN_GOODS');
