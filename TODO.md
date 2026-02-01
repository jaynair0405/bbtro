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
- [ ] Training history view for staff (low priority)

## CLI Nomination
- [x] Allow staff without nomination to be assigned CLI from user side

## New Features
- [ ] User management page - needs discussion
- [ ] Add division-only admin user (realm='division', div_role='admin') - no code changes needed, use existing schema
- [x] Leave management page (table: div_leave_tracking exists) - Frontend + API routes complete
- [ ] Slate entry page (depends on leave data)
- [x] CTR entry page - Complete with upload, manual entry, LRD status & SVG map updates

## Future Enhancements
- [ ] Staff profile report - add Foot plate monitoring, Learning road sections (tables to be created)

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

