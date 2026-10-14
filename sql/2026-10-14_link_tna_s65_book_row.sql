-- Link the CSMT_KYN_UP_TH book row for TNA S-65 to its signal.
--
-- The row had signal_id = NULL although the signal exists (TNA S-65, UP TH,
-- PF-6 KE, Right/RHS). So the editor showed a blank signal number and the
-- printed book carried no RHS tag for it; from 2026-10-14 publish also refuses
-- a SIGNAL row without a side, which would have blocked the whole section.
-- It was the only unlinked SIGNAL row in the book.
--
-- Matched by section + label + unlinked, not ids, so it is safe on local and
-- prod. Idempotent.
--
-- Rollback:
--   UPDATE div_signal_book_rows r JOIN div_signal_book_sections sec ON sec.id = r.book_section_id
--      SET r.signal_id = NULL
--    WHERE sec.section_code = 'CSMT_KYN_UP_TH' AND r.display_signal_no = 'TNA S-65';

UPDATE div_signal_book_rows r
  JOIN div_signal_book_sections sec ON sec.id = r.book_section_id
  JOIN div_signals s ON s.signal_number = 'TNA S-65' AND s.section = 'CSMT-KYN'
                    AND s.line = 'UP TH' AND s.is_active = 1
   SET r.signal_id = s.id
 WHERE sec.section_code = 'CSMT_KYN_UP_TH'
   AND r.row_type = 'SIGNAL'
   AND r.display_signal_no = 'TNA S-65'
   AND r.signal_id IS NULL
   AND r.is_active = 1;

-- Expect no rows: active SIGNAL rows with no signal behind them.
SELECT r.id, sec.section_code, r.display_signal_no, r.display_location
  FROM div_signal_book_rows r
  JOIN div_signal_book_sections sec ON sec.id = r.book_section_id
 WHERE r.is_active = 1 AND r.row_type = 'SIGNAL' AND r.signal_id IS NULL;
