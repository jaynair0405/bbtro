-- ═══════════════════════════════════════════════════════════════════════════
-- Architecture rebuild — STEP 2 of N
-- Date: 2026-06-03
--
-- Backfills div_trains and div_train_aliases for train_no values that
-- appear in div_loco_link_master / div_loco_link_log / div_loco_sick_records
-- / div_loco_defects but have no row in div_trains today.
--
-- Inferred metadata per orphan train:
--   train_name        — from master.train_name where available, else NULL
--   train_type        — 'Special' (these are all H/SPL / 0x series)
--   direction         — master.direction if UP/DN, else NULL (BYPASS rows
--                       don't fit div_trains's UP/DN enum; CTLC fills in
--                       direction later via Settings if needed)
--   from_station,
--   to_station        — from master where available
--   is_regular = 0    — not regular timetable trains
--   is_active  = 1    — assume active; CTLC can deactivate later
--
-- Skipped entries:
--   sick_train_no = 'TKD/JNPT' — not a train number (shed code typed in
--   error). Stays on the sick record as a display snapshot, no train_id
--   link.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── PRE-STEP: register known renumber pairs BEFORE backfilling orphans ──────
-- These are train_no values that appear in master/log but are actually old
-- numbers of currently-running trains. We want them to be historical aliases
-- pointing to the existing train_id, NOT new div_trains rows.
--
-- Add more such cases here as they are discovered. Each INSERT is idempotent
-- (NOT EXISTS guard).
INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until)
SELECT t.train_id, x.old_no, NULL, x.renamed_date
FROM (
    SELECT '02187' AS old_no, '20154' AS new_no, DATE '2026-05-27' AS renamed_date
    UNION ALL SELECT '02188', '20153', DATE '2026-05-27'
) x
JOIN div_trains t ON t.train_no = x.new_no
WHERE NOT EXISTS (
    SELECT 1 FROM div_train_aliases a
    WHERE a.train_id = t.train_id AND a.train_no = x.old_no
);

-- ── 2a. Backfill div_trains from master orphans ─────────────────────────────
-- Orphan = a train_no in master that has NO alias (current or historical) yet.
-- Using the alias table (not just div_trains.train_no) means a number that
-- was renumbered is correctly recognized via its alias.
INSERT INTO div_trains
    (train_no, train_name, train_type, direction,
     from_station, to_station, is_regular, is_active)
SELECT
    o.train_no,
    o.train_name,
    'Special'                AS train_type,
    CASE WHEN o.direction IN ('UP','DN') THEN o.direction ELSE NULL END AS direction,
    o.from_station,
    o.to_station,
    0                        AS is_regular,
    1                        AS is_active
FROM (
    SELECT m.train_no,
           MAX(m.train_name)    AS train_name,
           MAX(m.direction)     AS direction,
           MAX(m.from_station)  AS from_station,
           MAX(m.to_station)    AS to_station
    FROM div_loco_link_master m
    WHERE NOT EXISTS (
        SELECT 1 FROM div_train_aliases a WHERE a.train_no = m.train_no
    )
    GROUP BY m.train_no
) o;

-- ── 2b. Backfill div_trains from log orphans ────────────────────────────────
INSERT INTO div_trains (train_no, train_type, is_regular, is_active)
SELECT DISTINCT l.train_no, 'Special', 0, 1
FROM div_loco_link_log l
WHERE l.train_no IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM div_train_aliases a WHERE a.train_no = l.train_no
  );

-- ── 2c. Backfill div_train_aliases for all newly-created trains ─────────────
-- Every div_trains row should have at least one alias row (its current number).
INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until)
SELECT t.train_id, t.train_no, NULL, NULL
FROM div_trains t
WHERE NOT EXISTS (
    SELECT 1 FROM div_train_aliases a
    WHERE a.train_id = t.train_id AND a.train_no = t.train_no
);

-- ── Verification ────────────────────────────────────────────────────────────
-- SELECT COUNT(*) FROM div_trains;                                          -- expect prior + 37
-- SELECT COUNT(*) FROM div_train_aliases WHERE valid_until IS NULL;         -- = COUNT(div_trains)
-- Orphans should now be zero:
-- SELECT COUNT(DISTINCT m.train_no)
--   FROM div_loco_link_master m
--   WHERE NOT EXISTS (SELECT 1 FROM div_trains t WHERE t.train_no = m.train_no);
-- SELECT COUNT(DISTINCT l.train_no)
--   FROM div_loco_link_log l
--   WHERE l.train_no IS NOT NULL
--     AND NOT EXISTS (SELECT 1 FROM div_trains t WHERE t.train_no = l.train_no);
