# Loco Link Feature — Control Office Module

Daily loco-link tracking for BB Division: planning master + per-day LPC entry log + sick/dead loco workflow + analytics (mis-link tiers, train-loco history, loco-train history). Builds on `div_locos` (the all-India electric loco master) and the diesel-incremental flow.

---

## TL;DR for a fresh Claude session

If you're picking this up cold, read in this order:

1. **This doc** (the file you're reading)
2. **DDL block below** — gives you the exact current schema for the 4 tables
3. **[routes/division/locoLinkRoutes.js](routes/division/locoLinkRoutes.js)** — all backend endpoints (~1600 lines)
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
| Day-change logic for cross-direction propagation (midnight-crossing trains) | ✅ DONE 2026-05-17 |
| Conflict validation (same-loco same-direction same-day → 409) | ✅ DONE 2026-05-08 |
| `outgoing_train_rear`, `remarks_rear` on log | ✅ DONE 2026-05-08 |
| Rear-row visibility on reload (CSS bug + rendering loop fix) | ✅ DONE 2026-05-08 |
| Sick-records `category` override + train-aware auto-detect (WAG hauling 12138 → COG) | ✅ DONE 2026-05-12 |
| **Loco Link section ready for LPC use in production** | ✅ READY |
| Sick loco section enhancements (under active development) | 🔄 IN PROGRESS |
| Loco management (transfer workflow, edit shed/zone) | ⏳ TODO (slice 6) |
| **WTT tables** (`div_stations`, `div_trains`, `div_train_stops`, `div_train_aliases`) | ✅ DONE 2026-05-20 |
| **Loco Availability Tracking** (`div_loco_positions`, `div_loco_position_history`) | ✅ DONE 2026-05-20 |
| Available-loco picker for DN trains | ✅ DONE 2026-05-20 |
| **Loco Defect Reporting** (`div_loco_defects`) | ✅ DONE 2026-05-22 |
| Defect reports by terminal and by shed | ✅ DONE 2026-05-22 |
| **Print functionality** (availability, sick, defects) | ✅ DONE 2026-05-23 |

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

The DDL below reflects the LIVE local state as of 2026-05-17. The migration files in `sql/` build up to this state in chronological order.

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

### `div_stations` (station master)

```sql
CREATE TABLE `div_stations` (
  `station_code` varchar(10) NOT NULL,
  `station_name` varchar(100) DEFAULT NULL,
  `division` varchar(20) DEFAULT 'BB',
  `zone` varchar(10) DEFAULT 'CR',
  `is_terminal` tinyint(1) DEFAULT '0',
  `is_junction` tinyint(1) DEFAULT '0',
  `km_from_csmt` decimal(6,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`station_code`)
);
```

### `div_trains` (train master)

```sql
CREATE TABLE `div_trains` (
  `train_no` varchar(10) NOT NULL,
  `train_name` varchar(120) DEFAULT NULL,
  `train_type` enum('Express','Superfast','Mail','Passenger','Suburban','Special','Goods') DEFAULT 'Express',
  `direction` enum('UP','DN') DEFAULT NULL,
  `run_days` varchar(20) DEFAULT NULL,
  `traction_type` enum('Electric','Diesel') DEFAULT 'Electric',
  `is_regular` tinyint(1) DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `from_station` varchar(10) DEFAULT NULL,      -- Division entry/departure point
  `to_station` varchar(10) DEFAULT NULL,        -- Division exit/terminal point
  `loco_change_station` varchar(10) DEFAULT NULL, -- Intermediate loco change (e.g., PNVL for bypass)
  PRIMARY KEY (`train_no`),
  KEY `idx_direction` (`direction`),
  KEY `idx_to_station` (`to_station`)
);
```

**Loco position detection columns:**
| Column | UP trains | DN trains |
|--------|-----------|-----------|
| `from_station` | Division entry (takeover point) | Departure terminal |
| `to_station` | Destination terminal | Handover point |
| `loco_change_station` | If set, loco becomes available here instead of OUT_OF_DIV | If set, loco becomes available here instead of OUT_OF_DIV |

**Example - Bypass with loco change:**
| train_no | direction | from | to | loco_change |
|----------|-----------|------|-----|-------------|
| 22149 | UP | RN | PUNE | PNVL |
| 22150 | DN | PUNE | RN | PNVL |

For 22149/22150, neither RN nor PUNE are Mumbai terminals. But since loco change happens at PNVL, the incoming loco is detached there and becomes available at PNVL.

### `div_train_aliases` (train renumbering history)

```sql
CREATE TABLE `div_train_aliases` (
  `old_train_no` varchar(10) NOT NULL,
  `new_train_no` varchar(10) NOT NULL,
  `renamed_date` date DEFAULT NULL,
  PRIMARY KEY (`old_train_no`),
  KEY `idx_new` (`new_train_no`)
);
```

### `div_train_stops` (station-wise timings)

```sql
CREATE TABLE `div_train_stops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `train_no` varchar(10) NOT NULL,
  `station_code` varchar(10) NOT NULL,
  `seq_order` int NOT NULL,
  `arrival_time` time DEFAULT NULL,
  `departure_time` time DEFAULT NULL,
  `is_halt` tinyint(1) DEFAULT '1',
  `platform_no` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_train_station` (`train_no`,`station_code`),
  KEY `idx_station` (`station_code`),
  KEY `idx_train` (`train_no`),
  KEY `idx_seq` (`train_no`,`seq_order`),
  CONSTRAINT `div_train_stops_ibfk_1` FOREIGN KEY (`train_no`) REFERENCES `div_trains` (`train_no`) ON DELETE CASCADE
);
```

### `div_loco_positions` (current loco positions)

```sql
CREATE TABLE `div_loco_positions` (
  `loco_number` varchar(20) NOT NULL,
  `current_location` enum('CSMT','LTT','DR','PNVL','VVH','KYN','TNA','IN_TRANSIT','OUT_OF_DIV') NOT NULL,
  `arrived_via_train` varchar(20) DEFAULT NULL COMMENT 'UP train that brought it (NULL if manual)',
  `arrived_at` datetime DEFAULT NULL COMMENT 'When it arrived at current location',
  `departed_via_train` varchar(20) DEFAULT NULL COMMENT 'DN train it left on (for reference)',
  `departed_at` datetime DEFAULT NULL COMMENT 'When it departed (for reference)',
  `remarks` varchar(255) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`loco_number`),
  KEY `idx_location` (`current_location`),
  KEY `idx_arrived_at` (`arrived_at`),
  KEY `idx_updated_at` (`updated_at`)
);
```

### `div_loco_position_history` (movement audit trail)

```sql
CREATE TABLE `div_loco_position_history` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `loco_number` varchar(20) NOT NULL,
  `from_location` varchar(20) DEFAULT NULL COMMENT 'Previous location (NULL for first entry)',
  `to_location` varchar(20) NOT NULL COMMENT 'New location',
  `movement_type` enum('ARRIVAL','DEPARTURE','TRANSFER','MANUAL') NOT NULL,
  `train_no` varchar(20) DEFAULT NULL COMMENT 'Associated train (if any)',
  `working_date` date DEFAULT NULL COMMENT 'Working date of the train movement',
  `moved_at` datetime NOT NULL COMMENT 'When the movement occurred',
  `remarks` varchar(255) DEFAULT NULL,
  `moved_by` varchar(100) DEFAULT NULL COMMENT 'User who recorded the movement',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_loco` (`loco_number`),
  KEY `idx_moved_at` (`moved_at`),
  KEY `idx_to_location` (`to_location`),
  KEY `idx_train` (`train_no`),
  KEY `idx_working_date` (`working_date`),
  KEY `idx_movement_type` (`movement_type`)
);
```

### `div_loco_defects` (defect tracking)

```sql
CREATE TABLE `div_loco_defects` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `loco_number` varchar(20) NOT NULL,
  `train_no` varchar(20) DEFAULT NULL,
  `working_date` date NOT NULL,
  `defect_category` enum('BRAKE','TRACTION','PANTOGRAPH','HOTEL_LOAD','AC','SPEEDOMETER','HORN','VIGILANCE','AUX_CONVERTOR','BATTERY','SI_UNIT','OTHER') NOT NULL DEFAULT 'OTHER',
  `description` varchar(500) NOT NULL,
  `severity` enum('MINOR','MAJOR','CRITICAL') DEFAULT 'MINOR',
  `home_shed` varchar(20) DEFAULT NULL,
  `loco_type` varchar(20) DEFAULT NULL,
  `reported_at_terminal` varchar(10) DEFAULT NULL COMMENT 'Terminal where defect reported (CSMT/LTT/PNVL)',
  `reported_by` varchar(100) DEFAULT NULL,
  `reported_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('OPEN','ACKNOWLEDGED','RESOLVED') DEFAULT 'OPEN',
  `resolved_by` varchar(100) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `resolution_remarks` varchar(500) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_loco` (`loco_number`),
  KEY `idx_date` (`working_date`),
  KEY `idx_shed` (`home_shed`),
  KEY `idx_terminal` (`reported_at_terminal`),
  KEY `idx_category` (`defect_category`),
  KEY `idx_status` (`status`)
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
| 2026-05-19 | `sql/2026-05-19_wtt_tables.sql` | CREATE `div_stations` + `div_trains` + `div_train_stops` + `div_train_aliases`; seed 153 stations + 6 train renumberings |
| 2026-05-20 | `sql/2026-05-20_loco_positions.sql` | ALTER `div_trains` (add from_station/to_station); CREATE `div_loco_positions` + `div_loco_position_history`; seed positions from recent UP logs |
| 2026-05-22 | `sql/2026-05-22_loco_change_station.sql` | ALTER `div_trains` add loco_change_station for bypass trains with intermediate loco changes (e.g., 22149/22150 at PNVL) |
| 2026-05-22 | `sql/2026-05-22_loco_defects.sql` | CREATE `div_loco_defects` for tracking defects reported by LPC on incoming locos |
| 2026-05-24 | `sql/fresh_import_div_trains.sql` | Fresh import of div_trains from `div_trains_stations.csv` (419 trains with correct from/to/direction) |

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
- Target master must exist + be running on the computed target date
- Result returned in `propagated[]` array of the POST response

