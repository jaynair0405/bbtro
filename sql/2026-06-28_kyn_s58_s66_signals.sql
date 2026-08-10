-- KYN S-58 (PF-5 starter, 3 DN lines) + KYN S-66 (DN NE, PF-1->NE connector)
-- Date: 2026-06-28. Source: data/KYN_KSRA/kyn_miised_signals.xlsx
-- KYN S-58 mirrors the KYN S-56 (PF-4) junction-starter pattern: one record per DN line
-- (CSMT-KYN/DN TH, KYN-KSRA/DN NE, KYN-KJT/DN SE). Book rows placed beside KYN S-56.
-- KYN S-66: one DN NE record, book row before KYN S-72. signal_type normalised
-- 'Semi Automatic' -> 'Semi-Automatic' (enum). Successors loaded separately.
-- Idempotent: ON DUPLICATE KEY UPDATE on signals; book rows use INSERT IGNORE on (section,row_order).

INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name, section, line, direction, location_text, km_text, km_from_csmt, signal_type, signal_function, placement, on_curve, curve_remarks, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, technical_remarks, visibility_distance_m, sighting_remarks, is_active)
VALUES
  ('KYN S-58','KYNS58','KYN','Kalyan','CSMT-KYN','DN TH','DN','PF-5 STR',NULL,NULL,'Semi-Automatic',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,1,0,'RI:L1=S-72','Book shows one left arm on top of vertical stem',NULL,NULL,NULL,1),
  ('KYN S-58','KYNS58','KYN','Kalyan','KYN-KSRA','DN NE','DN','PF-5 STR',NULL,NULL,'Semi-Automatic',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,1,0,'RI:L1=S-72','Book shows one left arm on top of vertical stem',NULL,NULL,NULL,1),
  ('KYN S-58','KYNS58','KYN','Kalyan','KYN-KJT','DN SE','DN','PF-5 STR',NULL,NULL,'Semi-Automatic',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,1,0,'RI:L1=S-72','Book shows one left arm on top of vertical stem',NULL,NULL,NULL,1),
  ('KYN S-66','KYNS66','KYN','Kalyan','KYN-KSRA','DN NE','DN','EXIT PF-1',NULL,NULL,'Semi-Automatic',NULL,'Left','Unknown',NULL,0,0,1,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,1)
ON DUPLICATE KEY UPDATE
  location_text=VALUES(location_text), signal_type=VALUES(signal_type), placement=VALUES(placement),
  is_lhs=VALUES(is_lhs), ri_left_arms=VALUES(ri_left_arms), book_description=VALUES(book_description),
  route_indicator_notes=VALUES(route_indicator_notes), has_calling_on=VALUES(has_calling_on), is_active=VALUES(is_active);

-- Aliases
INSERT IGNORE INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence)
SELECT id, signal_number, normalized_signal_number, 'excel_import', 'HIGH' FROM div_signals
 WHERE signal_number IN ('KYN S-58','KYN S-66') AND section IN ('CSMT-KYN','KYN-KSRA','KYN-KJT');

-- Book rows (SIGNAL), placed beside KYN S-56 / before KYN S-72
INSERT IGNORE INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, text_color, icon_type, highlight_color, is_active)
SELECT 1, 11500, 'SIGNAL', 'import', id, signal_number, location_text,
   CASE WHEN book_description<>'' THEN book_description ELSE NULL END,
   CASE WHEN (is_rhs=1 OR is_ext_rhs=1) THEN 'RED' ELSE 'BLACK' END,
   CASE WHEN has_legend_board=1 THEN 'LEGEND_BOARD' ELSE 'NONE' END, 'NONE', 1
  FROM div_signals WHERE signal_number='KYN S-58' AND section='CSMT-KYN' AND `line`='DN TH';
INSERT IGNORE INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, text_color, icon_type, highlight_color, is_active)
SELECT 13, 130, 'SIGNAL', 'import', id, signal_number, location_text,
   CASE WHEN book_description<>'' THEN book_description ELSE NULL END,
   CASE WHEN (is_rhs=1 OR is_ext_rhs=1) THEN 'RED' ELSE 'BLACK' END,
   CASE WHEN has_legend_board=1 THEN 'LEGEND_BOARD' ELSE 'NONE' END, 'NONE', 1
  FROM div_signals WHERE signal_number='KYN S-58' AND section='KYN-KSRA' AND `line`='DN NE';
INSERT IGNORE INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, text_color, icon_type, highlight_color, is_active)
SELECT 11, 120, 'SIGNAL', 'import', id, signal_number, location_text,
   CASE WHEN book_description<>'' THEN book_description ELSE NULL END,
   CASE WHEN (is_rhs=1 OR is_ext_rhs=1) THEN 'RED' ELSE 'BLACK' END,
   CASE WHEN has_legend_board=1 THEN 'LEGEND_BOARD' ELSE 'NONE' END, 'NONE', 1
  FROM div_signals WHERE signal_number='KYN S-58' AND section='KYN-KJT' AND `line`='DN SE';
INSERT IGNORE INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, text_color, icon_type, highlight_color, is_active)
SELECT 13, 160, 'SIGNAL', 'import', id, signal_number, location_text,
   CASE WHEN book_description<>'' THEN book_description ELSE NULL END,
   CASE WHEN (is_rhs=1 OR is_ext_rhs=1) THEN 'RED' ELSE 'BLACK' END,
   CASE WHEN has_legend_board=1 THEN 'LEGEND_BOARD' ELSE 'NONE' END, 'NONE', 1
  FROM div_signals WHERE signal_number='KYN S-66' AND section='KYN-KSRA' AND `line`='DN NE';
