-- NEWLY ADDED SIGNALS sheet, tab "CSMT-PNVL DN HB". 7 of 9 rows already existed (CSMT S-2, RVJ S-15 and the five
-- DN HB repeaters moved with sheet 2). Decisions agreed with the user 2026-09-29:
--   CLA S-13   Kurla PF-8 starter (RI L1 -> H-51, L2 -> CLA YD). After CLA S-12 (PF-7 STR), before the PSR and H-51.
--              Parallel CLA S-12 || S-13. June route CLA S-13 -> H-51 (id 787) linked.
--   PNVL S-404 at 48/H110 (RI R1 -> PF-3), reached by PNVL S-402's R1 arm. After PNVL S-403, before the Panvel header.
--              Parallel PNVL S-403 || S-404. June route PNVL S-402 -> S-404 (id 486) linked.
--   RVJ S-15   has_calling_on = 1, as in the sheet (database had 0).
-- Undo: 2026-09-29_new_signals_sheet9_csmt_pnvl_dn_hb_UNDO.sql
START TRANSACTION;

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('CLA S-13', 'CLA', 'Kurla', 'CSMT-PNVL', 'DN HB', 'DN', 'PF-8 STR', '15/H15', 15.481, NULL, NULL, 'Semi-Automatic', NULL, 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 0, 0, 2, 0, 'RI: L1= DN HB (H-51); L2= CLA YD', 'Book shows two left arms on top of vertical stem', NULL, NULL, NULL, 1, 'CLAS13');
SET @cla13 = LAST_INSERT_ID();

INSERT INTO div_signals (signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, latitude, longitude, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active, normalized_signal_number)
  VALUES ('PNVL S-404', 'PNVL', 'Panvel', 'CSMT-PNVL', 'DN HB', 'DN', '48/H110', '48/H110', NULL, NULL, NULL, 'Semi-Automatic', NULL, 'Left', 'Unknown', NULL, 0, 0, 1, 0, 0, 1, 1, 0, 1, 'RI: R1= PF-3', 'Book shows one right arm on top of vertical stem', NULL, NULL, NULL, 1, 'PNVLS404');
SET @pnvl404 = LAST_INSERT_ID();

UPDATE div_signals SET magnet_id = id WHERE id IN (@cla13, @pnvl404);
SET @cla12 = (SELECT id FROM div_signals WHERE section='CSMT-PNVL' AND line='DN HB' AND direction='DN' AND signal_number='CLA S-12'); SET @pnvl403 = (SELECT id FROM div_signals WHERE section='CSMT-PNVL' AND line='DN HB' AND direction='DN' AND signal_number='PNVL S-403');

SET @pg = (SELECT MAX(parallel_group_id) FROM div_signals);
UPDATE div_signals SET parallel_group_id = @pg + 1 WHERE id IN (@cla12, @cla13);
UPDATE div_signals SET parallel_group_id = @pg + 2 WHERE id IN (@pnvl403, @pnvl404);

SET @bs = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_PNVL_DN_HB');
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, station_code, station_name)
VALUES
  (@bs,  5050, 'SIGNAL', 'manual', @cla13,   'CLA S-13',   'PF-8 STR', 'RI: L1= DN HB (H-51); L2= CLA YD', 'CLA',  'Kurla'),
  (@bs, 15550, 'SIGNAL', 'manual', @pnvl404, 'PNVL S-404', '48/H110',  'RI: R1= PF-3',                     'PNVL', 'Panvel');

UPDATE div_signal_successors SET from_signal_id = @cla13 WHERE id = 787 AND from_signal_text = 'CLA S-13'   AND from_signal_id IS NULL;
UPDATE div_signal_successors SET to_signal_id = @pnvl404 WHERE id = 486 AND to_signal_text   = 'PNVL S-404' AND to_signal_id IS NULL;
SELECT COUNT(*) AS june_routes_linked FROM div_signal_successors WHERE id IN (486, 787) AND from_signal_id IS NOT NULL AND to_signal_id IS NOT NULL;  -- expect 2

SET @rvj15 = (SELECT id FROM div_signals WHERE section='CSMT-PNVL' AND line='DN HB' AND direction='DN' AND signal_number='RVJ S-15');
UPDATE div_signals SET has_calling_on = 1 WHERE id = @rvj15 AND has_calling_on = 0;
SELECT ROW_COUNT() AS rvj15_calling_on_set;                                      -- expect 1
COMMIT;

SELECT r.row_order, s.signal_number, s.location_text, s.parallel_group_id pg, r.display_description
  FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE r.book_section_id = @bs AND (r.row_order BETWEEN 5000 AND 5200 OR r.row_order BETWEEN 15400 AND 15600) ORDER BY r.row_order;
