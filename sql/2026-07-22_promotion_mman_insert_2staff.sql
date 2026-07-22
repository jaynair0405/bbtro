-- =====================================================================
-- 2026-07-22  Insert missing to-Motorman promotion rows (Jan-2025 batch)
-- RPTJLN (MAHENDRA H YADAV) and WGYDPJ (RAM MURTI VERMA) are motormen but
-- had no promotion record. Part of the 71-staff Jan-2025 batch (2025-01-31).
-- FK-safe (JOIN div_staff_master) + idempotent (skip if a to=8 row exists).
-- =====================================================================

CREATE TEMPORARY TABLE _ins (hrms_id VARCHAR(10));
INSERT INTO _ins (hrms_id) VALUES ('RPTJLN'), ('WGYDPJ');

INSERT INTO div_promotion_history
  (staff_hrms_id, from_designation_id, to_designation_id, change_type,
   posting_date, created_by)
SELECT i.hrms_id, 5, 8, 'Promotion', '2025-01-31', 'promotion_import_2026'
FROM _ins i
JOIN div_staff_master s ON s.hrms_id = i.hrms_id
WHERE NOT EXISTS (
  SELECT 1 FROM div_promotion_history p
  WHERE p.staff_hrms_id = i.hrms_id AND p.to_designation_id = 8
);

DROP TEMPORARY TABLE _ins;
