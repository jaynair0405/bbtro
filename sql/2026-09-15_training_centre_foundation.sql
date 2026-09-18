-- Training Centre foundation: additive schema only, MySQL 8.0.16+.
-- Prepared 2026-09-15 after SHOW CREATE TABLE on LOCAL bbtro (MySQL 8.1.0).
-- Apply through scripts/training-centre-migration.js (local-only guard, lock,
-- before/after legacy digests, scratch validation, and exact replay check).
-- No ALTER, legacy backfill, course seeds, user changes, or production writes.
-- DDL implicitly commits. Recovery is documented in docs/TRAINING_CENTRE_MIGRATION.md.
-- Restrictive foreign keys intentionally preserve adopted records/history.
-- Application transactions must enforce authorisation, acceptance locks,
-- immutable versions/audits, valid transitions and cross-row business rules.

CREATE TABLE div_training_trainees (
trainee_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source ENUM('staff','cli','manual_tm') NOT NULL,
  staff_hrms_id VARCHAR(10) NULL,
  cli_id INT NULL,
  name VARCHAR(100) NOT NULL,
  cms_id VARCHAR(30) NULL,
  lobby VARCHAR(50) NULL,
  pf_number VARCHAR(30) NULL,
  hrms_id VARCHAR(20) NULL COMMENT 'Optional reported identifier; not a staff-master FK',
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trg_trainee_staff (staff_hrms_id),
  UNIQUE KEY uq_trg_trainee_cli (cli_id),
  KEY ix_trg_trainee_cms (cms_id),
  KEY ix_trg_trainee_pf (pf_number),
  CONSTRAINT fk_trg_trainee_staff FOREIGN KEY (staff_hrms_id) REFERENCES div_staff_master(hrms_id),
  CONSTRAINT fk_trg_trainee_cli FOREIGN KEY (cli_id) REFERENCES div_cli_master(cli_id),
  CONSTRAINT ck_trg_trainee_name CHECK (CHAR_LENGTH(TRIM(name)) > 0),
  CONSTRAINT ck_trg_trainee_source CHECK (
    (source='staff' AND staff_hrms_id IS NOT NULL AND cli_id IS NULL) OR
    (source='cli' AND cli_id IS NOT NULL AND staff_hrms_id IS NULL) OR
    (source='manual_tm' AND staff_hrms_id IS NULL AND cli_id IS NULL)),
  CONSTRAINT ck_trg_tm_required CHECK (source <> 'manual_tm' OR
    (cms_id IS NOT NULL AND CHAR_LENGTH(TRIM(cms_id)) > 0 AND
     lobby IS NOT NULL AND CHAR_LENGTH(TRIM(lobby)) > 0 AND
     pf_number IS NOT NULL AND CHAR_LENGTH(TRIM(pf_number)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_courses (
course_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(40) NOT NULL UNIQUE,
  course_name VARCHAR(150) NOT NULL,
  legacy_course_type VARCHAR(30) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_course_rules (
rule_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  version_no INT NOT NULL,
  effective_from DATE NOT NULL,
  working_days INT NOT NULL,
  subsequent_handling_days INT NULL,
  eligibility_notes TEXT NULL,
  syllabus_details JSON NULL,
  assessment_configured BOOLEAN NOT NULL DEFAULT FALSE,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trg_rule_version (course_id,version_no),
  CONSTRAINT fk_trg_rule_course FOREIGN KEY (course_id) REFERENCES div_training_courses(course_id),
  CONSTRAINT ck_trg_rule_days CHECK (working_days > 0 AND version_no > 0 AND
    (subsequent_handling_days IS NULL OR subsequent_handling_days >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_renewal_targets (
target_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  target_code VARCHAR(40) NOT NULL UNIQUE,
  target_name VARCHAR(150) NOT NULL,
  legacy_training_id INT NULL UNIQUE,
  CONSTRAINT fk_trg_target_type FOREIGN KEY (legacy_training_id) REFERENCES div_training_types(training_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_rule_renewals (
rule_id INT NOT NULL,
  target_id INT NOT NULL,
  validity_months INT NOT NULL,
  PRIMARY KEY (rule_id,target_id),
  CONSTRAINT fk_trg_renewal_rule FOREIGN KEY (rule_id) REFERENCES div_training_course_rules(rule_id),
  CONSTRAINT fk_trg_renewal_target FOREIGN KEY (target_id) REFERENCES div_training_renewal_targets(target_id),
  CONSTRAINT ck_trg_validity CHECK (validity_months > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_course_offerings (
training_center_id INT NOT NULL,
  rule_id INT NOT NULL,
  report_time TIME NOT NULL DEFAULT '09:30:00',
  advance_planning BOOLEAN NOT NULL DEFAULT FALSE,
  requirements_text TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (training_center_id,rule_id),
  CONSTRAINT fk_trg_offering_center FOREIGN KEY (training_center_id) REFERENCES div_training_centers(center_id),
  CONSTRAINT fk_trg_offering_rule FOREIGN KEY (rule_id) REFERENCES div_training_course_rules(rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_center_holidays (
training_center_id INT NOT NULL,
  holiday_date DATE NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (training_center_id,holiday_date),
  CONSTRAINT fk_trg_holiday_center FOREIGN KEY (training_center_id) REFERENCES div_training_centers(center_id),
  CONSTRAINT ck_trg_holiday_reason CHECK (CHAR_LENGTH(TRIM(reason)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_batch_settings (
calendar_id INT NOT NULL PRIMARY KEY,
  training_center_id INT NOT NULL,
  rule_id INT NOT NULL,
  capacity INT NULL,
  expected_end_date DATE NULL,
  UNIQUE KEY uq_trg_batch_scope (calendar_id,training_center_id,rule_id),
  CONSTRAINT fk_trg_batch_calendar FOREIGN KEY (calendar_id) REFERENCES div_training_calendar(id),
  CONSTRAINT fk_trg_batch_offering FOREIGN KEY (training_center_id,rule_id)
    REFERENCES div_training_course_offerings(training_center_id,rule_id),
  CONSTRAINT ck_trg_capacity CHECK (capacity IS NULL OR capacity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_batch_allocations (
calendar_id INT NOT NULL,
  lobby VARCHAR(50) NOT NULL,
  suggested_seats INT NOT NULL,
  PRIMARY KEY (calendar_id,lobby),
  CONSTRAINT fk_trg_alloc_batch FOREIGN KEY (calendar_id) REFERENCES div_training_batch_settings(calendar_id),
  CONSTRAINT ck_trg_alloc_seats CHECK (suggested_seats >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_letter_workflows (
letter_id INT NOT NULL PRIMARY KEY,
  training_center_id INT NOT NULL,
  rule_id INT NOT NULL,
  origin ENUM('lobby','centre') NOT NULL,
  workflow_status ENUM('draft','submitted','accepted','partly_accepted','returned','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
  revision INT NOT NULL DEFAULT 1,
  updated_by VARCHAR(100) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trg_letter_scope (letter_id,training_center_id,rule_id),
  CONSTRAINT fk_trg_workflow_letter FOREIGN KEY (letter_id) REFERENCES div_training_letters(id),
  CONSTRAINT fk_trg_letter_offering FOREIGN KEY (training_center_id,rule_id)
    REFERENCES div_training_course_offerings(training_center_id,rule_id),
  CONSTRAINT ck_trg_letter_revision CHECK (revision > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_letter_versions (
version_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  letter_id INT NOT NULL,
  version_no INT NOT NULL,
  snapshot JSON NOT NULL COMMENT 'Full issued letter including nominee identity and printed training dates',
  submitted_by VARCHAR(100) NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trg_letter_version (letter_id,version_no),
  UNIQUE KEY uq_trg_version_letter (version_id,letter_id),
  CONSTRAINT fk_trg_version_letter FOREIGN KEY (letter_id) REFERENCES div_training_letter_workflows(letter_id),
  CONSTRAINT ck_trg_version_no CHECK (version_no > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_nominees (
nominee_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  letter_id INT NOT NULL,
  trainee_id BIGINT UNSIGNED NOT NULL,
  legacy_letter_staff_id INT NULL UNIQUE,
  version_id BIGINT UNSIGNED NOT NULL,
  sr_no INT NOT NULL,
  identity_snapshot JSON NOT NULL,
  decision ENUM('pending','accepted','returned','withdrawn') NOT NULL DEFAULT 'pending',
  decision_reason TEXT NULL,
  decided_by VARCHAR(100) NULL,
  decided_at TIMESTAMP NULL,
  UNIQUE KEY uq_trg_nominee (letter_id,trainee_id),
  UNIQUE KEY uq_trg_nominee_letter (nominee_id,letter_id),
  CONSTRAINT fk_trg_nominee_letter FOREIGN KEY (letter_id) REFERENCES div_training_letter_workflows(letter_id),
  CONSTRAINT fk_trg_nominee_person FOREIGN KEY (trainee_id) REFERENCES div_training_trainees(trainee_id),
  CONSTRAINT fk_trg_nominee_legacy FOREIGN KEY (legacy_letter_staff_id) REFERENCES div_training_letter_staff(id),
  CONSTRAINT fk_trg_nominee_version FOREIGN KEY (version_id,letter_id) REFERENCES div_training_letter_versions(version_id,letter_id),
  CONSTRAINT ck_trg_nominee_serial CHECK (sr_no > 0),
  CONSTRAINT ck_trg_decision_actor CHECK (decision='pending' OR (decided_by IS NOT NULL AND decided_at IS NOT NULL)),
  CONSTRAINT ck_trg_return_reason CHECK (decision <> 'returned' OR
    (decision_reason IS NOT NULL AND CHAR_LENGTH(TRIM(decision_reason)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_attempts (
attempt_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nominee_id BIGINT UNSIGNED NOT NULL UNIQUE,
  letter_id INT NOT NULL,
  training_center_id INT NOT NULL,
  rule_id INT NOT NULL,
  calendar_id INT NULL,
  prior_attempt_id BIGINT UNSIGNED NULL,
  joining_date DATE NULL,
  completion_date DATE NULL,
  outcome ENUM('pending','in_progress','passed','failed','repeat_required','withdrawn') NOT NULL DEFAULT 'pending',
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trg_attempt_rule (attempt_id,rule_id),
  CONSTRAINT fk_trg_attempt_nominee FOREIGN KEY (nominee_id,letter_id) REFERENCES div_training_nominees(nominee_id,letter_id),
  CONSTRAINT fk_trg_attempt_scope FOREIGN KEY (letter_id,training_center_id,rule_id)
    REFERENCES div_training_letter_workflows(letter_id,training_center_id,rule_id),
  CONSTRAINT fk_trg_attempt_batch FOREIGN KEY (calendar_id,training_center_id,rule_id)
    REFERENCES div_training_batch_settings(calendar_id,training_center_id,rule_id),
  CONSTRAINT fk_trg_attempt_prior FOREIGN KEY (prior_attempt_id) REFERENCES div_training_attempts(attempt_id),
  CONSTRAINT ck_trg_attempt_dates CHECK (completion_date IS NULL OR (joining_date IS NOT NULL AND completion_date >= joining_date))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_daily_attendance (
attempt_id BIGINT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present','absent','leave') NOT NULL,
  remarks TEXT NULL,
  marked_by VARCHAR(100) NOT NULL,
  marked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id,attendance_date),
  CONSTRAINT fk_trg_attendance_attempt FOREIGN KEY (attempt_id) REFERENCES div_training_attempts(attempt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_assessment_definitions (
assessment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  rule_id INT NOT NULL,
  assessment_code VARCHAR(40) NOT NULL,
  assessment_name VARCHAR(150) NOT NULL,
  component ENUM('written','oral') NOT NULL,
  maximum_marks DECIMAL(8,2) NOT NULL,
  passing_marks DECIMAL(8,2) NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_trg_assessment_code (rule_id,assessment_code),
  UNIQUE KEY uq_trg_assessment_rule (assessment_id,rule_id),
  CONSTRAINT fk_trg_assessment_rule FOREIGN KEY (rule_id) REFERENCES div_training_course_rules(rule_id),
  CONSTRAINT ck_trg_assessment_marks CHECK (maximum_marks > 0 AND passing_marks >= 0 AND passing_marks <= maximum_marks)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_assessment_results (
result_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  attempt_id BIGINT UNSIGNED NOT NULL,
  assessment_id INT NOT NULL,
  rule_id INT NOT NULL,
  exam_no INT NOT NULL DEFAULT 1,
  exam_date DATE NOT NULL,
  marks DECIMAL(8,2) NULL,
  result ENUM('pass','fail','absent') NOT NULL,
  recorded_by VARCHAR(100) NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trg_exam (attempt_id,assessment_id,exam_no),
  CONSTRAINT fk_trg_result_attempt FOREIGN KEY (attempt_id,rule_id) REFERENCES div_training_attempts(attempt_id,rule_id),
  CONSTRAINT fk_trg_result_assessment FOREIGN KEY (assessment_id,rule_id) REFERENCES div_training_assessment_definitions(assessment_id,rule_id),
  CONSTRAINT ck_trg_result_marks CHECK (exam_no > 0 AND
    ((result='absent' AND marks IS NULL) OR (result IN ('pass','fail') AND marks IS NOT NULL AND marks >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_completion_events (
completion_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  attempt_id BIGINT UNSIGNED NOT NULL,
  revision INT NOT NULL DEFAULT 1,
  completion_date DATE NOT NULL,
  event_type ENUM('confirmed','corrected','voided') NOT NULL DEFAULT 'confirmed',
  supersedes_id BIGINT UNSIGNED NULL UNIQUE,
  request_key VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  reason TEXT NULL,
  confirmed_by VARCHAR(100) NOT NULL,
  confirmed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trg_completion_revision (attempt_id,revision),
  UNIQUE KEY uq_trg_completion_attempt (completion_id,attempt_id),
  CONSTRAINT fk_trg_completion_attempt FOREIGN KEY (attempt_id) REFERENCES div_training_attempts(attempt_id),
  CONSTRAINT fk_trg_completion_previous FOREIGN KEY (supersedes_id,attempt_id)
    REFERENCES div_training_completion_events(completion_id,attempt_id),
  CONSTRAINT ck_trg_completion_revision CHECK (
    (event_type='confirmed' AND revision=1 AND supersedes_id IS NULL) OR
    (event_type IN ('corrected','voided') AND revision>1 AND supersedes_id IS NOT NULL AND
     reason IS NOT NULL AND CHAR_LENGTH(TRIM(reason)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_completion_renewals (
completion_id BIGINT UNSIGNED NOT NULL,
  target_id INT NOT NULL,
  due_date DATE NOT NULL,
  legacy_record_id INT NULL,
  PRIMARY KEY (completion_id,target_id),
  KEY ix_trg_renewal_legacy (legacy_record_id),
  CONSTRAINT fk_trg_effect_completion FOREIGN KEY (completion_id) REFERENCES div_training_completion_events(completion_id),
  CONSTRAINT fk_trg_effect_target FOREIGN KEY (target_id) REFERENCES div_training_renewal_targets(target_id),
  CONSTRAINT fk_trg_effect_legacy FOREIGN KEY (legacy_record_id) REFERENCES div_training_records(record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE div_training_audit_events (
audit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  training_center_id INT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  before_data JSON NULL,
  after_data JSON NULL,
  actor VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_trg_audit_entity (entity_type,entity_id,audit_id),
  CONSTRAINT fk_trg_audit_center FOREIGN KEY (training_center_id) REFERENCES div_training_centers(center_id),
  CONSTRAINT ck_trg_audit_reason CHECK (CHAR_LENGTH(TRIM(reason)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
