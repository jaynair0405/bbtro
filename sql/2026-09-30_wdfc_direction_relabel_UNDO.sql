-- Undo 2026-09-30_wdfc_direction_relabel.sql
START TRANSACTION;
DELETE h FROM div_signal_history h JOIN div_signals s ON s.id = h.signal_id
 WHERE s.section = 'JNPN-MPRN' AND h.change_type = 'Other' AND h.remarks = 'WDFC direction relabelled: JNPN->UDNN->MPRN is DN (user 30 Sep)';
UPDATE div_signal_book_sections SET section_code = 'WDFC_TMP_A' WHERE section_code = 'WDFC_JNPN_MPRN_DN';
UPDATE div_signal_book_sections SET section_code = 'WDFC_MPRN_JNPN_DN', section_title = 'MPRN-JNPN WDFC DN LINE', line = 'WDFC DN', direction = 'DN'
 WHERE section_code = 'WDFC_MPRN_JNPN_UP';
UPDATE div_signal_book_sections SET section_code = 'WDFC_JNPN_MPRN_UP', section_title = 'JNPN-MPRN WDFC UP LINE', line = 'WDFC UP', direction = 'UP'
 WHERE section_code = 'WDFC_TMP_A';
UPDATE div_signals SET line = 'WDFC TMP' WHERE section = 'JNPN-MPRN' AND line = 'WDFC DN';
UPDATE div_signals SET line = 'WDFC DN', direction = 'DN' WHERE section = 'JNPN-MPRN' AND line = 'WDFC UP';
UPDATE div_signals SET line = 'WDFC UP', direction = 'UP' WHERE section = 'JNPN-MPRN' AND line = 'WDFC TMP';
UPDATE div_psr SET line = 'WDFC UP', direction = 'UP' WHERE section = 'JNPN-MPRN' AND line = 'WDFC DN';
COMMIT;
