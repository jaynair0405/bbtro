-- TS-032: keep IA/IB/IC available as known template types while official
-- proformas are pending. This is an idempotent safety gate; it does not
-- invent checklist rows or alter historical inspections.
UPDATE div_trip_inspection_templates
SET enabled = 1, entry_enabled = 0
WHERE inspection_type IN ('IA', 'IB', 'IC');
