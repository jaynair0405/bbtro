-- ============================================================================
-- The officers' sheet heading: "SPAD Prevention Counselling"
-- ============================================================================
--
-- topic_name is what the app calls the thing everywhere it names it: the hero
-- on a CLI's home screen, the heading on the consolidated sheet, the printed
-- version of that sheet, and the title row of the XLSX export. The interface
-- was renamed to SPAD Prevention Counselling; this is the last place still
-- reading "Signal Vigilance & SPAD Awareness", and it is the one officers see.
--
-- The SUBJECT of the same name is deliberately left alone. That is the standing
-- tick-box a CLI selects, not the name of the exercise, and sessions already
-- recorded name it -- renaming it would rewrite what past sessions say they
-- were about.
--
-- topic_code stays 'SPAD'. It is the key the application looks the topic up by.
--
-- SAFE TO RE-RUN.
--   mysql -u railway_user -p bbtro < sql/2026-09-07_topic_name_spad_prevention.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS bak_20260907_topic_name AS
SELECT topic_id, topic_code, topic_name FROM div_counselling_topics;

UPDATE div_counselling_topics
   SET topic_name = 'SPAD Prevention Counselling'
 WHERE topic_code = 'SPAD';

SELECT topic_id, topic_code, topic_name, cycle_days, is_active
FROM div_counselling_topics;

SELECT 'subjects, deliberately unchanged' AS note, subject_id, subject_name
FROM div_counselling_subjects ORDER BY sort_order;

-- ROLLBACK
-- UPDATE div_counselling_topics t JOIN bak_20260907_topic_name b ON b.topic_id = t.topic_id
--    SET t.topic_name = b.topic_name;
