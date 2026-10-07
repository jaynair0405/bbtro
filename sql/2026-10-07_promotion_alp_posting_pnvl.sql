-- ALP posting dates (1->1) from the PNVL staff data sheet (pnvl_data.csv), 2026-10-07.
-- Only where the staff has NO to_designation_id=1 row, and the date is 0-730 days after date_of_appointment
-- on this DB (later = mostly departmental, held for review). created_by = pnvl_full_data_2026-10-07.
-- Undo: 2026-10-07_promotion_alp_posting_pnvl_UNDO.sql
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAOMA', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAOMA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAOMA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAWKW', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAWKW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAWKW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAXLR', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAXLR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAXLR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAXZU', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAXZU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAXZU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAYKH', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAYKH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAYKH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAZMJ', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAZMJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAZMJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AABJXH', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AABJXH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AABJXH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AADPRE', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AADPRE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AADPRE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AADRQD', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AADRQD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AADRQD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAKHLO', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAKHLO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAKHLO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ABIMFU', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ABIMFU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ABIMFU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFHAHE', 1, 1, 'Promotion', '2018-05-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFHAHE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-05-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFHAHE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFHRSB', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFHRSB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFHRSB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFJYFL', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFJYFL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFJYFL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AHBQNB', 1, 1, 'Promotion', '2013-11-01', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AHBQNB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-11-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AHBQNB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AHWKFX', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AHWKFX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AHWKFX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AIQFLK', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AIQFLK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AIQFLK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AMQSXC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AMQSXC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AMQSXC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ANIBLX', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ANIBLX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ANIBLX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AOABEW', 1, 1, 'Promotion', '2026-08-06', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AOABEW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-08-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AOABEW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASYXLT', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASYXLT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASYXLT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASZHIC', 1, 1, 'Promotion', '2017-12-06', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASZHIC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASZHIC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AWPWSS', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AWPWSS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AWPWSS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AYTRWP', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AYTRWP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AYTRWP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AZFRBQ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AZFRBQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AZFRBQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BAHPFB', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BAHPFB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BAHPFB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BAYYUO', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BAYYUO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BAYYUO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BFDYOD', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BFDYOD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BFDYOD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BHCLIM', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BHCLIM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BHCLIM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BHDUGN', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BHDUGN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BHDUGN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BILFMF', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BILFMF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BILFMF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BJWCXC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BJWCXC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BJWCXC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMFPNN', 1, 1, 'Promotion', '2017-06-15', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMFPNN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMFPNN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMFUTM', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMFUTM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMFUTM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMHJEF', 1, 1, 'Promotion', '2026-08-06', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMHJEF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-08-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMHJEF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMZCTH', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMZCTH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMZCTH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOKAIS', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOKAIS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOKAIS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOLPEY', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOLPEY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOLPEY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BPUCFY', 1, 1, 'Promotion', '2017-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BPUCFY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BPUCFY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BRECQI', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BRECQI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BRECQI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BSPSII', 1, 1, 'Promotion', '2017-12-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BSPSII' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BSPSII' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BTMJRT', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BTMJRT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BTMJRT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BWDGQU', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BWDGQU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BWDGQU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CIAFAS', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CIAFAS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CIAFAS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CIKPSQ', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CIKPSQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CIKPSQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CJDABC', 1, 1, 'Promotion', '2017-12-28', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CJDABC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CJDABC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CJTFRC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CJTFRC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CJTFRC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CMFKSS', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CMFKSS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CMFKSS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CNUXHS', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CNUXHS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CNUXHS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'COXISX', 1, 1, 'Promotion', '2018-01-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'COXISX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'COXISX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CPPPDS', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CPPPDS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CPPPDS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CPRXJS', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CPRXJS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CPRXJS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQEMMU', 1, 1, 'Promotion', '2026-06-04', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQEMMU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQEMMU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQSAYJ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQSAYJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQSAYJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CRTSFB', 1, 1, 'Promotion', '2023-09-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CRTSFB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-09-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CRTSFB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CSOYKA', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CSOYKA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CSOYKA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CUEOWO', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CUEOWO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CUEOWO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CUJUHU', 1, 1, 'Promotion', '2017-07-15', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CUJUHU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-07-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CUJUHU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CULWTD', 1, 1, 'Promotion', '2013-08-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CULWTD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CULWTD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CUOJNP', 1, 1, 'Promotion', '2018-04-18', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CUOJNP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CUOJNP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CWLEIS', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CWLEIS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CWLEIS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CYLLIM', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CYLLIM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CYLLIM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CZWXET', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CZWXET' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CZWXET' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DAPOFE', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DAPOFE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DAPOFE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DAZJMG', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DAZJMG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DAZJMG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DCOECH', 1, 1, 'Promotion', '2013-09-27', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DCOECH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-09-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DCOECH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DCYDJM', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DCYDJM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DCYDJM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DDURUJ', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DDURUJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DDURUJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DFKSTJ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DFKSTJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DFKSTJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGREIN', 1, 1, 'Promotion', '2012-12-18', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGREIN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2012-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGREIN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DHQEBL', 1, 1, 'Promotion', '2018-10-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DHQEBL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-10-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DHQEBL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DHSWEI', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DHSWEI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DHSWEI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DLUDZA', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DLUDZA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DLUDZA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DNPGTZ', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DNPGTZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DNPGTZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DOZKZX', 1, 1, 'Promotion', '2017-12-03', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DOZKZX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DOZKZX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPRNNB', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPRNNB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPRNNB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DQRSKC', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DQRSKC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DQRSKC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DRSFFE', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DRSFFE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DRSFFE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DRWJGT', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DRWJGT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DRWJGT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DSFMNG', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DSFMNG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DSFMNG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DSGEWB', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DSGEWB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DSGEWB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DTMERT', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DTMERT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DTMERT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DTRMDL', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DTRMDL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DTRMDL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DUFOBU', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DUFOBU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DUFOBU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DUFOHU', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DUFOHU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DUFOHU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWFKUI', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWFKUI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWFKUI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DXRTWI', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DXRTWI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DXRTWI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DYJXSX', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DYJXSX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DYJXSX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EAMSHX', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EAMSHX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EAMSHX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EAWRWN', 1, 1, 'Promotion', '2018-01-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EAWRWN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EAWRWN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ECIDMQ', 1, 1, 'Promotion', '2017-12-22', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ECIDMQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ECIDMQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EEXIOC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EEXIOC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EEXIOC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EFMBPL', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EFMBPL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EFMBPL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EFQRME', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EFQRME' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EFQRME' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EFXDIF', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EFXDIF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EFXDIF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EJMNBF', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EJMNBF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EJMNBF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EKTQKW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EKTQKW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EKTQKW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ENSHFA', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ENSHFA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ENSHFA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOHGXF', 1, 1, 'Promotion', '2017-12-28', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOHGXF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOHGXF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EPFXHY', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EPFXHY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EPFXHY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ETAZQW', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ETAZQW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ETAZQW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EULTFX', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EULTFX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EULTFX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EUNFCN', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EUNFCN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EUNFCN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EXGHRC', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EXGHRC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EXGHRC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EYOOQB', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EYOOQB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EYOOQB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FBZHQD', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FBZHQD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FBZHQD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCLRKN', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCLRKN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCLRKN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FDJIFP', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FDJIFP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FDJIFP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FENONR', 1, 1, 'Promotion', '2018-10-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FENONR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-10-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FENONR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGEUFL', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGEUFL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGEUFL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FKLATL', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FKLATL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FKLATL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLJBZP', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLJBZP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLJBZP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FNUTRB', 1, 1, 'Promotion', '2017-04-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FNUTRB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-04-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FNUTRB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FNXUUD', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FNXUUD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FNXUUD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FOZDWT', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FOZDWT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FOZDWT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FPFLRZ', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FPFLRZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FPFLRZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FQOUYZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FQOUYZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FQOUYZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FRRDUP', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FRRDUP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FRRDUP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSLDMF', 1, 1, 'Promotion', '2018-02-07', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSLDMF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-02-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSLDMF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FTMNKK', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FTMNKK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FTMNKK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FUCLLF', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FUCLLF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FUCLLF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FUHRME', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FUHRME' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FUHRME' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FUITER', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FUITER' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FUITER' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FZZUII', 1, 1, 'Promotion', '2018-03-01', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FZZUII' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FZZUII' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GAWLMC', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GAWLMC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GAWLMC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDRQKM', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDRQKM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDRQKM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDZICU', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDZICU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDZICU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GEZPER', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GEZPER' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GEZPER' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GFBJEI', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GFBJEI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GFBJEI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GFLLSK', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GFLLSK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GFLLSK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GHDYJC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GHDYJC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GHDYJC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GIJJKR', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GIJJKR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GIJJKR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJKFQB', 1, 1, 'Promotion', '2018-07-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJKFQB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-07-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJKFQB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJWOIW', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJWOIW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJWOIW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GLLTOI', 1, 1, 'Promotion', '2017-12-19', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GLLTOI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GLLTOI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GRPBMA', 1, 1, 'Promotion', '2017-12-21', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GRPBMA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GRPBMA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GRQODC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GRQODC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GRQODC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GSVAZC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GSVAZC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GSVAZC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GTYSCK', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GTYSCK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GTYSCK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GYFNHI', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GYFNHI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GYFNHI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HDFXBC', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HDFXBC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HDFXBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HDFXQK', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HDFXQK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HDFXQK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HDSRTT', 1, 1, 'Promotion', '2013-10-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HDSRTT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-10-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HDSRTT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HFDFOW', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HFDFOW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HFDFOW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HHGYCK', 1, 1, 'Promotion', '2018-01-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HHGYCK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HHGYCK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HIHQQC', 1, 1, 'Promotion', '2018-03-01', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HIHQQC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HIHQQC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HIQBHA', 1, 1, 'Promotion', '2017-12-28', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HIQBHA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HIQBHA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HIWFEO', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HIWFEO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HIWFEO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HIXQXG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HIXQXG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HIXQXG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HMPPIB', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HMPPIB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HMPPIB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HNHSRY', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HNHSRY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HNHSRY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HOIGXG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HOIGXG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HOIGXG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HPDBBC', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HPDBBC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HPDBBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HQHIIP', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HQHIIP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HQHIIP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HSFFXB', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HSFFXB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HSFFXB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HSRMQN', 1, 1, 'Promotion', '2018-01-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HSRMQN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HSRMQN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HSYNRB', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HSYNRB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HSYNRB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HUSCMD', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HUSCMD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HUSCMD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWPQTC', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWPQTC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWPQTC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IDDRPA', 1, 1, 'Promotion', '2017-12-28', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IDDRPA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IDDRPA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IFCOAF', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IFCOAF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IFCOAF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IGCRBJ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IGCRBJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IGCRBJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIIDKD', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIIDKD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIIDKD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IJYMZY', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IJYMZY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IJYMZY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ILCBGW', 1, 1, 'Promotion', '2017-12-19', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ILCBGW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ILCBGW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IOCTTN', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IOCTTN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IOCTTN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITJGPA', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITJGPA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITJGPA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUCIGM', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUCIGM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUCIGM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUQLDC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUQLDC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUQLDC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IWTOZW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IWTOZW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IWTOZW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IXTADI', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IXTADI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IXTADI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IYZHYH', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IYZHYH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IYZHYH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JBOOUD', 1, 1, 'Promotion', '2018-10-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JBOOUD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-10-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JBOOUD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDJZHG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDJZHG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDJZHG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JEEYWP', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JEEYWP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JEEYWP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JFYKDL', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JFYKDL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JFYKDL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JGXYIK', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JGXYIK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JGXYIK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHMDFU', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHMDFU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHMDFU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHXQJD', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHXQJD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHXQJD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJNRYW', 1, 1, 'Promotion', '2018-05-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJNRYW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJNRYW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMEHTT', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMEHTT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMEHTT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JNBDAB', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JNBDAB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JNBDAB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQIUDL', 1, 1, 'Promotion', '2018-01-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQIUDL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQIUDL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQWALR', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQWALR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQWALR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQZMLH', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQZMLH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQZMLH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JSGUMS', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JSGUMS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JSGUMS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JWPDDL', 1, 1, 'Promotion', '2017-05-22', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JWPDDL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JWPDDL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JYIPNX', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JYIPNX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JYIPNX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JYOEGP', 1, 1, 'Promotion', '2017-12-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JYOEGP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JYOEGP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZIHSX', 1, 1, 'Promotion', '2017-04-14', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZIHSX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-04-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZIHSX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KAROOP', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KAROOP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KAROOP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KAYQNA', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KAYQNA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KAYQNA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDDTJQ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDDTJQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDDTJQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KFWFWA', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KFWFWA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KFWFWA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KGLSQC', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KGLSQC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KGLSQC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHOWBO', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHOWBO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHOWBO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KIUKXF', 1, 1, 'Promotion', '2017-02-07', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KIUKXF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-02-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KIUKXF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KJMGJW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KJMGJW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KJMGJW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KNPSKS', 1, 1, 'Promotion', '2018-01-04', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KNPSKS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KNPSKS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KOYRWO', 1, 1, 'Promotion', '2018-01-09', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KOYRWO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KOYRWO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KPMIQH', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KPMIQH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KPMIQH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KQBEUG', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KQBEUG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KQBEUG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KRFKQH', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KRFKQH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KRFKQH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KSAMPG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KSAMPG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KSAMPG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KTPKRP', 1, 1, 'Promotion', '2014-05-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KTPKRP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KTPKRP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWDSBD', 1, 1, 'Promotion', '2023-05-04', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWDSBD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWDSBD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWPZAS', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWPZAS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWPZAS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LASIYB', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LASIYB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LASIYB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LBWKCB', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LBWKCB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LBWKCB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LCAJBG', 1, 1, 'Promotion', '2017-08-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LCAJBG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LCAJBG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LCRWYK', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LCRWYK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LCRWYK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LEIAHH', 1, 1, 'Promotion', '2026-08-06', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LEIAHH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-08-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LEIAHH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHIAAY', 1, 1, 'Promotion', '2026-05-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHIAAY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHIAAY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LIUPKH', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LIUPKH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LIUPKH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LKJQJI', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LKJQJI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LKJQJI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LKNZLE', 1, 1, 'Promotion', '2017-12-31', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LKNZLE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LKNZLE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLBWDM', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLBWDM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLBWDM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMJJYQ', 1, 1, 'Promotion', '2018-04-19', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMJJYQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMJJYQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMZUQQ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMZUQQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMZUQQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LOLIXL', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LOLIXL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LOLIXL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LUMXAY', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LUMXAY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LUMXAY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LXHPHG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LXHPHG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LXHPHG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MCQMXG', 1, 1, 'Promotion', '2026-05-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MCQMXG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MCQMXG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MDDILA', 1, 1, 'Promotion', '2005-02-15', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MDDILA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MDDILA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MEJXJY', 1, 1, 'Promotion', '2018-10-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MEJXJY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-10-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MEJXJY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MEQTMM', 1, 1, 'Promotion', '2017-12-28', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MEQTMM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MEQTMM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MGIUGJ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MGIUGJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MGIUGJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MGTIIS', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MGTIIS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MGTIIS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MGXQPN', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MGXQPN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MGXQPN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MHRNXD', 1, 1, 'Promotion', '2018-03-07', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MHRNXD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MHRNXD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MHUGKZ', 1, 1, 'Promotion', '2012-08-28', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MHUGKZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2012-08-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MHUGKZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MIDRTO', 1, 1, 'Promotion', '2017-12-01', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MIDRTO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MIDRTO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MIMEWR', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MIMEWR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MIMEWR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MJBQYH', 1, 1, 'Promotion', '2018-03-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MJBQYH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MJBQYH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKTBZZ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKTBZZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKTBZZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKZUBG', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKZUBG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKZUBG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MLXFMX', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MLXFMX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MLXFMX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMCJIP', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMCJIP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMCJIP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMONUN', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMONUN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMONUN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MNALFR', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MNALFR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MNALFR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MNWNNI', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MNWNNI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MNWNNI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQAARI', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQAARI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQAARI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRNJKS', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRNJKS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRNJKS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTBKPN', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTBKPN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTBKPN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTSBAE', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTSBAE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTSBAE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTXSTD', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTXSTD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTXSTD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MWIXNT', 1, 1, 'Promotion', '2017-12-21', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MWIXNT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MWIXNT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MYAAQS', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MYAAQS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MYAAQS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MYDJEH', 1, 1, 'Promotion', '2018-01-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MYDJEH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MYDJEH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MYNLFU', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MYNLFU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MYNLFU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZHIYN', 1, 1, 'Promotion', '2009-11-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZHIYN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-11-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZHIYN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NAHILE', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NAHILE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NAHILE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NBHYCG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NBHYCG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NBHYCG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NGUBEH', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NGUBEH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NGUBEH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NHRJIB', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NHRJIB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NHRJIB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NIFKKY', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NIFKKY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NIFKKY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NIXEDI', 1, 1, 'Promotion', '2017-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NIXEDI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NIXEDI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJDCKT', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJDCKT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJDCKT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NNJWPF', 1, 1, 'Promotion', '2017-12-22', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NNJWPF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NNJWPF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NOKWOI', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NOKWOI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NOKWOI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NPFCPG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NPFCPG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NPFCPG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NPQRFF', 1, 1, 'Promotion', '2017-01-09', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NPQRFF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-01-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NPQRFF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NQCPFO', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NQCPFO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NQCPFO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NRDREZ', 1, 1, 'Promotion', '2017-08-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NRDREZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NRDREZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NRRXTC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NRRXTC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NRRXTC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NTGGXY', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NTGGXY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NTGGXY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXBQBG', 1, 1, 'Promotion', '2018-04-18', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXBQBG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXBQBG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXPAJZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXPAJZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXPAJZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NYCRJB', 1, 1, 'Promotion', '2018-01-28', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NYCRJB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NYCRJB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OAMGFK', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OAMGFK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OAMGFK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OENJFB', 1, 1, 'Promotion', '2017-12-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OENJFB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OENJFB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OHSRCH', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OHSRCH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OHSRCH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OIAWWF', 1, 1, 'Promotion', '2024-12-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OIAWWF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OIAWWF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OIYJIJ', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OIYJIJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OIYJIJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJGBML', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJGBML' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJGBML' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OKZEQA', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OKZEQA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OKZEQA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OMXNGX', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OMXNGX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OMXNGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OOGNWD', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OOGNWD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OOGNWD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OSCPHE', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OSCPHE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OSCPHE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OTDTHX', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OTDTHX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OTDTHX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OTKDFF', 1, 1, 'Promotion', '2018-01-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OTKDFF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OTKDFF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWFDLM', 1, 1, 'Promotion', '2018-05-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWFDLM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-05-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWFDLM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWRCQS', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWRCQS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWRCQS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWWUWL', 1, 1, 'Promotion', '2017-12-11', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWWUWL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWWUWL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OYLBCW', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OYLBCW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OYLBCW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OZXJLA', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OZXJLA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OZXJLA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAIORY', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAIORY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAIORY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBCLRD', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBCLRD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBCLRD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PCBZNW', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PCBZNW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PCBZNW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PCLGUH', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PCLGUH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PCLGUH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PCMJDM', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PCMJDM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PCMJDM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PCQIOG', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PCQIOG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PCQIOG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PESPOS', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PESPOS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PESPOS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PFRUAY', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PFRUAY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PFRUAY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PIFUOI', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PIFUOI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PIFUOI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PJLBPQ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PJLBPQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PJLBPQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PKQCEK', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PKQCEK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PKQCEK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PLBYBD', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PLBYBD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PLBYBD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PNNNOD', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PNNNOD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PNNNOD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'POMYFY', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'POMYFY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'POMYFY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'POQSFH', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'POQSFH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'POQSFH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PPIOMS', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PPIOMS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PPIOMS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PPUXOH', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PPUXOH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PPUXOH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PQGHRR', 1, 1, 'Promotion', '2017-10-31', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PQGHRR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-10-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PQGHRR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PSFEQD', 1, 1, 'Promotion', '2017-12-22', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PSFEQD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PSFEQD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PUURUW', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PUURUW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PUURUW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PWDRZF', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PWDRZF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PWDRZF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PWTSNI', 1, 1, 'Promotion', '2018-10-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PWTSNI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-10-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PWTSNI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PZENPL', 1, 1, 'Promotion', '2018-06-01', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PZENPL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PZENPL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PZINCQ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PZINCQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PZINCQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QCSHIH', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QCSHIH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QCSHIH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QDDTAL', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QDDTAL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QDDTAL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QDLEZR', 1, 1, 'Promotion', '2017-12-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QDLEZR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QDLEZR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QEEQOL', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QEEQOL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QEEQOL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QEHLJT', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QEHLJT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QEHLJT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QEHLJT', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QEHLJT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QEHLJT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QIDNIR', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QIDNIR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QIDNIR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QIJENR', 1, 1, 'Promotion', '2017-12-15', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QIJENR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QIJENR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QIWOMS', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QIWOMS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QIWOMS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QKGLIZ', 1, 1, 'Promotion', '2017-12-18', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QKGLIZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QKGLIZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QLNBQW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QLNBQW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QLNBQW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QQBNPH', 1, 1, 'Promotion', '2017-05-04', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QQBNPH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QQBNPH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QSCMWO', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QSCMWO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QSCMWO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QUTBRC', 1, 1, 'Promotion', '2005-02-15', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QUTBRC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QUTBRC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QWEPUX', 1, 1, 'Promotion', '2018-10-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QWEPUX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-10-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QWEPUX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QWWZOJ', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QWWZOJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QWWZOJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QYQYLQ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QYQYLQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QYQYLQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RAHQUA', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RAHQUA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RAHQUA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RCIZTN', 1, 1, 'Promotion', '2026-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RCIZTN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RCIZTN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RDIKXF', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RDIKXF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RDIKXF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RFJGSN', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RFJGSN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RFJGSN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RGFIOW', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RGFIOW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RGFIOW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJFZJQ', 1, 1, 'Promotion', '2017-12-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJFZJQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJFZJQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJKRGG', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJKRGG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJKRGG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RKOZLZ', 1, 1, 'Promotion', '2024-05-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RKOZLZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RKOZLZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RMMPZK', 1, 1, 'Promotion', '2026-08-06', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RMMPZK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-08-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RMMPZK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RNBAJI', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RNBAJI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RNBAJI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RNZQLZ', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RNZQLZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RNZQLZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RRKEEJ', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RRKEEJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RRKEEJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RTHPMS', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RTHPMS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RTHPMS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RWBLYO', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RWBLYO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RWBLYO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RXWAKF', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RXWAKF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RXWAKF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYPZMA', 1, 1, 'Promotion', '2016-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYPZMA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYPZMA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYXKPZ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYXKPZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYXKPZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RZKUHF', 1, 1, 'Promotion', '2018-04-03', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RZKUHF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RZKUHF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCSLDZ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCSLDZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCSLDZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGJFWT', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGJFWT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGJFWT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGPGWM', 1, 1, 'Promotion', '2018-03-09', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGPGWM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGPGWM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SHSIJQ', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SHSIJQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SHSIJQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SIOZGM', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SIOZGM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SIOZGM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SKATBU', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SKATBU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SKATBU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SLAGUW', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SLAGUW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SLAGUW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SLENPX', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SLENPX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SLENPX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SLMHTL', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SLMHTL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SLMHTL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SNISED', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SNISED' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SNISED' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SNKFER', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SNKFER' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SNKFER' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SOBLAF', 1, 1, 'Promotion', '2026-05-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SOBLAF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SOBLAF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SWFFXA', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SWFFXA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SWFFXA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SWZNFY', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SWZNFY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SWZNFY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SXYPIM', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SXYPIM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SXYPIM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TANHAF', 1, 1, 'Promotion', '2017-12-21', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TANHAF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TANHAF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TATRPN', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TATRPN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TATRPN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TAUBYQ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TAUBYQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TAUBYQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBSORX', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBSORX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBSORX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBXMCW', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBXMCW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBXMCW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TCGCQY', 1, 1, 'Promotion', '2015-04-01', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TCGCQY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2015-04-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TCGCQY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TDOUKQ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TDOUKQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TDOUKQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TDYBFT', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TDYBFT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TDYBFT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TEHTBE', 1, 1, 'Promotion', '2018-01-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TEHTBE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TEHTBE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TFYNIT', 1, 1, 'Promotion', '2017-12-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TFYNIT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TFYNIT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'THJEXK', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'THJEXK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'THJEXK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TOAYXD', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TOAYXD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TOAYXD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TONHOZ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TONHOZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TONHOZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TQRESA', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TQRESA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TQRESA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TRUZXU', 1, 1, 'Promotion', '2018-02-14', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TRUZXU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-02-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TRUZXU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSIUJC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSIUJC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSIUJC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSTDUU', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSTDUU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSTDUU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TYFBZE', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TYFBZE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TYFBZE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TYHZHW', 1, 1, 'Promotion', '2017-12-22', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TYHZHW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TYHZHW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TZCHQW', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TZCHQW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TZCHQW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TZSDTM', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TZSDTM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TZSDTM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UACMWG', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UACMWG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UACMWG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UARYPG', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UARYPG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UARYPG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UCKKBO', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UCKKBO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UCKKBO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UFBSJO', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UFBSJO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UFBSJO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UHPYAD', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UHPYAD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UHPYAD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UIWWPU', 1, 1, 'Promotion', '2017-05-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UIWWPU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UIWWPU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULNCNO', 1, 1, 'Promotion', '2026-05-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULNCNO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULNCNO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULZKNT', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULZKNT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULZKNT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UMDBZT', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UMDBZT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UMDBZT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UQLLWL', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UQLLWL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UQLLWL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UTMBYS', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UTMBYS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UTMBYS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UTNPOH', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UTNPOH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UTNPOH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWIKNQ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWIKNQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWIKNQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWKPBR', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWKPBR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWKPBR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WAKNOW', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WAKNOW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WAKNOW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBPXJA', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBPXJA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBPXJA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCXLAH', 1, 1, 'Promotion', '2017-12-21', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCXLAH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCXLAH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WFSAMX', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WFSAMX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WFSAMX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WGNLWU', 1, 1, 'Promotion', '2025-05-05', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WGNLWU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WGNLWU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WHFUDJ', 1, 1, 'Promotion', '2018-03-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WHFUDJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WHFUDJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WHFUDJ', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WHFUDJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WHFUDJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WKKPBG', 1, 1, 'Promotion', '2022-12-21', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WKKPBG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-12-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WKKPBG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WNFGRG', 1, 1, 'Promotion', '2018-04-18', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WNFGRG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WNFGRG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WNQLUO', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WNQLUO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WNQLUO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSCZRJ', 1, 1, 'Promotion', '2017-11-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSCZRJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSCZRJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSOKSO', 1, 1, 'Promotion', '2019-12-31', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSOKSO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSOKSO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSOPWN', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSOPWN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSOPWN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSPQUP', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSPQUP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSPQUP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSXSFB', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSXSFB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSXSFB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WTCQRT', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WTCQRT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WTCQRT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WWBLUA', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WWBLUA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WWBLUA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WYZZQG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WYZZQG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WYZZQG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XATDBR', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XATDBR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XATDBR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XBAJTR', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XBAJTR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XBAJTR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCCXSW', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCCXSW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCCXSW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCGCXZ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCGCXZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCGCXZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCWUUY', 1, 1, 'Promotion', '2017-05-04', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCWUUY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCWUUY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XHHDDW', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XHHDDW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XHHDDW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XILKHQ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XILKHQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XILKHQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XMMDEZ', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XMMDEZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XMMDEZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNTXAE', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNTXAE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNTXAE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XOEBIZ', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XOEBIZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XOEBIZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XQOBCS', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XQOBCS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XQOBCS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XXBFQK', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XXBFQK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XXBFQK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YAIHJR', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YAIHJR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YAIHJR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YBOTCB', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YBOTCB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YBOTCB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCFTIY', 1, 1, 'Promotion', '2018-01-30', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCFTIY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCFTIY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCKXGP', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCKXGP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCKXGP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCWWZL', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCWWZL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCWWZL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YDKDDC', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YDKDDC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YDKDDC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YFFPQM', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YFFPQM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YFFPQM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YIDCBY', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YIDCBY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YIDCBY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YIOXQG', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YIOXQG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YIOXQG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQCQNF', 1, 1, 'Promotion', '2017-12-21', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQCQNF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQCQNF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YSWQAQ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YSWQAQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YSWQAQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YUQZUZ', 1, 1, 'Promotion', '2018-03-09', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YUQZUZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YUQZUZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YUXZKU', 1, 1, 'Promotion', '2018-04-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YUXZKU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YUXZKU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YWJNLS', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YWJNLS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YWJNLS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YWJSHS', 1, 1, 'Promotion', '2017-05-04', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YWJSHS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YWJSHS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXNRSS', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXNRSS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXNRSS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYKPPZ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYKPPZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYKPPZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYSNZC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYSNZC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYSNZC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZCHBHF', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZCHBHF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZCHBHF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZDRMEO', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZDRMEO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZDRMEO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZDYNSJ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZDYNSJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZDYNSJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFAPCQ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFAPCQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFAPCQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFHRBX', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFHRBX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFHRBX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFUKRX', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFUKRX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFUKRX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZGIGBN', 1, 1, 'Promotion', '2018-04-18', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZGIGBN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZGIGBN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZHSOXL', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZHSOXL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZHSOXL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZIUNXB', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZIUNXB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZIUNXB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZJHWSB', 1, 1, 'Promotion', '2017-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZJHWSB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZJHWSB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZKUFQP', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZKUFQP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZKUFQP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZLKQJE', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZLKQJE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZLKQJE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZMNIQN', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZMNIQN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZMNIQN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZMXZTF', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZMXZTF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZMXZTF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZNCNUB', 1, 1, 'Promotion', '2018-01-29', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZNCNUB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZNCNUB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZPXXNF', 1, 1, 'Promotion', '2005-02-12', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZPXXNF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-02-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZPXXNF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZQXYOO', 1, 1, 'Promotion', '2018-01-24', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZQXYOO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZQXYOO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWCTFQ', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWCTFQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWCTFQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWGNHD', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWGNHD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWGNHD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWWNYS', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWWNYS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWWNYS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXJBOK', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (PNVL staff data sheet)', 'pnvl_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXJBOK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXJBOK' AND p.to_designation_id = 1);
SELECT COUNT(*) AS alp_posting_inserted FROM div_promotion_history WHERE created_by = 'pnvl_full_data_2026-10-07' AND to_designation_id = 1;
