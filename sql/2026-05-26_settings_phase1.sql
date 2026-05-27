-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Settings Phase 1 - Scheduled Specials + ctlc role
-- Date: 2026-05-26
--
-- PART 1: Add 'ctlc' (Chief Traction Loco Controller) to users.div_role enum.
--         ctlc + division_admin can manage Settings (scheduled specials, trains,
--         sheds, coach types). Regular 'lpc' role has view-only access.
--
-- PART 2: Add date-range columns to div_loco_link_master so specials can be
--         registered once with a validity period and run_days. Daily-entry will
--         auto-include them on matching dates.
--
-- Backward compatible: existing rows get NULL → treated as always active.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── PART 1: Add ctlc role ──────────────────────────────────────────────────
ALTER TABLE users
    MODIFY div_role ENUM(
        'division_admin',
        'office_hr',
        'trgcentre_admin',
        'lpc',
        'ctlc'
    ) DEFAULT NULL;

-- ── PART 2: Date-range + skip-dates columns on loco link master ────────────
ALTER TABLE div_loco_link_master
    ADD COLUMN effective_from DATE NULL
        COMMENT 'Schedule active from this date (NULL = always active)',
    ADD COLUMN effective_until DATE NULL
        COMMENT 'Schedule ends on this date (NULL = open-ended)',
    ADD COLUMN skip_dates JSON NULL
        COMMENT 'Individual dates to exclude, e.g. ["2026-05-15"]',
    ADD COLUMN is_scheduled_special TINYINT(1) DEFAULT 0
        COMMENT '1 = registered special via Settings page',
    ADD INDEX idx_effective_range (effective_from, effective_until);

-- ── Verification queries (run manually after migration) ────────────────────
-- SHOW COLUMNS FROM users LIKE 'div_role';
-- SHOW COLUMNS FROM div_loco_link_master WHERE Field IN
--   ('effective_from','effective_until','skip_dates','is_scheduled_special');
-- SELECT COUNT(*) FROM div_loco_link_master WHERE effective_from IS NULL;
