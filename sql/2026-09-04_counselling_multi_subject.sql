-- ============================================================================
-- Counselling: several subjects in one session, and subjects HQ can add
-- ============================================================================
--
-- WHY
-- ---
-- HQ, after using the app: a session is often counselled on more than one
-- subject, and today that means recording the same staff two or three times --
-- once per subject. They also asked what happens when a new subject comes
-- along, which the old design could not answer: the four options were a
-- hardcoded array in counsellingRoutes.js, so a new circular type meant a code
-- change and a deploy.
--
-- So subjects become rows, and a session can carry several.
--
--   div_counselling_subjects          the list HQ maintains
--   div_counselling_session_subjects  which subjects a session covered,
--                                     with the instruction number where one
--                                     applies
--
-- div_counselling_sessions.subject is KEPT, and is now a rendering: the chosen
-- subjects joined into one readable line, written at save time. The join table
-- is the queryable truth; the column exists so the officers' sheet, its
-- drill-down and the XLSX export keep reading one string. It can be rebuilt
-- from the join table at any time.
--
-- NOT a topic. div_counselling_topics stays what it was -- the thing that
-- carries cycle_days and drives "who is due". Subjects sit inside a topic:
-- counselling someone on Signal Vigilance or on a Sr DEE Instruction both count
-- as SPAD counselling for coverage. Conflating the two would mean a staff
-- member counselled on a safety circular reads as up to date on SPAD.
--
-- Existing sessions keep their subject text and gain no join rows. They are
-- history; nothing reads the join table for them.
--
-- SAFE TO RE-RUN.
--   mysql -u jay -p4310jay bbtro < sql/2026-09-04_counselling_multi_subject.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS div_counselling_subjects (
  subject_id   INT NOT NULL AUTO_INCREMENT,
  topic_id     INT          NOT NULL,
  subject_code VARCHAR(30)  NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  -- Sr DEE Instruction, CEE OP Instruction and Safety Circular are meaningless
  -- without their number, so the app makes it compulsory when this is set.
  needs_number TINYINT(1)   NOT NULL DEFAULT 0,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order   INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (subject_id),
  UNIQUE KEY uniq_subject_code (topic_id, subject_code),
  CONSTRAINT fk_cns_subj_topic FOREIGN KEY (topic_id) REFERENCES div_counselling_topics (topic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO div_counselling_subjects (topic_id, subject_code, subject_name, needs_number, sort_order)
SELECT t.topic_id, x.code, x.name, x.needs_no, x.ord
FROM div_counselling_topics t
JOIN (
  SELECT 'SIGNAL_VIGILANCE' AS code, 'Signal Vigilance and SPAD Awareness' AS name, 0 AS needs_no, 1 AS ord
  UNION ALL SELECT 'SR_DEE',          'Sr DEE Instruction',   1, 2
  UNION ALL SELECT 'CEE_OP',          'CEE OP Instruction',   1, 3
  UNION ALL SELECT 'SAFETY_CIRCULAR', 'Safety Circular',      1, 4
) x
WHERE t.topic_code = 'SPAD'
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name),
                        needs_number = VALUES(needs_number),
                        sort_order   = VALUES(sort_order);

CREATE TABLE IF NOT EXISTS div_counselling_session_subjects (
  session_id INT         NOT NULL,
  subject_id INT         NOT NULL,
  -- "14" in "Sr DEE Instruction-14". Free text: numbers in the field are not
  -- always digits.
  number     VARCHAR(30) NULL,
  PRIMARY KEY (session_id, subject_id),
  KEY idx_css_subject (subject_id),
  CONSTRAINT fk_css_session FOREIGN KEY (session_id) REFERENCES div_counselling_sessions (session_id) ON DELETE CASCADE,
  CONSTRAINT fk_css_subject FOREIGN KEY (subject_id) REFERENCES div_counselling_subjects (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT 'subjects seeded' AS check_name, COUNT(*) AS n FROM div_counselling_subjects
UNION ALL SELECT 'sessions with subject text (history, untouched)', COUNT(*)
  FROM div_counselling_sessions WHERE subject IS NOT NULL AND subject <> '';

-- ROLLBACK
-- DROP TABLE IF EXISTS div_counselling_session_subjects;
-- DROP TABLE IF EXISTS div_counselling_subjects;
