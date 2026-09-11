# Control Office — module reference

> **What this is.** The single pick-up-anywhere record of the Control Office module,
> so a fresh chat can resume with no context loss. It replaces and merges three
> earlier docs — `CONTROL_OFFICE_WTT_HANDOVER.md`, `LOCO_AVAILABILITY_AND_ASSIGNMENT.md`
> and `LOCO_MANAGEMENT_HANDOVER.md` — which were deleted in the same commit.
> Where those docs had gone stale, this one records what is actually true today;
> those corrections are called out inline.
>
> Verified against `origin/master` and production on **2026-09-11**.

---

## 0. TL;DR — the state today

- The module is **live on prod** (`railway@93.127.198.125`, app at `/home/railway/bbtro`).
- Backend is one file: **`routes/division/locoLinkRoutes.js`**, 5,486 lines, 66 endpoints,
  mounted at `/api/division/loco-link`.
- Frontend is 15 standalone vanilla-JS pages under `public/control-office/`.
- Everything from the 2026-08/09 work is deployed and verified: rake type moved to the
  train, the sick-loco report partition, the suggested-sheet fix, and the two board changes.

**Two live defects recorded here and not yet fixed** — see §11: six pages are served
without a login, and eight DR-originating workings may sit on the wrong board.

---

## 1. The pages

Served from `public/control-office/`. Static assets (`img/`) come from the global
`express.static('public')`.

| Page | What it is |
|---|---|
| `index.html` | Control Office dashboard — cards to everything below |
| `daily-entry.html` | **LPC daily sheet** — per-sheet loco-link entry (CSMT-UP/DN, LTT-UP/DN, KR-UP/DN, PNVL-UP/DN, BYPASS). Loco highlight, search, rake tag |
| `loco-assign.html` | **Loco Assignment Board** — loco-first inverse of the sheet (§6) |
| `loco-availability.html` | Where locos are now; badge names the train + date |
| `loco-management.html` | Loco-master admin over `div_locos` (§7) |
| `sick-locos.html` | Live sick-loco sheet — mark sick/fit, inline edit, COG/GOODS blocks |
| `sick-report.html` | Historical sick report, partitioned COG/GOODS (§8) |
| `defect-reports.html` | Defect tracking by category / severity / status |
| `hog-position.html` | HOG availability position |
| `schedule-due.html` | Loco maintenance schedules falling due |
| `consolidated-sheet.html` | Consolidated daily view |
| `print-all.html` | Bulk print |
| `reports.html` | Mis-link report (zone-only / zone+shed / loco-type tiers) + others |
| `settings.html` | Admin: Scheduled Specials, Trains, Loco Link and Coach Types (§9) |
| `wtt.html` | **Working Time Table** — separate dark "night-platform" theme, for *all* staff (§5) |

### Access gates

`requireControlOffice` (`server.js:259`) requires `realm='division'` and
`div_role ∈ {lpc, division_admin, ctlc, ctlc_view, ssehq}`.

**Every page has an explicit `app.get` wired to it** (`server.js`, after the
`requireControlOffice` definition). Two narrow further inside the gate:
`consolidated-sheet` to division_admin/ctlc/ctlc_view, and `settings` to
division_admin/ctlc — the same two roles the dashboard shows the Settings tile
to and `requireSettingsRole` accepts writes from. `wtt` is the odd one out: any
logged-in user, any realm.

History: until 2026-09-11 six pages (`settings`, `loco-management`,
`defect-reports`, `loco-availability`, `sick-report`, `print-all`) had no route
and fell through to `express.static`, loading for anyone. No data leaked — every
API refused anonymously — but the page shells, field names and endpoint URLs
were exposed, and `settings.html` is the admin surface. Fixed with six routes
mirroring the existing ones. **When adding a page, add its route** — the global
`express.static` at the bottom of `server.js` will otherwise serve it open.

---

## 2. Roles

