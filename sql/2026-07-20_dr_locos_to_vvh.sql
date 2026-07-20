-- 2026-07-20 — move locos stabled at DR to VVH
--
-- WHY
-- Dadar terminates nine train pairs (11004, 11006, 11022, 11028, 11036, 11042,
-- 12132, 17317, 22148) but has no stabling shed. Those locos actually stand at
-- Vasai (VVH) and work out from there.
--
-- The code now maps DR -> VVH on arrival (stablingTerminal in
-- routes/division/locoLinkRoutes.js), so nothing new will be positioned at DR.
-- This moves the locos already sitting there, which would otherwise be stranded
-- at a location the application no longer assigns — invisible on the VVH board
-- and unavailable for the DR-originating workings they are meant to cover.
--
-- Run this AFTER deploying the code change, so nothing re-creates a DR position
-- in between.

-- Step 1 — preview. Expect a handful (6 on prod's 2026-07-19 snapshot).
SELECT loco_number, current_location, arrived_via_train, arrived_at
FROM div_loco_positions
WHERE current_location = 'DR'
ORDER BY arrived_at;

-- Step 2 — move them, leaving the arrival details intact so each loco keeps
-- showing the train it came in on.
UPDATE div_loco_positions
SET current_location = 'VVH',
    remarks    = CONCAT(COALESCE(NULLIF(remarks, ''), 'arrived DR'), ' — stabled VVH'),
    updated_by = 'dr-to-vvh'
WHERE current_location = 'DR';

-- Step 3 — trail for the movement, consistent with how positions are tracked.
INSERT INTO div_loco_position_history
    (loco_number, from_location, to_location, movement_type, train_no,
     working_date, moved_at, remarks, moved_by)
SELECT loco_number, 'DR', 'VVH', 'TRANSFER', arrived_via_train,
       DATE(arrived_at), NOW(), 'DR has no stabling shed — locos stand at VVH', 'dr-to-vvh'
FROM div_loco_positions
WHERE current_location = 'VVH' AND updated_by = 'dr-to-vvh';

-- Step 4 — verify: DR should be empty.
SELECT current_location, COUNT(*) AS locos
FROM div_loco_positions
WHERE current_location IN ('DR', 'VVH')
GROUP BY current_location;
