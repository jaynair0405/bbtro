-- Backfill magnet_id on the ghat sections (KJT-LNL, KSRA-IGP).
-- Date: 2026-07-14
--
-- Context: see docs/SIGNAL_BOOK_HANDOVER_2026-07-14.md (handed over from the AWS chat).
-- The ghat import (KJT-LNL 98 rows, KSRA-IGP 60 rows) left magnet_id = NULL on all
-- 158 rows. Every other section carries one. div_signals duplicates a physical signal
-- once per line (and, at junctions, once per adjacent section); those display rows are
-- meant to be tied to ONE physical magnet via magnet_id:
--     id        = display row (one per line / per section page)
--     magnet_id = physical magnet identity (shared by all copies)
-- AWS magnet-counting (JPO Rule 3b, chronic-repeaters) groups by magnet_id, so NULLs
-- make three acts on one Karjat magnet look like three separate magnets.
-- Signal-book rendering does NOT read magnet_id, so this cannot change the book.
--
-- Rule applied: a ghat row's magnet_id = the LOWEST id among all active copies of the
-- same (signal_number, direction) within the Karjat/Kasara junction cluster
--   (KJT-KHPI, KJT-LNL, KYN-KJT, KSRA-IGP, KYN-KSRA).
-- This unifies, in one statement:
--   * within-section MID duplicates (DN SE + DN SE MID -> one magnet), and
--   * cross-section copies where the SAME physical signal is also read on the
--     suburban / plateau page (user confirmed same physical magnet 2026-07-14; the
--     plateau signals KJT S-132/133/134/137, KYN S-56, KYN S-58 already follow this).
-- Non-duplicated ghat signals fall out of the same rule with canon = own id.
--
-- Write is scoped to ghat rows only (section IN ('KJT-LNL','KSRA-IGP')); suburban /
-- plateau rows keep their existing magnet_id and are never modified. This scoping is
-- also what keeps the case-collision GATE-7 (KJT-KHPI) vs Gate-7 (KYN-KJT) -- two
-- DIFFERENT physical gates -- from being touched: neither is a ghat row.
--
-- Idempotent: re-running recomputes the same canonical ids.
-- Apply on local AND prod (the ghat rows were pushed to prod without magnet_id on
-- 2026-07-13; ids are aligned on both sides, 2010-2167).

UPDATE div_signals g
  JOIN (
        SELECT signal_number, direction, MIN(id) AS canon
          FROM div_signals
         WHERE is_active = 1
           AND section IN ('KJT-KHPI','KJT-LNL','KYN-KJT','KSRA-IGP','KYN-KSRA')
         GROUP BY signal_number, direction
       ) c
    ON c.signal_number = g.signal_number
   AND c.direction     = g.direction
   SET g.magnet_id = c.canon
 WHERE g.is_active = 1
   AND g.section IN ('KJT-LNL','KSRA-IGP');

-- ---------------------------------------------------------------------------
-- Verification (each must be as noted):

-- (1) No ghat row left without a magnet_id  -> expect 0
-- SELECT COUNT(*) FROM div_signals
--  WHERE is_active=1 AND section IN ('KJT-LNL','KSRA-IGP') AND magnet_id IS NULL;

-- (2) Within-section invariant: any repeated (signal_number,section,direction) must
--     share ONE magnet_id  -> expect 0 rows
-- SELECT signal_number, section, direction
--   FROM div_signals WHERE is_active=1
--  GROUP BY signal_number, section, direction
-- HAVING COUNT(*) > 1 AND COUNT(DISTINCT magnet_id) <> 1;

-- (3) Cross-section spot check: the ghat copies share the sibling's magnet
-- SELECT signal_number, section, line, id, magnet_id
--   FROM div_signals
--  WHERE is_active=1 AND signal_number IN ('KJT S-16','KJT S-22','KSRA S-46')
--  ORDER BY signal_number, id;
