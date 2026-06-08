-- =============================================================================
-- Strip CLI nomination when a staff Retires or is Transferred out of division
-- =============================================================================
-- Why: a retired / transferred-out staff must not remain on any CLI's nominated
-- list, and you should never have to "assign a new CLI" to them. Until now,
-- only the retirement page expired the nomination (and even it left
-- div_staff_master.current_cli_id set); other paths left "ghost" nominations.
--
-- Scope: ONLY status -> 'Retired' or 'Transferred' (out to other division, set
-- by transferRoutes Inter-Railway transfer). NOT Resigned / Drafted / Med-Decat
-- / Deputation.
--
-- Two parts:
--   1) one-time cleanup of existing ghosts
--   2) a BEFORE UPDATE trigger so EVERY path (retirement page, biodata, transfer,
--      bulk) strips the CLI automatically and uniformly.
-- Needs TRIGGER privilege (run as root if the app user is denied).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Pre-flight (safe): how many ghosts exist now
-- ---------------------------------------------------------------------------
-- SELECT s.status, COUNT(*) FROM div_cli_nominations n
--   JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
--   WHERE n.status='Active' AND s.status IN ('Retired','Transferred')
--   GROUP BY s.status;

-- ---------------------------------------------------------------------------
-- 1) One-time cleanup
-- ---------------------------------------------------------------------------
-- Retired -> Expired (use retirement_date if available)
UPDATE div_cli_nominations n JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
SET n.status = 'Expired', n.nominated_to_date = COALESCE(s.retirement_date, CURDATE())
WHERE n.status = 'Active' AND s.status = 'Retired';

-- Transferred out -> Transferred
UPDATE div_cli_nominations n JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
SET n.status = 'Transferred', n.nominated_to_date = CURDATE()
WHERE n.status = 'Active' AND s.status = 'Transferred';

-- Detach from CLI on the staff record too
UPDATE div_staff_master
SET current_cli_id = NULL
WHERE current_cli_id IS NOT NULL AND status IN ('Retired','Transferred');

-- ---------------------------------------------------------------------------
-- 2) Trigger: auto-strip on transition INTO Retired / Transferred (any prior
--    state), covering all entry points. One-directional (re-activation is a
--    deliberate manual action and is not handled here).
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_staff_status_strip_cli;
DELIMITER //
CREATE TRIGGER trg_staff_status_strip_cli
BEFORE UPDATE ON div_staff_master
FOR EACH ROW
BEGIN
  IF NEW.status IN ('Retired','Transferred')
     AND OLD.status NOT IN ('Retired','Transferred') THEN
    SET NEW.current_cli_id = NULL;
    UPDATE div_cli_nominations
    SET status = IF(NEW.status = 'Transferred', 'Transferred', 'Expired'),
        nominated_to_date = COALESCE(NEW.retirement_date, CURDATE())
    WHERE staff_hrms_id = NEW.hrms_id AND status = 'Active';
  END IF;
END//
DELIMITER ;

-- Verify:
--   SHOW TRIGGERS LIKE 'div_staff_master';
--   SELECT s.status, COUNT(*) FROM div_cli_nominations n
--     JOIN div_staff_master s ON n.staff_hrms_id=s.hrms_id
--     WHERE n.status='Active' AND s.status IN ('Retired','Transferred') GROUP BY s.status;  -- expect empty
