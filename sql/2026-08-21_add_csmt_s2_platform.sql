-- Add missing CSMT S-2 (PF-2 starter, CSMT) — a platform signal parallel to
-- CSMT S-1 on the DN HB line. Insert into div_signals + a book row right after
-- CSMT S-1 (row 100) at row_order 120 in CSMT_PNVL_DN_HB. Additive; local then prod.
INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name, section, line,
   direction, location_text, km_text, km_from_csmt, signal_type, signal_function,
   placement, on_curve, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs,
   has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms,
   book_description, route_indicator_notes, visibility_distance_m, is_active)
VALUES
  ('CSMT S-2', 'CSMTS2', 'CSMT', 'Csmt', 'CSMT-PNVL', 'DN HB',
   'DN', 'PF-2 STR', 'WCLAM6+42', 0, 'Semi-Automatic', NULL,
   'Left', 'Unknown', 0, 0, 1, 0,
   0, 1, 0, 2, 1,
   'RI: L1= DN HB (H-03); L2= DN HB (S-34); R1= DN LL (L-001)',
   'Book shows two left and one right arms on top of vertical stem', 250, 1);

SET @sid := LAST_INSERT_ID();

INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, signal_id, display_signal_no, display_location, display_description, is_active)
SELECT sec.id, 120, 'SIGNAL', @sid, 'CSMT S-2', 'PF-2 STR',
       'RI: L1= DN HB (H-03); L2= DN HB (S-34); R1= DN LL (L-001)', 1
FROM div_signal_book_sections sec WHERE sec.section_code = 'CSMT_PNVL_DN_HB';

SELECT sg.id, sg.signal_number, sg.ri_left_arms, sg.ri_right_arms,
       r.row_order, r.display_signal_no, r.display_location
FROM div_signals sg
JOIN div_signal_book_rows r ON r.signal_id = sg.id
WHERE sg.signal_number = 'CSMT S-2';