#### Day-change logic (added 2026-05-17)

For trains that cross midnight, the target working_date may differ from the source:

**Priority rules** (checked in order):

1. **Already departed today**: If `working_date == today` AND `target_dep < current_IST_time` → **next day**
   - Train has already departed today, so assignment must be for tomorrow
   - Example: It's 14:00 IST, LPC assigns to 22177 (departs 00:15) → next day

2. **Time comparison**: If `target_dep < source_takeover` → **next day**
   - Standard logic for back-filling or when rule 1 doesn't apply
   - Example: UP takeover 22:05, DN departs 00:15 → next day

3. **Otherwise** → same day

| Current IST | Source (UP) Takeover | Target (DN) Dep | Result | Reason |
|-------------|----------------------|-----------------|--------|--------|
| 14:00 | 22:05 | 00:15 | **Next day** | `already_departed_today` |
| 23:30 | 22:05 | 00:15 | **Next day** | `already_departed_today` |
| 10:00 | 22:05 | 23:30 | Same day | `same_day` (23:30 > 10:00 & > 22:05) |
| 08:00 (back-fill) | 22:05 | 00:15 | **Next day** | `time_comparison` |
| 02:00 | 02:00 | 05:30 | Same day | `same_day` (05:30 > 02:00) |

**Notes**:
- UP `event_time` = takeover time at division entry (IGP/LNL/Roha), NOT arrival at terminal
- DN `event_time` = departure time from terminal
- All date calculations use **IST** (UTC+5:30), not server UTC
- LPC can override via "Same day" checkbox in the UI
- If target train doesn't run on the computed date, propagation skips with `status: 'no_run_on_target_date'`

