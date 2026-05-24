-- Add loco_change_station column for bypass trains with intermediate loco changes
-- Example: 22149/22150 (RN-PUNE) have loco change at PNVL

ALTER TABLE div_trains 
ADD COLUMN loco_change_station VARCHAR(10) DEFAULT NULL 
COMMENT 'Intermediate station where loco change happens (e.g., PNVL for RN-PUNE bypass)';

-- Set PNVL as loco change station for 22149/22150
UPDATE div_trains 
SET loco_change_station = 'PNVL' 
WHERE train_no IN ('22149', '22150');

-- Verify
SELECT train_no, direction, from_station, to_station, loco_change_station 
FROM div_trains 
WHERE loco_change_station IS NOT NULL;
