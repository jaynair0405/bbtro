-- ============================================================
-- Which section a motorman is cleared to work
-- Date: 2026-09-21
-- ============================================================
--
-- A newly promoted motorman is passed for Harbour only — MTC's own result
-- letter says "suitable to work as Motorman only on HB section". Main Line
-- comes later, through the 5-day Harbour-to-Main-Line conversion course. The
-- database had nowhere to say which a man is cleared for, so a roster clerk
-- could not answer "may he work a Main Line service?".
--
-- This is an EXCEPTION LIST, not an attribute of every employee. Absence of a
-- row means Main Line, the legacy default: a motorman who has worked ML for
-- fifteen years has no conversion-course record, because he never needed one,
-- so clearance cannot be derived from training history alone.
--
-- Kept out of div_staff_master deliberately. Clearance is true of roughly a
-- fifth of staff, it carries its own history, and the staff master is read by
-- everything.
-- ============================================================

CREATE TABLE IF NOT EXISTS div_staff_line_clearance (
  hrms_id             VARCHAR(10) NOT NULL,
  clearance           ENUM('HB','ML') NOT NULL,
  effective_from      DATE NOT NULL,
  source_completion_id BIGINT UNSIGNED NULL
                      COMMENT 'Training centre completion that granted it. NULL for seeded rows.',
  remarks             VARCHAR(255) NULL,
  updated_by          VARCHAR(100) NOT NULL,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (hrms_id),
  KEY idx_line_clearance (clearance),
  CONSTRAINT fk_line_clearance_staff
    FOREIGN KEY (hrms_id) REFERENCES div_staff_master (hrms_id),
  CONSTRAINT fk_line_clearance_completion
    FOREIGN KEY (source_completion_id) REFERENCES div_training_completion_events (completion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Seeding (run when the HB list arrives — NOT part of this migration)
-- ============================================================
-- INSERT INTO div_staff_line_clearance (hrms_id, clearance, effective_from, updated_by, remarks)
-- SELECT s.hrms_id, 'HB', CURDATE(), 'seed:2026-09-21', 'Initial HB list from MTC CLA'
--   FROM div_staff_master s WHERE s.hrms_id IN (...);
--
-- Everyone not listed is Main Line. Do NOT insert ML rows for them; absence is
-- the default, and filling it in would claim knowledge the list does not give.

-- ============================================================
-- Verify
-- ============================================================
-- SELECT clearance, COUNT(*) FROM div_staff_line_clearance GROUP BY clearance;

-- ============================================================
-- Rollback
-- ============================================================
-- DROP TABLE div_staff_line_clearance;
