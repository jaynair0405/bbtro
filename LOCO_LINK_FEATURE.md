# Loco Link Feature — Control Office Module

Daily loco-link tracking for BB Division: planning master + per-day LPC entry log + sick/dead loco workflow + analytics (mis-link tiers, train-loco history, loco-train history). Builds on `div_locos` (the all-India electric loco master) and the diesel-incremental flow.

---

## TL;DR for a fresh Claude session

If you're picking this up cold, read in this order:

1. **This doc** (the file you're reading)
2. **DDL block below** — gives you the exact current schema for the 4 tables
3. **[routes/division/locoLinkRoutes.js](routes/division/locoLinkRoutes.js)** — all backend endpoints (~1650 lines)
4. **[public/control-office/daily-entry.html](public/control-office/daily-entry.html)** — the main LPC working surface (~2100 lines)
5. **Open work** section at the bottom — where to pick up

DB: `bbtro` on local MySQL. Credentials in [CLAUDE.md](CLAUDE.md).

To verify local matches this doc: `mysql -u jay -p4310jay bbtro -e "SHOW CREATE TABLE div_loco_link_log\G"` etc.

---

## Status

| Phase | Status |
|---|---|
| `div_locos` master loaded (13,792 electric locos) | ✅ DONE 2026-04-23 |
| Hotel-load column on `div_locos` | ✅ DONE 2026-05-04 |
| Traction columns on `div_locos` (Electric/Diesel/Dual, data_source, entered_by) | ✅ DONE 2026-05-04 |
| `div_loco_link_master` + `div_loco_link_log` DDL | ✅ DONE 2026-05-04 |
| Master loaded from `CO_Loco_link_final.xlsx` (414 rows) | ✅ DONE 2026-05-04 |
| Push-pull columns + `is_push_pull` flag | ✅ DONE 2026-05-04 |
| `lpc` role on users + post-login redirect | ✅ DONE 2026-05-04 |
| Control Office portal + Loco Lookup widget (slice 1) | ✅ DONE 2026-05-04 |
| Daily entry sheet view — Terminal + Bypass tabs (slices 2-3) | ✅ DONE 2026-05-06 |
| Special trains (master-less rows, sheet_source + section snapshot) | ✅ DONE 2026-05-06 |
| Section visual demarcation + cross-segment switcher + dashboard live counts | ✅ DONE 2026-05-06 |
| Save-all bar + Ctrl+S shortcut | ✅ DONE 2026-05-06 |
| Mis-link reports page (slice 4) — list, by-shed, train history, loco history | ✅ DONE 2026-05-06 |
| Mis-link tier classification (real vs zone-acceptable) | ✅ DONE 2026-05-07 |
| `expected_loco_type` / `accepted_loco_types` on master; HOG canonicalized to P/7 | ✅ DONE 2026-05-07 |
| Shed → railway-zone map endpoint for `CR/AQE` formatting | ✅ DONE 2026-05-07 |
| LTT rename (VVH-DN/UP → LTT-DN/UP) + 6 mail trains relocated | ✅ DONE 2026-05-07 |
| Sick / Dead loco position page with full xlsx-parity fields (slice 5) | ✅ DONE 2026-05-07 |
| Secondary loco semantics (rear / coupler / assist / dead_in_tow) | ✅ DONE 2026-05-08 |
| `+` button to add second loco; auto-split on `X+Y`; rear input accepts coupler verbatim | ✅ DONE 2026-05-08 |
| `main_loco_dead` + `failed_in_division` (Dead checkbox + before/in/after radios) | ✅ DONE 2026-05-08 |
| Cross-direction loco propagation (UP↔DN via outgoing/incoming) with reverse-pointer fill | ✅ DONE 2026-05-08 |
| Conflict validation (same-loco same-direction same-day → 409) | ✅ DONE 2026-05-08 |
| `outgoing_train_rear`, `remarks_rear` on log | ✅ DONE 2026-05-08 |
| Rear-row visibility on reload (CSS bug + rendering loop fix) | ✅ DONE 2026-05-08 |
| Sick-records `category` override + train-aware auto-detect (WAG hauling 12138 → COG) | ✅ DONE 2026-05-12 |
| **Loco Link section ready for LPC use in production** | ✅ READY |
| Sick loco section enhancements (under active development) | 🔄 IN PROGRESS |
| Loco management (transfer workflow, edit shed/zone) | ⏳ TODO (slice 6) |
| Available-loco picker for DN trains | ⏳ post-MVP |
| `div_trains` master (train names, from/to, type) | ⏳ deferred |

---

## Source data

`/Users/neeraja/loco-link/CO_Loco_link_final.xlsx` — 7 sheets, 414 master rows:

| Sheet | Rows | Notes |
|---|---|---|
| CSMT-DN / CSMT-UP | 51 each | mail/express trains from/to CSMT |
| **LTT-DN / LTT-UP** | 73 each | was named VVH (shed location); renamed to LTT (station code) on 2026-05-07 |
| KR-DN / KR-UP | 17 each | Konkan Railway trains |
| BYPASS | 132 (66 entries × 2 directions) | 8 routes, side-by-side xlsx unpivoted by importer |

Imported by `scripts/load_loco_link_master.js` — idempotent UPSERT on `(train_no, direction, from_station)`.

`/Users/neeraja/loco-link/locodb.csv` — 13,792 electric loco master, loaded by `scripts/load_locos.js`.

---

## Current schema (post-all-ALTERs)

The DDL below reflects the LIVE local state as of 2026-05-12. The migration files in `sql/` build up to this state in chronological order.

### `div_locos`

```sql
CREATE TABLE `div_locos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loco_number` varchar(20) NOT NULL,
  `loco_type` varchar(20) DEFAULT NULL,
  `traction_type` enum('Electric','Diesel','Dual') DEFAULT 'Electric',
  `railway_zone` varchar(10) DEFAULT NULL,
  `home_shed` varchar(20) DEFAULT NULL,
  `status` enum('Active','Transferred Out','Condemned') DEFAULT 'Active',
  `commission_date` date DEFAULT NULL,
  `traction_converter` varchar(30) DEFAULT NULL,
  `arno_siv` varchar(30) DEFAULT NULL,
  `rtis_oem` varchar(20) DEFAULT NULL,
  `hrpt_count` tinyint DEFAULT '0',
  `microprocessor_type` varchar(30) DEFAULT NULL,
  `hotel_load_oem` varchar(30) DEFAULT NULL,
  `data_source` enum('CSV_UPLOAD','LPC_ENTRY','MANUAL') DEFAULT 'CSV_UPLOAD',
  `entered_by` varchar(100) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loco_number` (`loco_number`),
  KEY `idx_railway_zone` (`railway_zone`),
  KEY `idx_loco_type` (`loco_type`),
  KEY `idx_home_shed` (`home_shed`),
  KEY `idx_status` (`status`),
  KEY `idx_traction` (`traction_type`),
  KEY `idx_data_source` (`data_source`)
);
```

### `div_loco_link_master` (planning template)

```sql
CREATE TABLE `div_loco_link_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sheet_source` varchar(30) NOT NULL,                    -- CSMT-DN / LTT-UP / KR-DN / BYPASS-LNL-BSR / etc.
  `sr_no` varchar(10) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,                     -- NE / SE / KR / BYPASS
  `direction` enum('UP','DN','BYPASS') NOT NULL,
  `is_bypass` tinyint(1) DEFAULT '0',
  `from_station` varchar(10) DEFAULT NULL,
  `to_station` varchar(10) DEFAULT NULL,                  -- bypass only
  `route_label` varchar(30) DEFAULT NULL,                 -- bypass: "LNL-BSR"
  `shed_code` varchar(10) DEFAULT NULL,                   -- canonical, matches div_locos.home_shed
  `link_attr` varchar(30) DEFAULT NULL,                   -- P/7 / P/4 / P/5 PUSHPULL / DSL / 130 kmph / AC/DC
                                                          -- (HOG was canonicalized to P/7 in 2026-05-07 migration)
  `expected_hog` tinyint(1) DEFAULT '0',                  -- derived from original link_attr contains "HOG"
  `is_push_pull` tinyint(1) DEFAULT '0',                  -- derived from link_attr contains "PUSHPULL"
  `traction_type` enum('Electric','Diesel','Other','Unknown') DEFAULT 'Electric',
  `expected_loco_type` varchar(20) DEFAULT NULL,          -- WAP7 / WAP4 / WAP5 / NULL (added 2026-05-07)
  `accepted_loco_types` varchar(100) DEFAULT NULL,        -- comma-list, e.g. "WAP5,WAP7" for P/7
  `rake_type` varchar(20) DEFAULT NULL,                   -- LHB / ICF / GS+VPH / LVPH
  `train_no` varchar(20) NOT NULL,
  `train_name` varchar(120) DEFAULT NULL,                 -- bypass only currently
  `event_time` varchar(30) DEFAULT NULL,                  -- raw HH:MM[:SS] string from xlsx
  `via_stations` json DEFAULT NULL,                       -- bypass intermediate timings
  `run_days` varchar(30) DEFAULT NULL,                    -- DAILY / 1,3,5
  `remark` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_train_dir_origin` (`train_no`,`direction`,`from_station`),
  KEY `idx_shed` (`shed_code`),
  KEY `idx_dir_section` (`direction`,`section`,`is_bypass`),
  KEY `idx_active_direction` (`active`,`direction`),
  KEY `idx_push_pull` (`is_push_pull`),
  KEY `idx_expected_type` (`expected_loco_type`)
);
```

