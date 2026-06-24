-- =============================================================
-- BSU line (Belapur/Nerul–Uran) → PNVL_SUB_HB beat
-- =============================================================
-- Convergence/divergence at KILLE cabin. Shared trunk KILLE-URAN
-- (stored once) + two legs NEU-KILLE, BEPR-KILLE, both directions.
-- Source: data/BSU_LINE/BSU UP DN.xlsx (pre-split). PSR excluded
-- (km ranges not yet filled — to be added later). Signals+stations only.
-- Reading order reflects the physical flow:
--   DN (legs merge into trunk): NEU-KILLE, BEPR-KILLE, KILLE-URAN
--   UP (trunk diverges to legs): URAN-KILLE, KILLE-NEU, KILLE-BEPR
-- Appended after the beat's existing sections.
-- =============================================================
INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id,
       (SELECT COALESCE(MAX(bs2.display_order),0) FROM div_signal_beat_sections bs2 WHERE bs2.beat_id=b.id) + x.ord
FROM div_signal_beats b
JOIN (
  SELECT 'NEU_KILLE_DN_BSU' code, 1 ord UNION ALL
  SELECT 'BEPR_KILLE_DN_BSU', 2 UNION ALL
  SELECT 'KILLE_URAN_DN_BSU', 3 UNION ALL
  SELECT 'KILLE_URAN_UP_BSU', 4 UNION ALL
  SELECT 'NEU_KILLE_UP_BSU', 5 UNION ALL
  SELECT 'BEPR_KILLE_UP_BSU', 6
) x
JOIN div_signal_book_sections s ON s.section_code = x.code
WHERE b.beat_code = 'PNVL_SUB_HB';
