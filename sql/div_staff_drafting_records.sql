-- ============================================
-- Division Staff Drafting/Ex-Cadre Records
-- Tracks staff drafted to administrative posts
-- Created: 2025-12-03
-- ============================================

CREATE TABLE IF NOT EXISTS `div_staff_drafting_records` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `staff_hrms_id` varchar(10) NOT NULL,
  `drafted_to_designation_id` int NOT NULL COMMENT 'Designation they are drafted to (Jr.CC, Sr.CC, CLI, etc.)',
  `drafted_date` date NOT NULL COMMENT 'Date when drafted to post',
  `order_number` varchar(100) DEFAULT NULL COMMENT 'Office order number',
  `drafting_type` enum('Temporary','Permanent') DEFAULT 'Temporary' COMMENT 'Type of drafting',
  `expected_duration_years` int DEFAULT NULL COMMENT 'Expected duration (3, 5 years, etc.)',
  `relieved_date` date DEFAULT NULL COMMENT 'Date when relieved from drafted post',
  `relieving_order_number` varchar(100) DEFAULT NULL COMMENT 'Relieving order number',
  `remarks` text COMMENT 'Additional remarks',
  `status` enum('Active','Relieved') DEFAULT 'Active' COMMENT 'Current status of drafting',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  KEY `staff_hrms_id` (`staff_hrms_id`),
  KEY `drafted_to_designation_id` (`drafted_to_designation_id`),
  KEY `status` (`status`),
  KEY `drafted_date` (`drafted_date`),
  CONSTRAINT `div_staff_drafting_records_ibfk_1` FOREIGN KEY (`staff_hrms_id`) REFERENCES `div_staff_master` (`hrms_id`) ON DELETE CASCADE,
  CONSTRAINT `div_staff_drafting_records_ibfk_2` FOREIGN KEY (`drafted_to_designation_id`) REFERENCES `designations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- INSERT INTO div_staff_drafting_records
-- (staff_hrms_id, drafted_to_designation_id, drafted_date, order_number, drafting_type, expected_duration_years, status)
-- VALUES
-- ('SAMPLE123', 10, '2024-01-15', 'BB/DIV/HR/2024/001', 'Temporary', 3, 'Active');
