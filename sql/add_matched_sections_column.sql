-- ============================================
-- Add matched_sections column to div_ctr_legs
-- For storing resolved route matches
-- Created: 2026-01-20
-- ============================================

ALTER TABLE `div_ctr_legs`
ADD COLUMN `matched_sections` JSON DEFAULT NULL
COMMENT 'Resolved route matches [{route_id, stations, lrd_credit}]'
AFTER `route_name`;

-- Index for querying legs with/without matches
CREATE INDEX `idx_matched_sections` ON `div_ctr_legs` ((CAST(matched_sections AS CHAR(100))));

-- ============================================
-- Usage:
--
-- When inserting/updating a leg:
--   matched_sections = JSON_ARRAY(JSON_OBJECT(
--     'route_id', 'ROHA_BSR',
--     'stations', JSON_ARRAY('PEN', 'JITE', 'APTA', ...),
--     'lrd_credit', true
--   ))
--
-- Query legs without matches:
--   SELECT * FROM div_ctr_legs WHERE matched_sections IS NULL;
--
-- Query legs with specific route:
--   SELECT * FROM div_ctr_legs
--   WHERE JSON_CONTAINS(matched_sections, '{"route_id": "ROHA_BSR"}');
-- ============================================
