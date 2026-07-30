# BBTRO Signal Data + AWS Integration Master Plan

**Project:** BBTRO Division Portal — Signal Master, Signal Book, AWS Analysis, PSR and Signal Sighting  
**Repo/App Context:** Node.js + Express + MySQL website (`bbtro` / `crtms.in`) with Python apps mounted through reverse proxy for RTIS, Suburban SPM and counselling.  
**Current Version:** v1.1 updated after Phase 1 completion  
**Status:** Phase 1 complete — tables created, CSMT SUB ML beat signals (114 rows) and PSR DN TH (11 rows) loaded locally  
**⚠️ Branch policy:** ALL signal-book / signal-AWS work commits to the **`signal-book`** branch only — never `master`. `master` is the deployable line the server pulls. Merge `signal-book` → `master` only when the effort is complete & verified, then run migrations + imports on the server. (`git checkout signal-book` before any signal work.)  

---

## 0. Signal Book Section Coverage (live tracker)

Mumbai-division corridor naming: **NE** = KYN→KSRA→IGP→MMR/JL, **SE** = KYN→KJT→LNL→PUNE.
Each running line is a DN + UP section pair unless noted. Ghats also carry a bidirectional MIDDLE line, modelled as two corridor-qualified `line` values (e.g. `DN SE MID` / `UP SE MID` for the SE ghat) — direction baked in, corridor kept in the name so `line LIKE '%SE%'` still selects the whole corridor.

| Corridor | Section | Status |
|----------|---------|--------|
| Suburban ML | CSMT-KYN DN/UP TH | ✅ imported |
| Suburban ML | CSMT-KYN DN/UP LOCAL | ✅ imported |
| Suburban ML | CLA-KYN 5TH / 6TH | ✅ imported |
| Harbour | CSMT-PNVL DN/UP HB | ✅ imported |
| TransHarbour | TNA-TUH (shared trunk) + TUH-NEU + TUH-VSH, both dirs | ✅ imported (PSR pending) |
| Harbour branch | VDLR-GMN (Wadala–Goregaon), both dirs, with PSR | ✅ imported → CSMT_HB + PNVL_SUB_HB |
| BSU (Nerul/Belapur–Uran) | KILLE-URAN (shared trunk) + NEU-KILLE + BEPR-KILLE, both dirs | ✅ signals+stations → PNVL_SUB_HB (⬜ PSR pending) |
| KJT-KHPI (Karjat–Khopoli shuttle) | both dirs, with PSR | ✅ imported → KYN_SUB |
| SE | KYN-KJT DN/UP SE | ✅ imported |
| SE | KJT-LNL (ghat: DN SE + UP SE + DN SE MID + UP SE MID) | ✅ imported → CSMT_ML_MMR + KYN_GOODS + PNVL_GOODS |
| SE | LNL-PUNE (Lonavala→Pune, plain SE: DN SE + UP SE, no MID) | ✅ imported → CSMT_ML_MMR only |
| NE | KYN-KSRA DN/UP NE | ✅ imported |
| NE | KSRA-IGP (ghat: DN NE + UP NE + DN NE MID + UP NE MID) | ✅ imported → CSMT_ML_MMR + KYN_GOODS |
| NE | IGP-MMR (Igatpuri→Manmad, plain NE: DN NE + UP NE, no MID) | ✅ imported → CSMT_ML_MMR only |
| KR | PNVL-ROHA (Panvel→Roha, Konkan Rly, plain KR: DN KR + UP KR, no MID) | ✅ imported → CSMT_ML_KR + PNVL_GOODS + KYN_SUB + PNVL_SUB_HB |
| KR | ROHA-RN (Roha→Ratnagiri, Konkan Rly, plain KR: DN KR + UP KR, no MID) | ✅ imported → CSMT_ML_KR only |
| Branch | PEN-TVSG (Pen→Thal branch, DN TVSG + UP TVSG, no MID / no stations/PSR/NS) | ✅ imported → PNVL_GOODS |
| Branch | CLA-TMBY (Kurla→Trombay branch, DN TMBY + UP TMBY, no MID / no stations/PSR/NS) | ✅ imported → KYN_GOODS |
| Chord | PNVL-KJT (Panvel→Karjat single line, DN KJT + UP KJT direction-partitions) | ✅ imported → CSMT_ML_MMR + PNVL_GOODS |
| Complex (UP) | PNVL→DW/KYN/BSR + KYN-BSR chord (shared-trunk: 8 sections) | ✅ imported → KYN_GOODS + PNVL_GOODS + CSMT_ML_MMR |
| Complex (DN) | BSR/KYN→PNVL/DW reverse (5 sections, DN mirror) | ✅ imported → KYN_GOODS + PNVL_GOODS + CSMT_ML_MMR |
| — | PNVL_GOODS beat sections | ✅ KJT-LNL bound (first content); more to come |
| — | RHS-summary / sidings / station-sequence pages | ⬜ different layout, deferred |

AWS-critical plain sections (KYN-KSRA, KYN-KJT) are done. Ghats + beyond come from the KYN_GOODS / CSMT_ML_JL books. KYN-KSRA NE loop-line / UDL / extra starters (incl. `VSD S-4`) added 2026-06-24 as parallel signals (`parallel_group_id` 1-12) — see decision log.

---

## 1. Purpose of This File

This file is the single reference document for the Signal + AWS integration work. It should be updated after every completed step.

It consolidates and supersedes the earlier file:

- `signals_database_design.md`

The original file correctly identified the need for a central `div_signals` table, AWS parsing from CMS abnormality Excel, signal aliases and future signal sighting use. This updated version expands that design because the signal data must now also generate beat-wise Signal Location Guide / Signal Book PDFs.

---

## 2. Final System Objective

Build a central signal data system in BBTRO that supports:

1. **Signal Book generation beat-wise**
   - PNVL GOODS
   - PNVL SUB HB
   - CSMT HB
   - CSMT ML KR
   - CSMT ML MMR
   - CSMT SUB ML
   - KYN GOODS
   - KYN SUB

2. **AWS analysis from CMS abnormality reports**
   - Parse AWS acting from free-text CMS entries.
   - Identify AWS code A/B/C/D/E/AUX/P/Q/R.
   - Match signal where possible.
   - Match cab/rake where possible.
   - Detect repeated acting by signal, cab, rake, section, line and date range.

3. **PSR management**
   - Maintain PSR with start km, end km, speed restriction and start/end lat-long.
   - Reuse PSR for signal book, SPM, RTIS and future overlays.

4. **OHE neutral section management**
   - Maintain neutral section location data.
   - Show neutral sections in signal books.

5. **Signal Sighting Committee records**
   - Link inspection/sighting observations to central signal master.

6. **Future RTIS/SPM overlays**
   - Use signal and PSR master data as reference points for charts, speed-distance overlays and analysis apps.

---

## 3. Core Design Principle

### Update once, use everywhere.

A signal must be stored only once in the central signal master.

If the same signal appears in multiple beat books, it should be referenced from multiple book rows but not duplicated as separate signal records.

Example:

```text
RVJ S-7
```

May appear in:

```text
CSMT HB beat
PNVL SUB HB beat
RHS summary page
Another related beat book
```

But the signal itself should exist only once in:

```text
div_signals
```

Beat book rows should only reference that signal.

---

## 4. Source Files Reviewed

### 4.1 Existing design note

File:

```text
signals_database_design.md
```

Important contents retained:

- Central `div_signals` idea.
- `div_signal_isd` for inter-signal distance.
- `div_signal_history` for changes.
- `div_signal_aliases` need for AWS free-text matching.
- AWS CMS abnormality source analysis.
- AWS codes A/B/C/D/E/AUX/P/Q/R.
- Need to keep raw AWS text and parsed values.

### 4.2 AWS CMS Excel samples

Files:

```text
Abnormality (15-04-2026).xlsx
Abnormality (AWS).xlsx
```

Important findings:

- CMS report is a general abnormality report, not a clean AWS report.
- AWS entries are generally under `ABN.TYPE = ST` and `ABN.TYPE = EMU`.
- AWS signal/location reference is embedded in the free-text `Detail` field.
- Not every ST/EMU row is AWS-related.
- The parser must retain raw text and parse with confidence.

### 4.3 AWS weekly report PDF

File:

```text
AWS Weekly meeting 23.01.2026 to 29.01.2026.pdf
```

Important output formats observed:

- Repeated S&T defects by signal/location.
- Repeated EMU/cab defects by D-cab/shed.
- Type-wise braking A/B/C/D/E/F/P/Q/R/AUX/Other.
- Section-wise braking.
- Transient cases list with date, train number, D-cab, type, location, line and analysis.
- Rake/cab defect attention status.

### 4.4 CSMT HB Signal Book PDF

File:

```text
CSMT HB BEAT 2026ver1.pdf
```

Important structure observed:

- Beat book contains both UP and DN directions.
- One beat contains multiple sections.
- Rows are not only signals; rows include PSR, station headers, neutral sections, boards, RHS summaries and siding diagrams.
- Signal book layout uses three main columns:

```text
SIGNAL NO. | LOCATION | DESCRIPTION
```

- Some pages have two side-by-side tables.
- Examples of row types:

```text
SIGNAL: H-03 | CSMT/1108 | RHS
PSR: 60 KMPH | 01/17-01/19
NEUTRAL SECTION: N/S | 17H/102
BOARD: 500 M BOARD | 16H/120
STATION HEADER: MASJID (MSD) 1.22 KM
RHS SUMMARY: SIGNALS LOCATED ON RIGHT SIDE
SIDING DIAGRAM: VSH / BEPR / PNVL siding diagrams
```

---

## 5. Current Existing Database Context

### 5.1 Rake tables already available

Existing tables:

```text
rake_coaches
rake_formations
rake_types
```

Known structure:

```text
rake_coaches:
- id
- rake_id
- position
- coach_number

rake_formations:
- id
- shed_code
- rake_type_id
- car_count
- unit_no
- is_active
- created_at
- updated_at

rake_types:
- id
- type_name
```

Confirmed index:

```text
rake_coaches.idx_coach_number on coach_number
```

### 5.2 Rake matching rule for AWS

CMS `LOCO` / D-Cab value should match:

```text
rake_coaches.coach_number
```

Then derive:

```text
coach_number -> rake_id -> rake_formations.id -> unit_no / shed_code / rake_type_id -> rake_types.type_name
```

Example:

```text
CMS LOCO = 4519C
rake_coaches.coach_number = 4519C
rake_id = 9
rake_formations.unit_no = 4517-4518-4519-4520
shed_code = KCS
rake_type = AC Retrofitted
```

No rake table change is required now.

### 5.3 Existing signal table

Existing table:

```text
div_mainline_signals
```

Current status:

```text
Created but empty.
```

Decision:

- Do not delete it.
- Do not use it as the main signal master for AWS/signal book.
- Create a new central `div_signals` system.
- Later, `div_mainline_signals` can be migrated or kept only for older mainline SPM logic.

Reason:

`div_mainline_signals` is too limited for beat-wise signal book generation, AWS alias matching, RHS/Ext RHS, PSR, neutral section and sighting records.

---

## 6. Confirmed Beat List

Initial beat master list:

```text
PNVL GOODS
PNVL SUB HB
CSMT HB
CSMT ML KR
CSMT ML MMR
CSMT SUB ML
KYN GOODS
KYN SUB
```

Each beat book can contain both UP and DN signals.

---

## 7. Final Logical Architecture

```text
Signal Master
    ↓
Beat Book Sections
    ↓
Beat Book Rows
    ↓
Generated Signal Book PDF / Print

PSR Master
    ↓
Beat Book Rows
    ↓
SPM / RTIS / Future overlays

OHE Neutral Section Master
    ↓
Beat Book Rows

CMS AWS Raw Data
    ↓
AWS Parser
    ↓
AWS Events
    ↓
Signal Master + Rake Tables + Staff Master

Signal Sighting Inspections
    ↓
Signal Master
```

---

## 8. Table Groups

### Group A — Core Signal Master

```text
div_signals
div_signal_aliases
div_signal_history
div_signal_isd
```

### Group B — Signal Book Generation

```text
div_signal_beats
div_signal_book_sections
div_signal_book_rows
```

### Group C — PSR and OHE

```text
div_psr
div_ohe_neutral_sections
```

### Group D — AWS Integration

```text
div_aws_cms_uploads
div_aws_cms_raw
div_aws_events
```

### Group E — Signal Sighting Committee

```text
div_signal_sighting_inspections
div_signal_sighting_observations
```

---

## 9. Phase 1 SQL Foundation

### 9.1 `div_signals`

