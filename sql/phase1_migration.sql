-- ============================================================
-- Signal + AWS Master — Phase 1 Database Foundation
-- BBTRO Mumbai Division
-- 
-- Run order matters — tables with FK dependencies come after
-- their parent tables.
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1. div_signals — Central signal master
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_signals (
    id INT AUTO_INCREMENT PRIMARY KEY,

    signal_number VARCHAR(40) NOT NULL,
    normalized_signal_number VARCHAR(40) NOT NULL,

    station_code VARCHAR(10) DEFAULT NULL,
    station_name VARCHAR(80) DEFAULT NULL,

    section VARCHAR(40) NOT NULL,
    line VARCHAR(40) NOT NULL,
    direction ENUM('UP', 'DN', 'BOTH', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',

    location_text VARCHAR(80) DEFAULT NULL,
    km_text VARCHAR(30) DEFAULT NULL,
    km_from_csmt DECIMAL(8,3) DEFAULT NULL,

    latitude DECIMAL(10,7) DEFAULT NULL,
    longitude DECIMAL(10,7) DEFAULT NULL,

    signal_type ENUM(
        'Automatic',
        'Semi-Automatic',
        'Manual',
        'Gate',
        'IBS',
        'Repeater',
        'Board',
        'Other'
    ) NOT NULL DEFAULT 'Automatic',

    signal_function ENUM(
        'Double Distant',
        'Distant',
        'Inner Distant',
        'Home',
        'Inner Home',
        'Starter',
        'Starter (Loop)',
        'Advanced Starter',
        'IBS',
        'IBS Distant',
        'Gate Distant',
        'Repeater',
        'Other'
    ) DEFAULT NULL,

    aspects TINYINT DEFAULT NULL,

    placement ENUM(
        'Left',
        'Right',
        'Extreme Right',
        'Extreme Left',
        'Gantry',
        'Unknown'
    ) NOT NULL DEFAULT 'Unknown',

    is_rhs TINYINT(1) NOT NULL DEFAULT 0,
    is_ext_rhs TINYINT(1) NOT NULL DEFAULT 0,
    is_lhs TINYINT(1) NOT NULL DEFAULT 0,
    is_ext_lhs TINYINT(1) NOT NULL DEFAULT 0,
    has_legend_board TINYINT(1) NOT NULL DEFAULT 0,
    has_calling_on TINYINT(1) NOT NULL DEFAULT 0,
    has_shunt_signal TINYINT(1) NOT NULL DEFAULT 0,

    book_description TEXT DEFAULT NULL,
    technical_remarks TEXT DEFAULT NULL,

    visibility_distance_m INT DEFAULT NULL,
    sighting_remarks TEXT DEFAULT NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_signal_section_line (normalized_signal_number, section, line),
    INDEX idx_signal_number (signal_number),
    INDEX idx_normalized_signal_number (normalized_signal_number),
    INDEX idx_station_code (station_code),
    INDEX idx_section_line (section, line),
    INDEX idx_direction (direction),
    INDEX idx_placement_flags (is_rhs, is_ext_rhs, is_lhs, is_ext_lhs),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 2. div_signal_aliases — AWS free-text matching
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_signal_aliases (
    id INT AUTO_INCREMENT PRIMARY KEY,

    signal_id INT NOT NULL,

    alias_text VARCHAR(100) NOT NULL,
    normalized_alias VARCHAR(100) NOT NULL,

    source ENUM(
        'manual',
        'excel_import',
        'cms_parser',
        'legacy'
    ) NOT NULL DEFAULT 'manual',

    confidence ENUM(
        'HIGH',
        'MEDIUM',
        'LOW'
    ) NOT NULL DEFAULT 'HIGH',

    remarks VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_normalized_alias (normalized_alias),
    INDEX idx_signal_id (signal_id),
    INDEX idx_alias_text (alias_text),
    INDEX idx_active (is_active),

    CONSTRAINT fk_signal_alias_signal
        FOREIGN KEY (signal_id)
        REFERENCES div_signals(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 3. div_signal_beats — Beat master
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_signal_beats (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beat_code VARCHAR(30) NOT NULL,
    beat_name VARCHAR(80) NOT NULL,

    office_code VARCHAR(10) DEFAULT NULL,

    beat_category ENUM(
        'SUB',
        'GOODS',
        'HB',
        'ML',
        'KR',
        'MMR',
        'OTHER'
    ) DEFAULT 'OTHER',

    description VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_beat_code (beat_code),
    INDEX idx_office_code (office_code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 3b. Initial beat rows
-- ──────────────────────────────────────────────────────────────

INSERT INTO div_signal_beats
    (beat_code, beat_name, office_code, beat_category, description)
VALUES
    ('PNVL_GOODS', 'PNVL GOODS', 'PNVL', 'GOODS', NULL),
    ('PNVL_SUB_HB', 'PNVL SUB HB', 'PNVL', 'HB', 'Harbour suburban beat'),
    ('CSMT_HB', 'CSMT HB', 'CSMT', 'HB', 'CSMT Harbour beat'),
    ('CSMT_ML_KR', 'CSMT ML KR', 'CSMT', 'KR', NULL),
    ('CSMT_ML_MMR', 'CSMT ML MMR', 'CSMT', 'MMR', NULL),
    ('CSMT_SUB_ML', 'CSMT SUB ML', 'CSMT', 'SUB', NULL),
    ('KYN_GOODS', 'KYN GOODS', 'KYN', 'GOODS', NULL),
    ('KYN_SUB', 'KYN SUB', 'KYN', 'SUB', NULL)
ON DUPLICATE KEY UPDATE
    beat_name = VALUES(beat_name),
    office_code = VALUES(office_code),
    beat_category = VALUES(beat_category),
    description = VALUES(description),
    is_active = 1;


-- ──────────────────────────────────────────────────────────────
-- 4. div_signal_book_sections — Sections within a beat book
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_signal_book_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beat_id INT NOT NULL,

    section_title VARCHAR(120) NOT NULL,
    section_code VARCHAR(50) DEFAULT NULL,

    direction ENUM('UP', 'DN', 'BOTH', 'NA') NOT NULL DEFAULT 'NA',
    line VARCHAR(50) DEFAULT NULL,

    display_order INT NOT NULL,

    start_page_no INT DEFAULT NULL,
    end_page_no INT DEFAULT NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_beat_section_order (beat_id, display_order),
    INDEX idx_beat_id (beat_id),
    INDEX idx_section_code (section_code),

    CONSTRAINT fk_signal_book_sections_beat
        FOREIGN KEY (beat_id)
        REFERENCES div_signal_beats(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 5. div_psr — Permanent Speed Restrictions master
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_psr (
    id INT AUTO_INCREMENT PRIMARY KEY,

    psr_code VARCHAR(40) DEFAULT NULL,

    section VARCHAR(40) NOT NULL,
    line VARCHAR(40) NOT NULL,
    direction ENUM('UP', 'DN', 'BOTH', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',

    start_km_text VARCHAR(30) NOT NULL,
    end_km_text VARCHAR(30) NOT NULL,

    start_km_decimal DECIMAL(8,3) DEFAULT NULL,
    end_km_decimal DECIMAL(8,3) DEFAULT NULL,

    speed_kmph INT NOT NULL,

    start_latitude DECIMAL(10,7) DEFAULT NULL,
    start_longitude DECIMAL(10,7) DEFAULT NULL,
    end_latitude DECIMAL(10,7) DEFAULT NULL,
    end_longitude DECIMAL(10,7) DEFAULT NULL,

    reason VARCHAR(255) DEFAULT NULL,
    remarks TEXT DEFAULT NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    effective_from DATE DEFAULT NULL,
    effective_to DATE DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_section_line_direction (section, line, direction),
    INDEX idx_speed (speed_kmph),
    INDEX idx_active (is_active),
    INDEX idx_effective_dates (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 6. div_ohe_neutral_sections — OHE neutral section master
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_ohe_neutral_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,

    ns_code VARCHAR(40) DEFAULT NULL,

    section VARCHAR(40) NOT NULL,
    line VARCHAR(40) NOT NULL,
    direction ENUM('UP', 'DN', 'BOTH', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',

    location_text VARCHAR(40) NOT NULL,
    km_decimal DECIMAL(8,3) DEFAULT NULL,

    latitude DECIMAL(10,7) DEFAULT NULL,
    longitude DECIMAL(10,7) DEFAULT NULL,

    remarks TEXT DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    effective_from DATE DEFAULT NULL,
    effective_to DATE DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_section_line_direction (section, line, direction),
    INDEX idx_location_text (location_text),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 7. div_signal_book_rows — Individual rows in beat books
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_signal_book_rows (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beat_id INT NOT NULL,
    book_section_id INT DEFAULT NULL,

    row_order INT NOT NULL,

    row_type ENUM(
        'SIGNAL',
        'STATION_HEADER',
        'PSR',
        'NEUTRAL_SECTION',
        'BOARD',
        'TEXT_NOTE',
        'SECTION_HEADER',
        'RHS_SUMMARY',
        'SIDING_DIAGRAM',
        'BLANK'
    ) NOT NULL,

    signal_id INT DEFAULT NULL,
    psr_id INT DEFAULT NULL,
    neutral_section_id INT DEFAULT NULL,

    display_signal_no VARCHAR(80) DEFAULT NULL,
    display_location VARCHAR(100) DEFAULT NULL,
    display_description TEXT DEFAULT NULL,

    speed_kmph INT DEFAULT NULL,
    km_range_text VARCHAR(80) DEFAULT NULL,

    station_code VARCHAR(10) DEFAULT NULL,
    station_name VARCHAR(80) DEFAULT NULL,
    station_km_text VARCHAR(30) DEFAULT NULL,

    page_no INT DEFAULT NULL,
    column_no TINYINT DEFAULT NULL,

    highlight_color ENUM(
        'NONE',
        'BLUE',
        'YELLOW',
        'PURPLE',
        'GREY',
        'GREEN'
    ) NOT NULL DEFAULT 'NONE',

    text_color ENUM(
        'BLACK',
        'RED',
        'BLUE'
    ) NOT NULL DEFAULT 'BLACK',

    icon_type ENUM(
        'NONE',
        'PSR',
        'NEUTRAL_SECTION',
        'LEGEND_BOARD',
        'GRADIENT',
        'CURVE_LEFT',
        'CURVE_RIGHT',
        'GATE',
        'IBS'
    ) NOT NULL DEFAULT 'NONE',

    remarks VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_beat_row_order (beat_id, row_order),

    INDEX idx_beat_id (beat_id),
    INDEX idx_book_section_id (book_section_id),
    INDEX idx_signal_id (signal_id),
    INDEX idx_psr_id (psr_id),
    INDEX idx_neutral_section_id (neutral_section_id),
    INDEX idx_row_type (row_type),
    INDEX idx_page_col (page_no, column_no),

    CONSTRAINT fk_signal_book_rows_beat
        FOREIGN KEY (beat_id)
        REFERENCES div_signal_beats(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_signal_book_rows_section
        FOREIGN KEY (book_section_id)
        REFERENCES div_signal_book_sections(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_signal_book_rows_signal
        FOREIGN KEY (signal_id)
        REFERENCES div_signals(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_signal_book_rows_psr
        FOREIGN KEY (psr_id)
        REFERENCES div_psr(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_signal_book_rows_neutral_section
        FOREIGN KEY (neutral_section_id)
        REFERENCES div_ohe_neutral_sections(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 8. div_signal_history — Change tracking
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_signal_history (
    id INT AUTO_INCREMENT PRIMARY KEY,

    signal_id INT NOT NULL,

    change_type ENUM(
        'Created',
        'Renumbered',
        'Relocated',
        'Decommissioned',
        'Reactivated',
        'Type Changed',
        'Placement Changed',
        'Location Changed',
        'Description Changed',
        'Other'
    ) NOT NULL,

    old_value TEXT DEFAULT NULL,
    new_value TEXT DEFAULT NULL,

    change_date DATE DEFAULT NULL,
    changed_by_user_id INT DEFAULT NULL,

    remarks TEXT DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_signal_id (signal_id),
    INDEX idx_change_type (change_type),
    INDEX idx_change_date (change_date),

    CONSTRAINT fk_signal_history_signal
        FOREIGN KEY (signal_id)
        REFERENCES div_signals(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 9. div_signal_isd — Inter-signal distance relationships
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_signal_isd (
    id INT AUTO_INCREMENT PRIMARY KEY,

    from_signal_id INT NOT NULL,
    to_signal_id INT NOT NULL,

    distance_m INT NOT NULL,

    is_straight_route TINYINT(1) NOT NULL DEFAULT 1,
    remarks VARCHAR(200) DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_from_to_signal (from_signal_id, to_signal_id),
    INDEX idx_from_signal_id (from_signal_id),
    INDEX idx_to_signal_id (to_signal_id),

    CONSTRAINT fk_signal_isd_from
        FOREIGN KEY (from_signal_id)
        REFERENCES div_signals(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_signal_isd_to
        FOREIGN KEY (to_signal_id)
        REFERENCES div_signals(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- Verification
-- ──────────────────────────────────────────────────────────────

-- Run these after execution to verify:
-- SHOW TABLES LIKE 'div_signal%';
-- SHOW TABLES LIKE 'div_psr';
-- SHOW TABLES LIKE 'div_ohe%';
-- SELECT * FROM div_signal_beats ORDER BY id;
