-- ROHA-RN: KOLAD (KOL) signals' km/location markers were read as dates by Excel on
-- upload (e.g. "10/2" -> serial 46297). Restore the correct km markers on both the
-- source (div_signals.location_text/km_text) and the rendered row (display_location).
-- Scoped to ROHA_RN sections via book_rows join; portable to prod. Local first.
SET @kol := 'x';

UPDATE div_signals sg
JOIN div_signal_book_rows r ON r.signal_id = sg.id AND r.is_active = 1
JOIN div_signal_book_sections sec ON sec.id = r.book_section_id AND sec.section_code LIKE 'ROHA_RN%'
SET sg.location_text = CASE sg.signal_number
      WHEN 'KOL DIST' THEN '10/2' WHEN 'KOL INN DIST' THEN '11/2' WHEN 'KOL S-5' THEN '12/4'
      WHEN 'KOL S-10' THEN '12/8' WHEN 'KOL S-2' THEN '12/3' ELSE sg.location_text END,
    sg.km_text = CASE sg.signal_number
      WHEN 'KOL DIST' THEN '10/2' WHEN 'KOL INN DIST' THEN '11/2' WHEN 'KOL S-5' THEN '12/4'
      WHEN 'KOL S-10' THEN '12/8' WHEN 'KOL S-2' THEN '12/3' ELSE sg.km_text END
WHERE sg.signal_number IN ('KOL DIST','KOL INN DIST','KOL S-5','KOL S-10','KOL S-2');

UPDATE div_signal_book_rows r
JOIN div_signal_book_sections sec ON sec.id = r.book_section_id AND sec.section_code LIKE 'ROHA_RN%'
JOIN div_signals sg ON sg.id = r.signal_id
SET r.display_location = CASE sg.signal_number
      WHEN 'KOL DIST' THEN '10/2' WHEN 'KOL INN DIST' THEN '11/2' WHEN 'KOL S-5' THEN '12/4'
      WHEN 'KOL S-10' THEN '12/8' WHEN 'KOL S-2' THEN '12/3' ELSE r.display_location END
WHERE r.is_active = 1
  AND sg.signal_number IN ('KOL DIST','KOL INN DIST','KOL S-5','KOL S-10','KOL S-2');

SELECT sec.section_code, r.display_signal_no, r.display_location, sg.location_text, sg.km_text
FROM div_signal_book_rows r
JOIN div_signal_book_sections sec ON sec.id = r.book_section_id AND sec.section_code LIKE 'ROHA_RN%'
JOIN div_signals sg ON sg.id = r.signal_id
WHERE sg.signal_number IN ('KOL DIST','KOL INN DIST','KOL S-5','KOL S-10','KOL S-2')
ORDER BY sec.section_code, r.row_order;
