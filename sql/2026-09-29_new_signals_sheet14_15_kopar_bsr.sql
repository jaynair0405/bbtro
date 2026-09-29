-- NEWLY ADDED SIGNALS sheet, tabs "DAT-BSR DN" (14) and "BSR-KOPR UP" (15) -> Kopar-Vasai corridor. User, 2026-09-29.
-- The sheet labels this corridor in the opposite direction to the book: the sheet's "DN" signals belong on the book's
-- BSR UP page (KOPAR_BSR_BSR_UP) and its "UP" signals on the BSR DN page (KOPAR_BSR_BSR_DN) — every "before" signal
-- and every existing route-indicator arm confirms it. New signals take the BOOK's section/line/direction.
-- BSR S-50 (sheet 15) already existed on the BSR DN page (PF-6 STR) — nothing to do.
-- Each new starter sits after the main starter it parallels (a train passes only one of the group) and continues to
-- the next main signal. Routes follow the existing RI arms.
--   BSR UP:  BIRD S-2 (L1 UDL-1 S-4, L2 UDL-2 S-3) -> S-5 | S-4 | S-3 -> S-8;  KHBV S-2 (L1 S-5) -> S-6 | S-5 -> S-8;
--            KARD S-2 (L1 S-3) -> S-4 | S-3 -> S-8.
--   BSR DN:  KARD S-20 (L1 S-19, R1 S-17) -> S-18 | S-19 | S-17 -> S-16;  KHBV S-30 (L1 S-22) -> S-21 | S-22 -> S-20;
--            BIRD S-30 (L1 PF-3 S-24, L2 PF-1/2 S-25, R1 UDL-1 S-21, R2 UDL-2 S-22) -> S-23 | S-24 | S-25 | S-21 | S-22 -> S-20.
-- Each new signal is its own magnet. Undo: 2026-09-29_new_signals_sheet14_15_kopar_bsr_UNDO.sql
START TRANSACTION;

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BIRD S-4', 'BIRD', 'Bhiwandi', 'KOPAR-BSR', 'BSR UP', 'UP', 'UDL-1 STR', '57/3', NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BIRDS4');
SET @u_bird4 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BIRD S-3', 'BIRD', 'Bhiwandi', 'KOPAR-BSR', 'BSR UP', 'UP', 'UDL-2 STR', '57/4', NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BIRDS3');
SET @u_bird3 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('KHBV S-5', 'KHBV', 'Kharbao', 'KOPAR-BSR', 'BSR UP', 'UP', 'DN LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'KHBVS5');
SET @u_khbv5 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('KARD S-3', 'KARD', 'Kaman Road', 'KOPAR-BSR', 'BSR UP', 'UP', 'UDL STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'KARDS3');
SET @u_kard3 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('KARD S-19', 'KARD', 'Kaman Road', 'KOPAR-BSR', 'BSR DN', 'DN', 'UP LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'KARDS19');
SET @d_kard19 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('KARD S-17', 'KARD', 'Kaman Road', 'KOPAR-BSR', 'BSR DN', 'DN', 'UDL STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'KARDS17');
SET @d_kard17 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('KHBV S-22', 'KHBV', 'Kharbao', 'KOPAR-BSR', 'BSR DN', 'DN', 'UP LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'KHBVS22');
SET @d_khbv22 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BIRD S-24', 'BIRD', 'Bhiwandi', 'KOPAR-BSR', 'BSR DN', 'DN', 'PF-3 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BIRDS24');
SET @d_bird24 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BIRD S-25', 'BIRD', 'Bhiwandi', 'KOPAR-BSR', 'BSR DN', 'DN', 'PF-1/2 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BIRDS25');
SET @d_bird25 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BIRD S-21', 'BIRD', 'Bhiwandi', 'KOPAR-BSR', 'BSR DN', 'DN', 'UDL-1 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BIRDS21');
SET @d_bird21 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BIRD S-22', 'BIRD', 'Bhiwandi', 'KOPAR-BSR', 'BSR DN', 'DN', 'UDL-2 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BIRDS22');
SET @d_bird22 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id
 WHERE id IN (@u_bird4, @u_bird3, @u_khbv5, @u_kard3, @d_kard19, @d_kard17, @d_khbv22, @d_bird24, @d_bird25, @d_bird21, @d_bird22);

SET @u_bird2 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND signal_number='BIRD S-2'); SET @u_bird5 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND signal_number='BIRD S-5'); SET @u_bird8 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND signal_number='BIRD S-8');
SET @u_khbv2 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND signal_number='KHBV S-2'); SET @u_khbv6 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND signal_number='KHBV S-6'); SET @u_khbv8 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND signal_number='KHBV S-8');
SET @u_kard2 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND signal_number='KARD S-2'); SET @u_kard4 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND signal_number='KARD S-4'); SET @u_kard8 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND signal_number='KARD S-8');
SET @d_kard20 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND signal_number='KARD S-20'); SET @d_kard18 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND signal_number='KARD S-18'); SET @d_kard16 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND signal_number='KARD S-16');
SET @d_khbv30 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND signal_number='KHBV S-30'); SET @d_khbv21 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND signal_number='KHBV S-21'); SET @d_khbv20 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND signal_number='KHBV S-20');
SET @d_bird30 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND signal_number='BIRD S-30'); SET @d_bird23 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND signal_number='BIRD S-23'); SET @d_bird20 = (SELECT id FROM div_signals WHERE section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND signal_number='BIRD S-20');

