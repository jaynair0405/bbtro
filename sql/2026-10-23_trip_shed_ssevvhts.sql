-- TS-041: VVH Trip Shed in-charge account (SSE). trip_shed_supervisor = read/write on every
-- shed page, approves imports, finalizes inspections. Password set by the user and kept
-- (must_change_password=0); this file holds only its bcrypt hash. Re-running never resets it.
INSERT INTO users (username, password, role, full_name, realm, div_role, div_office_code, must_change_password)
VALUES ('ssevvhts', '$2b$10$dCRVTyWb7KsngYu6EWrA0OHd4W.GP0AWO.wjnz1dz.JRN/qdggRzS', 'user', 'SSE VVH Trip Shed (in-charge)', 'division', 'trip_shed_supervisor', 'VVH', 0)
ON DUPLICATE KEY UPDATE div_role = 'trip_shed_supervisor', realm = 'division', div_office_code = 'VVH';

INSERT INTO div_trip_shed_users (user_id, shed_id, is_active, assigned_by)
SELECT u.id, s.id, 1, NULL FROM users u JOIN div_trip_sheds s ON s.shed_code = 'VVH'
 WHERE u.username = 'ssevvhts' AND u.realm = 'division'
ON DUPLICATE KEY UPDATE is_active = 1;

-- Rollback:
-- DELETE su FROM div_trip_shed_users su JOIN users u ON u.id = su.user_id WHERE u.username = 'ssevvhts';
-- DELETE FROM users WHERE username = 'ssevvhts';
