-- =====================================================================
-- 2026-07-23  Sr.LPS(4)->LPG(5): insert 14 more staff added to master
-- Source: data/promotion-dates/promotion _dates_all _to_lpg_14.csv
-- Part of the earlier "not in master" set; now added to div_staff_master.
-- FK-safe (JOIN master) + idempotent (skip if a 4->5 row already exists).
-- On local only those present in local master insert; rest skip (prod has more).
-- =====================================================================

CREATE TEMPORARY TABLE _promo_stage (hrms_id VARCHAR(10), posting_date DATE);
INSERT INTO _promo_stage (hrms_id, posting_date) VALUES
  ('CDAUOK','2023-04-05'),
  ('DARWLX','2011-04-13'),
  ('ETHMLK','2021-06-08'),
  ('FZOBGK','2018-12-20'),
  ('NDWQPS','2018-12-20'),
  ('QQSEED','2019-12-30'),
  ('QBEMES','2018-12-20'),
  ('QYUQCZ','2018-11-15'),
  ('RQKYAJ','2022-10-22'),
  ('TUSAFU','2018-11-15'),
  ('XLYMQS','2022-02-24'),
  ('YSNPDJ','2015-10-21'),
  ('YTSXPY','2022-10-08'),
  ('IBQHUT','2022-10-22');

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
