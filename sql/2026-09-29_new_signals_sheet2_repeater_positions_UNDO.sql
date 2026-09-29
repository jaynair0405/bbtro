-- Undo of 2026-09-29_new_signals_sheet2_repeater_positions.sql (restores the 21 Aug positions).
START TRANSACTION;
SET @dnhb = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_PNVL_DN_HB');
UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.row_order = CASE s.normalized_signal_number
         WHEN 'H09REP' THEN 595 WHEN 'H13REP' THEN 795 WHEN 'H23REP' THEN 1295
         WHEN 'MNKDS4REP' THEN 4395 WHEN 'VSHS5REP' THEN 5995 END
 WHERE r.book_section_id = @dnhb AND s.section = 'CSMT-PNVL'
   AND s.normalized_signal_number IN ('H09REP','H13REP','H23REP','MNKDS4REP','VSHS5REP');
COMMIT;
