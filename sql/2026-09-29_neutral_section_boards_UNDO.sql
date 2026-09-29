-- Undo 2026-09-29_neutral_section_boards.sql (restores the exact old text per row).
START TRANSACTION;
UPDATE div_signal_book_rows b JOIN div_signal_book_sections s ON s.id=b.book_section_id
SET b.row_type='BOARD',
    b.display_signal_no = CONCAT(LEFT(b.display_description,3),' M', IF(s.section_code LIKE 'CSMT_KYN_%',' BOARD','')),
    b.display_description = CONCAT(LEFT(b.display_description,3),' M', IF(s.section_code LIKE 'CSMT_KYN_%',' BOARD',''))
WHERE b.is_active=1 AND b.row_type='NEUTRAL_SECTION' AND b.display_description IN ('500M','250M')
  AND ((s.section_code='CLA_KYN_5TH' AND b.row_order IN (2100,2200,5000,5100))
    OR (s.section_code='CSMT_KYN_DN_LOC' AND b.row_order IN (6230,6240,10030,10040))
    OR (s.section_code='CSMT_KYN_UP_LOC' AND b.row_order IN (3120,3130,7030,7040))
    OR (s.section_code='CSMT_PNVL_DN_HB' AND b.row_order IN (5300,5600,10200,10400,11300,11600)));
SELECT ROW_COUNT() AS restored;  -- expect 18
COMMIT;
