-- Per-beat row hiding: a book row can be excluded from specific beats even though
-- its section is shared. Needed because CSMT PF-8..PF-16 (which do NOT work EMU
-- trains) must not appear in the suburban beats (KYN_SUB, CSMT_SUB_ML), while
-- staying in the mainline/goods beats. loadBook() filters on the current beat_code.
ALTER TABLE div_signal_book_rows
  ADD COLUMN exclude_beats VARCHAR(255) DEFAULT NULL COMMENT 'comma-list of beat_codes to hide this row in';

UPDATE div_signal_book_rows r
JOIN div_signal_book_sections sec ON sec.id = r.book_section_id AND sec.section_code = 'CSMT_KYN_DN_TH'
JOIN div_signals sg ON sg.id = r.signal_id
SET r.exclude_beats = 'KYN_SUB,CSMT_SUB_ML'
WHERE sg.signal_number IN
  ('CSMT S-8','CSMT S-9','CSMT S-10','CSMT S-11','CSMT S-12','CSMT S-13','CSMT S-14','CSMT S-15','CSMT S-16');

SELECT sg.signal_number, r.exclude_beats
FROM div_signal_book_rows r
JOIN div_signal_book_sections sec ON sec.id = r.book_section_id AND sec.section_code = 'CSMT_KYN_DN_TH'
JOIN div_signals sg ON sg.id = r.signal_id
WHERE sg.signal_number LIKE 'CSMT S-%' AND r.exclude_beats IS NOT NULL
ORDER BY r.row_order;
