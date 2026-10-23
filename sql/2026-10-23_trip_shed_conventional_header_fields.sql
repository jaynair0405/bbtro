-- TS-042: conventional TI proforma header fields (Final Conv TI _17.08.25.doc asks
-- "Make of SI Unit/ARNO" and "FDCS" where the 3-phase form asks traction/auxiliary converter).
-- Additive, nullable; existing rows keep NULL. Idempotent via information_schema check.
SET @c1 := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_trip_inspections' AND COLUMN_NAME = 'si_unit_arno_make');
SET @s := IF(@c1 = 0, 'ALTER TABLE div_trip_inspections ADD COLUMN si_unit_arno_make VARCHAR(80) NULL AFTER auxiliary_converter_make', 'SELECT 1');
PREPARE p FROM @s; EXECUTE p; DEALLOCATE PREPARE p;
SET @c2 := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_trip_inspections' AND COLUMN_NAME = 'fdcs_make');
SET @s := IF(@c2 = 0, 'ALTER TABLE div_trip_inspections ADD COLUMN fdcs_make VARCHAR(80) NULL AFTER si_unit_arno_make', 'SELECT 1');
PREPARE p FROM @s; EXECUTE p; DEALLOCATE PREPARE p;
-- Rollback: ALTER TABLE div_trip_inspections DROP COLUMN fdcs_make, DROP COLUMN si_unit_arno_make;
