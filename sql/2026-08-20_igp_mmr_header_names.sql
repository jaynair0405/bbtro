-- IGP-MMR headers: drop the "DN NE" / "UP NE" designation so the header shows just
-- the section name (kept the "LINE" suffix for consistency with other headers).
UPDATE div_signal_book_sections SET section_title = 'IGP-MMR LINE' WHERE section_code = 'IGP_MMR_DN_NE';
UPDATE div_signal_book_sections SET section_title = 'MMR-IGP LINE' WHERE section_code = 'IGP_MMR_UP_NE';

SELECT section_code, section_title FROM div_signal_book_sections WHERE section_code IN ('IGP_MMR_DN_NE','IGP_MMR_UP_NE');
