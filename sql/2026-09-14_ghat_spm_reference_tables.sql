-- ============================================================
-- Ghat SPM (IGP / LNL banker SPM analysis) — reference tables
-- 2026-09-14  branch feature/ghat-spm
--
-- Loaded from the validated CSVs of the client-side prototype
-- (igp_stn_km.csv, igp_psr.csv, igp_signal.csv, igp_ghat_markers.csv).
-- Datum: TRIP distance built from PSR spans / inter-signal distances,
-- NOT km-from-CSMT (the ghat rows in div_signals / div_psr are on the OHE
-- mast datum with km_from_csmt NULL; signal_id links the two for later
-- reconciliation). LNL rows are added the same way when its data arrives.
-- Apply: mysql -u jay -p4310jay bbtro < sql/2026-09-14_ghat_spm_reference_tables.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS `div_ghat_spm_stations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `section` VARCHAR(20) NOT NULL COMMENT 'KSRA-IGP / KJT-LNL',
  `station_code` VARCHAR(10) NOT NULL COMMENT 'As used by the app (TGR1..); div_stations spells cabins TGR 1',
  `direction` ENUM('UP','DN') NOT NULL,
  `trip_km` DECIMAL(6,3) NOT NULL COMMENT 'Distance from the trip origin on the PSR-span datum',
  `seq` TINYINT UNSIGNED NOT NULL COMMENT 'Order along the route in this direction',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ghat_stn` (`section`,`direction`,`station_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Ghat SPM: station/cabin positions as trip km per direction';

CREATE TABLE IF NOT EXISTS `div_ghat_spm_psr` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `section` VARCHAR(20) NOT NULL,
  `route_section` VARCHAR(30) NOT NULL COMMENT 'Cabin-to-cabin leg incl. YD variants, e.g. KSRA YD-TGR3',
  `direction` ENUM('UP','DN') NOT NULL,
  `seq` SMALLINT UNSIGNED NOT NULL COMMENT 'Order of the span within the leg (cumulative trip km is rebuilt from spans in this order)',
  `psr_from_km` DECIMAL(7,3) NOT NULL COMMENT 'Reference km (curtailed datum) — used only to place TSR/markers, not for distance',
  `psr_to_km` DECIMAL(7,3) NOT NULL,
  `span_km` DECIMAL(6,3) NOT NULL,
  `speed_kmph` TINYINT UNSIGNED NOT NULL COMMENT '60 = MPS; 15 = IGP coaching limit (goods 10, LE none)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ghat_psr_leg` (`section`,`route_section`,`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Ghat SPM: PSR/MPS spans per leg';

CREATE TABLE IF NOT EXISTS `div_ghat_spm_signals` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `section` VARCHAR(20) NOT NULL,
  `route_section` VARCHAR(30) NOT NULL,
  `direction` ENUM('UP','DN') NOT NULL,
  `seq` SMALLINT UNSIGNED NOT NULL,
  `isd_km` DECIMAL(6,3) NOT NULL COMMENT 'Distance from the previous signal in the leg (first row: from the leg start)',
  `signal_name` VARCHAR(40) NOT NULL COMMENT 'Name used on the chart; type inferred from it (DIST/H/STR/ADV/BKR)',
  `signal_id` INT DEFAULT NULL COMMENT 'div_signals.id once reconciled (nullable)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ghat_sig_leg` (`section`,`route_section`,`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Ghat SPM: inter-signal distances per leg';

CREATE TABLE IF NOT EXISTS `div_ghat_spm_markers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `section` VARCHAR(20) NOT NULL,
  `name` VARCHAR(30) NOT NULL,
  `direction` ENUM('UP','DN') NOT NULL,
  `anchor` VARCHAR(40) DEFAULT NULL COMMENT 'Signal/station name to anchor to; NULL = use psr_km',
  `offset_m` INT NOT NULL DEFAULT 0 COMMENT 'Metres along the trip from the anchor (+ ahead, - behind)',
  `psr_km` DECIMAL(7,3) DEFAULT NULL COMMENT 'Absolute km on the PSR datum, used when anchor is NULL',
  `note` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ghat_marker` (`section`,`direction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Ghat SPM: ghat boards (15/10 Kmph, GR-0) — positions provisional until site check';

-- Module access flag (office rule is applied in code from users.div_office_code)
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'can_access_ghat_spm');
SET @sql := IF(@col = 0, 'ALTER TABLE `users` ADD COLUMN `can_access_ghat_spm` TINYINT(1) NOT NULL DEFAULT 0 AFTER `can_access_sub_spm`', 'SELECT ''can_access_ghat_spm already exists''');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ---------- data: KSRA-IGP ----------
DELETE FROM `div_ghat_spm_stations` WHERE section = 'KSRA-IGP';
DELETE FROM `div_ghat_spm_psr`      WHERE section = 'KSRA-IGP';
DELETE FROM `div_ghat_spm_signals`  WHERE section = 'KSRA-IGP';
DELETE FROM `div_ghat_spm_markers`  WHERE section = 'KSRA-IGP';

INSERT INTO `div_ghat_spm_stations` (section,station_code,direction,trip_km,seq) VALUES
('KSRA-IGP','KSRA','DN',0.000,1),
('KSRA-IGP','TGR3','DN',4.700,2),
('KSRA-IGP','TGR2','DN',9.290,3),
('KSRA-IGP','TGR1','DN',12.590,4),
('KSRA-IGP','IGP','DN',14.390,5),
('KSRA-IGP','IGP','UP',0.000,1),
('KSRA-IGP','TGR1','UP',1.080,2),
('KSRA-IGP','TGR2','UP',4.330,3),
('KSRA-IGP','TGR3','UP',9.200,4),
('KSRA-IGP','KSRA','UP',14.080,5);

INSERT INTO `div_ghat_spm_psr` (section,route_section,direction,seq,psr_from_km,psr_to_km,span_km,speed_kmph) VALUES
('KSRA-IGP','KSRA-TGR3','DN',1,120.400,120.850,0.450,60),
('KSRA-IGP','KSRA-TGR3','DN',2,120.850,124.600,3.750,60),
('KSRA-IGP','KSRA-TGR3','DN',3,124.600,125.100,0.500,30),
('KSRA-IGP','KSRA YD-TGR3','DN',1,120.320,121.000,0.680,10),
('KSRA-IGP','KSRA YD-TGR3','DN',2,121.000,124.285,3.285,60),
('KSRA-IGP','KSRA YD-TGR3','DN',3,124.285,125.100,0.815,30),
('KSRA-IGP','TGR3-TGR2','DN',1,125.100,126.900,1.800,60),
('KSRA-IGP','TGR3-TGR2','DN',2,126.900,129.690,2.790,60),
('KSRA-IGP','TGR2-TGR1','DN',1,129.690,130.170,0.480,45),
('KSRA-IGP','TGR2-TGR1','DN',2,130.170,132.820,2.650,60),
('KSRA-IGP','TGR2-TGR1','DN',3,132.820,132.990,0.170,60),
('KSRA-IGP','TGR1-IGP','DN',1,132.990,133.590,0.600,60),
('KSRA-IGP','TGR1-IGP','DN',2,133.590,134.790,1.200,15),
('KSRA-IGP','TGR1-IGP YD','DN',1,132.990,133.275,0.285,60),
('KSRA-IGP','TGR1-IGP YD','DN',2,133.275,134.790,1.515,10),
('KSRA-IGP','IGP-TGR1','UP',1,134.200,133.120,1.080,60),
('KSRA-IGP','TGR1-TGR2','UP',1,133.120,129.870,3.250,60),
('KSRA-IGP','TGR2-TGR3','UP',1,129.870,129.770,0.100,30),
('KSRA-IGP','TGR2-TGR3','UP',2,129.770,127.120,2.650,60),
('KSRA-IGP','TGR2-TGR3','UP',3,127.120,126.900,0.220,60),
('KSRA-IGP','TGR2-TGR3','UP',4,126.900,125.000,1.900,60),
('KSRA-IGP','TGR3-KSRA','UP',1,125.000,124.900,0.100,30),
('KSRA-IGP','TGR3-KSRA','UP',2,124.900,122.800,2.100,60),
('KSRA-IGP','TGR3-KSRA','UP',3,122.800,121.700,1.100,35),
('KSRA-IGP','TGR3-KSRA','UP',4,121.700,120.900,0.800,60),
('KSRA-IGP','TGR3-KSRA','UP',5,120.900,120.500,0.400,25),
('KSRA-IGP','TGR3-KSRA','UP',6,120.500,120.120,0.380,60),
('KSRA-IGP','IGP YD-TGR1','UP',1,134.220,133.770,0.450,10),
('KSRA-IGP','IGP YD-TGR1','UP',2,133.770,133.120,0.650,60),
('KSRA-IGP','TGR3-KSRA YD','UP',1,125.000,124.900,0.100,30),
('KSRA-IGP','TGR3-KSRA YD','UP',2,124.900,122.800,2.100,60),
('KSRA-IGP','TGR3-KSRA YD','UP',3,122.800,121.700,1.100,35),
('KSRA-IGP','TGR3-KSRA YD','UP',4,121.700,120.900,0.800,60),
('KSRA-IGP','TGR3-KSRA YD','UP',5,120.900,120.030,0.870,10);

INSERT INTO `div_ghat_spm_signals` (section,route_section,direction,seq,isd_km,signal_name) VALUES
('KSRA-IGP','KSRA-TGR3','DN',1,0.050,'KSRA BKR START'),
('KSRA-IGP','KSRA-TGR3','DN',2,0.450,'KSRA PF1 STR S-46'),
('KSRA-IGP','KSRA-TGR3','DN',3,0.720,'ADV STR S-65'),
('KSRA-IGP','KSRA-TGR3','DN',4,1.550,'TGR3 DIST'),
('KSRA-IGP','KSRA-TGR3','DN',5,0.980,'TGR3 H S-2'),
('KSRA-IGP','TGR3-TGR2','DN',1,1.000,'TGR3 STR S-6'),
('KSRA-IGP','TGR3-TGR2','DN',2,2.840,'TGR2 DIST'),
('KSRA-IGP','TGR3-TGR2','DN',3,0.970,'TGR2 H S-2'),
('KSRA-IGP','TGR2-TGR1','DN',1,0.920,'TGR2 STR S-6'),
('KSRA-IGP','TGR2-TGR1','DN',2,2.110,'TGR1 DIST'),
('KSRA-IGP','TGR2-TGR1','DN',3,1.030,'TGR1 H S-1'),
('KSRA-IGP','TGR1-IGP','DN',1,0.420,'IGP H S-1'),
('KSRA-IGP','TGR1-IGP','DN',2,1.400,'IGP PF1 STR'),
('KSRA-IGP','KSRA YD-TGR3','DN',1,0.000,'KSRA YD BKR STR'),
('KSRA-IGP','KSRA YD-TGR3','DN',2,0.530,'KSRA YD STR'),
('KSRA-IGP','KSRA YD-TGR3','DN',3,0.720,'ADV STR S-65'),
('KSRA-IGP','KSRA YD-TGR3','DN',4,1.550,'TGR3 DIST'),
('KSRA-IGP','KSRA YD-TGR3','DN',5,0.980,'TGR3 H S-2'),
('KSRA-IGP','TGR1-IGP YD','DN',1,0.420,'IGP H S-1'),
('KSRA-IGP','TGR1-IGP YD','DN',2,1.400,'IGP YARD STR'),
('KSRA-IGP','IGP YD-TGR1','UP',1,0.000,'IGP YARD STR'),
('KSRA-IGP','IGP-TGR1','UP',1,0.000,'IGP PF3 STR'),
('KSRA-IGP','IGP YD-TGR1','UP',2,0.450,'IGP A STR'),
('KSRA-IGP','IGP YD-TGR1','UP',3,0.650,'TGR-1 H'),
('KSRA-IGP','IGP-TGR1','UP',2,0.450,'IGP A STR'),
('KSRA-IGP','IGP-TGR1','UP',3,0.650,'TGR-1 H'),
('KSRA-IGP','TGR1-TGR2','UP',1,0.280,'TGR-1 STR'),
('KSRA-IGP','TGR1-TGR2','UP',2,1.370,'TGR-2 DIST'),
('KSRA-IGP','TGR1-TGR2','UP',3,1.150,'TGR-2 H'),
('KSRA-IGP','TGR2-TGR3','UP',1,0.540,'TGR-2  STR'),
('KSRA-IGP','TGR2-TGR3','UP',2,3.330,'TGR-3 DIST'),
('KSRA-IGP','TGR2-TGR3','UP',3,0.970,'TGR-3 H'),
('KSRA-IGP','TGR3-KSRA','UP',1,0.620,'TGR-3 STR'),
('KSRA-IGP','TGR3-KSRA','UP',2,2.100,'KSRA DIST'),
('KSRA-IGP','TGR3-KSRA','UP',3,1.120,'KSRA H'),
('KSRA-IGP','TGR3-KSRA','UP',4,1.500,'KSRA PF2 STR'),
('KSRA-IGP','TGR3-KSRA YD','UP',1,0.620,'TGR-3 STR'),
('KSRA-IGP','TGR3-KSRA YD','UP',2,2.100,'KSRA DIST'),
('KSRA-IGP','TGR3-KSRA YD','UP',3,1.120,'KSRA H'),
('KSRA-IGP','TGR3-KSRA YD','UP',4,1.610,'KSRA YARD');

INSERT INTO `div_ghat_spm_markers` (section,name,direction,anchor,offset_m,psr_km,note) VALUES
('KSRA-IGP','15/10 Kmph','DN','IGP H S-1',-650,NULL,'Speed board 650 m before (KSRA side of) IGP home signal. 15 coaching / 10 goods. Ghat driver at rear starts reducing. Set 13 Sep 2026 per user; site check pending.'),
('KSRA-IGP','GR-0','DN','IGP H S-1',300,NULL,'Graduator zero board 300 m beyond (IGP side of) IGP home signal. Set 13 Sep 2026 per user; site check pending. Earlier tries: GAS km 133.9 -> 11.59 km; empirical 12.35 km.');
