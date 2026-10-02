-- car_sheds / rake_types were never created on prod (rake_formations' FKs point at
-- nothing). MySQL 8.4+ cannot recreate such FKs on restore — fix before the upgrade.
-- Idempotent: safe on local, where both tables already exist with this data.
CREATE TABLE IF NOT EXISTS car_sheds (
  shed_code varchar(5) NOT NULL,
  shed_name varchar(50) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (shed_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS rake_types (
  id int NOT NULL AUTO_INCREMENT,
  type_name varchar(30) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY type_name (type_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO car_sheds (shed_code, shed_name) VALUES
  ('KCS','Kalva Car Shed'), ('NCS','Kurla Car Shed'), ('SCS','Sanpada Car Shed');

INSERT IGNORE INTO rake_types (id, type_name) VALUES
  (1,'Siemens'), (2,'ALSTOM'), (3,'Bombardier'), (4,'BHEL AC'), (5,'MEDHA'),
  (6,'MEDHA AC'), (7,'AC Retrofitted'), (8,'MEMU-Conventional'), (9,'MEMU-BT');
