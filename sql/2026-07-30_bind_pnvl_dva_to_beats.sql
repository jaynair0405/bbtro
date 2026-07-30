-- Bind the PNVL-Diva-Kalyan-Vasai (PNVL-DVA) complex sections to their beats.
-- Date: 2026-07-30
--
-- The PNVL -> DW/KYN/BSR complex (UP) + KYN-BSR chord: 8 shared-trunk/leg sections,
-- each signal stored once. User decision 2026-07-30: bind all to KYN_GOODS,
-- PNVL_GOODS, CSMT_ML_MMR. Sections appended after each beat's current last, in
-- route/reading order.
--   base per beat: CSMT_ML_MMR 24, KYN_GOODS 20, PNVL_GOODS 10  (order = base + 1..8)
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, base.base + o.ord
FROM (
            SELECT 'PNVL_DCC_DIVA_UP' AS sc, 1 AS ord
  UNION ALL SELECT 'DCC_DIVA_DIVA_UP', 2
  UNION ALL SELECT 'DAT_DCC_DIVA_UP',  3
  UNION ALL SELECT 'DCC_KYN_DIVA_UP',  4
  UNION ALL SELECT 'DCC_KOPAR_BSR_UP', 5
  UNION ALL SELECT 'KOPAR_BSR_BSR_UP', 6
  UNION ALL SELECT 'DW_DCC_BSR_UP',    7
  UNION ALL SELECT 'KYN_BSR_BSR_UP',   8
) o
JOIN (
            SELECT 'CSMT_ML_MMR' AS beat, 24 AS base
  UNION ALL SELECT 'KYN_GOODS',        20
  UNION ALL SELECT 'PNVL_GOODS',       10
) base
JOIN div_signal_beats b         ON b.beat_code    = base.beat
JOIN div_signal_book_sections s ON s.section_code = o.sc;
