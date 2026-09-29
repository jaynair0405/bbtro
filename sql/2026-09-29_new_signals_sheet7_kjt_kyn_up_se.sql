-- NEWLY ADDED SIGNALS sheet, tab "KJT-KYN UP SE" -> KYN-KJT UP SE page. Decisions agreed with the user 2026-09-29.
-- BVS  S-20 (L1 = UP LL) -> S-18 (intermediate starter) -> S-17 (loop starter) -> S-16.  Parallel S-17 || S-19.
-- NRL  S-11 (UDL starter): S-6 (L1 = UDL) -> S-11 -> Gate-20.  Parallel S-11 || S-12.
--      S-23: DN-direction starter on the UDL (line UP SE, dir DN, RHS). Printed on the UP SE page
--      "FOR DN DIRECTION ONLY" (ABH S-9 precedent), after the NRL header. DN routes S-27 -> S-23 -> S-18
--      (waiting since June) linked; S-23 joins S-21/S-22 as the third alternative from S-27 (one parallel group).
-- VGI  S-25 (L1 = UP LL) -> S-23 (loop starter) -> S-21.  Parallel S-23 || S-24.
-- BUD  S-28 -> S-23 (loop) or S-24 (main) -> S-17.  S-23 after S-24, before the header.  Parallel S-23 || S-24.
-- ABH  S-26 (UP loop starter) between S-25 and the header: S-38 (L1 = UP LL) -> S-26 -> (R1) PF-2 S-21.
--      Parallel S-25 || S-26.  S-21 (PF-2 STR) after S-22, before Gate-4; S-25 -> S-21 -> Gate-4.  Parallel S-21 || S-22.
-- Waiting June routes that name "GATE 1 S-4" / "GATE 20 S-4" are Gate-4 / Gate-20 (user: "GATE-1" = Gate-4; the
-- routes' next signals, ids 1176 / 1144, are exactly the signals after Gate-4 / Gate-20) — linked.
-- Each new signal is its own magnet. Undo: 2026-09-29_new_signals_sheet7_kjt_kyn_up_se_UNDO.sql
START TRANSACTION;

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BVS S-18', 'BVS', 'Bhivpuri', 'KYN-KJT', 'UP SE', 'UP', 'UP LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Intermediate Starter', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BVSS18');
SET @bvs18 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BVS S-17', 'BVS', 'Bhivpuri', 'KYN-KJT', 'UP SE', 'UP', NULL, NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BVSS17');
SET @bvs17 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('NRL S-11', 'NRL', 'Neral', 'KYN-KJT', 'UP SE', 'UP', 'UDL STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'NRLS11');
SET @nrl11 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('NRL S-23', 'NRL', 'Neral', 'KYN-KJT', 'UP SE', 'DN', 'UDL STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Right', 'Unknown', NULL, 1, 0, 0, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'NRLS23');
SET @nrl23 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('VGI S-23', 'VGI', 'Vangani', 'KYN-KJT', 'UP SE', 'UP', 'UP LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'VGIS23');
SET @vgi23 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BUD S-23', 'BUD', 'Badlapur', 'KYN-KJT', 'UP SE', 'UP', 'UP LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BUDS23');
SET @bud23 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('ABH S-26', 'ABH', 'Ambernath', 'KYN-KJT', 'UP SE', 'UP', 'UP LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 0, 0, 1, 'RI: R1= PF-2 (ABH S-21)', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'ABHS26');
SET @abh26 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('ABH S-21', 'ABH', 'Ambernath', 'KYN-KJT', 'UP SE', 'UP', 'PF-2 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'ABHS21');
SET @abh21 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id IN (@bvs18, @bvs17, @nrl11, @nrl23, @vgi23, @bud23, @abh26, @abh21);

SET @bvs19 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='BVS S-19'); SET @bvs20 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='BVS S-20'); SET @bvs16 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='BVS S-16');
SET @nrl6 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='NRL S-6');   SET @nrl12 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='NRL S-12'); SET @gate20 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='Gate-20');
SET @vgi24 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='VGI S-24'); SET @vgi25 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='VGI S-25'); SET @vgi21 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='VGI S-21');
SET @bud28 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='BUD S-28'); SET @bud24 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='BUD S-24'); SET @bud17 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='BUD S-17');
SET @abh38 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='ABH S-38'); SET @abh25 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='ABH S-25'); SET @abh22 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='ABH S-22'); SET @gate4 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='UP SE' AND direction='UP' AND signal_number='Gate-4');
SET @nrl21 = (SELECT id FROM div_signals WHERE section='KYN-KJT' AND line='DN SE' AND direction='DN' AND signal_number='NRL S-21');

