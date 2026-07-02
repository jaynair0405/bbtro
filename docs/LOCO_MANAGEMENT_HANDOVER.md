# Loco Management Page — Handover / Build Brief

> **Purpose:** a pick-up-anywhere brief for building the pending **Loco Management page**
> (Phase 4 of `LOCO_MASTER_MIGRATION.md`) in the BBTRO Control Office portal, so a fresh
> chat can start with full context. Created 2026-06-22.

---

## 0. TL;DR — what this is

The Control Office dashboard has a **disabled "Loco Management — soon"** card
(`public/control-office/index.html` ~line 535). The page behind it does **not exist yet**.

It is the **loco-master admin UI** over the `div_locos` table (13,792 locos): list / filter /
search / add / edit / **transfer** (shed & zone, with audit) / **status change**
(Active → Transferred-Out / Condemned) / **history**. It is meant to replace the loco-management
feature currently living in a separate app (`rail-data-app`).

**Do NOT confuse it with the already-built operational pages** (see §2). Those track *where
locos are* and *which are sick/defective*. This page manages the *master roster* itself.

**Access:** mutations require `realm='division'` AND `div_role IN ('division_admin','ctlc')`
(read can be wider). Same gate as other Settings/admin endpoints.

---

## 1. Scope — build vs. don't-touch

### Build (Phase 4)
- **List/grid** of `div_locos` with filters: `railway_zone`, `loco_type`, `traction_type`,
  `status`, `home_shed`; search by `loco_number` (exact + partial).
- **Add loco** — especially **diesel** locos (the master is currently 100% electric; LPC adds
  diesels incrementally). Set `data_source='LPC_ENTRY'` + `entered_by`.
- **Edit** fields: `home_shed`, `railway_zone`, `loco_type`, `traction_type`, `hotel_load_oem`.
- **Transfer workflow** — change `home_shed`/`railway_zone` AND append an audit row to a new
  `div_loco_transfers` table (does **not** exist yet — must be created; see §3).
- **Status change** — `Active` → `Transferred Out` / `Condemned` (with reason + audit).
- **History/audit** per loco — show its transfers and status changes.

### Don't touch (already built & in production — see §2)
`loco-availability.html`, `sick-locos.html`, `sick-report.html`, `defect-reports.html` and
their endpoints. They're operational tracking, separate concern.

---

## 2. What already exists (operational loco pages — DONE, leave alone)

| Page | Concern | Key tables |
|---|---|---|
| `loco-availability.html` | Where locos are now (terminal positions, add/move) | `div_loco_positions`, `div_loco_position_history` |
| `sick-locos.html` | Live sick-loco sheet (mark sick/fit, inline edit) | `div_loco_sick_records` |
| `sick-report.html` | Historical sick report (filter, Excel/PDF) | `div_loco_sick_records` |
| `defect-reports.html` | Defect tracking (category/severity/status) | `div_loco_defects` |

All backed by `routes/division/locoLinkRoutes.js` (mounted at `/api/division/loco-link`).
These read `div_locos` for type/shed lookups but do **not** manage the master.

---

## 3. Data model

### `div_locos` — the master (the thing this page manages)
Source: `sql/2026-04-23_div_locos.sql` (+ `sql/2026-05-04_loco_link_extras.sql` added
`traction_type`, `data_source`, `entered_by`). **13,792 rows, all Electric/Active today.**

Key columns:
- `id` (PK), `loco_number` (UNIQUE)
- `loco_type` (WAP4/WAP5/WAP7/WAG9H/WAG12B/…)
- `traction_type` ENUM(`Electric`,`Diesel`,`Dual`)
- `railway_zone` (CR, SR, WCR, NR, … 16 zones)
- `home_shed` (~71 sheds)
- `status` ENUM(`Active`,`Transferred Out`,`Condemned`)
- `commission_date`, `hotel_load_oem` (NULL for freight; OEM for HOG: Siemens/Medha/BHEL…)
- `data_source` ENUM(`CSV_UPLOAD`,`LPC_ENTRY`,`MANUAL`), `entered_by`
- Indexes on loco_number(UNIQUE), railway_zone, home_shed, traction_type, status, data_source

### `div_loco_transfers` — **MUST BE CREATED** (audit trail for transfers/status changes)
Does not exist yet. Suggested shape (confirm with user, then put DDL in a dated `sql/` file):
```
id PK, loco_number, from_shed, to_shed, from_zone, to_zone,
change_type ENUM('TRANSFER','STATUS','EDIT'),
old_status, new_status, reason VARCHAR(255),
changed_by VARCHAR(100), changed_at DATETIME
```
Per `LOCO_LINK_ARCHITECTURE_REVIEW.md`: add proper **FKs** when building this.

