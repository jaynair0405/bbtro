-- Undo 2026-09-30_wdfc_jnpn_mprn_signals.sql
START TRANSACTION;
SET @why = 'WDFC import: sheet W-DFCC + DFCCIL JNPT-Makarpura chart (user, 30 Sep 2026)';
DELETE h FROM div_signal_history h JOIN div_signals s ON s.id = h.signal_id WHERE s.section = 'JNPN-MPRN';
DELETE a FROM div_signal_aliases a JOIN div_signals s ON s.id = a.signal_id WHERE s.section = 'JNPN-MPRN';
DELETE r FROM div_signal_book_rows r JOIN div_signal_book_sections b ON b.id = r.book_section_id WHERE b.section_code IN ('WDFC_JNPN_MPRN_UP', 'WDFC_MPRN_JNPN_DN');
DELETE FROM div_signals WHERE section = 'JNPN-MPRN';
DELETE FROM div_psr WHERE section = 'JNPN-MPRN' AND remarks = @why;
DELETE bs FROM div_signal_beat_sections bs JOIN div_signal_beats b ON b.id = bs.beat_id WHERE b.beat_code = 'WDFC';
DELETE FROM div_signal_book_sections WHERE section_code IN ('WDFC_JNPN_MPRN_UP', 'WDFC_MPRN_JNPN_DN');
DELETE FROM div_signal_beats WHERE beat_code = 'WDFC';
COMMIT;
