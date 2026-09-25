-- TS-035: VVH staff page support. Add mobile lookup/storage for UI-added staff.
SET @has_mobile := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='div_trip_shed_staff' AND COLUMN_NAME='mobile_number');
SET @sql := IF(@has_mobile=0, 'ALTER TABLE div_trip_shed_staff ADD COLUMN mobile_number VARCHAR(20) NULL AFTER pf_number', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @has_mobile_index := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='div_trip_shed_staff' AND INDEX_NAME='ix_trip_shed_staff_mobile');
SET @sql := IF(@has_mobile_index=0, 'ALTER TABLE div_trip_shed_staff ADD KEY ix_trip_shed_staff_mobile (shed_id,mobile_number)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
