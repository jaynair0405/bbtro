-- IGP-MMR: automatic block signalling commissioned NR - KBSN - KW - ODHA, both directions (km 198-219).
-- Source: BSL Division Annexure-I (Safety-9 2026, pg40), data/NK_ODHA/NR-KBSN-KW-ODHA.pdf + user sheet NR-KBSN-KW-ODHA.xlsx.
--   1. Retire 18 distants / inner distants inside the stretch: signal + book row is_active = 0, aliases kept,
--      history 'Decommissioned'. ODHA DIST / INN DIST (DN) and NR DIST / INN DIST (UP) stay: they lead to manual homes.
--   2. Renumber: UP KBSN S-20/19/15 -> S-42/38/35, UP KW S-20/19/15 -> S-30/27/24, DN KBSN S-3/8 -> S-5/11
--      (same records; old numbers stay as aliases of the same signal; new number added as alias).
--   3. KBSN + KW station signals (12) Manual -> Semi-Automatic; gate signals LC-93A/94/96/98 (8) Gate -> Semi-Automatic.
--      signal_function stays NULL on the gates (the enum has no 'Gate'). NR and ODHA signals unchanged (Manual).
--   4. Km per the Annexure, 17 signals (user confirmed KBSN S-42 213/34, KBSN S-35 211/14, KW S-27 205/10 where the sheet differed).
--   5. 10 new automatic signals in running order (5 DN, 5 UP).
-- The UP neutral section ("PTFE N/S new location 207/20") already sits at row 4030-4050, which after this change is
-- between S-20804 (208/08) and KW S-30 (207/08) — its place in the book is right without moving it.
-- Calling-on flags kept as the book has them. No instruction number recorded (user, 02.10.2026).
-- Undo: 2026-10-02_igp_mmr_nr_odha_automatic_UNDO.sql
START TRANSACTION;
SET @dn = (SELECT id FROM div_signal_book_sections WHERE section_code = 'IGP_MMR_DN_NE');
SET @up = (SELECT id FROM div_signal_book_sections WHERE section_code = 'IGP_MMR_UP_NE');
SET @why = 'Automatic block signalling NR-KBSN-KW-ODHA (BSL Annexure-I, Safety-9 2026)';

-- 1. Retire
CREATE TEMPORARY TABLE no_old (line VARCHAR(40), signal_number VARCHAR(40));
INSERT INTO no_old VALUES
  ('DN NE','GATE-93A INN DIST'),('DN NE','GATE-94 INN DIST'),('DN NE','KW INN DIST'),('DN NE','GATE-96 DIST'),
  ('DN NE','GATE-96 INN DIST'),('DN NE','KBSN INN DIST'),('DN NE','GATE-98 DIST'),('DN NE','GATE INN DIST'),('DN NE','NR INN DIST'),
  ('UP NE','GATE-98 INN DIST'),('UP NE','KBSN DIST'),('UP NE','KBSN INN DIST'),('UP NE','GATE-96 INN DIST'),('UP NE','KW DIST'),
  ('UP NE','KW INN DIST'),('UP NE','GATE-94 INN DIST'),('UP NE','GATE-93A INN DIST'),('UP NE','ODHA INN DIST');
UPDATE div_signals s JOIN no_old o ON o.line = s.line AND o.signal_number = s.signal_number
  JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.is_active = 0, r.is_active = 0
 WHERE s.section = 'IGP-MMR' AND s.is_active = 1;
SELECT ROW_COUNT() AS retired_rows;                                             -- expect 36 (18 signals + 18 book rows)
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT s.id, 'Decommissioned', s.signal_number, NULL, CURDATE(), @why
    FROM div_signals s JOIN no_old o ON o.line = s.line AND o.signal_number = s.signal_number
   WHERE s.section = 'IGP-MMR' AND s.is_active = 0;

-- 2. Renumber
CREATE TEMPORARY TABLE no_rn (id INT PRIMARY KEY, old_no VARCHAR(20), new_no VARCHAR(20), new_norm VARCHAR(20));
INSERT INTO no_rn VALUES
  (2528,'KBSN S-20','KBSN S-42','KBSNS42'), (2529,'KBSN S-19','KBSN S-38','KBSNS38'), (2530,'KBSN S-15','KBSN S-35','KBSNS35'),
  (2535,'KW S-20','KW S-30','KWS30'),       (2536,'KW S-19','KW S-27','KWS27'),       (2537,'KW S-15','KW S-24','KWS24'),
  (2427,'KBSN S-3','KBSN S-5','KBSNS5'),    (2428,'KBSN S-8','KBSN S-11','KBSNS11');
