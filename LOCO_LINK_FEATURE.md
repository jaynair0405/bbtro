# Loco Link Feature — Control Office Module

Daily loco-link tracking for BB Division: planning master + per-day LPC entry log + analytics (mis-link rate, train-loco history, loco-train history). Builds on `div_locos` (the all-India electric loco master) and the diesel-incremental flow (`traction_type` + `data_source` columns on `div_locos`).

---

## Status

| Phase | Status |
|---|---|
| Schema for `div_locos` traction (Electric/Diesel/Dual + data_source/entered_by) | ✅ DONE 2026-05-04 |
| `div_loco_link_master` + `div_loco_link_log` DDL | ✅ DONE 2026-05-04 |
| Master loaded from CO_Loco_link_final.xlsx (414 rows) | ✅ DONE 2026-05-04 |
| Push-pull columns on log + master (Option A — 4 cols) | ✅ DONE 2026-05-04 |
| Sick-loco workflow table `div_loco_sick_records` | ✅ DONE 2026-05-04 |
| `lpc` role on users + post-login redirect | ✅ DONE 2026-05-04 |
| Test LPC users (`bblpc1`, `bblpc2`, password `lpcpass123`) | ✅ DONE 2026-05-04 |
| Control Office portal page + Loco Lookup widget | ✅ DONE 2026-05-04 |
| **Daily entry sheet view (Terminal tab)** | ⏳ NEXT |
| Daily entry sheet view (Bypass tab) | ⏳ TODO |
| Mark sick / Mark fit endpoints + UI | ⏳ TODO |
| Mis-link reports page | ⏳ TODO |
| Loco management (transfer workflow) | ⏳ TODO |
| Available-loco picker for DN trains | ⏳ post-MVP |

---

## Source data

`/Users/neeraja/loco-link/CO_Loco_link_final.xlsx` — 7 sheets:

| Sheet | Layout | Rows imported |
|---|---|---|
| CSMT-DN | canonical | 51 |
| CSMT-UP | canonical | 51 |
| VVH-UP | canonical | 73 |
| VVH-DN | canonical | 73 |
| KR-UP | canonical | 17 |
| KR-DN | canonical | 17 |
| BYPASS | side-by-side, unpivoted by importer | 132 (66 entries × 2 directions) |
| **Total** | | **414** |

**Canonical sheet columns:**
`SR_NO | SECTION | DIRECTION | FROM_STATION | SHED_CODE | LINK_ATTR | RAKE_TYPE | TRAIN_NO | TIME | RUN_DAYS | REMARK`

**BYPASS layout:** kept human-readable (UP and DN side by side, multiple route blocks). Importer detects each `<route>` ↔ `<reverse-route>` block, reads station labels from row below, emits two master rows per data row, with intermediate stations stored as JSON in `via_stations`.

---

## Tables

### `div_loco_link_master` — planning template

| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| sheet_source | VARCHAR(30) | CSMT-DN / BYPASS-LNL-BSR / etc. — for audit |
| sr_no | VARCHAR(10) | from xlsx |
| section | VARCHAR(20) | NE / SE / KR / BYPASS |
| direction | ENUM('UP','DN','BYPASS') | |
| is_bypass | TINYINT(1) | |
| from_station | VARCHAR(10) | terminal or bypass entry |
| to_station | VARCHAR(10) | bypass exit only |
| route_label | VARCHAR(30) | bypass: "LNL-BSR" |
| shed_code | VARCHAR(10) | canonical — matches `div_locos.home_shed` |
| link_attr | VARCHAR(30) | HOG / P/4 / DSL / 130 kmph |
| expected_hog | TINYINT(1) | derived: link_attr matches /HOG/i |
| traction_type | ENUM | Electric/Diesel/Other/Unknown — derived from link_attr |
| rake_type | VARCHAR(20) | LHB/ICF/GS+VPH/LVPH |
| train_no | VARCHAR(20) | text — preserves leading zeros |
| train_name | VARCHAR(120) | bypass only currently |
| event_time | VARCHAR(30) | raw hh:mm[:ss] string |
| via_stations | JSON | bypass intermediate timings |
| run_days | VARCHAR(30) | DAILY / 1,3,5 |
| remark | VARCHAR(255) | |
| active | TINYINT(1) | soft-delete flag |
| created_at, updated_at | TIMESTAMP | |

**Constraints:** `UNIQUE(train_no, direction, from_station)`, indexes on shed_code / direction-section-bypass / active-direction.

### `div_loco_link_log` — daily LPC entries

| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| working_date | DATE | |
| direction | ENUM | |
| train_no | VARCHAR(20) | |
| master_id | INT | soft-FK → div_loco_link_master.id |
| actual_loco_no | VARCHAR(20) | LPC types this; soft-FK → div_locos.loco_number |
| base_shed | VARCHAR(10) | snapshot of div_locos.home_shed at entry time |
| loco_type | VARCHAR(20) | snapshot |
| traction_type | ENUM('Electric','Diesel','Dual') | snapshot |
| hog | TINYINT(1) | LPC-filled — was loco run with HOG ON |
| incoming_train | VARCHAR(20) | DN sheets |
| outgoing_train | VARCHAR(20) | UP sheets |
| expected_shed | VARCHAR(10) | snapshot from master |
| is_mislink | TINYINT(1) | computed: expected_shed ≠ base_shed (both non-null) |
| remark | VARCHAR(255) | |
| entered_by | VARCHAR(100) | LPC username |
| created_at, updated_at | TIMESTAMP | |

