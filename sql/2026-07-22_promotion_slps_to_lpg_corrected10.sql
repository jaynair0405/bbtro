-- =====================================================================
-- 2026-07-22  Sr.LPS(4)->LPG(5): insert 10 staff whose hrms_id was corrected
-- Source: data/promotion-dates/promotion _dates_all - to_lpg_hrms_id_corrected.csv
-- These 10 were in the earlier "not in master" set; their hrms_id was fixed in
-- div_staff_master, so they now exist but have no 4->5 row. Insert it.
-- FK-safe (JOIN master) + idempotent (skip if a 4->5 row already exists).
-- =====================================================================

CREATE TEMPORARY TABLE _promo_stage (hrms_id VARCHAR(10), posting_date DATE);
INSERT INTO _promo_stage (hrms_id, posting_date) VALUES
  ('CMHPWZ','2022-05-12'),
  ('DZGFUI','2024-07-18'),
  ('KURSQK','2024-07-18'),
  ('UKNPWY','2024-02-01'),
  ('UQEEMC','2025-02-24'),
  ('UTRBWX','2023-04-05'),
  ('UUHWAX','2023-04-05'),
  ('XYSDGC','2024-07-18'),
  ('YXSFRW','2023-04-05'),
  ('ZQXYOO','2025-09-26');

INSERT INTO div_promotion_history
  (staff_hrms_id, from_designation_id, to_designation_id, change_type,
   posting_date, created_by)
SELECT g.hrms_id, 4, 5, 'Promotion', g.posting_date, 'promotion_import_2026'
FROM _promo_stage g
JOIN div_staff_master s ON s.hrms_id = g.hrms_id
WHERE NOT EXISTS (
  SELECT 1 FROM div_promotion_history p
  WHERE p.staff_hrms_id = g.hrms_id
    AND p.from_designation_id = 4 AND p.to_designation_id = 5
);

DROP TEMPORARY TABLE _promo_stage;
