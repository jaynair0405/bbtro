-- ============================================================================
-- AWS module — wipe the imported data and reload from scratch (PRODUCTION)
-- 2026-07-13
--
-- WHY A WIPE AND NOT A REPAIR
-- The AWS module has never been released to users; everything in the AWS tables
-- on prod is test data from trial uploads. Meanwhile the parser, the matcher and
-- the ingest filter have all changed substantially, and NONE of those changes
-- reach an event that already exists:
--
--   * /parse only creates events for raws that have NO event yet, so an event
--     imported by the old parser keeps its old code/location forever — including
--     its NULLs, and including phantom locations like the literal "KM" or "GATE"
--     (those are NOT in review: they look parsed, and are counted in the reports
--     against a meaningless location).
--   * The EMU-lobby filter only blocks NEW imports. Loco-lobby rows (CSMT, CSTM,
--     KYN, PNVL and ~40 foreign lobbies) already imported stay, and their
--     "D/Cab" is a loco number that can never match a rake.
--   * Any event a CLI hand-edited on the old review card left review with
--     signal_id NULL — reviewed-looking, but unmatched.
--
-- Re-uploading the same files does NOT fix any of this: import de-duplicates on
-- abn_id, so the rows are skipped and nothing is re-parsed. The only clean route
-- is to empty the imported data and load it again through the current pipeline.
--
-- WHAT THIS DOES NOT TOUCH
--   div_signals         — the signal master. Untouched.
--   div_signal_aliases  — hand-linked location -> signal decisions made by a CLI.
--                         These are human knowledge, not import data. KEPT.
--                         (Step 4 lists the manual ones so you can review them.)
--
-- PREREQUISITE — the code being deployed needs two columns that earlier
-- migrations added. Step 1 checks them. Do not run the app without them.
--   sql/2026-06-30_aws_event_seq.sql        (event_seq + uk_abn_seq)
--   sql/2026-06-30_aws_status_dismissed.sql (status enum incl. DISMISSED)
--
-- HOW TO RUN
--   scp sql/2026-07-13_aws_truncate_reload.sql railway@93.127.198.125:~/
--   ssh railway@93.127.198.125
--   mysql -u <user> -p bbtro < 2026-07-13_aws_truncate_reload.sql
-- Then follow the RELOAD SEQUENCE at the foot of this file — the reload itself
-- is done in the UI, not in SQL.
-- ============================================================================


-- ── Step 1: prerequisites ───────────────────────────────────────────────────
-- All three must return a row. If any is EMPTY, stop and run the two migrations
-- listed above first: the current code writes event_seq on every insert and sets
-- status = 'DISMISSED' from the review page, and will error without them.

SELECT '--- Step 1: prerequisites (each must return a row) ---' AS ``;

SELECT 'event_seq column' AS check_name, COLUMN_NAME, COLUMN_TYPE
  FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_aws_events' AND COLUMN_NAME = 'event_seq';

SELECT 'status enum has DISMISSED' AS check_name, COLUMN_TYPE
  FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_aws_events' AND COLUMN_NAME = 'status'
   AND COLUMN_TYPE LIKE '%DISMISSED%';

SELECT 'uk_abn_seq unique key' AS check_name, INDEX_NAME, NON_UNIQUE
  FROM information_schema.STATISTICS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_aws_events' AND INDEX_NAME = 'uk_abn_seq'
 LIMIT 1;


-- ── Step 2: what is about to be deleted ─────────────────────────────────────
-- Read this before continuing. It is test data — but read it anyway.

SELECT '--- Step 2: current contents (all of this will be deleted) ---' AS ``;

SELECT 'div_aws_cms_uploads'   AS table_name, COUNT(*) AS rows_ FROM div_aws_cms_uploads
UNION ALL SELECT 'div_aws_cms_raw',       COUNT(*) FROM div_aws_cms_raw
UNION ALL SELECT 'div_aws_events',        COUNT(*) FROM div_aws_events
UNION ALL SELECT 'div_aws_report_drafts', COUNT(*) FROM div_aws_report_drafts;

