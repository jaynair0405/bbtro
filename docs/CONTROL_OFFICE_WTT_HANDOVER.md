# Control Office — Loco-Link & WTT Handover

> **Purpose of this doc:** a complete, pick-up-anywhere record of the Control Office
> (loco-link + WTT) work so a fresh chat can resume with zero context loss.
> Last updated: 2026-06-19.

---

## 0. TL;DR — where we are right now

- **Committed & pushed** (on `origin/master`): mis-link loco-type tier, daily-sheet
  loco highlight + search, mirror_sheet Phase 2, PNVL sheets, WTT stops loader, **and
  the Full WTT columnar export** (commit `65349a9`).
- The **Full WTT** (`wtt.html` Full WTT tab + `GET /wtt/all` + `img/` logos/banner +
  this doc) is now committed & pushed. **Not yet deployed to prod** — user does
  `git pull` + Node restart on the server when ready.
- **Next session:** a "very important LPC + administrative task" (not yet specified)
  — needs discussion & logic design. Start fresh; this doc is the backdrop.

> Note: any `??` files under `sql/`, plus `server.js` signal work and
> `awsUploadRoutes.js`, are the user's UNRELATED work — **never commit them** with
> control-office changes.

---

## 1. Architecture: the train_id spine

The loco-link subsystem was migrated from train-**number** keys to a stable
**`train_id`** spine so renumbering doesn't break history.

| Table | Role |
|---|---|
| `div_trains` | Master train identity: `train_id` (PK), `train_no`, `train_name`, `train_type` (enum Express/Superfast/Mail/Passenger/Suburban/Special/Goods), `direction` (UP/DN), `run_days`, `traction_type`, `from_station`, `to_station`, `loco_change_station` |
| `div_train_aliases` | Renumber-safe identity: `(train_id, train_no, valid_from, valid_until)`. A train keeps its `train_id` across number changes. |
| `div_train_stops` | **WTT halts**: `id, train_id, seq_order, station_code, arrival_time, departure_time, event_type ENUM('halt','pass_or_depart','arrive_or_pass'), day_offset, direction, segment_id, platform_no` |
| `div_loco_link_master` | Loco-link rows (the LPC daily-sheet definitions): `sheet_source, mirror_sheet, section (NE/SE/KR/BYPASS), direction, from_station, to_station, event_time, expected_loco_type, accepted_loco_types, train_id, run_days, active` |

**Key helper (backend):** `resolveTrainByNo()` — alias-aware lookup (optional as-of-date).

**Section boundary map** (used widely): `{ IGP:'NE', LNL:'SE', ROHA:'KR' }`
(NE = Bhusaval line, SE = Pune line, KR = Konkan line).

**run_days convention:** `1`=Mon … `7`=Sun; `DAILY`, comma lists (`1,3,5`), or words (`SAT`).

---

## 2. The Control Office pages

Served from `public/control-office/` (gated by `requireControlOffice`; `div_admin`
has ctlc authorization and a dashboard link in). Static assets under
`public/control-office/img/` are served by the global `express.static('public')`.

| Page | What it is |
|---|---|
| `index.html` | Control Office dashboard |
| `daily-entry.html` | **LPC daily sheet** — per-sheet loco-link entry (CSMT-UP/DN, LTT-UP/DN, KR-UP/DN, PNVL-UP/DN, BYPASS). Has loco highlight (green/bold), eye-catching search. |
| `reports.html` | Mis-link report (zone-only / zone+shed / **loco-type** tiers) + others |
| `wtt.html` | **Working Time Table** — standalone "night-platform" themed page, for **all staff** (PWA-ready). Read-only WTT lookup + the Full WTT export. **This is the focus of recent work.** |
| `print-all.html`, `settings.html`, etc. | Supporting pages |

---

## 3. wtt.html — the WTT page (most recent work)

Standalone, single-file, vanilla JS. Distinct dark "night-platform" theme (fonts
Fraunces / IBM Plex Mono / Sans), dark/light toggle. **Login-gated** (every staff).
Helpers: `$()`, `esc()`, `hhmm()`, `state()`, `download()` (BOM CSV).
`API = '/api/division/loco-link/wtt'`.

### Three tabs
1. **Train lookup** — type a train no → `GET /wtt/train/:no` → header card + halt timeline.
   Alias-aware ("was 12345" chip). PDF/Excel of the single train.
2. **Station board** — pick station + dir + mode + time window → `GET /wtt/station/:code?…`.
   Plus a **compare carousel** (`/wtt/station/:code/full`) of multiple trains' full halts.
3. **Full WTT** — the big feature (below).

### 3a. Full WTT — columnar export (THE recent build)

**Goal:** the whole working timetable as the classic railway book — **trains as columns,
stations as rows** (arrival `a` / departure `d` sub-rows per station), ~10–12 train
columns per page, paginated; export to color **PDF** (landscape) and **Excel/CSV**.

