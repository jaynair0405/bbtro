# CRTMS Trip Shed Module — VVH Handover

**17 October 2026 update:** the module is committed on `feature/trip-shed` (worktree `/Users/neeraja/bbtro-trip-shed`); prod has no Trip Shed tables or code yet. Template ids quoted in sections 11–12 (1, 346, 347, 348) are from the pre-rebuild local database and are **environment-specific** — see section 13 for the current ids and for the records that were not carried over.

**16 September 2026 update:** Step 1 inspection safeguards are implemented and tested; see section 11. The original recovery notes below remain useful context. Exact checklist restoration, migration reconciliation and the other listed feature gaps remain outstanding.

**Repository:** `/Users/neeraja/bbtro`  
**Local application URL:** `http://localhost:3000/div/trip-shed.html`  
**First shed:** VVH — Electric Loco Trip Shed, Vidyavihar  
**Current state:** Dashboard and new-inspection page are loading again after the missing module files were recreated. The current implementation is a usable recovery baseline, **not** the complete originally planned v1. Treat the gaps below as deliberate next work; do not claim them complete without browser testing.

## 1. Current working procedure

From a Mac Terminal:

```bash
cd /Users/neeraja/bbtro
node server.js
```

Keep this terminal open, log in as a Division user (for example, `division_admin`), then open:

```text
http://localhost:3000/div/trip-shed.html
```

Never open the pages by double-clicking them or through a `file:///...` URL. Those local files cannot call `/api/division/trip-shed/*` and will show a misleading error.

### Important server-routing lesson

The Trip Shed route is intentionally mounted at [server.js](/Users/neeraja/bbtro/server.js:804) **before** the generic `/api/division` routers:

```js
app.use('/api/division/trip-shed', requireRealm('division'), require('./routes/division/tripShedRoutes'));
```

It must stay ahead of the generic Division route mounts. A previous arrangement caused `GET /api/division/trip-shed/config` to return `{"message":"Route not found"}`. If the browser shows an old route after code changes, identify the listener using:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Then stop **only that confirmed Node PID**, restart from this repository, and hard refresh with `Cmd + Shift + R`.

## 2. Files created/recreated for this module

| File | Purpose |
|---|---|
| [routes/division/tripShedRoutes.js](/Users/neeraja/bbtro/routes/division/tripShedRoutes.js) | Trip Shed API, role checks, inspection/defect/overdue CRUD currently implemented. |
| [public/div/trip-shed.html](/Users/neeraja/bbtro/public/div/trip-shed.html) | Dashboard plus inspection, defect, and TI-overdue registers. |
| [public/div/trip-shed-inspection.html](/Users/neeraja/bbtro/public/div/trip-shed-inspection.html) | New/edit inspection page and loco lookup. |
| [public/div/css/trip-shed.css](/Users/neeraja/bbtro/public/div/css/trip-shed.css) | Responsive Trip Shed visual style. |
| [sql/2026-08-31_trip_shed_vvh.sql](/Users/neeraja/bbtro/sql/2026-08-31_trip_shed_vvh.sql) | Trip Shed schema/migration and VVH/template seed rows. |
| [server.js](/Users/neeraja/bbtro/server.js:804) | API mount described above. |

The new Trip Shed files are currently untracked. `server.js` is modified and the repository contains extensive unrelated user work. **Do not reset, clean, or stage unrelated files.**

## 3. Database design

The Trip Shed migration was reported as applied during the original work. The running page also confirms the database can currently return its Trip Shed configuration/templates. Before a future production migration or schema edit, verify the live schema with read-only `SHOW TABLES` / `SHOW CREATE TABLE`; do not assume the SQL file and live database remain identical.

### New Trip Shed tables (10)

