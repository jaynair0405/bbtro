-- CSMT-KYN DN TH: RHS rows print red, like every other RHS row in the book (user, 2026-09-29).
-- Fixes the four PF starters added 21 Aug that were left black: CSMT S-8, S-9, S-14, S-18.
-- Undo: set text_color back to 'BLACK' for the same four rows.
START TRANSACTION;
SET @dnth = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_KYN_DN_TH');
UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.text_color = 'RED'
 WHERE r.book_section_id = @dnth AND s.section = 'CSMT-KYN' AND s.line = 'DN TH' AND s.is_rhs = 1
   AND s.normalized_signal_number IN ('CSMTS8','CSMTS9','CSMTS14','CSMTS18') AND r.text_color = 'BLACK';
SELECT ROW_COUNT() AS rows_made_red;                                             -- expect 4
COMMIT;

-- Also the four Ext RHS rows from the April import that were black (user, 2026-09-29):
-- DCC S-9, K-4401, K-4507, K-4509. Undo: set them back to 'BLACK'.
START TRANSACTION;
SET @dnth = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_KYN_DN_TH');
UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.text_color = 'RED'
 WHERE r.book_section_id = @dnth AND s.section = 'CSMT-KYN' AND s.line = 'DN TH' AND s.is_ext_rhs = 1
   AND s.normalized_signal_number IN ('DCCS9','K4401','K4507','K4509') AND r.text_color = 'BLACK';
SELECT ROW_COUNT() AS ext_rhs_rows_made_red;                                     -- expect 4
COMMIT;
