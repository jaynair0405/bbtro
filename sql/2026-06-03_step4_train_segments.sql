-- ═══════════════════════════════════════════════════════════════════════════
-- Architecture rebuild — STEP 4 of N
-- Date: 2026-06-03
--
-- Creates div_train_segments — Mumbai's operational view of a train.
-- A train can have multiple segments when Mumbai works multiple legs of it
-- (e.g. 22149/22150 with PNVL loco-change). One segment per div_loco_link_master
-- row in the initial backfill — that mirrors the existing data.
--
-- Adds segment_id to div_loco_link_master and div_loco_link_log so future
-- queries can navigate train ↔ segment ↔ master ↔ log cleanly.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 4a. CREATE div_train_segments ───────────────────────────────────────────
CREATE TABLE div_train_segments (
    segment_id              INT AUTO_INCREMENT PRIMARY KEY,
    train_id                INT NOT NULL,
    segment_label           VARCHAR(30) NULL
        COMMENT 'e.g. "KR-leg", "SE-leg", or sheet_source as a default label',
    segment_direction       ENUM('UP','DN','BYPASS') NULL,
    staff_from_station      VARCHAR(10) NULL
        COMMENT 'Where Mumbai staff start working this segment',
    staff_to_station        VARCHAR(10) NULL
        COMMENT 'Where Mumbai staff hand off',
    loco_takeover_station   VARCHAR(10) NULL
        COMMENT 'Where loco link event happens (LNL/IGP/ROHA/PNVL etc.)',
    loco_handover_station   VARCHAR(10) NULL
        COMMENT 'Where loco is handed off; usually the terminal for UP, NULL for DN',
    event_time_takeover     VARCHAR(30) NULL
        COMMENT 'HH:MM at the takeover station (varchar for now; TIME later)',
    event_time_handover     VARCHAR(30) NULL
        COMMENT 'For halt-and-handover bypass trains',
    halts_at_takeover       TINYINT(1) NULL
        COMMENT '1=halts, 0=passes through, NULL=N/A (replaces bypass_halts)',
    sheet_source            VARCHAR(30) NULL
        COMMENT 'Mirrors div_loco_link_master.sheet_source for queries',
    section_label           VARCHAR(20) NULL
        COMMENT 'NE/SE/KR/BYPASS for grouping',
    is_active               TINYINT(1) DEFAULT 1,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_train (train_id),
    KEY idx_sheet (sheet_source),
    KEY idx_active (is_active),
    CONSTRAINT fk_segment_train
        FOREIGN KEY (train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Mumbai operational segments per train. Multi-leg bypass+loco-change trains have one segment per leg.';

-- ── 4b. Backfill div_train_segments from div_loco_link_master ──────────────
-- One segment per master row. The staff-beat endpoints come from div_trains
-- (the per-train staff segment), and the loco-event info comes from master.
INSERT INTO div_train_segments
    (train_id, segment_label, segment_direction, sheet_source, section_label,
     staff_from_station, staff_to_station,
     loco_takeover_station, event_time_takeover, halts_at_takeover, is_active)
SELECT
    m.train_id,
    m.sheet_source                                AS segment_label,
    m.direction                                   AS segment_direction,
    m.sheet_source,
    m.section                                     AS section_label,
    t.from_station                                AS staff_from_station,
    t.to_station                                  AS staff_to_station,
    -- IMPORTANT: only translate the four known staff-beat values
    -- (PUNE/MMR/JL/RN) that historically got placed in from_station by
    -- mistake. Everything else is trusted as-is — it might already be a
    -- valid takeover boundary (LNL/IGP/ROHA/PNVL/...) or a bypass station
    -- code (PA, KARD, etc.). See LOCO_LINK_ARCHITECTURE_REVIEW.md §1.5.
    CASE m.from_station
        WHEN 'PUNE' THEN 'LNL'
        WHEN 'MMR'  THEN 'IGP'
        WHEN 'JL'   THEN 'IGP'
        WHEN 'RN'   THEN 'ROHA'
        ELSE m.from_station
    END                                           AS loco_takeover_station,
    m.event_time                                  AS event_time_takeover,
    m.bypass_halts                                AS halts_at_takeover,
    m.active                                      AS is_active
FROM div_loco_link_master m
JOIN div_trains t ON t.train_id = m.train_id;

-- ── 4c. Add segment_id to div_loco_link_master + backfill + FK ─────────────
ALTER TABLE div_loco_link_master
    ADD COLUMN segment_id INT NULL AFTER train_id,
    ADD INDEX idx_segment_id (segment_id);

-- Match each master row to the segment we just created (1:1 via train_id +
-- sheet_source + direction + event_time which should be unique together)
UPDATE div_loco_link_master m
JOIN div_train_segments s
  ON s.train_id          = m.train_id
 AND s.sheet_source      <=> m.sheet_source
 AND s.segment_direction <=> m.direction
 AND s.event_time_takeover <=> m.event_time
SET m.segment_id = s.segment_id;

ALTER TABLE div_loco_link_master
    ADD CONSTRAINT fk_master_segment
        FOREIGN KEY (segment_id) REFERENCES div_train_segments(segment_id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- ── 4d. Add segment_id to div_loco_link_log + backfill (where master-linked)
-- For master-linked log rows, segment_id = master.segment_id (via master_id).
-- Inline specials (master_id IS NULL) get NULL segment_id — they're not tied
-- to a registered segment.
ALTER TABLE div_loco_link_log
    ADD COLUMN segment_id INT NULL AFTER train_id,
    ADD INDEX idx_segment_id (segment_id);

UPDATE div_loco_link_log l
JOIN div_loco_link_master m ON m.id = l.master_id
SET l.segment_id = m.segment_id;

ALTER TABLE div_loco_link_log
    ADD CONSTRAINT fk_log_segment
        FOREIGN KEY (segment_id) REFERENCES div_train_segments(segment_id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification (run separately)
-- ═══════════════════════════════════════════════════════════════════════════
-- SELECT COUNT(*) AS segment_count FROM div_train_segments;
-- SELECT COUNT(*) AS master_with_segment FROM div_loco_link_master WHERE segment_id IS NOT NULL;
-- SELECT COUNT(*) AS master_total       FROM div_loco_link_master;
-- (expect master_with_segment == master_total)
-- SELECT COUNT(*) AS log_with_master, SUM(segment_id IS NOT NULL) AS log_segmented
--   FROM div_loco_link_log WHERE master_id IS NOT NULL;
-- (expect equal)
-- SELECT * FROM div_train_segments WHERE train_id IN
--   (SELECT train_id FROM div_trains WHERE train_no IN ('22149','22150'))
--   ORDER BY train_id, sheet_source;
-- (expect 2 segments per train, one for each leg)
