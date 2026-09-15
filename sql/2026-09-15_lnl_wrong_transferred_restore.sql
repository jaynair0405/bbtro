-- 2026-09-15  LNL: undo 43 staff wrongly marked 'Transferred' via biodata
--
-- LNL office set status = 'Transferred' on the biodata form (not through the
-- transfer-letter module) for 43 staff on 2026-09-09 / 2026-09-10. Office stayed
-- LNL (a real transfer-out sets office = OTHER), and the biodata form treats
-- Transferred as final so they can no longer be edited. Restore them to Active
-- and reverse the exit side-effects from utils/staffExit.js:
--   * div_cli_nominations  Active -> 'Transferred' (+ nominated_to_date set)
--   * div_staff_master.current_cli_id cleared
--   * div_transfer_requests Pending -> 'Completed' (no reviewed_by written)
--
-- Run on PROD:
--   ssh railway@93.127.198.125 'cd ~/bbtro && set -a && . ./.env && \
--     mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < sql/2026-09-15_lnl_wrong_transferred_restore.sql'
-- Idempotent: safe to re-run.

SET SQL_SAFE_UPDATES = 0;

-- 0. Scope: the 43 hrms_ids confirmed from prod on 2026-09-15
DROP TEMPORARY TABLE IF EXISTS tmp_lnl_restore;
CREATE TEMPORARY TABLE tmp_lnl_restore (hrms_id VARCHAR(10) PRIMARY KEY);
INSERT INTO tmp_lnl_restore (hrms_id) VALUES
('ADZLOB'),('ANJYXF'),('BMSNUE'),('BOKBGL'),('CGJOQJ'),('DKCDQL'),('DPFXTF'),
('DTMUFQ'),('EGINOL'),('EPAIMN'),('FUFWIH'),('FYZIXS'),('HHWENF'),('HRUFYF'),
('HTGKUX'),('HZTQMZ'),('IEXUDR'),('ISTQXC'),('IUFPZR'),('JJTTDR'),('LBIMSF'),
('NGQITL'),('NKSHWY'),('NTENLD'),('NXFTDT'),('OOWQSZ'),('OSQDAF'),('PQJRAK'),
('QBRTBC'),('QNZCPL'),('RBWNXQ'),('RQKYAJ'),('SHUZFA'),('SRPMLG'),('SYMRPA'),
('TJCRNB'),('TLNXSI'),('UWTZHB'),('WBYTNS'),('WPOSWA'),('XYFQYX'),('YRWNBT'),
('YYHOXB');

-- 1. Backups (kept; drop by hand once verified)
CREATE TABLE IF NOT EXISTS div_staff_master_bak_20260915_lnl AS
  SELECT s.* FROM div_staff_master s JOIN tmp_lnl_restore t USING (hrms_id);
CREATE TABLE IF NOT EXISTS div_cli_nominations_bak_20260915_lnl AS
  SELECT n.* FROM div_cli_nominations n JOIN tmp_lnl_restore t ON t.hrms_id = n.staff_hrms_id;
CREATE TABLE IF NOT EXISTS div_transfer_requests_bak_20260915_lnl AS
  SELECT r.* FROM div_transfer_requests r JOIN tmp_lnl_restore t ON t.hrms_id = r.staff_hrms_id;

-- 2. Staff back to Active (only rows still LNL + Transferred; retirement_date was NULL on prod)
UPDATE div_staff_master s
  JOIN tmp_lnl_restore t USING (hrms_id)
   SET s.status = 'Active', s.updated_at = NOW()
 WHERE s.status = 'Transferred' AND s.current_office_code = 'LNL';

-- 3. Re-open the CLI nomination ended by the mistaken exit.
--    The 43 nomination_ids confirmed from prod on 2026-09-15: one per staff,
--    flipped Active -> 'Transferred' on 9-10 Sept. Older genuinely ended rows
--    (e.g. HHWENF #223 from June) are not in this list.
UPDATE div_cli_nominations n
  JOIN tmp_lnl_restore t ON t.hrms_id = n.staff_hrms_id
   SET n.status = 'Active', n.nominated_to_date = NULL,
       n.updated_by = 'restore_20260915', n.updated_at = NOW()
 WHERE n.status = 'Transferred'
   AND n.nomination_id IN (
     6106,6372,6109,6455,6377,6067,6419,6030,6107,6458,6038,6040,6069,6332,
     6039,6070,6664,6036,6035,6328,6697,6329,6509,5827,6662,6418,2354,6457,
     6331,6031,6108,6087,6032,6041,6665,6037,6376,6042,6508,6449,6333,6374,6330);

-- 4. Restore current_cli_id from the re-opened nomination
UPDATE div_staff_master s
  JOIN tmp_lnl_restore t USING (hrms_id)
  JOIN div_cli_nominations n ON n.staff_hrms_id = s.hrms_id AND n.status = 'Active'
   SET s.current_cli_id = n.cli_id
 WHERE s.current_cli_id IS NULL;

-- 5. Transfer requests auto-completed by the exit -> back to Pending so the
--    receiving lobby (CSMT-ML / KYN-ML) can accept them normally.
--    LNL raised these on 8-10 Sept and staffExit flipped them to Completed
--    (status only, no reviewed_by). 41 ids confirmed from prod on 2026-09-15.
--    NGQITL's request (2324) was still Pending and needs nothing.
UPDATE div_transfer_requests r
   SET r.status = 'Pending'
 WHERE r.status = 'Completed' AND r.reviewed_by IS NULL
   AND r.request_id IN (
     2379,2329,2382,2322,2318,2391,2316,2380,2313,2386,2388,2392,2327,2387,
     2393,2306,2395,2394,2319,2304,2310,2397,2308,2315,2305,2312,2326,2385,
     2381,2323,2330,2389,2307,2396,2317,2390,2309,2314,2328,2331,2325);

-- 5b. DTMUFQ has two requests: 2383 (auto-completed) and 2384 (still Pending,
--     raised a minute later). Re-opening 2383 would leave two Pending requests
--     for one staff, so mark it Rejected as a duplicate instead.
UPDATE div_transfer_requests
   SET status = 'Rejected',
       remarks = TRIM(CONCAT(COALESCE(remarks, ''), ' Duplicate of request 2384 (restore 2026-09-15)')),
       review_date = CURDATE()
 WHERE request_id = 2383 AND status = 'Completed' AND reviewed_by IS NULL;

SET SQL_SAFE_UPDATES = 1;

-- Verify
SELECT status, COUNT(*) FROM div_staff_master s JOIN tmp_lnl_restore t USING (hrms_id) GROUP BY status;
SELECT COUNT(*) AS with_cli FROM div_staff_master s JOIN tmp_lnl_restore t USING (hrms_id) WHERE current_cli_id IS NOT NULL;
SELECT n.status, COUNT(*) FROM div_cli_nominations n JOIN tmp_lnl_restore t ON t.hrms_id = n.staff_hrms_id GROUP BY n.status;
SELECT r.status, COUNT(*) FROM div_transfer_requests r JOIN tmp_lnl_restore t ON t.hrms_id = r.staff_hrms_id WHERE r.created_at >= '2026-09-08' GROUP BY r.status;

DROP TEMPORARY TABLE IF EXISTS tmp_lnl_restore;
