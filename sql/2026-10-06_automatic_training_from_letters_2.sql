-- Automatic (training_id 5) from MTC KYN "ONE DAY AUTOMATIC TRG" letters — batch 2.
-- 34 staff added to div_staff_master on 2026-10-06 (CMS crew report import) + 8 already in master
-- matched after batch 1 (letter PF typos / user-confirmed names; MATDRB = Rishikesh Kumar, 22-06).
-- Same rules as 2026-10-05_automatic_training_from_letters.sql: one row per staff, centre 2 MTC_KYN,
-- due = done + 6 months - 1 day, inserted ONLY if no Automatic on/after that date (re-run = no-op).
-- Undo: 2026-10-06_automatic_training_from_letters_2_UNDO.sql
SET @tag = 'automatic_letters_2026-10-05';
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'AAAXIG', 5, 2, 'Completed', '2026-07-18', DATE_SUB(DATE_ADD('2026-07-18', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'AAAXIG' AND training_id = 5 AND done_date >= '2026-07-18');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'BFRZZY', 5, 2, 'Completed', '2026-09-07', DATE_SUB(DATE_ADD('2026-09-07', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'BFRZZY' AND training_id = 5 AND done_date >= '2026-09-07');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'CIHZTE', 5, 2, 'Completed', '2026-06-18', DATE_SUB(DATE_ADD('2026-06-18', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'CIHZTE' AND training_id = 5 AND done_date >= '2026-06-18');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'DFBDPT', 5, 2, 'Completed', '2026-07-14', DATE_SUB(DATE_ADD('2026-07-14', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DFBDPT' AND training_id = 5 AND done_date >= '2026-07-14');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'DFSWXO', 5, 2, 'Completed', '2026-07-16', DATE_SUB(DATE_ADD('2026-07-16', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DFSWXO' AND training_id = 5 AND done_date >= '2026-07-16');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'DHJDWS', 5, 2, 'Completed', '2026-08-31', DATE_SUB(DATE_ADD('2026-08-31', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DHJDWS' AND training_id = 5 AND done_date >= '2026-08-31');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'DJAQGW', 5, 2, 'Completed', '2026-09-02', DATE_SUB(DATE_ADD('2026-09-02', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'DJAQGW' AND training_id = 5 AND done_date >= '2026-09-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'ETBRCP', 5, 2, 'Completed', '2026-08-20', DATE_SUB(DATE_ADD('2026-08-20', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ETBRCP' AND training_id = 5 AND done_date >= '2026-08-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'FBQDZI', 5, 2, 'Completed', '2026-07-01', DATE_SUB(DATE_ADD('2026-07-01', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FBQDZI' AND training_id = 5 AND done_date >= '2026-07-01');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'FZWXOC', 5, 2, 'Completed', '2026-08-20', DATE_SUB(DATE_ADD('2026-08-20', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'FZWXOC' AND training_id = 5 AND done_date >= '2026-08-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'GGKNWD', 5, 2, 'Completed', '2026-07-10', DATE_SUB(DATE_ADD('2026-07-10', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GGKNWD' AND training_id = 5 AND done_date >= '2026-07-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'GIOTLH', 5, 2, 'Completed', '2026-07-22', DATE_SUB(DATE_ADD('2026-07-22', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'GIOTLH' AND training_id = 5 AND done_date >= '2026-07-22');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'HMHOPF', 5, 2, 'Completed', '2026-06-18', DATE_SUB(DATE_ADD('2026-06-18', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'HMHOPF' AND training_id = 5 AND done_date >= '2026-06-18');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'IBGOXW', 5, 2, 'Completed', '2026-06-22', DATE_SUB(DATE_ADD('2026-06-22', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'IBGOXW' AND training_id = 5 AND done_date >= '2026-06-22');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'JIAIWX', 5, 2, 'Completed', '2026-07-10', DATE_SUB(DATE_ADD('2026-07-10', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'JIAIWX' AND training_id = 5 AND done_date >= '2026-07-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'KHKLJU', 5, 2, 'Completed', '2026-06-13', DATE_SUB(DATE_ADD('2026-06-13', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'KHKLJU' AND training_id = 5 AND done_date >= '2026-06-13');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'LEJECG', 5, 2, 'Completed', '2026-06-20', DATE_SUB(DATE_ADD('2026-06-20', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LEJECG' AND training_id = 5 AND done_date >= '2026-06-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'LYDIYQ', 5, 2, 'Completed', '2026-09-02', DATE_SUB(DATE_ADD('2026-09-02', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'LYDIYQ' AND training_id = 5 AND done_date >= '2026-09-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'MATDRB', 5, 2, 'Completed', '2026-06-22', DATE_SUB(DATE_ADD('2026-06-22', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MATDRB' AND training_id = 5 AND done_date >= '2026-06-22');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'MHUEQA', 5, 2, 'Completed', '2026-07-15', DATE_SUB(DATE_ADD('2026-07-15', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MHUEQA' AND training_id = 5 AND done_date >= '2026-07-15');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'MKTBZZ', 5, 2, 'Completed', '2026-08-20', DATE_SUB(DATE_ADD('2026-08-20', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MKTBZZ' AND training_id = 5 AND done_date >= '2026-08-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'MMYXQI', 5, 2, 'Completed', '2026-06-16', DATE_SUB(DATE_ADD('2026-06-16', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'MMYXQI' AND training_id = 5 AND done_date >= '2026-06-16');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'NDWZUO', 5, 2, 'Completed', '2026-09-02', DATE_SUB(DATE_ADD('2026-09-02', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NDWZUO' AND training_id = 5 AND done_date >= '2026-09-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'NXYXQU', 5, 2, 'Completed', '2026-07-17', DATE_SUB(DATE_ADD('2026-07-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'NXYXQU' AND training_id = 5 AND done_date >= '2026-07-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'OXKJKP', 5, 2, 'Completed', '2026-07-20', DATE_SUB(DATE_ADD('2026-07-20', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OXKJKP' AND training_id = 5 AND done_date >= '2026-07-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'OXOKUG', 5, 2, 'Completed', '2026-07-17', DATE_SUB(DATE_ADD('2026-07-17', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'OXOKUG' AND training_id = 5 AND done_date >= '2026-07-17');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'PZINCQ', 5, 2, 'Completed', '2026-08-24', DATE_SUB(DATE_ADD('2026-08-24', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'PZINCQ' AND training_id = 5 AND done_date >= '2026-08-24');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'QJRBSI', 5, 2, 'Completed', '2026-06-30', DATE_SUB(DATE_ADD('2026-06-30', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QJRBSI' AND training_id = 5 AND done_date >= '2026-06-30');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'QMJFWG', 5, 2, 'Completed', '2026-06-16', DATE_SUB(DATE_ADD('2026-06-16', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QMJFWG' AND training_id = 5 AND done_date >= '2026-06-16');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'QPQGMZ', 5, 2, 'Completed', '2026-07-28', DATE_SUB(DATE_ADD('2026-07-28', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QPQGMZ' AND training_id = 5 AND done_date >= '2026-07-28');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'QXPGTE', 5, 2, 'Completed', '2026-09-02', DATE_SUB(DATE_ADD('2026-09-02', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'QXPGTE' AND training_id = 5 AND done_date >= '2026-09-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'RKSDRC', 5, 2, 'Completed', '2026-09-02', DATE_SUB(DATE_ADD('2026-09-02', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'RKSDRC' AND training_id = 5 AND done_date >= '2026-09-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'SDYDKA', 5, 2, 'Completed', '2026-07-25', DATE_SUB(DATE_ADD('2026-07-25', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'SDYDKA' AND training_id = 5 AND done_date >= '2026-07-25');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'URLUFB', 5, 2, 'Completed', '2026-07-10', DATE_SUB(DATE_ADD('2026-07-10', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'URLUFB' AND training_id = 5 AND done_date >= '2026-07-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'UUMJYK', 5, 2, 'Completed', '2026-06-19', DATE_SUB(DATE_ADD('2026-06-19', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'UUMJYK' AND training_id = 5 AND done_date >= '2026-06-19');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'WKKPBG', 5, 2, 'Completed', '2026-08-10', DATE_SUB(DATE_ADD('2026-08-10', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WKKPBG' AND training_id = 5 AND done_date >= '2026-08-10');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'WSCSOL', 5, 2, 'Completed', '2026-08-20', DATE_SUB(DATE_ADD('2026-08-20', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'WSCSOL' AND training_id = 5 AND done_date >= '2026-08-20');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'XIMASJ', 5, 2, 'Completed', '2026-09-02', DATE_SUB(DATE_ADD('2026-09-02', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XIMASJ' AND training_id = 5 AND done_date >= '2026-09-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'XTSSAQ', 5, 2, 'Completed', '2026-06-19', DATE_SUB(DATE_ADD('2026-06-19', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'XTSSAQ' AND training_id = 5 AND done_date >= '2026-06-19');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'YDQYGT', 5, 2, 'Completed', '2026-09-02', DATE_SUB(DATE_ADD('2026-09-02', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YDQYGT' AND training_id = 5 AND done_date >= '2026-09-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'YQCKOK', 5, 2, 'Completed', '2026-07-02', DATE_SUB(DATE_ADD('2026-07-02', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'YQCKOK' AND training_id = 5 AND done_date >= '2026-07-02');
INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT 'ZQJWYF', 5, 2, 'Completed', '2026-09-02', DATE_SUB(DATE_ADD('2026-09-02', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = 'ZQJWYF' AND training_id = 5 AND done_date >= '2026-09-02');
SELECT COUNT(*) AS batch2_rows FROM div_training_records WHERE general_remarks = @tag AND staff_hrms_id IN ('AAAXIG','BFRZZY','CIHZTE','DFBDPT','DFSWXO','DHJDWS','DJAQGW','ETBRCP','FBQDZI','FZWXOC','GGKNWD','GIOTLH','HMHOPF','IBGOXW','JIAIWX','KHKLJU','LEJECG','LYDIYQ','MATDRB','MHUEQA','MKTBZZ','MMYXQI','NDWZUO','NXYXQU','OXKJKP','OXOKUG','PZINCQ','QJRBSI','QMJFWG','QPQGMZ','QXPGTE','RKSDRC','SDYDKA','URLUFB','UUMJYK','WKKPBG','WSCSOL','XIMASJ','XTSSAQ','YDQYGT','YQCKOK','ZQJWYF');
