-- ═══════════════════════════════════════════════════════════════════════════
-- Architecture rebuild — STEP 3 of N
-- Date: 2026-06-03
--
-- Adds train_id columns (NULLable, with FK to div_trains.train_id) to all
-- downstream tables, and backfills via div_train_aliases so the lookup is
-- alias-aware (old train numbers in historical rows still resolve to the
-- correct train_id).
--
-- Tables and their train_no-bearing columns:
--   div_loco_link_master         train_no       → train_id
--   div_loco_link_log            train_no       → train_id  (+ train_no_snapshot copy)
--   div_loco_sick_records        sick_train_no  → train_id
--                                hoc_train_no   → hoc_train_id
--   div_loco_defects             train_no       → train_id
--   div_loco_positions           arrived_via_train   → arrived_via_train_id
--                                departed_via_train  → departed_via_train_id
--   div_loco_position_history    train_no       → train_id
--
-- Notes:
--   - All new columns are nullable; FK can fail to resolve if the source
--     field contains non-train text (e.g. sick_train_no='TKD/JNPT' typed in
--     error). Those rows simply get NULL train_id.
--   - Original train_no/sick_train_no/etc columns are PRESERVED as display
--     snapshots. They will be retired later in the cleanup phase, only
--     after the application has been updated to read via train_id.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 3a. div_loco_link_master ────────────────────────────────────────────────
ALTER TABLE div_loco_link_master
    ADD COLUMN train_id INT NULL AFTER train_no,
    ADD INDEX idx_train_id (train_id);

UPDATE div_loco_link_master m
JOIN div_train_aliases a ON a.train_no = m.train_no
SET m.train_id = a.train_id;

ALTER TABLE div_loco_link_master
    ADD CONSTRAINT fk_master_train
        FOREIGN KEY (train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- ── 3b. div_loco_link_log ───────────────────────────────────────────────────
-- Snapshot the original train_no so historical entries always render under
-- the number LPC actually used that day, even if the train is later renamed.
ALTER TABLE div_loco_link_log
    ADD COLUMN train_id INT NULL AFTER train_no,
    ADD COLUMN train_no_snapshot VARCHAR(10) NULL AFTER train_id,
    ADD INDEX idx_train_id (train_id);

UPDATE div_loco_link_log l
JOIN div_train_aliases a ON a.train_no = l.train_no
SET l.train_id = a.train_id,
    l.train_no_snapshot = l.train_no;

ALTER TABLE div_loco_link_log
    ADD CONSTRAINT fk_log_train
        FOREIGN KEY (train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- ── 3c. div_loco_sick_records ───────────────────────────────────────────────
-- Two train_no fields: sick_train_no (the train the loco failed on) and
-- hoc_train_no (the train it was attached as Halt-On-Cancellation).
-- Either may be non-train text in legacy data — NULL train_id is fine then.
ALTER TABLE div_loco_sick_records
    ADD COLUMN train_id INT NULL AFTER sick_train_no,
    ADD COLUMN hoc_train_id INT NULL AFTER hoc_train_no,
    ADD INDEX idx_train_id (train_id),
    ADD INDEX idx_hoc_train_id (hoc_train_id);

UPDATE div_loco_sick_records s
JOIN div_train_aliases a ON a.train_no = s.sick_train_no
SET s.train_id = a.train_id;

UPDATE div_loco_sick_records s
JOIN div_train_aliases a ON a.train_no = s.hoc_train_no
SET s.hoc_train_id = a.train_id;

ALTER TABLE div_loco_sick_records
    ADD CONSTRAINT fk_sick_train
        FOREIGN KEY (train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    ADD CONSTRAINT fk_sick_hoc_train
        FOREIGN KEY (hoc_train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- ── 3d. div_loco_defects ────────────────────────────────────────────────────
ALTER TABLE div_loco_defects
    ADD COLUMN train_id INT NULL AFTER train_no,
    ADD INDEX idx_train_id (train_id);

UPDATE div_loco_defects d
JOIN div_train_aliases a ON a.train_no = d.train_no
SET d.train_id = a.train_id;

ALTER TABLE div_loco_defects
    ADD CONSTRAINT fk_defect_train
        FOREIGN KEY (train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- ── 3e. div_loco_positions ──────────────────────────────────────────────────
-- Two train_no fields: arrived_via_train and departed_via_train. Each gets
-- a sibling train_id column.
ALTER TABLE div_loco_positions
    ADD COLUMN arrived_via_train_id INT NULL AFTER arrived_via_train,
    ADD COLUMN departed_via_train_id INT NULL AFTER departed_via_train,
    ADD INDEX idx_arrived_train_id (arrived_via_train_id),
    ADD INDEX idx_departed_train_id (departed_via_train_id);

UPDATE div_loco_positions p
JOIN div_train_aliases a ON a.train_no = p.arrived_via_train
SET p.arrived_via_train_id = a.train_id;

UPDATE div_loco_positions p
JOIN div_train_aliases a ON a.train_no = p.departed_via_train
SET p.departed_via_train_id = a.train_id;

ALTER TABLE div_loco_positions
    ADD CONSTRAINT fk_pos_arrived_train
        FOREIGN KEY (arrived_via_train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    ADD CONSTRAINT fk_pos_departed_train
        FOREIGN KEY (departed_via_train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- ── 3f. div_loco_position_history ───────────────────────────────────────────
ALTER TABLE div_loco_position_history
    ADD COLUMN train_id INT NULL AFTER train_no,
    ADD INDEX idx_train_id (train_id);

UPDATE div_loco_position_history h
JOIN div_train_aliases a ON a.train_no = h.train_no
SET h.train_id = a.train_id;

ALTER TABLE div_loco_position_history
    ADD CONSTRAINT fk_pos_hist_train
        FOREIGN KEY (train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification queries (run separately)
-- ═══════════════════════════════════════════════════════════════════════════
-- master coverage:    SELECT SUM(train_id IS NULL)/COUNT(*) AS pct_null FROM div_loco_link_master;
-- log coverage:       SELECT SUM(train_id IS NULL)/COUNT(*) AS pct_null FROM div_loco_link_log WHERE train_no IS NOT NULL;
-- sick coverage:      SELECT SUM(train_id IS NULL)/COUNT(*) AS pct_null FROM div_loco_sick_records WHERE sick_train_no IS NOT NULL;
-- defect coverage:    SELECT SUM(train_id IS NULL)/COUNT(*) AS pct_null FROM div_loco_defects WHERE train_no IS NOT NULL;
-- Expected: 0 nulls (or only the 'TKD/JNPT' row on sick)
