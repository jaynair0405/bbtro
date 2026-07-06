-- ============================================
-- LRD Beats Migration: JSON to Database
-- Clears existing data and inserts all 40 beats from lrd_beats.json
-- Created: 2026-02-18
-- ============================================

-- Step 1: Clear existing data (stations first due to FK)
DELETE FROM div_lrd_section_stations;
DELETE FROM div_lrd_sections;

-- Step 2: Insert all beats/sections
-- PNVL Specific (12 sections)
INSERT INTO div_lrd_sections (section_code, section_name, office, is_active) VALUES
('ROHA_PNVL', 'Roha to Panvel', 'PNVL', 1),
('PNVL_ROHA', 'Panvel to Roha', 'PNVL', 1),
('TVSG_PNVL', 'Tivsa to Panvel', 'PNVL', 1),
('PNVL_TVSG', 'Panvel to Tivsa', 'PNVL', 1),
('JNPT_PNVL', 'JNPT to Panvel', 'PNVL', 1),
('PNVL_JNPT', 'Panvel to JNPT', 'PNVL', 1),
('BPCL_PNVL', 'BPCL to Panvel', 'PNVL', 1),
('PNVL_BPCL', 'Panvel to BPCL', 'PNVL', 1),
('KJT_PNVL', 'Karjat to Panvel (Harbour)', 'PNVL', 1),
('PNVL_KJT', 'Panvel to Karjat (Harbour)', 'PNVL', 1),
('PNVL_BSR', 'Panvel to Vasai Road', 'PNVL', 1),
('BSR_PNVL', 'Vasai Road to Panvel', 'PNVL', 1),

-- KYN Specific (20 sections)
('KYN_IGP', 'Kalyan to Igatpuri', 'KYN', 1),
('IGP_KYN', 'Igatpuri to Kalyan', 'KYN', 1),
('KYN_KJT', 'Kalyan to Karjat', 'KYN', 1),
('KJT_KYN', 'Karjat to Kalyan', 'KYN', 1),
('PNVL_BSR_KYN', 'Panvel to Vasai Road (Chordline)', 'KYN', 1),
('BSR_PNVL_KYN', 'Vasai Road to Panvel (Chordline)', 'KYN', 1),
('KYN_DIVA', 'Kalyan to Diva', 'KYN', 1),
('DIVA_KYN', 'Diva to Kalyan', 'KYN', 1),
('KYN_CSMT', 'Kalyan to CSMT', 'KYN', 1),
('CSMT_KYN', 'CSMT to Kalyan', 'KYN', 1),
('KYN_TMBY', 'Kalyan to Trombay', 'KYN', 1),
('TMBY_KYN', 'Trombay to Kalyan', 'KYN', 1),
('KYN_LTT', 'Kalyan to Lokmanya Tilak Terminus', 'KYN', 1),
('LTT_KYN', 'Lokmanya Tilak Terminus to Kalyan', 'KYN', 1),
('KYN_TAPG', 'Kalyan to Talpgaon', 'KYN', 1),
('TAPG_KYN', 'Talpgaon to Kalyan', 'KYN', 1),
('KYN_VDLR', 'Kalyan to Vadala Road', 'KYN', 1),
('VDLR_KYN', 'Vadala Road to Kalyan', 'KYN', 1),

-- SHARED (10 sections)
('KYN_BSR', 'Kalyan to Vasai Road', 'SHARED', 1),
('BSR_KYN', 'Vasai Road to Kalyan', 'SHARED', 1),
('KJT_BVT', 'Karjat to Bhivpuri (Ghat)', 'SHARED', 1),
('BVT_KJT', 'Bhivpuri to Karjat (Ghat)', 'SHARED', 1),
('PNVL_DIVA', 'Panvel to Diva', 'SHARED', 1),
('DIVA_PNVL', 'Diva to Panvel', 'SHARED', 1),
('KYN_PNVL', 'Kalyan to Panvel', 'SHARED', 1),
('PNVL_KYN', 'Panvel to Kalyan', 'SHARED', 1);

