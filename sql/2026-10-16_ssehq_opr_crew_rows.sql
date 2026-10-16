-- SSE-HQ OPR: the crew is a table, not two boxes.
--
-- A train can carry more than one ALP (OPR 11 had "ALP-1 … ; ALP-2 …" typed
-- into the single ALP box), so the report now holds crew_rows JSON:
--   [{role:'LP'|'ALP', name, hrms_id, temp}, ...]
-- lp_name / lp_staff_hrms_id / alp_name / alp_staff_hrms_id STAY and are
-- derived on save from the first LP row and first ALP row — the history list,
-- search and "Make note" (OPR -> DElogging note) read them unchanged.
--
-- Run AFTER sql/2026-10-16_notes_staff_hrms_backfill.sql so the linked HRMS
-- ids carry into crew_rows. Idempotent: only rows with crew_rows IS NULL move.
-- Additive. Rollback: ALTER TABLE div_ssehq_opr_reports DROP COLUMN crew_rows;

SET @have := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_ssehq_opr_reports'
                 AND COLUMN_NAME = 'crew_rows');
SET @sql := IF(@have = 0,
  'ALTER TABLE div_ssehq_opr_reports ADD COLUMN crew_rows JSON DEFAULT NULL AFTER alp_name',
  'SELECT ''crew_rows already present''');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- OPR 11 (BB/Tech/22): two ALPs typed into one box. Split explicitly, both
-- temporary (no unique staff-master match for either name).
UPDATE div_ssehq_opr_reports
   SET crew_rows = JSON_ARRAY(
         JSON_OBJECT('role','LP',  'name', lp_name,            'hrms_id', lp_staff_hrms_id,
                     'temp', IF(lp_staff_hrms_id IS NULL, CAST('true' AS JSON), CAST('false' AS JSON))),
         JSON_OBJECT('role','ALP', 'name','ABHISHEK KUMAR',    'hrms_id', NULL, 'temp', CAST('true' AS JSON)),
         JSON_OBJECT('role','ALP', 'name','PRATHAMESH GAWARE', 'hrms_id', NULL, 'temp', CAST('true' AS JSON))),
       alp_name = 'ABHISHEK KUMAR', alp_staff_hrms_id = NULL
 WHERE crew_rows IS NULL
   AND alp_name LIKE 'ALP%ABHISHEK KUMAR%PRATHAMESH GAWARE%';

-- Everyone else: LP row and/or ALP row from the two boxes.
UPDATE div_ssehq_opr_reports
   SET crew_rows = JSON_ARRAY(
         IF(lp_name IS NULL, NULL,
            JSON_OBJECT('role','LP', 'name', lp_name, 'hrms_id', lp_staff_hrms_id,
                        'temp', IF(lp_staff_hrms_id IS NULL, CAST('true' AS JSON), CAST('false' AS JSON)))),
         IF(alp_name IS NULL, NULL,
            JSON_OBJECT('role','ALP', 'name', alp_name, 'hrms_id', alp_staff_hrms_id,
                        'temp', IF(alp_staff_hrms_id IS NULL, CAST('true' AS JSON), CAST('false' AS JSON)))))
 WHERE crew_rows IS NULL AND (lp_name IS NOT NULL OR alp_name IS NOT NULL);

-- JSON_ARRAY(NULL, x) keeps a JSON null in slot 0; drop null slots.
UPDATE div_ssehq_opr_reports
   SET crew_rows = JSON_REMOVE(crew_rows, '$[0]')
 WHERE JSON_LENGTH(crew_rows) > 0 AND JSON_TYPE(JSON_EXTRACT(crew_rows, '$[0]')) = 'NULL';
UPDATE div_ssehq_opr_reports
   SET crew_rows = JSON_REMOVE(crew_rows, '$[1]')
 WHERE JSON_LENGTH(crew_rows) > 1 AND JSON_TYPE(JSON_EXTRACT(crew_rows, '$[1]')) = 'NULL';

SELECT id, report_no, lp_name, alp_name, crew_rows FROM div_ssehq_opr_reports ORDER BY id;
