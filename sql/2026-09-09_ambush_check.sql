-- ============================================================================
-- Ambush Check — the second block of the HQ daily-positions sheet
-- ============================================================================
--
-- An ambush check is an unannounced check on staff at work. A CLI does a
-- number of them in a day and reports HOW MANY STAFF THEY CHECKED against each
-- subject; the numbers are activity, not violations. HQ sums them by depot into
-- the same daily sheet the counselling block feeds.
--
-- This is a DAILY TALLY, not a register of people, which is why it looks
-- nothing like div_counselling_sessions. Names appear only in the second half:
-- when someone is caught, the CLI records who and what was found.
--
--   div_ambush_subjects    the eight, fixed. HQ confirmed the format has been
--                          unchanged for over a year, so unlike counselling
--                          subjects these are not user-managed -- but the table
--                          means they can become so without a schema change.
--   div_ambush_returns     one per CLI per day. Editable: a CLI who checks 20
--                          in the morning and 15 in the evening ends the day
--                          with one return saying 35.
--   div_ambush_counts      return x subject -> how many staff were checked
--   div_ambush_violations  who was caught, and what was found
--
-- `line` is ML or SUB, derived from the CLI's own lobby exactly as the
-- counselling staff picker derives its scope: a CSMT-SUB CLI is checking
-- motormen, a CSMT-ML CLI is not. It is STORED on the return rather than
-- resolved at read time, because a CLI who transfers must not retrospectively
-- move every return they ever filed to the other line.
--
-- The unique key is (return_date, cli_id), which does three jobs at once: it
-- enforces one return per CLI per day, it makes editing an upsert, and it makes
-- an offline replay harmless without any further machinery.
--
-- SAFE TO RE-RUN.
--   mysql -u jay -p4310jay bbtro < sql/2026-09-09_ambush_check.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS div_ambush_subjects (
  subject_id   INT NOT NULL AUTO_INCREMENT,
  subject_code VARCHAR(30)  NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (subject_id),
  UNIQUE KEY uniq_ambush_subject (subject_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO div_ambush_subjects (subject_code, subject_name, sort_order) VALUES
  ('GATE_AMBUSH', 'Gate Ambush',   1),
  ('MOBILE_OFF',  'Mobile Off',    2),
  ('BA_TEST',     'BA Test',       3),
  ('REV_MP_ON_N', 'REV / MP ON N', 4),
  ('VCD_WKG',     'VCD Working',   5),
  ('PF_ENTRY',    'PF Entry',      6),
  ('FIELD_ROUND', 'Field Round',   7),
  ('AWS',         'AWS',           8)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name), sort_order = VALUES(sort_order);

CREATE TABLE IF NOT EXISTS div_ambush_returns (
  return_id          INT NOT NULL AUTO_INCREMENT,
  return_date        DATE NOT NULL,
  cli_id             INT NOT NULL,
  office_code        VARCHAR(15) NOT NULL,
  line               ENUM('ML','SUB') NOT NULL,
  remarks            TEXT NULL,
  entered_by_user_id INT NULL,
  client_uuid        CHAR(36) NULL,
  created_at         TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (return_id),
  UNIQUE KEY uniq_ambush_day (return_date, cli_id),
  KEY idx_ambush_sheet (return_date, office_code, line),
  CONSTRAINT fk_amb_cli    FOREIGN KEY (cli_id)             REFERENCES div_cli_master (cli_id),
  CONSTRAINT fk_amb_office FOREIGN KEY (office_code)        REFERENCES offices (office_code),
  CONSTRAINT fk_amb_user   FOREIGN KEY (entered_by_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS div_ambush_counts (
  return_id  INT NOT NULL,
  subject_id INT NOT NULL,
  checked    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (return_id, subject_id),
  KEY idx_ambush_count_subject (subject_id),
  CONSTRAINT fk_ambc_return  FOREIGN KEY (return_id)  REFERENCES div_ambush_returns (return_id) ON DELETE CASCADE,
  CONSTRAINT fk_ambc_subject FOREIGN KEY (subject_id) REFERENCES div_ambush_subjects (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Any subject can catch someone: an ALP not doing the field round at a halt is
-- a Field Round violation, not only Mobile Off or BA Test. designation_id and
-- office_code are SNAPSHOTS, for the same reason the counselling attendees
-- carry them -- this is a disciplinary record and must read the same in a year.
CREATE TABLE IF NOT EXISTS div_ambush_violations (
  violation_id   INT NOT NULL AUTO_INCREMENT,
  return_id      INT NOT NULL,
  subject_id     INT NOT NULL,
  staff_hrms_id  VARCHAR(10) NOT NULL,
  designation_id INT NOT NULL,
  office_code    VARCHAR(15) NOT NULL,
  remarks        VARCHAR(500) NULL,
  created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (violation_id),
  UNIQUE KEY uniq_ambush_violation (return_id, subject_id, staff_hrms_id),
  KEY idx_ambv_staff (staff_hrms_id),
  CONSTRAINT fk_ambv_return  FOREIGN KEY (return_id)      REFERENCES div_ambush_returns (return_id) ON DELETE CASCADE,
  CONSTRAINT fk_ambv_subject FOREIGN KEY (subject_id)     REFERENCES div_ambush_subjects (subject_id),
  CONSTRAINT fk_ambv_staff   FOREIGN KEY (staff_hrms_id)  REFERENCES div_staff_master (hrms_id),
  CONSTRAINT fk_ambv_desig   FOREIGN KEY (designation_id) REFERENCES designations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT 'subjects' AS object, COUNT(*) AS n FROM div_ambush_subjects
UNION ALL SELECT 'returns',    COUNT(*) FROM div_ambush_returns
UNION ALL SELECT 'counts',     COUNT(*) FROM div_ambush_counts
UNION ALL SELECT 'violations', COUNT(*) FROM div_ambush_violations;

-- ROLLBACK
-- DROP TABLE IF EXISTS div_ambush_violations, div_ambush_counts,
--                      div_ambush_returns, div_ambush_subjects;
