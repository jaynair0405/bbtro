-- Migration: Loco Availability Tracking
-- Date: 2026-05-20
-- Purpose: Track loco positions at Mumbai division terminals for DN train assignment

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1: Add from_station/to_station to div_trains for terminal detection
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE div_trains
    ADD COLUMN from_station VARCHAR(10) DEFAULT NULL COMMENT 'Division entry point (for UP trains) or departure terminal (for DN trains)',
    ADD COLUMN to_station VARCHAR(10) DEFAULT NULL COMMENT 'Division exit/terminal (for UP trains) or handover point (for DN trains)';

-- Index for terminal-based queries
ALTER TABLE div_trains ADD INDEX idx_to_station (to_station);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2: Create div_loco_positions - current position of each loco
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE div_loco_positions (
    loco_number VARCHAR(20) NOT NULL,
    current_location ENUM('CSMT', 'LTT', 'DR', 'PNVL', 'VVH', 'KYN', 'TNA', 'IN_TRANSIT', 'OUT_OF_DIV') NOT NULL,
    arrived_via_train VARCHAR(20) DEFAULT NULL COMMENT 'UP train that brought it (NULL if manual)',
    arrived_at DATETIME DEFAULT NULL COMMENT 'When it arrived at current location',
    departed_via_train VARCHAR(20) DEFAULT NULL COMMENT 'DN train it left on (for reference)',
    departed_at DATETIME DEFAULT NULL COMMENT 'When it departed (for reference)',
    remarks VARCHAR(255) DEFAULT NULL,
    updated_by VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (loco_number),
    INDEX idx_location (current_location),
    INDEX idx_arrived_at (arrived_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Current position of locos at Mumbai division terminals';

-- Note: No FK to div_locos — diesel locos entered by LPC may not be in master yet

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 3: Create div_loco_position_history - audit trail of all movements
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE div_loco_position_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loco_number VARCHAR(20) NOT NULL,
    from_location VARCHAR(20) DEFAULT NULL COMMENT 'Previous location (NULL for first entry)',
    to_location VARCHAR(20) NOT NULL COMMENT 'New location',
    movement_type ENUM('ARRIVAL', 'DEPARTURE', 'TRANSFER', 'MANUAL') NOT NULL,
    train_no VARCHAR(20) DEFAULT NULL COMMENT 'Associated train (if any)',
    working_date DATE DEFAULT NULL COMMENT 'Working date of the train movement',
    moved_at DATETIME NOT NULL COMMENT 'When the movement occurred',
    remarks VARCHAR(255) DEFAULT NULL,
    moved_by VARCHAR(100) DEFAULT NULL COMMENT 'User who recorded the movement',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_loco (loco_number),
    INDEX idx_moved_at (moved_at),
    INDEX idx_to_location (to_location),
    INDEX idx_train (train_no),
    INDEX idx_working_date (working_date),
    INDEX idx_movement_type (movement_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail of loco position changes';

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 4: Populate from_station/to_station for existing trains
-- ═══════════════════════════════════════════════════════════════════════════

-- UP trains: from_station = first stop (origin), to_station = last stop (terminal)
-- DN trains: from_station = first stop (terminal), to_station = last stop (handover)

-- Get terminals from div_train_stops for UP trains
UPDATE div_trains t
JOIN (
    SELECT train_no, station_code AS terminal
    FROM div_train_stops
    WHERE (train_no, seq_order) IN (
        SELECT train_no, MAX(seq_order)
        FROM div_train_stops
        GROUP BY train_no
    )
) stops ON t.train_no = stops.train_no
SET t.to_station = stops.terminal
WHERE t.direction = 'UP';

-- Get origin from div_train_stops for UP trains
UPDATE div_trains t
JOIN (
    SELECT train_no, station_code AS origin
    FROM div_train_stops
    WHERE (train_no, seq_order) IN (
        SELECT train_no, MIN(seq_order)
        FROM div_train_stops
        GROUP BY train_no
    )
) stops ON t.train_no = stops.train_no
SET t.from_station = stops.origin
WHERE t.direction = 'UP';

-- Get terminals from div_train_stops for DN trains
UPDATE div_trains t
JOIN (
    SELECT train_no, station_code AS terminal
    FROM div_train_stops
    WHERE (train_no, seq_order) IN (
        SELECT train_no, MIN(seq_order)
        FROM div_train_stops
        GROUP BY train_no
    )
) stops ON t.train_no = stops.train_no
SET t.from_station = stops.terminal
WHERE t.direction = 'DN';

-- Get handover point from div_train_stops for DN trains
UPDATE div_trains t
JOIN (
    SELECT train_no, station_code AS handover
    FROM div_train_stops
    WHERE (train_no, seq_order) IN (
        SELECT train_no, MAX(seq_order)
        FROM div_train_stops
        GROUP BY train_no
    )
) stops ON t.train_no = stops.train_no
SET t.to_station = stops.handover
WHERE t.direction = 'DN';

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 5: Seed initial positions from recent UP log entries (last 3 days)
-- ═══════════════════════════════════════════════════════════════════════════

-- This populates positions for locos that arrived via UP trains recently
-- Only inserts if loco is not already in div_loco_positions

INSERT IGNORE INTO div_loco_positions (loco_number, current_location, arrived_via_train, arrived_at, updated_by)
SELECT
    l.actual_loco_no,
    CASE
        WHEN t.to_station IN ('CSMT', 'LTT', 'DR', 'PNVL', 'VVH', 'KYN', 'TNA') THEN t.to_station
        ELSE 'OUT_OF_DIV'
    END AS current_location,
    l.train_no,
    CONCAT(l.working_date, ' ', IFNULL(m.event_time, '12:00:00')),
    'MIGRATION'
FROM div_loco_link_log l
JOIN div_loco_link_master m ON l.master_id = m.id
LEFT JOIN div_trains t ON l.train_no = t.train_no
WHERE l.direction = 'UP'
  AND l.actual_loco_no IS NOT NULL
  AND l.working_date >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
  AND NOT EXISTS (
      -- Exclude if this loco was later assigned to a DN train
      SELECT 1 FROM div_loco_link_log dn
      WHERE dn.actual_loco_no = l.actual_loco_no
        AND dn.direction = 'DN'
        AND dn.working_date >= l.working_date
  )
ORDER BY l.working_date DESC, l.id DESC;

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification queries (run manually to check)
-- ═══════════════════════════════════════════════════════════════════════════

-- Check div_trains from_station/to_station population:
-- SELECT train_no, direction, from_station, to_station FROM div_trains WHERE to_station IS NOT NULL LIMIT 20;

-- Check position counts by location:
-- SELECT current_location, COUNT(*) AS cnt FROM div_loco_positions GROUP BY current_location;

-- Show sample positions:
-- SELECT * FROM div_loco_positions ORDER BY arrived_at DESC LIMIT 10;
