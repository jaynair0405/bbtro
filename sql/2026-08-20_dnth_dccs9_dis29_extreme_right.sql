-- DN TH line (CSMT_KYN_DN_TH): the span DCC S-9 -> DI S-29 is all extreme-right
-- placement. Some rows were still Left; flatten the whole span to Extreme Right.
-- Scoped by the section (via book_rows join) + signal numbers, so it is id/row-order
-- independent and portable to prod. Local first, then prod.
UPDATE div_signals sg
JOIN div_signal_book_rows r ON r.signal_id = sg.id AND r.is_active = 1
JOIN div_signal_book_sections sec ON sec.id = r.book_section_id AND sec.section_code = 'CSMT_KYN_DN_TH'
SET sg.placement = 'Extreme Right', sg.is_ext_rhs = 1, sg.is_rhs = 0, sg.is_lhs = 0, sg.is_ext_lhs = 0
WHERE sg.signal_number IN
  ('DCC S-9','K-4401','K-4407','K-4413','K-4507','K-4509','K-4515','K-4613','K-4705','DI S-29');

SELECT sg.signal_number, sg.placement, sg.is_ext_rhs, sg.is_lhs
FROM div_signals sg
JOIN div_signal_book_rows r ON r.signal_id = sg.id AND r.is_active = 1
JOIN div_signal_book_sections sec ON sec.id = r.book_section_id AND sec.section_code = 'CSMT_KYN_DN_TH'
WHERE sg.signal_number IN
  ('DCC S-9','K-4401','K-4407','K-4413','K-4507','K-4509','K-4515','K-4613','K-4705','DI S-29')
ORDER BY r.row_order;
