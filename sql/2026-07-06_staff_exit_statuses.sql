-- 2026-07-06  Staff exit-status lifecycle
-- Adds 'Completed' to the transfer-request status enum, plus one-time backfills
-- to reconcile already-exited staff (CLI nominations + stuck transfer requests).
--
-- NOTE: div_staff_master.status is varchar(32) (NOT an enum), so the two new
-- staff statuses "Expired" / "Returned to Parent depot" need NO DDL. Only the
-- app-level validation lists were updated.
-- Run on LIVE db (MySQL Workbench). SET SQL_SAFE_UPDATES=0 for the backfills.

-- 1. DDL: allow transfer requests to be marked Completed (matches div_transfer_history)
ALTER TABLE div_transfer_requests
  MODIFY COLUMN status ENUM('Pending','Approved','Rejected','Completed') NOT NULL DEFAULT 'Pending';

-- 2. One-time backfills (run after the ALTER)
SET SQL_SAFE_UPDATES=0;

-- 2a. Complete stuck 'Pending' requests for staff already Transferred out
UPDATE div_transfer_requests tr
  JOIN div_staff_master s ON tr.staff_hrms_id = s.hrms_id
   SET tr.status = 'Completed'
 WHERE tr.status = 'Pending' AND s.status = 'Transferred';

-- 2a-bis. Reject stuck 'Pending' requests for staff already exited by a NON-transfer
-- status (Retired/Resigned/Expired/Returned) - the transfer can never happen.
UPDATE div_transfer_requests tr
  JOIN div_staff_master s ON tr.staff_hrms_id = s.hrms_id
   SET tr.status = 'Rejected',
       tr.remarks = TRIM(CONCAT(COALESCE(tr.remarks, ''), ' ', CONCAT('Auto-rejected: staff ', s.status))),
       tr.review_date = CURDATE()
 WHERE tr.status = 'Pending'
   AND s.status IN ('Retired','Resigned','Expired','Returned to Parent depot');

-- 2b. End still-'Active' CLI nominations for already-exited staff
UPDATE div_cli_nominations n
  JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
   SET n.status = CASE WHEN s.status = 'Transferred' THEN 'Transferred' ELSE 'Expired' END,
       n.nominated_to_date = COALESCE(n.nominated_to_date, s.retirement_date, CURDATE())
 WHERE n.status = 'Active'
   AND s.status IN ('Transferred','Retired','Resigned','Expired','Returned to Parent depot');

-- 2c. Clear stale current_cli_id on already-exited staff
UPDATE div_staff_master
   SET current_cli_id = NULL
 WHERE current_cli_id IS NOT NULL
   AND status IN ('Transferred','Retired','Resigned','Expired','Returned to Parent depot');

SET SQL_SAFE_UPDATES=1;
