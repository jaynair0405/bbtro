-- Add missed signal ABH S-9 to KYN-KJT (Ambernath PF-3 KJT-end starter).
-- Date: 2026-08-06
--
-- Physical: stands on the UP line at Ambernath PF-3, KJT end. Governs a DN train
-- received on PF-3 being taken to the yard. So line = 'UP SE' (prints on the UP line,
-- next to ABH S-22 PF-3 STR) but direction = 'DN' (the move it authorises). It is its
-- own partition (KYN-KJT / UP SE / DN — no other rows), so seq_order/magnet are isolated.
--
-- Option C rendering: the signal lives once in UP SE (physically correct); a cross-
-- reference TEXT_NOTE is added at Ambernath in the DN SE line so the DN driver — who
-- reads the DN line — is pointed to it. (Same cross-ref pattern as the PNVL complex.)
--
-- Placement (UP SE reads KJT->KYN, descending km): ABH S-25 (60.136) -> AMBERNATH header
-- (59.83) -> ABH S-9 (59.795, row 5475) -> ABH S-22 PF-3 STR (59.332).

INSERT INTO div_signals
  (signal_number, normalized_signal_number, section, station_code, station_name,
   line, direction, location_text, km_from_csmt, latitude, longitude,
   signal_type, signal_function, placement, on_curve,
   is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on,
   has_shunt_signal, ri_left_arms, ri_right_arms, seq_order, is_active)
VALUES
  ('ABH S-9', 'ABHS9', 'KYN-KJT', 'ABH', 'Ambernath',
   'UP SE', 'DN', 'PF-3 KJT END STR', 59.795, 19.2093711, 73.1860105,
   'Manual', 'Starter', 'Left', 'Unknown',
   0, 0, 1, 0, 0, 0,
   1, 0, 0, 1, 1);

SET @sid = LAST_INSERT_ID();
-- self-magnet (unique: station ABH + ABH S-9 + direction DN has no twin)
UPDATE div_signals SET magnet_id = @sid WHERE id = @sid;

-- book row in UP SE (section 12), after the AMBERNATH header (5450), before ABH S-22 (5500)
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id,
   display_signal_no, display_location, station_code, station_name,
   highlight_color, text_color, icon_type, is_active)
VALUES
  (12, 5475, 'SIGNAL', 'manual', @sid,
   'ABH S-9', 'PF-3 KJT END STR', 'ABH', 'Ambernath',
   'NONE', 'BLACK', 'NONE', 1);

-- Option C cross-reference note in DN SE (section 11), at Ambernath PF area (after ABH S-6)
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source,
   display_description, highlight_color, text_color, icon_type, is_active)
VALUES
  (11, 850, 'TEXT_NOTE', 'manual',
   'DN train received on PF-3 → taken to Yard by ABH S-9 (on UP SE line)',
   'NONE', 'BLACK', 'NONE', 1);

-- Mark it on the UP-line rendering so an UP reader knows it is a DN-only route.
UPDATE div_signals SET book_description = 'FOR DN DIRECTION ONLY'
  WHERE signal_number = 'ABH S-9' AND section = 'KYN-KJT' AND line = 'UP SE';
UPDATE div_signal_book_rows SET display_description = 'FOR DN DIRECTION ONLY'
  WHERE book_section_id = 12 AND row_order = 5475 AND display_signal_no = 'ABH S-9';

-- AWS alias (matcher resolves location text -> alias -> signal). Surgical inserts skip
-- the importer's auto-alias, so add it explicitly, else AWS can't detect this signal.
INSERT INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks)
SELECT id, 'ABH S-9', 'ABHS9', 'manual', 'HIGH', 'Missed signal, manual add 2026-08-06'
FROM div_signals WHERE signal_number = 'ABH S-9' AND section = 'KYN-KJT' AND line = 'UP SE';
