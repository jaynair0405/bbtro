-- Link staff names typed into SSE-HQ / CLI-HQ notes before the staff-master
-- picker (ee8b0a4, 2026-10-16) to div_staff_master / div_cli_master HRMS ids.
--
-- Source: the unlinked-names listing run on prod 2026-10-16. Only names with a
-- single exact match, or named by the user, are linked here. Every UPDATE is
-- keyed by id + the exact typed name + hrms still NULL, so it is a no-op if the
-- record was edited since. Ambiguous names (JITENDRA KUMAR x2, ROHIT K,
-- DHANANJAY KUMAR, DEEPAK) stay temporary; initials-style names with no master
-- match stay temporary.
--
-- Run BEFORE sql/2026-10-16_ssehq_opr_crew_rows.sql so the ids carry into crew_rows.
-- Data only, no restart. Rollback: set the named hrms columns back to NULL.

-- CLI (HQ) notes — addressee
UPDATE div_clihq_notes SET staff_hrms_id = 'PFECQF' WHERE id = 2 AND addressee_name = 'RANJAN KUMAR PANDIT' AND staff_hrms_id IS NULL;
UPDATE div_clihq_notes SET staff_hrms_id = 'EZBQLM' WHERE id = 8 AND addressee_name = 'Shri Y GOPI'          AND staff_hrms_id IS NULL;

-- CLI (HQ) note 1 — staff table, first row
UPDATE div_clihq_notes
   SET staff_rows = JSON_SET(staff_rows, '$[0].hrms_id', 'UPEJGU', '$[0].temp', CAST('false' AS JSON))
 WHERE id = 1 AND JSON_UNQUOTE(JSON_EXTRACT(staff_rows, '$[0].name')) = 'Krishna Kumar M'
   AND JSON_EXTRACT(staff_rows, '$[0].hrms_id') IS NULL;

-- DElogging notes — staff
UPDATE div_ssehq_delogging_notes SET staff_hrms_id = 'ABZWAH' WHERE id = 3  AND staff_name = 'GAJENDRA SINGH' AND staff_hrms_id IS NULL;
UPDATE div_ssehq_delogging_notes SET staff_hrms_id = 'LLPYEA' WHERE id = 14 AND staff_name = 'JAGTAR SINGH'   AND staff_hrms_id IS NULL;
UPDATE div_ssehq_delogging_notes SET staff_hrms_id = 'ZOWDBZ' WHERE id = 9  AND staff_name = 'S R ATRE'       AND staff_hrms_id IS NULL;  -- Swanand R Atre
UPDATE div_ssehq_delogging_notes SET staff_hrms_id = 'HGWPDF' WHERE id = 4  AND staff_name = 'C K PRASAD'     AND staff_hrms_id IS NULL;  -- Chandra Kishore Prasad
UPDATE div_ssehq_delogging_notes SET staff_hrms_id = 'MZTTXA' WHERE id = 10 AND staff_name = 'A K JOSHI'      AND staff_hrms_id IS NULL;  -- Atul Kumar Joshi
UPDATE div_ssehq_delogging_notes SET staff_hrms_id = 'DAPFUD' WHERE id = 11 AND staff_name = 'V S R SHARMA'   AND staff_hrms_id IS NULL;  -- CLI Velivela Seeta Rama Sarma, CSTM0189 (div_cli_master)

-- OPR — LP
UPDATE div_ssehq_opr_reports SET lp_staff_hrms_id = 'WOIMFW' WHERE id = 5 AND lp_name = 'KAMLESH KULKARNI' AND lp_staff_hrms_id IS NULL;

SELECT 'linked' AS what, ROW_COUNT() AS last_stmt_rows;
