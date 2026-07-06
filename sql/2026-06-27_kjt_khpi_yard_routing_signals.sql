-- KJT-KHPI yard diversion-route signals (routing-only, no book rows)
-- Date: 2026-06-27
-- 28 signals (16 DN KHPI + 12 UP KHPI) from kjt_khpi_dn.xlsx / kjt_khpi_up.xlsx.
-- line overridden DN SE/UP SE -> DN KHPI/UP KHPI (KJT-KHPI convention). Boundary SE signals
-- KJT S-2 (KYN-KJT/DN SE) and KJT S-142 (KYN-KJT/UP SE) EXCLUDED. Enables KJT->PDI route resolution.
-- Idempotent: ON DUPLICATE KEY UPDATE on uk (normalized_signal_number, section, line).

INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, technical_remarks, visibility_distance_m, sighting_remarks, is_active)
VALUES
  ('KJT S-14','KJTS14','KJT','Karjat','KJT-KHPI','DN KHPI','DN','99/5',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,3,2,'RI: L1=S-38; L2=S-36/37; L3=S-16; R1=S-28; R2=S-21',NULL,NULL,NULL,1),
  ('KJT S-23','KJTS23','KJT','Karjat','KJT-KHPI','DN KHPI','DN','KJT 1083',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,3,0,'RI: L1= S-54; L2= S-47; L3= S-46',NULL,NULL,NULL,1),
  ('KJT S-22','KJTS22','KJT','Karjat','KJT-KHPI','DN KHPI','DN','PF-3 STR','KJT/1083',NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,0,'RI: L1= S-46/47/54; L2= S-28',NULL,NULL,NULL,1),
  ('KJT S-21','KJTS21','KJT','Karjat','KJT-KHPI','DN KHPI','DN','PF-2 STR',NULL,NULL,'Manual',NULL,'Right','Unknown',NULL,1,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,1),
  ('KJT S-28','KJTS28','KJT','Karjat','KJT-KHPI','DN KHPI','DN','100/03','100/03',NULL,'Manual',NULL,'Right','Unknown',NULL,1,0,0,0,0,0,0,2,2,'RI: L1=S-39; L2=S-38; R1=S-46/47/54; R2=S-55',NULL,NULL,NULL,1),
  ('KJT S-32','KJTS32','KJT','Karjat','KJT-KHPI','DN KHPI','DN','100-15',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,0,0,NULL,NULL,NULL,NULL,1),
  ('KJT S-36','KJTS36','KJT','Karjat','KJT-KHPI','DN KHPI','DN',NULL,NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,0,3,'RI: R1= S-62; R2=S-63; R3= S-64',NULL,NULL,NULL,1),
  ('KJT S-37','KJTS37','KJT','Karjat','KJT-KHPI','DN KHPI','DN',NULL,NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,0,3,'RI: R1= S-62; R2=S-63; R3= S-64',NULL,NULL,NULL,1),
  ('KJT S-39','KJTS39','KJT','Karjat','KJT-KHPI','DN KHPI','DN','100/30',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,1,2,'RI: L1=S-61; R1=S-63; R2=S-64',NULL,NULL,NULL,1),
  ('KJT S-42','KJTS42','KJT','Karjat','KJT-KHPI','DN KHPI','DN','101/303','101/303',NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,1,'RI: L1=S-62; L2=S-61; R1=S-64',NULL,NULL,NULL,1),
  ('KJT S-46','KJTS46','KJT','Karjat','KJT-KHPI','DN KHPI','DN',NULL,NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,1,'RI: L1=S-62; L2=S-61; R1=S-64',NULL,NULL,NULL,1),
  ('KJT S-47','KJTS47','KJT','Karjat','KJT-KHPI','DN KHPI','DN',NULL,NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,1,'RI: L1=S-62; L2=S-61; R1=S-64',NULL,NULL,NULL,1),
  ('KJT S-54','KJTS54','KJT','Karjat','KJT-KHPI','DN KHPI','DN',NULL,NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,1,'RI: L1=S-62; L2=S-61; R1=S-64',NULL,NULL,NULL,1),
  ('KJT S-55','KJTS55','KJT','Karjat','KJT-KHPI','DN KHPI','DN','101/315','101/315',NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,3,0,'RI: L1= S-63; L2= S-62; L3= S-61',NULL,NULL,NULL,1),
  ('KJT S-64','KJTS64','KJT','Karjat','KJT-KHPI','DN KHPI','DN','101/355','101/355',NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,0,0,NULL,NULL,NULL,NULL,1),
  ('PDI S-4','PDIS4','PDI','Palasdhari','KJT-KHPI','DN KHPI','DN','102/301','102/301',NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,0,0,NULL,NULL,NULL,NULL,1),
  ('KJT S-72','KJTS72','KJT','Karjat','KJT-KHPI','UP KHPI','UP','102/303',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,1,'RI: L1=S-102; L2=S-82; R1=S-87',NULL,NULL,NULL,1),
  ('KJT S-81','KJTS81','KJT','Karjat','KJT-KHPI','UP KHPI','UP','101/317',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,0,'RI: L1=RD-4; L2=RD-5',NULL,NULL,NULL,1),
  ('KJT S-87','KJTS87','KJT','Karjat','KJT-KHPI','UP KHPI','UP','101/243',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,1,0,'RI: L1=S-105',NULL,NULL,NULL,1),
  ('KJT S-102','KJTS102','KJT','Karjat','KJT-KHPI','UP KHPI','UP','KJT/1123',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,1,'RI: L1=S-132; L2=S-131; R1=S-112',NULL,NULL,NULL,1),
  ('KJT S-103','KJTS103','KJT','Karjat','KJT-KHPI','UP KHPI','UP','100/17',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,1,'RI: L1=S-132; L2=S-131; R1=S-112',NULL,NULL,NULL,1),
  ('KJT S-104','KJTS104','KJT','Karjat','KJT-KHPI','UP KHPI','UP','100/19',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,2,1,'RI: L1=S-132; L2=S-131; R1=S-112',NULL,NULL,NULL,1),
  ('KJT S-105','KJTS105','KJT','Karjat','KJT-KHPI','UP KHPI','UP','100/19',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,0,0,NULL,NULL,NULL,NULL,1),
  ('KJT S-106','KJTS106','KJT','Karjat','KJT-KHPI','UP KHPI','UP','100/19',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,1,1,'RI: L1=S-112; R1=S-137',NULL,NULL,NULL,1),
  ('KJT S-112','KJTS112','KJT','Karjat','KJT-KHPI','UP KHPI','UP','100/7',NULL,NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,1,2,'RI: L1=PF-3; R1=S-135; R2=S-137',NULL,NULL,NULL,1),
  ('KJT S-133','KJTS133','KJT','Karjat','KJT-KHPI','UP KHPI','UP','EMU PF STR','KJT /1033',NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,1,0,'RI: L1=S-141',NULL,NULL,NULL,1),
  ('KJT S-134','KJTS134','KJT','Karjat','KJT-KHPI','UP KHPI','UP','PF-2 STR','99/19',NULL,'Manual',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,1,0,'RI: L1=S-141',NULL,NULL,NULL,1),
  ('KJT S-137','KJTS137','KJT','Karjat','KJT-KHPI','UP KHPI','UP','PF-1 STR','99/19',NULL,'Manual',NULL,'Right','Unknown',NULL,1,0,0,0,0,0,0,1,0,'RI: L1=S-141',NULL,NULL,NULL,1)
ON DUPLICATE KEY UPDATE
  station_code=VALUES(station_code), station_name=VALUES(station_name),
  location_text=VALUES(location_text), km_text=VALUES(km_text), km_from_csmt=VALUES(km_from_csmt),
  signal_type=VALUES(signal_type), signal_function=VALUES(signal_function), placement=VALUES(placement),
  on_curve=VALUES(on_curve), is_active=VALUES(is_active);

-- Aliases (best-effort; global unique key on normalized_alias)
INSERT IGNORE INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence)
SELECT id, signal_number, normalized_signal_number, 'excel_import', 'HIGH'
  FROM div_signals
 WHERE section='KJT-KHPI' AND line IN ('DN KHPI','UP KHPI')
   AND signal_type='Manual' AND signal_function IS NULL;
