-- Signal book corrections, batch 1 (user, 2026-09-29). Undo notes per item.
-- 1. CLA S-47 (CSMT-KYN UP TH): location text 'On Gantry' (was '14/421', a copy of its km; km_text stays 14/421).
--    Undo: location_text / display_location back to '14/421'.
START TRANSACTION;
SET @cla47 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='UP TH' AND direction='UP' AND signal_number='CLA S-47');
UPDATE div_signals SET location_text = 'On Gantry' WHERE id = @cla47 AND location_text = '14/421';
UPDATE div_signal_book_rows SET display_location = 'On Gantry' WHERE signal_id = @cla47 AND display_location = '14/421';
SELECT ROW_COUNT() AS cla47_book_row_updated;                                   -- expect 1
COMMIT;

-- 2. VVH S-11 (CLA-KYN 5TH, DN) is EXTREME right-hand: placement 'Extreme Right', is_rhs 0, is_ext_rhs 1, row red —
--    the same as all 168 existing Ext RHS signals.  Undo: placement 'Right', is_rhs 1, is_ext_rhs 0.
-- 3. VVH S-21 and VVH S-31 (CLA-KYN 5TH): their diversion hand (flag marker "DN TH S-37") is on the LEFT (L1).
--    The renderer puts a flag on the left only when ri_left_arms > ri_right_arms; both had 0/0, so it drew R1.
--    Set ri_left_arms = 1, as for the other left-hand flag signals.  Undo: ri_left_arms back to 0.
START TRANSACTION;
SET @vvh11 = (SELECT id FROM div_signals WHERE section='CLA-KYN' AND line='5TH' AND direction='DN' AND signal_number='VVH S-11');
UPDATE div_signals SET placement = 'Extreme Right', is_rhs = 0, is_ext_rhs = 1 WHERE id = @vvh11 AND is_ext_rhs = 0;
SELECT ROW_COUNT() AS vvh11_updated;                                            -- expect 1
UPDATE div_signal_book_rows SET text_color = 'RED' WHERE signal_id = @vvh11;
UPDATE div_signals SET ri_left_arms = 1
 WHERE section='CLA-KYN' AND line='5TH' AND direction='DN' AND signal_number IN ('VVH S-21','VVH S-31') AND ri_left_arms = 0 AND ri_right_arms = 0;
SELECT ROW_COUNT() AS vvh21_31_updated;                                         -- expect 2
COMMIT;

