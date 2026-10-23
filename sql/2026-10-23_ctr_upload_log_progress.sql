-- CTR upload log: progress and the two parser counts that were only shown on the result page.
-- The upload now answers at once and the page polls the log row (2026-10-23).
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ctr_upload_log' AND COLUMN_NAME = 'orphan_legs');
SET @s := IF(@c = 0, 'ALTER TABLE div_ctr_upload_log ADD COLUMN orphan_legs INT NOT NULL DEFAULT 0 AFTER errors_count', 'SELECT 1');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ctr_upload_log' AND COLUMN_NAME = 'skipped_rows');
SET @s := IF(@c = 0, 'ALTER TABLE div_ctr_upload_log ADD COLUMN skipped_rows INT NOT NULL DEFAULT 0 AFTER orphan_legs', 'SELECT 1');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ctr_upload_log' AND COLUMN_NAME = 'progress_rows');
SET @s := IF(@c = 0, 'ALTER TABLE div_ctr_upload_log ADD COLUMN progress_rows INT NOT NULL DEFAULT 0 AFTER skipped_rows', 'SELECT 1');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
-- Rollback: ALTER TABLE div_ctr_upload_log DROP COLUMN progress_rows, DROP COLUMN skipped_rows, DROP COLUMN orphan_legs;
