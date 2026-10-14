-- div_signals: one side per signal, on every write path.
--
-- placement and the four flags (is_rhs, is_ext_rhs, is_lhs, is_ext_lhs) are two
-- encodings of one fact; the book prints from the flags. They drifted apart when
-- one was edited without the other (K-049, 2026-10-14: Ext RHS ticked, placement
-- left at 'Left'). The editor and publish now keep them together; these triggers
-- do the same for CSV imports, the prod->local sync SQL and hand-written SQL.
--
--   placement       flag
--   Left            is_lhs
--   Right           is_rhs
--   Extreme Right   is_ext_rhs
--   Extreme Left    is_ext_lhs
--   Gantry          (none)
--
-- Rules
--   * More than one flag            -> REJECTED (input error, not untidiness).
--   * INSERT: one flag              -> placement follows the flag.
--             no flag               -> the flag follows placement.
--   * UPDATE: only placement changed -> the flags follow placement.
--             otherwise, one flag   -> placement follows the flag (flags win, as
--                                      the book prints from them).
--   * No side at all ('Unknown'/NULL and no flag) -> defaults to Left + is_lhs
--     (decision 2026-10-14). Importers warn about this before committing.
--
-- Self-correcting rather than erroring (except two flags), like the WAITING
-- triggers on trains, so one bad row never aborts a bulk import.
--
-- On prod run as MySQL root (`sudo mysql bbtro < sql/2026-10-14_signals_side_triggers.sql`):
-- binary logging is on there, so the .env user gets ERROR 1419 on CREATE TRIGGER.
--
-- Rollback:
--   DROP TRIGGER IF EXISTS trg_signals_side_ins;
--   DROP TRIGGER IF EXISTS trg_signals_side_upd;

DROP TRIGGER IF EXISTS trg_signals_side_ins;
DROP TRIGGER IF EXISTS trg_signals_side_upd;

DELIMITER $$

CREATE TRIGGER trg_signals_side_ins BEFORE INSERT ON div_signals
FOR EACH ROW
BEGIN
  IF COALESCE(NEW.is_rhs,0) + COALESCE(NEW.is_ext_rhs,0) + COALESCE(NEW.is_lhs,0) + COALESCE(NEW.is_ext_lhs,0) > 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'div_signals: only one of is_rhs / is_ext_rhs / is_lhs / is_ext_lhs may be set';
  END IF;

  IF     NEW.is_ext_rhs = 1 THEN SET NEW.placement = 'Extreme Right';
  ELSEIF NEW.is_rhs     = 1 THEN SET NEW.placement = 'Right';
  ELSEIF NEW.is_ext_lhs = 1 THEN SET NEW.placement = 'Extreme Left';
  ELSEIF NEW.is_lhs     = 1 THEN SET NEW.placement = 'Left';
  ELSEIF NEW.placement IS NULL OR NEW.placement = 'Unknown' THEN SET NEW.placement = 'Left';
  END IF;

  SET NEW.is_lhs     = (NEW.placement = 'Left');
  SET NEW.is_rhs     = (NEW.placement = 'Right');
  SET NEW.is_ext_rhs = (NEW.placement = 'Extreme Right');
  SET NEW.is_ext_lhs = (NEW.placement = 'Extreme Left');
END$$

CREATE TRIGGER trg_signals_side_upd BEFORE UPDATE ON div_signals
FOR EACH ROW
BEGIN
  DECLARE flags_changed BOOLEAN DEFAULT
        NOT (NEW.is_rhs <=> OLD.is_rhs) OR NOT (NEW.is_ext_rhs <=> OLD.is_ext_rhs)
     OR NOT (NEW.is_lhs <=> OLD.is_lhs) OR NOT (NEW.is_ext_lhs <=> OLD.is_ext_lhs);
  DECLARE placement_changed BOOLEAN DEFAULT NOT (NEW.placement <=> OLD.placement);

  IF COALESCE(NEW.is_rhs,0) + COALESCE(NEW.is_ext_rhs,0) + COALESCE(NEW.is_lhs,0) + COALESCE(NEW.is_ext_lhs,0) > 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'div_signals: only one of is_rhs / is_ext_rhs / is_lhs / is_ext_lhs may be set';
  END IF;

  -- Only placement was edited: leave it alone and let the flags follow below.
  IF NOT (placement_changed AND NOT flags_changed) THEN
    IF     NEW.is_ext_rhs = 1 THEN SET NEW.placement = 'Extreme Right';
    ELSEIF NEW.is_rhs     = 1 THEN SET NEW.placement = 'Right';
    ELSEIF NEW.is_ext_lhs = 1 THEN SET NEW.placement = 'Extreme Left';
    ELSEIF NEW.is_lhs     = 1 THEN SET NEW.placement = 'Left';
    END IF;
  END IF;
  IF NEW.placement IS NULL OR NEW.placement = 'Unknown' THEN SET NEW.placement = 'Left'; END IF;

  SET NEW.is_lhs     = (NEW.placement = 'Left');
  SET NEW.is_rhs     = (NEW.placement = 'Right');
  SET NEW.is_ext_rhs = (NEW.placement = 'Extreme Right');
  SET NEW.is_ext_lhs = (NEW.placement = 'Extreme Left');
END$$

DELIMITER ;
