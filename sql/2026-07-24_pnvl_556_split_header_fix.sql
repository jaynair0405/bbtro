-- =====================================================================
-- Fix HB87-556 (PDF 556) — split/double detail landed as an inconsistent
-- single-header row (inherited from old 552).
--   Header showed only block-1 book-off (10:00 PNVL -> 14:38 PEN) while
--   duty (8:10) and legs (to 20:40 PNVL) are the FULL detail.
-- Represent as outer span: 10:00 PNVL -> 21:15 PNVL (book-on to final book-off).
-- Also correct leg PENDW61026 start 18:08 -> 18:05 (PDF; makes WM = 3:10 exact).
-- duty 8:10 / WM 3:10 / piloting 1:20 unchanged.
-- =====================================================================

START TRANSACTION;

UPDATE details
   SET sign_off_time  = '21:15:00',
       sign_off_place = 'PNVL'
 WHERE detail_id = 'HB87-556';

UPDATE trains
   SET start_time = '18:05:00'
 WHERE detail_id = 'HB87-556'
   AND train_number = 'PENDW61026';

COMMIT;