UPDATE div_signals s JOIN no_rn n ON n.id = s.id
   SET s.signal_number = n.new_no, s.normalized_signal_number = n.new_norm
 WHERE s.signal_number = n.old_no AND s.section = 'IGP-MMR';
SELECT ROW_COUNT() AS renumbered;                                               -- expect 8
UPDATE div_signal_book_rows r JOIN no_rn n ON n.id = r.signal_id SET r.display_signal_no = n.new_no WHERE r.display_signal_no = n.old_no;
SELECT ROW_COUNT() AS book_rows_renamed;                                        -- expect 8
UPDATE div_signal_aliases a JOIN no_rn n ON n.id = a.signal_id
   SET a.remarks = 'Old number (renumbered: automatic block NR-KBSN-KW-ODHA)'
 WHERE a.alias_text = n.old_no;
INSERT IGNORE INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks)
  SELECT id, new_no, new_norm, 'manual', 'HIGH', @why FROM no_rn;
SELECT ROW_COUNT() AS new_aliases;                                              -- expect 8
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT id, 'Renumbered', old_no, new_no, CURDATE(), @why FROM no_rn;

-- 3. Semi-Automatic (station signals Manual, gates Gate)
CREATE TEMPORARY TABLE no_semi (line VARCHAR(40), signal_number VARCHAR(40));
INSERT INTO no_semi VALUES
  ('DN NE','KW S-2'),('DN NE','KW S-3'),('DN NE','KW S-8'),('DN NE','KBSN S-2'),('DN NE','KBSN S-5'),('DN NE','KBSN S-11'),
  ('DN NE','GATE-93A'),('DN NE','GATE-94'),('DN NE','GATE-96'),('DN NE','GATE-98'),
  ('UP NE','KBSN S-42'),('UP NE','KBSN S-38'),('UP NE','KBSN S-35'),('UP NE','KW S-30'),('UP NE','KW S-27'),('UP NE','KW S-24'),
  ('UP NE','GATE-98'),('UP NE','GATE-96'),('UP NE','GATE-94'),('UP NE','GATE-93A');
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT s.id, 'Type Changed', s.signal_type, 'Semi-Automatic', CURDATE(), @why
    FROM div_signals s JOIN no_semi m ON m.line = s.line AND m.signal_number = s.signal_number
   WHERE s.section = 'IGP-MMR' AND s.is_active = 1 AND s.signal_type IN ('Manual','Gate');
UPDATE div_signals s JOIN no_semi m ON m.line = s.line AND m.signal_number = s.signal_number
   SET s.signal_type = 'Semi-Automatic'
 WHERE s.section = 'IGP-MMR' AND s.is_active = 1 AND s.signal_type IN ('Manual','Gate');
SELECT ROW_COUNT() AS semi_automatic;                                           -- expect 20

-- 4. Km per the Annexure
CREATE TEMPORARY TABLE no_km (line VARCHAR(40), signal_number VARCHAR(40), old_km VARCHAR(30), new_km VARCHAR(30));
INSERT INTO no_km VALUES
  ('DN NE','ODHA S-2','198/3','198/03'),   ('DN NE','GATE-93A','201/11','201/13'), ('DN NE','GATE-94','203/01','203/03'),
  ('DN NE','KW S-2','205/05','204/29'),    ('DN NE','KW S-3','206/11','206/11A'),  ('DN NE','KW S-8','206/31','207/05'),
  ('DN NE','KBSN S-2','211/27','211/11'),  ('DN NE','KBSN S-11','213/15','213/27'), ('DN NE','GATE-98','215/29','215/27'),
  ('UP NE','NR S-20','219/32','219/32A'),  ('UP NE','KBSN S-42','213/18','213/34'), ('UP NE','KBSN S-35','211/28','211/14'),
  ('UP NE','GATE-96','210/8','210/08'),    ('UP NE','KW S-30','207/02','207/08'),   ('UP NE','KW S-27','205/24','205/10'),
  ('UP NE','KW S-24','205/8','205/02'),    ('UP NE','ODHA S-20','199/24','199/20');
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT s.id, 'Location Changed', k.old_km, k.new_km, CURDATE(), @why
    FROM div_signals s JOIN no_km k ON k.line = s.line AND k.signal_number = s.signal_number AND k.old_km = s.km_text
   WHERE s.section = 'IGP-MMR' AND s.is_active = 1;
