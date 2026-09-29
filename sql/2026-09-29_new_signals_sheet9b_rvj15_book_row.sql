-- Follow-up to sheet 9 (user, 2026-09-29): RVJ S-15 (id 1747, CSMT-PNVL DN HB, added 23 Jun) existed but had no book row,
-- so it never showed. Place it between RVJ S-9 and RVJ S-22 ("before RVJ S-22" in the sheet), red (RHS). Not parallel.
-- Undo: delete this book row (signal_id of RVJ S-15 on CSMT_PNVL_DN_HB, row_order 3850).
START TRANSACTION;
SET @rvj15 = (SELECT id FROM div_signals WHERE section='CSMT-PNVL' AND line='DN HB' AND direction='DN' AND signal_number='RVJ S-15');
INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, station_code, station_name, text_color)
SELECT (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_PNVL_DN_HB'), 3850, 'SIGNAL', 'manual', @rvj15, 'RVJ S-15', 'VDLR', 'Wadala Road', 'RED'
 WHERE NOT EXISTS (SELECT 1 FROM div_signal_book_rows WHERE signal_id = @rvj15);
SELECT ROW_COUNT() AS rows_added;                                                 -- expect 1
COMMIT;
