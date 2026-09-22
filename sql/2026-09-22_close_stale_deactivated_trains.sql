-- 2026-09-22 — close the workings of trains deactivated before the fix landed
--
-- THE SHAPE OF THE PROBLEM
-- The sheet does NOT read div_trains.is_active. It reads div_loco_link_master:
-- active = 1 and the date inside effective_from..effective_until. Deactivating
-- a train in Settings has written that end date since 2026-08-31 (b579db8), but
-- only at the moment it is clicked. A train deactivated BEFORE that date had its
-- registry flag flipped and nothing else, so its working is still open-ended and
-- the sheet keeps showing it — forever, since these are all DAILY or weekly.
--
-- The code is already correct and deployed. This is the leftover data, and it is
-- exactly what the button would have written had it existed at the time.
--
-- WHAT IS AND IS NOT INCLUDED
-- 18 deactivated trains still appear on sheets. Only 10 are wrong:
--
--   FIXED (no end date at all):
--     01079 01080 01139 01140 01143 01144 09057 09058 09625 09626
--
--   LEFT ALONE (end date set, still in the future — working as designed; the
--   LPC gave a last running date and the sheet is honouring it):
--     01129 -> 22-Sep   01130 -> 23-Sep   01171 -> 27-Sep   01172 -> 28-Sep
--     04103/04104 -> 19-Nov            05585/05586 -> 29-Nov
--
-- Note 01043 and 01044 are deactivated and have NO working at all, so they are
-- on no sheet; and 02187/02188 are not in div_trains at all. Neither needs
-- anything, despite being reported.
--
-- WHICH DATE TO CLOSE ON
-- Not a flat "yesterday". Each row closes on the last date a loco was ACTUALLY
-- logged against it, falling back to yesterday when none ever was. Closing
-- earlier than a real entry would hide a day that has data on it — the sheet is
-- a record of what happened, and history must still render.

SET @fallback := CURDATE() - INTERVAL 1 DAY;

-- Step 1 — preview: what each row will be closed on, and why.
SELECT m.train_no, m.sheet_source, m.run_days,
       (SELECT MAX(l.working_date) FROM div_loco_link_log l
         WHERE l.master_id = m.id AND l.actual_loco_no IS NOT NULL AND l.actual_loco_no <> ''
       ) AS last_loco_logged,
       COALESCE(
         (SELECT MAX(l.working_date) FROM div_loco_link_log l
           WHERE l.master_id = m.id AND l.actual_loco_no IS NOT NULL AND l.actual_loco_no <> ''),
         @fallback) AS will_close_on
FROM div_loco_link_master m
JOIN div_trains t ON t.train_no = m.train_no AND t.is_active = 0
WHERE m.active = 1 AND m.effective_until IS NULL
ORDER BY m.train_no;

-- Step 2 — close them.
UPDATE div_loco_link_master m
JOIN div_trains t ON t.train_no = m.train_no AND t.is_active = 0
SET m.effective_until = COALESCE(
      (SELECT MAX(l.working_date) FROM div_loco_link_log l
        WHERE l.master_id = m.id AND l.actual_loco_no IS NOT NULL AND l.actual_loco_no <> ''),
      @fallback)
WHERE m.active = 1 AND m.effective_until IS NULL;

-- Step 3 — verify. The first count should be 0. The second should list only the
-- eight with deliberate future end dates.
SELECT COUNT(*) AS still_open_ended
FROM div_loco_link_master m
JOIN div_trains t ON t.train_no = m.train_no AND t.is_active = 0
WHERE m.active = 1 AND m.effective_until IS NULL;

SELECT m.train_no, m.sheet_source, m.effective_until
FROM div_loco_link_master m
JOIN div_trains t ON t.train_no = m.train_no AND t.is_active = 0
WHERE m.active = 1 AND m.effective_until >= CURDATE()
ORDER BY m.effective_until, m.train_no;

-- Rollback (only the rows this closed, identified by having no log after the date):
-- UPDATE div_loco_link_master m JOIN div_trains t ON t.train_no = m.train_no AND t.is_active = 0
--   SET m.effective_until = NULL
--  WHERE m.train_no IN ('01079','01080','01139','01140','01143','01144','09057','09058','09625','09626');
