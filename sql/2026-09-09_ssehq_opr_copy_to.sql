-- =====================================================================
-- OPR: the C/- (copy to) block
--
-- The one-page report goes to more people than the officer who signs it.
-- Like the delogging note's forwarding chain, the OPR ends with a list of
-- officers it is copied to for information:
--
--   C/- CEE(OP)/CR :- For kind information please
--   C/- CELE/CR :- For kind information please
--   C/- ADRM(OP) BB :- For kind information please
--
-- Stored as free text, one officer per line, exactly as the forwarding chain
-- on the delogging note is: the list is stable enough to prefill and varied
-- enough that it must stay editable per report.
-- =====================================================================

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_opr_reports'
      AND COLUMN_NAME = 'copy_to_text') = 0,
  'ALTER TABLE div_ssehq_opr_reports ADD COLUMN copy_to_text TEXT AFTER responsibility_text',
  'SELECT "copy_to_text already present" AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- verify
SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_opr_reports'
   AND COLUMN_NAME = 'copy_to_text';
