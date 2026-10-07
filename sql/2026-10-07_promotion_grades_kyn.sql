-- LP Shunter(3) and LPG(5) posting dates from the KYN lobby sheets, 2026-10-07. from: LPS<-ALP(1), LPG<-LPS(3).
-- Only where no row exists for that grade on this DB and the date is not before date_of_appointment.
-- created_by = kyn_full_data_2026-10-07; Undo: 2026-10-07_promotion_grades_kyn_UNDO.sql
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAEXOX', 1, 3, 'Promotion', '2021-11-18', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAEXOX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAEXOX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAGHKH', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAGHKH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAGHKH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ABGPRB', 1, 3, 'Promotion', '2018-07-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ABGPRB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-07-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ABGPRB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AEBLAD', 1, 3, 'Promotion', '2022-02-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AEBLAD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AEBLAD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AEQTIJ', 1, 3, 'Promotion', '2007-11-24', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AEQTIJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2007-11-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AEQTIJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFRXZR', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFRXZR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFRXZR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AGQKUX', 1, 3, 'Promotion', '2011-08-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AGQKUX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-08-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AGQKUX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AIBRNH', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AIBRNH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AIBRNH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ALJFEX', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ALJFEX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ALJFEX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AMMWSR', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AMMWSR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AMMWSR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AOXWGD', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AOXWGD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AOXWGD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'APHICS', 1, 3, 'Promotion', '2011-04-15', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'APHICS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'APHICS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AROMIL', 1, 3, 'Promotion', '2011-06-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AROMIL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AROMIL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATACWQ', 1, 3, 'Promotion', '2020-09-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATACWQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATACWQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATSAUG', 1, 3, 'Promotion', '2018-08-15', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATSAUG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATSAUG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AWPEMD', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AWPEMD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AWPEMD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AXINWK', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AXINWK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AXINWK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BAFKQW', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BAFKQW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BAFKQW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOJYRN', 1, 3, 'Promotion', '2018-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOJYRN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOJYRN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BQRTKT', 1, 3, 'Promotion', '2010-08-29', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BQRTKT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-08-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BQRTKT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BULCFP', 1, 3, 'Promotion', '2020-03-04', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BULCFP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BULCFP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BWIOQU', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BWIOQU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BWIOQU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BWNQHN', 1, 3, 'Promotion', '2011-04-18', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BWNQHN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BWNQHN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZMIAS', 1, 3, 'Promotion', '2011-04-15', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZMIAS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZMIAS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CBRQQE', 1, 3, 'Promotion', '2022-07-26', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CBRQQE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-07-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CBRQQE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CDAUOK', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CDAUOK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CDAUOK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CDZBIF', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CDZBIF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CDZBIF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CITMPI', 1, 3, 'Promotion', '2015-03-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CITMPI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-03-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CITMPI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CMHPWZ', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CMHPWZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CMHPWZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'COUYUR', 1, 3, 'Promotion', '2011-08-30', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'COUYUR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-08-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'COUYUR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQEJGA', 1, 3, 'Promotion', '2018-09-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQEJGA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQEJGA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQQAQG', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQQAQG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQQAQG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CSGCGJ', 1, 3, 'Promotion', '2017-11-14', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CSGCGJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-11-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CSGCGJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CSXIYO', 1, 3, 'Promotion', '2019-05-14', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CSXIYO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-05-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CSXIYO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DDAXKY', 1, 3, 'Promotion', '2011-04-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DDAXKY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DDAXKY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGCPMN', 1, 3, 'Promotion', '2022-09-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGCPMN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-09-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGCPMN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGKSAJ', 1, 3, 'Promotion', '2018-08-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGKSAJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGKSAJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGPTBY', 1, 3, 'Promotion', '2022-01-13', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGPTBY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-01-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGPTBY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DHPHPE', 1, 3, 'Promotion', '2019-08-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DHPHPE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-08-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DHPHPE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJQRIB', 1, 3, 'Promotion', '2022-02-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJQRIB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJQRIB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DMUODO', 1, 3, 'Promotion', '2017-11-30', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DMUODO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-11-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DMUODO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPJXOQ', 1, 3, 'Promotion', '2010-08-07', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPJXOQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-08-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPJXOQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DQYHJD', 1, 3, 'Promotion', '2011-04-15', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DQYHJD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DQYHJD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWUMGR', 1, 3, 'Promotion', '2022-02-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWUMGR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWUMGR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DYCYGM', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DYCYGM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DYCYGM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DYWQLO', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DYWQLO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DYWQLO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZPFNI', 1, 3, 'Promotion', '2001-09-28', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZPFNI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2001-09-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZPFNI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EDIHKI', 1, 3, 'Promotion', '2014-01-20', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EDIHKI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-01-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EDIHKI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EJEGDC', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EJEGDC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EJEGDC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EJUYMX', 1, 3, 'Promotion', '2025-12-18', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EJUYMX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EJUYMX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ENPLLP', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ENPLLP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ENPLLP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ERLNMR', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ERLNMR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ERLNMR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EUSGGL', 1, 3, 'Promotion', '2018-09-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EUSGGL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EUSGGL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EXEKQU', 1, 3, 'Promotion', '2011-03-14', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EXEKQU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-03-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EXEKQU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EYIAGD', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EYIAGD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EYIAGD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EYIMCW', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EYIMCW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EYIMCW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EZJZGM', 1, 3, 'Promotion', '2018-07-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EZJZGM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-07-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EZJZGM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FBFGLL', 1, 3, 'Promotion', '2018-07-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FBFGLL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-07-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FBFGLL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGLEJQ', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGLEJQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGLEJQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FOERJD', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FOERJD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FOERJD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FORZNP', 1, 3, 'Promotion', '2018-08-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FORZNP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FORZNP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FPMKAA', 1, 3, 'Promotion', '2018-06-29', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FPMKAA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-06-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FPMKAA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FQDZTP', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FQDZTP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FQDZTP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FRQLAN', 1, 3, 'Promotion', '2015-05-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FRQLAN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-05-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FRQLAN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GAMPUS', 1, 3, 'Promotion', '2018-10-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GAMPUS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GAMPUS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GGGILT', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GGGILT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GGGILT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJOZCS', 1, 3, 'Promotion', '2018-08-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJOZCS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJOZCS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJUEKX', 1, 3, 'Promotion', '2018-04-04', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJUEKX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-04-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJUEKX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GNHTAK', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GNHTAK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GNHTAK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXKPYY', 1, 3, 'Promotion', '2018-08-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXKPYY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXKPYY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HEKAQU', 1, 3, 'Promotion', '2010-04-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HEKAQU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-04-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HEKAQU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HFRKKF', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HFRKKF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HFRKKF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HHYUUN', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HHYUUN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HHYUUN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJMRHY', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJMRHY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJMRHY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HKCCST', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HKCCST'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HKCCST' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HKORQX', 1, 3, 'Promotion', '2011-04-18', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HKORQX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HKORQX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HPFFTJ', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HPFFTJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HPFFTJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HQBQSH', 1, 3, 'Promotion', '2018-10-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HQBQSH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HQBQSH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HQFMBQ', 1, 3, 'Promotion', '2016-08-31', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HQFMBQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2016-08-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HQFMBQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HRFMDJ', 1, 3, 'Promotion', '2019-09-06', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HRFMDJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-09-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HRFMDJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HRPEIS', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HRPEIS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HRPEIS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWFHQR', 1, 3, 'Promotion', '2011-04-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWFHQR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWFHQR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWPWMC', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWPWMC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWPWMC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWWMNF', 1, 3, 'Promotion', '2011-08-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWWMNF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-08-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWWMNF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXHPIO', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXHPIO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXHPIO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYEEAI', 1, 3, 'Promotion', '2021-01-14', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYEEAI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-01-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYEEAI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IDYYSA', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IDYYSA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IDYYSA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IFSYPH', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IFSYPH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IFSYPH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IGMTAD', 1, 3, 'Promotion', '2016-08-18', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IGMTAD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2016-08-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IGMTAD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IGZSIE', 1, 3, 'Promotion', '2021-01-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IGZSIE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-01-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IGZSIE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIQYRG', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIQYRG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIQYRG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIXOQY', 1, 3, 'Promotion', '2022-02-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIXOQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIXOQY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMQWXI', 1, 3, 'Promotion', '2011-04-18', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMQWXI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMQWXI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INTWLG', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INTWLG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INTWLG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUCPGN', 1, 3, 'Promotion', '2011-06-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUCPGN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUCPGN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IXEIPZ', 1, 3, 'Promotion', '2019-05-14', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IXEIPZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-05-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IXEIPZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IZQSQT', 1, 3, 'Promotion', '2022-08-25', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IZQSQT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-08-25')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IZQSQT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDBLGB', 1, 3, 'Promotion', '2020-09-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDBLGB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDBLGB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JGDJZY', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JGDJZY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JGDJZY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHWQOD', 1, 3, 'Promotion', '2011-02-28', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHWQOD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-02-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHWQOD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JKEBRR', 1, 3, 'Promotion', '2017-12-05', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JKEBRR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JKEBRR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JKKIPY', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JKKIPY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JKKIPY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JKOBSX', 1, 3, 'Promotion', '2021-08-13', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JKOBSX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JKOBSX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMEFOI', 1, 3, 'Promotion', '2022-02-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMEFOI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMEFOI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JNZECH', 1, 3, 'Promotion', '2018-08-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JNZECH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JNZECH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JPRJFP', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JPRJFP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JPRJFP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JRLMAF', 1, 3, 'Promotion', '2018-10-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JRLMAF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JRLMAF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JTIBIY', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JTIBIY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JTIBIY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JYACHE', 1, 3, 'Promotion', '2020-09-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JYACHE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JYACHE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KBTCXM', 1, 3, 'Promotion', '2011-06-13', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KBTCXM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KBTCXM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KCMJSQ', 1, 3, 'Promotion', '2011-03-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KCMJSQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-03-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KCMJSQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDCSBC', 1, 3, 'Promotion', '2011-11-27', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDCSBC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-11-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDCSBC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KEPOLP', 1, 3, 'Promotion', '2018-07-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KEPOLP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-07-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KEPOLP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KETUBG', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KETUBG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KETUBG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KGNBHX', 1, 3, 'Promotion', '2018-07-14', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KGNBHX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-07-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KGNBHX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHKOMF', 1, 3, 'Promotion', '2023-05-26', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHKOMF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2023-05-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHKOMF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKXFYC', 1, 3, 'Promotion', '2022-07-26', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKXFYC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-07-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKXFYC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KNGKFB', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KNGKFB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KNGKFB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KUPERX', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KUPERX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KUPERX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KUTUSW', 1, 3, 'Promotion', '2019-08-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KUTUSW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-08-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KUTUSW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWEMFN', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWEMFN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWEMFN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWWSYR', 1, 3, 'Promotion', '2019-05-14', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWWSYR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-05-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWWSYR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KYOPQB', 1, 3, 'Promotion', '2020-09-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KYOPQB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KYOPQB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LALTDI', 1, 3, 'Promotion', '2021-11-24', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LALTDI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LALTDI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LDIZBF', 1, 3, 'Promotion', '2011-04-15', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LDIZBF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LDIZBF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LEHEDC', 1, 3, 'Promotion', '2017-11-30', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LEHEDC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-11-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LEHEDC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LGGOQI', 1, 3, 'Promotion', '2011-04-18', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LGGOQI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LGGOQI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LGJZRR', 1, 3, 'Promotion', '2011-04-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LGJZRR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LGJZRR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHIKAU', 1, 3, 'Promotion', '2018-08-07', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHIKAU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHIKAU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LJJCJS', 1, 3, 'Promotion', '2018-08-04', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LJJCJS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LJJCJS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LKCFIW', 1, 3, 'Promotion', '2018-09-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LKCFIW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LKCFIW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLAKNX', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLAKNX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLAKNX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLFPKO', 1, 3, 'Promotion', '2021-09-24', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLFPKO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLFPKO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLWDQR', 1, 3, 'Promotion', '2018-09-05', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLWDQR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLWDQR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LQYHMU', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LQYHMU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LQYHMU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LRYEUC', 1, 3, 'Promotion', '2011-08-24', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LRYEUC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-08-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LRYEUC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LSJWGW', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LSJWGW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LSJWGW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYCCWR', 1, 3, 'Promotion', '2011-04-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYCCWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYCCWR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYFEMW', 1, 3, 'Promotion', '2019-08-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYFEMW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-08-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYFEMW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYQAYO', 1, 3, 'Promotion', '2018-09-19', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYQAYO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYQAYO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MDZBLJ', 1, 3, 'Promotion', '2022-02-14', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MDZBLJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-14')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MDZBLJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MEPECJ', 1, 3, 'Promotion', '2020-03-04', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MEPECJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MEPECJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MJNSZR', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MJNSZR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MJNSZR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MJWMQF', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MJWMQF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MJWMQF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKLNRS', 1, 3, 'Promotion', '2011-04-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKLNRS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKLNRS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKMWSS', 1, 3, 'Promotion', '2011-06-13', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKMWSS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKMWSS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMQQIK', 1, 3, 'Promotion', '2025-08-20', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMQQIK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-08-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMQQIK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MOCEEI', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MOCEEI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MOCEEI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MPIUCF', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MPIUCF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MPIUCF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTNGNH', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTNGNH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTNGNH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MYENFW', 1, 3, 'Promotion', '2011-08-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MYENFW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-08-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MYENFW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZUXKX', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZUXKX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZUXKX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NAXAKI', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NAXAKI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NAXAKI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDBLHU', 1, 3, 'Promotion', '2010-04-29', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDBLHU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-04-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDBLHU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDWQPS', 1, 3, 'Promotion', '2018-09-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDWQPS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDWQPS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NFFFOB', 1, 3, 'Promotion', '2011-04-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NFFFOB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NFFFOB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NFQJDE', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NFQJDE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NFQJDE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NHOMKK', 1, 3, 'Promotion', '2014-11-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NHOMKK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-11-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NHOMKK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NHORYS', 1, 3, 'Promotion', '2018-09-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NHORYS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NHORYS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NHTDAA', 1, 3, 'Promotion', '2020-09-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NHTDAA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NHTDAA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJAGQB', 1, 3, 'Promotion', '2020-03-04', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJAGQB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJAGQB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NMCWXZ', 1, 3, 'Promotion', '2018-09-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NMCWXZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NMCWXZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NMFLUC', 1, 3, 'Promotion', '2019-07-06', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NMFLUC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-07-06')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NMFLUC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NQGDKM', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NQGDKM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NQGDKM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXEADY', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXEADY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXEADY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OBTJJB', 1, 3, 'Promotion', '2018-09-05', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OBTJJB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OBTJJB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OETXKA', 1, 3, 'Promotion', '2021-09-24', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OETXKA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-09-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OETXKA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OGYELP', 1, 3, 'Promotion', '2018-08-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OGYELP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OGYELP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OLAPQS', 1, 3, 'Promotion', '2015-04-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OLAPQS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-04-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OLAPQS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OOKEAY', 1, 3, 'Promotion', '2018-08-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OOKEAY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OOKEAY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OTWRUF', 1, 3, 'Promotion', '2005-07-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OTWRUF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2005-07-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OTWRUF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWTDPH', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWTDPH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWTDPH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWWNXK', 1, 3, 'Promotion', '2010-08-28', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWWNXK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-08-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWWNXK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OZATHA', 1, 3, 'Promotion', '2021-11-24', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OZATHA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OZATHA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAAHFJ', 1, 3, 'Promotion', '2011-06-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAAHFJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAAHFJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAOHDQ', 1, 3, 'Promotion', '2010-10-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAOHDQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-10-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAOHDQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBAUNQ', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBAUNQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBAUNQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PEYZYN', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PEYZYN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PEYZYN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PFODKO', 1, 3, 'Promotion', '2021-02-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PFODKO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PFODKO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PGGLJN', 1, 3, 'Promotion', '2010-04-24', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PGGLJN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-04-24')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PGGLJN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PHQPQY', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PHQPQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PHQPQY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PMQHOW', 1, 3, 'Promotion', '2022-07-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PMQHOW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-07-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PMQHOW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PQJCSC', 1, 3, 'Promotion', '2016-08-31', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PQJCSC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2016-08-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PQJCSC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PQSEDM', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PQSEDM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PQSEDM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PSBAQY', 1, 3, 'Promotion', '2022-01-30', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PSBAQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-01-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PSBAQY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PSRIIP', 1, 3, 'Promotion', '2021-07-28', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PSRIIP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-07-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PSRIIP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PUWYQE', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PUWYQE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PUWYQE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QAPIBF', 1, 3, 'Promotion', '2014-11-15', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QAPIBF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QAPIBF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBFJDI', 1, 3, 'Promotion', '2011-06-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBFJDI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBFJDI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QENBMY', 1, 3, 'Promotion', '2017-12-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QENBMY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QENBMY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGPPQM', 1, 3, 'Promotion', '2025-12-26', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGPPQM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGPPQM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QKXBDN', 1, 3, 'Promotion', '2011-04-05', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QKXBDN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QKXBDN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QMFOKJ', 1, 3, 'Promotion', '2018-10-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QMFOKJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QMFOKJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QNKYDZ', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QNKYDZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QNKYDZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QOODWM', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QOODWM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QOODWM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QQUQLH', 1, 3, 'Promotion', '2022-02-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QQUQLH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QQUQLH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QQYUBR', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QQYUBR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QQYUBR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QXINLH', 1, 3, 'Promotion', '2018-06-29', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QXINLH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-06-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QXINLH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QYNDCQ', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QYNDCQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QYNDCQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBHZUS', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBHZUS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBHZUS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RCTGBC', 1, 3, 'Promotion', '2018-08-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RCTGBC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RCTGBC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RDCCPC', 1, 3, 'Promotion', '2018-08-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RDCCPC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RDCCPC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RIBNQS', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RIBNQS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RIBNQS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RIIUQF', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RIIUQF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RIIUQF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RLCPHJ', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RLCPHJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RLCPHJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RPUFPR', 1, 3, 'Promotion', '2014-08-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RPUFPR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-08-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RPUFPR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RQKPBK', 1, 3, 'Promotion', '2020-09-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RQKPBK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RQKPBK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RSFMDF', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RSFMDF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RSFMDF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RTBSSU', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RTBSSU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RTBSSU' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RUDRDN', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RUDRDN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RUDRDN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RXIAGJ', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RXIAGJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RXIAGJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RXLNCS', 1, 3, 'Promotion', '2018-08-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RXLNCS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RXLNCS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCUHYT', 1, 3, 'Promotion', '2020-09-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCUHYT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCUHYT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SFTFUQ', 1, 3, 'Promotion', '2018-08-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SFTFUQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SFTFUQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SHGWCN', 1, 3, 'Promotion', '2018-08-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SHGWCN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SHGWCN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SKHRBZ', 1, 3, 'Promotion', '2018-06-29', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SKHRBZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-06-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SKHRBZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SLMFQY', 1, 3, 'Promotion', '2019-03-13', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SLMFQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-03-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SLMFQY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SLZGII', 1, 3, 'Promotion', '2018-08-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SLZGII'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SLZGII' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SQQLGO', 1, 3, 'Promotion', '2011-05-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SQQLGO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-05-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SQQLGO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SRLLIZ', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SRLLIZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SRLLIZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SSIPCD', 1, 3, 'Promotion', '2011-11-27', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SSIPCD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-11-27')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SSIPCD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'STMOHT', 1, 3, 'Promotion', '2014-09-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'STMOHT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'STMOHT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SWGFZR', 1, 3, 'Promotion', '2017-12-05', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SWGFZR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SWGFZR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SZNXZQ', 1, 3, 'Promotion', '2021-02-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SZNXZQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SZNXZQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBRHWF', 1, 3, 'Promotion', '2011-04-18', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBRHWF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBRHWF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TCSUER', 1, 3, 'Promotion', '2015-04-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TCSUER'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-04-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TCSUER' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TDUFWB', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TDUFWB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TDUFWB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'THRDXN', 1, 3, 'Promotion', '2018-10-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'THRDXN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'THRDXN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TLAOEA', 1, 3, 'Promotion', '2014-11-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TLAOEA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-11-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TLAOEA' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TQGFYF', 1, 3, 'Promotion', '2018-07-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TQGFYF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-07-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TQGFYF' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSQZSP', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSQZSP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSQZSP' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSTZYO', 1, 3, 'Promotion', '2018-12-18', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSTZYO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-12-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSTZYO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TXWYBO', 1, 3, 'Promotion', '2019-08-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TXWYBO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TXWYBO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBDBLS', 1, 3, 'Promotion', '2011-05-31', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBDBLS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-05-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBDBLS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBPTLG', 1, 3, 'Promotion', '2018-08-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBPTLG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBPTLG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UDBZTN', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UDBZTN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UDBZTN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UNMIIL', 1, 3, 'Promotion', '2015-02-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UNMIIL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-02-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UNMIIL' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'USJNOR', 1, 3, 'Promotion', '2017-12-29', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'USJNOR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-12-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'USJNOR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'USQQAS', 1, 3, 'Promotion', '2015-05-11', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'USQQAS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-05-11')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'USQQAS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UTRBWX', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UTRBWX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UTRBWX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UUDUPD', 1, 3, 'Promotion', '2018-09-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UUDUPD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UUDUPD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBHJBI', 1, 3, 'Promotion', '2020-09-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBHJBI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBHJBI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBXQWZ', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBXQWZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBXQWZ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCEBYK', 1, 3, 'Promotion', '2018-08-04', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCEBYK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCEBYK' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WFYYDD', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WFYYDD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WFYYDD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WGFXJN', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WGFXJN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WGFXJN' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIZNWD', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIZNWD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIZNWD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WOIMFW', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WOIMFW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WOIMFW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WOTACM', 1, 3, 'Promotion', '2009-09-05', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WOTACM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2009-09-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WOTACM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WPKTEX', 1, 3, 'Promotion', '2016-08-31', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WPKTEX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2016-08-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WPKTEX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WPTNOW', 1, 3, 'Promotion', '2010-10-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WPTNOW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2010-10-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WPTNOW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSZYEQ', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSZYEQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSZYEQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XDYUZR', 1, 3, 'Promotion', '2018-09-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XDYUZR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XDYUZR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XHLXLR', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XHLXLR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XHLXLR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XKYINB', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XKYINB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XKYINB' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XMDMXD', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XMDMXD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XMDMXD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XOPIYD', 1, 3, 'Promotion', '2021-12-16', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XOPIYD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-12-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XOPIYD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPLFJH', 1, 3, 'Promotion', '2011-06-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPLFJH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPLFJH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPYMXR', 1, 3, 'Promotion', '2018-08-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPYMXR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-08-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPYMXR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XTRRMD', 1, 3, 'Promotion', '2011-04-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XTRRMD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XTRRMD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XYSDGC', 1, 3, 'Promotion', '2022-07-26', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XYSDGC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-07-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XYSDGC' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XZOZFS', 1, 3, 'Promotion', '2014-09-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XZOZFS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-09-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XZOZFS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YADLQY', 1, 3, 'Promotion', '2014-06-30', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YADLQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-06-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YADLQY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCIBYO', 1, 3, 'Promotion', '2018-06-29', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCIBYO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-06-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCIBYO' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YDMWDH', 1, 3, 'Promotion', '2021-03-04', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YDMWDH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-03-04')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YDMWDH' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJDUCX', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJDUCX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJDUCX' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJYAJS', 1, 3, 'Promotion', '2022-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJYAJS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJYAJS' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YLRHGT', 1, 3, 'Promotion', '2011-11-30', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YLRHGT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-11-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YLRHGT' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YMMPSD', 1, 3, 'Promotion', '2018-11-02', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YMMPSD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YMMPSD' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YOGCUE', 1, 3, 'Promotion', '2011-06-09', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YOGCUE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-06-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YOGCUE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YPPTJI', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YPPTJI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YPPTJI' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQPANG', 1, 3, 'Promotion', '2021-11-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQPANG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-11-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQPANG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YTSXPY', 1, 3, 'Promotion', '2011-12-01', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YTSXPY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YTSXPY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYPSUQ', 1, 3, 'Promotion', '2021-02-10', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYPSUQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-02-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYPSUQ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFLTJJ', 1, 3, 'Promotion', '2021-08-19', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFLTJJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-08-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFLTJJ' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZIHCXY', 1, 3, 'Promotion', '2025-12-20', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZIHCXY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZIHCXY' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZQPPUE', 1, 3, 'Promotion', '2020-09-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZQPPUE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZQPPUE' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZUOCEM', 1, 3, 'Promotion', '2020-09-08', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZUOCEM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-09-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZUOCEM' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWRZPW', 1, 3, 'Promotion', '2022-12-23', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWRZPW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2022-12-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWRZPW' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXBQQR', 1, 3, 'Promotion', '2025-12-12', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXBQQR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXBQQR' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXENJG', 1, 3, 'Promotion', '2025-12-17', 'LPS posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXENJG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2025-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXENJG' AND p.to_designation_id = 3);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AGQKUX', 3, 5, 'Promotion', '2012-08-08', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AGQKUX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AGQKUX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'APHICS', 3, 5, 'Promotion', '2012-08-08', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'APHICS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'APHICS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AROMIL', 3, 5, 'Promotion', '2015-03-23', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AROMIL'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-03-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AROMIL' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATSAUG', 3, 5, 'Promotion', '2018-12-17', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATSAUG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-12-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATSAUG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AUZQDZ', 3, 5, 'Promotion', '2012-05-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AUZQDZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-05-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AUZQDZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AXINWK', 3, 5, 'Promotion', '2020-03-05', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AXINWK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-03-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AXINWK' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMTNUC', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMTNUC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMTNUC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BQRTKT', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BQRTKT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BQRTKT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BRTFGX', 3, 5, 'Promotion', '2011-10-29', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BRTFGX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-10-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BRTFGX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZMIAS', 3, 5, 'Promotion', '2012-07-26', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZMIAS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-07-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZMIAS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'COUYUR', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'COUYUR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'COUYUR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQEJGA', 3, 5, 'Promotion', '2018-11-30', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQEJGA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQEJGA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CSGCGJ', 3, 5, 'Promotion', '2018-09-20', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CSGCGJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-09-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CSGCGJ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DDAXKY', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DDAXKY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DDAXKY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGKSAJ', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGKSAJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGKSAJ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DLQUGX', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DLQUGX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DLQUGX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DMUODO', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DMUODO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DMUODO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPJXOQ', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPJXOQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPJXOQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DQYHJD', 3, 5, 'Promotion', '2012-07-30', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DQYHJD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-07-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DQYHJD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EDIHKI', 3, 5, 'Promotion', '2015-08-17', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EDIHKI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-08-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EDIHKI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EMRNBX', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EMRNBX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EMRNBX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EPSPSI', 3, 5, 'Promotion', '2012-08-08', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EPSPSI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EPSPSI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EXEKQU', 3, 5, 'Promotion', '2012-07-30', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EXEKQU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-07-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EXEKQU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FBCHQQ', 3, 5, 'Promotion', '2011-11-28', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FBCHQQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-11-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FBCHQQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FORZNP', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FORZNP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FORZNP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FPMKAA', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FPMKAA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FPMKAA' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJOZCS', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJOZCS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJOZCS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJUEKX', 3, 5, 'Promotion', '2020-12-01', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJUEKX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2020-12-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJUEKX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GRYBXR', 3, 5, 'Promotion', '2011-12-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GRYBXR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GRYBXR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GSTBQE', 3, 5, 'Promotion', '2011-12-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GSTBQE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GSTBQE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXKPYY', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXKPYY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXKPYY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HEKAQU', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HEKAQU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HEKAQU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HKORQX', 3, 5, 'Promotion', '2012-07-30', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HKORQX'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-07-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HKORQX' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HTCYXD', 3, 5, 'Promotion', '2011-11-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HTCYXD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-11-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HTCYXD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWFHQR', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWFHQR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWFHQR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYEEAI', 3, 5, 'Promotion', '2021-06-08', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYEEAI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2021-06-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYEEAI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYQIPS', 3, 5, 'Promotion', '2012-01-18', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYQIPS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-01-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYQIPS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IFCOMY', 3, 5, 'Promotion', '2012-01-18', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IFCOMY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-01-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IFCOMY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMQWXI', 3, 5, 'Promotion', '2012-08-08', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMQWXI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMQWXI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMWWNH', 3, 5, 'Promotion', '2011-10-20', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMWWNH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-10-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMWWNH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUCPGN', 3, 5, 'Promotion', '2015-03-12', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUCPGN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-03-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUCPGN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IYMYST', 3, 5, 'Promotion', '2011-04-13', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IYMYST'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-04-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IYMYST' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHWQOD', 3, 5, 'Promotion', '2012-03-31', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHWQOD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-03-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHWQOD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JNZECH', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JNZECH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JNZECH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KBTCXM', 3, 5, 'Promotion', '2015-03-23', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KBTCXM'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-03-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KBTCXM' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KCMJSQ', 3, 5, 'Promotion', '2012-07-07', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KCMJSQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-07-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KCMJSQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWWSYR', 3, 5, 'Promotion', '2019-12-31', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWWSYR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2019-12-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWWSYR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LDIZBF', 3, 5, 'Promotion', '2012-08-01', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LDIZBF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LDIZBF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LGGOQI', 3, 5, 'Promotion', '2012-08-08', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LGGOQI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LGGOQI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LGJZRR', 3, 5, 'Promotion', '2012-08-01', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LGJZRR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-01')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LGJZRR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHIKAU', 3, 5, 'Promotion', '2018-10-10', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHIKAU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-10-10')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHIKAU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LJJCJS', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LJJCJS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LJJCJS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LKCFIW', 3, 5, 'Promotion', '2018-12-20', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LKCFIW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-12-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LKCFIW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLWDQR', 3, 5, 'Promotion', '2018-12-20', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLWDQR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-12-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLWDQR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LXMQBE', 3, 5, 'Promotion', '2012-01-20', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LXMQBE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-01-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LXMQBE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYCCWR', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYCCWR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYCCWR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MHXGQS', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MHXGQS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MHXGQS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKLNRS', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKLNRS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKLNRS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKMWSS', 3, 5, 'Promotion', '2012-08-08', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKMWSS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKMWSS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCUAOQ', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCUAOQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCUAOQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDBLHU', 3, 5, 'Promotion', '2012-01-22', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDBLHU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-01-22')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDBLHU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NFFFOB', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NFFFOB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NFFFOB' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NMCWXZ', 3, 5, 'Promotion', '2018-12-20', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NMCWXZ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-12-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NMCWXZ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OBTJJB', 3, 5, 'Promotion', '2018-11-29', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OBTJJB'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-29')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OBTJJB' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OFTZLI', 3, 5, 'Promotion', '2011-12-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OFTZLI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OFTZLI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OGYELP', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OGYELP'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OGYELP' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJQZQD', 3, 5, 'Promotion', '2018-03-07', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJQZQD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-03-07')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJQZQD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OOKEAY', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OOKEAY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OOKEAY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWWNXK', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWWNXK'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWWNXK' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OXTAYT', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OXTAYT'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OXTAYT' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAAHFJ', 3, 5, 'Promotion', '2015-03-12', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAAHFJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-03-12')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAAHFJ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAOHDQ', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAOHDQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAOHDQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PGGLJN', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PGGLJN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PGGLJN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PLKGUC', 3, 5, 'Promotion', '2011-12-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PLKGUC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PLKGUC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBFJDI', 3, 5, 'Promotion', '2011-11-19', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBFJDI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-11-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBFJDI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QENBMY', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QENBMY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QENBMY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QKXBDN', 3, 5, 'Promotion', '2017-05-31', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QKXBDN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2017-05-31')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QKXBDN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QXINLH', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QXINLH'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QXINLH' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QYCKCI', 3, 5, 'Promotion', '2012-01-18', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QYCKCI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-01-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QYCKCI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QYEBJD', 3, 5, 'Promotion', '2012-01-18', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QYEBJD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-01-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QYEBJD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RCTGBC', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RCTGBC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RCTGBC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RSSTZU', 3, 5, 'Promotion', '2011-10-19', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RSSTZU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-10-19')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RSSTZU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RWMQMY', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RWMQMY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RWMQMY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RXLNCS', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RXLNCS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RXLNCS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SFTFUQ', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SFTFUQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SFTFUQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SLZGII', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SLZGII'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SLZGII' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SQQLGO', 3, 5, 'Promotion', '2015-04-23', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SQQLGO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-04-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SQQLGO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SROKBI', 3, 5, 'Promotion', '2012-01-18', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SROKBI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-01-18')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SROKBI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBRHWF', 3, 5, 'Promotion', '2012-08-08', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBRHWF'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBRHWF' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBDBLS', 3, 5, 'Promotion', '2012-08-08', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBDBLS'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-08-08')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBDBLS' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBPTLG', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBPTLG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBPTLG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UEPDZC', 3, 5, 'Promotion', '2011-09-30', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UEPDZC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-09-30')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UEPDZC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULPHMO', 3, 5, 'Promotion', '2018-11-26', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULPHMO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-26')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULPHMO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'USDNBI', 3, 5, 'Promotion', '2012-03-16', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'USDNBI'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-03-16')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'USDNBI' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WMCHBC', 3, 5, 'Promotion', '2011-12-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WMCHBC'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-12-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WMCHBC' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WPTNOW', 3, 5, 'Promotion', '2012-06-05', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WPTNOW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-06-05')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WPTNOW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WTRJWW', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WTRJWW'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WTRJWW' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WYGJBJ', 3, 5, 'Promotion', '2014-07-28', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WYGJBJ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2014-07-28')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WYGJBJ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XIPLWU', 3, 5, 'Promotion', '2012-03-13', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XIPLWU'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-03-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XIPLWU' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPYMXR', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPYMXR'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPYMXR' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XTRRMD', 3, 5, 'Promotion', '2012-04-02', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XTRRMD'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-02')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XTRRMD' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YADLQY', 3, 5, 'Promotion', '2015-04-17', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YADLQY'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-04-17')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YADLQY' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCIBYO', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCIBYO'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCIBYO' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YOGCUE', 3, 5, 'Promotion', '2015-03-23', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YOGCUE'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2015-03-23')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YOGCUE' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YPYJHQ', 3, 5, 'Promotion', '2012-03-13', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YPYJHQ'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-03-13')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YPYJHQ' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZBKXOG', 3, 5, 'Promotion', '2011-10-20', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZBKXOG'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2011-10-20')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZBKXOG' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFUADN', 3, 5, 'Promotion', '2012-04-09', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFUADN'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2012-04-09')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFUADN' AND p.to_designation_id = 5);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFYRTA', 3, 5, 'Promotion', '2018-11-15', 'LPG posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFYRTA'
  AND (s.date_of_appointment IS NULL OR s.date_of_appointment <= '2018-11-15')
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFYRTA' AND p.to_designation_id = 5);
SELECT to_designation_id, from_designation_id, COUNT(*) AS inserted FROM div_promotion_history WHERE created_by = 'kyn_full_data_2026-10-07' AND to_designation_id <> 1 GROUP BY 1,2 ORDER BY 1,2;
