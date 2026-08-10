-- Bind PNVL-JNPT (Panvel–JNPT port freight branch) to the PNVL_GOODS beat.
-- Date: 2026-08-07
-- Own line tag JNPT DN / JNPT UP (branch convention, like PEN-TVSG's TVSG).
--   section 92 PNVL_JNPT_JNPT_DN (26 signals)   section 93 PNVL_JNPT_JNPT_UP (30 signals)
-- Boundary: Panvel signals (PNVL S-9/11/12/13/15 DN, PNVL DIST/S-24/25/26/28/29 UP) also
-- print in PNVL-ROHA / PNVL-KJT / the PNVL complex — one-signal-two-books, magnet-linked
-- via the full backfill re-run. Appended after PNVL_GOODS current max slot (23).

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, x.ord
FROM div_signal_beats b
JOIN (SELECT 'PNVL_JNPT_JNPT_UP' code, 24 ord
      UNION ALL SELECT 'PNVL_JNPT_JNPT_DN', 25) x
JOIN div_signal_book_sections s ON s.section_code = x.code
WHERE b.beat_code = 'PNVL_GOODS';
