-- Fix neutral-section board order: groups are stored N/S, 250M, 500M but should read
-- 500M, 250M, N/S (approach boards descending, then the neutral section). Swap N/S<->500M
-- in each board group (identified by a 250M anchor exactly between them). 250M unchanged.
-- Two-phase via a temp offset so the (book_section_id,row_order) unique key never collides
-- mid-swap. Single-N/S rows (no 250M neighbour) are untouched. Local + prod.
-- Date: 2026-08-17.
CREATE TEMPORARY TABLE ns_swap AS
SELECT r.id,
  CASE r.display_description WHEN '500M' THEN m25.row_order - 10 ELSE m25.row_order + 10 END AS new_order
FROM div_signal_book_rows r
JOIN div_signal_book_rows m25
  ON m25.book_section_id = r.book_section_id AND m25.row_type='NEUTRAL_SECTION' AND m25.display_description='250M'
 AND ( (r.display_description='500M' AND m25.row_order = r.row_order - 10)
    OR (r.display_description='N/S'  AND m25.row_order = r.row_order + 10) )
WHERE r.row_type='NEUTRAL_SECTION' AND r.display_description IN ('500M','N/S') AND r.is_active=1;

UPDATE div_signal_book_rows r JOIN ns_swap s ON s.id=r.id SET r.row_order = s.new_order + 1000000;
UPDATE div_signal_book_rows r JOIN ns_swap s ON s.id=r.id SET r.row_order = s.new_order;
DROP TEMPORARY TABLE ns_swap;

-- Normalise the neutral-section marker label to a single form.
UPDATE div_signal_book_rows SET display_description='N/S'
 WHERE row_type='NEUTRAL_SECTION' AND display_description='NS' AND is_active=1;
