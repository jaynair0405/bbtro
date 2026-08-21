-- PNVL S-3 (PNVL-DCC / DIVA DN): arms already correct (3 left / 1 right). Add the
-- yellow route indicator Y=DN Main Line. Update source + rendered row. Local first.
UPDATE div_signals
SET book_description = 'RI: L1=UDL (PNVL S-12); L2= PF-6 (PNVL S-11); L3= PF-7 (PNVL S-9); R1= PF-5 (PNVL S-15); Y=DN Main Line'
WHERE signal_number = 'PNVL S-3' AND section = 'PNVL-DCC' AND line = 'DIVA DN';

UPDATE div_signal_book_rows r
JOIN div_signal_book_sections sec ON sec.id = r.book_section_id AND sec.section_code = 'PNVL_DCC_DIVA_DN'
SET r.display_description = 'RI: L1=UDL (PNVL S-12); L2= PF-6 (PNVL S-11); L3= PF-7 (PNVL S-9); R1= PF-5 (PNVL S-15); Y=DN Main Line'
WHERE r.display_signal_no = 'PNVL S-3' AND r.is_active = 1;

SELECT signal_number, ri_left_arms, ri_right_arms, book_description
FROM div_signals WHERE signal_number = 'PNVL S-3' AND section = 'PNVL-DCC' AND line = 'DIVA DN';
