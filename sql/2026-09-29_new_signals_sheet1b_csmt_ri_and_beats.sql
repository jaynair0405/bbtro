-- Follow-up to 2026-09-29_new_signals_sheet1_csmt_kyn.sql, user decisions 2026-09-29:
--  1. CSMT S-10, S-11: add the main (yellow) route to the RI text  -> "RI: R1= CSMT S-62 ; Y= CSMT S-76"
--  2. CSMT PF starters S-8 onwards, and the yard signals after them, are NOT shown on suburban beats:
--     S-17, S-18 and S-59 get the same exclude_beats as S-8..S-16, S-76, S-62 ('KYN_SUB,CSMT_SUB_ML').
-- Undo: 2026-09-29_new_signals_sheet1b_csmt_ri_and_beats_UNDO.sql
START TRANSACTION;
SET @dnth = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_KYN_DN_TH');

UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.display_description = 'RI: R1= CSMT S-62 ; Y= CSMT S-76'
 WHERE r.book_section_id = @dnth AND s.section = 'CSMT-KYN' AND s.line = 'DN TH'
   AND s.normalized_signal_number IN ('CSMTS10','CSMTS11')
   AND r.display_description = 'RI: R1= CSMT S-62';
SELECT ROW_COUNT() AS ri_rows_updated;                                           -- expect 2

UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.exclude_beats = 'KYN_SUB,CSMT_SUB_ML'
 WHERE r.book_section_id = @dnth AND s.section = 'CSMT-KYN' AND s.line = 'DN TH'
   AND s.normalized_signal_number IN ('CSMTS17','CSMTS18','CSMTS59')
   AND r.exclude_beats IS NULL;
SELECT ROW_COUNT() AS exclude_rows_updated;                                      -- expect 3
COMMIT;

SELECT r.row_order, s.signal_number, r.display_description, r.exclude_beats
  FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE r.book_section_id = @dnth AND r.row_order BETWEEN 508 AND 775 ORDER BY r.row_order;
