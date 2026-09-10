-- =====================================================================
-- Local-only: backfill magnet_id on the 26 most recent signals
--
-- NOT a prod migration. Prod already has these values — this brings LOCAL
-- into line with prod, not the other way round.
--
-- WHAT HAPPENED
-- Signals 3742-3767 (CSMT platform starters S-8..S-18, the DN/UP HB and TH
-- repeaters, plus DCC S-5 / NEU S-32 / TNA S-61) were added on local, deployed
-- to prod, and then the magnet_id backfill was run on PROD ONLY. Local kept
-- NULLs. Counts and ids match on both sides; magnet_id was the only drift.
--
-- WHY magnet_id = id IS CORRECT HERE
-- magnet_id groups rows that are the SAME PHYSICAL SIGNAL listed under more
-- than one section — e.g. KYN S-56 appears in both KYN-KJT and KYN-KSRA and
-- both rows point at the canonical id 114. A signal with no twin is its own
-- magnet. Checked: none of these 26 shares a normalized_signal_number with any
-- other row, so each is its own magnet. This also matches what prod holds,
-- verified row by row before writing this file.
--
-- AWS SAFETY
-- AWS resolves signals through magnet_id, so this is additive only: the WHERE
-- clause touches nothing that already has a magnet, and no id changes.
-- =====================================================================

UPDATE div_signals
   SET magnet_id = id
 WHERE magnet_id IS NULL
   AND id BETWEEN 3742 AND 3767;

-- ── verify: expect 0 rows without a magnet, and 3069 total ─────────────
SELECT COUNT(*) AS rows_total,
       SUM(magnet_id IS NULL) AS no_magnet,
       SUM(CRC32(CONCAT_WS(char(1), id, signal_number, section, line, direction,
                           IFNULL(magnet_id, 0)))) AS checksum
  FROM div_signals;

-- Prod at the time of writing (2026-09-09):
--   rows_total 3069 | no_magnet 0 | checksum 6634524454539
-- The checksum above must match that exactly.
