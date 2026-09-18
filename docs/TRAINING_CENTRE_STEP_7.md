# Training Centre — step 7

Completed locally on 15 September 2026 in `/Users/neeraja/bbtro-training-centre`, branch `codex/training-centre`.

## Letter workflow

The existing `/div/training-letter.html` address now serves the course-aware workflow screen. It retains the approved MTC CLA letter structure: office heading, number/date, addressee, subject, reporting instruction, trainee table, signature and copy endorsement. Recurring courses show Last Training and Due Date for each nominee; missing history reads `Not recorded`.

The screen uses the 11 configured MTC CLA courses and the trainee sources established in steps 5–6:

- Lobby letters can nominate active staff and CLI records belonging to that lobby.
- Training-centre letters can nominate active staff, CLI records and manually registered Train Managers.
- Train Manager letters use the Train Manager heading and preserve the required name, CMS ID, lobby and PF number; HRMS remains optional.
- Eligibility rules generate a warning for the centre. They do not block nomination.
- One-Day Automatic rejects Sundays and centre holidays.

Each submission stores a complete JSON snapshot of the letter and the displayed trainee identity/training dates. Historical versions are printable read-only records, so later master-data or course-rule changes do not rewrite an issued letter.

## Acceptance and returns

The Training Centre portal's Incoming Letters tab lists new workflow letters and supports decisions for each pending nominee:

- Accept and Return are nominee-level decisions.
- Return requires a reason.
- When every nominee is accepted, the letter becomes `accepted` and is fully locked.
- Mixed decisions produce `partly_accepted`. Letter wording, course and dates remain locked. Accepted and undecided nominees remain fixed; only returned nominee places can be removed and replaced.
- Resubmission creates another immutable letter version. It does not overwrite an earlier version or alter an accepted nominee.
- Concurrent/stale saves and decisions are rejected using the workflow revision.

Letter reads and writes enforce the submitting office or receiving centre. Division administrators select the intended office or centre explicitly. The old letter save, delete, attendance and completion endpoints reject new workflow letters, preventing them from bypassing acceptance or deleting version history. The legacy path also no longer silently replaces a letter merely because its date, office and course match.

## Verification

`scripts/test-training-letter-workflow.js` uses a temporary local MySQL database, the real login and route code, and synthetic users, trainees and letters. It verifies:

- Centre-created manual Train Manager letter with optional HRMS.
- Office and centre isolation.
- Protection from legacy save/delete/attendance paths.
- Full acceptance and accepted-letter locking.
- Partial acceptance, returned-nominee replacement and accepted-nominee preservation.
- Version 1 remains reproducible after version 2 is submitted.
- Duplicate letter numbers, repeat decisions and stale revisions are rejected.
- Authenticated Chrome lobby search/add/submit/print preview and centre return decision.
- Desktop and mobile rendering without page errors or horizontal page overflow.

Evidence is recorded in `TRAINING_CENTRE_STEP_7_TEST_RESULT.json` and screenshots under `training-centre-verification/`.

The temporary database was removed. The real local database retains zero workflow letters, versions, nominees and attempts. Row counts and hashes still match the saved baseline for 10,288 training records, two legacy letters, 27 legacy nominees, 3,697 staff, 145 CLI records and 12 wheel-movement holidays.

## Remaining scope

Step 8 will extend refresher planning with capacity and flexible lobby allocations. Daily attendance, assessment results, completion, renewal writes and correction history remain steps 9–10. Existing legacy letters continue through their earlier screens; this step does not convert or reinterpret them.

No commit, push, production deployment or server restart was performed.
