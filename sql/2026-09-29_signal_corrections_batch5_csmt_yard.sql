-- Signal book corrections, batch 5: CSMT yard diversions per the CSMT diversion diagram
-- (data/CSMT_KYN/csmt-diversions.jpeg), compared signal by signal and reviewed by the user on 2026-09-29.
-- Applied to EVERY copy of each signal (station CSMT, same number: DN/UP TH, DN/UP LOC, HB pages) and its book row.
--   Diversions corrected: S-12 (L1 S-76, Y S-62), S-13 (R1 S-50), S-34 (no arms, Y,YY,G = H-03), S-55 (left arms
--   PF-16/17/18 top to bottom), S-1 (label DN LL L-001).  S-62's right arm to S-50 was already right (user).
--   Main route (as written in the diagram, "Y" or "Y,YY,G") added on 25 signals.
--   RHS: S-26 (UP TH copy), S-27 (both copies), S-62 -> placement Right, is_rhs 1, row red.
--   Not in this batch: CSMT S-58 and S-50 (7th line — no page yet), K-001 (old number of S-45).
-- Undo: restore from the local backup of this date / the prod pre-apply backup (text-only change per signal).
START TRANSACTION;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1= DN LL L-001; MAIN=Y,YY,G= S-34', s.ri_left_arms = 0, s.ri_right_arms = 1, r.display_description = 'RI: R1= DN LL L-001; MAIN=Y,YY,G= S-34'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS1' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1=H-03; R1=S-45; MAIN=Y,YY,G= L-001', s.ri_left_arms = 1, s.ri_right_arms = 1, r.display_description = 'RI: L1=H-03; R1=S-45; MAIN=Y,YY,G= L-001'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS3' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1=L-001; L2=H-03; MAIN=Y,YY,G= S-45', s.ri_left_arms = 2, s.ri_right_arms = 0, r.display_description = 'RI: L1=L-001; L2=H-03; MAIN=Y,YY,G= S-45'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS5' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y= S-45', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: Y= S-45'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS7' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y= S-45', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: Y= S-45'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS8' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y= S-45', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: Y= S-45'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS9' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= CSMT S-76; Y= CSMT S-62', s.ri_left_arms = 1, s.ri_right_arms = 0, r.display_description = 'RI: L1= CSMT S-76; Y= CSMT S-62'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS12' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= CSMT S-62; R1= CSMT S-50', s.ri_left_arms = 1, s.ri_right_arms = 1, r.display_description = 'RI: L1= CSMT S-62; R1= CSMT S-50'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS13' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y= CSMT S-59', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: Y= CSMT S-59'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS16' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y= CSMT S-59', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: Y= CSMT S-59'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS17' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y= CSMT S-59', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: Y= CSMT S-59'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS18' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1=PF-1; Y= PF-2', s.ri_left_arms = 0, s.ri_right_arms = 1, r.display_description = 'RI: R1=PF-1; Y= PF-2'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS23' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y= PF-3', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: Y= PF-3'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS24' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1= PF-3; Y= PF-4', s.ri_left_arms = 0, s.ri_right_arms = 1, r.display_description = 'RI: R1= PF-3; Y= PF-4'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS26' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= PF-6; Y= PF-5', s.ri_left_arms = 1, s.ri_right_arms = 0, r.display_description = 'RI: L1= PF-6; Y= PF-5'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS27' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y= PF-6', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: Y= PF-6'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS28' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: MAIN=Y,YY,G= H-03', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: MAIN=Y,YY,G= H-03'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS34' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: MAIN=Y,YY,G= S-56', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: MAIN=Y,YY,G= S-56'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS45' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: MAIN=Y,YY= S-23', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: MAIN=Y,YY= S-23'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS46' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= PF-7; L2= PF-8; L3= PF-9; R1= S-27; R2= S-26; MAIN=Y,YY= S-28', s.ri_left_arms = 3, s.ri_right_arms = 2, r.display_description = 'RI: L1= PF-7; L2= PF-8; L3= PF-9; R1= S-27; R2= S-26; MAIN=Y,YY= S-28'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS48' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1=S-24; L2=S-26; L3=S-27; Y= S-46', s.ri_left_arms = 3, s.ri_right_arms = 0, r.display_description = 'RI: L1=S-24; L2=S-26; L3=S-27; Y= S-46'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS53' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= S-27; R1= S-24; R2= S-23; Y= S-26', s.ri_left_arms = 1, s.ri_right_arms = 2, r.display_description = 'RI: L1= S-27; R1= S-24; R2= S-23; Y= S-26'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS54' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= PF-16; L2= PF-17; L3= PF-18; R1= PF-15; R2= PF-14', s.ri_left_arms = 3, s.ri_right_arms = 2, r.display_description = 'RI: L1= PF-16; L2= PF-17; L3= PF-18; R1= PF-15; R2= PF-14'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS55' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: MAIN=Y,YY,G= MZN S-5', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: MAIN=Y,YY,G= MZN S-5'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS56' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: MAIN=Y,YY= S-53', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: MAIN=Y,YY= S-53'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS57' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= DN TH MZN S-5; Y= CSMT S-50 (7TH LINE)', s.ri_left_arms = 1, s.ri_right_arms = 0, r.display_description = 'RI: L1= DN TH MZN S-5; Y= CSMT S-50 (7TH LINE)'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS59' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= PF-10/11/12; L2= S-63; L3= S-55; Y= S-81', s.ri_left_arms = 3, s.ri_right_arms = 0, r.display_description = 'RI: L1= PF-10/11/12; L2= S-63; L3= S-55; Y= S-81'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS61' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1= CSMT S-50; Y= MZN S-5', s.ri_left_arms = 0, s.ri_right_arms = 1, r.display_description = 'RI: R1= CSMT S-50; Y= MZN S-5'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS62' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1=PF-14; L2= PF-15; Y= PF-13', s.ri_left_arms = 2, s.ri_right_arms = 0, r.display_description = 'RI: L1=PF-14; L2= PF-15; Y= PF-13'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS63' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y= MZN S-5', s.ri_left_arms = 0, s.ri_right_arms = 0, r.display_description = 'RI: Y= MZN S-5'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS76' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= PF-10; L2= PF-11; L3= PF-12; MAIN=Y,YY= S-48', s.ri_left_arms = 3, s.ri_right_arms = 0, r.display_description = 'RI: L1= PF-10; L2= PF-11; L3= PF-12; MAIN=Y,YY= S-48'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number = 'CSMTS81' AND s.is_active = 1;
UPDATE div_signals s LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.placement = 'Right', s.is_rhs = 1, s.is_lhs = 0, r.text_color = 'RED'
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number IN ('CSMTS26', 'CSMTS27', 'CSMTS62') AND s.is_active = 1;
COMMIT;
SELECT s.signal_number, CONCAT(s.section,' ',s.line) AS page, s.is_rhs, s.ri_left_arms AS l, s.ri_right_arms AS r, r.display_description
  FROM div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
 WHERE s.station_code = 'CSMT' AND s.normalized_signal_number IN ('CSMTS1', 'CSMTS3', 'CSMTS5', 'CSMTS7', 'CSMTS8', 'CSMTS9', 'CSMTS12', 'CSMTS13', 'CSMTS16', 'CSMTS17', 'CSMTS18', 'CSMTS23', 'CSMTS24', 'CSMTS26', 'CSMTS27', 'CSMTS28', 'CSMTS34', 'CSMTS45', 'CSMTS46', 'CSMTS48', 'CSMTS53', 'CSMTS54', 'CSMTS55', 'CSMTS56', 'CSMTS57', 'CSMTS59', 'CSMTS61', 'CSMTS62', 'CSMTS63', 'CSMTS76', 'CSMTS81')
 ORDER BY CAST(SUBSTRING(s.normalized_signal_number, 6) AS UNSIGNED), page;
