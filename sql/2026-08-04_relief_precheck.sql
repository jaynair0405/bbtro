-- =====================================================================
-- PRE-CHECK for 2026-08-04_relief_columns.sql. Read-only — changes nothing.
--
-- That migration moves the R/T marker off 9 Panvel piloting legs and onto the
-- working leg each one delivers the crew to. The moves are written explicitly
-- as (detail_number, train_number) pairs, taken from the local database.
--
-- If prod's Panvel details differ — the July 2026-07-24_pnvl_* revisions ship
-- on this same branch and may not be deployed there yet — a target leg may not
-- exist under that train number. The UPDATE would then match 0 rows, and the
-- following statement (which clears relief from every non-working leg) would
-- discard the marker. Nine relief markers would vanish with no error.
--
-- Run this first. Every number below must match before running the migration.
-- =====================================================================

SELECT '1. legs carrying a relief marker in remarks — want 36' AS check_;
SELECT COUNT(*) AS legs_with_marker
  FROM trains WHERE remarks REGEXP 'R/(T|B) [0-9]+';

SELECT '2. split by leg type — want working 27, piloting 9' AS check_;
SELECT train_type, COUNT(*) AS legs
  FROM trains WHERE remarks REGEXP 'R/(T|B) [0-9]+'
 GROUP BY train_type;

SELECT '3. the 9 piloting legs the migration expects to move FROM' AS check_;
SELECT d.detail_number AS det, t.train_number AS pilot_leg, t.remarks
  FROM trains t JOIN details d ON d.detail_id = t.detail_id
 WHERE t.train_type = 'piloting' AND t.remarks REGEXP 'R/T [0-9]+'
 ORDER BY CAST(d.detail_number AS UNSIGNED);

SELECT '4. the 9 working legs it expects to move ONTO — want 9 rows, all working' AS check_;
SELECT d.detail_number AS det, t.train_number AS target_leg, t.train_type,
       t.start_station, t.start_time
  FROM trains t JOIN details d ON d.detail_id = t.detail_id
 WHERE (d.detail_number, t.train_number) IN
       (('454','UBR7'), ('466','UNU15'), ('479','UBR9'),  ('490','UBR15'),
        ('504','UNU3'), ('522','UNU9'),  ('547','UNU13'), ('548','UBR17'),
        ('552','UBR19'))
 ORDER BY CAST(d.detail_number AS UNSIGNED);

SELECT '5. ANY of the 9 targets MISSING — want an empty result' AS check_;
SELECT * FROM (
  SELECT '454' AS det,'UBR7'  AS target UNION ALL SELECT '466','UNU15' UNION ALL
  SELECT '479','UBR9'  UNION ALL SELECT '490','UBR15' UNION ALL
  SELECT '504','UNU3'  UNION ALL SELECT '522','UNU9'  UNION ALL
  SELECT '547','UNU13' UNION ALL SELECT '548','UBR17' UNION ALL
  SELECT '552','UBR19'
) want
WHERE NOT EXISTS (
  SELECT 1 FROM trains t JOIN details d ON d.detail_id = t.detail_id
   WHERE d.detail_number = want.det
     AND t.train_number  = want.target
     AND t.train_type    = 'working');

SELECT '6. does the six-detail revision look applied? — want 4 rows (304 x1, 363 x1, 402 x2)' AS check_;
SELECT d.detail_number AS det, t.train_number, t.remarks
  FROM trains t JOIN details d ON d.detail_id = t.detail_id
 WHERE d.detail_number IN ('304','363','402')
   AND t.remarks REGEXP 'R/(T|B) [0-9]+'
 ORDER BY CAST(d.detail_number AS UNSIGNED);

SELECT '7. columns already added? — want an empty result (not yet run)' AS check_;
SELECT COLUMN_NAME FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'trains'
   AND COLUMN_NAME IN ('rt_detail','rb_detail');
