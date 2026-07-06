-- ============================================================================
-- CVVRS & ADAS Analysis Module Schema
-- ============================================================================
-- CVVRS (Crew Voice & Video Recording System) — Mainline crew analysis
--   Crew: Loco Pilot + Assistant Loco Pilot
--   Structure: 4 sections, 26 checklist items
--
-- ADAS Analysis — Suburban crew analysis (Annexure B)
--   Crew: Motorman (single)
--   Structure: flat 13-item checklist
-- ============================================================================

-- ------------------------------------------------------------------
-- CVVRS: sections (observation groupings)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_cvvrs_sections (
  section_id     INT AUTO_INCREMENT PRIMARY KEY,
  section_code   VARCHAR(30) NOT NULL UNIQUE,
  section_name   VARCHAR(100) NOT NULL,
  display_order  SMALLINT NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------
-- CVVRS: checklist items
--   applies_to: 'BOTH' = both LP & ALP answer, 'LP' = only LP, 'ALP' = only ALP
--   response_options: JSON array, e.g. ["OK","NOT OK"] or ["ALERT","NOT ALERT"]
--                     first value is the "positive/expected" answer (shown green)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_cvvrs_items (
  item_id           INT AUTO_INCREMENT PRIMARY KEY,
  section_id        INT NOT NULL,
  item_text         VARCHAR(255) NOT NULL,
  response_options  JSON NOT NULL,
  applies_to        ENUM('BOTH','LP','ALP') NOT NULL DEFAULT 'BOTH',
  display_order     SMALLINT NOT NULL DEFAULT 0,
  is_active         TINYINT(1) NOT NULL DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES div_cvvrs_sections(section_id),
  INDEX idx_section (section_id, display_order)
);

-- ------------------------------------------------------------------
-- CVVRS: report headers
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_cvvrs_reports (
  report_id          INT AUTO_INCREMENT PRIMARY KEY,

  -- Analyzing CLI
  cli_hrms_id        VARCHAR(10),
  cli_name           VARCHAR(100) NOT NULL,

  -- Dates
  analysis_date      DATE NOT NULL,
  event_date         DATE NOT NULL,

  -- Train / Loco
  train_number       VARCHAR(20) NOT NULL,
  loco_number        VARCHAR(20),

  -- Crew: Loco Pilot (required)
  lp_hrms_id         VARCHAR(10),
  lp_name            VARCHAR(100) NOT NULL,

  -- Crew: Assistant Loco Pilot (optional)
  alp_hrms_id        VARCHAR(10),
  alp_name           VARCHAR(100),

  -- Stations
  from_station       VARCHAR(10),
  to_station         VARCHAR(10),

  -- Nominated CLIs (auto-populated from staff's current_cli_id)
  ncli_lp_id         INT,
  ncli_lp_name       VARCHAR(100),
  ncli_alp_id        INT,
  ncli_alp_name      VARCHAR(100),

  -- Crew HQ + run times
  crew_hq            VARCHAR(50),
  departure_time     TIME,
  arrival_time       TIME,

  -- Overall performance
  lp_performance     ENUM('GOOD','SATISFACTORY','POOR'),
  alp_performance    ENUM('GOOD','SATISFACTORY','POOR'),

  -- Final remark
  final_remark       TEXT,

  -- Metadata
  created_by         VARCHAR(50),
  office_code        VARCHAR(15),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_analysis_date (analysis_date),
  INDEX idx_event_date (event_date),
  INDEX idx_lp (lp_hrms_id),
  INDEX idx_alp (alp_hrms_id),
  INDEX idx_cli (cli_hrms_id),
  INDEX idx_office (office_code),
  INDEX idx_train (train_number),
  FOREIGN KEY (ncli_lp_id) REFERENCES div_cli_master(cli_id),
  FOREIGN KEY (ncli_alp_id) REFERENCES div_cli_master(cli_id)
);

-- ------------------------------------------------------------------
-- CVVRS: per-item observations (one row per item per report)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_cvvrs_observations (
  observation_id  INT AUTO_INCREMENT PRIMARY KEY,
  report_id       INT NOT NULL,
  item_id         INT NOT NULL,
  lp_value        VARCHAR(50),
  alp_value       VARCHAR(50),
  remark          VARCHAR(500),
  FOREIGN KEY (report_id) REFERENCES div_cvvrs_reports(report_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES div_cvvrs_items(item_id),
  UNIQUE KEY uk_report_item (report_id, item_id),
  INDEX idx_report (report_id)
);

-- ------------------------------------------------------------------
-- ADAS: checklist items (flat, no sections)
--   is_inverse: 1 = NO is the expected answer (negative-phrased items)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_adas_items (
  item_id         INT AUTO_INCREMENT PRIMARY KEY,
  item_text       VARCHAR(500) NOT NULL,
  is_inverse      TINYINT(1) NOT NULL DEFAULT 0,
  display_order   SMALLINT NOT NULL DEFAULT 0,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------
-- ADAS: report headers
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_adas_reports (
  report_id        INT AUTO_INCREMENT PRIMARY KEY,

  -- Analyzing CLI
  cli_hrms_id      VARCHAR(10),
  cli_name         VARCHAR(100) NOT NULL,

  -- Dates
  analysis_date    DATE NOT NULL,
  event_date       DATE NOT NULL,

  -- Train / Cab
  train_number     VARCHAR(20) NOT NULL,
  d_cab            VARCHAR(20),

  -- Motorman
  mman_hrms_id     VARCHAR(10),
  mman_name        VARCHAR(100) NOT NULL,
  mman_hq          VARCHAR(50),
  safety_category  ENUM('A','B','C'),

  -- Route
  section          VARCHAR(20),
  from_station     VARCHAR(10),
  to_station       VARCHAR(10),
  time_from        TIME,
  time_to          TIME,

  -- Nominated CLI (NLI)
  nli_id           INT,
  nli_name         VARCHAR(100),

  -- Final remark
  final_remark     TEXT,

  -- Metadata
  created_by       VARCHAR(50),
  office_code      VARCHAR(15),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_analysis_date (analysis_date),
  INDEX idx_event_date (event_date),
  INDEX idx_mman (mman_hrms_id),
  INDEX idx_cli (cli_hrms_id),
  INDEX idx_office (office_code),
  INDEX idx_train (train_number),
  FOREIGN KEY (nli_id) REFERENCES div_cli_master(cli_id)
);

-- ------------------------------------------------------------------
-- ADAS: per-item observations
--   value_text: can hold "YES", "NO", "N/A", or free text like "Enroute"
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_adas_observations (
  observation_id  INT AUTO_INCREMENT PRIMARY KEY,
  report_id       INT NOT NULL,
  item_id         INT NOT NULL,
  value_text      VARCHAR(255),
  FOREIGN KEY (report_id) REFERENCES div_adas_reports(report_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES div_adas_items(item_id),
  UNIQUE KEY uk_report_item (report_id, item_id),
  INDEX idx_report (report_id)
);

-- ============================================================================
-- SEED DATA: CVVRS sections
-- ============================================================================
INSERT INTO div_cvvrs_sections (section_code, section_name, display_order) VALUES
  ('TAKING_OVER',   'Observations While Taking Over the Charge',       1),
  ('WHILE_ON_RUN',  'Observations While on Run',                       2),
  ('AT_HALTS',      'Observations at Halts',                           3),
  ('HANDING_OVER',  'Observations at Destination / Charge Handing Over', 4);

-- ============================================================================
-- SEED DATA: CVVRS items
-- ============================================================================
-- Section 1: TAKING_OVER
INSERT INTO div_cvvrs_items (section_id, item_text, response_options, applies_to, display_order) VALUES
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='TAKING_OVER'), 'Reporting on Loco',                      JSON_ARRAY('OK','NOT OK'),           'BOTH', 1),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='TAKING_OVER'), 'RS Valve Checking',                      JSON_ARRAY('CHECKED','NOT CHECKED'), 'ALP',  2),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='TAKING_OVER'), 'DATA Entry in SPM',                      JSON_ARRAY('DONE','NOT DONE'),       'LP',   3),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='TAKING_OVER'), 'Referring Log Book',                     JSON_ARRAY('YES','NO'),              'BOTH', 4),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='TAKING_OVER'), 'BPC / APCC Check',                       JSON_ARRAY('YES','NO'),              'LP',   5),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='TAKING_OVER'), 'Use of VHF While Departure',             JSON_ARRAY('YES','NO'),              'LP',   6),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='TAKING_OVER'), 'Ensuring Proper Departure Signal',       JSON_ARRAY('YES','NO'),              'BOTH', 7);

