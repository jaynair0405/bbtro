# Signals Database Design — Mumbai Division (BBTRO)

## Overview

A centralized signals reference database for Mumbai Division, serving as foundation data for:
- **RTIS** — Recorder analysis
- **Sub-SPM** — Suburban train speed profiling
- **Mainline SPM** — Mail/Express train speed profiling
- **Ghat SPM** — KJT-LNL / KSRA-IGP ghat section analysis
- **AWS Malfunctions** — Tracking recurring failures by signal
- **Signal Sighting Committee** — (Deferred, future scope)
- **Future SPM projects** as needed

---

## Table Design

### 1. `div_signals` — Main Signal Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | INT AUTO_INCREMENT | PK | |
| `signal_number` | VARCHAR(30) | NO | As-is identifier: CSMT S54, K10, L051, TLA S2, etc. For unnamed distant signals, use convention like `TLA DIST UP` |
| `section` | VARCHAR(30) | NO | Section from route_graph reference (CSMT-KYN, KYN-KSRA, KYN-KJT, etc.) |
| `line` | VARCHAR(30) | NO | Line identifier (see Line Reference below) |
| `signal_type` | ENUM('Automatic', 'Semi-Automatic', 'Manual', 'Gate') | NO | |
| `function` | ENUM('Double Distant', 'Distant', 'Inner Distant', 'Home', 'Inner Home', 'Starter', 'Starter (Loop)', 'Advanced Starter', 'IBS', 'IBS Distant', 'Gate Distant') | YES | NULL for automatic signals and semi-automatic signals without a formal function |
| `aspects` | TINYINT | YES | Number of aspects: 2, 3, or 4 |
| `ri_left_arms` | TINYINT | NO DEFAULT 0 | Route indicator arms on left side |
| `ri_right_arms` | TINYINT | NO DEFAULT 0 | Route indicator arms on right side |
| `has_calling_on` | BOOLEAN | NO DEFAULT FALSE | Calling-on signal present |
| `has_shunt_signal` | BOOLEAN | NO DEFAULT FALSE | Shunt signal attached |
| `placement` | ENUM('Left', 'Right', 'Extreme Left', 'Extreme Right', 'Gantry (OHE)') | NO | Position relative to the track the signal pertains to |
| `km_from_csmt` | DECIMAL(7,3) | YES | Derived/calculated over time from ISD and known reference points |
| `latitude` | DECIMAL(9,6) | YES | From Google Maps collection |
| `longitude` | DECIMAL(9,6) | YES | From Google Maps collection |
| `visibility_distance_m` | INT | YES | Daytime visibility distance in meters (from Signal Sighting Committee inspections) |
| `speed_on_yellow` | INT | YES | Speed restriction in km/h when signal shows single yellow aspect (rare, most signals NULL) |
| `on_curve` | ENUM('Left', 'Right') | YES | NULL if not on a curve |
| `on_gradient` | ENUM('Rising', 'Falling', 'Level') | YES | NULL if not yet filled; laborious to populate |
| `remarks` | TEXT | YES | Free text for any additional context |
| `is_active` | BOOLEAN | NO DEFAULT TRUE | FALSE for decommissioned/removed signals |
| `created_at` | TIMESTAMP | NO DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NO ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- UNIQUE on (`signal_number`, `section`, `line`) — a signal number is unique within a section+line combination
- INDEX on `section`
- INDEX on `signal_type`
- INDEX on `is_active`

---

### 2. `div_signal_isd` — Inter-Signal Distance Relationships

