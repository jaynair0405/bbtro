# Suburban Crew Ops — roadmap

Where the module goes after the read-only pages went live (`/div/suburban`,
2026-08-11). Five items the user asked for, what already exists for each, and
what has to be built. Written 2026-08-11.

---

## The finding that reorders the list

**There is no motorman login, anywhere, in either realm.**

`users` (`bbtro_schema.sql:999`) has ~18 rows and is *office accounts*:
`username / password / role / office / realm`. The `motormen` view over
`div_staff_master` has **no password column and no link to `users`** — motormen
are data, not accounts.

Todos 3 and 5 are both *motorman-facing*, so neither can start until that is
solved. It is not a detail of those features; it is a prerequisite with its own
decisions (who issues the credential, what happens when a motorman transfers
office, what an office user may see on a motorman's behalf).

Second, smaller reorder: todo 4 is "done", but not in a state todos 3 and 5 can
safely build on. See P2.

---

## P1 — Motorman identity  *(prerequisite for 3 and 5)*

**Have:** office-account login only (`routes/authRoutes.js:25`, bcrypt with
plaintext-legacy upgrade). `motormen` view exposes `cmsid`, `hrms_id`,
`pf_number`, `cug_number`.

**Need:** a decision before any code.

- What is the credential? CMS id + PIN is the lowest-friction on a phone; HRMS
  id is the stable identity key the division side already uses; OTP to
  `cug_number` avoids passwords entirely but depends on an SMS route.
- Where does it live — extend `users` with a `motorman` realm, or a separate
  table? Extending `users` means every existing realm check keeps working.
- Transfers: `div_staff_master.current_office_code` moves; the login must follow
  it, and the suburban CMS↔office invariant (CSTS→CSMT-SUB etc.) already exists.
- Self-service password reset, or office-issued only?

**Consequence for the rest:** once a motorman session exists, `office` can come
from the session instead of the request body — which is what makes P2 and todo 5
trustworthy.

---

## P2 — Harden `duty_roster`  *(todo 4 is built, but leaky)*

**Have, and working:** `public/index.html:417` "Daily Duty Roster Management" →
three per-office cards → `POST /upload/roster` (`routes/uploadRoutes.js:110`,
CSV and XLSX) → `duty_roster` (`bbtro_schema.sql:583`). AUTO_INCREMENT is past
61,000, so it is genuinely in use. Read back via `GET /api/roster`
(`routes/rosterRoutes.js:8`).

**Three gaps that matter downstream:**

| Gap | Where | Why it blocks 3 / 5 |
|---|---|---|
| No `UNIQUE(date, detail_number, office)` | `bbtro_schema.sql:583` | Re-uploading a day silently duplicates every row. "Which detail am I on today?" then has more than one answer. |
| `office` is taken from the request body | `uploadRoutes.js:110`, client at `script.js:901` | The UI claims each office uploads only its own area (`index.html:471`); nothing enforces it. Todo 5 routes a request to "the office" — that needs a trustworthy source. |
| `motorman_id` is never populated | parser reads only col A/B (`uploadRoutes.js:127-135`) | Rows carry a free-text name. A motorman cannot be shown *his* roster without an id to match on. |

Fixing the third is the real work: names must be resolved to `cmsid`/`hrms_id`
at upload, with a review step for the ones that do not match.

---

## Todo 1 — Editing UI for details / trains / train master

**Have:**

- `POST/PUT/DELETE /api/schedules` (`routes/scheduleRoutes.js:88/199/233`) —
  `trains` only. The `SET` list at `:209` **omits `train_type`, `rt_detail`,
  `rb_detail`**.
- CSV importers `POST /upload/details` (upsert, but ignores `detail_type`,
  `next_detail_id`, `cycle_anchor`) and `POST /upload/trains` (plain INSERT — no
  dedupe, re-upload duplicates).
- **Both mounts are behind the generic session gate only** (`server.js:650`) —
  no realm or role check on schedule delete or the bulk uploads.

**Broken:** the suburban Edit button is a stub —
`public/script.js:680` says *"In a full implementation, you'd fetch individual
schedule details"*, opens an empty Add modal and sets `currentEditingId`, so the
PUT writes blank fields over a real row.

**Missing entirely:** any write path for `suburban_train_master` or
`detail_blocks`. `sql/2026-07-28_detail_blocks.sql:3` promises "Editable from UI
when a new detail book changes the ranges" — that UI does not exist.

**Build:** editors inside `/div/suburban` (admin-gated), covering `details`
(incl. the classification columns), `trains` (incl. `train_type` and relief),
`suburban_train_master`, `detail_blocks`. Every write **must** call
`cache.invalidate()` from `lib/subCrew/cache.js` or the pages serve stale data
for up to the TTL.

Fix or retire the suburban Edit stub in the same pass — leaving a button that
corrupts rows is worse than no button.

---

## Todo 2a — KMS / mileage

**Have: nothing on the suburban side.** `grep -iE "km|distance|mileage|chainage"`
over `bbtro_schema.sql` returns **zero hits for the entire file**. Nothing on
`details`, `trains` or `suburban_train_master`. `total_wheel_movement` is a
`varchar(10)` **duration**, not distance.

Two `km_from_csmt` columns exist elsewhere:

| Column | Where | State |
|---|---|---|
| `div_stations.km_from_csmt DECIMAL(6,2)` | `sql/2026-05-19_wtt_tables.sql:15` | **Right shape, completely empty** — no migration populates it. |
| `div_signals.km_from_csmt DECIMAL(8,3)` | `sql/phase1_migration.sql:28` | **Well populated**, actively used for ordering. But signal-post km, per signal, only for loaded sections. |

**Build:** populate `div_stations.km_from_csmt` — signals give a usable first
pass (signals carry `station_code`), but it is signal-post km, not station-centre
km, so it needs checking against the WTT or the book. Then per-leg
km = `|km(end_station) − km(start_station)|`, rolled up per detail.

**Decision needed:** store km on the leg, or derive it every time? Derived stays
correct when a station km is corrected; stored survives a station being renamed
or a leg pointing at a station with no km. Given the roster/mileage use is
financial-adjacent, stored-with-recompute is probably right.

---

## Todo 2b — R/T and R/B

**Mostly already done — this is a data-entry problem, not a schema one.**

`trains.rt_detail` / `rb_detail` exist with FKs to `details(detail_number)`
`ON UPDATE CASCADE ON DELETE SET NULL` (`sql/2026-08-04_relief_columns.sql:33`).
Only **~36 of 2,653 legs** are populated — the old book barely recorded relief.

Two jobs:

1. Expose them in the todo-1 editor. `PUT /api/schedules` cannot set them today.
2. **Verify the triggers are installed on prod.** `trg_trains_relief_working_ins`
   / `_upd` live in a *separate* file (`sql/2026-08-04_relief_triggers.sql`)
   because `CREATE TRIGGER` needs SUPER on a binlog-enabled server (ERROR 1419).
   Until they exist, the "only a working leg can carry relief" rule is
   unenforced, and the editor will happily write a marker onto a piloting leg.

---

## Todo 3 — Motorman daily entry

*Blocked on P1 (identity), P2 (trustworthy roster) and 2a (km).*

Gives the motorman: **(a)** his mileage, **(b)** whom he relieves (R/T) and who
relieves him (R/B), **(c)** his own history.

**Have: nothing comparable.** `public/control-office/daily-entry.html` is the
mainline **loco** link sheet behind `requireControlOffice`, not crew
self-service. The suburban realm is one SPA (`public/index.html`) with 8 tabs,
all supervisor/office-facing.

The only per-motorman-per-date row anywhere in the suburban realm is
`duty_roster` — **planned assignment only**: no actual times, no km, no
confirmation, nothing the motorman authored.

The division side has the shape worth copying: `div_detail_book_log`
(`sql/2026-02-24_digital_slate_schema.sql:12`) records a real sign-on/sign-off
with rest calculation, and `div_daily_slate` records live status. Both are
mainline and HRMS-keyed, so they are a **model, not a table to reuse**.

**Build:** a new actuals table (motorman × date × detail, with actual sign-on/off,
computed km, and a confirmed flag), plus a phone-shaped page. Note (b) is a pure
read off `trains.rt_detail`/`rb_detail` — so it only becomes useful once 2b's
backfill has happened.

---

## Todo 5 — Duty adjustment request

*Blocked on P1 and P2.*

**Have: two good models, both division realm.**

- **`div_transfer_requests`** (`bbtro_schema.sql:552`, routes in
  `routes/division/transferRoutes.js`) — the closest fit: two offices, an
  accept/reject pair, and the right idempotency pattern at `:336` — status guard
  in the `WHERE` clause plus `affectedRows === 0 → 404`. Also guards against a
  duplicate open request (`:95`).
- **`div_leave_tracking` + `div_leave_status_history`** — adds the audit trail:
  every status change written to a side table (`leaveRoutes.js:141`, `:1125`).

**Have, but it is not a workflow:** `reassignments` /
`reassignment_history` + `POST /api/jfo/reassignments`
(`routes/reassignmentRoutes.js:213`). A JFO supervisor writes the change
**directly and it is instantly effective** — no status, no requester/approver
split, `created_by` is the literal string `'JFO Supervisor'` (`:246`).
`is_active` is a soft delete, not a state.

Its **vocabulary is worth reusing** though: `reassignment_type` (10 values incl.
`motorman_swap`, `partial_vacation`, `detail_split`), `assignment_scope`
(`full`/`partial`), `displaced_action` (`mark_waiting`, `assign_to_relief`,
`assign_to_other`, `cancel_trains`).

**Build:** `suburban_duty_requests` shaped like `div_transfer_requests`, a
`_status_history` side table per the leave pattern, the reassignment vocabulary
as the payload, and — the open question — whether an approved request should
*write through* to `reassignment_history` so the JFO console keeps working, or
whether the two paths converge later.

---

## Suggested order

```
P1 identity ──┬──────────────► 3 daily entry ──► 5 duty request
P2 roster ────┘                     ▲
                                    │
1 editor ──► 2b relief capture ─────┤
        └──► 2a km ─────────────────┘
```

1 and 2 are independent of P1, so the editor and km work can run while the
identity decision is being made. 3 needs all four upstream. 5 needs 3's identity
and P2's office routing, but not km.

---

## Loose ends parked here

- `scripts/generate_suburban_train_master.js` and
  `apply_suburban_train_master.js` are still untracked. The generator hardcodes
  `/Users/neeraja/spm analysis app`, so it runs on one Mac only; the applier has
  a `jay/4310jay` fallback. Their **output** (`sql/2026-07-29_*.sql`) is already
  committed, so nothing is at risk — decide whether to track, make portable, or
  leave.
- `docs/STAFF_HRMS_ID_CORRECTION.md` has uncommitted edits in the worktree that
  predate 2026-08-11 and are not from this work.
- **42 of 56 `/div` pages have no way back to the portal**, AWS among them. The
  13 that do all use "← Dashboard".
- The Sunday dimension (`trains.status`, `suburban_train_master.ac_on_sun_hol`)
  is in **no** suburban payload, so no page shows which services do not run on a
  Sunday or revert to a non-AC rake.
