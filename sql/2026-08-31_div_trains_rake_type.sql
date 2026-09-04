-- Rake type belongs to the TRAIN, not to the loco working.
--
-- rake_type lived only on div_loco_link_master, i.e. on the loco-link row. That
-- works for loco-hauled stock (LHB, ICF, AMTB, LVPH) but not for a self-propelled
-- trainset: 20706 CSMT-J VANDE BHARAT has no loco, therefore no loco-link row,
-- therefore nowhere to record VNDB. Settings would answer "Sheet and Event Time
-- are required" — asking the user to invent a loco link for a train that has no
-- loco.
--
-- So the column moves up to div_trains. div_loco_link_master.rake_type stays and
-- keeps being written (the Loco Links and Specials tabs still edit it per-row,
-- and a train can legitimately run different stock on different sheets); the
-- train row is the fallback the sheet reads when the link has none.

ALTER TABLE div_trains
    ADD COLUMN rake_type varchar(20) NULL AFTER traction_type;

-- Seed the train-level value from the existing link rows, so nothing has to be
-- re-entered. Trains with links on several sheets that disagree are left NULL
-- rather than picking one arbitrarily — MIN() over a single distinct value is
-- that value; more than one and the HAVING drops it.
UPDATE div_trains t
  JOIN (
      SELECT train_no, MIN(rake_type) AS rt
        FROM div_loco_link_master
       WHERE rake_type IS NOT NULL AND rake_type <> '' AND active = 1
       GROUP BY train_no
      HAVING COUNT(DISTINCT rake_type) = 1
  ) m ON m.train_no = t.train_no
   SET t.rake_type = m.rt
 WHERE t.rake_type IS NULL;

-- Verify
SELECT rake_type, COUNT(*) AS trains FROM div_trains GROUP BY 1 ORDER BY 2 DESC;
