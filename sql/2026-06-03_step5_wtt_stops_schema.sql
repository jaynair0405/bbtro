-- ═══════════════════════════════════════════════════════════════════════════
-- Architecture rebuild — STEP 5: WTT halts schema (recreate div_train_stops)
-- Date: 2026-06-03
--
-- div_train_stops was empty (0 rows) — safe to drop and recreate with the
-- new shape keyed on train_id and including event_type / day_offset /
-- segment_id / mumbai-segment markers.
--
-- Loader for the WTT CSV (your file: train_no, train_name, train_origin,
-- train_destination, station_code, station_name, arr_time, dep_time,
-- event_type) is written separately (step 5b) and resolves train_no →
-- train_id via div_train_aliases.
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS div_train_stops;

CREATE TABLE div_train_stops (
    id                          INT AUTO_INCREMENT PRIMARY KEY,
    train_id                    INT NOT NULL
        COMMENT 'Stable train identity (NOT train_no — that one can change)',
    seq_order                   INT NOT NULL
        COMMENT 'Order of stop along the route, starting at 1 at origin',
    station_code                VARCHAR(10) NOT NULL,
    arrival_time                TIME NULL
        COMMENT 'NULL at the train origin (no arrival)',
    departure_time              TIME NULL
        COMMENT 'NULL at the train destination (no departure)',
    event_type                  ENUM('halt','pass_or_depart') NOT NULL
        COMMENT 'halt = train stops here; pass_or_depart = transit or origin departure',
    day_offset                  TINYINT NOT NULL DEFAULT 0
        COMMENT 'Days since train origin (handles trains running past midnight or multi-day)',
    segment_id                  INT NULL
        COMMENT 'Optional link to the Mumbai segment that contains this stop',
    is_mumbai_segment_start     TINYINT(1) DEFAULT 0
        COMMENT '1 if this is where Mumbai division staff start working the train',
    is_mumbai_segment_end       TINYINT(1) DEFAULT 0
        COMMENT '1 if this is where Mumbai division staff hand over',
    platform_no                 VARCHAR(5) NULL,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_train_seq (train_id, seq_order),
    KEY idx_train (train_id),
    KEY idx_station (station_code),
    KEY idx_segment (segment_id),
    KEY idx_train_station (train_id, station_code),

    CONSTRAINT fk_stops_train
        FOREIGN KEY (train_id) REFERENCES div_trains(train_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_stops_station
        FOREIGN KEY (station_code) REFERENCES div_stations(station_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_stops_segment
        FOREIGN KEY (segment_id) REFERENCES div_train_segments(segment_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='WTT halts per train, keyed on stable train_id. Loaded from WTT CSV.';
