-- NEWLY ADDED SIGNALS sheet, tab "IGP YARD" (13 signals, section "IGP YD", no line). User decisions 2026-09-29.
-- DN (towards MMR): S-69 (PF-4 starter) and S-61/62/63 (DN yard lines 1-3) are stored like the PF-1/2/3 starters
--   S-64/66/67: a copy at the end of KSRA-IGP DN NE and at the start of IGP-MMR DN NE, sharing one magnet.
--   S-71 (the sheet's "Common Starter", stored as 'Intermediate Starter') on IGP-MMR DN NE only, before S-87.
--   Routes: S-1 -> S-61 (L1) / S-62 (L2) / S-63 (L3) / S-69 (R3); S-2 (DN MID) -> S-69 (R2);
--           S-61/62/63, PF-1 S-64 and PF-4 S-69 -> S-71 -> S-87 (R1).  Parallel: S-64/66/67/69/61/62/63 (per page).
-- UP (towards KSRA): on BOTH UP NE and UP NE MID pages, sharing magnets (like S-32 / S-38).
--   PF starters: S-45 PF-1, S-40 PF-2 (with S-32 PF-3, S-38 PF-4); yard starters S-26/27/28/29/37; S-31 = AC engine line.
--   S-36 is NOT parallel: it follows S-38, for PF-4 only.  Page order: header, S-45, S-40, S-32, S-38, S-36,
--   S-26, S-27, S-28, S-29, S-31, S-37, S-58 / S-59.  Parallel (per page): S-45/40/32/38/26/27/28/29/31/37.
--   Routes: S-88 -> S-45 (R2) / S-40 (R1); each new starter -> S-58 (R1, UP NE copy) and -> S-59 (UP NE MID copy).
-- Undo: 2026-09-29_new_signals_sheet8_igp_yard_UNDO.sql
START TRANSACTION;
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-69', 'IGP', 'Igatpuri', 'KSRA-IGP', 'DN NE', 'DN', 'PF-4 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= IGP S-71', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS69');
SET @k69 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @k69;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'IGP-MMR', 'DN NE', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @k69;
SET @m69 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-61', 'IGP', 'Igatpuri', 'KSRA-IGP', 'DN NE', 'DN', 'DN YD LINE 1', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= IGP S-71', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS61');
SET @k61 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @k61;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'IGP-MMR', 'DN NE', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @k61;
SET @m61 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-62', 'IGP', 'Igatpuri', 'KSRA-IGP', 'DN NE', 'DN', 'DN YD LINE 2', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= IGP S-71', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS62');
SET @k62 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @k62;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'IGP-MMR', 'DN NE', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @k62;
SET @m62 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-63', 'IGP', 'Igatpuri', 'KSRA-IGP', 'DN NE', 'DN', 'DN YD LINE 3', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= IGP S-71', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS63');
SET @k63 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @k63;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'IGP-MMR', 'DN NE', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @k63;
SET @m63 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-71', 'IGP', 'Igatpuri', 'IGP-MMR', 'DN NE', 'DN', NULL, NULL, NULL, NULL, NULL, 'Manual', 'Intermediate Starter', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= IGP S-87', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS71');
SET @m71 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @m71;
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-45', 'IGP', 'Igatpuri', 'KSRA-IGP', 'UP NE', 'UP', 'PF-1 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= UP NE (IGP S-58)', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS45');
SET @u45 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @u45;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'KSRA-IGP', 'UP NE MID', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @u45;
SET @um45 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-40', 'IGP', 'Igatpuri', 'KSRA-IGP', 'UP NE', 'UP', 'PF-2 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= UP NE (IGP S-58)', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS40');
SET @u40 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @u40;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'KSRA-IGP', 'UP NE MID', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @u40;
SET @um40 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-26', 'IGP', 'Igatpuri', 'KSRA-IGP', 'UP NE', 'UP', NULL, NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= UP NE (IGP S-58)', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS26');
SET @u26 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @u26;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'KSRA-IGP', 'UP NE MID', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @u26;
SET @um26 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-27', 'IGP', 'Igatpuri', 'KSRA-IGP', 'UP NE', 'UP', NULL, NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= UP NE (IGP S-58)', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS27');
SET @u27 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @u27;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'KSRA-IGP', 'UP NE MID', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @u27;
SET @um27 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-28', 'IGP', 'Igatpuri', 'KSRA-IGP', 'UP NE', 'UP', NULL, NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= UP NE (IGP S-58)', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS28');
SET @u28 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @u28;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'KSRA-IGP', 'UP NE MID', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @u28;
SET @um28 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-29', 'IGP', 'Igatpuri', 'KSRA-IGP', 'UP NE', 'UP', NULL, NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Right', 'Unknown', NULL, 1, 0, 0, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= UP NE (IGP S-58)', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS29');
SET @u29 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @u29;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'KSRA-IGP', 'UP NE MID', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @u29;
SET @um29 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-31', 'IGP', 'Igatpuri', 'KSRA-IGP', 'UP NE', 'UP', 'AC ENGINE LINE', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= UP NE (IGP S-58)', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS31');
SET @u31 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @u31;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'KSRA-IGP', 'UP NE MID', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @u31;
SET @um31 = LAST_INSERT_ID();
INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('IGP S-37', 'IGP', 'Igatpuri', 'KSRA-IGP', 'UP NE', 'UP', NULL, NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 1, 0, 1, 'RI: R1= UP NE (IGP S-58)', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'IGPS37');
SET @u37 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id = @u37;
INSERT INTO div_signals (section, line, magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'KSRA-IGP', 'UP NE MID', magnet_id, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @u37;
SET @um37 = LAST_INSERT_ID();

SET @k1  = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND signal_number='IGP S-1');   SET @k2m = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='DN NE MID' AND direction='DN' AND signal_number='IGP S-2');
SET @k64 = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND signal_number='IGP S-64');  SET @k66 = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND signal_number='IGP S-66');  SET @k67 = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='DN NE' AND direction='DN' AND signal_number='IGP S-67');
SET @m64 = (SELECT id FROM div_signals WHERE section='IGP-MMR' AND line='DN NE' AND direction='DN' AND signal_number='IGP S-64');   SET @m66 = (SELECT id FROM div_signals WHERE section='IGP-MMR' AND line='DN NE' AND direction='DN' AND signal_number='IGP S-66');   SET @m67 = (SELECT id FROM div_signals WHERE section='IGP-MMR' AND line='DN NE' AND direction='DN' AND signal_number='IGP S-67');
SET @m87 = (SELECT id FROM div_signals WHERE section='IGP-MMR' AND line='DN NE' AND direction='DN' AND signal_number='IGP S-87');   SET @u88 = (SELECT id FROM div_signals WHERE section='IGP-MMR' AND line='UP NE' AND direction='UP' AND signal_number='IGP S-88');
SET @u32 = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND signal_number='IGP S-32');  SET @u38 = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND signal_number='IGP S-38');  SET @u58 = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='UP NE' AND direction='UP' AND signal_number='IGP S-58');
SET @um32 = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='UP NE MID' AND direction='UP' AND signal_number='IGP S-32'); SET @um38 = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='UP NE MID' AND direction='UP' AND signal_number='IGP S-38'); SET @um59 = (SELECT id FROM div_signals WHERE section='KSRA-IGP' AND line='UP NE MID' AND direction='UP' AND signal_number='IGP S-59');

