-- Neutral sections whose 500 M / 250 M approach rows were stored as plain BOARD rows
-- (grey italic) instead of NEUTRAL_SECTION rows (blue, bold marker), 9 groups, 18 rows:
--   CLA_KYN_5TH (2), CSMT_KYN_DN_LOC (2), CSMT_KYN_UP_LOC (2), CSMT_PNVL_DN_HB (3).
-- Location/km kept. Picked by page + text, not by id.
START TRANSACTION;
UPDATE div_signal_book_rows b
JOIN div_signal_book_sections s ON s.id = b.book_section_id
SET b.row_type = 'NEUTRAL_SECTION',
    b.display_signal_no = IF(b.display_description LIKE '500%', '500M', '250M'),
    b.display_description = IF(b.display_description LIKE '500%', '500M', '250M')
WHERE b.is_active = 1 AND b.row_type = 'BOARD'
  AND b.display_description REGEXP '^(500|250) ?M( BOARD)?$'
  AND s.section_code IN ('CLA_KYN_5TH','CSMT_KYN_DN_LOC','CSMT_KYN_UP_LOC','CSMT_PNVL_DN_HB');
SELECT ROW_COUNT() AS converted;  -- expect 18
COMMIT;
