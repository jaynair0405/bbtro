-- Fix HB87-403 sign-on: 07:26 -> 07:11 (Excel/duty confirm).
-- DB duty 1:50 requires 07:11 (07:11->09:01); 07:26 gave only 1:35. Legs unchanged.
UPDATE details SET sign_on_time='07:11:00' WHERE detail_id='HB87-403';
