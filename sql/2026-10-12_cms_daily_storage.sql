-- CMS Daily Position (/clicms/daily.html) — storage.
-- Until now every report was parsed in memory and discarded. From here each load is kept:
--
--   cms_daily_loads   one row per load of one report for one data date (file or hand).
--                     A later load of the same report + date becomes current; the earlier
--                     one stays (is_current = 0) so a moved count can be traced.
--                     Keeps the raw CSV(s) so a parser fix can re-read old days, and the
--                     tables exactly as shown so an old day reprints the same.
--   cms_daily_counts  every figure, one per row: lobby x measure -> value (ALL lobbies and
--                     columns, not only the sheet's). The trend table.
--   cms_daily_crew    the crew behind a figure where the file lists them (drill-down);
--                     lobby uploads will add here later.
--
-- data_date = sheet_date - the report's dateOffset (D-0 / D-1 / D-2).
-- Additive only: no existing table is touched. Rollback = drop the three tables.

CREATE TABLE IF NOT EXISTS cms_daily_loads (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_key    VARCHAR(30)  NOT NULL,             -- module key, e.g. 'fsd', 'subsonoff'
  data_date     DATE         NOT NULL,
  sheet_date    DATE         NOT NULL,
  source        ENUM('file','hand','mixed') NOT NULL, -- mixed = slot report with files + hand part
  file_names    VARCHAR(500) NULL,
  file_sha256   CHAR(64)     NULL,                 -- of raw_file
  raw_file      MEDIUMBLOB   NULL,                 -- one CSV, or a JSON bundle {slot: base64} for slot reports
  hand_values   JSON         NULL,                 -- what was typed in, if any
  tables_json   JSON         NOT NULL,             -- tables exactly as shown / exported
  warnings      JSON         NULL,
  loaded_by     VARCHAR(50)  NOT NULL,             -- users.username
  loaded_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_current    TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_cdl_report_date (report_key, data_date, is_current),
  KEY idx_cdl_sheet_date (sheet_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS cms_daily_counts (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  load_id     INT UNSIGNED NOT NULL,
  report_key  VARCHAR(30)  NOT NULL,
  data_date   DATE         NOT NULL,
  lobby       VARCHAR(20)  NOT NULL,               -- 'DIVISION' for division totals (CMS has a lobby named CSTM)
  measure     VARCHAR(60)  NOT NULL,               -- the report's own column, e.g. 'fsd_n', 'gt14'
  value       INT          NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cdc_load_cell (load_id, lobby, measure),
  KEY idx_cdc_trend (report_key, measure, lobby, data_date),
  CONSTRAINT fk_cdc_load FOREIGN KEY (load_id) REFERENCES cms_daily_loads (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS cms_daily_crew (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  load_id     INT UNSIGNED NOT NULL,
  report_key  VARCHAR(30)  NOT NULL,
  data_date   DATE         NOT NULL,
  lobby       VARCHAR(20)  NOT NULL,
  cms_id      VARCHAR(15)  NULL,                   -- alnum ids (CSMT1ABR) fit; NULL if the file has none
  crew_name   VARCHAR(100) NULL,
  measure     VARCHAR(60)  NOT NULL,               -- which figure this crew is behind
  event_time  DATETIME     NULL,
  detail      JSON         NULL,                   -- anything else the report lists
  PRIMARY KEY (id),
  KEY idx_cdcr_load (load_id),
  KEY idx_cdcr_crew (cms_id, data_date),
  KEY idx_cdcr_report (report_key, measure, data_date),
  CONSTRAINT fk_cdcr_load FOREIGN KEY (load_id) REFERENCES cms_daily_loads (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
