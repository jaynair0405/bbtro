-- ============================================
-- Midnight Position (00:00 Hrs) Tracking Tables
-- Tracks daily staff position for each lobby
-- Created: 2026-01-11
-- ============================================

-- ============================================
-- Sanction Strength Master Table
-- Div Admin manages sanction per office/designation
-- ============================================
CREATE TABLE IF NOT EXISTS `div_sanction_strength_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `office_code` varchar(20) NOT NULL COMMENT 'Office/Lobby code from offices table',
  `designation_code` varchar(20) NOT NULL COMMENT 'Designation code: LPG, LPS, ALP, LPM, LPP, LPGHAT, MOTORMAN, etc.',
  `sanction_strength` int DEFAULT 0,
  `updated_by` varchar(100),
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_office_designation` (`office_code`, `designation_code`),
  KEY `idx_office_code` (`office_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Default designation codes for reference (admin can add more)
-- Common: ALP, LPS, LPG
-- CSMT specific: LPM, LPP
-- Ghat specific: LPGHAT
-- Suburban: MOTORMAN
-- Future: JrCC, SrCC, drafted cadres, etc.

-- ============================================
-- Position Row Master (defines what rows appear in summary)
-- Admin can add/edit rows, different lobbies can have different rows
-- ============================================
CREATE TABLE IF NOT EXISTS `div_position_row_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `row_code` varchar(50) NOT NULL COMMENT 'Unique code: SLATE_YARDS, LEAVE_NH, etc.',
  `row_name` varchar(100) NOT NULL COMMENT 'Display name: Slate + Yards',
  `section` enum('STRENGTH','NON_EFFECTIVE','WORKING_DETAILS','RESULT','CUSTOM') NOT NULL DEFAULT 'WORKING_DETAILS',
  `is_staff_linked` tinyint(1) DEFAULT 0 COMMENT '1 = count from staff list, 0 = manual entry',
  `is_editable` tinyint(1) DEFAULT 1 COMMENT '1 = user can edit value, 0 = auto-calculated',
  `applicable_offices` text COMMENT 'NULL = all offices, or comma-separated: KYN,PNVL-ML,CSMT',
  `display_order` int DEFAULT 0,
  `is_system` tinyint(1) DEFAULT 0 COMMENT '1 = system row (cannot delete), 0 = custom row',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_row_code` (`row_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default rows
INSERT INTO `div_position_row_master` (`row_code`, `row_name`, `section`, `is_staff_linked`, `is_editable`, `display_order`, `is_system`) VALUES
-- Strength section
('SANCTION', 'Sanction Strength', 'STRENGTH', 0, 0, 1, 1),
('ON_ROLL', 'On Roll (MOR)', 'STRENGTH', 0, 1, 2, 1),
('VACANCY', 'Vacancy', 'STRENGTH', 0, 0, 3, 1),
-- Non-Effective section (staff-linked - auto count from staff entries)
('MEDICAL_UNFIT', 'Medical Unfit', 'NON_EFFECTIVE', 1, 0, 10, 1),
('SPAD_CREW', 'SPAD Crew', 'NON_EFFECTIVE', 1, 0, 11, 1),
('SUSPENSION', 'Suspension/Enquiry', 'NON_EFFECTIVE', 1, 0, 12, 1),
('OFFICE_OUTSTATION', 'Office/Outstation', 'NON_EFFECTIVE', 1, 0, 13, 1),
('FROM_OTHER_LOBBY', 'From Other Lobby', 'NON_EFFECTIVE', 1, 0, 14, 1),
('TO_OTHER_LOBBY', 'To Other Lobby', 'NON_EFFECTIVE', 1, 0, 15, 1),
-- Working Details section (manual entry for now, future: from detail book)
('SLATE_YARDS', 'Slate + Yards', 'WORKING_DETAILS', 0, 1, 20, 1),
('BTN', 'BTN', 'WORKING_DETAILS', 0, 1, 21, 1),
('TW', 'TW', 'WORKING_DETAILS', 0, 1, 22, 1),
('LE_COACHING', 'LE + Coaching', 'WORKING_DETAILS', 0, 1, 23, 1),
('PROTECTION', 'Protection WTG', 'WORKING_DETAILS', 0, 1, 24, 1),
('LEAVE_NH', 'Leave & NH', 'WORKING_DETAILS', 0, 1, 25, 1),
('30HRS_REST', '30 Hrs Rest', 'WORKING_DETAILS', 0, 1, 26, 1),
('SICK_IOD', 'Sick/IOD', 'WORKING_DETAILS', 0, 1, 27, 1),
('ABSENT', 'Absent/AUC/NF', 'WORKING_DETAILS', 0, 1, 28, 1),
('PME', 'PME', 'WORKING_DETAILS', 0, 1, 29, 1),
('LONG_TRAINING', 'Long Term Training', 'WORKING_DETAILS', 0, 1, 30, 1),
('MID_TRAINING', 'Mid Term Training', 'WORKING_DETAILS', 0, 1, 31, 1),
('SHORT_TRAINING', 'Short Term Training', 'WORKING_DETAILS', 0, 1, 32, 1),
('LRD', 'Under LRD/TW LRD', 'WORKING_DETAILS', 0, 1, 33, 1),
-- Result section (calculated)
('NET_AVAILABLE', 'Net Available', 'RESULT', 0, 0, 90, 1),
('UTILIZATION', 'Utilization', 'RESULT', 0, 1, 91, 1)
ON DUPLICATE KEY UPDATE row_name = VALUES(row_name);

-- ============================================
-- Position Values (stores actual values for each position/row/designation)
-- Flexible key-value storage - no schema changes needed for new rows
-- ============================================
CREATE TABLE IF NOT EXISTS `div_position_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position_id` int NOT NULL COMMENT 'Links to div_midnight_position.id',
  `row_code` varchar(50) NOT NULL COMMENT 'Links to div_position_row_master.row_code',
  `designation_code` varchar(20) NOT NULL COMMENT 'LPG, LPS, ALP, etc.',
  `value` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_position_row_desig` (`position_id`, `row_code`, `designation_code`),
  KEY `idx_position_id` (`position_id`),
  KEY `idx_row_code` (`row_code`),
  CONSTRAINT `fk_position_values_position` FOREIGN KEY (`position_id`)
    REFERENCES `div_midnight_position` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Main summary table - one row per lobby per date
CREATE TABLE IF NOT EXISTS `div_midnight_position` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position_date` date NOT NULL COMMENT 'Date of position',
  `lobby_code` varchar(20) NOT NULL COMMENT 'Lobby code (KYN, PNVL, CSMT, etc.)',

  -- Sanction and On-Roll figures (per designation)
  -- Standard designations (KYN, PNVL, CLA)
  `lpg_sanction` int DEFAULT 0,
  `lpg_on_roll` int DEFAULT 0,
  `lps_sanction` int DEFAULT 0,
  `lps_on_roll` int DEFAULT 0,
  `alp_sanction` int DEFAULT 0,
  `alp_on_roll` int DEFAULT 0,

  -- CSMT specific designations
  `lpm_sanction` int DEFAULT 0 COMMENT 'Loco Pilot Mail - CSMT only',
  `lpm_on_roll` int DEFAULT 0,
  `lpp_sanction` int DEFAULT 0 COMMENT 'Loco Pilot Passenger - CSMT only',
  `lpp_on_roll` int DEFAULT 0,

  -- Ghat specific designations (IGP, LNL)
  `lpghat_sanction` int DEFAULT 0 COMMENT 'Loco Pilot Ghat - IGP/LNL only',
  `lpghat_on_roll` int DEFAULT 0,

  -- Calculated/Derived stats stored for reporting
  `lpg_net_available` int DEFAULT 0 COMMENT 'Net available after deductions',
  `lps_net_available` int DEFAULT 0,
  `alp_net_available` int DEFAULT 0,
  `lpm_net_available` int DEFAULT 0,
  `lpp_net_available` int DEFAULT 0,
  `lpghat_net_available` int DEFAULT 0,

  -- Working Detail stats (per designation)
  `lpg_slate_yards` int DEFAULT 0 COMMENT 'Working Detail - Slate + Yards',
  `lpg_btn` int DEFAULT 0 COMMENT 'Working Detail - BTN',
  `lpg_tw` int DEFAULT 0 COMMENT 'Working Detail - TW',
  `lpg_le_coaching` int DEFAULT 0 COMMENT 'LE + Coaching + Push Pull',
  `lpg_protection` int DEFAULT 0 COMMENT 'Protection WTG',
  `lpg_leave_nh` int DEFAULT 0 COMMENT 'Leave & NH',
  `lpg_30hrs_rest` int DEFAULT 0 COMMENT '30 Hrs Rest',
  `lpg_sick_iod` int DEFAULT 0 COMMENT 'Sick/IOD',
  `lpg_absent` int DEFAULT 0 COMMENT 'Absent/AUC/NF',
  `lpg_pme` int DEFAULT 0 COMMENT 'PME',
  `lpg_office_enquiry` int DEFAULT 0 COMMENT 'Office/Enquiry/Suspension',
  `lpg_special_leave` int DEFAULT 0 COMMENT 'Special Leave',
  `lpg_long_training` int DEFAULT 0 COMMENT 'Long Term Training',
  `lpg_mid_training` int DEFAULT 0 COMMENT 'Mid Term Training',
  `lpg_short_training` int DEFAULT 0 COMMENT 'Short Term Training',
  `lpg_lrd` int DEFAULT 0 COMMENT 'Under LRD/TW LRD',
  `lpg_utilization` int DEFAULT 0 COMMENT 'Total Utilization',
  `lpg_off_detail` int DEFAULT 0,
  `lpg_sign_on` int DEFAULT 0,
  `lpg_carry_forward` int DEFAULT 0,
  `lpg_on_detail` int DEFAULT 0,

  -- LPS stats
  `lps_slate_yards` int DEFAULT 0,
  `lps_btn` int DEFAULT 0,
  `lps_tw` int DEFAULT 0,
  `lps_le_coaching` int DEFAULT 0,
  `lps_protection` int DEFAULT 0,
  `lps_leave_nh` int DEFAULT 0,
  `lps_30hrs_rest` int DEFAULT 0,
  `lps_sick_iod` int DEFAULT 0,
  `lps_absent` int DEFAULT 0,
  `lps_pme` int DEFAULT 0,
  `lps_office_enquiry` int DEFAULT 0,
  `lps_special_leave` int DEFAULT 0,
  `lps_long_training` int DEFAULT 0,
  `lps_mid_training` int DEFAULT 0,
  `lps_short_training` int DEFAULT 0,
  `lps_lrd` int DEFAULT 0,
  `lps_utilization` int DEFAULT 0,
  `lps_off_detail` int DEFAULT 0,
  `lps_sign_on` int DEFAULT 0,
  `lps_carry_forward` int DEFAULT 0,
  `lps_on_detail` int DEFAULT 0,

  -- ALP stats
  `alp_slate_yards` int DEFAULT 0,
  `alp_btn` int DEFAULT 0,
  `alp_tw` int DEFAULT 0,
  `alp_le_coaching` int DEFAULT 0,
  `alp_protection` int DEFAULT 0,
  `alp_leave_nh` int DEFAULT 0,
  `alp_30hrs_rest` int DEFAULT 0,
  `alp_sick_iod` int DEFAULT 0,
  `alp_absent` int DEFAULT 0,
  `alp_pme` int DEFAULT 0,
  `alp_office_enquiry` int DEFAULT 0,
  `alp_special_leave` int DEFAULT 0,
  `alp_long_training` int DEFAULT 0,
  `alp_mid_training` int DEFAULT 0,
  `alp_short_training` int DEFAULT 0,
  `alp_lrd` int DEFAULT 0,
  `alp_utilization` int DEFAULT 0,
  `alp_off_detail` int DEFAULT 0,
  `alp_sign_on` int DEFAULT 0,
  `alp_carry_forward` int DEFAULT 0,
  `alp_on_detail` int DEFAULT 0,

  -- Status
  `finalized` tinyint(1) DEFAULT 0 COMMENT 'Position finalized for the day',
  `finalized_by` varchar(100) DEFAULT NULL,
  `finalized_at` datetime DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_lobby` (`position_date`, `lobby_code`),
  KEY `idx_position_date` (`position_date`),
  KEY `idx_lobby_code` (`lobby_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Staff details table - individual entries under categories
CREATE TABLE IF NOT EXISTS `div_midnight_position_staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position_id` int NOT NULL COMMENT 'Reference to div_midnight_position.id',
  `category` varchar(50) NOT NULL COMMENT 'Category code',
  `staff_hrms_id` varchar(20) DEFAULT NULL COMMENT 'Staff HRMS ID (nullable for manual entry)',
  `staff_name` varchar(100) NOT NULL,
  `designation` varchar(20) NOT NULL COMMENT 'LPG, LPS, ALP, Sr LPS, etc.',
  `working_from_as` varchar(200) DEFAULT NULL COMMENT 'Working from location/role',
  `reason` varchar(200) DEFAULT NULL COMMENT 'Reason (MU date, SPAD details, etc.)',
  `since_date` date DEFAULT NULL COMMENT 'Date since this status',
  `remarks` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_position_id` (`position_id`),
  KEY `idx_category` (`category`),
  KEY `idx_staff_hrms_id` (`staff_hrms_id`),
  KEY `idx_designation` (`designation`),
  CONSTRAINT `fk_midnight_position_staff` FOREIGN KEY (`position_id`)
    REFERENCES `div_midnight_position` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Category master for dropdown options
CREATE TABLE IF NOT EXISTS `div_midnight_position_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_code` varchar(50) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `display_order` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_code` (`category_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default categories
INSERT INTO `div_midnight_position_categories` (`category_code`, `category_name`, `display_order`) VALUES
('MEDICAL_UNFIT', 'Medical Unfit', 1),
('SPAD_CREW', 'SPAD Crew', 2),
('OFFICE_OUTSTATION', 'Working In Office/Outstation', 3),
('CLI_SR_CC_ROOM', 'Working In Home Lobby CLI/Sr CC Room', 4),
('FROM_OTHER_LOBBY', 'Working From Other Lobby', 5),
('TO_OTHER_LOBBY', 'Working To Other Lobby/Office', 6),
('ON_LINE_OTHER', 'Working On Line Other Lobby', 7),
('SUPERNUMERARY', 'Supernumerary', 8),
('SUSPENSION', 'Suspension/Enquiry', 9),
('LONG_TRAINING', 'Long Term Training (Promotional/ZRTI)', 10),
('MID_TRAINING', 'Mid Term Training (Refresher/ZRTI)', 11),
('SHORT_TRAINING', 'Short Term Training (MTC/DTC/KAVACH)', 12),
('LRD', 'Under LRD/TW LRD/Goods Handling', 13)
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);


-- ============================================
-- Usage Examples:
--
-- Create position for a day:
--   INSERT INTO div_midnight_position (position_date, lobby_code, lpg_sanction, lpg_on_roll, ...)
--   VALUES ('2026-01-11', 'KYN', 433, 331, ...);
--
-- Add staff entry:
--   INSERT INTO div_midnight_position_staff (position_id, category, staff_name, designation, working_from_as, reason)
--   VALUES (1, 'MEDICAL_UNFIT', 'Shiv Kumar', 'LPG', 'Jr.CC 16.05.2023', 'MU 16.05.23');
--
-- Get position with staff count:
--   SELECT p.*,
--     (SELECT COUNT(*) FROM div_midnight_position_staff WHERE position_id = p.id) as staff_entries
--   FROM div_midnight_position p WHERE position_date = '2026-01-11' AND lobby_code = 'KYN';
--
-- Carry forward from previous day:
--   INSERT INTO div_midnight_position (position_date, lobby_code, lpg_sanction, ...)
--   SELECT '2026-01-12', lobby_code, lpg_sanction, ...
--   FROM div_midnight_position WHERE position_date = '2026-01-11' AND lobby_code = 'KYN';
-- ============================================
