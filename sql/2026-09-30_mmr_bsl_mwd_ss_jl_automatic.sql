-- MMR-BSL: automatic signalling commissioned MWD - SS - JL, both directions (km 399-420).
-- Source: BSL Division General Instruction 20/2026 = BB Instruction 17/2026, 08.09.2026
--         (data/mmr_bsl/INST 17-2026.pdf) + user sheet "JL-SS-MWD UP/DN 08/09/2026" (same list).
--   1. Retire the 20 signals the new layout replaces (IBH signals closed; distants / inner distants gone):
--      signal + book row is_active = 0, aliases kept (old names still resolve), history 'Decommissioned'.
--   2. MWD S-22, SS S-2/4/8 (DN) and JL S-85, SS S-28/19/15 (UP) -> Semi-Automatic.
--   3. Km per the instruction: SS S-4 408/15 (was 408/13), JL S-82 419/04 (was 419/02), JL S-74 419/20A (was '419/20 A').
--   4. 29 new automatic signals S-xxxxx (official numbers; 15 DN, 14 UP), in running order among the existing rows.
--   5. Row order per the book: DN neutral section before "120 KMPH 411/29-412/21" (S-41127 between them);
--      UP "95 KMPH 404/22-403/12" before "110 KMPH 403/12-381/04" (S-40404 between them).
-- SS S-2 keeps "RI: L1= DN LOOP" (the sheet's RI on S-40609 is a shifted row; the instruction is silent).
-- Undo: 2026-09-30_mmr_bsl_mwd_ss_jl_automatic_UNDO.sql
START TRANSACTION;
SET @dn = (SELECT id FROM div_signal_book_sections WHERE section_code = 'MMR_BSL_DN_NE');
SET @up = (SELECT id FROM div_signal_book_sections WHERE section_code = 'MMR_BSL_UP_NE');
SET @why = 'Instruction 17/2026 (BSL GI 20/2026): automatic signalling MWD-SS-JL, 08.09.2026';

-- 1. Retire
CREATE TEMPORARY TABLE mb_old (line VARCHAR(40), signal_number VARCHAR(40));
INSERT INTO mb_old VALUES
  ('DN NE','MWD IBS DIST'),('DN NE','MWD IBS INN DIST'),('DN NE','MWD IBS S-21'),('DN NE','SS DIST'),('DN NE','SS INN DIST'),
  ('DN NE','SS IBS DIST'),('DN NE','SS IBS INN DIST'),('DN NE','SS IBS S-9'),('DN NE','JL DIST'),('DN NE','JL INN DIST'),
  ('UP NE','JL IBS DIST'),('UP NE','JL IBS INN DIST'),('UP NE','JL IBS S-83'),('UP NE','SS DIST'),('UP NE','SS INN DIST'),
  ('UP NE','SS IBS DIST'),('UP NE','SS IBS INN DIST'),('UP NE','SS IBS S-12'),('UP NE','MWD DIST'),('UP NE','MWD INN DIST');
UPDATE div_signals s JOIN mb_old o ON o.line = s.line AND o.signal_number = s.signal_number
  JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.is_active = 0, r.is_active = 0
 WHERE s.section = 'MMR-BSL' AND s.is_active = 1;
SELECT ROW_COUNT() AS retired_rows;                                             -- expect 40 (20 signals + 20 book rows)
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT s.id, 'Decommissioned', s.signal_number, NULL, CURDATE(), @why
    FROM div_signals s JOIN mb_old o ON o.line = s.line AND o.signal_number = s.signal_number
   WHERE s.section = 'MMR-BSL' AND s.is_active = 0;

-- 2. Semi-Automatic
CREATE TEMPORARY TABLE mb_semi (line VARCHAR(40), signal_number VARCHAR(40));
INSERT INTO mb_semi VALUES ('DN NE','MWD S-22'),('DN NE','SS S-2'),('DN NE','SS S-4'),('DN NE','SS S-8'),
                           ('UP NE','JL S-85'),('UP NE','SS S-28'),('UP NE','SS S-19'),('UP NE','SS S-15');
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT s.id, 'Type Changed', s.signal_type, 'Semi-Automatic', CURDATE(), @why
    FROM div_signals s JOIN mb_semi m ON m.line = s.line AND m.signal_number = s.signal_number
   WHERE s.section = 'MMR-BSL' AND s.is_active = 1 AND s.signal_type = 'Manual';
UPDATE div_signals s JOIN mb_semi m ON m.line = s.line AND m.signal_number = s.signal_number
   SET s.signal_type = 'Semi-Automatic'
 WHERE s.section = 'MMR-BSL' AND s.is_active = 1 AND s.signal_type = 'Manual';
SELECT ROW_COUNT() AS semi_automatic;                                           -- expect 8

-- 3. Km per the instruction
CREATE TEMPORARY TABLE mb_km (line VARCHAR(40), signal_number VARCHAR(40), old_km VARCHAR(30), new_km VARCHAR(30));
INSERT INTO mb_km VALUES ('DN NE','SS S-4','408/13','408/15'),('UP NE','JL S-82','419/02','419/04'),('UP NE','JL S-74','419/20 A','419/20A');
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT s.id, 'Location Changed', k.old_km, k.new_km, CURDATE(), @why
    FROM div_signals s JOIN mb_km k ON k.line = s.line AND k.signal_number = s.signal_number AND k.old_km = s.km_text
   WHERE s.section = 'MMR-BSL' AND s.is_active = 1;
UPDATE div_signals s JOIN mb_km k ON k.line = s.line AND k.signal_number = s.signal_number AND k.old_km = s.km_text
  JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.km_text = k.new_km, s.location_text = k.new_km, r.display_location = k.new_km
 WHERE s.section = 'MMR-BSL' AND s.is_active = 1;
SELECT ROW_COUNT() AS km_rows;                                                  -- expect 6 (3 signals + 3 book rows)

-- 5. Row order per the book (before inserting, so the new rows can use the freed positions)
UPDATE div_signal_book_rows SET row_order = 11970
 WHERE book_section_id = @dn AND row_type = 'PSR' AND km_range_text = '411/29-412/21' AND row_order = 11920;
UPDATE div_signal_book_rows SET row_order = 5070
 WHERE book_section_id = @up AND row_type = 'PSR' AND km_range_text = '403/12-381/04' AND row_order = 5040;

-- 4. New automatic signals (running order; row_order sits between the existing rows by km)
CREATE TEMPORARY TABLE mb_new (line VARCHAR(40), dir VARCHAR(4), signal_number VARCHAR(40), km VARCHAR(30), curve VARCHAR(10), sect INT, ord INT);
INSERT INTO mb_new VALUES
  ('DN NE','DN','S-40025','400/21','Right',@dn,11110), ('DN NE','DN','S-40127','401/21','Unknown',@dn,11210),
  ('DN NE','DN','S-40229','402/23','Unknown',@dn,11310), -- PSR 95 403/11-404/21 at 11350
  ('DN NE','DN','S-40403','403/29','Unknown',@dn,11410), ('DN NE','DN','S-40507','404/29','Unknown',@dn,11510),
  ('DN NE','DN','S-40609','406/05','Unknown',@dn,11520), -- SS S-2 .. SS S-8 (11600-11800)
  ('DN NE','DN','S-40925','409/23','Unknown',@dn,11810), ('DN NE','DN','S-41025','410/27','Left',@dn,11850),
  -- 500M / 250M / N/S (11930-11950)
  ('DN NE','DN','S-41127','411/27','Unknown',@dn,11960), -- PSR 120 411/29-412/21 now 11970
  ('DN NE','DN','S-41227','412/31','Unknown',@dn,12010), ('DN NE','DN','S-41327','413/23','Unknown',@dn,12110),
  ('DN NE','DN','S-41427','414/25','Unknown',@dn,12210), ('DN NE','DN','S-41527','415/27','Unknown',@dn,12310),
  ('DN NE','DN','S-41627','416/27','Unknown',@dn,12320), ('DN NE','DN','S-41727','417/27N','Unknown',@dn,12330), -- JL S-21 12400
  -- UP: JL S-85 at 4000
  ('UP NE','UP','S-41722','417/18N1','Unknown',@up,4010), ('UP NE','UP','S-41620','416/18','Unknown',@up,4110),
  ('UP NE','UP','S-41516','415/12','Unknown',@up,4210), ('UP NE','UP','S-41414','414/10','Unknown',@up,4220),
  ('UP NE','UP','S-41312','413/06','Unknown',@up,4230), -- PSR 120 412/18-411/30 at 4320
  ('UP NE','UP','S-41210','412/08','Unknown',@up,4325), -- 500 M / 250 M / N/S (4330-4350)
  ('UP NE','UP','S-41104','411/02','Unknown',@up,4410), ('UP NE','UP','S-41002','409/28','Unknown',@up,4510),
  -- SS S-28 .. SS S-15 (4600-4800)
  ('UP NE','UP','S-40610','406/10','Unknown',@up,4910), ('UP NE','UP','S-40506','405/10','Unknown',@up,5010),
  -- PSR 95 404/22-403/12 at 5050
  ('UP NE','UP','S-40404','404/14','Unknown',@up,5060), -- PSR 110 403/12-381/04 now 5070
  ('UP NE','UP','S-40304','403/08','Unknown',@up,5110), ('UP NE','UP','S-40128','402/02','Unknown',@up,5210),
  ('UP NE','UP','S-40026','400/24A','Unknown',@up,5310); -- MWD S-2 5400
INSERT INTO div_signals (signal_number, normalized_signal_number, section, line, direction, location_text, km_text,
                         signal_type, placement, on_curve, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs,
                         has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, is_active)
  SELECT signal_number, REPLACE(signal_number, '-', ''), 'MMR-BSL', line, dir, km, km,
         'Automatic', 'Left', curve, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1
    FROM mb_new ORDER BY sect, ord;
SELECT ROW_COUNT() AS new_signals;                                              -- expect 29
UPDATE div_signals s JOIN mb_new n ON n.line = s.line AND n.signal_number = s.signal_number
   SET s.magnet_id = s.id
 WHERE s.section = 'MMR-BSL' AND s.magnet_id IS NULL;
INSERT INTO div_signal_book_rows (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no,
                                  display_location, highlight_color, text_color, icon_type)
  SELECT n.sect, n.ord, 'SIGNAL', 'manual', s.id, s.signal_number, s.location_text, 'NONE', 'BLACK', 'NONE'
    FROM mb_new n JOIN div_signals s ON s.section = 'MMR-BSL' AND s.line = n.line AND s.signal_number = n.signal_number;
SELECT ROW_COUNT() AS new_book_rows;                                            -- expect 29
INSERT INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks)
  SELECT s.id, s.signal_number, s.normalized_signal_number, 'manual', 'HIGH', @why
    FROM mb_new n JOIN div_signals s ON s.section = 'MMR-BSL' AND s.line = n.line AND s.signal_number = n.signal_number;
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT s.id, 'Created', NULL, s.signal_number, CURDATE(), @why
    FROM mb_new n JOIN div_signals s ON s.section = 'MMR-BSL' AND s.line = n.line AND s.signal_number = n.signal_number;
COMMIT;

SELECT line, signal_type, COUNT(*) n FROM div_signals WHERE section = 'MMR-BSL' AND is_active = 1 GROUP BY 1, 2 ORDER BY 1, 2;
