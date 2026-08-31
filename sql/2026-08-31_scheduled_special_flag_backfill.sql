-- Control office: make special trains manageable from Settings → Specials.
--
-- Problem
-- -------
-- Settings → Specials only lists div_loco_link_master rows with
-- is_scheduled_special = 1, and NOT ONE row carried the flag (428 rows, all 0).
-- So its Close / Extend / Skip buttons — the only UI that writes the
-- effective_from/until window the daily sheet honours — could not reach any
-- train. Deactivating a special in Settings → Trains flipped
-- div_trains.is_active, which the sheet never reads, so trains that had stopped
-- running (02187/02188, 01079/01080) stayed on the sheet.
--
-- What counts as a special
-- ------------------------
-- IR numbers specials with a leading 0. That is the primary test; the
-- div_trains.train_type = 'Special' classification is unioned in so a special
-- carrying a regular-looking number (e.g. 13380) is not missed.
--
-- Idempotent: only flips rows still at 0. Sets no dates — flagging a row does
-- not change what the sheet renders today (effective_from/until stay NULL =
-- always active); it only makes the row visible and closable in the Specials
-- tab.

UPDATE div_loco_link_master m
LEFT JOIN div_trains t ON t.train_no = m.train_no
   SET m.is_scheduled_special = 1
 WHERE m.is_scheduled_special = 0
   AND (m.train_no LIKE '0%' OR t.train_type = 'Special');

-- Verify
SELECT is_scheduled_special, COUNT(*) AS rows_ FROM div_loco_link_master GROUP BY 1;
