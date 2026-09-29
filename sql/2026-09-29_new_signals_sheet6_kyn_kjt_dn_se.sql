-- NEWLY ADDED SIGNALS sheet, tab "KYN-KJT DN SE" -> KYN-KJT DN SE page. Decisions agreed with the user 2026-09-29.
-- (Row 1, KYN S-59, was added with sheet 5.)
-- ABH  PF-1: S-6 -> S-15.  PF-2: S-2 -> S-4 (PF-2 MID signal, like DR S-5 / KYN S-48) -> S-5 (PF-2 starter) -> S-15.
--      Loop: ABH S-16 (loop starter, NOT in the sheet — added on the user's word) entered by the left arm of S-6 or S-5,
--      then S-18. Parallel: S-5 || S-6, S-15 || S-16.  Book: S-6, S-4, S-5, [PF-3 note], S-15, S-16, S-18.
--      Note: the sheet's RI text for S-5 says "L1= DN SE (ABH S-15)"; kept as given, to be checked by the user.
-- BUD  S-8 = PF-1 starter, S-9 = PF-2 starter; either -> S-12 or S-11 -> S-14. Parallel: S-8 || S-9, S-11 || S-12.
-- VGI  S-4 loop starter: S-7 (L1 = DN LL) -> S-4 -> S-8. Parallel: S-3 || S-4.
-- NRL  S-22 loop starter: S-27 -> S-21 -> S-18 or S-27 -> S-22 -> S-18. Parallel: S-21 || S-22.
--      (Routes naming NRL S-23 stay unresolved until the sheet that adds S-23.)
-- BVS  S-2 (L1 = DN LL) -> S-5 (intermediate starter) -> S-4 (loop starter) -> S-8. Parallel: S-3 || S-4.
-- "Parallel" = a train passes one or the other, never both (AWS treats them as adjacent).
-- June routes waiting for these signals (ids 151-155, 160-161) are linked, not duplicated.
-- Each new signal is its own magnet. Undo: 2026-09-29_new_signals_sheet6_kyn_kjt_dn_se_UNDO.sql
START TRANSACTION;

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('ABH S-4', 'ABH', 'Ambernath', 'KYN-KJT', 'DN SE', 'DN', 'PF-2 MID', NULL, NULL, NULL, NULL, 'Manual', NULL, 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'ABHS4');
SET @abh4 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('ABH S-5', 'ABH', 'Ambernath', 'KYN-KJT', 'DN SE', 'DN', NULL, NULL, NULL, NULL, NULL, 'Manual', 'Starter', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 0, 1, 0, 'RI: L1= DN SE (ABH S-15)', 'Book shows one left arm on top of vertical stem', NULL, NULL, NULL, 1, 'ABHS5');
SET @abh5 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BUD S-8', 'BUD', 'Badlapur', 'KYN-KJT', 'DN SE', 'DN', 'PF-1 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BUDS8');
SET @bud8 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BUD S-11', 'BUD', 'Badlapur', 'KYN-KJT', 'DN SE', 'DN', 'DN LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BUDS11');
SET @bud11 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('VGI S-4', 'VGI', 'Vangani', 'KYN-KJT', 'DN SE', 'DN', 'DN LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'VGIS4');
SET @vgi4 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('NRL S-22', 'NRL', 'Neral', 'KYN-KJT', 'DN SE', 'DN', 'DN LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'NRLS22');
SET @nrl22 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BVS S-5', 'BVS', 'Bhivpuri', 'KYN-KJT', 'DN SE', 'DN', NULL, NULL, NULL, NULL, NULL, 'Manual', 'Intermediate Starter', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BVSS5');
SET @bvs5 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BVS S-4', 'BVS', 'Bhivpuri', 'KYN-KJT', 'DN SE', 'DN', 'DN LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BVSS4');
SET @bvs4 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, signal_type, signal_function, placement, is_lhs, is_active, normalized_signal_number)
  VALUES ('ABH S-16', 'ABH', 'Ambernath', 'KYN-KJT', 'DN SE', 'DN', 'DN LOOP STR', 'Manual', 'Starter (Loop)', 'Left', 1, 1, 'ABHS16');
SET @abh16 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id IN (@abh4, @abh5, @abh16, @bud8, @bud11, @vgi4, @nrl22, @bvs5, @bvs4);

SET @abh2 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='ABHS2');  SET @abh6 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='ABHS6');  SET @abh15 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='ABHS15'); SET @abh18 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='ABHS18');
SET @bud9 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='BUDS9');  SET @bud12 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='BUDS12'); SET @bud14 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='BUDS14');
SET @vgi3 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='VGIS3');  SET @vgi7 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='VGIS7');  SET @vgi8 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='VGIS8');
SET @nrl21 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='NRLS21'); SET @nrl27 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='NRLS27'); SET @nrl18 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='NRLS18');
SET @bvs2 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='BVSS2');  SET @bvs3 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='BVSS3');  SET @bvs8 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND normalized_signal_number='BVSS8');