-- Section 2: WHILE_ON_RUN
INSERT INTO div_cvvrs_items (section_id, item_text, response_options, applies_to, display_order) VALUES
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Conducting BFT & BPT',                                JSON_ARRAY('DONE','NOT DONE'),       'LP',   1),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Calling Out Signals with Hand Gesture',               JSON_ARRAY('YES','NO'),              'BOTH', 2),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Keeping Hand on RS on Passing Signal at One Yellow',  JSON_ARRAY('YES','NO'),              'ALP',  3),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Alertness on Run / Gossiping on Run',                 JSON_ARRAY('ALERT','NOT ALERT'),     'BOTH', 4),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Using Whistles',                                      JSON_ARRAY('YES','NO'),              'BOTH', 5),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Checking Formation in Curve',                         JSON_ARRAY('YES','NO'),              'BOTH', 6),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Exchanging Signals at Station / Section',             JSON_ARRAY('YES','NO'),              'BOTH', 7),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Mind Diverting Activity (if any)',                    JSON_ARRAY('NO','YES'),              'BOTH', 8),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Micro Sleep',                                         JSON_ARRAY('NO','YES'),              'BOTH', 9),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Use of Walkie-Talkie for Operational Info',           JSON_ARRAY('NO','YES'),              'BOTH', 10),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Using Mobile Phone on Run',                           JSON_ARRAY('NO','YES'),              'BOTH', 11),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='WHILE_ON_RUN'), 'Packing Personal Store on Run',                       JSON_ARRAY('NO','YES'),              'BOTH', 12);