**Constraints:** `UNIQUE(working_date, train_no, direction)`, indexes for the four key analytics queries below.

---

## LPC daily entry flow

1. LPC opens "today's links" page → backend reads master rows where `RUN_DAYS` matches today's day-of-week
2. LPC types `actual_loco_no = "30263"` for train 22177
3. Backend: `SELECT loco_type, traction_type, home_shed FROM div_locos WHERE loco_number = ?`
4. **Loco found?**
   - **Yes** — auto-fill `base_shed`, `loco_type`, `traction_type`. Compare `home_shed` to master's `shed_code` → set `is_mislink`. Warn if master `expected_hog=1` and loco `hotel_load_oem IS NULL`.
   - **No, master expects Electric** — reject ("loco not in master, check the number") *(typo guard — electric master is complete)*
   - **No, master expects Diesel** — prompt LPC to add: capture `home_shed`, `loco_type`. INSERT into `div_locos` with `traction_type='Diesel'`, `data_source='LPC_ENTRY'`, `entered_by=<lpc_username>`. Then proceed with link entry.
   - **No, master expects Other/Unknown** — soft prompt: "Add as Electric or Diesel?"
5. INSERT row into `div_loco_link_log` with snapshots + computed `is_mislink`

---

## Analytics queries

| Query | SQL | Index |
|---|---|---|
| Loco X — past trains worked | `WHERE actual_loco_no=? ORDER BY working_date DESC` | `idx_loco_date` |
| Train Y — past locos used | `WHERE train_no=? ORDER BY working_date DESC` | `idx_train_date` |
| Mis-links last 30 days | `WHERE is_mislink=1 AND working_date >= ?` | `idx_mislink_date` |
| Mis-link rate by shed | `GROUP BY base_shed, SUM(is_mislink)` | `idx_base_shed_date` |

---

## Files

| File | Purpose |
|---|---|
| [sql/2026-05-04_div_locos_traction.sql](sql/2026-05-04_div_locos_traction.sql) | ALTER `div_locos` — add traction_type, data_source, entered_by |
| [sql/2026-05-04_div_loco_link.sql](sql/2026-05-04_div_loco_link.sql) | CREATE both loco-link tables |
| [sql/2026-05-04_loco_link_extras.sql](sql/2026-05-04_loco_link_extras.sql) | Push-pull columns + sick-records table |
| [sql/2026-05-04_lpc_role.sql](sql/2026-05-04_lpc_role.sql) | Add `lpc` to users.div_role enum |
| [scripts/load_loco_link_master.js](scripts/load_loco_link_master.js) | xlsx → master importer (idempotent UPSERT, sets is_push_pull) |
| [routes/division/locoLinkRoutes.js](routes/division/locoLinkRoutes.js) | Backend endpoints (mounted at `/api/division/loco-link`) |
| [public/control-office/index.html](public/control-office/index.html) | LPC portal landing page with Loco Lookup widget |

---

## Re-running the import

The importer is idempotent — keyed on `UNIQUE(train_no, direction, from_station)`. Re-run any time the xlsx changes:

```bash
node scripts/load_loco_link_master.js                          # default path
node scripts/load_loco_link_master.js /path/to/updated.xlsx    # explicit
```

Existing rows get updated, new rows inserted. **Note:** rows removed from the xlsx are NOT auto-deactivated (would require staging-table comparison). Manual SQL or a separate purge step for retired trains.

---

## Open items / next steps

1. **UI**: control-office page in bbtro for daily entry (auto-populate from `div_locos`, mis-link warnings, HOG warning, history modals)
2. **Endpoints**: bbtro routes for `POST /api/loco-link/log` (insert), `GET /api/loco-link/today` (today's master rows), `GET /api/loco-link/loco/:loco_no/history`, `GET /api/loco-link/train/:train_no/history`, `GET /api/loco-link/mislinks`
3. **`div_trains` master** (deferred from earlier discussion) — when ready, link `div_loco_link_master.train_no` via FK
4. **Diesel master enrichment** — when an official diesel-loco CSV becomes available, the existing loader's `ON DUPLICATE KEY UPDATE` will enrich LPC-entered rows with full hardware data; `data_source` flips from `LPC_ENTRY` to `CSV_UPLOAD`
5. **Master-row deactivation** — staging-table comparison so re-imports can mark removed trains `active=0`

---

## Endpoints implemented (Slice 1)

| Endpoint | Purpose |
|---|---|
| `GET /api/division/loco-link/me` | Current LPC session info (header, audit) |
| `GET /api/division/loco-link/loco/:loco_number/details` | Full loco master + currently-sick status + last 5 trains worked |

## Login flow (Slice 0)

```
LPC → enters bblpc1 / lpcpass123 / division realm
    → authRoutes.js sees div_role='lpc' → redirect '/control-office/'
    → server.js requireControlOffice middleware allows lpc OR division_admin
    → renders public/control-office/index.html
```

division_admin users can also reach `/control-office/` (e.g. via a sidebar link from the existing `/div/` dashboard — to be added).

---

*Last updated: 2026-05-04 — Slice 0 + 0.5 + 1 done. LPC portal accessible; loco lookup widget functional. Next: daily-entry sheet view.*
