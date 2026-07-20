-- 2026-07-20 — one-time mop-up of stale terminal positions in div_loco_positions
--
-- WHY
-- div_loco_positions is written by an event stream: an UP train save records an
-- ARRIVAL, a DN train save records a DEPARTURE. Departures go missing in two
-- ways — auto-propagated DN rows never fire one at all, and a DN row saved
-- before the loco has arrived writes its departure too early, after which the
-- later arrival overwrites it. Net effect: locos check in and never check out.
--
-- On prod as of 2026-07-19 this had accumulated to 224 locos "standing" at the
-- Mumbai terminals (CSMT 105, LTT 104), 125 of them supposedly parked 3+ days.
--
-- This clears the ghosts ONCE. It is not a cure — they will accumulate again at
-- the same rate until current position is derived from the daily sheets instead
-- of maintained as mutable state.
--
-- SAFETY
--   * Sets current_location = 'OUT_OF_DIV' rather than deleting: div_loco_positions
--     is keyed one-row-per-loco, so a DELETE would discard the record entirely.
--   * Skips locos with an open sick record — they legitimately sit at sheds.
--   * Skips locos already booked on a DN train today or later.
--   * Stamps a remark so machine-cleared rows stay identifiable.
--
-- Verified on a local copy of prod data 2026-07-20: 83 rows cleared,
-- terminals 224 -> 140 (55 booked / 85 available).

-- Step 1 — preview. Confirm the counts before running anything below.
SELECT lp.current_location AS terminal,
       COUNT(*) AS total_now,
       SUM(CASE WHEN (lp.arrived_at < CURDATE() - INTERVAL 3 DAY OR lp.arrived_at IS NULL)
            AND NOT EXISTS (SELECT 1 FROM div_loco_sick_records sr
                            WHERE sr.loco_number = lp.loco_number AND sr.fit_from IS NULL)
            AND NOT EXISTS (SELECT 1 FROM div_loco_link_log ll
                            WHERE ll.direction = 'DN' AND ll.working_date >= CURDATE()
                              AND (ll.actual_loco_no = lp.loco_number
                                   OR ll.actual_loco_no_rear = lp.loco_number
                                   OR SUBSTRING_INDEX(ll.actual_loco_no_rear, '+', 1) = lp.loco_number))
           THEN 1 ELSE 0 END) AS will_clear
FROM div_loco_positions lp
WHERE lp.current_location IN ('CSMT','LTT','DR','PNVL','VVH','KYN','TNA')
GROUP BY lp.current_location WITH ROLLUP;

-- Step 2 — backup. Do not skip.
CREATE TABLE div_loco_positions_bak_20260720 AS SELECT * FROM div_loco_positions;
SELECT COUNT(*) AS backed_up FROM div_loco_positions_bak_20260720;

-- Step 3 — clear the ghosts.
UPDATE div_loco_positions lp
SET lp.current_location = 'OUT_OF_DIV',
    lp.remarks     = CONCAT('auto-cleared ', CURDATE(), ' (stale terminal position)'),
    lp.updated_by  = 'cleanup'
WHERE lp.current_location IN ('CSMT','LTT','DR','PNVL','VVH','KYN','TNA')
  AND (lp.arrived_at < CURDATE() - INTERVAL 3 DAY OR lp.arrived_at IS NULL)
  AND NOT EXISTS (SELECT 1 FROM div_loco_sick_records sr
                  WHERE sr.loco_number = lp.loco_number AND sr.fit_from IS NULL)
  AND NOT EXISTS (SELECT 1 FROM div_loco_link_log ll
                  WHERE ll.direction = 'DN' AND ll.working_date >= CURDATE()
                    AND (ll.actual_loco_no = lp.loco_number
                         OR ll.actual_loco_no_rear = lp.loco_number
                         OR SUBSTRING_INDEX(ll.actual_loco_no_rear, '+', 1) = lp.loco_number));

-- Step 4 — verify: re-run Step 1. will_clear should be 0 everywhere.

-- Rollback, if the result looks wrong:
-- UPDATE div_loco_positions p
--   JOIN div_loco_positions_bak_20260720 b ON b.loco_number = p.loco_number
-- SET p.current_location = b.current_location,
--     p.remarks          = b.remarks,
--     p.updated_by       = b.updated_by;