| Table | Purpose |
|---|---|
| `div_trip_sheds` | Shed master. VVH is seeded first; all operational rows are shed-scoped. |
| `div_trip_inspection_templates` | GC, conventional TI, 3-phase TI, and future IA/IB/IC template/version headers. |
| `div_trip_inspection_template_items` | Ordered official checklist items, section, English/Hindi labels, standard value, and required flag. |
| `div_trip_inspections` | Inspection header: date/shift/loco/train/staff/draft-or-final lifecycle/audit fields. |
| `div_trip_inspection_responses` | One answer/reading per inspection checklist item. |
| `div_trip_defects` | Defect and attention register. |
| `div_trip_defect_events` | Intended lifecycle/audit history for defect updates. |
| `div_trip_overdue_entries` | Factual TI-overdue register; no calculated due rule. |
| `div_trip_import_batches` | Legacy spreadsheet upload/review batch header. |
| `div_trip_import_staging_rows` | Per-source-row raw/normalised/import-review traceability. |

### Existing-table change

The original migration extends only `users.div_role` with:

- `trip_shed_operator`
- `trip_shed_supervisor`

No Control Office assignment/log table is changed by Trip Shed. The current checked-in migration uses `ALTER TABLE ... MODIFY div_role ENUM(...)`; **inspect the current live enum before running it on another environment**, because an ENUM rewrite must retain all roles already in use.

### Existing tables read only

| Existing table | Read purpose | Write-back? |
|---|---|---|
| `div_locos` | Exact loco lookup/autofill: type and home shed. | Never. |
| `div_loco_link_log` | Same-date suggested Control Office queue and incoming-train context. | Never. |
| `users` / staff master | Session/role today; staff autocomplete was planned but is not yet restored in current code. | Never through Trip Shed. |

Do not query `div_loco_link_log.section_code` or `.shift_code`; they do not exist in this installation. Valid fields used here include `working_date`, `train_no`, `actual_loco_no`, `base_shed`, `direction`, `incoming_train`, and `outgoing_train`.

## 4. Roles and access model

The route currently permits these Division roles:

| Role | Intended access |
|---|---|
| `trip_shed_operator` | Create/update drafts and registers; not finalise. |
| `trip_shed_supervisor` | Operator work plus finalisation. |
| `division_admin` | Full VVH access, including finalisation. This is the account used for local testing. |
| `lpc`, `ctlc`, `ctlc_view`, `ssehq` | Read-only Trip Shed visibility. |

`trip_shed_operator` and `trip_shed_supervisor` are also treated as read-only by Control Office's loco-link module, preventing any Trip Shed user from altering Control Office records.

## 5. Source documents received

All currently supplied VVH material is under:

`/Users/neeraja/Desktop/trip_shed_data/`

| File | Decision / intended use |
|---|---|
| `Final GC FORM_17.08.25.docx` | **Accepted unchanged** as GC source form. |
| `Final Conv TI _17.08.25.doc` | **Accepted unchanged** as conventional TI source form. |
| `Final 3-Phase TI_17.08.25.docx` | **Accepted unchanged** as 3-phase TI source form. |
| `Loco under repair & attention.xlsx` | Long-standing operational format; retain its terminology and columns unchanged. |
| `TI OVERDUE .xlsx` | Authoritative factual overdue register. Columns: `SR.NO`, `DATE`, `LOCO NO`, `BASE`, `IN/TR NO`, `KM`, `LAST TI DATE`, `TI/GC`, `O/TRI NO`, `LAST SHED`, `REMARK`. Do not invent an automatic due-date formula. |
| `MCDO 2025-26.xlsx` | Pending reviewed legacy-import design/test. |
| `VVH STAFF COMPLETE DETAILS.xlsx` | Pending staff-master reconciliation/autocomplete review. |
| `Supervisors Position.xlsx` | Pending supervisor-role/staff selection review. |
| `Wheel profile.xlsx`, `Temperature Format.xlsx` | Deferred extension points; do not enable in v1. |
| `Material requirement for trip shed (1).xlsx`, `Material Consumption.xlsx`, `Material Consumption (1).xlsx` | Deferred materials scope. |
| `LTT Trains.xlsx`, `Electric roster 2026.docx` | Context/reference only so far. |
| `Warning.docx`, `Award.docx`, `Joint Note.docx` | Context/reference only so far. |

The user said Hindi labels/fonts are desirable. Use actual Unicode Devanagari in the checklist values and use browser/print font fallbacks (for example `Noto Sans Devanagari`, `Nirmala UI`, `Arial Unicode MS`, sans-serif). Do not rely on a legacy font encoding that another machine may not have.

