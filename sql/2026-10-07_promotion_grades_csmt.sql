-- Grade posting dates from the CSMT full-data sheet (csmt_staff_full_data.csv), 2026-10-07:
-- LPS(3), LPG(5), Motorman(8), LPP(6), LP Ghat(9), LPM(7). from_designation per the chain given by the user:
-- ALP->LPS, LPS->LPG, LPG->M/Man or LPP, LPP/M/Man->Ghat, Ghat/M/Man/LPP->LPM.
-- Inserted only where the staff has NO row for that grade on this DB and the date is not before the
-- staff's date_of_appointment. Staff with out-of-order sheet dates excluded (review).
-- created_by = csmt_full_data_2026-10-07; Undo: 2026-10-07_promotion_grades_csmt_UNDO.sql
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFCWJE', 1, 3, 'Promotion', '1998-11-13', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFCWJE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-11-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFCWJE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AIHFBZ', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AIHFBZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AIHFBZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AISMUC', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AISMUC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AISMUC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AKTPQJ', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AKTPQJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AKTPQJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ALBFTP', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ALBFTP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ALBFTP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ALYKTI', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ALYKTI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ALYKTI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AMYWZX', 1, 3, 'Promotion', '2019-08-09', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AMYWZX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-08-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AMYWZX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'APLPOU', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'APLPOU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'APLPOU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ARHTBS', 1, 3, 'Promotion', '1997-06-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ARHTBS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-06-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ARHTBS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASDHAW', 1, 3, 'Promotion', '2021-10-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASDHAW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-10-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASDHAW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASGADB', 1, 3, 'Promotion', '1996-11-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASGADB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1996-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASGADB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATBTMS', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATBTMS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATBTMS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATSOTX', 1, 3, 'Promotion', '2025-01-03', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATSOTX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATSOTX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATSRYH', 1, 3, 'Promotion', '2022-12-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATSRYH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATSRYH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AWAJLA', 1, 3, 'Promotion', '2005-08-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AWAJLA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-08-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AWAJLA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AXUWIG', 1, 3, 'Promotion', '2021-07-28', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AXUWIG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-07-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AXUWIG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AYHSSK', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AYHSSK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AYHSSK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BCROKJ', 1, 3, 'Promotion', '2006-09-06', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BCROKJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-09-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BCROKJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BFHPEZ', 1, 3, 'Promotion', '1997-12-12', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BFHPEZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-12-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BFHPEZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMHDIU', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMHDIU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMHDIU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOTZKC', 1, 3, 'Promotion', '1998-08-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOTZKC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-08-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOTZKC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BQKBTB', 1, 3, 'Promotion', '1997-02-13', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BQKBTB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-02-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BQKBTB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BRIXEG', 1, 3, 'Promotion', '2003-09-29', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BRIXEG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-09-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BRIXEG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BRIZNZ', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BRIZNZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BRIZNZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BSURMW', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BSURMW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BSURMW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BTTFMI', 1, 3, 'Promotion', '2001-01-15', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BTTFMI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BTTFMI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BWKLYK', 1, 3, 'Promotion', '2026-09-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BWKLYK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BWKLYK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BXQYFJ', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BXQYFJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BXQYFJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BYMZGY', 1, 3, 'Promotion', '2024-12-12', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BYMZGY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-12-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BYMZGY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BYQOTX', 1, 3, 'Promotion', '2021-06-29', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BYQOTX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-06-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BYQOTX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZUEQM', 1, 3, 'Promotion', '2018-08-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZUEQM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZUEQM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CAWYSN', 1, 3, 'Promotion', '1997-04-22', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CAWYSN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-04-22')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CAWYSN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CCNUHA', 1, 3, 'Promotion', '1998-11-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CCNUHA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-11-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CCNUHA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CFIEIR', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CFIEIR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CFIEIR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CGNNLR', 1, 3, 'Promotion', '2005-08-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CGNNLR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-08-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CGNNLR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CHONXF', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CHONXF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CHONXF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CKGTSS', 1, 3, 'Promotion', '1999-04-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CKGTSS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-04-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CKGTSS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CNQMTN', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CNQMTN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CNQMTN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQQBQB', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQQBQB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQQBQB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CRLXSI', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CRLXSI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CRLXSI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CTOKXL', 1, 3, 'Promotion', '2011-06-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CTOKXL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CTOKXL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CTPSDQ', 1, 3, 'Promotion', '2021-07-28', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CTPSDQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-07-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CTPSDQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CXGUHH', 1, 3, 'Promotion', '2014-09-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CXGUHH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CXGUHH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CZZWDM', 1, 3, 'Promotion', '2024-09-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CZZWDM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CZZWDM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DAMWXK', 1, 3, 'Promotion', '1997-03-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DAMWXK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-03-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DAMWXK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DDUJRJ', 1, 3, 'Promotion', '2024-09-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DDUJRJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DDUJRJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DEHBPJ', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DEHBPJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DEHBPJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DESEJP', 1, 3, 'Promotion', '2006-09-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DESEJP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-09-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DESEJP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DFSWXO', 1, 3, 'Promotion', '2011-08-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DFSWXO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-08-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DFSWXO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGZFHD', 1, 3, 'Promotion', '1998-11-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGZFHD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-11-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGZFHD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DHJDWS', 1, 3, 'Promotion', '2014-10-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DHJDWS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-10-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DHJDWS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DHKIUY', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DHKIUY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DHKIUY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DIUDNU', 1, 3, 'Promotion', '2003-08-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DIUDNU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-08-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DIUDNU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJIDOY', 1, 3, 'Promotion', '2005-02-21', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJIDOY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-02-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJIDOY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DLBGZQ', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DLBGZQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DLBGZQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DNGWXH', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DNGWXH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DNGWXH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DOOHOI', 1, 3, 'Promotion', '2026-09-07', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DOOHOI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DOOHOI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPBUQW', 1, 3, 'Promotion', '1998-03-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPBUQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPBUQW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPOWYA', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPOWYA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPOWYA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DUMALG', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DUMALG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DUMALG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWEDQN', 1, 3, 'Promotion', '2001-04-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWEDQN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-04-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWEDQN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWFCFU', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWFCFU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWFCFU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DXGGIO', 1, 3, 'Promotion', '2001-09-28', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DXGGIO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DXGGIO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DYPEDI', 1, 3, 'Promotion', '1997-12-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DYPEDI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DYPEDI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZGJDA', 1, 3, 'Promotion', '2001-09-28', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZGJDA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZGJDA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZSXIB', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZSXIB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZSXIB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZWOGZ', 1, 3, 'Promotion', '2015-01-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZWOGZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-01-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZWOGZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ECLSGM', 1, 3, 'Promotion', '1997-06-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ECLSGM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-06-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ECLSGM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EDTKAK', 1, 3, 'Promotion', '2011-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EDTKAK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EDTKAK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EEQSGQ', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EEQSGQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EEQSGQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EERNEB', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EERNEB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EERNEB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EFKHPE', 1, 3, 'Promotion', '2008-08-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EFKHPE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EFKHPE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EFZFTJ', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EFZFTJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EFZFTJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EGDMXT', 1, 3, 'Promotion', '2011-08-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EGDMXT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-08-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EGDMXT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EKWSKG', 1, 3, 'Promotion', '2026-09-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EKWSKG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EKWSKG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EMMXEO', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EMMXEO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EMMXEO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOLYFU', 1, 3, 'Promotion', '2001-06-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOLYFU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-06-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOLYFU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOXXFL', 1, 3, 'Promotion', '2026-09-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOXXFL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOXXFL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EQGOER', 1, 3, 'Promotion', '1998-01-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EQGOER'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-01-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EQGOER' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ETFEGI', 1, 3, 'Promotion', '2005-08-25', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ETFEGI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-08-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ETFEGI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EWAFXC', 1, 3, 'Promotion', '2026-08-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EWAFXC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EWAFXC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EWYFQK', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EWYFQK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EWYFQK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCDQNO', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCDQNO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCDQNO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCDXTE', 1, 3, 'Promotion', '1995-03-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCDXTE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1995-03-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCDXTE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCRSRY', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCRSRY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCRSRY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FDLYAH', 1, 3, 'Promotion', '2005-08-25', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FDLYAH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-08-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FDLYAH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGARXF', 1, 3, 'Promotion', '2003-07-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGARXF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-07-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGARXF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FKCGSI', 1, 3, 'Promotion', '2001-02-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FKCGSI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-02-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FKCGSI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLENLL', 1, 3, 'Promotion', '2026-08-28', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLENLL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLENLL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLQFLH', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLQFLH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLQFLH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLSGDM', 1, 3, 'Promotion', '1998-02-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLSGDM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-02-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLSGDM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FMWPPP', 1, 3, 'Promotion', '2011-06-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FMWPPP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FMWPPP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FQLTYL', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FQLTYL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FQLTYL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FRPAOD', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FRPAOD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FRPAOD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSIQCC', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSIQCC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSIQCC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSLWZB', 1, 3, 'Promotion', '2003-08-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSLWZB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-08-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSLWZB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FYWIHF', 1, 3, 'Promotion', '2001-02-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FYWIHF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-02-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FYWIHF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FZNDZS', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FZNDZS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FZNDZS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GBEXAX', 1, 3, 'Promotion', '2001-02-22', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GBEXAX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-02-22')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GBEXAX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDIHIM', 1, 3, 'Promotion', '1998-03-07', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDIHIM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDIHIM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GEFURM', 1, 3, 'Promotion', '1997-06-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GEFURM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-06-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GEFURM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GIMTUW', 1, 3, 'Promotion', '1998-08-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GIMTUW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-08-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GIMTUW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GIOTLH', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GIOTLH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GIOTLH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJPWKK', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJPWKK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJPWKK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GOAXXJ', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GOAXXJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GOAXXJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GPDMTU', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GPDMTU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GPDMTU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GPFMPU', 1, 3, 'Promotion', '1997-06-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GPFMPU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-06-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GPFMPU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXRRMA', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXRRMA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXRRMA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXSCLO', 1, 3, 'Promotion', '2003-09-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXSCLO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-09-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXSCLO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GYCYHO', 1, 3, 'Promotion', '1998-11-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GYCYHO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-11-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GYCYHO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GYTXGG', 1, 3, 'Promotion', '2024-09-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GYTXGG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GYTXGG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HAMDXU', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HAMDXU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HAMDXU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HBUIXQ', 1, 3, 'Promotion', '2000-10-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HBUIXQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-10-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HBUIXQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HCNHNK', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HCNHNK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HCNHNK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HFQERX', 1, 3, 'Promotion', '2019-08-09', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HFQERX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-08-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HFQERX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HGTPHS', 1, 3, 'Promotion', '1997-04-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HGTPHS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-04-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HGTPHS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HGWPDF', 1, 3, 'Promotion', '2011-12-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HGWPDF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HGWPDF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HHQPAZ', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HHQPAZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HHQPAZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJCTIU', 1, 3, 'Promotion', '2018-07-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJCTIU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-07-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJCTIU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJKNLA', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJKNLA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJKNLA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HRTRCP', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HRTRCP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HRTRCP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HUDDIZ', 1, 3, 'Promotion', '2024-09-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HUDDIZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HUDDIZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HUUKMM', 1, 3, 'Promotion', '2026-09-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HUUKMM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HUUKMM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWUREF', 1, 3, 'Promotion', '2021-10-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWUREF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-10-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWUREF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXDLFX', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXDLFX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXDLFX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXTOXO', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXTOXO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXTOXO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYCICM', 1, 3, 'Promotion', '1998-03-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYCICM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYCICM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYRAHO', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYRAHO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYRAHO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IAKHMT', 1, 3, 'Promotion', '2004-09-08', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IAKHMT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IAKHMT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IAYPRY', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IAYPRY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IAYPRY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IBQHUT', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IBQHUT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IBQHUT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ICHNPA', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ICHNPA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ICHNPA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ICYIUE', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ICYIUE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ICYIUE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IDYWNZ', 1, 3, 'Promotion', '2021-10-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IDYWNZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-10-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IDYWNZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IEXUDR', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IEXUDR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IEXUDR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IGSDLO', 1, 3, 'Promotion', '1997-04-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IGSDLO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-04-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IGSDLO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIJZZT', 1, 3, 'Promotion', '1997-03-31', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIJZZT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-03-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIJZZT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IJPUNC', 1, 3, 'Promotion', '2002-01-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IJPUNC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-01-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IJPUNC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ILIZIN', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ILIZIN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ILIZIN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMOPYD', 1, 3, 'Promotion', '2018-09-05', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMOPYD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMOPYD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMYZGX', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMYZGX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMYZGX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INBWPO', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INBWPO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INBWPO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITUJGL', 1, 3, 'Promotion', '1996-11-21', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITUJGL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1996-11-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITUJGL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IWQSQL', 1, 3, 'Promotion', '2022-12-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IWQSQL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IWQSQL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IZRTPX', 1, 3, 'Promotion', '2019-03-07', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IZRTPX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-03-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IZRTPX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IZWLLC', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IZWLLC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IZWLLC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JCGTNU', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JCGTNU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JCGTNU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDQCPW', 1, 3, 'Promotion', '2005-11-25', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDQCPW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-11-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDQCPW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JGOFNA', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JGOFNA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JGOFNA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJBNRM', 1, 3, 'Promotion', '2011-04-06', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJBNRM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJBNRM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMDDYN', 1, 3, 'Promotion', '2003-12-15', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMDDYN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMDDYN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMXSGS', 1, 3, 'Promotion', '2004-01-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMXSGS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-01-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMXSGS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JOEKNA', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JOEKNA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JOEKNA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JPDHIA', 1, 3, 'Promotion', '2000-10-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JPDHIA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-10-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JPDHIA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQDNPF', 1, 3, 'Promotion', '2003-09-29', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQDNPF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-09-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQDNPF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JRCQGC', 1, 3, 'Promotion', '2021-02-06', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JRCQGC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JRCQGC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JRIHDY', 1, 3, 'Promotion', '1999-05-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JRIHDY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-05-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JRIHDY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JXRGDO', 1, 3, 'Promotion', '2005-08-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JXRGDO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-08-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JXRGDO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JYXPPS', 1, 3, 'Promotion', '2014-09-09', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JYXPPS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JYXPPS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZCUMK', 1, 3, 'Promotion', '2010-08-29', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZCUMK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-08-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZCUMK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZOZWR', 1, 3, 'Promotion', '2003-09-30', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZOZWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-09-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZOZWR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZTQBS', 1, 3, 'Promotion', '2006-09-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZTQBS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-09-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZTQBS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KBSTHB', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KBSTHB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KBSTHB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KCFYDR', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KCFYDR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KCFYDR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDAEYL', 1, 3, 'Promotion', '2011-04-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDAEYL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDAEYL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDBYJO', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDBYJO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDBYJO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDPNIS', 1, 3, 'Promotion', '1997-09-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDPNIS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDPNIS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KFEBEW', 1, 3, 'Promotion', '2011-06-09', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KFEBEW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KFEBEW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHQPGB', 1, 3, 'Promotion', '1998-11-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHQPGB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHQPGB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KJNGBR', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KJNGBR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KJNGBR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKBOBX', 1, 3, 'Promotion', '2008-09-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKBOBX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-09-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKBOBX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKPXGO', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKPXGO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKPXGO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KLRDLG', 1, 3, 'Promotion', '1996-03-12', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KLRDLG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1996-03-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KLRDLG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KMRCCW', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KMRCCW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KMRCCW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KNLXWD', 1, 3, 'Promotion', '2003-09-30', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KNLXWD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-09-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KNLXWD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KPOKDU', 1, 3, 'Promotion', '2022-02-11', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KPOKDU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KPOKDU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KPUANM', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KPUANM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KPUANM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KSAZAQ', 1, 3, 'Promotion', '2018-08-05', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KSAZAQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KSAZAQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWTGKA', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWTGKA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWTGKA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KZROGI', 1, 3, 'Promotion', '2024-09-13', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KZROGI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KZROGI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KZZZKZ', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KZZZKZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KZZZKZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LBFELK', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LBFELK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LBFELK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LFLJEU', 1, 3, 'Promotion', '2003-09-29', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LFLJEU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-09-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LFLJEU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHDNBE', 1, 3, 'Promotion', '2004-09-25', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHDNBE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHDNBE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHDRBI', 1, 3, 'Promotion', '2025-12-08', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHDRBI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHDRBI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LKNBIX', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LKNBIX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LKNBIX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLHRKE', 1, 3, 'Promotion', '2011-05-08', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLHRKE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-05-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLHRKE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMQMOS', 1, 3, 'Promotion', '2001-09-28', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMQMOS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMQMOS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LPPFEB', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LPPFEB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LPPFEB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LQBLOO', 1, 3, 'Promotion', '2005-11-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LQBLOO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-11-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LQBLOO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LRMUBO', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LRMUBO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LRMUBO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LSZKOU', 1, 3, 'Promotion', '1998-03-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LSZKOU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LSZKOU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYAYTT', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYAYTT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYAYTT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYDIYQ', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYDIYQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYDIYQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MAHAOE', 1, 3, 'Promotion', '1994-05-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MAHAOE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1994-05-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MAHAOE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MASFLL', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MASFLL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MASFLL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MBIAJU', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MBIAJU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MBIAJU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MCBLLG', 1, 3, 'Promotion', '2014-09-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MCBLLG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MCBLLG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MGCTZS', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MGCTZS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MGCTZS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MJNWEW', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MJNWEW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MJNWEW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMTDJQ', 1, 3, 'Promotion', '2021-11-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMTDJQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMTDJQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MOGAMS', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MOGAMS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MOGAMS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQFOWC', 1, 3, 'Promotion', '2003-08-05', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQFOWC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-08-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQFOWC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQUSUH', 1, 3, 'Promotion', '1997-04-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQUSUH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQUSUH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQWOQG', 1, 3, 'Promotion', '2011-04-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQWOQG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQWOQG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRFFGR', 1, 3, 'Promotion', '1996-07-21', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRFFGR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1996-07-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRFFGR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MSDTTC', 1, 3, 'Promotion', '2011-04-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MSDTTC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MSDTTC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MSLOTO', 1, 3, 'Promotion', '2001-06-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MSLOTO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-06-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MSLOTO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTJYQR', 1, 3, 'Promotion', '2022-07-11', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTJYQR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-07-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTJYQR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MWRAND', 1, 3, 'Promotion', '2002-01-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MWRAND'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-01-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MWRAND' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MXQEXC', 1, 3, 'Promotion', '2025-12-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MXQEXC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MXQEXC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MYITYB', 1, 3, 'Promotion', '2022-03-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MYITYB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-03-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MYITYB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZSXCY', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZSXCY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZSXCY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZTTXA', 1, 3, 'Promotion', '1998-03-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZTTXA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZTTXA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NBBMIN', 1, 3, 'Promotion', '1997-12-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NBBMIN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-12-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NBBMIN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCMKSG', 1, 3, 'Promotion', '2018-09-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCMKSG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCMKSG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCSYIA', 1, 3, 'Promotion', '2021-07-28', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCSYIA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-07-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCSYIA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDWZUO', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDWZUO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDWZUO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDYUIN', 1, 3, 'Promotion', '2021-05-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDYUIN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-05-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDYUIN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NEWIEI', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NEWIEI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NEWIEI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NGYOMY', 1, 3, 'Promotion', '2025-12-30', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NGYOMY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NGYOMY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NIDXJP', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NIDXJP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NIDXJP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJLJXP', 1, 3, 'Promotion', '1999-04-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJLJXP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-04-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJLJXP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJYPSB', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJYPSB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJYPSB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NNBSRP', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NNBSRP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NNBSRP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NOYTJM', 1, 3, 'Promotion', '2022-12-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NOYTJM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NOYTJM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NOYTJM', 1, 3, 'Promotion', '2024-03-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NOYTJM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NOYTJM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NPCRMX', 1, 3, 'Promotion', '1999-05-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NPCRMX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-05-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NPCRMX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NQPHFS', 1, 3, 'Promotion', '1998-08-07', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NQPHFS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-08-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NQPHFS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NSCOXZ', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NSCOXZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NSCOXZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NUDISO', 1, 3, 'Promotion', '2002-01-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NUDISO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-01-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NUDISO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NUEJEY', 1, 3, 'Promotion', '2018-05-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NUEJEY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-05-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NUEJEY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXFNAC', 1, 3, 'Promotion', '1997-09-11', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXFNAC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-09-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXFNAC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OAHZZU', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OAHZZU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OAHZZU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OCBJOM', 1, 3, 'Promotion', '2002-11-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OCBJOM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-11-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OCBJOM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ODDNLG', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ODDNLG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ODDNLG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OECJFA', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OECJFA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OECJFA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OEZILD', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OEZILD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OEZILD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJMDHH', 1, 3, 'Promotion', '1997-04-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJMDHH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJMDHH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OLIFQG', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OLIFQG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OLIFQG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ONMQEA', 1, 3, 'Promotion', '2022-12-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ONMQEA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ONMQEA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OPNUKX', 1, 3, 'Promotion', '2008-11-05', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OPNUKX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-11-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OPNUKX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OUFTUD', 1, 3, 'Promotion', '1998-03-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OUFTUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OUFTUD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAQMFK', 1, 3, 'Promotion', '1998-03-21', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAQMFK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAQMFK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBALUI', 1, 3, 'Promotion', '2018-08-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBALUI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBALUI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBXPCO', 1, 3, 'Promotion', '2011-08-13', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBXPCO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-08-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBXPCO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBYXQK', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBYXQK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBYXQK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PCBKKZ', 1, 3, 'Promotion', '2024-09-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PCBKKZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PCBKKZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PDNMYP', 1, 3, 'Promotion', '2026-09-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PDNMYP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PDNMYP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PFHPKS', 1, 3, 'Promotion', '2004-01-06', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PFHPKS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-01-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PFHPKS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PJAPMG', 1, 3, 'Promotion', '2026-08-30', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PJAPMG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PJAPMG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PJTPTF', 1, 3, 'Promotion', '1997-12-05', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PJTPTF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-12-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PJTPTF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'POWGTS', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'POWGTS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'POWGTS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PTSNCP', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PTSNCP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PTSNCP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PXCMAS', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PXCMAS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PXCMAS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PZLLEX', 1, 3, 'Promotion', '2007-04-05', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PZLLEX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-04-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PZLLEX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QAGZMI', 1, 3, 'Promotion', '1998-03-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QAGZMI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QAGZMI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBGIHX', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBGIHX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBGIHX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QCJNQM', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QCJNQM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QCJNQM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QCOUDJ', 1, 3, 'Promotion', '2011-12-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QCOUDJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QCOUDJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QCRTEW', 1, 3, 'Promotion', '2022-12-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QCRTEW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QCRTEW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGSYJK', 1, 3, 'Promotion', '2024-12-12', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGSYJK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-12-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGSYJK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGXMRR', 1, 3, 'Promotion', '1998-04-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGXMRR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGXMRR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QHLXWR', 1, 3, 'Promotion', '1998-03-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QHLXWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QHLXWR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QISBFR', 1, 3, 'Promotion', '1998-03-21', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QISBFR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QISBFR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QNBBQA', 1, 3, 'Promotion', '1999-05-08', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QNBBQA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-05-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QNBBQA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QOFNMI', 1, 3, 'Promotion', '2026-09-07', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QOFNMI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QOFNMI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QQFMBH', 1, 3, 'Promotion', '2025-01-03', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QQFMBH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QQFMBH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QSYBTX', 1, 3, 'Promotion', '1997-04-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QSYBTX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-04-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QSYBTX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QXPGTE', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QXPGTE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QXPGTE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QYJZNN', 1, 3, 'Promotion', '2018-10-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QYJZNN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QYJZNN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QZIOMH', 1, 3, 'Promotion', '1998-10-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QZIOMH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-10-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QZIOMH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QZWGZH', 1, 3, 'Promotion', '2018-07-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QZWGZH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-07-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QZWGZH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBDDHT', 1, 3, 'Promotion', '1997-07-31', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBDDHT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-07-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBDDHT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJAWXA', 1, 3, 'Promotion', '2001-06-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJAWXA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-06-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJAWXA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJBIPH', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJBIPH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJBIPH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RMSBWK', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RMSBWK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RMSBWK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RPHFYX', 1, 3, 'Promotion', '2002-01-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RPHFYX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-01-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RPHFYX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RRPDGJ', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RRPDGJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RRPDGJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RSQPNW', 1, 3, 'Promotion', '2014-09-09', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RSQPNW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RSQPNW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RTUBFA', 1, 3, 'Promotion', '2018-09-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RTUBFA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RTUBFA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RWBDCI', 1, 3, 'Promotion', '2022-03-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RWBDCI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-03-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RWBDCI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RXTTIL', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RXTTIL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RXTTIL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYIFGG', 1, 3, 'Promotion', '2003-08-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYIFGG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-08-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYIFGG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RZRGUD', 1, 3, 'Promotion', '2010-08-29', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RZRGUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-08-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RZRGUD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SBONRT', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SBONRT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SBONRT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SBUAQB', 1, 3, 'Promotion', '1995-05-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SBUAQB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1995-05-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SBUAQB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCPZUD', 1, 3, 'Promotion', '2001-02-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCPZUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-02-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCPZUD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCQMAE', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCQMAE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCQMAE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SDUPHT', 1, 3, 'Promotion', '2014-11-11', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SDUPHT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-11-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SDUPHT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SDYDKA', 1, 3, 'Promotion', '2024-09-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SDYDKA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SDYDKA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SEJAYC', 1, 3, 'Promotion', '1998-02-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SEJAYC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-02-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SEJAYC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGILMP', 1, 3, 'Promotion', '1999-02-15', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGILMP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-02-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGILMP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGQEEM', 1, 3, 'Promotion', '2003-12-25', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGQEEM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGQEEM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SPBMEJ', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SPBMEJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SPBMEJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SPXIJK', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SPXIJK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SPXIJK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SRZHZI', 1, 3, 'Promotion', '2001-02-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SRZHZI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-02-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SRZHZI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SUZYCM', 1, 3, 'Promotion', '2021-11-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SUZYCM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SUZYCM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SWBUAB', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SWBUAB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SWBUAB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SWIKXR', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SWIKXR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SWIKXR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SYAITP', 1, 3, 'Promotion', '2026-04-30', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SYAITP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-04-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SYAITP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SYMRPA', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SYMRPA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SYMRPA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBXXKL', 1, 3, 'Promotion', '2025-02-03', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBXXKL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBXXKL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TDRCGF', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TDRCGF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TDRCGF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TEWZBO', 1, 3, 'Promotion', '1998-03-21', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TEWZBO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TEWZBO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TGAZEQ', 1, 3, 'Promotion', '1994-04-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TGAZEQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1994-04-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TGAZEQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TGDIBQ', 1, 3, 'Promotion', '2017-11-30', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TGDIBQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-11-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TGDIBQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TLSHAS', 1, 3, 'Promotion', '2000-10-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TLSHAS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-10-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TLSHAS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TMWSEW', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TMWSEW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TMWSEW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TOOSHY', 1, 3, 'Promotion', '2018-09-12', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TOOSHY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TOOSHY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TQFJRM', 1, 3, 'Promotion', '2011-11-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TQFJRM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-11-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TQFJRM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TRWUJZ', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TRWUJZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TRWUJZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TXNDQT', 1, 3, 'Promotion', '2018-09-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TXNDQT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TXNDQT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UAMDJK', 1, 3, 'Promotion', '2014-09-09', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UAMDJK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UAMDJK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBPPQW', 1, 3, 'Promotion', '2017-12-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBPPQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBPPQW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UDLYRL', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UDLYRL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UDLYRL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UFJRFN', 1, 3, 'Promotion', '2014-07-29', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UFJRFN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-07-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UFJRFN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UHBPWR', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UHBPWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UHBPWR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UHGNCW', 1, 3, 'Promotion', '2018-07-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UHGNCW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-07-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UHGNCW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UKIUPN', 1, 3, 'Promotion', '2018-08-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UKIUPN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UKIUPN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULAUOX', 1, 3, 'Promotion', '2022-12-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULAUOX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULAUOX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UMMSGD', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UMMSGD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UMMSGD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UMYKWE', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UMYKWE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UMYKWE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UNDIOS', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UNDIOS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UNDIOS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'URXTGZ', 1, 3, 'Promotion', '2009-12-22', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'URXTGZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-12-22')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'URXTGZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UUHWAX', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UUHWAX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UUHWAX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWCWXS', 1, 3, 'Promotion', '2004-01-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWCWXS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-01-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWCWXS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UYEOTA', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UYEOTA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UYEOTA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UZEBYP', 1, 3, 'Promotion', '2026-08-12', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UZEBYP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UZEBYP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBCODY', 1, 3, 'Promotion', '2024-03-15', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBCODY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBCODY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBTEZH', 1, 3, 'Promotion', '2017-12-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBTEZH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBTEZH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCFZPJ', 1, 3, 'Promotion', '1995-02-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCFZPJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1995-02-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCFZPJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCRATO', 1, 3, 'Promotion', '2021-11-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCRATO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCRATO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WGRONY', 1, 3, 'Promotion', '2026-08-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WGRONY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WGRONY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIGCSB', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIGCSB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIGCSB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIJBTH', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIJBTH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIJBTH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIWIYJ', 1, 3, 'Promotion', '1998-09-09', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIWIYJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-09-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIWIYJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WMYZLP', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WMYZLP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WMYZLP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WQJDZF', 1, 3, 'Promotion', '2011-05-31', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WQJDZF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-05-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WQJDZF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WRRNRT', 1, 3, 'Promotion', '2004-11-26', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WRRNRT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-11-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WRRNRT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSCLUI', 1, 3, 'Promotion', '1999-04-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSCLUI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSCLUI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSIFHP', 1, 3, 'Promotion', '2026-09-09', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSIFHP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSIFHP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WTALGR', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WTALGR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WTALGR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WTUZMG', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WTUZMG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WTUZMG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WUAPYW', 1, 3, 'Promotion', '2014-11-28', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WUAPYW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-11-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WUAPYW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WUECOI', 1, 3, 'Promotion', '1998-03-07', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WUECOI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WUECOI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WYKHAH', 1, 3, 'Promotion', '1998-03-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WYKHAH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WYKHAH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WZQLQO', 1, 3, 'Promotion', '1996-01-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WZQLQO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1996-01-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WZQLQO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XAFFDC', 1, 3, 'Promotion', '1997-02-21', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XAFFDC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-02-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XAFFDC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XAIOHH', 1, 3, 'Promotion', '2000-09-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XAIOHH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-09-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XAIOHH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XATWGA', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XATWGA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XATWGA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCABAN', 1, 3, 'Promotion', '2003-12-25', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCABAN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCABAN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XFZPYJ', 1, 3, 'Promotion', '2018-09-12', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XFZPYJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XFZPYJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XGGACE', 1, 3, 'Promotion', '2004-01-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XGGACE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-01-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XGGACE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XIIJHZ', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XIIJHZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XIIJHZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XIMASJ', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XIMASJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XIMASJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XJRZFN', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XJRZFN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XJRZFN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XLAEYO', 1, 3, 'Promotion', '1998-02-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XLAEYO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-02-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XLAEYO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XMMAQL', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XMMAQL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XMMAQL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNSWRD', 1, 3, 'Promotion', '2022-02-11', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNSWRD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNSWRD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNTPSN', 1, 3, 'Promotion', '2001-05-25', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNTPSN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-05-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNTPSN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XOKLDA', 1, 3, 'Promotion', '2021-11-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XOKLDA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XOKLDA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPKNSF', 1, 3, 'Promotion', '2018-10-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPKNSF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPKNSF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPMBNO', 1, 3, 'Promotion', '1997-06-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPMBNO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-06-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPMBNO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XQHWRZ', 1, 3, 'Promotion', '2014-09-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XQHWRZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XQHWRZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XTZLLM', 1, 3, 'Promotion', '2024-09-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XTZLLM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XTZLLM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XUKTIY', 1, 3, 'Promotion', '2017-12-05', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XUKTIY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XUKTIY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XWWMHR', 1, 3, 'Promotion', '2022-12-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XWWMHR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XWWMHR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCWGIK', 1, 3, 'Promotion', '1999-04-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCWGIK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-04-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCWGIK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YEAYMP', 1, 3, 'Promotion', '1997-09-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YEAYMP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-09-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YEAYMP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJPMKW', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJPMKW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJPMKW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJZGFL', 1, 3, 'Promotion', '1999-04-14', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJZGFL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-04-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJZGFL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YKKRJA', 1, 3, 'Promotion', '1996-10-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YKKRJA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1996-10-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YKKRJA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YLLJBJ', 1, 3, 'Promotion', '2001-06-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YLLJBJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-06-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YLLJBJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YNTQCQ', 1, 3, 'Promotion', '2019-08-09', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YNTQCQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-08-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YNTQCQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YPKICB', 1, 3, 'Promotion', '1997-01-31', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YPKICB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1997-01-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YPKICB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQMDAF', 1, 3, 'Promotion', '1998-06-15', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQMDAF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-06-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQMDAF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQTOJY', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQTOJY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQTOJY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQZLAE', 1, 3, 'Promotion', '2005-12-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQZLAE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQZLAE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRWKAG', 1, 3, 'Promotion', '1995-02-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRWKAG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1995-02-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRWKAG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YTBTEY', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YTBTEY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YTBTEY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YTLJJZ', 1, 3, 'Promotion', '2024-09-24', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YTLJJZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YTLJJZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YTXQOZ', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YTXQOZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YTXQOZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXSFRW', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXSFRW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXSFRW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXWDTI', 1, 3, 'Promotion', '2001-02-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXWDTI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-02-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXWDTI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYKDDZ', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYKDDZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYKDDZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YZNZEA', 1, 3, 'Promotion', '2021-11-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YZNZEA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YZNZEA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZAEFYC', 1, 3, 'Promotion', '2005-12-02', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZAEFYC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZAEFYC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZBMEAY', 1, 3, 'Promotion', '2001-06-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZBMEAY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-06-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZBMEAY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZCWXCI', 1, 3, 'Promotion', '2018-08-04', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZCWXCI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZCWXCI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFDNPG', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFDNPG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFDNPG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFEGDI', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFEGDI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFEGDI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZGSYFP', 1, 3, 'Promotion', '2026-09-23', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZGSYFP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-09-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZGSYFP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZHJNYQ', 1, 3, 'Promotion', '2018-08-11', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZHJNYQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZHJNYQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZIJXLR', 1, 3, 'Promotion', '2026-07-01', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZIJXLR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-07-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZIJXLR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZNBREP', 1, 3, 'Promotion', '2005-07-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZNBREP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-07-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZNBREP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZOWDBZ', 1, 3, 'Promotion', '1998-02-18', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZOWDBZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-02-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZOWDBZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZPFGZU', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZPFGZU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZPFGZU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZPREOY', 1, 3, 'Promotion', '2026-08-27', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZPREOY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZPREOY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZQDVRL', 1, 3, 'Promotion', '1999-02-05', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZQDVRL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-02-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZQDVRL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZQJWYF', 1, 3, 'Promotion', '2025-11-17', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZQJWYF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZQJWYF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZTPURS', 1, 3, 'Promotion', '2025-12-16', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZTPURS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZTPURS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWQKXK', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWQKXK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWQKXK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXASAW', 1, 3, 'Promotion', '1998-03-20', 'LPS posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXASAW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXASAW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AACWWR', 3, 5, 'Promotion', '2002-02-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AACWWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AACWWR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ABNXJC', 3, 5, 'Promotion', '1998-12-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ABNXJC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ABNXJC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFCWJE', 3, 5, 'Promotion', '2001-03-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFCWJE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFCWJE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ARHTBS', 3, 5, 'Promotion', '1998-12-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ARHTBS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ARHTBS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASGADB', 3, 5, 'Promotion', '1998-07-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASGADB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-07-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASGADB' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BCROKJ', 3, 5, 'Promotion', '2008-10-07', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BCROKJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-10-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BCROKJ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BFHDHX', 3, 5, 'Promotion', '1999-11-26', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BFHDHX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-11-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BFHDHX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BFHPEZ', 3, 5, 'Promotion', '1999-09-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BFHPEZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-09-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BFHPEZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BJAXIY', 3, 5, 'Promotion', '1999-05-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BJAXIY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-05-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BJAXIY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOTZKC', 3, 5, 'Promotion', '2002-02-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOTZKC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOTZKC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BQKBTB', 3, 5, 'Promotion', '1998-07-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BQKBTB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-07-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BQKBTB' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BRIXEG', 3, 5, 'Promotion', '2006-07-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BRIXEG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-07-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BRIXEG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BTTFMI', 3, 5, 'Promotion', '2002-10-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BTTFMI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BTTFMI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZUEQM', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZUEQM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZUEQM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CAWYSN', 3, 5, 'Promotion', '1999-09-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CAWYSN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-09-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CAWYSN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CCNUHA', 3, 5, 'Promotion', '2001-05-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CCNUHA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-05-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CCNUHA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CGNNLR', 3, 5, 'Promotion', '2008-06-26', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CGNNLR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-06-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CGNNLR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CHKGBC', 3, 5, 'Promotion', '1999-09-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CHKGBC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-09-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CHKGBC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CKGTSS', 3, 5, 'Promotion', '2002-05-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CKGTSS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CKGTSS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CKLCJR', 3, 5, 'Promotion', '2002-02-06', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CKLCJR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CKLCJR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CTOKXL', 3, 5, 'Promotion', '2012-03-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CTOKXL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-03-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CTOKXL' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DAMWXK', 3, 5, 'Promotion', '2001-03-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DAMWXK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DAMWXK' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DESEJP', 3, 5, 'Promotion', '2010-04-30', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DESEJP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-04-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DESEJP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DFSWXO', 3, 5, 'Promotion', '2015-12-31', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DFSWXO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-12-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DFSWXO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGZFHD', 3, 5, 'Promotion', '2001-02-17', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGZFHD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-02-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGZFHD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DIUDNU', 3, 5, 'Promotion', '2006-04-18', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DIUDNU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-04-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DIUDNU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJIDOY', 3, 5, 'Promotion', '2009-08-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJIDOY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-08-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJIDOY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DLBGZQ', 3, 5, 'Promotion', '2002-05-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DLBGZQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DLBGZQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPBUQW', 3, 5, 'Promotion', '2002-02-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPBUQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPBUQW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWEDQN', 3, 5, 'Promotion', '2002-11-18', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWEDQN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-11-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWEDQN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DXGGIO', 3, 5, 'Promotion', '2004-04-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DXGGIO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DXGGIO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZGJDA', 3, 5, 'Promotion', '2004-04-26', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZGJDA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZGJDA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZWOGZ', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZWOGZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZWOGZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ECLSGM', 3, 5, 'Promotion', '1999-11-26', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ECLSGM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-11-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ECLSGM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EEQSGQ', 3, 5, 'Promotion', '2002-01-11', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EEQSGQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-01-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EEQSGQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EGDMXT', 3, 5, 'Promotion', '2015-12-31', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EGDMXT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-12-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EGDMXT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EMMXEO', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EMMXEO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EMMXEO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOLYFU', 3, 5, 'Promotion', '2002-10-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOLYFU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOLYFU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EQGOER', 3, 5, 'Promotion', '2000-12-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EQGOER'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-12-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EQGOER' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ETFEGI', 3, 5, 'Promotion', '2008-10-25', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ETFEGI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-10-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ETFEGI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCDXTE', 3, 5, 'Promotion', '1995-10-26', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCDXTE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1995-10-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCDXTE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FDLYAH', 3, 5, 'Promotion', '2009-07-07', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FDLYAH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-07-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FDLYAH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGARXF', 3, 5, 'Promotion', '2006-04-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGARXF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-04-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGARXF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FKCGSI', 3, 5, 'Promotion', '2002-10-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FKCGSI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FKCGSI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLSGDM', 3, 5, 'Promotion', '2001-03-21', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLSGDM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLSGDM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FMWPPP', 3, 5, 'Promotion', '2015-10-21', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FMWPPP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-10-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FMWPPP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FOXBQY', 3, 5, 'Promotion', '1998-12-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FOXBQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FOXBQY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSLWZB', 3, 5, 'Promotion', '2006-04-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSLWZB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-04-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSLWZB' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FYWIHF', 3, 5, 'Promotion', '2002-10-01', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FYWIHF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FYWIHF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GBEXAX', 3, 5, 'Promotion', '2002-10-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GBEXAX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GBEXAX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDIHIM', 3, 5, 'Promotion', '1999-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDIHIM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDIHIM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GEFURM', 3, 5, 'Promotion', '2000-02-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GEFURM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-02-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GEFURM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GIMTUW', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GIMTUW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GIMTUW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GPFMPU', 3, 5, 'Promotion', '2000-02-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GPFMPU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-02-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GPFMPU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXSCLO', 3, 5, 'Promotion', '2005-09-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXSCLO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-09-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXSCLO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GYCYHO', 3, 5, 'Promotion', '2001-03-25', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GYCYHO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GYCYHO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HBUIXQ', 3, 5, 'Promotion', '2001-09-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HBUIXQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HBUIXQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HGTPHS', 3, 5, 'Promotion', '1998-12-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HGTPHS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HGTPHS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HGWPDF', 3, 5, 'Promotion', '2015-12-31', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HGWPDF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-12-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HGWPDF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJCTIU', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJCTIU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJCTIU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJKNLA', 3, 5, 'Promotion', '2000-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJKNLA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJKNLA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYCICM', 3, 5, 'Promotion', '2002-02-22', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYCICM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-22')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYCICM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IAKHMT', 3, 5, 'Promotion', '2008-04-25', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IAKHMT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-04-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IAKHMT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IGSDLO', 3, 5, 'Promotion', '1998-11-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IGSDLO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IGSDLO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIJZZT', 3, 5, 'Promotion', '2001-09-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIJZZT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIJZZT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IJPUNC', 3, 5, 'Promotion', '2004-04-21', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IJPUNC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IJPUNC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMOPYD', 3, 5, 'Promotion', '2019-01-01', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMOPYD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-01-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMOPYD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITUJGL', 3, 5, 'Promotion', '1998-02-11', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITUJGL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-02-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITUJGL' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IZWLLC', 3, 5, 'Promotion', '2002-05-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IZWLLC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IZWLLC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDQCPW', 3, 5, 'Promotion', '2009-09-03', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDQCPW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-09-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDQCPW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JGOFNA', 3, 5, 'Promotion', '2002-06-27', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JGOFNA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-06-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JGOFNA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJBNRM', 3, 5, 'Promotion', '2012-07-30', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJBNRM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-07-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJBNRM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMDDYN', 3, 5, 'Promotion', '2006-08-25', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMDDYN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-08-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMDDYN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMXSGS', 3, 5, 'Promotion', '2007-07-11', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMXSGS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-07-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMXSGS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JPDHIA', 3, 5, 'Promotion', '2002-09-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JPDHIA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JPDHIA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQDNPF', 3, 5, 'Promotion', '2006-07-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQDNPF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-07-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQDNPF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JXRGDO', 3, 5, 'Promotion', '2009-07-07', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JXRGDO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-07-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JXRGDO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZCUMK', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZCUMK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZCUMK' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZOZWR', 3, 5, 'Promotion', '2006-07-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZOZWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-07-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZOZWR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZTQBS', 3, 5, 'Promotion', '2010-04-05', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZTQBS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-04-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZTQBS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDAEYL', 3, 5, 'Promotion', '2012-07-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDAEYL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-07-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDAEYL' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDPNIS', 3, 5, 'Promotion', '2001-09-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDPNIS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDPNIS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KFEBEW', 3, 5, 'Promotion', '2012-01-18', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KFEBEW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-01-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KFEBEW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHQPGB', 3, 5, 'Promotion', '2001-03-23', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHQPGB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHQPGB' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KIZZQW', 3, 5, 'Promotion', '1998-11-04', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KIZZQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-11-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KIZZQW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKBOBX', 3, 5, 'Promotion', '2010-08-12', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKBOBX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-08-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKBOBX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKPXGO', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKPXGO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKPXGO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KLRDLG', 3, 5, 'Promotion', '1998-01-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KLRDLG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-01-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KLRDLG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KNLXWD', 3, 5, 'Promotion', '2006-07-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KNLXWD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-07-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KNLXWD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KSAZAQ', 3, 5, 'Promotion', '2018-10-23', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KSAZAQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KSAZAQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LCIMGM', 3, 5, 'Promotion', '2000-02-05', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LCIMGM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-02-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LCIMGM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LFLJEU', 3, 5, 'Promotion', '2006-07-21', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LFLJEU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-07-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LFLJEU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHDNBE', 3, 5, 'Promotion', '2008-04-25', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHDNBE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-04-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHDNBE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLGBHZ', 3, 5, 'Promotion', '2004-04-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLGBHZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLGBHZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLHRKE', 3, 5, 'Promotion', '2015-05-23', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLHRKE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-05-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLHRKE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMQMOS', 3, 5, 'Promotion', '2003-12-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMQMOS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMQMOS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LQBLOO', 3, 5, 'Promotion', '2008-12-30', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LQBLOO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-12-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LQBLOO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LSZKOU', 3, 5, 'Promotion', '2000-09-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LSZKOU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LSZKOU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MAHAOE', 3, 5, 'Promotion', '1998-07-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MAHAOE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-07-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MAHAOE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MELUJC', 3, 5, 'Promotion', '2001-03-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MELUJC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MELUJC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MFJHJA', 3, 5, 'Promotion', '1998-06-27', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MFJHJA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-06-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MFJHJA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MJNWEW', 3, 5, 'Promotion', '2022-02-25', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MJNWEW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MJNWEW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQFOWC', 3, 5, 'Promotion', '2005-05-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQFOWC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-05-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQFOWC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQUSUH', 3, 5, 'Promotion', '1999-01-01', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQUSUH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-01-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQUSUH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQWOQG', 3, 5, 'Promotion', '2011-12-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQWOQG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQWOQG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRFFGR', 3, 5, 'Promotion', '1998-03-30', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRFFGR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-03-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRFFGR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MSDTTC', 3, 5, 'Promotion', '2015-03-12', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MSDTTC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-03-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MSDTTC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MSLOTO', 3, 5, 'Promotion', '2002-05-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MSLOTO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MSLOTO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MWRAND', 3, 5, 'Promotion', '2004-07-13', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MWRAND'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-07-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MWRAND' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZTTXA', 3, 5, 'Promotion', '2002-02-22', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZTTXA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-22')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZTTXA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NBBMIN', 3, 5, 'Promotion', '2001-03-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NBBMIN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NBBMIN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJLJXP', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJLJXP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJLJXP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NQPHFS', 3, 5, 'Promotion', '2001-09-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NQPHFS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NQPHFS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NSCOXZ', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NSCOXZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NSCOXZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NUDISO', 3, 5, 'Promotion', '2004-04-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NUDISO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NUDISO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXFNAC', 3, 5, 'Promotion', '1999-09-25', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXFNAC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-09-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXFNAC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OCBJOM', 3, 5, 'Promotion', '2004-09-22', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OCBJOM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-09-22')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OCBJOM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJMDHH', 3, 5, 'Promotion', '2001-09-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJMDHH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJMDHH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ONTQPY', 3, 5, 'Promotion', '1999-09-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ONTQPY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-09-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ONTQPY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OPNUKX', 3, 5, 'Promotion', '2011-10-14', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OPNUKX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-10-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OPNUKX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OUFTUD', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OUFTUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OUFTUD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAQMFK', 3, 5, 'Promotion', '2001-03-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAQMFK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAQMFK' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBALUI', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBALUI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBALUI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PFHPKS', 3, 5, 'Promotion', '2007-07-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PFHPKS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-07-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PFHPKS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PJTPTF', 3, 5, 'Promotion', '1999-08-27', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PJTPTF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-08-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PJTPTF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PKXSDX', 3, 5, 'Promotion', '1998-10-06', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PKXSDX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-10-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PKXSDX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PRWLXT', 3, 5, 'Promotion', '2002-06-27', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PRWLXT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-06-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PRWLXT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PZLLEX', 3, 5, 'Promotion', '2010-06-04', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PZLLEX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-06-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PZLLEX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QAGZMI', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QAGZMI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QAGZMI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBGIHX', 3, 5, 'Promotion', '2002-05-16', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBGIHX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBGIHX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGXMRR', 3, 5, 'Promotion', '2002-09-03', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGXMRR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-09-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGXMRR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QHLXWR', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QHLXWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QHLXWR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QISBFR', 3, 5, 'Promotion', '2000-11-14', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QISBFR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-11-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QISBFR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QNBBQA', 3, 5, 'Promotion', '2000-02-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QNBBQA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-02-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QNBBQA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QSYBTX', 3, 5, 'Promotion', '1999-09-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QSYBTX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-09-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QSYBTX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QZIOMH', 3, 5, 'Promotion', '2002-06-27', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QZIOMH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-06-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QZIOMH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QZWGZH', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QZWGZH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QZWGZH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBDDHT', 3, 5, 'Promotion', '2001-03-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBDDHT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBDDHT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJAWXA', 3, 5, 'Promotion', '2002-02-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJAWXA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJAWXA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RPHFYX', 3, 5, 'Promotion', '2004-04-21', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RPHFYX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RPHFYX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYIFGG', 3, 5, 'Promotion', '2006-04-18', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYIFGG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-04-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYIFGG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RZRGUD', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RZRGUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RZRGUD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SBUAQB', 3, 5, 'Promotion', '1995-10-26', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SBUAQB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1995-10-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SBUAQB' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCPZUD', 3, 5, 'Promotion', '2002-10-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCPZUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCPZUD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCQCKE', 3, 5, 'Promotion', '2002-06-27', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCQCKE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-06-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCQCKE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SECEYG', 3, 5, 'Promotion', '1995-06-01', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SECEYG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1995-06-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SECEYG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SEJAYC', 3, 5, 'Promotion', '2003-03-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SEJAYC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SEJAYC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGILMP', 3, 5, 'Promotion', '2001-09-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGILMP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGILMP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGQEEM', 3, 5, 'Promotion', '2006-09-12', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGQEEM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-09-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGQEEM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SRZHZI', 3, 5, 'Promotion', '2002-10-07', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SRZHZI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SRZHZI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TEWZBO', 3, 5, 'Promotion', '2001-02-17', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TEWZBO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-02-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TEWZBO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TGDIBQ', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TGDIBQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TGDIBQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TLSHAS', 3, 5, 'Promotion', '2001-11-06', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TLSHAS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-11-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TLSHAS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UAMDJK', 3, 5, 'Promotion', '2018-10-01', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UAMDJK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UAMDJK' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBPPQW', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBPPQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBPPQW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UHGNCW', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UHGNCW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UHGNCW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'URXTGZ', 3, 5, 'Promotion', '2010-10-07', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'URXTGZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-10-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'URXTGZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWCWXS', 3, 5, 'Promotion', '2007-07-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWCWXS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-07-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWCWXS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBTEZH', 3, 5, 'Promotion', '2018-04-12', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBTEZH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-04-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBTEZH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCFZPJ', 3, 5, 'Promotion', '1995-05-22', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCFZPJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1995-05-22')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCFZPJ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIWIYJ', 3, 5, 'Promotion', '1999-08-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIWIYJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-08-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIWIYJ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WQJDZF', 3, 5, 'Promotion', '2012-08-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WQJDZF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WQJDZF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WRRNRT', 3, 5, 'Promotion', '2008-06-26', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WRRNRT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-06-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WRRNRT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSCLUI', 3, 5, 'Promotion', '2002-06-26', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSCLUI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-06-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSCLUI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WUECOI', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WUECOI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WUECOI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WYKHAH', 3, 5, 'Promotion', '2002-02-22', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WYKHAH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-22')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WYKHAH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WZQLQO', 3, 5, 'Promotion', '2001-09-07', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WZQLQO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WZQLQO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XAFFDC', 3, 5, 'Promotion', '1998-07-17', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XAFFDC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-07-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XAFFDC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XAIOHH', 3, 5, 'Promotion', '2002-05-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XAIOHH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XAIOHH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCABAN', 3, 5, 'Promotion', '2006-09-12', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCABAN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2006-09-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCABAN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XGGACE', 3, 5, 'Promotion', '2007-07-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XGGACE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-07-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XGGACE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XLAEYO', 3, 5, 'Promotion', '2001-03-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XLAEYO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XLAEYO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XMMAQL', 3, 5, 'Promotion', '2002-05-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XMMAQL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XMMAQL' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNTPSN', 3, 5, 'Promotion', '2003-04-28', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNTPSN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-04-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNTPSN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPMBNO', 3, 5, 'Promotion', '1998-12-02', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPMBNO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPMBNO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XUKTIY', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XUKTIY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XUKTIY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCWGIK', 3, 5, 'Promotion', '2002-02-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCWGIK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCWGIK' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YEAYMP', 3, 5, 'Promotion', '2001-09-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YEAYMP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YEAYMP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YEGSRW', 3, 5, 'Promotion', '2026-04-30', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YEGSRW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2026-04-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YEGSRW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJZGFL', 3, 5, 'Promotion', '2002-06-27', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJZGFL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-06-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJZGFL' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YKKRJA', 3, 5, 'Promotion', '1998-12-14', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YKKRJA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-12-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YKKRJA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YLLJBJ', 3, 5, 'Promotion', '2002-03-23', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YLLJBJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-03-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YLLJBJ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YOWELD', 3, 5, 'Promotion', '1998-11-05', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YOWELD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-11-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YOWELD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YPKICB', 3, 5, 'Promotion', '2000-02-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YPKICB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-02-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YPKICB' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQMDAF', 3, 5, 'Promotion', '1999-09-15', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQMDAF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-09-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQMDAF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQZLAE', 3, 5, 'Promotion', '2009-03-27', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQZLAE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-03-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQZLAE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRWKAG', 3, 5, 'Promotion', '1995-06-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRWKAG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1995-06-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRWKAG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXWDTI', 3, 5, 'Promotion', '2002-10-08', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXWDTI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXWDTI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZAEFYC', 3, 5, 'Promotion', '2008-08-19', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZAEFYC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZAEFYC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZBMEAY', 3, 5, 'Promotion', '2002-09-03', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZBMEAY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-09-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZBMEAY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZNBREP', 3, 5, 'Promotion', '2009-08-16', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZNBREP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZNBREP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZOWDBZ', 3, 5, 'Promotion', '2001-03-20', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZOWDBZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-03-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZOWDBZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZQDVRL', 3, 5, 'Promotion', '2002-06-27', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZQDVRL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-06-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZQDVRL' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWQKXK', 3, 5, 'Promotion', '2002-05-09', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWQKXK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWQKXK' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXASAW', 3, 5, 'Promotion', '2002-05-10', 'LPG posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXASAW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-05-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXASAW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BRIXEG', 5, 6, 'Promotion', '2012-07-18', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BRIXEG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-07-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BRIXEG' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZUEQM', 5, 6, 'Promotion', '2025-11-11', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZUEQM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZUEQM' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CTOKXL', 5, 6, 'Promotion', '2019-11-20', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CTOKXL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-11-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CTOKXL' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DESEJP', 5, 6, 'Promotion', '2017-12-28', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DESEJP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DESEJP' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DFSWXO', 5, 6, 'Promotion', '2025-02-10', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DFSWXO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DFSWXO' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJIDOY', 5, 6, 'Promotion', '2013-04-30', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJIDOY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2013-04-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJIDOY' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DXGGIO', 5, 6, 'Promotion', '2011-10-03', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DXGGIO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-10-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DXGGIO' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZWOGZ', 5, 6, 'Promotion', '2025-09-13', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZWOGZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZWOGZ' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EGDMXT', 5, 6, 'Promotion', '2025-02-10', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EGDMXT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EGDMXT' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FMWPPP', 5, 6, 'Promotion', '2020-12-31', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FMWPPP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-12-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FMWPPP' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HGWPDF', 5, 6, 'Promotion', '2025-02-10', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HGWPDF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HGWPDF' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJCTIU', 5, 6, 'Promotion', '2025-09-13', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJCTIU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJCTIU' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMOPYD', 5, 6, 'Promotion', '2025-02-10', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMOPYD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMOPYD' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITUJGL', 5, 6, 'Promotion', '2003-09-19', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITUJGL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-09-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITUJGL' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDQCPW', 5, 6, 'Promotion', '2017-12-17', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDQCPW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDQCPW' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJBNRM', 5, 6, 'Promotion', '2022-06-03', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJBNRM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-06-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJBNRM' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JXRGDO', 5, 6, 'Promotion', '2014-09-05', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JXRGDO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JXRGDO' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDAEYL', 5, 6, 'Promotion', '2020-02-06', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDAEYL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-02-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDAEYL' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KFEBEW', 5, 6, 'Promotion', '2019-11-20', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KFEBEW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-11-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KFEBEW' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKBOBX', 5, 6, 'Promotion', '2017-11-15', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKBOBX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKBOBX' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KSAZAQ', 5, 6, 'Promotion', '2025-11-11', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KSAZAQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KSAZAQ' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLHRKE', 5, 6, 'Promotion', '2020-12-31', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLHRKE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-12-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLHRKE' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMQQFS', 5, 6, 'Promotion', '2007-06-23', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMQQFS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMQQFS' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LQBLOO', 5, 6, 'Promotion', '2014-04-04', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LQBLOO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-04-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LQBLOO' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQWOQG', 5, 6, 'Promotion', '2020-12-20', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQWOQG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-12-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQWOQG' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MSDTTC', 5, 6, 'Promotion', '2020-12-11', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MSDTTC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-12-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MSDTTC' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCEGOL', 5, 6, 'Promotion', '2007-10-29', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCEGOL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-10-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCEGOL' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXPALK', 5, 6, 'Promotion', '2025-12-17', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXPALK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXPALK' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OPNUKX', 5, 6, 'Promotion', '2019-06-23', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OPNUKX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-06-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OPNUKX' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBALUI', 5, 6, 'Promotion', '2025-11-11', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBALUI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBALUI' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PZLLEX', 5, 6, 'Promotion', '2019-06-28', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PZLLEX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-06-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PZLLEX' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QZWGZH', 5, 6, 'Promotion', '2025-09-13', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QZWGZH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QZWGZH' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TGDIBQ', 5, 6, 'Promotion', '2025-02-10', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TGDIBQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TGDIBQ' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UAMDJK', 5, 6, 'Promotion', '2025-09-13', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UAMDJK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-09-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UAMDJK' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBPPQW', 5, 6, 'Promotion', '2025-02-10', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBPPQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBPPQW' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UFQQTQ', 5, 6, 'Promotion', '2012-09-19', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UFQQTQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-09-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UFQQTQ' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UHGNCW', 5, 6, 'Promotion', '2025-11-11', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UHGNCW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UHGNCW' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBTEZH', 5, 6, 'Promotion', '2025-02-10', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBTEZH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBTEZH' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WQJDZF', 5, 6, 'Promotion', '2020-12-31', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WQJDZF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-12-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WQJDZF' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XUKTIY', 5, 6, 'Promotion', '2025-02-10', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XUKTIY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XUKTIY' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJZGFL', 5, 6, 'Promotion', '2007-10-29', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJZGFL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-10-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJZGFL' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRWKAG', 5, 6, 'Promotion', '2000-04-11', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRWKAG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-04-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRWKAG' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZNBREP', 5, 6, 'Promotion', '2014-09-05', 'LPP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZNBREP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZNBREP' AND p.to_designation_id = 6);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DLBGZQ', 8, 7, 'Promotion', '2024-05-28', 'LPM posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DLBGZQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2024-05-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DLBGZQ' AND p.to_designation_id = 7);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AACWWR', 5, 8, 'Promotion', '2007-02-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AACWWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-02-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AACWWR' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ABNXJC', 5, 8, 'Promotion', '2003-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ABNXJC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ABNXJC' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFCWJE', 5, 8, 'Promotion', '2004-04-23', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFCWJE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFCWJE' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ARHTBS', 5, 8, 'Promotion', '2003-01-07', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ARHTBS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ARHTBS' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASGADB', 5, 8, 'Promotion', '2003-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASGADB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASGADB' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BCROKJ', 5, 8, 'Promotion', '2011-04-08', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BCROKJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BCROKJ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BFHDHX', 5, 8, 'Promotion', '2004-11-01', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BFHDHX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-11-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BFHDHX' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BFHPEZ', 5, 8, 'Promotion', '2004-04-23', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BFHPEZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BFHPEZ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BJAXIY', 5, 8, 'Promotion', '2001-10-25', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BJAXIY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-10-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BJAXIY' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOTZKC', 5, 8, 'Promotion', '2005-04-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOTZKC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-04-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOTZKC' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BQKBTB', 5, 8, 'Promotion', '2001-10-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BQKBTB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-10-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BQKBTB' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BTTFMI', 5, 8, 'Promotion', '2007-02-27', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BTTFMI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-02-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BTTFMI' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CAWYSN', 5, 8, 'Promotion', '2003-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CAWYSN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CAWYSN' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CCNUHA', 5, 8, 'Promotion', '2007-07-26', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CCNUHA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-07-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CCNUHA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CKGTSS', 5, 8, 'Promotion', '2005-01-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CKGTSS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CKGTSS' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CKLCJR', 5, 8, 'Promotion', '2007-02-28', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CKLCJR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-02-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CKLCJR' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DAMWXK', 5, 8, 'Promotion', '2003-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DAMWXK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DAMWXK' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGZFHD', 5, 8, 'Promotion', '2004-04-23', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGZFHD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGZFHD' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DIUDNU', 5, 8, 'Promotion', '2009-12-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DIUDNU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-12-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DIUDNU' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DLBGZQ', 5, 8, 'Promotion', '2007-05-28', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DLBGZQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-05-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DLBGZQ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPBUQW', 5, 8, 'Promotion', '2005-04-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPBUQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-04-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPBUQW' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWEDQN', 5, 8, 'Promotion', '2008-12-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWEDQN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-12-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWEDQN' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DXGGIO', 5, 8, 'Promotion', '2011-10-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DXGGIO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-10-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DXGGIO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZGJDA', 5, 8, 'Promotion', '2011-10-11', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZGJDA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-10-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZGJDA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ECLSGM', 5, 8, 'Promotion', '2004-11-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ECLSGM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-11-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ECLSGM' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EEQSGQ', 5, 8, 'Promotion', '2007-06-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EEQSGQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EEQSGQ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EMMXEO', 5, 8, 'Promotion', '2007-06-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EMMXEO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EMMXEO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOLYFU', 5, 8, 'Promotion', '2008-11-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOLYFU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-11-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOLYFU' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EQGOER', 5, 8, 'Promotion', '2002-02-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EQGOER'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-02-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EQGOER' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCDXTE', 5, 8, 'Promotion', '1999-05-10', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCDXTE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-05-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCDXTE' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGARXF', 5, 8, 'Promotion', '2012-05-19', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGARXF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-05-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGARXF' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FKCGSI', 5, 8, 'Promotion', '2009-12-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FKCGSI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-12-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FKCGSI' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLSGDM', 5, 8, 'Promotion', '2003-12-01', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLSGDM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLSGDM' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FOXBQY', 5, 8, 'Promotion', '2003-01-01', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FOXBQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FOXBQY' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSLWZB', 5, 8, 'Promotion', '2012-06-27', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSLWZB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-06-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSLWZB' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FYWIHF', 5, 8, 'Promotion', '2007-02-28', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FYWIHF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-02-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FYWIHF' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GBEXAX', 5, 8, 'Promotion', '2008-01-21', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GBEXAX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-01-21')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GBEXAX' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDIHIM', 5, 8, 'Promotion', '2002-10-07', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDIHIM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDIHIM' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GEFURM', 5, 8, 'Promotion', '2004-11-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GEFURM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-11-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GEFURM' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GIMTUW', 5, 8, 'Promotion', '2007-02-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GIMTUW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-02-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GIMTUW' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GPFMPU', 5, 8, 'Promotion', '2000-11-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GPFMPU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-11-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GPFMPU' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXSCLO', 5, 8, 'Promotion', '2009-10-16', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXSCLO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-10-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXSCLO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GYCYHO', 5, 8, 'Promotion', '2003-12-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GYCYHO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GYCYHO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HBUIXQ', 5, 8, 'Promotion', '2004-04-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HBUIXQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HBUIXQ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HGTPHS', 5, 8, 'Promotion', '2003-01-19', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HGTPHS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HGTPHS' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJKNLA', 5, 8, 'Promotion', '2007-05-28', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJKNLA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-05-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJKNLA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYCICM', 5, 8, 'Promotion', '2005-04-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYCICM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-04-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYCICM' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IGSDLO', 5, 8, 'Promotion', '2003-01-13', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IGSDLO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IGSDLO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIJZZT', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIJZZT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIJZZT' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IJPUNC', 5, 8, 'Promotion', '2010-02-16', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IJPUNC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-02-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IJPUNC' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITUJGL', 5, 8, 'Promotion', '2001-10-25', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITUJGL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-10-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITUJGL' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IZWLLC', 5, 8, 'Promotion', '2007-06-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IZWLLC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IZWLLC' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JGOFNA', 5, 8, 'Promotion', '2007-06-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JGOFNA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JGOFNA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJBNRM', 5, 8, 'Promotion', '2020-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJBNRM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJBNRM' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JPDHIA', 5, 8, 'Promotion', '2008-01-01', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JPDHIA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-01-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JPDHIA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZCUMK', 5, 8, 'Promotion', '2020-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZCUMK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZCUMK' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZTQBS', 5, 8, 'Promotion', '2017-12-18', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZTQBS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZTQBS' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDPNIS', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDPNIS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDPNIS' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHQPGB', 5, 8, 'Promotion', '2003-12-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHQPGB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHQPGB' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KIZZQW', 5, 8, 'Promotion', '2003-12-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KIZZQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KIZZQW' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKPXGO', 5, 8, 'Promotion', '2007-06-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKPXGO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKPXGO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KLRDLG', 5, 8, 'Promotion', '2000-05-06', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KLRDLG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-05-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KLRDLG' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LCIMGM', 5, 8, 'Promotion', '2002-08-07', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LCIMGM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-08-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LCIMGM' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLGBHZ', 5, 8, 'Promotion', '2010-10-16', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLGBHZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-10-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLGBHZ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMQMOS', 5, 8, 'Promotion', '2008-12-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMQMOS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-12-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMQMOS' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LSZKOU', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LSZKOU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LSZKOU' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MAHAOE', 5, 8, 'Promotion', '2001-10-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MAHAOE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-10-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MAHAOE' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MELUJC', 5, 8, 'Promotion', '2003-12-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MELUJC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MELUJC' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MFJHJA', 5, 8, 'Promotion', '2023-01-06', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MFJHJA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-01-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MFJHJA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQFOWC', 5, 8, 'Promotion', '2009-10-16', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQFOWC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-10-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQFOWC' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQUSUH', 5, 8, 'Promotion', '2003-12-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQUSUH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQUSUH' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRFFGR', 5, 8, 'Promotion', '2022-10-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRFFGR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-10-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRFFGR' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MSLOTO', 5, 8, 'Promotion', '2005-01-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MSLOTO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MSLOTO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MWRAND', 5, 8, 'Promotion', '2010-02-10', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MWRAND'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MWRAND' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZTTXA', 5, 8, 'Promotion', '2005-04-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZTTXA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-04-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZTTXA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NBBMIN', 5, 8, 'Promotion', '2005-01-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NBBMIN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NBBMIN' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJLJXP', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJLJXP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJLJXP' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NQPHFS', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NQPHFS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NQPHFS' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NSCOXZ', 5, 8, 'Promotion', '2007-05-28', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NSCOXZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-05-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NSCOXZ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NUDISO', 5, 8, 'Promotion', '2010-02-10', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NUDISO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NUDISO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXFNAC', 5, 8, 'Promotion', '2002-10-07', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXFNAC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXFNAC' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OCBJOM', 5, 8, 'Promotion', '2009-10-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OCBJOM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-10-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OCBJOM' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJMDHH', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJMDHH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJMDHH' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ONTQPY', 5, 8, 'Promotion', '2004-04-23', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ONTQPY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ONTQPY' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OUFTUD', 5, 8, 'Promotion', '2007-02-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OUFTUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-02-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OUFTUD' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAQMFK', 5, 8, 'Promotion', '2003-12-01', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAQMFK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAQMFK' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PJTPTF', 5, 8, 'Promotion', '2003-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PJTPTF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PJTPTF' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PKXSDX', 5, 8, 'Promotion', '2004-11-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PKXSDX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-11-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PKXSDX' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PRWLXT', 5, 8, 'Promotion', '2007-10-28', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PRWLXT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-10-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PRWLXT' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QAGZMI', 5, 8, 'Promotion', '2005-04-02', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QAGZMI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QAGZMI' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBGIHX', 5, 8, 'Promotion', '2007-05-28', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBGIHX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-05-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBGIHX' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGXMRR', 5, 8, 'Promotion', '2007-12-01', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGXMRR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-12-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGXMRR' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QHLXWR', 5, 8, 'Promotion', '2007-02-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QHLXWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-02-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QHLXWR' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QISBFR', 5, 8, 'Promotion', '2004-04-23', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QISBFR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QISBFR' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QNBBQA', 5, 8, 'Promotion', '2004-11-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QNBBQA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-11-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QNBBQA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QSYBTX', 5, 8, 'Promotion', '2003-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QSYBTX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QSYBTX' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QZIOMH', 5, 8, 'Promotion', '2007-06-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QZIOMH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QZIOMH' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBDDHT', 5, 8, 'Promotion', '2005-01-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBDDHT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBDDHT' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJAWXA', 5, 8, 'Promotion', '2004-11-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJAWXA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-11-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJAWXA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RPHFYX', 5, 8, 'Promotion', '2010-02-16', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RPHFYX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-02-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RPHFYX' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYEZAT', 5, 8, 'Promotion', '2000-03-06', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYEZAT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-03-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYEZAT' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYIFGG', 5, 8, 'Promotion', '2012-05-18', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYIFGG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-05-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYIFGG' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RZRGUD', 5, 8, 'Promotion', '2020-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RZRGUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RZRGUD' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SBUAQB', 5, 8, 'Promotion', '2000-04-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SBUAQB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2000-04-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SBUAQB' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCPZUD', 5, 8, 'Promotion', '2008-01-25', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCPZUD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-01-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCPZUD' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCQCKE', 5, 8, 'Promotion', '2007-06-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCQCKE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCQCKE' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SECEYG', 5, 8, 'Promotion', '1999-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SECEYG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SECEYG' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SEJAYC', 5, 8, 'Promotion', '2003-12-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SEJAYC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-12-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SEJAYC' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGILMP', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGILMP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGILMP' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SNNFSI', 5, 8, 'Promotion', '2012-05-16', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SNNFSI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-05-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SNNFSI' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SRZHZI', 5, 8, 'Promotion', '2008-11-07', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SRZHZI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-11-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SRZHZI' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TEWZBO', 5, 8, 'Promotion', '2004-04-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TEWZBO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TEWZBO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TLSHAS', 5, 8, 'Promotion', '2004-04-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TLSHAS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-04-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TLSHAS' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCFZPJ', 5, 8, 'Promotion', '1999-01-06', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCFZPJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1999-01-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCFZPJ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIWIYJ', 5, 8, 'Promotion', '2003-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIWIYJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIWIYJ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WRRNRT', 5, 8, 'Promotion', '2013-03-18', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WRRNRT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2013-03-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WRRNRT' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSCLUI', 5, 8, 'Promotion', '2007-10-26', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSCLUI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-10-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSCLUI' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WUECOI', 5, 8, 'Promotion', '2005-01-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WUECOI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WUECOI' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WYKHAH', 5, 8, 'Promotion', '2005-04-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WYKHAH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-04-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WYKHAH' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WZQLQO', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WZQLQO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WZQLQO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XAFFDC', 5, 8, 'Promotion', '2002-10-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XAFFDC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XAFFDC' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XAIOHH', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XAIOHH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XAIOHH' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XGGACE', 5, 8, 'Promotion', '2012-11-01', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XGGACE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-11-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XGGACE' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XLAEYO', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XLAEYO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XLAEYO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XMMAQL', 5, 8, 'Promotion', '2007-05-20', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XMMAQL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-05-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XMMAQL' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNTPSN', 5, 8, 'Promotion', '2008-11-07', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNTPSN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-11-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNTPSN' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPMBNO', 5, 8, 'Promotion', '2023-01-15', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPMBNO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-01-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPMBNO' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCWGIK', 5, 8, 'Promotion', '2004-11-04', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCWGIK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-11-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCWGIK' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YEAYMP', 5, 8, 'Promotion', '2005-01-03', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YEAYMP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-03')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YEAYMP' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJZGFL', 5, 8, 'Promotion', '2007-10-29', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJZGFL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-10-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJZGFL' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YKKRJA', 5, 8, 'Promotion', '2003-01-27', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YKKRJA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YKKRJA' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YLLJBJ', 5, 8, 'Promotion', '2005-03-31', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YLLJBJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-03-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YLLJBJ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YOWELD', 5, 8, 'Promotion', '2003-01-27', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YOWELD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2003-01-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YOWELD' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YPKICB', 5, 8, 'Promotion', '2002-10-07', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YPKICB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2002-10-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YPKICB' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQMDAF', 5, 8, 'Promotion', '2004-10-30', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQMDAF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2004-10-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQMDAF' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRWKAG', 5, 8, 'Promotion', '1998-05-01', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRWKAG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '1998-05-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRWKAG' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXWDTI', 5, 8, 'Promotion', '2008-08-20', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXWDTI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXWDTI' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZBMEAY', 5, 8, 'Promotion', '2009-12-30', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZBMEAY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-12-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZBMEAY' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZOWDBZ', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZOWDBZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZOWDBZ' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZQDVRL', 5, 8, 'Promotion', '2005-01-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZQDVRL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-01-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZQDVRL' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWQKXK', 5, 8, 'Promotion', '2007-06-24', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWQKXK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWQKXK' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXASAW', 5, 8, 'Promotion', '2007-06-05', 'Motorman posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXASAW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-06-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXASAW' AND p.to_designation_id = 8);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DIUDNU', 8, 9, 'Promotion', '2011-12-10', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DIUDNU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DIUDNU' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWEDQN', 8, 9, 'Promotion', '2025-11-26', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWEDQN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWEDQN' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOLYFU', 8, 9, 'Promotion', '2011-07-31', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOLYFU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-07-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOLYFU' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FKCGSI', 8, 9, 'Promotion', '2012-02-08', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FKCGSI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-02-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FKCGSI' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLSGDM', 8, 9, 'Promotion', '2007-08-11', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLSGDM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-08-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLSGDM' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITUJGL', 6, 9, 'Promotion', '2005-08-05', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITUJGL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-08-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITUJGL' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KLRDLG', 8, 9, 'Promotion', '2010-03-04', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KLRDLG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KLRDLG' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLPYEA', 8, 9, 'Promotion', '2025-09-04', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLPYEA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-09-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLPYEA' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMQQFS', 6, 9, 'Promotion', '2025-05-02', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMQQFS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-05-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMQQFS' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCEGOL', 6, 9, 'Promotion', '2025-05-02', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCEGOL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-05-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCEGOL' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PRWLXT', 8, 9, 'Promotion', '2025-05-02', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PRWLXT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-05-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PRWLXT' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SRZHZI', 8, 9, 'Promotion', '2025-11-17', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SRZHZI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SRZHZI' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TXREBQ', 8, 9, 'Promotion', '2025-11-17', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TXREBQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TXREBQ' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCFZPJ', 8, 9, 'Promotion', '2008-03-23', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCFZPJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2008-03-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCFZPJ' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIXCCG', 8, 9, 'Promotion', '2025-05-02', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIXCCG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-05-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIXCCG' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSCLUI', 8, 9, 'Promotion', '2025-05-02', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSCLUI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-05-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSCLUI' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNTPSN', 8, 9, 'Promotion', '2025-11-17', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNTPSN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-11-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNTPSN' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJZGFL', 6, 9, 'Promotion', '2025-05-02', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJZGFL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-05-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJZGFL' AND p.to_designation_id = 9);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YKKRJA', 8, 9, 'Promotion', '2010-04-01', 'LP Ghat posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YKKRJA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YKKRJA' AND p.to_designation_id = 9);
SELECT to_designation_id, from_designation_id, COUNT(*) AS inserted FROM div_promotion_history WHERE created_by = 'csmt_full_data_2026-10-07' AND to_designation_id <> 1 GROUP BY 1,2 ORDER BY 1,2;
