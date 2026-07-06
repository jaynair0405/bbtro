-- ============================================================================
-- RECORD-ONLY: transfer_category columns (schema-drift documentation)
-- Date: 2026-07-06
--
-- transferRoutes.js has read/written `transfer_category` on both transfer
-- tables since the transfer-request feature shipped, but no committed
-- migration ever recorded the columns (they exist on LIVE and local DBs;
-- bbtro_schema.sql predates them). Definitions below copied verbatim from
-- SHOW CREATE TABLE on 2026-07-06.
--
-- The extra 'Completed' member of the status enums is documented separately
-- in sql/2026-07-06_staff_exit_statuses.sql.
--
-- Safe to run anywhere: guarded so it only adds the column where missing
-- (e.g. a dev DB rebuilt from the stale bbtro_schema.sql dump).
-- ============================================================================

SET @have_req_cat := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'div_transfer_requests'
     AND COLUMN_NAME = 'transfer_category');
SET @sql := IF(@have_req_cat = 0,
  'ALTER TABLE div_transfer_requests
     ADD COLUMN transfer_category
         ENUM(''Promotion'',''Permanent Transfer'',''Temporary Transfer'',''Inter Railway'')
         DEFAULT ''Permanent Transfer''
     AFTER to_office_code',
  'SELECT ''div_transfer_requests.transfer_category already present'' AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @have_hist_cat := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'div_transfer_history'
     AND COLUMN_NAME = 'transfer_category');
SET @sql := IF(@have_hist_cat = 0,
  'ALTER TABLE div_transfer_history
     ADD COLUMN transfer_category
         ENUM(''Promotion'',''Permanent Transfer'',''Temporary Transfer'',''Inter Railway'')
         DEFAULT ''Permanent Transfer''
     AFTER to_office_code',
  'SELECT ''div_transfer_history.transfer_category already present'' AS note');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