## 6. What has been completed and manually observed

| Area | State | Evidence / caveat |
|---|---|---|
| Module page recovery | Done | Dashboard now opens at localhost after stale-process and route-order corrections. |
| VVH dashboard shell | Done | Metrics, recent-inspection list, and read-only Control Office queue are present. |
| Loco lookup | Done in current route | Exact loco lookup from `div_locos`; one matching incoming train may populate the inspection field. |
| GC / conventional TI / 3-phase TI source approval | Done | User accepted all three formats unchanged. |
| Draft inspection / reload / finalise | Manually confirmed in the original implementation | Re-test against the current recreated route before considering it regression-tested. |
| Print / Save PDF | Manually confirmed in the original implementation | **Not yet restored in the current recreated route.** |
| Defect create and lifecycle | Manually confirmed in original implementation | Current recovery route can create/list defects only; lifecycle update/close must be restored. |
| TI-overdue visual register | Done | Current page lists factual fields and can add a record. |
| TI-overdue edit | Previously designed, not restored | Current recovery route has POST only; implement PATCH and an Edit control. |

## 7. Current API surface in the recreated route

| Endpoint | Current state |
|---|---|
| `GET /config` | Configured VVH shed, templates, role flags. |
| `GET /dashboard?date=YYYY-MM-DD` | Counts and recent inspections. |
| `GET /queue?date=YYYY-MM-DD` | Read-only Control Office suggestions. |
| `GET /locos/:number?date=YYYY-MM-DD` | Exact loco plus possible incoming train(s). |
| `GET /template/:id` | Template items. |
| `GET /inspections`, `GET /inspections/:id`, `POST /inspections` | Inspection list/load/save draft. |
| `POST /inspections/:id/finalize` | Supervisor/admin finalisation. |
| `GET /defects`, `POST /defects` | Defect list/create. |
| `GET /overdue`, `POST /overdue` | TI-overdue list/add. |

## 8. Priority queue — hand this to the next agent

| Priority | Work | Required result |
|---|---|---|
| P0 | Verify current live database shape and template item counts | Read-only SQL first. Confirm all ten tables, VVH shed row, six template headers, and nonzero correct checklist-item counts. |
| P0 | Restore/validate exact GC, conventional TI, and 3-phase TI checklist seed data | Use the three approved documents. Preserve wording/order; add Hindi labels in Unicode. Do not replace historical response rows. |
| P0 | Browser regression test current recovery build | Authenticated: dashboard, each template, exact loco/base lookup, one incoming-train suggestion, draft/save/reload/finalise, and role boundaries. |
| P1 | Restore printable finalised form / PDF | Printable A4 output must mirror official forms; final only, not a draft. |
| P1 | Restore defect lifecycle | Add `Open → Under Attention → Closed`, event history, close validation/action taken, status filter, and hide mutation controls for closed records. Add a clear record-defect action from a failed/ATTENTION checklist item. |
| P1 | Complete TI-overdue CRUD | Add edit endpoint/UI and validate reload. Retain exact approved columns and factual semantics. |
| P1 | Restore reviewed legacy import | MCDO, TI-overdue, repair/attention: spreadsheet staging, continuation-row context, invalid date/duplicate review, source row traceability, supervisor approve/reject. |
| P1 | Staff selection | Master-search technician/supervisor with controlled manual-name fallback; reconcile against supplied VVH staff and supervisor files. |
| P1 | Export / print | CSV/XLSX operational lists and PDF/print inspection form; test actual downloads. |
| P1 | Filters | Date, shift, inspection type, train, loco, and status across dashboard/registers. |
| P2 | Multi-shed readiness | Add a user-to-shed mapping and use it in every query; current server helper still selects VVH directly. Then CSMT headers/data must be isolated from VVH. |
| P2 | IA/IB/IC | Record as outside Trip Shed scope; IA/IB/IC are not conducted at Trip Shed level. |
| P2 | Wheel profile, temperature, materials, roster, awards/warnings | Deferred modules; do not silently add them to v1. |

## 9. Non-negotiable rules / decisions

