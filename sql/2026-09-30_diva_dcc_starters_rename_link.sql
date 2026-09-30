-- Diva: the Dativali-Diva page (PNVL -> DCC -> DW -> CSMT, "DIVA UP") was imported on 30 Jul from the PNVL master
-- with the station written "DIVA"; everywhere else in the book Diva signals are "DW". User 2026-09-30: DW is correct.
-- The same Diva starters are also on the BSR -> DCC -> DW page ("DIVA DN", from the reverse master, written "DW"):
-- same physical signals (same PF / goods line, km 42/38), both routes run into Diva towards CSMT, so both pages
-- rightly print them. They were never linked (numbers differed), so they were two separate signals.
--   1. Rename DIVA S-69, S-56, S-57, S-58, S-59 -> DW S-69 ... (record, book row, S-69's route text naming S-56/58/59).
--      The old "DIVA S-xx" aliases stay, marked as the old name (AWS reports / old references still resolve).
--   2. Link each BSR-page copy (DW S-56..59) to the PNVL-page record's magnet: one physical signal, two pages.
--      All physical fields already agree (type, arms, visibility, placement).
-- Undo: 2026-09-30_diva_dcc_starters_rename_link_UNDO.sql
START TRANSACTION;
SET @pg = (SELECT id FROM div_signal_book_sections WHERE section_code = 'DCC_DIVA_DIVA_UP');

UPDATE div_signals
   SET signal_number = REPLACE(signal_number, 'DIVA S-', 'DW S-'),
       normalized_signal_number = REPLACE(normalized_signal_number, 'DIVAS', 'DWS'),
       station_code = 'DW',
       book_description = REPLACE(book_description, 'DIVA S-', 'DW S-')
 WHERE section = 'DCC-DIVA' AND line = 'DIVA UP' AND is_active = 1
   AND signal_number IN ('DIVA S-69', 'DIVA S-56', 'DIVA S-57', 'DIVA S-58', 'DIVA S-59');
SELECT ROW_COUNT() AS renamed;                                                  -- expect 5

UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.display_signal_no = s.signal_number,
       r.display_description = REPLACE(r.display_description, 'DIVA S-', 'DW S-')
 WHERE r.book_section_id = @pg AND s.signal_number IN ('DW S-69', 'DW S-56', 'DW S-57', 'DW S-58', 'DW S-59');
SELECT ROW_COUNT() AS book_rows_renamed;                                        -- expect 5

UPDATE div_signal_aliases a JOIN div_signals s ON s.id = a.signal_id
   SET a.remarks = 'Old name: DIVA S-xx renamed DW S-xx (user 30 Sep 2026)'
 WHERE a.normalized_alias IN ('DIVAS69', 'DIVAS56', 'DIVAS57', 'DIVAS58', 'DIVAS59') AND s.section = 'DCC-DIVA';
SELECT ROW_COUNT() AS old_aliases_marked;                                       -- expect 5
-- DW S-56..59 already have aliases (on the BSR-page copies, now the same magnet); DW S-69 is new.
INSERT IGNORE INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks)
  SELECT id, 'DW S-69', 'DWS69', 'manual', 'HIGH', 'Renamed from DIVA S-69 (user 30 Sep 2026)'
    FROM div_signals WHERE section = 'DCC-DIVA' AND line = 'DIVA UP' AND signal_number = 'DW S-69';
SELECT ROW_COUNT() AS new_alias;                                                -- expect 1

-- 2. Link: BSR-page copy -> the PNVL-page record's magnet.
UPDATE div_signals bsr
  JOIN div_signals pnvl ON pnvl.section = 'DCC-DIVA' AND pnvl.line = 'DIVA UP' AND pnvl.signal_number = bsr.signal_number
   SET bsr.magnet_id = pnvl.magnet_id
 WHERE bsr.section = 'DCC-DIVA' AND bsr.line = 'DIVA DN' AND bsr.is_active = 1
   AND bsr.signal_number IN ('DW S-56', 'DW S-57', 'DW S-58', 'DW S-59') AND bsr.magnet_id = bsr.id;
SELECT ROW_COUNT() AS copies_linked;                                            -- expect 4

INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT id, 'Renumbered', REPLACE(signal_number, 'DW S-', 'DIVA S-'), signal_number, CURDATE(),
         'Station written DIVA on the Dativali-Diva page; DW as elsewhere in the book (user 30 Sep)'
    FROM div_signals WHERE section = 'DCC-DIVA' AND line = 'DIVA UP'
     AND signal_number IN ('DW S-69', 'DW S-56', 'DW S-57', 'DW S-58', 'DW S-59');
COMMIT;

SELECT s.id, s.signal_number, s.line, s.station_code, s.magnet_id, r.display_signal_no, LEFT(r.display_description, 70) AS page_text
  FROM div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
 WHERE s.section = 'DCC-DIVA' AND s.signal_number REGEXP '^DW S-(5[6-9]|69)$' ORDER BY s.signal_number, s.line;
