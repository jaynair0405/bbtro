-- TW Slots Management Table
-- Date: 2026-03-09
-- Purpose: Store predefined TW slots per yard (replaces hardcoded 96 slot dropdown)

-- ============================================================================
-- 1. Create TW Slots table
-- ============================================================================
CREATE TABLE IF NOT EXISTS div_tw_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    office_code VARCHAR(20) NOT NULL DEFAULT 'PNVL-ML',
    yard_code VARCHAR(10) NOT NULL,              -- PEN, NEU, PNVL
    slot_time TIME NOT NULL,                      -- Sign-on time (05:30, 08:15, etc.)
    detail_timing VARCHAR(20) NOT NULL,           -- Shift timing (06:30x13:30)
    shift_code ENUM('00_08', '08_16', '16_24') NOT NULL,
    slot_order INT DEFAULT 0,                     -- For custom ordering
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tw_slots_yard (yard_code),
    INDEX idx_tw_slots_office (office_code),
    UNIQUE KEY uk_tw_slot (office_code, yard_code, slot_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 2. Insert default slots based on typical TW schedule
-- ============================================================================

-- PEN Yard slots
INSERT INTO div_tw_slots (office_code, yard_code, slot_time, detail_timing, shift_code, slot_order) VALUES
('PNVL-ML', 'PEN', '05:30', '06:30x13:30', '00_08', 1),
('PNVL-ML', 'PEN', '12:45', '13:30x21:30', '08_16', 2),
('PNVL-ML', 'PEN', '20:45', '21:30x05:30', '16_24', 3);

-- NEU Yard slots
INSERT INTO div_tw_slots (office_code, yard_code, slot_time, detail_timing, shift_code, slot_order) VALUES
('PNVL-ML', 'NEU', '08:15', '09:00x17:00', '08_16', 1),
('PNVL-ML', 'NEU', '16:15', '17:00x01:00', '16_24', 2);

-- PNVL Yard slots
INSERT INTO div_tw_slots (office_code, yard_code, slot_time, detail_timing, shift_code, slot_order) VALUES
('PNVL-ML', 'PNVL', '06:00', '06:30x14:30', '00_08', 1),
('PNVL-ML', 'PNVL', '14:00', '14:30x22:30', '08_16', 2),
('PNVL-ML', 'PNVL', '22:00', '22:30x06:30', '16_24', 3);

-- ============================================================================
-- 3. Create TW Yards table (for future extensibility)
-- ============================================================================
CREATE TABLE IF NOT EXISTS div_tw_yards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    office_code VARCHAR(20) NOT NULL DEFAULT 'PNVL-ML',
    yard_code VARCHAR(10) NOT NULL,
    yard_name VARCHAR(50) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_tw_yard (office_code, yard_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default yards
INSERT INTO div_tw_yards (office_code, yard_code, yard_name, display_order) VALUES
('PNVL-ML', 'PEN', 'Pen', 1),
('PNVL-ML', 'NEU', 'Nerul', 2),
('PNVL-ML', 'PNVL', 'Panvel', 3);
