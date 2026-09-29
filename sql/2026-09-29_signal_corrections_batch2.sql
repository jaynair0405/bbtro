-- Signal book corrections, batch 2 (user, 2026-09-29). Every copy of the physical signal (same magnet_id) is corrected.
-- 1. KYN S-9 (magnet 692): all three diversions on the LEFT — DN TH (S-13), DN LL (S-32), S-28; main Y = S-25.
--    CLA-KYN 5TH copy: counts 3 L / 0 R (text unchanged; unlabelled arms fill left first).  Undo: 3 / 1.
--    DCC-KYN DIVA DN copy: "RI: L1=DN TH (KYN S-13); R2=DN LL (KYN S-32); R3= KYN S-28"
--      -> "RI: L1=DN TH (KYN S-13); L2=DN LL (KYN S-32); L3= KYN S-28; Y= KYN S-25", counts 3 / 0.  Undo: old text.
-- 2. CLA YD S-2 (magnet 2867): CLA-TMBY DN TMBY copy gets the same diversions as its BPT DN copy —
--    "RI: L1= DN RD-2 (VVH S-4); L2= DN RD-3 (VVH S-5)" (had no RI text; counts already 2 / 0).  Undo: text NULL.
-- 3. LNL S-9 (magnet 2082): diversion L1 = DN MAIN LINE, main Y = LNL S-14 — on both copies.
--    KJT-LNL DN SE MID: "RI: L1=DN MN LINE" -> "RI: L1=DN MN LINE; Y= LNL S-14".   Undo: old text.
--    LNL-PUNE DN SE:    NULL -> "RI: L1=DN MN LINE; Y= LNL S-14", counts 1 / 0.     Undo: NULL, 0 / 0.
START TRANSACTION;
UPDATE div_signals SET ri_left_arms = 3, ri_right_arms = 0 WHERE section='CLA-KYN' AND line='5TH' AND signal_number='KYN S-9';
SET @kyn9dn = (SELECT id FROM div_signals WHERE section='DCC-KYN' AND line='DIVA DN' AND signal_number='KYN S-9');
UPDATE div_signals SET book_description = 'RI: L1=DN TH (KYN S-13); L2=DN LL (KYN S-32); L3= KYN S-28; Y= KYN S-25', ri_left_arms = 3, ri_right_arms = 0 WHERE id = @kyn9dn;
UPDATE div_signal_book_rows SET display_description = 'RI: L1=DN TH (KYN S-13); L2=DN LL (KYN S-32); L3= KYN S-28; Y= KYN S-25' WHERE signal_id = @kyn9dn;

SET @clayd2 = (SELECT id FROM div_signals WHERE section='CLA-TMBY' AND line='DN TMBY' AND signal_number='CLA YD S-2');
UPDATE div_signals SET book_description = 'RI: L1= DN RD-2 (VVH S-4); L2= DN RD-3 (VVH S-5)', ri_left_arms = 2, ri_right_arms = 0 WHERE id = @clayd2 AND book_description IS NULL;
UPDATE div_signal_book_rows SET display_description = 'RI: L1= DN RD-2 (VVH S-4); L2= DN RD-3 (VVH S-5)' WHERE signal_id = @clayd2 AND display_description IS NULL;

UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1=DN MN LINE; Y= LNL S-14', s.ri_left_arms = 1, s.ri_right_arms = 0,
       r.display_description = 'RI: L1=DN MN LINE; Y= LNL S-14'
 WHERE s.magnet_id = (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section='KJT-LNL' AND line='DN SE MID' AND signal_number='LNL S-9') x);
SELECT ROW_COUNT() AS lnl9_rows;                                                -- expect 4 (2 signals + 2 book rows)
COMMIT;

-- 4. KYN S-9, DCC-KYN DIVA UP copy (id 3111): the SAME physical signal as magnet 692 (same km 51/544, same neighbours
--    KYN S-4 -> S-9 -> S-25). The 31 Jul magnet backfill grouped by (station, number, DIRECTION) and this page labels it
--    UP, so it got its own magnet. Link it (magnet 692) and give it the same all-left RI.
--    Undo: magnet_id 3111; text "RI: L1=DN TH (KYN S-13); R2=DN LL (KYN S-32); R3= KYN S-28".
START TRANSACTION;
SET @kyn9up = (SELECT id FROM div_signals WHERE section='DCC-KYN' AND line='DIVA UP' AND signal_number='KYN S-9');
UPDATE div_signals SET magnet_id = 692, book_description = 'RI: L1=DN TH (KYN S-13); L2=DN LL (KYN S-32); L3= KYN S-28; Y= KYN S-25',
       ri_left_arms = 3, ri_right_arms = 0 WHERE id = @kyn9up;
UPDATE div_signal_book_rows SET display_description = 'RI: L1=DN TH (KYN S-13); L2=DN LL (KYN S-32); L3= KYN S-28; Y= KYN S-25' WHERE signal_id = @kyn9up;
COMMIT;
