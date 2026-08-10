-- Bind MMR-BSL (Manmad–Bhusaval) sections to the CSMT_ML_MMR beat.
-- Date: 2026-08-06
-- Corridor: the North-East main trunk continues past MMR to Bhusaval, so both
-- directions are line "NE" (DN NE / UP NE), matching IGP-MMR. (Future MMR-SNSI
-- branch will get its own SNSI DN/UP line.)
--   section 90 MMR_BSL_DN_NE (154 signals)   section 91 MMR_BSL_UP_NE (160 signals)
-- Boundary: MMR S-66 (DN) and MMR S-6 (UP) also print in IGP-MMR — one-signal-two-books,
-- magnet-linked (like the KYN starter in CSMT-KYN & KYN-KSRA). See magnet backfill below.
-- Whole-beat render order is a later pass; appended after the beat's current max slot (37).

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order)
SELECT b.id, s.id, x.ord
FROM div_signal_beats b
JOIN (SELECT 'MMR_BSL_UP_NE' code, 38 ord
      UNION ALL SELECT 'MMR_BSL_DN_NE', 39) x
JOIN div_signal_book_sections s ON s.section_code = x.code
WHERE b.beat_code = 'CSMT_ML_MMR';

-- Magnet-link the two MMR boundary starters to their existing IGP-MMR magnets
-- (idempotent; only fills the freshly-imported NULL copies).
UPDATE div_signals n
JOIN div_signals o
  ON o.is_active=1 AND o.section='IGP-MMR'
 AND o.signal_number=n.signal_number AND o.direction=n.direction
 AND o.magnet_id IS NOT NULL
SET n.magnet_id = o.magnet_id
WHERE n.is_active=1 AND n.section='MMR-BSL' AND n.magnet_id IS NULL
  AND n.signal_number IN ('MMR S-66','MMR S-6');
