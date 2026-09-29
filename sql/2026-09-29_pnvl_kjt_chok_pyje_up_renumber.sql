-- PNVL-KJT UP KJT page: Chauk (CHOK) and Poyanje/Mohope (PYJE) UP signals renumbered, per MRVC S&T Caution Orders
-- dated 12.08.2026 (work of 13.08.2026), Ref Dy.CSTE Project Letter MRVC/S&T/Panvel-Karjat/Corres./102C dt 11.08.2026.
-- Source PDFs: data/PNVL_KJT/"CHIWK CO.pdf", data/PNVL_KJT/"MOHOPE (POYANJE) CO.pdf".
-- The DN KJT page already carries the new DN numbers; the UP page still had the OLD UP numbers, several of which are
-- now DN numbers (CHOK/PYJE S-11..13) — hence the split magnets and wrong alias matches.
--   CHOK: S/CO-17 -> S-50 (calling-on), S-12 -> S-46, S-13 (loop-1) -> S-45, S-14 (loop-2) -> S-47, S-11 -> S-42
--   PYJE: S/CO-17 -> S-50 (calling-on), S-12 -> S-46, S-13 (loop-2) -> S-45, S-14 (loop-1) -> S-47, S-11 -> S-42 (RH)
-- Same records (ids 3037-3041, 3043-3047), same page positions. Aliases: new number -> UP signal; old numbers that are
-- now DN numbers (S-11/12/13) re-pointed to the DN signals; UP-only old numbers (S-14, S-17) stay as aliases of the
-- renumbered UP signal. Calling-on flag set for S/CO-50 (UP) and S/CO-4 (DN, CHOK S-4 / PYJE S-4).
-- The stale unpublished editor draft of this page (12 Aug, wrong for Poyanje, based on the pre-18 Aug page) is removed.
-- Km of the shifted signals (CHOK S-50, CHOK UP DIST, CHOK S-42, PYJE S-47) is NOT changed here.
-- Undo: 2026-09-29_pnvl_kjt_chok_pyje_up_renumber_UNDO.sql (the removed draft is saved in it).
START TRANSACTION;
CREATE TEMPORARY TABLE rn (id INT PRIMARY KEY, old_no VARCHAR(20), new_no VARCHAR(20), new_norm VARCHAR(20));
INSERT INTO rn VALUES
  (3037,'CHOK S-17','CHOK S-50','CHOKS50'), (3038,'CHOK S-12','CHOK S-46','CHOKS46'), (3039,'CHOK S-13','CHOK S-45','CHOKS45'),
  (3040,'CHOK S-14','CHOK S-47','CHOKS47'), (3041,'CHOK S-11','CHOK S-42','CHOKS42'),
  (3043,'PYJE S-17','PYJE S-50','PYJES50'), (3044,'PYJE S-12','PYJE S-46','PYJES46'), (3045,'PYJE S-13','PYJE S-45','PYJES45'),
  (3046,'PYJE S-14','PYJE S-47','PYJES47'), (3047,'PYJE S-11','PYJE S-42','PYJES42');

UPDATE div_signals s JOIN rn ON rn.id = s.id
   SET s.signal_number = rn.new_no, s.normalized_signal_number = rn.new_norm
 WHERE s.signal_number = rn.old_no AND s.section = 'PNVL-KJT' AND s.line = 'UP KJT';
SELECT ROW_COUNT() AS renumbered;                                                -- expect 10
UPDATE div_signal_book_rows r JOIN rn ON rn.id = r.signal_id SET r.display_signal_no = rn.new_no WHERE r.display_signal_no = rn.old_no;
SELECT ROW_COUNT() AS book_rows_renamed;                                         -- expect 10
UPDATE div_signals SET has_calling_on = 1 WHERE id IN (3037, 3043, 3017, 3023) AND has_calling_on = 0;   -- S/CO-50 UP, S/CO-4 DN

-- aliases
UPDATE div_signal_aliases a SET a.signal_id = CASE a.normalized_alias
         WHEN 'CHOKS11' THEN 3025 WHEN 'CHOKS12' THEN 3024 WHEN 'CHOKS13' THEN 3026
         WHEN 'PYJES11' THEN 3019 WHEN 'PYJES12' THEN 3018 WHEN 'PYJES13' THEN 3020 END,
       a.remarks = 'Re-pointed to the DN signal: number moved to DN side per Caution Order 12.08.2026'
 WHERE a.normalized_alias IN ('CHOKS11','CHOKS12','CHOKS13','PYJES11','PYJES12','PYJES13')
   AND a.signal_id IN (3041, 3038, 3039, 3047, 3044, 3045);
SELECT ROW_COUNT() AS aliases_repointed;                                         -- expect 6
UPDATE div_signal_aliases SET remarks = 'Old UP number (renumbered per Caution Order 12.08.2026)'
 WHERE normalized_alias IN ('CHOKS14','CHOKS17','PYJES14','PYJES17') AND signal_id IN (3040, 3037, 3046, 3043);
INSERT IGNORE INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks)
  SELECT id, new_no, new_norm, 'manual', 'HIGH', 'New number per Caution Order 12.08.2026' FROM rn;
SELECT ROW_COUNT() AS new_aliases;                                               -- expect 10

INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, changed_by_user_id, remarks)
  SELECT id, 'Renumbered', old_no, new_no, CURDATE(), NULL, 'Caution Order 12.08.2026 (MRVC Panvel-Karjat)' FROM rn;

DELETE FROM div_signal_section_drafts WHERE section_id = (SELECT id FROM div_signal_book_sections WHERE section_code = 'PNVL_KJT_UP_KJT');
SELECT ROW_COUNT() AS stale_draft_removed;                                       -- expect 1
DROP TEMPORARY TABLE rn;
COMMIT;

SELECT r.row_order, s.id, s.signal_number, s.location_text, s.has_calling_on co, s.placement FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
 WHERE r.book_section_id = (SELECT id FROM div_signal_book_sections WHERE section_code = 'PNVL_KJT_UP_KJT') AND s.station_code IN ('CHOK','PYJE') ORDER BY r.row_order;
