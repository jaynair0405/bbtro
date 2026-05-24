-- WTT (Working Time Table) Tables Migration
-- Created: 2026-05-19
-- Purpose: Store official train timings for BB Division loco-link tracking

-- =============================================================================
-- TABLE 1: div_stations - Station Master
-- =============================================================================
CREATE TABLE IF NOT EXISTS div_stations (
    station_code VARCHAR(10) PRIMARY KEY,
    station_name VARCHAR(100),
    division VARCHAR(20) DEFAULT 'BB',
    zone VARCHAR(10) DEFAULT 'CR',
    is_terminal BOOLEAN DEFAULT FALSE,      -- CSMT, VVH, DR, PNVL, LTT, etc.
    is_junction BOOLEAN DEFAULT FALSE,      -- KYN, DIVA, etc.
    km_from_csmt DECIMAL(6,2),              -- Distance for sequencing
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- TABLE 2: div_trains - Train Master
-- =============================================================================
-- NOTE: origin_station, destination_station, via_route columns removed (2026-05-20)
-- These can be derived from div_train_stops (first/last stop, full route sequence)
CREATE TABLE IF NOT EXISTS div_trains (
    train_no VARCHAR(10) PRIMARY KEY,
    train_name VARCHAR(120),
    train_type ENUM('Express', 'Superfast', 'Mail', 'Passenger', 'Suburban', 'Special', 'Goods') DEFAULT 'Express',
    direction ENUM('UP', 'DN'),             -- Based on train number (odd=UP, even=DN)
    run_days VARCHAR(20),                   -- e.g., "Daily", "MWF", "XSUN"
                                            -- NOTE: These are takeover days at Mumbai division,
                                            -- NOT departure day from train origin
    traction_type ENUM('Electric', 'Diesel') DEFAULT 'Electric',
    is_regular BOOLEAN DEFAULT TRUE,        -- FALSE for special trains (01xxx)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_direction (direction)
);

-- =============================================================================
-- TABLE 3: div_train_stops - Station-wise Timings
-- =============================================================================
CREATE TABLE IF NOT EXISTS div_train_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_no VARCHAR(10) NOT NULL,
    station_code VARCHAR(10) NOT NULL,
    seq_order INT NOT NULL,                 -- Stop sequence (1, 2, 3...)
    arrival_time TIME,                      -- NULL for origin
    departure_time TIME,                    -- NULL for destination
    is_halt BOOLEAN DEFAULT TRUE,           -- TRUE=halt, FALSE=pass
    platform_no VARCHAR(5),                 -- Optional
    UNIQUE KEY uk_train_station (train_no, station_code),
    INDEX idx_station (station_code),
    INDEX idx_train (train_no),
    INDEX idx_seq (train_no, seq_order),
    FOREIGN KEY (train_no) REFERENCES div_trains(train_no) ON DELETE CASCADE
);

-- =============================================================================
-- SEED: Insert verified stations (153 stations from wtt_stations_to_verify.csv)
-- =============================================================================
INSERT INTO div_stations (station_code, station_name, is_terminal, is_junction) VALUES
-- Key terminals
('CSMT', 'Chhatrapati Shivaji Maharaj Terminus', TRUE, FALSE),
('LTT', 'Lokmanya Tilak Terminus', TRUE, FALSE),
('DR', 'Dadar', TRUE, TRUE),
('VVH', 'Vashi', TRUE, FALSE),
('PNVL', 'Panvel', TRUE, TRUE),
('PUNE', 'Pune Junction', TRUE, TRUE),
('RN', 'Ratnagiri', TRUE, FALSE),
('JL', 'Jalgaon', TRUE, FALSE),

-- Junctions
('KYN', 'Kalyan Junction', FALSE, TRUE),
('DIVA', 'Diva Junction', FALSE, TRUE),
('TNA', 'Thane', FALSE, TRUE),
('KJT', 'Karjat Junction', FALSE, TRUE),
('LNL', 'Lonavala', FALSE, TRUE),
('IGP', 'Igatpuri', FALSE, TRUE),
('BSR', 'Vasai Road', FALSE, TRUE),

