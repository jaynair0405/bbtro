-- ============================================================================
-- CLI PWA - Phase 1: SPAD Prevention Counselling
-- ============================================================================
--
-- WHY
-- ---
-- Today a lobby CLI counsels the staff available in the lobby, writes the names
-- in a paper register, photographs it, and WhatsApps the photo to HQ. The HQ CLI
-- counts heads off that image and types a number into a spreadsheet. Only the
-- count survives -- the names are thrown away, so nobody can answer "when was
-- this loco pilot last counselled?" or "who is overdue?".
--
-- These tables hold the names. The division consolidated sheet (depot x
-- designation, exactly as the officers see it today) then DERIVES itself from
-- them, and coverage tracking becomes possible for the first time.
--
-- The module is deliberately TOPIC-GENERIC. SPAD is the first topic; later
-- counselling drives reuse these tables instead of growing a parallel set.
--
-- SAFE TO RE-RUN. Every statement is idempotent.
--
-- Apply:  mysql -u jay -p4310jay bbtro < sql/2026-09-01_cli_pwa_counselling.sql
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Topic master
-- ----------------------------------------------------------------------------
-- cycle_days is the "counsel everyone at least this often" setting that drives
-- the Pending list in the PWA. NULL means the topic is recorded but not chased.
CREATE TABLE IF NOT EXISTS div_counselling_topics (
  topic_id    INT NOT NULL AUTO_INCREMENT,
  topic_code  VARCHAR(30)  NOT NULL,
  topic_name  VARCHAR(120) NOT NULL,
  cycle_days  INT          NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (topic_id),
  UNIQUE KEY uniq_topic_code (topic_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO div_counselling_topics (topic_code, topic_name, cycle_days, is_active, sort_order)
VALUES ('SPAD', 'Signal Vigilance & SPAD Awareness', 90, 1, 1)
ON DUPLICATE KEY UPDATE topic_name = VALUES(topic_name);


-- ----------------------------------------------------------------------------
-- 2. Sessions -- one row per register page
-- ----------------------------------------------------------------------------
-- client_uuid is generated on the phone BEFORE the POST. It is what makes an
-- offline outbox replay a no-op: the server upserts on it, so a session that is
-- flushed twice lands once. Without it a flaky network turns into duplicate
-- counts on the officers' sheet.
--
-- cli_id is WHO COUNSELLED; entered_by_user_id is WHO TYPED IT IN. They differ
-- when a CLI records a session on behalf of a colleague.
CREATE TABLE IF NOT EXISTS div_counselling_sessions (
  session_id          INT NOT NULL AUTO_INCREMENT,
  client_uuid         CHAR(36)     NOT NULL,
  session_date        DATE         NOT NULL,
  topic_id            INT          NOT NULL,
  cli_id              INT          NOT NULL,
  office_code         VARCHAR(15)  NOT NULL,
  subject             VARCHAR(255) NULL,
  venue               VARCHAR(100) NULL,
  remarks             TEXT         NULL,
  register_photo_path VARCHAR(255) NULL,
  entered_by_user_id  INT          NULL,
  created_at          TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (session_id),
  UNIQUE KEY uniq_counselling_client_uuid (client_uuid),
  KEY idx_counselling_sheet (session_date, topic_id, office_code),
  KEY idx_counselling_cli (cli_id, session_date),
  CONSTRAINT fk_cns_topic  FOREIGN KEY (topic_id)           REFERENCES div_counselling_topics (topic_id),
  CONSTRAINT fk_cns_cli    FOREIGN KEY (cli_id)             REFERENCES div_cli_master (cli_id),
  CONSTRAINT fk_cns_office FOREIGN KEY (office_code)        REFERENCES offices (office_code),
  CONSTRAINT fk_cns_user   FOREIGN KEY (entered_by_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ----------------------------------------------------------------------------
-- 3. Attendees
-- ----------------------------------------------------------------------------
-- designation_id and office_code are SNAPSHOTS taken at the moment of
-- counselling, not joins to div_staff_master. The consolidated sheet is a
-- historical record placed before officers: if a motorman is promoted or
-- transferred next month, last month's printed sheet must not silently change
-- underneath it.
CREATE TABLE IF NOT EXISTS div_counselling_attendees (
  attendee_id    INT NOT NULL AUTO_INCREMENT,
  session_id     INT          NOT NULL,
  staff_hrms_id  VARCHAR(10)  NOT NULL,
  designation_id INT          NOT NULL,
  office_code    VARCHAR(15)  NOT NULL,
  remarks        VARCHAR(500) NULL,
  created_at     TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attendee_id),
  UNIQUE KEY uniq_session_staff (session_id, staff_hrms_id),
  KEY idx_cna_staff (staff_hrms_id),
  KEY idx_cna_rollup (office_code, designation_id),
  CONSTRAINT fk_cna_session FOREIGN KEY (session_id)     REFERENCES div_counselling_sessions (session_id) ON DELETE CASCADE,
  CONSTRAINT fk_cna_staff   FOREIGN KEY (staff_hrms_id)  REFERENCES div_staff_master (hrms_id),
  CONSTRAINT fk_cna_desig   FOREIGN KEY (designation_id) REFERENCES designations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ----------------------------------------------------------------------------
-- 4. Locks -- HQ freezes a (date, topic, lobby) once it is presented
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_counselling_locks (
  lock_date         DATE        NOT NULL,
  topic_id          INT         NOT NULL,
  office_code       VARCHAR(15) NOT NULL,
  locked_by_user_id INT         NULL,
  locked_at         TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP,
  note              VARCHAR(255) NULL,
  PRIMARY KEY (lock_date, topic_id, office_code),
  CONSTRAINT fk_cnl_topic FOREIGN KEY (topic_id)          REFERENCES div_counselling_topics (topic_id),
  CONSTRAINT fk_cnl_user  FOREIGN KEY (locked_by_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ----------------------------------------------------------------------------
-- 5. Audit -- who changed what, since HQ may correct a lobby's entry
-- ----------------------------------------------------------------------------
-- actor_label is denormalised on purpose: an audit row must still read
-- correctly years later even if the user account is renamed or deleted.
CREATE TABLE IF NOT EXISTS div_counselling_audit (
  audit_id      INT NOT NULL AUTO_INCREMENT,
  session_id    INT          NULL,
  action        VARCHAR(30)  NOT NULL,
  actor_user_id INT          NULL,
  actor_label   VARCHAR(120) NULL,
  detail        JSON         NULL,
  created_at    TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (audit_id),
  KEY idx_cnaud_session (session_id),
  KEY idx_cnaud_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- No FK to sessions: a delete audit must outlive the row it describes.


-- ----------------------------------------------------------------------------
-- 6. users -- the 'cli' role, the login -> CLI link, and first-login password
-- ----------------------------------------------------------------------------
-- 'cli' is the ~145 (soon ~175) lobby CLIs. Confined in server.js to /cli*
-- exactly the way 'clicms' is confined to /clicms.
ALTER TABLE users
  MODIFY div_role ENUM(
    'division_admin','office_hr','trgcentre_admin','lpc','ctlc','clicms',
    'ctlc_view','ssehq','trip_shed_operator','trip_shed_supervisor','cli'
  ) DEFAULT NULL;

-- users.cli_id, not a join table: div_signal_sighting_cli_users set the
-- precedent for tying a login to a cli_id, but putting it on users means every
-- future CLI-facing module gets the link for free. That table is left as is.
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'cli_id');
SET @s := IF(@c = 0, 'ALTER TABLE users ADD COLUMN cli_id INT NULL AFTER div_office_code', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @c := (SELECT COUNT(*) FROM information_schema.STATISTICS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_cli_id');
SET @s := IF(@c = 0, 'ALTER TABLE users ADD KEY idx_users_cli_id (cli_id)', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @c := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND CONSTRAINT_NAME = 'fk_users_cli');
SET @s := IF(@c = 0,
  'ALTER TABLE users ADD CONSTRAINT fk_users_cli FOREIGN KEY (cli_id) REFERENCES div_cli_master (cli_id)',
  'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- Bulk-generated CLI accounts start on a system-issued password and must
-- replace it before they can use the app.
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'must_change_password');
SET @s := IF(@c = 0,
  'ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0',
  'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;


-- ----------------------------------------------------------------------------
-- ROLLBACK
-- ----------------------------------------------------------------------------
-- DROP TABLE IF EXISTS div_counselling_audit, div_counselling_locks,
--                      div_counselling_attendees, div_counselling_sessions,
--                      div_counselling_topics;
-- ALTER TABLE users DROP FOREIGN KEY fk_users_cli, DROP COLUMN cli_id,
--                   DROP COLUMN must_change_password;
-- (leave the div_role enum alone unless no 'cli' rows remain)
