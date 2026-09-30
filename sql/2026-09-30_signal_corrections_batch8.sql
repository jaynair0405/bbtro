-- Signal book corrections, batch 8 (user, 2026-09-30): old unlabelled route indicators whose arm counts
-- did not match the text (list: ~/Desktop/signals-diversion-side-check.txt). Every copy (same magnet) set alike.
-- 1. VVH S-107, VVH S-108 (CLA-KYN 5TH): one left arm. "RI: S-21 ; Y=S-22", 1 L / 1 R -> "RI: L1= S-21; Y= S-22", 1 L / 0 R.
-- 2. KYN S-25 (CLA-KYN 5TH + DCC-KYN DIVA UP/DN copies): one right arm. The 5th-line copy had "RI: Y=PF-6 ; PF-7",
--    0 L / 2 R; the DCC-KYN copies were already right. All three -> "RI: R1= PF-7; Y= PF-6", 0 L / 1 R.
-- 3. KYN S-4 (5TH + DCC-KYN copies): one right arm -> "RI: R1= KYN YD; Y= KYN S-9", 0 L / 1 R (5th copy said 0/2).
-- 4. TNA S-47 (5TH): one right arm -> "RI: R1= PF-10; Y= PF-9", 0 L / 1 R (was 0/2, unlabelled).
-- 5. DW S-4 (5TH): 1 L / 1 R -> "RI: L1= DN TH (DW S-7); R1= DW S-9; Y= DW S-8" (was 1/2; left arm said "UPTH", user: DN TH).
-- 6. DW S-68 (6TH + DCC-DIVA copy): two left arms, L2 the lower -> "RI: L1= PF-6; L2= PF-8; Y= DW S-55", 2 L / 0 R
--    (6th copy said 2/1; the DCC-DIVA copy was already right).
-- Undo: 2026-09-30_signal_corrections_batch8_UNDO.sql
START TRANSACTION;
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= S-21; Y= S-22', s.ri_left_arms = 1, s.ri_right_arms = 0,
       r.display_description = 'RI: L1= S-21; Y= S-22'
 WHERE s.section = 'CLA-KYN' AND s.line = '5TH' AND s.signal_number IN ('VVH S-107', 'VVH S-108') AND s.is_active = 1
   AND s.book_description = 'RI: S-21 ; Y=S-22';
SELECT ROW_COUNT() AS vvh_107_108;                                              -- expect 4 (2 signals + 2 book rows)
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1= PF-7; Y= PF-6', s.ri_left_arms = 0, s.ri_right_arms = 1,
       r.display_description = 'RI: R1= PF-7; Y= PF-6'
 WHERE s.is_active = 1 AND s.magnet_id = (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section = 'CLA-KYN' AND line = '5TH' AND signal_number = 'KYN S-25') x);
SELECT ROW_COUNT() AS kyn_s25;                                                  -- expect 6 (3 copies + 3 book rows)
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1= KYN YD; Y= KYN S-9', s.ri_left_arms = 0, s.ri_right_arms = 1, r.display_description = 'RI: R1= KYN YD; Y= KYN S-9'
 WHERE s.is_active = 1 AND s.magnet_id = (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section = 'CLA-KYN' AND line = '5TH' AND signal_number = 'KYN S-4') x);
SELECT ROW_COUNT() AS kyn_s_4;                                                  -- expect 6
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1= PF-10; Y= PF-9', s.ri_left_arms = 0, s.ri_right_arms = 1, r.display_description = 'RI: R1= PF-10; Y= PF-9'
 WHERE s.is_active = 1 AND s.magnet_id = (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section = 'CLA-KYN' AND line = '5TH' AND signal_number = 'TNA S-47') x);
SELECT ROW_COUNT() AS tna_s_47;                                                  -- expect 2
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= DN TH (DW S-7); R1= DW S-9; Y= DW S-8', s.ri_left_arms = 1, s.ri_right_arms = 1, r.display_description = 'RI: L1= DN TH (DW S-7); R1= DW S-9; Y= DW S-8'
 WHERE s.is_active = 1 AND s.magnet_id = (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section = 'CLA-KYN' AND line = '5TH' AND signal_number = 'DW S-4') x);
SELECT ROW_COUNT() AS dw_s_4;                                                  -- expect 2
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= PF-6; L2= PF-8; Y= DW S-55', s.ri_left_arms = 2, s.ri_right_arms = 0, r.display_description = 'RI: L1= PF-6; L2= PF-8; Y= DW S-55'
 WHERE s.is_active = 1 AND s.magnet_id = (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section = 'CLA-KYN' AND line = '6TH' AND signal_number = 'DW S-68') x);
SELECT ROW_COUNT() AS dw_s_68;                                                  -- expect 4
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT id, 'Description Changed', NULL, book_description, CURDATE(), 'Route indicator corrected (user 30 Sep, batch 8)'
    FROM div_signals WHERE is_active = 1 AND ((section = 'CLA-KYN' AND line = '5TH' AND signal_number IN ('VVH S-107', 'VVH S-108'))
      OR magnet_id IN (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section = 'CLA-KYN' AND is_active = 1
                        AND ((line = '5TH' AND signal_number IN ('KYN S-25', 'KYN S-4', 'TNA S-47', 'DW S-4')) OR (line = '6TH' AND signal_number = 'DW S-68'))) y));
COMMIT;