Stores the distance from a preceding signal to the current signal. A signal may have **multiple entries** when it can be approached from different preceding signals (e.g., an Advanced Starter approached from Main Line Starter and Loop Line Starter).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | INT AUTO_INCREMENT | PK | |
| `from_signal_id` | INT | NO | FK → `div_signals.id` — the preceding signal |
| `to_signal_id` | INT | NO | FK → `div_signals.id` — the signal being approached |
| `distance_m` | INT | NO | Inter-signal distance in meters |
| `is_straight_route` | BOOLEAN | NO DEFAULT TRUE | TRUE for the main/straight route approach (default ISD); FALSE for loop/alternate approaches |
| `remarks` | VARCHAR(200) | YES | e.g., "via loop line", "via platform 3" |

**Indexes:**
- UNIQUE on (`from_signal_id`, `to_signal_id`)
- INDEX on `to_signal_id` — for querying "all approaches to this signal"

---

### 3. `div_signal_history` — Change Tracking

Tracks renumbering, relocation, deletion, and other changes for historical reference and backward compatibility with older recorder data.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | INT AUTO_INCREMENT | PK | |
| `signal_id` | INT | NO | FK → `div_signals.id` |
| `change_type` | ENUM('Renumbered', 'Relocated', 'Decommissioned', 'New', 'Type Changed', 'Placement Changed', 'Other') | NO | |
| `old_value` | VARCHAR(200) | YES | Previous value (e.g., old signal number, old placement) |
| `new_value` | VARCHAR(200) | YES | New value |
| `change_date` | DATE | YES | Date the change took effect |
| `remarks` | TEXT | YES | |
| `created_at` | TIMESTAMP | NO DEFAULT CURRENT_TIMESTAMP | |

---

### 4. `div_section_territory` — Section Territory Type Mapping

Maps each section (or sub-section) to its territory type. Signals inherit their territory from their section — no need to mark territory on each signal individually.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | INT AUTO_INCREMENT | PK | |
| `section` | VARCHAR(30) | NO UNIQUE | Section name matching route_graph / div_signals.section |
| `territory_type` | ENUM('Automatic', 'Absolute') | NO | |
| `remarks` | VARCHAR(200) | YES | |

**Initial known Automatic sections:** CSMT-KYN, KYN-TLA, KYN-KJT, LNL-PUNE, DIVA-PNVL (to be confirmed and expanded)

---

## Reference Values

### Line Identifiers

| Corridor / Section | Line Values |
|---------------------|-------------|
| CSMT-KYN | UP Local, DN Local, UP Through, DN Through |
| KYN-CLA | UP Local, DN Local, UP Through, DN Through, 5th Line, 6th Line |
| Harbour corridor | UP Harbour, DN Harbour, UP Trans Harbour, DN Trans Harbour |
| Beyond KYN towards IGP | UP NE, DN NE |
| Beyond KYN towards Pune | UP SE, DN SE |
| Ghat sections | Middle Line (bidirectional), UP NE/SE, DN NE/SE as applicable |
| BSR-PNVL | UP-DBRP, DN-DBRP |
| Konkan Railway (RN line) | UP-KR, DN-KR |
| Other branch lines | Named as and when data is populated |

*Line is stored as VARCHAR(30) — not an ENUM — so new line names are added organically as signals for new routes are entered. No schema change needed.*

### Signal Type by Territory

| Territory | Allowed Signal Types |
|-----------|---------------------|
| Automatic | Automatic, Semi-Automatic, Manual, Gate |
| Absolute | Manual, IBS, Gate |

### Function Values by Context

| Context | Applicable Functions |
|---------|---------------------|
| Automatic territory (automatic signals) | NULL — no function label |
| Automatic territory (semi-automatic signals) | NULL typically; occasionally Starter by informal usage |
| Absolute territory — station approach | Double Distant → Inner Distant → Home → Inner Home → Starter → Starter (Loop) → Advanced Starter |
| Absolute territory — block section | IBS, IBS Distant |
| Gate signals | Gate Distant (if present), then the Gate signal itself (function = NULL, type = Gate) |

