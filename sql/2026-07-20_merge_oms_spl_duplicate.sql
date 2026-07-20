-- 2026-07-20 — merge the duplicate OMS SPL train record
--
-- WHY
-- div_trains holds the same train twice:
--
--   train_id 543  train_no 'OMS SPL'  name NULL       Special  created 2026-06-03
--   train_id 579  train_no 'OMS/SPL'  name 'OMS SPL'  Express  created 2026-07-02
--
-- 579 was created a month later with a slash in the train number, so it reads
-- as a separate train everywhere. Operator's decision: keep 'OMS SPL' (543).
--
-- 579 is not empty — it carries one real working:
--   div_loco_link_log id 9509, 2026-07-02, CSMT-DN, DN, loco 37218
-- That is history and must not be discarded, so the row is repointed to 543
-- rather than deleted with its parent.
--
-- 543 already holds three log rows (2026-06-01 KR-DN, 2026-06-01 KR-UP,
-- 2026-07-03 CSMT-DN with loco 37325).
--
-- SAFE ON KEYS
--   div_loco_link_log  UNIQUE (working_date, train_no, direction).
--     The repointed row becomes (2026-07-02, 'OMS SPL', DN); 543's existing
--     rows are 2026-06-01 DN, 2026-06-01 UP and 2026-07-03 DN. No collision.
--   div_train_aliases  PRIMARY (train_id, train_no) — the 579 alias is dropped.
--   No other table references 543 or 579 (checked master, segments, stops,
--   position history, positions, sick records, defects).
--
-- Every statement is scoped to the old id/value, so a re-run is a no-op.

-- ── Step 1: preview ────────────────────────────────────────────────────────
SELECT train_id, train_no, train_name, train_type, is_regular, is_active, created_at
FROM div_trains WHERE train_no IN ('OMS SPL','OMS/SPL') ORDER BY train_id;

SELECT id, working_date, train_no, train_id, direction, sheet_source, actual_loco_no
FROM div_loco_link_log WHERE train_id IN (543,579) ORDER BY working_date;

-- ── Step 2: keep the better name on the surviving row ──────────────────────
-- 543 has no train_name; 579 carried 'OMS SPL'. Drop this statement if you
-- would rather leave 543's name NULL.
UPDATE div_trains SET train_name = 'OMS SPL'
WHERE train_id = 543 AND train_name IS NULL;

-- ── Step 3: move 579's working history onto 543 ────────────────────────────
UPDATE div_loco_link_log
SET train_id = 543, train_no = 'OMS SPL'
WHERE train_id = 579 AND train_no = 'OMS/SPL';

-- ── Step 4: drop the duplicate's alias, then the duplicate ─────────────────
DELETE FROM div_train_aliases WHERE train_id = 579 AND train_no = 'OMS/SPL';

DELETE FROM div_trains WHERE train_id = 579 AND train_no = 'OMS/SPL';

-- ── Step 5: verify ─────────────────────────────────────────────────────────
-- Expect one train row, four log rows all on 543, and no 'OMS/SPL' anywhere.
SELECT train_id, train_no, train_name, train_type, is_active
FROM div_trains WHERE train_no LIKE 'OMS%';

SELECT id, working_date, train_no, train_id, direction, sheet_source, actual_loco_no
FROM div_loco_link_log WHERE train_id IN (543,579) OR train_no LIKE 'OMS%'
ORDER BY working_date;

SELECT COUNT(*) AS stray_oms_slash_rows
FROM div_train_aliases WHERE train_no = 'OMS/SPL';
