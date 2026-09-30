-- Link 6 unlinked copies (user 2026-09-30). Same number, same km, same placement as the main-line signal;
-- the 31 Jul magnet backfill matched copies by number AND direction, and these pages carry the PNVL-complex
-- UP/DN labels, so they were left as separate signals (same cause as the Diva starters).
--   ME 4515, 4809, 4903, 4913, 5007: DCC-KYN "DIVA UP" page -> CLA-KYN 5TH signal's magnet
--     (their DCC-KYN "DIVA DN" copies were already linked there)
--   ME 4310: DCC-DIVA "DIVA DN" page -> CLA-KYN 6TH signal's magnet
-- ME 4310's 6TH record had no visibility distance; the copy says 400 m: filled in (blank only), so the copies agree.
-- Undo: 2026-09-30_link_me_copies_dcc_pages_UNDO.sql
START TRANSACTION;
UPDATE div_signals c
  JOIN div_signals m ON m.signal_number = c.signal_number AND m.km_text = c.km_text
                    AND m.section = 'CLA-KYN' AND m.line = '5TH' AND m.is_active = 1
   SET c.magnet_id = m.magnet_id
 WHERE c.section = 'DCC-KYN' AND c.line = 'DIVA UP' AND c.is_active = 1 AND c.magnet_id = c.id
   AND c.signal_number IN ('ME 4515', 'ME 4809', 'ME 4903', 'ME 4913', 'ME 5007');
SELECT ROW_COUNT() AS dcc_kyn_linked;                                           -- expect 5
UPDATE div_signals c
  JOIN div_signals m ON m.signal_number = c.signal_number AND m.km_text = c.km_text
                    AND m.section = 'CLA-KYN' AND m.line = '6TH' AND m.is_active = 1
   SET c.magnet_id = m.magnet_id,
       m.visibility_distance_m = COALESCE(m.visibility_distance_m, c.visibility_distance_m)
 WHERE c.section = 'DCC-DIVA' AND c.line = 'DIVA DN' AND c.is_active = 1 AND c.magnet_id = c.id
   AND c.signal_number = 'ME 4310';
SELECT ROW_COUNT() AS me4310_rows_changed;                                      -- expect 2 (copy linked + main visibility)
COMMIT;
SELECT s.signal_number, s.id, s.section, s.line, s.magnet_id, s.visibility_distance_m
  FROM div_signals s WHERE s.is_active = 1 AND s.signal_number IN ('ME 4310','ME 4515','ME 4809','ME 4903','ME 4913','ME 5007')
 ORDER BY s.signal_number, s.id;
