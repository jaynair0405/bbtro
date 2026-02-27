# BBTRO - Todo List

## Database Fixes
- [ ] Fix missing CLI nominations for other designations (besides designation_id=8)
  - **Root cause:** Bulk upload sets `current_cli_id` but doesn't insert into `div_cli_nominations`
  - **Sync script:** `sql/2026-02-14_sync_cli_nominations.sql` (run on server)
  - **Future fix needed:** Update `bulkUploadRoutes.js` to insert nominations when CLI is provided
- [x] Check connection leaks in other route files (Fixed 2026-02-01: promotionRoutes, transferRoutes, detonatorRoutes, disciplineRoutes, draftingRoutes, familyRoutes, personnelStoresRoutes, trainingTypesRoutes)

## UI/UX Improvements
- [x] Login page - make division selected by default
- [x] Biodata page - toast notifications, autocomplete search, keyboard shortcuts, view all toggle, auto-save drafts
- [x] Biodata view/print page - concise (1 page) and detailed print options

## Training Module
- [x] PME and refresher courses - set due date auto but editable
- [x] Special training courses (ghat, spic, wag12) - no due date, valid lifetime once trained
- [x] PME due date - special calculation based on age (45/55 milestones)
- [x] Training history view for staff - View all past records per training type in biodata form

## CLI Nomination
- [x] Allow staff without nomination to be assigned CLI from user side
- [x] CLI Nomination Letters feature - Create official letters for CLI changes with PDF export
- [x] CLI Load Overview page - View all CLIs with staff count by designation (Completed 2026-02-14)

### CLI Load Overview Page (Completed)
**Page:** `/div/cli-load.html`
**Features Implemented:**
- Two tabs: Main Line / Suburban
- Depot-wise breakdown per CLI with designation counts
- Sticky table header with color-coded designation columns
- Print / Print Consolidated / Excel export options
- Click on count → popup with staff list (Name, CMS ID, Designation, Office, Days under CLI)
- Summary cards: Total Staff, Active CLIs, Avg/CLI, Unassigned (clickable)
- CLI search dropdown with auto-complete
- CLI detail panel on selection:
  - Personal info (CMS ID, Mobile, DOA, Promoted to CLI date)
  - Years as CLI calculation
  - Retirement date calculation (same rules as staff)
  - Designation-wise staff count cards
  - Safety Category breakdown (A, B, C) excluding ALP/Sr.ALP
    - Click category → expands to show designation split
    - Click designation → modal with staff names
- Row highlighting when CLI selected
- Back to top floating button
- Load threshold color indicators (Suburban ~30, Main Line ~35)

**Designation Groups:**
- ALP (includes Sr.ALP), LPS (includes Sr.LPS), LPG, LPP, LPM, LP Ghat, Motorman

**CLI Type Identification:**
- Suburban: `current_office_code LIKE '%-SUB'` (e.g., CSMT-SUB, KYN-SUB, PNVL-SUB)
- Main Line: Others (CSMT-ML, KYN-ML, PNVL-ML, CLA, IGP, LNL, etc.)

**Future Enhancements (Optional):**
- Filter by office/depot dropdown
- Sort table by total count or CLI name
- CLI load balancing suggestions

### CLI Office Role Identification (Future)
**Purpose:** Identify office-duty CLIs (HQ, Crew Office, etc.) to exclude from load balance calculations.
**Approach:** Add `cli_role` column to `div_cli_master` or create `div_cli_roles` table.

**Example roles:**
| cli_id | cli_role |
|--------|----------|
| 1 | HQ-ML |
| 2 | HQ-SUB |
| 3 | HQ-Cadre |
| 4 | HQ-PCEE |
| 5 | HQ-Dy.CEE |
| 6 | Sr.CC-PNVL |
| 7 | Sr.CC-KYN |
| 8 | CLI-CO-KYN |
| 9 | CLI-CO-PNVL |
| 10 | HQ-SPM |
| 11 | HQ-RR |
| 12 | HQ-CMS |

