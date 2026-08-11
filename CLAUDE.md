# Project Memory - BBTRO

## Local Database Credentials
- **Database**: bbtro
- **User**: jay
- **Password**: 4310jay
- **Host**: localhost (default)

### Quick Commands
```bash
# Connect to MySQL
mysql -u jay -p4310jay bbtro

# Run SQL file
mysql -u jay -p4310jay bbtro < sql/filename.sql
```

## Server Details
- **Host**: 93.127.198.125
- **User**: railway

### Quick Commands
```bash
# SCP file to server
scp /path/to/file railway@93.127.198.125:/path/to/destination/

# SSH to server
ssh railway@93.127.198.125
```

## Project Info
- Division portal for railway operations (BB Division)
- Node.js + Express backend
- MySQL database
- Frontend: Static HTML with vanilla JS

## Training Letters Module

### Tables
- `div_training_types` - Master list (training_id, training_code, training_name)
- `div_training_records` - Actual training history (staff_hrms_id, training_id, done_date)
- `div_training_letters` - Letter metadata we create
- `div_training_letter_staff` - Staff assigned to each letter

### Course Type → Training ID Mapping
| Course Type | training_id | training_code | Notes |
|-------------|-------------|---------------|-------|
| ONE_DAY_INTENSIVE | 5 | AUTOMATIC | |
| REFRESHER | 26 | MMPRC | Official 3-year refresher |
| MEMU_INITIAL | 17 | MEMU | |
| MEMU_REFRESHER | 17 | MEMU | |
| OTHERS | null | - | Ad-hoc, no tracking |

### TODO / Notes
- **Training record update**: Do NOT update `div_training_records` when letter is prepared. Only update when training centre marks staff as "completed".
- **OTHERS type**: For informal refresher when staff completed training but hasn't worked on certain rakes for a while. Does NOT update `div_training_types` or `div_training_records`. User enters custom subject. Letter history only.

## Sunday / Holiday: trains.status and AC rakes

### trains.status
The **Sunday / nominated-holiday position of a leg** — not a general record
state. Read in exactly one place, `routes/wheelMovementRoutes.js`:
`else if (isSundayOrHoliday && train.status === 'cancelled')`.

- `cancelled` = this train does not run on Sundays/holidays
- `active` = it runs

`enum('active','cancelled') NOT NULL DEFAULT 'active'` since
`sql/2026-08-06_trains_sunday_status_lock.sql`. Before that it was a nullable
`varchar(20)`, and 87 legs were NULL because the detail-book revision INSERTs
omitted the column — a NULL counted as RUNNING, so Sunday wheel movement was
over-counted. **Always include `status` in a trains INSERT**, or rely on the
default knowing it means "runs on Sundays".

### How it maps to the detail book
- A train is `cancelled` exactly when the detail's **SUN / HOLIDAY** line names
  it **`CD`** — e.g. detail 482 `VVD 2/PLVD 1 CD, P/PNVL`.
- **`DO` means the CREW rests, NOT that the trains stop.** Across every detail
  whose SUN/HOLIDAY says DO: 234 legs active, **0 cancelled**. Do not infer leg
  status from a detail being DO.
- 229 details are MIXED (some legs run, some do not) versus 12 fully cancelled —
  which is why this is per-leg, not per-detail.

### AC is also day-dependent
Per BB/T/232/C/TT dated 13.01.2026 (`data/suburban-detail/ALL CONCERNED AC ON
HBR LINE 26JAN.pdf`): *"Services running on Sundays/nominated holidays will run
with Non AC Rake."* So AC is not a fixed property of a train:

```
is it AC today?  =  ac_service='AC' AND (NOT isSunHol OR ac_on_sun_hol=1)
```

`suburban_train_master.ac_on_sun_hol` is **nullable on purpose** — NULL means
"no order on file". The 78 pre-existing AC services are NULL because nothing
documents their Sunday rake; only the 28 covered by an order are set to 0.

