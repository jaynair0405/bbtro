-- New HQ CLI (Diesel) user: clidslhqbb
-- Cloned from clihqmlbb (id 25); only username, full_name, and password differ.
-- Password: clidsl@tro03  (stored as bcrypt below; user should change it after first login)
-- NOTE: already applied on production (via Workbench) — this file is a deploy record.

INSERT INTO users
  (username, password, role, full_name, office, realm, div_role, div_office_code,
   training_center_id, can_access_rtis, can_access_sub_spm)
VALUES
  ('clidslhqbb',
   '$2b$10$fvRZFeaKrGVrXfdZEdkfSeMW7Uo395RtN1QlHHmIg6DNScCtw1pJC',
   'admin', 'CLI DSL HQ BB TRO', NULL, 'division', 'division_admin', 'CSMT-HQ',
   NULL, 1, 0);