-- Step 3: Insert station sequences for each section
-- ROHA_PNVL: ROHA -> NGTN -> KASU -> PEN -> JITE -> APTA -> RSYI -> SMNE -> PNVL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('ROHA_PNVL', 'ROHA', 1), ('ROHA_PNVL', 'NGTN', 2), ('ROHA_PNVL', 'KASU', 3),
('ROHA_PNVL', 'PEN', 4), ('ROHA_PNVL', 'JITE', 5), ('ROHA_PNVL', 'APTA', 6),
('ROHA_PNVL', 'RSYI', 7), ('ROHA_PNVL', 'SMNE', 8), ('ROHA_PNVL', 'PNVL', 9);

-- PNVL_ROHA: PNVL -> SMNE -> RSYI -> APTA -> JITE -> PEN -> KASU -> NGTN -> ROHA
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('PNVL_ROHA', 'PNVL', 1), ('PNVL_ROHA', 'SMNE', 2), ('PNVL_ROHA', 'RSYI', 3),
('PNVL_ROHA', 'APTA', 4), ('PNVL_ROHA', 'JITE', 5), ('PNVL_ROHA', 'PEN', 6),
('PNVL_ROHA', 'KASU', 7), ('PNVL_ROHA', 'NGTN', 8), ('PNVL_ROHA', 'ROHA', 9);

-- TVSG_PNVL: TVSG -> PPDP -> JSWD -> PEN -> JITE -> APTA -> RSYI -> SMNE -> PNVL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('TVSG_PNVL', 'TVSG', 1), ('TVSG_PNVL', 'PPDP', 2), ('TVSG_PNVL', 'JSWD', 3),
('TVSG_PNVL', 'PEN', 4), ('TVSG_PNVL', 'JITE', 5), ('TVSG_PNVL', 'APTA', 6),
('TVSG_PNVL', 'RSYI', 7), ('TVSG_PNVL', 'SMNE', 8), ('TVSG_PNVL', 'PNVL', 9);

-- PNVL_TVSG: PNVL -> SMNE -> RSYI -> APTA -> JITE -> PEN -> JSWD -> PPDP -> TVSG
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('PNVL_TVSG', 'PNVL', 1), ('PNVL_TVSG', 'SMNE', 2), ('PNVL_TVSG', 'RSYI', 3),
('PNVL_TVSG', 'APTA', 4), ('PNVL_TVSG', 'JITE', 5), ('PNVL_TVSG', 'PEN', 6),
('PNVL_TVSG', 'JSWD', 7), ('PNVL_TVSG', 'PPDP', 8), ('PNVL_TVSG', 'TVSG', 9);

-- JNPT_PNVL: JNPT -> HLY -> JSLE -> DPL -> PNVL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('JNPT_PNVL', 'JNPT', 1), ('JNPT_PNVL', 'HLY', 2), ('JNPT_PNVL', 'JSLE', 3),
('JNPT_PNVL', 'DPL', 4), ('JNPT_PNVL', 'PNVL', 5);

-- PNVL_JNPT: PNVL -> DPL -> JSLE -> HLY -> JNPT
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('PNVL_JNPT', 'PNVL', 1), ('PNVL_JNPT', 'DPL', 2), ('PNVL_JNPT', 'JSLE', 3),
('PNVL_JNPT', 'HLY', 4), ('PNVL_JNPT', 'JNPT', 5);

-- BPCL_PNVL: BPCL -> JSLE -> DPL -> PNVL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('BPCL_PNVL', 'BPCL', 1), ('BPCL_PNVL', 'JSLE', 2), ('BPCL_PNVL', 'DPL', 3),
('BPCL_PNVL', 'PNVL', 4);

-- PNVL_BPCL: PNVL -> DPL -> JSLE -> BPCL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('PNVL_BPCL', 'PNVL', 1), ('PNVL_BPCL', 'DPL', 2), ('PNVL_BPCL', 'JSLE', 3),
('PNVL_BPCL', 'BPCL', 4);