**Notes:**
- Double Distant exists on some routes (e.g., towards RN on Konkan Railway). When present, the regular Distant becomes Inner Distant.
- Inner Home exists at some stations alongside Home.
- Loop Line Starter (`Starter (Loop)`) exists at stations with main line and loop line.
- Distant signals may not have a specific number — use naming convention like `TLA DIST UP`.
- IBS always has a distant signal associated; Gate signal may or may not.

### Placement Values

`Left`, `Right`, `Extreme Left`, `Extreme Right`, `Gantry (OHE)`

---

## Cross-Module Usage

### AWS Malfunctions
- AWS malfunction records (from external Excel download filled by motormen) reference signal numbers.
- Join on `signal_number` to identify repeat-failure signals.
- Distant signals do **not** have AWS magnets — AWS malfunctions will not reference distant signals.
- AWS magnet distance from signal is **not** stored.

### SPM Analysis (Sub-SPM, Mainline SPM, Ghat SPM)
- Signal locations (km_from_csmt, lat/long) can be used as reference markers on speed-distance charts.
- Already implemented for IGP Ghat SPM (`igp_signal.csv` and `igp-psr.js` overlay).
- Centralized `div_signals` table replaces per-module CSV files as the single source of truth.
- **Out-of-division signals** (e.g., ROHA-RN on Konkan Railway) are stored for SPM analysis only — not applicable for signal sighting or AWS tracking.

### RTIS
- Signal references in recorder data analysis can be resolved against this table.

### Signal Sighting Committee (Deferred)
- Future scope: link inspection records to signals.
- `visibility_distance_m` field is ready to receive sighting committee data.

---

## Data Loading

### Initial Load
- Source: Excel file being prepared → export as CSV
- Load method: SCP to server + MySQL Workbench or `LOAD DATA INFILE`
- Import script: `import_signals.py` (to be built) — validates data, handles duplicates
- No UI-based import needed

### Ongoing Maintenance
- HQ staff update via BBTRO UI (CRUD interface to be built)
- Changes logged automatically to `div_signal_history`

---

## Migration SQL