-- parallel pairs (S-23 at NRL joins the existing S-21 || S-22 group)
SET @pg = (SELECT MAX(parallel_group_id) FROM div_signals);
UPDATE div_signals SET parallel_group_id = @pg + 1 WHERE id IN (@bvs17, @bvs19);
UPDATE div_signals SET parallel_group_id = @pg + 2 WHERE id IN (@nrl11, @nrl12);
UPDATE div_signals SET parallel_group_id = @pg + 3 WHERE id IN (@vgi23, @vgi24);
UPDATE div_signals SET parallel_group_id = @pg + 4 WHERE id IN (@bud23, @bud24);
UPDATE div_signals SET parallel_group_id = @pg + 5 WHERE id IN (@abh25, @abh26);
UPDATE div_signals SET parallel_group_id = @pg + 6 WHERE id IN (@abh21, @abh22);
UPDATE div_signals SET parallel_group_id = (SELECT g FROM (SELECT parallel_group_id g FROM div_signals WHERE id = @nrl21) x) WHERE id = @nrl23;

-- book rows (positions checked free on 29 Sep)
SET @bs = (SELECT id FROM div_signal_book_sections WHERE section_code = 'KYN_KJT_UP_SE');
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, station_code, station_name, text_color)
VALUES
  (@bs, 1425, 'SIGNAL', 'manual', @bvs18, 'BVS S-18', 'UP LOOP STR', NULL,                      'BVS', 'Bhivpuri',  'BLACK'),
  (@bs, 1450, 'SIGNAL', 'manual', @bvs17, 'BVS S-17', NULL,          NULL,                      'BVS', 'Bhivpuri',  'BLACK'),
  (@bs, 2175, 'SIGNAL', 'manual', @nrl23, 'NRL S-23', 'UDL STR',     'FOR DN DIRECTION ONLY',   'NRL', 'Neral',     'RED'),
  (@bs, 2350, 'SIGNAL', 'manual', @nrl11, 'NRL S-11', 'UDL STR',     NULL,                      'NRL', 'Neral',     'BLACK'),
  (@bs, 3350, 'SIGNAL', 'manual', @vgi23, 'VGI S-23', 'UP LOOP STR', NULL,                      'VGI', 'Vangani',   'BLACK'),
  (@bs, 4525, 'SIGNAL', 'manual', @bud23, 'BUD S-23', 'UP LOOP STR', NULL,                      'BUD', 'Badlapur',  'BLACK'),
  (@bs, 5425, 'SIGNAL', 'manual', @abh26, 'ABH S-26', 'UP LOOP STR', 'RI: R1= PF-2 (ABH S-21)', 'ABH', 'Ambernath', 'BLACK'),
  (@bs, 5550, 'SIGNAL', 'manual', @abh21, 'ABH S-21', 'PF-2 STR',    NULL,                      'ABH', 'Ambernath', 'BLACK');

-- link the June routes that were waiting for these signals / gates
UPDATE div_signal_successors SET to_signal_id   = @nrl23  WHERE id = 162 AND to_signal_text   = 'NRL S-23'    AND to_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @nrl23  WHERE id = 163 AND from_signal_text = 'NRL S-23'    AND from_signal_id IS NULL;
UPDATE div_signal_successors SET to_signal_id   = @nrl11  WHERE id = 206 AND to_signal_text   = 'NRL S-11'    AND to_signal_id IS NULL;
UPDATE div_signal_successors SET to_signal_id   = @gate20 WHERE id = 207 AND to_signal_text   = 'GATE 20 S-4' AND to_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @nrl11, to_signal_id = @gate20 WHERE id = 208 AND from_signal_text = 'NRL S-11' AND from_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @gate20 WHERE id = 209 AND from_signal_text = 'GATE 20 S-4' AND from_signal_id IS NULL;
UPDATE div_signal_successors SET to_signal_id   = @abh21  WHERE id = 211 AND to_signal_text   = 'ABH S-21'    AND to_signal_id IS NULL;
UPDATE div_signal_successors SET to_signal_id   = @gate4  WHERE id = 212 AND to_signal_text   = 'GATE 1 S-4'  AND to_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @abh21, to_signal_id = @gate4 WHERE id = 213 AND from_signal_text = 'ABH S-21' AND from_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @gate4  WHERE id = 214 AND from_signal_text = 'GATE 1 S-4'  AND from_signal_id IS NULL;
SELECT COUNT(*) AS june_routes_linked FROM div_signal_successors
 WHERE id IN (162,163,206,207,208,209,211,212,213,214) AND from_signal_id IS NOT NULL AND to_signal_id IS NOT NULL;   -- expect 10