-- KJT_PNVL: KJT -> CHOK -> MHPE -> PNVL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KJT_PNVL', 'KJT', 1), ('KJT_PNVL', 'CHOK', 2), ('KJT_PNVL', 'MHPE', 3),
('KJT_PNVL', 'PNVL', 4);

-- PNVL_KJT: PNVL -> MHPE -> CHOK -> KJT
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('PNVL_KJT', 'PNVL', 1), ('PNVL_KJT', 'MHPE', 2), ('PNVL_KJT', 'CHOK', 3),
('PNVL_KJT', 'KJT', 4);

-- PNVL_BSR: PNVL -> KLMG -> TPND -> NIIJ -> DTVL -> DTCC -> KOPR -> BIRD -> KHBV -> KARD -> BSR
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('PNVL_BSR', 'PNVL', 1), ('PNVL_BSR', 'KLMG', 2), ('PNVL_BSR', 'TPND', 3),
('PNVL_BSR', 'NIIJ', 4), ('PNVL_BSR', 'DTVL', 5), ('PNVL_BSR', 'DTCC', 6),
('PNVL_BSR', 'KOPR', 7), ('PNVL_BSR', 'BIRD', 8), ('PNVL_BSR', 'KHBV', 9),
('PNVL_BSR', 'KARD', 10), ('PNVL_BSR', 'BSR', 11);

-- BSR_PNVL: BSR -> KARD -> KHBV -> BIRD -> KOPR -> DTCC -> DTVL -> NIIJ -> TPND -> KLMG -> PNVL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('BSR_PNVL', 'BSR', 1), ('BSR_PNVL', 'KARD', 2), ('BSR_PNVL', 'KHBV', 3),
('BSR_PNVL', 'BIRD', 4), ('BSR_PNVL', 'KOPR', 5), ('BSR_PNVL', 'DTCC', 6),
('BSR_PNVL', 'DTVL', 7), ('BSR_PNVL', 'NIIJ', 8), ('BSR_PNVL', 'TPND', 9),
('BSR_PNVL', 'KLMG', 10), ('BSR_PNVL', 'PNVL', 11);

-- KYN_IGP: KYN -> SHAD -> ABY -> TLA -> KDV -> VSD -> ASO -> ATG -> THS -> KE -> OMB -> KSRA -> TGR3 -> TGR2 -> TGR1 -> IGP
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_IGP', 'KYN', 1), ('KYN_IGP', 'SHAD', 2), ('KYN_IGP', 'ABY', 3),
('KYN_IGP', 'TLA', 4), ('KYN_IGP', 'KDV', 5), ('KYN_IGP', 'VSD', 6),
('KYN_IGP', 'ASO', 7), ('KYN_IGP', 'ATG', 8), ('KYN_IGP', 'THS', 9),
('KYN_IGP', 'KE', 10), ('KYN_IGP', 'OMB', 11), ('KYN_IGP', 'KSRA', 12),
('KYN_IGP', 'TGR3', 13), ('KYN_IGP', 'TGR2', 14), ('KYN_IGP', 'TGR1', 15),
('KYN_IGP', 'IGP', 16);

-- IGP_KYN: IGP -> TGR1 -> TGR2 -> TGR3 -> KSRA -> OMB -> KE -> THS -> ATG -> ASO -> VSD -> KDV -> TLA -> ABY -> SHAD -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('IGP_KYN', 'IGP', 1), ('IGP_KYN', 'TGR1', 2), ('IGP_KYN', 'TGR2', 3),
('IGP_KYN', 'TGR3', 4), ('IGP_KYN', 'KSRA', 5), ('IGP_KYN', 'OMB', 6),
('IGP_KYN', 'KE', 7), ('IGP_KYN', 'THS', 8), ('IGP_KYN', 'ATG', 9),
('IGP_KYN', 'ASO', 10), ('IGP_KYN', 'VSD', 11), ('IGP_KYN', 'KDV', 12),
('IGP_KYN', 'TLA', 13), ('IGP_KYN', 'ABY', 14), ('IGP_KYN', 'SHAD', 15),
('IGP_KYN', 'KYN', 16);

