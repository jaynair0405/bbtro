-- 2026-09-17 — correct hotel_load_oem where it says the opposite of the truth
--
-- WHY THIS IS NOT COSMETIC
-- HOG capability is not a flag in this schema. It is DERIVED from hotel_load_oem
-- simply being non-empty:
--
--     is_hog: !!l.hotel_load_oem        (routes/division/locoLinkRoutes.js)
--
-- So any text in that column means "HOG capable", and four locos literally say
-- "NO" — which makes them read as HOG-CAPABLE, the opposite of what was meant.
-- On the assignment board they are offered for HOG workings and never carry the
-- "NO HOG" warning. "Not HOG fitted" has to be expressed as NULL.
--
-- Six more say "YES", which gives the right answer but loses the maker, so the
-- loco cannot be told apart from the 890 Siemens or 788 Medha sets.
--
-- Every value below is from the official IR loco database (sheet loco_17-09,
-- exported 2026-09-17). Blank there means not HOG fitted.
--
-- 45302 and 45303 also say "YES" and are deliberately NOT touched: they are too
-- new to appear in the official sheet, so their maker is genuinely unknown and
-- "YES" is the honest answer until it is published.

-- Step 1 — preview. Expect the 4 NO rows and the 6 YES rows (fewer on local,
-- which is missing some of the locos prod holds).
SELECT loco_number, loco_type, railway_zone, home_shed, hotel_load_oem,
       IF(hotel_load_oem IS NOT NULL AND hotel_load_oem <> '', 'reads as HOG', 'not HOG') AS what_the_code_sees
FROM div_locos
WHERE loco_number IN ('42177','42240','44385','44456',
                      '45007','45032','45038','45046','45051','45052')
ORDER BY loco_number;

-- Step 2 — "NO" means not HOG fitted. NULL is how that is said here.
UPDATE div_locos
SET hotel_load_oem = NULL
WHERE loco_number IN ('42177', '42240', '44385', '44456')
  AND UPPER(TRIM(hotel_load_oem)) = 'NO';

-- Step 3 — replace "YES" with the maker the official sheet records.
UPDATE div_locos
SET hotel_load_oem = CASE loco_number
        WHEN '45007' THEN 'Medha'
        WHEN '45032' THEN 'AAL'
        WHEN '45038' THEN 'AAL'
        WHEN '45046' THEN 'BHEL'
        WHEN '45051' THEN 'BHEL'
        WHEN '45052' THEN 'BHEL'
    END
WHERE loco_number IN ('45007','45032','45038','45046','45051','45052')
  AND UPPER(TRIM(hotel_load_oem)) = 'YES';

-- Step 4 — verify. No loco should read as HOG while meaning the opposite, and
-- the only remaining "YES" should be the two too new to be published.
SELECT loco_number, hotel_load_oem,
       IF(hotel_load_oem IS NOT NULL AND hotel_load_oem <> '', 'HOG', 'not HOG') AS now_reads
FROM div_locos
WHERE loco_number IN ('42177','42240','44385','44456',
                      '45007','45032','45038','45046','45051','45052','45302','45303')
ORDER BY loco_number;

SELECT hotel_load_oem, COUNT(*) AS locos
FROM div_locos
WHERE UPPER(TRIM(hotel_load_oem)) IN ('NO','N','NIL','NONE','YES','Y')
GROUP BY hotel_load_oem;

-- Rollback:
-- UPDATE div_locos SET hotel_load_oem='NO'  WHERE loco_number IN ('42177','42240','44385','44456');
-- UPDATE div_locos SET hotel_load_oem='YES' WHERE loco_number IN ('45007','45032','45038','45046','45051','45052');
