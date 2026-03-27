-- Training Letters Module for Suburban Lobbies
-- For sending motormen to MTC Kurla for various training courses

-- Table for training letter metadata
CREATE TABLE IF NOT EXISTS div_training_letters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    letter_no VARCHAR(50),
    letter_date DATE NOT NULL,
    office_code VARCHAR(20) NOT NULL COMMENT 'CSMT-SUB, PNVL-SUB, KYN-SUB',
    course_type VARCHAR(30) NOT NULL COMMENT 'ONE_DAY_INTENSIVE, REFRESHER, MEMU_INITIAL, MEMU_REFRESHER, OTHERS',
    custom_subject VARCHAR(255) COMMENT 'User-entered subject for OTHERS type',
    training_date DATE NOT NULL,
    report_time TIME DEFAULT '09:30:00',
    addressee_name VARCHAR(100) DEFAULT 'The Chief Loco Inspector',
    addressee_office VARCHAR(100) DEFAULT 'Motormen Training Centre, Kurla (CLA)',
    subject_text VARCHAR(255),
    body_text TEXT,
    requirements_text VARCHAR(255),
    footer_text VARCHAR(255) DEFAULT 'Please report their arrival.',
    signing_designation VARCHAR(100),
    signing_designation_hindi VARCHAR(100),
    signing_place VARCHAR(50),
    cc_text TEXT,
    total_staff INT DEFAULT 0,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_office_date (office_code, letter_date),
    INDEX idx_course_type (course_type),
    INDEX idx_training_date (training_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table for staff assigned to training letters
CREATE TABLE IF NOT EXISTS div_training_letter_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    letter_id INT NOT NULL,
    staff_hrms_id VARCHAR(20) NOT NULL,
    sr_no INT NOT NULL,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (letter_id) REFERENCES div_training_letters(id) ON DELETE CASCADE,
    UNIQUE KEY uk_letter_staff (letter_id, staff_hrms_id),
    INDEX idx_staff_hrms (staff_hrms_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- View for easy retrieval of training letter staff with details
CREATE OR REPLACE VIEW v_training_letter_staff AS
SELECT
    tls.id,
    tls.letter_id,
    tls.staff_hrms_id,
    tls.sr_no,
    tls.remarks,
    sm.name AS staff_name,
    sm.current_cms_id,
    sm.pf_number,
    d.designation_name,
    sm.current_office_code AS depot
FROM div_training_letter_staff tls
JOIN div_staff_master sm ON sm.hrms_id = tls.staff_hrms_id
LEFT JOIN designations d ON d.id = sm.designation_id;
