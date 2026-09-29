-- NEWLY ADDED SIGNALS sheet, tab "UP TH LINE" -> CSMT-KYN UP TH. Decisions agreed with the user 2026-09-29.
--   DR S-38   Dadar UP loop starter. Sheet line "UP LOOP" -> stored on UP TH (the loop is read off UP TH:
--             DR S-32 "RI: L1= UP LOOP"), function 'Starter (Loop)' like every loop starter.
--             Book: after the DR station header, before DR S-42.  Route: DR S-32 -> S-38 -> DR S-42.
--   CSMT S-55 UP home, CSMT yard (sheet line "7TH LINE"), RI to PF-18/17/16/15/14. Stored on UP TH: it is read
--             from CSMT S-61 ("RI: L1= PF-10/11/12; L2= S-63; L3= S-55"). Book: directly after CSMT S-61.
--   CSMT S-63 UP home, CSMT yard, RI to PF-14/15. Book: after S-55.
--             Routes: S-61 -> S-81 (L1) / S-63 (L2) / S-55 (L3).
--   S-55 and S-63 lead only into PF-14..18: hidden from suburban beats like the CSMT PF-8+ signals.
-- Each new signal is its own magnet. Undo: 2026-09-29_new_signals_sheet4_up_th_UNDO.sql
START TRANSACTION;

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('DR S-38', 'DR', 'Dadar', 'CSMT-KYN', 'UP TH', 'UP', 'DR UP LOOP STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter (Loop)', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 1, 'DRS38');
SET @dr38 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('CSMT S-55', 'CSMT', 'CSMT', 'CSMT-KYN', 'UP TH', 'UP', 'CSMT YARD', NULL, NULL, NULL, NULL, 'Manual', 'Home', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 1, 3, 2, 'RI: L1=PF-18; L2= PF-17; L3= PF-16; R1= PF-15; R2= PF-14', 'Book shows three left and two right arms on top of vertical stem', NULL, NULL, NULL, 1, 'CSMTS55');
SET @s55 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('CSMT S-63', 'CSMT', 'CSMT', 'CSMT-KYN', 'UP TH', 'UP', 'CSMT YARD', NULL, NULL, NULL, NULL, 'Manual', 'Home', 'Left', 'Unknown', NULL, 0, 0, 1, 0, DEFAULT, 0, 1, 2, 0, 'RI: L1=PF-14; L2= PF-15', 'Book shows two left arms on top of vertical stem', NULL, NULL, NULL, 1, 'CSMTS63');
SET @s63 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id IN (@dr38, @s55, @s63);

SET @upth = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_KYN_UP_TH');
SET @dr32 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='UP TH' AND direction='UP' AND normalized_signal_number='DRS32');
SET @dr42 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='UP TH' AND direction='UP' AND normalized_signal_number='DRS42');
SET @s61  = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='UP TH' AND direction='UP' AND normalized_signal_number='CSMTS61');
SET @s81  = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='UP TH' AND direction='UP' AND normalized_signal_number='CSMTS81');

-- book rows (positions checked free on 29 Sep)
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, station_code, station_name, exclude_beats)
VALUES
  (@upth,  9675, 'SIGNAL', 'manual', @dr38, 'DR S-38',   'DR UP LOOP STR', NULL, 'DR', 'Dadar', NULL),
  (@upth, 11425, 'SIGNAL', 'manual', @s55,  'CSMT S-55', 'CSMT YARD', 'RI: L1=PF-18; L2= PF-17; L3= PF-16; R1= PF-15; R2= PF-14', 'CSMT', 'CSMT', 'KYN_SUB,CSMT_SUB_ML'),
  (@upth, 11450, 'SIGNAL', 'manual', @s63,  'CSMT S-63', 'CSMT YARD', 'RI: L1=PF-14; L2= PF-15', 'CSMT', 'CSMT', 'KYN_SUB,CSMT_SUB_ML');

-- routes
INSERT INTO div_signal_successors
  (from_signal_id, from_signal_text, from_line, to_signal_id, to_signal_text, to_line, succession_type, route_condition, section, direction, remarks)
VALUES
  (@dr32, 'DR S-32',   'UP TH', @dr38, 'DR S-38',   'UP TH', 'LOOP_ROUTING',     'DR UP LOOP', 'CSMT-KYN', 'UP', 'NEWLY ADDED SIGNALS sheet4, 2026-09-29'),
  (@dr38, 'DR S-38',   'UP TH', @dr42, 'DR S-42',   'UP TH', 'LOOP_ROUTING',     'DR UP LOOP', 'CSMT-KYN', 'UP', 'NEWLY ADDED SIGNALS sheet4, 2026-09-29'),
  (@s61,  'CSMT S-61', 'UP TH', @s81,  'CSMT S-81', 'UP TH', 'PLATFORM_ROUTING', 'L1',         'CSMT-KYN', 'UP', 'NEWLY ADDED SIGNALS sheet4, 2026-09-29'),
  (@s61,  'CSMT S-61', 'UP TH', @s63,  'CSMT S-63', 'UP TH', 'PLATFORM_ROUTING', 'L2',         'CSMT-KYN', 'UP', 'NEWLY ADDED SIGNALS sheet4, 2026-09-29'),
  (@s61,  'CSMT S-61', 'UP TH', @s55,  'CSMT S-55', 'UP TH', 'PLATFORM_ROUTING', 'L3',         'CSMT-KYN', 'UP', 'NEWLY ADDED SIGNALS sheet4, 2026-09-29');

COMMIT;

SELECT r.row_order, s.signal_number, s.line, s.direction, s.signal_function, s.magnet_id, r.display_description, r.exclude_beats
  FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE r.book_section_id = @upth AND (r.row_order BETWEEN 9650 AND 9700 OR r.row_order BETWEEN 11400 AND 11500) ORDER BY r.row_order;
SELECT COUNT(*) AS new_successor_edges, SUM(from_signal_id IS NULL OR to_signal_id IS NULL) AS unresolved
  FROM div_signal_successors WHERE remarks = 'NEWLY ADDED SIGNALS sheet4, 2026-09-29';   -- expect 5, 0
