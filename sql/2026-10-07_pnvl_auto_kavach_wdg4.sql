-- PNVL lobby Automatic / Kavach / WDG4G-6G sheet (pnvl_auto_kavach_wdg4.csv) -> div_training_records.
-- 472 staff rows matched to master (449 by CMS id/transfer history, 23 via CMS-report PF / name, user-confirmed).
-- Automatic (5): file date = later of DONE DATE and remark "REFRESHER DONE dd-mm-yy"; inserted only where
--   our latest Automatic is DUE (due < 2026-10-07) and the file date is current. EXTENSION column ignored.
--   Guard: skipped if an Automatic on/after that date exists. due = done + 6 months - 1 day.
-- Kavach (4) / WDG4G-6G (15): sheet flag Y only; done = remark refresher date, else NULL; due NULL.
--   Guard: skipped if the staff has ANY record of that training.
-- Centre 2 (MTC_KYN) throughout, per user. Undo: 2026-10-07_pnvl_auto_kavach_wdg4_UNDO.sql
SET @tag = 'pnvl_auto_sheet_2026-10-07';
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AAAOMA', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AAAOMA' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AAAWKW', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AAAWKW' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AAAXLR', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AAAXLR' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AAAXZU', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AAAXZU' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AAAYKH', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AAAYKH' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AAAZMJ', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AAAZMJ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AABJXH', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AABJXH' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AFHRSB', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AFHRSB' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AMQSXC', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AMQSXC' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AOABEW', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AOABEW' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AWPWSS', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AWPWSS' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'BILFMF', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BILFMF' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'BMHJEF', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BMHJEF' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'CIKPSQ', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CIKPSQ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'CQEMMU', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CQEMMU' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DDURUJ', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DDURUJ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DHSWEI', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DHSWEI' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DQRSKC', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DQRSKC' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DRWJGT', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DRWJGT' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DRXIDA', 4, 2, 'Completed', '2026-08-17', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DRXIDA' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'EHAWWP', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'EHAWWP' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'EXGHRC', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'EXGHRC' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FCLRKN', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FCLRKN' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FGEUFL', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FGEUFL' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FPFLRZ', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FPFLRZ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FUITER', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FUITER' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'GEZPER', 4, 2, 'Completed', '2026-07-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GEZPER' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'GFBJEI', 4, 2, 'Completed', '2026-07-17', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GFBJEI' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'GIJJKR', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GIJJKR' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'HMPPIB', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'HMPPIB' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'HOIGXG', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'HOIGXG' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'HWPQTC', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'HWPQTC' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'IZQSQT', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'IZQSQT' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JGXYIK', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JGXYIK' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KRFKQH', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KRFKQH' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KWPZAS', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KWPZAS' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LEIAHH', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LEIAHH' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LHIAAY', 4, 2, 'Completed', '2026-01-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LHIAAY' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MCQMXG', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MCQMXG' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MMCJIP', 4, 2, 'Completed', '2026-01-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MMCJIP' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MNWNNI', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MNWNNI' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MTXSTD', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MTXSTD' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MYNLFU', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MYNLFU' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NHRJIB', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NHRJIB' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NQCPFO', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NQCPFO' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NRRXTC', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NRRXTC' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'OIYJIJ', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OIYJIJ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PCBZNW', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PCBZNW' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PJLBPQ', 4, 2, 'Completed', '2026-01-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PJLBPQ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PNNNOD', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PNNNOD' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'POMYFY', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'POMYFY' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'POQSFH', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'POQSFH' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PUURUW', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PUURUW' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'QCSHIH', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QCSHIH' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'QWWZOJ', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QWWZOJ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RMMPZK', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RMMPZK' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RRKEEJ', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RRKEEJ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RXWAKF', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RXWAKF' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SLAGUW', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SLAGUW' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SLENPX', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SLENPX' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SNKFER', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SNKFER' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SOBLAF', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SOBLAF' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SWZNFY', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SWZNFY' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TQRESA', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TQRESA' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'UFBSJO', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UFBSJO' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'UKNPWY', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UKNPWY' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ULNCNO', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ULNCNO' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ULZKNT', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ULZKNT' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WFSAMX', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WFSAMX' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WGNLWU', 4, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WGNLWU' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WNQLUO', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WNQLUO' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WSXSFB', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WSXSFB' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WWBLUA', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WWBLUA' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XBAJTR', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XBAJTR' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XMMDEZ', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XMMDEZ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YFFPQM', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YFFPQM' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZFUKRX', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZFUKRX' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZMNIQN', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZMNIQN' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZWCTFQ', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZWCTFQ' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZWGNHD', 4, 2, 'Completed', '2026-04-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZWGNHD' AND training_id = 4);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'BHDUGN', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BHDUGN' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'CWLEIS', 5, 2, 'Completed', '2026-05-18', DATE_SUB(DATE_ADD('2026-05-18', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CWLEIS' AND training_id = 5 AND done_date >= '2026-05-18');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'DNPGTZ', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DNPGTZ' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'DUFOBU', 5, 2, 'Completed', '2026-07-08', DATE_SUB(DATE_ADD('2026-07-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DUFOBU' AND training_id = 5 AND done_date >= '2026-07-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'FBAOYB', 5, 2, 'Completed', '2026-05-19', DATE_SUB(DATE_ADD('2026-05-19', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FBAOYB' AND training_id = 5 AND done_date >= '2026-05-19');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'FNUTRB', 5, 2, 'Completed', '2026-09-17', DATE_SUB(DATE_ADD('2026-09-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FNUTRB' AND training_id = 5 AND done_date >= '2026-09-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'FRRDUP', 5, 2, 'Completed', '2026-07-08', DATE_SUB(DATE_ADD('2026-07-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FRRDUP' AND training_id = 5 AND done_date >= '2026-07-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'FZZUII', 5, 2, 'Completed', '2026-06-13', DATE_SUB(DATE_ADD('2026-06-13', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FZZUII' AND training_id = 5 AND done_date >= '2026-06-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'GAWLMC', 5, 2, 'Completed', '2026-09-22', DATE_SUB(DATE_ADD('2026-09-22', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GAWLMC' AND training_id = 5 AND done_date >= '2026-09-22');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'GRPBMA', 5, 2, 'Completed', '2026-09-23', DATE_SUB(DATE_ADD('2026-09-23', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GRPBMA' AND training_id = 5 AND done_date >= '2026-09-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'HIHQQC', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'HIHQQC' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'IDSKDO', 5, 2, 'Completed', '2026-04-08', DATE_SUB(DATE_ADD('2026-04-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'IDSKDO' AND training_id = 5 AND done_date >= '2026-04-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'IZQSQT', 5, 2, 'Completed', '2026-06-14', DATE_SUB(DATE_ADD('2026-06-14', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'IZQSQT' AND training_id = 5 AND done_date >= '2026-06-14');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'JHMDFU', 5, 2, 'Completed', '2026-07-08', DATE_SUB(DATE_ADD('2026-07-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JHMDFU' AND training_id = 5 AND done_date >= '2026-07-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'JHXQJD', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JHXQJD' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'KCFYDR', 5, 2, 'Completed', '2026-05-18', DATE_SUB(DATE_ADD('2026-05-18', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KCFYDR' AND training_id = 5 AND done_date >= '2026-05-18');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'KNPSKS', 5, 2, 'Completed', '2026-09-24', DATE_SUB(DATE_ADD('2026-09-24', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KNPSKS' AND training_id = 5 AND done_date >= '2026-09-24');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'KTPKRP', 5, 2, 'Completed', '2026-07-08', DATE_SUB(DATE_ADD('2026-07-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KTPKRP' AND training_id = 5 AND done_date >= '2026-07-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'LLBWDM', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LLBWDM' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'MJBQYH', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MJBQYH' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'MWIXNT', 5, 2, 'Completed', '2026-09-22', DATE_SUB(DATE_ADD('2026-09-22', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MWIXNT' AND training_id = 5 AND done_date >= '2026-09-22');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'NNJWPF', 5, 2, 'Completed', '2026-09-23', DATE_SUB(DATE_ADD('2026-09-23', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NNJWPF' AND training_id = 5 AND done_date >= '2026-09-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'NOYTJM', 5, 2, 'Completed', '2026-05-09', DATE_SUB(DATE_ADD('2026-05-09', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NOYTJM' AND training_id = 5 AND done_date >= '2026-05-09');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'OKZEQA', 5, 2, 'Completed', '2026-06-13', DATE_SUB(DATE_ADD('2026-06-13', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OKZEQA' AND training_id = 5 AND done_date >= '2026-06-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'OWRCQS', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OWRCQS' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'OWWUWL', 5, 2, 'Completed', '2026-04-10', DATE_SUB(DATE_ADD('2026-04-10', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OWWUWL' AND training_id = 5 AND done_date >= '2026-04-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'QEHLJT', 5, 2, 'Completed', '2026-07-08', DATE_SUB(DATE_ADD('2026-07-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QEHLJT' AND training_id = 5 AND done_date >= '2026-07-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'QIWOMS', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QIWOMS' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'QMPXBE', 5, 2, 'Completed', '2026-09-23', DATE_SUB(DATE_ADD('2026-09-23', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QMPXBE' AND training_id = 5 AND done_date >= '2026-09-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'QUTBRC', 5, 2, 'Completed', '2026-04-10', DATE_SUB(DATE_ADD('2026-04-10', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QUTBRC' AND training_id = 5 AND done_date >= '2026-04-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'RDIKXF', 5, 2, 'Completed', '2026-07-08', DATE_SUB(DATE_ADD('2026-07-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RDIKXF' AND training_id = 5 AND done_date >= '2026-07-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'RNZQLZ', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RNZQLZ' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'TEHTBE', 5, 2, 'Completed', '2026-05-20', DATE_SUB(DATE_ADD('2026-05-20', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TEHTBE' AND training_id = 5 AND done_date >= '2026-05-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'UACMWG', 5, 2, 'Completed', '2026-07-08', DATE_SUB(DATE_ADD('2026-07-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UACMWG' AND training_id = 5 AND done_date >= '2026-07-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'UFBSJO', 5, 2, 'Completed', '2026-04-11', DATE_SUB(DATE_ADD('2026-04-11', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UFBSJO' AND training_id = 5 AND done_date >= '2026-04-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'UHPYAD', 5, 2, 'Completed', '2026-07-25', DATE_SUB(DATE_ADD('2026-07-25', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UHPYAD' AND training_id = 5 AND done_date >= '2026-07-25');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'UIWWPU', 5, 2, 'Completed', '2026-09-23', DATE_SUB(DATE_ADD('2026-09-23', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UIWWPU' AND training_id = 5 AND done_date >= '2026-09-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'UWKPBR', 5, 2, 'Completed', '2026-09-22', DATE_SUB(DATE_ADD('2026-09-22', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UWKPBR' AND training_id = 5 AND done_date >= '2026-09-22');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'WBCODY', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WBCODY' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'WBPXJA', 5, 2, 'Completed', '2026-09-24', DATE_SUB(DATE_ADD('2026-09-24', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WBPXJA' AND training_id = 5 AND done_date >= '2026-09-24');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'WHFUDJ', 5, 2, 'Completed', '2026-07-08', DATE_SUB(DATE_ADD('2026-07-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WHFUDJ' AND training_id = 5 AND done_date >= '2026-07-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'WTCQRT', 5, 2, 'Completed', '2026-06-16', DATE_SUB(DATE_ADD('2026-06-16', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WTCQRT' AND training_id = 5 AND done_date >= '2026-06-16');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'YCFTIY', 5, 2, 'Completed', '2026-04-17', DATE_SUB(DATE_ADD('2026-04-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YCFTIY' AND training_id = 5 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'YUQZUZ', 5, 2, 'Completed', '2026-07-08', DATE_SUB(DATE_ADD('2026-07-08', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YUQZUZ' AND training_id = 5 AND done_date >= '2026-07-08');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'ZPXXNF', 5, 2, 'Completed', '2026-04-10', DATE_SUB(DATE_ADD('2026-04-10', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZPXXNF' AND training_id = 5 AND done_date >= '2026-04-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'ZWWNYS', 5, 2, 'Completed', '2026-09-22', DATE_SUB(DATE_ADD('2026-09-22', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZWWNYS' AND training_id = 5 AND done_date >= '2026-09-22');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AMQSXC', 15, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AMQSXC' AND training_id = 15);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'GFBJEI', 15, 2, 'Completed', '2026-07-17', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GFBJEI' AND training_id = 15);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'HOIGXG', 15, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'HOIGXG' AND training_id = 15);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JCBDZQ', 15, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JCBDZQ' AND training_id = 15);
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NRRXTC', 15, 2, 'Completed', NULL, NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NRRXTC' AND training_id = 15);
SELECT training_id, COUNT(*) AS inserted, SUM(done_date IS NULL) AS null_date FROM div_training_records WHERE general_remarks = @tag GROUP BY training_id;