-- parallel pairs
SET @pg = (SELECT MAX(parallel_group_id) FROM div_signals);
UPDATE div_signals SET parallel_group_id = @pg + 1 WHERE id IN (@abh5, @abh6);
UPDATE div_signals SET parallel_group_id = @pg + 2 WHERE id IN (@abh15, @abh16);
UPDATE div_signals SET parallel_group_id = @pg + 3 WHERE id IN (@bud8, @bud9);
UPDATE div_signals SET parallel_group_id = @pg + 4 WHERE id IN (@bud11, @bud12);
UPDATE div_signals SET parallel_group_id = @pg + 5 WHERE id IN (@vgi3, @vgi4);
UPDATE div_signals SET parallel_group_id = @pg + 6 WHERE id IN (@nrl21, @nrl22);
UPDATE div_signals SET parallel_group_id = @pg + 7 WHERE id IN (@bvs3, @bvs4);

-- book rows (positions checked free on 29 Sep; ABH PF-3 text note stays at 850, BUD PSR at 1850)
SET @bs = (SELECT id FROM div_signal_book_sections WHERE section_code = 'KYN_KJT_DN_SE');
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, station_code, station_name)
VALUES
  (@bs,  820, 'SIGNAL', 'manual', @abh4,  'ABH S-4',  'PF-2 MID',             NULL,                       'ABH', 'Ambernath'),
  (@bs,  840, 'SIGNAL', 'manual', @abh5,  'ABH S-5',  NULL,                   'RI: L1= DN SE (ABH S-15)', 'ABH', 'Ambernath'),
  (@bs,  950, 'SIGNAL', 'manual', @abh16, 'ABH S-16', 'DN LOOP STR',          NULL,                       'ABH', 'Ambernath'),
  (@bs, 1825, 'SIGNAL', 'manual', @bud8,  'BUD S-8',  'PF-1 STR',             NULL,                       'BUD', 'Badlapur'),
  (@bs, 1950, 'SIGNAL', 'manual', @bud11, 'BUD S-11', 'DN LOOP STR',          NULL,                       'BUD', 'Badlapur'),
  (@bs, 3350, 'SIGNAL', 'manual', @vgi4,  'VGI S-4',  'DN LOOP STR',          NULL,                       'VGI', 'Vangani'),
  (@bs, 4325, 'SIGNAL', 'manual', @nrl22, 'NRL S-22', 'DN LOOP STR',          NULL,                       'NRL', 'Neral'),
  (@bs, 5225, 'SIGNAL', 'manual', @bvs5,  'BVS S-5',  NULL,                   NULL,                       'BVS', 'Bhivpuri'),
  (@bs, 5250, 'SIGNAL', 'manual', @bvs4,  'BVS S-4',  'DN LOOP STR',          NULL,                       'BVS', 'Bhivpuri');

-- link the June routes that were waiting for these signals
UPDATE div_signal_successors SET to_signal_id = @abh4 WHERE id = 151 AND to_signal_text = 'ABH S-4' AND to_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @abh4, to_signal_id = @abh5, section = 'KYN-KJT', direction = 'DN'
 WHERE id = 152 AND from_signal_text = 'ABH S-4' AND to_signal_text = 'ABH S-5' AND from_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @abh5 WHERE id = 153 AND from_signal_text = 'ABH S-5' AND from_signal_id IS NULL;
