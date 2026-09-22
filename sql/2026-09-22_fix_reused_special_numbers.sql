-- 2026-09-22 — 01129 / 01130 show last season's name on the sheet
--
-- WHAT IS WRONG
-- The sheet renders the WORKING for everything except the name, which it joins
-- from the registry:  COALESCE(t.train_name, m.train_name).  The registry wins.
--
-- These two numbers have been REUSED. The workings are correct and current —
--
--     master 451  01129  KR-DN  "LTT-SWV Ganpati SPL"  15-22 Sep
--     master 452  01130  KR-UP  "SWV-LTT Ganpati SPL"  16-23 Sep
--
-- — and ICMS agrees (01129 ran LTT -> SWV on 15 Sep, departing 08:45). But
-- div_trains still holds the identity the number carried in June:
--
--     572  01129  "CSMT-KRMI H/SPL"
--     576  01130  "KRMI-CSMT H/SPL"
--
-- so that is what the LPC sees. The registry is stale, not the working.
--
-- WHY NOT JUST PREFER THE WORKING'S NAME IN THE QUERY
-- Because for almost every other train the registry is the BETTER name. Of 120
-- rows where the two disagree, only 4 are specials, and in those the working's
-- name is the corrupted one ("SGTY-BIRD PADXRCEL" against the registry's
-- "SGTY-BIRD Parcel"). For regular trains the registry carries the full
-- round-trip name ("GWL-DD-GWL SF EXP") where the working has an abbreviated
-- one-way. Flipping the precedence would fix these two and spoil 118 others.
-- The registry is right to win; it is simply out of date here.
--
-- THE COST, stated plainly
-- div_trains holds ONE identity per train number, so renaming relabels any
-- history under that number. 01129 has 3 logged rows (26-Jun to 22-Sep) and
-- 01130 has 1 (29-Jun) — the June ones belong to the old service and will now
-- read as the new name. Two rows. The alternative, date-scoped names, is not
-- something the schema or the sheet query supports, and is not worth building
-- for a handful of rows.
--
-- The previous names are recorded here so they are not simply lost.

-- Step 1 — preview: registry against working.
SELECT t.train_no, t.train_id, t.train_name AS registry_now,
       m.train_name AS working_says, m.sheet_source, m.effective_from, m.effective_until
FROM div_trains t
LEFT JOIN div_loco_link_master m ON m.train_no = t.train_no AND m.active = 1
WHERE t.train_no IN ('01129','01130');

-- Step 2 — bring the registry up to date. Guarded on the stale value, so a
-- re-run does nothing and a later reuse is not silently overwritten.
UPDATE div_trains SET train_name = 'LTT-SWV Ganpati SPL'
WHERE train_no = '01129' AND train_name = 'CSMT-KRMI H/SPL';

UPDATE div_trains SET train_name = 'SWV-LTT Ganpati SPL'
WHERE train_no = '01130' AND train_name = 'KRMI-CSMT H/SPL';

-- Step 3 — verify. Registry and working should now agree.
SELECT t.train_no, t.train_name AS registry_now, m.train_name AS working_says,
       IF(TRIM(t.train_name) = TRIM(m.train_name), 'agree', 'STILL DIFFER') AS check_result
FROM div_trains t
JOIN div_loco_link_master m ON m.train_no = t.train_no AND m.active = 1
WHERE t.train_no IN ('01129','01130');

-- Rollback:
-- UPDATE div_trains SET train_name='CSMT-KRMI H/SPL' WHERE train_no='01129';
-- UPDATE div_trains SET train_name='KRMI-CSMT H/SPL' WHERE train_no='01130';
