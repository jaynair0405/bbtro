-- 2026-07-29 — sync sheet run_days for the KR monsoon-curtailed trains
--
-- WHY
-- run_days is duplicated: Settings (div_trains) vs the daily sheet
-- (div_loco_link_master). The LPC curtailed three KR trains for the monsoon
-- timetable in Settings, but the edit predated the write-through fix (commit
-- 38bee28), so the sheet kept the pre-monsoon calendar and showed them on days
-- they no longer run.
--
--   22120 (KR-UP)  sheet 2,3,5,6,7 -> 3,5,7
--   11099 (KR-DN)  sheet 2,5,6,7   -> 5,7
--   11100 (KR-UP)  sheet 2,5,6,7   -> 1,6
--
-- This is a TARGETED, one-time sync of ONLY these three, confirmed by the LPC.
-- It is NOT a blanket sync: div_trains.run_days is incompletely populated for
-- ~100 other trains (often just a single day), so syncing those would wrongly
-- reduce them to one day. Those are a separate inspection, deferred.
--
-- Going forward, div_loco_link_master stays in step automatically — PUT /trains
-- now mirrors run_days into it (commit 38bee28).

-- Step 1 — preview.
SELECT m.train_no, m.sheet_source, m.run_days AS sheet_before, t.run_days AS settings
FROM div_loco_link_master m JOIN div_trains t ON t.train_no = m.train_no
WHERE m.active = 1 AND m.train_no IN ('22120','11099','11100')
ORDER BY m.train_no;

-- Step 2 — sync the three.
UPDATE div_loco_link_master m JOIN div_trains t ON t.train_no = m.train_no
SET m.run_days = t.run_days
WHERE m.active = 1 AND m.train_no IN ('22120','11099','11100');

-- Step 3 — verify: sheet now equals settings for all three.
SELECT m.train_no, m.sheet_source, m.run_days AS sheet_after, t.run_days AS settings,
       (m.run_days = t.run_days) AS in_sync
FROM div_loco_link_master m JOIN div_trains t ON t.train_no = m.train_no
WHERE m.active = 1 AND m.train_no IN ('22120','11099','11100')
ORDER BY m.train_no;
