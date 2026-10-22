-- TS-040: Trip Shed's own list of trains whose incoming loco is taken for TI at the shed,
-- plus the shed's own loco fill-in when the Control Office daily sheet has no entry.
-- Source of the VVH seed: data/CR ELECTRIC LOCO LINKS UNDER REVIEW 12.09.2025.pdf —
-- a "TI" marker on a departure row means TI after the preceding (UP) arrival. 28 trains
-- terminate at LTT or DR, both served by VVH. The link-maintenance roster (div_loco_link_roster*)
-- stays a cross-check; Trip Shed never writes Control Office tables. Idempotent.

CREATE TABLE IF NOT EXISTS div_trip_ti_trains (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shed_id INT NOT NULL,
  train_no VARCHAR(20) NOT NULL,
  arrival_station VARCHAR(10) NOT NULL,
  departs_as VARCHAR(60) DEFAULT NULL,
  link_no VARCHAR(10) DEFAULT NULL,
  source VARCHAR(60) DEFAULT NULL,
  remark VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trip_ti_train (shed_id, train_no),
  CONSTRAINT fk_trip_ti_train_shed FOREIGN KEY (shed_id) REFERENCES div_trip_sheds(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS div_trip_ti_train_locos (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shed_id INT NOT NULL,
  service_date DATE NOT NULL,
  train_no VARCHAR(20) NOT NULL,
  loco_number VARCHAR(20) NOT NULL,
  entered_by INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trip_ti_train_loco (shed_id, service_date, train_no),
  CONSTRAINT fk_trip_ti_train_loco_shed FOREIGN KEY (shed_id) REFERENCES div_trip_sheds(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO div_trip_ti_trains (shed_id, train_no, arrival_station, departs_as, source)
SELECT s.id, v.train_no, v.arrival_station, v.departs_as, 'LINK-PDF-12.09.2025'
  FROM div_trip_sheds s
  JOIN (
    SELECT '11006' train_no, 'DR'  arrival_station, '11005 / 11021 / 11035' departs_as UNION ALL
    SELECT '11022', 'DR',  '11005 / 11021' UNION ALL
    SELECT '11028', 'DR',  '11041' UNION ALL
    SELECT '11036', 'DR',  '01025' UNION ALL
    SELECT '12132', 'DR',  '22147' UNION ALL
    SELECT '11014', 'LTT', '11061' UNION ALL
    SELECT '11056', 'LTT', '11055 / 11059 / 11072' UNION ALL
    SELECT '11060', 'LTT', '11059' UNION ALL
    SELECT '11072', 'LTT', '11071' UNION ALL
    SELECT '11080', 'LTT', '22109' UNION ALL
    SELECT '11304', 'LTT', '19013' UNION ALL
    SELECT '12108', 'LTT', '12173' UNION ALL
    SELECT '12164', 'LTT', '12555 / 22538' UNION ALL
    SELECT '12166', 'LTT', '12165' UNION ALL
    SELECT '12168', 'LTT', '15017' UNION ALL
    SELECT '12172', 'LTT', '12107 / 12171' UNION ALL
    SELECT '12174', 'LTT', '22101' UNION ALL
    SELECT '12294', 'LTT', '12293' UNION ALL
    SELECT '15018', 'LTT', '18520' UNION ALL
    SELECT '15648', 'LTT', '12165' UNION ALL
    SELECT '15946', 'LTT', '11017 / 22183' UNION ALL
    SELECT '20104', 'LTT', '12167' UNION ALL
    SELECT '22104', 'LTT', '12293' UNION ALL
    SELECT '22130', 'LTT', '12143 / 12161' UNION ALL
    SELECT '22184', 'LTT', '15945' UNION ALL
    SELECT '22512', 'LTT', '17641' UNION ALL
    SELECT '22537', 'LTT', '12791' UNION ALL
    SELECT '22866', 'LTT', '12109'
  ) v
 WHERE s.shed_code = 'VVH'
ON DUPLICATE KEY UPDATE arrival_station = VALUES(arrival_station), departs_as = VALUES(departs_as), source = VALUES(source);

-- Rollback:
-- DROP TABLE IF EXISTS div_trip_ti_train_locos; DROP TABLE IF EXISTS div_trip_ti_trains;
