# BBTRO - Todo List

## Database Fixes
- [ ] Fix missing CLI nominations for other designations (besides designation_id=8)
- [ ] Check connection leaks in other route files (cliRoutes, bulkUploadRoutes, etc.)

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
- [x] Leave management page (table: div_leave_tracking exists) - Frontend + API routes complete
- [ ] Slate entry page (depends on leave data)
- [ ] CTR entry page

## Future Enhancements
- [ ] Staff profile report - add Foot plate monitoring, Learning road sections (tables to be created)

## Server Database Pending
SQL scripts to run on production server:
- [ ] `sql/add_retirement_date_column.sql` - Add retirement_date and retirement_type columns to div_staff_master

---
*Last updated: 2026-01-09*

