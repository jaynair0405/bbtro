-- ============================================================================
-- div_transfer_history: record the staff's REPORTING DATE at the receiving
-- lobby on every accepted transfer. Date: 2026-07-07
--
-- Together with from/to office codes this gives a complete per-lobby
-- reporting-date timeline per staff (the letter flow defaults it from the
-- letter's "Reporting Date" column; the receiving lobby can edit it while
-- accepting). div_staff_master.reporting_date keeps only the CURRENT value
-- and is updated on accept at the same time.
-- ============================================================================

SET @have := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'div_transfer_history'
     AND COLUMN_NAME = 'reporting_date');
SET @sql := IF(@have = 0,
  'ALTER TABLE div_transfer_history
     ADD COLUMN reporting_date DATE NULL AFTER transfer_date',
  'SELECT ''div_transfer_history.reporting_date already present'' AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