SET @pg = (SELECT MAX(parallel_group_id) FROM div_signals);
UPDATE div_signals SET parallel_group_id = @pg + 1 WHERE id IN (@k64, @k66, @k67, @k69, @k61, @k62, @k63);
UPDATE div_signals SET parallel_group_id = @pg + 2 WHERE id IN (@m64, @m66, @m67, @m69, @m61, @m62, @m63);
UPDATE div_signals SET parallel_group_id = @pg + 3 WHERE id IN (@u45, @u40, @u32, @u38, @u26, @u27, @u28, @u29, @u31, @u37);
UPDATE div_signals SET parallel_group_id = @pg + 4 WHERE id IN (@um45, @um40, @um32, @um38, @um26, @um27, @um28, @um29, @um31, @um37);

SET @b_kdn = (SELECT id FROM div_signal_book_sections WHERE section_code = 'KSRA_IGP_DN_NE');
SET @b_mdn = (SELECT id FROM div_signal_book_sections WHERE section_code = 'IGP_MMR_DN_NE');
SET @b_up  = (SELECT id FROM div_signal_book_sections WHERE section_code = 'KSRA_IGP_UP_NE');
SET @b_upm = (SELECT id FROM div_signal_book_sections WHERE section_code = 'KSRA_IGP_UP_NE_MID');
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, station_code, station_name, text_color)
VALUES  (@b_kdn, 1920, 'SIGNAL', 'manual', @k69, 'IGP S-69', 'PF-4 STR', 'RI: R1= IGP S-71', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_kdn, 1940, 'SIGNAL', 'manual', @k61, 'IGP S-61', 'DN YD LINE 1', 'RI: R1= IGP S-71', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_kdn, 1960, 'SIGNAL', 'manual', @k62, 'IGP S-62', 'DN YD LINE 2', 'RI: R1= IGP S-71', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_kdn, 1980, 'SIGNAL', 'manual', @k63, 'IGP S-63', 'DN YD LINE 3', 'RI: R1= IGP S-71', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_mdn, 310, 'SIGNAL', 'manual', @m69, 'IGP S-69', 'PF-4 STR', 'RI: R1= IGP S-71', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_mdn, 320, 'SIGNAL', 'manual', @m61, 'IGP S-61', 'DN YD LINE 1', 'RI: R1= IGP S-71', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_mdn, 330, 'SIGNAL', 'manual', @m62, 'IGP S-62', 'DN YD LINE 2', 'RI: R1= IGP S-71', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_mdn, 340, 'SIGNAL', 'manual', @m63, 'IGP S-63', 'DN YD LINE 3', 'RI: R1= IGP S-71', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_mdn, 360, 'SIGNAL', 'manual', @m71, 'IGP S-71', NULL, 'COMMON STARTER. RI: R1= IGP S-87', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_up, 60, 'SIGNAL', 'manual', @u45, 'IGP S-45', 'PF-1 STR', 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_up, 80, 'SIGNAL', 'manual', @u40, 'IGP S-40', 'PF-2 STR', 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_up, 310, 'SIGNAL', 'manual', @u26, 'IGP S-26', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_up, 320, 'SIGNAL', 'manual', @u27, 'IGP S-27', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_up, 330, 'SIGNAL', 'manual', @u28, 'IGP S-28', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_up, 340, 'SIGNAL', 'manual', @u29, 'IGP S-29', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'RED'),
  (@b_up, 350, 'SIGNAL', 'manual', @u31, 'IGP S-31', 'AC ENGINE LINE', 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_up, 360, 'SIGNAL', 'manual', @u37, 'IGP S-37', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_upm, 60, 'SIGNAL', 'manual', @um45, 'IGP S-45', 'PF-1 STR', 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_upm, 80, 'SIGNAL', 'manual', @um40, 'IGP S-40', 'PF-2 STR', 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_upm, 310, 'SIGNAL', 'manual', @um26, 'IGP S-26', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_upm, 320, 'SIGNAL', 'manual', @um27, 'IGP S-27', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_upm, 330, 'SIGNAL', 'manual', @um28, 'IGP S-28', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_upm, 340, 'SIGNAL', 'manual', @um29, 'IGP S-29', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'RED'),
  (@b_upm, 350, 'SIGNAL', 'manual', @um31, 'IGP S-31', 'AC ENGINE LINE', 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK'),
  (@b_upm, 360, 'SIGNAL', 'manual', @um37, 'IGP S-37', NULL, 'RI: R1= UP NE (IGP S-58)', 'IGP', 'Igatpuri', 'BLACK');
INSERT INTO div_signal_successors
  (from_signal_id, from_signal_text, from_line, to_signal_id, to_signal_text, to_line, succession_type, route_condition, section, direction, remarks)
VALUES
  (@k1, 'IGP S-1', 'DN NE', @k61, 'IGP S-61', 'DN NE', 'LOOP_ROUTING', 'L1', 'KSRA-IGP', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@k1, 'IGP S-1', 'DN NE', @k62, 'IGP S-62', 'DN NE', 'LOOP_ROUTING', 'L2', 'KSRA-IGP', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@k1, 'IGP S-1', 'DN NE', @k63, 'IGP S-63', 'DN NE', 'LOOP_ROUTING', 'L3', 'KSRA-IGP', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@k1, 'IGP S-1', 'DN NE', @k69, 'IGP S-69', 'DN NE', 'PLATFORM_ROUTING', 'R3', 'KSRA-IGP', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@k2m, 'IGP S-2', 'DN NE MID', @k69, 'IGP S-69', 'DN NE', 'LINE_CROSSOVER', 'R2', 'KSRA-IGP', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@m61, 'IGP S-61', 'DN NE', @m71, 'IGP S-71', 'DN NE', 'LOOP_ROUTING', '', 'IGP-MMR', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@m62, 'IGP S-62', 'DN NE', @m71, 'IGP S-71', 'DN NE', 'LOOP_ROUTING', '', 'IGP-MMR', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@m63, 'IGP S-63', 'DN NE', @m71, 'IGP S-71', 'DN NE', 'LOOP_ROUTING', '', 'IGP-MMR', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@m64, 'IGP S-64', 'DN NE', @m71, 'IGP S-71', 'DN NE', 'PLATFORM_ROUTING', '', 'IGP-MMR', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@m69, 'IGP S-69', 'DN NE', @m71, 'IGP S-71', 'DN NE', 'PLATFORM_ROUTING', '', 'IGP-MMR', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@m71, 'IGP S-71', 'DN NE', @m87, 'IGP S-87', 'DN NE', 'PLATFORM_ROUTING', 'R1', 'IGP-MMR', 'DN', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u88, 'IGP S-88', 'UP NE', @u45, 'IGP S-45', 'UP NE', 'PLATFORM_ROUTING', 'R2', 'IGP-MMR', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u88, 'IGP S-88', 'UP NE', @u40, 'IGP S-40', 'UP NE', 'PLATFORM_ROUTING', 'R1', 'IGP-MMR', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u45, 'IGP S-45', 'UP NE', @u58, 'IGP S-58', 'UP NE', 'PLATFORM_ROUTING', 'R1', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@um45, 'IGP S-45', 'UP NE MID', @um59, 'IGP S-59', 'UP NE MID', 'PLATFORM_ROUTING', '', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u40, 'IGP S-40', 'UP NE', @u58, 'IGP S-58', 'UP NE', 'PLATFORM_ROUTING', 'R1', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@um40, 'IGP S-40', 'UP NE MID', @um59, 'IGP S-59', 'UP NE MID', 'PLATFORM_ROUTING', '', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u26, 'IGP S-26', 'UP NE', @u58, 'IGP S-58', 'UP NE', 'LOOP_ROUTING', 'R1', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@um26, 'IGP S-26', 'UP NE MID', @um59, 'IGP S-59', 'UP NE MID', 'LOOP_ROUTING', '', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u27, 'IGP S-27', 'UP NE', @u58, 'IGP S-58', 'UP NE', 'LOOP_ROUTING', 'R1', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@um27, 'IGP S-27', 'UP NE MID', @um59, 'IGP S-59', 'UP NE MID', 'LOOP_ROUTING', '', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u28, 'IGP S-28', 'UP NE', @u58, 'IGP S-58', 'UP NE', 'LOOP_ROUTING', 'R1', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@um28, 'IGP S-28', 'UP NE MID', @um59, 'IGP S-59', 'UP NE MID', 'LOOP_ROUTING', '', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u29, 'IGP S-29', 'UP NE', @u58, 'IGP S-58', 'UP NE', 'LOOP_ROUTING', 'R1', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@um29, 'IGP S-29', 'UP NE MID', @um59, 'IGP S-59', 'UP NE MID', 'LOOP_ROUTING', '', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u31, 'IGP S-31', 'UP NE', @u58, 'IGP S-58', 'UP NE', 'LOOP_ROUTING', 'R1', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@um31, 'IGP S-31', 'UP NE MID', @um59, 'IGP S-59', 'UP NE MID', 'LOOP_ROUTING', '', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@u37, 'IGP S-37', 'UP NE', @u58, 'IGP S-58', 'UP NE', 'LOOP_ROUTING', 'R1', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29'),
  (@um37, 'IGP S-37', 'UP NE MID', @um59, 'IGP S-59', 'UP NE MID', 'LOOP_ROUTING', '', 'KSRA-IGP', 'UP', 'NEWLY ADDED SIGNALS sheet8, 2026-09-29');
COMMIT;

SELECT b.section_code, r.row_order, s.signal_number, s.location_text, s.signal_function, s.magnet_id, s.parallel_group_id pg
  FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id JOIN div_signal_book_sections b ON b.id = r.book_section_id
 WHERE b.section_code IN ('KSRA_IGP_DN_NE','IGP_MMR_DN_NE','KSRA_IGP_UP_NE','KSRA_IGP_UP_NE_MID') AND s.station_code = 'IGP'
   AND ((b.section_code = 'KSRA_IGP_DN_NE' AND r.row_order >= 1700) OR (b.section_code <> 'KSRA_IGP_DN_NE' AND r.row_order <= 500))
 ORDER BY FIELD(b.section_code,'KSRA_IGP_DN_NE','IGP_MMR_DN_NE','KSRA_IGP_UP_NE','KSRA_IGP_UP_NE_MID'), r.row_order;
SELECT COUNT(*) AS new_routes, SUM(from_signal_id IS NULL OR to_signal_id IS NULL) AS unresolved FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet8, 2026-09-29';  -- expect 29, 0

