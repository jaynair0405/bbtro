-- =============================================================
-- CSMT-PNVL harbour line (DN HB / UP HB) — beat bindings
-- =============================================================
-- Sections imported from data/CSMT_PNVL/csmt_pnvl_master.xlsx via:
--   node scripts/import-signal-section.js \
--     data/CSMT_PNVL/csmt_pnvl_dn_hb.xlsx --signals data/CSMT_PNVL/dnhb_signals.xlsx --commit
--   node scripts/import-signal-section.js \
--     data/CSMT_PNVL/csmt_pnvl_up_hb.xlsx --signals data/CSMT_PNVL/uphb_signals.xlsx --commit
--
-- Both directions bound to both harbour beats (user directive):
--   CSMT_HB      — 1 = DN HB, 2 = UP HB
--   PNVL_SUB_HB  — 1 = DN HB, 2 = UP HB
--   (user said "PNVL_HB"; the existing beat code is PNVL_SUB_HB)
-- =============================================================

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 1
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_PNVL_DN_HB'
WHERE b.beat_code IN ('CSMT_HB', 'PNVL_SUB_HB');

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, 2
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code = 'CSMT_PNVL_UP_HB'
WHERE b.beat_code IN ('CSMT_HB', 'PNVL_SUB_HB');

-- Verification:
-- SELECT b.beat_code, s.section_code, bs.display_order
-- FROM div_signal_beat_sections bs
-- JOIN div_signal_beats b ON b.id = bs.beat_id
-- JOIN div_signal_book_sections s ON s.id = bs.section_id
-- WHERE b.beat_code IN ('CSMT_HB','PNVL_SUB_HB') ORDER BY b.beat_code, bs.display_order;
