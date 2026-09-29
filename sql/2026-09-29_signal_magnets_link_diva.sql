-- Link 8 split magnets (user, 2026-09-29). The 31 Jul magnet backfill grouped copies by (station, number, DIRECTION);
-- the Diva-line pages label some signals in the opposite direction, so these copies of ONE physical signal (same km /
-- same location) each got their own magnet_id. Point each separate copy at the signal's existing magnet.
-- (Same fix as KYN S-9, batch 2 item 4.)  Undo: set each id back to its own id as magnet_id.
START TRANSACTION;
UPDATE div_signals SET magnet_id = CASE id
    WHEN 3110 THEN 691   -- KYN S-4   DCC-KYN DIVA UP   -> CLA-KYN 5TH / DIVA DN   (km 51/505)
    WHEN 3112 THEN 693   -- KYN S-25  DCC-KYN DIVA UP   -> CLA-KYN 5TH / DIVA DN   (km 52/433)
    WHEN 3105 THEN 686   -- DI S-26   DCC-KYN DIVA UP   -> CLA-KYN 5TH / DIVA DN   (km 47/516)
    WHEN 3104 THEN 685   -- DI S-13   DCC-KYN DIVA UP   -> CLA-KYN 5TH             (km 46/518)
    WHEN 3216 THEN 707   -- DCC S-22  DAT-DCC DIVA DN   -> CLA-KYN 6TH             (DCC LOOP STR)
    WHEN 3219 THEN 710   -- DW S-55   DCC-DIVA DIVA DN  -> CLA-KYN 6TH             (PF-5 STR)
    WHEN 3218 THEN 709   -- DW S-68   DCC-DIVA DIVA DN  -> CLA-KYN 6TH             (km 43/613)
    WHEN 3153 THEN 681   -- DCC S-8   DW-DCC BSR UP     -> CLA-KYN 5TH             (km 43/23 = 43/524, user confirmed)
  END
 WHERE id IN (3110, 3112, 3105, 3104, 3216, 3219, 3218, 3153) AND magnet_id = id;
SELECT ROW_COUNT() AS copies_linked;                                            -- expect 8
COMMIT;
