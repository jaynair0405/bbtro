# Control Office Loco-Link — Architecture Review & Rebuild Proposal

> Working document. Status: **draft for discussion**, not committed to.
> Captures the current data model, the specific drawbacks we've hit in
> production-equivalent usage, the proposed remedial redesign, and how
> the upcoming WTT halts data + RTIS Python integration fit in.
>
> Date: 2026-06-02

---

## 1. Where we are today

### 1.1 The tables and what they hold

| Table | Purpose | Granularity | Rowcount (local) |
|---|---|---|---|
| `div_trains` | Train master — identity + Mumbai-segment endpoints + run days | 1 row per `train_no` | 421 |
| `div_train_aliases` | Renumbering history (`old_train_no` → `new_train_no`) | 1 row per rename | 6 |
| `div_loco_link_master` | Per-sheet loco-link allocation (shed, link slot, event time) | 1 row per (sheet_source, train_no, direction) — multiple per train when train works multiple Mumbai legs | 416 |
| `div_loco_link_log` | LPC's daily entries — actual loco assigned, mis-link computation, propagation | 1 row per (working_date, master_id OR inline-special) | grows with use |
| `div_train_stops` | WTT halt timings | per (train_no, station) | **0 — empty** |
| `div_stations` | Station master | per `station_code` | 153 |
| `div_locos` | Loco master | per `loco_number` | ~14 000 |
| `div_loco_sick_records` | Sick/dead loco lifecycle | 1 row per sick episode | grows |
| `div_loco_defects` | Defect reports on locos | per report | grows |
| `div_loco_positions` | Where each loco currently is | 1 row per `loco_number` | grows |
| `div_loco_position_history` | Loco movement audit trail | 1 row per movement | grows |

### 1.2 How they were built — and why that matters

Chronology (key dates):

```
2026-05-04   div_loco_link_master + div_loco_link_log created from xlsx
             (CO_Loco_link_final.xlsx — 414 rows loaded)
2026-05-19   div_trains + div_train_stops + div_train_aliases introduced
             (WTT migration — train master comes AFTER link master)
2026-05-24   Fresh import of div_trains from div_trains_stations.csv
             (~419 trains — but only the trains in that CSV)
```

The result of that ordering: **`div_loco_link_master` and `div_trains` were never formally linked**. They both have `train_no` columns, but no FK. They were loaded from different source files at different times.

### 1.3 Concrete symptoms we've hit

- **Orphan master rows.** Trains `09057` and `09058` had entries in `div_loco_link_master` (BYPASS rows for ST↔MAJN H/SPL) but **no row in `div_trains`**. LPC searched the Trains tab in Settings, got "not found", and created `19057`/`19058` as "new trains". The old numbers still run in the bypass sheets — the new numbers are floating with empty `sheet_source`. Three sources of truth for two trains.

- **Renumber erases nothing in master/log/sick/defects.** Today's renumber endpoint:
  1. Inserts an alias row (`old_train_no → new_train_no`)
  2. UPDATEs `div_trains.train_no`
  
  It does NOT cascade to `div_loco_link_master`, `div_loco_link_log`, `div_loco_sick_records`, `div_loco_defects`, `div_loco_positions`, `div_loco_position_history`. So a renumber leaves ~5 tables holding the now-historical number. Reports filtering on the new number miss those rows. The user's specific concern:
  
  > "if change old names altogether, later it will be hard to find which train was that on date so and so. also if LPC had put remark or any HOC data in loco sick or defect, then also it can't find."
  
  This is exactly the structural risk.

- **`from_station` / `to_station` has three meanings across three tables.**

  | Table | What `from_station` means |
  |---|---|
  | `div_trains` | Mumbai operational segment start (staff beat — e.g., RN for 22119) |
  | `div_loco_link_master` | Where the loco-link event happens (takeover at LNL/IGP/ROHA; terminal departure for DN sheets) |
  | `div_loco_link_log` (added 2026-06-01) | Inline-special's origin terminal (for KR-DN destination grouping) |

  These are different things using the same column name. Even after we documented the dual meaning, future-anyone has to keep notes.