-- KYN_KJT: KYN -> VLDI -> ULNR -> ABH -> BUD -> VGI -> NRL -> BVS -> KJT
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_KJT', 'KYN', 1), ('KYN_KJT', 'VLDI', 2), ('KYN_KJT', 'ULNR', 3),
('KYN_KJT', 'ABH', 4), ('KYN_KJT', 'BUD', 5), ('KYN_KJT', 'VGI', 6),
('KYN_KJT', 'NRL', 7), ('KYN_KJT', 'BVS', 8), ('KYN_KJT', 'KJT', 9);

-- KJT_KYN: KJT -> BVS -> NRL -> VGI -> BUD -> ABH -> ULNR -> VLDI -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KJT_KYN', 'KJT', 1), ('KJT_KYN', 'BVS', 2), ('KJT_KYN', 'NRL', 3),
('KJT_KYN', 'VGI', 4), ('KJT_KYN', 'BUD', 5), ('KJT_KYN', 'ABH', 6),
('KJT_KYN', 'ULNR', 7), ('KJT_KYN', 'VLDI', 8), ('KJT_KYN', 'KYN', 9);

-- PNVL_BSR_KYN: PNVL -> KLMG -> TPND -> NIIJ -> DTVL -> DTCC -> KOPR -> BIRD -> KHBV -> KARD -> BSR
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('PNVL_BSR_KYN', 'PNVL', 1), ('PNVL_BSR_KYN', 'KLMG', 2), ('PNVL_BSR_KYN', 'TPND', 3),
('PNVL_BSR_KYN', 'NIIJ', 4), ('PNVL_BSR_KYN', 'DTVL', 5), ('PNVL_BSR_KYN', 'DTCC', 6),
('PNVL_BSR_KYN', 'KOPR', 7), ('PNVL_BSR_KYN', 'BIRD', 8), ('PNVL_BSR_KYN', 'KHBV', 9),
('PNVL_BSR_KYN', 'KARD', 10), ('PNVL_BSR_KYN', 'BSR', 11);

-- BSR_PNVL_KYN: BSR -> KARD -> KHBV -> BIRD -> KOPR -> DTCC -> DTVL -> NIIJ -> TPND -> KLMG -> PNVL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('BSR_PNVL_KYN', 'BSR', 1), ('BSR_PNVL_KYN', 'KARD', 2), ('BSR_PNVL_KYN', 'KHBV', 3),
('BSR_PNVL_KYN', 'BIRD', 4), ('BSR_PNVL_KYN', 'KOPR', 5), ('BSR_PNVL_KYN', 'DTCC', 6),
('BSR_PNVL_KYN', 'DTVL', 7), ('BSR_PNVL_KYN', 'NIIJ', 8), ('BSR_PNVL_KYN', 'TPND', 9),
('BSR_PNVL_KYN', 'KLMG', 10), ('BSR_PNVL_KYN', 'PNVL', 11);

-- KYN_DIVA: KYN -> DI -> DIVA
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_DIVA', 'KYN', 1), ('KYN_DIVA', 'DI', 2), ('KYN_DIVA', 'DIVA', 3);

-- DIVA_KYN: DIVA -> DI -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('DIVA_KYN', 'DIVA', 1), ('DIVA_KYN', 'DI', 2), ('DIVA_KYN', 'KYN', 3);

