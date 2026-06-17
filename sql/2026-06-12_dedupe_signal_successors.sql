-- ============================================================================
-- Dedupe div_signal_successors + close the NULL-route_condition loophole
-- Date    : 2026-06-12
-- Bug     : uq_succession includes route_condition. MySQL treats NULL as
--           distinct in unique keys, so rows with a blank route_condition
--           (stored as NULL) never collided and duplicated on every
--           re-import of the successor CSVs. 53 dup rows accumulated locally.
-- Fix     : (1) delete duplicate rows keeping the lowest id per logical key,
--           (2) normalize NULL -> '' so the unique key dedupes going forward,
--           (3) make route_condition NOT NULL DEFAULT '' to prevent recurrence.
-- Idempotent: safe to re-run (no dups -> no deletes; already ''/NOT NULL -> no-op).
-- ============================================================================

-- 1. Drop duplicate rows, keep the lowest id in each logical group.
DELETE s1 FROM div_signal_successors s1
JOIN div_signal_successors s2
  ON  s1.from_signal_text = s2.from_signal_text
  AND s1.to_signal_text   = s2.to_signal_text
  AND s1.from_line         = s2.from_line
  AND s1.to_line           = s2.to_line
  AND COALESCE(s1.route_condition, '') = COALESCE(s2.route_condition, '')
  AND s1.id > s2.id;

-- 2. Normalize NULL route_condition to empty string.
UPDATE div_signal_successors SET route_condition = '' WHERE route_condition IS NULL;

-- 3. Lock the column so NULLs can't reappear and bypass the unique key.
ALTER TABLE div_signal_successors
    MODIFY route_condition VARCHAR(50) NOT NULL DEFAULT '' COMMENT 'e.g. PF-10, MAIN, LOOP; "" when not a platform/named route';

-- Verify
SELECT COUNT(*) AS total_rows,
       COUNT(*) - COUNT(DISTINCT from_signal_text, to_signal_text, from_line, to_line, route_condition) AS remaining_dups
FROM div_signal_successors;
