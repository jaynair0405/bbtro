-- Spacing-independent NS reorder. Supersedes 2026-08-17_fix_ns_row_order (which assumed
-- exact +10/+20 gaps and skipped groups with other spacing, e.g. prod PNVL_KJT_DN_KJT @100).
-- For each 250M (always the middle row of its group by row_order), the group's other two NS
-- rows are its immediate NS neighbours: put 500M at the lower slot, N/S at the higher.
-- Idempotent: already-correct groups map to themselves. Two-phase temp offset avoids the
-- (book_section_id,row_order) unique key colliding mid-swap. Single-N/S rows untouched.

SELECT '--- wrong groups BEFORE (N/S sits before its 250M) ---' AS x;
SELECT s.section_code, m.row_order AS ns250_order
FROM div_signal_book_rows m JOIN div_signal_book_sections s ON s.id=m.book_section_id
JOIN div_signal_book_rows p ON p.book_section_id=m.book_section_id AND p.row_type='NEUTRAL_SECTION' AND p.is_active=1
  AND p.display_description='N/S'
  AND p.row_order=(SELECT MAX(x.row_order) FROM div_signal_book_rows x WHERE x.book_section_id=m.book_section_id AND x.row_type='NEUTRAL_SECTION' AND x.is_active=1 AND x.row_order<m.row_order)
WHERE m.row_type='NEUTRAL_SECTION' AND m.display_description='250M' AND m.is_active=1
ORDER BY s.section_code;

CREATE TEMPORARY TABLE ns_fix AS
SELECT r.id, CASE r.display_description WHEN '500M' THEN a.prev_ord ELSE a.next_ord END AS target
FROM (
  SELECT m.book_section_id sec, m.row_order mid,
    (SELECT MAX(row_order) FROM div_signal_book_rows p WHERE p.book_section_id=m.book_section_id AND p.row_type='NEUTRAL_SECTION' AND p.is_active=1 AND p.row_order<m.row_order) prev_ord,
    (SELECT MIN(row_order) FROM div_signal_book_rows n WHERE n.book_section_id=m.book_section_id AND n.row_type='NEUTRAL_SECTION' AND n.is_active=1 AND n.row_order>m.row_order) next_ord
  FROM div_signal_book_rows m WHERE m.row_type='NEUTRAL_SECTION' AND m.display_description='250M' AND m.is_active=1
) a
JOIN div_signal_book_rows r ON r.book_section_id=a.sec AND r.row_type='NEUTRAL_SECTION' AND r.is_active=1
  AND r.display_description IN ('500M','N/S') AND r.row_order IN (a.prev_ord, a.next_ord);

UPDATE div_signal_book_rows r JOIN ns_fix f ON f.id=r.id SET r.row_order = f.target + 1000000;
UPDATE div_signal_book_rows r JOIN ns_fix f ON f.id=r.id SET r.row_order = f.target;
DROP TEMPORARY TABLE ns_fix;
