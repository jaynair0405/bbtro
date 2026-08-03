-- Suburban rest analysis — persisted runs
--
-- Each upload of CMS "Sign On/Off Detail Report" files produces one run row and one
-- findings row per reported pair. Findings store COMPUTED minutes rather than pointers
-- into `details`, because details get retimed (e.g. the PNVL 451-557 retiming) and an
-- old run must keep rendering the figures that produced it. The thresholds in force are
-- stored per run for the same reason.

CREATE TABLE IF NOT EXISTS suburban_rest_runs (
  id                          INT AUTO_INCREMENT PRIMARY KEY,
  uploaded_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  uploaded_by                 VARCHAR(60) DEFAULT NULL,
  file_count                  INT NOT NULL DEFAULT 0,
  file_names                  TEXT,
  period_from                 DATETIME DEFAULT NULL,   -- union of the file windows
  period_to                   DATETIME DEFAULT NULL,
  coverage_gaps               TEXT,                    -- JSON [{from,to}] — windows NOT covered
  floor_minutes               INT NOT NULL DEFAULT 300,
  extra_duty_max_gap_minutes  INT NOT NULL DEFAULT 240,
  duty_rows                   INT NOT NULL DEFAULT 0,
  crew_count                  INT NOT NULL DEFAULT 0,
  unpaired_crew               INT NOT NULL DEFAULT 0,
  double_pairs                INT NOT NULL DEFAULT 0,
  extra_duty_pairs            INT NOT NULL DEFAULT 0,
  ordinary_rests              INT NOT NULL DEFAULT 0,
  warnings                    TEXT,
  KEY idx_srr_period (period_from, period_to),
  KEY idx_srr_uploaded (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS suburban_rest_findings (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  run_id                INT NOT NULL,
  report                ENUM('double','extra') NOT NULL,
  office                VARCHAR(10) DEFAULT NULL,       -- from the crew-id prefix, not the file lobby
  crew_id               VARCHAR(20) NOT NULL,
  crew_name             VARCHAR(120) DEFAULT NULL,
  det1                  VARCHAR(20) NOT NULL,
  det1_line             VARCHAR(20) DEFAULT NULL,
  det1_on               DATETIME NOT NULL,
  det1_off              DATETIME NOT NULL,
  det2                  VARCHAR(20) NOT NULL,
  det2_line             VARCHAR(20) DEFAULT NULL,
  det2_on               DATETIME NOT NULL,
  det2_off              DATETIME NOT NULL,
  booked_rest_minutes   INT DEFAULT NULL,               -- doubles only
  actual_rest_minutes   INT NOT NULL,
  shortfall_minutes     INT DEFAULT NULL,               -- booked - actual; positive = rest lost
  span_minutes          INT DEFAULT NULL,               -- first sign-on to second sign-off
  chaining_incomplete   TINYINT(1) NOT NULL DEFAULT 0,  -- a triple with no cycle_anchor, not a true extra duty
  severity              ENUM('red','amber','ok') NOT NULL DEFAULT 'ok',
  UNIQUE KEY uq_srf_pair (run_id, crew_id, det1, det2),
  KEY idx_srf_run_report (run_id, report),
  KEY idx_srf_crew (crew_id),
  CONSTRAINT fk_srf_run FOREIGN KEY (run_id) REFERENCES suburban_rest_runs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
