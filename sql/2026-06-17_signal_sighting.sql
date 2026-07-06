-- Signal sighting module foundation
-- Monthly inspections; Jan/Apr/Jul/Oct are quarterly inspections.
-- Provisional rows let CLIs record yard/platform/parallel signals without
-- mutating div_signals or its sequence-critical AWS/signal-book data.

CREATE TABLE IF NOT EXISTS div_signal_sighting_territories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    territory_code VARCHAR(60) NOT NULL,
    territory_name VARCHAR(160) NOT NULL,
    line_label VARCHAR(80) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    is_yard TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_sighting_territory_code (territory_code),
    KEY idx_sighting_territory_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS div_signal_sighting_territory_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    territory_id INT NOT NULL,
    section VARCHAR(40) DEFAULT NULL,
    `line` VARCHAR(40) DEFAULT NULL,
    direction ENUM('UP','DN','BOTH','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    book_section_id INT DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 100,
    remarks VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_sighting_part (territory_id, section, `line`, direction),
    KEY idx_sighting_part_lookup (section, `line`, direction),
    KEY idx_sighting_part_book_section (book_section_id),
    CONSTRAINT fk_sighting_part_territory
        FOREIGN KEY (territory_id) REFERENCES div_signal_sighting_territories(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sighting_part_book_section
        FOREIGN KEY (book_section_id) REFERENCES div_signal_book_sections(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS div_signal_sighting_cli_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cli_id INT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_sighting_cli_user (user_id),
    KEY idx_sighting_cli_user_cli (cli_id),
    CONSTRAINT fk_sighting_cli_user_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sighting_cli_user_cli
        FOREIGN KEY (cli_id) REFERENCES div_cli_master(cli_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS div_signal_sighting_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    territory_id INT NOT NULL,
    cli_id INT NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    remarks VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_sighting_assignment (territory_id, cli_id, effective_from),
    KEY idx_sighting_assignment_cli (cli_id, is_active),
    KEY idx_sighting_assignment_effective (effective_from, effective_to),
    CONSTRAINT fk_sighting_assignment_territory
        FOREIGN KEY (territory_id) REFERENCES div_signal_sighting_territories(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sighting_assignment_cli
        FOREIGN KEY (cli_id) REFERENCES div_cli_master(cli_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS div_signal_sighting_inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_month DATE NOT NULL COMMENT 'First day of inspected month',
    inspection_date DATE DEFAULT NULL,
    inspection_type ENUM('MONTHLY','QUARTERLY') NOT NULL,
    title VARCHAR(160) NOT NULL,
    territory_id INT NOT NULL,
    cli_id INT NOT NULL,
    conducted_by_user_id INT DEFAULT NULL,
    status ENUM('DRAFT','SUBMITTED','REOPENED') NOT NULL DEFAULT 'DRAFT',
    train_no VARCHAR(30) DEFAULT NULL,
    cab_no VARCHAR(30) DEFAULT NULL,
    lp_name VARCHAR(100) DEFAULT NULL,
    alp_name VARCHAR(100) DEFAULT NULL,
    departure_station VARCHAR(30) DEFAULT NULL,
    departure_time TIME DEFAULT NULL,
    arrival_station VARCHAR(30) DEFAULT NULL,
    arrival_time TIME DEFAULT NULL,
    snt_representative VARCHAR(100) DEFAULT NULL,
    signal_dept_representative VARCHAR(100) DEFAULT NULL,
    reference_text VARCHAR(255) DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    submitted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_sighting_month_territory (inspection_month, territory_id),
    KEY idx_sighting_inspection_cli (cli_id),
    KEY idx_sighting_inspection_status (status),
    CONSTRAINT fk_sighting_inspection_territory
        FOREIGN KEY (territory_id) REFERENCES div_signal_sighting_territories(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_sighting_inspection_cli
        FOREIGN KEY (cli_id) REFERENCES div_cli_master(cli_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_sighting_inspection_user
        FOREIGN KEY (conducted_by_user_id) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS div_signal_sighting_provisional_signals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    territory_id INT NOT NULL,
    created_from_inspection_id INT DEFAULT NULL,
    signal_number VARCHAR(80) NOT NULL,
    normalized_signal_number VARCHAR(100) NOT NULL,
    station_code VARCHAR(10) DEFAULT NULL,
    section VARCHAR(40) DEFAULT NULL,
    `line` VARCHAR(40) DEFAULT NULL,
    direction ENUM('UP','DN','BOTH','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    location_text VARCHAR(100) DEFAULT NULL,
    side ENUM('LHS','RHS','ELHS','ERHS','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    display_order INT DEFAULT NULL,
    before_signal_id INT DEFAULT NULL,
    after_signal_id INT DEFAULT NULL,
    linked_signal_id INT DEFAULT NULL,
    status ENUM('PROVISIONAL','APPROVED_TO_MASTER','MERGED','REJECTED') NOT NULL DEFAULT 'PROVISIONAL',
    remarks VARCHAR(255) DEFAULT NULL,
    created_by_user_id INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_sighting_prov_territory (territory_id, status),
    KEY idx_sighting_prov_normalized (normalized_signal_number),
    KEY idx_sighting_prov_linked (linked_signal_id),
    CONSTRAINT fk_sighting_prov_territory
        FOREIGN KEY (territory_id) REFERENCES div_signal_sighting_territories(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sighting_prov_inspection
        FOREIGN KEY (created_from_inspection_id) REFERENCES div_signal_sighting_inspections(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_sighting_prov_before_signal
        FOREIGN KEY (before_signal_id) REFERENCES div_signals(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_sighting_prov_after_signal
        FOREIGN KEY (after_signal_id) REFERENCES div_signals(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_sighting_prov_linked_signal
        FOREIGN KEY (linked_signal_id) REFERENCES div_signals(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_sighting_prov_user
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS div_signal_sighting_observations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id INT NOT NULL,
    row_order INT NOT NULL,
    signal_id INT DEFAULT NULL,
    provisional_signal_id INT DEFAULT NULL,
    signal_number_snapshot VARCHAR(80) NOT NULL,
    location_text VARCHAR(100) DEFAULT NULL,
    side ENUM('LHS','RHS','ELHS','ERHS','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    previous_visibility_distance_m INT DEFAULT NULL,
    visibility_distance_m INT DEFAULT NULL,
    previous_remarks TEXT DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    obstruction_type ENUM('NONE','OHE_MAST','TREE_BRANCH','CURVE','STRUCTURE','SIGNAL_CONFUSION','NUMBER_PLATE','OTHER') NOT NULL DEFAULT 'NONE',
    remedial_action TEXT DEFAULT NULL,
    action_taken TEXT DEFAULT NULL,
    action_status ENUM('NOT_REQUIRED','PENDING','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'NOT_REQUIRED',
    risk_level ENUM('CLEAR','WATCH','ATTENTION','CRITICAL') NOT NULL DEFAULT 'CLEAR',
    source ENUM('MASTER','PROVISIONAL','MANUAL') NOT NULL DEFAULT 'MASTER',
    is_added_by_cli TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_sighting_observation_order (inspection_id, row_order),
    KEY idx_sighting_observation_signal (signal_id),
    KEY idx_sighting_observation_prov (provisional_signal_id),
    KEY idx_sighting_observation_action (action_status),
    CONSTRAINT fk_sighting_observation_inspection
        FOREIGN KEY (inspection_id) REFERENCES div_signal_sighting_inspections(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sighting_observation_signal
        FOREIGN KEY (signal_id) REFERENCES div_signals(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_sighting_observation_prov
        FOREIGN KEY (provisional_signal_id) REFERENCES div_signal_sighting_provisional_signals(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO div_signal_sighting_territories
    (territory_code, territory_name, line_label, description, is_yard)
VALUES
    ('CSMT_KYN_LOCAL', 'CSMT-KYN-CSMT Local Line', 'DN LOC / UP LOC', 'Signal inspection territory from CSMT to KYN and back over local lines.', 0),
    ('CSMT_KYN_THROUGH', 'CSMT-KYN-CSMT Through Line', 'DN TH / UP TH', 'Signal inspection territory from CSMT to KYN and back over through lines.', 0),
    ('KYN_STATION', 'KYN Station', 'ALL', 'Kalyan station and station-yard signals.', 1),
    ('LTT_KYN_5TH_6TH', 'LTT-KYN-LTT 5th and 6th Lines', 'DN / UP', '5th and 6th line territory including NGSM and LTT yard.', 0),
    ('KYN_KSRA', 'KYN-KSRA-KYN and KSRA SDG', 'DN / UP', 'Kalyan-Kasara NE line territory and siding.', 0),
    ('KSRA_IGP', 'KSRA-IGP-KSRA and IGP/TTL Yard', 'DN / UP', 'Kasara-Igatpuri ghat territory and IGP/TTL yard.', 0),
    ('KYN_KJT', 'KYN-KJT-KYN', 'DN / UP', 'Kalyan-Karjat SE territory.', 0),
    ('KJT_LNL', 'KJT-LNL-KJT and BVT Yard', 'DN / UP', 'Karjat-Lonavala ghat territory and BVT yard.', 0),
    ('BSR_DW', 'BSR-DW-BSR and BSR-DW Yard', 'DN / UP', 'Vasai-Diva territory and yard.', 0),
    ('KYN_PNVL', 'KYN-PNVL-KYN and KYN Yard', 'DN / UP', 'Kalyan-Panvel territory and KYN yard.', 0),
    ('CSMT_PNVL', 'CSMT-PNVL-CSMT and all PNVL SDG', 'DN / UP', 'Harbour line territory and PNVL sidings.', 0),
    ('PNVL_TNA', 'PNVL-TNA-PNVL and TNA all SDG', 'DN / UP', 'Panvel-Thane territory and Thane sidings.', 0),
    ('PNVL_KJT', 'PNVL-KJT-PNVL and PNVL Yard', 'DN / UP', 'Panvel-Karjat territory and PNVL yard.', 0),
    ('PNVL_ROHA', 'PNVL-ROHA-PNVL and ROHA SDG', 'DN / UP', 'Panvel-Roha territory and Roha siding.', 0),
    ('PEN_THAL', 'PEN-THAL-PEN and Yard', 'DN / UP', 'PEN-THAL territory including TVSG, PPDP, JSWD and yard.', 0),
    ('PNVL_JASAI_JNPT', 'PNVL-JASAI-JNPT and Yard', 'DN / UP', 'Panvel-Jasai-JNPT territory and yard.', 0),
    ('KJT_KHPI', 'KJT-KHPI-KJT and SDG', 'DN / UP', 'Karjat-Khopoli territory and siding.', 0),
    ('CSMT_GMN', 'CSMT-GMN-CSMT and SDG', 'DN / UP', 'CSMT-Goregaon territory and siding.', 0),
    ('NEU_URAN', 'BEPR/NEU-URAN and Back and SDG', 'DN / UP', 'Nerul/Belapur-Uran territory and siding.', 0),
    ('PNVL_DW', 'PNVL-DW-PNVL and KLMG Yard', 'DN / UP', 'Panvel-Diva territory and Kalamboli yard.', 0),
    ('CLA_TMBY', 'CLA-TMBY-CLA inclusive both yards', 'DN / UP', 'Kurla-Trombay territory including both yards.', 0),
    ('MZN_CSMT_YARD', 'MZN and CSMT Yard', 'ALL', 'Masjid and CSMT yard signal inspection.', 1),
    ('PR_BY_YARD', 'PR and BY Yard', 'ALL', 'Parel and Byculla yard signal inspection.', 1)
ON DUPLICATE KEY UPDATE
    territory_name = VALUES(territory_name),
    line_label = VALUES(line_label),
    description = VALUES(description),
    is_yard = VALUES(is_yard),
    is_active = 1;

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'CSMT-KYN', 'DN LOC', 'DN', s.id, 100, 'DN local loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_DN_LOC'
WHERE t.territory_code = 'CSMT_KYN_LOCAL';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'CSMT-KYN', 'UP LOC', 'UP', s.id, 200, 'UP local loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_UP_LOC'
WHERE t.territory_code = 'CSMT_KYN_LOCAL';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'CSMT-KYN', 'DN TH', 'DN', s.id, 100, 'DN through loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_DN_TH'
WHERE t.territory_code = 'CSMT_KYN_THROUGH';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'CSMT-KYN', 'UP TH', 'UP', s.id, 200, 'UP through loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'CSMT_KYN_UP_TH'
WHERE t.territory_code = 'CSMT_KYN_THROUGH';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'CLA-KYN', '5TH', 'DN', s.id, 100, '5th line loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'CLA_KYN_5TH'
WHERE t.territory_code = 'LTT_KYN_5TH_6TH';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'CLA-KYN', '6TH', 'UP', s.id, 200, '6th line loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'CLA_KYN_6TH'
WHERE t.territory_code = 'LTT_KYN_5TH_6TH';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'KYN-KSRA', 'DN NE', 'DN', s.id, 100, 'DN NE loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'KYN_KSRA_DN_NE'
WHERE t.territory_code = 'KYN_KSRA';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'KYN-KSRA', 'UP NE', 'UP', s.id, 200, 'UP NE loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'KYN_KSRA_UP_NE'
WHERE t.territory_code = 'KYN_KSRA';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'KYN-KJT', 'DN SE', 'DN', s.id, 100, 'DN SE loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'KYN_KJT_DN_SE'
WHERE t.territory_code = 'KYN_KJT';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'KYN-KJT', 'UP SE', 'UP', s.id, 200, 'UP SE loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'KYN_KJT_UP_SE'
WHERE t.territory_code = 'KYN_KJT';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'CSMT-PNVL', 'DN HB', 'DN', s.id, 100, 'DN HB loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'CSMT_PNVL_DN_HB'
WHERE t.territory_code = 'CSMT_PNVL';

INSERT IGNORE INTO div_signal_sighting_territory_parts
    (territory_id, section, `line`, direction, book_section_id, display_order, remarks)
SELECT t.id, 'CSMT-PNVL', 'UP HB', 'UP', s.id, 200, 'UP HB loaded signal-book section'
FROM div_signal_sighting_territories t
LEFT JOIN div_signal_book_sections s ON s.section_code = 'CSMT_PNVL_UP_HB'
WHERE t.territory_code = 'CSMT_PNVL';

-- Initial assignments from BB/TRSO/SAFE/07 dated 2026-05-29.
-- If a CLI row cannot be resolved by mobile/name, the territory remains active
-- but unassigned until mapped in the UI/admin workflow.
INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004413821'
WHERE t.territory_code = 'CSMT_KYN_LOCAL';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004414009'
WHERE t.territory_code = 'CSMT_KYN_THROUGH';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004413635'
WHERE t.territory_code = 'KYN_STATION';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON REPLACE(UPPER(c.cli_name), ' ', '') = 'KAMALSINGH'
WHERE t.territory_code = 'LTT_KYN_5TH_6TH';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004415242'
WHERE t.territory_code = 'KYN_KSRA';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004413600'
WHERE t.territory_code = 'KSRA_IGP';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004410186'
WHERE t.territory_code = 'KYN_KJT';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004413930'
WHERE t.territory_code = 'KJT_LNL';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004415225'
WHERE t.territory_code = 'BSR_DW';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004410133'
WHERE t.territory_code = 'KYN_PNVL';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004415173'
WHERE t.territory_code = 'CSMT_PNVL';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004410196'
WHERE t.territory_code = 'PNVL_TNA';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004413549'
WHERE t.territory_code = 'PNVL_KJT';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004410180'
WHERE t.territory_code = 'PNVL_ROHA';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004415795'
WHERE t.territory_code = 'PEN_THAL';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004415676'
WHERE t.territory_code = 'PNVL_JASAI_JNPT';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004410245'
WHERE t.territory_code = 'KJT_KHPI';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004413560'
WHERE t.territory_code = 'CSMT_GMN';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004415412'
WHERE t.territory_code = 'NEU_URAN';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004415928'
WHERE t.territory_code = 'PNVL_DW';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004415169'
WHERE t.territory_code = 'CLA_TMBY';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004413025'
WHERE t.territory_code = 'MZN_CSMT_YARD';

INSERT IGNORE INTO div_signal_sighting_assignments (territory_id, cli_id, effective_from, remarks)
SELECT t.id, c.cli_id, '2026-05-29', 'Initial nomination BB/TRSO/SAFE/07'
FROM div_signal_sighting_territories t
JOIN div_cli_master c ON c.cli_mobile = '9004414964'
WHERE t.territory_code = 'PR_BY_YARD';
