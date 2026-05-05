# Loco Master Migration — `div_cr_locos` → `div_locos`

Plan for promoting the CR-only loco table (`div_cr_locos`, 959 rows) to an all-India master (`div_locos`, 13,792 rows) that serves multiple modules — control office, RTIS analysis, slate analysis, future apps — from one source of truth.

---

## Background

| Current | Target |
|---|---|
| `div_cr_locos` — CR zone only, 959 rows | `div_locos` — all 16 zones, 13,792 rows |
| Managed from `rail-data-app` (loco management UI + 6 write endpoints) | Managed from `bbtro` control office module (new page) |
| Missing WAG12B (250) and WAG7M (46) — stale | Loaded from `locodb.csv` (IR master) |
| 4 core fields only | 10 fields: zone, shed, type, DOC, traction converter, ARNO/SIV, RTIS OEM, HRPT count, microprocessor type |

Both apps already share the same `bbtro` MySQL database — this is a table refactor, not a cross-DB move.

---

## Target Schema

```sql
CREATE TABLE div_locos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loco_number VARCHAR(20) NOT NULL UNIQUE,
  loco_type VARCHAR(20),
  traction_type ENUM('Electric','Diesel','Dual') DEFAULT 'Electric',  -- Phase 1.5
  railway_zone VARCHAR(10),
  home_shed VARCHAR(20),
  status ENUM('Active','Transferred Out','Condemned') DEFAULT 'Active',
  commission_date DATE,
  traction_converter VARCHAR(30),        -- Alstom / Medha / CGL / BHEL / ABB / Siemens / ...
  arno_siv VARCHAR(30),                  -- ARNO / SIV / SIV(SIE) / SIV(AAL) / ...
  rtis_oem VARCHAR(20),                  -- LnT / BEL / NULL
  hrpt_count TINYINT DEFAULT 0,          -- 0 / 1 / 2
  microprocessor_type VARCHAR(30),       -- MEDHA Ver2/Ver3, LAXVEN Ver3, STESALIT Ver2, ...
  hotel_load_oem VARCHAR(30),            -- Siemens / Medha / AAL / BHEL / ABB / HIRECT / ... (NULL on freight)
  data_source ENUM('CSV_UPLOAD','LPC_ENTRY','MANUAL') DEFAULT 'CSV_UPLOAD',  -- Phase 1.5
  entered_by VARCHAR(100),               -- Phase 1.5 — LPC username for LPC-entered diesel locos
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (railway_zone),
  INDEX (loco_type),
  INDEX (home_shed),
  INDEX (traction_type),
  INDEX (data_source)
);
```

> **Note**: this is the *current* table shape after Phase 1 + Phase 1.5. The Phase 1 CREATE table ([sql/2026-04-23_div_locos.sql](sql/2026-04-23_div_locos.sql)) creates the original columns; Phase 1.5 ([sql/2026-05-04_div_locos_traction.sql](sql/2026-05-04_div_locos_traction.sql)) adds the 3 traction columns via ALTER.

**Design notes:**
- **Single `home_shed`** — a loco has exactly one home shed. Transfers rewrite this field (and append a row to `div_loco_transfers` for audit). No separate `current_shed`.
- **HRPT is a count** (0/1/2 antennas), not a boolean.
- **No `microprocessor_type` in earlier sketches** — added after seeing the full CSV which has a 10th column.

---

## CSV → Column Mapping

Source: `/Users/neeraja/Desktop/rtis_files_only/mail-spm-project/locodb.csv` (13,792 rows, all loco numbers unique).

| CSV column | `div_locos` column | Notes |
|---|---|---|
| `Rly` | `railway_zone` | Upper-normalize on load (already clean in CSV — 16 distinct zones) |
| `Base Shed` | `home_shed` | 71 distinct sheds |
| `Loco Number` | `loco_number` | UNIQUE; all 13,792 distinct |
| `Type of Loco` | `loco_type` | 21 distinct; WAG9H dominant (6963) |
| `DOC` | `commission_date` | Already ISO `YYYY-MM-DD` — direct insert |
| `Traction Converter` | `traction_converter` | 3704 blanks; 2 junk rows (`HIRECT`, `MVE`) kept as-is per decision |
| `ARNO/ SIV` | `arno_siv` | 9840 blanks |
| `RTIS` | `rtis_oem` | `LnT` 7519 / `BEL` 2666 / blank 3607 |
| `HRPT Nos` | `hrpt_count` | blank→0, `1`→1, `2`→2 |
| `Microprocessor/Relay` | `microprocessor_type` | 11,637 blanks (sparse) |
| `Hotel Load` | `hotel_load_oem` | OEM of hotel-load converter; 11,413 blanks (most freight); needs source case-normalization (Medha/MEDHA, BHEL/Bhel, HIRECT/Hirect dups) |

