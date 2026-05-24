-- Loco Defects Table
-- Track defects reported by LPC on incoming locos (UP trains)

CREATE TABLE div_loco_defects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loco_number VARCHAR(20) NOT NULL,
    train_no VARCHAR(20),                          -- Train on which defect was observed
    working_date DATE NOT NULL,                    -- Date of reporting

    defect_category ENUM(
        'BRAKE', 'TRACTION', 'PANTOGRAPH', 'HOTEL_LOAD',
        'AC', 'SPEEDOMETER', 'HORN', 'VIGILANCE',
        'AUX_CONVERTOR', 'BATTERY', 'SI_UNIT', 'OTHER'
    ) NOT NULL DEFAULT 'OTHER',

    description VARCHAR(500) NOT NULL,             -- Defect details
    severity ENUM('MINOR', 'MAJOR', 'CRITICAL') DEFAULT 'MINOR',

    home_shed VARCHAR(20),                         -- Loco's home shed (from div_locos)
    loco_type VARCHAR(20),                         -- Loco type (from div_locos)
    reported_at_terminal VARCHAR(10),              -- Terminal where defect was reported (CSMT/LTT/PNVL)

    reported_by VARCHAR(100),                      -- LPC username
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    status ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'OPEN',
    resolved_by VARCHAR(100),
    resolved_at DATETIME,
    resolution_remarks VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_loco (loco_number),
    INDEX idx_date (working_date),
    INDEX idx_shed (home_shed),
    INDEX idx_terminal (reported_at_terminal),
    INDEX idx_category (defect_category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