### `div_loco_link_log` (daily LPC entries)

```sql
CREATE TABLE `div_loco_link_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `working_date` date NOT NULL,
  `direction` enum('UP','DN','BYPASS') NOT NULL,
  `train_no` varchar(20) NOT NULL,
  `master_id` int DEFAULT NULL,                           -- NULL for LPC-added special trains
  `sheet_source` varchar(30) DEFAULT NULL,                -- snapshot from master (or LPC-provided for specials)
  `section` varchar(20) DEFAULT NULL,                     -- snapshot from master
  `actual_loco_no` varchar(20) DEFAULT NULL,              -- the MAIN/assigned loco (LPC's primary focus)
  `main_loco_dead` tinyint(1) DEFAULT '0',                -- 1 = main loco hauled dead (failed)
  `failed_in_division` tinyint(1) DEFAULT NULL,           -- 1 = failed in our div, 0 = before/after our div, NULL = not dead
  `actual_loco_no_rear` varchar(20) DEFAULT NULL,         -- second loco; can be "X+Y" string for coupler-as-assist
  `secondary_role` enum('rear','coupler','assist','dead_in_tow') DEFAULT NULL,
  `base_shed` varchar(10) DEFAULT NULL,
  `base_shed_rear` varchar(10) DEFAULT NULL,
  `loco_type` varchar(20) DEFAULT NULL,
  `loco_type_rear` varchar(20) DEFAULT NULL,
  `traction_type` enum('Electric','Diesel','Dual') DEFAULT NULL,
  `hog` tinyint(1) DEFAULT NULL,                          -- LPC-filled: was loco run with HOG on
  `incoming_train` varchar(20) DEFAULT NULL,              -- previous train (typically used on DN rows)
  `outgoing_train` varchar(20) DEFAULT NULL,              -- next train (typically used on UP rows)
  `outgoing_train_rear` varchar(20) DEFAULT NULL,         -- next train for rear/assist loco
  `expected_shed` varchar(10) DEFAULT NULL,               -- snapshot from master
  `is_mislink` tinyint(1) DEFAULT '0',                    -- expected_shed != base_shed (strict)
  `is_mislink_rear` tinyint(1) DEFAULT '0',               -- only set when secondary_role='rear' (push-pull)
  `remark` varchar(255) DEFAULT NULL,
  `remarks_rear` varchar(500) DEFAULT NULL,               -- dedicated remarks for the rear loco
  `entered_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_train_dir` (`working_date`,`train_no`,`direction`),
  KEY `idx_loco_date` (`actual_loco_no`,`working_date`),
  KEY `idx_train_date` (`train_no`,`working_date`),
  KEY `idx_mislink_date` (`is_mislink`,`working_date`),
  KEY `idx_base_shed_date` (`base_shed`,`working_date`),
  KEY `idx_master` (`master_id`),
  KEY `idx_loco_rear_date` (`actual_loco_no_rear`,`working_date`),
  KEY `idx_sheet_date` (`sheet_source`,`working_date`),
  KEY `idx_secondary_role` (`secondary_role`),
  KEY `idx_main_dead` (`main_loco_dead`)
);
```

### `div_loco_sick_records` (sick / dead loco workflow)

```sql
CREATE TABLE `div_loco_sick_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loco_number` varchar(20) NOT NULL,
  `sick_from` date NOT NULL,
  `ineffective_time` time DEFAULT NULL,
  `sick_at_shed` varchar(10) DEFAULT NULL,                -- place where it became sick
  `sick_train_no` varchar(20) DEFAULT NULL,               -- train it failed on
  `current_location` varchar(30) DEFAULT NULL,            -- where the loco is now
  `status` enum('U/R','RDY','WKG','DEAD','H/O') DEFAULT 'U/R',
  `category` enum('COG','GOODS','COG-DSL','GOODS-DSL','OTHER') DEFAULT NULL
                                COMMENT 'Manual override; NULL = use auto-detect',
  `shed_arr_date` date DEFAULT NULL,                      -- KYN ELS ARR DATE
  `shed_arr_time` time DEFAULT NULL,                      -- KYN ELS ARR TIME
  `sick_reason` varchar(255) DEFAULT NULL,                -- DEFECT
  `sicked_by` varchar(100) DEFAULT NULL,
  `fit_from` date DEFAULT NULL,                           -- READY DATE (= closes the record)
  `ready_time` time DEFAULT NULL,
  `fitted_by` varchar(100) DEFAULT NULL,
  `fit_remarks` varchar(255) DEFAULT NULL,
  `hoc_train_no` varchar(20) DEFAULT NULL,                -- which train will tow the dead loco home
  `hoc_date` date DEFAULT NULL,
  `sch_done` varchar(50) DEFAULT NULL,                    -- last maintenance schedule code+date
  `paired_with_id` int DEFAULT NULL,                      -- for coupler-pair failures
  `remarks` varchar(500) DEFAULT NULL,                    -- ACTION TAKEN AND REMARK
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_loco` (`loco_number`),
  KEY `idx_currently_sick` (`loco_number`,`fit_from`),
  KEY `idx_dates` (`sick_from`,`fit_from`)
);
```

