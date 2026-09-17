-- 2026-09-17 — register three WAP7s that worked BB trains but are not in the master
--
-- WHY
-- The ICMS 501 import for 15-Sep-2026 named six locos absent from div_locos.
-- Three are diesels whose workings expect Diesel, so the sheet accepts them;
-- three are WAP7s on workings that expect Electric, and the sheet REFUSES an
-- unknown electric number as a probable typo (see the guard in POST /log).
-- Until they are registered those three trains cannot be filled at all:
--
--   45024  on 12809      45022  on 22732      45026  on 18029
--
-- Details supplied by the operator from the official loco list. Zones and sheds
-- are codes already in use (SER/WCR/WR, SRCE/ETE/BRCE), so mis-link comparisons
-- work immediately.
--
-- Hotel Load is recorded because that column IS how HOG capability is derived
-- (is_hog = hotel_load_oem is present) — without it these read as non-HOG and
-- would show a false "NO HOG" against every HOG working.
--
-- Propulsion (IGBT) and AC Cab have no column in div_locos; kept in remarks
-- rather than invented as columns.

-- Step 1 — preview. Expect three empty results (none should exist yet).
SELECT loco_number, loco_type, home_shed, railway_zone
FROM div_locos WHERE loco_number IN ('45022', '45024', '45026');

-- Step 2 — insert. INSERT IGNORE so a re-run, or a row added by hand in the
-- meantime, is a no-op rather than an error.
INSERT IGNORE INTO div_locos
    (loco_number, loco_type, traction_type, railway_zone, home_shed, status,
     commission_date, traction_converter, hotel_load_oem, hrpt_count,
     data_source, entered_by, remarks)
VALUES
    ('45024', 'WAP7', 'Electric', 'SER', 'SRCE', 'Active',
     '2026-05-20', 'CGL', 'Medha', 0,
     'MANUAL', 'icms-import-2026-09-17', 'IGBT propulsion; AC cab. Added after ICMS 15-Sep worked 12809.'),
    ('45022', 'WAP7', 'Electric', 'WCR', 'ETE',  'Active',
     '2026-04-19', 'CGL', 'Medha', 0,
     'MANUAL', 'icms-import-2026-09-17', 'IGBT propulsion; AC cab. Added after ICMS 15-Sep worked 22732.'),
    ('45026', 'WAP7', 'Electric', 'WR',  'BRCE', 'Active',
     '2026-04-24', 'CGL', 'AAL',   0,
     'MANUAL', 'icms-import-2026-09-17', 'IGBT propulsion; AC cab. Added after ICMS 15-Sep worked 18029.');

-- Step 3 — verify. Expect three rows, each HOG-capable.
SELECT loco_number, loco_type, railway_zone, home_shed, commission_date,
       traction_converter, hotel_load_oem,
       IF(hotel_load_oem IS NOT NULL AND hotel_load_oem <> '', 'HOG', 'no HOG') AS hog
FROM div_locos WHERE loco_number IN ('45022', '45024', '45026')
ORDER BY loco_number;

-- Rollback:
-- DELETE FROM div_locos WHERE loco_number IN ('45022','45024','45026')
--   AND entered_by = 'icms-import-2026-09-17';
