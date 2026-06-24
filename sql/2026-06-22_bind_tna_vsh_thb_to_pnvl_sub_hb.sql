-- =============================================================
-- TransHarbour (THB) TNA–TUH–VSH/NEU sections → PNVL_SUB_HB beat
-- =============================================================
-- Shared trunk TNA-TUH (stored once) + branches TUH-NEU, TUH-VSH, both dirs.
-- Source: data/TNA_VSH/THB UP DN_W_o PSR.xlsx (PSR excluded, not ready).
-- Bound to PNVL_SUB_HB only (user 2026-06-22), after CSMT-PNVL HB (1,2).
-- Reading order:
--   DN: trunk first, then branches    (3 TNA-TUH, 4 TUH-NEU, 5 TUH-VSH)
--   UP: branch legs first, trunk LAST (6 VSH-TUH, 7 NEU-TUH, 8 TUH-TNA)
--   — UP trains run the legs into TUH, then merge onto the trunk to TNA.
-- =============================================================
DELETE bs FROM div_signal_beat_sections bs
JOIN div_signal_beats b ON b.id = bs.beat_id
JOIN div_signal_book_sections s ON s.id = bs.section_id
WHERE b.beat_code = 'PNVL_SUB_HB' AND s.line = 'THB';

INSERT INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, x.ord
FROM div_signal_beats b
JOIN (
  SELECT 'TNA_TUH_DN_THB' code, 3 ord UNION ALL
  SELECT 'TUH_NEU_DN_THB', 4 UNION ALL
  SELECT 'TUH_VSH_DN_THB', 5 UNION ALL
  SELECT 'TUH_VSH_UP_THB', 6 UNION ALL
  SELECT 'TUH_NEU_UP_THB', 7 UNION ALL
  SELECT 'TNA_TUH_UP_THB', 8
) x
JOIN div_signal_book_sections s ON s.section_code = x.code
WHERE b.beat_code = 'PNVL_SUB_HB';
