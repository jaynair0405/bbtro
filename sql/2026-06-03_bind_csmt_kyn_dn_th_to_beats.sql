-- =============================================================
-- Bind shared section CSMT_KYN_DN_TH to additional beats.
-- =============================================================
-- The DN through line CSMT → KYN is shared across multiple beats.
-- Pre-state: only CSMT_SUB_ML referenced this section. Adding
-- three more beats demonstrates the "edit once, reflect in many"
-- model from the schema refactor.
--
-- display_order = 1 for each new beat since none of them have
-- any other sections yet; will be re-ordered when more sections
-- get added.
-- =============================================================

INSERT INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 1
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_DN_TH'
WHERE b.beat_code IN ('CSMT_ML_KR', 'CSMT_ML_MMR', 'KYN_GOODS');

-- Verification:
-- SELECT b.beat_code, s.section_code, bs.display_order
-- FROM div_signal_beat_sections bs
-- JOIN div_signal_beats b ON b.id = bs.beat_id
-- JOIN div_signal_book_sections s ON s.id = bs.section_id
-- ORDER BY b.beat_code;
