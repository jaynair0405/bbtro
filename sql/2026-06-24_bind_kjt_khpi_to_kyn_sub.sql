-- =============================================================
-- KJT-KHPI line (Karjat–Khopoli suburban shuttle) → KYN_SUB beat
-- =============================================================
-- Diversion from KJT, suburban only; not part of KJT-LNL-PUNE.
-- section='KJT-KHPI', line='DN KHPI'/'UP KHPI' (book heading "DN SE"
-- via section_title; distinct line so it doesn't conflate with KYN-KJT SE).
-- Alternate KJT->PDI paths handled as succession/diversion edges, not here.
-- Source: data/KJT-KHPI/KJT_KHPI_master.xlsx (with PSR). User directive
-- 2026-06-24: belongs to KYN_SUB beat. Completes the suburban AWS sections.
-- =============================================================
INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id,
       (SELECT COALESCE(MAX(bs2.display_order),0) FROM div_signal_beat_sections bs2 WHERE bs2.beat_id=b.id)
       + CASE s.section_code WHEN 'KJT_KHPI_DN_KHPI' THEN 1 WHEN 'KJT_KHPI_UP_KHPI' THEN 2 END
FROM div_signal_beats b
JOIN div_signal_book_sections s ON s.section_code IN ('KJT_KHPI_DN_KHPI','KJT_KHPI_UP_KHPI')
WHERE b.beat_code = 'KYN_SUB';
