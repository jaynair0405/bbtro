-- Uniform NS styling: some sections stored the 500M/250M approach boards as row_type=BOARD
-- (render as plain board rows, not the blue neutral-section band) while N/S is NEUTRAL_SECTION.
-- Convert those boards to NEUTRAL_SECTION so all three render as the blue band. Order already
-- correct (500M/250M/N/S). Local + prod. Date 2026-08-18.
UPDATE div_signal_book_rows SET row_type='NEUTRAL_SECTION'
 WHERE row_type='BOARD' AND display_description IN ('500M','250M') AND is_active=1;
SELECT COUNT(*) AS remaining_board_500_250 FROM div_signal_book_rows
 WHERE row_type='BOARD' AND display_description IN ('500M','250M') AND is_active=1;
