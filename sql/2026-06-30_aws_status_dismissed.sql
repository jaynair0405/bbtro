-- ============================================================================
-- div_aws_events.status — add 'DISMISSED'
-- Date : 2026-06-30
-- Why  : A reviewer (CLI) may find a parsed candidate is NOT an AWS event at all
--        (e.g. a routine signal-sighting note). There was no way to clear it, so
--        it lingered forever in the Review + UD lists. 'DISMISSED' soft-removes
--        it: excluded from Review / UD / reports, but kept for audit and
--        restorable. Dismissing also leaves needs_manual_review = 1 so the report
--        aggregations (which require needs_manual_review = 0) never count it.
-- Idempotent (re-running just re-applies the same enum definition).
-- ============================================================================

ALTER TABLE div_aws_events
    MODIFY COLUMN status ENUM('PENDING','REVIEWED','CONFIRMED','DISPUTED','DISMISSED')
    NOT NULL DEFAULT 'PENDING';