-- new routes
INSERT INTO div_signal_successors
  (from_signal_id, from_signal_text, from_line, to_signal_id, to_signal_text, to_line, succession_type, route_condition, section, direction, remarks)
VALUES
  (@bvs20, 'BVS S-20', 'UP SE', @bvs18, 'BVS S-18', 'UP SE', 'LOOP_ROUTING', 'BVS UP LOOP', 'KYN-KJT', 'UP', 'NEWLY ADDED SIGNALS sheet7, 2026-09-29'),
  (@bvs18, 'BVS S-18', 'UP SE', @bvs17, 'BVS S-17', 'UP SE', 'LOOP_ROUTING', 'BVS UP LOOP', 'KYN-KJT', 'UP', 'NEWLY ADDED SIGNALS sheet7, 2026-09-29'),
  (@bvs17, 'BVS S-17', 'UP SE', @bvs16, 'BVS S-16', 'UP SE', 'LOOP_ROUTING', 'BVS UP LOOP', 'KYN-KJT', 'UP', 'NEWLY ADDED SIGNALS sheet7, 2026-09-29'),
  (@vgi25, 'VGI S-25', 'UP SE', @vgi23, 'VGI S-23', 'UP SE', 'LOOP_ROUTING', 'VGI UP LOOP', 'KYN-KJT', 'UP', 'NEWLY ADDED SIGNALS sheet7, 2026-09-29'),
  (@vgi23, 'VGI S-23', 'UP SE', @vgi21, 'VGI S-21', 'UP SE', 'LOOP_ROUTING', 'VGI UP LOOP', 'KYN-KJT', 'UP', 'NEWLY ADDED SIGNALS sheet7, 2026-09-29'),
  (@bud28, 'BUD S-28', 'UP SE', @bud23, 'BUD S-23', 'UP SE', 'LOOP_ROUTING', 'BUD UP LOOP', 'KYN-KJT', 'UP', 'NEWLY ADDED SIGNALS sheet7, 2026-09-29'),
  (@bud23, 'BUD S-23', 'UP SE', @bud17, 'BUD S-17', 'UP SE', 'LOOP_ROUTING', 'BUD UP LOOP', 'KYN-KJT', 'UP', 'NEWLY ADDED SIGNALS sheet7, 2026-09-29'),
  (@abh38, 'ABH S-38', 'UP SE', @abh26, 'ABH S-26', 'UP SE', 'LOOP_ROUTING', 'ABH UP LOOP', 'KYN-KJT', 'UP', 'NEWLY ADDED SIGNALS sheet7, 2026-09-29'),
  (@abh26, 'ABH S-26', 'UP SE', @abh21, 'ABH S-21', 'UP SE', 'LOOP_ROUTING', 'R1',          'KYN-KJT', 'UP', 'NEWLY ADDED SIGNALS sheet7, 2026-09-29');
COMMIT;

SELECT r.row_order, s.signal_number, s.direction dir, s.location_text, s.signal_function, s.parallel_group_id pg, r.text_color, r.display_description
  FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE r.book_section_id = @bs AND s.station_code IN ('BVS','NRL','VGI','BUD','ABH') ORDER BY r.row_order;
SELECT COUNT(*) AS new_routes, SUM(from_signal_id IS NULL OR to_signal_id IS NULL) AS unresolved FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet7, 2026-09-29';  -- expect 9, 0
