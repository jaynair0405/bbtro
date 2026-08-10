-- Bind MMR-SNSI (Manmad–Sainagar Shirdi branch) to the CSMT_ML_MMR beat.
-- Date: 2026-08-07
-- Branch off the NE trunk at Manmad -> own line tag SNSI DN / SNSI UP.
--   section 94 MMR_SNSI_SNSI_DN (41 signals, MMR->SNSI)   section 95 MMR_SNSI_SNSI_UP (41)
-- Boundary: MMR DIST also prints in MMR-BSL (UP NE) — one-signal-two-books, magnet-linked
-- via the full backfill re-run. Appended after CSMT_ML_MMR current max slot (39).

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, x.ord
FROM div_signal_beats b
JOIN (SELECT 'MMR_SNSI_SNSI_UP' code, 40 ord
      UNION ALL SELECT 'MMR_SNSI_SNSI_DN', 41) x
JOIN div_signal_book_sections s ON s.section_code = x.code
WHERE b.beat_code = 'CSMT_ML_MMR';
