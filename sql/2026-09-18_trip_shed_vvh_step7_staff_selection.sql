-- TS-027: preserve master-selected staff identity alongside the approved names.
-- Additive and nullable so existing inspections remain unchanged.
ALTER TABLE div_trip_inspections
  ADD COLUMN technician_hrms_id VARCHAR(20) NULL AFTER technician_name,
  ADD COLUMN supervisor_hrms_id VARCHAR(20) NULL AFTER supervisor_name;