1. Trip Shed is a separate module, not nested inside Control Office or SSE-HQ.
2. Control Office data is read-only context only; Trip Shed must never change loco links/assignments.
3. Keep the established GC/TI and repair/attention formats. Seek approval before changing labels, column order, or railway terminology.
4. Historical import needs staging and supervisor review before publication; preserve file/sheet/row traceability.
5. Finalised inspections are locked. A reopen flow must require a supervisor/admin and a recorded reason.
6. Every mutable operational record needs creator/updater/timestamps and finalisation/reopen or closure audit fields as applicable.
7. Do authenticated browser tests, not only `node --check` or endpoint checks.
8. The working tree is dirty with unrelated work; do not use `git reset --hard`, `git clean`, or broad reformatting.

## 10. Best continuation prompt

Copy this as the first prompt for Codex/another agent:

```text
Continue the CRTMS Trip Shed VVH module in /Users/neeraja/bbtro. Read docs/TRIP_SHED_VVH_HANDOVER.md completely first and follow it as the source of truth. Do not reset, clean, or alter unrelated dirty worktree files.

The module is available at http://localhost:3000/div/trip-shed.html and currently has a recovery implementation in routes/division/tripShedRoutes.js, public/div/trip-shed.html, public/div/trip-shed-inspection.html, public/div/css/trip-shed.css, and sql/2026-08-31_trip_shed_vvh.sql. The API mount in server.js must remain before generic /api/division mounts.

Start with P0 only: perform read-only database verification of the Trip Shed schema, VVH row, template headers, and exact checklist-item counts; then compare GC, conventional TI, and 3-phase TI against the accepted source documents in /Users/neeraja/Desktop/trip_shed_data/. Report any discrepancies before editing. Preserve official wording/order and use Unicode Hindi where supplied. Then implement only the approved corrections and test authenticated browser flows (not merely syntax checks).

Trip Shed must remain independent. It may read div_locos and div_loco_link_log for exact loco/base and same-date incoming-train/queue context, but must never write to Control Office data. TI-overdue is a factual register with the approved Excel columns and no invented due-date formula. IA/IB/IC are outside Trip Shed scope and are not conducted at this level.
```

## 11. Step 1 inspection safeguards completed 16 September 2026

Scope: `routes/division/tripShedRoutes.js`, `public/div/trip-shed-inspection.html`, and `tests/trip-shed-inspections.integration.js`. No schema, source checklist, Control Office, or operational-record changes were made.

- Save and finalise now use transactions and lock the shed-scoped inspection header with `FOR UPDATE`. Finalised records return 409 before response writes; repeat finalisation cannot rewrite audit metadata.
- Save validates real calendar dates, shift, template eligibility, nonempty checklist, item membership, duplicate item IDs and outcomes. Saved inspections retain their original template; start a new inspection to use another template.
- Finalise validates entry eligibility and all required outcomes. `NOT_CHECKED` or missing required responses block finalisation; `OK`, `ATTENTION` and `NOT_APPLICABLE` count as reviewed outcomes. Defect closure/fitness rules are not added in this step.
- Header and response writes commit together or roll back together. Existing templates and historical responses are retained.
- The load API supplies a date-only value. The UI uses local calendar dates, locks all finalised/read-only inputs, hides unauthorised actions, prevents double submissions and reports save/validation messages inline.

Validation: 30 HTTP checks passed using MySQL connection-local temporary tables, including role rejection, disabled/empty/inactive templates, cross-template responses, duplicate/invalid outcomes, cross-shed access, incomplete finalisation, injected response-write failures and immutable finalised-record snapshots. Run `node tests/trip-shed-inspections.integration.js`. Add `--serve` for the isolated browser fixture on 127.0.0.1:3001; its role switch exists only in this test process, never in the application. Temporary data disappears when the process closes.

Browser fixture passed draft/save/reload/finalise, required-item validation, preserved date/observation, complete finalised locking, and operator/supervisor/read-only control visibility. These use test role sessions rather than real account sign-ins. The local application was restarted and its existing finalised inspection #1 was viewed through its authenticated session: date 2026-08-31, all 33 checklist rows, zero enabled form inputs and no visible save/finalise buttons. No write tests were performed on that historical inspection.

