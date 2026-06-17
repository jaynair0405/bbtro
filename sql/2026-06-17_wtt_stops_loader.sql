-- 2026-06-17_wtt_stops_loader.sql
-- Prep for the WTT halts loader (Step 5b) — see WTT_LOADER_PLAN.md.
-- Run before scripts/load_wtt_stops.js. Idempotent / guarded.

-- 1. event_type: the WTT carries three values; the table only had two.
ALTER TABLE div_train_stops
  MODIFY event_type ENUM('halt','pass_or_depart','arrive_or_pass') NOT NULL;

-- 2. Per-stop direction. Mumbai-division working terminology labels some terminal
--    rows with the "opposite" direction (operationally correct), so direction is
--    stored per stop rather than per train.
ALTER TABLE div_train_stops
  ADD COLUMN direction ENUM('UP','DN') NULL AFTER train_id;

-- 3. Cabin pseudo-stations referenced by the WTT (only 2 of 34 codes missing).
--    Codes contain a space — kept verbatim to match the CSV / FK.
INSERT INTO div_stations (station_code, station_name, is_active)
SELECT 'TGR 2', 'TGR Cabin No.2', 1
WHERE NOT EXISTS (SELECT 1 FROM div_stations WHERE station_code = 'TGR 2');

INSERT INTO div_stations (station_code, station_name, is_active)
SELECT 'TGR 3', 'TGR Cabin No.3', 1
WHERE NOT EXISTS (SELECT 1 FROM div_stations WHERE station_code = 'TGR 3');