- **Duplicated columns**. `train_name` and `run_days` exist on both `div_trains` and `div_loco_link_master`. Master's are mostly NULL — we COALESCE in queries to fall back to `div_trains`. Pure duplication waiting to drift.

- **`sheet_source` and `section` are free text strings**, encoding multiple concepts:
  - `sheet_source` = terminal + direction (`CSMT-UP`) OR route prefix + entry + exit (`BYPASS-LNL-BSR`)
  - `section` = `NE` / `SE` / `KR` / `BYPASS` (a regional/operational classifier, no master, no enum)
  
  Anything reading these has to parse strings. KR-UP destination grouping is a special case bolted on in renderRoutesView. The next operational quirk will need another special case.

- **Inline specials are second-class citizens.** Until 2026-06-01 they didn't have origin/destination/event_time at all. We added those columns to `div_loco_link_log`, but the train **identity** for an inline special is still just a free-text `train_no` with no link to `div_trains`. If LPC types a number for a train no one's catalogued, it goes into the log naked. Tomorrow nobody knows what train that was.

- **No FK constraints anywhere on `train_no`.** Master, log, sick, defects all reference `train_no` as plain VARCHAR. Renumber breaks them silently. Typos persist.

### 1.4 The honest assessment

The architecture isn't fundamentally broken — it grew organically, the daily-entry UX is good, the reports/sick/defect/position workflows work. But:

1. **`train_no` is being used as both natural key AND display label**. Those are different jobs.
2. **No FKs → drift is inevitable** (we hit it with 09057/09058).
3. **Renumber is a structural risk**, not a workflow issue.
4. **WTT halts have nowhere to live** (table exists, empty, because there's no clean way to attach halts to a train-identity that's stable across renumbers).
5. **RTIS Python app will inherit all of this** — and its joins won't survive a renumber.

---

## 1.5 ⚠ CRITICAL — Loco takeover ≠ Staff beat

### Worked example: 22150 PUNE → ERS (and 22149 the reverse)

Documented in full because this exact pattern keeps producing confusion.

22150 runs PUNE → MAO → ERS. Mumbai division's involvement:

```
PUNE ──────► LNL ──────► PNVL ──────► ROHA ──────► RN ───► (handed to SR)
  │           │           │             │            │
  staff       loco         direction    loco         staff
  start       takeover     change       handover     end of
              (virtual)    + crew       (virtual)    Mumbai
                           change                    leg
```

Two distinct Mumbai segments:

**Segment A — SE-side leg (PUNE → PNVL)**
- Direction (Mumbai-ward / "UP"): going from PUNE towards Mumbai then north to PNVL
- **Staff beat**: PUNE → PNVL (one crew rake works this whole leg)
- **Loco takeover (virtual)**: **LNL** — this is the SE boundary; control office's view of the loco event starts here
- At **PNVL**: train direction changes (now heading south on Konkan side), so the loco physically detaches; that detached loco becomes available at PNVL → this is why LPC cares about PNVL
- Crew gets relieved at PNVL

**Segment B — KR-side leg (PNVL → RN)**
- Direction (south = "DN"): going from PNVL down to RN
- **Staff beat**: PNVL → RN (new crew picks up here)
- **Loco**: a NEW loco gets attached at PNVL → from a Mumbai-division standpoint, this is the segment's "loco event start"
- **Loco handover (virtual)**: **ROHA** — the KR boundary
- At RN the new crew gets relieved; train continues to SR

22149 is the reverse direction trip; same two-segment pattern with positions swapped.

This is **why we have two `div_loco_link_master` rows for 22149 and 22150** (and why they should both be on KR-UP / KR-DN with PNVL groupings). Same logic applies to any train where:
- Direction reverses mid-journey (forces loco swap), OR
- Crew relief happens at an intermediate station, OR
- Mumbai works the train across two division boundaries (SE + KR)

### Loco-takeover stations by section + direction

| Concept | Column | SE | NE | KR | DN sheets |
|---|---|---|---|---|---|
| **Loco takeover / handover** (control office) | `div_train_segments.loco_takeover_station` | **LNL** | **IGP** | **ROHA** | the terminal (CSMT/LTT) |
| **Staff beat start/end** (running staff) | `div_trains.from_station / to_station` | **PUNE** / **MMR** / **JL** | **IGP** / **MMR** / **JL** | **ROHA** / **RN** | the terminal |

