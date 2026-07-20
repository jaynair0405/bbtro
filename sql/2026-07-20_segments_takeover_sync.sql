-- 2026-07-20 — bring div_train_segments in step with today's from_station fixes
--
-- WHY
-- Today we corrected div_loco_link_master.from_station for eleven trains: the
-- eight Dadar departures recorded as LTT, the three re-terminalled LTT trains
-- recorded as CSMT, and 11032 recorded as PNVL. div_train_segments was not
-- updated at the same time, so its loco_takeover_station still holds the old
-- values for those rows.
--
-- Nothing reads div_train_segments today, so nothing is broken. But Phase B of
-- LOCO_LINK_ARCHITECTURE_REVIEW.md plans to make segments the source of truth
-- and drop from_station from the master. If that happened now, these eleven
-- trains would silently revert to the values we corrected this afternoon.
--
-- Note the segments' CREW columns were already right in every case
-- (staff_from_station reads DR / LTT / IGP as appropriate) — only the loco
-- columns lagged. That is a useful signal: the two concepts are maintained
-- independently, which is exactly why the single from_station column on the
-- master kept drifting between them.
--
-- ALREADY CORRECT, deliberately untouched:
--   16332 / 16340 / 16352 (UP)  loco LNL -> LTT   — re-terminalling already applied
--   22629 (DN) loco LTT -> ROHA, 22630 (UP) loco ROHA -> LTT
--   11031 (DN) loco PNVL -> IGP
--
-- Verified against prod values on 2026-07-20. Every statement is scoped to the
-- old value, so a re-run is a no-op.
--
-- MySQL Workbench: the WHERE clauses key on train_id (indexed), so safe-update
-- mode should allow these. If it still objects, run  SET SQL_SAFE_UPDATES = 0;
-- first and set it back to 1 afterwards.

-- ── Step 1: preview — the eleven rows, before ──────────────────────────────
SELECT t.train_no, s.segment_label, s.segment_direction,
       s.loco_takeover_station AS loco_from, s.loco_handover_station AS loco_to,
       s.staff_from_station    AS crew_from, s.staff_to_station      AS crew_to
FROM div_train_segments s JOIN div_trains t ON t.train_id = s.train_id
WHERE t.train_no IN ('11005','11021','11027','11035','11041','12131','22147',
                     '16331','16339','16351','11032')
ORDER BY t.train_no;

-- ── Step 2: the eight Dadar departures — takeover LTT -> DR ────────────────
-- These depart Dadar; the sheet was corrected in
-- sql/2026-07-20_dr_departures_from_station.sql. Their crew_from already reads DR.
UPDATE div_train_segments
SET loco_takeover_station = 'DR'
WHERE segment_direction = 'DN'
  AND loco_takeover_station = 'LTT'
  AND train_id IN (SELECT train_id FROM div_trains
                   WHERE train_no IN ('11005','11021','11027','11035',
                                      '11041','12131','22147'));

-- ── Step 3: the three re-terminalled trains — takeover CSMT -> LTT ─────────
-- Moved from CSMT to LTT; the WTT stop lists were corrected in
-- sql/2026-07-20_wtt_ltt_reterminal.sql. Their crew_from already reads LTT.
UPDATE div_train_segments
SET loco_takeover_station = 'LTT'
WHERE segment_direction = 'DN'
  AND loco_takeover_station = 'CSMT'
  AND train_id IN (SELECT train_id FROM div_trains
                   WHERE train_no IN ('16331','16339','16351'));

-- ── Step 4: 11032 — two columns wrong ─────────────────────────────────────
-- Operator: "hand over station for 11032 is IGP, crew point IGP, destination
-- PNVL." The segment had takeover PNVL (its destination) and handover CSMT (a
-- station it does not reach). crew_from/crew_to already read IGP -> PNVL.
UPDATE div_train_segments
SET loco_takeover_station = 'IGP'
WHERE segment_direction = 'UP'
  AND loco_takeover_station = 'PNVL'
  AND train_id IN (SELECT train_id FROM div_trains WHERE train_no = '11032');

UPDATE div_train_segments
SET loco_handover_station = 'PNVL'
WHERE segment_direction = 'UP'
  AND loco_handover_station = 'CSMT'
  AND train_id IN (SELECT train_id FROM div_trains WHERE train_no = '11032');

-- ── Step 5: verify — the same eleven rows, after ──────────────────────────
SELECT t.train_no, s.segment_label, s.segment_direction,
       s.loco_takeover_station AS loco_from, s.loco_handover_station AS loco_to,
       s.staff_from_station    AS crew_from, s.staff_to_station      AS crew_to
FROM div_train_segments s JOIN div_trains t ON t.train_id = s.train_id
WHERE t.train_no IN ('11005','11021','11027','11035','11041','12131','22147',
                     '16331','16339','16351','11032')
ORDER BY t.train_no;

-- ── Step 6: sheet and segments should now agree everywhere ────────────────
-- Expect differs = 0 for both directions.
SELECT CASE WHEN m.direction = 'UP' THEN 'UP' ELSE 'DN' END AS dir,
       SUM(m.from_station =  s.loco_takeover_station) AS agrees,
       SUM(m.from_station <> s.loco_takeover_station) AS differs
FROM div_loco_link_master m
JOIN div_train_segments s ON s.segment_id = m.segment_id
WHERE m.active = 1
  AND s.loco_takeover_station IS NOT NULL
  AND m.from_station IS NOT NULL
GROUP BY dir;

-- ── NOT ADDRESSED HERE ────────────────────────────────────────────────────
-- 11031 and 11032 carry segment_label 'CSMT-DN' / 'CSMT-UP' though they work
-- the PNVL sheets. The label is descriptive only and nothing reads it, so it is
-- left alone rather than widening this change.
