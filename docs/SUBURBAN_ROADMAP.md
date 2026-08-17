# Suburban Crew Ops — roadmap

Where the module goes after the read-only pages went live (`/div/suburban`,
2026-08-11). Five items the user asked for, what already exists for each, and
what has to be built. Written 2026-08-11.

---

## Detail-book data correction — DONE 2026-08-17, both databases

Building reports surfaced a class of errors in the book itself, so the reports
were held until the data was right. 34 details corrected, verified on prod as
well as local.

| Check | Before | After |
|---|---|---|
| Wheel-movement drift > 15 min | 33 | **1** (999 only) |
| Working-vs-working overlaps | 13 | **0** |
| Wheel movement > duty (impossible) | 1 | **0** |
| Leg starts after sign-off | 1 | **0** |
| R/T · R/B markers | 19 · 18 | **59 · 62** |
| Markers on non-working legs | 0 | **0** |

Five migrations, run in order because 4 depends on 1:
`sql/2026-08-14_plgn_gnpl_handover_correction` · `_wheel_movement_header_fixes` ·
`_pnvl_trans_harbour_correction` · `_gnpl10_detail_400` ·
`sql/2026-08-17_drift_tail_corrections`.

**The main fault.** The Panvel–Goregaon services (`PLGN*` down, `GNPL*` up) run
via VDLR and the crew changes there. One side of each handover was recorded as
the *whole train run*, almost always ending "CSMT" — a station those trains never
reach. 22 legs across 16 details.

**Six fault types**, which matter for todo 1 — the editor should make each hard
to create:

