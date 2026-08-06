-- ============================================
-- Rake Formation Tables - Migration
-- Run on BBTRO MySQL database
-- ============================================

-- 1. Car Sheds (Lookup)
CREATE TABLE IF NOT EXISTS car_sheds (
    shed_code   VARCHAR(5)   PRIMARY KEY,
    shed_name   VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO car_sheds (shed_code, shed_name) VALUES
('KCS', 'Kalva Car Shed'),
('NCS', 'Kurla Car Shed'),
('SCS', 'Sanpada Car Shed');

-- 2. Rake Types (Lookup)
CREATE TABLE IF NOT EXISTS rake_types (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    type_name   VARCHAR(30)  NOT NULL UNIQUE
);

INSERT INTO rake_types (type_name) VALUES
('Siemens'),
('ALSTOM'),
('Bombardier'),
('BHEL AC'),
('MEDHA'),
('MEDHA AC'),
('AC Retrofitted'),
('MEMU-Conventional'),
('MEMU-BT');

-- 3. Rake Formations (Master)
CREATE TABLE IF NOT EXISTS rake_formations (
    id              INT          AUTO_INCREMENT PRIMARY KEY,
    shed_code       VARCHAR(5)   NOT NULL,
    rake_type_id    INT          NOT NULL,
    car_count       TINYINT      NOT NULL DEFAULT 12,
    unit_no         VARCHAR(50)  NULL,
    is_active       TINYINT(1)   DEFAULT 1,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (shed_code) REFERENCES car_sheds(shed_code),
    FOREIGN KEY (rake_type_id) REFERENCES rake_types(id),

    INDEX idx_shed (shed_code),
    INDEX idx_rake_type (rake_type_id),
    INDEX idx_unit_no (unit_no)
);

-- 4. Rake Coaches (Position Details)
CREATE TABLE IF NOT EXISTS rake_coaches (
    id              INT          AUTO_INCREMENT PRIMARY KEY,
    rake_id         INT          NOT NULL,
    position        TINYINT      NOT NULL,
    coach_number    VARCHAR(20)  NOT NULL,

    FOREIGN KEY (rake_id) REFERENCES rake_formations(id) ON DELETE CASCADE,

    UNIQUE KEY uk_rake_position (rake_id, position),
    INDEX idx_coach_number (coach_number)
);
