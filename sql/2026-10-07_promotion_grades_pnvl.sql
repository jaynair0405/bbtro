-- Grade posting dates from the PNVL staff data sheet (pnvl_data.csv), 2026-10-07: LP Shunter(3), Sr LPS(4), LPG(5).
-- from: LPS<-Sr ALP(2) if the sheet has a Sr ALP date else ALP(1); Sr LPS<-LPS(3); LPG<-Sr LPS(4) if dated else LPS(3).
-- Only where no row exists for that grade on this DB and the date is not before date_of_appointment.
-- created_by = pnvl_full_data_2026-10-07; Undo: 2026-10-07_promotion_grades_pnvl_UNDO.sql
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAEHEH', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAEHEH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAEHEH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AERJGK', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AERJGK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AERJGK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AGYFUR', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AGYFUR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AGYFUR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AHBQNB', 1, 3, 'Promotion', '2020-03-19', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AHBQNB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-03-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AHBQNB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AHWKFX', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AHWKFX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AHWKFX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AMGFNG', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AMGFNG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AMGFNG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASYXLT', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASYXLT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASYXLT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATHHKX', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATHHKX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATHHKX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BHDUGN', 1, 3, 'Promotion', '2025-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BHDUGN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BHDUGN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BPUCFY', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BPUCFY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BPUCFY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BXDASB', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BXDASB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BXDASB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CIOIUH', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CIOIUH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CIOIUH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CMFKSS', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CMFKSS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CMFKSS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CPPPDS', 1, 3, 'Promotion', '2024-04-04', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CPPPDS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-04-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CPPPDS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CPRXJS', 1, 3, 'Promotion', '2025-01-03', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CPRXJS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CPRXJS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQSAYJ', 1, 3, 'Promotion', '2025-02-03', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQSAYJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQSAYJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CRWOCB', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CRWOCB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CRWOCB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CULWTD', 1, 3, 'Promotion', '2018-11-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CULWTD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CULWTD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CUOJNP', 1, 3, 'Promotion', '2025-02-03', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CUOJNP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CUOJNP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CWLEIS', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CWLEIS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CWLEIS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DCOECH', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DCOECH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DCOECH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DCYDJM', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DCYDJM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DCYDJM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DNPGTZ', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DNPGTZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DNPGTZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPRNNB', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPRNNB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPRNNB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DUFOBU', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DUFOBU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DUFOBU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DUFOHU', 1, 3, 'Promotion', '2024-04-25', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DUFOHU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-04-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DUFOHU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWFKUI', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWFKUI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWFKUI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWITHS', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWITHS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWITHS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EADHRL', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EADHRL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EADHRL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EAWRWN', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EAWRWN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EAWRWN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EJMNBF', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EJMNBF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EJMNBF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EPTRAR', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EPTRAR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EPTRAR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EQGPJK', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EQGPJK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EQGPJK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ETBRCP', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ETBRCP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ETBRCP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EULTFX', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EULTFX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EULTFX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FMSJLX', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FMSJLX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FMSJLX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FNXUUD', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FNXUUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FNXUUD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FOZDWT', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FOZDWT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FOZDWT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FRRDUP', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FRRDUP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FRRDUP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSLDMF', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSLDMF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSLDMF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FTEINY', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FTEINY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FTEINY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FTMNKK', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FTMNKK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FTMNKK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FZWXOC', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FZWXOC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FZWXOC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FZZUII', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FZZUII'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FZZUII' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDRQKM', 1, 3, 'Promotion', '2024-03-16', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDRQKM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDRQKM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDZICU', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDZICU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDZICU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJWOIW', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJWOIW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJWOIW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GLLTOI', 1, 3, 'Promotion', '2022-12-23', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GLLTOI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GLLTOI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GTYSCK', 1, 3, 'Promotion', '2025-11-21', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GTYSCK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GTYSCK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HHGYCK', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HHGYCK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HHGYCK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HIHQQC', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HIHQQC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HIHQQC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HIWFEO', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HIWFEO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HIWFEO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HPDBBC', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HPDBBC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HPDBBC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HSRMQN', 1, 3, 'Promotion', '2023-07-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HSRMQN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-07-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HSRMQN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IFCOAF', 1, 3, 'Promotion', '2025-11-21', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IFCOAF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IFCOAF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIIDKD', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIIDKD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIIDKD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IJYMZY', 1, 3, 'Promotion', '2022-07-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IJYMZY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-07-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IJYMZY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INOAGG', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INOAGG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INOAGG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITJGPA', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITJGPA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITJGPA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUCIGM', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUCIGM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUCIGM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IYZHYH', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IYZHYH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IYZHYH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHMDFU', 1, 3, 'Promotion', '2024-03-27', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHMDFU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHMDFU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHXQJD', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHXQJD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHXQJD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JKNMNN', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JKNMNN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JKNMNN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JNBDAB', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JNBDAB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JNBDAB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQIUDL', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQIUDL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQIUDL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JRHRPT', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JRHRPT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JRHRPT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZIHSX', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZIHSX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZIHSX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KTPKRP', 1, 3, 'Promotion', '2024-05-07', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KTPKRP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-05-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KTPKRP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KZDWQC', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KZDWQC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KZDWQC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LADQZO', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LADQZO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LADQZO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLBWDM', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLBWDM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLBWDM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMZUQQ', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMZUQQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMZUQQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LOZBJE', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LOZBJE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LOZBJE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MDDILA', 1, 3, 'Promotion', '2016-08-31', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MDDILA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2016-08-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MDDILA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MGTIIS', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MGTIIS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MGTIIS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MHRNXD', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MHRNXD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MHRNXD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MJBQYH', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MJBQYH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MJBQYH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKTBZZ', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKTBZZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKTBZZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKZUBG', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKZUBG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKZUBG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRNJKS', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRNJKS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRNJKS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTBKPN', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTBKPN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTBKPN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MYDJEH', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MYDJEH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MYDJEH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZHIYN', 1, 3, 'Promotion', '2018-09-06', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZHIYN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZHIYN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NIFKKY', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NIFKKY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NIFKKY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJDCKT', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJDCKT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJDCKT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXBQBG', 1, 3, 'Promotion', '2025-01-03', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXBQBG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXBQBG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NYCRJB', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NYCRJB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NYCRJB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OKZEQA', 1, 3, 'Promotion', '2022-12-23', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OKZEQA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OKZEQA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OTDTHX', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OTDTHX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OTDTHX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWFDLM', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWFDLM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWFDLM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWRCQS', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWRCQS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWRCQS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OXNRND', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OXNRND'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OXNRND' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OYLBCW', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OYLBCW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OYLBCW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBCLRD', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBCLRD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBCLRD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PEXWHC', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PEXWHC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PEXWHC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PFRUAY', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PFRUAY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PFRUAY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PJGZYY', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PJGZYY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PJGZYY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PKHBGQ', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PKHBGQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PKHBGQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PLBYBD', 1, 3, 'Promotion', '2025-01-01', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PLBYBD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-01-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PLBYBD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PQGHRR', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PQGHRR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PQGHRR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PZINCQ', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PZINCQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PZINCQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBRMQW', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBRMQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBRMQW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QDDTAL', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QDDTAL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QDDTAL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QEHLJT', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QEHLJT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QEHLJT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QEHLJT', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QEHLJT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QEHLJT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QIWOMS', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QIWOMS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QIWOMS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QMPXBE', 1, 3, 'Promotion', '2022-12-27', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QMPXBE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QMPXBE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QSCMWO', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QSCMWO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QSCMWO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBZGHH', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBZGHH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBZGHH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RCYMKX', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RCYMKX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RCYMKX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RDIKXF', 1, 3, 'Promotion', '2024-03-16', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RDIKXF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RDIKXF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RGFIOW', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RGFIOW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RGFIOW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RNZQLZ', 1, 3, 'Promotion', '2024-03-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RNZQLZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RNZQLZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RTHPMS', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RTHPMS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RTHPMS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RZKUHF', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RZKUHF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RZKUHF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGPGWM', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGPGWM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGPGWM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SMORYF', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SMORYF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SMORYF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TANHAF', 1, 3, 'Promotion', '2022-12-27', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TANHAF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TANHAF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TATRPN', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TATRPN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TATRPN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TCGCQY', 1, 3, 'Promotion', '2025-08-07', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TCGCQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TCGCQY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'THJEXK', 1, 3, 'Promotion', '2022-07-13', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'THJEXK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-07-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'THJEXK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TRUZXU', 1, 3, 'Promotion', '2023-06-06', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TRUZXU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-06-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TRUZXU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UACMWG', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UACMWG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UACMWG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UARYPG', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UARYPG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UARYPG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UHPYAD', 1, 3, 'Promotion', '2024-05-07', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UHPYAD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-05-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UHPYAD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UIWWPU', 1, 3, 'Promotion', '2023-04-21', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UIWWPU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-04-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UIWWPU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UQLLWL', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UQLLWL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UQLLWL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWKPBR', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWKPBR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWKPBR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WHFUDJ', 1, 3, 'Promotion', '2024-03-16', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WHFUDJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WHFUDJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WHFUDJ', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WHFUDJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WHFUDJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WHXNWC', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WHXNWC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WHXNWC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSCSOL', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSCSOL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSCSOL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XATDBR', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XATDBR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XATDBR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCCRJJ', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCCRJJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCCRJJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCCXSW', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCCXSW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCCXSW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCGCXZ', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCGCXZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCGCXZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XFQQQK', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XFQQQK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XFQQQK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XILKHQ', 1, 3, 'Promotion', '2025-02-03', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XILKHQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XILKHQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XKKJPY', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XKKJPY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XKKJPY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XLQBXH', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XLQBXH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XLQBXH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNTXAE', 1, 3, 'Promotion', '2025-08-16', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNTXAE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNTXAE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YAIHJR', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YAIHJR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YAIHJR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCFTIY', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCFTIY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCFTIY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCKXGP', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCKXGP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCKXGP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YDKDDC', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YDKDDC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YDKDDC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YIDCBY', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YIDCBY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YIDCBY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YIOXQG', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YIOXQG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YIOXQG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQCQNF', 1, 3, 'Promotion', '2022-12-27', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQCQNF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQCQNF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YUQZUZ', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YUQZUZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YUQZUZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YUSKIP', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YUSKIP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YUSKIP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YWJNLS', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YWJNLS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YWJNLS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXNRSS', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXNRSS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXNRSS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZAXKIF', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZAXKIF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZAXKIF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFHRBX', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFHRBX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFHRBX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZGIGBN', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZGIGBN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZGIGBN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZJHWSB', 1, 3, 'Promotion', '2023-07-17', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZJHWSB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-07-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZJHWSB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZKUFQP', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZKUFQP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZKUFQP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZLKQJE', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZLKQJE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZLKQJE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZNCNUB', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZNCNUB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZNCNUB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZTLRJR', 1, 3, 'Promotion', '2025-09-11', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZTLRJR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-09-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZTLRJR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWTWFL', 1, 3, 'Promotion', '2026-10-05', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWTWFL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWTWFL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXJBOK', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXJBOK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXJBOK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GRPBMA', 3, 4, 'Promotion', '2022-12-27', 'Sr LPS posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GRPBMA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GRPBMA' AND p.to_designation_id = 4);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASYXLT', 3, 5, 'Promotion', '2026-09-29', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASYXLT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASYXLT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CRLXSI', 3, 5, 'Promotion', '2026-10-05', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CRLXSI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CRLXSI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CUJUHU', 3, 5, 'Promotion', '2026-04-17', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CUJUHU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-04-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CUJUHU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CUOJNP', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CUOJNP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CUOJNP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DCYDJM', 3, 5, 'Promotion', '2026-06-15', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DCYDJM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-06-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DCYDJM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DUFOBU', 3, 5, 'Promotion', '2026-08-13', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DUFOBU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DUFOBU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ETBRCP', 3, 5, 'Promotion', '2026-10-05', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ETBRCP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ETBRCP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EWYFQK', 3, 5, 'Promotion', '2026-05-15', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EWYFQK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-05-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EWYFQK' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSLDMF', 3, 5, 'Promotion', '2026-04-24', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSLDMF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-04-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSLDMF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FZWXOC', 3, 5, 'Promotion', '2026-10-05', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FZWXOC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FZWXOC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FZZUII', 3, 5, 'Promotion', '2026-08-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FZZUII'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FZZUII' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GIOTLH', 3, 5, 'Promotion', '2026-09-30', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GIOTLH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GIOTLH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJWOIW', 3, 5, 'Promotion', '2026-09-29', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJWOIW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJWOIW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HIWFEO', 3, 5, 'Promotion', '2026-05-07', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HIWFEO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-05-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HIWFEO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IFCOAF', 3, 5, 'Promotion', '2026-10-05', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IFCOAF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IFCOAF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIIDKD', 3, 5, 'Promotion', '2026-09-29', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIIDKD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIIDKD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INOAGG', 3, 5, 'Promotion', '2026-10-05', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INOAGG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INOAGG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUCIGM', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUCIGM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUCIGM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KCFYDR', 3, 5, 'Promotion', '2026-09-16', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KCFYDR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KCFYDR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KTPKRP', 3, 5, 'Promotion', '2026-08-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KTPKRP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KTPKRP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KZROGI', 3, 5, 'Promotion', '2026-10-06', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KZROGI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KZROGI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMZUQQ', 3, 5, 'Promotion', '2026-09-29', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMZUQQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMZUQQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MGTIIS', 3, 5, 'Promotion', '2026-05-19', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MGTIIS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-05-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MGTIIS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKTBZZ', 3, 5, 'Promotion', '2026-09-29', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKTBZZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKTBZZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJDCKT', 3, 5, 'Promotion', '2026-09-29', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJDCKT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJDCKT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NYCRJB', 3, 5, 'Promotion', '2026-03-30', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NYCRJB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-03-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NYCRJB' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWFDLM', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWFDLM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWFDLM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWRCQS', 3, 5, 'Promotion', '2026-08-13', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWRCQS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWRCQS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PQGHRR', 3, 5, 'Promotion', '2026-03-30', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PQGHRR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-03-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PQGHRR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PWDRZF', 3, 5, 'Promotion', '2026-09-15', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PWDRZF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PWDRZF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PZINCQ', 3, 5, 'Promotion', '2026-10-05', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PZINCQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PZINCQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RZKUHF', 3, 5, 'Promotion', '2026-09-15', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RZKUHF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RZKUHF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SMORYF', 3, 5, 'Promotion', '2026-10-06', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SMORYF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SMORYF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TCGCQY', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TCGCQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TCGCQY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UACMWG', 3, 5, 'Promotion', '2026-08-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UACMWG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UACMWG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UQLLWL', 3, 5, 'Promotion', '2026-03-30', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UQLLWL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-03-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UQLLWL' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WNFGRG', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WNFGRG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WNFGRG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSCSOL', 3, 5, 'Promotion', '2026-10-05', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSCSOL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSCSOL' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XATDBR', 3, 5, 'Promotion', '2026-03-30', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XATDBR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-03-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XATDBR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCGCXZ', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCGCXZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCGCXZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XILKHQ', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XILKHQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XILKHQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNTXAE', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNTXAE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNTXAE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YDKDDC', 3, 5, 'Promotion', '2026-05-05', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YDKDDC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-05-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YDKDDC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YWJNLS', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YWJNLS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YWJNLS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZGIGBN', 3, 5, 'Promotion', '2026-09-25', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZGIGBN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZGIGBN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZTLRJR', 3, 5, 'Promotion', '2026-09-28', 'LPG posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZTLRJR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZTLRJR' AND p.to_designation_id = 5);
SELECT to_designation_id, from_designation_id, COUNT(*) AS inserted FROM div_promotion_history WHERE created_by = 'pnvl_full_data_2026-10-07' AND to_designation_id <> 1 GROUP BY 1,2 ORDER BY 1,2;
