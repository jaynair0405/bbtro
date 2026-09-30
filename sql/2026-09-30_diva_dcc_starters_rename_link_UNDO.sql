-- Undo 2026-09-30_diva_dcc_starters_rename_link.sql
START TRANSACTION;
UPDATE div_signals SET magnet_id = id
 WHERE section = 'DCC-DIVA' AND line = 'DIVA DN' AND signal_number IN ('DW S-56', 'DW S-57', 'DW S-58', 'DW S-59');
SET @pg = (SELECT id FROM div_signal_book_sections WHERE section_code = 'DCC_DIVA_DIVA_UP');
DELETE h FROM div_signal_history h JOIN div_signals s ON s.id = h.signal_id
 WHERE s.section = 'DCC-DIVA' AND s.line = 'DIVA UP' AND h.change_type = 'Renumbered' AND h.old_value LIKE 'DIVA S-%';
DELETE a FROM div_signal_aliases a JOIN div_signals s ON s.id = a.signal_id
 WHERE a.normalized_alias = 'DWS69' AND s.section = 'DCC-DIVA' AND s.line = 'DIVA UP';
UPDATE div_signal_aliases a JOIN div_signals s ON s.id = a.signal_id SET a.remarks = 'Auto alias from section import'
 WHERE a.normalized_alias IN ('DIVAS69', 'DIVAS56', 'DIVAS57', 'DIVAS58', 'DIVAS59') AND s.section = 'DCC-DIVA';
UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.display_signal_no = REPLACE(r.display_signal_no, 'DW S-', 'DIVA S-'),
       r.display_description = REPLACE(r.display_description, 'DW S-', 'DIVA S-')
 WHERE r.book_section_id = @pg AND s.signal_number IN ('DW S-69', 'DW S-56', 'DW S-57', 'DW S-58', 'DW S-59');
UPDATE div_signals
   SET signal_number = REPLACE(signal_number, 'DW S-', 'DIVA S-'),
       normalized_signal_number = REPLACE(normalized_signal_number, 'DWS', 'DIVAS'),
       station_code = 'DIVA',
       book_description = REPLACE(book_description, 'DW S-', 'DIVA S-')
 WHERE section = 'DCC-DIVA' AND line = 'DIVA UP' AND signal_number IN ('DW S-69', 'DW S-56', 'DW S-57', 'DW S-58', 'DW S-59');
COMMIT;
