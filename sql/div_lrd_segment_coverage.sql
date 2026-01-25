-- ============================================
-- LRD Segment Coverage Table
-- Tracks individual station-pair segments worked by staff
-- Direction matters: ROHA→NGTN is different from NGTN→ROHA
-- Created: 2026-01-20
-- ============================================

CREATE TABLE IF NOT EXISTS `div_lrd_segment_coverage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_hrms_id` varchar(10) NOT NULL,
  `from_station` varchar(10) NOT NULL COMMENT 'Starting station of segment',
  `to_station` varchar(10) NOT NULL COMMENT 'Ending station of segment',
  `last_worked_date` date NOT NULL COMMENT 'Most recent date this segment was worked',
  `last_duty_id` int DEFAULT NULL COMMENT 'Reference to div_ctr_duties.id',
  `work_count` int DEFAULT 1 COMMENT 'Number of times worked (for stats)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_staff_segment` (`staff_hrms_id`, `from_station`, `to_station`),
  KEY `idx_staff` (`staff_hrms_id`),
  KEY `idx_last_worked` (`last_worked_date`),
  KEY `idx_from_station` (`from_station`),
  KEY `idx_to_station` (`to_station`),
  CONSTRAINT `fk_segment_staff` FOREIGN KEY (`staff_hrms_id`)
    REFERENCES `div_staff_master` (`hrms_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Usage Examples:
--
-- When a leg PEN→PNVL is worked (resolved stations: PEN,JITE,APTA,RSYI,SMNE,PNVL):
--   INSERT INTO div_lrd_segment_coverage (staff_hrms_id, from_station, to_station, last_worked_date)
--   VALUES
--     ('12345', 'PEN', 'JITE', '2026-01-20'),
--     ('12345', 'JITE', 'APTA', '2026-01-20'),
--     ('12345', 'APTA', 'RSYI', '2026-01-20'),
--     ('12345', 'RSYI', 'SMNE', '2026-01-20'),
--     ('12345', 'SMNE', 'PNVL', '2026-01-20')
--   ON DUPLICATE KEY UPDATE
--     last_worked_date = VALUES(last_worked_date),
--     work_count = work_count + 1;
--
-- Get all segments for a staff:
--   SELECT * FROM div_lrd_segment_coverage WHERE staff_hrms_id = '12345';
--
-- Check section validity (e.g., ROHA_PNVL section):
--   -- Section segments: ROHA→NGTN, NGTN→KASU, KASU→PEN, PEN→JITE, JITE→APTA, APTA→RSYI, RSYI→SMNE, SMNE→PNVL
--   SELECT from_station, to_station, last_worked_date,
--          DATEDIFF(CURDATE(), last_worked_date) as days_ago,
--          CASE
--            WHEN DATEDIFF(CURDATE(), last_worked_date) <= 90 THEN 'VALID'
--            ELSE 'EXPIRED'
--          END as status
--   FROM div_lrd_segment_coverage
--   WHERE staff_hrms_id = '12345'
--     AND (from_station, to_station) IN (
--       ('ROHA','NGTN'), ('NGTN','KASU'), ('KASU','PEN'), ('PEN','JITE'),
--       ('JITE','APTA'), ('APTA','RSYI'), ('RSYI','SMNE'), ('SMNE','PNVL')
--     );
-- ============================================