Step 2 remains full approved checklist restoration, including Hindi and complete TI fields/standards. Do not treat required-item validation against the current abbreviated templates as proof of official form completeness.

## 12. Step 2 source restoration prepared 18 September 2026

The approved conventional TI and 3-phase Word forms were structurally extracted and retained as source catalogs under `data/trip-shed/vvh-2025-08/`. The catalogs contain 148 conventional and 163 three-phase checklist entries with source row numbers, section/order, English labels, converted Unicode Hindi where present, and standard values. The original abbreviated template IDs remain untouched so the finalized GC inspection and any future historical references keep their existing foreign keys.

An additive seed is recorded at `sql/2026-09-18_trip_shed_vvh_step2_templates.sql`. After review, it was applied as version `VVH-2025-08-SOURCE`: conventional template id 346 with 148 items and 3-phase template id 347 with 163 items. Existing abbreviated templates 1, 2 and 3 remain unchanged. Some source rows are brake sub-table/continuation rows and still require operational review before using the new templates for routine entry; the catalog preserves them rather than silently discarding them.

Step 3 display cleanup is recorded at `sql/2026-09-18_trip_shed_vvh_step3_display_cleanup.sql` and was applied on 18 September 2026. It cleaned 107 safe display rows across templates 346 and 347 while preserving 26 ambiguous label/standard fields for source-owner review. Step 4 is recorded at `sql/2026-09-18_trip_shed_vvh_step4_source_rows_brake_tables.sql` and resolves those rows: actual checks remain required, brake-table header/value rows render as non-required `Reference` rows, and the inspection page omits outcome/observation controls for reference rows. Template counts remain 148 and 163.

Step 5 GC restoration is recorded at `sql/2026-09-18_trip_shed_vvh_step5_gc_source_template.sql` and was applied on 18 September 2026. The approved `Final GC FORM_17.08.25.docx` table was extracted into `data/trip-shed/vvh-2025-08/gc.json` with 33 source-ordered checklist rows, three bilingual sections, and Hindi/English labels. New GC entries use template id 348, version `VVH-2025-08-SOURCE`; historical template id 1 remains enabled for reading but has `entry_enabled=0`, so finalized inspection #1 stays linked to the original 33 response rows.