**Note:** Office CLIs have only 4-6 staff vs field CLIs with 30-35 staff.

### CLI Office History Feature (Existing)
**Location:** Settings → CLI Management → CLI Office button
**Table:** `div_cli_office_history` (cli_id, office_code, from_date, to_date, is_current, remarks)
**Status:** ✅ Already implemented
**Future:** Can integrate with CLI Load Overview to show posting history

## New Features
- [ ] User management page - needs discussion
- [ ] Add division-only admin user (realm='division', div_role='admin') - no code changes needed, use existing schema
- [x] Leave management page (table: div_leave_tracking exists) - Frontend + API routes complete
- [x] Digital Slate & Detail Book - Phase 1 (Completed 2026-02-27)
- [x] CTR entry page - Complete with upload, manual entry, LRD status & SVG map updates
- [x] Safety Category Change Letter - Create official letters for staff category changes (A/B/C) (Completed 2026-02-15)

### Safety Category Change Letter (Completed)
**Page:** `/div/category-change-letter.html`
**API:** `/api/division/category/*`
**Tables:** `div_category_change_letters`, `div_category_change_history`
**Features Implemented:**
- Two staff types: Main Line / Suburban (different letter content/signing)
- Staff search (excludes ALP/Sr.ALP designation IDs 1,2)
- Present Category → Revised Category with upgrade/downgrade counts
- Auto-updates `div_staff_master.safety_category` on save
- Letter preview with live updates
- Export to PDF for printing
- Letter history modal with year/type filters
- Different default content:
  - Main Line: "Review/Revision of Loco Pilots Category"
  - Suburban: "Revision of Motormen Category"
- Letter number: BB.TRSO.ESTB.15 (ML) / BB.TRSO.EMU.15 (SUB)

**Navigation:** Dashboard → Quick Actions → Safety Category

### Safety Category Reports Page (Completed)
**Page:** `/div/category-reports.html`
**Features:**
- Tab switch: Main Line / Suburban
- Summary cards: Category A/B/C counts, Last 30 days changes (upgrades/downgrades)
- Bar chart: Designation-wise category distribution
- Recent changes panel with staff name, old→new category, date
- Staff listing table with filters:
  - Category pills: All / A / B / C
  - Dropdown filters: Depot, Designation, CLI
  - Sortable columns: Name, Designation, Depot, Category
- Print and Excel export

### Digital Slate & Detail Book - Phase 1 (Completed)
**Pages:**
- `/div/detail-book.html` - Jr CC interface for logging crew arrivals
- `/div/slate-3-column.html` - Digital slate display (3-column shift view)

**API Routes:** `/api/division/slate/*`

**Tables:**
- `div_daily_slate` - Daily slot assignments (LP/ALP, train/loco, status)
- `div_detail_book_log` - Arrival log entries from Jr CC
- `div_office_slot_template` - Slot time templates per office
- `div_staff_fatigue_tracker` - Tracks duty hours for fatigue compliance

**Phase 1 Features Implemented:**
1. **Detail Book Interface (Jr CC)**
   - Active/Returning Crews panel - Shows crews with 8+ hours duty time
   - Click-to-Arrive workflow for returning crews
   - Staff search with HRMS ID autocomplete
   - Slot assignment with date/time selection
   - Date picker extended to 10 days ahead ("Pick Date..." option)
   - LP and ALP independent slot assignment

2. **Collision Detection System**
   - Checks if slot already has LP/ALP assigned
   - Dialog with options: "Add Here (Adhoc)" / "Next Slot" / "Cancel"
   - Adhoc entries using incrementing `is_adhoc` counter (0=regular, 1+=adhoc)
   - Unique constraint: `uk_office_slot (office_code, slot_date, slot_time, is_adhoc)`

