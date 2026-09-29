-- MMR-BSL: two signal numbers were used twice at one station (user, 2026-09-29).
--   PHQ S-2 UP NE (id 3509, 379/14) is really PHQ S-4. (PHQ S-2 stays the DN NE signal, id 3383, 379/23.)
--   PNV S-12: two different cabins — DN NE (id 3297, 268/01) is C cabin, UP NE (id 3598, 264/08) is A cabin.
--     Named like the existing "PNV C Cabin S-2": "PNV C Cabin S-12" and "PNV A Cabin S-12".
-- Aliases: PHQS2 re-pointed to the DN signal that keeps that number; new names aliased; PNVS12 stays on the A cabin
-- signal it already pointed to (MMR-BSL is outside the AWS matching sections).
-- Undo: 3509 -> 'PHQ S-2'/'PHQS2'; 3297, 3598 -> 'PNV S-12'/'PNVS12'; alias PHQS2 -> 3509; delete the new aliases.
START TRANSACTION;
UPDATE div_signals SET signal_number = 'PHQ S-4', normalized_signal_number = 'PHQS4'
 WHERE id = 3509 AND signal_number = 'PHQ S-2' AND section = 'MMR-BSL' AND line = 'UP NE';
UPDATE div_signals SET signal_number = 'PNV C Cabin S-12', normalized_signal_number = 'PNVCCABINS12'
 WHERE id = 3297 AND signal_number = 'PNV S-12' AND line = 'DN NE';
UPDATE div_signals SET signal_number = 'PNV A Cabin S-12', normalized_signal_number = 'PNVACABINS12'
 WHERE id = 3598 AND signal_number = 'PNV S-12' AND line = 'UP NE';
SELECT ROW_COUNT() AS last_rename;                                                -- expect 1
UPDATE div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id SET r.display_signal_no = s.signal_number WHERE s.id IN (3509, 3297, 3598);
SELECT ROW_COUNT() AS book_rows_renamed;                                          -- expect 3
UPDATE div_signal_aliases SET signal_id = 3383, remarks = 'PHQ S-2 is the DN signal; the UP one is PHQ S-4 (user 29 Sep)'
 WHERE normalized_alias = 'PHQS2' AND signal_id = 3509;
INSERT IGNORE INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks) VALUES
  (3509, 'PHQ S-4',          'PHQS4',        'manual', 'HIGH', 'Corrected number (user 29 Sep)'),
  (3297, 'PNV C Cabin S-12', 'PNVCCABINS12', 'manual', 'HIGH', 'C cabin (user 29 Sep)'),
  (3598, 'PNV A Cabin S-12', 'PNVACABINS12', 'manual', 'HIGH', 'A cabin (user 29 Sep)');
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks) VALUES
  (3509, 'Renumbered', 'PHQ S-2',  'PHQ S-4',          CURDATE(), 'Duplicate number at PHQ corrected (user)'),
  (3297, 'Renumbered', 'PNV S-12', 'PNV C Cabin S-12', CURDATE(), 'Two cabins at PNV (user)'),
  (3598, 'Renumbered', 'PNV S-12', 'PNV A Cabin S-12', CURDATE(), 'Two cabins at PNV (user)');
COMMIT;
SELECT s.id, s.signal_number, s.line, s.km_text, r.display_signal_no FROM div_signals s JOIN div_signal_book_rows r ON r.signal_id = s.id WHERE s.id IN (3383, 3509, 3297, 3598);