---

## Zone Distribution

```
SER  1571   SCR  1413   CR   1252   NR   1195   WCR  1182
ECR  1054   WR   1002   SECR  805   ECOR  797   ER    747
SR    747   NCR   668   NER   517   SWR   344   NFR   317
NWR   181
```

CR zone grows from 959 → 1252 after migration. Gap is explained by 250 WAG12B + 46 WAG7M not present in current `div_cr_locos`.

---

## Execution Phases

### ✅ Phase 1 — Build & load `div_locos` (DONE 2026-04-23)
- Create `div_locos` table
- Load all 13,792 rows from `locodb.csv`
- `div_cr_locos` remains the table rail-data-app reads from — untouched, app keeps working

### ✅ Phase 1.5 — Traction columns for incremental diesel master (DONE 2026-05-04)
- ALTER `div_locos`: add `traction_type`, `data_source`, `entered_by`
- All 13,792 existing rows = `('Electric','CSV_UPLOAD',NULL)`
- Diesel locos appended one-by-one via the loco-link daily-entry flow (see [LOCO_LINK_FEATURE.md](LOCO_LINK_FEATURE.md))

### ⏳ Phase 2 — Replace `div_cr_locos` with a view (deferred, "will do it sooner")
```sql
CREATE OR REPLACE VIEW div_cr_locos AS
  SELECT id, loco_number, loco_type,
         home_shed AS current_shed,      -- alias for backward compat
         status, commission_date, remarks, created_at, updated_at
  FROM div_locos WHERE railway_zone = 'CR';
```
- Backup first: `CREATE TABLE div_cr_locos_backup AS SELECT * FROM div_cr_locos`
- `DROP TABLE div_cr_locos` → `CREATE VIEW div_cr_locos`
- Rename `div_cr_loco_transfers` → `div_loco_transfers` (empty, safe)
- Rename `div_cr_sheds` → `div_sheds` (already has `zone` column)

### ⏳ Phase 3 — Remove loco management from rail-data-app
Files to delete:
- `rail-data-app/ui/loco-management.html` (942 lines)

Endpoints to remove (`rail-data-app/app.py`):
| Line | Endpoint |
|---|---|
| 7267 | `GET /api/locos` |
| 7340 | `POST /api/locos` |
| 7387 | `PUT /api/locos/{n}` |
| 7444 | `POST /api/locos/{n}/transfer` |
| 7506 | `PUT /api/locos/{n}/status` |
| 7548 | `GET /api/locos/{n}/history` |
| 7590 | `GET /api/locos/search/{q}` |

**Must stay:** the RTIS SIM-Down join at `app.py:6731` — reads `div_cr_locos`, will keep working against the view.

### ⏳ Phase 4 — New loco management page in bbtro control office module
Built against `div_locos` directly (no view indirection). UI responsibilities of the old rail-data-app page move here: list/filter (with zone filter now), add, edit, transfer (rewrites `home_shed`, appends to `div_loco_transfers`), status change (Active / Transferred Out / Condemned), history.

---

## Consumers & Impact

| Consumer | Impact |
|---|---|
| `rail-data-app` RTIS SIM-Down analysis ([app.py:6731](/Users/neeraja/Desktop/rail-data-app/app.py)) | None — view keeps the same schema it reads. Row count for CR grows 959→1252, so more locos may now match. |
| `rail-data-app` loco management page | **Removed** in Phase 3 — replaced by bbtro control office page |
| `bbtro` control office module (planned) | **New** — primary owner of `div_locos` writes |
| Future: RTIS hardware tracking, slate analysis, other modules | Read `div_locos` directly, filter by `railway_zone` as needed |

---

## Data Quality Notes

- **Loco numbers**: 100% unique across 13,792 rows ✓
- **DOC format**: 100% ISO `YYYY-MM-DD` ✓
- **Zone case**: already normalized in CSV (user fixed `ECoR`/`ECOR` variants)
- **Traction converter junk**: `HIRECT` (1 row), `MVE` (1 row) — loaded as-is per decision
- **Trailing-space bug** in current `div_cr_locos` (one row `"WAG9H "`) — disappears on reload
- **Blanks**: traction_converter 3704, arno_siv 9840, rtis_oem 3607, hrpt_count blank→0 (9047), microprocessor_type 11,637

---

*Last updated: 2026-04-23 — Phase 1 in progress.*