-- KYN_CSMT: KYN -> DI -> DIVA -> MBQ -> KLVA -> TNA -> MLND -> BND -> VK -> GC -> VVH -> CLA -> SIN -> MTN -> DR -> PR -> BY -> SNRD -> WB -> CSMT
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_CSMT', 'KYN', 1), ('KYN_CSMT', 'DI', 2), ('KYN_CSMT', 'DIVA', 3),
('KYN_CSMT', 'MBQ', 4), ('KYN_CSMT', 'KLVA', 5), ('KYN_CSMT', 'TNA', 6),
('KYN_CSMT', 'MLND', 7), ('KYN_CSMT', 'BND', 8), ('KYN_CSMT', 'VK', 9),
('KYN_CSMT', 'GC', 10), ('KYN_CSMT', 'VVH', 11), ('KYN_CSMT', 'CLA', 12),
('KYN_CSMT', 'SIN', 13), ('KYN_CSMT', 'MTN', 14), ('KYN_CSMT', 'DR', 15),
('KYN_CSMT', 'PR', 16), ('KYN_CSMT', 'BY', 17), ('KYN_CSMT', 'SNRD', 18),
('KYN_CSMT', 'WB', 19), ('KYN_CSMT', 'CSMT', 20);

-- CSMT_KYN: CSMT -> WB -> SNRD -> BY -> PR -> DR -> MTN -> SIN -> CLA -> VVH -> GC -> VK -> BND -> MLND -> TNA -> KLVA -> MBQ -> DIVA -> DI -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('CSMT_KYN', 'CSMT', 1), ('CSMT_KYN', 'WB', 2), ('CSMT_KYN', 'SNRD', 3),
('CSMT_KYN', 'BY', 4), ('CSMT_KYN', 'PR', 5), ('CSMT_KYN', 'DR', 6),
('CSMT_KYN', 'MTN', 7), ('CSMT_KYN', 'SIN', 8), ('CSMT_KYN', 'CLA', 9),
('CSMT_KYN', 'VVH', 10), ('CSMT_KYN', 'GC', 11), ('CSMT_KYN', 'VK', 12),
('CSMT_KYN', 'BND', 13), ('CSMT_KYN', 'MLND', 14), ('CSMT_KYN', 'TNA', 15),
('CSMT_KYN', 'KLVA', 16), ('CSMT_KYN', 'MBQ', 17), ('CSMT_KYN', 'DIVA', 18),
('CSMT_KYN', 'DI', 19), ('CSMT_KYN', 'KYN', 20);

-- KYN_TMBY: KYN -> DI -> DIVA -> TNA -> MLND -> NGSM -> BND -> VK -> GC -> VVH -> CLA -> TMBY
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_TMBY', 'KYN', 1), ('KYN_TMBY', 'DI', 2), ('KYN_TMBY', 'DIVA', 3),
('KYN_TMBY', 'TNA', 4), ('KYN_TMBY', 'MLND', 5), ('KYN_TMBY', 'NGSM', 6),
('KYN_TMBY', 'BND', 7), ('KYN_TMBY', 'VK', 8), ('KYN_TMBY', 'GC', 9),
('KYN_TMBY', 'VVH', 10), ('KYN_TMBY', 'CLA', 11), ('KYN_TMBY', 'TMBY', 12);

-- TMBY_KYN: TMBY -> CLA -> VVH -> GC -> VK -> BND -> NGSM -> MLND -> TNA -> DIVA -> DI -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('TMBY_KYN', 'TMBY', 1), ('TMBY_KYN', 'CLA', 2), ('TMBY_KYN', 'VVH', 3),
('TMBY_KYN', 'GC', 4), ('TMBY_KYN', 'VK', 5), ('TMBY_KYN', 'BND', 6),
('TMBY_KYN', 'NGSM', 7), ('TMBY_KYN', 'MLND', 8), ('TMBY_KYN', 'TNA', 9),
('TMBY_KYN', 'DIVA', 10), ('TMBY_KYN', 'DI', 11), ('TMBY_KYN', 'KYN', 12);

