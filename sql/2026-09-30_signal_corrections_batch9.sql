-- Signal book corrections, batch 9 (user, 2026-09-30): signals that had arms recorded but no diversion text
-- (list: ~/Desktop/signals-arms-but-no-diversion-text.txt). Every copy (same magnet) set alike; arm counts already right.
-- 1. DW S-57, S-58, S-59 (Diva PF-8 / GL-1 / GL-2 starters, both DCC-DIVA pages): two right arms,
--    upper to UP TH (DW S-46), lower to UP LOC (DW S-45).   -> "RI: R1= UP TH (DW S-46); R2= UP LOC (DW S-45)"
-- 2. CLA S-19 (CLA-TMBY DN): two left arms.                   -> "RI: L1= DN HB; L2= CLA YD S-2"
-- 3. NEU S-44 (NEU-KILLE UP BSU): three right arms, main PF-1. -> "RI: R1= PF-5; R2= PF-4; R3= PF-2; Y= PF-1"
-- 4. DW S-15 (DW-DCC BSR UP, Diva PF-6 starter): 1 L / 1 R.     -> "RI: L1= 5TH LINE (DCC S-8); R1= DCC S-5"
-- 5. VSH S-2 (CSMT-PNVL DN HB): one left arm, main PF-3.         -> "RI: L1= PF-2; Y= PF-3"
--    Its record said "RI: L1=PF-2;MAIN=PF-3" (new-signals sheet, 29 Sep) but the page row was empty, so nothing was drawn.
-- Undo: 2026-09-30_signal_corrections_batch9_UNDO.sql
START TRANSACTION;
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1= UP TH (DW S-46); R2= UP LOC (DW S-45)', r.display_description = 'RI: R1= UP TH (DW S-46); R2= UP LOC (DW S-45)'
 WHERE s.is_active = 1 AND s.ri_left_arms = 0 AND s.ri_right_arms = 2 AND s.book_description IS NULL
   AND s.magnet_id IN (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section = 'DCC-DIVA' AND line = 'DIVA UP'
                                     AND signal_number IN ('DW S-57', 'DW S-58', 'DW S-59')) x);
SELECT ROW_COUNT() AS dw_57_58_59;                                              -- expect 12 (6 copies + 6 book rows)
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= DN HB; L2= CLA YD S-2', r.display_description = 'RI: L1= DN HB; L2= CLA YD S-2'
 WHERE s.is_active = 1 AND s.section = 'CLA-TMBY' AND s.line = 'DN TMBY' AND s.signal_number = 'CLA S-19' AND s.book_description IS NULL;
SELECT ROW_COUNT() AS cla_s19;                                                  -- expect 2
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: R1= PF-5; R2= PF-4; R3= PF-2; Y= PF-1', r.display_description = 'RI: R1= PF-5; R2= PF-4; R3= PF-2; Y= PF-1'
 WHERE s.is_active = 1 AND s.section = 'NEU-KILLE' AND s.line = 'UP BSU' AND s.signal_number = 'NEU S-44' AND s.book_description IS NULL;
SELECT ROW_COUNT() AS neu_s44;                                                  -- expect 2
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= 5TH LINE (DCC S-8); R1= DCC S-5', r.display_description = 'RI: L1= 5TH LINE (DCC S-8); R1= DCC S-5'
 WHERE s.is_active = 1 AND s.section = 'DW-DCC' AND s.line = 'BSR UP' AND s.signal_number = 'DW S-15' AND s.book_description IS NULL;
SELECT ROW_COUNT() AS dw_s15;                                                   -- expect 2
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.book_description = 'RI: L1= PF-2; Y= PF-3', r.display_description = 'RI: L1= PF-2; Y= PF-3'
 WHERE s.is_active = 1 AND s.section = 'CSMT-PNVL' AND s.line = 'DN HB' AND s.signal_number = 'VSH S-2'
   AND s.book_description = 'RI: L1=PF-2;MAIN=PF-3' AND r.display_description IS NULL;
SELECT ROW_COUNT() AS vsh_s2;                                                   -- expect 2
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT id, 'Description Changed', NULL, book_description, CURDATE(), 'Diversion text added (user 30 Sep, batch 9)'
    FROM div_signals WHERE is_active = 1 AND (
          magnet_id IN (SELECT m FROM (SELECT magnet_id m FROM div_signals WHERE section = 'DCC-DIVA' AND line = 'DIVA UP'
                                       AND signal_number IN ('DW S-57', 'DW S-58', 'DW S-59')) y)
       OR (section = 'CLA-TMBY' AND line = 'DN TMBY' AND signal_number = 'CLA S-19')
       OR (section = 'NEU-KILLE' AND line = 'UP BSU' AND signal_number = 'NEU S-44')
       OR (section = 'DW-DCC' AND line = 'BSR UP' AND signal_number = 'DW S-15')
       OR (section = 'CSMT-PNVL' AND line = 'DN HB' AND signal_number = 'VSH S-2'));
COMMIT;
