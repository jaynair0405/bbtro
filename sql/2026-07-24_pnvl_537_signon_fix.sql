-- =====================================================================
-- Fix HB87-537 sign-on time: 06:36 -> 06:21 (per new PDF page 22).
-- DB sign-on 06:36 contradicts its own duty 04:08 (06:36->10:29 = 3:53);
-- 06:21->10:29 = 4:08 exactly. Legs/sign-off/duty already correct.
-- =====================================================================

UPDATE details
   SET sign_on_time = '06:21:00'
 WHERE detail_id = 'HB87-537';
