-- 2026-07-20 — WTT: four train pairs re-terminalled to LTT, stop lists still on the old route
--
-- WHY
-- 16331/16332, 16339/16340, 16351/16352 and 22629/22630 were moved to LTT.
-- div_trains and div_loco_link_master were updated; div_train_stops was not, so
-- the WTT (and wtt.html) still shows the pre-change terminal:
--
--   DN  16331/16339/16351   1:CSMT dep 20:35   2:DR 20:50/20:52   3:TNA 21:17 …
--   DN  22629               1:DR   dep 20:40   2:TNA 21:09/21:12  …
--   UP  16332/16340/16352   … 6:TNA 18:19/18:22   7:DR 18:44/18:47   8:CSMT arr 19:05
--   UP  22630               … 7:TNA 14:30/14:33  8:DR arr 15:10
--
-- Dadar is not on the LTT path — from LTT the line runs to TNA via Kurla — so DR
-- drops out of the three PUNE pairs in both directions. The resulting sequence
-- matches what nine comparable LTT–PUNE workings already use (11013, 11017,
-- 12163, 12219, 16554, 17222, 18520, 22101, 22179). For the 22629/22630 pair DR
-- was the terminus itself, so it is simply retargeted to LTT.
--
--   DN  16331/16339/16351   LTT → TNA → DIVA → KYN → KJT → LNL → PUNE
--   DN  22629               LTT → TNA → DIVA → PNVL → ROHA → KHED → CHI → RN
--   UP  16332/16340/16352   PUNE → LNL → KJT → KYN → DIVA → TNA → LTT
--   UP  22630               RN → CHI → KHED → ROHA → PNVL → DIVA → TNA → LTT
--
-- TIMES — all supplied by the operator or already in the table. None invented.
--   DN 16331/16339/16351  dep LTT 20:55   (loco-link sheet, confirmed on prod)
--   DN 22629              dep LTT 20:45   (loco-link sheet, confirmed on prod)
--   UP 16332/16340/16352  arr LTT 18:50   (operator)
--   UP 22630              arr LTT 15:00   (operator)
--
-- Sanity: UP 16332 TNA dep 18:22 → LTT 18:50 = 28 min, sitting between the old
-- DR 18:44 and CSMT 19:05. UP 22630 TNA dep 14:33 → LTT 15:00 = 27 min against
-- the old DR 15:10 = 37 min. Both consistent with LTT being nearer than DR.
--
-- Timings away from the terminal are left untouched: only the terminal changed,
-- and the loco-link sheet independently corroborates the upstream values
-- (22630 at ROHA 12:27 vs the WTT's 12:25/12:30).
--
-- Idempotent — every statement is scoped to the old station code, so a re-run
-- is a no-op.

-- ── Step 1: preview ─────────────────────────────────────────────────────────
SELECT t.train_no, s.direction, s.seq_order, s.station_code,
       s.arrival_time, s.departure_time, s.event_type, s.day_offset
FROM div_trains t JOIN div_train_stops s ON s.train_id = t.train_id
WHERE t.train_no IN ('16331','16339','16351','22629','16332','16340','16352','22630')
ORDER BY t.train_no, s.direction, s.seq_order;

-- ── Step 2: retarget the terminals ─────────────────────────────────────────
-- Scoped by the OLD station code, so each statement is a no-op once applied.

-- DN, the three PUNE trains: origin CSMT -> LTT
UPDATE div_train_stops s JOIN div_trains t ON t.train_id = s.train_id
SET s.station_code = 'LTT', s.departure_time = '20:55:00',
    s.arrival_time = NULL, s.event_type = 'pass_or_depart'
WHERE t.train_no IN ('16331','16339','16351')
  AND s.direction = 'DN' AND s.station_code = 'CSMT';

-- DN, 22629: DR was the origin -> LTT
UPDATE div_train_stops s JOIN div_trains t ON t.train_id = s.train_id
SET s.station_code = 'LTT', s.departure_time = '20:45:00',
    s.arrival_time = NULL, s.event_type = 'pass_or_depart'
WHERE t.train_no = '22629'
  AND s.direction = 'DN' AND s.seq_order = 1 AND s.station_code = 'DR';

-- UP, the three PUNE trains: terminus CSMT -> LTT
UPDATE div_train_stops s JOIN div_trains t ON t.train_id = s.train_id
SET s.station_code = 'LTT', s.arrival_time = '18:50:00',
    s.departure_time = NULL, s.event_type = 'arrive_or_pass'
WHERE t.train_no IN ('16332','16340','16352')
  AND s.direction = 'UP' AND s.station_code = 'CSMT';

-- UP, 22630: DR was the terminus -> LTT. Must run BEFORE the DR deletes below,
-- and is scoped to this train so those deletes cannot touch it.
UPDATE div_train_stops s JOIN div_trains t ON t.train_id = s.train_id
SET s.station_code = 'LTT', s.arrival_time = '15:00:00',
    s.departure_time = NULL, s.event_type = 'arrive_or_pass'
WHERE t.train_no = '22630'
  AND s.direction = 'UP' AND s.seq_order = 8 AND s.station_code = 'DR';

-- ── Step 3: drop Dadar from the three PUNE pairs ───────────────────────────
-- Not on the LTT path in either direction. Scoped to these six trains only.
DELETE s FROM div_train_stops s JOIN div_trains t ON t.train_id = s.train_id
WHERE t.train_no IN ('16331','16339','16351','16332','16340','16352')
  AND s.station_code = 'DR';

-- ── Step 4: close the gaps left by the deleted rows ────────────────────────
-- Two phases, because (train_id, seq_order) is UNIQUE (uk_train_seq): a plain
-- "seq_order = seq_order - 1" transiently collides with the row below it, and
-- is not safe to re-run. Parking the rows at 100+ first frees the whole 1..n
-- range, so the renumber cannot collide whatever order the rows are visited in.
-- Re-running is harmless: the same final numbering comes out.
UPDATE div_train_stops s JOIN div_trains t ON t.train_id = s.train_id
SET s.seq_order = s.seq_order + 100
WHERE t.train_no IN ('16331','16339','16351','22629','16332','16340','16352','22630');

UPDATE div_train_stops s
JOIN (
    SELECT s2.id,
           ROW_NUMBER() OVER (PARTITION BY s2.train_id, s2.direction
                              ORDER BY s2.seq_order) AS rn
    FROM div_train_stops s2
    JOIN div_trains t2 ON t2.train_id = s2.train_id
    WHERE t2.train_no IN ('16331','16339','16351','22629',
                          '16332','16340','16352','22630')
) x ON x.id = s.id
SET s.seq_order = x.rn;

-- ── Step 6: verify ─────────────────────────────────────────────────────────
-- Expect: DN lists start 1:LTT, UP lists end at LTT, no DR row on the three
-- PUNE pairs, unbroken seq_order.
SELECT t.train_no, s.direction, s.seq_order, s.station_code,
       s.arrival_time, s.departure_time, s.day_offset
FROM div_trains t JOIN div_train_stops s ON s.train_id = t.train_id
WHERE t.train_no IN ('16331','16339','16351','22629','16332','16340','16352','22630')
ORDER BY t.train_no, s.direction, s.seq_order;

-- ── Step 7: the WTT endpoints should now agree with div_trains ─────────────
SELECT t.train_no, s.direction, t.from_station, t.to_station,
       SUBSTRING_INDEX(GROUP_CONCAT(s.station_code ORDER BY s.seq_order), ',', 1) AS wtt_first,
       SUBSTRING_INDEX(GROUP_CONCAT(s.station_code ORDER BY s.seq_order DESC), ',', 1) AS wtt_last
FROM div_trains t JOIN div_train_stops s ON s.train_id = t.train_id
WHERE t.train_no IN ('16331','16339','16351','22629','16332','16340','16352','22630')
GROUP BY t.train_no, s.direction, t.from_station, t.to_station
ORDER BY t.train_no, s.direction;

-- ── NOT ADDRESSED HERE — still open ────────────────────────────────────────
--   * MONSOON TIMINGS have nowhere to live. 22630 arrives LTT 15:00 normally
--     and 17:20 in the monsoon working. div_train_stops has no notion of a
--     seasonal variant, so only one can be held at a time. 15:00 is stored.
--     div_loco_link_master already has effective_from / effective_until /
--     skip_dates; the stops table has no equivalent.
--   * 11031 / 15066 (DN) and 11032 / 15065 (UP) are missing their PNVL row
--     entirely — the list starts or ends at KYN. Needs the PNVL timings; this
--     is an inserted row, not a corrected one.
--   * segment_id and is_mumbai_segment_start are unpopulated across all 422
--     trains — the fields that would separate a train's origin from the point
--     it enters the division, and which made "first stop" unusable as an origin
--     for the loco assignment board.
