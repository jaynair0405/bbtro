-- ============================================================================
-- AWS Phase 6/7 — Signal succession + JPO classification support
-- Date     : 2026-06-05
-- Author   : Phase 6/7 implementation
-- Purpose  : Add sequence + parallel-group support to div_signals.
--            Create div_signal_successors for line crossovers, platform
--            routing, loop routing and section boundaries.
--            Foundation for JPO rule 1 (consecutive-signal trip classification).
-- Refer    : bbtro_signal_aws_master_plan.md §17 (Phase 7 classifier),
--            AWS JPO.pdf (BB.TRSO.EMU.16 dated 07-03-2007)
-- Run on   : local first, then server (scp this file).
-- Idempotency: ALTERs guarded by procedure; CREATE TABLE uses IF NOT EXISTS.
-- ============================================================================

-- ── 1. ALTER div_signals — add seq_order + parallel_group_id ───────────────
-- Wrapped in a procedure so re-runs don't fail on "Duplicate column" errors.
DROP PROCEDURE IF EXISTS _bbtro_alter_div_signals_2026_06_05;

DELIMITER $$

CREATE PROCEDURE _bbtro_alter_div_signals_2026_06_05()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'div_signals'
          AND COLUMN_NAME  = 'seq_order'
    ) THEN
        ALTER TABLE div_signals
            ADD COLUMN seq_order INT NULL COMMENT 'Running order within (section,line,direction)';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'div_signals'
          AND COLUMN_NAME  = 'parallel_group_id'
    ) THEN
        ALTER TABLE div_signals
            ADD COLUMN parallel_group_id INT NULL COMMENT 'Signals sharing one logical position (alternates)';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'div_signals'
          AND INDEX_NAME   = 'idx_section_line_dir_seq'
    ) THEN
        ALTER TABLE div_signals
            ADD KEY idx_section_line_dir_seq (section, `line`, direction, seq_order);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'div_signals'
          AND INDEX_NAME   = 'idx_parallel_group'
    ) THEN
        ALTER TABLE div_signals
            ADD KEY idx_parallel_group (parallel_group_id);
    END IF;
END$$

DELIMITER ;

CALL _bbtro_alter_div_signals_2026_06_05();
DROP PROCEDURE _bbtro_alter_div_signals_2026_06_05;

-- ── 2. CREATE TABLE div_signal_successors ───────────────────────────────────
-- Captures explicit directed edges in the signal graph that simple km-based
-- seq_order can't infer:
--   LINE_CROSSOVER   — train diverted from one line to another at a divert point
--   PLATFORM_ROUTING — single home/advanced-starter routes to one of N platform starters
--   LOOP_ROUTING     — main vs loop choice at a passing loop
--   SECTION_BOUNDARY — handoff between section partitions
--
-- Multiple rows per from_signal_id are expected (1-to-N routing).
-- to_signal_id/from_signal_id may be NULL when the referenced signal hasn't
-- been ingested yet — text columns preserve raw values so the link can be
-- resolved on a later importer run.
CREATE TABLE IF NOT EXISTS div_signal_successors (
    id                  INT             AUTO_INCREMENT PRIMARY KEY,

    from_signal_id      INT             NULL,
    from_signal_text    VARCHAR(40)     NOT NULL,
    from_line           VARCHAR(20)     NOT NULL,

    to_signal_id        INT             NULL,
    to_signal_text      VARCHAR(40)     NOT NULL,
    to_line             VARCHAR(20)     NOT NULL,

    succession_type     ENUM('LINE_CROSSOVER','PLATFORM_ROUTING','LOOP_ROUTING','SECTION_BOUNDARY')
                        NOT NULL,
    route_condition     VARCHAR(50)     NOT NULL DEFAULT '' COMMENT 'e.g. PF-10, MAIN, LOOP; "" when not a platform/named route (NULL would bypass uq_succession)',

    section             VARCHAR(40)     NULL COMMENT 'Canonical section both signals belong to (CSMT-KYN, etc.)',
    direction           ENUM('UP','DN') NULL,

    remarks             VARCHAR(255)    NULL,

    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_succession (from_signal_text, to_signal_text, from_line, to_line, route_condition),
    KEY idx_from_id   (from_signal_id),
    KEY idx_to_id     (to_signal_id),
    KEY idx_from_text (from_signal_text, from_line),
    KEY idx_to_text   (to_signal_text, to_line),
    KEY idx_succ_type (succession_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── 3. Populate seq_order for currently-loaded div_signals rows ─────────────
-- Re-runnable: blanks all existing seq_order then re-assigns.
-- seq_order = RUNNING ORDER in the direction of travel:
--   DN trains travel CSMT(km 0) → KYN(km 53)  → order by km ASC
--   UP trains travel KYN(km 53) → CSMT(km 0)  → order by km DESC
-- so seq 1 is always the first signal a train meets. NULL km goes last in
-- either case; normalized_signal_number is the final tiebreaker.
UPDATE div_signals SET seq_order = NULL;

WITH ordered AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY section, `line`, direction
            ORDER BY
                CASE WHEN km_from_csmt IS NULL THEN 1 ELSE 0 END,
                CASE WHEN direction = 'DN' THEN km_from_csmt ELSE -km_from_csmt END,
                normalized_signal_number
        ) AS rn
    FROM div_signals
    WHERE direction IN ('UP','DN')
)
UPDATE div_signals s
JOIN ordered o ON o.id = s.id
SET s.seq_order = o.rn;