-- Anything a human actually typed. On a test database this should be 0. If it is
-- NOT 0, someone has done real analysis work here and you should stop and think
-- before wiping it — that work is not recoverable.
-- (Note: responsibility / root_cause are NOT in this check. Classify sets those
-- automatically, so counting them reports false "hand-touched" work.)
SELECT COUNT(*) AS hand_typed_events_at_risk
  FROM div_aws_events
 WHERE (analysis_text   IS NOT NULL AND analysis_text   <> '')
    OR (closing_remarks IS NOT NULL AND closing_remarks <> '');


-- ── Step 3: wipe the imported data ──────────────────────────────────────────
-- Order matters: div_aws_events.raw_id -> div_aws_cms_raw.id, and
-- div_aws_cms_raw.upload_id -> div_aws_cms_uploads.id. TRUNCATE cannot run
-- against a table referenced by a foreign key, so the checks are lifted for the
-- three statements and restored immediately after. TRUNCATE also resets
-- AUTO_INCREMENT, which is what we want: a clean reload starting at id 1.

SELECT '--- Step 3: wiping ---' AS ``;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE div_aws_events;        -- parsed acts
TRUNCATE TABLE div_aws_cms_raw;       -- imported CMS rows
TRUNCATE TABLE div_aws_cms_uploads;   -- upload batches
TRUNCATE TABLE div_aws_report_drafts; -- saved report drafts (test drafts only)

SET FOREIGN_KEY_CHECKS = 1;


-- ── Step 4: what survived ───────────────────────────────────────────────────
-- The signal master and the alias table are deliberately untouched.

SELECT '--- Step 4: after the wipe ---' AS ``;

SELECT 'div_aws_cms_uploads'   AS table_name, COUNT(*) AS rows_ FROM div_aws_cms_uploads
UNION ALL SELECT 'div_aws_cms_raw',       COUNT(*) FROM div_aws_cms_raw
UNION ALL SELECT 'div_aws_events',        COUNT(*) FROM div_aws_events
UNION ALL SELECT 'div_aws_report_drafts', COUNT(*) FROM div_aws_report_drafts
UNION ALL SELECT 'div_signals (kept)',        COUNT(*) FROM div_signals
UNION ALL SELECT 'div_signal_aliases (kept)', COUNT(*) FROM div_signal_aliases;

-- The hand-made aliases. Each one is a CLI's decision that a piece of CMS text
-- means a particular signal, and they will keep working after the reload. Review
-- them: any created during testing to chase a bug is now baked in, and a WRONG
-- alias silently mis-matches every future event with that text.
SELECT a.id, a.alias_text, a.normalized_alias, s.signal_number, s.section, s.direction,
       a.source, a.created_at
  FROM div_signal_aliases a
  LEFT JOIN div_signals s ON s.id = a.signal_id
 WHERE a.source <> 'excel_import'
 ORDER BY a.created_at DESC;

-- If one of the above is wrong, delete it by id — do NOT clear the table, the
-- excel_import rows are the seeded signal-name variants:
--   DELETE FROM div_signal_aliases WHERE id = <id>;


-- ============================================================================
-- RELOAD SEQUENCE (in the UI — this part is NOT SQL)
--
-- The AWS tables are now empty. Reload the CMS files one at a time:
--
--   1. Upload      /div/aws-upload.html
--                  Pick one Abnormality (DD-MM-YYYY).xlsx and upload it.
--                  Upload AUTO-PARSES and AUTO-MATCHES the rows it just imported,
--                  so a clean file needs nothing further. Only EMU lobbies
--                  (CSTS / KYNS / PNVS) are imported now — loco-lobby rows are
--                  no longer flagged as AWS candidates at all.
--
--   2. Review      /div/aws-review.html
--                  Anything the parser could not settle is here. Give it a code,
--                  and PICK the signal from the dropdown rather than typing it —
--                  a typed name that matches no signal now keeps the event in
--                  review rather than letting it out unmatched.
--                  "Match All" on this page re-runs matching over anything still
--                  unmatched (route- and direction-aware).
--
--   3. Classify    /div/aws.html
--                  Set the report period to the dates you actually loaded — this
--                  is period-scoped, and Classify over an empty window does
--                  nothing. Then apply the JPO rules.
--
--   4. Chronic     Same page, "Chronic Repeaters" section. It carries its OWN
--                  date range (a chronic pattern needs months to show, so it does
--                  not follow the report period) and opens on the full span of
--                  loaded data.
--
-- Repeat 1–2 per file. Run 3 once, after the files for that period are all in.
-- ============================================================================
