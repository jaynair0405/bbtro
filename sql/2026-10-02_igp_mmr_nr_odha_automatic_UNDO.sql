-- Undo 2026-10-02_igp_mmr_nr_odha_automatic.sql
START TRANSACTION;
SET @why = 'Automatic block signalling NR-KBSN-KW-ODHA (BSL Annexure-I, Safety-9 2026)';

-- new signals out (aliases, book rows, records; history removed below)
CREATE TEMPORARY TABLE no_newu (line VARCHAR(40), signal_number VARCHAR(40));
INSERT INTO no_newu VALUES
  ('DN NE','S-20401'),('DN NE','S-20813'),('DN NE','S-21013'),('DN NE','S-21423'),('DN NE','S-21625'),
  ('UP NE','S-21706'),('UP NE','S-21502'),('UP NE','S-20906'),('UP NE','S-20804'),('UP NE','S-20414');
DELETE h FROM div_signal_history h JOIN div_signals s ON s.id = h.signal_id WHERE s.section = 'IGP-MMR' AND h.remarks = @why;
DELETE a FROM div_signal_aliases a JOIN div_signals s ON s.id = a.signal_id
  JOIN no_newu n ON n.line = s.line AND n.signal_number = s.signal_number WHERE s.section = 'IGP-MMR';
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
  JOIN no_newu n ON n.line = s.line AND n.signal_number = s.signal_number WHERE s.section = 'IGP-MMR';
DELETE s FROM div_signals s JOIN no_newu n ON n.line = s.line AND n.signal_number = s.signal_number WHERE s.section = 'IGP-MMR';

-- km back (signal ids are stable)
CREATE TEMPORARY TABLE no_kmu (id INT PRIMARY KEY, old_km VARCHAR(30), new_km VARCHAR(30));
INSERT INTO no_kmu VALUES
  (2411,'198/3','198/03'),(2415,'201/11','201/13'),(2417,'203/01','203/03'),(2419,'205/05','204/29'),(2420,'206/11','206/11A'),
  (2421,'206/31','207/05'),(2426,'211/27','211/11'),(2428,'213/15','213/27'),(2431,'215/29','215/27'),(2521,'219/32','219/32A'),(2528,'213/18','213/34'),(2530,'211/28','211/14'),
  (2532,'210/8','210/08'),(2535,'207/02','207/08'),(2536,'205/24','205/10'),(2537,'205/8','205/02'),(2543,'199/24','199/20');
UPDATE div_signals s JOIN no_kmu k ON k.id = s.id AND s.km_text = k.new_km JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.km_text = k.old_km, s.location_text = k.old_km, r.display_location = k.old_km;

-- types back
UPDATE div_signals SET signal_type = 'Gate'
 WHERE id IN (2415,2417,2424,2431,2525,2532,2539,2541) AND signal_type = 'Semi-Automatic';
UPDATE div_signals SET signal_type = 'Manual'
 WHERE id IN (2419,2420,2421,2426,2427,2428,2528,2529,2530,2535,2536,2537) AND signal_type = 'Semi-Automatic';

-- numbers back
CREATE TEMPORARY TABLE no_rnu (id INT PRIMARY KEY, old_no VARCHAR(20), old_norm VARCHAR(20), new_no VARCHAR(20));
INSERT INTO no_rnu VALUES
  (2528,'KBSN S-20','KBSNS20','KBSN S-42'), (2529,'KBSN S-19','KBSNS19','KBSN S-38'), (2530,'KBSN S-15','KBSNS15','KBSN S-35'),
  (2535,'KW S-20','KWS20','KW S-30'),       (2536,'KW S-19','KWS19','KW S-27'),       (2537,'KW S-15','KWS15','KW S-24'),
  (2427,'KBSN S-3','KBSNS3','KBSN S-5'),    (2428,'KBSN S-8','KBSNS8','KBSN S-11');
UPDATE div_signals s JOIN no_rnu n ON n.id = s.id AND s.signal_number = n.new_no
   SET s.signal_number = n.old_no, s.normalized_signal_number = n.old_norm;
UPDATE div_signal_book_rows r JOIN no_rnu n ON n.id = r.signal_id AND r.display_signal_no = n.new_no SET r.display_signal_no = n.old_no;
DELETE a FROM div_signal_aliases a JOIN no_rnu n ON n.id = a.signal_id AND a.alias_text = n.new_no WHERE a.remarks = @why;
UPDATE div_signal_aliases a JOIN no_rnu n ON n.id = a.signal_id AND a.alias_text = n.old_no
   SET a.remarks = 'Auto alias from section import' WHERE a.remarks = 'Old number (renumbered: automatic block NR-KBSN-KW-ODHA)';

-- retired signals back
UPDATE div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id
   SET s.is_active = 1, r.is_active = 1
 WHERE s.id IN (2414,2416,2418,2422,2423,2425,2429,2430,2432,2524,2526,2527,2531,2533,2534,2538,2540,2542) AND s.is_active = 0;
COMMIT;
