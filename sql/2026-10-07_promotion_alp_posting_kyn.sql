-- ALP posting dates (1->1) from the KYN lobby sheets (kyn_alp/kyn_lps/kyn_lpg.csv), 2026-10-07.
-- Only where no to_designation_id=1 row exists and the date is 0-730 days after date_of_appointment on this DB.
-- created_by = kyn_full_data_2026-10-07; Undo: 2026-10-07_promotion_alp_posting_kyn_UNDO.sql
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAJKS', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAJKS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAJKS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAMUK', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAMUK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAMUK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAOQP', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAOQP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAOQP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAOUL', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAOUL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAOUL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAWEN', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAWEN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAWEN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAXIG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAXIG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAXIG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAYGJ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAYGJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAYGJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAAZHR', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAAZHR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAAZHR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AABJSZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AABJSZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AABJSZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AADGRX', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AADGRX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AADGRX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AADRRC', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AADRRC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AADRRC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAEXOX', 1, 1, 'Promotion', '2017-01-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAEXOX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-01-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAEXOX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AAGHKH', 1, 1, 'Promotion', '2014-07-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AAGHKH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AAGHKH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ABGPRB', 1, 1, 'Promotion', '2009-01-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ABGPRB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-01-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ABGPRB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ACKNSQ', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ACKNSQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ACKNSQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AEBLAD', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AEBLAD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AEBLAD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AEMMSO', 1, 1, 'Promotion', '2017-06-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AEMMSO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AEMMSO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AEQTIJ', 1, 1, 'Promotion', '2005-03-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AEQTIJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-03-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AEQTIJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AFRXZR', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AFRXZR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AFRXZR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AGQKUX', 1, 1, 'Promotion', '2009-07-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AGQKUX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AGQKUX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AIBRNH', 1, 1, 'Promotion', '2018-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AIBRNH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AIBRNH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AIEIFK', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AIEIFK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AIEIFK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AKMEJN', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AKMEJN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AKMEJN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ALDZUR', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ALDZUR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ALDZUR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ALJFEX', 1, 1, 'Promotion', '2017-05-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ALJFEX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ALJFEX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AMMWSR', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AMMWSR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AMMWSR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AOXWGD', 1, 1, 'Promotion', '2017-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AOXWGD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AOXWGD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'APHICS', 1, 1, 'Promotion', '2001-03-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'APHICS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-03-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'APHICS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AROMIL', 1, 1, 'Promotion', '2002-05-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AROMIL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-05-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AROMIL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATACWQ', 1, 1, 'Promotion', '2012-02-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATACWQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2012-02-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATACWQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATSAUG', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATSAUG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATSAUG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATTIHZ', 1, 1, 'Promotion', '2000-12-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATTIHZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATTIHZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ATXIEI', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ATXIEI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ATXIEI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AUZQDZ', 1, 1, 'Promotion', '2000-02-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AUZQDZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AUZQDZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AWPEMD', 1, 1, 'Promotion', '2014-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AWPEMD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AWPEMD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AXINWK', 1, 1, 'Promotion', '2010-12-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AXINWK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AXINWK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AYRRPM', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AYRRPM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AYRRPM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'AZQRSD', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'AZQRSD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'AZQRSD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BAFKQW', 1, 1, 'Promotion', '2013-08-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BAFKQW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BAFKQW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BEJEUX', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BEJEUX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BEJEUX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BEOWWS', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BEOWWS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BEOWWS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BIZEZN', 1, 1, 'Promotion', '2003-07-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BIZEZN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-07-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BIZEZN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BKFHFT', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BKFHFT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BKFHFT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMTNUC', 1, 1, 'Promotion', '2007-08-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMTNUC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2007-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMTNUC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BMZWLQ', 1, 1, 'Promotion', '1997-05-22', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BMZWLQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-05-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BMZWLQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOAHBI', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOAHBI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOAHBI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOHHTS', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOHHTS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOHHTS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BOJYRN', 1, 1, 'Promotion', '2012-12-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BOJYRN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2012-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BOJYRN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BQRTKT', 1, 1, 'Promotion', '2000-12-22', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BQRTKT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BQRTKT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BRTFGX', 1, 1, 'Promotion', '1997-12-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BRTFGX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BRTFGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BULCFP', 1, 1, 'Promotion', '2013-12-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BULCFP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-12-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BULCFP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BWIOQU', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BWIOQU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BWIOQU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BWNQHN', 1, 1, 'Promotion', '2001-03-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BWNQHN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-03-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BWNQHN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZMIAS', 1, 1, 'Promotion', '2001-03-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZMIAS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-03-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZMIAS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'BZODSJ', 1, 1, 'Promotion', '1996-08-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'BZODSJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-08-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'BZODSJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CBRQQE', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CBRQQE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CBRQQE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CDAUOK', 1, 1, 'Promotion', '2012-05-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CDAUOK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2012-05-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CDAUOK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CDYYZU', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CDYYZU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CDYYZU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CDZBIF', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CDZBIF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CDZBIF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CEPKTZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CEPKTZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CEPKTZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CIHZTE', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CIHZTE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CIHZTE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CITMPI', 1, 1, 'Promotion', '2008-09-19', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CITMPI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-09-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CITMPI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CKLTGX', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CKLTGX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CKLTGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CMHPWZ', 1, 1, 'Promotion', '2014-05-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CMHPWZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CMHPWZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'COUYUR', 1, 1, 'Promotion', '2000-02-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'COUYUR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'COUYUR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CPANPQ', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CPANPQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CPANPQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQEJGA', 1, 1, 'Promotion', '2009-09-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQEJGA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-09-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQEJGA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQQAQG', 1, 1, 'Promotion', '2014-07-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQQAQG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-07-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQQAQG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CQWNOG', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CQWNOG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CQWNOG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CRACKB', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CRACKB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CRACKB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CSGCGJ', 1, 1, 'Promotion', '2005-03-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CSGCGJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-03-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CSGCGJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CSXIYO', 1, 1, 'Promotion', '2013-10-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CSXIYO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-10-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CSXIYO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CUDHIS', 1, 1, 'Promotion', '2017-06-22', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CUDHIS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CUDHIS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CWMCPZ', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CWMCPZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CWMCPZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'CYUWTE', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'CYUWTE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'CYUWTE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DCAHGZ', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DCAHGZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DCAHGZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DDAXKY', 1, 1, 'Promotion', '2000-12-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DDAXKY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DDAXKY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGCPMN', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGCPMN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGCPMN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DGKSAJ', 1, 1, 'Promotion', '2009-06-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DGKSAJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-06-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DGKSAJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DHPHPE', 1, 1, 'Promotion', '2014-08-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DHPHPE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-08-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DHPHPE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DJQRIB', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DJQRIB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DJQRIB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DLQUGX', 1, 1, 'Promotion', '2000-02-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DLQUGX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DLQUGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DMUODO', 1, 1, 'Promotion', '2008-03-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DMUODO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-03-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DMUODO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DOWUMS', 1, 1, 'Promotion', '2017-05-27', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DOWUMS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DOWUMS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DPJXOQ', 1, 1, 'Promotion', '2000-02-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DPJXOQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DPJXOQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DQYHJD', 1, 1, 'Promotion', '2000-03-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DQYHJD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-03-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DQYHJD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DWUMGR', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DWUMGR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DWUMGR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DYCYGM', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DYCYGM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DYCYGM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DYGANW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DYGANW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DYGANW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DYWQLO', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DYWQLO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DYWQLO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZGFUI', 1, 1, 'Promotion', '2017-06-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZGFUI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZGFUI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'DZPFNI', 1, 1, 'Promotion', '1993-08-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'DZPFNI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-08-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'DZPFNI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EDIHKI', 1, 1, 'Promotion', '2000-03-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EDIHKI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-03-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EDIHKI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EESUES', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EESUES' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EESUES' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EIMEUE', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EIMEUE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EIMEUE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EJEGDC', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EJEGDC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EJEGDC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EJUYMX', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EJUYMX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EJUYMX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EKOOJX', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EKOOJX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EKOOJX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ELBBSO', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ELBBSO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ELBBSO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EMRNBX', 1, 1, 'Promotion', '2000-02-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EMRNBX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EMRNBX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ENPLLP', 1, 1, 'Promotion', '2014-05-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ENPLLP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ENPLLP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EOTBHA', 1, 1, 'Promotion', '2017-11-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EOTBHA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EOTBHA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EPSPSI', 1, 1, 'Promotion', '2000-06-19', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EPSPSI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-06-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EPSPSI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ERLNMR', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ERLNMR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ERLNMR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EUSGGL', 1, 1, 'Promotion', '2009-07-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EUSGGL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EUSGGL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EXEKQU', 1, 1, 'Promotion', '2000-04-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EXEKQU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-04-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EXEKQU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EYIAGD', 1, 1, 'Promotion', '2013-08-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EYIAGD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EYIAGD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EYIMCW', 1, 1, 'Promotion', '2010-12-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EYIMCW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EYIMCW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'EZJZGM', 1, 1, 'Promotion', '2008-08-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'EZJZGM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-08-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'EZJZGM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FBCHQQ', 1, 1, 'Promotion', '1992-08-27', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FBCHQQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1992-08-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FBCHQQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FBFGLL', 1, 1, 'Promotion', '2008-03-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FBFGLL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-03-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FBFGLL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FBQDZI', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FBQDZI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FBQDZI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FDOCUN', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FDOCUN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FDOCUN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGCWOI', 1, 1, 'Promotion', '2017-07-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGCWOI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGCWOI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGEIIE', 1, 1, 'Promotion', '2000-02-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGEIIE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGEIIE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FGLEJQ', 1, 1, 'Promotion', '2010-12-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FGLEJQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FGLEJQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FMWPPP', 1, 1, 'Promotion', '2001-07-25', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FMWPPP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-07-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FMWPPP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FOERJD', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FOERJD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FOERJD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FORZNP', 1, 1, 'Promotion', '2009-05-27', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FORZNP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FORZNP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FPMKAA', 1, 1, 'Promotion', '2008-02-02', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FPMKAA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-02-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FPMKAA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FQDZTP', 1, 1, 'Promotion', '2016-12-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FQDZTP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FQDZTP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FRQLAN', 1, 1, 'Promotion', '2005-02-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FRQLAN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FRQLAN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'FZFSTL', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'FZFSTL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'FZFSTL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GAMPUS', 1, 1, 'Promotion', '2013-08-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GAMPUS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GAMPUS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GFLDHL', 1, 1, 'Promotion', '2025-06-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GFLDHL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GFLDHL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GFLONI', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GFLONI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GFLONI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GGGILT', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GGGILT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GGGILT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GGKNWD', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GGKNWD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GGKNWD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJOZCS', 1, 1, 'Promotion', '2009-03-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJOZCS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-03-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJOZCS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJPWKK', 1, 1, 'Promotion', '2010-12-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJPWKK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJPWKK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GJUEKX', 1, 1, 'Promotion', '2009-02-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GJUEKX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-02-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GJUEKX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GLQXFA', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GLQXFA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GLQXFA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GLZSKG', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GLZSKG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GLZSKG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GNHTAK', 1, 1, 'Promotion', '2017-06-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GNHTAK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GNHTAK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GNSGLS', 1, 1, 'Promotion', '2017-06-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GNSGLS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GNSGLS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GOXWIW', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GOXWIW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GOXWIW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GPJTEF', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GPJTEF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GPJTEF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GQUTDU', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GQUTDU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GQUTDU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GRYBXR', 1, 1, 'Promotion', '1998-07-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GRYBXR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1998-07-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GRYBXR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GSTBQE', 1, 1, 'Promotion', '2000-02-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GSTBQE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GSTBQE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXIFTW', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXIFTW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXIFTW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'GXKPYY', 1, 1, 'Promotion', '2009-06-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'GXKPYY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-06-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'GXKPYY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HCXYXS', 1, 1, 'Promotion', '2001-08-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HCXYXS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HCXYXS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HDQLGJ', 1, 1, 'Promotion', '2017-05-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HDQLGJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HDQLGJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HEKAQU', 1, 1, 'Promotion', '2000-02-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HEKAQU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HEKAQU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HFRKKF', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HFRKKF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HFRKKF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HHYUUN', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HHYUUN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HHYUUN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HJMRHY', 1, 1, 'Promotion', '2014-05-02', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HJMRHY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HJMRHY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HKCCST', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HKCCST' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HKCCST' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HKORQX', 1, 1, 'Promotion', '2000-04-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HKORQX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-04-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HKORQX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HLWUDL', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HLWUDL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HLWUDL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HMHOPF', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HMHOPF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HMHOPF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HPFFTJ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HPFFTJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HPFFTJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HQBQSH', 1, 1, 'Promotion', '2010-12-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HQBQSH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HQBQSH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HQFMBQ', 1, 1, 'Promotion', '2004-05-06', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HQFMBQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2004-05-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HQFMBQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HRFMDJ', 1, 1, 'Promotion', '2013-10-22', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HRFMDJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-10-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HRFMDJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HRPEIS', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HRPEIS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HRPEIS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HRQIYW', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HRQIYW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HRQIYW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HTCYXD', 1, 1, 'Promotion', '1997-08-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HTCYXD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-08-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HTCYXD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWFHQR', 1, 1, 'Promotion', '2000-12-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWFHQR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWFHQR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWOYXE', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWOYXE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWOYXE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWPWMC', 1, 1, 'Promotion', '2010-12-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWPWMC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWPWMC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HWWMNF', 1, 1, 'Promotion', '2003-01-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HWWMNF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HWWMNF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HXHPIO', 1, 1, 'Promotion', '2014-05-02', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HXHPIO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HXHPIO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYEEAI', 1, 1, 'Promotion', '2005-04-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYEEAI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-04-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYEEAI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HYQIPS', 1, 1, 'Promotion', '2002-11-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HYQIPS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-11-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HYQIPS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'HZJWCZ', 1, 1, 'Promotion', '2017-12-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'HZJWCZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'HZJWCZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IAONQW', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IAONQW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IAONQW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IDYYSA', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IDYYSA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IDYYSA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IFAMWQ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IFAMWQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IFAMWQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IFCOMY', 1, 1, 'Promotion', '2004-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IFCOMY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2004-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IFCOMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IFSYPH', 1, 1, 'Promotion', '2017-06-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IFSYPH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IFSYPH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IGMTAD', 1, 1, 'Promotion', '2003-12-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IGMTAD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IGMTAD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IGZSIE', 1, 1, 'Promotion', '2013-10-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IGZSIE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-10-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IGZSIE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IHFSYR', 1, 1, 'Promotion', '2017-06-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IHFSYR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IHFSYR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIQYRG', 1, 1, 'Promotion', '2017-05-19', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIQYRG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIQYRG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IIXOQY', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IIXOQY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IIXOQY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IJNXTL', 1, 1, 'Promotion', '2017-03-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IJNXTL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-03-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IJNXTL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMQWXI', 1, 1, 'Promotion', '2000-06-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMQWXI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-06-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMQWXI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IMWWNH', 1, 1, 'Promotion', '2002-01-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IMWWNH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-01-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IMWWNH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INTWLG', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INTWLG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INTWLG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'INXKGZ', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'INXKGZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'INXKGZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IOIBQC', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IOIBQC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IOIBQC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITAAIZ', 1, 1, 'Promotion', '2017-10-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITAAIZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-10-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITAAIZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ITOMSR', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ITOMSR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ITOMSR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IUCPGN', 1, 1, 'Promotion', '1999-01-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IUCPGN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1999-01-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IUCPGN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IXEIPZ', 1, 1, 'Promotion', '2013-10-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IXEIPZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-10-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IXEIPZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'IZQSQT', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'IZQSQT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'IZQSQT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JCBDZQ', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JCBDZQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JCBDZQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JCCDIF', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JCCDIF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JCCDIF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JDBLGB', 1, 1, 'Promotion', '2013-12-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JDBLGB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-12-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JDBLGB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JFJPBP', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JFJPBP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JFJPBP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JGDJZY', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JGDJZY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JGDJZY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHWQOD', 1, 1, 'Promotion', '2000-02-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHWQOD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHWQOD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JHYUEK', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JHYUEK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JHYUEK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JIAIWX', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JIAIWX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JIAIWX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JISGRE', 1, 1, 'Promotion', '2017-06-25', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JISGRE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JISGRE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JJOHQJ', 1, 1, 'Promotion', '2026-02-25', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JJOHQJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JJOHQJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JKEBRR', 1, 1, 'Promotion', '2005-03-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JKEBRR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-03-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JKEBRR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JKKIPY', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JKKIPY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JKKIPY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JKOBSX', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JKOBSX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JKOBSX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JLCDBE', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JLCDBE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JLCDBE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMEFOI', 1, 1, 'Promotion', '2016-03-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMEFOI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-03-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMEFOI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JMHSLG', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JMHSLG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JMHSLG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JNBDAJ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JNBDAJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JNBDAJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JNZECH', 1, 1, 'Promotion', '2009-06-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JNZECH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-06-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JNZECH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JPRJFP', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JPRJFP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JPRJFP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JRLMAF', 1, 1, 'Promotion', '2011-03-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JRLMAF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2011-03-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JRLMAF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JSQKWK', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JSQKWK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JSQKWK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JTIBIY', 1, 1, 'Promotion', '2017-05-19', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JTIBIY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JTIBIY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JUUXPS', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JUUXPS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JUUXPS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JYACHE', 1, 1, 'Promotion', '2014-02-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JYACHE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-02-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JYACHE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'JZCSSS', 1, 1, 'Promotion', '2017-06-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'JZCSSS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'JZCSSS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KAEJOJ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KAEJOJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KAEJOJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KAMEWP', 1, 1, 'Promotion', '2019-12-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KAMEWP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-12-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KAMEWP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KBTCXM', 1, 1, 'Promotion', '2002-05-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KBTCXM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-05-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KBTCXM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KCMJSQ', 1, 1, 'Promotion', '2007-12-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KCMJSQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2007-12-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KCMJSQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KDCSBC', 1, 1, 'Promotion', '2006-04-06', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KDCSBC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2006-04-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KDCSBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KEPOLP', 1, 1, 'Promotion', '2008-10-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KEPOLP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-10-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KEPOLP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KETUBG', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KETUBG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KETUBG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KGNBHX', 1, 1, 'Promotion', '2008-12-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KGNBHX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-12-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KGNBHX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHKOMF', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHKOMF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHKOMF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KHSUPC', 1, 1, 'Promotion', '2000-12-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KHSUPC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KHSUPC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KKXFYC', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KKXFYC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KKXFYC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KNGKFB', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KNGKFB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KNGKFB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KQECCJ', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KQECCJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KQECCJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KTCRCH', 1, 1, 'Promotion', '2000-02-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KTCRCH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KTCRCH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KUPERX', 1, 1, 'Promotion', '2014-05-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KUPERX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KUPERX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KUTUSW', 1, 1, 'Promotion', '2013-11-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KUTUSW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-11-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KUTUSW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWEMFN', 1, 1, 'Promotion', '2014-05-02', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWEMFN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWEMFN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWMPJJ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWMPJJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWMPJJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KWWSYR', 1, 1, 'Promotion', '2016-01-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KWWSYR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-01-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KWWSYR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KYOPQB', 1, 1, 'Promotion', '2014-03-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KYOPQB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-03-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KYOPQB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'KZBKGX', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'KZBKGX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'KZBKGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LALTDI', 1, 1, 'Promotion', '2017-04-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LALTDI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-04-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LALTDI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LAQHAU', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LAQHAU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LAQHAU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LATRNL', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LATRNL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LATRNL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LDIZBF', 1, 1, 'Promotion', '2000-04-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LDIZBF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-04-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LDIZBF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LDYHIQ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LDYHIQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LDYHIQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LEHEDC', 1, 1, 'Promotion', '2005-12-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LEHEDC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LEHEDC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LEJECG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LEJECG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LEJECG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LGGOQI', 1, 1, 'Promotion', '2000-04-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LGGOQI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-04-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LGGOQI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LGJZRR', 1, 1, 'Promotion', '2000-04-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LGJZRR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-04-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LGJZRR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LGUQTQ', 1, 1, 'Promotion', '2016-10-03', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LGUQTQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-10-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LGUQTQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LHIKAU', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LHIKAU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LHIKAU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LJJCJS', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LJJCJS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LJJCJS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LKCFIW', 1, 1, 'Promotion', '2009-06-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LKCFIW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-06-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LKCFIW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLAKNX', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLAKNX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLAKNX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLFPKO', 1, 1, 'Promotion', '2017-04-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLFPKO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-04-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLFPKO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LLWDQR', 1, 1, 'Promotion', '2009-07-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LLWDQR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-07-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LLWDQR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LMSXRX', 1, 1, 'Promotion', '2017-05-27', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LMSXRX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LMSXRX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LQYHMU', 1, 1, 'Promotion', '2013-08-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LQYHMU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LQYHMU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LRYEUC', 1, 1, 'Promotion', '2005-04-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LRYEUC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-04-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LRYEUC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LSJWGW', 1, 1, 'Promotion', '2010-05-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LSJWGW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-05-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LSJWGW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LUIKXZ', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LUIKXZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LUIKXZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LXMQBE', 1, 1, 'Promotion', '2002-11-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LXMQBE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-11-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LXMQBE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYCCWR', 1, 1, 'Promotion', '2000-02-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYCCWR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYCCWR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYFEMW', 1, 1, 'Promotion', '2013-11-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYFEMW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-11-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYFEMW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYQAYO', 1, 1, 'Promotion', '2009-07-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYQAYO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYQAYO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LYSOEK', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LYSOEK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LYSOEK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'LZULOI', 1, 1, 'Promotion', '2016-05-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'LZULOI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-05-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'LZULOI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MATDRB', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MATDRB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MATDRB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MBHSEM', 1, 1, 'Promotion', '2017-05-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MBHSEM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MBHSEM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MDZBLJ', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MDZBLJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MDZBLJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MEPECJ', 1, 1, 'Promotion', '2013-12-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MEPECJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-12-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MEPECJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MGQIXC', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MGQIXC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MGQIXC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MHUEQA', 1, 1, 'Promotion', '1993-08-06', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MHUEQA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-08-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MHUEQA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MHXGQS', 1, 1, 'Promotion', '2000-02-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MHXGQS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MHXGQS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MIYJUD', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MIYJUD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MIYJUD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MJNSZR', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MJNSZR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MJNSZR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MJWMQF', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MJWMQF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MJWMQF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKLNRS', 1, 1, 'Promotion', '2000-02-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKLNRS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKLNRS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKMWSS', 1, 1, 'Promotion', '2000-06-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKMWSS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-06-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKMWSS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MKNSFZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MKNSFZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MKNSFZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMQQIK', 1, 1, 'Promotion', '2016-11-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMQQIK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-11-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMQQIK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MMYXQI', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MMYXQI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MMYXQI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MNNLOZ', 1, 1, 'Promotion', '1994-04-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MNNLOZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-04-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MNNLOZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MOCEEI', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MOCEEI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MOCEEI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MPCQEP', 1, 1, 'Promotion', '2017-06-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MPCQEP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MPCQEP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MPIUCF', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MPIUCF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MPIUCF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MQWOQG', 1, 1, 'Promotion', '1994-12-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MQWOQG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1994-12-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MQWOQG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MRKFZG', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MRKFZG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MRKFZG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MTNGNH', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MTNGNH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MTNGNH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MYENFW', 1, 1, 'Promotion', '2003-01-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MYENFW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MYENFW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'MZUXKX', 1, 1, 'Promotion', '2014-05-03', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'MZUXKX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'MZUXKX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NAXAKI', 1, 1, 'Promotion', '2017-05-19', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NAXAKI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NAXAKI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NAYUQY', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NAYUQY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NAYUQY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NCUAOQ', 1, 1, 'Promotion', '1997-05-23', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NCUAOQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-05-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NCUAOQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDBLHU', 1, 1, 'Promotion', '2000-10-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDBLHU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-10-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDBLHU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NDWQPS', 1, 1, 'Promotion', '2010-12-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NDWQPS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NDWQPS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NEYMQI', 1, 1, 'Promotion', '2017-06-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NEYMQI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NEYMQI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NFCFDO', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NFCFDO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NFCFDO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NFFFOB', 1, 1, 'Promotion', '1998-03-25', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NFFFOB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1998-03-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NFFFOB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NFQJDE', 1, 1, 'Promotion', '2014-05-03', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NFQJDE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NFQJDE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NHOMKK', 1, 1, 'Promotion', '2003-10-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NHOMKK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NHOMKK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NHORYS', 1, 1, 'Promotion', '2009-12-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NHORYS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-12-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NHORYS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NHTDAA', 1, 1, 'Promotion', '2013-12-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NHTDAA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-12-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NHTDAA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NJAGQB', 1, 1, 'Promotion', '2013-11-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NJAGQB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-11-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NJAGQB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NMCWXZ', 1, 1, 'Promotion', '2009-06-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NMCWXZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-06-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NMCWXZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NMFLUC', 1, 1, 'Promotion', '2008-12-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NMFLUC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-12-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NMFLUC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NMTENF', 1, 1, 'Promotion', '2018-03-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NMTENF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-03-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NMTENF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NQGDKM', 1, 1, 'Promotion', '2017-06-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NQGDKM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NQGDKM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NRKJCZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NRKJCZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NRKJCZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NWPHBX', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NWPHBX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NWPHBX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NWZRWR', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NWZRWR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NWZRWR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXEADY', 1, 1, 'Promotion', '2014-05-02', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXEADY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXEADY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NXYXQU', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NXYXQU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NXYXQU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NYMBWA', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NYMBWA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NYMBWA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'NZXTYX', 1, 1, 'Promotion', '2026-06-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'NZXTYX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-06-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'NZXTYX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OBTJJB', 1, 1, 'Promotion', '2009-04-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OBTJJB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-04-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OBTJJB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OETXKA', 1, 1, 'Promotion', '2009-04-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OETXKA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-04-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OETXKA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OFTZLI', 1, 1, 'Promotion', '1985-04-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OFTZLI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1985-04-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OFTZLI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OGYELP', 1, 1, 'Promotion', '2009-05-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OGYELP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OGYELP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJQZQD', 1, 1, 'Promotion', '2012-05-02', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJQZQD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2012-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJQZQD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OJXQUB', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OJXQUB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OJXQUB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OLAPQS', 1, 1, 'Promotion', '2004-01-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OLAPQS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2004-01-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OLAPQS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OOKEAY', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OOKEAY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OOKEAY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OQXQXY', 1, 1, 'Promotion', '2017-11-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OQXQXY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OQXQXY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OTWRUF', 1, 1, 'Promotion', '1996-05-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OTWRUF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-05-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OTWRUF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OUPQWN', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OUPQWN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OUPQWN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWTDPH', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWTDPH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWTDPH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OWWNXK', 1, 1, 'Promotion', '2000-02-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OWWNXK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OWWNXK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OXKJKP', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OXKJKP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OXKJKP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OXOKUG', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OXOKUG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OXOKUG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OXTAYT', 1, 1, 'Promotion', '2000-12-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OXTAYT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OXTAYT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'OZATHA', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'OZATHA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'OZATHA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAAHFJ', 1, 1, 'Promotion', '1997-12-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAAHFJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAAHFJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PAOHDQ', 1, 1, 'Promotion', '2000-12-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PAOHDQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-12-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PAOHDQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PBAUNQ', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PBAUNQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PBAUNQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PEYZYN', 1, 1, 'Promotion', '2018-04-23', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PEYZYN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PEYZYN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PFODKO', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PFODKO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PFODKO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PGGLJN', 1, 1, 'Promotion', '2000-02-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PGGLJN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PGGLJN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PHBKBW', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PHBKBW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PHBKBW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PHQPQY', 1, 1, 'Promotion', '2010-12-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PHQPQY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PHQPQY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PISZAT', 1, 1, 'Promotion', '2017-07-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PISZAT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-07-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PISZAT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PKMLOD', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PKMLOD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PKMLOD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PLKGUC', 1, 1, 'Promotion', '1996-08-27', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PLKGUC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1996-08-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PLKGUC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PMGIMK', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PMGIMK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PMGIMK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PMOYDK', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PMOYDK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PMOYDK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PMQHOW', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PMQHOW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PMQHOW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PQJCSC', 1, 1, 'Promotion', '2003-12-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PQJCSC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PQJCSC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PQJRAK', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PQJRAK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PQJRAK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PQSEDM', 1, 1, 'Promotion', '2017-05-19', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PQSEDM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PQSEDM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PSBAQY', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PSBAQY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PSBAQY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PSRIIP', 1, 1, 'Promotion', '2014-09-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PSRIIP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-09-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PSRIIP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PTDPIB', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PTDPIB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PTDPIB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PUWYQE', 1, 1, 'Promotion', '2017-05-19', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PUWYQE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PUWYQE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PYBBLS', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PYBBLS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PYBBLS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PYJGQI', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PYJGQI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PYJGQI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PYYEDE', 1, 1, 'Promotion', '2025-07-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PYYEDE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2025-07-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PYYEDE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'PZQWAA', 1, 1, 'Promotion', '2000-03-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'PZQWAA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-03-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'PZQWAA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QAPIBF', 1, 1, 'Promotion', '2003-10-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QAPIBF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QAPIBF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QBFJDI', 1, 1, 'Promotion', '2003-01-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QBFJDI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-01-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QBFJDI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QDBDTH', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QDBDTH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QDBDTH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QENBMY', 1, 1, 'Promotion', '2008-03-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QENBMY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-03-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QENBMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QFXZFB', 1, 1, 'Promotion', '2016-10-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QFXZFB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-10-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QFXZFB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGJTEX', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGJTEX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGJTEX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QGPPQM', 1, 1, 'Promotion', '2018-05-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QGPPQM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-05-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QGPPQM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QJRBSI', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QJRBSI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QJRBSI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QKXBDN', 1, 1, 'Promotion', '2000-04-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QKXBDN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-04-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QKXBDN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QMFDEK', 1, 1, 'Promotion', '2017-09-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QMFDEK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-09-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QMFDEK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QMFOKJ', 1, 1, 'Promotion', '2010-12-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QMFOKJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QMFOKJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QNKYDZ', 1, 1, 'Promotion', '2014-05-02', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QNKYDZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QNKYDZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QOODWM', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QOODWM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QOODWM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QOOIBU', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QOOIBU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QOOIBU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QPQGMZ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QPQGMZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QPQGMZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QPWXKU', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QPWXKU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QPWXKU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QQUQLH', 1, 1, 'Promotion', '2017-06-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QQUQLH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QQUQLH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QQYUBR', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QQYUBR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QQYUBR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QRHXLU', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QRHXLU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QRHXLU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QXINLH', 1, 1, 'Promotion', '2008-06-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QXINLH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-06-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QXINLH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QYCKCI', 1, 1, 'Promotion', '2004-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QYCKCI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2004-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QYCKCI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'QYNDCQ', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'QYNDCQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'QYNDCQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RABYYT', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RABYYT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RABYYT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RBHZUS', 1, 1, 'Promotion', '2010-12-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RBHZUS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RBHZUS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RCTGBC', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RCTGBC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RCTGBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RDCCPC', 1, 1, 'Promotion', '2010-05-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RDCCPC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-05-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RDCCPC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RIBNQS', 1, 1, 'Promotion', '2017-05-19', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RIBNQS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RIBNQS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RIIUQF', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RIIUQF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RIIUQF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RIWTEK', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RIWTEK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RIWTEK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RJQTMU', 1, 1, 'Promotion', '2006-12-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RJQTMU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2006-12-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RJQTMU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RLCPHJ', 1, 1, 'Promotion', '2014-05-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RLCPHJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RLCPHJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RLSZKP', 1, 1, 'Promotion', '2017-06-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RLSZKP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RLSZKP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RMHLSA', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RMHLSA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RMHLSA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RMNAIF', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RMNAIF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RMNAIF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ROPYXN', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ROPYXN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ROPYXN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RPDBQA', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RPDBQA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RPDBQA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RPUFPR', 1, 1, 'Promotion', '2003-08-25', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RPUFPR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-08-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RPUFPR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RQKPBK', 1, 1, 'Promotion', '2014-04-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RQKPBK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-04-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RQKPBK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RQKRBT', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RQKRBT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RQKRBT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RSFMDF', 1, 1, 'Promotion', '2014-05-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RSFMDF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RSFMDF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RSKQRY', 1, 1, 'Promotion', '2017-12-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RSKQRY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-12-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RSKQRY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RSSTZU', 1, 1, 'Promotion', '1997-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RSSTZU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RSSTZU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RTBSSU', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RTBSSU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RTBSSU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RUDRDN', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RUDRDN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RUDRDN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RUHEJO', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RUHEJO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RUHEJO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RUYYXK', 1, 1, 'Promotion', '2008-04-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RUYYXK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-04-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RUYYXK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RWMQMY', 1, 1, 'Promotion', '2000-02-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RWMQMY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RWMQMY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RXIAGJ', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RXIAGJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RXIAGJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RXLNCS', 1, 1, 'Promotion', '2009-05-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RXLNCS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RXLNCS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'RZXTON', 1, 1, 'Promotion', '2019-08-22', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'RZXTON' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2019-08-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'RZXTON' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCJGFE', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCJGFE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCJGFE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SCUHYT', 1, 1, 'Promotion', '2014-01-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SCUHYT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SCUHYT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SFPYMI', 1, 1, 'Promotion', '2017-06-22', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SFPYMI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SFPYMI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SFTFUQ', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SFTFUQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SFTFUQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SHGWCN', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SHGWCN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SHGWCN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SJTMWX', 1, 1, 'Promotion', '2017-06-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SJTMWX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SJTMWX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SKHRBZ', 1, 1, 'Promotion', '2008-03-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SKHRBZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2008-03-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SKHRBZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SLMFQY', 1, 1, 'Promotion', '2013-10-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SLMFQY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-10-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SLMFQY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SLZGII', 1, 1, 'Promotion', '2009-06-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SLZGII' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-06-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SLZGII' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SNFRRR', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SNFRRR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SNFRRR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SPNXJU', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SPNXJU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SPNXJU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SQQLGO', 1, 1, 'Promotion', '2001-08-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SQQLGO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-08-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SQQLGO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SQYDQJ', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SQYDQJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SQYDQJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SRLLIZ', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SRLLIZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SRLLIZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SROKBI', 1, 1, 'Promotion', '2004-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SROKBI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2004-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SROKBI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SSIPCD', 1, 1, 'Promotion', '2005-12-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SSIPCD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-12-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SSIPCD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'STMOHT', 1, 1, 'Promotion', '2003-10-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'STMOHT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'STMOHT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'STNQKL', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'STNQKL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'STNQKL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SUBQPW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SUBQPW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SUBQPW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SWGFZR', 1, 1, 'Promotion', '2006-06-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SWGFZR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2006-06-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SWGFZR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'SZNXZQ', 1, 1, 'Promotion', '2014-05-02', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'SZNXZQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-02', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'SZNXZQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TBRHWF', 1, 1, 'Promotion', '2001-03-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TBRHWF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-03-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TBRHWF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TCSUER', 1, 1, 'Promotion', '2003-12-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TCSUER' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TCSUER' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TDDNXD', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TDDNXD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TDDNXD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TDUFWB', 1, 1, 'Promotion', '2011-03-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TDUFWB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2011-03-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TDUFWB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'THRDXN', 1, 1, 'Promotion', '2011-04-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'THRDXN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2011-04-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'THRDXN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TJBOIQ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TJBOIQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TJBOIQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TKALGT', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TKALGT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TKALGT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TLAOEA', 1, 1, 'Promotion', '2003-12-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TLAOEA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-12-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TLAOEA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TLLHSH', 1, 1, 'Promotion', '2021-09-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TLLHSH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-09-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TLLHSH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TQGFYF', 1, 1, 'Promotion', '2009-01-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TQGFYF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-01-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TQGFYF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSQZSP', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSQZSP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSQZSP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TSTZYO', 1, 1, 'Promotion', '2010-12-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TSTZYO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TSTZYO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TXWYBO', 1, 1, 'Promotion', '2012-05-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TXWYBO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2012-05-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TXWYBO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'TYIWMA', 1, 1, 'Promotion', '2017-09-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'TYIWMA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-09-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'TYIWMA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBDBLS', 1, 1, 'Promotion', '2001-06-22', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBDBLS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2001-06-22', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBDBLS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UBPTLG', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UBPTLG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UBPTLG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UDBZTN', 1, 1, 'Promotion', '2018-05-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UDBZTN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-05-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UDBZTN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UEPDZC', 1, 1, 'Promotion', '2002-01-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UEPDZC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-01-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UEPDZC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UHYGZP', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UHYGZP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UHYGZP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULPHMO', 1, 1, 'Promotion', '2004-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULPHMO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2004-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULPHMO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ULRHTS', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ULRHTS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ULRHTS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UNMIIL', 1, 1, 'Promotion', '2004-02-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UNMIIL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2004-02-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UNMIIL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UQEEMC', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UQEEMC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UQEEMC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'URLUFB', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'URLUFB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'URLUFB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'USDNBI', 1, 1, 'Promotion', '2000-02-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'USDNBI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'USDNBI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'USJNOR', 1, 1, 'Promotion', '2004-05-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'USJNOR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2004-05-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'USJNOR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'USQQAS', 1, 1, 'Promotion', '2005-02-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'USQQAS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-02-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'USQQAS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UTRBWX', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UTRBWX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UTRBWX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UUDUPD', 1, 1, 'Promotion', '2009-07-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UUDUPD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UUDUPD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UUMJYK', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UUMJYK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UUMJYK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UWITQI', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UWITQI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UWITQI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UYWUGX', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UYWUGX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UYWUGX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'UYXQXK', 1, 1, 'Promotion', '2017-10-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'UYXQXK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-10-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'UYXQXK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBHJBI', 1, 1, 'Promotion', '2014-02-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBHJBI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-02-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBHJBI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBXQWZ', 1, 1, 'Promotion', '2017-08-14', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBXQWZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-08-14', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBXQWZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WBYTNS', 1, 1, 'Promotion', '2018-11-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WBYTNS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-11-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WBYTNS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCEBYK', 1, 1, 'Promotion', '2009-03-19', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCEBYK' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-03-19', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCEBYK' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCHDRX', 1, 1, 'Promotion', '2017-09-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCHDRX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-09-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCHDRX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WCLZPS', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WCLZPS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WCLZPS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WDCTEQ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WDCTEQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WDCTEQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WFYYDD', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WFYYDD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WFYYDD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WGFXJN', 1, 1, 'Promotion', '2014-05-06', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WGFXJN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WGFXJN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WIZNWD', 1, 1, 'Promotion', '2017-04-27', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WIZNWD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-04-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WIZNWD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WMBCOX', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WMBCOX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WMBCOX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WMCHBC', 1, 1, 'Promotion', '1997-05-23', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WMCHBC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1997-05-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WMCHBC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WMYDYG', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WMYDYG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WMYDYG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WOIMFW', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WOIMFW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WOIMFW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WOTACM', 1, 1, 'Promotion', '2000-05-27', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WOTACM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-05-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WOTACM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WOYMIF', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WOYMIF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WOYMIF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WOYQFU', 1, 1, 'Promotion', '2017-07-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WOYQFU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-07-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WOYQFU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WPKTEX', 1, 1, 'Promotion', '2005-04-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WPKTEX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-04-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WPKTEX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WPTNOW', 1, 1, 'Promotion', '2005-05-23', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WPTNOW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2005-05-23', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WPTNOW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WSZYEQ', 1, 1, 'Promotion', '2012-05-11', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WSZYEQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2012-05-11', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WSZYEQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WTRJWW', 1, 1, 'Promotion', '2000-02-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WTRJWW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WTRJWW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'WYGJBJ', 1, 1, 'Promotion', '2007-03-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'WYGJBJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2007-03-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'WYGJBJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XDSALJ', 1, 1, 'Promotion', '2017-05-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XDSALJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XDSALJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XDYUZR', 1, 1, 'Promotion', '2009-06-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XDYUZR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-06-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XDYUZR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XFAIAP', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XFAIAP' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XFAIAP' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XFZPYJ', 1, 1, 'Promotion', '2009-12-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XFZPYJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-12-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XFZPYJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XGKBOG', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XGKBOG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XGKBOG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XHLXLR', 1, 1, 'Promotion', '2017-06-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XHLXLR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XHLXLR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XIPLWU', 1, 1, 'Promotion', '2000-03-06', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XIPLWU' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-03-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XIPLWU' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XJKZWF', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XJKZWF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XJKZWF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XKYINB', 1, 1, 'Promotion', '2013-08-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XKYINB' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-08-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XKYINB' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XMDMXD', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XMDMXD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XMDMXD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XMQMUR', 1, 1, 'Promotion', '2017-05-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XMQMUR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XMQMUR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNEZKC', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNEZKC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNEZKC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNNEWC', 1, 1, 'Promotion', '2017-06-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNNEWC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNNEWC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XNTMAR', 1, 1, 'Promotion', '2021-08-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XNTMAR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2021-08-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XNTMAR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XOPIYD', 1, 1, 'Promotion', '2014-03-06', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XOPIYD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-03-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XOPIYD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XOZSKZ', 1, 1, 'Promotion', '2017-11-30', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XOZSKZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-11-30', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XOZSKZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPAJQZ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPAJQZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPAJQZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPKNSF', 1, 1, 'Promotion', '2010-12-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPKNSF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPKNSF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPLFJH', 1, 1, 'Promotion', '2002-01-18', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPLFJH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-01-18', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPLFJH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XPYMXR', 1, 1, 'Promotion', '2009-05-04', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XPYMXR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2009-05-04', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XPYMXR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XRHJQL', 1, 1, 'Promotion', '2017-07-12', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XRHJQL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-07-12', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XRHJQL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XRZYYL', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XRZYYL' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XRZYYL' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XTKDRN', 1, 1, 'Promotion', '2017-07-01', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XTKDRN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-07-01', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XTKDRN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XTRRMD', 1, 1, 'Promotion', '2000-02-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XTRRMD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XTRRMD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XTSSAQ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XTSSAQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XTSSAQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XUKTIY', 1, 1, 'Promotion', '1993-12-08', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XUKTIY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('1993-12-08', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XUKTIY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XYSDGC', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XYSDGC' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XYSDGC' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XZCIPW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XZCIPW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XZCIPW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'XZOZFS', 1, 1, 'Promotion', '2003-10-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'XZOZFS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-10-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'XZOZFS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YADLQY', 1, 1, 'Promotion', '2007-05-21', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YADLQY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2007-05-21', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YADLQY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YCIBYO', 1, 1, 'Promotion', '2011-09-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YCIBYO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2011-09-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YCIBYO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YDMWDH', 1, 1, 'Promotion', '2014-05-06', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YDMWDH' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YDMWDH' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YFBCJZ', 1, 1, 'Promotion', '2026-03-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YFBCJZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-03-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YFBCJZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YHCLEY', 1, 1, 'Promotion', '2017-06-27', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YHCLEY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-27', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YHCLEY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YICUYW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YICUYW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YICUYW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJDUCX', 1, 1, 'Promotion', '2013-09-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJDUCX' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2013-09-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJDUCX' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YJYAJS', 1, 1, 'Promotion', '2017-05-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YJYAJS' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-05-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YJYAJS' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YLRHGT', 1, 1, 'Promotion', '2003-01-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YLRHGT' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2003-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YLRHGT' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YMMPSD', 1, 1, 'Promotion', '2010-12-15', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YMMPSD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2010-12-15', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YMMPSD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YNKBWD', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YNKBWD' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YNKBWD' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YOGCUE', 1, 1, 'Promotion', '2002-05-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YOGCUE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-05-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YOGCUE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YPPTJI', 1, 1, 'Promotion', '2014-05-05', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YPPTJI' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-05', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YPPTJI' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YPYJHQ', 1, 1, 'Promotion', '2000-02-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YPYJHQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YPYJHQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YQPANG', 1, 1, 'Promotion', '2016-12-29', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YQPANG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-12-29', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YQPANG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRITDG', 1, 1, 'Promotion', '2017-06-06', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRITDG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-06', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRITDG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRPURE', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRPURE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRPURE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YRTLME', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YRTLME' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YRTLME' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YTSXPY', 1, 1, 'Promotion', '2002-08-13', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YTSXPY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-08-13', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YTSXPY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YXQYMW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YXQYMW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YXQYMW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'YYPSUQ', 1, 1, 'Promotion', '2014-05-07', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'YYPSUQ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-07', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'YYPSUQ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZBKXOG', 1, 1, 'Promotion', '2002-02-17', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZBKXOG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2002-02-17', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZBKXOG' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZDYPEF', 1, 1, 'Promotion', '2016-10-25', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZDYPEF' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2016-10-25', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZDYPEF' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFLTJJ', 1, 1, 'Promotion', '2014-05-03', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFLTJJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-05-03', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFLTJJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFUADN', 1, 1, 'Promotion', '2000-02-09', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFUADN' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2000-02-09', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFUADN' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZFYRTA', 1, 1, 'Promotion', '2006-03-28', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZFYRTA' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2006-03-28', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZFYRTA' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZIHCXY', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZIHCXY' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZIHCXY' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZOPNYM', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZOPNYM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZOPNYM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZPUMGO', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZPUMGO' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZPUMGO' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZQPPUE', 1, 1, 'Promotion', '2014-01-10', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZQPPUE' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-01-10', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZQPPUE' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZRESOJ', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZRESOJ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZRESOJ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZTDWGZ', 1, 1, 'Promotion', '2017-06-20', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZTDWGZ' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2017-06-20', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZTDWGZ' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZUOCEM', 1, 1, 'Promotion', '2014-01-24', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZUOCEM' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2014-01-24', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZUOCEM' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWRZPW', 1, 1, 'Promotion', '2015-08-31', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWRZPW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2015-08-31', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWRZPW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZWXDNW', 1, 1, 'Promotion', '2026-02-26', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZWXDNW' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2026-02-26', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZWXDNW' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXBQQR', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXBQQR' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXBQQR' AND p.to_designation_id = 1);
INSERT INTO div_promotion_history (staff_hrms_id, from_designation_id, to_designation_id, change_type, posting_date, remarks, created_by)
SELECT 'ZXENJG', 1, 1, 'Promotion', '2018-04-16', 'ALP posting (KYN lobby sheets)', 'kyn_full_data_2026-10-07'
FROM div_staff_master s WHERE s.hrms_id = 'ZXENJG' AND s.date_of_appointment IS NOT NULL
  AND DATEDIFF('2018-04-16', s.date_of_appointment) BETWEEN 0 AND 730
  AND NOT EXISTS (SELECT 1 FROM div_promotion_history p WHERE p.staff_hrms_id = 'ZXENJG' AND p.to_designation_id = 1);
SELECT COUNT(*) AS alp_posting_inserted FROM div_promotion_history WHERE created_by = 'kyn_full_data_2026-10-07' AND to_designation_id = 1;
