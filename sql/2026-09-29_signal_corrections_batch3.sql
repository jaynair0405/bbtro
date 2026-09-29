-- Signal book corrections, batch 3 (user, 2026-09-29), after linking the 8 Diva-line copies. All copies corrected.
-- 1. Main route (Y) on the Diva copies, so every page shows the same diversion:
--    KYN S-4  (DIVA UP 3110, DIVA DN 3211): "RI: R1=KYN YD"          -> "RI: R1=KYN YD; Y= KYN S-9"
--    KYN S-25 (DIVA UP 3112, DIVA DN 3213): "RI: R1=PF-7"            -> "RI: R1=PF-7; Y= PF-6"
--    DW S-68  (DIVA DN 3218):              "RI: L1=PF-6; L2=PF-8"   -> "RI: L1=PF-6; L2=PF-8; Y= DW S-55"
--    Undo: remove the "; Y= ..." part.
-- 2. DCC S-8 DW-DCC BSR UP copy (3153): same RI as its CLA-KYN copy — "RI: DCC LOOP ; DCC M/L ; Y=ME-4403", counts 0 L / 2 R
--    (had no RI text and counts 2 / 0).  Undo: text NULL, counts 2 / 0.
-- 3. Signal type, every copy: DCC S-8 and DI S-26 = 'Semi-Automatic'; DCC S-22 = 'Manual'.
--    Undo: DCC S-8 DW-DCC copy, DI S-26 DIVA DN copy -> 'Manual'; DCC S-22 CLA-KYN 6TH copy -> 'Semi-Automatic'.
START TRANSACTION;
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = CONCAT(s.book_description, CASE s.magnet_id WHEN 691 THEN '; Y= KYN S-9' WHEN 693 THEN '; Y= PF-6' WHEN 709 THEN '; Y= DW S-55' END),
       r.display_description = CONCAT(r.display_description, CASE s.magnet_id WHEN 691 THEN '; Y= KYN S-9' WHEN 693 THEN '; Y= PF-6' WHEN 709 THEN '; Y= DW S-55' END)
 WHERE s.id IN (3110, 3211, 3112, 3213, 3218) AND s.book_description NOT LIKE '%Y=%' AND r.display_description = s.book_description;
SELECT ROW_COUNT() AS main_routes_added;                                        -- expect 10 (5 signals + 5 rows)

UPDATE div_signals SET book_description = 'RI: DCC LOOP ; DCC M/L ; Y=ME-4403', ri_left_arms = 0, ri_right_arms = 2
 WHERE id = 3153 AND book_description IS NULL;
UPDATE div_signal_book_rows SET display_description = 'RI: DCC LOOP ; DCC M/L ; Y=ME-4403' WHERE signal_id = 3153 AND display_description IS NULL;

UPDATE div_signals SET signal_type = 'Semi-Automatic' WHERE magnet_id IN (681, 686) AND signal_type <> 'Semi-Automatic';   -- DCC S-8, DI S-26
UPDATE div_signals SET signal_type = 'Manual'         WHERE magnet_id = 707          AND signal_type <> 'Manual';           -- DCC S-22
COMMIT;