-- KYN_LTT: KYN -> DI -> DIVA -> TNA -> MLND -> NGSM -> BND -> VK -> GC -> VVH -> LTT
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_LTT', 'KYN', 1), ('KYN_LTT', 'DI', 2), ('KYN_LTT', 'DIVA', 3),
('KYN_LTT', 'TNA', 4), ('KYN_LTT', 'MLND', 5), ('KYN_LTT', 'NGSM', 6),
('KYN_LTT', 'BND', 7), ('KYN_LTT', 'VK', 8), ('KYN_LTT', 'GC', 9),
('KYN_LTT', 'VVH', 10), ('KYN_LTT', 'LTT', 11);

-- LTT_KYN: LTT -> VVH -> GC -> VK -> BND -> NGSM -> MLND -> TNA -> DIVA -> DI -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('LTT_KYN', 'LTT', 1), ('LTT_KYN', 'VVH', 2), ('LTT_KYN', 'GC', 3),
('LTT_KYN', 'VK', 4), ('LTT_KYN', 'BND', 5), ('LTT_KYN', 'NGSM', 6),
('LTT_KYN', 'MLND', 7), ('LTT_KYN', 'TNA', 8), ('LTT_KYN', 'DIVA', 9),
('LTT_KYN', 'DI', 10), ('LTT_KYN', 'KYN', 11);

-- KYN_TAPG: KYN -> DI -> DIVA -> PSK -> TAPG
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_TAPG', 'KYN', 1), ('KYN_TAPG', 'DI', 2), ('KYN_TAPG', 'DIVA', 3),
('KYN_TAPG', 'PSK', 4), ('KYN_TAPG', 'TAPG', 5);

-- TAPG_KYN: TAPG -> PSK -> DIVA -> DI -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('TAPG_KYN', 'TAPG', 1), ('TAPG_KYN', 'PSK', 2), ('TAPG_KYN', 'DIVA', 3),
('TAPG_KYN', 'DI', 4), ('TAPG_KYN', 'KYN', 5);

-- KYN_VDLR: KYN -> DI -> DIVA -> TNA -> MLND -> NGSM -> BND -> VK -> GC -> VVH -> CLA -> CNF -> GTBN -> VDLR
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_VDLR', 'KYN', 1), ('KYN_VDLR', 'DI', 2), ('KYN_VDLR', 'DIVA', 3),
('KYN_VDLR', 'TNA', 4), ('KYN_VDLR', 'MLND', 5), ('KYN_VDLR', 'NGSM', 6),
('KYN_VDLR', 'BND', 7), ('KYN_VDLR', 'VK', 8), ('KYN_VDLR', 'GC', 9),
('KYN_VDLR', 'VVH', 10), ('KYN_VDLR', 'CLA', 11), ('KYN_VDLR', 'CNF', 12),
('KYN_VDLR', 'GTBN', 13), ('KYN_VDLR', 'VDLR', 14);

-- VDLR_KYN: VDLR -> GTBN -> CNF -> CLA -> VVH -> GC -> VK -> BND -> NGSM -> MLND -> TNA -> DIVA -> DI -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('VDLR_KYN', 'VDLR', 1), ('VDLR_KYN', 'GTBN', 2), ('VDLR_KYN', 'CNF', 3),
('VDLR_KYN', 'CLA', 4), ('VDLR_KYN', 'VVH', 5), ('VDLR_KYN', 'GC', 6),
('VDLR_KYN', 'VK', 7), ('VDLR_KYN', 'BND', 8), ('VDLR_KYN', 'NGSM', 9),
('VDLR_KYN', 'MLND', 10), ('VDLR_KYN', 'TNA', 11), ('VDLR_KYN', 'DIVA', 12),
('VDLR_KYN', 'DI', 13), ('VDLR_KYN', 'KYN', 14);

-- SHARED sections
-- KYN_BSR: KYN -> DI -> KOPR -> BIRD -> KHBV -> KARD -> BSR
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_BSR', 'KYN', 1), ('KYN_BSR', 'DI', 2), ('KYN_BSR', 'KOPR', 3),
('KYN_BSR', 'BIRD', 4), ('KYN_BSR', 'KHBV', 5), ('KYN_BSR', 'KARD', 6),
('KYN_BSR', 'BSR', 7);