| Role | Control Office |
|---|---|
| `lpc` | full working access — the daily sheet is its home |
| `ctlc` | full, plus Settings mutations (`requireSettingsRole`) |
| `division_admin` | full, plus Settings mutations |
| `ctlc_view` | **read-only** — every non-GET to loco-link returns 403 |
| `ssehq` | **read-only**, same guard |
| `trip_shed_operator`, `trip_shed_supervisor` | **read-only**, same guard (no users yet) |

The read-only guard is one middleware at `locoLinkRoutes.js:28`:

```js
const VIEW_ONLY_DIV_ROLES = ['ctlc_view', 'ssehq', 'trip_shed_operator', 'trip_shed_supervisor'];
```

It backstops **every** write endpoint below it, including ones that only check "logged
in" — so a view-only account is read-only no matter which route it hits. Do not remove it;
`server.js:888` documents the SSE-HQ desk as relying on exactly this
("enforces ssehq as VIEW-ONLY itself"), and the `ssehq` entry was missing from this list
for a while, so that promise was not actually kept until commit `15fe6a2`.

**SSE-HQ specifically** is gated in four layers: `SSEHQ_PAGES` (its own pages),
`server.js:263` (may open Control Office pages), `SSEHQ_API` (`:907`, API limited to
`/ssehq`, `/documents`, `/loco-link`), and the view-only guard above.

---

## 3. Data model — the `train_id` spine

Migrated from train-**number** keys to a stable **`train_id`** so renumbering doesn't
break history.

| Table | Role |
|---|---|
| `div_trains` | Train identity: `train_id` (PK), `train_no`, `train_name`, `train_type` enum(Express/Superfast/Mail/Passenger/Suburban/Special/Goods), `direction`, `run_days`, `traction_type`, **`rake_type`**, `from_station`, `to_station`, `loco_change_station`, `is_regular`, `is_active` |
| `div_train_aliases` | Renumber-safe identity `(train_id, train_no, valid_from, valid_until)` — the train keeps its `train_id` across number changes |
| `div_train_stops` | WTT halts: `train_id, seq_order, station_code, arrival_time, departure_time, event_type enum('halt','pass_or_depart','arrive_or_pass'), day_offset, direction, segment_id, platform_no` |
| `div_loco_link_master` | The **workings** — one row per sheet appearance: `sheet_source, mirror_sheet, section, direction, from_station, to_station, event_time, expected_loco_type, accepted_loco_types, shed_code, link_attr, rake_type, expected_hog, is_push_pull, run_days, active, effective_from, effective_until, skip_dates, is_scheduled_special` |
| `div_loco_link_log` | What actually happened, per `working_date` + `master_id` |
| `div_locos` | Loco master, 13,792 rows (§7) |
| `div_loco_positions`, `div_loco_position_history` | Where locos are (§6.5 — unreliable) |
| `div_loco_sick_records`, `div_loco_defects` | Sick / defect tracking (§8) |
| `div_loco_transfers` | Loco transfer + status audit (exists — the old brief said it must be created) |

**Helper:** `resolveTrainByNo()` — alias-aware lookup, optional as-of-date.
**Section boundary map:** `{ IGP:'NE', LNL:'SE', ROHA:'KR' }` (NE = Bhusaval, SE = Pune,
KR = Konkan). **run_days:** `1`=Mon … `7`=Sun, or `DAILY`, or comma lists (`1,3,5`).

### A train and its working are different rows — read this before touching either

`div_trains` is the **registry** (identity). `div_loco_link_master` is the **working**
(one row per sheet appearance). **Every sheet reads the working**; `div_trains` is joined
only for the name and, now, the rake type.

Consequences that have each already caused a bug:

- **The sheets never read `div_trains.is_active`.** Deactivating a train in Settings used
  to flip that flag and nothing else, so specials that had stopped running (02187/02188,
  01079/01080) stayed on the sheet forever. What removes a train is
  `div_loco_link_master.effective_until` (with `active` and `skip_dates`).
- **Closing is by date, not `active = 0`** — deliberately. Sheets for dates the train
  actually ran still render it and its logged locos.