UPDATE div_signals s JOIN no_km k ON k.line = s.line AND k.signal_number = s.signal_number AND k.old_km = s.km_text
  JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.km_text = k.new_km, s.location_text = k.new_km, r.display_location = k.new_km
 WHERE s.section = 'IGP-MMR' AND s.is_active = 1;
SELECT ROW_COUNT() AS km_rows;                                                  -- expect 34 (17 signals + 17 book rows)

-- 5. New automatic signals (running order; row_order between the existing rows by km)
CREATE TEMPORARY TABLE no_new (line VARCHAR(40), dir VARCHAR(4), signal_number VARCHAR(40), km VARCHAR(30), sect INT, ord INT);
INSERT INTO no_new VALUES
  ('DN NE','DN','S-20401','204/01',@dn,6510),  -- GATE-94 6400 .. KW S-2 6600
  ('DN NE','DN','S-20813','208/13',@dn,7010),  -- N/S 6930-6950 .. GATE-96 7100
  ('DN NE','DN','S-21013','210/11',@dn,7210),  -- GATE-96 7100 .. KBSN S-2 7300
  ('DN NE','DN','S-21423','214/27',@dn,7610),  -- KBSN S-11 7500 .. PSR 215/01 7750
  ('DN NE','DN','S-21625','216/23',@dn,7910),  -- GATE-98 7800 .. NR S-2 8000
  ('UP NE','UP','S-21706','217/18',@up,3010),  -- NR S-15 2900 .. GATE-98 3100
  ('UP NE','UP','S-21502','214/28',@up,3210),  -- GATE-98 3100 .. KBSN S-42 3400
  ('UP NE','UP','S-20906','209/08',@up,3910),  -- GATE-96 3800 .. S-20804
  ('UP NE','UP','S-20804','208/08',@up,4010),  -- .. N/S 4030-4050 .. KW S-30 4100
  ('UP NE','UP','S-20414','204/14',@up,4410);  -- KW S-24 4300 .. GATE-94 4500
INSERT INTO div_signals (signal_number, normalized_signal_number, section, line, direction, location_text, km_text,
                         signal_type, placement, on_curve, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs,
                         has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms, is_active)
  SELECT signal_number, REPLACE(signal_number, '-', ''), 'IGP-MMR', line, dir, km, km,
         'Automatic', 'Left', 'Unknown', 0, 0, 1, 0, 0, 0, 0, 0, 0, 1
    FROM no_new ORDER BY sect, ord;
SELECT ROW_COUNT() AS new_signals;                                              -- expect 10
UPDATE div_signals s JOIN no_new n ON n.line = s.line AND n.signal_number = s.signal_number
   SET s.magnet_id = s.id
 WHERE s.section = 'IGP-MMR' AND s.magnet_id IS NULL;
INSERT INTO div_signal_book_rows (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no,
                                  display_location, highlight_color, text_color, icon_type)
  SELECT n.sect, n.ord, 'SIGNAL', 'manual', s.id, s.signal_number, s.location_text, 'NONE', 'BLACK', 'NONE'
    FROM no_new n JOIN div_signals s ON s.section = 'IGP-MMR' AND s.line = n.line AND s.signal_number = n.signal_number;
SELECT ROW_COUNT() AS new_book_rows;                                            -- expect 10
INSERT INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks)
  SELECT s.id, s.signal_number, s.normalized_signal_number, 'manual', 'HIGH', @why
    FROM no_new n JOIN div_signals s ON s.section = 'IGP-MMR' AND s.line = n.line AND s.signal_number = n.signal_number;
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT s.id, 'Created', NULL, s.signal_number, CURDATE(), @why
    FROM no_new n JOIN div_signals s ON s.section = 'IGP-MMR' AND s.line = n.line AND s.signal_number = n.signal_number;
COMMIT;

SELECT line, signal_type, COUNT(*) n FROM div_signals WHERE section = 'IGP-MMR' AND is_active = 1 GROUP BY 1, 2 ORDER BY 1, 2;