SET @pg = (SELECT MAX(parallel_group_id) FROM div_signals);
UPDATE div_signals SET parallel_group_id = @pg + 1 WHERE id IN (@u_bird5, @u_bird4, @u_bird3);
UPDATE div_signals SET parallel_group_id = @pg + 2 WHERE id IN (@u_khbv6, @u_khbv5);
UPDATE div_signals SET parallel_group_id = @pg + 3 WHERE id IN (@u_kard4, @u_kard3);
UPDATE div_signals SET parallel_group_id = @pg + 4 WHERE id IN (@d_kard18, @d_kard19, @d_kard17);
UPDATE div_signals SET parallel_group_id = @pg + 5 WHERE id IN (@d_khbv21, @d_khbv22);
UPDATE div_signals SET parallel_group_id = @pg + 6 WHERE id IN (@d_bird23, @d_bird24, @d_bird25, @d_bird21, @d_bird22);

SET @up = (SELECT id FROM div_signal_book_sections WHERE section_code = 'KOPAR_BSR_BSR_UP');
SET @dn = (SELECT id FROM div_signal_book_sections WHERE section_code = 'KOPAR_BSR_BSR_DN');
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, station_code, station_name)
VALUES
  (@up,  825, 'SIGNAL', 'manual', @u_bird4,  'BIRD S-4',  'UDL-1 STR',   'BIRD', 'Bhiwandi'),
  (@up,  850, 'SIGNAL', 'manual', @u_bird3,  'BIRD S-3',  'UDL-2 STR',   'BIRD', 'Bhiwandi'),
  (@up, 1550, 'SIGNAL', 'manual', @u_khbv5,  'KHBV S-5',  'DN LOOP STR', 'KHBV', 'Kharbao'),
  (@up, 2150, 'SIGNAL', 'manual', @u_kard3,  'KARD S-3',  'UDL STR',     'KARD', 'Kaman Road'),
  (@dn, 1725, 'SIGNAL', 'manual', @d_kard19, 'KARD S-19', 'UP LOOP STR', 'KARD', 'Kaman Road'),
  (@dn, 1750, 'SIGNAL', 'manual', @d_kard17, 'KARD S-17', 'UDL STR',     'KARD', 'Kaman Road'),
  (@dn, 2350, 'SIGNAL', 'manual', @d_khbv22, 'KHBV S-22', 'UP LOOP STR', 'KHBV', 'Kharbao'),
  (@dn, 2920, 'SIGNAL', 'manual', @d_bird24, 'BIRD S-24', 'PF-3 STR',    'BIRD', 'Bhiwandi'),
  (@dn, 2940, 'SIGNAL', 'manual', @d_bird25, 'BIRD S-25', 'PF-1/2 STR',  'BIRD', 'Bhiwandi'),
  (@dn, 2960, 'SIGNAL', 'manual', @d_bird21, 'BIRD S-21', 'UDL-1 STR',   'BIRD', 'Bhiwandi'),
  (@dn, 2980, 'SIGNAL', 'manual', @d_bird22, 'BIRD S-22', 'UDL-2 STR',   'BIRD', 'Bhiwandi');

INSERT INTO div_signal_successors
  (from_signal_id, from_signal_text, from_line, to_signal_id, to_signal_text, to_line, succession_type, route_condition, section, direction, remarks)