### Don't confuse with these (operational, already built)
`div_loco_positions`, `div_loco_position_history`, `div_loco_sick_records`,
`div_loco_defects` — see §2.

---

## 4. Backend — existing endpoints & what's new

In `routes/division/locoLinkRoutes.js` (mounted `/api/division/loco-link`). Existing loco-master-ish:
- `GET /loco/:loco_number/details` — full master details + sick status + recent trains
- `GET /loco/:loco_number/autofill` — light lookup (type/shed/sick) for daily-entry
- `GET /sheds`, `PUT /sheds/:shed_code` — shed list + edit (admin)

**New endpoints to add for this page** (names indicative — match existing style):
- `GET /locos` — paginated/filterable list (zone, type, traction, status, shed, search)
- `POST /locos` — add a loco (LPC_ENTRY; diesel)
- `PUT /locos/:loco_number` — edit fields
- `POST /locos/:loco_number/transfer` — change shed/zone + write `div_loco_transfers`
- `POST /locos/:loco_number/status` — status change + audit
- `GET /locos/:loco_number/history` — transfers + status changes

Gate mutations with the existing `division_admin`/`ctlc` check (locoLinkRoutes.js ~lines 72–87).

---

## 5. Reference UI to port

A working 942-line version exists in the **separate** app (not in this repo):
`~/Desktop/rail-data-app/ui/loco-management.html` — manages CR-zone locos. Read it for the
UX/layout, but **re-implement against bbtro's `div_locos` + new endpoints** (don't copy
endpoints; rail-data-app's loco endpoints are slated for removal in Phase 3).

Match the bbtro Control Office look (see existing `loco-availability.html` / `sick-locos.html`
for the house style — these are NOT the night-platform WTT theme; they use the standard
control-office styling).

---

## 6. Dashboard wiring

Enable the card in `public/control-office/index.html` (~lines 532–538): remove `disabled`
and the `soon` badge, point `href` to the new page (e.g. `/control-office/loco-management.html`),
and add the page's route in `server.js` if pages are served via explicit routes (check how
`loco-availability.html` is served).

---

## 7. Planning docs to read first

- **`LOCO_MASTER_MIGRATION.md`** — the master plan. Phases 1 & 1.5 DONE (table + diesel columns);
  **Phase 4 = this page.** Phases 2–3 (replace `div_cr_locos` with a view, remove rail-data-app
  loco endpoints) are related migration steps — confirm with user whether they're in scope now.
- **`LOCO_LINK_FEATURE.md`** — Slice 6 = "Loco management (transfer workflow, edit shed/zone)".
- **`LOCO_LINK_ARCHITECTURE_REVIEW.md`** (2026-06-02) — known issues; says use proper FKs and
  beware renumber/orphan pitfalls when adding loco-master tables.

---

## 8. Project conventions (same as all BBTRO work)

- **Stack:** Node/Express + MySQL + vanilla-JS static HTML. Local DB `bbtro` / `jay` / `4310jay`.
- **Prod:** `railway@93.127.198.125`, app `~/bbtro`, prod DB creds in `~/bbtro/.env`. Deploy =
  user `git pull` + **Node restart** (backend routes don't take effect without a restart).
- **Commits:** only when the user confirms; **only the files for this task** — never the user's
  unrelated `sql/*.sql`, `server.js` signal work, `awsUploadRoutes.js`, etc. `git commit <path>`
  commits the whole working-tree file (not just staged hunks) — to split a file, stage hunks with
  `git apply --cached` then `git commit` with no pathspec.
- **Schema/DDL** must land in a dated `sql/*.sql` file (memory `feedback_schema_documentation`).
- **Testing locally:** `PORT=3099 node server.js` from repo dir; login is `POST /api/login`
  (allowlisted; NOT `/api/auth/login`); no plaintext division password locally → create a
  throwaway `division_admin` user with a bcrypt hash, test, delete.

---

## 9. Open questions to settle with the user before building

1. **Scope:** just the Loco Management *page* (Phase 4), or also Phases 2–3 (the `div_cr_locos`
   view + retiring rail-data-app's loco endpoints)?
2. **`div_loco_transfers`** shape — confirm columns and whether to log plain edits too.
3. **Diesel entry** — what minimum fields must LPC provide when adding a diesel loco?
4. **Who edits** — division_admin only, or ctlc too? Read access — all logged-in, or restricted?
5. **Bulk import** of diesel locos (CSV), or one-at-a-time only?
6. Should **transfer** also clear/adjust the loco's current position/sick records, or is the
   master purely the roster (positions handled separately)?