**UI indicators**:
- Orange indicator: `→ 18-May (Sun)` for next-day assignments
- Red indicator if target train doesn't run on that date
- "☐ Same day" checkbox allows LPC to override auto-detection

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
| GET | `/train/:n/target-date?source_date=&source_time=&target_direction=` | preview target working_date for cross-direction propagation (returns `target_date`, `is_next_day`, `runs_on_target`, `display_date`) |
| GET | `/shed-zone-map` | `{ shed: zone, ... }` cached by frontend for `CR/AQE` formatting |
| GET | `/dashboard-stats?date=` | totals + per-segment counts for the landing page |
| GET | `/today?sheet_source=&date=` | master rows + log rows + specials for a terminal segment |
| GET | `/today?direction=BYPASS&date=` | bypass rows |
| POST | `/log` | upsert daily log row. Runs sick-check, conflict-check, push-pull validation, mis-link computation, then cross-direction propagation with day-change logic. Optional `outgoing_date_override` / `outgoing_date_override_rear` params to force same-day assignment. Returns `propagated[]` array with `target_date`, `is_next_day` if any cross-fill happened. |
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
| GET | `/positions?location=&all=` | list loco positions (grouped by terminal, or filtered by location) |
| POST | `/position` | manually move loco between terminals (`{ loco_number, to_location, remarks? }`) |
| GET | `/position/:n` | current position of a specific loco |
| GET | `/position/:n/history?limit=` | movement history for a loco |
| GET | `/available?terminal=` | locos available for DN train assignment at a terminal (not sick, not assigned DN today) |
| GET | `/assigned-today` | list of locos already assigned to DN trains today (used by availability page) |
| POST | `/defects` | report a new defect (auto-detects terminal from sheet_source) |
| GET | `/defects?loco=&from_date=&to_date=&category=&status=` | list defects with filters |
| GET | `/defects/by-shed?from_date=&to_date=&status=` | defects grouped by home shed |
| GET | `/defects/by-terminal?from_date=&to_date=&status=` | defects grouped by reported_at_terminal |
| GET | `/defects/for-log?loco=&date=` | defects for a specific loco/date (for daily-entry UI) |
| PATCH | `/defects/:id` | update defect status/resolution |

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
| `sql/2026-05-19_wtt_tables.sql` | WTT tables + station seed (153 stations) |
| `sql/2026-05-20_loco_positions.sql` | Loco position tracking tables + from/to station columns on div_trains |
| `scripts/load_locos.js` | Loads `locodb.csv` → `div_locos` (idempotent, UPSERT on loco_number) |
| `scripts/import-wtt.js` | Loads `Train_Timings_Summary.xlsx` → `div_trains` + `div_train_stops` (sorts stops by time for correct geographic sequence; syncs run_days from div_loco_link_master) |
| `scripts/load_loco_link_master.js` | Loads `CO_Loco_link_final.xlsx` → `div_loco_link_master` (handles HOG→P/7, push-pull detection, type derivation, bypass unpivot) |
| `routes/division/locoLinkRoutes.js` | All backend endpoints (mounted at `/api/division/loco-link`) |
| `routes/authRoutes.js` | LPC redirect to `/control-office/` on login |
| `server.js` | LPC role page protection + route mount |
| `public/control-office/index.html` | LPC portal dashboard + always-visible Loco Lookup widget |
| `public/control-office/daily-entry.html` | Sheet view — terminal + bypass + special trains + auto-propagation |
| `public/control-office/reports.html` | 4-tab reports (mis-link list with tier filter, by-shed, train history, loco history) |
| `public/control-office/sick-locos.html` | Sheet-style sick loco position with categorized sub-tables + LPC category override + print |
| `public/control-office/loco-availability.html` | Loco availability by terminal with add/move/sick actions + print |
| `public/control-office/defect-reports.html` | Two-tab defect reports (by terminal / by shed) with filters + print |
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

