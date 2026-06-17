-- ============================================================
-- Phase 2 — AWS Tables
-- BBTRO Mumbai Division
--
-- Three-table architecture:
--   1. div_aws_cms_uploads  — tracks each Excel upload batch
--   2. div_aws_cms_raw      — raw CMS rows exactly as downloaded
--   3. div_aws_events       — parsed AWS cases with signal/rake matching
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1. div_aws_cms_uploads — Upload batch tracker
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_aws_cms_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,

    upload_batch_id VARCHAR(40) NOT NULL,
    source_filename VARCHAR(255) NOT NULL,

    uploaded_by_user_id INT DEFAULT NULL,

    report_from_date DATE DEFAULT NULL,
    report_to_date DATE DEFAULT NULL,

    total_rows INT NOT NULL DEFAULT 0,
    aws_candidate_rows INT NOT NULL DEFAULT 0,
    imported_rows INT NOT NULL DEFAULT 0,
    skipped_duplicate_rows INT NOT NULL DEFAULT 0,

    status ENUM(
        'UPLOADED',
        'PARSING',
        'PARSED',
        'IMPORTING',
        'COMPLETED',
        'FAILED'
    ) NOT NULL DEFAULT 'UPLOADED',

    remarks TEXT DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_upload_batch_id (upload_batch_id),
    INDEX idx_status (status),
    INDEX idx_report_dates (report_from_date, report_to_date),
    INDEX idx_uploaded_by (uploaded_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 2. div_aws_cms_raw — Raw CMS abnormality rows
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_aws_cms_raw (
    id INT AUTO_INCREMENT PRIMARY KEY,

    upload_id INT NOT NULL,

    abn_id VARCHAR(60) NOT NULL,
    abn_type VARCHAR(20) NOT NULL,
    subhead VARCHAR(50) DEFAULT NULL,

    report_station VARCHAR(10) DEFAULT NULL,
    report_division VARCHAR(10) DEFAULT NULL,

    from_station VARCHAR(10) DEFAULT NULL,
    to_station VARCHAR(10) DEFAULT NULL,

    crew_id VARCHAR(20) DEFAULT NULL,
    crew_name VARCHAR(100) DEFAULT NULL,
    designation VARCHAR(20) DEFAULT NULL,

    abn_date DATE NOT NULL,
    abn_time TIME DEFAULT NULL,

    from_km VARCHAR(20) DEFAULT NULL,
    to_km VARCHAR(20) DEFAULT NULL,

    status VARCHAR(10) DEFAULT NULL,
    filled_by VARCHAR(20) DEFAULT NULL,

    loco_raw VARCHAR(30) DEFAULT NULL,
    loco_shed VARCHAR(10) DEFAULT NULL,
    train_number VARCHAR(20) DEFAULT NULL,

    sms_to_lp VARCHAR(50) DEFAULT NULL,

    detail TEXT DEFAULT NULL,
    closing_remarks TEXT DEFAULT NULL,
    app_remarks_date VARCHAR(50) DEFAULT NULL,
    reporting_date DATE DEFAULT NULL,

    raw_json JSON DEFAULT NULL,
    is_aws_candidate TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_abn_id (abn_id),
    INDEX idx_upload_id (upload_id),
    INDEX idx_abn_type (abn_type),
    INDEX idx_abn_date (abn_date),
    INDEX idx_loco_raw (loco_raw),
    INDEX idx_from_station (from_station),
    INDEX idx_is_aws_candidate (is_aws_candidate),

    CONSTRAINT fk_aws_raw_upload
        FOREIGN KEY (upload_id)
        REFERENCES div_aws_cms_uploads(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Saved editable report drafts for AWS weekly reports.
CREATE TABLE IF NOT EXISTS div_aws_report_drafts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_from DATE NOT NULL,
    period_to DATE NOT NULL,
    office_code VARCHAR(20) NOT NULL DEFAULT '',
    payload JSON NOT NULL,
    saved_by_user_id INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_aws_report_period_office (period_from, period_to, office_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- 3. div_aws_events — Parsed AWS cases
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS div_aws_events (
    id INT AUTO_INCREMENT PRIMARY KEY,

    raw_id INT DEFAULT NULL,
    abn_id VARCHAR(60) NOT NULL,

    entry_source ENUM('CMS_IMPORT', 'MANUAL') NOT NULL DEFAULT 'CMS_IMPORT',
    entered_by_user_id INT DEFAULT NULL,

    abn_date DATE NOT NULL,
    abn_time TIME DEFAULT NULL,

    -- AWS code and location
    aws_code ENUM('A', 'B', 'C', 'D', 'E', 'AUX', 'P', 'Q', 'R', 'OTHER') DEFAULT NULL,

    location_raw VARCHAR(100) DEFAULT NULL,
    location_type ENUM(
        'SIGNAL',
        'KM',
        'PLATFORM',
        'SECTION',
        'UNKNOWN'
    ) DEFAULT 'UNKNOWN',
    normalized_location VARCHAR(100) DEFAULT NULL,

    -- Signal matching
    signal_id INT DEFAULT NULL,
    signal_match_confidence ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT NULL,
    needs_manual_review TINYINT(1) NOT NULL DEFAULT 0,

    -- Rake/cab matching
    loco_raw VARCHAR(30) DEFAULT NULL,
    matched_coach_id INT DEFAULT NULL,
    matched_rake_id INT DEFAULT NULL,

    -- Train and crew
    train_number VARCHAR(20) DEFAULT NULL,
    crew_id VARCHAR(20) DEFAULT NULL,
    crew_name VARCHAR(100) DEFAULT NULL,
    staff_hrms_id VARCHAR(20) DEFAULT NULL,

    -- Analysis
    responsibility ENUM(
        'S&T',
        'CAB_SIDE',
        'TRANSIENT',
        'NOT_DETERMINED'
    ) DEFAULT 'NOT_DETERMINED',

    root_cause VARCHAR(255) DEFAULT NULL,
    analysis_text TEXT DEFAULT NULL,

    closing_remarks TEXT DEFAULT NULL,
    status ENUM(
        'PENDING',
        'REVIEWED',
        'CONFIRMED',
        'DISPUTED'
    ) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_abn_id (abn_id),
    INDEX idx_raw_id (raw_id),
    INDEX idx_entry_source (entry_source),
    INDEX idx_entered_by (entered_by_user_id),
    INDEX idx_abn_date (abn_date),
    INDEX idx_aws_code (aws_code),
    INDEX idx_signal_id (signal_id),
    INDEX idx_matched_rake_id (matched_rake_id),
    INDEX idx_matched_coach_id (matched_coach_id),
    INDEX idx_needs_review (needs_manual_review),
    INDEX idx_responsibility (responsibility),
    INDEX idx_status (status),
    INDEX idx_loco_raw (loco_raw),
    INDEX idx_normalized_location (normalized_location),

    CONSTRAINT fk_aws_event_raw
        FOREIGN KEY (raw_id)
        REFERENCES div_aws_cms_raw(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_aws_event_signal
        FOREIGN KEY (signal_id)
        REFERENCES div_signals(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_aws_event_coach
        FOREIGN KEY (matched_coach_id)
        REFERENCES rake_coaches(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_aws_event_rake
        FOREIGN KEY (matched_rake_id)
        REFERENCES rake_formations(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
