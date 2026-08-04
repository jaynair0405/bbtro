-- =====================================================================
-- Relief markers: free-text remarks -> structured columns.
--
-- R/T = "Relief To"   : THIS detail gives relief to that detail, i.e. our
--                       crew takes over at the leg's START station.
-- R/B = "Relieved By" : that detail takes over from us, at the leg's END.
-- They are reciprocal — if A has R/T B on a train, B carries R/B A.
-- Confirmed against the data: 13 of the 19 existing R/T markers already
-- have their matching R/B.
--
-- WHY COLUMNS
-- 1. The rule "only a working train has R/T or R/B" cannot be enforced on
--    free text. As columns it is a CHECK constraint, so a relief marker on
--    a piloting leg is rejected outright and cannot drift back in.
--    (A piloting crew are passengers travelling to work a train — they
--    relieve nobody.)
-- 2. The relief graph becomes a join instead of a regex over prose. That is
--    the report that has been blocked on this.
-- 3. Only one R/T and one R/B can exist per leg — inherent in single columns.
-- Operational text (TO SDG, EX SDG, HALT ..., LPC WTG ...) stays in remarks.
--
-- No "where" column is needed: R/T applies at the leg's start_station and
-- R/B at its end_station.
-- =====================================================================

START TRANSACTION;

-- --------------------------------------------------- 1. columns + integrity
-- detail_number is unique across all 767 details, so it can carry a FK.
ALTER TABLE details
  ADD UNIQUE KEY uq_details_detail_number (detail_number);

ALTER TABLE trains
  ADD COLUMN rt_detail VARCHAR(20) NULL
      COMMENT 'R/T Relief To: this detail relieves that one, at start_station',
  ADD COLUMN rb_detail VARCHAR(20) NULL
      COMMENT 'R/B Relieved By: that detail relieves this one, at end_station';

-- ------------------------------------------------------------ 2. backfill
UPDATE trains
   SET rt_detail = NULLIF(REPLACE(REGEXP_SUBSTR(remarks,'R/T [0-9]+'),'R/T ',''),''),
       rb_detail = NULLIF(REPLACE(REGEXP_SUBSTR(remarks,'R/B [0-9]+'),'R/B ',''),'')
 WHERE remarks REGEXP 'R/(T|B) [0-9]+';
-- expect: 36 legs (19 R/T + 18 R/B; one leg carries both)

-- ------------------------------- 3. move relief off the 9 piloting legs
-- Each of these pilot legs drops the crew at a station and the very next leg
-- is a WORKING leg departing that same station with no marker of its own —
-- so the R/T describes the relief on that working leg, not on the ride there.
-- Verified individually; listed explicitly rather than derived, because
-- ordering legs by clock time is unreliable across midnight.
UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
   SET t.rt_detail='551' WHERE d.detail_number='454' AND t.train_number='UBR7';
UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
   SET t.rt_detail='490' WHERE d.detail_number='466' AND t.train_number='UNU15';
UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
   SET t.rt_detail='467' WHERE d.detail_number='479' AND t.train_number='UBR9';
UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
   SET t.rt_detail='454' WHERE d.detail_number='490' AND t.train_number='UBR15';
UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
   SET t.rt_detail='553' WHERE d.detail_number='504' AND t.train_number='UNU3';
UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
   SET t.rt_detail='553' WHERE d.detail_number='522' AND t.train_number='UNU9';
UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
   SET t.rt_detail='479' WHERE d.detail_number='547' AND t.train_number='UNU13';
UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
   SET t.rt_detail='522' WHERE d.detail_number='548' AND t.train_number='UBR17';
UPDATE trains t JOIN details d ON d.detail_id=t.detail_id
   SET t.rt_detail='547' WHERE d.detail_number='552' AND t.train_number='UBR19';

-- clear them from the piloting legs they were wrongly recorded on
UPDATE trains SET rt_detail=NULL, rb_detail=NULL WHERE train_type <> 'working';

