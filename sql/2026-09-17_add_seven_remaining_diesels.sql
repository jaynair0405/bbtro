-- 2026-09-17 — the last seven diesels working our trains
--
-- After sql/2026-09-17_add_diesel_locos.sql, seven loco numbers still appeared
-- on our sheets with no row in div_locos. They are absent from the diesel
-- database file too, so their sheds come from the operator directly:
--
--     40313, 40372          Kalyan  -> KYDX
--     40213, 40265, 40473,
--     40507, 40590          Pune    -> PADX
--
-- Both are Central Railway diesel sheds, and PADX is already what our diesel
-- workings expect.
--
-- CLASS: all seven are WDP4D, confirmed by the operator. Our sheets never
-- recorded a class for any of them (loco_type is NULL on all 129 appearances),
-- and the number range agreed independently: WDP4B runs 40001-40092 while
-- WDP4D runs 40086-40608, and each of these seven sits between two WDP4D locos
-- with no WDP4B anywhere near. Range reading and operator agree.
--
-- hotel_load_oem stays NULL: diesels are not HOG fitted, and any text there
-- would read as HOG-capable.
--
-- These seven have worked BB trains 129 times between 2026-05-12 and
-- 2026-07-19, so they are not strays.

-- Step 1 — confirm they are still missing. Expect 0 rows.
SELECT loco_number FROM div_locos
WHERE loco_number IN ('40213','40265','40313','40372','40473','40507','40590');

-- Step 2 — insert.
INSERT IGNORE INTO div_locos
  (loco_number, loco_type, traction_type, railway_zone, home_shed, status,
   data_source, entered_by, remarks)
VALUES
  ('40313', 'WDP4D', 'Diesel', 'CR', 'KYDX', 'Active', 'MANUAL', 'dsl-operator-2026-09-17', 'WDP4D confirmed by the operator 2026-09-17'),
  ('40372', 'WDP4D', 'Diesel', 'CR', 'KYDX', 'Active', 'MANUAL', 'dsl-operator-2026-09-17', 'WDP4D confirmed by the operator 2026-09-17'),
  ('40213', 'WDP4D', 'Diesel', 'CR', 'PADX', 'Active', 'MANUAL', 'dsl-operator-2026-09-17', 'WDP4D confirmed by the operator 2026-09-17'),
  ('40265', 'WDP4D', 'Diesel', 'CR', 'PADX', 'Active', 'MANUAL', 'dsl-operator-2026-09-17', 'WDP4D confirmed by the operator 2026-09-17'),
  ('40473', 'WDP4D', 'Diesel', 'CR', 'PADX', 'Active', 'MANUAL', 'dsl-operator-2026-09-17', 'WDP4D confirmed by the operator 2026-09-17'),
  ('40507', 'WDP4D', 'Diesel', 'CR', 'PADX', 'Active', 'MANUAL', 'dsl-operator-2026-09-17', 'WDP4D confirmed by the operator 2026-09-17'),
  ('40590', 'WDP4D', 'Diesel', 'CR', 'PADX', 'Active', 'MANUAL', 'dsl-operator-2026-09-17', 'WDP4D confirmed by the operator 2026-09-17');

-- Step 3 — verify, and the number that matters: no loco on our sheets should
-- now be unknown to the master.
SELECT loco_number, loco_type, traction_type, railway_zone, home_shed
FROM div_locos WHERE entered_by = 'dsl-operator-2026-09-17' ORDER BY loco_number;

SELECT COUNT(DISTINCT l.actual_loco_no) AS still_unregistered
FROM div_loco_link_log l LEFT JOIN div_locos dl ON dl.loco_number = l.actual_loco_no
WHERE l.actual_loco_no REGEXP '^[0-9]{4,6}$' AND dl.loco_number IS NULL;

SELECT traction_type, COUNT(*) AS locos FROM div_locos GROUP BY traction_type;

-- Rollback:
-- DELETE FROM div_locos WHERE entered_by = 'dsl-operator-2026-09-17';
