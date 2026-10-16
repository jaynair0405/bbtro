-- CLI CMS Due List (Foot Plate / Grading / Counselling, /clicms/index.html) — storage.
-- Until now the combined CMS Report CSV was parsed in memory and discarded. From here
-- each HQ upload is kept, on the same tables as the Daily Position:
--
--   cms_daily_loads   one row per upload: report_key 'duelist', lobby NULL,
--                     data_date = sheet_date = the upload day (IST; the file carries no
--                     run date). A second upload the same day becomes current, the earlier
--                     stays (is_current = 0). raw_file is the CSV GZIPPED (1.4 MB a day
--                     otherwise): file_names ends in .csv.gz and the blob starts 1f 8b —
--                     lib/cmsReports/duelist.js gunzipIfNeeded() reads it back.
--                     'duelist' is NOT in lib/cmsReports/index.js, so it never shows on
--                     the Daily Position sheet, the Lobby page or the drill.
--   cms_daily_counts  per lobby (crew-id prefix: CSMT, KYN, CSTS …) and 'DIVISION':
--                     <param>.overdue / <param>.due30 / <param>.total for footplate,
--                     grading, counselling; grade.A|B|C|D|none; crew.total. Trend table.
--   cms_daily_crew    only the OVERDUE crew of that day (measure <param>.overdue,
--                     event_time = due date, detail {cli, cliName, desig, done, due}).
--
--   cms_crew_monitoring  (new) one row per crew per VERSION of its tracked fields: CLI,
--                     grade, done/due dates, subjects. Every upload compares each crew with
--                     its current row: unchanged -> last_seen / last_load_id / status move
--                     on; changed -> the old row is retired (is_current = 0) and a new one
--                     inserted. status (duty state) is NOT tracked, so daily churn makes no
--                     versions. A crew absent from a file keeps its current row (could be
--                     a transfer). The bio-profile reads fp_done of the current row.
--
-- Additive only. Rollback at the bottom.

CREATE TABLE IF NOT EXISTS cms_crew_monitoring (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cms_id          VARCHAR(15)  NOT NULL,
  crew_name       VARCHAR(100) NULL,
  desig           VARCHAR(20)  NULL,
  lobby           VARCHAR(20)  NOT NULL,            -- crew-id prefix (CSMT, KYN, CSTS …)
  cli_cms_id      VARCHAR(15)  NULL,                -- CLI ID in the file (CSTM0001)
  cli_name        VARCHAR(100) NULL,
  cli_alloted     DATE         NULL,
  status          VARCHAR(10)  NULL,                -- CMS duty state at last sight; not tracked
  grade           CHAR(1)      NULL,                -- A/B/C/D, NULL when blank
  prev_grade      CHAR(1)      NULL,
  prev_grade_date DATE         NULL,
  gr_done         DATE         NULL,
  gr_due          DATE         NULL,
  co_done         DATE         NULL,
  co_due          DATE         NULL,
  co_subject      VARCHAR(500) NULL,                -- REMARK-[SUBJECT]
  fp_done         DATE         NULL,
  fp_due          DATE         NULL,
  fp_remark       VARCHAR(500) NULL,                -- footplate REMARK
  first_load_id   INT UNSIGNED NOT NULL,            -- load that started this version
  last_load_id    INT UNSIGNED NOT NULL,            -- load that last confirmed it
  first_seen      DATE         NOT NULL,            -- data_date of first_load_id
  last_seen       DATE         NOT NULL,            -- data_date of last_load_id
  is_current      TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_ccm_crew  (cms_id, is_current, last_seen), -- one crew's history, current first
  KEY idx_ccm_lobby (lobby, is_current),             -- current state per lobby
  KEY idx_ccm_cli   (cli_cms_id, is_current),        -- current state per CLI
  KEY idx_ccm_due   (is_current, fp_due),            -- "who is due" scans
  CONSTRAINT fk_ccm_first FOREIGN KEY (first_load_id) REFERENCES cms_daily_loads (id),
  CONSTRAINT fk_ccm_last  FOREIGN KEY (last_load_id)  REFERENCES cms_daily_loads (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- One current row per crew is kept by the upsert transaction in duelist.js (no partial
-- unique index in MySQL). The FKs have no cascade on purpose: a load cannot be deleted
-- while versions point at it.

-- Rollback:
-- DROP TABLE cms_crew_monitoring;
-- DELETE FROM cms_daily_loads WHERE report_key = 'duelist';   -- cascades counts + crew
