-- =============================================================
-- 5TH / 6TH lines (CLA_KYN_5TH, CLA_KYN_6TH) — beat bindings
-- =============================================================
-- Sections imported from the KYN SUB beat signal book 2026 via:
--   node scripts/import-signal-section.js \
--     data/CSMT_KYN/cla_kyn_5th.xlsx --signals fifth_signals.csv --commit
--   node scripts/import-signal-section.js \
--     data/CSMT_KYN/kyn_cla_6th.xlsx --signals sixth_signals.csv --commit
--
-- KYN_SUB book index: 5 = CLA-KYN 5TH LINE, 6 = KYN-CLA 6TH LINE.
-- (Book page 17 is mis-titled "CLA - KYN 6TH LINE"; the index and
-- internal references — e.g. DN LOCAL KYN S-2 routes to "5TH S-9",
-- which sits on page 17 — confirm page 17 is the 5TH line.)
-- Only KYN_SUB is bound; CSMT_SUB_ML scope for 5th/6th TBD.
-- =============================================================

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 5
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CLA_KYN_5TH'
WHERE b.beat_code = 'KYN_SUB';

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 6
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CLA_KYN_6TH'
WHERE b.beat_code = 'KYN_SUB';

-- Verification:
-- SELECT b.beat_code, s.section_code, bs.display_order
-- FROM div_signal_beat_sections bs
-- JOIN div_signal_beats b ON b.id = bs.beat_id
-- JOIN div_signal_book_sections s ON s.id = bs.section_id
-- WHERE b.beat_code = 'KYN_SUB' ORDER BY bs.display_order;