The inspection header now captures the live-schema fields `cab_leading` and `kms_reading`, with non-negative numeric validation for the kilometre reading. TS-021 then restored the remaining full TI source-header storage with additive nullable columns for traction converter make, auxiliary converter make, brake system, HLC, SPM, energy consumed (KWH), RTIS status, and RTIS remarks. The inspection API saves and reloads these fields, validates energy as a non-negative decimal, and accepts only the recorded RTIS status values. The browser form shows these source-header fields only for TI templates and leaves them disabled for GC entries. Existing records were not rewritten; historical inspection #1 remains finalized on template 1 with 33 responses. TS-022 adds `/div/trip-shed-inspection-print.html?id=...` and a final-only API print endpoint. The print view includes the complete finalized header and source-ordered checklist, bilingual labels, outcomes, observations, signature area, and A4 browser print/PDF styling; drafts are rejected with HTTP 409. TS-023 restores the defect lifecycle: filtered defect listing, creation audit events, `OPEN → UNDER_ATTENTION → CLOSED` transitions, close validation requiring action taken, locked closed records, event history at `/div/trip-shed-defect.html?id=...`, and role-protected lifecycle updates. TS-024 adds guarded GET-by-id and PATCH support for the factual TI-overdue register, plus `/div/trip-shed-overdue.html` with an Edit control and exact approved columns; no automatic due-date rule is introduced. TS-025 adds reviewed legacy workbook staging at `/div/trip-shed-import.html`: MCDO, OVERDUE, and REPAIR_ATTENTION uploads retain file/sheet/source-row traceability, continuation context, invalid-date and duplicate flags, and supervisor approve/reject decisions. Approval marks staged rows reviewed but does not publish operational data automatically.
TS-027 adds controlled technician and supervisor selection to inspection headers. Users can search active staff master records by name, HRMS ID, CMS ID, or PF number; selecting a result stores the HRMS identity beside the entered name. A manual name remains available when no master match is selected, and existing inspection names remain valid through nullable additive identity columns.
TS-028 adds role-protected CSV/XLSX exports for inspections, defects, and the TI-overdue register. Exports are shed-scoped, support optional date bounds, preserve the approved register columns, and return attachment filenames for direct download; no export path writes operational data.
TS-029 adds consistent register filters: inspections support date range, shift, type, loco/base, train, and status; defects support date range, loco/base, and lifecycle status; TI-overdue supports date range and loco/base. Invalid dates and enum values are rejected, and the dashboard date view remains unchanged.
TS-030 adds `div_trip_shed_users` user-to-shed mapping. Existing Trip Shed roles are seeded to VVH for continuity; division admins can access active sheds, while mapped operators/supervisors/readers are limited to assigned sheds. All Trip Shed API queries resolve the active shed through this mapping, and the dashboard exposes the user’s available shed selector.
TS-031 adds the active CSMT shed seed (`CSMT`, station `CSMT`) without changing existing VVH assignments. Shed-scoped inspection, defect, overdue, import, export, and configuration paths now resolve through the selected mapped shed; the isolated suite confirms CSMT records are visible only in CSMT context, VVH reads do not leak CSMT rows, and a VVH-only operator receives 403 for CSMT. Browser verification shows CSMT, OTHER, and VVH in the division-admin shed selector. Migration: `sql/2026-09-18_trip_shed_vvh_step9_csmt_isolation.sql`.
TS-032 records IA/IB/IC as outside Trip Shed scope. They are not conducted at Trip Shed level and are excluded from the Trip Shed inspection-template selector and entry API surface. No checklist rows were invented and no historical inspections were changed. The retained template headers remain disabled for any future higher-level workflow. Migration history: `sql/2026-09-18_trip_shed_vvh_step10_ia_ib_ic_readiness.sql`.
TS-033 records the deferred v1 modules explicitly in the Trip Shed config and dashboard: Wheel profile, Temperature, Materials, Roster, and Awards / warnings. They are presented as deferred pending approved scope; no routes, tables, or operational writes were added for them. The API and browser fixture verify that the list is visible without silently activating deferred work.
TS-034 adds the dedicated `div_trip_shed_staff` source for VVH. It imports 42 active HRMS-identified rows from `data/trip-shed/vvh-2025-08/source/VVH STAFF COMPLETE DETAILS.xlsx`, excludes the row without an HRMS ID, and records the corrected `KHTLDH`/`WRBXYS` mapping using PF numbers. Trip Shed staff search now reads this shed-scoped table rather than the general Mumbai Division `div_staff_master`. Migration: `sql/2026-09-21_trip_shed_vvh_step11_staff_source.sql`.
TS-035 adds `/div/trip-shed-staff.html` for the VVH staff register. It provides designation count cards, designation filtering, partial search across HRMS ID/name/PF/mobile, and role-protected add/edit forms requiring HRMS ID, name, PF number and designation. UI-added rows are tagged with `source_file='UI entry'`; mobile lookup/storage is additive through `sql/2026-09-21_trip_shed_vvh_step12_staff_page.sql`. Existing source rows remain unchanged unless an authorized user edits them.
TS-036 clarifies that IA, IB and IC periodic maintenance are not conducted at Trip Shed level. The Trip Shed config now reports them as out-of-scope and excludes them from the selectable inspection templates.

## 13. State after the September 2026 MySQL rebuild and the 17 October 2026 commit

The local database was rebuilt from prod in late September 2026 (see `docs/LOCAL_DB_RESTORE_RUNBOOK.md`) and the twelve Trip Shed SQL files were replayed onto it. Consequences:

| Item | Before (sections 11–12) | Now (local) |
|---|---|---|
| Source conventional TI template | id 346, 148 items | id 7, 148 items |
| Source 3-phase TI template | id 347, 163 items | id 8, 163 items |
| Source GC template | id 348, 33 items | id 9, 33 items |
| Abbreviated templates 1, 2, 3 | 33 / 8 / 20 items | headers only, 0 items |
| Finalised GC inspection #1, 33 responses, defect #1, 3 events | present | **not carried over** |

Template ids are auto-increment values and will differ again on prod. Code and SQL must select templates by `inspection_type` + `version_no`, never by id.

