-- CLI CMS lobby page: lobby uploads + remarks (docs/superpowers/specs/2026-10-16-lobby-cms-design.md).
-- Additive only. Rollback at the bottom.

-- 1. New division role for lobby CMS users (reused later for other division pages).
ALTER TABLE users
  MODIFY div_role ENUM('division_admin','office_hr','trgcentre_admin','lpc','ctlc','clicms',
                       'ctlc_view','ssehq','trip_shed_operator','trip_shed_supervisor','cli','jrcc') NULL;

-- 2. Loads: NULL = HQ's load (every row so far); a lobby's upload names its lobby.
ALTER TABLE cms_daily_loads
  ADD COLUMN lobby VARCHAR(20) NULL AFTER report_key,
  DROP INDEX idx_cdl_report_date,
  ADD INDEX idx_cdl_report_date (report_key, data_date, lobby, is_current);

-- 3. Crew rows: who listed this crew.
ALTER TABLE cms_daily_crew
  ADD COLUMN source ENUM('hq','lobby') NOT NULL DEFAULT 'hq' AFTER lobby;

-- 4. Remarks: one row per version; edit = new current row, old retired; empty = withdrawn.
CREATE TABLE IF NOT EXISTS cms_lobby_remarks (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_key  VARCHAR(30)  NOT NULL,
  lobby       VARCHAR(20)  NOT NULL,
  cms_id      VARCHAR(15)  NOT NULL,
  item_key    VARCHAR(60)  NOT NULL,   -- names the event: '<test>|<due>', TA number, sign-on datetime…
  remark      TEXT         NOT NULL,
  written_by  VARCHAR(50)  NOT NULL,
  written_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_current  TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_clr_item (report_key, lobby, cms_id, item_key, is_current),
  KEY idx_clr_crew (cms_id, is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Ten lobby accounts (srcc naming). Initial password <username>@troNN (NN random,
-- given to the user out of band); must_change_password forces a change on first login.
INSERT INTO users (username, password, role, full_name, realm, div_role, div_office_code, must_change_password)
VALUES
  ('csmtmljrcc', '$2b$10$/kOKw.IPz9sa3wCY/abCFOPaKL4ysmuVV4qjtwulUbBf/zF8ZioSy', 'user', 'CSMT Main Office JRCC', 'division', 'jrcc', 'CSMT-ML', 1),
  ('kynmljrcc', '$2b$10$cDniA3VW1i9O9T04YWHUDOZcPhLrGaYQorSF1X/etFHH5UXuXnR92', 'user', 'KYN Main Office JRCC', 'division', 'jrcc', 'KYN-ML', 1),
  ('pnvlmljrcc', '$2b$10$PLntW4bBL9E9.JdSq33O2udo2uTjMngdSGswUnZisZMo33TrOO/dK', 'user', 'PNVL Main Office JRCC', 'division', 'jrcc', 'PNVL-ML', 1),
  ('igpjrcc', '$2b$10$XYm.gmhf2dTNEMoL5MJbdexH5ujw5KEEA1UF5crGtISsmmmbhzGwS', 'user', 'Igatpuri Office JRCC', 'division', 'jrcc', 'IGP', 1),
  ('lnljrcc', '$2b$10$8J8s3XdUxkEqW38wdvkJD.KHSbWXitL97sE/9MfawZnz8FZYyubX.', 'user', 'Lonavala Office JRCC', 'division', 'jrcc', 'LNL', 1),
  ('vvhmljrcc', '$2b$10$VNGfO/ZIkaQY.Izv.XMJLe80KZQl/q1mjUUvfhJ5Gy5SnFgXIH1La', 'user', 'VVH ML JRCC', 'division', 'jrcc', 'VVH', 1),
  ('nrljrcc', '$2b$10$Yb1XSseA2pGyoP3oZK1JLOkYrSb4ggTdYuIpgfo3qu.0z5vmdc9HO', 'user', 'Neral Office JRCC', 'division', 'jrcc', 'NRL', 1),
  ('csmtsubjrcc', '$2b$10$feEZ6VzjiVoWI2PrkspNb.sO6e32h4CJaF0HFUzQJzr1g/U3NyY5O', 'user', 'CSMT Sub Office JRCC', 'division', 'jrcc', 'CSMT-SUB', 1),
  ('kynsubjrcc', '$2b$10$l4nl9LnvcQrunUucAzmcuuterZhha5F6QvH4GS5NXjPfY/kDz/ZNa', 'user', 'KYN Sub Office JRCC', 'division', 'jrcc', 'KYN-SUB', 1),
  ('pnvlsubjrcc', '$2b$10$JT2v.GNEQGAguMtzNT/Ar.M2RFqFsUiUExGl/mNLZEMzWNKnUgeEW', 'user', 'PNVL Sub Office JRCC', 'division', 'jrcc', 'PNVL-SUB', 1)
ON DUPLICATE KEY UPDATE div_role = 'jrcc', realm = 'division', div_office_code = VALUES(div_office_code);

-- Rollback:
-- DROP TABLE cms_lobby_remarks;
-- ALTER TABLE cms_daily_crew DROP COLUMN source;
-- ALTER TABLE cms_daily_loads DROP INDEX idx_cdl_report_date, DROP COLUMN lobby,
--   ADD INDEX idx_cdl_report_date (report_key, data_date, is_current);
-- DELETE FROM users WHERE username LIKE '%jrcc';
-- (div_role enum: leave 'jrcc' in place; removing it fails while any user has it)
