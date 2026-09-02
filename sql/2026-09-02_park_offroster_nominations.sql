-- ============================================================================
-- Park off-roster staff under the "Not Assigned" CLI
-- ============================================================================
--
-- WHY
-- ---
-- Nothing in the application clears a CLI nomination when a staff member comes
-- off the running roster. Every write that sets a nomination to Expired is
-- triggered by a CLI CHANGE (routes/division/cliRoutes.js:573, 665, 1010, 2072,
-- 2205, 2287); retirementRoutes.js, transferRoutes.js and bulkUploadRoutes.js
-- never touch div_cli_nominations at all.
--
-- Retirement is evidently cleaned up by some other means -- zero retired staff
-- hold a nomination on either database. What is left behind is the temporary
-- categories: Drafted/Ex-Cadre and Medically Decategorised. They inflate the
-- "active staff" figure on CLI Management (which counts nomination rows without
-- joining div_staff_master) -- 8 of Vinod Kumar D's 91 on production are exactly
-- this.
--
-- WHAT THIS DOES
-- --------------
-- Moves those staff to the "Not Assigned" placeholder CLI, in BOTH places the
-- application keeps in step:
--     div_cli_nominations      -- the dated workflow record
--     div_staff_master.current_cli_id  -- the denormalised "who is it now"
--
-- The previous nomination is EXPIRED with a to-date rather than overwritten.
-- A medically decategorised driver may well come back, and the dated history is
-- what lets you put them back with the CLI they had. Nothing is destroyed.
--
-- SCOPE: 'Medically Decategorised' and 'Drafted/Ex-Cadre' only.
--   NOT 'Deputation' (1 staff) -- not named, and a deputation is an outward
--   posting rather than a hold, so say if you want it included.
--   NOT 'Retired' etc -- they already hold nothing.
--
-- The "Not Assigned" CLI is found by having NO CMS ID, which is what makes it a
-- placeholder rather than a person. It is NOT hardcoded, because its cli_id
-- differs between databases (145 locally).
--
-- SAFE TO RE-RUN. Staff already parked are skipped.
--
-- Apply:  mysql -u jay -p4310jay bbtro < sql/2026-09-02_park_offroster_nominations.sql
--   prod: mysql -u railway_user -p bbtro < sql/2026-09-02_park_offroster_nominations.sql
-- ============================================================================

-- ---- 0. Resolve the placeholder, and refuse to run if it is ambiguous -------
SET @na := (SELECT cli_id FROM div_cli_master WHERE cmsid IS NULL OR cmsid = '' LIMIT 1);
SET @na_count := (SELECT COUNT(*) FROM div_cli_master WHERE cmsid IS NULL OR cmsid = '');

-- Aborts the script with a readable error rather than parking staff under the
-- wrong row, if the master ever grows a second CMS-less CLI.
SELECT IF(@na_count = 1 AND @na IS NOT NULL, 'ok',
          CONCAT('ABORT: expected exactly 1 CLI with no CMS ID, found ', @na_count)) AS precheck;
SET @ok := (@na_count = 1 AND @na IS NOT NULL);

-- ---- 1. Backups, restorable as they stand ----------------------------------
-- IF NOT EXISTS, deliberately: a re-run must NOT overwrite the backup with
-- already-changed rows, which would silently destroy the rollback.
CREATE TABLE IF NOT EXISTS bak_20260902_cli_nominations AS
SELECT n.* FROM div_cli_nominations n
JOIN div_staff_master s ON s.hrms_id = n.staff_hrms_id
WHERE s.status IN ('Medically Decategorised', 'Drafted/Ex-Cadre');

CREATE TABLE IF NOT EXISTS bak_20260902_staff_cli_id AS
SELECT hrms_id, name, status, current_cli_id
FROM div_staff_master
WHERE status IN ('Medically Decategorised', 'Drafted/Ex-Cadre');

-- ---- 2. Expire the current nomination (keeps the return path) ---------------
UPDATE div_cli_nominations n
JOIN div_staff_master s ON s.hrms_id = n.staff_hrms_id
SET n.status = 'Expired',
    n.nominated_to_date = CURDATE(),
    n.remarks = CONCAT(COALESCE(CONCAT(n.remarks, ' | '), ''),
                       'Parked under Not Assigned on ', CURDATE(), ' - staff ', s.status),
    n.updated_by = 'offroster-cleanup',
    n.updated_at = NOW()
WHERE @ok
  AND n.status = 'Active'
  AND n.cli_id <> @na
  AND s.status IN ('Medically Decategorised', 'Drafted/Ex-Cadre');