Last touched 2026-05-22. Recent updates:

**Sick → Ready integration with Loco Availability (2026-05-22):**
- When a sick loco is marked Ready (status=RDY), it now appears in the loco availability page
- The system attempts to normalize the sick location (e.g., "VVH TS" → "VVH", "CSMT ELS" → "CSMT")
- If location cannot be normalized, a modal prompts the user to select the terminal where the loco is now available
- This ensures locos marked ready are immediately trackable for DN train assignment
- `PATCH /sick/:id/fit` now accepts `ready_at_shed` parameter for explicit terminal selection
- If already-fit record receives `ready_at_shed`, it updates just the position (allows correction)

Remaining items LPC may ask for:
- **Coupler-pair sick** — when both halves of a coupler are sick together (xlsx pattern `38226+32660`). Schema has `paired_with_id` but UI doesn't yet support entering pairs as one operation.
- **History view** for a single loco's sick episodes (we have the endpoint `/sick/history?loco=`, no UI yet)
- **Shed-wise sick summary** report — how many sick at each shed right now, by category
- **Sick → Mis-link cross-link** — when a loco is currently sick, daily-entry should also forbid assigning it (already enforced via POST /log sick check). Verify the UI surfaces this clearly.

### ✅ Loco Defect Reporting (completed 2026-05-22)

