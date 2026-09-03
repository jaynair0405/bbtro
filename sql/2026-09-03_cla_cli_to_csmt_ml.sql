-- ============================================================================
-- All active CLIs at CLA -> CSMT-ML
-- ============================================================================
--
-- CLA has ceased to exist as a lobby and is not a row on the consolidated
-- sheet (see DEPOT_ORDER in public/cli/js/cli-derive.js). A CLI posted there
-- would have their counselling land in the sheet's OTHER row.
--
-- BOTH places must move together. div_cli_master.current_office_code is the
-- CLI record; users.div_office_code is what scopes their login -- the staff
-- picker, and the lobby a session is filed against. Changing only the first
-- would leave him loading CLA staff and filing CLA sessions.
--
-- Written for ALL active CLIs at CLA rather than one named CMS ID, because
-- the databases disagree on who is there: production has one (I A Raju),
-- local still shows two (Pramod Tapse having already moved to KYN-SUB on
-- production). Keying on the office moves whoever is actually there.
--
-- Their nominated staff, if any, are NOT moved -- a nomination follows the
-- staff member's own posting, not the CLI's.
--
-- SAFE TO RE-RUN.
--   mysql -u railway_user -p bbtro < sql/2026-09-03_cla_cli_to_csmt_ml.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS bak_20260903_cla_cli AS
SELECT c.cli_id, c.cli_name, c.cmsid, c.current_office_code AS cli_office,
       u.id AS user_id, u.username, u.div_office_code AS user_office
FROM div_cli_master c
LEFT JOIN users u ON u.cli_id = c.cli_id AND u.div_role = 'cli'
WHERE c.current_office_code = 'CLA' AND c.is_active = 1;

-- users first: it keys off the CLI's office, which the next statement changes.
UPDATE users u
  JOIN div_cli_master c ON c.cli_id = u.cli_id
   SET u.div_office_code = 'CSMT-ML'
 WHERE c.current_office_code = 'CLA' AND c.is_active = 1
   AND u.div_role = 'cli' AND u.div_office_code = 'CLA';

UPDATE div_cli_master SET current_office_code = 'CSMT-ML'
 WHERE current_office_code = 'CLA' AND is_active = 1;

-- verify: both must read CSMT-ML
SELECT c.cli_id, c.cli_name, c.cmsid,
       c.current_office_code AS cli_record,
       u.username, u.div_office_code AS login_scope,
       (SELECT COUNT(*) FROM div_staff_master s
         WHERE s.current_cli_id = c.cli_id AND s.status = 'Active') AS nominees
FROM div_cli_master c
LEFT JOIN users u ON u.cli_id = c.cli_id AND u.div_role = 'cli'
WHERE c.cli_id IN (SELECT cli_id FROM bak_20260903_cla_cli);

-- anyone still left at CLA?
SELECT 'active CLIs still at CLA' AS check_name, COUNT(*) AS n
FROM div_cli_master WHERE current_office_code = 'CLA' AND is_active = 1
UNION ALL
SELECT 'active running staff still at CLA', COUNT(*)
FROM div_staff_master WHERE current_office_code = 'CLA' AND status = 'Active'
  AND designation_id IN (1,2,3,4,5,6,7,8,9);

-- ROLLBACK
-- UPDATE div_cli_master c JOIN bak_20260903_cla_cli b ON b.cli_id = c.cli_id
--    SET c.current_office_code = b.cli_office;
-- UPDATE users u JOIN bak_20260903_cla_cli b ON b.user_id = u.id
--    SET u.div_office_code = b.user_office;
