-- UP LOC (CSMT-KYN) diversions all to the LEFT. Local + prod.
-- Date: 2026-08-17. Per HQ CLI: these signals' diversions are leftward.
-- RI-hand signals: move all arms to the left (bare RI: string is positional, so
--   ri_left_arms/ri_right_arms drive the side).
UPDATE div_signals SET ri_left_arms = ri_right_arms, ri_right_arms = 0
 WHERE section='CSMT-KYN' AND line='UP LOC' AND direction='UP'
   AND signal_number IN ('KYN S-14','KYN S-16','KYN S-17');
-- Flag-marker signals: mark left (ri_left_arms=1 = flag side; renderer points it left).
UPDATE div_signals SET ri_left_arms = 1, ri_right_arms = 0
 WHERE section='CSMT-KYN' AND line='UP LOC' AND direction='UP'
   AND signal_number IN ('DW S-66','TNA S-88','TNA S-59','MLND S-17','VVH S-33',
                         'CLA S-34','PR S-12','BY S-39','CSMT S-27');
SELECT signal_number, ri_left_arms L, ri_right_arms R, book_description
FROM div_signals WHERE is_active=1 AND section='CSMT-KYN' AND line='UP LOC' AND direction='UP'
  AND signal_number IN ('KYN S-14','KYN S-16','KYN S-17','DW S-66','TNA S-88','TNA S-59',
                        'MLND S-17','VVH S-33','CLA S-34','PR S-12','BY S-39','CSMT S-27')
ORDER BY (book_description LIKE 'RI:%') DESC, signal_number;
