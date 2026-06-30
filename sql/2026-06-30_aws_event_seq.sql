-- ============================================================================
-- div_aws_events.event_seq — allow N events per CMS abnormality row
-- Date : 2026-06-30
-- Why  : A single CMS detail can record more than one AWS act, e.g.
--        "Aws/ B @ NE 5918  Aux @ NE 5510" or "C at 8808 A at 7414". Until now
--        UNIQUE(abn_id) forced exactly one event per row, so a multi-act detail
--        collapsed to one event at one signal — undercounting for the JPO rules
--        (Rule 1 consecutive-signals, S&T per-magnet). The parser now SPLITS
--        such details into one event per act; event_seq (1..N) distinguishes the
--        acts of the same abn_id, and the uniqueness moves to (abn_id, event_seq)
--        so re-import is still idempotent.
-- Idempotent.
-- ============================================================================

DROP PROCEDURE IF EXISTS _bbtro_aws_event_seq;
DELIMITER $$
CREATE PROCEDURE _bbtro_aws_event_seq()
BEGIN
    -- 1. Add the column.
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_aws_events' AND COLUMN_NAME = 'event_seq'
    ) THEN
        ALTER TABLE div_aws_events
            ADD COLUMN event_seq TINYINT NOT NULL DEFAULT 1
                COMMENT 'Act number within one CMS detail (1..N for multi-act details)'
                AFTER abn_id;
    END IF;

    -- 2. Drop the old single-column unique key on abn_id.
    IF EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_aws_events' AND INDEX_NAME = 'uk_abn_id'
    ) THEN
        ALTER TABLE div_aws_events DROP INDEX uk_abn_id;
    END IF;

    -- 3. Add the composite unique key (abn_id, event_seq).
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_aws_events' AND INDEX_NAME = 'uk_abn_seq'
    ) THEN
        ALTER TABLE div_aws_events ADD UNIQUE KEY uk_abn_seq (abn_id, event_seq);
    END IF;
END$$
DELIMITER ;
CALL _bbtro_aws_event_seq();
DROP PROCEDURE _bbtro_aws_event_seq;
