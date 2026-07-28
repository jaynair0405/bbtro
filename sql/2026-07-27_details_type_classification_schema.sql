-- Suburban detail single/double/triple classification
-- Adds cycle-classification columns to the `details` table.
-- Run: mysql -u jay -p bbtro < sql/2026-07-27_details_type_classification_schema.sql

ALTER TABLE details
  ADD COLUMN detail_type    ENUM('single','double','triple') NULL COMMENT 'Per-detail role in its crew cycle; NULL until classified / unmatched',
  ADD COLUMN next_detail_id VARCHAR(50) NULL COMMENT 'Next detail in the crew cycle (Continuous n+1 with wrap; Fix/MEMU from detail book); NULL ends/repeats',
  ADD COLUMN cycle_anchor   VARCHAR(50) NULL COMMENT 'detail_id of the first detail in a double/triple group (GROUP BY key)',
  ADD CONSTRAINT fk_details_next FOREIGN KEY (next_detail_id) REFERENCES details(detail_id) ON DELETE SET NULL ON UPDATE CASCADE;

SELECT 'details classification columns added successfully' AS status;