---

## Migration history (chronological)

| Date | File | What it does |
|---|---|---|
| 2026-04-23 | `sql/2026-04-23_div_locos.sql` | CREATE `div_locos` table (later patched in-place to add `hotel_load_oem`) |
| 2026-05-04 | `sql/2026-05-04_div_locos_traction.sql` | ALTER `div_locos` — add `traction_type`, `data_source`, `entered_by` for diesel-incremental flow |
| 2026-05-04 | `sql/2026-05-04_div_loco_link.sql` | CREATE `div_loco_link_master` + `div_loco_link_log` |
| 2026-05-04 | `sql/2026-05-04_loco_link_extras.sql` | Push-pull columns on log + master; CREATE `div_loco_sick_records` (initial slim version) |
| 2026-05-04 | `sql/2026-05-04_lpc_role.sql` | Add `'lpc'` to `users.div_role` ENUM |
| 2026-05-08 | `sql/2026-05-08_loco_link_round_2.sql` | **CONSOLIDATED** — all post-baseline ALTERs in one file (HOG→P/7, type columns, secondary_role, main_loco_dead, failed_in_division, outgoing_train_rear, remarks_rear, sheet_source/section on log, sick-records xlsx-parity, **category override on sick**, VVH→LTT rename) |

Run them in this order for a fresh production deploy. After each ALTER file, run the corresponding loader script (see PENDING-DB-CHANGES.md §11 for the exact sequence).

