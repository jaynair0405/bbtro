-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: from_station + to_station on div_loco_link_log for inline specials
-- Date: 2026-06-01
--
-- When LPC adds an inline special on a KR sheet:
--   - KR-UP: destination varies (CSMT / LTT / DR / DIVA / PUNE / PNVL); need
--            to_station so the row regroups under the right destination
--   - KR-DN: origin varies (LTT / CSMT / DR / DW / PNVL); need from_station
--            so the row regroups under the right origin
--
-- For master-linked rows both can stay NULL — the master is the source of truth.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE div_loco_link_log
    ADD COLUMN from_station VARCHAR(10) NULL
        COMMENT 'Origin terminal for inline specials (master_id IS NULL); NULL when row inherits from master.from_station',
    ADD COLUMN to_station VARCHAR(10) NULL
        COMMENT 'Destination terminal for inline specials (master_id IS NULL); NULL when row inherits from master.to_station';
