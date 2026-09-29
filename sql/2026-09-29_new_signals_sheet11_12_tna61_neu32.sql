-- NEWLY ADDED SIGNALS sheet, tabs "TNA-TUH DN THB" and "TUH-NEU DN THB" (user, 2026-09-29).
-- TNA S-61 (id 3743) and NEU S-32 (id 3744) already existed, added 19 Aug, but under section/line names no page uses
-- ('TNA-VSH' / 'TNA-NEU', line 'THB') — so they had no book row and never showed. Move them to the pages the sheet
-- names (ids and magnets unchanged) and place them:
--   TNA S-61  TNA-TUH / DN THB: Thane header, TNA S-62 (PF-9 STR), S-61 (PF-10 STR), TN-01.  S-61 || S-62.
--   NEU S-32  TUH-NEU / DN THB: NEU S-2 (R1 = PF-2), Nerul header, NEU S-31 (PF-1 STR), S-32 (PF-2 STR).  S-31 || S-32.
-- Routes: link June routes 493 (TNA S-61 -> TN-01), 471 (NEU S-2 -> S-32), 473 (S-32 -> NEU S-41) and 472
-- (NEU S-31 -> NEU S-41, waiting for the same reason). NEU S-41 is on CSMT-PNVL DN HB (Nerul junction), so those
-- routes' to_line becomes 'DN HB'. New route NEU S-32 -> NEU S-43 (R1, NEU-KILLE DN BSU).
-- Undo: 2026-09-29_new_signals_sheet11_12_tna61_neu32_UNDO.sql
START TRANSACTION;
SET @tna61 = (SELECT id FROM div_signals WHERE signal_number = 'TNA S-61' AND section = 'TNA-VSH' AND line = 'THB');
SET @neu32 = (SELECT id FROM div_signals WHERE signal_number = 'NEU S-32' AND section = 'TNA-NEU' AND line = 'THB');
UPDATE div_signals SET section = 'TNA-TUH', line = 'DN THB' WHERE id = @tna61;
UPDATE div_signals SET section = 'TUH-NEU', line = 'DN THB' WHERE id = @neu32;
SELECT COUNT(*) AS moved FROM div_signals WHERE id IN (@tna61, @neu32) AND line = 'DN THB';          -- expect 2

SET @tna62 = (SELECT id FROM div_signals WHERE section='TNA-TUH' AND line='DN THB' AND signal_number='TNA S-62');
SET @neu31 = (SELECT id FROM div_signals WHERE section='TUH-NEU' AND line='DN THB' AND signal_number='NEU S-31');
SET @neu41 = (SELECT id FROM div_signals WHERE section='CSMT-PNVL' AND line='DN HB' AND signal_number='NEU S-41');
SET @neu43 = (SELECT id FROM div_signals WHERE section='NEU-KILLE' AND line='DN BSU' AND signal_number='NEU S-43');

SET @pg = (SELECT MAX(parallel_group_id) FROM div_signals);
UPDATE div_signals SET parallel_group_id = @pg + 1 WHERE id IN (@tna61, @tna62);
UPDATE div_signals SET parallel_group_id = @pg + 2 WHERE id IN (@neu31, @neu32);

INSERT INTO div_signal_book_rows
  (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no, display_location, display_description, station_code, station_name)
VALUES
  ((SELECT id FROM div_signal_book_sections WHERE section_code = 'TNA_TUH_DN_THB'), 150, 'SIGNAL', 'manual', @tna61, 'TNA S-61', 'PF-10 STR', NULL,             'TNA', 'Thane'),
  ((SELECT id FROM div_signal_book_sections WHERE section_code = 'TUH_NEU_DN_THB'), 750, 'SIGNAL', 'manual', @neu32, 'NEU S-32', 'PF-2 STR',  'RI: R1= NEU S-43', 'NEU', 'Nerul');

UPDATE div_signal_successors SET from_signal_id = @tna61 WHERE id = 493 AND from_signal_text = 'TNA S-61' AND from_signal_id IS NULL;
UPDATE div_signal_successors SET to_signal_id = @neu32   WHERE id = 471 AND to_signal_text = 'NEU S-32' AND to_signal_id IS NULL;
UPDATE div_signal_successors SET from_signal_id = @neu32, to_signal_id = @neu41, to_line = 'DN HB'
 WHERE id = 473 AND from_signal_text = 'NEU S-32' AND to_signal_text = 'NEU S-41' AND to_signal_id IS NULL;
UPDATE div_signal_successors SET to_signal_id = @neu41, to_line = 'DN HB'
 WHERE id = 472 AND from_signal_text = 'NEU S-31' AND to_signal_text = 'NEU S-41' AND to_signal_id IS NULL;
SELECT COUNT(*) AS june_routes_linked FROM div_signal_successors WHERE id IN (471,472,473,493) AND from_signal_id IS NOT NULL AND to_signal_id IS NOT NULL;  -- expect 4

INSERT INTO div_signal_successors
  (from_signal_id, from_signal_text, from_line, to_signal_id, to_signal_text, to_line, succession_type, route_condition, section, direction, remarks)
VALUES (@neu32, 'NEU S-32', 'DN THB', @neu43, 'NEU S-43', 'DN BSU', 'LINE_CROSSOVER', 'R1', 'TUH-NEU', 'DN', 'NEWLY ADDED SIGNALS sheet11-12, 2026-09-29');
COMMIT;

SELECT b.section_code, r.row_order, s.signal_number, s.section, s.line, s.location_text, s.parallel_group_id pg, s.magnet_id
  FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id JOIN div_signal_book_sections b ON b.id = r.book_section_id
 WHERE b.section_code IN ('TNA_TUH_DN_THB','TUH_NEU_DN_THB') AND r.row_order BETWEEN 100 AND 750 AND s.station_code IN ('TNA','NEU') ORDER BY 1,2;
