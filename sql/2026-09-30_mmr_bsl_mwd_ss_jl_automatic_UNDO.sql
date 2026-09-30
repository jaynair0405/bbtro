-- Undo 2026-09-30_mmr_bsl_mwd_ss_jl_automatic.sql
START TRANSACTION;
SET @dn = (SELECT id FROM div_signal_book_sections WHERE section_code = 'MMR_BSL_DN_NE');
SET @up = (SELECT id FROM div_signal_book_sections WHERE section_code = 'MMR_BSL_UP_NE');
SET @why = 'Instruction 17/2026 (BSL GI 20/2026): automatic signalling MWD-SS-JL, 08.09.2026';

-- new signals out (history, aliases, book rows, records)
CREATE TEMPORARY TABLE mb_newu (line VARCHAR(40), signal_number VARCHAR(40));
INSERT INTO mb_newu VALUES
  ('DN NE','S-40025'),('DN NE','S-40127'),('DN NE','S-40229'),('DN NE','S-40403'),('DN NE','S-40507'),('DN NE','S-40609'),
  ('DN NE','S-40925'),('DN NE','S-41025'),('DN NE','S-41127'),('DN NE','S-41227'),('DN NE','S-41327'),('DN NE','S-41427'),
  ('DN NE','S-41527'),('DN NE','S-41627'),('DN NE','S-41727'),
  ('UP NE','S-41722'),('UP NE','S-41620'),('UP NE','S-41516'),('UP NE','S-41414'),('UP NE','S-41312'),('UP NE','S-41210'),
  ('UP NE','S-41104'),('UP NE','S-41002'),('UP NE','S-40610'),('UP NE','S-40506'),('UP NE','S-40404'),('UP NE','S-40304'),
  ('UP NE','S-40128'),('UP NE','S-40026');
DELETE h FROM div_signal_history h JOIN div_signals s ON s.id = h.signal_id WHERE s.section = 'MMR-BSL' AND h.remarks = @why;
DELETE a FROM div_signal_aliases a JOIN div_signals s ON s.id = a.signal_id
  JOIN mb_newu n ON n.line = s.line AND n.signal_number = s.signal_number WHERE s.section = 'MMR-BSL';
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
  JOIN mb_newu n ON n.line = s.line AND n.signal_number = s.signal_number WHERE s.section = 'MMR-BSL';
DELETE s FROM div_signals s JOIN mb_newu n ON n.line = s.line AND n.signal_number = s.signal_number WHERE s.section = 'MMR-BSL';

-- row order back
UPDATE div_signal_book_rows SET row_order = 11920
 WHERE book_section_id = @dn AND row_type = 'PSR' AND km_range_text = '411/29-412/21' AND row_order = 11970;
UPDATE div_signal_book_rows SET row_order = 5040
 WHERE book_section_id = @up AND row_type = 'PSR' AND km_range_text = '403/12-381/04' AND row_order = 5070;

-- km back
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.km_text = CASE s.signal_number WHEN 'SS S-4' THEN '408/13' WHEN 'JL S-82' THEN '419/02' ELSE '419/20 A' END,
       s.location_text = CASE s.signal_number WHEN 'SS S-4' THEN '408/13' WHEN 'JL S-82' THEN '419/02' ELSE '419/20 A' END,
       r.display_location = CASE s.signal_number WHEN 'SS S-4' THEN '408/13' WHEN 'JL S-82' THEN '419/02' ELSE '419/20 A' END
 WHERE s.section = 'MMR-BSL' AND ((s.line = 'DN NE' AND s.signal_number = 'SS S-4' AND s.km_text = '408/15')
    OR (s.line = 'UP NE' AND s.signal_number = 'JL S-82' AND s.km_text = '419/04')
    OR (s.line = 'UP NE' AND s.signal_number = 'JL S-74' AND s.km_text = '419/20A'));

-- types back
UPDATE div_signals SET signal_type = 'Manual'
 WHERE section = 'MMR-BSL' AND signal_type = 'Semi-Automatic'
   AND ((line = 'DN NE' AND signal_number IN ('MWD S-22','SS S-2','SS S-4','SS S-8'))
     OR (line = 'UP NE' AND signal_number IN ('JL S-85','SS S-28','SS S-19','SS S-15')));

-- retired signals back
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.is_active = 1, r.is_active = 1
 WHERE s.section = 'MMR-BSL' AND s.is_active = 0
   AND ((s.line = 'DN NE' AND s.signal_number IN ('MWD IBS DIST','MWD IBS INN DIST','MWD IBS S-21','SS DIST','SS INN DIST',
                                                  'SS IBS DIST','SS IBS INN DIST','SS IBS S-9','JL DIST','JL INN DIST'))
     OR (s.line = 'UP NE' AND s.signal_number IN ('JL IBS DIST','JL IBS INN DIST','JL IBS S-83','SS DIST','SS INN DIST',
                                                  'SS IBS DIST','SS IBS INN DIST','SS IBS S-12','MWD DIST','MWD INN DIST')));
COMMIT;
