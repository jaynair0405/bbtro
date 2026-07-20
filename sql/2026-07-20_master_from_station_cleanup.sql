-- 2026-07-20 — clean up from_station on div_loco_link_master
--
-- WHY
-- 22 active masters hold a from_station that is either NULL or a combined
-- "origin / destination" string ("LTT / LTT", "IGP / SGTY", "RN / MAO",
-- "BIRD/ BIRD", "PUNE/ SMVB"). The daily sheet groups by (section, from_station)
-- and renders a sub-header per group, so each stray value produces a phantom
-- section tab — a second "NE" on CSMT-DN, a "KR · ex LTT / LTT" beside the real
-- "KR · ex LTT", and so on. One further row (11032) holds a plausible but wrong
-- value rather than a malformed one.
--
-- THE RULE (operator-confirmed 2026-07-20)
-- A train's "from/to" means three different things in this system:
--   1. Real origin/destination — anywhere on IR (SMVB, NGP, MAO, SGTY).
--      Lives in div_trains and the WTT. NOT what this column holds.
--   2. Mumbai crew beat — ROHA/RN, PUNE, IGP/MMR/JL, BSR.
--   3. Control-office / LPC handover point — what THIS column holds on UP
--      sheets:
--            NE  -> IGP        SE  -> LNL
--            KR  -> ROHA       BSR -> KARD
--      Every train on a route takes that route's handover point, without
--      exception.
-- On DN sheets the column is instead where the train departs: a Mumbai terminal
-- (CSMT, LTT, DR, PNVL) or an in-division origin such as BIRD for the parcel
-- trains, which is why 00111/01149 keep a group of their own.
--
-- Worked examples given by the operator:
--   16553  origin SMVB, crew PUNE->LTT, LPC handover LNL          -> LNL
--   11100  origin RN, KR handover                                  -> ROHA
--   11032  handover IGP, crew IGP, destination PNVL                -> IGP
--   04104  departs PNVL, handover IGP, destination SFG             -> PNVL
--   11203  origin NGP, handover IGP, then ROHA, destination MAO    -> IGP
--   11204  from MAO, handover ROHA, next handover IGP              -> ROHA
--
-- 11032 is worth singling out: it read PNVL (its destination) but its own
-- event_time of 00:30 is its IGP arrival, not its 05:30 PNVL arrival. The row
-- contradicted itself.
--
-- sheet_source, section, direction and timings are untouched. Only from_station
-- changes, so nothing moves sheet; the phantom sub-tabs simply merge into the
-- real ones.
--
-- Keyed on train_no + sheet_source rather than id, and every statement is
-- guarded on the value actually changing, so a re-run is a no-op.

-- ── Step 1: preview — expect 22 malformed rows plus 11032 ──────────────────
SELECT id, train_no, sheet_source, direction, section,
       CONCAT('[', COALESCE(from_station,'NULL'), ']') AS from_station, event_time
FROM div_loco_link_master
WHERE active = 1
  AND ( from_station LIKE '%/%' OR from_station LIKE '% %'
        OR from_station IS NULL OR from_station = ''
        OR (train_no = '11032' AND sheet_source = 'PNVL-UP') )
ORDER BY sheet_source, section, train_no;

-- ── Step 2: UP sheets — the route's handover point ─────────────────────────

-- NE handover
UPDATE div_loco_link_master SET from_station = 'IGP'
WHERE active = 1 AND NOT (from_station <=> 'IGP')
  AND ( (train_no = '00112' AND sheet_source = 'CSMT-UP')
     OR (train_no = '01150' AND sheet_source = 'CSMT-UP')
     OR (train_no = '20154' AND sheet_source = 'CSMT-UP')
     OR (train_no = '11002' AND sheet_source = 'CSMT-UP')
     OR (train_no = '01144' AND sheet_source = 'LTT-UP')
     OR (train_no = '04103' AND sheet_source = 'PNVL-UP')
     OR (train_no = '11032' AND sheet_source = 'PNVL-UP')
     OR (train_no = '11203' AND sheet_source = 'BYPASS') );

-- SE handover
UPDATE div_loco_link_master SET from_station = 'LNL'
WHERE active = 1 AND NOT (from_station <=> 'LNL')
  AND train_no = '16553' AND sheet_source = 'LTT-UP';

-- KR handover
UPDATE div_loco_link_master SET from_station = 'ROHA'
WHERE active = 1 AND NOT (from_station <=> 'ROHA')
  AND ( (train_no = '11100' AND sheet_source = 'KR-UP')
     OR (train_no = '22120' AND sheet_source = 'KR-UP')
     OR (train_no = '12202' AND sheet_source = 'KR-UP')
     OR (train_no = '12134' AND sheet_source = 'KR-UP')
     OR (train_no = '11204' AND sheet_source = 'BYPASS') );

-- ── Step 3: DN sheets — where the train departs ────────────────────────────

UPDATE div_loco_link_master SET from_station = 'LTT'
WHERE active = 1 AND NOT (from_station <=> 'LTT')
  AND ( (train_no = '11099' AND sheet_source = 'KR-DN')
     OR (train_no = '12201' AND sheet_source = 'KR-DN')
     OR (train_no = '01143' AND sheet_source = 'LTT-DN')
     OR (train_no = '16554' AND sheet_source = 'LTT-DN') );

UPDATE div_loco_link_master SET from_station = 'CSMT'
WHERE active = 1 AND NOT (from_station <=> 'CSMT')
  AND ( (train_no = '22119' AND sheet_source = 'KR-DN')
     OR (train_no = '20153' AND sheet_source = 'CSMT-DN') );

-- Parcel trains that genuinely start at BIRD, not at the sheet's terminal.
-- These keep a group of their own; it just gets a clean name.
UPDATE div_loco_link_master SET from_station = 'BIRD'
WHERE active = 1 AND NOT (from_station <=> 'BIRD')
  AND train_no IN ('00111','01149') AND sheet_source = 'CSMT-DN';

UPDATE div_loco_link_master SET from_station = 'PNVL'
WHERE active = 1 AND NOT (from_station <=> 'PNVL')
  AND train_no = '04104' AND sheet_source = 'PNVL-DN';

-- ── Step 4: verify — this should now return no rows ────────────────────────
SELECT id, train_no, sheet_source, from_station
FROM div_loco_link_master
WHERE active = 1
  AND (from_station LIKE '%/%' OR from_station LIKE '% %'
       OR from_station IS NULL OR from_station = '');

-- ── Step 5: the resulting sheet groups — one per real origin/handover ──────
SELECT sheet_source, section, COALESCE(from_station,'NULL') AS from_station,
       COUNT(*) AS trains
FROM div_loco_link_master
WHERE active = 1
GROUP BY sheet_source, section, from_station
ORDER BY sheet_source, section, trains DESC;
