-- Signal book corrections, batch 7 (user, 2026-09-30). Each signal has one book row (no other copies).
-- 1. MLND S-2 (CLA-KYN 5TH, from NGSM yard): text "DNTH ; Y=5TH LINE" had no "RI:" and no arm count, so no
--    diagram was drawn. -> "RI: L1= DN TH; Y= 5TH LINE", 1 left arm (DN TH is on the left from the 5th line,
--    as for VVH S-21/S-31, MLND S-1, TNA S-74, DI S-26).
-- 2. VVH S-36 (CLA-KYN 6TH): one more right arm, R2 = UP TH (VVH S-9). 3 L / 1 R -> 3 L / 2 R.
--    The bottom label "MAIN= UP TH" removed: it read as a main route Y= UP TH, which it is not.
-- 3. BSR S-27 (KOPAR-BSR UP): main route Y = DIVA-5 (BSR S-59, "PF-6 STR (DIVA-5)"), between L1 DIVA-4 and R1 DIVA-6.
-- 4. MLND S-31 (CLA-KYN 6TH): "RI: RD 3 TO 5 ; Y=RD 1.2" drew RD 1,2 as a main route. The signal has one left and
--    one right arm: -> "RI: L1= RD 3,4,5; R1= RD 1,2" (no main route), arms 1 L / 1 R unchanged.
-- (DCC S-8's "Y=ME-4403" was already in the data; its first letter was clipped by the drawing - fixed in
--  scripts/render-signal-book.js.)
-- Undo: 2026-09-30_signal_corrections_batch7_UNDO.sql
START TRANSACTION;
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= DN TH; Y= 5TH LINE', s.ri_left_arms = 1, s.ri_right_arms = 0,
       s.route_indicator_notes = 'Book shows one left arm (DN TH), main route 5TH LINE',
       r.display_description = 'RI: L1= DN TH; Y= 5TH LINE'
 WHERE s.section = 'CLA-KYN' AND s.line = '5TH' AND s.signal_number = 'MLND S-2' AND s.book_description = 'DNTH ; Y=5TH LINE';
SELECT ROW_COUNT() AS mlnd_s2;                                                  -- expect 2
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= CLA S-50; L2= DN LTT; L3= UP LTT; R1= F-LOOP; R2= UP TH (VVH S-9)',
       s.ri_right_arms = 2,
       r.display_description = 'RI: L1= CLA S-50; L2= DN LTT; L3= UP LTT; R1= F-LOOP; R2= UP TH (VVH S-9)'
 WHERE s.section = 'CLA-KYN' AND s.line = '6TH' AND s.signal_number = 'VVH S-36'
   AND s.book_description = 'RI: L1= CLA S-50; L2= DN LTT; L3= UP LTT; R1= F-LOOP; MAIN= UP TH';
SELECT ROW_COUNT() AS vvh_s36;                                                  -- expect 2
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1=TO DIVA-4 (BSR S-57); R1=TO DIVA-6 (BSR S-61); Y= TO DIVA-5 (BSR S-59)',
       r.display_description = 'RI: L1=TO DIVA-4 (BSR S-57); R1=TO DIVA-6 (BSR S-61); Y= TO DIVA-5 (BSR S-59)'
 WHERE s.section = 'KOPAR-BSR' AND s.line = 'BSR UP' AND s.signal_number = 'BSR S-27'
   AND s.book_description = 'RI: L1=TO DIVA-4 (BSR S-57); R1=TO DIVA-6 (BSR S-61)';
SELECT ROW_COUNT() AS bsr_s27;                                                  -- expect 2
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= RD 3,4,5; R1= RD 1,2',
       s.route_indicator_notes = 'Book shows one left arm (RD 3,4,5) and one right arm (RD 1,2)',
       r.display_description = 'RI: L1= RD 3,4,5; R1= RD 1,2'
 WHERE s.section = 'CLA-KYN' AND s.line = '6TH' AND s.signal_number = 'MLND S-31' AND s.book_description = 'RI: RD 3 TO 5 ; Y=RD 1.2';
SELECT ROW_COUNT() AS mlnd_s31;                                                 -- expect 2
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT id, 'Description Changed', NULL, book_description, CURDATE(), 'Route indicator corrected (user 30 Sep, batch 7)'
    FROM div_signals WHERE is_active = 1 AND ((section = 'CLA-KYN' AND line = '5TH' AND signal_number = 'MLND S-2')
      OR (section = 'CLA-KYN' AND line = '6TH' AND signal_number = 'VVH S-36') OR (section = 'KOPAR-BSR' AND line = 'BSR UP' AND signal_number = 'BSR S-27')
      OR (section = 'CLA-KYN' AND line = '6TH' AND signal_number = 'MLND S-31'));
COMMIT;