UPDATE div_signal_successors SET to_signal_id = @bud8 WHERE id = 154 AND to_signal_text = 'BUD S-8' AND to_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @bud8 WHERE id = 155 AND from_signal_text = 'BUD S-8' AND from_signal_id IS NULL;
UPDATE div_signal_successors SET to_signal_id = @nrl22 WHERE id = 160 AND to_signal_text = 'NRL S-22' AND to_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @nrl22 WHERE id = 161 AND from_signal_text = 'NRL S-22' AND from_signal_id IS NULL;
SELECT COUNT(*) AS june_routes_linked FROM div_signal_successors
 WHERE id IN (151,152,153,154,155,160,161) AND from_signal_id IS NOT NULL AND to_signal_id IS NOT NULL;   -- expect 7

-- new routes
INSERT INTO div_signal_successors
  (from_signal_id, from_signal_text, from_line, to_signal_id, to_signal_text, to_line, succession_type, route_condition, section, direction, remarks)
VALUES
  (@abh6,  'ABH S-6',  'DN SE', @abh15, 'ABH S-15', 'DN SE', 'PLATFORM_ROUTING', 'PF-1',    'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@abh6,  'ABH S-6',  'DN SE', @abh16, 'ABH S-16', 'DN SE', 'LOOP_ROUTING',     'ABH LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@abh5,  'ABH S-5',  'DN SE', @abh16, 'ABH S-16', 'DN SE', 'LOOP_ROUTING',     'ABH LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@abh15, 'ABH S-15', 'DN SE', @abh18, 'ABH S-18', 'DN SE', 'PLATFORM_ROUTING', '',         'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@abh16, 'ABH S-16', 'DN SE', @abh18, 'ABH S-18', 'DN SE', 'LOOP_ROUTING',     'ABH LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@bud9,  'BUD S-9',  'DN SE', @bud12, 'BUD S-12', 'DN SE', 'PLATFORM_ROUTING', 'PF-2',     'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@bud9,  'BUD S-9',  'DN SE', @bud11, 'BUD S-11', 'DN SE', 'LOOP_ROUTING',     'BUD LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@bud8,  'BUD S-8',  'DN SE', @bud11, 'BUD S-11', 'DN SE', 'LOOP_ROUTING',     'BUD LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@bud11, 'BUD S-11', 'DN SE', @bud14, 'BUD S-14', 'DN SE', 'LOOP_ROUTING',     'BUD LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@vgi7,  'VGI S-7',  'DN SE', @vgi4,  'VGI S-4',  'DN SE', 'LOOP_ROUTING',     'VGI LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@vgi4,  'VGI S-4',  'DN SE', @vgi8,  'VGI S-8',  'DN SE', 'LOOP_ROUTING',     'VGI LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@nrl27, 'NRL S-27', 'DN SE', @nrl21, 'NRL S-21', 'DN SE', 'PLATFORM_ROUTING', '',         'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@nrl21, 'NRL S-21', 'DN SE', @nrl18, 'NRL S-18', 'DN SE', 'PLATFORM_ROUTING', '',         'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@bvs2,  'BVS S-2',  'DN SE', @bvs5,  'BVS S-5',  'DN SE', 'LOOP_ROUTING',     'BVS LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@bvs5,  'BVS S-5',  'DN SE', @bvs4,  'BVS S-4',  'DN SE', 'LOOP_ROUTING',     'BVS LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29'),
  (@bvs4,  'BVS S-4',  'DN SE', @bvs8,  'BVS S-8',  'DN SE', 'LOOP_ROUTING',     'BVS LOOP', 'KYN-KJT', 'DN', 'NEWLY ADDED SIGNALS sheet6, 2026-09-29');
COMMIT;

SELECT r.row_order, s.signal_number, s.location_text, s.signal_function, s.parallel_group_id pg, s.magnet_id
  FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE r.book_section_id = @bs AND s.station_code IN ('ABH','BUD','VGI','NRL','BVS') ORDER BY r.row_order;
SELECT COUNT(*) AS new_routes, SUM(from_signal_id IS NULL OR to_signal_id IS NULL) AS unresolved FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet6, 2026-09-29';  -- expect 16, 0
