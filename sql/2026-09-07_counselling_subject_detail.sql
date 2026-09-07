-- ============================================================================
-- Counselling subjects: a labelled detail box, and an "Other" subject
-- ============================================================================
--
-- Two things HQ raised after using the checkboxes.
--
-- 1. A CLI often counsels on more than one Sr DEE instruction at a sitting,
--    and wanted to record "10/11" or "10 & 11". The column already allows it --
--    it is VARCHAR(30) free text, not an integer -- but the field said "No."
--    and looked like it wanted a single number. That is an affordance problem,
--    fixed by labelling it properly.
--
-- 2. Sometimes the subject is none of the listed ones. There was no way to say
--    so short of HQ adding a subject for a one-off.
--
-- Both are the same shape: the box beside a subject is not always a number, so
-- it stops pretending to be one.
--
--   detail_label  what to call the box. NULL means the subject needs no box.
--   detail_join   how the detail joins the name in the line the officers read:
--                 "Sr DEE Instruction-10/11"  vs  "Other: Loco failure drill".
--
-- needs_number stays as the "this subject requires its detail" flag. The name
-- is now narrower than what it means; detail_label is what says what to ask for.
--
-- SAFE TO RE-RUN.
--   mysql -u railway_user -p bbtro < sql/2026-09-07_counselling_subject_detail.sql
-- ============================================================================

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_counselling_subjects'
              AND COLUMN_NAME = 'detail_label');
SET @s := IF(@c = 0,
  'ALTER TABLE div_counselling_subjects ADD COLUMN detail_label VARCHAR(60) NULL AFTER needs_number',
  'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_counselling_subjects'
              AND COLUMN_NAME = 'detail_join');
SET @s := IF(@c = 0,
  "ALTER TABLE div_counselling_subjects ADD COLUMN detail_join VARCHAR(4) NOT NULL DEFAULT '-' AFTER detail_label",
  'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- Everything that already asked for a number now says what it wants. The label
-- is the box's placeholder, so it stays short; the form's hint carries the
-- "more than one is fine" guidance where there is room for it.
UPDATE div_counselling_subjects
   SET detail_label = 'Instruction / circular no.'
 WHERE needs_number = 1 AND (detail_label IS NULL OR detail_label = '')
   AND subject_code <> 'OTHER';

-- The escape hatch: a subject that is whatever the CLI types.
INSERT INTO div_counselling_subjects
  (topic_id, subject_code, subject_name, needs_number, detail_label, detail_join, sort_order)
SELECT t.topic_id, 'OTHER', 'Other', 1, 'What was counselled', ': ', 99
FROM div_counselling_topics t
WHERE t.topic_code = 'SPAD'
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name),
                        detail_label = VALUES(detail_label),
                        detail_join  = VALUES(detail_join),
                        sort_order   = VALUES(sort_order);

SELECT subject_id, subject_code, subject_name, needs_number, detail_label, detail_join, sort_order, is_active
FROM div_counselling_subjects ORDER BY sort_order;

-- ROLLBACK
-- DELETE FROM div_counselling_subjects WHERE subject_code = 'OTHER';
-- ALTER TABLE div_counselling_subjects DROP COLUMN detail_label, DROP COLUMN detail_join;
