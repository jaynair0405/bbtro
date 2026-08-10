-- Fix ATG (Atgaon, KYN-KSRA) coordinates on PROD.
-- Date: 2026-08-10
--
-- The ATG renumber is LOCAL-only (signal-book branch, parked), so prod still has the
-- OLD numbers while local's coords sit under the NEW numbers. The 2026-08-07 by-number
-- sync therefore (a) missed prod's old rows, and (b) mis-set prod's OLD S-12 with the
-- NEW S-12's coordinate (a different physical signal). This corrects prod by mapping the
-- local NEW-number coordinate onto prod's OLD-number row. Set unconditionally (no NULL
-- guard) so the wrong S-12 value is overwritten.
--
-- old -> new (coords come from the NEW number on local):
--   UP: S-27<-S-48  S-18<-S-43  S-19<-S-44  S-17<-S-41
--   DN: S-11<-S-5   S-12<-S-6   S-13<-S-12
-- When the signal-book renumber eventually deploys to prod (rename old->new), these
-- coords travel with the renamed rows and remain correct.

SELECT '--- ATG on prod BEFORE ---' AS x;
SELECT signal_number, direction, latitude, longitude FROM div_signals
WHERE is_active=1 AND section='KYN-KSRA' AND station_code='ATG'
  AND signal_number IN ('ATG S-27','ATG S-18','ATG S-19','ATG S-17','ATG S-11','ATG S-12','ATG S-13')
ORDER BY direction, signal_number;

-- UP NE
UPDATE div_signals SET latitude=19.5108600, longitude=73.3275400 WHERE section='KYN-KSRA' AND direction='UP' AND signal_number='ATG S-27';  -- <- new S-48
UPDATE div_signals SET latitude=19.5017900, longitude=73.3297400 WHERE section='KYN-KSRA' AND direction='UP' AND signal_number='ATG S-18';  -- <- new S-43
UPDATE div_signals SET latitude=19.5019500, longitude=73.3297900 WHERE section='KYN-KSRA' AND direction='UP' AND signal_number='ATG S-19';  -- <- new S-44
UPDATE div_signals SET latitude=19.4999200, longitude=73.3315200 WHERE section='KYN-KSRA' AND direction='UP' AND signal_number='ATG S-17';  -- <- new S-41
-- DN NE
UPDATE div_signals SET latitude=19.5072800, longitude=73.3268400 WHERE section='KYN-KSRA' AND direction='DN' AND signal_number='ATG S-11';  -- <- new S-5
UPDATE div_signals SET latitude=19.5073300, longitude=73.3268800 WHERE section='KYN-KSRA' AND direction='DN' AND signal_number='ATG S-12';  -- <- new S-6  (CORRECTS mis-set)
UPDATE div_signals SET latitude=19.5109100, longitude=73.3275400 WHERE section='KYN-KSRA' AND direction='DN' AND signal_number='ATG S-13';  -- <- new S-12

SELECT '--- ATG on prod AFTER ---' AS x;
SELECT signal_number, direction, latitude, longitude FROM div_signals
WHERE is_active=1 AND section='KYN-KSRA' AND station_code='ATG'
  AND signal_number IN ('ATG S-27','ATG S-18','ATG S-19','ATG S-17','ATG S-11','ATG S-12','ATG S-13')
ORDER BY direction, signal_number;

SELECT '--- KYN-KSRA coverage AFTER ---' AS x;
SELECT line, direction, COUNT(*) total, SUM(latitude IS NOT NULL AND longitude IS NOT NULL) with_ll
FROM div_signals WHERE is_active=1 AND section='KYN-KSRA' GROUP BY line, direction;