-- ---- 3. Nominate them to the placeholder -----------------------------------
-- Covers staff who had an active nomination AND staff who only carried a
-- current_cli_id with no nomination row -- both existed on production.
INSERT INTO div_cli_nominations
    (staff_hrms_id, cli_id, nominated_from_date, status, remarks, created_by, created_at)
SELECT s.hrms_id, @na, CURDATE(), 'Active',
       CONCAT('Off running roster: ', s.status), 'offroster-cleanup', NOW()
FROM div_staff_master s
WHERE @ok
  AND s.status IN ('Medically Decategorised', 'Drafted/Ex-Cadre')
  AND (s.current_cli_id IS NULL OR s.current_cli_id <> @na)
ON DUPLICATE KEY UPDATE
    status = 'Active',
    nominated_to_date = NULL,
    updated_by = 'offroster-cleanup',
    updated_at = NOW();

-- ---- 4. Keep current_cli_id in step -----------------------------------------
UPDATE div_staff_master
SET current_cli_id = @na
WHERE @ok
  AND status IN ('Medically Decategorised', 'Drafted/Ex-Cadre')
  AND (current_cli_id IS NULL OR current_cli_id <> @na);

-- ---- 5. Verify --------------------------------------------------------------
SELECT 'off-roster staff still nominated to a REAL CLI (must be 0)' AS check_name,
       COUNT(*) AS n
FROM div_cli_nominations n
JOIN div_staff_master s ON s.hrms_id = n.staff_hrms_id
WHERE n.status = 'Active' AND n.cli_id <> @na
  AND s.status IN ('Medically Decategorised', 'Drafted/Ex-Cadre')
UNION ALL
SELECT 'off-roster staff whose current_cli_id is not the placeholder (must be 0)',
       COUNT(*) FROM div_staff_master
WHERE status IN ('Medically Decategorised', 'Drafted/Ex-Cadre') AND current_cli_id <> @na
UNION ALL
SELECT 'off-roster staff now parked', COUNT(*) FROM div_staff_master
WHERE status IN ('Medically Decategorised', 'Drafted/Ex-Cadre') AND current_cli_id = @na
UNION ALL
-- Active staff parked BY THIS SCRIPT. Must be 0. Note this is not the same as
-- "Active staff parked at all": some are deliberately parked while on long
-- training (created_by div_admin, remark "Training Batch-1"), which is what the
-- placeholder is for and must be left alone.
SELECT 'ACTIVE staff parked by this script (must be 0)', COUNT(*)
FROM div_staff_master s
JOIN div_cli_nominations n ON n.staff_hrms_id = s.hrms_id AND n.cli_id = @na
WHERE s.status = 'Active' AND n.created_by = 'offroster-cleanup'
UNION ALL
SELECT 'Active staff parked earlier for other reasons (left alone)', COUNT(*)
FROM div_staff_master s
JOIN div_cli_nominations n ON n.staff_hrms_id = s.hrms_id AND n.cli_id = @na AND n.status = 'Active'
WHERE s.status = 'Active' AND (n.created_by IS NULL OR n.created_by <> 'offroster-cleanup')
UNION ALL
SELECT 'expired rows written (the return path)', COUNT(*)
FROM div_cli_nominations WHERE updated_by = 'offroster-cleanup' AND status = 'Expired';

-- Any non-active staff still holding a real CLI, by status -- what is left over.
SELECT s.status, COUNT(*) AS active_nominations_to_a_real_cli
FROM div_cli_nominations n
JOIN div_staff_master s ON s.hrms_id = n.staff_hrms_id
WHERE n.status = 'Active' AND n.cli_id <> @na AND s.status <> 'Active'
GROUP BY s.status;

-- ============================================================================
-- ROLLBACK
-- ---------
-- SET @na := (SELECT cli_id FROM div_cli_master WHERE cmsid IS NULL OR cmsid = '' LIMIT 1);
-- DELETE n FROM div_cli_nominations n
--   WHERE n.cli_id = @na AND n.created_by = 'offroster-cleanup';
-- UPDATE div_cli_nominations n JOIN bak_20260902_cli_nominations b
--    ON b.nomination_id = n.nomination_id
--   SET n.status = b.status, n.nominated_to_date = b.nominated_to_date,
--       n.remarks = b.remarks, n.updated_by = b.updated_by, n.updated_at = b.updated_at;
-- UPDATE div_staff_master s JOIN bak_20260902_staff_cli_id b ON b.hrms_id = s.hrms_id
--   SET s.current_cli_id = b.current_cli_id;
-- ============================================================================
