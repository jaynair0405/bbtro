-- NEWLY ADDED SIGNALS sheet, tab "repeater_signals": all 11 repeaters already existed (added 21 Aug,
-- ids 3757-3767). Five on the CSMT-PNVL DN HB page sat several stations too early (row_order X95
-- before an unrelated row). Move each to its own station: after the station header, just before the
-- signal it repeats. row_order only; nothing else changes. (User, 2026-09-29.)
-- Undo: 2026-09-29_new_signals_sheet2_repeater_positions_UNDO.sql
START TRANSACTION;
SET @dnhb = (SELECT id FROM div_signal_book_sections WHERE section_code = 'CSMT_PNVL_DN_HB');

UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
   SET r.row_order = CASE s.normalized_signal_number
         WHEN 'H09REP'    THEN 1150   -- SNRD header 1100, H-09 1200
         WHEN 'H13REP'    THEN 1550   -- DKRD header 1500, H-13 1600
         WHEN 'H23REP'    THEN 2450   -- CTGN header 2400, H-23 2500
         WHEN 'MNKDS4REP' THEN 6950   -- MNKD header 6900, MNKD S-4 7000
         WHEN 'VSHS5REP'  THEN 8750   -- VSH  header 8700, VSH S-5 8800
       END
 WHERE r.book_section_id = @dnhb AND s.section = 'CSMT-PNVL' AND s.line = 'DN HB'
   AND (s.normalized_signal_number, r.row_order) IN
       (('H09REP',595), ('H13REP',795), ('H23REP',1295), ('MNKDS4REP',4395), ('VSHS5REP',5995));
SELECT ROW_COUNT() AS repeaters_moved;                                                  -- expect 5
COMMIT;

SELECT s.signal_number AS repeater, r.row_order,
       (SELECT s2.signal_number FROM div_signal_book_rows r2 JOIN div_signals s2 ON s2.id = r2.signal_id
         WHERE r2.book_section_id = r.book_section_id AND r2.row_order > r.row_order AND r2.row_type = 'SIGNAL'
         ORDER BY r2.row_order LIMIT 1) AS next_signal
  FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE r.book_section_id = @dnhb AND s.signal_type = 'Repeater' ORDER BY r.row_order;