-- Main Line stations (CSMT-Pune)
('ABH', 'Ambivli', FALSE, FALSE),
('ABY', 'Ambernath', FALSE, FALSE),
('AKRD', 'Akurdi', FALSE, FALSE),
('ANO', 'Anjani', FALSE, FALSE),
('APTA', 'Apta', FALSE, FALSE),
('ASO', 'Asangaon', FALSE, FALSE),
('ATG', 'Atgaon', FALSE, FALSE),
('AV', 'Asvali', FALSE, FALSE),
('AVRD', 'Adavali Road', FALSE, FALSE),
('BDI', 'Badlapur', FALSE, FALSE),
('BIRD', 'Bhiwandi Road', FALSE, FALSE),
('BND', 'Bhandup', FALSE, FALSE),
('BOKE', 'Bhoke', FALSE, FALSE),
('BUD', 'Badlapur', FALSE, FALSE),
('BVS', 'Bhor Vihir', FALSE, FALSE),
('BY', 'Byculla', FALSE, FALSE),
('CCH', 'Chinchwad', FALSE, FALSE),
('CHG', 'Chinchpokli', FALSE, FALSE),
('CHI', 'Chiplun', FALSE, FALSE),
('CHOK', 'Chowk', FALSE, FALSE),
('CKHS', 'Chikkhalsa', FALSE, FALSE),
('CLA', 'Chunabhatti', FALSE, FALSE),
('CRD', 'Currey Road', FALSE, FALSE),
('CSN', 'Chalisgaon', FALSE, FALSE),
('DAPD', 'Dapodi', FALSE, FALSE),
('DDCL', 'Dombivli', FALSE, FALSE),
('DEHR', 'Dehu Road', FALSE, FALSE),
('DI', 'Dombivli', FALSE, FALSE),
('DTCC', 'Dativali', FALSE, FALSE),
('DTVL', 'Dativali', FALSE, FALSE),
('DVL', 'Devlali', FALSE, FALSE),
('DWV', 'Diwankhavati', FALSE, FALSE),
('GAA', 'Galna', FALSE, FALSE),
('GC', 'Ghatkopar', FALSE, FALSE),
('GNO', 'Goregaon Road', FALSE, FALSE),
('GO', 'Ghoti', FALSE, FALSE),
('GRWD', 'Ghorpadi', FALSE, FALSE),
('HPR', 'Hirapur', FALSE, FALSE),
('HSL', 'Hissar', FALSE, FALSE),
('INP', 'Indapur', FALSE, FALSE),
('JBC', 'Jambhrun', FALSE, FALSE),
('JITE', 'Jite', FALSE, FALSE),
('KAD', 'Khandala', FALSE, FALSE),
('KARD', 'Kaman Road', FALSE, FALSE),
('KASU', 'Kasurdi', FALSE, FALSE),
('KBSN', 'Khandabar', FALSE, FALSE),
('KDV', 'Khardi', FALSE, FALSE),
('KDVI', 'Kudavdi', FALSE, FALSE),
('KE', 'Kasbe Sukene', FALSE, FALSE),
('KFD', 'Khed', FALSE, FALSE),
('KHBV', 'Khadbav', FALSE, FALSE),
('KHED', 'Khed', FALSE, FALSE),
('KJ', 'Kopargaon', FALSE, FALSE),
('KJRD', 'Kanjurmarg', FALSE, FALSE),
('KK', 'Kirkee', FALSE, FALSE),
('KLBN', 'Kalbani', FALSE, FALSE),
('KLMG', 'Kalamboli', FALSE, FALSE),
('KLVA', 'Kalva', FALSE, FALSE),
('KMAH', 'Kamthe', FALSE, FALSE),
('KMST', 'Kamshet', FALSE, FALSE),
('KNHE', 'Kanhe', FALSE, FALSE),
('KOL', 'Kolad', FALSE, FALSE),
('KOPR', 'Kopar', FALSE, FALSE),
('KSRA', 'Kasara', FALSE, TRUE),
('KSWD', 'Khaswadi', FALSE, FALSE),
('KW', 'Khadki', FALSE, FALSE),
('LS', 'Lasalgaon', FALSE, FALSE),
('LT', 'Lahavit', FALSE, FALSE),
('LNLB', 'Lonavala Bypass', FALSE, FALSE),
('LNLX', 'Lonavala Extension', FALSE, FALSE),
('MBQ', 'Mumbra', FALSE, FALSE),
('MHLC', 'Mahalaxmi', FALSE, FALSE),
('MLND', 'Mulund', FALSE, FALSE),
('MMR', 'Manmad', FALSE, TRUE),
('MNI', 'Mangaon', FALSE, FALSE),
('MSD', 'Masjid', FALSE, FALSE),
('MTN', 'Matunga', FALSE, FALSE),
('MVL', 'Malavli', FALSE, FALSE),
('MWD', 'Malwadi', FALSE, FALSE),
('MYJ', 'Mariyahu', FALSE, FALSE),
('NGD', 'Nagda', FALSE, FALSE),
('NGN', 'Naginamari', FALSE, FALSE),
('NGTN', 'Nagothane', FALSE, FALSE),
('NHU', 'Nahur', FALSE, FALSE),
('NI', 'Nira', FALSE, FALSE),
('NIIJ', 'Nilje', FALSE, FALSE),
('NK', 'Nasik', FALSE, TRUE),
('NNCN', 'Nandur Nandanbanan', FALSE, FALSE),
('NR', 'Niphad', FALSE, FALSE),
('NRL', 'Neral', FALSE, TRUE),
('NVRD', 'Navli', FALSE, FALSE),
('ODHA', 'Odhavram', FALSE, FALSE),
('OMB', 'Umbermali', FALSE, FALSE),
('PC', 'Pachora', FALSE, FALSE),
('PDI', 'Palasdhari', FALSE, FALSE),
('PEN', 'Pen', FALSE, FALSE),
('PHQ', 'Phulambri', FALSE, FALSE),
('PI', 'Phur', FALSE, FALSE),
('PJN', 'Panjim', FALSE, FALSE),
('PKE', 'Pokra', FALSE, FALSE),
('PMP', 'Pimpri', FALSE, FALSE),
('PNV', 'Puntamba', FALSE, FALSE),
('PNVC', 'Puntamba C', FALSE, FALSE),
('PR', 'Parel', FALSE, FALSE),
('PYJE', 'Panvel', FALSE, FALSE),
('ROHA', 'Roha', FALSE, TRUE),
('SAPE', 'Sangmeshwar', FALSE, FALSE),
('SGR', 'Sawantwadi Road', FALSE, FALSE),
('SHAD', 'Shahad', FALSE, FALSE),
('SHLU', 'Sheluwadi', FALSE, FALSE),
('SION', 'Sion', FALSE, FALSE),
('SLRW', 'Shelar Wadi', FALSE, FALSE),
('SMNE', 'Somnathnagar', FALSE, FALSE),
('SNRD', 'Sandhurst Road', FALSE, FALSE),
('SS', 'Savda', FALSE, FALSE),
('SUM', 'Surat', FALSE, FALSE),
('SVX', 'Sawantwadi', FALSE, FALSE),
('SVJR', 'Shivajinagar', FALSE, FALSE),
('TGN', 'Talegaon', FALSE, FALSE),
('THK', 'Thakurli', FALSE, FALSE),
('THS', 'Titwala', FALSE, FALSE),
('TKW', 'Takli', FALSE, FALSE),
('TLA', 'Tilaknagar', FALSE, FALSE),
('TPND', 'Turbhe', FALSE, FALSE),
('TRW', 'Tar Road', FALSE, FALSE),
('UBCN', 'Umbermali Camp', FALSE, FALSE),
('UGN', 'Udgir', FALSE, FALSE),
('UKC', 'Ukshi', FALSE, FALSE),
('ULNR', 'Ulhasnagar', FALSE, FALSE),
('VDN', 'Vadgaon', FALSE, FALSE),
('VEER', 'Veer', FALSE, FALSE),
('VGI', 'Vangani', FALSE, FALSE),
('VGL', 'Varangaon', FALSE, FALSE),
('VINH', 'Vinholi', FALSE, FALSE),
('VK', 'Vikhroli', FALSE, FALSE),
('VLDI', 'Vitthalwadi', FALSE, FALSE),
('VSD', 'Vasind', FALSE, FALSE),
('WB', 'Wadi Bunder', FALSE, FALSE)
ON DUPLICATE KEY UPDATE station_name = VALUES(station_name);

-- =============================================================================
-- TABLE 4: div_train_aliases - Train Renumbering History
-- =============================================================================
-- Tracks when trains are renumbered (e.g., 12519 → 15659)
-- Used for historical lookups and backward compatibility
CREATE TABLE IF NOT EXISTS div_train_aliases (
    old_train_no VARCHAR(10) PRIMARY KEY,
    new_train_no VARCHAR(10) NOT NULL,
    renamed_date DATE,                      -- When the renumbering took effect
    INDEX idx_new (new_train_no)
);

-- Seed known train renumberings (as of 2026-05-20)
INSERT INTO div_train_aliases (old_train_no, new_train_no) VALUES
('12519', '15659'),
('12520', '15660'),
('12617', '19301'),
('12618', '19302'),
('17031', '17003'),
('17032', '17004')
ON DUPLICATE KEY UPDATE new_train_no = VALUES(new_train_no);

-- Show counts
SELECT 'div_stations' as table_name, COUNT(*) as row_count FROM div_stations
UNION ALL
SELECT 'div_train_aliases' as table_name, COUNT(*) as row_count FROM div_train_aliases;