- **A train can have no working at all.** All 8 Vande Bharat trains (20705/20706,
  22223/22224, 22225/22226, 22229/22230) have **no** `div_loco_link_master` row and never
  will — a trainset has no loco to book. They are registry-only and appear on no sheet.
  Do not "fix" that by giving them a link row.
- **`rake_type` therefore lives on the train**, not only on the working
  (`sql/2026-08-31_div_trains_rake_type.sql`). Settings writes the train, mirrors the value
  down to that train's link rows, and the sheet and board read
  `COALESCE(m.rake_type, t.rake_type)`. The link column stays and is still edited per-row —
  a train can legitimately run different stock on different sheets.

---

## 4. The daily sheet and the loco-link backend

`GET /today?sheet_source=&direction=&from_station=&route_label=&date=` builds the sheet:

- filters `active = 1`, then sheet (`sheet_source = ? OR mirror_sheet = ?`), then the
  date-validity clause `effectiveOnDateClause()` — `effective_from <= date`,
  `effective_until >= date`, `date NOT IN skip_dates`
- then `runsToday(run_days, dow)` in JS
- orders by `event_time` so the LPC works the sheet top-to-bottom as the day progresses

**Editable window:** `EDITABLE_DAYS_PAST = 7`, `EDITABLE_DAYS_FUTURE = 1`. Past window is
7, not 3: LPCs legitimately fill a day's actuals over the following 3–4 days, and a 3-day
window was freezing sheets before they were complete. There is no delete for master-linked
rows, so a wider window only permits filling.

**`POST /log` is the single write path** for the sheet, the board, and anything else.
It rewrites the **whole row** via `ON DUPLICATE KEY UPDATE ... VALUES(...)` — see §6.2.

Other endpoints of note: `/reports/mislinks` (three tiers including loco-type mismatch,
normalising "WAP 7" vs "WAP7", `FIND_IN_SET` on `accepted_loco_types`), `/hog-position`,
`/schedule-due`, `PATCH /loco-last-schedule`.

---

## 5. `wtt.html` — the Working Time Table

Standalone single file, vanilla JS, distinct dark "night-platform" theme (Fraunces /
IBM Plex Mono / Sans), dark-light toggle. **Login-gated but for every staff member** — the
daily sheet is LPC-only; keep the two separate. `API = '/api/division/loco-link/wtt'`.

### Three tabs
1. **Train lookup** — `GET /wtt/train/:no` → header card + halt timeline, alias-aware
   ("was 12345" chip), PDF/Excel of the single train.
2. **Station board** — `GET /wtt/station/:code?dir=&mode=&from=&to=`, plus a compare
   carousel (`/wtt/station/:code/full`).
3. **Full WTT** — the columnar book (below).

### Full WTT — trains as columns, stations as rows

Source `GET /wtt/all` (~422 trains): bulk fetch of `div_train_stops` + `div_trains` +
`div_loco_link_master.section`, assembled in JS. **All grouping and sorting happen in the
frontend**, so rearranging needs no re-fetch.

Block order: **DN** band (NE, SE, KR) → **UP** band (NE, SE, KR) → **BYPASS** (teal, by
route family) → **MEMU** (purple, own page). Within a group, sorted by departure minute
then train number. Controls: direction filter, cols/page (8/10/12/14/16, default 10),
Export PDF, Export Excel.

**Station rows are ordered by a topological merge** (`stationOrder()`): a DAG from each
train's consecutive stops, Kahn's algorithm with first-seen tie-break, leftovers appended.
This gets the corridor sequence right even when trains cover different sub-segments.

> **CRITICAL invariant.** The topo merge only works if every train in a group travels the
> **same direction**. Mixing directions creates contradictory edges (`CHI→RN` *and*
> `RN→CHI`) and the order becomes garbage — the "CHI after RN" bug. Corridor trains
> (NE/SE/KR) touch Mumbai terminals so `div_trains.direction` is reliable and is used.
> **Bypass trains have an unreliable direction field** (both legs often tagged the same),
> so it is ignored and travel direction is derived from the stop sequence.

**Bypass families** (`bypassFamily()`) — bypass = `section === 'BYPASS'`, runs via the
Vasai Road (BSR) chord. Classified by corridor × via-junction × travel direction:

