-- TS-038: register the Igatpuri (IGP) and Lonavala (LNL) Electric Loco Trip Sheds.
-- shed_code must match the TRIPSHED cell SLAM prints in its loco-movement export
-- (the VVH export prints 'VVH'); an OTHER_SHED row is rejected on import.
-- No user mappings are made here: nobody sees these sheds until a row is added
-- to div_trip_shed_users (division_admin sees every active shed regardless).
-- Idempotent: safe to re-run.
INSERT INTO div_trip_sheds (shed_code, shed_name, station_code, is_active)
VALUES
  ('IGP', 'Electric Loco Trip Shed, Igatpuri', 'IGP', 1),
  ('LNL', 'Electric Loco Trip Shed, Lonavala', 'LNL', 1)
ON DUPLICATE KEY UPDATE
  shed_name = VALUES(shed_name),
  station_code = VALUES(station_code),
  is_active = 1;

-- Rollback (only if no data references them):
-- DELETE FROM div_trip_sheds WHERE shed_code IN ('IGP','LNL');
