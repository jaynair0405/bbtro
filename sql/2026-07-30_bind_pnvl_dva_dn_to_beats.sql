-- Bind the PNVL-DVA complex DN (reverse) sections to their beats.
-- Date: 2026-07-30
--
-- The reverse master (BSR/KYN -> PNVL/DW, DN): 5 sections mirroring the UP complex
-- (same section names, DN lines). User decision: bind to KYN_GOODS, PNVL_GOODS,
-- CSMT_ML_MMR (same as the UP complex). Appended after each beat's current last.
--   base: CSMT_ML_MMR 32, KYN_GOODS 28, PNVL_GOODS 18  (order = base + 1..5)
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, base.base + o.ord
FROM (
            SELECT 'KOPAR_BSR_BSR_DN' AS sc, 1 AS ord
  UNION ALL SELECT 'DCC_KYN_DIVA_DN',  2
  UNION ALL SELECT 'DAT_DCC_DIVA_DN',  3
  UNION ALL SELECT 'DCC_DIVA_DIVA_DN', 4
  UNION ALL SELECT 'PNVL_DCC_DIVA_DN', 5
) o
JOIN (
            SELECT 'CSMT_ML_MMR' AS beat, 32 AS base
  UNION ALL SELECT 'KYN_GOODS',        28
  UNION ALL SELECT 'PNVL_GOODS',       18
) base
JOIN div_signal_beats b         ON b.beat_code    = base.beat
JOIN div_signal_book_sections s ON s.section_code = o.sc;
