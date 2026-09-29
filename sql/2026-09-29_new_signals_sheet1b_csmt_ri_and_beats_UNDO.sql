-- Undo of 2026-09-29_new_signals_sheet1b_csmt_ri_and_beats.sql (restores the previous values).
START TRANSACTION;
SET @dnth = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_KYN_DN_TH');
UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.display_description = 'RI: R1= CSMT S-62'
 WHERE r.book_section_id = @dnth AND s.normalized_signal_number IN ('CSMTS10','CSMTS11') AND s.section = 'CSMT-KYN';
UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.exclude_beats = NULL
 WHERE r.book_section_id = @dnth AND s.normalized_signal_number IN ('CSMTS17','CSMTS18','CSMTS59') AND s.section = 'CSMT-KYN';
COMMIT;