---

## Conventions & business rules

### Mis-link tiers (computed at report-time, not stored)

Strict mis-link = `expected_shed ≠ base_shed`, stored as `is_mislink=1` on the log.

If either `expected_shed` or `base_shed` is NULL/blank, the row is **incomplete for mis-link analytics** and stores `is_mislink=0`. It must not be counted as a real mis-link or zone-acceptable mis-link until both sheds are known. The same rule applies to rear-loco mis-link checks.

Report-time classification splits these into:

- **OK** — shed matches (no mis-link)
- **Zone-acceptable** — shed differs BUT zone(actual) == zone(expected) AND `loco_type ∈ accepted_loco_types` → operationally fine, not a real concern
- **Real mis-link** — shed differs AND (zone differs OR type fails) → actionable

Type-matching uses `accepted_loco_types` from the master row:

| `link_attr` | `expected_loco_type` | `accepted_loco_types` |
|---|---|---|
| P/7 (incl. former HOG) | WAP7 | WAP5,WAP7 |
| P/4 | WAP4 | WAP4 |
| P/5 PUSHPULL | WAP5 | WAP5 |
| DSL / 130 kmph / AC/DC | NULL | NULL (no type check) |

### Secondary loco role semantics

| Role | Meaning | Mis-link check |
|---|---|---|
| `rear` | Push-pull (one at each end of train) | Both ends checked independently |
| `coupler` | Pre-coupled goods pair (both at front, same shed) | Front only |
| `assist` | Rescue loco helping main (which may be dead) | Front only |
| `dead_in_tow` | Second loco is a dead passenger (rare) | Front only |

