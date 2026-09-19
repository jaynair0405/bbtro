-- ============================================================
-- div_training_records: record WHICH course earned the record
-- Date: 2026-09-19
-- ============================================================
--
-- div_training_types.training_id 26 is 'Mman Promotion/Refresher Course' —
-- one legacy type covering two different courses. The new model splits them
-- (MM_PROMOTION, MM_REFRESHER) and both correctly renew the same target, so
-- the due date is right either way. What is lost is WHICH course the man
-- actually attended: biodata shows the same "Promotion/Refresher" line for
-- someone who sat the 48-day promotion and someone who sat the 18-day
-- refresher.
--
-- The legacy type ids are NOT split. 808 MMPRC records already exist and most
-- cannot be attributed to one course or the other, so splitting would orphan
-- them. Instead this adds provenance alongside, exactly as
-- docs/TRAINING_CENTRE_REQUIREMENTS.md §7 describes: keep div_training_records
-- as the compatibility surface, add the source course.
--
-- Additive and nullable. Historical rows stay NULL and read as they do today;
-- only completions confirmed through the training centre workflow set it.
-- Nothing that reads this table needs to change to keep working.
-- ============================================================

ALTER TABLE div_training_records
  ADD COLUMN source_course_id INT NULL
    COMMENT 'Course actually attended, where known. NULL for records predating the training centre workflow.'
    AFTER training_id,
  ADD KEY idx_training_records_source_course (source_course_id),
  ADD CONSTRAINT fk_training_records_source_course
    FOREIGN KEY (source_course_id) REFERENCES div_training_courses (course_id);

-- Backfill what can be attributed with certainty: records this workflow
-- created, linked through the completion renewal that produced them.
UPDATE div_training_records r
  JOIN div_training_completion_renewals cr ON cr.legacy_record_id = r.record_id
  JOIN div_training_completion_events e ON e.completion_id = cr.completion_id
  JOIN div_training_attempts a ON a.attempt_id = e.attempt_id
  JOIN div_training_course_rules cru ON cru.rule_id = a.rule_id
   SET r.source_course_id = cru.course_id
 WHERE r.source_course_id IS NULL;

-- ============================================================
-- Verify
-- ============================================================
-- SELECT COUNT(*) AS attributed FROM div_training_records WHERE source_course_id IS NOT NULL;
-- SELECT c.course_name, COUNT(*) FROM div_training_records r
--   JOIN div_training_courses c ON c.course_id = r.source_course_id GROUP BY c.course_name;

-- ============================================================
-- Rollback
-- ============================================================
-- ALTER TABLE div_training_records
--   DROP FOREIGN KEY fk_training_records_source_course,
--   DROP KEY idx_training_records_source_course,
--   DROP COLUMN source_course_id;