Track defects reported by LPC on incoming locos (UP trains) for terminal and shed-wise analysis.

**Schema:**
```sql
CREATE TABLE div_loco_defects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loco_number VARCHAR(20) NOT NULL,
    train_no VARCHAR(20),
    working_date DATE NOT NULL,
    defect_category ENUM('BRAKE','TRACTION','PANTOGRAPH','HOTEL_LOAD','AC','SPEEDOMETER','HORN','VIGILANCE','AUX_CONVERTOR','BATTERY','SI_UNIT','OTHER'),
    description VARCHAR(500) NOT NULL,
    severity ENUM('MINOR','MAJOR','CRITICAL'),
    home_shed VARCHAR(20),              -- From div_locos lookup
    loco_type VARCHAR(20),
    reported_at_terminal VARCHAR(10),   -- Terminal where defect reported (CSMT/LTT/PNVL)
    reported_by VARCHAR(100),
    reported_at DATETIME,
    status ENUM('OPEN','ACKNOWLEDGED','RESOLVED'),
    resolved_by VARCHAR(100),
    resolved_at DATETIME,
    resolution_remarks VARCHAR(500)
);
```

**Categories:** BRAKE, TRACTION, PANTOGRAPH, HOTEL_LOAD, AC, SPEEDOMETER, HORN, VIGILANCE, AUX_CONVERTOR (Auxiliary Convertor), BATTERY (Battery/Battery Charger), SI_UNIT, OTHER

**Endpoints:**
- `POST /defects` — report a new defect (auto-detects terminal from sheet_source)
- `GET /defects` — list defects (filters: loco, shed, terminal, category, status, date range)
- `GET /defects/by-shed` — grouped by home shed for reports
- `GET /defects/by-terminal` — grouped by reported_at_terminal (CSMT/LTT/PNVL)
- `GET /defects/for-log` — defects for specific loco/date
- `PATCH /defects/:id` — update status/resolution

**UI:**
- **daily-entry.html**: Wrench button (🔧) on UP rows next to loco input. Opens modal to report defect with category, severity, description. Info tip bar explains feature to new LPC users (can be dismissed, saved in localStorage).
- **defect-reports.html**: Two-tab report (By Terminal / By Home Shed) with filters (date range, category, status). Summary cards show total defects, critical, major, and group counts. Print button for simple Excel-like printout.

**Flow:**
1. LPC enters loco number for UP train
2. If defect observed, clicks 🔧 button
3. Modal opens with category dropdown, severity, description
4. Submit creates defect record with loco's home_shed + reported_at_terminal auto-populated
5. Reports page shows defects grouped by terminal or by shed for analysis

### ⏳ WTT Management Page

Not started. Scope:
- View all trains with halts/timings
- Add/edit/delete train halts
- Edit arrival/departure times
- Bulk import from Excel
- Required for SPM analysis app (under development)

### ⏳ Loco Management (slice 6)

Not started. Scope:
- Bring `loco-management.html` UI across from rail-data-app (currently 942 lines, manages CR-zone locos)
- New version: multi-zone, traction-aware, writes to `div_locos`
- Loco edit (shed, zone, status), transfer workflow (writes to `div_loco_transfers` — empty table, ready to use)
- Mark condemned / transferred-out / active
- Search/filter + bulk operations
- Estimated ~700 LOC

### ✅ Loco Availability Tracking (completed 2026-05-20)

Track loco positions at Mumbai division terminals to enable DN train assignment.

**How it works:**
- When an UP train is logged with a loco, the loco's position is automatically set to the terminal (CSMT/LTT/DR/PNVL/VVH/KYN/TNA)
- When a DN train is logged, the loco is marked as OUT_OF_DIV (departed the division)
- Manual transfers between terminals are supported via POST /position
- Full movement history is maintained in `div_loco_position_history`

