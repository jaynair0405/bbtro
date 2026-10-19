-- TS-039: one trip_shed_operator and one trip_shed_supervisor account per shed
-- (VVH, CSMT, IGP, LNL), mapped to their shed in div_trip_shed_users.
-- Password is a placeholder (local test value); must_change_password=1 forces a
-- change on first login. Re-running never resets a password that has been changed:
-- the ON DUPLICATE KEY clause touches role, realm and office only.
-- Requires: div_role enum already carries both trip-shed roles (base file
-- sql/2026-08-31_trip_shed_vvh.sql) and all four sheds exist (sql/2026-10-18).

INSERT INTO users (username, password, role, full_name, realm, div_role, div_office_code, must_change_password)
VALUES
  ('vvhtsop',   '$2b$10$iEln6wCvrDeTlH2x5QkDbORzSm64ZSeu4M1tnHZreHAUoDI/xrJ7y', 'user', 'VVH Trip Shed Operator',    'division', 'trip_shed_operator',   'VVH',  1),
  ('vvhtssup',  '$2b$10$iEln6wCvrDeTlH2x5QkDbORzSm64ZSeu4M1tnHZreHAUoDI/xrJ7y', 'user', 'VVH Trip Shed Supervisor',  'division', 'trip_shed_supervisor', 'VVH',  1),
  ('csmttsop',  '$2b$10$iEln6wCvrDeTlH2x5QkDbORzSm64ZSeu4M1tnHZreHAUoDI/xrJ7y', 'user', 'CSMT Trip Shed Operator',   'division', 'trip_shed_operator',   'CSMT', 1),
  ('csmttssup', '$2b$10$iEln6wCvrDeTlH2x5QkDbORzSm64ZSeu4M1tnHZreHAUoDI/xrJ7y', 'user', 'CSMT Trip Shed Supervisor', 'division', 'trip_shed_supervisor', 'CSMT', 1),
  ('igptsop',   '$2b$10$iEln6wCvrDeTlH2x5QkDbORzSm64ZSeu4M1tnHZreHAUoDI/xrJ7y', 'user', 'IGP Trip Shed Operator',    'division', 'trip_shed_operator',   'IGP',  1),
  ('igptssup',  '$2b$10$iEln6wCvrDeTlH2x5QkDbORzSm64ZSeu4M1tnHZreHAUoDI/xrJ7y', 'user', 'IGP Trip Shed Supervisor',  'division', 'trip_shed_supervisor', 'IGP',  1),
  ('lnltsop',   '$2b$10$iEln6wCvrDeTlH2x5QkDbORzSm64ZSeu4M1tnHZreHAUoDI/xrJ7y', 'user', 'LNL Trip Shed Operator',    'division', 'trip_shed_operator',   'LNL',  1),
  ('lnltssup',  '$2b$10$iEln6wCvrDeTlH2x5QkDbORzSm64ZSeu4M1tnHZreHAUoDI/xrJ7y', 'user', 'LNL Trip Shed Supervisor',  'division', 'trip_shed_supervisor', 'LNL',  1)
ON DUPLICATE KEY UPDATE
  div_role = VALUES(div_role), realm = 'division', div_office_code = VALUES(div_office_code);

-- Map each account to its shed (shed code = div_office_code).
INSERT INTO div_trip_shed_users (user_id, shed_id, is_active, assigned_by)
SELECT u.id, s.id, 1, NULL
  FROM users u
  JOIN div_trip_sheds s ON s.shed_code = u.div_office_code
 WHERE u.realm = 'division'
   AND u.div_role IN ('trip_shed_operator', 'trip_shed_supervisor')
   AND u.username IN ('vvhtsop','vvhtssup','csmttsop','csmttssup','igptsop','igptssup','lnltsop','lnltssup')
ON DUPLICATE KEY UPDATE is_active = 1;

-- Rollback:
-- DELETE su FROM div_trip_shed_users su JOIN users u ON u.id = su.user_id
--  WHERE u.username IN ('vvhtsop','vvhtssup','csmttsop','csmttssup','igptsop','igptssup','lnltsop','lnltssup');
-- DELETE FROM users
--  WHERE username IN ('vvhtsop','vvhtssup','csmttsop','csmttssup','igptsop','igptssup','lnltsop','lnltssup');
