-- Bind the PNVL-ROHA corridor sections to their beats.
-- Date: 2026-07-24
--
-- PNVL-ROHA (Panvel -> Roha, Konkan Railway, plain KR line, no MID). It continues
-- CSMT-PNVL toward Roha and, with ROHA-RN, completes PNVL -> ROHA -> RN.
-- User decision 2026-07-24: bind to FOUR beats — CSMT_ML_KR, PNVL_GOODS, KYN_SUB,
-- PNVL_SUB_HB. For each, append after that beat's current last section, DN then UP:
--   CSMT_ML_KR  -> 9,10   PNVL_GOODS -> 7,8   KYN_SUB -> 13,14   PNVL_SUB_HB -> 17,18
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, x.ord
FROM (
            SELECT 'CSMT_ML_KR'  AS beat, 'PNVL_ROHA_DN_KR' AS sc,  9 AS ord
  UNION ALL SELECT 'CSMT_ML_KR',        'PNVL_ROHA_UP_KR', 10
  UNION ALL SELECT 'PNVL_GOODS',        'PNVL_ROHA_DN_KR',  7
  UNION ALL SELECT 'PNVL_GOODS',        'PNVL_ROHA_UP_KR',  8
  UNION ALL SELECT 'KYN_SUB',           'PNVL_ROHA_DN_KR', 13
  UNION ALL SELECT 'KYN_SUB',           'PNVL_ROHA_UP_KR', 14
  UNION ALL SELECT 'PNVL_SUB_HB',       'PNVL_ROHA_DN_KR', 17
  UNION ALL SELECT 'PNVL_SUB_HB',       'PNVL_ROHA_UP_KR', 18
) x
JOIN div_signal_beats b        ON b.beat_code    = x.beat
JOIN div_signal_book_sections s ON s.section_code = x.sc;