3. **Slot Status Workflow**
   - AVAILABLE → FORECAST → SIGNED_ON → ONLINE
   - Visual indicators: Green (Online), Amber (Sign-On), Purple (Adhoc)

4. **Timezone Handling**
   - `formatLocalDate()` helper to prevent UTC date shift
   - All date operations use local timezone

5. **Backend APIs**
   - `GET /slots` - Fetch slots for office/date
   - `GET /active-crews` - Get returning crews (8+ hours duty)
   - `POST /arrival` - Log arrival and assign slot
   - `POST /check-availability` - Collision detection endpoint

**Technical Details:**
- Adhoc row styling: Purple left border, italic text
- Slot badge shows original slot time when staff pulled from different slot
- AUC/NF status indicators for staff availability
- Auto-refresh of slate display

**Pending Phases:**
- Phase 2: Sign-on/Sign-off workflow from slate
- Phase 3: Real-time updates via WebSocket
- Phase 4: Integration with leave management
- Phase 5: Reports and analytics

## Future Enhancements
- [ ] Division realm: apply concurrency playbook (dedupe/idempotency, UNIQUE keys, upserts, transactions, idempotency keys) across division APIs before scaling
- [ ] Staff profile report - add Foot plate monitoring, Learning road sections (tables to be created)

## Proposed Enhancements (Code Quality)

### Centralize OFFICE_ACCESS_RULES
The `OFFICE_ACCESS_RULES` constant (for VVH/VVH-ML sister lobby access) is duplicated across 4 route files:
- `routes/division/cliRoutes.js`
- `routes/division/dashboardRoutes.js`
- `routes/division/trainingRoutes.js`
- `routes/division/draftingRoutes.js`

**Recommendation:** Move to a shared utility file (e.g., `routes/division/utils/officeRules.js`) and import where needed.

### Document Extended Designation IDs
The standard designation mapping is 1-7 (ALP, Sr.ALP, LPS, Sr.LPS, LPG, LPP, LPM). Additional IDs used in code need documentation:
- **ID 8** - Motorman (used in `staff-profile-report.html`)
- **ID 10** - Jr.CC (Junior Crew Controller)
- **ID 14** - LPC (Loco Power Controller)
- **ID 15** - TLC (Traction Power Controller)
- **ID 16** - Jr.Instructor
- **ID 17** - Sr.Instructor

**Recommendation:** Add a `DESIGNATION_MAP.md` or comments in schema documenting all designation IDs.

## Server Database Pending
SQL scripts to run on production server:
- [x] `sql/add_retirement_date_column.sql` - Add retirement_date and retirement_type columns to div_staff_master (Applied 2026-02-01)

---

## Completed Fixes Log

### Database Connection Leak Fix (2026-02-01)

**What was done:**
Fixed database connection leak issues in 8 route files (39 endpoints total).

| File | Endpoints Fixed |
|------|-----------------|
| promotionRoutes.js | 4 |
| transferRoutes.js | 6 |
| detonatorRoutes.js | 4 |
| disciplineRoutes.js | 8 |
| draftingRoutes.js | 5 |
| familyRoutes.js | 4 |
| personnelStoresRoutes.js | 4 |
| trainingTypesRoutes.js | 4 |

**Why it was needed:**
When an error occurred after acquiring a database connection but before releasing it, the connection was never returned to the pool. Over time, this could exhaust all available connections, causing the application to hang or crash with "No connections available" errors.

**Pattern applied:**
```javascript
// Before (leaks on error):
try {
    const conn = await pool.getConnection();
    // work...
    conn.release();
} catch (error) {
    // conn never released if error occurs!
    res.status(500).json({ error: 'Database error' });
}

// After (safe):
let conn;
try {
    conn = await pool.getConnection();
    // work...
    conn.release();
} catch (error) {
    if (conn) conn.release();  // Always release on error
    res.status(500).json({ error: 'Database error' });
}
```

**Commit:** `46b4acf`

---
*Last updated: 2026-02-01*