| Family | Signature | ~count |
|---|---|---|
| Konkan via Panvel · BSR→Konkan | BSR PNVL ROHA KHED CHI RN | 23 |
| Konkan via Panvel · Konkan→BSR | RN CHI KHED ROHA PNVL BSR | 23 |
| Pune via Kalyan · BSR→Pune | BSR KYN KJT LNL (SVJR CCH) PUNE | 30 |
| Pune via Kalyan · Pune→BSR | PUNE LNL KJT KYN BSR | 30 |
| Pune via Panvel · BSR→Pune | BSR PNVL KJT LNL CCH PUNE | 2 |
| Pune via Panvel · Pune→BSR | PUNE CCH LNL KJT PNVL BSR | 2 |
| Cross-corridor `<origin>→<dest>` | RN→MMR (incl. 12617), MMR→RN, PUNE→MMR, MMR→PUNE | 6 |

Direction from the position of `BSR` (first → outward, last → inward); *via* = has `KYN` ?
Kalyan : has `PNVL` ? Panvel. Cross-corridor = touches `IGP` **and** (`ROHA` or `LNL`),
split by origin→destination so each is directionally clean — this fixed the
"12617 KDV after MMR" bug, since RN→MMR and PUNE→MMR are different paths to MMR.

**MEMU** (`isMemu`: `/^6\d{4}$/` or name contains "MEMU") — all 30 are short 1–2-stop chord
fragments; pulled out of every corridor onto one MEMU page in time order. This also stopped
ROHA-touching MEMUs leaking into KR.

**Exclusions:** `loadFull()` keeps only `/^\d{4,5}$/`, which drops DO (Deccan Odyssey) and
MR (Maha Raja) — tourist trains, not scheduled services.

