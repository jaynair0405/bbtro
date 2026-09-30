-- Undo 2026-09-30_signal_corrections_batch8.sql
START TRANSACTION;
DELETE FROM div_signal_history WHERE change_type = 'Description Changed' AND remarks = 'Route indicator corrected (user 30 Sep, batch 8)';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: S-21 ; Y=S-22', s.ri_left_arms = 1, s.ri_right_arms = 1, r.display_description = 'RI: S-21 ; Y=S-22'
 WHERE s.section = 'CLA-KYN' AND s.line = '5TH' AND s.signal_number IN ('VVH S-107', 'VVH S-108');
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y=PF-6 ; PF-7', s.ri_right_arms = 2, r.display_description = 'RI: Y=PF-6 ; PF-7'
 WHERE s.section = 'CLA-KYN' AND s.line = '5TH' AND s.signal_number = 'KYN S-25';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1=PF-7; Y= PF-6', r.display_description = 'RI: R1=PF-7; Y= PF-6'
 WHERE s.section = 'DCC-KYN' AND s.line IN ('DIVA UP', 'DIVA DN') AND s.signal_number = 'KYN S-25';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: Y=KYN S-9 ; KYN YD', s.ri_right_arms = 2, r.display_description = 'RI: Y=KYN S-9 ; KYN YD'
 WHERE s.section = 'CLA-KYN' AND s.line = '5TH' AND s.signal_number = 'KYN S-4';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1=KYN YD; Y= KYN S-9', r.display_description = 'RI: R1=KYN YD; Y= KYN S-9'
 WHERE s.section = 'DCC-KYN' AND s.line IN ('DIVA UP', 'DIVA DN') AND s.signal_number = 'KYN S-4';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: PF-10 ; Y=PF-9', s.ri_right_arms = 2, r.display_description = 'RI: PF-10 ; Y=PF-9'
 WHERE s.section = 'CLA-KYN' AND s.line = '5TH' AND s.signal_number = 'TNA S-47';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: UPTH (DW S-7) ; DW S-9 ; Y=DW S-8', s.ri_right_arms = 2, r.display_description = 'RI: UPTH (DW S-7) ; DW S-9 ; Y=DW S-8'
 WHERE s.section = 'CLA-KYN' AND s.line = '5TH' AND s.signal_number = 'DW S-4';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: PF-6 ; PF-8 ; Y=DW S-55', s.ri_right_arms = 1, r.display_description = 'RI: PF-6 ; PF-8 ; Y=DW S-55'
 WHERE s.section = 'CLA-KYN' AND s.line = '6TH' AND s.signal_number = 'DW S-68';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1=PF-6; L2=PF-8; Y= DW S-55', r.display_description = 'RI: L1=PF-6; L2=PF-8; Y= DW S-55'
 WHERE s.section = 'DCC-DIVA' AND s.line = 'DIVA DN' AND s.signal_number = 'DW S-68';
COMMIT;
