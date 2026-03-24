-- Tower Wagon (TW) Detail Schema
-- Date: 2026-03-09
-- Purpose: Create table for TW crew management

-- ============================================================================
-- 1. Ensure TW training type exists
-- ============================================================================
-- TW training type already exists as 'TW_TRG'
-- If you need to add it: INSERT INTO div_training_types (training_code, training_name) VALUES ('TW_TRG', 'TW TRG');

-- ============================================================================
-- 2. Create TW Detail table
-- ============================================================================
CREATE TABLE IF NOT EXISTS div_tw_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    office_code VARCHAR(20) NOT NULL,
    detail_date DATE NOT NULL,
    slot_time TIME NOT NULL,                          -- Pre-defined slot time
    shift_code ENUM('00_08', '08_16', '16_24') NOT NULL,
    yard_code VARCHAR(10) NOT NULL,                   -- PEN, NEU, PNVL
    detail_timing VARCHAR(20),                        -- e.g., "06:30x13:30"

    -- Staff (LP only - no ALP for TW)
    lp_hrms_id VARCHAR(20),
    lp_cms_id VARCHAR(20),
    lp_name VARCHAR(100),
    lp_status ENUM('AVAILABLE', 'FORECAST', 'ONLINE', 'SAFE') DEFAULT 'AVAILABLE',

    -- Sign-on details
    lp_signed_on_at DATETIME,
    lp_late_reason VARCHAR(200),

    -- Exception tracking (like slate)
    lp_exception ENUM('AUC', 'NF') DEFAULT NULL,
    lp_exception_remark VARCHAR(200),

    -- Sign-off details (filled on return)
    tr_no VARCHAR(50),                                -- TW identifier (T/W PEN, etc.)
    loco_no VARCHAR(20),
    lp_signed_off_at DATETIME,

    -- Audit
    remarks VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(50),

    -- Indexes
    INDEX idx_tw_office_date (office_code, detail_date),
    INDEX idx_tw_lp_hrms (lp_hrms_id),
    INDEX idx_tw_status (lp_status),
    INDEX idx_tw_shift (shift_code),

    -- Foreign key to staff master
    CONSTRAINT fk_tw_lp_hrms FOREIGN KEY (lp_hrms_id)
        REFERENCES div_staff_master(hrms_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 3. Comments
-- ============================================================================
-- Note: Multiple rows can have same slot_time + yard_code (allows multiple LPs per slot)
-- This differs from main slate where each slot has exactly one LP + one ALP
--
-- To find TW-trained staff:
-- SELECT s.* FROM div_staff_master s
-- JOIN div_training_records tr ON s.hrms_id = tr.staff_hrms_id
-- JOIN div_training_types tt ON tr.training_id = tt.training_id
-- WHERE tt.training_code = 'TW' AND tr.status = 'Completed'
