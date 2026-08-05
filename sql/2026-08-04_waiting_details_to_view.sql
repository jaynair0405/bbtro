-- =====================================================================
-- waiting_details: table -> view, so spare duties stop being maintained twice.
--
-- WHY
-- A "spare" (waiting) duty is a whole detail with no train work: one leg
-- named WAITING, zero wheel movement, zero piloting. There are 40 of them.
-- Their sign-on / sign-off / duty were stored BOTH in `details` and in the
-- standalone `waiting_details` table, and wheel-movement + duty-hour
-- calculations read the latter (routes/wheelMovementRoutes.js:153,
-- server.js:827 — both plain SELECTs, nothing writes to it).
--
-- The two agree today, but a new detail book is due and details get revised
-- (see 2026-08-04_csmt_harbour_six_detail_revision.sql). Any such revision
-- updates `details` and leaves `waiting_details` stale — and wheel movement
-- would then silently compute on the old times, with nothing to flag it.
--
-- Same fix, and the same rollback shape, as the motormen table -> view
-- conversion documented in CLAUDE.md.
--
-- WHY NO NEW "is_spare" COLUMN
-- The marker already exists in the right place: the WAITING leg in `trains`.
-- It lives in the same table the user edits, so marking a detail spare is
-- just entering the leg — not a separate checkbox that can be forgotten.
-- It is also a POSITIVE marker, so a detail whose legs merely haven't been
-- entered yet is not mistaken for spare.
--
-- ENFORCEMENT
-- The triggers that keep the marker canonical ship SEPARATELY, in
-- 2026-08-04_waiting_triggers.sql — CREATE TRIGGER needs a privilege the
-- app's DB user does not have on a binlog-enabled server. This file needs
-- no special privilege and can be deployed on its own; the view is correct
-- without the triggers because it tests the train number as well as the type.
-- =====================================================================

-- ---------------------------------------------------------------- 1. retype
-- 35 of the 40 WAITING legs are typed 'working' (only 13, 25, 47, 61, 85 are
-- correct) — an artefact of a later import pass that defaulted the type.
-- Safe: these rows contribute 0 minutes to wheel movement (00:00 -> 00:00,
-- and calculateTrainWheelMovement only adds 24h when the duration is
-- STRICTLY negative), the fetch is `train_type IN ('working','piloting',
-- 'waiting')` so the row is loaded either way, and spare details short-
-- circuit on waitingDetailsMap before reaching any `=== 'working'` filter.
-- What it does fix: 35 spare duties currently count as having a working train.
UPDATE trains
   SET train_type = 'waiting'
 WHERE UPPER(REPLACE(train_number,' ','')) = 'WAITING'
   AND train_type <> 'waiting';
-- expect: 35 rows affected

-- ------------------------------------------------------- 2. enforce forever
-- The triggers that keep the WAITING marker canonical live in a SEPARATE file,
-- 2026-08-04_waiting_triggers.sql, because CREATE TRIGGER needs a privilege
-- this file does not: on a server with binary logging enabled it requires
-- SUPER (or log_bin_trust_function_creators=1), and the app's DB user has
-- neither. Splitting them means the migration below can be deployed by the
-- ordinary user and the triggers added whenever the privilege is available.
--
-- The view does NOT depend on them: it tests both train_type='waiting' AND
-- train_number='WAITING', so it is correct either way. The triggers only stop
-- a future write from recording the marker inconsistently.

-- ------------------------------------------------------------ 3. the view
-- Build the view under a temporary name FIRST, then swap.
--
-- Order matters on a live server: the view reads `detail_blocks`, which ships
-- in 2026-07-28_detail_blocks.sql. If that table is absent this CREATE fails
-- here, while `waiting_details` is still the original table and wheel movement
-- keeps working. Renaming first would leave no waiting_details at all.
--
-- office is derived from the detail_blocks number ranges (the same rule the
-- classifier and the page snapshots use) and mapped CSMT-SUB -> CSMT etc.
-- The train_number test is kept alongside train_type as belt-and-braces for
-- any row that predates the triggers.
CREATE VIEW waiting_details_new AS
SELECT DISTINCT
       d.detail_number,
       d.sign_on_time,
       d.sign_off_time,
       LPAD(d.total_duty_hours, 5, '0')        AS total_duty_hours,
       REPLACE(b.office_code, '-SUB', '')      AS office,
       d.line
  FROM details d
  JOIN trains t
    ON t.detail_id = d.detail_id
   AND (t.train_type = 'waiting'
        OR UPPER(REPLACE(t.train_number, ' ', '')) = 'WAITING')
  LEFT JOIN detail_blocks b
    ON b.line = d.line
   AND CAST(d.detail_number AS UNSIGNED) BETWEEN b.start_number AND b.end_number;

-- Prove the view reproduces the table BEFORE the swap. Want 40 / 40 / 0.
SELECT 'pre-swap comparison (want 40 / 40 / 0)' AS check_;
SELECT (SELECT COUNT(*) FROM waiting_details_new) AS view_rows,
       (SELECT COUNT(*) FROM waiting_details)     AS table_rows,
       (SELECT COUNT(*) FROM waiting_details o
          WHERE NOT EXISTS (SELECT 1 FROM waiting_details_new v
                             WHERE v.detail_number = o.detail_number
                               AND v.line          = o.line
                               AND v.sign_on_time  = o.sign_on_time
                               AND v.sign_off_time = o.sign_off_time
                               AND v.total_duty_hours = o.total_duty_hours
                               AND v.office        = o.office)) AS rows_that_differ;

-- Atomic swap: one statement, so there is no instant where the name is absent.
-- Old table kept as the rollback (same convention as motormen_old).
RENAME TABLE waiting_details     TO waiting_details_old,
             waiting_details_new TO waiting_details;

-- ------------------------------------------------------------- 4. verify
SELECT 'row counts (want 40 / 40 / 0)' AS check_;
SELECT (SELECT COUNT(*) FROM waiting_details)     AS view_rows,
       (SELECT COUNT(*) FROM waiting_details_old) AS old_rows,
       (SELECT COUNT(*) FROM waiting_details_old o
          WHERE NOT EXISTS (SELECT 1 FROM waiting_details v
                             WHERE v.detail_number = o.detail_number
                               AND v.line          = o.line
                               AND v.sign_on_time  = o.sign_on_time
                               AND v.sign_off_time = o.sign_off_time
                               AND v.total_duty_hours = o.total_duty_hours
                               AND v.office        = o.office)) AS rows_that_differ;

SELECT 'the exact query wheelMovementRoutes.js:153 runs' AS check_;
SELECT detail_number, sign_on_time, sign_off_time, total_duty_hours
  FROM waiting_details
 ORDER BY CAST(detail_number AS UNSIGNED)
 LIMIT 5;

SELECT 'no WAITING leg left mistyped (want 0)' AS check_;
SELECT COUNT(*) AS mistyped FROM trains
 WHERE UPPER(REPLACE(train_number,' ','')) = 'WAITING' AND train_type <> 'waiting';

-- =====================================================================
-- ROLLBACK
--   DROP VIEW waiting_details;
--   RENAME TABLE waiting_details_old TO waiting_details;
--   DROP TRIGGER IF EXISTS trg_trains_waiting_norm_ins;
--   DROP TRIGGER IF EXISTS trg_trains_waiting_norm_upd;
--   (the retype is not reverted — it was a correction, not a change)
-- =====================================================================