1. untrimmed handovers (22 legs) · 2. transposed headers (309/310's wheel
movements swapped) · 3. hours-digit typos (220, 286, 276, 491) · 4. compressed
leg times (453's four legs all cut to ~18 min) · 5. piloting typed as working
(461's `P/TPL50`) · 6. single wrong arrival (79, 88, 500)

**Why the verification is trustworthy.** The book prints SIGN ON/OFF, DUTY, KMS
and NDH — **not** wheel movement. `total_wheel_movement` is derived, which is
exactly what makes it a good check: every corrected detail's legs now sum to its
stored figure to the minute, and piloting matched too wherever it applied. 400's
fix was *predicted* from the arithmetic before its book page was read, and the
book then gave exactly that.

**Two things only prod could show:**

- The **`TPL50` overlap** between 461 and 523 was invisible locally, because
  local's copy was corrupted to `T/TPL50` and the overlap query only normalises
  a `P/` prefix. A local corruption was masking a real conflict.
- **999 is the last divergence** — prod holds a real 180-minute leg where local
  holds a `MUCK SPL` placeholder at 00:00. Needs the book page.

**Audit false positives — keep excluding these**, all of which cost a wrong
conclusion first time round:

- `train_type='waiting'` and `start_time = end_time` — 43 placeholder legs.
  Detail 513's −480 min was entirely this.
- `ER%` and `MUCK SPL` are generic labels, not train numbers. `ER KYN` is 12 legs
  at 12 different times over 3 routes.
- Piloting-vs-working overlaps are normal — that is what piloting *is*. Only
  working-vs-working counts.
- Contiguous handovers are correct: `A13` CSMT→KYN then KYN→ABH is two crews on
  one train.

**Still open:** the relief backlog (99 of 2,064 working legs carry a marker;
36 R/T and 39 R/B lack their reciprocal), 23 triples with no `cycle_anchor`,
177→191 chained across a block boundary, 867-870 classified `single` when they
are doubles, and 999.

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

**Source of truth found: `data/detail_book/suburban_mileage.xlsx`** — a
motorman's own kilometreage/pay workbook. It settles both the data and the rules,
and it invalidates the plan that was here before.

### It is real distance, floored — not a flat allowance

Two corrections, in order, because the first read of the data was misleading.

**The raw numbers look like an allowance:** 554 of 781 details (71%) are exactly
150 km, details at km = 150 range from 49 minutes to 8 hours of wheel movement,
and km correlates with running time at only 0.565.

**But the base really is distance.** Confirmed against the DB on two details the
user worked through:

| Detail | Working legs | Actual | Sheet |
|---|---|---|---|
| 871 | K 100 KYN→CSMT (53) + N 31 CSMT→KSRA (121) | 174 | 174 |
| 872 | N 8 KSRA→KYN (68) — under the minimum | 120 | 120 |

So:

> **base km = MAX( Σ km over WORKING legs , floor )**

Piloting legs do not count — a piloting crew are passengers. The 71%-at-150 is
the floor showing through: most suburban details run under 150 km with a duty
over 4h59m, so 150 is what gets credited.

`DATA.km` is therefore the **credited km for a normal day**, already floored.
The daily rules re-apply the floor against the hours *actually* worked, which can
differ (lateness, a detail cut short).

**We do not compute any of this.** Per the user: the km is printed in the
official detail book, exactly like duty / wheel / piloting. It is authored data —
loaded once from the book (the Excel `DATA` sheet mirrors it), and re-entered by
hand from the new page whenever the book is revised. The arithmetic above is
recorded only so the loaded values can be sanity-checked, and so the daily
floor rule can be applied to actual hours at entry time.

So **no station-distance table is needed**. `div_stations.km_from_csmt` (empty)
and `div_signals.km_from_csmt` (populated, signal-post km) stay out of this
feature. The known chain — CSMT 0 · KYN 53 · KSRA 121 — is useful only as a
spot-check.

### The rules, extracted from the formulas

No macros — plain `.xlsx` formulas. The live rule is `MILEAGE!AG13`
(and `MSP!AG13`, identical), where `AE13` is hours on duty in H.MM decimal:

```
IF(AE13>4.59, 150, IF(AND(AE13>3.59, AE13<5), 130, 120))
```

`DTL!Y1` shows the floor only ever raises, never lowers:

> **credited km = MAX(detail's base km, duty-hour floor)**

**The book value is the CREDITED figure — already floored.** Settled by two
details whose actual distance is well under what they draw:

| Detail | Duty | Actual over working legs | Book |
|---|---|---|---|
| 859 | 5:10 | KYN→CSMT 53 + CSMT→KYN 53 = **106** | **150** |
| 872 | 2:07 | KSRA→KYN = **68** | **120** |

Both are floored, at the >4h59m and <3h59m bands respectively. Also confirmed on
three short D2 halves — 138 (2:43), 635 (3:14), 147 (3:54) — all at 120.

**The workbook is authoritative.** Staff fill it in and submit their monthly
mileage from it, so its `DATA` values are the figures actually being claimed.

Consequence for daily entry: since the stored value is already floored for a
normal day, re-applying the floor is a no-op on a normal day and only ever
*raises* — when the hours actually worked exceed the rostered ones. It can never
reduce a motorman below his book value.

**But the floor applies only to duties that work trains**; spare and
departmental duties use a rate per hour instead (below).

`DTL!T4` applies duty-type overrides *before* any of that:

| Duty type | Km |
|---|---|
| `TRG.`, `LRD` | 120 |
| Outstation — `PME OS`, `TRG OS`, `MTC OS`, `SPLCL`, `ENQ OS`, `DC`, `POLICE ENQ`, suffix `" OS"` | 160 |
| `APL`, `CL`, `SL`, `REST`, `A/O`, `PME HQ`, `ENQ HQ`, `SICK`, suffix `" HQ"` | none (blank) |
| Manual entry in the Km column | wins over everything |
| otherwise | detail base km, then the floor |

### The data

`DATA` sheet = per-detail base km, 781 rows, all three offices:

| | |
|---|---|
| DB details | 767 |
| Excel details with km | 781 |
| match on detail number | **763** |
| sign-on/off places agree | **750 of 763 (98.3%)** |

Base km values: 90–242, clustered at 150. 27 details carry 200/206/242 — the
long runs, mostly KYN. **242 is correct** for CSMT-KSRA-CSMT (121 × 2); the 243
quoted earlier was a typo.

### Three kinds of detail the `details` table does not hold

**1. MEMU (901-912) — they exist, in a parallel subsystem.**

Block 6 "KYN Mainline MEMU" shows 0 rows in `details`, but the details are real
and live in their own schema, built Aug 2025:

| Table | Rows | Grain |
|---|---|---|
| `memu_details` | 11 | 901-904, 906-912 — 905 correctly absent, it does not exist (the workbook's `905 = 120` is stale) |
| `memu_day_patterns` | 27 | per detail × day type, each with its own sign-on/off, duty hours, wheel movement, piloting |
| `memu_trains` | 66 | legs, per pattern |

The separation is justified: `day_type` is an ENUM of
`monday_friday / monday_thursday / friday / saturday / sunday / saturday_sunday /
monday_saturday`, and the times, legs and duty hours genuinely differ per day.
`details` has **no day dimension** — one row is one fixed duty — so these cannot
be folded in as they stand.

**Consequence for km: MEMU mileage is per DAY PATTERN, not per detail**, because
the hours floor is driven by that day's duty hours. Applying the rule to
`memu_day_patterns.total_duty_hours` reproduces the user's figures exactly:

| Detail | Pattern | Duty | Floor |
|---|---|---|---|
| 901-907, 911, 912 | Mon-Sat / Mon-Fri | 5:00 – 10:17 | 150 |
| **910** | Mon-Fri | **04:12** | **130** |
| 908 | Sunday | 04:00 | 130 |
| 909 | Sunday | 04:25 | 130 |
| 908, 909, 910 | Saturday (no duty) | 00:00 | 120 |

That also reconciles the workbook: its `908 = 130` is the **Sunday** value, not a
mistake. So km belongs on `memu_day_patterns`, not on a single detail row. No
`memu_*` table has a km column today.

**2. Duties that work no trains — a rate per hour, not a book value.**

Two classes, both computed rather than authored, and the duty-hour floor does
**not** apply to either.

*Spare / WAITING duties — 15 km per hour.* Verified exhaustively: all 40 waiting
details in `details` split exactly by duty hours, with no exceptions.

| Duty | Count | Km | |
|---|---|---|---|
| 6:00 | 8 | **90** | 47, 114, 298, 337, 457, 655, 690, 743 |
| 8:00 | 32 | **120** | the rest |

6 × 15 = 90, 8 × 15 = 120. Detail 114 is the proof the floor is inapplicable: 6
hours of duty is well over 4h59m, yet it draws 90, not 150.

*Departmental (412, 558, 999) — 20 km per hour.* Not in the official book at all.
Per the user: 20 km per hour of duty; **120** if no work is performed (not
booked), minimum **150** if worked. All three carry duty 08:00 and wheel movement
03:00, so they are worked: 20 × 8 = **160**.

**3. Genuinely unaccounted for.**

- **1001–1007** — seven PNVL details (incl. PNVL→BEPR) in **no** `detail_blocks`
  range. A new block is needed if they are current.
- **385** — sits in the gap between CSMT Harbour Continuous (201-384) and
  Fix (386-404).
- **556 — DEFERRED, needs its own inspection.** It is the MEMU Pen–DW detail and
  the DB legs are right (`P/61018 PNVL→DW`, `DWPEN61019 DW→PEN`,
  `PENDW61026 PEN→DW`, `P/61013 DW→PNVL`). The apparent contradiction with the
  floor rule — 130 km against a duty of 8:10 — is not a rule problem at all:
  **556 has two sign-on/sign-off pairs inside one detail**, and the two parts are
  split between the PNVL and KYN lobbies and worked by **two different staff**,
  each drawing 130. So the 8:10 is the whole detail while 130 is one part's
  mileage.

  This is a shape `details` cannot represent — one row, one sign-on, one
  sign-off, one crew. Worth its own look later, together with whether any other
  detail is split this way.
- **911, 912** — present in `memu_details` but not in the workbook; the user
  recalls them from an earlier printed book. To confirm.

### Build

Km is **authored for duties that work trains, computed for those that do not**:

| Class | Where km comes from |
|---|---|
| Ordinary details | `details.km SMALLINT NULL`, loaded with the 763 book values |
| MEMU 901-912 | `memu_day_patterns.km SMALLINT NULL` — per day pattern, since hours and therefore the floor vary by day |
| Spare / WAITING (40) | computed: **15 × duty hours** (90 @ 6h, 120 @ 8h) |
| Departmental (412, 558, 999) | computed: **20 × duty hours**, 120 unbooked / min 150 worked |

Expose the two authored columns in the todo-1 editor beside duty / wheel /
piloting, so a book revision updates km the same way it updates those. Apply the
duty-type overrides and the hours floor at **daily-entry** time (todo 3) against
the hours actually worked — and skip the floor for the two computed classes.

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

**The form is already designed.** `suburban_mileage.xlsx`, sheet `MILEAGE`, is
the T.432-B claim the motormen already fill, and its per-day columns are exactly
this feature's fields:

> Date · Detail No · On duty (time + station) · Off duty (time + station) ·
> Actual Details · R/Room Allowance Kms · Total Kms · NDA Hrs · Total Hrs on
> duty · N.D.A · N.H.P · Remarks

Two things fall out of that:

- **"Actual Details"** is a column, i.e. the motorman already records that he
  worked something other than his rostered detail — which is todo 5's case,
  captured after the fact rather than as a request.
- Duty codes are defined on the `DATA` sheet: `M` morning, `E` evening,
  `T` night, `D1`/`D2` double first/second part, with the note *"D2 entry is
  mandatory to assign RR in detail book"*.

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
