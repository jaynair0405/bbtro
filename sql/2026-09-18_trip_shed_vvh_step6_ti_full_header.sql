-- TS-021: additive full TI header fields from approved VVH TI proformas.
-- Existing inspections retain NULL values until edited; historical template links are not changed.
ALTER TABLE div_trip_inspections ADD COLUMN traction_converter_make VARCHAR(80) NULL AFTER kms_reading;
ALTER TABLE div_trip_inspections ADD COLUMN auxiliary_converter_make VARCHAR(80) NULL AFTER traction_converter_make;
ALTER TABLE div_trip_inspections ADD COLUMN brake_system_make VARCHAR(80) NULL AFTER auxiliary_converter_make;
ALTER TABLE div_trip_inspections ADD COLUMN hlc_make VARCHAR(80) NULL AFTER brake_system_make;
ALTER TABLE div_trip_inspections ADD COLUMN spm_make VARCHAR(80) NULL AFTER hlc_make;
ALTER TABLE div_trip_inspections ADD COLUMN energy_consumed_kwh DECIMAL(12,2) NULL AFTER spm_make;
ALTER TABLE div_trip_inspections ADD COLUMN rtis_status VARCHAR(20) NULL AFTER energy_consumed_kwh;
ALTER TABLE div_trip_inspections ADD COLUMN rtis_remarks VARCHAR(160) NULL AFTER rtis_status;
