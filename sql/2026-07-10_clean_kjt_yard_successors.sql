-- Clean all KJT/PDI-yard successor edges before reloading the authoritative
-- suburban KJT-KHPI routing.
-- Date: 2026-07-10
--
-- Rationale (see decision log 2026-07-10): the successor graph is AWS-only
-- (suburban EMU). The KJT yard is suburban only for the KJT-KHPI shuttle, so we
-- keep just the DN KHPI / UP KHPI routing and drop:
--   * the earlier PARTIAL KHPI loads (superseded by the complete
--     kjt_signal_routes.csv / PDI-KJT-UP.csv), and
--   * the stale DN SE / UP SE yard edges from test_for_platform_parrallel_signals.csv
--     (wrong-line approximations; KJT-LNL mail/express/goods is out of AWS scope).
-- After this, re-import:
--   node scripts/import-signal-successors.js data/KJT-KHPI/KJT_KHPI_DN_ROUTES.csv AUTO --commit
--   node scripts/import-signal-successors.js data/KJT-KHPI/KJT_KHPI_UP_ROUTES.csv AUTO --commit
-- Idempotent: re-running just removes any KJT/PDI-originating edges again.

DELETE FROM div_signal_successors
 WHERE from_signal_text LIKE 'KJT %' OR from_signal_text LIKE 'PDI %';
