-- ALP posting dates (to_designation 1, recorded as 1->1 like the existing ALP-posting rows) from the
-- CSMT staff full-data sheet (csmt_staff_full_data.csv), 2026-10-07.
-- Only staff with NO to_designation_id=1 row get one, and ONLY where the posting date falls within
-- 2 years after the staff's date_of_appointment on this DB (later = departmental/transfer, held for review;
-- before appointment = impossible). Guarded on this DB at run time. Staff whose
-- sheet dates are out of grade order are excluded (review). created_by = csmt_full_data_2026-10-07 for clean reversal.
-- Undo: 2026-10-07_promotion_alp_posting_csmt_UNDO.sql
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AADKFC', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AADKFC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AADKFC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAEHEH', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAEHEH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAEHEH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAFPKF', 1, 1, 'Promotion', '2021-09-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAFPKF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-09-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAFPKF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAHKRE', 1, 1, 'Promotion', '2020-10-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAHKRE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAHKRE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAUGXJ', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAUGXJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAUGXJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAWXOH', 1, 1, 'Promotion', '2021-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAWXOH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAWXOH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ABIMFU', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ABIMFU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ABIMFU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ABNXJC', 1, 1, 'Promotion', '1990-08-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ABNXJC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1990-08-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ABNXJC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ACDKUH', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ACDKUH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ACDKUH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ACFIUA', 1, 1, 'Promotion', '2022-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ACFIUA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ACFIUA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ACGQDS', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ACGQDS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ACGQDS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ACYKHO', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ACYKHO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ACYKHO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ADEZRQ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ADEZRQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ADEZRQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ADSWIA', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ADSWIA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ADSWIA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ADZLOB', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ADZLOB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ADZLOB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AEBJET', 1, 1, 'Promotion', '2021-03-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AEBJET'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AEBJET' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AERDEU', 1, 1, 'Promotion', '2022-02-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AERDEU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-02-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AERDEU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AERJGK', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AERJGK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AERJGK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFCWJE', 1, 1, 'Promotion', '1993-07-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFCWJE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFCWJE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFTBMD', 1, 1, 'Promotion', '2020-10-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFTBMD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFTBMD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AGFFYJ', 1, 1, 'Promotion', '2020-01-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AGFFYJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-01-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AGFFYJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AGKQNR', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AGKQNR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AGKQNR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AGLRHL', 1, 1, 'Promotion', '2009-10-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AGLRHL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-10-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AGLRHL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AGYFUR', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AGYFUR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AGYFUR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AHNESP', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AHNESP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AHNESP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AHQMWT', 1, 1, 'Promotion', '2021-01-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AHQMWT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AHQMWT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AHXSIC', 1, 1, 'Promotion', '2025-03-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AHXSIC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-03-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AHXSIC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AIHFBZ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AIHFBZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AIHFBZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AISMUC', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AISMUC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AISMUC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AJAHRS', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AJAHRS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AJAHRS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AJGHBU', 1, 1, 'Promotion', '2019-12-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AJGHBU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-12-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AJGHBU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AJUPOM', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AJUPOM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AJUPOM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AKCWBC', 1, 1, 'Promotion', '2020-07-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AKCWBC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AKCWBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AKTPQJ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AKTPQJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AKTPQJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ALBFTP', 1, 1, 'Promotion', '2014-07-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ALBFTP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ALBFTP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ALYKTI', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ALYKTI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ALYKTI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AMGFNG', 1, 1, 'Promotion', '2020-10-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AMGFNG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AMGFNG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AMYWZX', 1, 1, 'Promotion', '2013-10-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AMYWZX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-10-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AMYWZX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ANJYXF', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ANJYXF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ANJYXF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ANUHWP', 1, 1, 'Promotion', '2021-05-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ANUHWP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-05-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ANUHWP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ANXYJF', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ANXYJF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ANXYJF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AOJJGP', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AOJJGP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AOJJGP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AOQIIC', 1, 1, 'Promotion', '2021-08-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AOQIIC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AOQIIC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'APLPOU', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'APLPOU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'APLPOU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AQAQFK', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AQAQFK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AQAQFK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ARCDSM', 1, 1, 'Promotion', '2013-10-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ARCDSM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-10-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ARCDSM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ARHTBS', 1, 1, 'Promotion', '1990-09-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ARHTBS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1990-09-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ARHTBS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASDHAW', 1, 1, 'Promotion', '2013-08-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASDHAW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASDHAW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASGADB', 1, 1, 'Promotion', '1991-06-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASGADB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-06-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASGADB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASLAAK', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASLAAK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASLAAK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ASPYRS', 1, 1, 'Promotion', '2018-12-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ASPYRS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ASPYRS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATAYCC', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATAYCC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATAYCC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATBTMS', 1, 1, 'Promotion', '2016-12-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATBTMS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATBTMS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATHHHP', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATHHHP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATHHHP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATSOTX', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATSOTX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATSOTX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATSRYH', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATSRYH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATSRYH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATWCLS', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATWCLS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATWCLS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AWAJLA', 1, 1, 'Promotion', '1996-12-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AWAJLA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-12-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AWAJLA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AWNWTZ', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AWNWTZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AWNWTZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AXDDRI', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AXDDRI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AXDDRI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AXUWIG', 1, 1, 'Promotion', '2014-05-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AXUWIG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AXUWIG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AYCIFM', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AYCIFM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AYCIFM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AYFMXU', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AYFMXU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AYFMXU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AYHSSK', 1, 1, 'Promotion', '2014-05-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AYHSSK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AYHSSK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BBFQXJ', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BBFQXJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BBFQXJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BCROKJ', 1, 1, 'Promotion', '2004-01-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BCROKJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2004-01-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BCROKJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BDEKHT', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BDEKHT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BDEKHT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BDGAQD', 1, 1, 'Promotion', '2022-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BDGAQD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BDGAQD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BDOIUO', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BDOIUO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BDOIUO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BEWIIM', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BEWIIM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BEWIIM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BFAJWQ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BFAJWQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BFAJWQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BFHDHX', 1, 1, 'Promotion', '1991-02-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BFHDHX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BFHDHX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BFHPEZ', 1, 1, 'Promotion', '1991-10-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BFHPEZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-10-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BFHPEZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BGNOSG', 1, 1, 'Promotion', '2021-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BGNOSG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BGNOSG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BHNEDD', 1, 1, 'Promotion', '2021-05-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BHNEDD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-05-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BHNEDD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BHPBEM', 1, 1, 'Promotion', '2021-10-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BHPBEM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BHPBEM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BHRBAZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BHRBAZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BHRBAZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BHYBWP', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BHYBWP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BHYBWP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BJCMJD', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BJCMJD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BJCMJD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BJXKGU', 1, 1, 'Promotion', '2022-10-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BJXKGU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-10-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BJXKGU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BLTZIG', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BLTZIG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BLTZIG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMHDIU', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMHDIU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMHDIU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMLGDP', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMLGDP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMLGDP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMMMGK', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMMMGK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMMMGK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMSNUE', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMSNUE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMSNUE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BNMHWP', 1, 1, 'Promotion', '2021-10-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BNMHWP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BNMHWP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BNQBMT', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BNQBMT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BNQBMT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BNSSNW', 1, 1, 'Promotion', '2021-11-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BNSSNW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-11-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BNSSNW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOKBGL', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOKBGL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOKBGL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOTZKC', 1, 1, 'Promotion', '1993-07-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOTZKC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOTZKC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BQKBTB', 1, 1, 'Promotion', '1991-12-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BQKBTB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-12-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BQKBTB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BRIXEG', 1, 1, 'Promotion', '1996-10-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BRIXEG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BRIXEG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BRIZNZ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BRIZNZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BRIZNZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BSMXEL', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BSMXEL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BSMXEL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BSURMW', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BSURMW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BSURMW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BTNQRE', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BTNQRE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BTNQRE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BTTFMI', 1, 1, 'Promotion', '1993-07-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BTTFMI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BTTFMI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BTZLCN', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BTZLCN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BTZLCN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BUBHKM', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BUBHKM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BUBHKM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BUDCQQ', 1, 1, 'Promotion', '2001-08-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BUDCQQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BUDCQQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BWKLYK', 1, 1, 'Promotion', '2019-07-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BWKLYK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-07-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BWKLYK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BWKLYK', 1, 1, 'Promotion', '2019-07-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BWKLYK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-07-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BWKLYK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BXAPXO', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BXAPXO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BXAPXO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BXCPSB', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BXCPSB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BXCPSB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BXDASB', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BXDASB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BXDASB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BXHAZQ', 1, 1, 'Promotion', '2021-12-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BXHAZQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BXHAZQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BXQYFJ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BXQYFJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BXQYFJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BYKGRI', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BYKGRI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BYKGRI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BYMTRT', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BYMTRT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BYMTRT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BYMZGY', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BYMZGY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BYMZGY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BYQOTX', 1, 1, 'Promotion', '2020-11-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BYQOTX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-11-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BYQOTX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BYUHUK', 1, 1, 'Promotion', '2018-04-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BYUHUK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BYUHUK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BYZNMY', 1, 1, 'Promotion', '2019-04-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BYZNMY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-04-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BYZNMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZHADB', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZHADB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZHADB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZKDJN', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZKDJN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZKDJN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZOQJO', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZOQJO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZOQJO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZTYHQ', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZTYHQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZTYHQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZUEQM', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZUEQM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZUEQM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CAIWAO', 1, 1, 'Promotion', '2019-05-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CAIWAO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CAIWAO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CAMGXE', 1, 1, 'Promotion', '2019-08-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CAMGXE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CAMGXE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CAWYSN', 1, 1, 'Promotion', '1991-08-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CAWYSN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-08-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CAWYSN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CBEAYF', 1, 1, 'Promotion', '2020-03-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CBEAYF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-03-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CBEAYF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CBFHBW', 1, 1, 'Promotion', '1997-05-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CBFHBW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CBFHBW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CCNUHA', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CCNUHA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CCNUHA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CCNULD', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CCNULD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CCNULD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CCSRYS', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CCSRYS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CCSRYS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CCTJCQ', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CCTJCQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CCTJCQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CCWXZH', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CCWXZH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CCWXZH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CEYWNQ', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CEYWNQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CEYWNQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CFIEIR', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CFIEIR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CFIEIR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CFWEUN', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CFWEUN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CFWEUN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CGJOQJ', 1, 1, 'Promotion', '2021-01-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CGJOQJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CGJOQJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CGNNLR', 1, 1, 'Promotion', '1997-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CGNNLR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CGNNLR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CHCDMG', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CHCDMG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CHCDMG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CHHWUX', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CHHWUX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CHHWUX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CHONXF', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CHONXF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CHONXF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CHPKPI', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CHPKPI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CHPKPI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CIEXAF', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CIEXAF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CIEXAF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CIOIUH', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CIOIUH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CIOIUH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CJGUOB', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CJGUOB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CJGUOB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CJIFAB', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CJIFAB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CJIFAB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CKEIBO', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CKEIBO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CKEIBO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CKGTSS', 1, 1, 'Promotion', '1993-07-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CKGTSS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CKGTSS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CKZCTZ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CKZCTZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CKZCTZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CLJKTD', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CLJKTD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CLJKTD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CNQMTN', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CNQMTN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CNQMTN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CNXUDH', 1, 1, 'Promotion', '2021-07-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CNXUDH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-07-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CNXUDH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CODDXP', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CODDXP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CODDXP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CPLZZD', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CPLZZD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CPLZZD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CPMXQS', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CPMXQS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CPMXQS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CPNAZI', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CPNAZI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CPNAZI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQCEXM', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQCEXM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQCEXM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQPWKW', 1, 1, 'Promotion', '2020-03-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQPWKW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-03-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQPWKW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQQBQB', 1, 1, 'Promotion', '2015-11-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQQBQB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2015-11-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQQBQB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CREHYJ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CREHYJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CREHYJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CRLXSI', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CRLXSI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CRLXSI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CRMGMS', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CRMGMS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CRMGMS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CRWOCB', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CRWOCB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CRWOCB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CTOKXL', 1, 1, 'Promotion', '2003-06-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CTOKXL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-06-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CTOKXL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CTPSDQ', 1, 1, 'Promotion', '2014-05-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CTPSDQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CTPSDQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CTTMAL', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CTTMAL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CTTMAL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CXBERZ', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CXBERZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CXBERZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CXGUHH', 1, 1, 'Promotion', '2003-10-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CXGUHH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CXGUHH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CXLQNY', 1, 1, 'Promotion', '2021-06-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CXLQNY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CXLQNY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CYLPNB', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CYLPNB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CYLPNB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CZLDRQ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CZLDRQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CZLDRQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CZZWDM', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CZZWDM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CZZWDM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DAMWXK', 1, 1, 'Promotion', '1991-08-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DAMWXK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-08-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DAMWXK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DBFYBC', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DBFYBC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DBFYBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DBGZGO', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DBGZGO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DBGZGO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DBHCCI', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DBHCCI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DBHCCI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DBZDBB', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DBZDBB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DBZDBB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DCHOTG', 1, 1, 'Promotion', '2021-10-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DCHOTG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DCHOTG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DCQQXE', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DCQQXE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DCQQXE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DDCDJA', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DDCDJA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DDCDJA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DDUJRJ', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DDUJRJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DDUJRJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DEHBPJ', 1, 1, 'Promotion', '2019-06-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DEHBPJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-06-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DEHBPJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DESEJP', 1, 1, 'Promotion', '1997-06-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DESEJP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-06-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DESEJP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DFSWXO', 1, 1, 'Promotion', '2003-01-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DFSWXO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DFSWXO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGPACS', 1, 1, 'Promotion', '2021-04-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGPACS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGPACS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGPTBY', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGPTBY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGPTBY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGZFHD', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGZFHD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGZFHD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DHJDWS', 1, 1, 'Promotion', '2003-10-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DHJDWS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DHJDWS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DHKIUY', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DHKIUY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DHKIUY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DIFOSN', 1, 1, 'Promotion', '2018-12-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DIFOSN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DIFOSN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DIJAPI', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DIJAPI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DIJAPI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DIOJQH', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DIOJQH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DIOJQH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DIUDNU', 1, 1, 'Promotion', '1995-05-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DIUDNU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1995-05-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DIUDNU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJBWDL', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJBWDL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJBWDL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJEODU', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJEODU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJEODU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJIDOY', 1, 1, 'Promotion', '1997-02-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJIDOY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-02-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJIDOY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJLTUR', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJLTUR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJLTUR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJMJAW', 1, 1, 'Promotion', '2026-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJMJAW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJMJAW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DKCDQL', 1, 1, 'Promotion', '2018-06-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DKCDQL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DKCDQL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DLBGZQ', 1, 1, 'Promotion', '1993-11-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DLBGZQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DLBGZQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DNGWXH', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DNGWXH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DNGWXH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DNJHBZ', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DNJHBZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DNJHBZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DOJRMF', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DOJRMF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DOJRMF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DOOHOI', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DOOHOI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DOOHOI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPBUQW', 1, 1, 'Promotion', '1993-05-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPBUQW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPBUQW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPFXTF', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPFXTF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPFXTF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPOWYA', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPOWYA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPOWYA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPWBIW', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPWBIW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPWBIW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DQSULL', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DQSULL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DQSULL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DQXRFR', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DQXRFR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DQXRFR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DRQIFN', 1, 1, 'Promotion', '2026-02-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DRQIFN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DRQIFN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DSGNGL', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DSGNGL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DSGNGL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DTMUFQ', 1, 1, 'Promotion', '2018-06-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DTMUFQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DTMUFQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DTUYKI', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DTUYKI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DTUYKI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DUMALG', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DUMALG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DUMALG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DUWDQM', 1, 1, 'Promotion', '2022-09-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DUWDQM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-09-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DUWDQM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWEDQN', 1, 1, 'Promotion', '1994-03-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWEDQN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-03-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWEDQN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWFCFU', 1, 1, 'Promotion', '2010-10-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWFCFU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-10-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWFCFU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWITHS', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWITHS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWITHS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DXGGIO', 1, 1, 'Promotion', '1993-07-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DXGGIO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DXGGIO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DXOCXS', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DXOCXS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DXOCXS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DYPEDI', 1, 1, 'Promotion', '1991-11-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DYPEDI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-11-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DYPEDI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZSXIB', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZSXIB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZSXIB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZWOGZ', 1, 1, 'Promotion', '2003-11-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZWOGZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-11-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZWOGZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EADHRL', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EADHRL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EADHRL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EAJIZW', 1, 1, 'Promotion', '2018-04-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EAJIZW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EAJIZW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EBDACK', 1, 1, 'Promotion', '2019-08-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EBDACK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EBDACK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ECLSGM', 1, 1, 'Promotion', '1991-02-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ECLSGM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ECLSGM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ECQZWK', 1, 1, 'Promotion', '2020-08-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ECQZWK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-08-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ECQZWK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ECZCGH', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ECZCGH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ECZCGH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EDTKAK', 1, 1, 'Promotion', '2010-12-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EDTKAK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EDTKAK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EEMJIC', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EEMJIC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EEMJIC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EEQSGQ', 1, 1, 'Promotion', '1993-11-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EEQSGQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EEQSGQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EERNEB', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EERNEB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EERNEB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EESUES', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EESUES'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EESUES' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EFBEKS', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EFBEKS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EFBEKS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EFKHPE', 1, 1, 'Promotion', '2008-08-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EFKHPE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-08-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EFKHPE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EFMIYH', 1, 1, 'Promotion', '2021-03-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EFMIYH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EFMIYH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EFZFTJ', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EFZFTJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EFZFTJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EGDMXT', 1, 1, 'Promotion', '2003-01-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EGDMXT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EGDMXT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EGINOL', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EGINOL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EGINOL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EGNSEC', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EGNSEC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EGNSEC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EHCFZP', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EHCFZP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EHCFZP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EHJSCN', 1, 1, 'Promotion', '2021-10-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EHJSCN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EHJSCN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EJBRLZ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EJBRLZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EJBRLZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EJJGBL', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EJJGBL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EJJGBL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EJWOZN', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EJWOZN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EJWOZN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EKSZDY', 1, 1, 'Promotion', '2021-02-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EKSZDY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EKSZDY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EKWSKG', 1, 1, 'Promotion', '2018-11-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EKWSKG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-11-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EKWSKG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EMMXEO', 1, 1, 'Promotion', '1993-11-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EMMXEO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EMMXEO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EMRUIW', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EMRUIW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EMRUIW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ENCLOJ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ENCLOJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ENCLOJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ENPXKR', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ENPXKR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ENPXKR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOFYZA', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOFYZA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOFYZA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOHHNY', 1, 1, 'Promotion', '2021-03-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOHHNY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOHHNY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOLYFU', 1, 1, 'Promotion', '1994-02-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOLYFU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOLYFU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOMKJZ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOMKJZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOMKJZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOXXFL', 1, 1, 'Promotion', '2019-06-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOXXFL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-06-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOXXFL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOXXFL', 1, 1, 'Promotion', '2019-06-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOXXFL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-06-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOXXFL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EPAIMN', 1, 1, 'Promotion', '2018-07-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EPAIMN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-07-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EPAIMN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EPLYXB', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EPLYXB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EPLYXB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EPTRAR', 1, 1, 'Promotion', '2019-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EPTRAR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EPTRAR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EQBTEL', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EQBTEL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EQBTEL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EQENRI', 1, 1, 'Promotion', '2024-02-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EQENRI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EQENRI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EQGOER', 1, 1, 'Promotion', '1994-01-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EQGOER'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-01-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EQGOER' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EQNDWA', 1, 1, 'Promotion', '2019-10-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EQNDWA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-10-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EQNDWA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ERBXZY', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ERBXZY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ERBXZY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EROQRU', 1, 1, 'Promotion', '2020-03-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EROQRU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-03-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EROQRU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ESAXSK', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ESAXSK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ESAXSK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ESCKJI', 1, 1, 'Promotion', '2020-10-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ESCKJI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ESCKJI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ETBRCP', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ETBRCP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ETBRCP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ETFEGI', 1, 1, 'Promotion', '1996-05-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ETFEGI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-05-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ETFEGI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EUDNCK', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EUDNCK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EUDNCK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EULEDL', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EULEDL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EULEDL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EUXYFO', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EUXYFO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EUXYFO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EWAFXC', 1, 1, 'Promotion', '2019-06-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EWAFXC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EWAFXC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EWKCST', 1, 1, 'Promotion', '2025-03-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EWKCST'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-03-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EWKCST' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EWTMIF', 1, 1, 'Promotion', '2014-12-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EWTMIF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-12-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EWTMIF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EWXYGZ', 1, 1, 'Promotion', '2021-02-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EWXYGZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EWXYGZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EWYFQK', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EWYFQK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EWYFQK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EYJQHO', 1, 1, 'Promotion', '2020-07-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EYJQHO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EYJQHO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EYLNXM', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EYLNXM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EYLNXM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EZXRAM', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EZXRAM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EZXRAM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FAJBZM', 1, 1, 'Promotion', '2021-06-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FAJBZM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FAJBZM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FBAOYB', 1, 1, 'Promotion', '2017-11-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FBAOYB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FBAOYB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FBHJDN', 1, 1, 'Promotion', '2022-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FBHJDN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FBHJDN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FBRXHN', 1, 1, 'Promotion', '2021-10-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FBRXHN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FBRXHN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCASPG', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCASPG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCASPG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCDQNO', 1, 1, 'Promotion', '2014-05-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCDQNO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCDQNO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCDXTE', 1, 1, 'Promotion', '1988-09-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCDXTE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1988-09-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCDXTE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FCRSRY', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FCRSRY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FCRSRY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FDLYAH', 1, 1, 'Promotion', '1996-12-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FDLYAH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-12-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FDLYAH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FDNGGL', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FDNGGL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FDNGGL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FEDMRS', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FEDMRS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FEDMRS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FEINUF', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FEINUF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FEINUF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FEJLTM', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FEJLTM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FEJLTM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FEQBDP', 1, 1, 'Promotion', '2021-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FEQBDP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FEQBDP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FFFXPF', 1, 1, 'Promotion', '2021-04-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FFFXPF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FFFXPF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FFSOAN', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FFSOAN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FFSOAN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGARXF', 1, 1, 'Promotion', '1995-01-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGARXF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1995-01-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGARXF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGGOWL', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGGOWL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGGOWL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGMWOR', 1, 1, 'Promotion', '2019-09-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGMWOR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-09-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGMWOR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FHALNI', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FHALNI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FHALNI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FHKTAA', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FHKTAA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FHKTAA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FHNOCQ', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FHNOCQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FHNOCQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FHOXLN', 1, 1, 'Promotion', '2014-05-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FHOXLN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FHOXLN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FIJBMN', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FIJBMN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FIJBMN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FKCGSI', 1, 1, 'Promotion', '1993-07-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FKCGSI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FKCGSI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLCJCK', 1, 1, 'Promotion', '2022-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLCJCK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLCJCK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLENLL', 1, 1, 'Promotion', '2019-03-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLENLL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-03-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLENLL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLQFLH', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLQFLH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLQFLH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FLSGDM', 1, 1, 'Promotion', '1994-02-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FLSGDM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FLSGDM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FMALDE', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FMALDE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FMALDE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FMSJLX', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FMSJLX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FMSJLX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FMWPPP', 1, 1, 'Promotion', '2002-05-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FMWPPP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-05-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FMWPPP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FMXOOY', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FMXOOY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FMXOOY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FOLBHO', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FOLBHO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FOLBHO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FORYCM', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FORYCM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FORYCM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FOXBQY', 1, 1, 'Promotion', '1991-06-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FOXBQY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-06-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FOXBQY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FPEJAY', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FPEJAY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FPEJAY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FPLUGT', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FPLUGT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FPLUGT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FQDRBD', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FQDRBD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FQDRBD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FQKCUB', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FQKCUB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FQKCUB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FQKJKC', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FQKJKC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FQKJKC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FQLTYL', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FQLTYL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FQLTYL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FRPAOD', 1, 1, 'Promotion', '2016-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FRPAOD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FRPAOD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FRPLSZ', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FRPLSZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FRPLSZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSIQCC', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSIQCC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSIQCC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSLWZB', 1, 1, 'Promotion', '1995-05-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSLWZB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1995-05-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSLWZB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FSPQNH', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FSPQNH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FSPQNH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FTEINY', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FTEINY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FTEINY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FTEOXZ', 1, 1, 'Promotion', '2024-02-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FTEOXZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FTEOXZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FTPRSM', 1, 1, 'Promotion', '2021-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FTPRSM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FTPRSM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FTREMF', 1, 1, 'Promotion', '2021-03-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FTREMF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FTREMF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FTWJOX', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FTWJOX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FTWJOX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FUADFP', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FUADFP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FUADFP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FUAJIN', 1, 1, 'Promotion', '2021-08-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FUAJIN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FUAJIN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FUFWIH', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FUFWIH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FUFWIH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FURGOK', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FURGOK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FURGOK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FWJLYL', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FWJLYL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FWJLYL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FWOCTU', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FWOCTU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FWOCTU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FWPUIN', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FWPUIN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FWPUIN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FXCMIF', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FXCMIF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FXCMIF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FXIGTR', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FXIGTR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FXIGTR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FXJCSN', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FXJCSN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FXJCSN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FYWIHF', 1, 1, 'Promotion', '1994-02-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FYWIHF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FYWIHF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FYZIXS', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FYZIXS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FYZIXS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FZNDZS', 1, 1, 'Promotion', '2017-05-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FZNDZS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FZNDZS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FZWXOC', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FZWXOC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FZWXOC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GAKMQI', 1, 1, 'Promotion', '2017-08-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GAKMQI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GAKMQI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GANXRG', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GANXRG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GANXRG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GBEXAX', 1, 1, 'Promotion', '1993-07-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GBEXAX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GBEXAX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GBZUSO', 1, 1, 'Promotion', '2021-07-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GBZUSO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-07-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GBZUSO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDAKCI', 1, 1, 'Promotion', '2019-08-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDAKCI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-08-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDAKCI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDIHIM', 1, 1, 'Promotion', '1991-02-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDIHIM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDIHIM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDSITF', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDSITF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDSITF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDXNXY', 1, 1, 'Promotion', '2022-07-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDXNXY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-07-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDXNXY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDYDZQ', 1, 1, 'Promotion', '2021-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDYDZQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDYDZQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GDZTRM', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GDZTRM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GDZTRM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GECPDH', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GECPDH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GECPDH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GEFURM', 1, 1, 'Promotion', '1991-11-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GEFURM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-11-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GEFURM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GEKJZZ', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GEKJZZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GEKJZZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GELMHQ', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GELMHQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GELMHQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GENOKZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GENOKZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GENOKZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GFDRYH', 1, 1, 'Promotion', '2017-05-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GFDRYH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GFDRYH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GFHSGN', 1, 1, 'Promotion', '2020-12-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GFHSGN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-12-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GFHSGN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GFYBRT', 1, 1, 'Promotion', '2024-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GFYBRT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GFYBRT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GGAWJM', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GGAWJM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GGAWJM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GGIYUO', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GGIYUO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GGIYUO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GHAPHC', 1, 1, 'Promotion', '2020-06-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GHAPHC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-06-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GHAPHC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GIMTUW', 1, 1, 'Promotion', '1993-04-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GIMTUW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-04-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GIMTUW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GIOTLH', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GIOTLH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GIOTLH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJBDKN', 1, 1, 'Promotion', '2021-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJBDKN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJBDKN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJDSFQ', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJDSFQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJDSFQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJPWKK', 1, 1, 'Promotion', '2010-12-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJPWKK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJPWKK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJWTHX', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJWTHX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJWTHX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJYTYA', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJYTYA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJYTYA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GKGKIL', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GKGKIL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GKGKIL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GKKGGD', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GKKGGD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GKKGGD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GNABGH', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GNABGH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GNABGH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GNKXJH', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GNKXJH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GNKXJH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GNTOFQ', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GNTOFQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GNTOFQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GOAXXJ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GOAXXJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GOAXXJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GOPCNH', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GOPCNH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GOPCNH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GPDMTU', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GPDMTU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GPDMTU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GPFADO', 1, 1, 'Promotion', '2022-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GPFADO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GPFADO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GPFMPU', 1, 1, 'Promotion', '1991-06-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GPFMPU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-06-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GPFMPU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GPQOBU', 1, 1, 'Promotion', '2017-08-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GPQOBU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GPQOBU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GQAIKN', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GQAIKN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GQAIKN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GSUCEL', 1, 1, 'Promotion', '2018-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GSUCEL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GSUCEL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GSXPDA', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GSXPDA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GSXPDA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GTLNOW', 1, 1, 'Promotion', '2025-07-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GTLNOW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-07-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GTLNOW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GTYFTJ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GTYFTJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GTYFTJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GUJKKW', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GUJKKW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GUJKKW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GUTGAW', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GUTGAW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GUTGAW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GWHSPP', 1, 1, 'Promotion', '2020-03-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GWHSPP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-03-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GWHSPP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GWKQQK', 1, 1, 'Promotion', '2021-05-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GWKQQK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-05-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GWKQQK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GWQKLE', 1, 1, 'Promotion', '2018-06-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GWQKLE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GWQKLE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXRRMA', 1, 1, 'Promotion', '2017-04-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXRRMA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-04-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXRRMA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXSCLO', 1, 1, 'Promotion', '2001-08-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXSCLO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXSCLO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GYCYHO', 1, 1, 'Promotion', '1993-12-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GYCYHO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-12-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GYCYHO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GYTXGG', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GYTXGG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GYTXGG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GYUKNQ', 1, 1, 'Promotion', '2021-11-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GYUKNQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-11-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GYUKNQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GZXZRE', 1, 1, 'Promotion', '2024-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GZXZRE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GZXZRE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HAAABB', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HAAABB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HAAABB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HABNPK', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HABNPK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HABNPK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HAIKPL', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HAIKPL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HAIKPL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HAMDXU', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HAMDXU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HAMDXU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HAQEJQ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HAQEJQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HAQEJQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HBQBKK', 1, 1, 'Promotion', '2021-01-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HBQBKK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HBQBKK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HBUIXQ', 1, 1, 'Promotion', '1993-07-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HBUIXQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HBUIXQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HBZWWB', 1, 1, 'Promotion', '2020-01-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HBZWWB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-01-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HBZWWB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HCIBSQ', 1, 1, 'Promotion', '2021-01-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HCIBSQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HCIBSQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HCNHNK', 1, 1, 'Promotion', '2013-08-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HCNHNK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HCNHNK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HCQTFT', 1, 1, 'Promotion', '2021-06-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HCQTFT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HCQTFT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HDGIRI', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HDGIRI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HDGIRI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HDGZAQ', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HDGZAQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HDGZAQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HDTJPZ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HDTJPZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HDTJPZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HFAYMY', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HFAYMY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HFAYMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HFQERX', 1, 1, 'Promotion', '2013-07-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HFQERX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-07-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HFQERX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HGGYCH', 1, 1, 'Promotion', '2021-04-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HGGYCH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HGGYCH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HGTPHS', 1, 1, 'Promotion', '1991-11-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HGTPHS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-11-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HGTPHS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HGWPDF', 1, 1, 'Promotion', '2003-03-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HGWPDF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-03-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HGWPDF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HHQPAZ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HHQPAZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HHQPAZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HHSPBN', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HHSPBN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HHSPBN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HHWENF', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HHWENF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HHWENF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HILXCZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HILXCZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HILXCZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HIMQWY', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HIMQWY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HIMQWY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HIUPHS', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HIUPHS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HIUPHS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJCTIU', 1, 1, 'Promotion', '2008-06-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJCTIU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-06-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJCTIU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJKEJG', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJKEJG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJKEJG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJKNLA', 1, 1, 'Promotion', '1993-11-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJKNLA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJKNLA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HKBPRK', 1, 1, 'Promotion', '2023-05-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HKBPRK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-05-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HKBPRK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HKTRQS', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HKTRQS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HKTRQS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HKYKUE', 1, 1, 'Promotion', '2018-02-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HKYKUE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-02-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HKYKUE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HLQPXL', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HLQPXL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HLQPXL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HLUNIH', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HLUNIH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HLUNIH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HMAEFU', 1, 1, 'Promotion', '2017-06-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HMAEFU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HMAEFU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HMJKCU', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HMJKCU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HMJKCU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HONUOF', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HONUOF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HONUOF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HOXLGA', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HOXLGA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HOXLGA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HPDNIO', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HPDNIO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HPDNIO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HQQBRC', 1, 1, 'Promotion', '2020-07-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HQQBRC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HQQBRC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HREJQI', 1, 1, 'Promotion', '2019-03-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HREJQI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-03-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HREJQI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HREPBA', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HREPBA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HREPBA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HRMUZD', 1, 1, 'Promotion', '2017-08-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HRMUZD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HRMUZD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HRTRCP', 1, 1, 'Promotion', '2017-08-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HRTRCP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HRTRCP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HRUFYF', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HRUFYF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HRUFYF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HSMOPP', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HSMOPP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HSMOPP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HTGKUX', 1, 1, 'Promotion', '2017-04-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HTGKUX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-04-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HTGKUX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HTODHW', 1, 1, 'Promotion', '2019-03-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HTODHW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-03-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HTODHW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HUDDIZ', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HUDDIZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HUDDIZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HUUKMM', 1, 1, 'Promotion', '2019-07-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HUUKMM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-07-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HUUKMM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HUUKMM', 1, 1, 'Promotion', '2019-07-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HUUKMM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-07-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HUUKMM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HVDIKR', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HVDIKR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HVDIKR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWUREF', 1, 1, 'Promotion', '2015-03-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWUREF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2015-03-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWUREF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXDLFX', 1, 1, 'Promotion', '2014-11-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXDLFX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-11-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXDLFX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXDTKY', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXDTKY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXDTKY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXSHCD', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXSHCD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXSHCD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXTEOM', 1, 1, 'Promotion', '1988-05-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXTEOM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1988-05-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXTEOM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXTOXO', 1, 1, 'Promotion', '2017-07-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXTOXO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-07-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXTOXO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXXOCQ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXXOCQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXXOCQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYCICM', 1, 1, 'Promotion', '1993-07-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYCICM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYCICM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYHXEX', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYHXEX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYHXEX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYIZXU', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYIZXU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYIZXU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYRAHO', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYRAHO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYRAHO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HZBCRG', 1, 1, 'Promotion', '2022-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HZBCRG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HZBCRG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HZBPXK', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HZBPXK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HZBPXK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HZGOOU', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HZGOOU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HZGOOU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HZRTKX', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HZRTKX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HZRTKX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HZTQMZ', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HZTQMZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HZTQMZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IAKHMT', 1, 1, 'Promotion', '1996-10-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IAKHMT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IAKHMT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IAYPRY', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IAYPRY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IAYPRY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IBFNOE', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IBFNOE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IBFNOE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IBGOXW', 1, 1, 'Promotion', '2025-06-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IBGOXW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IBGOXW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IBQHUT', 1, 1, 'Promotion', '2014-05-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IBQHUT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IBQHUT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IBSDDA', 1, 1, 'Promotion', '2018-06-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IBSDDA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IBSDDA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ICHNPA', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ICHNPA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ICHNPA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ICYIUE', 1, 1, 'Promotion', '2014-05-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ICYIUE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ICYIUE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IDSKDO', 1, 1, 'Promotion', '2017-12-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IDSKDO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IDSKDO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IDSYSE', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IDSYSE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IDSYSE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IDYWNZ', 1, 1, 'Promotion', '2013-08-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IDYWNZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IDYWNZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IEOLRL', 1, 1, 'Promotion', '2025-07-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IEOLRL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-07-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IEOLRL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IEXUDR', 1, 1, 'Promotion', '2018-06-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IEXUDR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IEXUDR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IGSDLO', 1, 1, 'Promotion', '1991-11-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IGSDLO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-11-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IGSDLO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IHCFBZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IHCFBZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IHCFBZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IHOHCM', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IHOHCM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IHOHCM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIJZZT', 1, 1, 'Promotion', '1992-03-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIJZZT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1992-03-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIJZZT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIUKZQ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIUKZQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIUKZQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IJKDWB', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IJKDWB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IJKDWB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IJMRJM', 1, 1, 'Promotion', '2019-03-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IJMRJM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-03-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IJMRJM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IJPUNC', 1, 1, 'Promotion', '1995-01-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IJPUNC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1995-01-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IJPUNC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IKBSJP', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IKBSJP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IKBSJP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IKEBTY', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IKEBTY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IKEBTY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IKHZNQ', 1, 1, 'Promotion', '2021-04-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IKHZNQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IKHZNQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ILIZIN', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ILIZIN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ILIZIN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ILLRJE', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ILLRJE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ILLRJE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ILRNWM', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ILRNWM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ILRNWM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMLSOC', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMLSOC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMLSOC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMOPYD', 1, 1, 'Promotion', '2012-02-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMOPYD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2012-02-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMOPYD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMSKOO', 1, 1, 'Promotion', '2020-10-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMSKOO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMSKOO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMYZGX', 1, 1, 'Promotion', '2016-12-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMYZGX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMYZGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INBWPO', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INBWPO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INBWPO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INCJRK', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INCJRK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INCJRK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INDLIG', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INDLIG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INDLIG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INOAGG', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INOAGG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INOAGG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IONKRM', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IONKRM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IONKRM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IPEJKB', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IPEJKB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IPEJKB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IPJQGL', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IPJQGL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IPJQGL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IQIKCP', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IQIKCP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IQIKCP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IQKIUB', 1, 1, 'Promotion', '2018-04-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IQKIUB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IQKIUB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IRHNNL', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IRHNNL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IRHNNL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IRHUZW', 1, 1, 'Promotion', '2018-05-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IRHUZW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-05-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IRHUZW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IRTOFN', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IRTOFN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IRTOFN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ISTQXC', 1, 1, 'Promotion', '2023-02-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ISTQXC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-02-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ISTQXC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITNNYH', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITNNYH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITNNYH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITOMSR', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITOMSR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITOMSR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITUJGL', 1, 1, 'Promotion', '1991-08-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITUJGL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-08-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITUJGL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUFPZR', 1, 1, 'Promotion', '2024-02-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUFPZR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUFPZR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUHEDA', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUHEDA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUHEDA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUHOKM', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUHOKM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUHOKM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IWIRWX', 1, 1, 'Promotion', '2020-10-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IWIRWX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IWIRWX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IWMSIL', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IWMSIL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IWMSIL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IWQSQL', 1, 1, 'Promotion', '2017-11-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IWQSQL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IWQSQL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IXYULS', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IXYULS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IXYULS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IXZWRS', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IXZWRS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IXZWRS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IYQMZI', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IYQMZI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IYQMZI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IYUIXI', 1, 1, 'Promotion', '2021-10-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IYUIXI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IYUIXI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IZNKDZ', 1, 1, 'Promotion', '2018-04-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IZNKDZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IZNKDZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IZRTPX', 1, 1, 'Promotion', '2009-07-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IZRTPX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IZRTPX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IZWLLC', 1, 1, 'Promotion', '1993-11-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IZWLLC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IZWLLC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JAGXTA', 1, 1, 'Promotion', '2023-02-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JAGXTA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-02-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JAGXTA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JAURYW', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JAURYW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JAURYW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JAXFLU', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JAXFLU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JAXFLU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JAYMQQ', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JAYMQQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JAYMQQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JBYZYM', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JBYZYM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JBYZYM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JCGTNU', 1, 1, 'Promotion', '2013-08-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JCGTNU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JCGTNU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JCLIWQ', 1, 1, 'Promotion', '2019-08-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JCLIWQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-08-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JCLIWQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JCZODZ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JCZODZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JCZODZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDNCMU', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDNCMU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDNCMU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDQCPW', 1, 1, 'Promotion', '1997-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDQCPW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDQCPW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDQOUI', 1, 1, 'Promotion', '2023-01-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDQOUI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-01-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDQOUI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDTHWQ', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDTHWQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDTHWQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JFBWNF', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JFBWNF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JFBWNF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JFRQEF', 1, 1, 'Promotion', '2019-04-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JFRQEF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-04-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JFRQEF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JGGGSD', 1, 1, 'Promotion', '2019-12-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JGGGSD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-12-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JGGGSD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JGOFNA', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JGOFNA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JGOFNA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHGSHQ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHGSHQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHGSHQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHXHGH', 1, 1, 'Promotion', '2018-04-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHXHGH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHXHGH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JIKJMY', 1, 1, 'Promotion', '2021-01-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JIKJMY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JIKJMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JISTLT', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JISTLT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JISTLT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJAWPA', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJAWPA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJAWPA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJBNRM', 1, 1, 'Promotion', '2001-03-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJBNRM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-03-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJBNRM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJIMKM', 1, 1, 'Promotion', '2013-04-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJIMKM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-04-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJIMKM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJTTDR', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJTTDR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJTTDR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJUEMJ', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJUEMJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJUEMJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJUFHA', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJUFHA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJUFHA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JKNMNN', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JKNMNN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JKNMNN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JKXQMW', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JKXQMW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JKXQMW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMDDYN', 1, 1, 'Promotion', '1997-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMDDYN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMDDYN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMLUBM', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMLUBM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMLUBM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMMUSH', 1, 1, 'Promotion', '2020-11-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMMUSH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-11-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMMUSH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMXSGS', 1, 1, 'Promotion', '1996-10-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMXSGS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMXSGS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JNOTLN', 1, 1, 'Promotion', '2025-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JNOTLN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JNOTLN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JNXYTZ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JNXYTZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JNXYTZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JOEKNA', 1, 1, 'Promotion', '2014-07-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JOEKNA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JOEKNA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JOHRGL', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JOHRGL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JOHRGL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JOPBUC', 1, 1, 'Promotion', '2021-01-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JOPBUC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JOPBUC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JOTUUG', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JOTUUG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JOTUUG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JPASFN', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JPASFN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JPASFN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JPDHIA', 1, 1, 'Promotion', '1994-02-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JPDHIA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JPDHIA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JPLYFF', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JPLYFF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JPLYFF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQDNPF', 1, 1, 'Promotion', '1996-10-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQDNPF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQDNPF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQGZYA', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQGZYA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQGZYA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQMXBE', 1, 1, 'Promotion', '2017-08-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQMXBE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQMXBE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JQQWPB', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JQQWPB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JQQWPB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JRCQGC', 1, 1, 'Promotion', '2008-06-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JRCQGC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-06-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JRCQGC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JRHRPT', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JRHRPT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JRHRPT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JRIHDY', 1, 1, 'Promotion', '1991-11-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JRIHDY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-11-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JRIHDY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JSXUSC', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JSXUSC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JSXUSC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JTNYLA', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JTNYLA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JTNYLA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JUFCWO', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JUFCWO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JUFCWO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JUGRGX', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JUGRGX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JUGRGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JWCYEZ', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JWCYEZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JWCYEZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JWEEXY', 1, 1, 'Promotion', '2022-02-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JWEEXY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-02-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JWEEXY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JWXXJC', 1, 1, 'Promotion', '2020-07-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JWXXJC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JWXXJC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JXAPKF', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JXAPKF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JXAPKF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JXEQLZ', 1, 1, 'Promotion', '2019-12-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JXEQLZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-12-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JXEQLZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JXGNBI', 1, 1, 'Promotion', '2019-07-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JXGNBI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-07-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JXGNBI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JXRGDO', 1, 1, 'Promotion', '1997-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JXRGDO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JXRGDO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JXWKBZ', 1, 1, 'Promotion', '2023-02-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JXWKBZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-02-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JXWKBZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JYCMSD', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JYCMSD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JYCMSD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JYFFLT', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JYFFLT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JYFFLT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JYPLAH', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JYPLAH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JYPLAH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JYXPPS', 1, 1, 'Promotion', '2003-10-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JYXPPS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JYXPPS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZCUMK', 1, 1, 'Promotion', '2000-12-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZCUMK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZCUMK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZHJRG', 1, 1, 'Promotion', '2021-03-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZHJRG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZHJRG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZOZWR', 1, 1, 'Promotion', '1996-10-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZOZWR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZOZWR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZTQBS', 1, 1, 'Promotion', '1997-03-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZTQBS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-03-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZTQBS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KAQIME', 1, 1, 'Promotion', '2018-12-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KAQIME'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KAQIME' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KAZURB', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KAZURB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KAZURB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KBSTHB', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KBSTHB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KBSTHB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KCBQNF', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KCBQNF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KCBQNF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KCFYDR', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KCFYDR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KCFYDR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDAEYL', 1, 1, 'Promotion', '2008-12-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDAEYL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-12-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDAEYL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDBYJO', 1, 1, 'Promotion', '2011-03-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDBYJO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2011-03-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDBYJO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDPNIS', 1, 1, 'Promotion', '1992-01-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDPNIS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1992-01-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDPNIS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDQEDJ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDQEDJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDQEDJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDYHDF', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDYHDF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDYHDF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KEJCCD', 1, 1, 'Promotion', '2019-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KEJCCD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KEJCCD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KEMPJZ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KEMPJZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KEMPJZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KEOYBY', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KEOYBY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KEOYBY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KEPXFF', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KEPXFF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KEPXFF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KFEBEW', 1, 1, 'Promotion', '2003-10-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KFEBEW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KFEBEW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KGEKMR', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KGEKMR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KGEKMR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KGFZKG', 1, 1, 'Promotion', '2020-01-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KGFZKG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-01-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KGFZKG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHKKYF', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHKKYF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHKKYF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHKLJU', 1, 1, 'Promotion', '2021-09-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHKLJU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-09-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHKLJU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHQPGB', 1, 1, 'Promotion', '1994-02-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHQPGB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHQPGB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KIAHGI', 1, 1, 'Promotion', '2022-01-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KIAHGI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KIAHGI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KIHXHS', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KIHXHS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KIHXHS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KIWGIM', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KIWGIM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KIWGIM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KJMJEP', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KJMJEP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KJMJEP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KJNGBR', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KJNGBR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KJNGBR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKBOBX', 1, 1, 'Promotion', '1998-12-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKBOBX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1998-12-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKBOBX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKPXGO', 1, 1, 'Promotion', '1993-11-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKPXGO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKPXGO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KLGSIO', 1, 1, 'Promotion', '2021-01-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KLGSIO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KLGSIO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KLHFKT', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KLHFKT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KLHFKT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KLRDLG', 1, 1, 'Promotion', '1989-03-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KLRDLG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1989-03-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KLRDLG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KLYHDG', 1, 1, 'Promotion', '2019-12-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KLYHDG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-12-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KLYHDG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KMGAFM', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KMGAFM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KMGAFM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KMRCCW', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KMRCCW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KMRCCW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KMWWHU', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KMWWHU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KMWWHU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KNGNTW', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KNGNTW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KNGNTW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KNKAQM', 1, 1, 'Promotion', '2019-07-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KNKAQM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-07-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KNKAQM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KNLXWD', 1, 1, 'Promotion', '1996-10-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KNLXWD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KNLXWD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KNTWDR', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KNTWDR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KNTWDR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KPOKDU', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KPOKDU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KPOKDU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KPUANM', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KPUANM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KPUANM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KQBZRP', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KQBZRP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KQBZRP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KQZYXQ', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KQZYXQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KQZYXQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KRTTZR', 1, 1, 'Promotion', '2025-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KRTTZR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KRTTZR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KSAZAQ', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KSAZAQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KSAZAQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KSFOFO', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KSFOFO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KSFOFO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KSOHFC', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KSOHFC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KSOHFC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KSOOBN', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KSOOBN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KSOOBN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KTJUEI', 1, 1, 'Promotion', '1994-03-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KTJUEI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-03-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KTJUEI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KUKFWA', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KUKFWA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KUKFWA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KUNNPW', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KUNNPW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KUNNPW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWCEFI', 1, 1, 'Promotion', '2020-10-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWCEFI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWCEFI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWCPOW', 1, 1, 'Promotion', '2022-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWCPOW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWCPOW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWPCTY', 1, 1, 'Promotion', '2019-03-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWPCTY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-03-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWPCTY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWTGKA', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWTGKA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWTGKA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KYMDCC', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KYMDCC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KYMDCC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KZDWQC', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KZDWQC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KZDWQC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KZROGI', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KZROGI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KZROGI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KZZZKZ', 1, 1, 'Promotion', '2014-05-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KZZZKZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KZZZKZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LADQZO', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LADQZO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LADQZO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LAETJL', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LAETJL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LAETJL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LAKZFX', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LAKZFX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LAKZFX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LASDRN', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LASDRN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LASDRN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LBFELK', 1, 1, 'Promotion', '2014-11-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LBFELK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-11-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LBFELK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LBIMSF', 1, 1, 'Promotion', '2023-02-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LBIMSF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-02-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LBIMSF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LBSIBM', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LBSIBM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LBSIBM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LCJQAO', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LCJQAO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LCJQAO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LCMCWF', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LCMCWF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LCMCWF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LEJHMI', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LEJHMI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LEJHMI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LFLJEU', 1, 1, 'Promotion', '1996-10-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LFLJEU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LFLJEU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LGMSZA', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LGMSZA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LGMSZA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHDNBE', 1, 1, 'Promotion', '1996-10-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHDNBE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHDNBE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHDRBI', 1, 1, 'Promotion', '2018-04-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHDRBI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHDRBI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHJDBR', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHJDBR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHJDBR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LKNBIX', 1, 1, 'Promotion', '2014-07-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LKNBIX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LKNBIX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LKUXJE', 1, 1, 'Promotion', '2022-06-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LKUXJE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-06-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LKUXJE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLHRKE', 1, 1, 'Promotion', '2001-08-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLHRKE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLHRKE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLLBFJ', 1, 1, 'Promotion', '2025-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLLBFJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLLBFJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLREJU', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLREJU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLREJU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMQMOS', 1, 1, 'Promotion', '1993-08-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMQMOS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-08-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMQMOS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMQQFS', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMQQFS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMQQFS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LNFKRB', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LNFKRB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LNFKRB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LNLBSU', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LNLBSU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LNLBSU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LOUXRW', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LOUXRW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LOUXRW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LOZBJE', 1, 1, 'Promotion', '2020-10-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LOZBJE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LOZBJE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LPDRDF', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LPDRDF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LPDRDF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LPIPQL', 1, 1, 'Promotion', '2010-12-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LPIPQL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LPIPQL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LPPDPX', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LPPDPX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LPPDPX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LPPFEB', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LPPFEB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LPPFEB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LPWQWT', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LPWQWT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LPWQWT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LQBLOO', 1, 1, 'Promotion', '1997-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LQBLOO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LQBLOO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LRJWZJ', 1, 1, 'Promotion', '2017-12-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LRJWZJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LRJWZJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LRMUBO', 1, 1, 'Promotion', '2014-08-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LRMUBO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-08-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LRMUBO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LSCCCG', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LSCCCG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LSCCCG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LSCOHB', 1, 1, 'Promotion', '2021-05-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LSCOHB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-05-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LSCOHB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LSZKOU', 1, 1, 'Promotion', '1991-06-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LSZKOU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-06-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LSZKOU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LUJQNW', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LUJQNW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LUJQNW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LULNSJ', 1, 1, 'Promotion', '2020-10-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LULNSJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LULNSJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LUUKOT', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LUUKOT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LUUKOT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LWDTAI', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LWDTAI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LWDTAI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LWKLXI', 1, 1, 'Promotion', '2022-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LWKLXI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LWKLXI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LWNSML', 1, 1, 'Promotion', '2021-11-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LWNSML'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-11-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LWNSML' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LWTQIL', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LWTQIL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LWTQIL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LWWCSW', 1, 1, 'Promotion', '2017-06-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LWWCSW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LWWCSW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LXRNTO', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LXRNTO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LXRNTO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LXZRKW', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LXZRKW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LXZRKW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYAYTT', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYAYTT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYAYTT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LZDGQO', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LZDGQO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LZDGQO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MAGQZT', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MAGQZT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MAGQZT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MAHAOE', 1, 1, 'Promotion', '1991-02-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MAHAOE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MAHAOE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MASFLL', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MASFLL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MASFLL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MBEEWB', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MBEEWB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MBEEWB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MBIAJU', 1, 1, 'Promotion', '2014-05-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MBIAJU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MBIAJU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MCBLLG', 1, 1, 'Promotion', '2003-10-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MCBLLG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MCBLLG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MCCUCO', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MCCUCO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MCCUCO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MCUZKG', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MCUZKG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MCUZKG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MEKFNZ', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MEKFNZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MEKFNZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MELUJC', 1, 1, 'Promotion', '1993-07-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MELUJC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MELUJC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MFCYJE', 1, 1, 'Promotion', '2021-02-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MFCYJE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MFCYJE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MFJHJA', 1, 1, 'Promotion', '1990-09-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MFJHJA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1990-09-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MFJHJA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MFRPYU', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MFRPYU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MFRPYU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MFWQLE', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MFWQLE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MFWQLE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MGCTZS', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MGCTZS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MGCTZS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MIAWBQ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MIAWBQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MIAWBQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MIHWNS', 1, 1, 'Promotion', '2017-10-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MIHWNS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-10-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MIHWNS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MIOXHH', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MIOXHH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MIOXHH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MIYJUD', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MIYJUD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MIYJUD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MJNWEW', 1, 1, 'Promotion', '2014-05-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MJNWEW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MJNWEW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKCEPO', 1, 1, 'Promotion', '2018-06-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKCEPO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKCEPO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKFBZD', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKFBZD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKFBZD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKKBAK', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKKBAK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKKBAK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MLCAED', 1, 1, 'Promotion', '2023-03-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MLCAED'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-03-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MLCAED' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MLTEOM', 1, 1, 'Promotion', '2023-03-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MLTEOM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-03-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MLTEOM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MLWNFK', 1, 1, 'Promotion', '2021-10-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MLWNFK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MLWNFK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMFUSZ', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMFUSZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMFUSZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMQNXL', 1, 1, 'Promotion', '2020-07-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMQNXL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMQNXL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMTDJQ', 1, 1, 'Promotion', '2014-08-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMTDJQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-08-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMTDJQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMYCDJ', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMYCDJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMYCDJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MNDDLJ', 1, 1, 'Promotion', '2002-01-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MNDDLJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-01-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MNDDLJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MNOLOO', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MNOLOO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MNOLOO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MOGAMS', 1, 1, 'Promotion', '2018-05-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MOGAMS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-05-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MOGAMS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MOKFOK', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MOKFOK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MOKFOK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MPOKML', 1, 1, 'Promotion', '2021-01-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MPOKML'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MPOKML' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MPTHUL', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MPTHUL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MPTHUL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MPWRMT', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MPWRMT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MPWRMT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQFOWC', 1, 1, 'Promotion', '2000-11-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQFOWC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-11-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQFOWC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQWOQG', 1, 1, 'Promotion', '2002-12-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQWOQG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-12-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQWOQG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRCUMO', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRCUMO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRCUMO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRDIXT', 1, 1, 'Promotion', '2020-10-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRDIXT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRDIXT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRFFGR', 1, 1, 'Promotion', '1989-08-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRFFGR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1989-08-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRFFGR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRLQWC', 1, 1, 'Promotion', '2022-01-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRLQWC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRLQWC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRSLGF', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRSLGF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRSLGF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRTQTK', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRTQTK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRTQTK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MSDTTC', 1, 1, 'Promotion', '2001-08-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MSDTTC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MSDTTC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MSLOTO', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MSLOTO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MSLOTO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MSOUWC', 1, 1, 'Promotion', '2023-09-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MSOUWC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-09-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MSOUWC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTFWTX', 1, 1, 'Promotion', '2021-11-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTFWTX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-11-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTFWTX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTJYQR', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTJYQR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTJYQR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTZXEW', 1, 1, 'Promotion', '2018-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTZXEW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTZXEW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MUJHSZ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MUJHSZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MUJHSZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MUOKWW', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MUOKWW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MUOKWW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MWRAND', 1, 1, 'Promotion', '1994-07-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MWRAND'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-07-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MWRAND' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MWRSSO', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MWRSSO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MWRSSO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MXQEXC', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MXQEXC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MXQEXC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MXYUJS', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MXYUJS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MXYUJS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MYJHTA', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MYJHTA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MYJHTA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZSXCY', 1, 1, 'Promotion', '2016-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZSXCY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZSXCY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZTTXA', 1, 1, 'Promotion', '1993-07-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZTTXA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZTTXA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NAFFNJ', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NAFFNJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NAFFNJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NATFTJ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NATFTJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NATFTJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NBBMIN', 1, 1, 'Promotion', '1991-02-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NBBMIN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NBBMIN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NBHGXA', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NBHGXA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NBHGXA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NBPEYF', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NBPEYF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NBPEYF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NBREIG', 1, 1, 'Promotion', '2023-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NBREIG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NBREIG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NBWCQG', 1, 1, 'Promotion', '2020-10-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NBWCQG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NBWCQG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCCPYX', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCCPYX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCCPYX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCEGOL', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCEGOL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCEGOL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCMKSG', 1, 1, 'Promotion', '2009-07-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCMKSG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCMKSG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCNUMY', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCNUMY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCNUMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCSYIA', 1, 1, 'Promotion', '2014-05-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCSYIA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCSYIA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDJFZX', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDJFZX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDJFZX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDNXDT', 1, 1, 'Promotion', '2022-02-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDNXDT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-02-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDNXDT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDYOQT', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDYOQT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDYOQT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDYUIN', 1, 1, 'Promotion', '2014-08-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDYUIN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-08-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDYUIN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NEIECA', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NEIECA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NEIECA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NEWIEI', 1, 1, 'Promotion', '2014-08-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NEWIEI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-08-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NEWIEI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NEXSNO', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NEXSNO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NEXSNO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NFTURD', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NFTURD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NFTURD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NGFDSZ', 1, 1, 'Promotion', '2019-07-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NGFDSZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-07-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NGFDSZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NGQITL', 1, 1, 'Promotion', '2018-12-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NGQITL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NGQITL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NGYOMY', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NGYOMY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NGYOMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NHKCLN', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NHKCLN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NHKCLN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NIDXJP', 1, 1, 'Promotion', '2017-07-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NIDXJP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-07-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NIDXJP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NIMAEI', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NIMAEI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NIMAEI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJLJXP', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJLJXP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJLJXP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJYPSB', 1, 1, 'Promotion', '2016-12-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJYPSB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJYPSB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NKNHKG', 1, 1, 'Promotion', '2021-07-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NKNHKG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-07-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NKNHKG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NKSHWY', 1, 1, 'Promotion', '2018-12-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NKSHWY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NKSHWY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NKXGPT', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NKXGPT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NKXGPT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NKZPEP', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NKZPEP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NKZPEP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NLNOYN', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NLNOYN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NLNOYN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NLZDBN', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NLZDBN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NLZDBN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NMELNI', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NMELNI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NMELNI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NMQBMO', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NMQBMO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NMQBMO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NNBSRP', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NNBSRP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NNBSRP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NNORIQ', 1, 1, 'Promotion', '2003-02-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NNORIQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-02-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NNORIQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NOYTJM', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NOYTJM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NOYTJM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NOYTJM', 1, 1, 'Promotion', '2018-03-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NOYTJM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NOYTJM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NPCRMX', 1, 1, 'Promotion', '1976-06-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NPCRMX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1976-06-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NPCRMX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NPEYOE', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NPEYOE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NPEYOE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NPRKOZ', 1, 1, 'Promotion', '2021-01-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NPRKOZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NPRKOZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NQPHFS', 1, 1, 'Promotion', '1992-02-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NQPHFS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1992-02-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NQPHFS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NRJFAR', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NRJFAR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NRJFAR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NSCODO', 1, 1, 'Promotion', '2021-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NSCODO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NSCODO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NSCOXZ', 1, 1, 'Promotion', '1993-11-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NSCOXZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NSCOXZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NTASOH', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NTASOH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NTASOH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NTENLD', 1, 1, 'Promotion', '2021-01-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NTENLD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NTENLD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NTNGPB', 1, 1, 'Promotion', '2018-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NTNGPB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NTNGPB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NTUZMC', 1, 1, 'Promotion', '2020-08-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NTUZMC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-08-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NTUZMC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NUDISO', 1, 1, 'Promotion', '1995-01-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NUDISO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1995-01-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NUDISO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NUEJEY', 1, 1, 'Promotion', '2015-04-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NUEJEY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2015-04-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NUEJEY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXFNAC', 1, 1, 'Promotion', '1991-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXFNAC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXFNAC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXFTDT', 1, 1, 'Promotion', '2018-12-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXFTDT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXFTDT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXHQWM', 1, 1, 'Promotion', '2020-06-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXHQWM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-06-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXHQWM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXKRJS', 1, 1, 'Promotion', '2020-07-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXKRJS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXKRJS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXMABI', 1, 1, 'Promotion', '1993-07-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXMABI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXMABI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXMHSD', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXMHSD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXMHSD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXMWWB', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXMWWB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXMWWB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXPALK', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXPALK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXPALK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXZXQA', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXZXQA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXZXQA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NZKSTP', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NZKSTP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NZKSTP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NZTLRO', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NZTLRO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NZTLRO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OAHZZU', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OAHZZU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OAHZZU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OBIATQ', 1, 1, 'Promotion', '2021-10-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OBIATQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OBIATQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OBXJWR', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OBXJWR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OBXJWR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OCBJOM', 1, 1, 'Promotion', '2000-05-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OCBJOM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-05-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OCBJOM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OCKIHI', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OCKIHI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OCKIHI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OCXJMA', 1, 1, 'Promotion', '2003-04-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OCXJMA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-04-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OCXJMA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ODDNLG', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ODDNLG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ODDNLG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OECJFA', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OECJFA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OECJFA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OEMWBE', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OEMWBE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OEMWBE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OEZILD', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OEZILD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OEZILD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OGADZY', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OGADZY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OGADZY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OIEFHT', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OIEFHT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OIEFHT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJAOFT', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJAOFT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJAOFT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJMDHH', 1, 1, 'Promotion', '1992-05-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJMDHH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1992-05-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJMDHH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJMYSW', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJMYSW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJMYSW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJRDOF', 1, 1, 'Promotion', '2023-07-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJRDOF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-07-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJRDOF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OKICZT', 1, 1, 'Promotion', '2020-10-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OKICZT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OKICZT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OKJOFJ', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OKJOFJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OKJOFJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OKOPIB', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OKOPIB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OKOPIB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OLIFQG', 1, 1, 'Promotion', '2016-04-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OLIFQG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-04-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OLIFQG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OLQFCU', 1, 1, 'Promotion', '2021-10-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OLQFCU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OLQFCU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ONAFMR', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ONAFMR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ONAFMR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ONJCBN', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ONJCBN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ONJCBN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ONMQEA', 1, 1, 'Promotion', '2016-10-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ONMQEA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-10-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ONMQEA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ONTBZB', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ONTBZB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ONTBZB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ONTQPY', 1, 1, 'Promotion', '1991-02-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ONTQPY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ONTQPY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OOWQSZ', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OOWQSZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OOWQSZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OPKFKT', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OPKFKT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OPKFKT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OPNUKX', 1, 1, 'Promotion', '1999-07-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OPNUKX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1999-07-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OPNUKX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OQCXYQ', 1, 1, 'Promotion', '2019-03-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OQCXYQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-03-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OQCXYQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OSFCNN', 1, 1, 'Promotion', '2022-02-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OSFCNN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-02-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OSFCNN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OSQDAF', 1, 1, 'Promotion', '2023-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OSQDAF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OSQDAF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OSSXTE', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OSSXTE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OSSXTE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OUAIHX', 1, 1, 'Promotion', '2019-07-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OUAIHX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-07-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OUAIHX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OUFTUD', 1, 1, 'Promotion', '1993-04-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OUFTUD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-04-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OUFTUD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWNKIE', 1, 1, 'Promotion', '2021-06-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWNKIE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWNKIE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWRZPA', 1, 1, 'Promotion', '2021-11-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWRZPA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-11-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWRZPA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OXJCRO', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OXJCRO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OXJCRO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OXNRND', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OXNRND'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OXNRND' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OYDEGE', 1, 1, 'Promotion', '2020-08-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OYDEGE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-08-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OYDEGE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OYGFGR', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OYGFGR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OYGFGR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OYJALT', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OYJALT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OYJALT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OYQOPP', 1, 1, 'Promotion', '2021-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OYQOPP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OYQOPP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OYYAMF', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OYYAMF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OYYAMF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OZATMF', 1, 1, 'Promotion', '2021-01-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OZATMF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OZATMF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OZFZYM', 1, 1, 'Promotion', '2018-11-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OZFZYM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-11-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OZFZYM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OZKNJM', 1, 1, 'Promotion', '2018-04-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OZKNJM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OZKNJM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAQMFK', 1, 1, 'Promotion', '1993-11-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAQMFK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAQMFK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAXPOC', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAXPOC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAXPOC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBALUI', 1, 1, 'Promotion', '2009-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBALUI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBALUI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBCLRD', 1, 1, 'Promotion', '2025-07-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBCLRD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-07-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBCLRD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBSBXF', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBSBXF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBSBXF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBXPCO', 1, 1, 'Promotion', '2002-07-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBXPCO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-07-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBXPCO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBYXQK', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBYXQK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBYXQK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PCBKKZ', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PCBKKZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PCBKKZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PCHDKG', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PCHDKG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PCHDKG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PDHXQF', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PDHXQF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PDHXQF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PDNMYP', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PDNMYP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PDNMYP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PDXWCJ', 1, 1, 'Promotion', '2023-09-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PDXWCJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-09-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PDXWCJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PEESDU', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PEESDU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PEESDU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PELBLJ', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PELBLJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PELBLJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PEQIRA', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PEQIRA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PEQIRA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PEXWHC', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PEXWHC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PEXWHC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PFADHD', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PFADHD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PFADHD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PFHPKS', 1, 1, 'Promotion', '1996-10-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PFHPKS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PFHPKS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PFKEPH', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PFKEPH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PFKEPH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PIWCGU', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PIWCGU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PIWCGU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PIWDUH', 1, 1, 'Promotion', '2021-07-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PIWDUH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-07-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PIWDUH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PIXCSM', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PIXCSM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PIXCSM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PJAPMG', 1, 1, 'Promotion', '2003-10-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PJAPMG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PJAPMG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PJGZYY', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PJGZYY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PJGZYY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PJTPTF', 1, 1, 'Promotion', '1991-06-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PJTPTF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-06-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PJTPTF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PKCFLD', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PKCFLD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PKCFLD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PKHBGQ', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PKHBGQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PKHBGQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PKIRJX', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PKIRJX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PKIRJX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PKXSDX', 1, 1, 'Promotion', '1994-03-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PKXSDX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-03-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PKXSDX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PMCTEL', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PMCTEL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PMCTEL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PMNWTW', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PMNWTW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PMNWTW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PNIQCC', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PNIQCC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PNIQCC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PNIURO', 1, 1, 'Promotion', '2021-05-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PNIURO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-05-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PNIURO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PNKCLS', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PNKCLS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PNKCLS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PNUGIP', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PNUGIP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PNUGIP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PODSJG', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PODSJG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PODSJG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'POWGTS', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'POWGTS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'POWGTS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'POYQMA', 1, 1, 'Promotion', '2017-08-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'POYQMA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'POYQMA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PPHLMK', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PPHLMK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PPHLMK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PPTRSK', 1, 1, 'Promotion', '2021-03-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PPTRSK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PPTRSK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PPUMPD', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PPUMPD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PPUMPD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PQJRAK', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PQJRAK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PQJRAK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PRWLXT', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PRWLXT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PRWLXT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PTQTSB', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PTQTSB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PTQTSB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PTSNCP', 1, 1, 'Promotion', '2018-01-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PTSNCP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PTSNCP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PTXRAZ', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PTXRAZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PTXRAZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PTZTTN', 1, 1, 'Promotion', '2022-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PTZTTN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PTZTTN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PUDUYK', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PUDUYK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PUDUYK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PUULQI', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PUULQI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PUULQI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PWYHMK', 1, 1, 'Promotion', '2019-02-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PWYHMK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PWYHMK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PXCMAS', 1, 1, 'Promotion', '2014-07-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PXCMAS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PXCMAS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PXDHTB', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PXDHTB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PXDHTB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PXOMKL', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PXOMKL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PXOMKL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PXUULC', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PXUULC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PXUULC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PYFJTE', 1, 1, 'Promotion', '2019-04-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PYFJTE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-04-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PYFJTE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PYZPMS', 1, 1, 'Promotion', '2017-12-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PYZPMS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PYZPMS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PZLLEX', 1, 1, 'Promotion', '1998-01-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PZLLEX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1998-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PZLLEX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QAGZMI', 1, 1, 'Promotion', '1993-04-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QAGZMI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-04-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QAGZMI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QAIDMX', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QAIDMX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QAIDMX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QAIIKA', 1, 1, 'Promotion', '2021-10-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QAIIKA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QAIIKA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QARCWH', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QARCWH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QARCWH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QASEKS', 1, 1, 'Promotion', '2026-04-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QASEKS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-04-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QASEKS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBGIHX', 1, 1, 'Promotion', '1993-11-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBGIHX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBGIHX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBPQQE', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBPQQE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBPQQE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBRMQW', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBRMQW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBRMQW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBRTBC', 1, 1, 'Promotion', '2018-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBRTBC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBRTBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBXBBL', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBXBBL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBXBBL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QCJNQM', 1, 1, 'Promotion', '2018-01-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QCJNQM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QCJNQM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QCOUDJ', 1, 1, 'Promotion', '2003-05-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QCOUDJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-05-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QCOUDJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QCRTEW', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QCRTEW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QCRTEW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QDTDPK', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QDTDPK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QDTDPK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QEHDQK', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QEHDQK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QEHDQK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QERNDW', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QERNDW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QERNDW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QERSNN', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QERSNN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QERSNN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QFCFZB', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QFCFZB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QFCFZB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGRCNJ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGRCNJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGRCNJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGSYJK', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGSYJK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGSYJK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGUEGT', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGUEGT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGUEGT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGWEJS', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGWEJS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGWEJS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGXMRR', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGXMRR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGXMRR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGZZMN', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGZZMN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGZZMN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QHLXWR', 1, 1, 'Promotion', '1993-04-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QHLXWR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-04-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QHLXWR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QHUCEB', 1, 1, 'Promotion', '2021-12-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QHUCEB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QHUCEB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QICCMY', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QICCMY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QICCMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QIFDCW', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QIFDCW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QIFDCW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QIHFYJ', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QIHFYJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QIHFYJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QISBFR', 1, 1, 'Promotion', '1993-11-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QISBFR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QISBFR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QJDDUR', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QJDDUR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QJDDUR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QJOFJH', 1, 1, 'Promotion', '2023-08-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QJOFJH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-08-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QJOFJH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QKPDMW', 1, 1, 'Promotion', '2022-02-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QKPDMW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-02-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QKPDMW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QKXYIT', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QKXYIT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QKXYIT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QMJFWG', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QMJFWG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QMJFWG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QNBBQA', 1, 1, 'Promotion', '1991-11-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QNBBQA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-11-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QNBBQA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QNMFUF', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QNMFUF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QNMFUF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QNSBXE', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QNSBXE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QNSBXE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QNZCPL', 1, 1, 'Promotion', '2018-07-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QNZCPL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-07-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QNZCPL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QOFNMI', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QOFNMI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QOFNMI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QOPPMB', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QOPPMB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QOPPMB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QOZALZ', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QOZALZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QOZALZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QPECUY', 1, 1, 'Promotion', '2023-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QPECUY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QPECUY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QPGTSN', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QPGTSN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QPGTSN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QPMUSH', 1, 1, 'Promotion', '2020-11-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QPMUSH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-11-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QPMUSH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QQFMBH', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QQFMBH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QQFMBH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QQWHCD', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QQWHCD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QQWHCD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QSYBTX', 1, 1, 'Promotion', '1991-11-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QSYBTX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-11-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QSYBTX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QTUUWO', 1, 1, 'Promotion', '2021-03-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QTUUWO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QTUUWO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QULTBW', 1, 1, 'Promotion', '2017-05-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QULTBW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QULTBW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QURJZS', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QURJZS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QURJZS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QXPGTE', 1, 1, 'Promotion', '2018-01-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QXPGTE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-01-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QXPGTE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QYHXJS', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QYHXJS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QYHXJS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QYJZNN', 1, 1, 'Promotion', '2013-07-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QYJZNN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-07-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QYJZNN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QZIOMH', 1, 1, 'Promotion', '1994-02-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QZIOMH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QZIOMH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QZWGZH', 1, 1, 'Promotion', '2008-06-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QZWGZH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-06-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QZWGZH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBBPDY', 1, 1, 'Promotion', '2021-05-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBBPDY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-05-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBBPDY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBDDHT', 1, 1, 'Promotion', '1992-01-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBDDHT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1992-01-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBDDHT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBDEQF', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBDEQF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBDEQF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBEIXH', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBEIXH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBEIXH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBFZUB', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBFZUB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBFZUB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBKIPF', 1, 1, 'Promotion', '2017-06-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBKIPF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBKIPF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBQNCE', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBQNCE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBQNCE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBWNXQ', 1, 1, 'Promotion', '2024-02-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBWNXQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBWNXQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBYMSO', 1, 1, 'Promotion', '2021-05-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBYMSO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-05-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBYMSO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBZGHH', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBZGHH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBZGHH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RCYMKX', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RCYMKX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RCYMKX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RDCINZ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RDCINZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RDCINZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RDNPOU', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RDNPOU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RDNPOU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'REPADB', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'REPADB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'REPADB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RFJBGT', 1, 1, 'Promotion', '2020-01-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RFJBGT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-01-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RFJBGT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RFKQJZ', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RFKQJZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RFKQJZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RGDNBA', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RGDNBA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RGDNBA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RGNJKU', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RGNJKU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RGNJKU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RHLFIN', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RHLFIN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RHLFIN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RHUNGT', 1, 1, 'Promotion', '2024-02-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RHUNGT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RHUNGT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RIEWTU', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RIEWTU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RIEWTU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RIFIBL', 1, 1, 'Promotion', '2021-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RIFIBL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RIFIBL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RIKOAA', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RIKOAA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RIKOAA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJAWXA', 1, 1, 'Promotion', '1993-07-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJAWXA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJAWXA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJBIPH', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJBIPH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJBIPH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJSKGZ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJSKGZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJSKGZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJTLFK', 1, 1, 'Promotion', '2024-02-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJTLFK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJTLFK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJWFUO', 1, 1, 'Promotion', '2026-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJWFUO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJWFUO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RLCXOQ', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RLCXOQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RLCXOQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RMLDJG', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RMLDJG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RMLDJG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RMSBWK', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RMSBWK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RMSBWK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RNITQK', 1, 1, 'Promotion', '2021-03-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RNITQK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RNITQK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ROIZQM', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ROIZQM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ROIZQM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ROSMKK', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ROSMKK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ROSMKK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RPBMYG', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RPBMYG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RPBMYG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RPHFYX', 1, 1, 'Promotion', '1995-01-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RPHFYX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1995-01-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RPHFYX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RPJNFO', 1, 1, 'Promotion', '2021-03-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RPJNFO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RPJNFO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RRPDGJ', 1, 1, 'Promotion', '2014-05-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RRPDGJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RRPDGJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RSQPNW', 1, 1, 'Promotion', '2003-10-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RSQPNW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RSQPNW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RTCBAE', 1, 1, 'Promotion', '2020-08-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RTCBAE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-08-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RTCBAE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RTNMTX', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RTNMTX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RTNMTX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RTUBFA', 1, 1, 'Promotion', '2009-07-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RTUBFA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RTUBFA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RUSICL', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RUSICL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RUSICL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RWBDCI', 1, 1, 'Promotion', '2013-04-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RWBDCI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-04-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RWBDCI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RWYYMY', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RWYYMY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RWYYMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RXTTIL', 1, 1, 'Promotion', '2014-07-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RXTTIL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RXTTIL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYATJI', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYATJI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYATJI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYIFGG', 1, 1, 'Promotion', '1995-01-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYIFGG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1995-01-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYIFGG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYKIEA', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYKIEA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYKIEA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RYUDDW', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RYUDDW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RYUDDW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RZOFYR', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RZOFYR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RZOFYR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RZRGUD', 1, 1, 'Promotion', '2000-12-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RZRGUD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RZRGUD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SBONRT', 1, 1, 'Promotion', '2014-08-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SBONRT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-08-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SBONRT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SBUAQB', 1, 1, 'Promotion', '1989-06-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SBUAQB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1989-06-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SBUAQB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCPZUD', 1, 1, 'Promotion', '1993-07-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCPZUD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCPZUD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCQCKE', 1, 1, 'Promotion', '1993-06-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCQCKE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-06-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCQCKE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCQMAE', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCQMAE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCQMAE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SDRRMN', 1, 1, 'Promotion', '2020-01-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SDRRMN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-01-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SDRRMN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SDUPHT', 1, 1, 'Promotion', '2003-10-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SDUPHT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SDUPHT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SDYDKA', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SDYDKA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SDYDKA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SECEYG', 1, 1, 'Promotion', '1988-02-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SECEYG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1988-02-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SECEYG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SEJAYC', 1, 1, 'Promotion', '1993-11-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SEJAYC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SEJAYC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SELPDF', 1, 1, 'Promotion', '2021-06-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SELPDF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SELPDF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SFABEH', 1, 1, 'Promotion', '2021-07-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SFABEH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-07-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SFABEH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SFIAIN', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SFIAIN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SFIAIN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SFPECP', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SFPECP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SFPECP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SFWRCC', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SFWRCC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SFWRCC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGILMP', 1, 1, 'Promotion', '1992-02-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGILMP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1992-02-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGILMP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SGQEEM', 1, 1, 'Promotion', '1996-10-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SGQEEM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SGQEEM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SHUZFA', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SHUZFA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SHUZFA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SIJYSW', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SIJYSW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SIJYSW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SIUDTI', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SIUDTI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SIUDTI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SIUHGX', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SIUHGX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SIUHGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SIWFEQ', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SIWFEQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SIWFEQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SMKQCP', 1, 1, 'Promotion', '2020-07-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SMKQCP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SMKQCP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SMORYF', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SMORYF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SMORYF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SMZWJK', 1, 1, 'Promotion', '2020-07-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SMZWJK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SMZWJK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SNNFSI', 1, 1, 'Promotion', '1995-01-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SNNFSI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1995-01-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SNNFSI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SOAATK', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SOAATK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SOAATK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SOIZTR', 1, 1, 'Promotion', '2021-08-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SOIZTR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SOIZTR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SPBMEJ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SPBMEJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SPBMEJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SPRFTG', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SPRFTG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SPRFTG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SPXIJK', 1, 1, 'Promotion', '2008-11-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SPXIJK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-11-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SPXIJK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SQHULT', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SQHULT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SQHULT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SRFICY', 1, 1, 'Promotion', '2021-02-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SRFICY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SRFICY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SRPMLG', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SRPMLG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SRPMLG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SRZHZI', 1, 1, 'Promotion', '1994-02-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SRZHZI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SRZHZI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SSBXAU', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SSBXAU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SSBXAU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SSCZXW', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SSCZXW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SSCZXW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SSIWFU', 1, 1, 'Promotion', '2021-09-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SSIWFU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-09-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SSIWFU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'STGMCB', 1, 1, 'Promotion', '2018-09-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'STGMCB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-09-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'STGMCB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'STOXNA', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'STOXNA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'STOXNA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'STRTCG', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'STRTCG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'STRTCG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SUZYCM', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SUZYCM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SUZYCM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SWBUAB', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SWBUAB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SWBUAB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SWIKXR', 1, 1, 'Promotion', '2016-10-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SWIKXR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-10-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SWIKXR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SXGOUA', 1, 1, 'Promotion', '2025-03-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SXGOUA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-03-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SXGOUA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SYAITP', 1, 1, 'Promotion', '2018-06-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SYAITP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SYAITP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SYLBOJ', 1, 1, 'Promotion', '2023-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SYLBOJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SYLBOJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SYMRPA', 1, 1, 'Promotion', '2019-03-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SYMRPA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-03-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SYMRPA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBGCTR', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBGCTR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBGCTR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBSHBP', 1, 1, 'Promotion', '2019-02-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBSHBP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBSHBP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBTXBM', 1, 1, 'Promotion', '2021-07-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBTXBM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-07-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBTXBM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBXXKL', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBXXKL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBXXKL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TDQQOM', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TDQQOM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TDQQOM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TDRCGF', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TDRCGF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TDRCGF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TEWZBO', 1, 1, 'Promotion', '1993-11-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TEWZBO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TEWZBO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TFCKRC', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TFCKRC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TFCKRC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TFFXDI', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TFFXDI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TFFXDI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TFJXBB', 1, 1, 'Promotion', '2018-06-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TFJXBB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TFJXBB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TGAZEQ', 1, 1, 'Promotion', '1991-02-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TGAZEQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TGAZEQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TGDIBQ', 1, 1, 'Promotion', '2008-03-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TGDIBQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-03-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TGDIBQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TGWFXR', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TGWFXR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TGWFXR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'THCMBG', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'THCMBG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'THCMBG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'THFGZL', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'THFGZL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'THFGZL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'THFLZW', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'THFLZW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'THFLZW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TJCRNB', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TJCRNB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TJCRNB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TLBXSV', 1, 1, 'Promotion', '2021-11-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TLBXSV'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-11-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TLBXSV' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TLNXSI', 1, 1, 'Promotion', '2022-07-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TLNXSI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-07-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TLNXSI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TLSHAS', 1, 1, 'Promotion', '1993-11-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TLSHAS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TLSHAS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TMWSEW', 1, 1, 'Promotion', '2013-08-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TMWSEW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TMWSEW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TNJCXB', 1, 1, 'Promotion', '2020-07-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TNJCXB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TNJCXB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TOGHIM', 1, 1, 'Promotion', '2019-12-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TOGHIM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-12-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TOGHIM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TOOSHY', 1, 1, 'Promotion', '2010-03-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TOOSHY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-03-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TOOSHY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TOYADE', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TOYADE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TOYADE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TOYMBU', 1, 1, 'Promotion', '2020-10-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TOYMBU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TOYMBU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TQFJRM', 1, 1, 'Promotion', '2006-04-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TQFJRM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2006-04-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TQFJRM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TQJKXX', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TQJKXX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TQJKXX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TQMEUK', 1, 1, 'Promotion', '2021-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TQMEUK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TQMEUK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TQXHHJ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TQXHHJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TQXHHJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TRJRQH', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TRJRQH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TRJRQH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TRNUHB', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TRNUHB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TRNUHB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TRWUJZ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TRWUJZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TRWUJZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSDIXW', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSDIXW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSDIXW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSJHMK', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSJHMK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSJHMK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSLGBM', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSLGBM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSLGBM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSRNST', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSRNST'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSRNST' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TTGNZO', 1, 1, 'Promotion', '2021-06-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TTGNZO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TTGNZO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TTYRZW', 1, 1, 'Promotion', '2020-12-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TTYRZW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-12-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TTYRZW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TURGDF', 1, 1, 'Promotion', '2025-03-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TURGDF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-03-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TURGDF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TWLIDB', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TWLIDB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TWLIDB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TWTINT', 1, 1, 'Promotion', '2021-05-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TWTINT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-05-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TWTINT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TWUJBD', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TWUJBD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TWUJBD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TXAMUZ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TXAMUZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TXAMUZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TXKLGY', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TXKLGY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TXKLGY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TXNDQT', 1, 1, 'Promotion', '2009-06-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TXNDQT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-06-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TXNDQT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TXQLQP', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TXQLQP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TXQLQP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TXWIAW', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TXWIAW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TXWIAW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TYHNDP', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TYHNDP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TYHNDP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TYZYFW', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TYZYFW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TYZYFW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TZTKMN', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TZTKMN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TZTKMN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UACSWA', 1, 1, 'Promotion', '2021-01-12', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UACSWA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UACSWA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UAMDJK', 1, 1, 'Promotion', '2003-10-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UAMDJK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UAMDJK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBPPQW', 1, 1, 'Promotion', '2005-08-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBPPQW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-08-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBPPQW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UCMKIC', 1, 1, 'Promotion', '2021-08-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UCMKIC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UCMKIC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UCUCCZ', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UCUCCZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UCUCCZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UCYYFX', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UCYYFX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UCYYFX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UDDNZK', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UDDNZK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UDDNZK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UDLYRL', 1, 1, 'Promotion', '2014-05-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UDLYRL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UDLYRL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UDSHLG', 1, 1, 'Promotion', '2020-10-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UDSHLG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UDSHLG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UEAFHF', 1, 1, 'Promotion', '2020-11-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UEAFHF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-11-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UEAFHF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UEBSUP', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UEBSUP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UEBSUP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UFJRFN', 1, 1, 'Promotion', '2003-10-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UFJRFN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UFJRFN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UFNDKM', 1, 1, 'Promotion', '2023-06-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UFNDKM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-06-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UFNDKM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UHBPWR', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UHBPWR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UHBPWR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UHGNCW', 1, 1, 'Promotion', '2009-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UHGNCW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UHGNCW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UJQLSU', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UJQLSU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UJQLSU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UKDYQO', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UKDYQO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UKDYQO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UKIUPN', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UKIUPN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UKIUPN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UKOSAI', 1, 1, 'Promotion', '2025-06-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UKOSAI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UKOSAI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULAPBD', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULAPBD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULAPBD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULAUOX', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULAUOX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULAUOX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULFGOL', 1, 1, 'Promotion', '2025-07-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULFGOL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-07-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULFGOL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULORCO', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULORCO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULORCO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UMMSGD', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UMMSGD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UMMSGD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UMYKWE', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UMYKWE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UMYKWE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UNDIOS', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UNDIOS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UNDIOS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UPEJGU', 1, 1, 'Promotion', '2017-08-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UPEJGU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UPEJGU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UPKMEF', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UPKMEF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UPKMEF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UPNOJK', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UPNOJK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UPNOJK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UQXELY', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UQXELY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UQXELY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'URBQJI', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'URBQJI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'URBQJI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'URLREP', 1, 1, 'Promotion', '2021-03-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'URLREP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'URLREP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'URXTGZ', 1, 1, 'Promotion', '2000-12-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'URXTGZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'URXTGZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'USGZFB', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'USGZFB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'USGZFB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'USKXIP', 1, 1, 'Promotion', '2021-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'USKXIP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'USKXIP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UTBBJO', 1, 1, 'Promotion', '2018-04-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UTBBJO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UTBBJO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UTPIFH', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UTPIFH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UTPIFH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UUDRKP', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UUDRKP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UUDRKP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UUHWAX', 1, 1, 'Promotion', '2016-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UUHWAX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UUHWAX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWCWXS', 1, 1, 'Promotion', '1997-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWCWXS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWCWXS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWFTLM', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWFTLM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWFTLM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWLCTP', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWLCTP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWLCTP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWTZHB', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWTZHB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWTZHB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UXQUBF', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UXQUBF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UXQUBF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UXTHZR', 1, 1, 'Promotion', '2026-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UXTHZR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UXTHZR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UYEOTA', 1, 1, 'Promotion', '2014-07-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UYEOTA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UYEOTA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UZEBYP', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UZEBYP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UZEBYP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UZYOQA', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UZYOQA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UZYOQA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'VRCESM', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'VRCESM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'VRCESM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'VZDCIK', 1, 1, 'Promotion', '2021-01-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'VZDCIK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'VZDCIK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBCODY', 1, 1, 'Promotion', '2018-03-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBCODY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBCODY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBECQH', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBECQH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBECQH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBTEZH', 1, 1, 'Promotion', '2006-06-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBTEZH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2006-06-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBTEZH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCCLNJ', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCCLNJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCCLNJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCCQMR', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCCQMR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCCQMR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCFZPJ', 1, 1, 'Promotion', '1988-05-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCFZPJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1988-05-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCFZPJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCKZYH', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCKZYH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCKZYH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCLHQU', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCLHQU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCLHQU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCNJYP', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCNJYP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCNJYP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCRATO', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCRATO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCRATO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WEMJNX', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WEMJNX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WEMJNX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WERCPZ', 1, 1, 'Promotion', '2019-06-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WERCPZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-06-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WERCPZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WGRONY', 1, 1, 'Promotion', '2019-08-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WGRONY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-08-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WGRONY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WGZLBC', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WGZLBC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WGZLBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WHXNWC', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WHXNWC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WHXNWC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIGCSB', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIGCSB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIGCSB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIJBTH', 1, 1, 'Promotion', '2014-05-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIJBTH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIJBTH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIWIYJ', 1, 1, 'Promotion', '1991-08-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIWIYJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-08-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIWIYJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIXCCG', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIXCCG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIXCCG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WJBXOB', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WJBXOB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WJBXOB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WLJHBQ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WLJHBQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WLJHBQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WMKTVE', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WMKTVE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WMKTVE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WMQBPB', 1, 1, 'Promotion', '2021-12-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WMQBPB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WMQBPB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WMYZLP', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WMYZLP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WMYZLP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WNMUHI', 1, 1, 'Promotion', '2019-10-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WNMUHI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-10-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WNMUHI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WNSJPM', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WNSJPM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WNSJPM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WNTYFQ', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WNTYFQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WNTYFQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WNWPNP', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WNWPNP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WNWPNP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WNZJUH', 1, 1, 'Promotion', '2019-11-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WNZJUH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-11-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WNZJUH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WOBIBC', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WOBIBC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WOBIBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WPAGZO', 1, 1, 'Promotion', '2021-01-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WPAGZO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WPAGZO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WPOSWA', 1, 1, 'Promotion', '2018-12-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WPOSWA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WPOSWA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WPYREX', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WPYREX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WPYREX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WQJDZF', 1, 1, 'Promotion', '2001-08-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WQJDZF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WQJDZF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WRKWER', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WRKWER'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WRKWER' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WRRNRT', 1, 1, 'Promotion', '1996-10-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WRRNRT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WRRNRT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSCLUI', 1, 1, 'Promotion', '1994-02-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSCLUI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSCLUI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSCSOL', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSCSOL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSCSOL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSIFHP', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSIFHP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSIFHP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WTALGR', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WTALGR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WTALGR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WTQLPI', 1, 1, 'Promotion', '2018-06-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WTQLPI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WTQLPI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WTUZMG', 1, 1, 'Promotion', '2014-05-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WTUZMG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WTUZMG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WUAPYW', 1, 1, 'Promotion', '2007-10-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WUAPYW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2007-10-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WUAPYW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WUECOI', 1, 1, 'Promotion', '1994-05-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WUECOI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-05-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WUECOI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WUTMML', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WUTMML'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WUTMML' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WWXZEZ', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WWXZEZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WWXZEZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WXAEZI', 1, 1, 'Promotion', '2025-07-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WXAEZI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-07-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WXAEZI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WXQIGD', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WXQIGD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WXQIGD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WYKHAH', 1, 1, 'Promotion', '1993-04-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WYKHAH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-04-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WYKHAH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WZQLQO', 1, 1, 'Promotion', '1994-05-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WZQLQO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-05-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WZQLQO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XAFFDC', 1, 1, 'Promotion', '1991-10-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XAFFDC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-10-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XAFFDC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XAIOHH', 1, 1, 'Promotion', '1993-07-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XAIOHH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XAIOHH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XATWGA', 1, 1, 'Promotion', '2016-12-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XATWGA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XATWGA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XBJRCR', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XBJRCR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XBJRCR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCABAN', 1, 1, 'Promotion', '1996-10-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCABAN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCABAN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCBOMD', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCBOMD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCBOMD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCCRJJ', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCCRJJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCCRJJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XCWMLY', 1, 1, 'Promotion', '2017-05-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XCWMLY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XCWMLY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XDEIGK', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XDEIGK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XDEIGK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XDLGSA', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XDLGSA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XDLGSA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XDNSJY', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XDNSJY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XDNSJY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XDXRPO', 1, 1, 'Promotion', '2020-07-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XDXRPO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-07-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XDXRPO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XFCAUB', 1, 1, 'Promotion', '2020-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XFCAUB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XFCAUB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XFQQQK', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XFQQQK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XFQQQK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XFSMQW', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XFSMQW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XFSMQW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XFZPYJ', 1, 1, 'Promotion', '2009-12-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XFZPYJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-12-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XFZPYJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XGECRN', 1, 1, 'Promotion', '2021-12-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XGECRN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XGECRN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XGGACE', 1, 1, 'Promotion', '1996-10-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XGGACE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-10-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XGGACE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XGHIJF', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XGHIJF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XGHIJF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XGOWRN', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XGOWRN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XGOWRN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XGPTZF', 1, 1, 'Promotion', '2021-04-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XGPTZF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XGPTZF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XHMYAB', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XHMYAB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XHMYAB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XHNQAN', 1, 1, 'Promotion', '2018-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XHNQAN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XHNQAN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XHUIPA', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XHUIPA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XHUIPA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XIIJHZ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XIIJHZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XIIJHZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XIMASJ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XIMASJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XIMASJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XIXEKJ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XIXEKJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XIXEKJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XJEHOA', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XJEHOA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XJEHOA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XJQUHB', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XJQUHB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XJQUHB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XJRZFN', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XJRZFN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XJRZFN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XKKJPY', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XKKJPY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XKKJPY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XKSEKW', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XKSEKW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XKSEKW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XLAEYO', 1, 1, 'Promotion', '1991-02-22', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XLAEYO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XLAEYO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XLJKJR', 1, 1, 'Promotion', '2019-08-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XLJKJR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XLJKJR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XLQBXH', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XLQBXH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XLQBXH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XMMAQL', 1, 1, 'Promotion', '1993-11-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XMMAQL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XMMAQL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XMRHAA', 1, 1, 'Promotion', '2024-02-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XMRHAA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2024-02-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XMRHAA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNSWRD', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNSWRD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNSWRD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNTPSN', 1, 1, 'Promotion', '1994-02-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNTPSN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNTPSN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XOKLDA', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XOKLDA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XOKLDA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XOXAZG', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XOXAZG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XOXAZG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPKNSF', 1, 1, 'Promotion', '2010-12-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPKNSF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPKNSF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPMBNO', 1, 1, 'Promotion', '1990-09-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPMBNO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1990-09-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPMBNO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XQDHKS', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XQDHKS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XQDHKS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XQHWRZ', 1, 1, 'Promotion', '2003-10-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XQHWRZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XQHWRZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XQQUAH', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XQQUAH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XQQUAH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XRDBLG', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XRDBLG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XRDBLG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XSFNMR', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XSFNMR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XSFNMR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XSPKFY', 1, 1, 'Promotion', '2023-05-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XSPKFY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-05-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XSPKFY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XTIYNT', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XTIYNT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XTIYNT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XTQIKX', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XTQIKX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XTQIKX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XTZLLM', 1, 1, 'Promotion', '2018-08-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XTZLLM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-08-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XTZLLM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XUKTIY', 1, 1, 'Promotion', '2006-04-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XUKTIY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2006-04-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XUKTIY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XUYCSI', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XUYCSI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XUYCSI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XWRETA', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XWRETA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XWRETA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XWRZPU', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XWRZPU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XWRZPU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XWWMHR', 1, 1, 'Promotion', '2017-12-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XWWMHR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XWWMHR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XWXSDE', 1, 1, 'Promotion', '2014-07-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XWXSDE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XWXSDE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XXJTSO', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XXJTSO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XXJTSO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XXOWSJ', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XXOWSJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XXOWSJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XXQNGX', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XXQNGX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XXQNGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XXYDHF', 1, 1, 'Promotion', '2021-04-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XXYDHF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XXYDHF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XYFQYX', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XYFQYX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XYFQYX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XYQRXD', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XYQRXD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XYQRXD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XYRNBS', 1, 1, 'Promotion', '2023-12-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XYRNBS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-12-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XYRNBS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XZBJWD', 1, 1, 'Promotion', '2022-07-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XZBJWD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-07-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XZBJWD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XZKFNG', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XZKFNG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XZKFNG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XZYZTR', 1, 1, 'Promotion', '2014-01-04', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XZYZTR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-01-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XZYZTR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YALGCY', 1, 1, 'Promotion', '2023-01-02', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YALGCY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2023-01-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YALGCY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YAQMJM', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YAQMJM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YAQMJM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YBGZFL', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YBGZFL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YBGZFL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YBYJFP', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YBYJFP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YBYJFP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YBZZAZ', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YBZZAZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YBZZAZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCWGIK', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCWGIK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCWGIK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YDQYGT', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YDQYGT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YDQYGT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YDWMFX', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YDWMFX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YDWMFX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YDWNLJ', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YDWNLJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YDWNLJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YEAYMP', 1, 1, 'Promotion', '1991-02-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YEAYMP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YEAYMP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YEGSRW', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YEGSRW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YEGSRW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YENEYI', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YENEYI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YENEYI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YHUFNX', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YHUFNX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YHUFNX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJBMHE', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJBMHE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJBMHE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJPMKW', 1, 1, 'Promotion', '2014-05-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJPMKW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJPMKW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJUIYC', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJUIYC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJUIYC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJZGFL', 1, 1, 'Promotion', '1994-02-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJZGFL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJZGFL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YKEURY', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YKEURY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YKEURY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YKKRJA', 1, 1, 'Promotion', '1991-07-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YKKRJA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-07-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YKKRJA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YLKJMQ', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YLKJMQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YLKJMQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YLLJBJ', 1, 1, 'Promotion', '1993-07-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YLLJBJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YLLJBJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YLTTFY', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YLTTFY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YLTTFY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YMGKJK', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YMGKJK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YMGKJK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YMGZIO', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YMGZIO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YMGZIO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YMPMBP', 1, 1, 'Promotion', '2019-04-17', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YMPMBP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-04-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YMPMBP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YNHJZL', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YNHJZL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YNHJZL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YNTQCQ', 1, 1, 'Promotion', '2013-11-01', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YNTQCQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-11-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YNTQCQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YOKRSN', 1, 1, 'Promotion', '2021-04-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YOKRSN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YOKRSN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YOWELD', 1, 1, 'Promotion', '1990-09-14', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YOWELD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1990-09-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YOWELD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YPKICB', 1, 1, 'Promotion', '1992-01-31', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YPKICB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1992-01-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YPKICB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQMDAF', 1, 1, 'Promotion', '1991-02-06', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQMDAF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-02-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQMDAF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQNPCM', 1, 1, 'Promotion', '2018-06-20', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQNPCM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQNPCM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQTOJY', 1, 1, 'Promotion', '2014-07-11', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQTOJY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQTOJY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQZLAE', 1, 1, 'Promotion', '1997-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQZLAE'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQZLAE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YROEXR', 1, 1, 'Promotion', '2026-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YROEXR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YROEXR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRWKAG', 1, 1, 'Promotion', '1990-06-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRWKAG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1990-06-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRWKAG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRWNBT', 1, 1, 'Promotion', '2018-12-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRWNBT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRWNBT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRXWPR', 1, 1, 'Promotion', '2019-02-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRXWPR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRXWPR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YTBTEY', 1, 1, 'Promotion', '2016-12-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YTBTEY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YTBTEY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YTLJJZ', 1, 1, 'Promotion', '2018-03-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YTLJJZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YTLJJZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YTXQOZ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YTXQOZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YTXQOZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YUEYKP', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YUEYKP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YUEYKP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YUSKIP', 1, 1, 'Promotion', '2020-10-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YUSKIP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YUSKIP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YWEAAM', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YWEAAM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YWEAAM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YWEMKY', 1, 1, 'Promotion', '2021-04-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YWEMKY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-04-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YWEMKY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YWSMDS', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YWSMDS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YWSMDS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXCYEL', 1, 1, 'Promotion', '2018-06-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXCYEL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-06-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXCYEL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXSFRW', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXSFRW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXSFRW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXWDTI', 1, 1, 'Promotion', '1994-02-21', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXWDTI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-02-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXWDTI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYERDT', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYERDT'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYERDT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYHOXB', 1, 1, 'Promotion', '2018-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYHOXB'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYHOXB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYKDDZ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYKDDZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYKDDZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYOQLJ', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYOQLJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYOQLJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYYHIR', 1, 1, 'Promotion', '2018-11-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYYHIR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-11-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYYHIR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYZCCG', 1, 1, 'Promotion', '2019-12-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYZCCG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-12-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYZCCG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YZFOHC', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YZFOHC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YZFOHC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YZLIQX', 1, 1, 'Promotion', '2021-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YZLIQX'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YZLIQX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YZNZEA', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YZNZEA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YZNZEA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZAEFYC', 1, 1, 'Promotion', '1997-02-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZAEFYC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZAEFYC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZAXKIF', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZAXKIF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZAXKIF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZBMEAY', 1, 1, 'Promotion', '1993-07-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZBMEAY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-07-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZBMEAY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZBQTDL', 1, 1, 'Promotion', '2021-12-08', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZBQTDL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZBQTDL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZCCWHD', 1, 1, 'Promotion', '2018-12-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZCCWHD'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZCCWHD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZCEZDK', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZCEZDK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZCEZDK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZCQIMA', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZCQIMA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZCQIMA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZCWXCI', 1, 1, 'Promotion', '2009-05-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZCWXCI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZCWXCI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZDSGNS', 1, 1, 'Promotion', '2017-07-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZDSGNS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-07-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZDSGNS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZEGRUG', 1, 1, 'Promotion', '2018-12-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZEGRUG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZEGRUG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZEKYUL', 1, 1, 'Promotion', '2021-10-05', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZEKYUL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-10-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZEKYUL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZETSGM', 1, 1, 'Promotion', '2019-07-25', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZETSGM'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-07-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZETSGM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFDNPG', 1, 1, 'Promotion', '2017-06-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFDNPG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFDNPG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFEGDI', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFEGDI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFEGDI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFEZND', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFEZND'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFEZND' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZGSYFP', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZGSYFP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZGSYFP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZHJNYQ', 1, 1, 'Promotion', '2009-07-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZHJNYQ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZHJNYQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZIJXLR', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZIJXLR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZIJXLR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZJBEEI', 1, 1, 'Promotion', '2021-06-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZJBEEI'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZJBEEI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZKFWOH', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZKFWOH'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZKFWOH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZNBREP', 1, 1, 'Promotion', '1996-12-23', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZNBREP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-12-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZNBREP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZNBWTR', 1, 1, 'Promotion', '2020-01-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZNBWTR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-01-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZNBWTR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZNCEPO', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZNCEPO'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZNCEPO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZOWDBZ', 1, 1, 'Promotion', '1992-01-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZOWDBZ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1992-01-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZOWDBZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZPFGZU', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZPFGZU'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZPFGZU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZPREOY', 1, 1, 'Promotion', '2019-05-03', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZPREOY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZPREOY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZQDVRL', 1, 1, 'Promotion', '1991-07-15', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZQDVRL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1991-07-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZQDVRL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZQJWYF', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZQJWYF'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZQJWYF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZSWFWG', 1, 1, 'Promotion', '2022-01-28', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZSWFWG'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZSWFWG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZTJTSJ', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZTJTSJ'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZTJTSJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZTLRJR', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZTLRJR'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZTLRJR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZTPURS', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZTPURS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZTPURS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZUFGWP', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZUFGWP'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZUFGWP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZUTWSY', 1, 1, 'Promotion', '2021-02-13', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZUTWSY'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-02-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZUTWSY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWQKXK', 1, 1, 'Promotion', '1993-11-24', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWQKXK'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWQKXK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWTWFL', 1, 1, 'Promotion', '2020-10-07', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWTWFL'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2020-10-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWTWFL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXASAW', 1, 1, 'Promotion', '1993-11-19', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXASAW'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-11-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXASAW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXIFKS', 1, 1, 'Promotion', '2021-12-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXIFKS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXIFKS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXPPNS', 1, 1, 'Promotion', '2021-06-30', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXPPNS'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-06-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXPPNS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZYGQKC', 1, 1, 'Promotion', '2021-12-27', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZYGQKC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-12-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZYGQKC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZYHYZA', 1, 1, 'Promotion', '2022-08-18', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZYHYZA'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2022-08-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZYHYZA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZYOGYC', 1, 1, 'Promotion', '2021-03-09', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZYOGYC'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-03-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZYOGYC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZZPSGN', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (CSMT full-data sheet)', 'csmt_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZZPSGN'
  AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZZPSGN' AND p.to_designation_id = 1);
SELECT COUNT(*) AS alp_posting_inserted FROM div_promotion_history WHERE created_by = 'csmt_full_data_2026-10-07' AND to_designation_id = 1;
