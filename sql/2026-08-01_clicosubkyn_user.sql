-- New user: clicosubkyn — CLI Coordination, Suburban KYN.
--
-- Scope: division realm, no admin/office privileges (div_role NULL, so login
-- lands on /div). Needs exactly two tools:
--   * AWS Defect Analysis (/div/aws.html)  — open to any division-realm user
--   * Suburban SPM Analysis (/spm/sub-spm) — gated on can_access_sub_spm
-- RTIS access is explicitly withheld (can_access_rtis = 0).
--
-- Password: clicosub@trobb01  (stored as bcrypt below; user should change it
-- after first login)

INSERT INTO users
  (username, password, role, full_name, office, realm, div_role, div_office_code,
   training_center_id, can_access_rtis, can_access_sub_spm)
VALUES
  ('clicosubkyn',
   '$2b$10$y6u0rRa1TPYkaWJzNGaM6uJ1I3.v2ghzS.pu.xlo/HQfQXpFtBDnO',
   'user', 'CLI COORDINATION SUB KYN', NULL, 'division', NULL, 'KYN-SUB',
   NULL, 0, 1);
