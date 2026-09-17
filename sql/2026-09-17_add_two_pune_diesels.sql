-- 2026-09-17 — two more Pune diesels seen on prod sheets
--
-- WHY THESE WERE NOT CAUGHT BY THE EARLIER IMPORTS
-- Neither 40577 nor 40425 appears in the diesel database file, nor in the
-- electric one. They are genuinely absent from both official sources, so no
-- import could have added them.
--
-- They also could not be seen from local: its sheet log ends 2026-07-21 and
-- holds nothing from August or September, while both locos worked in
-- September. Prod's "locos not in the master" banner named them; local's said
-- zero. Prod was right — the two databases were answering the same question
-- over different data.
--
-- 40425 is corroborated: ICMS records it hauling 11009 on both 15 and 16
-- September as a WDP4D. It reached the sheet because an LPC typed it.
--
-- Shed and class supplied by the operator: both PADX (Pune Diesel Loco Shed,
-- CR), both WDP4D. The number range agrees — 40576 and 40579 either side of
-- 40577 are both WDP4D at PADX, and 40424 below 40425 is the same.
--
-- hotel_load_oem stays NULL: diesels are not HOG fitted, and any text there
-- would read as HOG-capable.

-- Step 1 — confirm they are missing. Expect 0 rows.
SELECT loco_number FROM div_locos WHERE loco_number IN ('40425', '40577');

-- Step 2 — insert.
INSERT IGNORE INTO div_locos
  (loco_number, loco_type, traction_type, railway_zone, home_shed, status,
   data_source, entered_by, remarks)
VALUES
  ('40425', 'WDP4D', 'Diesel', 'CR', 'PADX', 'Active', 'MANUAL', 'dsl-operator-2026-09-17',
   'In neither official loco file; shed and class from the operator. ICMS shows it on 11009, 15-16 Sep.'),
  ('40577', 'WDP4D', 'Diesel', 'CR', 'PADX', 'Active', 'MANUAL', 'dsl-operator-2026-09-17',
   'In neither official loco file; shed and class from the operator.');

-- Step 3 — verify.
SELECT loco_number, loco_type, traction_type, railway_zone, home_shed
FROM div_locos WHERE loco_number IN ('40425', '40577') ORDER BY loco_number;

-- The banner's own query. On prod this should now be 0 — it read 2.
SELECT COUNT(DISTINCT l.actual_loco_no) AS still_unregistered
FROM div_loco_link_log l LEFT JOIN div_locos dl ON dl.loco_number = l.actual_loco_no
WHERE l.actual_loco_no REGEXP '^[0-9]{4,6}$' AND dl.loco_number IS NULL;

SELECT traction_type, COUNT(*) AS locos FROM div_locos GROUP BY traction_type;

-- Rollback:
-- DELETE FROM div_locos WHERE loco_number IN ('40425','40577')
--   AND entered_by = 'dsl-operator-2026-09-17';
