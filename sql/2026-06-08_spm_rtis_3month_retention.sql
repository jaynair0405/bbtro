-- =============================================================================
-- 3-month retention for SPM & RTIS raw point data
-- =============================================================================
-- Why: the raw per-point telemetry tables grow without bound and dominate disk:
--   div_sub_spm_window_points  (~2.9 GB, ~9.5M rows)
--   div_rtis_braking_points    (~0.9 GB, ~10M rows)
-- Plan (decided at project start, never implemented): keep raw points for the
-- last 3 MONTHS only; older points are deleted. Summary/result tables are kept:
--   div_sub_spm_runs, div_sub_spm_station_windows,
--   div_rtis_analyses, div_rtis_braking_runs, div_rtis_braking_halts,
--   div_rtis_violations
--
-- Age basis = date_of_working (the date the train actually ran). The point
-- tables have no working date, so we age them via their parent run:
--   SPM:  div_sub_spm_window_points.run_id -> div_sub_spm_runs.date_of_working
--   RTIS: div_rtis_braking_points.run_id   -> div_rtis_braking_runs.date_of_working
-- (FK: points.run_id -> runs.run_id. Deleting the child points is FK-safe;
--  parents are kept, nothing cascades.)
--
-- NULL date_of_working rows are NOT deleted (NULL < date is never true) — they
-- stay until their run gets a working date. Rare; acceptable.
--
-- This file installs the RECURRING auto-trim (MySQL events). The first, large
-- one-time cleanup of existing >3-month rows is done with a BATCHED shell loop
-- (see deploy notes) so it never locks the table or bloats undo. After the
-- one-time cleanup, run OPTIMIZE TABLE to return freed space to disk.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Pre-flight (safe; deletes nothing) — confirm what WOULD be removed:
-- ---------------------------------------------------------------------------
-- SELECT COUNT(*) AS spm_delete FROM div_sub_spm_window_points
--   WHERE run_id IN (SELECT run_id FROM div_sub_spm_runs
--                    WHERE date_of_working < CURDATE() - INTERVAL 3 MONTH);
-- SELECT COUNT(*) AS rtis_delete FROM div_rtis_braking_points
--   WHERE run_id IN (SELECT run_id FROM div_rtis_braking_runs
--                    WHERE date_of_working < CURDATE() - INTERVAL 3 MONTH);

-- ---------------------------------------------------------------------------
-- Recurring auto-trim via the MySQL event scheduler.
-- The daily increment is tiny (only ~1 day of runs crosses the 3-month line
-- each run), so a single un-batched DELETE per day is fine here.
-- ---------------------------------------------------------------------------
-- Event scheduler must be ON. Enable now AND persist it in my.cnf:
--   [mysqld]
--   event_scheduler = ON
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS ev_spm_window_points_retention;
CREATE EVENT ev_spm_window_points_retention
  ON SCHEDULE EVERY 1 DAY
    STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 2 HOUR)        -- ~02:00 daily
  COMMENT 'Keep div_sub_spm_window_points for 3 months (by run date_of_working)'
  DO
    DELETE p FROM div_sub_spm_window_points p
    JOIN div_sub_spm_runs r ON p.run_id = r.run_id
    WHERE r.date_of_working < CURDATE() - INTERVAL 3 MONTH;

DROP EVENT IF EXISTS ev_rtis_braking_points_retention;
CREATE EVENT ev_rtis_braking_points_retention
  ON SCHEDULE EVERY 1 DAY
    STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 2 HOUR + INTERVAL 10 MINUTE)
  COMMENT 'Keep div_rtis_braking_points for 3 months (by run date_of_working)'
  DO
    DELETE p FROM div_rtis_braking_points p
    JOIN div_rtis_braking_runs r ON p.run_id = r.run_id
    WHERE r.date_of_working < CURDATE() - INTERVAL 3 MONTH;

-- Verify:
--   SELECT @@global.event_scheduler;   -- expect ON
--   SHOW EVENTS FROM bbtro;

-- ---------------------------------------------------------------------------
-- Cron fallback (if you prefer cron over the event scheduler):
--   1) creds in ~/.my.cnf  ([client] user=.. password=..; chmod 600)
--   2) save the two DELETEs above into ~/retention/spm_rtis_retention.sql
--   3) crontab -e:
--        0 2 * * * mysql bbtro < ~/retention/spm_rtis_retention.sql >> ~/retention/retention.log 2>&1
--   (and DROP the events so it isn't done twice)
-- ---------------------------------------------------------------------------