VALUES
  (@u_bird2, 'BIRD S-2', 'BSR UP', @u_bird4, 'BIRD S-4', 'BSR UP', 'LOOP_ROUTING', 'L1', 'KOPAR-BSR', 'UP', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@u_bird2, 'BIRD S-2', 'BSR UP', @u_bird3, 'BIRD S-3', 'BSR UP', 'LOOP_ROUTING', 'L2', 'KOPAR-BSR', 'UP', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@u_bird4, 'BIRD S-4', 'BSR UP', @u_bird8, 'BIRD S-8', 'BSR UP', 'LOOP_ROUTING', 'UDL-1', 'KOPAR-BSR', 'UP', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@u_bird3, 'BIRD S-3', 'BSR UP', @u_bird8, 'BIRD S-8', 'BSR UP', 'LOOP_ROUTING', 'UDL-2', 'KOPAR-BSR', 'UP', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@u_khbv2, 'KHBV S-2', 'BSR UP', @u_khbv5, 'KHBV S-5', 'BSR UP', 'LOOP_ROUTING', 'L1', 'KOPAR-BSR', 'UP', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@u_khbv5, 'KHBV S-5', 'BSR UP', @u_khbv8, 'KHBV S-8', 'BSR UP', 'LOOP_ROUTING', 'KHBV LOOP', 'KOPAR-BSR', 'UP', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@u_kard2, 'KARD S-2', 'BSR UP', @u_kard3, 'KARD S-3', 'BSR UP', 'LOOP_ROUTING', 'L1', 'KOPAR-BSR', 'UP', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@u_kard3, 'KARD S-3', 'BSR UP', @u_kard8, 'KARD S-8', 'BSR UP', 'LOOP_ROUTING', 'UDL', 'KOPAR-BSR', 'UP', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_kard20, 'KARD S-20', 'BSR DN', @d_kard19, 'KARD S-19', 'BSR DN', 'LOOP_ROUTING', 'L1', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_kard20, 'KARD S-20', 'BSR DN', @d_kard17, 'KARD S-17', 'BSR DN', 'LOOP_ROUTING', 'R1', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_kard19, 'KARD S-19', 'BSR DN', @d_kard16, 'KARD S-16', 'BSR DN', 'LOOP_ROUTING', 'KARD LOOP', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_kard17, 'KARD S-17', 'BSR DN', @d_kard16, 'KARD S-16', 'BSR DN', 'LOOP_ROUTING', 'UDL', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_khbv30, 'KHBV S-30', 'BSR DN', @d_khbv22, 'KHBV S-22', 'BSR DN', 'LOOP_ROUTING', 'L1', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_khbv22, 'KHBV S-22', 'BSR DN', @d_khbv20, 'KHBV S-20', 'BSR DN', 'LOOP_ROUTING', 'KHBV LOOP', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_bird30, 'BIRD S-30', 'BSR DN', @d_bird24, 'BIRD S-24', 'BSR DN', 'PLATFORM_ROUTING', 'L1', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_bird30, 'BIRD S-30', 'BSR DN', @d_bird25, 'BIRD S-25', 'BSR DN', 'PLATFORM_ROUTING', 'L2', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_bird30, 'BIRD S-30', 'BSR DN', @d_bird21, 'BIRD S-21', 'BSR DN', 'LOOP_ROUTING', 'R1', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_bird30, 'BIRD S-30', 'BSR DN', @d_bird22, 'BIRD S-22', 'BSR DN', 'LOOP_ROUTING', 'R2', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_bird24, 'BIRD S-24', 'BSR DN', @d_bird20, 'BIRD S-20', 'BSR DN', 'PLATFORM_ROUTING', 'PF-3', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_bird25, 'BIRD S-25', 'BSR DN', @d_bird20, 'BIRD S-20', 'BSR DN', 'PLATFORM_ROUTING', 'PF-1/2', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_bird21, 'BIRD S-21', 'BSR DN', @d_bird20, 'BIRD S-20', 'BSR DN', 'LOOP_ROUTING', 'UDL-1', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29'),
  (@d_bird22, 'BIRD S-22', 'BSR DN', @d_bird20, 'BIRD S-20', 'BSR DN', 'LOOP_ROUTING', 'UDL-2', 'KOPAR-BSR', 'DN', 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29');
COMMIT;

SELECT b.section_code, r.row_order, s.signal_number, s.location_text, s.parallel_group_id pg
  FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id JOIN div_signal_book_sections b ON b.id = r.book_section_id
 WHERE b.section_code IN ('KOPAR_BSR_BSR_UP','KOPAR_BSR_BSR_DN') AND s.station_code IN ('BIRD','KHBV','KARD') AND s.parallel_group_id IS NOT NULL
 ORDER BY b.section_code DESC, r.row_order;
SELECT COUNT(*) AS new_routes, SUM(from_signal_id IS NULL OR to_signal_id IS NULL) AS unresolved
  FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet14-15, 2026-09-29';   -- expect 22, 0
