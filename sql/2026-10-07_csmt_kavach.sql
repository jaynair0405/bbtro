-- CSMT Kavach sheet (csmt_staff_kavach.csv) -> div_training_records, training_id 4 (Kavach).
-- 204 staff: 190 matched by PF, 14 by name/partial PF (user-confirmed 2026-10-07). Includes suburban
-- staff (CSTS/KYNS/PNVS) under LPM promotion training. Centre 1 ZRTI_BSL (per user); due NULL.
-- Guard: skipped if the staff has a Kavach record on/after the sheet date.
-- Undo: 2026-10-07_csmt_kavach_UNDO.sql
SET @tag = 'csmt_kavach_sheet_2026-10-07';
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AACWWR', 4, 1, 'Completed', '2025-06-18', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AACWWR' AND training_id = 4 AND done_date >= '2025-06-18');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ABNXJC', 4, 1, 'Completed', '2026-04-15', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ABNXJC' AND training_id = 4 AND done_date >= '2026-04-15');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ABZWAH', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ABZWAH' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ACFGAA', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ACFGAA' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AFCWJE', 4, 1, 'Completed', '2026-01-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AFCWJE' AND training_id = 4 AND done_date >= '2026-01-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AQWZDI', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AQWZDI' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ARHTBS', 4, 1, 'Completed', '2026-04-17', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ARHTBS' AND training_id = 4 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ASGADB', 4, 1, 'Completed', '2026-04-17', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ASGADB' AND training_id = 4 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'AUDEEW', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AUDEEW' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'BCROKJ', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BCROKJ' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'BFHDHX', 4, 1, 'Completed', '2026-08-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BFHDHX' AND training_id = 4 AND done_date >= '2026-08-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'BFHPEZ', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BFHPEZ' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'BJAXIY', 4, 1, 'Completed', '2026-02-04', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BJAXIY' AND training_id = 4 AND done_date >= '2026-02-04');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'BOTZKC', 4, 1, 'Completed', '2025-07-02', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BOTZKC' AND training_id = 4 AND done_date >= '2025-07-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'BRIXEG', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BRIXEG' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'BTTFMI', 4, 1, 'Completed', '2026-02-23', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BTTFMI' AND training_id = 4 AND done_date >= '2026-02-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'CAWYSN', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CAWYSN' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'CGNNLR', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CGNNLR' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'CHKGBC', 4, 1, 'Completed', '2025-06-25', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CHKGBC' AND training_id = 4 AND done_date >= '2025-06-25');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'CIZRRH', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CIZRRH' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'CMQKWY', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CMQKWY' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'CQKKNJ', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CQKKNJ' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'CTOKXL', 4, 1, 'Completed', '2025-03-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CTOKXL' AND training_id = 4 AND done_date >= '2025-03-27');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DAGICU', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DAGICU' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DAMWXK', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DAMWXK' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DFXZEI', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DFXZEI' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DGZFHD', 4, 1, 'Completed', '2025-12-22', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DGZFHD' AND training_id = 4 AND done_date >= '2025-12-22');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DJIDOY', 4, 1, 'Completed', '2025-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DJIDOY' AND training_id = 4 AND done_date >= '2025-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DMIJTN', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DMIJTN' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DPBUQW', 4, 1, 'Completed', '2025-07-02', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DPBUQW' AND training_id = 4 AND done_date >= '2025-07-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DWEDQN', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DWEDQN' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DXGGIO', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DXGGIO' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'DZGJDA', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DZGJDA' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'EDBMIN', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'EDBMIN' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'EGCPBW', 4, 1, 'Completed', '2025-11-16', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'EGCPBW' AND training_id = 4 AND done_date >= '2025-11-16');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'EMMXEO', 4, 1, 'Completed', '2025-06-18', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'EMMXEO' AND training_id = 4 AND done_date >= '2025-06-18');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'EOLYFU', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'EOLYFU' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'EQGOER', 4, 1, 'Completed', '2025-07-30', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'EQGOER' AND training_id = 4 AND done_date >= '2025-07-30');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ETFEGI', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ETFEGI' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FCDXTE', 4, 1, 'Completed', '2026-02-23', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FCDXTE' AND training_id = 4 AND done_date >= '2026-02-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FDLYAH', 4, 1, 'Completed', '2025-06-25', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FDLYAH' AND training_id = 4 AND done_date >= '2025-06-25');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FFTNQD', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FFTNQD' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FHSHLX', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FHSHLX' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FJXMSS', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FJXMSS' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FKCGSI', 4, 1, 'Completed', '2025-03-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FKCGSI' AND training_id = 4 AND done_date >= '2025-03-27');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FOXBQY', 4, 1, 'Completed', '2026-01-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FOXBQY' AND training_id = 4 AND done_date >= '2026-01-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FQBWFX', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FQBWFX' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FSLWZB', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FSLWZB' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'FYWIHF', 4, 1, 'Completed', '2025-06-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FYWIHF' AND training_id = 4 AND done_date >= '2025-06-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'GBEXAX', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GBEXAX' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'GDIHIM', 4, 1, 'Completed', '2026-03-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GDIHIM' AND training_id = 4 AND done_date >= '2026-03-27');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'GIMTUW', 4, 1, 'Completed', '2025-07-02', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GIMTUW' AND training_id = 4 AND done_date >= '2025-07-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'GXSCLO', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GXSCLO' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'GYCYHO', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GYCYHO' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'HAXYXB', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'HAXYXB' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'HGTPHS', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'HGTPHS' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'HPUAOB', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'HPUAOB' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'IAKHMT', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'IAKHMT' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'IGSDLO', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'IGSDLO' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'IJPUNC', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'IJPUNC' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ITUJGL', 4, 1, 'Completed', '2025-11-25', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ITUJGL' AND training_id = 4 AND done_date >= '2025-11-25');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'IXFPGJ', 4, 1, 'Completed', '2024-10-23', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'IXFPGJ' AND training_id = 4 AND done_date >= '2024-10-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JGOFNA', 4, 1, 'Completed', '2026-02-23', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JGOFNA' AND training_id = 4 AND done_date >= '2026-02-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JMDDYN', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JMDDYN' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JMXSGS', 4, 1, 'Completed', '2026-06-29', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JMXSGS' AND training_id = 4 AND done_date >= '2026-06-29');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JPDHIA', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JPDHIA' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JQDNPF', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JQDNPF' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JWSCXD', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JWSCXD' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JXRGDO', 4, 1, 'Completed', '2025-01-02', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JXRGDO' AND training_id = 4 AND done_date >= '2025-01-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JZCUMK', 4, 1, 'Completed', '2025-04-24', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JZCUMK' AND training_id = 4 AND done_date >= '2025-04-24');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JZOZWR', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JZOZWR' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'JZTQBS', 4, 1, 'Completed', '2025-07-02', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JZTQBS' AND training_id = 4 AND done_date >= '2025-07-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KFEBEW', 4, 1, 'Completed', '2025-03-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KFEBEW' AND training_id = 4 AND done_date >= '2025-03-27');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KGJBYT', 4, 1, 'Completed', '2026-04-17', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KGJBYT' AND training_id = 4 AND done_date >= '2026-04-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KHPGNH', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KHPGNH' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KHQPGB', 4, 1, 'Completed', '2025-07-02', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KHQPGB' AND training_id = 4 AND done_date >= '2025-07-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KHYBSX', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KHYBSX' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KIZZQW', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KIZZQW' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KJRKBD', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KJRKBD' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KKPXGO', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KKPXGO' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KNLXWD', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KNLXWD' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KQYRJY', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KQYRJY' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'KTJUEI', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KTJUEI' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LCIMGM', 4, 1, 'Completed', '2025-06-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LCIMGM' AND training_id = 4 AND done_date >= '2025-06-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LEUOHS', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LEUOHS' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LFLJEU', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LFLJEU' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LGGBHG', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LGGBHG' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LGOYRI', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LGOYRI' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LHDNBE', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LHDNBE' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LLGBHZ', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LLGBHZ' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LLPYEA', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LLPYEA' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LMQMOS', 4, 1, 'Completed', '2025-12-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LMQMOS' AND training_id = 4 AND done_date >= '2025-12-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LMQQFS', 4, 1, 'Completed', '2025-12-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LMQQFS' AND training_id = 4 AND done_date >= '2025-12-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LNMZWH', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LNMZWH' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LQBLOO', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LQBLOO' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LYMMCP', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LYMMCP' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'LZOULM', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LZOULM' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MAHAOE', 4, 1, 'Completed', '2025-11-24', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MAHAOE' AND training_id = 4 AND done_date >= '2025-11-24');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MDUZLH', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MDUZLH' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MELUJC', 4, 1, 'Completed', '2026-06-06', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MELUJC' AND training_id = 4 AND done_date >= '2026-06-06');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MFJHJA', 4, 1, 'Completed', '2026-03-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MFJHJA' AND training_id = 4 AND done_date >= '2026-03-27');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MISNES', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MISNES' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MQUSUH', 4, 1, 'Completed', '2026-07-28', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MQUSUH' AND training_id = 4 AND done_date >= '2026-07-28');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MRFFGR', 4, 1, 'Completed', '2025-11-25', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MRFFGR' AND training_id = 4 AND done_date >= '2025-11-25');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MUARHK', 4, 1, 'Completed', '2026-02-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MUARHK' AND training_id = 4 AND done_date >= '2026-02-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MWRAND', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MWRAND' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'MZTTXA', 4, 1, 'Completed', '2025-07-09', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MZTTXA' AND training_id = 4 AND done_date >= '2025-07-09');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NBBMIN', 4, 1, 'Completed', '2026-02-23', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NBBMIN' AND training_id = 4 AND done_date >= '2026-02-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NCEGOL', 4, 1, 'Completed', '2025-12-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NCEGOL' AND training_id = 4 AND done_date >= '2025-12-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NTLSKG', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NTLSKG' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NUDISO', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NUDISO' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NXFNAC', 4, 1, 'Completed', '2026-03-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NXFNAC' AND training_id = 4 AND done_date >= '2026-03-27');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'NXMABI', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NXMABI' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'OAXKMS', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OAXKMS' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'OCBJOM', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OCBJOM' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'OGMPTG', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OGMPTG' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ONTQPY', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ONTQPY' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'OPNUKX', 4, 1, 'Completed', '2025-05-19', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OPNUKX' AND training_id = 4 AND done_date >= '2025-05-19');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'OUFTUD', 4, 1, 'Completed', '2026-08-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OUFTUD' AND training_id = 4 AND done_date >= '2026-08-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'OXCXBR', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OXCXBR' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PAQMFK', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PAQMFK' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PFHPKS', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PFHPKS' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PGGLJN', 4, 1, 'Completed', '2025-03-01', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PGGLJN' AND training_id = 4 AND done_date >= '2025-03-01');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PJTPTF', 4, 1, 'Completed', '2026-07-28', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PJTPTF' AND training_id = 4 AND done_date >= '2026-07-28');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PKXSDX', 4, 1, 'Completed', '2025-06-25', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PKXSDX' AND training_id = 4 AND done_date >= '2025-06-25');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PRWLXT', 4, 1, 'Completed', '2026-02-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PRWLXT' AND training_id = 4 AND done_date >= '2026-02-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PSLOUA', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PSLOUA' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PZLLEX', 4, 1, 'Completed', '2025-05-19', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PZLLEX' AND training_id = 4 AND done_date >= '2025-05-19');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'PZOONT', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PZOONT' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'QAGZMI', 4, 1, 'Completed', '2025-07-09', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QAGZMI' AND training_id = 4 AND done_date >= '2025-07-09');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'QGXMRR', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QGXMRR' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'QHLXWR', 4, 1, 'Completed', '2025-06-12', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QHLXWR' AND training_id = 4 AND done_date >= '2025-06-12');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'QISBFR', 4, 1, 'Completed', '2026-07-29', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QISBFR' AND training_id = 4 AND done_date >= '2026-07-29');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'QSYBTX', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QSYBTX' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'QUTSPP', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QUTSPP' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RBDKES', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RBDKES' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RDPJCY', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RDPJCY' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RJTJNG', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RJTJNG' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RMBXPL', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RMBXPL' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RPHFYX', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RPHFYX' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RSQGSE', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RSQGSE' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RTTACE', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RTTACE' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RYIFGG', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RYIFGG' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'RZRGUD', 4, 1, 'Completed', '2025-03-01', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RZRGUD' AND training_id = 4 AND done_date >= '2025-03-01');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SBUAQB', 4, 1, 'Completed', '2024-10-23', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SBUAQB' AND training_id = 4 AND done_date >= '2024-10-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SCPZUD', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SCPZUD' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SCWLMF', 4, 1, 'Completed', '2026-07-22', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SCWLMF' AND training_id = 4 AND done_date >= '2026-07-22');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SECEYG', 4, 1, 'Completed', '2025-07-30', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SECEYG' AND training_id = 4 AND done_date >= '2025-07-30');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SEJAYC', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SEJAYC' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SGQEEM', 4, 1, 'Completed', '2026-07-19', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SGQEEM' AND training_id = 4 AND done_date >= '2026-07-19');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SNNFSI', 4, 1, 'Completed', '2025-06-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SNNFSI' AND training_id = 4 AND done_date >= '2025-06-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SRZHZI', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SRZHZI' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'SSTKIU', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SSTKIU' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'STCGBW', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'STCGBW' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TCBAMD', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TCBAMD' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TCHNOR', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TCHNOR' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TEWZBO', 4, 1, 'Completed', '2026-07-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TEWZBO' AND training_id = 4 AND done_date >= '2026-07-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TGOOCR', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TGOOCR' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TKAZMG', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TKAZMG' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TORSMF', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TORSMF' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TPZOGP', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TPZOGP' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TSZSTY', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TSZSTY' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TTHIWB', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TTHIWB' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'TXREBQ', 4, 1, 'Completed', '2025-11-16', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'TXREBQ' AND training_id = 4 AND done_date >= '2025-11-16');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'UFQQTQ', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UFQQTQ' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'UWCWXS', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UWCWXS' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'UXYKYA', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UXYKYA' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WBIMFY', 4, 1, 'Completed', '2026-02-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WBIMFY' AND training_id = 4 AND done_date >= '2026-02-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WBRGUS', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WBRGUS' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WBZNDA', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WBZNDA' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WCFZPJ', 4, 1, 'Completed', '2025-06-12', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WCFZPJ' AND training_id = 4 AND done_date >= '2025-06-12');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WIWIYJ', 4, 1, 'Completed', '2026-06-06', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WIWIYJ' AND training_id = 4 AND done_date >= '2026-06-06');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WIXCCG', 4, 1, 'Completed', '2025-12-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WIXCCG' AND training_id = 4 AND done_date >= '2025-12-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WLPSLT', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WLPSLT' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WOSSCH', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WOSSCH' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WRRNRT', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WRRNRT' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'WSCLUI', 4, 1, 'Completed', '2025-12-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WSCLUI' AND training_id = 4 AND done_date >= '2025-12-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XAFFDC', 4, 1, 'Completed', '2026-02-04', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XAFFDC' AND training_id = 4 AND done_date >= '2026-02-04');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XCABAN', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XCABAN' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XENCEU', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XENCEU' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XGGACE', 4, 1, 'Completed', '2025-11-24', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XGGACE' AND training_id = 4 AND done_date >= '2025-11-24');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XMMAQL', 4, 1, 'Completed', '2025-06-18', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XMMAQL' AND training_id = 4 AND done_date >= '2025-06-18');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XNTPSN', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XNTPSN' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XPMBNO', 4, 1, 'Completed', '2026-04-15', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XPMBNO' AND training_id = 4 AND done_date >= '2026-04-15');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'XWLKFY', 4, 1, 'Completed', '2026-06-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XWLKFY' AND training_id = 4 AND done_date >= '2026-06-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YCWGIK', 4, 1, 'Completed', '2026-08-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YCWGIK' AND training_id = 4 AND done_date >= '2026-08-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YEAYMP', 4, 1, 'Completed', '2026-08-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YEAYMP' AND training_id = 4 AND done_date >= '2026-08-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YIWOGX', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YIWOGX' AND training_id = 4 AND done_date >= '2026-05-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YJZGFL', 4, 1, 'Completed', '2025-12-10', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YJZGFL' AND training_id = 4 AND done_date >= '2025-12-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YKKRJA', 4, 1, 'Completed', '2025-11-24', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YKKRJA' AND training_id = 4 AND done_date >= '2025-11-24');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YOWELD', 4, 1, 'Completed', '2026-06-12', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YOWELD' AND training_id = 4 AND done_date >= '2026-06-12');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YPKICB', 4, 1, 'Completed', '2026-03-27', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YPKICB' AND training_id = 4 AND done_date >= '2026-03-27');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YQPYRR', 4, 1, 'Completed', '2026-03-20', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YQPYRR' AND training_id = 4 AND done_date >= '2026-03-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YQZLAE', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YQZLAE' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YRWKAG', 4, 1, 'Completed', '2025-09-12', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YRWKAG' AND training_id = 4 AND done_date >= '2025-09-12');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YXPUNO', 4, 1, 'Completed', '2026-07-21', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YXPUNO' AND training_id = 4 AND done_date >= '2026-07-21');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'YXWDTI', 4, 1, 'Completed', '2025-10-13', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YXWDTI' AND training_id = 4 AND done_date >= '2025-10-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZAEFYC', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZAEFYC' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZBMEAY', 4, 1, 'Completed', '2026-02-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZBMEAY' AND training_id = 4 AND done_date >= '2026-02-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZJCTYJ', 4, 1, 'Completed', '2026-09-03', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZJCTYJ' AND training_id = 4 AND done_date >= '2026-09-03');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZNBREP', 4, 1, 'Completed', '2024-10-23', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZNBREP' AND training_id = 4 AND done_date >= '2024-10-23');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZQDVRL', 4, 1, 'Completed', '2025-06-25', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZQDVRL' AND training_id = 4 AND done_date >= '2025-06-25');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZWQKXK', 4, 1, 'Completed', '2025-06-11', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZWQKXK' AND training_id = 4 AND done_date >= '2025-06-11');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, general_remarks)
SELECT 'ZXWGWX', 4, 1, 'Completed', '2026-05-07', NULL, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZXWGWX' AND training_id = 4 AND done_date >= '2026-05-07');
SELECT COUNT(*) AS kavach_inserted FROM div_training_records WHERE general_remarks = @tag;
