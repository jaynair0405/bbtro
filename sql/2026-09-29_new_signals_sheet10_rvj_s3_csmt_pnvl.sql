-- NEWLY ADDED SIGNALS sheet, tab "PNVL-CSMT UP HB" (user, 2026-09-29).
--   MNKD S-22 REP already existed (sheet 2), fields match.
--   RVJ S-3 (Wadala Road PF-3 starter) existed only on the VDLR-GMN UP HB page (id 1644). Add its CSMT-PNVL UP HB
--   copy — one physical signal on two pages, sharing magnet 1644 — exactly like RVJ S-4 (ids 933 / 1643, magnet 933).
--   Book: after RVJ S-4, before H-38. RVJ S-3 || RVJ S-4 (PF-3 / PF-4 starters) on both pages.
-- Undo: 2026-09-29_new_signals_sheet10_rvj_s3_csmt_pnvl_UNDO.sql
START TRANSACTION;
SET @gmn3 = (SELECT id FROM div_signals WHERE section='VDLR-GMN'  AND line='UP HB' AND direction='UP' AND signal_number='RVJ S-3');
SET @gmn4 = (SELECT id FROM div_signals WHERE section='VDLR-GMN'  AND line='UP HB' AND direction='UP' AND signal_number='RVJ S-4');
SET @hb4  = (SELECT id FROM div_signals WHERE section='CSMT-PNVL' AND line='UP HB' AND direction='UP' AND signal_number='RVJ S-4');

INSERT INTO div_signals (section, magnet_id, signal_number,normalized_signal_number,station_code,station_name,line,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active)
  SELECT 'CSMT-PNVL', magnet_id, signal_number,normalized_signal_number,station_code,station_name,line,direction,location_text,km_text,km_from_csmt,latitude,longitude,signal_type,signal_function,aspects,placement,on_curve,curve_remarks,is_rhs,is_ext_rhs,is_lhs,is_ext_lhs,has_legend_board,has_calling_on,has_shunt_signal,ri_left_arms,ri_right_arms,book_description,route_indicator_notes,technical_remarks,visibility_distance_m,sighting_remarks,is_active FROM div_signals WHERE id = @gmn3;
SET @hb3 = LAST_INSERT_ID();

SET @pg = (SELECT MAX(parallel_group_id) FROM div_signals);
UPDATE div_signals SET parallel_group_id = @pg + 1 WHERE id IN (@hb3, @hb4);
UPDATE div_signals SET parallel_group_id = @pg + 2 WHERE id IN (@gmn3, @gmn4);

INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, station_code, station_name)
VALUES ((SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_PNVL_UP_HB'), 8150, 'SIGNAL', 'manual', @hb3,
        'RVJ S-3', 'VDLR PF-3', 'VDLR', 'Wadala Road');
COMMIT;

SELECT s.id, s.section, s.line, s.location_text, s.magnet_id, s.parallel_group_id pg, b.section_code, r.row_order
  FROM div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id JOIN div_signal_book_sections b ON b.id = r.book_section_id
 WHERE s.signal_number IN ('RVJ S-3','RVJ S-4') AND s.direction = 'UP' ORDER BY b.section_code, r.row_order;
