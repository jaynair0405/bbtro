-- 2026-07-20 — correct from_station for the eight Dadar departures
--
-- WHY
-- Eight DN workings that depart Dadar are recorded in div_loco_link_master with
-- from_station = 'LTT', because they are worked from the LTT-DN sheet. Their
-- true origin is DR, confirmed by div_trains, by the WTT stop lists, and by the
-- operator.
--
--   11005 CHALUKYA EXP      DR -> PUNE   21:30   SE
--   11021 DR-TEN EXP        DR -> PUNE   21:30   SE
--   11027 DR-STR-DR EXP     DR -> PUNE   23:55   SE
--   11035 SHARAVATI EXP     DR -> PUNE   21:30   SE
--   11041 DR-SNSI EXP       DR -> PUNE   23:55   SE
--   17318 DR-UBL-DR EXP     DR -> PUNE   20:05   SE
--   12131 DR-SNSI EXP       DR -> IGP    21:45   NE
--   22147 DR-SNSI-DR SF EXP DR -> IGP    21:45   NE
--
-- Note the names alone cannot identify these: CHALUKYA and SHARAVATI carry no
-- "DR" (nor does 11003 TUTARI, which was already correct). The origin has to
-- come from the timetable, not the name.
--
-- WHAT IT FIXES, in two places at once
--   * Daily sheet — it already groups by (section, from_station) and already
--     renders "NE · ex DR" sub-headers; it simply had the wrong value. After
--     this the eight appear under "SE · ex DR" and "NE · ex DR" instead of
--     being mixed into the LTT rows with nothing to distinguish them.
--   * Assignment board — origin resolves to DR, which maps to VVH (DR has no
--     stabling shed), so these workings sit with the locos that actually feed
--     them. VVH board goes from 1 working to 9.
--
-- sheet_source is deliberately NOT changed: they stay on the LTT-DN sheet,
-- which is where the LPC works them. Only the origin is corrected.
--
-- This was preferred over overriding from_station with div_trains in code, so
-- the sheet and the board keep reading one field and cannot drift apart.

-- Step 1 — preview.
SELECT m.train_no, m.sheet_source, m.section,
       m.from_station AS link_says, t.from_station AS timetable_says, m.event_time
FROM div_loco_link_master m
LEFT JOIN div_trains t ON t.train_no = m.train_no
WHERE m.active = 1 AND m.direction = 'DN'
  AND m.train_no IN ('11005','11021','11027','11035','11041','12131','17318','22147')
ORDER BY m.section, m.event_time;

-- Step 2 — correct it. Scoped to rows that still say LTT so a re-run is a no-op.
UPDATE div_loco_link_master
SET from_station = 'DR'
WHERE active = 1 AND direction = 'DN'
  AND train_no IN ('11005','11021','11027','11035','11041','12131','17318','22147')
  AND from_station = 'LTT';

-- Step 3 — verify. Expect eight rows reading DR, and no remaining disagreement
-- between the link master and the timetable for these trains.
SELECT m.train_no, m.sheet_source, m.section, m.from_station, t.from_station AS timetable_says
FROM div_loco_link_master m
LEFT JOIN div_trains t ON t.train_no = m.train_no
WHERE m.active = 1 AND m.direction = 'DN'
  AND m.train_no IN ('11005','11021','11027','11035','11041','12131','17318','22147')
ORDER BY m.section, m.event_time;

-- Rollback:
-- UPDATE div_loco_link_master SET from_station = 'LTT'
-- WHERE active = 1 AND direction = 'DN'
--   AND train_no IN ('11005','11021','11027','11035','11041','12131','17318','22147')
--   AND from_station = 'DR';
