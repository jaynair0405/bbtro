-- Trip Shed: close entry on the abbreviated TI templates (ids 2 and 3).
--
-- The abbreviated conventional TI (VVH-PENDING-PROFORMA) and 3-phase TI (VVH-2025-08)
-- headers were superseded by the source-restored templates (version VVH-2025-08-SOURCE,
-- steps 2-5). The abbreviated GC (id 1) was closed in step 5; ids 2 and 3 were left
-- entry_enabled=1 and, after the Sep 2026 MySQL rebuild, hold zero checklist items, so a
-- user picking them gets an empty checklist. Match by version + type, not by id, so this
-- is safe on prod where the ids may differ. Headers stay enabled=1 for reading history.
--
-- Pre-check (expect the three abbreviated headers, entry_enabled 0/1/1):
--   SELECT id, inspection_type, version_no, enabled, entry_enabled
--     FROM div_trip_inspection_templates
--    WHERE version_no IN ('VVH-2025-08','VVH-PENDING-PROFORMA');

UPDATE div_trip_inspection_templates
   SET entry_enabled = 0
 WHERE version_no IN ('VVH-2025-08', 'VVH-PENDING-PROFORMA')
   AND inspection_type IN ('GC', 'TI_CONVENTIONAL', 'TI_3PHASE')
   AND entry_enabled = 1;

-- Rollback:
--   UPDATE div_trip_inspection_templates SET entry_enabled = 1
--    WHERE version_no IN ('VVH-2025-08','VVH-PENDING-PROFORMA')
--      AND inspection_type IN ('TI_CONVENTIONAL','TI_3PHASE');
