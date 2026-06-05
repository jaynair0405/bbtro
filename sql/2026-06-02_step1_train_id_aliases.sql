-- ═══════════════════════════════════════════════════════════════════════════
-- Architecture rebuild — STEP 1 of N
-- Date: 2026-06-02
--
-- Adds a stable surrogate train_id to div_trains and rebuilds the alias table
-- with the new shape (train_id, train_no, valid_from, valid_until). After this
-- migration, every current train has an alias row marking its currently-valid
-- number, and the 6 historical renumbers (from May 2026) are represented as
-- old-number rows with valid_until = renamed_date.
--
-- NOTE: train_no remains the PRIMARY KEY on div_trains for now. We promote
-- train_id to PK only in the final cleanup step, after all dependent tables
-- have been migrated to reference train_id.
--
-- This migration is purely additive at the data level — no functional code
-- change yet. Existing queries continue to work against train_no.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1a. Surrogate key on div_trains ─────────────────────────────────────────
ALTER TABLE div_trains
    ADD COLUMN train_id INT AUTO_INCREMENT UNIQUE FIRST;
-- MySQL auto-assigns sequential ids to existing rows.

-- ── 1b. Back up the old aliases shape so we can replay if needed ────────────
DROP TABLE IF EXISTS div_train_aliases_v1_backup;
RENAME TABLE div_train_aliases TO div_train_aliases_v1_backup;

-- ── 1c. New aliases table ───────────────────────────────────────────────────
CREATE TABLE div_train_aliases (
    train_id    INT         NOT NULL,
    train_no    VARCHAR(10) NOT NULL,
    valid_from  DATE        NULL
        COMMENT 'NULL = always/unknown (no prior rename info)',
    valid_until DATE        NULL
        COMMENT 'NULL = currently valid for this train',
    PRIMARY KEY (train_id, train_no),
    KEY idx_train_no (train_no),
    KEY idx_current  (train_no, valid_until),
    CONSTRAINT fk_alias_train
        FOREIGN KEY (train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Every train_no this train has ever run under. Use idx_current with valid_until IS NULL to find the currently-valid number for a train_id, or look up train_id from any train_no via idx_train_no.';

-- ── 1d. Seed: every current train_no becomes an alias row ───────────────────
-- For trains that were renumbered (present in the v1 backup as new_train_no),
-- valid_from is the renamed_date so we know exactly when the current number
-- took effect. For everyone else, valid_from = NULL.
INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until)
SELECT
    t.train_id,
    t.train_no,
    (SELECT MAX(b.renamed_date)
       FROM div_train_aliases_v1_backup b
      WHERE b.new_train_no = t.train_no)         AS valid_from,
    NULL                                          AS valid_until
FROM div_trains t;

-- ── 1e. Seed: historical (old) train_no entries from the v1 backup ──────────
-- Each backup row (old_train_no, new_train_no, renamed_date) becomes an
-- alias row for the OLD number, with valid_until = renamed_date.
INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until)
SELECT
    t.train_id,
    b.old_train_no,
    NULL,
    b.renamed_date
FROM div_train_aliases_v1_backup b
JOIN div_trains t ON t.train_no = b.new_train_no;

-- ── Verification queries (run manually after migration) ─────────────────────
-- SELECT COUNT(*) FROM div_trains WHERE train_id IS NULL;     -- expect 0
-- SELECT COUNT(*) FROM div_train_aliases;                     -- expect ~421+6
-- SELECT COUNT(*) FROM div_train_aliases WHERE valid_until IS NULL; -- = COUNT(div_trains)
-- SELECT * FROM div_train_aliases WHERE train_no IN ('12519','15659'); -- both → same train_id
-- SELECT * FROM div_train_aliases WHERE train_no IN ('16505','20685');