-- Section 3: AT_HALTS
INSERT INTO div_cvvrs_items (section_id, item_text, response_options, applies_to, display_order) VALUES
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='AT_HALTS'), 'Application of A-9, SA-9 & Throttle/MP on Zero/Off', JSON_ARRAY('YES','NO'),             'LP',   1),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='AT_HALTS'), 'Micro Sleep',                                        JSON_ARRAY('NO','YES'),             'BOTH', 2),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='AT_HALTS'), 'Alertness',                                          JSON_ARRAY('ALERT','NOT ALERT'),    'BOTH', 3),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='AT_HALTS'), 'Loco Field Round',                                   JSON_ARRAY('DONE','NOT DONE'),      'ALP',  4);

-- Section 4: HANDING_OVER
INSERT INTO div_cvvrs_items (section_id, item_text, response_options, applies_to, display_order) VALUES
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='HANDING_OVER'), 'Throttle / MP on Zero / Off',   JSON_ARRAY('YES','NO'), 'LP', 1),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='HANDING_OVER'), 'Application of A-9, SA-9',      JSON_ARRAY('YES','NO'), 'LP', 2),
  ((SELECT section_id FROM div_cvvrs_sections WHERE section_code='HANDING_OVER'), 'Reverser in Neutral',           JSON_ARRAY('YES','NO'), 'LP', 3);

-- ============================================================================
-- SEED DATA: ADAS items (13 items, items 8/11/13 are inverse)
-- ============================================================================
INSERT INTO div_adas_items (item_text, is_inverse, display_order) VALUES
  ('Whether conducted Brake Continuity test on stabled rake ex siding/carshed/station.', 0, 1),
  ('Whether keeping necessary personal store items on desk.', 0, 2),
  ('Whether calling out of signal aspects loudly. Also calling out with hand gesture acknowledging next halts, TSRs/PSRs/Neutral Section locations enroute.', 0, 3),
  ('Whether conducted Brake feel test / Brake power test at first opportunity.', 0, 4),
  ('Whether acknowledging AWS warning in time through Vigilance button and reducing speed accordingly.', 0, 5),
  ('Whether switching ON Audio Visual Buzzer after passing Yellow signal except before Terminating Station & if EMU halt board is before next signal.', 0, 6),
  ('Whether sounding horn at W and WL boards, while running through stations & at trespassing locations.', 0, 7),
  ('Whether use mobile phone during train in motion.', 1, 8),
  ('Whether acknowledging AWS warning in time through Vigilance button.', 0, 9),
  ('Whether exchanging beats when starting, Running through stations & at other occasions as per S.R. 4.51-1 Bell Code signals with Train Manager correctly.', 0, 10),
  ('Whether engaging in other activities like chitchatting, eating likely to distract his train working.', 1, 11),
  ('Whether putting Reverser / Direction Switch & PBC / Throttle in Neutral position when stopped at Red signal.', 0, 12),
  ('Whether collecting personal store items before reaching destination.', 1, 13);
