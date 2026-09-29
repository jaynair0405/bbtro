-- NEWLY ADDED SIGNALS sheet, tab "DN TH LINE" -> CSMT-KYN. Decisions agreed with the user 2026-09-29.
-- Adds 6 signals (CSMT S-50 deferred: leads to MZN yard / 7th line, no book page yet).
--   CSMT S-76, S-62, S-59  CSMT yard, DN TH. Book: after CSMT S-56, before MZN S-5.
--        S-10, S-11 -> S-76 (main/yellow), R1 diversion -> S-62;  S-12, S-13, S-14 -> S-62 (L1), R1 -> S-59;
--        S-16, S-17, S-18 -> S-59;  S-76, S-62, S-59 -> MZN S-5.
--   DR S-14   loop starter, stored on DN TH (loops are read off DN TH: DR S-8/S-9 "RI: L1=DR Loop").
--             Parallel to DR S-15. Book: after DR S-15.  DR S-8, S-9 -> S-14 -> DR S-21; DR S-8 -> S-15 -> DR S-21.
--   BND S-28  loop starter on DN TH, parallel to BND S-27. Book: after BND S-27.
--             BND S-17 -> S-28 -> K-2715 (next signal after BND S-27).
--   TNA S-66  line UP TH, direction DN (like ABH S-9). Printed on the UP TH page, "FOR DN DIRECTION ONLY",
--             after the TNA station header, before TNA S-46 (PF-6 STR).
-- Every new signal is its own magnet (magnet_id = id). seq_order left NULL, as for the 21 Aug CSMT adds;
-- adjacency for AWS comes from the successor edges and parallel groups below.
-- Undo: 2026-09-29_new_signals_sheet1_csmt_kyn_UNDO.sql
START TRANSACTION;

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('CSMT S-76', 'CSMT', 'CSMT', 'CSMT-KYN', 'DN TH', 'DN', 'CSMT YARD', NULL, NULL, NULL, NULL, 'Manual', NULL, 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'CSMTS76');
SET @s76 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('CSMT S-62', 'CSMT', 'CSMT', 'CSMT-KYN', 'DN TH', 'DN', 'CSMT YARD', NULL, NULL, NULL, NULL, 'Manual', NULL, 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 1, 0, 1, 'RI: R1= CSMT S-50', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'CSMTS62');
SET @s62 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('CSMT S-59', 'CSMT', 'CSMT', 'CSMT-KYN', 'DN TH', 'DN', 'CSMT YARD', NULL, NULL, NULL, NULL, 'Manual', NULL, 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 1, 1, 0, 'RI: L1= MZN S-5', 'Book shows one left arm on top of vertical stem', NULL, NULL, NULL, 1, 'CSMTS59');
SET @s59 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('DR S-14', 'DR', 'Dadar', 'CSMT-KYN', 'DN TH', 'DN', 'DN DR LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'DRS14');
SET @dr14 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('BND S-28', 'BND', 'Bhandup', 'CSMT-KYN', 'DN TH', 'DN', 'DN LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'BNDS28');
SET @bnd28 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('TNA S-66', 'TNA', 'Thane', 'CSMT-KYN', 'UP TH', 'DN', 'PF-6 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 1, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'TNAS66');
SET @tna66 = LAST_INSERT_ID();
UPDATE div_signals SET magnet_id = id WHERE id IN (@s76, @s62, @s59, @dr14, @bnd28, @tna66);

-- existing signals referenced below, resolved by name (same ids on local and prod)
SET @dnth  = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_KYN_DN_TH');
SET @upth  = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_KYN_UP_TH');
SET @c10 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='CSMTS10');
SET @c11 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='CSMTS11');
SET @c12 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='CSMTS12');
SET @c13 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='CSMTS13');
SET @c14 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='CSMTS14');
SET @c16 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='CSMTS16');
SET @c17 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='CSMTS17');
SET @c18 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='CSMTS18');
SET @mzn5 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='MZNS5');
SET @dr8  = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='DRS8');
SET @dr9  = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='DRS9');
SET @dr15 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='DRS15');
SET @dr21 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='DRS21');
SET @bnd17 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='BNDS17');
SET @bnd27 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='BNDS27');
SET @k2715 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND direction='DN' AND normalized_signal_number='K2715');

-- parallel pairs (AWS treats a parallel group as adjacent)
SET @pg = (SELECT MAX(parallel_group_id) FROM div_signals);
UPDATE div_signals SET parallel_group_id = @pg + 1 WHERE id IN (@dr15, @dr14);
UPDATE div_signals SET parallel_group_id = @pg + 2 WHERE id IN (@bnd27, @bnd28);

-- book rows (positions checked free on 29 Sep)
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, station_code, station_name, exclude_beats)
VALUES
  (@dnth,  725, 'SIGNAL', 'manual', @s76,   'CSMT S-76', 'CSMT YARD',      NULL,                    'CSMT', 'CSMT',    'KYN_SUB,CSMT_SUB_ML'),
  (@dnth,  750, 'SIGNAL', 'manual', @s62,   'CSMT S-62', 'CSMT YARD',      'RI: R1= CSMT S-50',     'CSMT', 'CSMT',    'KYN_SUB,CSMT_SUB_ML'),
  (@dnth,  775, 'SIGNAL', 'manual', @s59,   'CSMT S-59', 'CSMT YARD',      'RI: L1= MZN S-5',       'CSMT', 'CSMT',    NULL),
  (@dnth, 2750, 'SIGNAL', 'manual', @dr14,  'DR S-14',   'DN DR LOOP STR', NULL,                    'DR',   'Dadar',   NULL),
  (@dnth, 6350, 'SIGNAL', 'manual', @bnd28, 'BND S-28',  'DN LOOP STR',    NULL,                    'BND',  'Bhandup', NULL),
  (@upth, 4775, 'SIGNAL', 'manual', @tna66, 'TNA S-66',  'PF-6 STR',       'FOR DN DIRECTION ONLY', 'TNA',  'Thane',   NULL);

