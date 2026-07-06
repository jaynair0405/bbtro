-- New view-only Control Office role + the SSE HQ account (ssehq).
--
-- ctlc_view = "same pages as ctlc, read-only". It may OPEN every Control Office
-- page (incl. the Consolidated Sheet) and READ all /api/division/loco-link data,
-- but is blocked from every mutation (router-level guard in locoLinkRoutes.js).
-- Edit UI is hidden on the frontend (tiles/toolbars gate on division_admin/ctlc).
--
-- Requires the matching code (server.js, routes/authRoutes.js,
-- routes/division/locoLinkRoutes.js, public/control-office/index.html) to be
-- deployed together — these live on feature/loco-link.
--
-- Password: ssehq@tro06  (stored as bcrypt below; user should change after first login)

ALTER TABLE users
  MODIFY div_role ENUM(
    'division_admin','office_hr','trgcentre_admin','lpc','ctlc','clicms','ctlc_view'
  ) NULL;

INSERT INTO users
  (username, password, role, full_name, office, realm, div_role, div_office_code,
   training_center_id, can_access_rtis, can_access_sub_spm)
VALUES
  ('ssehq',
   '$2b$10$6yA3HLcDUr718aw.hXzGzONvIGg4PT23UWmbPdct3n3FlEszSynRa',
   'user', 'SSE HQ BB TRO', NULL, 'division', 'ctlc_view', 'CO-BB',
   NULL, 0, 0);
