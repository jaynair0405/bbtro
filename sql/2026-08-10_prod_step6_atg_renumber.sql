-- Prod deploy STEP 6: ATG renumber (match local). UPDATE by id -> ids unchanged ->
-- div_aws_events / successors links to these 7 rows stay valid. Coords stay on the rows.
-- Collision-safe: old S-12 (id 1223)->S-6 BEFORE old S-13 (id 1224)->S-12 (number reuse).
UPDATE div_signals SET signal_number='ATG S-6',  normalized_signal_number='ATGS6'  WHERE id=1223 AND signal_number='ATG S-12';
UPDATE div_signals SET signal_number='ATG S-12', normalized_signal_number='ATGS12' WHERE id=1224 AND signal_number='ATG S-13';
UPDATE div_signals SET signal_number='ATG S-5',  normalized_signal_number='ATGS5'  WHERE id=1880 AND signal_number='ATG S-11';
UPDATE div_signals SET signal_number='ATG S-48', normalized_signal_number='ATGS48' WHERE id=1265 AND signal_number='ATG S-27';
UPDATE div_signals SET signal_number='ATG S-43', normalized_signal_number='ATGS43' WHERE id=1266 AND signal_number='ATG S-18';
UPDATE div_signals SET signal_number='ATG S-41', normalized_signal_number='ATGS41' WHERE id=1267 AND signal_number='ATG S-17';
UPDATE div_signals SET signal_number='ATG S-44', normalized_signal_number='ATGS44' WHERE id=1926 AND signal_number='ATG S-19';

SELECT '--- ATG on prod after renumber (should match local) ---' AS x;
SELECT id, signal_number, normalized_signal_number,
       ROUND(latitude,5) lat, ROUND(longitude,5) lon
FROM div_signals WHERE id IN (1223,1224,1265,1266,1267,1880,1926) ORDER BY id;
