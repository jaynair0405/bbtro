-- Undo 2026-09-30_signal_corrections_batch7.sql
START TRANSACTION;
DELETE h FROM div_signal_history h JOIN div_signals s ON s.id = h.signal_id
 WHERE h.change_type = 'Description Changed' AND h.remarks = 'Route indicator corrected (user 30 Sep, batch 7)';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'DNTH ; Y=5TH LINE', s.ri_left_arms = 0, s.ri_right_arms = 0,
       s.route_indicator_notes = 'Book shows route indicator DNTH with Y=5TH LINE (RHS)', r.display_description = 'DNTH ; Y=5TH LINE'
 WHERE s.section = 'CLA-KYN' AND s.line = '5TH' AND s.signal_number = 'MLND S-2';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= CLA S-50; L2= DN LTT; L3= UP LTT; R1= F-LOOP; MAIN= UP TH', s.ri_right_arms = 1,
       r.display_description = 'RI: L1= CLA S-50; L2= DN LTT; L3= UP LTT; R1= F-LOOP; MAIN= UP TH'
 WHERE s.section = 'CLA-KYN' AND s.line = '6TH' AND s.signal_number = 'VVH S-36';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1=TO DIVA-4 (BSR S-57); R1=TO DIVA-6 (BSR S-61)',
       r.display_description = 'RI: L1=TO DIVA-4 (BSR S-57); R1=TO DIVA-6 (BSR S-61)'
 WHERE s.section = 'KOPAR-BSR' AND s.line = 'BSR UP' AND s.signal_number = 'BSR S-27';
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: RD 3 TO 5 ; Y=RD 1.2',
       s.route_indicator_notes = 'Book shows route indicator RD 3 TO 5 / Y=RD 1 and 2 (RHS)',
       r.display_description = 'RI: RD 3 TO 5 ; Y=RD 1.2'
 WHERE s.section = 'CLA-KYN' AND s.line = '6TH' AND s.signal_number = 'MLND S-31';
COMMIT;