-- routes (successor edges)
INSERT INTO div_signal_successors
  (from_signal_id, from_signal_text, from_line, to_signal_id, to_signal_text, to_line, succession_type, route_condition, section, direction, remarks)
VALUES
  (@c10,  'CSMT S-10', 'DN TH', @s76,  'CSMT S-76', 'DN TH', 'PLATFORM_ROUTING', 'MAIN',     'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c11,  'CSMT S-11', 'DN TH', @s76,  'CSMT S-76', 'DN TH', 'PLATFORM_ROUTING', 'MAIN',     'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c10,  'CSMT S-10', 'DN TH', @s62,  'CSMT S-62', 'DN TH', 'PLATFORM_ROUTING', 'R1',       'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c11,  'CSMT S-11', 'DN TH', @s62,  'CSMT S-62', 'DN TH', 'PLATFORM_ROUTING', 'R1',       'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c12,  'CSMT S-12', 'DN TH', @s62,  'CSMT S-62', 'DN TH', 'PLATFORM_ROUTING', 'L1',       'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c13,  'CSMT S-13', 'DN TH', @s62,  'CSMT S-62', 'DN TH', 'PLATFORM_ROUTING', 'L1',       'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c14,  'CSMT S-14', 'DN TH', @s62,  'CSMT S-62', 'DN TH', 'PLATFORM_ROUTING', 'L1',       'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c12,  'CSMT S-12', 'DN TH', @s59,  'CSMT S-59', 'DN TH', 'PLATFORM_ROUTING', 'R1',       'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c13,  'CSMT S-13', 'DN TH', @s59,  'CSMT S-59', 'DN TH', 'PLATFORM_ROUTING', 'R1',       'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c14,  'CSMT S-14', 'DN TH', @s59,  'CSMT S-59', 'DN TH', 'PLATFORM_ROUTING', 'R1',       'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c16,  'CSMT S-16', 'DN TH', @s59,  'CSMT S-59', 'DN TH', 'PLATFORM_ROUTING', '',         'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c17,  'CSMT S-17', 'DN TH', @s59,  'CSMT S-59', 'DN TH', 'PLATFORM_ROUTING', '',         'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@c18,  'CSMT S-18', 'DN TH', @s59,  'CSMT S-59', 'DN TH', 'PLATFORM_ROUTING', '',         'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@s76,  'CSMT S-76', 'DN TH', @mzn5, 'MZN S-5',   'DN TH', 'PLATFORM_ROUTING', '',         'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@s62,  'CSMT S-62', 'DN TH', @mzn5, 'MZN S-5',   'DN TH', 'PLATFORM_ROUTING', '',         'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@s59,  'CSMT S-59', 'DN TH', @mzn5, 'MZN S-5',   'DN TH', 'PLATFORM_ROUTING', '',         'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@dr8,  'DR S-8',    'DN TH', @dr14, 'DR S-14',   'DN TH', 'LOOP_ROUTING',     'DR LOOP',  'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@dr9,  'DR S-9',    'DN TH', @dr14, 'DR S-14',   'DN TH', 'LOOP_ROUTING',     'DR LOOP',  'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@dr14, 'DR S-14',   'DN TH', @dr21, 'DR S-21',   'DN TH', 'LOOP_ROUTING',     'DR LOOP',  'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@dr8,  'DR S-8',    'DN TH', @dr15, 'DR S-15',   'DN TH', 'PLATFORM_ROUTING', 'DN TH',    'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@dr15, 'DR S-15',   'DN TH', @dr21, 'DR S-21',   'DN TH', 'PLATFORM_ROUTING', 'DN TH',    'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@bnd17,'BND S-17',  'DN TH', @bnd28,'BND S-28',  'DN TH', 'LOOP_ROUTING',     'BND LOOP', 'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29'),
  (@bnd28,'BND S-28',  'DN TH', @k2715,'K-2715',    'DN TH', 'LOOP_ROUTING',     'BND LOOP', 'CSMT-KYN', 'DN', 'NEWLY ADDED SIGNALS sheet1, 2026-09-29');

COMMIT;

-- check
SELECT s.id, s.signal_number, s.line, s.direction, s.signal_function, s.magnet_id, s.parallel_group_id,
       b.section_code, r.row_order, r.display_description
  FROM div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id JOIN div_signal_book_sections b ON b.id = r.book_section_id
 WHERE s.id IN (@s76, @s62, @s59, @dr14, @bnd28, @tna66) ORDER BY b.id, r.row_order;
SELECT COUNT(*) AS new_successor_edges, SUM(from_signal_id IS NULL OR to_signal_id IS NULL) AS unresolved
  FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet1, 2026-09-29';   -- expect 23, 0