### Three separate facts, none substituting for another
| Fact | Column | Grain |
|---|---|---|
| Does it run on Sun/Hol? | `trains.status` | per leg |
| Is it AC on a normal day? | `suburban_train_master.ac_service` | per train |
| Is it AC on Sun/Hol? | `suburban_train_master.ac_on_sun_hol` | per train |

Actual dated cancellations are separate again: `cancelled_trains` (train_number,
date) is an operational log of what happened, only ~72 dates populated, and it
does NOT encode the schedule — only 18 of 329 scheduled-cancelled trains overlap it.

## Relief Markers (R/T and R/B)

`R/T` = **Relief To** — this detail *gives* relief to the named detail: our crew
takes over at the leg's **start** station.
`R/B` = **Relieved By** — the named detail takes over from us, at the leg's **end**.
They are reciprocal: if A carries `R/T B` then B carries `R/B A`.

Stored as columns on `trains` (`rt_detail`, `rb_detail`), not in `remarks` —
see `sql/2026-08-04_relief_columns.sql`. `remarks` keeps only operational text
(`TO SDG`, `EX SDG`, `HALT ...`, `LPC WTG ...`).

### Rules (enforced, do not remove)
- **Only a working leg can carry relief.** A piloting crew are passengers
  travelling to work a train — they relieve nobody. Enforced by
  `trg_trains_relief_working_ins` / `_upd`, which **reject** the write
  (unlike the waiting triggers, which silently correct — a relief marker on a
  piloting leg means the entry is wrong, not untidy).
- **One R/T and one R/B per leg**, inherent in single columns.
- **Must name a real detail** — FK to `details.detail_number` (which is unique
  across all 767 and now carries `uq_details_detail_number`).

### Gotcha
The working-leg rule cannot be a CHECK constraint: MySQL rejects a column used
in CHECK when its FK has a referential action, and the FKs carry
`ON UPDATE CASCADE` (kept deliberately — details do get renumbered). Hence the
trigger.

### Coverage
Only 37 markers exist across 2,653 legs — the old book barely recorded relief.
The new detail book does, so a backfill is the thing that unblocks the relief
graph report. 13 of the 19 R/T markers currently have their reciprocal R/B; the
gaps are the backfill's to-do list.

## Waiting Details View (Spare Duties)