**Data source:** `GET /api/division/loco-link/wtt/all` (see §4). Built purely from
`div_train_stops` + `div_trains` + `div_loco_link_master.section` — independent of the
LPC daily sheets / `/today`.

**Controls (the `.full-bar`):** direction filter (All / Down / Up), `cols/page` selector
(8/10/12/14/16, default **10**), Export PDF, Export Excel.

#### Grouping & ordering (the hard part — read carefully)

Order of blocks rendered:
1. **DN band** → sections **NE, SE, KR** (corridor trains; reliable UP/DN field)
2. **UP band** → sections **NE, SE, KR**
3. **BYPASS band** (teal) → route families (below)
4. **MEMU band** (purple) → all MEMUs, time-ordered, own page

Within each section/family: trains sorted by departure time (`dep_min`), then train_no.

**Station rows are auto-ordered by a topological merge** (`stationOrder()`): build a
DAG from each train's consecutive stops, Kahn's algorithm with first-seen tie-break,
leftover (cycles) appended. This yields the correct corridor sequence even when trains
cover different sub-segments or insert extra halts (e.g. SVJR between LNL and PUNE).

**CRITICAL invariant:** the topo merge only works if all trains in a group travel the
**same direction**. Mixing opposite directions creates contradictory edges
(`CHI→RN` *and* `RN→CHI`) → garbage order (the "CHI after RN" bug). Therefore:

- **Corridor trains (NE/SE/KR)** keep the reliable `div_trains.direction` (they touch
  Mumbai terminals) → grouped under DN/UP.
- **Bypass trains** have an **unreliable direction field** (both legs often tagged the
  same), so we **ignore it** and derive travel direction from the stop sequence.

#### Bypass route families (`bypassFamily()`)

Bypass = backend `section === 'BYPASS'` (doesn't touch Mumbai terminals; runs via the
Vasai Road **BSR** chord). Classified by **corridor × via-junction × travel-direction**:

| Family | Signature | ~count |
|---|---|---|
| Konkan via Panvel · BSR→Konkan | BSR PNVL ROHA KHED CHI RN | 23 |
| Konkan via Panvel · Konkan→BSR | RN CHI KHED ROHA PNVL BSR | 23 |
| Pune via Kalyan · BSR→Pune | BSR KYN KJT LNL (SVJR CCH) PUNE | 30 |
| Pune via Kalyan · Pune→BSR | PUNE LNL KJT KYN BSR | 30 |
| Pune via Panvel · BSR→Pune | BSR PNVL KJT LNL CCH PUNE | 2 |
| Pune via Panvel · Pune→BSR | PUNE CCH LNL KJT PNVL BSR | 2 |
| Cross-corridor · `<origin>→<dest>` | e.g. RN→MMR (incl. 12617), MMR→RN, PUNE→MMR, MMR→PUNE | 6 |

- **Direction derived** from position of `BSR` in the sequence (first → outward, last → inward).
- **via** = has `KYN` ? Kalyan : (has `PNVL` ? Panvel).
- **Cross-corridor** = touches `IGP` AND (`ROHA` or `LNL`) — runs through two corridors.
  Split by **origin→destination** so each is directionally clean (this fixed the
  "12617 KDV after MMR" bug — RN→MMR and PUNE→MMR are different paths to MMR and must
  not be merged).

#### MEMU / chord workings

