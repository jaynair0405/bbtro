-- KSRA S-2 (KYN-KSRA DN NE): the three right route-indicator hands had no
-- destinations (R1=;R2=;R3=). Fill them: R1=PF-2, R2=PF-3, R3=PF-4. Update both the
-- source (div_signals.book_description) and the rendered row (display_description).
-- Local first, then prod. ri_left_arms/ri_right_arms already 3/3.
UPDATE div_signals
SET book_description = 'RI:L1= RD-3; L2=RD-2; L3=RD-1; R1=PF-2; R2=PF-3; R3=PF-4'
WHERE signal_number = 'KSRA S-2' AND section = 'KYN-KSRA' AND line = 'DN NE';

UPDATE div_signal_book_rows r
JOIN div_signal_book_sections sec ON sec.id = r.book_section_id AND sec.section_code = 'KYN_KSRA_DN_NE'
SET r.display_description = 'RI:L1= RD-3; L2=RD-2; L3=RD-1; R1=PF-2; R2=PF-3; R3=PF-4'
WHERE r.display_signal_no = 'KSRA S-2' AND r.is_active = 1;

SELECT sg.signal_number, sg.ri_left_arms, sg.ri_right_arms, sg.book_description
FROM div_signals sg WHERE sg.signal_number = 'KSRA S-2' AND sg.section = 'KYN-KSRA' AND sg.line = 'DN NE';
