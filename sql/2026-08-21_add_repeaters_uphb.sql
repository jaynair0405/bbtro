-- Two more repeater signals on CSMT_PNVL_UP_HB, each just before its parent
-- (parent row - 5): H-24 REP -> before H-24 (8900), H-08 REP -> before H-08 (9600).
-- Additive; local then prod. Re-run magnet backfill after (magnet_id starts NULL).
INSERT INTO div_signals
  (signal_number, normalized_signal_number, station_code, station_name, section, line,
   direction, location_text, signal_type, placement, on_curve,
   is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal,
   ri_left_arms, ri_right_arms, is_active)
VALUES
  ('H-24 REP','H24REP',NULL,NULL,'CSMT-PNVL','UP HB','UP','CTGN PF','Repeater','Left','Unknown',0,0,1,0,0,0,0,0,0,1),
  ('H-08 REP','H08REP',NULL,NULL,'CSMT-PNVL','UP HB','UP','SNRD PF','Repeater','Left','Unknown',0,0,1,0,0,0,0,0,0,1);

INSERT INTO div_signal_book_rows (book_section_id, row_order, row_type, signal_id, display_signal_no, display_location, is_active)
SELECT sec.id, 8895, 'SIGNAL', (SELECT id FROM div_signals WHERE signal_number='H-24 REP' AND section='CSMT-PNVL' AND line='UP HB'), 'H-24 REP', 'CTGN PF', 1
FROM div_signal_book_sections sec WHERE sec.section_code='CSMT_PNVL_UP_HB';

INSERT INTO div_signal_book_rows (book_section_id, row_order, row_type, signal_id, display_signal_no, display_location, is_active)
SELECT sec.id, 9595, 'SIGNAL', (SELECT id FROM div_signals WHERE signal_number='H-08 REP' AND section='CSMT-PNVL' AND line='UP HB'), 'H-08 REP', 'SNRD PF', 1
FROM div_signal_book_sections sec WHERE sec.section_code='CSMT_PNVL_UP_HB';

SELECT r.row_order, r.display_signal_no, r.display_location, sg.signal_type
FROM div_signal_book_rows r JOIN div_signal_book_sections sec ON sec.id=r.book_section_id AND sec.section_code='CSMT_PNVL_UP_HB'
JOIN div_signals sg ON sg.id=r.signal_id
WHERE sg.signal_number IN ('H-24 REP','H-08 REP') ORDER BY r.row_order;
