-- Division realm deduplication and idempotency guardrails
-- Created: 2026-02-05
-- Apply on prod/stage after validating column presence.

-- NOTE: Leave tracking constraint removed - cancel/reapply workflow needs
-- separate records. Overlap check in leaveRoutes.js handles duplicates.

-- 1) Training records: one record per staff/training/date
ALTER TABLE `div_training_records`
  ADD UNIQUE KEY `uniq_training_once` (`staff_hrms_id`, `training_id`, `done_date`);

-- 2) CLI master: unique identifiers
ALTER TABLE `div_cli_master`
  ADD UNIQUE KEY `uniq_cli_cmsid` (`cmsid`),
  ADD UNIQUE KEY `uniq_cli_hrms` (`cli_hrms_id`);

-- 3) CLI nominations: prevent duplicate overlapping entries
ALTER TABLE `div_cli_nominations`
  ADD UNIQUE KEY `uniq_cli_nomination` (`staff_hrms_id`, `cli_id`, `nominated_from_date`);

