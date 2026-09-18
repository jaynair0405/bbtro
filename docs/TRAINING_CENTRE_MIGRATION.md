# Training Centre foundation migration

## Scope

Steps 2–4 authorised on 15 September 2026: inspect schema, prepare the migration,
create an isolated worktree, and apply/verify the local database changes.

The migration creates 19 tables. It does not alter existing tables, insert course
settings, convert historical data, or enable new application behaviour. All new
business tables start empty. Existing route code continues using legacy tables.

## Verified source and design

Local MySQL 8.1.0 SHOW CREATE TABLE confirms:

- `div_training_records.staff_hrms_id` references staff master and has a unique
  staff/type/date key. Keep that compatibility surface for actual staff records.
- CLI has a stable `cli_id`, optional HRMS and CMS IDs, and no PF-number column.
  CLI trainees reference `cli_id`; the TM PF requirement does not apply to CLI.
- Letter nominees currently require an HRMS string, and readers inner-join the
  staff master. New nominees therefore use a separate table; changing only HRMS
  nullability would silently hide TM/CLI trainees from those readers.
- Completion currently writes directly to legacy records. No legacy completions
  are assigned invented course origins by this migration.
- The holiday table serves wheel movement. Separate centre holidays avoid
  changing the meaning of that existing shared table.
- Legacy batch numbers are globally unique. This migration retains that constraint;
  changing numbering awaits the agreed convention.

## Added structures

| Tables (all prefixed `div_training_`) | Purpose |
|---|---|
| `trainees` | Staff FK, CLI FK, or manual TM; name/CMS/lobby/PF required for TM; HRMS optional |
| `courses`, `course_rules` | Distinct courses and versioned duration/eligibility settings |
| `renewal_targets`, `rule_renewals` | Independent qualifications and per-course renewal effects |
| `course_offerings`, `center_holidays` | Centre configuration and holidays |
| `batch_settings`, `batch_allocations` | Extend existing calendar with capacity and suggested lobby shares |
| `letter_workflows`, `letter_versions`, `nominees` | Extend existing letters with workflow, snapshots and stable trainees |
| `attempts`, `daily_attendance` | Individual joining/completion dates, repeat links and daily attendance |
| `assessment_definitions`, `assessment_results` | Configured thresholds, marks and numbered examinations |
| `completion_events`, `completion_renewals` | Idempotent completion revisions, renewal effects and optional legacy record links |
| `audit_events` | Actor, reason and before/after correction data |

Foreign keys use restrictive deletion. No existing row references these new
structures until the later application adoption step. Once adopted, deleting a
legacy letter/nominee with training history will fail rather than erase history.

Manual TM CMS/PF indexes support duplicate lookup; global uniqueness is not
assumed. Later UI/API work must flag matching identities for reuse and must not
silently merge a TM, CLI or staff person on an optional HRMS string.

## Run locally

From `/Users/neeraja/bbtro-training-centre`:

```sh
node scripts/training-centre-migration.js --verify
node scripts/training-centre-migration.js --apply
```

The runner accepts only localhost/loopback and database `bbtro`. It creates a
randomly named temporary validation database, copies parent table definitions
(without real data), applies the migration there and tests synthetic fixtures.
The temporary database is removed afterwards. This requires local CREATE/DROP
DATABASE privileges. Test rows are never inserted in the real `bbtro` database.

Before/after reports store counts, schema hashes and row hashes for existing
training tables, staff/CLI masters and holidays. No personal rows are included.
The runner holds a named migration lock and stops if legacy data changes during
validation. Run while local training edits are idle.

A repeated apply succeeds only when all 19 table definitions match exactly.
Partial installations and schema differences stop execution for inspection.
Reports are written to `docs/training-centre-migration-<timestamp>.json`.

## Recovery

MySQL DDL implicitly commits; SQL ROLLBACK cannot undo CREATE TABLE.
If a create fails, inspect the report and SHOW CREATE TABLE before retrying.
The migration runner will reject a partial installation.

If all newly created tables are empty and no application has adopted them, an
explicitly authorised recovery can drop only the newly created tables in reverse
order from the migration file, then rerun. Do not disable foreign key checks.
Do not drop tables containing trainee data. Retain a data backup and prepare a
forward correction instead. No automatic destructive rollback is supplied.

## Still required in later steps

This is storage infrastructure, not a completed workflow. The application must:

- Enforce office/centre permissions and verify existing letter/calendar centre
  ownership when attaching workflow/settings rows.
- Lock letter and nominee rows in the same transaction as acceptance or edits;
  accepted records must not be replaced by the legacy delete/reinsert path.
- Treat rule versions, submitted snapshots, completion events and audit rows as
  append-only; audit every later edit to attendance, results and identity data.
- Validate repeat attempts belong to the same person and have a fresh nomination.
- Validate marks against the referenced maxima/pass thresholds and course rules.
- Confirm completion only after accepted attendance/assessment checks; verify
  dates against the attempt and serialize completion corrections by locking it.
- Validate the correction chain uses the immediately preceding revision.
- Calculate each due date from the confirmed course rule, including Promotion's
  two effects. One-time courses have no renewal rows.
- Validate completion targets against the attempt's rule and legacy record links
  against the actual staff identity, qualification and completion date.
- Keep CLI/TM completion history independent of staff-master FKs; bridge only real
  staff-master trainees to legacy training records, preserving later valid events.
- Seed approved course rules and offerings in step 6. Assessment thresholds,
  centre print formats and batch naming are not invented here.

Browser workflow verification belongs to the later API/UI implementation; these
steps change schema and tooling only.

## Local execution result — 15 September 2026

- Worktree: `/Users/neeraja/bbtro-training-centre`; branch: `codex/training-centre`; base: `1b0ced1210dfbe95979065e5fb3208a315607a79` (`origin/master`).
- Applied successfully to local `bbtro` on MySQL 8.1.0. All 19 new tables are empty.
- All 28 scratch fixture/constraint checks passed. Exact-schema replay passed without recreating tables.
- Counts, row hashes and schema hashes match before/after for all 10 inspected legacy tables.

| Existing table | Rows preserved |
|---|---:|
| `div_staff_master` | 3697 |
| `div_cli_master` | 145 |
| `div_training_centers` | 6 |
| `div_training_types` | 26 |
| `div_training_letters` | 2 |
| `div_training_letter_staff` | 27 |
| `div_training_calendar` | 3 |
| `div_training_records` | 10288 |
| `div_training_batch_sequences` | 15 |
| `holidays_list` | 12 |

Evidence: `training-centre-migration-1789448729600.json` (verify), `training-centre-migration-1789448789228.json` (apply), and `training-centre-migration-1789448805978.json` (replay). Reports contain hashes/counts, not personal data.

No application routes, production database, commits, pushes or server processes were changed. Next: step 5, trainee registration and lookup.