### Examples that have tripped us up

| Train | Sheet | Right `loco_takeover_station` | Right `staff_from`/`staff_to` |
|---|---|---|---|
| 16553 (Bengaluru-LTT) | LTT-UP | **LNL** (SE boundary) | PUNE → LTT |
| 22119 (CSMT-MAO Tejas) | KR-DN | **ROHA** (KR boundary) | CSMT → RN |
| 22120 (CSMT-MAO Tejas) | KR-UP | **ROHA** (KR boundary) | RN → CSMT |
| 22150 (PUNE-ERS) SE leg | KR-UP (row 102) | **LNL** — NOT PUNE | PUNE → PNVL |
| 22150 (PUNE-ERS) KR leg | KR-DN (row 282) | **PNVL** (where new loco attaches) | PNVL → RN |
| 22149 (ERS-PUNE) KR leg | KR-DN (row 46) | **ROHA** | PNVL → RN |
| 22149 (ERS-PUNE) SE leg | KR-UP (row 265) | **LNL** | PUNE → ROHA approx |

### Backfill rule for `loco_takeover_station`

When seeding `div_train_segments` from `div_loco_link_master`, **do not blindly copy `from_station`** — it sometimes carries the staff-beat value (PUNE / MMR / JL / RN). Map to the actual takeover boundary:

```sql
CASE
    WHEN m.from_station = 'PUNE' THEN 'LNL'         -- SE-side staff beat
    WHEN m.from_station = 'MMR'  THEN 'IGP'         -- NE-side staff beat (Manmad)
    WHEN m.from_station = 'JL'   THEN 'IGP'         -- NE-side staff beat (Jalgaon)
    WHEN m.from_station = 'RN'   THEN 'ROHA'        -- KR-side staff beat (Ratnagiri)
    WHEN m.section='SE' AND m.direction='UP' THEN 'LNL'
    WHEN m.section='NE' AND m.direction='UP' THEN 'IGP'
    WHEN m.section='KR' AND m.direction='UP' THEN 'ROHA'
    WHEN m.direction='DN'     THEN m.from_station   -- DN: origin terminal stays
    WHEN m.direction='BYPASS' THEN m.from_station
    ELSE m.from_station
END
```