-- BSR_KYN: BSR -> KARD -> KHBV -> BIRD -> KOPR -> DI -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('BSR_KYN', 'BSR', 1), ('BSR_KYN', 'KARD', 2), ('BSR_KYN', 'KHBV', 3),
('BSR_KYN', 'BIRD', 4), ('BSR_KYN', 'KOPR', 5), ('BSR_KYN', 'DI', 6),
('BSR_KYN', 'KYN', 7);

-- KJT_BVT: KJT -> PDI -> JBC -> TKW -> MHLC -> KAD -> LNL -> BVT
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KJT_BVT', 'KJT', 1), ('KJT_BVT', 'PDI', 2), ('KJT_BVT', 'JBC', 3),
('KJT_BVT', 'TKW', 4), ('KJT_BVT', 'MHLC', 5), ('KJT_BVT', 'KAD', 6),
('KJT_BVT', 'LNL', 7), ('KJT_BVT', 'BVT', 8);

-- BVT_KJT: BVT -> LNL -> KAD -> MHLC -> NNCN -> JBC -> PDI -> KJT
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('BVT_KJT', 'BVT', 1), ('BVT_KJT', 'LNL', 2), ('BVT_KJT', 'KAD', 3),
('BVT_KJT', 'MHLC', 4), ('BVT_KJT', 'NNCN', 5), ('BVT_KJT', 'JBC', 6),
('BVT_KJT', 'PDI', 7), ('BVT_KJT', 'KJT', 8);

-- PNVL_DIVA: PNVL -> KLMG -> TPND -> NIIJ -> DTVL -> DIVA
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('PNVL_DIVA', 'PNVL', 1), ('PNVL_DIVA', 'KLMG', 2), ('PNVL_DIVA', 'TPND', 3),
('PNVL_DIVA', 'NIIJ', 4), ('PNVL_DIVA', 'DTVL', 5), ('PNVL_DIVA', 'DIVA', 6);

-- DIVA_PNVL: DIVA -> DTVL -> NIIJ -> TPND -> KLMG -> PNVL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('DIVA_PNVL', 'DIVA', 1), ('DIVA_PNVL', 'DTVL', 2), ('DIVA_PNVL', 'NIIJ', 3),
('DIVA_PNVL', 'TPND', 4), ('DIVA_PNVL', 'KLMG', 5), ('DIVA_PNVL', 'PNVL', 6);

-- KYN_PNVL: KYN -> DI -> DTCC -> DTVL -> NIIJ -> TPND -> KLMG -> PNVL
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('KYN_PNVL', 'KYN', 1), ('KYN_PNVL', 'DI', 2), ('KYN_PNVL', 'DTCC', 3),
('KYN_PNVL', 'DTVL', 4), ('KYN_PNVL', 'NIIJ', 5), ('KYN_PNVL', 'TPND', 6),
('KYN_PNVL', 'KLMG', 7), ('KYN_PNVL', 'PNVL', 8);

-- PNVL_KYN: PNVL -> KLMG -> TPND -> NIIJ -> DTVL -> DTCC -> DI -> KYN
INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order) VALUES
('PNVL_KYN', 'PNVL', 1), ('PNVL_KYN', 'KLMG', 2), ('PNVL_KYN', 'TPND', 3),
('PNVL_KYN', 'NIIJ', 4), ('PNVL_KYN', 'DTVL', 5), ('PNVL_KYN', 'DTCC', 6),
('PNVL_KYN', 'DI', 7), ('PNVL_KYN', 'KYN', 8);

-- Verification
SELECT 'Sections count:' as info, COUNT(*) as count FROM div_lrd_sections;
SELECT 'Stations count:' as info, COUNT(*) as count FROM div_lrd_section_stations;
SELECT office, COUNT(*) as sections FROM div_lrd_sections GROUP BY office;