The 31 August 2026 records were a smoke test of the draft→final and defect flows (technician "abc", supervisor "xyz", a defect closed six minutes after creation, every response `OK`). They survive in the `bbtro_old` database on the local machine and were deliberately not restored; the integration test now provides the locked-record fixture with temporary tables.

`sql/2026-10-17_trip_shed_abbreviated_templates_disable.sql` closes entry on the abbreviated TI templates (2 and 3), which had stayed `entry_enabled=1` with no items. Only the three `VVH-2025-08-SOURCE` templates are open for entry; the abbreviated headers remain `enabled=1` for reading.

`sql/2026-08-31_trip_shed_vvh.sql` no longer restates the `users.div_role` ENUM; it appends the two Trip Shed roles to whatever list is live, so it cannot drop roles added since (`jrcc`, `chiefos`).

Prod (checked 16 October 2026): no `div_trip%` tables, code at origin/master, both Trip Shed roles already present in the enum. Deploy order when the module ships: merge `feature/trip-shed`, run the fourteen `sql/*trip_shed*` files in date and step order (see section 14), `pm2 restart bbtro`, create a `trip_shed_supervisor` account and map it in `div_trip_shed_users`. The staff workbook `VVH STAFF COMPLETE DETAILS.xlsx` is intentionally not in git; its rows are carried by step 11.

## 14. SLAM loco-movement register (TS-037, 17 October 2026)

SLAM is the railway's central application; its "Trip Shed Loco Movement" report is a CSV with two banner lines (title, "From Date … Up to …") and then one row per loco visit: Sno, Zone, LOCO, SHED (home shed), Purpose (GC/TI), SPM(KM), TRIPSHED, Received at, Loco Out, Defect, Action Taken, six area verdicts (Under Frame, H.T. Machine Room, Pneumatic, Others, Roof Equipment, Cab Equipment), HOGStatus1/2, CAB AC1/2, Remarks. Timestamps are `dd/mm/yyyy hh:mm`.

- **Table** `div_trip_loco_movements` (`sql/2026-10-17_trip_shed_slam_movements.sql`), shed-scoped, natural key `(shed_id, loco_number, received_at)`, every row traceable to its staging batch and source row.
- **Import** through the existing staging flow with `import_kind = SLAM_MOVEMENT` (Imports page, "SLAM loco movement (CSV)"). The header row is found by its LOCO and TRIPSHED cells, and the CSV is read as raw strings so a date is never misread as mm/dd. Columns are matched by name; order may change, a renamed header needs a one-line update to `SLAM_COLUMNS` in `tripShedRoutes.js`.
- **Row flags.** INVALID (not loaded): `MISSING_LOCO`, `INVALID_RECEIVED_AT`, `OTHER_SHED` (TRIPSHED differs from the shed the user is working in), `DUPLICATE` (same loco and received time twice in the file). Warnings (still loaded, shown as chips): `LOCO_NOT_IN_MASTER`, `INVALID_SPM`, `INVALID_OUT_AT`, `EXISTING_VISIT`.
- **Supervisor approval publishes** the READY rows, unlike the three legacy kinds. A visit already in the table is linked to the existing record, never duplicated, so re-uploading an overlapping date range is safe. The decision message states how many were published and how many were already present.
- **Read side**: `GET /movements` (from, to, loco or home shed, purpose), export kind `movements` (CSV/XLSX), and the **Loco movement** tab on the dashboard. SPM values are stored as given; outliers are flagged, not corrected.
- **Multi-shed**: a file is loaded in the context of the selected shed and rows for any other shed are rejected, so CSMT, IGP and LNL files are loaded in their own shed context. IGP and LNL do not yet have rows in `div_trip_sheds`; seed them (and map their users in `div_trip_shed_users`) before their first import.
- **Tests**: 18 checks in `tests/trip-shed-inspections.integration.js`, including the real 24-row export kept as `tests/fixtures/slam_loco_movement_2026-09-21_23.csv`.
- **First real import** on the local database: batch #1, 24 visits for VVH, 21–22 September 2026, approved 17 October 2026.

Deploy note: the SQL list for prod is now fourteen `sql/*trip_shed*` files, in date and step order.

