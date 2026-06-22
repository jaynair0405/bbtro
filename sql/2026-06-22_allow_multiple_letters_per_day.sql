-- Allow multiple nomination / category-change letters per day
-- Date: 2026-06-22
-- Description:
--   Previously div_cli_nomination_letters and div_category_change_letters each had a
--   UNIQUE KEY (letter_date, staff_type). Combined with the upsert logic in the save
--   routes, this meant a second letter prepared on the same day for the same staff_type
--   silently merged ("clubbed") into the first letter instead of saving as its own.
--   More than one letter may legitimately be prepared in a day, so the unique key is
--   dropped. The save routes are changed to always INSERT a new letter row.

-- 1. CLI nomination letters
ALTER TABLE div_cli_nomination_letters DROP INDEX uk_letter_date_type;

-- 2. Category change letters
ALTER TABLE div_category_change_letters DROP INDEX uk_letter_date_type;