The **front** (`actual_loco_no`) is ALWAYS the originally-assigned main loco — even when dead. Mis-link analytics anchor on the link decision (the assignment), not on the rescue.

### Main-loco-dead flag

When the main loco failed:
- `main_loco_dead = 1`
- `failed_in_division` = 1 (failed in our div) / 0 (failed outside our div) / NULL (unknown)
- Rear slot holds the assist loco with `secondary_role='assist'`

For UP trains: outside = "before our div" (handover div's responsibility)
For DN trains: outside = "after our div" (next div's responsibility)
For BYPASS trains: outside = "outside our div / not attributable to BB"

UI radios switch labels based on the page direction.

### Coupler-as-assist (3 locos in one entry)

When a coupler pair rescues a failed main (3 locos total: failed + 2-loco coupler):
- Front = the failed main (e.g. 37310)
- Rear input accepts verbatim `"27342+27333"` — stored as-is
- `base_shed_rear` snapshot is from the FIRST part only
- Loco history queries find both via `LIKE` patterns
- `secondary_role = 'assist'`

For sick-loco coupler-pair failures, create two `div_loco_sick_records` rows and cross-link them with `paired_with_id` in both directions. `paired_with_id` is only a workflow link; each loco still has its own status, fit fields, and remarks. The UI does not yet support entering the pair as one operation.

### Cross-direction auto-propagation

When a saved log row has `outgoing_train` (UP→DN) or `incoming_train` (DN→UP) set:
- Backend auto-fills the target train's log with the same loco
- Sets the reverse pointer (incoming on DN target = source UP train, and vice versa)
- Only fills if target's `actual_loco_no` is empty (won't overwrite)
- Target master must exist + be running today
- Result returned in `propagated[]` array of the POST response

### Conflict validation

Same loco can't be on two trains in the SAME direction same day:
- Backend rejects with 409 listing the conflicting train
- UP↔DN reassignment OK (loco arrives UP, departs DN)
- Coupler `X+Y` notation splits and checks both parts

### Sick-loco category determination

For grouping currently-sick locos into COG / GOODS / COG-DSL / GOODS-DSL sections:

1. **LPC override** wins — pick from the Category dropdown in the row
2. **Train-based auto** — if `sick_train_no` is in `div_loco_link_master`, the loco was on a passenger/express train → **COG** (regardless of loco class — a WAG hauling 12138 lands in COG)
3. **Loco-class fallback** — WAP/WCAM/WDP → COG; WAG/WCAG/WCM/WDG/WDM/EF → GOODS; WD prefix → DSL variant
4. **NULL** if ambiguous → LPC needs to set explicitly

### Edit window

- `EDITABLE_DAYS_PAST = 3` (constant in `locoLinkRoutes.js`)
- `EDITABLE_DAYS_FUTURE = 1`
- Older log rows lock as view-only; POST /log returns 403 outside the window

---

## Endpoints (mounted at `/api/division/loco-link`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/me` | session info |
| GET | `/loco/:n/details` | full loco record + sick status + last 5 trains worked |
| GET | `/loco/:n/autofill` | lightweight lookup (home_shed, loco_type, hotel_load_oem) — used by cell autofill |
| GET | `/shed-zone-map` | `{ shed: zone, ... }` cached by frontend for `CR/AQE` formatting |
| GET | `/dashboard-stats?date=` | totals + per-segment counts for the landing page |
| GET | `/today?sheet_source=&date=` | master rows + log rows + specials for a terminal segment |
| GET | `/today?direction=BYPASS&date=` | bypass rows |
| POST | `/log` | upsert daily log row. Runs sick-check, conflict-check, push-pull validation, mis-link computation, then cross-direction propagation. Returns `propagated[]` array if any cross-fill happened. |
| DELETE | `/log/:id` | delete a special-train log row (only allowed for `master_id IS NULL`) |
| POST | `/sick` | mark loco sick (all xlsx fields including `category` override) |
| PATCH | `/sick/:id` | update an open sick record's mid-flight fields |
| PATCH | `/sick/:id/fit` | close a sick record (sets `fit_from`, `ready_time`, `fitted_by`, `status='RDY'`) |
| GET | `/sick` | currently-sick locos with `derived_category` + `category_final` |
| GET | `/sick/history?loco=` | full sick episode history |
| GET | `/reports/mislinks?from=&to=&sheet=&shed=&loco=&train=` | flat mis-link list (frontend classifies tier) |
| GET | `/reports/by-shed?from=&to=` | aggregate per `base_shed` |
| GET | `/reports/by-expected-shed?from=&to=` | aggregate per `expected_shed` |
| GET | `/reports/train/:n/history?limit=` | recent entries for a train |
| GET | `/reports/loco/:n/history?limit=` | recent entries for a loco (front + rear UNION) |

---

## File map

| File | Purpose |
|---|---|
| `sql/2026-04-23_div_locos.sql` | Initial `div_locos` DDL |
| `sql/2026-05-04_div_locos_traction.sql` | ALTER `div_locos` — traction columns |
| `sql/2026-05-04_div_loco_link.sql` | CREATE `div_loco_link_master` + `div_loco_link_log` |
| `sql/2026-05-04_loco_link_extras.sql` | Push-pull cols + initial `div_loco_sick_records` |
| `sql/2026-05-04_lpc_role.sql` | Add `lpc` to `users.div_role` |
| `sql/2026-05-08_loco_link_round_2.sql` | **CONSOLIDATED** post-baseline ALTERs (one-file deploy) |
| `scripts/load_locos.js` | Loads `locodb.csv` → `div_locos` (idempotent, UPSERT on loco_number) |
| `scripts/load_loco_link_master.js` | Loads `CO_Loco_link_final.xlsx` → `div_loco_link_master` (handles HOG→P/7, push-pull detection, type derivation, bypass unpivot) |
| `routes/division/locoLinkRoutes.js` | All backend endpoints (mounted at `/api/division/loco-link`) |
| `routes/authRoutes.js` | LPC redirect to `/control-office/` on login |
| `server.js` | LPC role page protection + route mount |
| `public/control-office/index.html` | LPC portal dashboard + always-visible Loco Lookup widget |
| `public/control-office/daily-entry.html` | Sheet view — terminal + bypass + special trains + auto-propagation |
| `public/control-office/reports.html` | 4-tab reports (mis-link list with tier filter, by-shed, train history, loco history) |
| `public/control-office/sick-locos.html` | Sheet-style sick loco position with categorized sub-tables + LPC category override |
| `LOCO_LINK_FEATURE.md` | This doc |
| `LOCO_MASTER_MIGRATION.md` | The `div_locos` migration story (separate concern) |
| `sql/PENDING-DB-CHANGES.md` | §11 has the full deploy sequence for production |

---

## Test users (local)

```
username: bblpc1, bblpc2
password: lpcpass123
realm:    division
div_role: lpc
```

For production, create equivalent users with real LPC names — the bcrypt password upgrade in `routes/authRoutes.js` handles legacy plaintext on first login if needed.

---

## Open work (where to pick up)

### 🔄 Sick Loco section (in progress)

Last touched 2026-05-12. Remaining items LPC may ask for:
- **Coupler-pair sick** — when both halves of a coupler are sick together (xlsx pattern `38226+32660`). Schema has `paired_with_id` but UI doesn't yet support entering pairs as one operation.
- **History view** for a single loco's sick episodes (we have the endpoint `/sick/history?loco=`, no UI yet)
- **Shed-wise sick summary** report — how many sick at each shed right now, by category
- **Sick → Mis-link cross-link** — when a loco is currently sick, daily-entry should also forbid assigning it (already enforced via POST /log sick check). Verify the UI surfaces this clearly.

### ⏳ Loco Management (slice 6)

Not started. Scope:
- Bring `loco-management.html` UI across from rail-data-app (currently 942 lines, manages CR-zone locos)
- New version: multi-zone, traction-aware, writes to `div_locos`
- Loco edit (shed, zone, status), transfer workflow (writes to `div_loco_transfers` — empty table, ready to use)
- Mark condemned / transferred-out / active
- Search/filter + bulk operations
- Estimated ~700 LOC

### ⏳ Available-loco picker (post-MVP UX)

For DN trains, show a side panel listing locos available for assignment:
- Arrived in our div via a UP train (have log entry with direction=UP, working_date=today or yesterday)
- Not yet assigned to a DN train today
- Not currently sick
- Filter by base_shed for shed-aware allocation

Pure read-only feature on top of existing tables.

### ⏳ `div_trains` master (deferred)

Train name, from/to stations, train type. Optional but useful for display/reports. Schema sketched in earlier discussion but not implemented.

---

## Local dev quick-reference

```bash
# DB connect
mysql -u jay -p4310jay bbtro

# Verify schema matches this doc
mysql -u jay -p4310jay bbtro -e "SHOW CREATE TABLE div_loco_link_log\G"

# Server (from main repo, not worktree)
cd /Users/neeraja/bbtro
node server.js                  # binds to 3000
# OR
PORT=3001 node server.js        # for parallel testing

# Re-import master (after xlsx update)
node scripts/load_loco_link_master.js /Users/neeraja/loco-link/CO_Loco_link_final.xlsx

# Re-import locos (after csv update)
node scripts/load_locos.js /Users/neeraja/loco-link/ir_elec_loco_sample.csv
```

---

*Last updated: 2026-05-12 — Loco Link section production-ready; Sick Loco enhancements in progress; Loco Management not yet started.*
