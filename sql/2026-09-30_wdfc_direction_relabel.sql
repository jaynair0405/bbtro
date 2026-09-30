-- WDFC direction (user, 2026-09-30): JNPN -> UDNN -> MPRN is DN, MPRN/UDNN -> JNPN is UP.
-- The WDFC import (2026-09-30_wdfc_jnpn_mprn_signals.sql) had them the other way round. Swap every label:
--   page WDFC_JNPN_MPRN_UP "JNPN-MPRN WDFC UP LINE" -> WDFC_JNPN_MPRN_DN "JNPN-MPRN WDFC DN LINE" (line WDFC DN, DN)
--   page WDFC_MPRN_JNPN_DN "MPRN-JNPN WDFC DN LINE" -> WDFC_MPRN_JNPN_UP "MPRN-JNPN WDFC UP LINE" (line WDFC UP, UP)
--   the 407 signals' line + direction, and the two PSRs (75 at 19/44, 80 at 24/08) -> WDFC DN.
-- Numbering now follows the usual rule: DN signals even (S-2, S-98, A-6134), UP odd (S-1, S-99, A-5439).
-- No routes (successors) and no name clashes between the two lines. Undo: 2026-09-30_wdfc_direction_relabel_UNDO.sql
START TRANSACTION;
UPDATE div_signal_book_sections SET section_code = 'WDFC_TMP_A' WHERE section_code = 'WDFC_JNPN_MPRN_UP';
UPDATE div_signal_book_sections SET section_code = 'WDFC_MPRN_JNPN_UP', section_title = 'MPRN-JNPN WDFC UP LINE', line = 'WDFC UP', direction = 'UP'
 WHERE section_code = 'WDFC_MPRN_JNPN_DN';
UPDATE div_signal_book_sections SET section_code = 'WDFC_JNPN_MPRN_DN', section_title = 'JNPN-MPRN WDFC DN LINE', line = 'WDFC DN', direction = 'DN'
 WHERE section_code = 'WDFC_TMP_A';
SELECT ROW_COUNT() AS pages;                                                    -- expect 1 (and 1 above)
UPDATE div_signals SET line = 'WDFC TMP' WHERE section = 'JNPN-MPRN' AND line = 'WDFC UP';
UPDATE div_signals SET line = 'WDFC UP', direction = 'UP' WHERE section = 'JNPN-MPRN' AND line = 'WDFC DN';
SELECT ROW_COUNT() AS now_up;                                                   -- expect 171
UPDATE div_signals SET line = 'WDFC DN', direction = 'DN' WHERE section = 'JNPN-MPRN' AND line = 'WDFC TMP';
SELECT ROW_COUNT() AS now_dn;                                                   -- expect 236
UPDATE div_psr SET line = 'WDFC DN', direction = 'DN' WHERE section = 'JNPN-MPRN' AND line = 'WDFC UP';
SELECT ROW_COUNT() AS psrs;                                                     -- expect 2
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  SELECT id, 'Other', IF(direction = 'DN', 'WDFC UP', 'WDFC DN'), line, CURDATE(), 'WDFC direction relabelled: JNPN->UDNN->MPRN is DN (user 30 Sep)'
    FROM div_signals WHERE section = 'JNPN-MPRN';
COMMIT;
SELECT b.section_code, b.section_title, b.line, b.direction, COUNT(r.id) rows_ FROM div_signal_book_sections b
  LEFT JOIN div_signal_book_rows r ON r.book_section_id = b.id WHERE b.section_code LIKE 'WDFC%' GROUP BY b.id;