```sql
-- Signals main table
CREATE TABLE IF NOT EXISTS div_signals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    signal_number VARCHAR(30) NOT NULL,
    section VARCHAR(30) NOT NULL,
    line VARCHAR(30) NOT NULL,
    signal_type ENUM('Automatic', 'Semi-Automatic', 'Manual', 'Gate') NOT NULL,
    function ENUM(
        'Double Distant', 'Distant', 'Inner Distant',
        'Home', 'Inner Home',
        'Starter', 'Starter (Loop)', 'Advanced Starter',
        'IBS', 'IBS Distant', 'Gate Distant'
    ) DEFAULT NULL,
    aspects TINYINT DEFAULT NULL,
    ri_left_arms TINYINT NOT NULL DEFAULT 0,
    ri_right_arms TINYINT NOT NULL DEFAULT 0,
    has_calling_on BOOLEAN NOT NULL DEFAULT FALSE,
    has_shunt_signal BOOLEAN NOT NULL DEFAULT FALSE,
    placement ENUM('Left', 'Right', 'Extreme Left', 'Extreme Right', 'Gantry (OHE)') NOT NULL,
    km_from_csmt DECIMAL(7,3) DEFAULT NULL,
    latitude DECIMAL(9,6) DEFAULT NULL,
    longitude DECIMAL(9,6) DEFAULT NULL,
    visibility_distance_m INT DEFAULT NULL,
    speed_on_yellow INT DEFAULT NULL,
    on_curve ENUM('Left', 'Right') DEFAULT NULL,
    on_gradient ENUM('Rising', 'Falling', 'Level') DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_signal_section_line (signal_number, section, line),
    INDEX idx_section (section),
    INDEX idx_signal_type (signal_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inter-signal distance relationships
CREATE TABLE IF NOT EXISTS div_signal_isd (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_signal_id INT NOT NULL,
    to_signal_id INT NOT NULL,
    distance_m INT NOT NULL,
    is_straight_route BOOLEAN NOT NULL DEFAULT TRUE,
    remarks VARCHAR(200) DEFAULT NULL,

    UNIQUE KEY uk_from_to (from_signal_id, to_signal_id),
    INDEX idx_to_signal (to_signal_id),
    CONSTRAINT fk_isd_from FOREIGN KEY (from_signal_id) REFERENCES div_signals(id),
    CONSTRAINT fk_isd_to FOREIGN KEY (to_signal_id) REFERENCES div_signals(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Signal change history
CREATE TABLE IF NOT EXISTS div_signal_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    signal_id INT NOT NULL,
    change_type ENUM('Renumbered', 'Relocated', 'Decommissioned', 'New', 'Type Changed', 'Placement Changed', 'Other') NOT NULL,
    old_value VARCHAR(200) DEFAULT NULL,
    new_value VARCHAR(200) DEFAULT NULL,
    change_date DATE DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_signal_id (signal_id),
    CONSTRAINT fk_history_signal FOREIGN KEY (signal_id) REFERENCES div_signals(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Section territory mapping
CREATE TABLE IF NOT EXISTS div_section_territory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(30) NOT NULL UNIQUE,
    territory_type ENUM('Automatic', 'Absolute') NOT NULL,
    remarks VARCHAR(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## AWS Malfunctions — Data Source Analysis

### Source System

Data comes from **CMS (Crew Management System)** abnormality reports — a general-purpose system where crew (motormen, guards, etc.) file abnormalities of all types. Downloaded as Excel file.

**Report period example:** 11-04-2026 00:00 to 12-04-2026 23:59, Division: CSTM

### Excel Columns (29 total)

| Column | Field | Relevance to AWS |
|--------|-------|-----------------|
| A | SNO | Serial number (resets per ABN.TYPE) |
| B | ABN.ID | Unique ID: `STATION/DATE/TYPE/SEQ` (e.g., `CSTS/11-04-2026/EMU/2`) |
| C | ABN.TYPE | Category — AWS entries found under **ST** and **EMU** |
| D | SUBHEAD | Sub-category (mostly "OTHER"; occasionally "SIGNAL ASPECT") |
| E | REPORTSTTN | Reporting station (crew's home depot) |
| F | REPORTDIV | Always CSTM for Mumbai Division |
| G | FROM | Journey origin station |
| H | TO | Journey destination station |
| I | CREW/CLIID | Crew staff ID |
| J | CREW/CLINAME | Crew name |
| K | DESIG | Designation (MMAN, LPM, LPG, etc.) |
| L | ABNDATE | Date of abnormality (DD-MM-YYYY) |
| M | ABN.TIME | Time of abnormality (HH:MM) |
| N | FROMKM | From km reference |
| O | TO KM | To km reference |
| P | STATUS | YS (resolved), PN (pending) |
| Q | FILLEDBY | CREW or APPUSER |
| R | LOCO | Loco/EMU cab number |
| S | LOCO SHED | Loco shed code |
| T | TRAIN | Train number/service code |
| U | SMSTO LP | SMS forwarding timestamp |
| V-Y | Forwarding fields | Internal workflow routing |
| Z | Detail | **Free-text description — signal number embedded here** |
| AA | Closing Remarks | Action taken — indicates track-side vs cab-side diagnosis |
| AB | App Remarks Date | Last remark timestamp |
| AC | Reporting Date | When the report was filed |

### AWS-Relevant ABN.TYPE Values

| ABN.TYPE | AWS Context | Examples |
|----------|-------------|---------|
| **ST** (Signal & Telecom) | Track-side AWS reports — signal-specific | "AUX at NRL S 18", "AWS ACT at PR S12", "C at KYN /S-78" |
| **EMU** | Cab-side AWS equipment issues | "AWS ACTED ON GREEN ASPECT OF H2212", "AWS E at Km 55", "AWS ACT E AT THA PF-5" |

**Note:** Not all ST/EMU entries are AWS-related. The file contains CW, ELECTCOACH, ENGG, LOCO, MISC, SECURITY, TRAFFIC entries too — all irrelevant for AWS analysis.

### AWS Malfunction/Activation Codes

Standard codes used by motormen when reporting AWS activations:

| Code | Meaning |
|------|---------|
| A | Emergency brakes applied at **Green** (clear) signal — false activation |
| B | AWS acted at **Double Yellow** signal |
| C | AWS acted at **Yellow** signal |
| D | AWS acted at **additional magnet** |
| E | AWS acted at a place **without magnet and signal** |
| AUX | AWS acted upon **calling-on signal** or **A-marker** of semi-automatic signal |
| P | AWS acts when signal aspect changes from **Green → Double Yellow** (while approaching) |
| Q | AWS acts when signal aspect changes from **Green → Yellow** (while approaching) |
| R | AWS acts when signal aspect changes from **Double Yellow → Yellow** (while approaching) |

**Note:** Motormen write these in free text (e.g., "A at KYN S12", "E at Km 55", "AUX at NRL S 18"). The location reference may be a signal number, km value, platform, or any landmark — not always linkable to `div_signals`.

### Location Reference Extraction Challenge

Location references are embedded in **free-text DETAIL** field, written by motormen with inconsistent formatting:
- `"A at KYN S12"` → signal **KYN S12**
- `"AUX at NRL S 18"` → signal **NRL S 18** (space before number)
- `"a act BVS s/2 green signal act"` → signal **BVS S2** (lowercase, slash in number)
- `"C at KYN /S-78"` → signal **KYN S78** (slash, hyphen in number)
- `"AWS ACTED ON GREEN ASPECT OF H2212"` → signal **H2212** (automatic signal)
- `"AWS ACT E AT THA PF-5"` → platform reference **THA PF-5** — not a signal
- `"AWS E at Km 55"` → km reference only — not a signal

**Implication:** AWS can trigger at any location — signals, km markers, platforms, or places without magnets. The `location_raw` field stores whatever the motorman wrote. The `signal_id` FK is populated only when the reference can be confidently matched to a known signal in `div_signals`. Many records will have `signal_id = NULL`.

### Closing Remarks — Diagnostic Value

Closing remarks from `@AWSBB` (AWS Branch) indicate root cause:
- *"Track side AWS tested ok. Single frequency picked by AWS Cab No.1045"* → cab-side issue
- *"Track side AWS parameters are within limits"* → cab-side issue
- *"Six pin Plug replaced"* → track-side fix
- *"Track side AWS Tested Ok. Monitored found ok"* → intermittent / not reproduced

### Proposed `div_aws_malfunctions` Table

```sql
CREATE TABLE IF NOT EXISTS div_aws_malfunctions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Source reference
    abn_id VARCHAR(50) NOT NULL,            -- CMS abnormality ID (e.g., CSTS/11-04-2026/EMU/2)
    abn_type VARCHAR(20) NOT NULL,          -- ST, EMU, etc.
    subhead VARCHAR(50) DEFAULT NULL,

    -- When & where
    abn_date DATE NOT NULL,
    abn_time TIME DEFAULT NULL,
    from_station VARCHAR(10) DEFAULT NULL,
    to_station VARCHAR(10) DEFAULT NULL,
    from_km VARCHAR(20) DEFAULT NULL,       -- VARCHAR because values like "18/140" exist
    to_km VARCHAR(20) DEFAULT NULL,

    -- Who & what
    crew_id VARCHAR(20) DEFAULT NULL,
    crew_name VARCHAR(100) DEFAULT NULL,
    designation VARCHAR(10) DEFAULT NULL,
    loco_number INT DEFAULT NULL,
    loco_shed VARCHAR(10) DEFAULT NULL,
    train_number VARCHAR(20) DEFAULT NULL,

    -- AWS-specific
    signal_id INT DEFAULT NULL,             -- FK → div_signals.id (NULL if location is not a signal)
    location_raw VARCHAR(50) DEFAULT NULL,  -- Location as written by motorman: signal number, km, platform, etc.
    malfunction_type ENUM('A', 'B', 'C', 'D', 'E', 'AUX', 'P', 'Q', 'R', 'OTHER') DEFAULT NULL,
    root_cause ENUM('Track-side', 'Cab-side', 'Intermittent', 'Not determined') DEFAULT NULL,

    -- Full text
    detail TEXT DEFAULT NULL,               -- Original DETAIL field
    closing_remarks TEXT DEFAULT NULL,       -- Action taken / resolution

    -- Status
    status ENUM('YS', 'PN') DEFAULT NULL,   -- YS = resolved, PN = pending
    reporting_date DATE DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_signal_id (signal_id),
    INDEX idx_abn_date (abn_date),
    INDEX idx_loco (loco_number),
    INDEX idx_location_raw (location_raw),
    CONSTRAINT fk_aws_signal FOREIGN KEY (signal_id) REFERENCES div_signals(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Import Workflow

1. Download Excel from CMS for the desired date range
2. Filter for ABN.TYPE = 'ST' and 'EMU' (discard CW, ENGG, LOCO, etc.)
3. Further filter: only rows where DETAIL contains AWS/AUX/ACT keywords — exclude unrelated EMU/ST entries
4. Parse `location_raw` from DETAIL text — extract signal number, km, or platform reference
5. Where `location_raw` matches a known signal, populate `signal_id` via lookup against `div_signals` (semi-automated; many entries will have NULL `signal_id`)
6. Derive `malfunction_type` (A/B/C/D/E/AUX/P/Q/R) and `root_cause` from DETAIL + Closing Remarks
7. Insert into `div_aws_malfunctions`

**Import script:** `import_aws_malfunctions.py` (to be built) — handles Excel parsing, filtering, signal matching, and DB insert. Can be run periodically as new CMS downloads become available.

---

## Open Items

1. **Signal Sighting Committee** — Deferred; fields and linking approach TBD
2. **Signal CRUD UI** — BBTRO module for HQ staff to manually add, edit, and view signal data (to be built)
3. ~~**Section list finalization**~~ — Resolved: section is VARCHAR(30), named flexibly as data is entered; no pre-finalization needed
4. ~~**P, Q, R codes**~~ — Resolved: aspect-change codes documented
5. ~~**Ghat Middle Line**~~ — Resolved: Middle Line is one of several line names; new lines added organically via VARCHAR field
6. ~~**MHPE station rename**~~ — Resolved: renamed to PYJE in CSV

---

## Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| Territory type at section level, not per signal | Avoids redundancy; territory is a property of the section |
| ISD in separate relationship table | A signal can be approached from multiple preceding signals (e.g., main line + loop line converging at advanced starter) |
| Signal history in separate table | Rare changes but important for backward compatibility with historical recorder data |
| km_from_csmt as derived/optional | Not inherent to signals; calculated from ISD chain and reference points over time |
| Lat/long from Google Maps | ~6 decimal place precision; sufficient for map display and approximate km derivation |
| PSR stored in JSON, signals in DB | Signals change rarely but are queried frequently across modules; DB is appropriate |
| No UI import for initial load | CSV via SCP + MySQL Workbench is sufficient; HQ staff will use CRUD UI for ongoing changes |
| Function field nullable | Automatic signals and most semi-automatic signals have no formal function label |
| Route indicator as left/right arm counts | Cleaner for queries than a combined string format |
| Gate signal function = NULL | type=Gate is sufficient; no separate function value needed for gate signals. Gate Distant remains as a function for the associated distant signal |
| MHPE renamed to PYJE | Station name updated in CSV references; use PYJE going forward |
