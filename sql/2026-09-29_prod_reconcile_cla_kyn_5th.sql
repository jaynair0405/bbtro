-- PROD ONLY, run LAST (after all 2026-09-29 signal files).
-- On 29 Sep 2026 ~14:54 IST the CLA-KYN 5TH page was republished on prod with the OLD editor, which re-serialised the
-- RI text and arm counts of these 23 signals (e.g. flag markers turned into "RI: MAIN=...", TNA S-5 one-left-one-right).
-- The corrections of batch 1/2/3 were guarded on the pre-republish values and so did not apply to them on prod.
-- This sets the 23 signal records to the values reviewed and tested on local (the book rows are already identical).
-- Ids are the same on local and prod for these existing signals.
START TRANSACTION;
UPDATE div_signals SET book_description = 'RI: S-21 ; Y=S-22', ri_left_arms = 1, ri_right_arms = 1 WHERE id = 631 AND signal_number = 'VVH S-107' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: S-21 ; Y=S-22', ri_left_arms = 1, ri_right_arms = 1 WHERE id = 632 AND signal_number = 'VVH S-108' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: Y=S-21 ; S-22', ri_left_arms = 0, ri_right_arms = 1 WHERE id = 633 AND signal_number = 'VVH S-109' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: Y=S-21 ; S-22', ri_left_arms = 0, ri_right_arms = 1 WHERE id = 634 AND signal_number = 'VVH S-111' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: Y=S-21 ; S-22', ri_left_arms = 0, ri_right_arms = 1 WHERE id = 635 AND signal_number = 'VVH S-112' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'DN TH S-37 ; Y=VVH S-45', ri_left_arms = 1, ri_right_arms = 0 WHERE id = 638 AND signal_number = 'VVH S-21' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'Y= VVH S-45', ri_left_arms = 0, ri_right_arms = 0 WHERE id = 639 AND signal_number = 'VVH S-22' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'DN TH S-37', ri_left_arms = 1, ri_right_arms = 0 WHERE id = 640 AND signal_number = 'VVH S-31' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'GC UDL', ri_left_arms = 0, ri_right_arms = 0 WHERE id = 641 AND signal_number = 'VVH S-45' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'BND UDL', ri_left_arms = 0, ri_right_arms = 0 WHERE id = 652 AND signal_number = 'BND S-7' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'NGSM YD', ri_left_arms = 0, ri_right_arms = 0 WHERE id = 656 AND signal_number = 'NHR S-1' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'DNTH ; Y=5TH LINE', ri_left_arms = 0, ri_right_arms = 0 WHERE id = 658 AND signal_number = 'MLND S-2' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'DN TH (MLND S-6)', ri_left_arms = 1, ri_right_arms = 0 WHERE id = 659 AND signal_number = 'MLND S-1' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: PF-8 ; TR HB S-47 ; Y=PF-7', ri_left_arms = 0, ri_right_arms = 2 WHERE id = 663 AND signal_number = 'TNA S-5' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: PF-10 ; Y=PF-9', ri_left_arms = 0, ri_right_arms = 2 WHERE id = 664 AND signal_number = 'TNA S-47' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'DN TH (K-3403)', ri_left_arms = 1, ri_right_arms = 0 WHERE id = 667 AND signal_number = 'TNA S-74' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: UPTH (DW S-7) ; DW S-9 ; Y=DW S-8', ri_left_arms = 1, ri_right_arms = 2 WHERE id = 677 AND signal_number = 'DW S-4' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: PF-6 ; GL-1 ; GL-2 ; Y=PF-7', ri_left_arms = 1, ri_right_arms = 2 WHERE id = 678 AND signal_number = 'DW S-9' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: DCC LOOP ; DCC M/L ; Y=ME-4403', ri_left_arms = 0, ri_right_arms = 2 WHERE id = 681 AND signal_number = 'DCC S-8' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'DN TH (DI S-39)', ri_left_arms = 1, ri_right_arms = 0 WHERE id = 686 AND signal_number = 'DI S-26' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: Y=KYN S-9 ; KYN YD', ri_left_arms = 0, ri_right_arms = 2 WHERE id = 691 AND signal_number = 'KYN S-4' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: DN TH (S-13) ; DN LL (S-32) ; S-28 ; Y=S-25', ri_left_arms = 3, ri_right_arms = 0 WHERE id = 692 AND signal_number = 'KYN S-9' AND section = 'CLA-KYN' AND line = '5TH';
UPDATE div_signals SET book_description = 'RI: Y=PF-6 ; PF-7', ri_left_arms = 0, ri_right_arms = 2 WHERE id = 693 AND signal_number = 'KYN S-25' AND section = 'CLA-KYN' AND line = '5TH';
SELECT COUNT(*) AS reconciled FROM div_signals WHERE id IN (631,632,633,634,635,638,639,640,641,652,656,658,659,663,664,667,677,678,681,686,691,692,693);   -- 23 rows exist
COMMIT;
