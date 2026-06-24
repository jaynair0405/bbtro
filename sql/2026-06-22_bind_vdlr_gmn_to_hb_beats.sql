-- =============================================================
-- VDLR-GMN harbour branch (Wadala–Goregaon) → CSMT_HB + PNVL_SUB_HB
-- =============================================================
-- Source: data/TNA_VSH/VDLR_GMN/VDLR-GMN-VDLR.xlsx (with PSR).
-- Full route is CSMT-GMN-CSMT; CSMT→VDLR (up to RVJ S-9) is the shared
-- main-HB head — imported as-is, so RVJ S-6/S-9 are intentionally shared
-- (duplicated) with the CSMT-PNVL HB section (user directive 2026-06-22).
-- Appended after each beat's existing HB/THB sections.
-- =============================================================
INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id,
       (SELECT COALESCE(MAX(bs2.display_order),0) FROM div_signal_beat_sections bs2 WHERE bs2.beat_id=b.id)
       + CASE s.section_code WHEN 'VDLR_GMN_DN_HB' THEN 1 WHEN 'GMN_VDLR_UP_HB' THEN 2 END
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code IN ('VDLR_GMN_DN_HB','GMN_VDLR_UP_HB')
WHERE b.beat_code IN ('CSMT_HB','PNVL_SUB_HB');
