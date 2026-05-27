-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: event_time on div_loco_link_log for inline specials
-- Date: 2026-05-26
--
-- Purpose: When LPC adds a "special train" inline on daily-entry, the row has
--   no master_id (and therefore no event_time from div_loco_link_master). To
--   allow these rows to sort by time alongside regular master-linked entries,
--   capture event_time directly on the log row.
--
-- For master-linked rows (master_id IS NOT NULL), event_time can stay NULL —
-- the master's event_time is the source of truth there.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE div_loco_link_log
    ADD COLUMN event_time VARCHAR(30) NULL
        COMMENT 'HH:MM for inline specials (master_id IS NULL); NULL when row inherits from div_loco_link_master.event_time';