**Print:** `window.print()`, landscape, `table-layout:fixed; width:100%` or the grid
overflows the page. Colour-on-white: arrival blue, departure bold black, boundary stations
amber + tint, header band indigo; `print-color-adjust:exact` (tint backgrounds still need
the browser's "Background graphics" checkbox — text colours always print). `day_offset>0`
renders a `+1` superscript. Letterhead from `public/control-office/img/`
(`ir-logo.jpg`, `cr-logo.jpg`, `banner.png`).

> `/wtt/all` is a **backend** route — pulling WTT changes needs a **Node restart**, or the
> page shows "No WTT data" although the data is present. `div_train_stops` is populated on
> prod (2,946 stops); the source CSV `data/wtt_db_data.csv` is scp-only, reload with
> `node scripts/load_wtt_stops.js`.

---

## 6. Loco availability and assignment

Deployed 2026-07-20 — commits `f14223a`, `ed6b950`, `02c2b6d`, `49dcb70`.

### 6.1 The bug that started it

> "even after assigning to another train, the loco still shown available at sheds"

`GET /assigned-today` asked "is this loco assigned?" with
`SELECT DISTINCT actual_loco_no ... WHERE direction='DN' AND working_date = ?`.
Three classes of booking were invisible: **rear locos** (`actual_loco_no_rear` never
checked), **anything not dated exactly today** (links are entered ahead of departure —
that is most bookings), and **propagated rows** (`propagateLoco()` fires no position
update). It also trusted `div_loco_positions.current_location`, which cannot be trusted (§6.5).

The cost was real: on 2026-07-19 between 19:15 and 19:54 the LPC made **367 manual
position moves** by hand, dropping terminals from 223 locos to 58.

**The fix:** availability is derived from **bookings**, not position. A loco is out of the
pool if it appears — front or rear, including `X+Y` couplers — on a DN link row dated on
or after the day it arrived. The arrival date is the anchor and self-corrects. Shared
predicate `BOOKED_OUT_EXISTS`, used by `/assigned-today` and `/available`.

**Also fixed** (`ed6b950`): changing a link's loco used to strand the replaced one at
`OUT_OF_DIV` while it stood at the terminal. `POST /log` now captures the row's locos
before the upsert and restores any no longer on it. A loco moving front → rear is **not**
dropped — a failed loco towed dead leaves with the train and correctly stays out.

**Measured one day after deployment:** terminals 223 → 58 locos, ghosts (standing 3+ days)
125 → 7.

### 6.2 The Assignment Board — traps, do not regress

`loco-assign.html`: locos standing at a terminal on the left, that terminal's DN workings
on the right, counts in loco **slots** not trains (a push-pull working with one loco still
needs another).

- **`POST /log` rewrites the whole row.** Any field omitted becomes NULL. The board echoes
  back `incoming_train`, `outgoing_train`, `outgoing_train_rear`, `remark`, `remarks_rear`,
  `failed_in_division` on every save. Verified: assigning to 12071 preserved
  `incoming_train = 12702`.
- **`secondary_role='rear'` is push-pull only** — the API rejects it on an ordinary working
  (400). Roles offered follow the train.
- **The loco list is not date-filtered.** A loco standing three days is as assignable as one
  that arrived this morning. The date picks which DN *sheet* is written, nothing else.
- **No confirm click.** The board reloads after every save.
- **Fit scoring** (`fitFor()`): 4 = HOG shortfall, 3 = mislink (shed ≠ home shed), 2 = loco
  type mismatch, 10 = working already has a loco. Sorted best-fit first.
- **Late loco change = three explicit buttons**, not an error: Replace / Attach (old one dead
  in tow) / Add as second loco. The dead-in-tow case is real.
- **Schema holds two locos** (`actual_loco_no` + `_rear`). A third rides in the rear field as
  `"X+Y"` — rare (2 rows in two months). Position tracking follows only the first part.

The **wants line** reads `shed · HOG · loco class · rake type · link attribute`, e.g.
`wants AQE · HOG · WAP7 · LHB · P/7`. `link_attr` usually restates the loco class in link
shorthand (`WAP7` → `P/7`, true of 260 of 278 rows), so that token is stripped when it
matches. What remains is real and appears nowhere else on the line: `PUSHPULL`, `DSL`,
`AC/DC`, `130 kmph`. Two cases deliberately keep it — a mismatch (`WAP7` with `P/4`) is a
data disagreement worth seeing, and `P/7` with no loco class is then the only statement of
the class.

### 6.3 Train origin

`div_loco_link_master.from_station` is free text and inconsistent (`"LTT / LTT"`,
`"BIRD/ BIRD"`, `"DW"`). Use `normalizeTerminal()` with a fallback to the `sheet_source`
prefix; skip masters that resolve to neither.

### 6.4 DR stables at VVH

Dadar terminates nine train pairs but has no stabling shed. Locos run light to VVH and back.
Arrivals at DR position at **VVH** (`stablingTerminal`); DR-originating workings list on the
VVH board; VVH and DR are one pool, a loco held at DR shows badged `AT DR`.
`sql/2026-07-20_dr_locos_to_vvh.sql` ran on prod 2026-07-20 (1 loco, 22926; rollback tag
`updated_by='dr-to-vvh'`).

**Resolved 2026-07-20 — the eight are on the right board.** `div_trains` says nine DN
trains depart DR. The other eight (**11005, 11021, 11027, 11035, 11041, 12131, 17318,
22147**) once carried `from_station='LTT'` in `div_loco_link_master` because they are worked
from the LTT-DN sheet. `sql/2026-07-20_dr_departures_from_station.sql` (commit 0cbae58)
set them to `DR`, confirmed against the timetable, the WTT stop lists and the operator.
Verified on prod 2026-09-11: all eight read `DR` in both tables.

The split is deliberate and both halves matter:
- **`sheet_source` stays `LTT-DN`** — the LPC works them from the LTT sheet, under the
  "SE · ex DR" / "NE · ex DR" sub-headers.
- **`from_station='DR'` maps to VVH** via `stablingTerminal`, so the Assignment Board lists
  them on the VVH board with the locos that feed them.

The correction was made in data rather than by preferring `div_trains.from_station` in
`originOf()`, so the sheet and the board keep reading one field and cannot drift.

### 6.5 The remaining debt — position tracking

**`div_loco_positions.current_location` is still unreliable.** It is mutable state written
by an unordered event stream in `updateLocoPosition()`:

1. `propagateLoco()` never calls it — auto-created DN rows leave the loco parked forever.
2. Departure can fire **too early**; the guard then no-ops it and the real departure never
   generates a second event.
3. `ARRIVAL` is **replayable** — re-saving an unchanged log row re-fires it.

The booking fix works *around* this by not consulting position for availability; it does not
repair the data. Locos that leave with no DN link entry (light engine, transfer out) still
read as available.

**Durable fix, not done:** derive position from the daily sheets (latest log row per loco by
`working_date` + `event_time`) instead of mutable state. Blast radius verified small —
`div_loco_positions` is touched only by `locoLinkRoutes.js` (one writer
`updateLocoPosition`; readers `/positions`, `/position/:n`, `/position/:n/history`,
`/available`, `/assign-board`, `/schedule-due`, `PATCH /loco-planning`) and
`schedule-due.html`. Nothing in slate / midnight-position / crew modules — those match on
the word "availability" but mean **staff**, not locos.

**Deliberately NOT done:** making `propagateLoco` fire a position update. Propagation often
targets *tomorrow's* DN train, so it would mark a loco OUT_OF_DIV a day before it physically
leaves — making position less truthful to fix a symptom the booking query already handles.

---

## 7. Loco master and the Management page

**Correction to the old brief:** it described the page as not existing and
`div_loco_transfers` as needing creation. **Both exist now** — `loco-management.html` is
live and its dashboard card is enabled.

`div_locos` — 13,792 rows. `id`, `loco_number` (UNIQUE), `loco_type` (WAP4/5/7, WAG9H,
WAG12B…), `traction_type` enum(Electric/Diesel/Dual), `railway_zone` (16), `home_shed`
(~71), `status` enum(Active / Transferred Out / Condemned), `commission_date`,
`hotel_load_oem` (NULL for freight; Siemens/Medha/BHEL for HOG),
`data_source` enum(CSV_UPLOAD/LPC_ENTRY/MANUAL), `entered_by`.

`div_loco_transfers` — audit of transfers and status changes.

Mutations require `division_admin` or `ctlc`. Do not confuse the master with the
operational tables (`div_loco_positions`, `div_loco_sick_records`, `div_loco_defects`) —
those track *where locos are* and *which are sick*; this manages the roster itself.

Still open from the original brief: whether Phases 2–3 of `LOCO_MASTER_MIGRATION.md`
(replace `div_cr_locos` with a view, retire rail-data-app's loco endpoints) are in scope.

---

## 8. Sick locos and defects

`div_loco_sick_records` backs both pages. Endpoints: `POST /sick`, `PATCH /sick/:id`,
`PATCH /sick/:id/fit`, `GET /sick`, `GET /sick/history`.

**Category** is the organising idea. `GET /sick/history` returns
`category_final = category || derived_category`, i.e. the LPC's override when set, else
`deriveCategory({locoType, tractionType, trainIsPassenger})`:

- working a passenger train → `COG` / `COG-DSL`
- else by class: `WAP*`/`WDP*`/`WCAM*` → COG; `WAG*`/`WCAG*`/`WCM*`/`WDG*`/`WDM*`/`EF*` → GOODS
- diesel decided by `traction_type = 'Diesel'` or a `WD` prefix
- otherwise `null` — truly ambiguous, LPC should set an override

**Both pages partition on `category_final`**, in the same order and colours: COG (Passenger),
COG (Diesel Passenger), GOODS (Freight), GOODS (Diesel Freight), OTHER. `sick-locos.html`
has done this from the start; `sick-report.html` gained it in `e654f80` — before that it was
one flat table with a Category column you had to scan by eye. Empty categories are omitted
(on a 90-day report that would be four wasted blocks); print CSS keeps a header from being
orphaned; CSV export sorts into the same order. Prod spread over 90 days: COG 121, GOODS 43.

Keep the two pages grouping on the same field — that is what stops them disagreeing about
what a COG block contains.

`div_loco_defects` backs `defect-reports.html`: `POST /defects`, `GET /defects`,
`/defects/by-shed`, `/defects/by-terminal`, `/defects/for-log`, `PATCH /defects/:id`.

---

## 9. Settings — three tabs

Mutations require `requireSettingsRole` (`division_admin` or `ctlc`).

### Scheduled Specials
Lists **only rows with `is_scheduled_special = 1`** and offers Close / Extend / Skip / Delete
— the only UI that writes the date window the sheet honours. For a long time **not one of
428 rows carried the flag**, so those buttons could reach nothing;
`sql/2026-08-31_scheduled_special_flag_backfill.sql` set it for specials (0-prefixed numbers,
plus `train_type='Special'`). Close writes `effective_until`; Delete is a soft
`active = 0`.

**Bypass rows must carry a `route_label`.** The bypass sheet groups by it (LNL-BSR,
IGP-ROHA, BSR-ROHA, PUNE-ROHA and their reverses); a row without one lands on an OTHER tab
where the LPC cannot find it. Until 2026-09-11 none of the four forms that create or edit a
link row (this tab, Add Train's link block, Add Link, Edit Link) had a route field, and 26
rows on prod had piled up there. Now every form shows a Bypass Route input for a BYPASS
sheet, and `normaliseBypass()` in `locoLinkRoutes.js` refuses a bypass row without one and
forces `direction='BYPASS'`, `is_bypass=1`, `section='BYPASS'` on every write path. The label
is the division entry/exit pair, not the train's endpoints, so it is never derived from
from/to. Backfill: `sql/2026-09-11_bypass_route_label_backfill.sql` (ran on prod 2026-09-11).

### Trains
CRUD over `div_trains` plus renumbering through `div_train_aliases`. Deactivating a train
sets `is_active = 0` **and** closes its link rows by writing `effective_until` = the last
running date (asked for in the UI, defaulting to today in **IST** via `todayISO()` — not
MySQL `CURDATE()`, because the server clock is UTC and would close a day early between
00:00 and 05:30 IST). Reactivating clears it.

**Coach Type lives in the train's own fields**, not in the Loco Link section — because a
trainset has no link row to hold it (§3). Saving mirrors it down to the train's link rows
(`MIRROR_FIELDS = run_days, train_name, traction_type, rake_type`).

Coach types: **LHB, ICF, VNDB** (Vande Bharat), **AMTB** (Amrit Bharat), **LVPH** (parcel).
`rake_type` is a free `varchar(20)` with **no server-side allowlist — the dropdown IS the
vocabulary**. A value retired from the dropdown renders blank in the edit modal and is
silently cleared on the next save, so rename in SQL, never only in the HTML.

> **Trap, already fixed, do not re-break.** For a train with no link row the modal pre-fills
> a *suggested* sheet from direction + terminal. That pre-fill used to satisfy the "does the
> user want a loco link?" test all by itself, so any save demanded an event time for a link
> nobody asked for — which is why VNDB could not be saved on 20706. The suggestion is now
> tagged `dataset.suggested` and ignored unless the user touches the dropdown (`2589bc6`).
> Anything added to that dirty-check must not undo this.

### Loco Link and Coach Types
Per-row editing of `div_loco_link_master` (shed, link attribute, loco type, rake, HOG,
push-pull).

---

## 10. Deploy and environment

- **Prod:** `railway@93.127.198.125`, app `/home/railway/bbtro`, branch `master`, pm2 app
  name `bbtro`. Prod DB `bbtro`, user `railway_user` (password held by the user — never
  hardcode). **Non-interactive SSH does not work**; the user runs server commands.
- **Local:** DB `bbtro` / `jay` / `4310jay`; `PORT=3099 node server.js` from the repo dir so
  `.env` loads. Login is `POST /api/login` (allowlisted — *not* `/api/auth/login`), body
  `{username, password, realm:"division"}`. No plaintext division password locally: create a
  throwaway bcrypt user, test, delete.
- **Static HTML needs only a browser refresh. Backend changes need a Node restart.**
- **DDL goes in a dated `sql/*.sql` file** (memory `feedback_schema_documentation`).

> **Ordering trap — this one breaks the sheet.** When a code change reads a column the
> migration adds, run the SQL **before** the restart. Pulling is safe (node serves the old
> code from memory); restarting first makes the daily sheet fail with
> `Unknown column 't.rake_type'`. Correct order: `git pull` → run SQL → restart.

Quick JS parse check of any page:

```bash
node -e "const h=require('fs').readFileSync('public/control-office/PAGE.html','utf8');
const js=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
new Function(js); console.log('OK')"
```

This is worth running every time — it caught a `const cls` redeclaration in `loco-assign.html`
that would have broken the whole board, not just the edited line.

---

## 11. Open items

| # | Item | Notes |
|---|---|---|
| 1 | ~~Six pages served without a login~~ | **Done 2026-09-11.** §1. Six routes added; `settings` narrowed to division_admin/ctlc |
| 2 | ~~Eight DR workings possibly on the wrong board~~ | **Done.** Fixed 2026-07-20 (0cbae58) before this doc was merged; note was stale. Verified on prod 2026-09-11. §6.4 |
| 3 | **Position tracking debt** | §6.5; only worth doing if ghosts re-accumulate |
| 4 | WTT inline edit | admin/ctlc editing of halts/timings; `window.__canEdit` hooks stubbed. Memory `wtt_edit_feature_pending` |
| 5 | Settings `mirror_sheet` dropdown | deferred |
| 6 | JL / BSL WTT station timings | user to append to the loader CSV |
| 7 | `LOCO_MASTER_MIGRATION.md` Phases 2–3 | `div_cr_locos` → view; retire rail-data-app loco endpoints |
| 8 | `banner.png` is 1.4 MB | could be optimised |

---

## 12. Gotchas — so we don't relearn them

- **`git commit <pathspec>` commits the whole working-tree file**, not just staged hunks.
  To commit part of a file, stage the hunk with `git apply --cached` then commit with no
  pathspec. This repo has parallel sessions: **check `git branch --show-current` before every
  commit**, and review `git status --short` — an unrelated one-line change was once swept in
  this way.
- **The worktree is shared.** Another session can delete a worktree or switch a branch under
  you. Commit and push early; anything only in a working tree can vanish.
- Bypass `direction` is unreliable — derive from stops.
- The topological station merge inverts if a group mixes travel directions.
- Print tables need `table-layout:fixed; width:100%`.
- The WTT page is for **all staff**; the daily sheet is **LPC-only**.
- DO / MR are tourist trains, excluded by the numeric filter.
- **A page looking stale is usually the browser, not the deploy.** Verify with
  `curl -s <url> | grep -c <marker>` against the origin and through Cloudflare before
  suspecting the code; we spent a round on this.

---

## 13. File map

```
public/control-office/            15 pages (§1) + img/ (ir-logo, cr-logo, banner)
routes/division/locoLinkRoutes.js all loco-link, WTT, sick, defect, settings endpoints
scripts/load_wtt_stops.js         WTT halts loader (CSV is scp-only)
docs/CONTROL_OFFICE.md            ← this file
docs/SSEHQ_RTIS_PENDING.md        referenced from server.js — leave in place
sql/2026-06-17_wtt_stops_loader.sql
sql/2026-07-20_dr_locos_to_vvh.sql                    run on prod 2026-07-20
sql/2026-07-20_stale_loco_positions_cleanup.sql       NOT run — kept for next time
sql/2026-08-31_scheduled_special_flag_backfill.sql    run on prod
sql/2026-08-31_rake_types_and_13380_time.sql          run on prod
sql/2026-08-31_div_trains_rake_type.sql               run on prod
```

**Recent commits** (all deployed): `b579db8` deactivate writes `effective_until` + specials
backfill + coach types + 13380 time fix · `15fe6a2` rake type moved to the train ·
`e654f80` sick report partition · `2589bc6` suggested-sheet fix · `4e7d930` rake type on the
board · `47efd0a` stop printing the loco class twice.