`isMemu(t)` = train_no matches `/^6\d{4}$/` OR name contains "MEMU". All 30 are short
1–2-stop chord fragments (KYN-BSR, ROHA-PNVL…). They are **pulled out of every corridor**
into one **MEMU page, sorted by departure time** (per user: "all memu together in
separate page in time order"). This also cleaned KR (ROHA-touching MEMUs no longer leak in).

#### Exclusions

`loadFull()` filters out **non-numeric train numbers**: `/^\d{4,5}$/`. This drops
**DO (Deccan Odyssey)** and **MR (MAHA RAJA)** — luxury tourist trains — which removes
the spurious CSMT-DR-TNA-DIVA-BSR cross group.

#### Rendering & print

- `gridTable(trains)` builds one columnar `<table class="wtt-grid">` with a `<colgroup>`,
  4 header rows (Train No. / Name / Days / Type), then per-station `a`/`d` rows.
- `sectionPages(label, trains, dirLabel)` chunks trains into `fullCps`-column pages.
- **Print = `window.print()`**, **landscape**, `table-layout:fixed; width:100%` so the
  grid never exceeds page width (fixed the overflow / "extra vertical line at col 9" /
  "last column not closed" bugs). One page per column-block; `break-inside:avoid`.
- **Color PDF:** color-on-white — arrival blue, departure bold black, boundary stations
  (LNL/IGP/ROHA/PUNE/CSMT/LTT/DR/PNVL/KYN/TNA) amber + tint, day letters amber, header
  band indigo. `print-color-adjust:exact` (tint backgrounds still need the browser's
  "Background graphics" checkbox; text colors always print).
- **Excel/CSV** mirrors the columnar print: per block, header rows then station a/d rows.
- **Day offset:** stops with `day_offset>0` show a small `+1` superscript = "reaches this
  station on the next day" (overnight/multi-day trains).

#### Logos & banner (letterhead)

Files in `public/control-office/img/`: `ir-logo.jpg` (Indian Railways),
`cr-logo.jpg` (Central Railway), `banner.png` (square 1024×1024 logo).
- **Screen:** IR logo in the masthead (small, white chip). Footer: "Generated from
  **crtms.in**" + banner (≤140px).
- **PDF:** a print-only `.print-mast` letterhead at top of page 1 — IR logo left,
  CR logo right, rule under. Footer (note + crtms.in + banner ≤110px) prints at the
  bottom of the last page; footer is `break-inside:avoid` so the banner doesn't split.

---

## 4. Backend — `routes/division/locoLinkRoutes.js`

WTT read endpoints (all login-gated, mounted under `/api/division/loco-link`):

| Endpoint | Returns |
|---|---|
| `GET /wtt/train/:no` | One train: `{found, current_train_no, train_name, train_type, ran_as, was_aliased, run_days, stops[]}` |
| `GET /wtt/station/:code?dir=&mode=&from=&to=` | Station board rows |
| `GET /wtt/station/:code/full` | All trains' full halts via a station (compare carousel) |
| **`GET /wtt/all`** | **Every WTT train, one full-journey entry each** (Full WTT). |

**`GET /wtt/all` shape** (per train):
```json
{ "total": N, "trains": [
  { "train_id", "train_no", "train_name", "train_type", "run_days",
    "direction", "section",        // section = NE/SE/KR/BYPASS (master, else inferred from boundary stop, else BYPASS)
    "dep_min",                     // first stop's departure (minutes) — sort key
    "origin", "destination",
    "stops": [ {seq_order, station_code, arrival_time, departure_time, event_type, day_offset} ] }
] }
```
Implementation: bulk fetch (DISTINCT train_ids → one stops query `IN (?)` → headers →
master sections), assemble in JS. ~422 trains. The frontend does all grouping/sorting,
so changing the arrangement needs no re-fetch.

Other relevant backend work (already committed):
- `/reports/mislinks` — 3 tiers incl. **loco-type mismatch** (`typeMismatchSql`,
  normalizes "WAP 7" vs "WAP7", `FIND_IN_SET` on `accepted_loco_types`).
- `/today` — `renamed_from` + `terminal_arr` enrichment + `mirror_sheet` OR-clause.
- `POST /log` — train_id + train_no_snapshot wiring; inline new-train registration.

---

## 5. Current state — commit checklist

**On `origin/master` (done):**
- `63290fb` Mis-link report: loco-TYPE mismatch tier
- `53b5dc2` Daily sheet: loco-number highlight + eye-catching search box
- `a7bf2e5` Loco-link Phase 2: mirror_sheet
- `128acd4` docs: PENDING-DB-CHANGES (WTT loader, PNVL, mirror_sheet)
- `11cb858` PNVL-UP / PNVL-DN sheets in UI

- `65349a9` **Full WTT: columnar timetable export (PDF/Excel)** — `wtt.html` Full WTT
  tab + `GET /wtt/all` + `public/control-office/img/{ir-logo,cr-logo,banner}.{jpg,png}`
  + this handover doc. **Deployed on prod 2026-06-19** (HEAD `1d7de98`, Node restarted).
- `ab20d9d` **Bypass sheet: always-offer PUNE-ROHA / ROHA-PUNE routes** so LPC can
  register seasonal Pune↔Roha specials (`daily-entry.html`). The bypass page is
  driven by `route_label`; a group only rendered if it had data, so default empty
  routes are now injected (`DEFAULT_BYPASS_ROUTES`) with an Add-Special button, and
  each blank/add row carries its `sheet_source = BYPASS-<route_label>`. **Backend
  change:** `/today` now also returns bypass specials on the all-bypass view
  (`direction=BYPASS`, keyed by direction, not only by `sheet_source`) — previously
  bypass specials wouldn't reload in the all-view. **Deployed on prod 2026-06-19.**
  22149/22150 belong to this family but stay on KR/PNVL.

> **Prod deploy note:** `div_train_stops` is populated on prod (2946 stops). The WTT
> data CSV (`data/wtt_db_data.csv`) is scp-only (not in git); reload it with
> `node scripts/load_wtt_stops.js` after scp if it ever needs refreshing. The
> `/wtt/all` route is backend, so **a Node restart is required** after pulling WTT
> changes — forgetting it shows "No WTT data" even though the data is present.

**Rule for any future commit here:** commit ONLY control-office/loco-link files — never
the user's unrelated `sql/*.sql`, `server.js` signal work, `awsUploadRoutes.js`, etc.

---

## 6. Pending / deferred

- **Deploy mirror_sheet Phase 2 SQL on prod** — §14 of `sql/PENDING-DB-CHANGES.md`
  (still PENDING on production). Also the SE-timing change for 22149 noted there.
- **WTT inline edit** — admin/ctlc inline edit of halts/timings on wtt.html. Parked.
  (`window.__canEdit` hooks + edit-pencil affordances already stubbed.) Memory:
  `wtt_edit_feature_pending`.
- **Settings mirror_sheet dropdown UI** — deferred.
- **JL / BSL WTT station timings** — user to append to the loader CSV later.
- The **new LPC/administrative task** — the reason for the fresh chat. Unspecified yet.

---

## 7. How to test locally

```bash
# Local DB: bbtro / jay / 4310jay
PORT=3099 node server.js               # run from repo dir so .env/SESSION_SECRET load
```
- Login endpoint is **`POST /api/login`** (NOT /api/auth/login — the API guard
  allowlists `/api/login`). Body: `{username, password, realm:"division"}`.
- No known plaintext division password locally → create a **throwaway user**, test, delete:
  ```bash
  HASH=$(node -e "require('bcrypt').hash('test1234',12).then(h=>process.stdout.write(h))")
  mysql -u jay -p4310jay bbtro -e "INSERT INTO users (username,password,role,realm,div_role) VALUES ('wtt_tmp','$HASH','admin','division','division_admin');"
  # ... curl with cookie jar ...
  mysql -u jay -p4310jay bbtro -e "DELETE FROM users WHERE username='wtt_tmp';"
  ```
- Quick JS parse check of the page:
  ```bash
  node -e "const h=require('fs').readFileSync('public/control-office/wtt.html','utf8');new Function(h.match(/<script>([\s\S]*)<\/script>/)[1]);console.log('OK')"
  ```
- To validate grouping/ordering against real data without the HTTP layer, replicate the
  `/wtt/all` logic in a small `mysql2/promise` script run **from the repo dir** (so
  `dotenv` + node_modules resolve).

---

## 8. Deploy notes (production)

- **Server:** `railway@93.127.198.125`, app at `~/bbtro`, prod DB `bbtro` user
  `railway_user` (password held by user — never hardcode). Cannot SSH non-interactively.
- **Workflow:** user does `git pull` on the server for code; **restart the Node app** to
  pick up `locoLinkRoutes.js` changes (static HTML needs only a browser refresh).
- **Images / large/binary assets & data CSVs go via `scp`**, not git, when appropriate —
  BUT the three WTT logo files ARE committed to git (they live under `public/`), so a
  `git pull` brings them. (`banner.png` is 1.4 MB — could be optimized later.)
- **Schema/DDL must be documented** in a dated `sql/*.sql` file or a `*_plan.md`
  (memory `feedback_schema_documentation`). The Full WTT needs **no DB change**.

---

## 9. Gotchas & lessons (so we don't relearn)

- **`git commit <pathspec>` commits the WHOLE working-tree file**, not just staged hunks.
  To commit a partial file (e.g. only the mislink hunk, excluding `/wtt/all`), stage the
  hunk with `git apply --cached <patch>` then `git commit` with **no** pathspec.
- Bypass `direction` field is **unreliable** — derive from stops.
- Topological station merge **inverts** if a group mixes travel directions — always group
  so each block is single-direction.
- Print tables must be `table-layout:fixed; width:100%` or they overflow the page.
- The WTT page is for **all staff**; the daily sheet is **LPC-only** — keep them separate.
- DO / MR are tourist trains, not scheduled services — excluded by the numeric filter.

---

## 10. Key file map

```
public/control-office/wtt.html            # WTT page (3 tabs incl. Full WTT)  ← uncommitted
public/control-office/img/                # ir-logo.jpg cr-logo.jpg banner.png ← uncommitted
public/control-office/daily-entry.html    # LPC daily sheet
public/control-office/reports.html        # mis-link report
routes/division/locoLinkRoutes.js         # all loco-link + WTT endpoints      ← /wtt/all uncommitted
sql/2026-06-17_wtt_stops_loader.sql       # WTT halts loader (deployed)
scripts/load_wtt_stops.js                 # loader script
sql/PENDING-DB-CHANGES.md                 # §12 loader, §13 PNVL, §14 mirror_sheet (PENDING prod)
WTT_LOADER_PLAN.md                        # WTT coverage (PUNE/MMR/RN done; JL/BSL pending)
docs/CONTROL_OFFICE_WTT_HANDOVER.md       # ← this file
```
