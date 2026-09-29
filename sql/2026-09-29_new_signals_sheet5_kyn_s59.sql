-- NEWLY ADDED SIGNALS sheet, tab "KYN-KSRA DN NE": KYN S-59, Kalyan PF-6 starter (RHS, RI L1 -> KYN S-72).
-- Stored exactly like KYN S-56 (PF-4) and KYN S-58 (PF-5): one physical signal, three display copies sharing
-- one magnet — CSMT-KYN DN TH (end of page), KYN-KJT DN SE and KYN-KSRA DN NE (start of page).
-- From PF-6 a train can go towards Kasara (KYN S-72) or Karjat (KYN S-82) — user, 2026-09-29.
-- RHS -> red rows. Shown on suburban beats (as S-56/S-58). Undo: 2026-09-29_new_signals_sheet5_kyn_s59_UNDO.sql
START TRANSACTION;

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('KYN S-59', 'KYN', 'Kalyan', 'KYN-KSRA', 'DN NE', 'DN', 'PF-6 STR', NULL, NULL, NULL, NULL, 'Manual', 'Starter', 'Right', 'Unknown', NULL, 1, 0, 0, 0, DEFAULT, 0, 0, 1, 0, 'RI: L1= DN NE (KYN S-72)', 'Book shows one left arm on top of vertical stem', NULL, NULL, NULL, 1, 'KYNS59');
SET @ne = LAST_INSERT_ID();

-- the other two copies: same signal, other section/line
INSERT INTO div_signals (section, line, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'KYN-KJT', 'DN SE', signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @ne;
SET @se = LAST_INSERT_ID();
INSERT INTO div_signals (section, line, signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'CSMT-KYN', 'DN TH', signal_number,normalized_signal_number,station_code,station_name,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @ne;
SET @th = LAST_INSERT_ID();
UPDATE div_signals SET magnet_id = @ne WHERE id IN (@ne, @se, @th);

SET @b_th = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_KYN_DN_TH');
SET @b_se = (SELECT id FROM div_signal_book_sections WHERE section_code = 'KYN_KJT_DN_SE');
SET @b_ne = (SELECT id FROM div_signal_book_sections WHERE section_code = 'KYN_KSRA_DN_NE');
SET @s72  = (SELECT id FROM div_signals WHERE section='KYN-KSRA' AND line='DN NE' AND direction='DN' AND normalized_signal_number='KYNS72');
SET @s82  = (SELECT id FROM div_signals WHERE section='KYN-KJT'  AND line='DN SE' AND direction='DN' AND normalized_signal_number='KYNS82');

-- book rows: straight after KYN S-58 on each page (positions checked free on 29 Sep)
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, station_code, station_name, text_color)
VALUES
  (@b_th, 11550, 'SIGNAL', 'manual', @th, 'KYN S-59', 'PF-6 STR', 'RI: L1= DN NE (KYN S-72)', 'KYN', 'Kalyan', 'RED'),
  (@b_se,   135, 'SIGNAL', 'manual', @se, 'KYN S-59', 'PF-6 STR', 'RI: L1= DN NE (KYN S-72)', 'KYN', 'Kalyan', 'RED'),
  (@b_ne,   145, 'SIGNAL', 'manual', @ne, 'KYN S-59', 'PF-6 STR', 'RI: L1= DN NE (KYN S-72)', 'KYN', 'Kalyan', 'RED');

-- routes, mirroring KYN S-58. The two DN TH line-crossover routes already existed (ids 143, 148, recorded
-- 14 Jun with from_signal_id NULL because the signal did not exist yet) — link them instead of duplicating.
INSERT INTO div_signal_successors
  (from_signal_id, from_signal_text, from_line, to_signal_id, to_signal_text, to_line, succession_type, route_condition, section, direction, remarks)
VALUES
  (@ne, 'KYN S-59', 'DN NE', @s72, 'KYN S-72', 'DN NE', 'PLATFORM_ROUTING', 'PF-6',  'KYN-KSRA', 'DN', 'NEWLY ADDED SIGNALS sheet5, 2026-09-29'),
  (@se, 'KYN S-59', 'DN SE', @s82, 'KYN S-82', 'DN SE', 'PLATFORM_ROUTING', 'PF-6',  'KYN-KJT',  'DN', 'NEWLY ADDED SIGNALS sheet5, 2026-09-29');
UPDATE div_signal_successors SET from_signal_id = @th
 WHERE from_signal_text = 'KYN S-59' AND from_line = 'DN TH' AND from_signal_id IS NULL
   AND to_signal_text IN ('KYN S-72','KYN S-82');
SELECT ROW_COUNT() AS existing_routes_linked;                                    -- expect 2
COMMIT;

SELECT s.id, s.section, s.line, s.magnet_id, s.is_rhs, b.section_code, r.row_order, r.text_color,
       (SELECT s2.signal_number FROM div_signal_book_rows r2 JOIN div_signals s2 ON s2.id = r2.signal_id
         WHERE r2.book_section_id = r.book_section_id AND r2.row_order < r.row_order AND r2.row_type='SIGNAL' ORDER BY r2.row_order DESC LIMIT 1) AS after_signal
  FROM div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id JOIN div_signal_book_sections b ON b.id = r.book_section_id
 WHERE s.normalized_signal_number = 'KYNS59' ORDER BY s.id;
SELECT COUNT(*) AS new_successor_edges, SUM(from_signal_id IS NULL OR to_signal_id IS NULL) AS unresolved
  FROM div_signal_successors WHERE from_signal_text = 'KYN S-59';   -- expect 4, 0