Edge cases (like 22150's PNVL leg where a NEW loco attaches at PNVL) need manual UPDATE — the rule covers the common case, not the direction-change-mid-trip case.



This distinction has bitten us repeatedly. Documenting prominently so future
migrations and code don't conflate them:

| Concept | Column | SE | NE | KR | DN sheets |
|---|---|---|---|---|---|
| **Loco takeover / handover** (control office) | `div_train_segments.loco_takeover_station` | **LNL** | **IGP** | **ROHA** | the terminal (CSMT/LTT) |
| **Staff beat start/end** (running staff) | `div_trains.from_station / to_station` | **PUNE** / **MMR** / **JL** | **IGP** / **MMR** / **JL** | **ROHA** / **RN** | the terminal |

**Examples that have tripped us up:**

| Train | Sheet | Right `loco_takeover_station` | Right `staff_from`/`staff_to` |
|---|---|---|---|
| 16553 (Bengaluru-LTT) | LTT-UP | **LNL** (SE boundary) | PUNE → LTT (Mumbai staff beat) |
| 22119 (CSMT-MAO Tejas) | KR-DN | **ROHA** (KR boundary) | CSMT → RN (staff beat) |
| 22120 (CSMT-MAO Tejas) | KR-UP | **ROHA** (KR boundary) | RN → CSMT |
| 22150 (CSMT-MAO Tejas) KR-UP leg | KR-UP | **LNL** (SE-side leg) — NOT PUNE | PUNE → CSMT (staff beat) |

**Rule of thumb when seeding segments from existing master data:**

The historical `div_loco_link_master.from_station` was meant to be the loco-event station, but in older xlsx imports it was sometimes filled with the **staff beat origin** (PUNE for SE trains) instead. When backfilling `div_train_segments.loco_takeover_station`, check:

- If `from_station` is `PUNE` → it's almost certainly a staff-beat value; the actual takeover is **LNL**
- If `from_station` is `MMR`/`JL` → similar; takeover for NE side is **IGP**
- If `from_station` is `RN` → takeover for KR side is **ROHA**

A normalization pass on `div_loco_link_master.from_station` (correcting staff-beat values to actual takeover boundaries) is needed **before** the segment backfill, OR the segment backfill must derive `loco_takeover_station` from `section` instead of trusting `from_station`.

---

## 2. Proposed architecture

### 2.1 Guiding principles

1. **`train_id` is the spine.** A surrogate INTEGER PK on `div_trains`. Every other table references `train_id`, never `train_no`.
2. **`train_no` is a label.** It can change. It's stored once in `div_trains` (current) and historically in `div_train_aliases`.
3. **Mumbai's view of a train is one or more *segments*.** Most trains have one segment. Bypass + loco-change trains (22149/22150) have two. This is modelled, not encoded in convention.
4. **WTT halts are first-class** — keyed by `train_id`, not `train_no`. RTIS reads these directly.
5. **Inline-special trains get a train_id at log time.** Either by matching an existing one (including aliases) or via an inline mini-form that creates one. No more naked train_no.
6. **Every other table** (master, log, sick, defects, positions) **gets `train_id` as the FK** and stores `train_no_snapshot` for display when historical accuracy matters.
7. **FK constraints enforced everywhere.** No more orphans.

### 2.2 Tables — new and revised

```
═══════════════════════════════════════════════════════════════════════════
Layer 1 — Train identity (stable)
═══════════════════════════════════════════════════════════════════════════

div_trains
  train_id                INT PK AUTO_INCREMENT             ← NEW
  current_train_no        VARCHAR(10) UNIQUE NOT NULL
  train_name              VARCHAR(120)
  train_type              ENUM(...)
  direction               ENUM('UP','DN','BYPASS')          ← train's broad direction
  traction_type           ENUM('Electric','Diesel')
  actual_origin           VARCHAR(10)                       ← Bengaluru, MAO etc.
  actual_destination      VARCHAR(10)                       ← end-to-end termini
  is_regular              TINYINT(1)
  is_active               TINYINT(1)
  created_at, updated_at

div_train_aliases
  train_id                INT FK → div_trains.train_id
  train_no                VARCHAR(10)                       ← any number this train ever used
  valid_from              DATE
  valid_until             DATE                              ← NULL = currently valid
  PRIMARY KEY (train_id, train_no)
  UNIQUE KEY (train_no, valid_from)                         ← search by old number → find train_id


═══════════════════════════════════════════════════════════════════════════
Layer 2 — Mumbai operational segments
═══════════════════════════════════════════════════════════════════════════

div_train_segments
  segment_id              INT PK
  train_id                INT FK → div_trains
  segment_label           VARCHAR(30)                       ← 'main', 'KR-leg', 'SE-leg'
  segment_direction       ENUM('UP','DN','BYPASS')          ← this leg's direction
  staff_from_station      VARCHAR(10)                       ← e.g., RN (where Mumbai staff start)
  staff_to_station        VARCHAR(10)                       ← e.g., CSMT (where they end)
  loco_takeover_station   VARCHAR(10)                       ← LNL / IGP / ROHA / PNVL etc.
  loco_handover_station   VARCHAR(10)                       ← usually the terminal for UP, NULL for DN
  event_time_takeover     TIME                              ← HH:MM:SS, proper type
  event_time_handover     TIME                              ← for halt-and-handover bypass
  halts_at_takeover       TINYINT(1)                        ← replaces bypass_halts
  sheet_source            VARCHAR(30)                       ← derived/stored: CSMT-UP, KR-DN, BYPASS-X-Y
  section_label           VARCHAR(20)                       ← NE/SE/KR — for grouping
  is_active               TINYINT(1)
  -- 22149 has 2 rows: KR-leg + SE-leg (because Mumbai works two legs)
  -- 12810 has 1 row: main NE leg


═══════════════════════════════════════════════════════════════════════════
Layer 3 — WTT halts (your CSV lives here)
═══════════════════════════════════════════════════════════════════════════

div_train_stops
  id                      INT PK
  train_id                INT FK → div_trains              ← NOT train_no
  seq_order               INT
  station_code            VARCHAR(10) FK → div_stations
  arrival_time            TIME NULL                         ← NULL at train origin
  departure_time          TIME NULL                         ← NULL at train destination
  event_type              ENUM('halt','pass_or_depart')     ← from your CSV
  day_offset              TINYINT DEFAULT 0                 ← for trains crossing midnight
  is_mumbai_segment_start TINYINT(1)                        ← marks where Mumbai's role begins
  is_mumbai_segment_end   TINYINT(1)                        ← where it ends
  segment_id              INT NULL FK → div_train_segments  ← which segment this stop belongs to
  UNIQUE KEY (train_id, seq_order)


═══════════════════════════════════════════════════════════════════════════
Layer 4 — Loco-link sheet allocation (the per-sheet plan)
═══════════════════════════════════════════════════════════════════════════

div_loco_link_master
  id                      INT PK
  segment_id              INT FK → div_train_segments      ← NOT train_no
  sr_no                   VARCHAR(10)
  shed_code               VARCHAR(10) FK → div_sheds        ← if we make a shed master
  link_attr               VARCHAR(30)
  expected_hog            TINYINT(1)
  is_push_pull            TINYINT(1)
  expected_loco_type      VARCHAR(20)
  accepted_loco_types     VARCHAR(100)
  rake_type               VARCHAR(20)
  effective_from          DATE                              ← scheduled specials
  effective_until         DATE
  skip_dates              JSON
  is_scheduled_special    TINYINT(1)
  run_days                VARCHAR(30)
  remark                  VARCHAR(255)
  active                  TINYINT(1)
  -- NO train_name, train_no, from_station, to_station, event_time
  -- All inherited from segment.


═══════════════════════════════════════════════════════════════════════════
Layer 5 — Daily LPC log (what actually ran)
═══════════════════════════════════════════════════════════════════════════

div_loco_link_log
  id                      INT PK
  working_date            DATE
  train_id                INT FK → div_trains              ← NOT train_no
  train_no_snapshot       VARCHAR(10)                       ← number that ran THAT DAY
                                                            (preserves history across renumbers)
  master_id               INT NULL FK → div_loco_link_master ← regular trains
  segment_id              INT NULL FK → div_train_segments  ← inline specials (no master row)
  sheet_source            VARCHAR(30)                       ← redundant w/ segment but useful for filters
  direction               ENUM('UP','DN','BYPASS')          ← redundant w/ segment
  actual_loco_no          VARCHAR(20) FK → div_locos
  actual_loco_no_rear     VARCHAR(20) FK → div_locos NULL
  secondary_role          ENUM(...)
  main_loco_dead          TINYINT(1)
  failed_in_division      TINYINT(1)
  base_shed, base_shed_rear, loco_type, loco_type_rear, traction_type
  hog                     TINYINT(1)
  incoming_train          VARCHAR(20)                       ← could later be train_id FK
  outgoing_train          VARCHAR(20)
  outgoing_train_rear     VARCHAR(20)
  expected_shed           VARCHAR(10)
  is_mislink              TINYINT(1)
  is_mislink_rear         TINYINT(1)
  remark, remarks_rear
  entered_by              VARCHAR(100)
  created_at, updated_at
  UNIQUE KEY (working_date, train_id, segment_id, direction)


═══════════════════════════════════════════════════════════════════════════
Layer 6 — Sick / defects / positions  (only change: add train_id)
═══════════════════════════════════════════════════════════════════════════

div_loco_sick_records, div_loco_defects, div_loco_positions
  + train_id              INT NULL FK → div_trains          ← train context
  + train_no_snapshot     VARCHAR(10)                       ← number when reported
  (existing columns unchanged)
```

### 2.3 Resolution flows in the new model

**LPC types `09057` (an old number that's now `19057`):**

```sql
SELECT a.train_id, t.current_train_no, t.train_name
FROM div_train_aliases a
JOIN div_trains t ON t.train_id = a.train_id
WHERE a.train_no = '09057' AND (a.valid_until IS NULL OR a.valid_until >= CURDATE())
LIMIT 1;
```

Returns the canonical train. UI shows "09057 (now 19057) — ST-MAJN Express". Save uses `train_id`.

**LPC types `01999` — a holiday special never seen before:**

Backend lookup fails. Frontend shows a mini-form:

```
Train 01999 isn't registered.

  Name:      [______________]
  Direction: ( ) UP   ( ) DN   ( ) BYPASS
  Sheet:     [CSMT-UP        ▼]
  Mumbai staff segment:  [________] → [________]
  Takeover station:      [________]   Event time: [____]
  Run days:  ☐Mon ☐Tue ...

  [ Cancel ]   [ Save & continue ]
```

On save: backend wraps in transaction:
1. INSERT `div_trains` (returns `train_id`)
2. INSERT `div_train_segments`
3. INSERT `div_loco_link_log` with this `train_id`

LPC continues. Future days with the same number → branch 1.

**Renumber 19057 → 21057 next year:**

```sql
START TRANSACTION;
UPDATE div_train_aliases SET valid_until = '<rename_date>' WHERE train_id=X AND valid_until IS NULL;
INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until) VALUES (X, '21057', '<rename_date>', NULL);
UPDATE div_trains SET current_train_no = '21057' WHERE train_id = X;
COMMIT;
```

Zero cascade. All existing log/sick/defect rows still reference `train_id = X` — they're not touched. Reports searching by `19057` still find them via `div_train_aliases`. Reports searching by `21057` find them via the current alias. Both work, forever.

### 2.4 How WTT data lands

Your CSV format:

```
train_no  train_name  train_origin  train_destination  station_code  station_name  arr_time  dep_time  event_type
10103     CSMT-MAO    CSMT          MAO                CSMT          MUMBAI C.S.M.T.            07:10     pass_or_depart
10103     CSMT-MAO    CSMT          MAO                DR            DADAR            07:25     07:28     halt
10103     CSMT-MAO    CSMT          MAO                TNA           THANE            07:51     07:58     halt
...
```

Loader logic:

```
FOR each unique train_no in CSV:
    1. Look up / create div_trains row (uses train_no as current_train_no,
       train_name from CSV, sets actual_origin + actual_destination).
    2. Insert div_train_aliases (train_id, train_no, today, NULL) if not exists.
FOR each row in CSV:
    3. Look up train_id from train_no via div_train_aliases.
    4. Look up station_code in div_stations (warn if missing — should
       error and let admin add station first).
    5. INSERT div_train_stops (train_id, seq_order, station_code,
                               arr_time, dep_time, event_type).
    6. Compute is_mumbai_segment_start / _end by matching
       station_code against div_train_segments.staff_from_station /
       _to_station.
```

After load:
- `div_train_stops` populated for all trains in CSV
- RTIS can query "what time should train_id=X be at station Y on date Z?"
- Daily-entry can show terminal arrival time under the train number (the feature we deferred earlier)
- Mis-link reports can correlate actual vs expected arrival time

### 2.5 What stays unchanged (LPC-visible)

- **Daily-entry sheet view** — Time / Train / Link / Loco / In-Out columns; section grouping; chip nav; train name below number; outgoing date picker; rear-loco defect; mark-as-sick; print/PDF
- **Sick Loco Mgmt** — same UI
- **Defect Reports** — same UI
- **Loco Availability** — same UI
- **Mis-link Reports** — same UI
- **Settings → Scheduled Specials / Trains / Loco Links** — same UI, but the underlying queries use `train_id`

So LPC doesn't notice the rebuild. Only internals change.

---

## 3. Phased migration plan

### Phase A — Identity layer (~1 week)

1. ALTER `div_trains` add `train_id INT AUTO_INCREMENT UNIQUE`. Backfill (it becomes the new PK eventually).
2. Convert `div_train_aliases` to the new shape with `valid_from`/`valid_until`. Backfill existing 6 rows with NULL valid dates.
3. **Audit**: for every distinct `train_no` referenced anywhere that has no `div_trains` row, INSERT a minimal `div_trains` row. (The 09057/09058 case.)
4. ALTER `div_loco_link_master`, `_log`, `_sick_records`, `_defects`, `_positions`, `_position_history` to add `train_id INT NULL`. Backfill via JOIN.
5. **Add FK constraints**.
6. Rewrite `POST /trains/:old/renumber` to use the new transaction.
7. Backend helper `getTrainIdByNo(train_no, date?)` for resolution.
8. Wire alias resolution in:
   - Loco Lookup widget on control-office home
   - Daily-entry train cell (badge for renumbered)
   - Defect modal (auto-resolves on save)
   - Reports (shows historical number when relevant)
9. Promote `train_id` to PRIMARY KEY on `div_trains` after backfill is complete.

**Outcome**: renumbering is non-destructive. Both numbers searchable. Inline specials get a train_id (via the mini-form for new ones). 09057/09058 case never recurs.

### Phase B — Segments + WTT (~1 week)

1. CREATE `div_train_segments`. Backfill from existing `div_loco_link_master`:
   - For each distinct `(train_id, direction)` create one segment row
   - For bypass+loco-change trains, create segments around `loco_change_station`
   - Copy `sheet_source`, `section`, `event_time`, `from_station`, `to_station` into segment columns
2. ALTER `div_loco_link_master` add `segment_id` FK. Backfill.
3. ALTER `div_loco_link_log` add `segment_id` FK. Backfill.
4. Load WTT CSV into `div_train_stops` (using `train_id`).
5. Drop duplicated columns from `div_loco_link_master`: `train_name`, `run_days`, `from_station`, `to_station`, `event_time`. (After verifying queries use segment data.)
6. Backend queries updated to JOIN segments where needed.

**Outcome**: Mumbai's view of multi-leg trains is first-class. WTT halts live in the right place. RTIS can JOIN cleanly.

### Phase C — Polish + Settings UI (~3–4 days)

1. Trains tab Edit shows train + all its segments + all its master rows (one screen).
2. Adding a train always goes through `div_trains` first; segment + master are sub-forms.
3. Inline-special mini-form (Branch 2 in §2.3 above) on daily-entry.
4. Settings → Renumber action gets an explicit dialog: *"Going forward LPC will see 21057. Historical entries under 19057 stay searchable. Reports on dates before today will show 19057."*
5. Document the architecture in `LOCO_LINK_FEATURE.md` (this doc graduates from `_REVIEW.md` to the architecture section).

### Phase D — RTIS prep (when you bring that work in)

- Helper views/queries documented for the Python app:
  - `getTrainByNo(no, date)` — alias-aware lookup
  - `getExpectedTime(train_id, station_code, date)` — from `div_train_stops`
  - `getActualVsExpected(loco_no, date)` — joins log + stops

---

## 4. Honest cost-benefit

**Cost**:
- 2–3 weeks elapsed dev for phases A+B+C (assuming dedicated focus)
- Risk during migration; needs careful backups and a rollback plan
- RTIS app's existing queries will need to update once Phase A lands

**Benefit**:
- Renumbering is structurally safe (your #1 concern)
- No more orphan rows possible (FKs)
- Single source of truth for train identity
- WTT halts get a clean home
- RTIS can rely on stable joins forever
- Adding a train via Trains tab will Just Work — no ambiguity
- Inline specials become first-class (no more naked `train_no` in logs)
- Future operational quirks (DR DESTINATION, BIRD origin, whatever) are handled by data, not code special-cases

---

## 5. What this doc is and is not

**Is**: a starting point for our discussion. Honest about the current shape. Specific about the rebuild. Phased so each step is reversible.

**Is not**: a commitment. Nothing changes in code until we agree.

Open questions for the discussion:
- Do we go A+B+C in sequence, or stop after A?
- Do we want a `div_sheds` master to enforce shed_code referential integrity? (Defer or do now?)
- For inline-special mini-form — should LPC be empowered to do it, or should it require ctlc role?
- WTT CSV: does it cover *all* trains LPC may encounter, or only Mumbai-crewed ones? (The user said "all trains — Mumbai crew working and others in it" — so yes, all.)
- For RTIS handoff: do we want documented views for them, or raw table access with the new schema?
- For the `from_station`/`to_station` semantics on `div_loco_link_log` we added yesterday — do we keep those as `inline_special_from` / `inline_special_to` for clarity, or drop once segment-based inline specials land?
