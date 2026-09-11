-- 2026-09-11 — give the route-less bypass rows their route_label
--
-- WHY
-- The bypass daily sheet groups rows by route_label (LNL-BSR, IGP-ROHA, ...).
-- Settings had no route field, so every bypass link the LPC created from it
-- landed with route_label NULL and appeared on a "(no route)" tab instead of
-- the route the LPC works. 26 rows on prod (4 local): four regular links added
-- through Add Link (which also let direction be UP/DN with is_bypass = 0), and
-- 22 Ganpati / TOD scheduled specials added through Scheduled Specials.
--
-- The code fix (same commit) makes Settings ask for the route and the API
-- refuse a bypass row without one. This repairs the rows that already exist.
-- Route per row confirmed by the LPC on 2026-09-11 — the label is the
-- division entry/exit pair, not the train's own endpoints, so it is set by
-- id and never derived. Rows absent on a DB (local has only 415-424) are
-- simply not matched; the script is idempotent.
--
-- Step 1 — preview.
SELECT id, train_no, train_name, sheet_source, section, direction, is_bypass, route_label
FROM div_loco_link_master
WHERE active = 1 AND (direction = 'BYPASS' OR sheet_source LIKE 'BYPASS%')
  AND (route_label IS NULL OR route_label = '')
ORDER BY id;

-- Step 2 — set the route, and normalise the bypass markers the same way the
-- API now does (direction BYPASS, is_bypass 1, section BYPASS).
UPDATE div_loco_link_master
SET route_label = CASE id
        -- regular links (Add Link form)
        WHEN 415 THEN 'BSR-ROHA'   -- 19057 ST-MAJN DN
        WHEN 416 THEN 'ROHA-BSR'   -- 19058 ST-MAJN UP
        WHEN 423 THEN 'IGP-ROHA'   -- 11203 NGP-MAO
        WHEN 424 THEN 'ROHA-IGP'   -- 11204 MAO-NGP
        -- Ganpati specials (Scheduled Specials form)
        WHEN 465 THEN 'PUNE-ROHA'  -- 01445 PUNE-RN
        WHEN 466 THEN 'ROHA-PUNE'  -- 01446 RN-PUNE
        WHEN 467 THEN 'PUNE-ROHA'  -- 01447 PUNE-RN
        WHEN 468 THEN 'ROHA-PUNE'  -- 01448 RN-PUNE
        WHEN 473 THEN 'BSR-ROHA'   -- 09013 MMCT-TOK
        WHEN 474 THEN 'ROHA-BSR'   -- 09014 TOK-MMCT
        WHEN 476 THEN 'ROHA-BSR'   -- 09020 SWV-MMCT
        WHEN 477 THEN 'BSR-ROHA'   -- 09035 BDTS-RN
        WHEN 478 THEN 'ROHA-BSR'   -- 09036 RN-BDTS
        WHEN 479 THEN 'BSR-ROHA'   -- 09114 BRC-RN
        WHEN 480 THEN 'ROHA-BSR'   -- 09113 RN-BRC
        WHEN 481 THEN 'BSR-ROHA'   -- 09110 VS-RN
        WHEN 482 THEN 'ROHA-BSR'   -- 09109 RN-VS
        WHEN 483 THEN 'BSR-ROHA'   -- 09124 VS-RN
        WHEN 484 THEN 'ROHA-BSR'   -- 09123 RN-VS
        WHEN 485 THEN 'BSR-ROHA'   -- 09022 UDN-RN
        WHEN 486 THEN 'ROHA-BSR'   -- 09021 RN-UDN
        WHEN 487 THEN 'BSR-ROHA'   -- 09030 BL-RN
        WHEN 488 THEN 'ROHA-BSR'   -- 09029 RN-BL
        -- TOD specials
        WHEN 489 THEN 'IGP-ROHA'   -- 07659 NED-SWV
        WHEN 490 THEN 'ROHA-IGP'   -- 07660 SWV-NED
    END,
    direction = 'BYPASS',
    is_bypass = 1,
    section   = 'BYPASS'
WHERE id IN (415,416,423,424,465,466,467,468,473,474,476,477,478,479,480,
             481,482,483,484,485,486,487,488,489,490)
  AND active = 1
  AND (direction = 'BYPASS' OR sheet_source LIKE 'BYPASS%')
  AND (route_label IS NULL OR route_label = '');

-- Step 3 — verify. Expect zero route-less bypass rows.
SELECT COUNT(*) AS routeless_bypass_rows
FROM div_loco_link_master
WHERE active = 1 AND (direction = 'BYPASS' OR sheet_source LIKE 'BYPASS%')
  AND (route_label IS NULL OR route_label = '');

SELECT id, train_no, sheet_source, section, direction, is_bypass, route_label
FROM div_loco_link_master
WHERE id IN (415,416,423,424,465,466,467,468,473,474,476,477,478,479,480,
             481,482,483,484,485,486,487,488,489,490)
ORDER BY route_label, id;

-- Rollback (the four regular links had direction UP/DN, is_bypass 0, section KR;
-- the specials had direction BYPASS, is_bypass 0, section NULL):
-- UPDATE div_loco_link_master SET route_label = NULL, is_bypass = 0,
--   direction = CASE id WHEN 415 THEN 'DN' WHEN 416 THEN 'UP' WHEN 423 THEN 'UP' WHEN 424 THEN 'DN' ELSE 'BYPASS' END,
--   section   = CASE WHEN id IN (415,416,423,424) THEN 'KR' ELSE NULL END
-- WHERE id IN (415,416,423,424,465,466,467,468,473,474,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490);
