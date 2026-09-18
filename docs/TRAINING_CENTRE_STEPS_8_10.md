# Training Centre — Steps 8 to 10

Implemented locally on branch `codex/training-centre`.

## Step 8 — Refresher planning

- Plan only courses whose active centre offering enables advance planning.
- Record batch code, start date, computed working-day end date, capacity and remarks.
- Record suggested seats by lobby. Their total cannot exceed capacity.
- Lobby users can view current plans and their suggested seats. The allocation is expressly advisory and does not block flexible acceptance by the centre.
- Changes to a planned batch require a reason and create an audit event.

## Step 9 — Attendance and assessment

- Start one attempt only for an individually accepted nominee.
- Optionally attach the trainee to a matching planned or ongoing batch.
- Record daily attendance as present, absent or leave; corrections retain an audit trail.
- Sundays and centre holidays cannot receive attendance.
- Record every assessment sitting. Marks determine pass or fail from the versioned course rule; absence is retained separately.
- Re-examinations increment `exam_no`; earlier results remain unchanged.
- Failed, repeat-required and withdrawn outcomes require a reason.

## Step 10 — Completion, renewal and correction

- Completion is a deliberate centre action and requires a unique request key.
- The API checks expected course end, complete daily attendance and the latest result for every required assessment.
- A one-day course requires presence. A longer course permits at most two absent/leave days; beyond that the trainee requires a repeat course.
- Each configured renewal is calculated from the confirmed individual completion date.
- Only staff-master trainees create or update legacy `div_training_records`. CLI and manually entered Train Managers remain in the Training Centre register and completion tables.
- Promotion courses can create both configured renewals independently. Courses without renewal targets create no legacy training record.
- A correction requires a reason and creates a new immutable completion revision. It preserves the original event, links to the same legacy record, updates that exact record, and writes before/after audit data.

## Verification

Run:

```bash
PLAYWRIGHT_MODULE=/Users/neeraja/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node scripts/test-training-centre-operations.js
```

The test creates and drops a temporary local database. It covers refresher planning and lobby visibility, accepted joining, attendance, failed assessment, re-examination, idempotent completion, renewal, correction history and authenticated browser rendering.

Result: `docs/TRAINING_CENTRE_STEPS_8_10_TEST_RESULT.json`.

