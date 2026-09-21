-- ============================================================
-- The centre's examination result letter
-- Date: 2026-09-21
-- ============================================================
--
-- MTC issues a letter to Sr.DEE (TRS-O) listing a batch, its marks and the
-- remark against each trainee — today typed by hand. Everything in it except
-- three things is already in the database: the written exam date, the viva
-- date, and the sentence naming what the men are found suitable for, whose
-- rake list varies by batch.
--
-- Those three are stored per batch so a reprint gives the same document. The
-- rest is read live, so a name corrected in the trainee register shows
-- corrected — the letter is a report of the record, not a second copy of it.
-- ============================================================

CREATE TABLE IF NOT EXISTS div_training_result_letters (
  result_letter_id    INT AUTO_INCREMENT PRIMARY KEY,
  training_center_id  INT NOT NULL,
  calendar_id         INT NULL COMMENT 'Batch this letter reports. One of calendar_id / letter_id is set.',
  letter_id           INT NULL COMMENT 'For a course run without a planned batch.',
  letter_no           VARCHAR(60) NOT NULL,
  letter_date         DATE NOT NULL,
  exam_date           DATE NULL,
  viva_date           DATE NULL,
  body_text           TEXT NULL COMMENT 'The "found suitable to work as..." sentence; rake list varies by batch.',
  addressee           VARCHAR(255) NULL,
  copy_to             VARCHAR(255) NULL,
  updated_by          VARCHAR(100) NOT NULL,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_result_letter_batch (calendar_id),
  UNIQUE KEY uq_result_letter_letter (letter_id),
  CONSTRAINT fk_result_letter_centre
    FOREIGN KEY (training_center_id) REFERENCES div_training_centers (center_id),
  CONSTRAINT fk_result_letter_batch
    FOREIGN KEY (calendar_id) REFERENCES div_training_calendar (id),
  CONSTRAINT fk_result_letter_letter
    FOREIGN KEY (letter_id) REFERENCES div_training_letters (id),
  CONSTRAINT ck_result_letter_target
    CHECK ((calendar_id IS NULL) <> (letter_id IS NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Verify
-- ============================================================
-- SELECT * FROM div_training_result_letters;

-- ============================================================
-- Rollback
-- ============================================================
-- DROP TABLE div_training_result_letters;
