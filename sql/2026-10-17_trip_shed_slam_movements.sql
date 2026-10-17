-- TS-037: SLAM "Trip Shed Loco Movement" register.
-- One row per loco visit to a trip shed, imported from the SLAM central application
-- export (CSV) through the existing staging flow (import_kind SLAM_MOVEMENT). Unlike the
-- three legacy kinds, supervisor approval publishes READY rows into this table.
-- Natural key (shed_id, loco_number, received_at): re-uploading an overlapping date
-- range never duplicates a visit; the duplicate staging row is linked to the existing id.

CREATE TABLE IF NOT EXISTS div_trip_loco_movements (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shed_id INT NOT NULL,
  slam_sno INT NULL,
  zone VARCHAR(10) NULL,
  loco_number VARCHAR(20) NOT NULL,
  home_shed VARCHAR(30) NULL,
  purpose VARCHAR(20) NULL,
  spm_km BIGINT NULL,
  received_at DATETIME NOT NULL,
  loco_out_at DATETIME NULL,
  defect TEXT NULL,
  action_taken TEXT NULL,
  under_frame VARCHAR(80) NULL,
  ht_machine_room VARCHAR(80) NULL,
  pneumatic VARCHAR(80) NULL,
  others VARCHAR(80) NULL,
  roof_equipment VARCHAR(80) NULL,
  cab_equipment VARCHAR(80) NULL,
  hog_status_1 VARCHAR(40) NULL,
  hog_status_2 VARCHAR(40) NULL,
  cab_ac_1 VARCHAR(40) NULL,
  cab_ac_2 VARCHAR(40) NULL,
  remarks TEXT NULL,
  source_batch_id INT NULL,
  source_row_no INT NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trip_loco_movement_visit (shed_id, loco_number, received_at),
  KEY idx_trip_loco_movement_received (shed_id, received_at),
  KEY idx_trip_loco_movement_loco (loco_number),
  CONSTRAINT fk_trip_loco_movement_shed FOREIGN KEY (shed_id) REFERENCES div_trip_sheds(id),
  CONSTRAINT fk_trip_loco_movement_batch FOREIGN KEY (source_batch_id) REFERENCES div_trip_import_batches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Import kind for the SLAM export. The enum is Trip Shed's own, so restating it is safe.
ALTER TABLE div_trip_import_batches
  MODIFY import_kind ENUM('MCDO','OVERDUE','REPAIR_ATTENTION','SLAM_MOVEMENT') NOT NULL;

-- Rollback:
--   ALTER TABLE div_trip_import_batches
--     MODIFY import_kind ENUM('MCDO','OVERDUE','REPAIR_ATTENTION') NOT NULL;
--   DROP TABLE div_trip_loco_movements;
