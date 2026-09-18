# Training Centre — steps 5 and 6

Completed locally on 15 September 2026 in `/Users/neeraja/bbtro-training-centre`, branch `codex/training-centre`.

## Available now

The existing Training Centre portal has two additional tabs:

- **Trainee Register:** active staff and CLI master lookup, centre registration,
  manual Train Manager entry, duplicate review/reuse, search and pagination.
  TM requires name, CMS ID, lobby and PF number; HRMS ID is optional. Master
  lookups are read-only and register displays refresh names/identifiers from them.
- **Courses & Holidays:** all 11 approved MTC CLA courses, durations, eligibility,
  reporting time, planning flags and renewal effects. Centre administrators can
  configure written/oral assessment components, maximum/pass marks and holidays.
  Course date estimates exclude Sundays and centre holidays. Automatic cannot
  start on either. Due dates use calendar validity minus one day.

Assessment changes create a new rule version and preserve earlier settings.
A reason and audit record accompany configuration changes and holiday removal.
Empty assessment configuration is shown explicitly; an explicit centre decision
is required to set a course as requiring no assessment.

Only Motorman and MEMU Refresher have advance-planning flags. Promotion has
48 MTC working days plus 12 subsequent handling days and two renewal effects.
CLI and Harbour-to-Main-Line conversion are one-time courses.

No additional courses or formats were seeded for MTC KYN or DTC KYN.

## Local database

`sql/2026-09-15_training_centre_registry.sql` adds centre membership for shared
trainee identities. The existing foundation migration remains unchanged.
`node scripts/setup-training-centre.js --apply` applies this table and seeds
approved settings from `lib/trainingCentreCourses.js`. It only permits local
`bbtro`. Seed replay retains existing course configuration rather than replacing it.

Applied results: 11 courses, 5 renewal targets, 11 initial rule versions and
11 MTC CLA offerings. The real local registry, assessment definitions and centre
holidays remain empty. No synthetic fixtures were inserted there. Existing staff,
CLI, letters, training history and wheel-movement holidays were hash-verified
unchanged. See `TRAINING_CENTRE_SETUP_RESULT.json`.

## Files and API integration

The parent `trainingCentreRoutes.js` mounts `trainingCentreManageRoutes.js` under
`/api/division/training-centre/manage`. Centre users are scoped to their session's
centre; division administrators must select a valid centre. Office-HR users and
unauthenticated requests are rejected.

| Endpoint | Purpose |
|---|---|
| GET `/lookup` | Search active staff/CLI master |
| GET/POST `/trainees` | Centre register and registration |
| POST `/trainees/link` | Explicitly reuse an existing manual TM identity |
| GET `/courses` | Current offerings, rules, renewal effects and assessments |
| POST `/courses/:ruleId/assessments` | Audited, versioned assessment configuration |
| GET/POST `/holidays` | Centre-specific holidays |
| DELETE `/holidays/:date` | Audited removal with reason |
| GET `/courses/:ruleId/preview` | Estimated completion and renewal dates |

Centre register membership controls list visibility. Master searches are available
to authorised training-centre users so incoming staff can be registered. Register
writes are serialized and transactional to prevent duplicate registrations.
Matching manual CMS/PF identifiers with conflicting details require explicit
review/reuse; records are not silently merged or overwritten.

## Verification

- `node --test tests/training-centre-dates.test.js`: four passing tests covering
  agreed examples, leap-day/month-end clamping, working days and invalid input.
- `scripts/test-training-centre-manage.js`: temporary local MySQL database with
  synthetic users and trainees, using the real login route and centre router.
  Covers access restrictions, centre isolation, concurrent duplicate registration,
  source-authoritative fields, seed replay, holidays, date previews, invalid
  marks, version preservation and stale-update rejection.
- Authenticated Chrome checks: TM registration/reload, HTML escaping, CLI
  search/reuse, numeric and no-assessment configuration, holiday save/reload,
  division-admin centre switching, and desktop/mobile layouts. No page errors
  or mobile page overflow. Screenshots visually reviewed.
- Test database was dropped; no test trainees, marks or holidays remain in local
  `bbtro`. Result: `TRAINING_CENTRE_MANAGE_TEST_RESULT.json`.

Screenshots under `training-centre-verification/` show **synthetic test data**,
including example assessment marks. Those marks are not production or local
course defaults.

To run the integration check, make Playwright available with `PLAYWRIGHT_MODULE`
(or install it in the development environment). `CHROME_PATH` optionally selects
Chrome; the script defaults to the installed macOS Google Chrome binary.

## Remaining scope

Step 7 will connect these trainees and course rules to nomination letters,
acceptance, returns and edit locking. Existing letters and completion APIs still
use the legacy workflow. Registration alone does not create a training attempt
or change a qualification/due date. Attendance, assessment results, completion
and reports remain the later agreed steps.

No commit, push, production deployment or existing-server restart was performed.
The code is in the isolated worktree; an existing server from another checkout
will not show these tabs until this worktree is run.
