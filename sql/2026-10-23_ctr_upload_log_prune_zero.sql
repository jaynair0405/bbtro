-- One-off: drop upload-log rows that stored nothing (repeat uploads of a file already loaded,
-- made when the old synchronous upload gave no sign of life). Since 2a8bf06 such rows are
-- hidden from the history anyway; this removes the old ones. Rows referenced by a duty are kept.
DELETE u FROM div_ctr_upload_log u
WHERE u.status = 'COMPLETED' AND u.duties_created = 0 AND u.legs_created = 0
  AND NOT EXISTS (SELECT 1 FROM div_ctr_duties d WHERE d.upload_batch_id = u.batch_id);
SELECT ROW_COUNT() AS zero_rows_deleted;
SELECT COUNT(*) AS rows_left FROM div_ctr_upload_log;