-- 4. MLND S-1, TNA S-74, DI S-26 (CLA-KYN 5TH copies): flag diversion on the LEFT, as for VVH S-21/S-31
--    (flag markers with 0/0 arm counts were drawn on the right). Set ri_left_arms = 1.  Undo: back to 0.
--    DI S-26's DCC-KYN DIVA copies already carry an explicit "RI: L1=..." — untouched.
-- 5. TNA S-5 (CLA-KYN 5TH) "RI: PF-8 ; TR HB S-47 ; Y=PF-7": both diversions on the RIGHT — R1 = PF-8, R2 = TR HB S-47,
--    main Y = PF-7. Unlabelled RI text fills left arms first, so counts 0 left / 2 right.  Undo: ri_left_arms 1, ri_right_arms 2.
-- 6. DCC S-8 (CLA-KYN 5TH) "RI: DCC LOOP ; DCC M/L ; Y=ME-4403": both on the RIGHT (R1 = DCC LOOP, R2 = DCC M/L).
--    Counts 0 / 2.  Undo: ri_left_arms 1, ri_right_arms 1.  (DCC S-8's DW-DCC copy has no RI text — untouched.)
START TRANSACTION;
UPDATE div_signals SET ri_left_arms = 1
 WHERE section='CLA-KYN' AND line='5TH' AND direction='DN' AND signal_number IN ('MLND S-1','TNA S-74','DI S-26')
   AND ri_left_arms = 0 AND ri_right_arms = 0;
SELECT ROW_COUNT() AS flags_moved_left;                                         -- expect 3
UPDATE div_signals SET ri_left_arms = 0, ri_right_arms = 2
 WHERE section='CLA-KYN' AND line='5TH' AND direction='DN' AND signal_number IN ('TNA S-5','DCC S-8');
SELECT ROW_COUNT() AS both_right;                                               -- expect 2
COMMIT;

-- 7. CLA-KYN 6TH, diversion sides flipped (user, 2026-09-29):
--    KYN S-42 "Y=S-21 ; UP TH S-19" and DW S-50 "Y=DW S-47 ; UP TH (DW S-46)": arm to the RIGHT -> counts 0 L / 1 R
--      (KYN S-42's CSMT-KYN and KYN-BSR copies already say R1).  Undo: 1 L / 1 R.
--    DI S-18, PSK S-15, MLND S-9 (flag markers): flag to the LEFT -> ri_left_arms 1 (DI S-18's KYN-BSR copy says L1).  Undo: 0.
-- 8. DCC S-39 (6TH): two LEFT arms. Text was "RI: DCC LOOP / DCC M/L ; Y=DW S-21" (one arm, '/' is not a separator)
--    -> "RI: L1= DCC LOOP; L2= DCC M/L; Y=DW S-21", counts 2 L / 0 R.  Undo: old text, counts 1 / 1.
-- 9. VVH S-36 (6TH): three LEFT arms — top L1 = CLA S-50 (CLA yard), L2 = DN LTT, bottom L3 = UP LTT; R1 = F-LOOP; main UP TH.
--    Was "RI: CLA S-50 ; DN LTT ; UP LTT ; F-LOOP ; UP TH" with 2 L / 2 R (UP LTT drawn on the right).
--    -> "RI: L1= CLA S-50; L2= DN LTT; L3= UP LTT; R1= F-LOOP; MAIN= UP TH", counts 3 L / 1 R.  Undo: old text, 2 / 2.
START TRANSACTION;
UPDATE div_signals SET ri_left_arms = 0, ri_right_arms = 1
 WHERE section='CLA-KYN' AND line='6TH' AND direction='UP' AND signal_number IN ('KYN S-42','DW S-50') AND ri_left_arms = 1 AND ri_right_arms = 1;
SELECT ROW_COUNT() AS moved_right;                                              -- expect 2
UPDATE div_signals SET ri_left_arms = 1
 WHERE section='CLA-KYN' AND line='6TH' AND direction='UP' AND signal_number IN ('DI S-18','PSK S-15','MLND S-9') AND ri_left_arms = 0 AND ri_right_arms = 0;
SELECT ROW_COUNT() AS flags_moved_left;                                         -- expect 3
SET @dcc39 = (SELECT id FROM div_signals WHERE section='CLA-KYN' AND line='6TH' AND direction='UP' AND signal_number='DCC S-39');
UPDATE div_signals SET book_description = 'RI: L1= DCC LOOP; L2= DCC M/L; Y=DW S-21', ri_left_arms = 2, ri_right_arms = 0 WHERE id = @dcc39;
UPDATE div_signal_book_rows SET display_description = 'RI: L1= DCC LOOP; L2= DCC M/L; Y=DW S-21' WHERE signal_id = @dcc39;
SET @vvh36 = (SELECT id FROM div_signals WHERE section='CLA-KYN' AND line='6TH' AND direction='UP' AND signal_number='VVH S-36');
UPDATE div_signals SET book_description = 'RI: L1= CLA S-50; L2= DN LTT; L3= UP LTT; R1= F-LOOP; MAIN= UP TH', ri_left_arms = 3, ri_right_arms = 1 WHERE id = @vvh36;
UPDATE div_signal_book_rows SET display_description = 'RI: L1= CLA S-50; L2= DN LTT; L3= UP LTT; R1= F-LOOP; MAIN= UP TH' WHERE signal_id = @vvh36;
COMMIT;

-- 10. From the diversion-side check list (user, 2026-09-29): all other flag markers are right as drawn.
--     BND S-9 (CLA-KYN 6TH) flag "BND DEPOT" is a LEFT diversion -> ri_left_arms 1.  Undo: 0.
--     VVH S-109, S-111, S-112 (CLA-KYN 5TH) "RI: Y=S-21 ; S-22": the S-22 diversion is on the RIGHT -> counts 0 L / 1 R.
--     Undo: 1 L / 1 R.
START TRANSACTION;
UPDATE div_signals SET ri_left_arms = 1
 WHERE section='CLA-KYN' AND line='6TH' AND signal_number = 'BND S-9' AND ri_left_arms = 0 AND ri_right_arms = 0;
SELECT ROW_COUNT() AS bnd9_moved_left;                                          -- expect 1
UPDATE div_signals SET ri_left_arms = 0, ri_right_arms = 1
 WHERE section='CLA-KYN' AND line='5TH' AND signal_number IN ('VVH S-109','VVH S-111','VVH S-112') AND ri_left_arms = 1 AND ri_right_arms = 1;
SELECT ROW_COUNT() AS vvh_moved_right;                                          -- expect 3
COMMIT;

-- 11. KDV S-12 (KYN-KSRA DN NE): location 'On Gantry' (was '72/10', a copy of its km).  Undo: back to '72/10'.
-- 12. ASO S-23 (KYN-KSRA UP NE): EXTREME left-hand — placement 'Extreme Left', is_lhs 0, is_ext_lhs 1 (as all 10 existing
--     Ext LHS signals; row stays black, the book shows a blue "Ext LHS" tag).  Undo: 'Left', is_lhs 1, is_ext_lhs 0.
-- 13. KYN S-78 (KYN-KSRA UP NE): one LEFT diversion to KYN yard, main Y = KYN S-71 (had no RI text).
--     -> "RI: L1= KYN YD; Y= KYN S-71", counts 1 L / 0 R.  Undo: text NULL.
-- 14. KYN S-71 (KYN-KSRA UP NE): 3 left + 1 right. Picture: bottom-left PF-6, then PF-5, top-left KYN S-63; right KYN S-62;
--     main Y = PF-3. The renderer draws L1 at the TOP, so the text is written L1 = KYN S-63 ... L3 = PF-6.
--     -> "RI: L1= KYN S-63; L2= PF-5; L3= PF-6; R1= KYN S-62; Y= PF-3", counts 3 L / 1 R.  Undo: text NULL.
-- 15. KYN S-37 (KYN-KSRA UP NE copy): diversion on the LEFT — "RI:R1= S-19" -> "RI:L1= S-19", counts 1 L / 0 R.
--     Undo: "RI:R1= S-19", 0 / 0. (Its CSMT-KYN UP LOC copy has no RI text — untouched.)
START TRANSACTION;
SET @kdv12 = (SELECT id FROM div_signals WHERE section='KYN-KSRA' AND line='DN NE' AND signal_number='KDV S-12');
UPDATE div_signals SET location_text = 'On Gantry' WHERE id = @kdv12 AND location_text = '72/10';
UPDATE div_signal_book_rows SET display_location = 'On Gantry' WHERE signal_id = @kdv12 AND display_location = '72/10';
UPDATE div_signals SET placement = 'Extreme Left', is_lhs = 0, is_ext_lhs = 1
 WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number='ASO S-23' AND is_ext_lhs = 0;
SET @kyn78 = (SELECT id FROM div_signals WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number='KYN S-78');
UPDATE div_signals SET book_description = 'RI: L1= KYN YD; Y= KYN S-71', ri_left_arms = 1, ri_right_arms = 0 WHERE id = @kyn78;
UPDATE div_signal_book_rows SET display_description = 'RI: L1= KYN YD; Y= KYN S-71' WHERE signal_id = @kyn78;
SET @kyn71 = (SELECT id FROM div_signals WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number='KYN S-71');
UPDATE div_signals SET book_description = 'RI: L1= KYN S-63; L2= PF-5; L3= PF-6; R1= KYN S-62; Y= PF-3', ri_left_arms = 3, ri_right_arms = 1 WHERE id = @kyn71;
UPDATE div_signal_book_rows SET display_description = 'RI: L1= KYN S-63; L2= PF-5; L3= PF-6; R1= KYN S-62; Y= PF-3' WHERE signal_id = @kyn71;
SET @kyn37 = (SELECT id FROM div_signals WHERE section='KYN-KSRA' AND line='UP NE' AND signal_number='KYN S-37');
UPDATE div_signals SET book_description = 'RI:L1= S-19', ri_left_arms = 1, ri_right_arms = 0 WHERE id = @kyn37;
UPDATE div_signal_book_rows SET display_description = 'RI:L1= S-19' WHERE signal_id = @kyn37 AND display_description = 'RI:R1= S-19';
SELECT ROW_COUNT() AS kyn37_row_updated;                                        -- expect 1
COMMIT;

-- 16. KYN S-56, KYN-KJT DN SE copy: diversion to the LEFT like its CSMT-KYN and KYN-KSRA copies — "RI: R1=NE" -> "RI: L1=NE".
--     Undo: back to "RI: R1=NE".
-- 17. KYN S-81 (KYN-KJT UP SE): add the main route Y = PF-5.
--     "RI: L1=PF-6; L2=PF-7; R1=S-63; R2=PF-3" -> "... ; Y=PF-5".  Undo: drop "; Y=PF-5".
START TRANSACTION;
SET @kyn56se = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND signal_number='KYN S-56');
UPDATE div_signals SET book_description = 'RI: L1=NE' WHERE id = @kyn56se AND book_description = 'RI: R1=NE';
UPDATE div_signal_book_rows SET display_description = 'RI: L1=NE' WHERE signal_id = @kyn56se AND display_description = 'RI: R1=NE';
SELECT ROW_COUNT() AS kyn56_row_updated;                                        -- expect 1
SET @kyn81 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND signal_number='KYN S-81');
UPDATE div_signals SET book_description = 'RI: L1=PF-6; L2=PF-7; R1=S-63; R2=PF-3; Y=PF-5'
 WHERE id = @kyn81 AND book_description = 'RI: L1=PF-6; L2=PF-7; R1=S-63; R2=PF-3';
UPDATE div_signal_book_rows SET display_description = 'RI: L1=PF-6; L2=PF-7; R1=S-63; R2=PF-3; Y=PF-5'
 WHERE signal_id = @kyn81 AND display_description = 'RI: L1=PF-6; L2=PF-7; R1=S-63; R2=PF-3';
SELECT ROW_COUNT() AS kyn81_row_updated;                                        -- expect 1
COMMIT;

-- 18. KYN S-37, CSMT-KYN UP LOC copy: same diversion as its KYN-KSRA copy — "RI:L1= S-19", counts 1 L / 0 R (had no RI text).
--     Undo: text NULL, counts 0 / 0.
START TRANSACTION;
SET @kyn37loc = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='UP LOC' AND signal_number='KYN S-37');
UPDATE div_signals SET book_description = 'RI:L1= S-19', ri_left_arms = 1, ri_right_arms = 0 WHERE id = @kyn37loc AND book_description IS NULL;
UPDATE div_signal_book_rows SET display_description = 'RI:L1= S-19' WHERE signal_id = @kyn37loc AND display_description IS NULL;
SELECT ROW_COUNT() AS kyn37_loc_row_updated;                                    -- expect 1
COMMIT;
