-- CRTMS Trip Shed v1 — VVH is seeded first, but every record is shed-scoped.
-- Run after div_locos and the Division user schema migrations.

ALTER TABLE users
  MODIFY div_role ENUM(
    'division_admin','office_hr','trgcentre_admin','lpc','ctlc','clicms',
    'ctlc_view','ssehq','trip_shed_operator','trip_shed_supervisor'
  ) NULL;

CREATE TABLE IF NOT EXISTS div_trip_sheds (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shed_code VARCHAR(20) NOT NULL,
  shed_name VARCHAR(120) NOT NULL,
  station_code VARCHAR(20) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trip_shed_code (shed_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO div_trip_sheds (shed_code, shed_name, station_code)
VALUES ('VVH', 'Electric Loco Trip Shed, Vidyavihar', 'VVH')
ON DUPLICATE KEY UPDATE shed_name=VALUES(shed_name), station_code=VALUES(station_code);

CREATE TABLE IF NOT EXISTS div_trip_inspection_templates (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  inspection_type ENUM('GC','TI_CONVENTIONAL','TI_3PHASE','IA','IB','IC') NOT NULL,
  version_no VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  entry_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trip_template_version (inspection_type, version_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS div_trip_inspection_template_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  section_no VARCHAR(20) DEFAULT NULL,
  section_name VARCHAR(255) DEFAULT NULL,
  item_no VARCHAR(30) NOT NULL,
  label_en TEXT NOT NULL,
  label_hi TEXT DEFAULT NULL,
  standard_value TEXT DEFAULT NULL,
  sort_order INT NOT NULL,
  is_required TINYINT(1) NOT NULL DEFAULT 1,
  KEY idx_trip_template_items (template_id, sort_order),
  CONSTRAINT fk_trip_template_item_template FOREIGN KEY (template_id)
    REFERENCES div_trip_inspection_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS div_trip_inspections (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shed_id INT NOT NULL,
  template_id INT NOT NULL,
  inspection_date DATE NOT NULL,
  shift_code ENUM('00/08','08/16','16/24') NOT NULL,
  loco_number VARCHAR(20) NOT NULL,
  loco_type VARCHAR(30) DEFAULT NULL,
  loco_base VARCHAR(30) DEFAULT NULL,
  train_no VARCHAR(40) DEFAULT NULL,
  incoming_train_no VARCHAR(40) DEFAULT NULL,
  cab_leading VARCHAR(20) DEFAULT NULL,
  kms_reading DECIMAL(12,2) DEFAULT NULL,
  technician_staff_id INT DEFAULT NULL,
  technician_name VARCHAR(160) DEFAULT NULL,
  supervisor_staff_id INT DEFAULT NULL,
  supervisor_name VARCHAR(160) DEFAULT NULL,
  general_remarks TEXT DEFAULT NULL,
  status ENUM('draft','final') NOT NULL DEFAULT 'draft',
  created_by INT DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  finalized_by INT DEFAULT NULL,
  finalized_at DATETIME DEFAULT NULL,
  reopened_by INT DEFAULT NULL,
  reopened_at DATETIME DEFAULT NULL,
  reopen_reason TEXT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_trip_inspection_shed_date (shed_id, inspection_date),
  KEY idx_trip_inspection_loco (loco_number),
  KEY idx_trip_inspection_status (status),
  CONSTRAINT fk_trip_inspection_shed FOREIGN KEY (shed_id) REFERENCES div_trip_sheds(id),
  CONSTRAINT fk_trip_inspection_template FOREIGN KEY (template_id) REFERENCES div_trip_inspection_templates(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS div_trip_inspection_responses (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  template_item_id INT NOT NULL,
  outcome ENUM('OK','ATTENTION','NOT_APPLICABLE','NOT_CHECKED') NOT NULL DEFAULT 'NOT_CHECKED',
  observed_value TEXT DEFAULT NULL,
  remarks TEXT DEFAULT NULL,
  defect_id INT DEFAULT NULL,
  UNIQUE KEY uq_trip_response_item (inspection_id, template_item_id),
  KEY idx_trip_response_defect (defect_id),
  CONSTRAINT fk_trip_response_inspection FOREIGN KEY (inspection_id)
    REFERENCES div_trip_inspections(id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_response_item FOREIGN KEY (template_item_id)
    REFERENCES div_trip_inspection_template_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS div_trip_defects (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shed_id INT NOT NULL,
  inspection_id INT DEFAULT NULL,
  defect_date DATE NOT NULL,
  loco_number VARCHAR(20) NOT NULL,
  loco_base VARCHAR(30) DEFAULT NULL,
  incoming_train_no VARCHAR(40) DEFAULT NULL,
  equipment_name VARCHAR(120) DEFAULT NULL,
  defect_category ENUM('ELECTRICAL','MECHANICAL','SAFETY','OTHER') NOT NULL DEFAULT 'OTHER',
  description TEXT NOT NULL,
  action_taken TEXT DEFAULT NULL,
  responsible_party VARCHAR(160) DEFAULT NULL,
  outgoing_date DATE DEFAULT NULL,
  outgoing_train_no VARCHAR(40) DEFAULT NULL,
  remarks TEXT DEFAULT NULL,
  status ENUM('OPEN','UNDER_ATTENTION','CLOSED') NOT NULL DEFAULT 'OPEN',
  created_by INT DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  closed_by INT DEFAULT NULL,
  closed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_trip_defect_shed_status (shed_id, status),
  KEY idx_trip_defect_loco (loco_number),
  CONSTRAINT fk_trip_defect_shed FOREIGN KEY (shed_id) REFERENCES div_trip_sheds(id),
  CONSTRAINT fk_trip_defect_inspection FOREIGN KEY (inspection_id) REFERENCES div_trip_inspections(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS div_trip_defect_events (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  defect_id INT NOT NULL,
  event_type ENUM('CREATED','ACTION','STATUS_CHANGE','CLOSED','IMPORT') NOT NULL,
  event_note TEXT DEFAULT NULL,
  status_after ENUM('OPEN','UNDER_ATTENTION','CLOSED') DEFAULT NULL,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_trip_defect_events (defect_id, created_at),
  CONSTRAINT fk_trip_defect_event_defect FOREIGN KEY (defect_id)
    REFERENCES div_trip_defects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS div_trip_overdue_entries (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shed_id INT NOT NULL,
  entry_date DATE NOT NULL,
  loco_number VARCHAR(20) NOT NULL,
  loco_base VARCHAR(30) DEFAULT NULL,
  incoming_train_no VARCHAR(40) DEFAULT NULL,
  kms DECIMAL(12,2) DEFAULT NULL,
  last_inspection_date DATE DEFAULT NULL,
  last_inspection_type VARCHAR(30) DEFAULT NULL,
  outgoing_train_no VARCHAR(40) DEFAULT NULL,
  last_shed VARCHAR(60) DEFAULT NULL,
  remarks TEXT DEFAULT NULL,
  source_batch_id INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_trip_overdue_shed_date (shed_id, entry_date),
  KEY idx_trip_overdue_loco (loco_number),
  CONSTRAINT fk_trip_overdue_shed FOREIGN KEY (shed_id) REFERENCES div_trip_sheds(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS div_trip_import_batches (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shed_id INT NOT NULL,
  import_kind ENUM('MCDO','OVERDUE','REPAIR_ATTENTION') NOT NULL,
  source_filename VARCHAR(255) NOT NULL,
  source_sha256 CHAR(64) DEFAULT NULL,
  status ENUM('STAGED','APPROVED','REJECTED') NOT NULL DEFAULT 'STAGED',
  total_rows INT NOT NULL DEFAULT 0,
  valid_rows INT NOT NULL DEFAULT 0,
  invalid_rows INT NOT NULL DEFAULT 0,
  uploaded_by INT DEFAULT NULL,
  reviewed_by INT DEFAULT NULL,
  reviewed_at DATETIME DEFAULT NULL,
  review_note TEXT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_trip_import_batch_status (shed_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS div_trip_import_staging_rows (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  source_sheet VARCHAR(160) NOT NULL,
  source_row_no INT NOT NULL,
  raw_json JSON NOT NULL,
  normalized_json JSON DEFAULT NULL,
  validation_errors JSON DEFAULT NULL,
  status ENUM('READY','INVALID','APPROVED','REJECTED') NOT NULL DEFAULT 'READY',
  published_record_id INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_trip_staging_batch_status (batch_id, status),
  CONSTRAINT fk_trip_staging_batch FOREIGN KEY (batch_id)
    REFERENCES div_trip_import_batches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the currently approved digital entry forms. IA/IB/IC exist as known
-- maintenance types, but deliberately remain disabled until their proformas arrive.
INSERT INTO div_trip_inspection_templates (inspection_type, version_no, title, enabled, entry_enabled)
VALUES
 ('GC','VVH-2025-08','General Checking of Locos',1,1),
 ('TI_CONVENTIONAL','VVH-PENDING-PROFORMA','Conventional Loco Trip Inspection',1,1),
 ('TI_3PHASE','VVH-2025-08','Trip Inspection Proforma for 3-Phase Locos',1,1),
 ('IA','PENDING-APPROVED-PROFORMA','IA Periodic Maintenance',1,0),
 ('IB','PENDING-APPROVED-PROFORMA','IB Periodic Maintenance',1,0),
 ('IC','PENDING-APPROVED-PROFORMA','IC Periodic Maintenance',1,0)
ON DUPLICATE KEY UPDATE title=VALUES(title), enabled=VALUES(enabled), entry_enabled=VALUES(entry_enabled);
