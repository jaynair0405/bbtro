-- TS-031: register CSMT as a separate active Trip Shed.
-- User access remains explicit through div_trip_shed_users; no existing VVH
-- assignments are changed by this migration.
INSERT INTO div_trip_sheds (shed_code, shed_name, station_code, is_active)
VALUES ('CSMT', 'CSMT Electric Loco Trip Shed', 'CSMT', 1)
ON DUPLICATE KEY UPDATE
  shed_name = VALUES(shed_name),
  station_code = VALUES(station_code),
  is_active = 1;
