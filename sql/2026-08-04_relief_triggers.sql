-- =====================================================================
-- Relief triggers — split out of 2026-08-04_relief_columns.sql because
-- CREATE TRIGGER needs a privilege the app's DB user lacks.
--
-- On a binlog-enabled server, creating a trigger requires SUPER:
--   ERROR 1419 (HY000): You do not have the SUPER privilege and binary
--                       logging is enabled
-- Local dev has no binlog, so this only bites on prod.
--
-- RUN AS ROOT, or enable the relaxation first and run as the normal user:
--   SET PERSIST log_bin_trust_function_creators = 1;
--
-- WHAT THEY DO
-- Enforce "only a working leg may carry relief" — a piloting crew are
-- passengers travelling to work a train and relieve nobody. Unlike the
-- waiting-marker triggers, these REJECT the write rather than silently
-- correcting it: a relief marker on a piloting leg means the entry is wrong,
-- not merely untidy.
--
-- This cannot be a CHECK constraint — MySQL rejects a column used in CHECK
-- when its FK carries a referential action, and rt_detail/rb_detail have
-- ON UPDATE CASCADE (kept deliberately: details do get renumbered here).
-- =====================================================================

-- piloting leg means the entry is wrong, not merely untidy.
DROP TRIGGER IF EXISTS trg_trains_relief_working_ins;
DROP TRIGGER IF EXISTS trg_trains_relief_working_upd;

DELIMITER $$
CREATE TRIGGER trg_trains_relief_working_ins BEFORE INSERT ON trains
FOR EACH ROW
BEGIN
  IF NEW.train_type <> 'working'
     AND (NEW.rt_detail IS NOT NULL OR NEW.rb_detail IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'R/T and R/B are only valid on a working leg - a piloting crew travels as passengers and relieves nobody';
  END IF;
END$$

CREATE TRIGGER trg_trains_relief_working_upd BEFORE UPDATE ON trains
FOR EACH ROW
BEGIN
  IF NEW.train_type <> 'working'
     AND (NEW.rt_detail IS NOT NULL OR NEW.rb_detail IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'R/T and R/B are only valid on a working leg - a piloting crew travels as passengers and relieves nobody';
  END IF;
END$$
DELIMITER ;


-- verify
SELECT TRIGGER_NAME, EVENT_MANIPULATION FROM information_schema.TRIGGERS
 WHERE EVENT_OBJECT_TABLE='trains' AND TRIGGER_NAME LIKE '%relief%'
 ORDER BY TRIGGER_NAME;