-- ── 4. Clean up known orphan row from earlier KYN-CSMT-section import ───────
-- Pre-canonicalization upload left one row with section='KYN-CSMT'. The
-- corrected csv canonicalized everything to 'CSMT-KYN'. Drop the stale row;
-- if it's needed it will re-appear on next import.
DELETE FROM div_signals
WHERE section = 'KYN-CSMT'
  AND signal_number = 'TNA S-65';

-- ── 4b. Normalize successor line names to canonical div_signals values ──────
-- The corridor_changing_signals.csv used colloquial line names; div_signals
-- imports settled on: DN LOC / UP LOC / 5TH / 6TH. Map old → canonical so the
-- resolve step below can join. Idempotent (no-op once normalized).
UPDATE div_signal_successors SET from_line = 'DN LOC'  WHERE from_line = 'DN LL';
UPDATE div_signal_successors SET to_line   = 'DN LOC'  WHERE to_line   = 'DN LL';
UPDATE div_signal_successors SET from_line = 'UP LOC'  WHERE from_line = 'UP LL';
UPDATE div_signal_successors SET to_line   = 'UP LOC'  WHERE to_line   = 'UP LL';
UPDATE div_signal_successors SET from_line = '5TH'     WHERE from_line IN ('5th Line','5TH LINE');
UPDATE div_signal_successors SET to_line   = '5TH'     WHERE to_line   IN ('5th Line','5TH LINE');
UPDATE div_signal_successors SET from_line = '6TH'     WHERE from_line IN ('6th Line','6TH LINE');
UPDATE div_signal_successors SET to_line   = '6TH'     WHERE to_line   IN ('6th Line','6TH LINE');

-- ── 5. Resolve any unresolved successor rows (re-runnable) ──────────────────
-- After new signals are imported, this UPDATE links text → IDs for rows
-- previously inserted with NULL signal IDs. COLLATE explicit to avoid
-- mixed-collation errors during cross-table string comparison.
UPDATE div_signal_successors x
LEFT JOIN div_signals fs
       ON UPPER(REPLACE(REPLACE(REPLACE(REPLACE(fs.signal_number,' ',''),'-',''),'/',''),'.','')) COLLATE utf8mb4_0900_ai_ci =
          UPPER(REPLACE(REPLACE(REPLACE(REPLACE(x.from_signal_text,' ',''),'-',''),'/',''),'.','')) COLLATE utf8mb4_0900_ai_ci
      AND fs.`line` COLLATE utf8mb4_0900_ai_ci = x.from_line COLLATE utf8mb4_0900_ai_ci
LEFT JOIN div_signals ts
       ON UPPER(REPLACE(REPLACE(REPLACE(REPLACE(ts.signal_number,' ',''),'-',''),'/',''),'.','')) COLLATE utf8mb4_0900_ai_ci =
          UPPER(REPLACE(REPLACE(REPLACE(REPLACE(x.to_signal_text,' ',''),'-',''),'/',''),'.','')) COLLATE utf8mb4_0900_ai_ci
      AND ts.`line` COLLATE utf8mb4_0900_ai_ci = x.to_line COLLATE utf8mb4_0900_ai_ci
SET x.from_signal_id = fs.id,
    x.to_signal_id   = ts.id
WHERE (x.from_signal_id IS NULL AND fs.id IS NOT NULL)
   OR (x.to_signal_id   IS NULL AND ts.id IS NOT NULL);

-- ── 6. Verification queries (read-only — for the operator running this) ─────
SELECT 'div_signals partitions after seq_order populate:' AS info;
SELECT section, `line`, direction,
       COUNT(*) AS total,
       COUNT(seq_order) AS seq_assigned,
       COUNT(*) - COUNT(seq_order) AS seq_missing
FROM div_signals
GROUP BY section, `line`, direction
ORDER BY section, `line`, direction;

SELECT 'div_signal_successors row count:' AS info;
SELECT COUNT(*) AS total_rows,
       SUM(from_signal_id IS NOT NULL) AS from_resolved,
       SUM(to_signal_id   IS NOT NULL) AS to_resolved
FROM div_signal_successors;
