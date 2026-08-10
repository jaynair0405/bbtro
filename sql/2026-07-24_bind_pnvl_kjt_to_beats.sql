-- Bind the PNVL-KJT corridor sections to their beats.
-- Date: 2026-07-24
--
-- PNVL-KJT (Panvel -> Karjat, single physical line modelled as two direction
-- partitions DN KJT / UP KJT — same convention as PEN-TVSG / CLA-TMBY). User
-- decision 2026-07-24: bind to CSMT_ML_MMR + PNVL_GOODS.
--
-- Append after each beat's current last section, DN then UP:
--   CSMT_ML_MMR -> 23,24    PNVL_GOODS -> 9,10
-- INSERT IGNORE so re-running is idempotent.

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, x.ord
FROM (
            SELECT 'CSMT_ML_MMR' AS beat, 'PNVL_KJT_DN_KJT' AS sc, 23 AS ord
  UNION ALL SELECT 'CSMT_ML_MMR',        'PNVL_KJT_UP_KJT', 24
  UNION ALL SELECT 'PNVL_GOODS',         'PNVL_KJT_DN_KJT',  9
  UNION ALL SELECT 'PNVL_GOODS',         'PNVL_KJT_UP_KJT', 10
) x
JOIN div_signal_beats b        ON b.beat_code    = x.beat
JOIN div_signal_book_sections s ON s.section_code = x.sc;
