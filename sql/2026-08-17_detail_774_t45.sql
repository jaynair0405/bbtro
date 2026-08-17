-- =====================================================================
-- Detail 774 — T 45 arrival and the wheel movement that follows it.
--
-- Book:
--   ER KYN  THK 07:43 -> KYN 07:50   EX THK SDG
--   K 26    KYN 07:57 -> CSMT 09:26
--   T 45    CSMT 10:27 -> TNA 11:28  R/B 36
--   P/K 43  TNA 11:45 -> KYN 12:18   (piloting)
--   wheel movement 2:37
--
-- Stored was T 45 -> 11:26 and wheel movement 2:35 — i.e. the header and
-- the leg were wrong TOGETHER, and therefore consistent with each other.
--
-- WORTH RECORDING. Throughout the 2026-08-14/17 correction set, the
-- stored wheel movement served as an independent check: across all 34
-- details it matched the CORRECTED legs rather than the wrong ones on
-- file, which is only possible if it came from a source that had the
-- legs right. That made it genuinely useful. But 774 shows the limit —
-- when the header and the leg are wrong in the SAME direction the check
-- is silent, because internal consistency is all it can see. 774 never
-- appeared in the drift report for exactly that reason.
--
-- Idempotent. RUN ON BOTH DATABASES.
-- =====================================================================

START TRANSACTION;

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.end_time = '11:28:00'
 WHERE d.detail_number = '774' AND t.train_number = 'T 45';        -- was 11:26

UPDATE trains t JOIN details d ON d.detail_id = t.detail_id
   SET t.remarks = 'EX THK SDG'
 WHERE d.detail_number = '774' AND t.train_number = 'ER KYN';

UPDATE details SET total_wheel_movement = '2:37' WHERE detail_number = '774';  -- was 2:35

COMMIT;

SELECT '774 — legs must equal the stored wheel movement' AS chk;
SELECT d.detail_number AS det, d.total_wheel_movement AS wm, d.total_piloting AS pil,
       SEC_TO_TIME(SUM(IF(t.train_type='working',  TIME_TO_SEC(TIMEDIFF(t.end_time,t.start_time)),0))) AS working_hm,
       SEC_TO_TIME(SUM(IF(t.train_type='piloting', TIME_TO_SEC(TIMEDIFF(t.end_time,t.start_time)),0))) AS piloting_hm
  FROM details d JOIN trains t ON t.detail_id = d.detail_id
 WHERE d.detail_number = '774' GROUP BY d.detail_number, d.total_wheel_movement, d.total_piloting;

SELECT '774 legs' AS chk;
SELECT t.train_number, t.train_type AS ty, t.start_station AS ss, LEFT(t.start_time,5) AS st,
       t.end_station AS es, LEFT(t.end_time,5) AS et, IFNULL(t.remarks,'-') AS remarks,
       IFNULL(t.rb_detail,'-') AS r_b
  FROM details d JOIN trains t ON t.detail_id = d.detail_id
 WHERE d.detail_number = '774' ORDER BY t.start_time;

-- ROLLBACK: T 45 end_time -> 11:26:00; total_wheel_movement -> 2:35; remarks -> NULL
