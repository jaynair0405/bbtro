-- CLI-CMS (HQ-CLI CMS Due List) access
-- 1) Add a dedicated 'clicms' div_role (the /clicms gate allows 'clicms' + 'division_admin').
-- 2) Seed the HQ-CLI user.
--
-- Password: the login route accepts a legacy plaintext password and auto-upgrades it
-- to bcrypt on first login. Replace __SET_A_PASSWORD__ below with the initial password
-- BEFORE running, then have the user change it via the change-password screen.

ALTER TABLE users
  MODIFY div_role ENUM(
    'division_admin','office_hr','trgcentre_admin','lpc','ctlc','clicms'
  ) NULL;

INSERT INTO users (username, password, role, full_name, realm, div_role, div_office_code)
VALUES ('clicms', '__SET_A_PASSWORD__', 'user', 'HQ CLI (CMS Due List)', 'division', 'clicms', 'CSMT-HQ');