-- ------------------------------------------------- 4. clean the remarks
-- strip the parsed markers, keep the operational text, collapse whitespace
UPDATE trains
   SET remarks = NULLIF(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(remarks,'R/[TB] [0-9]+',''),'[[:space:]]+',' ')),'')
 WHERE remarks REGEXP 'R/(T|B) [0-9]+';

-- --------------------------------------------------- 5. enforce the rules
-- A relief marker must point at a real detail...
ALTER TABLE trains
  ADD CONSTRAINT fk_trains_rt_detail FOREIGN KEY (rt_detail) REFERENCES details(detail_number)
      ON UPDATE CASCADE ON DELETE SET NULL,
  ADD CONSTRAINT fk_trains_rb_detail FOREIGN KEY (rb_detail) REFERENCES details(detail_number)
      ON UPDATE CASCADE ON DELETE SET NULL;

COMMIT;

-- ...and can only exist on a working leg.
-- NOTE: this cannot be a CHECK constraint. MySQL rejects
--   ERROR 3823: Column 'rb_detail' cannot be used in a check constraint:
--               needed in a foreign key constraint referential action
-- because the FKs above carry ON UPDATE CASCADE. That cascade is worth
-- keeping — details do get renumbered here (see the July 552/553 renumber) —
-- so the rule is enforced by trigger instead. Same guarantee: every write
-- path is covered, and unlike the waiting-normalisation triggers this one
-- REJECTS rather than silently corrects, because a relief marker on a
-- piloting leg means the entry is wrong, not merely untidy.
DROP TRIGGER IF EXISTS trg_trains_relief_working_ins;
DROP TRIGGER IF EXISTS trg_trains_relief_working_upd;

DELIMITER $$
CREATE TRIGGER trg_trains_relief_working_ins BEFORE INSERT ON trains
FOR EACH ROW
BEGIN
  IF NEW.train_type <> 'working'
     AND (NEW.rt_detail IS NOT NULL OR NEW.rb_detail IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'R/T and R/B are only valid on a working leg - a piloting crew travels as passengers and relieves nobody';
  END IF;
END$$

CREATE TRIGGER trg_trains_relief_working_upd BEFORE UPDATE ON trains
FOR EACH ROW
BEGIN
  IF NEW.train_type <> 'working'
     AND (NEW.rt_detail IS NOT NULL OR NEW.rb_detail IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'R/T and R/B are only valid on a working leg - a piloting crew travels as passengers and relieves nobody';
  END IF;
END$$
DELIMITER ;

-- -------------------------------------------------------------- verify
SELECT 'markers migrated (want 19 R/T on working legs, 18 R/B, 0 elsewhere)' AS check_;
SELECT train_type,
       SUM(rt_detail IS NOT NULL) AS rt_n,
       SUM(rb_detail IS NOT NULL) AS rb_n
  FROM trains GROUP BY train_type;

SELECT 'remarks that still mention a relief marker (want 0)' AS check_;
SELECT COUNT(*) AS leftover FROM trains WHERE remarks REGEXP 'R/(T|B) [0-9]+';

SELECT 'the six revised details, after migration' AS check_;
SELECT d.detail_number AS det, t.train_number, t.train_type,
       t.rt_detail AS r_t, t.rb_detail AS r_b, t.remarks
  FROM trains t JOIN details d ON d.detail_id=t.detail_id
 WHERE d.detail_number IN ('304','343','363','371','382','402')
 ORDER BY CAST(d.detail_number AS UNSIGNED), t.start_time;

-- =====================================================================
-- ROLLBACK
--   ALTER TABLE trains DROP CONSTRAINT chk_relief_only_on_working;
--   ALTER TABLE trains DROP FOREIGN KEY fk_trains_rt_detail,
--                      DROP FOREIGN KEY fk_trains_rb_detail;
--   ALTER TABLE trains DROP COLUMN rt_detail, DROP COLUMN rb_detail;
--   ALTER TABLE details DROP KEY uq_details_detail_number;
--   (remarks are not restored — re-run the backfill in reverse if needed)
-- =====================================================================
