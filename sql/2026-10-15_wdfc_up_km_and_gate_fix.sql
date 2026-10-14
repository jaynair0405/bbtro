-- WDFC UP line (section JNPN-MPRN, line 'WDFC UP', page WDFC_MPRN_JNPN_UP):
-- corrections from the DFCCIL chart data/WDFCC/"UDNN to JNPN UP Line Signal.pdf".
--
-- 1. Four signals had km ESTIMATED at 1 km spacing by the 30 Sep 2026 import
--    (the sheet had none; technical_remarks "km estimated ... to confirm").
--    The chart gives the real km. Updated in km_text, location_text and the
--    book row's display_location (all three held the estimate).
-- 2. Ten signals the chart classes GATE / AG were imported as Automatic. Set to
--    signal_type 'Gate'. A-5619 has no "(G)" in its number but is a gate signal
--    (confirmed by the user 2026-10-15); its number is left as it is.
--
-- Matched by signal_number + section + line, so it is safe on local and prod.
-- Idempotent. None of these signals has magnet copies.
--
-- Rollback: div_signals_wdfc_up_bak_20261015 holds the previous values.

CREATE TABLE IF NOT EXISTS div_signals_wdfc_up_bak_20261015 AS
SELECT id, signal_number, km_text, location_text, signal_type, technical_remarks
  FROM div_signals
 WHERE section = 'JNPN-MPRN' AND line = 'WDFC UP'
   AND signal_number IN ('SAHN S-41', 'SAHN S-97', 'SAHN S-99', 'KHBN S-41',
                         'A-5411 (G)', 'A-5531 (G)', 'A-5521 (G)', 'A-5505 (G)', 'A-5619',
                         'A-5613 (G)', 'A-5605 (G)', 'A-5827 (G)', 'A-5907 (G)', 'A-6013 (G)');

-- 1. Real km for the four estimated signals.
UPDATE div_signals s
  JOIN (SELECT 'SAHN S-41' AS n, '106/10' AS km UNION ALL
        SELECT 'SAHN S-97',      '105/20'       UNION ALL
        SELECT 'SAHN S-99',      '104/30'       UNION ALL
        SELECT 'KHBN S-41',      '71/50') k ON k.n = s.signal_number
  LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id AND r.is_active = 1
   SET s.km_text = k.km, s.location_text = k.km, r.display_location = k.km,
       s.technical_remarks = NULL
 WHERE s.section = 'JNPN-MPRN' AND s.line = 'WDFC UP';

-- 2. Gate signals.
UPDATE div_signals SET signal_type = 'Gate'
 WHERE section = 'JNPN-MPRN' AND line = 'WDFC UP'
   AND signal_number IN ('A-5411 (G)', 'A-5531 (G)', 'A-5521 (G)', 'A-5505 (G)', 'A-5619',
                         'A-5613 (G)', 'A-5605 (G)', 'A-5827 (G)', 'A-5907 (G)', 'A-6013 (G)');

-- Check: expect the 4 km values above and 10 Gate rows.
SELECT s.signal_number, s.km_text, s.location_text, r.display_location, s.signal_type, s.technical_remarks
  FROM div_signals s
  LEFT JOIN div_signal_book_rows r ON r.signal_id = s.id AND r.is_active = 1
 WHERE s.section = 'JNPN-MPRN' AND s.line = 'WDFC UP'
   AND (s.signal_number IN ('SAHN S-41', 'SAHN S-97', 'SAHN S-99', 'KHBN S-41') OR s.signal_type = 'Gate')
 ORDER BY s.signal_number;
