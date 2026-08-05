-- =====================================================================
-- WAITING marker triggers — split out of 2026-08-04_waiting_details_to_view.sql
-- because CREATE TRIGGER needs a privilege the app's DB user lacks.
--
-- On a server with binary logging enabled, creating a trigger requires SUPER,
-- and without it you get:
--   ERROR 1419 (HY000): You do not have the SUPER privilege and binary logging
--                       is enabled
-- Local dev has no binlog, so this only bites on prod.
--
-- RUN AS ROOT, or enable the relaxation first and run as the normal user:
--   SET PERSIST log_bin_trust_function_creators = 1;
--
-- WHAT THEY DO
-- Normalise the spare-duty marker on every write path — UI, API, bulk import
-- or hand-written SQL. Whichever signal is given the row ends up canonical on
-- both columns. They self-correct rather than erroring, so a bulk import is
-- never aborted by one row.
--   train_number = 'WAITING'  ->  forces train_type   = 'waiting'
--   train_type   = 'waiting'  ->  forces train_number = 'WAITING'
--
-- Single-statement bodies, so no DELIMITER is needed. Multiple assignments in
-- one SET evaluate left to right, so the second sees the first's result.
-- =====================================================================

DROP TRIGGER IF EXISTS trg_trains_waiting_norm_ins;
DROP TRIGGER IF EXISTS trg_trains_waiting_norm_upd;

CREATE TRIGGER trg_trains_waiting_norm_ins BEFORE INSERT ON trains
FOR EACH ROW
  SET NEW.train_type   = IF(UPPER(REPLACE(NEW.train_number,' ','')) = 'WAITING', 'waiting', NEW.train_type),
      NEW.train_number = IF(NEW.train_type = 'waiting', 'WAITING', NEW.train_number);

CREATE TRIGGER trg_trains_waiting_norm_upd BEFORE UPDATE ON trains
FOR EACH ROW
  SET NEW.train_type   = IF(UPPER(REPLACE(NEW.train_number,' ','')) = 'WAITING', 'waiting', NEW.train_type),
      NEW.train_number = IF(NEW.train_type = 'waiting', 'WAITING', NEW.train_number);


-- verify
SELECT TRIGGER_NAME, EVENT_MANIPULATION FROM information_schema.TRIGGERS
 WHERE EVENT_OBJECT_TABLE='trains' AND TRIGGER_NAME LIKE '%waiting%'
 ORDER BY TRIGGER_NAME;
