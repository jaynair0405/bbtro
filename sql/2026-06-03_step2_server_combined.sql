-- ═══════════════════════════════════════════════════════════════════════════
-- Architecture rebuild — STEP 2 (server-only combined)
-- Date: 2026-06-03
--
-- Combines two things:
--   (i)  Add 20153/20154 (CSMT-REWA SF Express) to div_trains on server.
--        These were registered on local during testing earlier in this
--        session but never propagated. Required so the renumber pre-step
--        below can map 02187/02188 to them as historical aliases.
--   (ii) Backfill div_trains + div_train_aliases for all remaining orphan
--        train_no values found in div_loco_link_master / div_loco_link_log.
--
-- After this, every train_no anywhere in the schema resolves to a train_id
-- via div_train_aliases.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0a. Register 20153/20154 (the renumbered REWA SF Express pair) ──────────
INSERT INTO div_trains
    (train_no, train_name, train_type, direction, from_station, to_station,
     run_days, traction_type, is_regular, is_active)
VALUES
    ('20153', 'CSMT-REWA SF Express', 'Superfast', 'DN', 'CSMT', 'IGP', '5', 'Electric', 1, 1),
    ('20154', 'CSMT-REWA SF Express', 'Superfast', 'UP', 'IGP', 'CSMT', '5', 'Electric', 1, 1);

-- ── 0b. Currently-valid alias rows for the just-added trains ────────────────
INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until)
SELECT t.train_id, t.train_no, NULL, NULL
FROM div_trains t
WHERE t.train_no IN ('20153','20154')
  AND NOT EXISTS (
      SELECT 1 FROM div_train_aliases a
      WHERE a.train_id = t.train_id AND a.train_no = t.train_no
  );

-- ── 1. Pre-step: known renumber pairs ──────────────────────────────────────
-- 02187/02188 were the old numbers for CSMT-REWA SF Express, now renumbered
-- to 20154/20153 respectively. Register them as historical aliases so they
-- DON'T get backfilled as standalone div_trains rows in §2 below.
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

-- ── 2c. Currently-valid alias rows for newly-created div_trains rows ────────
INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until)
SELECT t.train_id, t.train_no, NULL, NULL
FROM div_trains t
WHERE NOT EXISTS (
    SELECT 1 FROM div_train_aliases a
    WHERE a.train_id = t.train_id AND a.train_no = t.train_no
);

-- ── Verification (run separately) ───────────────────────────────────────────
-- SELECT 'div_trains'                                  AS info, COUNT(*) FROM div_trains;
-- SELECT 'currently valid aliases'                     AS info, COUNT(*) FROM div_train_aliases WHERE valid_until IS NULL;
-- SELECT 'master orphans remaining (alias-aware)'      AS info, COUNT(DISTINCT m.train_no)
--   FROM div_loco_link_master m
--   WHERE NOT EXISTS (SELECT 1 FROM div_train_aliases a WHERE a.train_no = m.train_no);
-- SELECT * FROM div_train_aliases WHERE train_no IN ('02187','02188','20153','20154') ORDER BY train_no;