### What a "waiting" detail is
A **spare** duty: a whole detail with no train work — one leg named `WAITING`,
zero wheel movement, zero piloting, usually 8:00 (some 6:00) on round hours.
There are 40 (16 harbour, 24 mainline). Not to be confused with a standby
*gap inside* a working duty (e.g. 382's "LPC WTG UPTO 05:30 HRS"), which is
recorded as a **remark on the preceding leg**, never as a separate row.

### Migration (August 2026)
`waiting_details` was a standalone table duplicating sign-on/off/duty from
`details`, and wheel-movement + duty-hour calculations read it
(`routes/wheelMovementRoutes.js:153`, `server.js:827` — both read-only).
Revising a detail updated `details` only, so the calculations would silently
compute on stale times. Replaced with a **view**. See
`sql/2026-08-04_waiting_details_to_view.sql`.

- `waiting_details` — **VIEW** (derives from `details` + `trains`)
- `waiting_details_old` — **TABLE** (backup of original data)

### How a detail is marked spare
By the `WAITING` leg in `trains` — no `is_spare` column. The marker lives in
the same table the user edits, so marking a detail spare is just entering the
leg, not a checkbox that can be forgotten. It is a **positive** marker, so a
detail whose legs merely haven't been entered yet is not mistaken for spare.

### Enforcement (do not remove)
Two triggers on `trains` normalise the marker on every write path — UI, API,
bulk import or hand-written SQL:

```
trg_trains_waiting_norm_ins / trg_trains_waiting_norm_upd
  train_number = 'WAITING'  ->  forces train_type = 'waiting'
  train_type   = 'waiting'  ->  forces train_number = 'WAITING'
```

Whichever signal is given, the row ends up canonical on both columns. They
self-correct rather than erroring, so a bulk import is never aborted by one
row. This is why the view can trust `train_type='waiting'`.

### Gotcha
`office` is not a column on `details` — the view derives it from the
`detail_blocks` number ranges and maps `CSMT-SUB` -> `CSMT`. A detail outside
every block (the departmental dummies 410-412, 558, 999) would get a NULL
office.

### Rollback
```sql
DROP VIEW waiting_details;
RENAME TABLE waiting_details_old TO waiting_details;
DROP TRIGGER IF EXISTS trg_trains_waiting_norm_ins;
DROP TRIGGER IF EXISTS trg_trains_waiting_norm_upd;
```

## Motormen View (Suburban Portal)

### Background
The `motormen` table was originally a standalone table for suburban portal (wheel movement analysis, reassignment, etc.). It required manual sync with division data and often had stale/outdated records.

### Migration (April 2026)
Replaced the `motormen` table with a **view** that reads from `div_staff_master`. This ensures suburban portal always has current motormen data.

### Current Structure
- `motormen` - **VIEW** (points to div_staff_master)
- `motormen_old` - **TABLE** (backup of original data)

### View Definition
```sql
CREATE VIEW motormen AS
SELECT
    current_cms_id COLLATE utf8mb4_unicode_ci AS cmsid,
    name COLLATE utf8mb4_unicode_ci AS motorman_name,
    cug_number COLLATE utf8mb4_unicode_ci AS mobile_number,
    pf_number COLLATE utf8mb4_unicode_ci AS pf_number,
    hrms_id COLLATE utf8mb4_unicode_ci AS hrms_id,
    CASE
        WHEN current_office_code = 'CSMT-SUB' THEN 'CSMT'
        WHEN current_office_code = 'KYN-SUB' THEN 'KYN'
        WHEN current_office_code = 'PNVL-SUB' THEN 'PNVL'
    END COLLATE utf8mb4_unicode_ci AS office,
    'active' COLLATE utf8mb4_unicode_ci AS status,
    created_at
FROM div_staff_master
WHERE designation_id = 8
  AND current_office_code IN ('CSMT-SUB', 'KYN-SUB', 'PNVL-SUB')
  AND status = 'Active';
```

### Field Mapping
| motormen (view) | div_staff_master |
|-----------------|------------------|
| cmsid | current_cms_id |
| motorman_name | name |
| mobile_number | cug_number |
| pf_number | pf_number |
| hrms_id | hrms_id |
| office | current_office_code (mapped CSMT-SUB→CSMT, etc.) |
| status | Always 'active' (filtered) |
| created_at | created_at |

### Filters Applied
- `designation_id = 8` (motormen only)
- `current_office_code IN ('CSMT-SUB', 'KYN-SUB', 'PNVL-SUB')` (suburban only)
- `status = 'Active'` (active staff only)

### Benefits
- Auto-syncs when div_staff_master is updated
- No dual maintenance
- Transfers/retirements reflected automatically
- Single source of truth

### Used By
- Wheel Movement Analysis
- Detail Reassignment (JFO Console)
- Duty Roster features

### Rollback (if needed)
```sql
DROP VIEW motormen;
RENAME TABLE motormen_old TO motormen;
```

### Convert to Table (if needed later)
```sql
CREATE TABLE motormen_new AS SELECT * FROM motormen;
DROP VIEW motormen;
RENAME TABLE motormen_new TO motormen;
```

## Suburban Crew Ops (`/div/suburban/`)

The motormen detail-book module: Overview, Detail Book, Train Index, Reports.
**Not** `/div/detail-book.html` — that is the unrelated mainline goods Digital
Slate Jr-CC arrivals board, and the "Crew Operations" menu section belongs to it.
Suburban has its own menu section and is open to any division user.

### One dataset, derived twice from one file
```
GET /api/division/suburban/dataset   { blocks, details, legs, master, counts, warnings }
GET /api/division/suburban/summary   Overview only — no details, no legs
POST /api/division/suburban/refresh  drop the cache (division_admin)
```
Every page fetches the same payload and filters/sorts it in the browser — that is
what keeps search over 2,653 legs instant. `public/div/suburban/js/sub-derive.js`
is `require()`d by the server **and** `<script>`-loaded by the pages: block totals
are derived server-side, the train index client-side, and sharing one file is what
stops them drifting. It replaced `scripts/extract_train_index.js`, which had
already drifted.

### The cache is operational, not an optimisation
`lib/subCrew/cache.js` builds once (~25 ms), pre-gzips (782 KB → 71 KB) and serves
the buffer: 0 ms per request instead of ~20 ms re-compressing an identical body,
and no `compression` dependency. Single-flight, so four pages opened at once cause
one build. ETag hashes content with `generatedAt` excluded, so a TTL rebuild of
unchanged data keeps the browser's copy valid.

`server.js` does `app.disable('etag')` — **the route must set ETag itself** or
`req.fresh` is never true and 304 never fires.

### After any detail-book change
```
node scripts/classify_details.js --commit
node scripts/chain_details.js    --commit
POST /api/division/suburban/refresh      # or restart; TTL is 10 min
```
`cache.invalidate()` is the hook every future write endpoint must call. The TTL is
only a safety net for hand-run SQL, which the app cannot observe.

### Gotchas
- `express.static` runs `{index:false}`, so `/div/suburban/` needs the explicit
  redirect in `server.js` (placed after the `/div` guard, so it is session-gated).
- `suburban_train_master.normalized_train_number` is a **non-unique KEY**. `SQL_LEGS`
  joins via a `MIN(train_code)` subquery — without it one duplicate master row would
  fan out every leg of that train, silently inflating leg counts and wheel movement.
- Details in no block (410-412, 558, 999) have `office = null` and appear in no
  office report. That is by design but surfaces as a `warnings[]` banner rather
  than vanishing.
- Adding a page = one `SubShell.NAV` entry + one HTML file + one `page-*.js`.

## Git Workflow (branch-per-module)

`master` is the always-deployable trunk (it deploys to the server). Several modules
are built in parallel at different readiness levels (AWS, loco-link, signal-book,
control-office, training-letter, transfer-letter). Keep them from tangling:

- **master** = ready/deployable work only. Quick fixes and finished modules land here.
- **One branch per incomplete module**, branched off master: `feature/<module>`
  (e.g. `feature/signal-book`, `feature/training-letter`, `feature/control-office`).

### Rules
1. **One module per branch.** Before every commit, check `git branch --show-current`
   matches the module you're editing — switch first if not. Never mix modules in one branch.
2. **Stage only files belonging to the current module.** Review `git status --short` and
   `git diff` first. Do not use `git add .` or `git add -A` in a dirty worktree.
3. **Push with plain `git push`** (repo is set to `push.default=current`, so it pushes the
   CURRENT branch). NEVER run `git push origin master` from a feature branch — it silently
   pushes an unchanged master and strands your commits.
   For a new branch, `git push -u origin <branch>` may be used to record its upstream.
4. **Pull master only while master is checked out:** `git switch master && git pull --ff-only
   origin master`. Running `git pull origin master` on a feature branch updates that feature
   branch instead of the local master branch.
5. **Sync regularly:** on a feature branch run `git fetch && git rebase origin/master`.
   Rebase auto-drops commits already on master (patch-id), keeping the branch = "master + my WIP".
6. **Ship a module:** rebase it on master → `git switch master && git pull --ff-only origin
   master && git merge --ff-only
   feature/<module>` → `git push` → deploy → delete the branch.
7. Per-module DB changes: dated `sql/` files travel on the module's branch and deploy on merge
   (every DDL goes into a dated sql/ file).

### Repo git config (already set)
`push.default=current`, `pull.rebase=true`, `branch.autoSetupRebase=always`, `rerere.enabled=true`.

### Cleaning a branch that picked up other modules' commits
`git cherry -v master <branch>` lists unique (`+`) vs already-on-master (`-`) commits;
`git rebase origin/master` then drops the duplicates automatically.
