# BBTRO - Todo List

## Database Fixes
- [ ] Fix missing CLI nominations for other designations (besides designation_id=8)
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

## New Features
- [ ] User management page - needs discussion
- [ ] Add division-only admin user (realm='division', div_role='admin') - no code changes needed, use existing schema
- [x] Leave management page (table: div_leave_tracking exists) - Frontend + API routes complete
- [ ] Slate entry page (depends on leave data)
- [x] CTR entry page - Complete with upload, manual entry, LRD status & SVG map updates

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