```sql
CREATE TABLE IF NOT EXISTS div_signals (
    id INT AUTO_INCREMENT PRIMARY KEY,

    signal_number VARCHAR(40) NOT NULL,
    normalized_signal_number VARCHAR(40) NOT NULL,

    station_code VARCHAR(10) DEFAULT NULL,
    station_name VARCHAR(80) DEFAULT NULL,

    section VARCHAR(40) NOT NULL,
    line VARCHAR(40) NOT NULL,
    direction ENUM('UP', 'DN', 'BOTH', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',

    location_text VARCHAR(80) DEFAULT NULL,
    km_text VARCHAR(30) DEFAULT NULL,
    km_from_csmt DECIMAL(8,3) DEFAULT NULL,

    latitude DECIMAL(10,7) DEFAULT NULL,
    longitude DECIMAL(10,7) DEFAULT NULL,

    signal_type ENUM(
        'Automatic',
        'Semi-Automatic',
        'Manual',
        'Gate',
        'IBS',
        'Repeater',
        'Board',
        'Other'
    ) NOT NULL DEFAULT 'Automatic',

    signal_function ENUM(
        'Double Distant',
        'Distant',
        'Inner Distant',
        'Home',
        'Inner Home',
        'Starter',
        'Starter (Loop)',
        'Advanced Starter',
        'IBS',
        'IBS Distant',
        'Gate Distant',
        'Repeater',
        'Other'
    ) DEFAULT NULL,

    aspects TINYINT DEFAULT NULL,

    placement ENUM(
        'Left',
        'Right',
        'Extreme Right',
        'Extreme Left',
        'Gantry',
        'Unknown'
    ) NOT NULL DEFAULT 'Unknown',

    on_curve ENUM('Left', 'Right', 'None', 'Unknown') NOT NULL DEFAULT 'Unknown',
    curve_remarks VARCHAR(255) DEFAULT NULL,

    is_rhs TINYINT(1) NOT NULL DEFAULT 0,
    is_ext_rhs TINYINT(1) NOT NULL DEFAULT 0,
    is_lhs TINYINT(1) NOT NULL DEFAULT 0,
    is_ext_lhs TINYINT(1) NOT NULL DEFAULT 0,
    has_legend_board TINYINT(1) NOT NULL DEFAULT 0,
    has_calling_on TINYINT(1) NOT NULL DEFAULT 0,
    has_shunt_signal TINYINT(1) NOT NULL DEFAULT 0,
    ri_left_arms TINYINT NOT NULL DEFAULT 0,
    ri_right_arms TINYINT NOT NULL DEFAULT 0,

    book_description TEXT DEFAULT NULL,
    technical_remarks TEXT DEFAULT NULL,

    visibility_distance_m INT DEFAULT NULL,
    sighting_remarks TEXT DEFAULT NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_signal_section_line (normalized_signal_number, section, line),
    INDEX idx_signal_number (signal_number),
    INDEX idx_normalized_signal_number (normalized_signal_number),
    INDEX idx_station_code (station_code),
    INDEX idx_section_line (section, line),
    INDEX idx_direction (direction),
    INDEX idx_placement_flags (is_rhs, is_ext_rhs, is_lhs, is_ext_lhs),
    INDEX idx_on_curve (on_curve),
    INDEX idx_route_indicators (ri_left_arms, ri_right_arms),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 9.2 `div_signal_aliases`

```sql
CREATE TABLE IF NOT EXISTS div_signal_aliases (
    id INT AUTO_INCREMENT PRIMARY KEY,

    signal_id INT NOT NULL,

    alias_text VARCHAR(100) NOT NULL,
    normalized_alias VARCHAR(100) NOT NULL,

    source ENUM('manual', 'excel_import', 'cms_parser', 'legacy') NOT NULL DEFAULT 'manual',
    confidence ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'HIGH',

    remarks VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_normalized_alias (normalized_alias),
    INDEX idx_signal_id (signal_id),
    INDEX idx_alias_text (alias_text),
    INDEX idx_active (is_active),

    CONSTRAINT fk_signal_alias_signal
        FOREIGN KEY (signal_id)
        REFERENCES div_signals(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 9.3 `div_signal_beats`

```sql
CREATE TABLE IF NOT EXISTS div_signal_beats (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beat_code VARCHAR(30) NOT NULL,
    beat_name VARCHAR(80) NOT NULL,

    office_code VARCHAR(10) DEFAULT NULL,
    beat_category ENUM('SUB', 'GOODS', 'HB', 'ML', 'KR', 'MMR', 'OTHER') DEFAULT 'OTHER',

    description VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_beat_code (beat_code),
    INDEX idx_office_code (office_code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Insert initial beats:

```sql
INSERT INTO div_signal_beats
    (beat_code, beat_name, office_code, beat_category, description)
VALUES
    ('PNVL_GOODS', 'PNVL GOODS', 'PNVL', 'GOODS', NULL),
    ('PNVL_SUB_HB', 'PNVL SUB HB', 'PNVL', 'HB', 'Harbour suburban beat'),
    ('CSMT_HB', 'CSMT HB', 'CSMT', 'HB', 'CSMT Harbour beat'),
    ('CSMT_ML_KR', 'CSMT ML KR', 'CSMT', 'KR', NULL),
    ('CSMT_ML_MMR', 'CSMT ML MMR', 'CSMT', 'MMR', NULL),
    ('CSMT_SUB_ML', 'CSMT SUB ML', 'CSMT', 'SUB', NULL),
    ('KYN_GOODS', 'KYN GOODS', 'KYN', 'GOODS', NULL),
    ('KYN_SUB', 'KYN SUB', 'KYN', 'SUB', NULL)
ON DUPLICATE KEY UPDATE
    beat_name = VALUES(beat_name),
    office_code = VALUES(office_code),
    beat_category = VALUES(beat_category),
    description = VALUES(description);
```

### 9.4 `div_signal_book_sections`

```sql
CREATE TABLE IF NOT EXISTS div_signal_book_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beat_id INT NOT NULL,

    section_title VARCHAR(120) NOT NULL,
    section_code VARCHAR(50) DEFAULT NULL,

    direction ENUM('UP', 'DN', 'BOTH', 'NA') NOT NULL DEFAULT 'NA',
    line VARCHAR(50) DEFAULT NULL,

    display_order INT NOT NULL,

    start_page_no INT DEFAULT NULL,
    end_page_no INT DEFAULT NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_beat_section_order (beat_id, display_order),
    INDEX idx_beat_id (beat_id),
    INDEX idx_section_code (section_code),

    CONSTRAINT fk_signal_book_sections_beat
        FOREIGN KEY (beat_id)
        REFERENCES div_signal_beats(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 9.5 `div_psr`

```sql
CREATE TABLE IF NOT EXISTS div_psr (
    id INT AUTO_INCREMENT PRIMARY KEY,

    psr_code VARCHAR(40) DEFAULT NULL,

    section VARCHAR(40) NOT NULL,
    line VARCHAR(40) NOT NULL,
    direction ENUM('UP', 'DN', 'BOTH', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',

    start_km_text VARCHAR(30) NOT NULL,
    end_km_text VARCHAR(30) NOT NULL,

    start_km_decimal DECIMAL(8,3) DEFAULT NULL,
    end_km_decimal DECIMAL(8,3) DEFAULT NULL,

    speed_kmph INT NOT NULL,

    start_latitude DECIMAL(10,7) DEFAULT NULL,
    start_longitude DECIMAL(10,7) DEFAULT NULL,
    end_latitude DECIMAL(10,7) DEFAULT NULL,
    end_longitude DECIMAL(10,7) DEFAULT NULL,

    reason VARCHAR(255) DEFAULT NULL,
    remarks TEXT DEFAULT NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    effective_from DATE DEFAULT NULL,
    effective_to DATE DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_section_line_direction (section, line, direction),
    INDEX idx_speed (speed_kmph),
    INDEX idx_active (is_active),
    INDEX idx_effective_dates (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 9.6 `div_ohe_neutral_sections`

```sql
CREATE TABLE IF NOT EXISTS div_ohe_neutral_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,

    ns_code VARCHAR(40) DEFAULT NULL,

    section VARCHAR(40) NOT NULL,
    line VARCHAR(40) NOT NULL,
    direction ENUM('UP', 'DN', 'BOTH', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',

    location_text VARCHAR(40) NOT NULL,
    km_decimal DECIMAL(8,3) DEFAULT NULL,

    latitude DECIMAL(10,7) DEFAULT NULL,
    longitude DECIMAL(10,7) DEFAULT NULL,

    remarks TEXT DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    effective_from DATE DEFAULT NULL,
    effective_to DATE DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_section_line_direction (section, line, direction),
    INDEX idx_location_text (location_text),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 9.7 `div_signal_book_rows`

```sql
CREATE TABLE IF NOT EXISTS div_signal_book_rows (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beat_id INT NOT NULL,
    book_section_id INT DEFAULT NULL,

    row_order INT NOT NULL,

    row_type ENUM(
        'SIGNAL',
        'STATION_HEADER',
        'PSR',
        'NEUTRAL_SECTION',
        'BOARD',
        'TEXT_NOTE',
        'SECTION_HEADER',
        'RHS_SUMMARY',
        'SIDING_DIAGRAM',
        'BLANK'
    ) NOT NULL,

    signal_id INT DEFAULT NULL,
    psr_id INT DEFAULT NULL,
    neutral_section_id INT DEFAULT NULL,

    display_signal_no VARCHAR(80) DEFAULT NULL,
    display_location VARCHAR(100) DEFAULT NULL,
    display_description TEXT DEFAULT NULL,

    speed_kmph INT DEFAULT NULL,
    km_range_text VARCHAR(80) DEFAULT NULL,

    station_code VARCHAR(10) DEFAULT NULL,
    station_name VARCHAR(80) DEFAULT NULL,
    station_km_text VARCHAR(30) DEFAULT NULL,

    page_no INT DEFAULT NULL,
    column_no TINYINT DEFAULT NULL,

    highlight_color ENUM(
        'NONE',
        'BLUE',
        'YELLOW',
        'PURPLE',
        'GREY',
        'GREEN'
    ) NOT NULL DEFAULT 'NONE',

    text_color ENUM(
        'BLACK',
        'RED',
        'BLUE'
    ) NOT NULL DEFAULT 'BLACK',

    icon_type ENUM(
        'NONE',
        'PSR',
        'NEUTRAL_SECTION',
        'LEGEND_BOARD',
        'GRADIENT',
        'CURVE_LEFT',
        'CURVE_RIGHT',
        'GATE',
        'IBS'
    ) NOT NULL DEFAULT 'NONE',

    remarks VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_beat_row_order (beat_id, row_order),

    INDEX idx_beat_id (beat_id),
    INDEX idx_book_section_id (book_section_id),
    INDEX idx_signal_id (signal_id),
    INDEX idx_psr_id (psr_id),
    INDEX idx_neutral_section_id (neutral_section_id),
    INDEX idx_row_type (row_type),
    INDEX idx_page_col (page_no, column_no),

    CONSTRAINT fk_signal_book_rows_beat
        FOREIGN KEY (beat_id)
        REFERENCES div_signal_beats(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_signal_book_rows_section
        FOREIGN KEY (book_section_id)
        REFERENCES div_signal_book_sections(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_signal_book_rows_signal
        FOREIGN KEY (signal_id)
        REFERENCES div_signals(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_signal_book_rows_psr
        FOREIGN KEY (psr_id)
        REFERENCES div_psr(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_signal_book_rows_neutral_section
        FOREIGN KEY (neutral_section_id)
        REFERENCES div_ohe_neutral_sections(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 9.8 `div_signal_history`

```sql
CREATE TABLE IF NOT EXISTS div_signal_history (
    id INT AUTO_INCREMENT PRIMARY KEY,

    signal_id INT NOT NULL,

    change_type ENUM(
        'Created',
        'Renumbered',
        'Relocated',
        'Decommissioned',
        'Reactivated',
        'Type Changed',
        'Placement Changed',
        'Location Changed',
        'Description Changed',
        'Other'
    ) NOT NULL,

    old_value TEXT DEFAULT NULL,
    new_value TEXT DEFAULT NULL,

    change_date DATE DEFAULT NULL,
    changed_by_user_id INT DEFAULT NULL,

    remarks TEXT DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_signal_id (signal_id),
    INDEX idx_change_type (change_type),
    INDEX idx_change_date (change_date),

    CONSTRAINT fk_signal_history_signal
        FOREIGN KEY (signal_id)
        REFERENCES div_signals(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 9.9 `div_signal_isd`

```sql
CREATE TABLE IF NOT EXISTS div_signal_isd (
    id INT AUTO_INCREMENT PRIMARY KEY,

    from_signal_id INT NOT NULL,
    to_signal_id INT NOT NULL,

    distance_m INT NOT NULL,

    is_straight_route TINYINT(1) NOT NULL DEFAULT 1,
    remarks VARCHAR(200) DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_from_to_signal (from_signal_id, to_signal_id),
    INDEX idx_from_signal_id (from_signal_id),
    INDEX idx_to_signal_id (to_signal_id),

    CONSTRAINT fk_signal_isd_from
        FOREIGN KEY (from_signal_id)
        REFERENCES div_signals(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_signal_isd_to
        FOREIGN KEY (to_signal_id)
        REFERENCES div_signals(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 10. Phase 2 AWS Table Design

Do not create these until Phase 1 is verified.

### 10.1 `div_aws_cms_uploads`

Purpose:

- Store each CMS Excel upload batch.
- Track source filename, uploaded by, date range, import status.

Suggested fields:

```text
id
upload_batch_id
source_filename
uploaded_by_user_id
report_from_date
report_to_date
total_rows
aws_candidate_rows
imported_rows
skipped_duplicate_rows
status
remarks
created_at
```

### 10.2 `div_aws_cms_raw`

Purpose:

- Store raw CMS abnormality rows exactly as downloaded.
- Prevent duplicate import by `abn_id`.
- Allow re-parsing later.

Important raw fields:

```text
upload_id
abn_id
abn_type
subhead
report_station
report_division
from_station
to_station
crew_id
crew_name
designation
abn_date
abn_time
from_km
to_km
status
filled_by
loco_raw
loco_shed
train_number
sms_to_lp
detail
closing_remarks
app_remarks_date
reporting_date
raw_json
```

### 10.3 `div_aws_events`

Purpose:

- Store parsed AWS cases.
- Link to signal, rake/cab, staff.

Important parsed fields:

```text
raw_id
abn_id
abn_date
abn_time
aws_code
location_raw
location_type
normalized_location
signal_id
signal_match_confidence
needs_manual_review
loco_raw
matched_coach_id
matched_rake_id
train_number
crew_id
crew_name
staff_hrms_id
responsibility
root_cause
analysis_text
closing_remarks
status
```

---

## 11. AWS Codes

| Code | Meaning |
|---|---|
| A | Emergency brakes at Green signal / false activation at green |
| B | AWS acted at Double Yellow |
| C | AWS acted at Yellow |
| D | AWS acted at additional magnet |
| E | AWS acted at place without magnet and signal |
| AUX | AWS acted upon calling-on signal or A-marker of semi-automatic signal |
| P | Aspect changed Green → Double Yellow while approaching |
| Q | Aspect changed Green → Yellow while approaching |
| R | Aspect changed Double Yellow → Yellow while approaching |
| OTHER | Not parsed or other pattern |

---

## 12. AWS Parsing Strategy

### 12.1 Raw text examples

```text
A at KYN S12
AUX at NRL S 18
B at H-16 AWS ACT
C at KYN /S-78
AWS ACT E AT THA PF-5
AWS E at Km 55
AWS acted E At KM 76/18
```

### 12.2 Parser output

```text
aws_code
location_raw
location_type = SIGNAL / KM / PLATFORM / SECTION / UNKNOWN
normalized_location
signal_id
signal_match_confidence = HIGH / MEDIUM / LOW
needs_manual_review = 0 / 1
```

### 12.3 Signal matching sources

Order of matching:

1. Match `div_signal_aliases.normalized_alias`.
2. Match `div_signals.normalized_signal_number`.
3. Try section/station context from CMS `FROM`, `TO`, and signal prefix.
4. If still ambiguous, mark `needs_manual_review = 1`.

---

## 13. Signal Normalization Rule

Recommended normalization for signal and AWS text:

```text
Convert to uppercase.
Remove spaces, hyphens, slashes and dots.
Keep letters and numbers only.
```

Examples:

| Input | Normalized |
|---|---|
| KYN /S-78 | KYNS78 |
| KYN S 78 | KYNS78 |
| H-16 | H16 |
| H 016 | H016 |
| BVS S/2 | BVSS2 |
| CSMT S-46 | CSMTS46 |

Note: Some normalization may need station/context handling to avoid false matches.

---

## 14. Import Templates

### 14.1 Signal Excel import template — Phase 1

First signal import should use columns like:

```text
signal_number
station_code
station_name
section
line
direction
location_text
km_text
km_from_csmt
latitude
longitude
signal_type
signal_function
placement
on_curve
curve_remarks
is_rhs
is_ext_rhs
is_lhs
is_ext_lhs
has_legend_board
has_calling_on
has_shunt_signal
ri_left_arms
ri_right_arms
book_description
technical_remarks
```

Minimum mandatory columns:

```text
signal_number
section
line
```

### 14.2 PSR Excel import template

```text
psr_code
section
line
direction
start_km_text
end_km_text
start_km_decimal
end_km_decimal
speed_kmph
start_latitude
start_longitude
end_latitude
end_longitude
reason
remarks
effective_from
effective_to
```

Minimum mandatory columns:

```text
section
line
start_km_text
end_km_text
speed_kmph
```

### 14.3 OHE Neutral Section import template

```text
ns_code
section
line
direction
location_text
km_decimal
latitude
longitude
remarks
effective_from
effective_to
```

Minimum mandatory columns:

```text
section
line
location_text
```

### 14.4 Beat book row import template

For generating beat books from Excel:

```text
beat_code
book_section_title
row_order
row_type
signal_number
section
line
psr_code
ns_code
display_signal_no
display_location
display_description
speed_kmph
km_range_text
station_code
station_name
station_km_text
page_no
column_no
highlight_color
text_color
icon_type
remarks
```

---

## 15. UI Modules Required Later

### 15.1 Signal master UI

Features:

- Search signal by signal number, station, section, line.
- Add/edit/deactivate signal.
- Manage RHS / Ext RHS / legend board / calling-on flags.
- View signal usage across beat books.
- View AWS history for signal.
- View sighting inspection history.

### 15.2 Beat book UI

Features:

- Manage beat master.
- Manage sections inside beat.
- Manage book rows and row order.
- Preview signal book page.
- Export PDF.

### 15.3 PSR UI

Features:

- Add/edit PSR.
- Set start/end km and lat-long.
- Mark effective dates.
- Show where PSR appears in signal books.

### 15.4 OHE neutral section UI

Features:

- Add/edit neutral section.
- Set km and lat-long.
- Show in signal book.

### 15.5 AWS upload and review UI

Features:

- Upload CMS Excel.
- Show parsed AWS candidate records.
- Review unmatched/low-confidence cases.
- Manually link signal/cab/rake.
- Generate repeated signal/rake reports.

### 15.6 Signal sighting UI

Features:

- Create inspection.
- Add signal-wise observations.
- Visibility distance.
- Obstruction/curve/gradient issues.
- Recommendation and compliance status.

---

## 16. Access Control

Recommended initial access:

- Division-only module.
- Admin / division_admin access for schema/testing.
- Later introduce feature flag such as:

```text
can_access_signal_admin
can_upload_aws
can_review_aws
can_generate_signal_book
```

AWS and signal book should stay under existing division login/auth model.

---

## 17. Development Order / Todo Tracker

Update this section after every step.

### Phase 0 — Planning and review

- [x] Reviewed existing `signals_database_design.md`.
- [x] Reviewed CMS AWS Excel sample purpose.
- [x] Reviewed AWS weekly report structure.
- [x] Reviewed CSMT HB signal book sample.
- [x] Confirmed existing rake tables and coach number index.
- [x] Confirmed initial beat list.
- [x] Confirmed one beat book can contain both UP and DN signals.
- [x] Confirmed signal import will initially be from Excel.
- [x] Confirmed PSR should be a separate master table.
- [x] Confirmed OHE neutral section should also be included.

### Phase 1 — Database foundation

- [x] Create `div_signals`.
- [x] Create `div_signal_aliases`.
- [x] Create `div_signal_beats`.
- [x] Insert initial beat master rows.
- [x] Create `div_signal_book_sections`.
- [x] Create `div_psr`.
- [x] Create `div_ohe_neutral_sections`.
- [x] Create `div_signal_book_rows`.
- [x] Create `div_signal_history`.
- [x] Create `div_signal_isd`.
- [x] Verify all tables with `SHOW TABLES LIKE 'div_signal%';`.
- [x] Verify `div_psr` and `div_ohe_neutral_sections` exist.
- [x] Verify initial beat rows.
- [x] ALTER `div_signals`: added `on_curve`, `curve_remarks`, `idx_on_curve`.
- [x] ALTER `div_signals`: added `is_lhs`, `is_ext_lhs`, updated `idx_placement_flags`.
- [x] ALTER `div_signals`: added `ri_left_arms`, `ri_right_arms`, `idx_route_indicators`.
- [x] Loaded CSMT SUB ML beat signals (114 rows).
- [x] Loaded PSR DN TH data (11 rows from `psr_dn_th.csv`).

**Phase 1 Notes:**
- Migration file: `bbtro/sql/phase1_migration.sql`
- PSR data location: `bbtro/data/psr/psr_dn_th.csv`
- MySQL local infile must be enabled for CSV imports: `mysql -u root -p --local-infile=1 bbtro`
- After connecting, run: `SET GLOBAL local_infile = 1;`
- PSR CSV has extra column `insert_before_signal` — used later for beat book row placement, skipped during `div_psr` import with `@dummy`.

### Phase 2 — Import format and scripts

- [ ] Finalize signal Excel import template.
- [ ] Prepare first signal Excel sample.
- [ ] Build/import script for `div_signals`.
- [ ] Auto-create basic aliases during signal import.
- [ ] Build PSR import script.
- [ ] Build OHE neutral section import script.
- [ ] Build beat book row import script.
- [ ] Validate imported CSMT HB sample section.

### Phase 3 — Basic query/report validation

- [ ] Query all signals by section/line.
- [ ] Query RHS/Ext RHS signals.
- [ ] Query signal usage in beats.
- [ ] Query PSR by section/line/direction.
- [ ] Query neutral sections by section/line/direction.
- [ ] Generate simple HTML preview of one beat section.

### Phase 4 — Signal book PDF generation

- [ ] Decide PDF engine: server-side HTML-to-PDF or Node PDF library.
- [ ] Create page layout matching beat book style.
- [ ] Render SIGNAL rows.
- [ ] Render STATION_HEADER rows.
- [ ] Render PSR rows.
- [ ] Render NEUTRAL_SECTION rows.
- [ ] Render BOARD rows.
- [ ] Render RHS summary.
- [ ] Render siding diagram placeholders.
- [ ] Generate first CSMT HB test PDF.

### Phase 5 — AWS raw import

- [x] Create `div_aws_cms_uploads`.
- [x] Create `div_aws_cms_raw`.
- [x] Create upload route/UI for CMS Excel.
- [x] Import raw rows.
- [x] Skip duplicate `ABN.ID`.
- [x] Show upload summary.

**Phase 5 Notes:**
- Route file: `routes/division/awsUploadRoutes.js`
- UI file: `public/div/aws-upload.html`
- Mounted at: `/api/division/aws`
- AWS candidate detection based on ABN.TYPE = ST/EMU + AWS keywords in Detail field
- Column mapping auto-detects common CMS Excel column name variations
- Preview mode available before final import
- Duplicate ABN_ID rows automatically skipped

### Phase 6 — AWS parser and review

- [x] Parse AWS candidate rows from ST/EMU abnormality data.
- [x] Extract AWS code A/B/C/D/E/AUX/P/Q/R.
- [x] Extract location raw text.
- [x] Detect location type: SIGNAL/KM/PLATFORM/UNKNOWN.
- [ ] Match signal using aliases.
- [ ] Match cab/rake using `rake_coaches.coach_number`.
- [x] Create `div_aws_events`.
- [x] Create manual review screen for unmatched cases.
- [ ] Save manual corrections and create signal aliases when approved.

**Implementation Notes (Phase 6):**
- Parser routes: `POST /api/division/aws/parse`, `GET /events`, `PATCH /events/:id`, `GET /review/pending`
- Review UI: `public/div/aws-review.html`
- `extractAwsCode()` detects code with HIGH/MEDIUM/LOW confidence
- `extractLocation()` extracts signal ID, KM, platform or section
- Events with `needs_manual_review = 1` appear in review queue
- Setting aws_code clears `needs_manual_review` flag

### Phase 7 — AWS reports

- [x] Date range AWS summary.
- [x] Type-wise A/B/C/D/E/AUX/P/Q/R report.
- [x] Repeated signal/location report.
- [x] Repeated cab/rake report.
- [x] Section-wise braking report.
- [x] S&T account / cab-side / transient classification — JPO rules 2, 3a, 3b, 4 implemented; rule 1 (per-trip consecutive on same cab) stubbed pending adjacency data.
- [x] Weekly report-style PDF/export.

### Phase 8 — Signal sighting committee

- [ ] Create inspection master table.
- [ ] Create signal observation table.
- [ ] Link observations to `div_signals`.
- [ ] Add visibility/obstruction/recommendation fields.
- [ ] Build basic UI.

---

## 18. Verification Commands

After Phase 1 table creation:

```sql
SHOW TABLES LIKE 'div_signal%';
SHOW TABLES LIKE 'div_psr';
SHOW TABLES LIKE 'div_ohe%';
SELECT * FROM div_signal_beats ORDER BY id;
DESCRIBE div_signals;
SELECT COUNT(*) FROM div_signals;
SELECT COUNT(*) FROM div_psr;
```

### MySQL Local Import Setup

To import CSV files locally, connect with `--local-infile` enabled:

```bash
mysql -u root -p --local-infile=1 bbtro
```

Then enable server-side:

```sql
SET GLOBAL local_infile = 1;
```

PSR import example:

```sql
LOAD DATA LOCAL INFILE '/Users/neeraja/bbtro/data/psr/psr_dn_th.csv'
INTO TABLE div_psr
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(section, line, direction, start_km_text, end_km_text, start_km_decimal, end_km_decimal,
 speed_kmph, start_latitude, start_longitude, end_latitude, end_longitude, reason, remarks, @dummy);
```

The `@dummy` at the end skips the `insert_before_signal` column which is used later for beat book row placement.

Expected signal-related tables:

```text
div_signal_aliases
div_signal_beats
div_signal_book_rows
div_signal_book_sections
div_signal_history
div_signal_isd
div_signals
```

Expected additional tables:

```text
div_psr
div_ohe_neutral_sections
```

---

## 19. Decisions Log

| Date / Stage | Decision | Reason |
|---|---|---|
| Planning | Use central `div_signals` instead of `div_mainline_signals` | Existing mainline table is too limited and empty. |
| Planning | Keep `div_mainline_signals` for now | Avoid breaking any existing code. |
| Planning | Add beat book model | Same signal appears in multiple beat books; update once, print many. |
| Planning | Use `div_signal_book_rows` with `row_type` | Signal book contains signals, PSR, boards, neutral sections, station headers and diagrams. |
| Planning | Create `div_psr` as separate master | PSR is useful for signal book, SPM, RTIS and future reports. |
| Planning | Create `div_ohe_neutral_sections` as separate master | Neutral sections appear in books and may be useful for future analysis. |
| Planning | Use raw + parsed AWS storage | CMS text is messy; parser will improve over time. |
| Planning | Use signal aliases | Motormen write signals inconsistently in CMS AWS reports. |
| Planning | Match CMS LOCO to `rake_coaches.coach_number` | Existing rake structure supports cab/rake lookup. |
| Phase 1 | Added `is_lhs`, `is_ext_lhs` to `div_signals` | LHS placement flags needed alongside RHS for signal book summaries. |
| Phase 1 | Added `on_curve`, `curve_remarks` to `div_signals` | Signal book PDF has curved arrow marks column; structured field enables filtering. |
| Phase 1 | Added `ri_left_arms`, `ri_right_arms` to `div_signals` | Route indicator / diversion hand count needed per signal for book and analysis. |
| Phase 1 | PSR effective dates are optional | Not always known; `effective_from` and `effective_to` default NULL. |
| Phase 1 | PSR CSV includes `insert_before_signal` column | Used only for beat book row placement; skipped during `div_psr` import. |
| Phase 1 | BBTRO local path is `~/bbtro` not `~/Desktop/bbtro` | Confirmed during local setup. |
| Phase 5 | AWS tables created: `div_aws_cms_uploads`, `div_aws_cms_raw`, `div_aws_events` | Schema matches section 10 design. |
| Phase 5 | AWS candidate detection uses ABN.TYPE + keyword matching | ST/EMU types with AWS keywords in Detail field are flagged. |
| Phase 5 | Upload UI includes preview mode | Allows user to verify column mapping and check duplicates before final import. |
| Phase 5 | Duplicate ABN_ID rows skipped automatically | Unique constraint on abn_id prevents reimport of same record. |
| Phase 5 | Added `is_aws_candidate` column to `div_aws_cms_raw` | Flag to mark rows as AWS candidates. Allows user to remove/add during preview. All rows imported, flag determines processing. |
| Phase 6 | AWS code extraction based on signal aspect | Parse Detail text to detect aspect color/type and map to code. |
| Phase 7 (2026-06-05) | Added `seq_order` and `parallel_group_id` columns to `div_signals` | Foundation for adjacency-aware JPO rule 1 (per-trip consecutive signals). seq_order is the running order within `(section, line, direction)` partition. |
| Phase 7 (2026-06-05) | Created `div_signal_successors` table | Captures explicit directed edges that simple km-based seq_order can't infer: line crossovers (UP/DN local↔through, 5th/6th line at KYN), platform routing (one home signal to N platform starters), loop routing, section boundaries. Supports 1→N successors (multiple rows per from_signal). |
| Phase 7 (2026-06-05) | JPO classifier implemented per BB.TRSO.EMU.16 (07-03-2007) | Rules 2, 3a, 3b, 4 fully functional; rule 1 (consecutive-signal trip) stubbed. See `POST /classify-period`. |
| Phase 7 (2026-06-12) | Rule 1 (consecutive-signal trip) implemented — stub removed | Adjacency = successor edge OR shared parallel_group OR seq_order±1 in same partition. Trip = (cab, date). ≥3-event consecutive run → CAB_SIDE. Runs first so rules 2/3 see remainder. Unit-tested. |
| Phase 7 (2026-06-12) | `test_for_platform_parrallel_signals.csv` (203 rows) imported via AUTO succession-type | Importer now derives per-row type: line change → LINE_CROSSOVER, same line → PLATFORM_ROUTING. `section` derived from resolved signal (not hardcoded CSMT-KYN) so SE/KHPI/NE rows carry correct section. Successor graph now 235 rows. |
| Phase 7 (2026-06-12) | 4 missing signals added via `sql/2026-06-12_add_missing_signals.sql` | TNA S-65 (UP TH, restored), TNA S-28 (5TH/UP turn-back starter), KYN S-63 (PF-4 approach, assigned to fed line UP TH), K-001 (DN TH automatic, km approximate). Yard/approach signals with no named line take the line they feed into; sequence comes from successor rows. |
| Phase 7 (2026-06-12) | NE/THB/BSU/Harbour-branch successor rows added; `route_condition NOT NULL DEFAULT ''` | 69 rows extend the graph to Kasara NE, Trans-Harbour, Belapur-Uran (BSU) and Harbour branches. Found+fixed a dedupe bug: NULL `route_condition` bypassed the `uq_succession` unique key (MySQL treats NULLs as distinct), duplicating rows on every re-import. Importer now writes `''`; existing dups cleaned by `sql/2026-06-12_dedupe_signal_successors.sql`. Re-import is now idempotent. |
| Phase 7 (2026-06-05) | Combined crossover + platform routing in one table (`div_signal_successors`) | Both are "explicit directed edges seq_order can't infer"; distinguished by `succession_type` enum. Avoids two near-identical tables and one importer handles both. |
| Phase 7 (2026-06-05) | Signal matcher downgrades to MEDIUM on ambiguous lookups | L-/K-/ME- numbers are not globally unique across `(section,line,direction)` partitions. When ≥2 candidates exist, confidence drops so reviewers can disambiguate. `matchSignalFromDb(pool, raw, {section,line,direction})` accepts optional partition context. |
| Phase 7 (2026-06-05) | Canonical section naming: low-km-end first (e.g. `CSMT-KYN`, never `KYN-CSMT`) | Direction (UP/DN) carries the travel sense, so doubling section codes would just double partition count without information gain. The orphan `KYN-CSMT/TNA S-65` row from an early import was deleted as part of the migration. |
| Phase 7 (2026-06-08) | Deployment checklist captured in §23.1 of this doc | User directive: schema changes must be persisted in either a dated `sql/` file or the plan doc so server deploy doesn't miss anything. Phase 7 ships across 7 files + DB migration; the checklist makes the order explicit. |
| Phase 7 (2026-06-09) | `seq_order` = running order in travel direction (UP partitions ordered km DESC) | seq 1 is always the first signal a train meets. Rule-1 adjacency is symmetric so unaffected, but "next signal" walks need no per-direction special-casing. Migration step 3 updated. |
| Phase 7 (2026-06-09) | Canonical line names: `DN LOC` / `UP LOC` / `5TH` / `6TH` | Signal-book imports used these; crossover csv used `DN LL`/`UP LL`/`5th Line`/`6th Line`. Migration step 4b + `canonicalLine()` in importer map old → canonical. Successor resolution jumped 20/12 → 36/35 after normalization. |
| Phase 7 (2026-06-09) | Matcher zero-padding tries widths 2, 3 and 4 | `K48` must match `K-048` (3-digit form) — old code only padded to 2 digits. Station signals pad to 2; K-/L-/ME- automatics use 3–4 digit numbers. |
| Phase 2 (2026-06-10) | CSMT-KYN DN LOCAL line imported (`CSMT_KYN_DN_LOC`, 134 signals, 179 book rows) | Extracted from KYN SUB beat signal book 2026 PDF pages 1-4. Sources: `dnloc_signals.csv` + `data/CSMT_KYN/csmt_kyn_dn_loc.xlsx`. Beat bindings + Mumbra PSR row-order fix in `sql/2026-06-10_bind_csmt_kyn_dn_loc_to_beats.sql` (re-apply UPDATE after any re-import of this section). Curve directions cross-validated against UP TH (mirrored as expected). First section to use BOARD/NEUTRAL_SECTION row types — board labels must go in `display_signal_no`. |
| Phase 2 (2026-06-10) | Dadar platform PSR (30 KMPH, no km range) stored as TEXT_NOTE insert, not `div_psr` row | Book gives no km range; PSR sheet requires start/end km. TEXT_NOTE with YELLOW highlight + PSR icon renders identically without inventing master data. |
| Phase 2 (2026-06-10) | KYN_SUB beat bound with display_order 1=DN LOC, 3=DN TH, 4=UP TH | Mirrors the KYN SUB book index (1 DN LOCAL, 2 UP LOCAL, 3 DN TH, 4 UP TH); slot 2 reserved for UP LOCAL import. |
| Phase 2 (2026-06-10) | KYN-CSMT UP LOCAL line imported (`CSMT_KYN_UP_LOC`, 128 signals, 168 book rows) | Extracted from KYN SUB beat signal book 2026 PDF pages 5-8. Sources: `uploc_signals.csv` + `data/CSMT_KYN/csmt_kyn_up_loc.xlsx`. Bindings (KYN_SUB order 2, CSMT_SUB_ML order 4) + Mumbra PSR row-order fix in `sql/2026-06-10_bind_csmt_kyn_up_loc_to_beats.sql`. Heavy `is_ext_rhs` usage (Ext RHS in book); L-048 is `placement=Gantry`; terminal `CSMT STN 0.00KM` header uses blank `before_signal` (appends at section end). Curves cross-validated against DN LOC (mirrored at every km). |
| Phase 2 (2026-06-10) | Pictorial route-indicator glyphs in render (`scripts/render-signal-book.js`) | `RI:` strings parse into stem-and-arm SVG (explicit `L1=/R1=/MAIN=` dialect and positional dialect resolved via `ri_left_arms`/`ri_right_arms`; `Y=` tokens label the main route). Flag cross-references (route_indicator_notes contains "flag") render as semaphore flag + label. Curve arrows (`on_curve`) and RHS/Ext RHS tags now drawn from the `div_signals` JOIN. Verification list: `TEST_CHECKLIST_SIGNAL_BOOK_GLYPHS.md` (126 glyphs). Server restart needed for the live preview route (module cached). |
| Phase 2 (2026-06-10) | 5TH/6TH lines imported (`CLA_KYN_5TH` 64 signals / 71 rows, `CLA_KYN_6TH` 59 signals / 66 rows) | Book pages 17-18. Sources: `fifth_signals.csv` + `data/CSMT_KYN/cla_kyn_5th.xlsx`, `sixth_signals.csv` + `data/CSMT_KYN/kyn_cla_6th.xlsx`. Bindings (KYN_SUB order 5, 6) in `sql/2026-06-10_bind_5th_6th_lines_to_beats.sql`. Section = `CLA-KYN` (canonical low-km first), lines `5TH`/`6TH`. Page 17 is mis-titled "6TH" in the book; index + internal route references (DN LOCAL KYN S-2 → "5TH S-9" on p17) confirm it is the 5TH line. ME-prefix autos stored verbatim with space ("ME 3401"). No station headers in these sections — continuous running with PSK (Parsik) and DCC cabin signals. |
| Phase 2 (2026-06-11) | CSMT-PNVL harbour line imported (`CSMT_PNVL_DN_HB` 100 signals / 154 rows, `CSMT_PNVL_UP_HB` 102 signals / 154 rows) | Source: user-curated `data/CSMT_PNVL/csmt_pnvl_master.xlsx` (8 tabs: signals / PSR / Stations / Neutral-Section per direction). Per-section import files generated from the master (`csmt_pnvl_dn_hb.xlsx` + `dnhb_signals.xlsx`, `csmt_pnvl_up_hb.xlsx` + `uphb_signals.xlsx`). Explicit RI dialect throughout — hands render exactly. Both sections bound to BOTH `CSMT_HB` and `PNVL_SUB_HB` (`sql/2026-06-11_bind_csmt_pnvl_hb_to_beats.sql`) — first beats sharing whole-book section pairs. Master keeps neutral-section tabs in book order; the build step reverses same-target groups for the importer. Terminal station headers use blank `before_signal`. Where boards/N-S share a target with a station header, render order is boards → N/S → header → signal (KYN Mumbra pattern) — flagged for user verification. |
| Phase 2 (2026-06-15) | Glyph render polish (`scripts/render-signal-book.js`) | Diversion-hand stem now capped: starts at a circle head and ends just past the lowest arm (3px tail), eliminating the bare overshoot above the topmost hand. Added filled circle head (red on RHS). Flag cross-reference glyphs keep the semaphore-flag shape (no head). User picked the book-faithful monochrome circle over a R/Y/G signal head. |
| Phase 2 (2026-06-15) | KYN-KJT SE line imported (`KYN_KJT_DN_SE` 60 signals / 80 rows, `KYN_KJT_UP_SE` 61 signals / 79 rows) | Source: user-curated `data/KYN_KJT/kyn_kjt_master.xlsx` (8-tab structure like the HB master). This is the AWS-relevant plain double-line part of SE (KYN→KJT); the ghat (KJT-LNL, with DN/UP MID lines) and beyond (LNL-PUNE) come later as separate sections. Section=`KYN-KJT`, lines `DN SE`/`UP SE`. One fix during build: KALYAN station header targeted `KYN S-53` (a DN-LOCAL signal) — retargeted to the section's first signal `KYN S-56`; **user to mirror this fix in the master and confirm whether KYN S-53 is a genuinely missing SE signal**. Bound to KYN_SUB (book index 9-10), CSMT_SUB_ML (7-8), CSMT_ML_MMR + KYN_GOODS (9-10) via `sql/2026-06-15_bind_kyn_kjt_se_to_beats.sql`; display-order gaps before SE reserve the NE (KYN-KSRA) slots. |
| Phase 2 (planning) | Ghat sections model the Middle line as two `line` values, NOT `direction=BOTH` | Mid-line signals are physically direction-specific (a signal faces one way), so they fit `(section, line, direction)` exactly like the main lines. No schema change. A ghat section becomes 4 partitions. The book's "middle line as a column" is a rendering choice, deferred — render MID as its own sub-section for now. **Naming resolved at first ghat import (KJT-LNL, 2026-07-09): corridor-qualified — `DN SE` / `UP SE` / `DN SE MID` / `UP SE MID`** (the generic `DN ML`/`DN MID` placeholders in this note are superseded; keep the corridor code in every `line` so `line LIKE '%SE%'` selects the whole SE corridor incl. mid). NE ghat (KSRA-IGP) will follow as `DN NE` / `UP NE` / `DN NE MID` / `UP NE MID`. |
| Phase 2 (2026-06-15) | Track identity lives in `line`; travel direction in `direction` — no `track_variant` column added | Considered `ALTER TABLE div_psr ADD track_variant` for ghat parallels; rejected. Both `div_signals` and `div_psr` already carry `line` + `direction`, so `(section, line, direction)` expresses every track without a new column, symmetric across both tables. `direction` (UP/DN) is what the SPM analysis app reads for direction; `line` carries the specific track/route. `line` is kept in its current `"DN TH"`/`"UP SE"` form (not normalized to bare `"TH"`) — SPM uses `line` + `direction` together. Ghat routing variants become distinct `line` values: e.g. SE ghat UP can run via the MID line or via NNCN station (different distances — SPM must distinguish; signal book need not), so those are separate `line` values, both `direction='UP'`. |
| Phase 8 (2026-06-16) | Signal Book Editor — in-app section editing (decisions: UI-authoritative + import guard, draft→publish, structured arm editor) | Schema `sql/2026-06-16_signal_book_editor_schema.sql`: `div_signal_book_sections.edit_source ENUM('import','ui')`, new `div_signal_section_drafts` (one draft JSON per section), and `div_signal_book_rows.row_source` gains `'ui'`. Backend: `routes/division/signalBookRoutes.js` adds `/sections`, `/section/:code/editable`, PUT `/draft`, POST `/publish` (transactional: upserts signals canonicalising RI arms, atomically rebuilds book rows, logs to `div_signal_history`, flips `edit_source='ui'`, clears draft), POST `/discard`, GET `/section/:code/preview`. RI (de)serialise shared via new `scripts/ri-spec.js` (render + editor + publish all agree). Import guard: `scripts/import-signal-section.js` refuses to overwrite a `ui`-owned section without `--force`. Frontend `public/div/signal-book-editor.html`: section picker → editable row table, structured diversion-arm editor with live SVG glyph (client mirror of `riGlyphSvg`), reorder/add/delete rows, Save draft / Publish / Discard, linked from `signal-book.html`. Driver-facing render still reads live tables = published state, so it's unchanged. **Server restart needed to load the new routes.** |
| Phase 8 (2026-06-17) | Signal-class badges (Ⓟ distant / ⒾⒷ IBS / Ⓖ gate) + book label separate from identity | The printed book marks distants as bare "DIST" + circled P, IBS as the real number + circled IB, gates as a short number + circled G. So identity and display are separated: `signal_number` is the unique DB/AWS id (qualify repeating distants/gates, e.g. `ASO DIST`, `ASO GATE S-1`); optional `display_signal_no` column on the signals spine is the book label (e.g. `DIST`), falling back to `signal_number`. The badge is derived from class (`signal_function` containing 'Distant' → Ⓟ, else `signal_type`/`signal_function` IBS → ⒾⒷ, else `signal_type=Gate` → Ⓖ) and rendered in the signal-no cell — never typed text. IBS signals are already unique in the book (`ASO S-14`, `VSD S-12`) so use those directly, NOT generic `IBS S-14`. Resolves the KYN-KSRA duplicate-signal-number blocker: distants get unique ids while still printing "DIST Ⓟ". Renderer + importer + editor (Book label + Function fields) all updated; 17 existing Gate signals now show Ⓖ. |
| Phase 2 (2026-06-24) | KJT-KHPI imported (Karjat–Khopoli suburban shuttle, with PSR) — `KJT_KHPI_DN_KHPI` 18 rows, `KJT_KHPI_UP_KHPI` 20 rows (ids 49,50) | Diversion from KJT, suburban-only; NOT part of KJT-LNL-PUNE. `section='KJT-KHPI'`, **`line='DN KHPI'/'UP KHPI'`** (distinct from the KYN-KJT main SE so line-based queries/AWS stay clean; book heading still "DN/UP SE" via section_title) — matches the successor CSV's `DN KHPI`/`UP KHPI`. Source `data/KJT-KHPI/KJT_KHPI_master.xlsx` (with PSR). Badges verified (GATE-x DIST/PDI DIST → Ⓟ, GATE-x → Ⓖ); curation fixed gate `signal_function='Gate'`→blank and added distant functions. Bound to **KYN_SUB** (11,12) `sql/2026-06-24_bind_kjt_khpi_to_kyn_sub.sql` — beat now 12 sections / 1150 rows. **Completes the suburban sections for the AWS project.** Alternate KJT→PDI paths to be added as succession edges (all converging at PDI), not as book sections. NOTE for AWS: KJT yard signals here are `DN KHPI`/`UP KHPI` while the successor CSV also references them as `[DN SE]` — reconcile at successor load. |
| Phase 2 (2026-06-24) | BSU line imported — convergence/divergence at KILLE cabin (signals+stations; PSR deferred) | Belapur/Nerul→Uran. DN: legs `NEU-KILLE` + `BEPR-KILLE` merge at KILLE, single trunk from `NU-3`. UP: trunk to `KILLE S-6` then diverges. 3 segment partitions (trunk `KILLE-URAN` stored ONCE: 23 DN/24 UP; legs `NEU-KILLE` 5/3, `BEPR-KILLE` 4/2) → 6 sections `*_DN/UP_BSU` (ids 43-48), line `DN BSU`/`UP BSU`. Source `data/BSU_LINE/BSU UP DN.xlsx` (pre-split; section/line/dir columns were scrambled — overridden from tab names). KILLE is a merge cabin, not a public station — carried as a "KILLE CABIN" header. PSR **excluded** (all km ranges blank + one bad target BEPR S-25) — user chose to import signals+stations now, add PSR later. Bound PNVL_SUB_HB 11-16 (`sql/2026-06-24_bind_bsu_to_pnvl_sub_hb.sql`); beat now 16 sections / 591 rows. |
| Phase 2 (2026-06-22) | VDLR-GMN harbour branch imported (Wadala→Goregaon) — `VDLR_GMN_DN_HB` 35 sig/53 rows, `GMN_VDLR_UP_HB` 36 sig/54 rows (ids 40,41) | Source `data/TNA_VSH/VDLR_GMN/VDLR-GMN-VDLR.xlsx` (with PSR). Full route is CSMT-GMN-CSMT; CSMT→VDLR (up to `RVJ S-9`) is the shared main-HB head — imported as-is per user, so `RVJ S-6`/`RVJ S-9` are intentionally duplicated with the CSMT-PNVL HB section (only those 2 overlap; `RVJ S-7/S-8` are the other VDLR platform signals — 2026-06-22 also added to `CSMT_PNVL_DN_HB` between RVJ S-6 and S-9 (VDLR PF-2/PF-3, both routing to RVJ S-21), so they too are shared across both sections. Added via the build `dnhb_signals.xlsx` + re-import — **also add to `csmt_pnvl_master.xlsx` DN HB tab** for source consistency. Their parallel/diversion edges (S-7/S-8 → S-21 & S-15) exist in `test_for_platform_parrallel_signals.csv` but are NOT yet loaded into `div_signal_successors`. section=`VDLR-GMN`, line `DN HB`/`UP HB`. Build fixed `MM-57`→`MM S-57` and (after a corrected-file round) Excel date-mangled PSR km cells + one blank-km PSR row. Bound to CSMT_HB (3,4) + PNVL_SUB_HB (9,10) via `sql/2026-06-22_bind_vdlr_gmn_to_hb_beats.sql`. |
| Phase 2 (2026-06-22) | TransHarbour (THB) line imported — shared-trunk model | TNA→TUH→{VSH terminates, NEU joins CSMT-PNVL HB}. Route splits at TUH (last shared signal `TUH S-2`; `TUH S-11`→NEU, `TUH S-12`→VSH). Modelled as 3 segment partitions so the trunk is stored ONCE: `TNA-TUH` (shared, 19 DN/19 UP), `TUH-NEU` (7 DN/9 UP), `TUH-VSH` (5 DN/6 UP) — 6 book sections `*_DN/UP_THB` (ids 15-20). Line value is **`DN THB` / `UP THB`** (direction baked into `line`, matching the `DN TH`/`UP HB` convention) — required because the uniqueness key is `(normalized_signal_number, section, line)` with direction NOT included, so a bare `line='THB'` merged signals like `TNA S-62` that (erroneously) appeared in both directions. User also corrected that DN/UP duplication in the source. Source `data/TNA_VSH/THB UP DN_W_o PSR.xlsx` (user pre-split into trunk+branch tabs); per-section build in `data/TNA_VSH/build/`. Build overrode the stale `section` column (old TNA-NEU/TNA-VSH/VSH-TNA) with clean segment names from the tab, normalized signal-number whitespace (spine had `TNA  S-62`, `TN - 27`; targets had tight forms — importer matches exactly), and fixed 3 station targets (TUH-VSH TURBHE→TUH S-12, SANPADA→TN-27 [inferred, confirm], NEU-TUH NERUL→NEU S-25). PSR excluded (not ready). Bound to PNVL_SUB_HB orders 3-8 (`sql/2026-06-22_bind_tna_vsh_thb_to_pnvl_sub_hb.sql`); beat now 8 sections / 397 rows. |
| Phase 2 (2026-07-10) | KJT yard modelling decided — successor graph is AWS-only (suburban); yard signals go in a separate book section, not the running list | Brainstormed structure (locked). **Purpose of `div_signal_successors` = AWS JPO Rule 1 (consecutive-signal cab-defect detection) — a suburban-EMU function.** So: **KJT-KHPI** (suburban shuttle) needs successors → load `kjt_signal_routes.csv` (DN KHPI) + `PDI-KJT-UP.csv` (UP KHPI); **KJT-LNL** (mail/express/goods) is **out of AWS scope → NO successor edges built.** This dissolves the "which line does a shared yard signal S-36/S-38 belong to" problem — the yard **road** signals (S-36/37/46/47/54/55 etc.) stay **`DN KHPI`-only** (for suburban AWS) and are **never** copied to DN SE / DN SE MID. Book presentation (matches the real KYN GOODS book, p59 "KJT UP YARD RECEPTION & DEPARTURE"): running-line sections show the linear signals incl. platform starters PF-1/2/3 (done); the yard/road signals are shown in a **separate "yard signals" section rendered with diversion-hand `RI:` glyphs** (like other signals) — **deferred**; static reception/departure **schematic images** (`SIDING_DIAGRAM` row type already exists) are an **added feature** — **deferred**. Route interlocking source: user's `KJT SIGNALS-1..4.pdf` + `KYN UP YD.pdf` (kept as reference). |
| Phase 2 (2026-07-14) | LNL-PUNE corridor imported (Lonavala→Pune, plain SE, no MID) | Source user master `data/LNL-PUNE/lnl_pune_master.xlsx` (8 tabs: signals/Stations/PSR/NS × DN,UP). Sections (ids 61-62): `LNL_PUNE_DN_SE` 92 sig/124 rows (18 station hdr + 8 PSR + 6 NS), `LNL_PUNE_UP_SE` 94 sig/120 rows (17 + 3 + 6) — **186 signals / 244 rows**. `section='LNL-PUNE'`, lines `DN SE`/`UP SE` (single line per direction — this stretch has no middle line). Pre-flight: 0 orphan anchors, 0 dup, geography monotonic (DN asc from LNL 128 km, UP desc from SVJR 189 km); only nit `signal_type='Automatic '` trailing space on 33 DN autos — **trimmed in build** (importer trims anyway). Build via new generic `scripts`-style builder (kept in scratchpad, output in `data/LNL-PUNE/build/`). **Bound to CSMT_ML_MMR ONLY** (19,20) via `sql/2026-07-14_bind_lnl_pune_to_beats.sql` — **user decision 2026-07-14: NOT KYN_GOODS / PNVL_GOODS** (unlike KJT-LNL); beat now 20 sections/1600 rows. **Boundary overlap (same-magnet, deferred link):** Lonavala signals already in KJT-LNL now recur here as LNL-PUNE's origin — `LNL S-8` DN, `LNL S-63/64/65/66/68/69/70` UP, `LNL S-9` — legit separate rows (different section), imported `magnet_id`=NULL; when the magnet backfill/importer logic runs, these LNL-PUNE copies must adopt the **existing KJT-LNL magnets** (same station+number+direction) e.g. `LNL S-63` UP → magnet 2041. Successors: none (SE mail/express/goods = out of AWS scope, per 2026-07-10 decision). |
| Phase 2 (2026-07-30) | PNVL-DVA complex DN (reverse) imported — BSR/KYN→PNVL/DW | Source user master `data/PNVL_DVA/BSR_PNVL_DW_KYN_MASTER.xlsx`. DN mirror of the UP complex: sections (ids 83-87) `KOPAR-BSR`(37, BSR DN), `DCC-KYN`(9), `DAT-DCC`(3, junction — user left section/line blank to decide → filled DAT-DCC/DIVA DN to pair with UP), `DCC-DIVA`(7), `PNVL-DCC`(36) all DIVA DN — **92 signals**. Same section names as UP, `DN` lines → pair cleanly (`PNVL_DCC_DIVA_UP` ↔ `_DN`). **Aux-naming cleanup (assistant, before import — would have silently dropped NS/PSR):** renamed 7 aux sheets whose names didn't match their signals sheet (missing `DN` suffix; `KOPR`→`KOPAR`; `NS` at end); fixed 2 PSR line typos (`BSR DN`→`DIVA DN`, blank→`DIVA DN`); **km column-offset** on 2 PSR sheets (km text in `start_km_decimal`/`end_km_decimal` → moved to `_text`); `Semi Automatic`×16→`Semi-Automatic`; NS anchor `DCC S-9`→`DI S-9` (user-confirmed typo; DCC S-9 is an unrelated CSMT-KYN main-line signal). .bak kept. **Bound to KYN_GOODS(29-33)+PNVL_GOODS(19-23)+CSMT_ML_MMR(33-37)** via `sql/2026-07-30_bind_pnvl_dva_dn_to_beats.sql`; all 3 beats render, 0 orphans. Same-magnet deferred links: DN signals ↔ their UP twins + PNVL/KYN/BSR boundaries. **Preflight gap noted:** it doesn't warn about aux sheets that fail to attach (name mismatch) or km-in-decimal-col offsets — both were caught manually here; worth adding to `scripts/preflight-corridor.js` later. |
| Phase 2 (2026-07-30) | PNVL→DW/KYN/BSR complex (UP) imported — the shared-trunk network | Source user masters `data/PNVL_DVA/PNVL_DW_KYN_BSR_MASTER.xlsx` (7 sections) + `kyn_bsr_master.xlsx` (KYN-BSR chord). **Shared-trunk decomposition** (TransHarbour/BSU pattern) — each signal stored ONCE, routes assembled by binding: `PNVL-DCC`(37, shared-3 trunk to DCC S-3 where DIVA diverges) → `DCC-DIVA`(5) Diva leg / `DAT-DCC`(3, shared KYN+BSR after DIVA splits) → `DCC-KYN`(10) KYN leg / `DCC-KOPAR`(2) + `KOPAR-BSR`(33) BSR route; `DW-DCC`(8) = Diva→DCC approach feeding BSR; `KYN-BSR`(12) = the KYN chord (KYN S-6 goods yard + KYN PF + 6th-line copies ME48xx/DI S-31/DI S-18 + DI S-7 → converges DI S-5). Sections (ids 75-82): **110 signals**. Lines: DIVA UP (trunk+Diva+KYN legs), BSR UP (all BSR-feeding incl. DW-DCC + KYN-BSR chord — user picked BSR UP so the KYN→BSR book reads one line, no mid-route flip; goods = not AWS-scoped so direction is cosmetic). **Direction convention:** whole complex = UP (outbound from PNVL); reverse master will be all DN. **Heavy prep cleanup (this was the hardest master):** user built it over several rounds; assistant fixed mechanicals (template leftovers, Semi Automatic→Semi-Automatic, DW-DCC DN→UP/BSR UP, redundant DATIVALI header, PSR anchor typos IBS S-2/BIRD IBS, moved DI S-5 PSRs to DCC-KOPAR, set aside DI S-31 PSR + DI S-7 NS for the chord) with a .bak backup; KYN-BSR file was headerless (first signal row consumed as header) → rebuilt into standard 31-col format (`rebuild_kynbsr.js`). **Bound to KYN_GOODS(21-28)+PNVL_GOODS(11-18)+CSMT_ML_MMR(25-32)** via `sql/2026-07-30_bind_pnvl_dva_to_beats.sql`; all 3 beats render, 0 orphans. **Same-magnet (deferred link):** DCC S-27/28 in DAT-DCC + DW-DCC (both approaches); DI S-5 in KYN-BSR + DCC-KOPAR; KYN-BSR copies (KYN PF, ME48xx, DI S-31, DI S-18) ↔ CLA-KYN 6TH; plus PNVL/KJT boundary signals ↔ PNVL-ROHA/KYN-KJT/KJT-KHPI. No successors (goods). **Still to do:** the reverse (→PNVL, DN) master. |
| Phase 2 (2026-07-24) | PNVL-KJT chord imported (Panvel→Karjat, single line) | Source user master `data/PNVL_KJT/pnvl_kjt_master.xlsx` (8 tabs). Sections (ids 73-74): `PNVL_KJT_DN_KJT` 20 sig/30 rows, `PNVL_KJT_UP_KJT` 28 sig/38 rows — **48 signals / 68 rows**. **Single physical line modelled as two direction partitions `DN KJT` / `UP KJT`** (same convention as PEN-TVSG / CLA-TMBY branches and the ghat MID lines — direction baked into the line name because the identity key `(signal_number, section, line)` excludes direction; signals + PSR differ per direction on the one track). **Pre-flight caught (user fixed & re-saved):** UP sheet had 4 Karjat starters on `line=UP LN` → `UP KJT` (else they'd split off and the KARJAT header wouldn't head the UP section); DN NS sheet named `NS PNVL KJT` (no DN suffix) → `NS PNVL KJT DN` so it attaches; UP PSR blank `start_km_text` (a column offset in the master). Builder/preflight already normalise spaces≡hyphens. **Bound to CSMT_ML_MMR (23,24) + PNVL_GOODS (9,10)** via `sql/2026-07-24_bind_pnvl_kjt_to_beats.sql`; render clean, 0 orphans. **Boundary same-magnet (deferred link):** Panvel DN starters `PNVL S-9/11/12/13/15` + UP `S-30/34` ↔ PNVL-ROHA; Karjat starters `KJT S-132/134/137` ↔ KYN-KJT/KJT-KHPI; **Panvel starters `PNVL S-24/25/26/28/29` RETAINED here (user, re-tagged KYN-PNVL→PNVL-KJT) and will also appear in the future PNVL-DW/KYN/BSR sections** — same-magnet, link when those load. No successors. |
| Phase 2 (2026-07-24) | PNVL-ROHA corridor imported (Panvel→Roha, Konkan Railway) — completes PNVL→ROHA→RN | Source user master `data/PNVL_ROHA/pnvl_roha_master.xlsx` (8 tabs; mixed space/hyphen sheet names — builder+preflight now normalize spaces≡hyphens via skey). Sections (ids 71-72): `PNVL_ROHA_DN_KR` 60 sig/93 rows (11 station+10 PSR+12 NS), `PNVL_ROHA_UP_KR` 62 sig/96 rows (11+11+12) — **122 signals / 189 rows**. Lines `DN KR`/`UP KR` (same Konkan family as ROHA-RN). **Pre-flight caught 3 (user fixed & re-saved):** `signal_type='Distant'` on 22 signals → `Manual` (Distant is a function, not a type; would fail the enum; function col was already correct, matching ROHA-RN's Manual distants); PSR UP line `UP ML`→`UP KR`; DN terminal ROHA header + a PSR anchored at `ROHA S-3` (which lives in ROHA-RN) — user added `ROHA S-3` to this section so it resolves. **Bound to 4 beats** — CSMT_ML_KR (9,10), PNVL_GOODS (7,8), KYN_SUB (13,14), PNVL_SUB_HB (17,18) — via `sql/2026-07-24_bind_pnvl_roha_to_beats.sql`; all render clean, 0 orphans. **Boundary same-magnet (deferred link):** Pen junction shared with PEN-TVSG — `PEN S-6/7/8/9` (DN) + `PEN S-37/38/39` (UP), numbers+direction+km all match; and `ROHA S-3` (DN) shared with ROHA-RN. Roha otherwise splits cleanly (S-2/24-29 here vs S-3/8/DIST/S-32 in ROHA-RN). Gate-number repeats = different physical gates. No successors. |
| Phase 2 (2026-07-21) | CLA-TMBY branch imported (Kurla→Trombay, no stations/PSR/NS) | Source user master `data/CLA-TMBY/cla_tmby_master.xlsx` (2 signals tabs — `CLA-TMBY UP` + `TMBY-CLA DN`). Sections (ids 69-70): `CLA_TMBY_DN_TMBY` 19 sig/19 rows, `CLA_TMBY_UP_TMBY` 17 sig/17 rows — **36 signals / 36 rows**. Lines `DN TMBY`/`UP TMBY`. **Pre-flight caught 2 rounds:** (1) dup `CLA S-36` in UP (real signal + a stray blank-detail row); (2) after the user renamed the Kurla-end signals `CLA…`→`VVH…` to dedupe, the **cross-section check flagged a worse collision** — 5 of those (`VVH S-2/3/5/36/37`) reused numbers of the real Vidyavihar signals (ids 279/193/280/750/45) at the same station, in same direction for S-2/S-5/S-36 → two different physical signals sharing an identity at an AWS junction. User confirmed **different signals** and renumbered so 0 overlaps remain (cross-section re-check empty). Some blank `signal_function` / placeholder `location_text` left by design (user to replace later). **Bound to KYN_GOODS** (19,20) via `sql/2026-07-21_bind_cla_tmby_to_beats.sql`; beat now 20 sections/1392 rows, 0 orphans. **Lesson:** always run the cross-section (number+direction vs existing div_signals) check before importing a renamed/deduped master — an intra-sheet dedupe can hide a DB-wide identity collision. No successors. |
| Phase 2 (2026-07-17) | PEN-TVSG branch imported (Pen→Thal, no stations/PSR/NS) | Source user master `data/PEN-TVSG/pen_tvsg_master.xlsx` (only 2 signals tabs — no Stations/PSR/NS). Sections (ids 67-68): `PEN_TVSG_DN_TVSG` 19 sig/19 rows, `PEN_TVSG_UP_TVSG` 18 sig/18 rows — **37 signals / 37 rows**. Lines `DN TVSG`/`UP TVSG`. Pre-flight caught dup `JSWD S-15` (UP, two diff km 112/12 vs 108/20) — **user fixed & re-saved** (renumbered one). User initially marked 9 signals `is_active=0` (not-yet-commissioned TVSG-end + GATE-15) then **changed all to is_active=1** to show them in the book — all 37 active. Builder fix: header-only (empty) inserts/PSR sheets when a corridor has no aux data (a placeholder data row was failing importer validation with 5 errors). **Bound to PNVL_GOODS** (5,6) via `sql/2026-07-17_bind_pen_tvsg_to_beats.sql`; beat now 6 sections/175 rows, 0 orphans. Only pre-existing collision is unrelated gate `Gate-22` (KYN-KJT). No successors. |
| Phase 2 (2026-07-16) | ROHA-RN corridor imported (Roha→Ratnagiri, Konkan Railway, plain KR, no MID) | Source user master `data/ROHA_RN/roha_rn_master.xlsx` (8 tabs, LNL-PUNE-style naming). Sections (ids 65-66): `ROHA_RN_DN_KR` 108 sig/163 rows (21 station+10 PSR+24 NS), `ROHA_RN_UP_KR` 106 sig/162 rows (22+10+24) — **214 signals / 325 rows**. Lines `DN KR`/`UP KR` (KR = Konkan Railway). Pre-flight 100% clean first pass (0 dup, 0 orphan anchors, both terminal station headers — RATNAGIRI end of DN, ROHA end of UP — carried by the auto-builder). **Bound to CSMT_ML_KR ONLY** (7,8) via `sql/2026-07-16_bind_roha_rn_to_beats.sql` (user decision — the Konkan-Railway mainline beat); beat now 8 sections/1088 rows, 0 orphans. **No boundary same-magnet overlap** — the only pre-existing collisions are unrelated gate numbers (`Gate-4` KYN-KJT, `GATE-62` LNL-PUNE = different physical gates, like GATE-7/Gate-7); no ROHA/RN station signals pre-exist (Pen–Roha stretch not in DB). No successors (out of AWS scope). |
| Phase 2 (2026-07-16) | IGP-MMR corridor imported (Igatpuri→Manmad, plain NE, no MID) | Source user master `data/IGP_MMR/igp_mmr_master.xlsx` (8 tabs; sheet naming differs — DN=`IGP-MMR`, UP=`MMR-IGP`, aux=`STATIONS/PSR/NS <sheet>`; builder auto-detects sheets by `signal_number` col + `<PREFIX> <name>` aux pairing, and carries terminal station headers with blank before_signal). Sections (ids 63-64): `IGP_MMR_DN_NE` 107 sig/152 rows (15 station+15 PSR+15 NS), `IGP_MMR_UP_NE` 106 sig/153 rows (15+17+15) — **213 signals / 305 rows**. Lines `DN NE`/`UP NE`. **Pre-flight caught 4 master errors — user fixed & re-submitted:** dup `NK INN DIST` (DN, 2 diff km) + dup `NR S-20` (UP, Home vs Adv Starter); PSR `MMR-IGP` line `UP SE`→`UP NE`; 4 PSR anchors `IBH`→`IBS` (`NK IBH S-33`, `MMR IBH INN DIST`, `SUM IBH S-13`, `PI IBH DIST`). **Enum fix:** UP had `signal_function='Intermediate Starter'` (LS S-27, NK S-55) — added to the `div_signals.signal_function` enum via `sql/2026-07-16_add_intermediate_starter_signal_function.sql` (additive; run on prod before importing there). **Bound to CSMT_ML_MMR ONLY** (21,22) via `sql/2026-07-16_bind_igp_mmr_to_beats.sql` (user decision, like LNL-PUNE); beat now 22 sections/1905 rows. **Boundary overlap (same-magnet, deferred link):** Igatpuri signals `IGP S-64/66/67` already in KSRA-IGP (magnets 2124/2125/2126) recur here as IGP-MMR origin rows (diff section = separate rows, magnet_id NULL) — link when magnet logic runs. No successors (NE mail/express/goods out of AWS scope). |
| Phase 2 (2026-07-09) | KSRA-IGP ghat imported (NE, 4 partitions incl. MID line) | Source user master `data/KSRA-IGP/ksra_igp_master.xlsx` (12 tabs). Sections (ids 57-60): `KSRA_IGP_DN_NE` 19 sig/25 rows, `KSRA_IGP_UP_NE` 14/22, `KSRA_IGP_DN_NE_MID` 13/19, `KSRA_IGP_UP_NE_MID` 14/22 — **60 signals / 88 rows**. Lines `DN NE`/`UP NE`/`DN NE MID`/`UP NE MID` (corridor-qualified ghat convention). **Boundary handling (KJT-KHPI precedent, user-chosen):** the KASARA UP platform starters `KSRA S-23/24/28` — tagged `section=KSRA-KYN` in the UP NE + UP NE MID tabs — were **EXCLUDED** from the import (they already live on `KYN-KSRA/UP NE`; importing would duplicate). Build re-pointed the UP NE KASARA station header (had targeted the excluded `KSRA S-23`) to append at section end; UP NE MID KASARA already appended. Onward ghat-UP→plain routing to go in the NE route CSV as cross-section edges. Master fixes user did on re-submit: `TGR-I S-2`→`TGR-1 S-2`, KASARA target, and `IGP S-64/66/67` line `DN ML`→`DN NE` (also auto-overridden from tab). Build via `data/KSRA-IGP/build/`. Bound CSMT_ML_MMR + KYN_GOODS (15-18) via `sql/2026-07-09_bind_ksra_igp_to_beats.sql` — **PNVL_GOODS not applicable** (per user); both beats now 18 sections/1356 rows. Badges verified. Route CSVs (SE+NE together) still to come. |
| Phase 2 (2026-07-09) | KJT-LNL ghat imported — first ghat (4 partitions incl. MID line) | Source user master `data/KJT-LNL/kjt_lnl_master.xlsx` (12 tabs: signals/stations/PSR × 4). Sections (ids 53-56): `KJT_LNL_DN_SE` 28 sig/36 rows, `KJT_LNL_UP_SE` 22/35, `KJT_LNL_DN_SE_MID` 23/33, `KJT_LNL_UP_SE_MID` 25/34 — **98 signals / 138 rows**. `section='KJT-LNL'`, lines `DN SE`/`UP SE`/`DN SE MID`/`UP SE MID`; `section_title` prints "DN SE LINE"/"DN SE MIDDLE LINE" etc. **MID modelled as two partitions** (own signals + own PSR per direction; MID PSRs same spot, start/end km per direction). Pre-flight fixes (user did in master): `MHC S-4`→`MHLC S-4` (station+PSR target, DN SE MID) and `section` col `KJT-LNL SE`→`KJT-LNL`. Build via `data/KJT-LNL/build/` (per-section files). Bound CSMT_ML_MMR + KYN_GOODS (11-14) + PNVL_GOODS (1-4, first content) via `sql/2026-07-09_bind_kjt_lnl_to_beats.sql`; CSMT_ML_MMR/KYN_GOODS now 14 sections/1268 rows, PNVL_GOODS 4/138. Badges verified (Ⓟ on the 13 Distants). **KJT-yard signals now shared across lines** — KJT S-16/21/22/28/42 on DN SE + DN SE MID (+ already DN KHPI); adding these **auto-resolved old pending SE-line successor edges** (successor graph from_resolved 337→352). **Note:** KJT S-62 landed on `DN SE MID` here, but the old pending edge references `[DN SE]` — reconcile when the KJT-LNL route CSVs (still to come) load. Ghat MID-column rendering still deferred (rendered as own sub-section). |
| Phase 2 (2026-06-28) | KYN S-58 (PF-5 starter) + KYN S-66 (PF-1→NE connector) added to book | Source `data/KYN_KSRA/kyn_miised_signals.xlsx`. **KYN S-58** mirrors the KYN S-56 (PF-4) junction-starter precedent — stored once per DN line: `CSMT-KYN/DN TH`, `KYN-KSRA/DN NE`, `KYN-KJT/DN SE` (3 records, ids 2006-2008), book rows placed beside KYN S-56 in each book. **KYN S-66** (id 2009) = single `KYN-KSRA/DN NE` record, book row between S-58 and KYN S-72. Method: **targeted insert** `sql/2026-06-28_kyn_s58_s66_signals.sql` (signals + book rows, not section re-import) — chosen because the **DN TH section has no standalone build spine** (its signals live in the `kjt_khpi_dn/up.xlsx` "DN TH" tab; DB has 115 vs workbook 118, so a blind re-import is unsafe). Build fix: `signal_type` `'Semi Automatic'` → `'Semi-Automatic'` (enum). Successors `data/KYN_KSRA/kyn_s58_s66_routes.csv` (3 edges): `KYN S-49 [DN LOC]→KYN S-66 [DN NE]` (PF-1 crossover), `KYN S-66→KYN S-72`, `KYN S-58 [DN NE]→KYN S-72` (RI:L1=S-72, same-line); graph 396→**400**. KYN S-58 successors completed symmetric to the KYN S-56 (PF-4) precedent: DN TH copy crosses to both KYN S-72 [DN NE] + KYN S-82 [DN SE] (LINE_CROSSOVER, auto-resolved from old CSV on record creation), plus same-line PLATFORM_ROUTING DN NE→S-72 and DN SE→S-82. DN NE/DN SE spines+masters synced (S-58/S-66 after KYN S-56; dry-run 72/61 OK); **DN TH KYN S-58 is DB-only — no canonical spine to sync** (flagged). seq_order high for S-58/S-66 (NULL km) but successors cover AWS adjacency; book order via row_order correct. KYN_SUB 1164→1168 rows. Optional follow-up: parallel_group S-58↔S-56. |
| Phase 2 (2026-06-27) | KJT→PDI diversion routes loaded (succession edges) + 28 KJT-yard routing signals | Source: `data/KJT-KHPI/KJT_KHPI_DN_ROUTES.csv` (320 rows → **45 distinct edges**, converge at PDI S-16) + `KJT_KHPI_UP_ROUTES.csv` (31 edges, exit to KJT S-142 [UP SE]). The yard diversion-route signals (KJT S-14/21/22/23/28/32/36/37/39/42/46/47/54/55/64, PDI S-4 [DN]; KJT S-72/81/87/102/103/104/105/106/112/133/134/137 [UP]) were absent from div_signals — added **routing-only** (no book rows; user chose this over full section re-import) via `sql/2026-06-27_kjt_khpi_yard_routing_signals.sql` from `kjt_khpi_dn.xlsx`/`kjt_khpi_up.xlsx` (full-division masters; relevant tabs `KJT-KHPI DN LINE`/`KHPI-KJT UP LINE`). Build overrides: **line `DN SE`/`UP SE` → `DN KHPI`/`UP KHPI`** (KJT-KHPI convention; book heading stays "DN SE LINE") so they share the partition with the existing KHPI signals + the route CSVs; **excluded boundary SE signals KJT S-2 (KYN-KJT/DN SE) and KJT S-142 (KYN-KJT/UP SE)** — they stay on the SE main and the route CSVs bridge to them as cross-section LINE_CROSSOVER edges. KJT S-134/S-137 added as UP KHPI copies (boundary-dup pattern like KJT S-132). Both CSVs then resolved 100% (DN 320/320, UP 31/31). Successor graph 320→**396** edges. KJT-KHPI signals: DN KHPI 10→26, UP KHPI 13→25. **4 stale SE-line edges from the old `test_for_platform_parrallel_signals.csv` remain unresolved** (KJT S-62/63/64 [DN SE]→PDI S-16, PDI S-5→KJT S-71 [UP SE]) — superseded by these granular KHPI routes; cleanup pending (KJT S-62 not in any sheet — verify). UP routes were DN-first then UP per user. |
| Phase 2 (2026-06-24) | KYN-KSRA NE loop-line / extra starters added (14 signals) — DN NE 63→70, UP NE 67→74 | Source `data/KJT-KHPI/Loop-Str/LOOP STR.xlsx` (28 rows = 12 existing anchors as position markers + 14 new + 2 duplicate VSD rows). New: UP loops KE S-19 / ATG S-19 / ASO S-24 / KDV S-19 / TLA S-20 / VSD S-36 + VSD S-37 (UDL UP); DN loops KDV S-11 / ASO S-6 / ATG S-11 / KE S-11 / VSD S-4 + VSD S-5 (UDL DN) + TLA S-6 (2nd PF starter, not a loop — user confirmed add). Method: runbook re-import path — merged into spines `dnne_signals.xlsx`/`upne_signals.xlsx` AND master tabs DN/UP NE (source-consistent, §10), re-imported (both sections were `edit_source=import`, no `--force`). Build fixes: sheet had `line='UP TH'/'DN TH'` (scrambled) on 25/28 rows → overridden to `UP NE`/`DN NE` from anchors per §3; VSD S-36/S-37 taken from the sheet's `UP NE` block (rows 20-22), not the duplicate `UP TH` rows 7-8. Each loop/extra starter parallel-grouped with its platform-starter anchor via `sql/2026-06-24_kyn_ksra_loop_starters_parallel_groups.sql` (`parallel_group_id` 1-12, previously unused). seq migration re-run (loops have NULL km → seq sorts them last, but parallel_group covers JPO rule-1 adjacency; book order correct via row_order — loop sits immediately after anchor). KYN_SUB now 12 sections / 1164 rows. Aliases auto-created; 0 orphans. Totals 1297→1311 signals, 1741→1755 active rows. |
| Phase 2 (2026-06-17) | KYN-KSRA NE line imported (`KYN_KSRA_DN_NE` 63 signals / 91 rows, `KYN_KSRA_UP_NE` 67 signals / 100 rows) | Source: user-curated `data/KYN_KSRA/kyn_ksra_master.xlsx` (from the KYN GDS beat book). Curation surfaced and fixed: duplicate distant/IBS signal numbers (made unique, e.g. `OMB IBS DIST`, `ASO S-14`), `signal_type`↔`signal_function` column swap on ~35 DN rows, gates with `signal_function='Gate'`, and several descriptive insert targets. Added `Advance Starter` to the `signal_function` enum (`sql/2026-06-17_add_advance_starter_function.sql`) — BB Division's term. Loop-line starter `VSD S-4` deliberately omitted for now — to be slotted later as a parallel signal (row-order 100-gap + `parallel_group_id` support it). Bound to KYN_SUB (7,8 — matches book index), CSMT_SUB_ML (5,6), CSMT_ML_MMR + KYN_GOODS (7,8) via `sql/2026-06-17_bind_kyn_ksra_ne_to_beats.sql`. Badges verified live: Ⓟ distant, ⒾⒷ IBS, Ⓖ gate. KYN_SUB now 10 sections / 1112 rows. |

---

## 25. JPO Classification (Phase 7)

Reconciliation rules from **AWS JPO No. BB.TRSO.EMU.16, dated 07-03-2007** (Sr. DSTE/Co, Sr. DEE TRS Kurla, Sr. DEE TRS.O BB). Source PDF: `/Users/neeraja/loco-link/AWS JPO.pdf`.

| # | Window | Threshold | Classification | DB value |
|---|--------|-----------|----------------|----------|
| 1 | per trip | >2 events on **consecutive signals** AND ≥3 in trip on same cab | Cab defect | `responsibility = 'CAB_SIDE'` |
| 2 | per day | >2 events on the same signal | Track magnet defect | `responsibility = 'S&T'` |
| 3a | per ISO week | >3 events on same cab (excluding rule 1) | Cab defect | `responsibility = 'CAB_SIDE'` |
| 3b | per ISO week | ≥3 events on same magnet (excluding rule 2) | Track magnet defect | `responsibility = 'S&T'` |
| 4 | — | Anything else | Transient | `responsibility = 'TRANSIENT'` |

**Endpoint:** `POST /api/division/aws/classify-period`  body `{ from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }`.
Idempotent: re-running resets the window to `NOT_DETERMINED` and re-applies rules in priority order. Each event also gets a human-readable `root_cause` string identifying which rule fired.

**UI:** "Classify (JPO)" button in `public/div/aws.html` toolbar, uses the existing `periodFrom`/`periodTo` date pickers.

**Rule 1 status — IMPLEMENTED (2026-06-12).** Live in `POST /classify-period`.

A trip = one `(cab, abn_date)` where cab = `COALESCE(matched_coach_id, matched_rake_id)`. Trip events are sorted by `abn_time` then `seq_order`. The classifier walks adjacent pairs; a run of **≥3 events on consecutive signals** in a trip flags every event in that trip `CAB_SIDE` (root_cause "JPO Rule 1"). Rule 1 runs first, so rules 2/3 only see the remainder (honors JPO "excluding 1 & 2").

Two signals are **consecutive** if any of:
1. `(from_signal_id, to_signal_id)` exists in `div_signal_successors` (either direction), or
2. both share a non-null `parallel_group_id` (alternates count as one position), or
3. same `(section, line, direction)` and `|seq_order_a − seq_order_b| = 1`.

Helpers `signalsAreConsecutive()` and `longestConsecutiveRun()` in `awsUploadRoutes.js`. Verified by unit test: 3 seq-adjacent signals → fires; 3 far-apart → silent; successor-edge pair → consecutive.

| Adjacency input | Source | Status |
|---|---|---|
| `div_signals.seq_order` | per `(section, line, direction)`, travel-direction order | done for all 9 loaded partitions (823 signals) |
| `div_signals.parallel_group_id` | hand-tagged from signal book | optional — successor rows already cover convergence cases, so not required |
| `div_signal_successors` (LINE_CROSSOVER + PLATFORM_ROUTING) | `corridor_changing_signals.csv` + `test_for_platform_parrallel_signals.csv` | 235 rows (93 crossover, 142 platform); ~150 fully resolved, rest auto-resolve as NE/SE/KHPI/Harbour-branch signals load |

**Reach today:** rule 1 fires correctly wherever both the signals and the successor/seq data exist; it stays silent (no false positive) where adjacency is unknown. As more beats and successor rows load, its coverage widens with zero code change.

## 26. Signal Numbering Conventions

BB Division distinguishes station signals from inter-station automatics by prefix. **Not globally unique** — same number can exist in different `(section, line, direction)` partitions because each line numbers from its own km-zero.

| Prefix | Meaning | Example | Typical `station_code` |
|--------|---------|---------|-----------------------|
| `<STN> S-NN` | Station signal | `CSMT S-4`, `KYN S-12` | the station |
| `L-NNN` / `L-NNNN` | Local Line (UP LL / DN LL) automatic | `L-001`, `L-5014` | usually NULL |
| `K-NNN` / `K-NNNN` | Through Line (UP TH / DN TH) automatic | `K-009`, `K-056` | usually NULL |
| `ME-NNNN` | 5th / 6th Line at KYN automatic | `ME-2904` | NULL |

Normalizer strips spaces, hyphens, slashes and dots: `K-044 A` → `K044A`. Matcher returns `MEDIUM` confidence when ≥2 partition-matches exist for the same normalized form — pass `{section, line, direction}` context to `matchSignalFromDb()` to disambiguate when caller knows the trip context.

## 24. AWS Code Reference

| Code | Meaning | Detection Keywords |
|------|---------|-------------------|
| **A** | Emergency brakes at Green signal | `GREEN`, `PROCEED`, `GRN`, `GREEN ASPECT` |
| **B** | AWS acted at Double Yellow | `DOUBLE YELLOW`, `DBL YELLOW`, `D/Y`, `DY`, `DOUBLE YLW` |
| **C** | AWS acted at Yellow | `YELLOW`, `YLW`, `CAUTION` (single, not double) |
| **D** | AWS acted at additional magnet | `ADDITIONAL MAGNET`, `ADD MAGNET`, `ADDL MAGNET`, `ADD.MAGNET` |
| **E** | AWS acted at place without magnet/signal | `WITHOUT MAGNET`, `NO MAGNET`, `W/O MAGNET`, `NO SIG` |
| **AUX** | Calling-on / Shunt / A-marker / Authority scenarios | `AUX`, `CALLING ON`, `CALL ON`, `SHUNT SIGNAL`, `SHUNTING`, `A-MARKER`, `A MARKER`, `A BOARD`, `G BOARD`, `G-BOARD`, `BLANK SIGNAL`, `BLANK SIG`, `AUTHORITY`, `T/A 912`, `TA 912`, `PASSED.*AUTHORITY` |
| **P** | Aspect changed Green → Double Yellow while approaching | `GREEN TO DOUBLE`, `G TO DY`, `GREEN→DY`, `ASPECT CHANGE` + `GREEN` + `DOUBLE` |
| **Q** | Aspect changed Green → Yellow while approaching | `GREEN TO YELLOW`, `G TO Y`, `GREEN→Y`, `ASPECT CHANGE` + `GREEN` + `YELLOW` |
| **R** | Aspect changed Double Yellow → Yellow while approaching | `DOUBLE YELLOW TO YELLOW`, `DY TO Y`, `DY→Y` |

### Detection Priority (Phase 6 Parser)
1. Check for explicit `TYPE A`, `TYPE B`, etc.
2. Check for `A ACT`, `B ACT`, etc.
3. Check for aspect keywords (GREEN, DOUBLE YELLOW, etc.)
4. Check for P/Q/R aspect change patterns
5. If none match → `needs_manual_review = 1`

---

## 23. Database Migrations (Run on Production)

| File | Date | Purpose |
|------|------|---------|
| `sql/2026-06-05_aws_signal_succession.sql` | 2026-06-05 | ALTER `div_signals` (add `seq_order`, `parallel_group_id`, indexes); CREATE `div_signal_successors`; normalize successor line names; populate `seq_order` (travel-direction order); resolve successor FK text→ID links. Idempotent (column/index existence guarded via stored procedure). Re-run any time to re-sequence after new signals load. |
| `sql/2026-06-12_add_missing_signals.sql` | 2026-06-12 | Insert 4 signals absent from beat csvs (TNA S-65, TNA S-28, KYN S-63, K-001) + aliases. Idempotent (ON DUPLICATE KEY UPDATE). Run the succession migration afterwards to sequence them. |
| `sql/2026-06-12_dedupe_signal_successors.sql` | 2026-06-12 | Dedupe `div_signal_successors` + make `route_condition NOT NULL DEFAULT ''`. Fixes NULL-route_condition rows bypassing `uq_succession` (MySQL treats NULL as distinct in unique keys), which duplicated rows on every re-import. Run once before/after re-importing successor CSVs. Idempotent. |

```sql
-- Phase 5: Added 2026-05-07
ALTER TABLE div_aws_cms_raw ADD COLUMN is_aws_candidate TINYINT(1) DEFAULT 0 AFTER raw_json;
```

---

## 23.1 Phase 7 Deployment Checklist (server)

Apply in this exact order on `railway@93.127.198.125`. Each step is independent and can be rolled back without affecting earlier steps.

### Pre-flight on local
- [x] Migration `sql/2026-06-05_aws_signal_succession.sql` applied locally
- [x] `sql/2026-06-12_add_missing_signals.sql` applied (4 signals + aliases)
- [x] `corridor_changing_signals.csv` + `test_for_platform_parrallel_signals.csv` imported (235 successor rows)
- [x] Signal beats imported (823 signals across 9 partitions, all seq_ordered)
- [x] Rule 1 implemented + unit-tested; full classifier run clean (rule1=0, rule2=3, transient=49 on Apr 6–14 sample)

### Files to ship
| Source (local) | Destination (server) | Reason |
|---|---|---|
| `sql/2026-06-05_aws_signal_succession.sql` | `~/bbtro/sql/` | Schema migration (seq_order, parallel_group_id, div_signal_successors, line-name normalize, resolve) |
| `sql/2026-06-12_add_missing_signals.sql` | `~/bbtro/sql/` | 4 signals not in any beat csv (TNA S-65, TNA S-28, KYN S-63, K-001) |
| `sql/2026-06-12_dedupe_signal_successors.sql` | `~/bbtro/sql/` | Dedupe + route_condition NOT NULL DEFAULT '' |
| `scripts/import-signal-successors.js` | `~/bbtro/scripts/` | Successor importer — AUTO type derivation + section-from-resolved-signal |
| `corridor_changing_signals.csv` | `~/bbtro/` | 37 line-crossover rows |
| `test_for_platform_parrallel_signals.csv` | `~/bbtro/` | 203 platform-routing + crossover rows |
| `routes/division/awsUploadRoutes.js` | `~/bbtro/routes/division/` | `POST /classify-period` (rules 1–4) + partition-aware matcher + multi-width padding |
| `public/div/aws.html` | `~/bbtro/public/div/` | "Classify (JPO)" button in toolbar |
| `bbtro_signal_aws_master_plan.md` | `~/bbtro/` | This doc |

**Prerequisite:** the server must already have the signal-book imports (DN/UP TH, DN/UP LOC, 5TH, 6TH, HB beats) from the Phase-2 signal-book sessions and their `sql/2026-06-*_bind_*` files. The AWS migration assumes `div_signals` is populated.

### Run on server
```bash
# 1. Schema migration (idempotent — safe to re-run)
mysql -u <user> -p <db> < ~/bbtro/sql/2026-06-05_aws_signal_succession.sql

# 2. Add the 4 signals absent from beat csvs, then re-sequence
mysql -u <user> -p <db> < ~/bbtro/sql/2026-06-12_add_missing_signals.sql
mysql -u <user> -p <db> < ~/bbtro/sql/2026-06-05_aws_signal_succession.sql   # re-run = re-populate seq_order

# 3. Import successor graph (AUTO derives crossover vs platform per row)
cd ~/bbtro
node scripts/import-signal-successors.js corridor_changing_signals.csv AUTO --commit
node scripts/import-signal-successors.js test_for_platform_parrallel_signals.csv AUTO --commit

# 3b. Dedupe + lock route_condition (only needed if server imported with an
#     older NULL-allowing schema; harmless/idempotent otherwise)
mysql -u <user> -p <db> < ~/bbtro/sql/2026-06-12_dedupe_signal_successors.sql

# 4. Verify
mysql -u <user> -p <db> -e "
  SELECT section, \`line\`, direction, COUNT(*) total, COUNT(seq_order) seq_assigned
  FROM div_signals GROUP BY section, \`line\`, direction;
  SELECT COUNT(*) AS successor_rows, SUM(from_signal_id IS NOT NULL) AS from_resolved,
         SUM(to_signal_id IS NOT NULL) AS to_resolved
  FROM div_signal_successors;
"
```

### Restart + smoke test
```bash
# 5. Restart node server (pm2 / systemctl / however server is managed)
pm2 restart bbtro    # or equivalent

# 6. Smoke test the new endpoint
curl -X POST https://<server>/api/division/aws/classify-period \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session>' \
  -d '{"from":"2026-04-06","to":"2026-04-14"}'

# 7. UI smoke test: load /div/aws.html, click "Classify (JPO)" with a date range.
#    Expect alert with rule counts; rule 1 will be 0 (stub).
```

### Post-deploy follow-up (not blocking)
- Run `POST /api/division/aws/match-signals` once on server — currently 35 SIGNAL-type events have NULL `signal_id` because the matcher hasn't been re-run since UP TH signals + new aliases were loaded.
- Pending data files from user:
  - Platform-routing csv (will import via `node scripts/import-signal-successors.js <file> PLATFORM_ROUTING --commit`)
  - Parallel-group hints (will be applied via UPDATE statements once received)
  - DN LL, UP LL, 5th Line, 6th Line signal data (will resolve the 17 unresolved `to_signal_id` rows in `div_signal_successors`)
- Once all four are in, flip rule 1 in `awsUploadRoutes.js /classify-period` from stub (`rule1Count = 0`) to a real adjacency walker.

### Rollback (if needed)
- Endpoint can be disabled by commenting the `router.post('/classify-period', ...)` block; the rest of the file is unchanged.
- Schema rollback (destructive — only if absolutely necessary):
  ```sql
  ALTER TABLE div_signals DROP COLUMN seq_order, DROP COLUMN parallel_group_id;
  DROP TABLE div_signal_successors;
  ```
- `responsibility` and `root_cause` columns on `div_aws_events` predate this work — leave untouched on rollback.

---

## 23.2 Current Loaded State (2026-06-12)

| Object | Count | Notes |
|---|---|---|
| `div_signals` total | 823 | All have `seq_order` (= running order in travel direction; UP partitions km DESC). |
| `div_signals` CSMT-KYN / DN TH / DN | 115 | Incl. K-001 (added 2026-06-12). |
| `div_signals` CSMT-KYN / UP TH / UP | 120 | Incl. TNA S-65 restored + KYN S-63 (added 2026-06-12). |
| `div_signals` CSMT-KYN / DN LOC / DN | 134 | `km_from_csmt` mostly NULL — seq_order falls back to signal-number order. |
| `div_signals` CSMT-KYN / UP LOC / UP | 128 | Same NULL-km caveat. |
| `div_signals` CLA-KYN / 5TH / DN | 64 | 5th line. |
| `div_signals` CLA-KYN / 5TH / UP | 1 | TNA S-28 turn-back starter (own partition, no clash with DN 5th). |
| `div_signals` CLA-KYN / 6TH / UP | 59 | 6th line. |
| `div_signals` CSMT-PNVL / DN HB + UP HB | 100 + 102 | Harbour line loaded. |
| `div_signal_successors` | 311 | After NE/THB/BSU/Harbour-branch rows added (2026-06-12) + dedupe. ~181 from-resolved; unresolved auto-link as NE/SE/KHPI/THB/BSU/Harbour-branch beat signals load. `route_condition` now `NOT NULL DEFAULT ''` (idempotent re-import verified: 311→311, 0 dups). |
| `div_aws_events` SIGNAL-type matched | 17 / 35 | Remaining 18 on unloaded beats (Harbour-branch, NE/SE beyond KYN, KYN yard S-58/S-78). |
| `div_aws_events` classified | 3 × S&T, 49 × TRANSIENT | rule 1 = 0 (no trip has ≥3 consecutive-signal events in this 52-event sample — correct, not a bug). First JPO hit: **L-005, 3 events on 10-04-2026 → Rule 2 → S&T**. |
| Pending: K-001 / KYN S-63 exact km | — | Optional; ordering already works via successors/cluster position. |
| Successor coverage now includes | — | NE (KDV/ASO/KSRA), Trans-Harbour THB (NEU/TNA/TUH/VSH), Harbour branches (RVJ/BA/MM/GMN/BEPR/PNVL/MNKD/CMBR/CLA/VSH), BSU (URAN/KILLE). Line names confirmed canonical by user. |
| Pending: NE / SE / THB / BSU / Harbour-branch beat signals | — | Loading these resolves the pending successor `to`/`from` IDs and lifts the remaining 18 unmatched AWS events. |

---

## 20. Open Questions

1. Final standard list of section names:
   - Example: `CSMT-PNVL`, `PNVL-CSMT`, `VDLR-GMN`, `BSR-PNVL`, `PNVL-BSR`.

2. Final standard list of line names:
   - Example: `DN HB`, `UP HB`, `DN LL`, `UP LL`, `UP NE`, `DN NE`, etc.
   - Note: `line` is VARCHAR(40), so new line names can be added without schema change.

3. ~~Exact Excel import file format for the first signal load.~~ Resolved: see section 14.1.

4. Whether book rows should store `page_no` permanently or allow PDF generator to paginate dynamically.

5. How siding diagrams should be stored:
   - As image uploads?
   - As separate SVG/diagram table?
   - As static PDF appendix initially?

6. ~~Whether PSR effective dates are always needed or optional.~~ Resolved: optional, DEFAULT NULL.

7. Whether AWS reports should be module inside Node only or later with Python parser service.

---

## 21. Recommended Immediate Next Step

Phase 1 (tables) and Phase 5 (AWS raw import) are complete. Proceed to:

### Next: Phase 6 — AWS Parser and Review

1. Parse AWS candidate rows from ST/EMU abnormality data.
2. Extract AWS code A/B/C/D/E/AUX/P/Q/R from Detail text.
3. Extract location raw text and detect location type (SIGNAL/KM/PLATFORM/UNKNOWN).
4. Match signal using `div_signal_aliases`.
5. Match cab/rake using `rake_coaches.coach_number`.
6. Create records in `div_aws_events`.
7. Build manual review screen for unmatched/low-confidence cases.

### Parallel: Phase 2 — Signal Import Scripts

1. Continue preparing signal and PSR data for remaining beats.

---

## 22. How to Maintain This File

After each work session:

1. Update checklist items from `[ ]` to `[x]`.
2. Add any schema changes to the relevant SQL section.
3. Add new decisions to the Decisions Log.
4. Add unresolved doubts to Open Questions.
5. Keep this as the single carry-forward document for new chats.

