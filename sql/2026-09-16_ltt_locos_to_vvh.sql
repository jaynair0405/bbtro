-- 2026-09-16 — move locos standing at LTT to VVH, the shed that holds them
--
-- WHY
-- VVH (Electric Loco Trip Shed, Vidyavihar) is the shed for the LTT group.
-- LTT and DR are stations: trains arrive and depart there, but neither can
-- stable a loco, so the locos run light to VVH and back. That is why the
-- loco-link sheet is named for the station (LTT-DN) while the locos belong to
-- the shed — the same reason the sheet was renamed from VVH-DN to LTT-DN, with
-- VVH-DN kept only as an alias in SHEET_ALIASES.
--
-- DR was already mapped to VVH on 2026-07-20
-- (sql/2026-07-20_dr_locos_to_vvh.sql). LTT was not, so its locos stayed at the
-- station: on the board that meant an LTT tab full of locos and a VVH tab with
-- the workings, and on the Loco Availability page it meant the VVH locos were
-- invisible altogether (that page skipped any location outside its own short
-- list). STABLING_TERMINAL now maps LTT -> VVH as well, so new arrivals land at
-- VVH by themselves. This moves the ones already recorded at LTT.
--
-- RUN THIS AFTER DEPLOYING THE CODE, so nothing re-creates an LTT position in
-- between — same ordering the DR migration used.
--
-- NOTE the reads are already safe either way: /available, /positions and the
-- assignment board all query the whole VVH+DR+LTT pool, so a loco left at LTT
-- is still offered. This migration is what stops 54 of them being badged
-- "AT LTT" on the VVH board as though each were an exception.

-- Step 1 — preview. Expect 54 on local; prod will differ.
SELECT current_location, COUNT(*) AS locos
FROM div_loco_positions
WHERE current_location IN ('LTT', 'VVH')
GROUP BY current_location;

SELECT loco_number, current_location, arrived_via_train, DATE(arrived_at) AS arrived
FROM div_loco_positions
WHERE current_location = 'LTT'
ORDER BY arrived_at;

-- Step 2 — trail FIRST, so it records the real from_location before the move
-- and a re-run cannot double-insert (the DR file wrote history after the
-- update and relied on its marker; this is the same idea made re-runnable).
INSERT INTO div_loco_position_history
    (loco_number, from_location, to_location, movement_type, train_no,
     working_date, moved_at, remarks, moved_by)
SELECT lp.loco_number, 'LTT', 'VVH', 'TRANSFER', lp.arrived_via_train,
       DATE(lp.arrived_at), NOW(),
       'LTT has no stabling shed — locos stand at VVH', 'ltt-to-vvh'
FROM div_loco_positions lp
WHERE lp.current_location = 'LTT'
  AND NOT EXISTS (
        SELECT 1 FROM div_loco_position_history h
        WHERE h.loco_number = lp.loco_number
          AND h.from_location = 'LTT' AND h.to_location = 'VVH'
          AND h.moved_by = 'ltt-to-vvh');

-- Step 3 — move them, leaving arrival details intact so each loco keeps
-- showing the train it came in on.
UPDATE div_loco_positions
SET current_location = 'VVH',
    remarks    = CONCAT(COALESCE(NULLIF(remarks, ''), 'arrived LTT'), ' — stabled VVH'),
    updated_by = 'ltt-to-vvh'
WHERE current_location = 'LTT';

-- Step 4 — verify. Expect LTT empty and VVH holding its own plus the moved set.
SELECT current_location, COUNT(*) AS locos
FROM div_loco_positions
WHERE current_location IN ('LTT', 'VVH', 'DR')
GROUP BY current_location;

SELECT COUNT(*) AS moved_by_this_script
FROM div_loco_positions WHERE updated_by = 'ltt-to-vvh';

-- Rollback:
-- UPDATE div_loco_positions
-- SET current_location = 'LTT',
--     remarks = NULLIF(REPLACE(remarks, ' — stabled VVH', ''), 'arrived LTT'),
--     updated_by = NULL
-- WHERE current_location = 'VVH' AND updated_by = 'ltt-to-vvh';
-- DELETE FROM div_loco_position_history WHERE moved_by = 'ltt-to-vvh';