**Available Loco Picker (DN sheets):**
- Side panel shows locos available at the departure terminal
- Filters out: sick locos, locos already assigned to DN trains today
- Click-to-fill: clicking a loco fills the focused loco input field
- Shows loco type, home shed, arrival train, and arrival time

**Terminal detection:**
- Uses `div_trains.from_station` and `div_trains.to_station` columns (pre-computed from WTT)
- Falls back to `div_train_stops` if train not in master
- Mumbai terminals: CSMT, LTT, DR, PNVL, VVH, KYN, TNA
- Non-Mumbai destinations: mark as OUT_OF_DIV (handover points like IGP, LNL, ROHA)
- **Loco-change bypass trains** (e.g., 22149/22150 RN↔PUNE): Uses `loco_change_station` column — incoming loco from either direction becomes available at that station (PNVL)

**Files:**
- `sql/2026-05-20_loco_positions.sql` — migration + seed from recent logs
- `routes/division/locoLinkRoutes.js` — position endpoints + auto-update in POST /log
- `public/control-office/daily-entry.html` — available-loco picker panel

### ✅ WTT Tables (completed 2026-05-20, updated 2026-05-24)

Working Time Table tables for BB Division — station master, train master with names and run_days, station-wise timings, and train renumbering history.

**Tables created:**

| Table | Rows | Purpose |
|-------|------|---------|
| `div_stations` | 153 | Station master (code, name, terminal/junction flags) |
| `div_trains` | 419 | Train master — imported fresh from `div_trains_stations.csv` with correct from_station/to_station/direction |
| `div_train_stops` | 0 (deferred) | Station-wise timings — table exists but data import deferred |
| `div_train_aliases` | 6 | Train renumbering history (old_train_no → new_train_no) |

**Data source for div_trains:** `div_trains_stations.csv` (419 Mumbai division trains with correct from_station, to_station, direction, run_days)

**Deferred: Halts data (div_train_stops)**
- Station-wise arrival/departure timings not yet imported
- Required for SPM (Speed/Punctuality Monitoring) analysis app (under development)
- Will need comprehensive WTT data with all halts
- **TODO:** Create WTT management page with:
  - View train halts/timings
  - Add/edit/delete halts
  - Edit halt timings
  - Bulk import from Excel

**Data cleanup performed:**
- Removed trains that don't touch Mumbai division (BSR/MMR/JL only → 95 trains)
- Removed incomplete 99xxx series trains (22 trains)
- Removed `*` and `#` prefixes from train numbers
- Deleted orphan trains 11113, 11114, 11119, 11120
- All 398 remaining trains have `train_name` and `run_days` populated

**Train renumbering handled:**
| Old | New | Notes |
|-----|-----|-------|
| 12519 | 15659 | Renamed train |
| 12520 | 15660 | Renamed train |
| 12617 | 19301 | Renamed train |
| 12618 | 19302 | Renamed train |
| 17031 | 17003 | Renamed train |
| 17032 | 17004 | Renamed train |

**Important: run_days semantics**
- `run_days` in `div_trains` represent **takeover days at Mumbai division**, NOT departure day from origin station
- Example: Train 11007 (Deccan Express) departs Pune 07:15, but run_days = "Daily" means it's taken over at Lonavla/Karjat daily (arrives Mumbai same day)
- For overnight trains, the run_day may differ from origin departure by 1 day

**Files:**
- `sql/2026-05-19_wtt_tables.sql` — migration with all tables + station seed
- `scripts/import-wtt.js` — ETL script for Train_Timings_Summary.xlsx (sorts stops by time for correct geographic sequence)

**Source data:**
- `Train_Timings_Summary.xlsx` — 538 trains with station-wise timings
- Train names from user-provided screenshots
- run_days from `div_loco_link_master` (372 trains) + manual entry for remaining

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

*Last updated: 2026-05-23 — Added loco defect reporting (div_loco_defects table with by-terminal and by-shed reports), loco_change_station for bypass trains with intermediate loco changes, and print functionality for loco-availability, sick-locos, and defect-reports pages.*
