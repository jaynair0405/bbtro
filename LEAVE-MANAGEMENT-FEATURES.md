# Leave Management Module - Features Documentation

## Overview
A comprehensive leave tracking and management system for BBTRO Division staff.

---

## Core Features

### 1. Dashboard KPI Cards
- **Pending** - Leave applications awaiting action
- **Forwarded** - Leaves forwarded to next level
- **Approved** - Approved leaves for the month
- **On Leave Today** - Staff currently on leave
- **Absent** - Unregularized absences
- **Returning Tomorrow** - Staff returning from leave

Click any KPI card to view detailed list with action buttons.

### 2. Leave Entry Form
- Staff search by name/CMS ID/HRMS ID
- Leave type selection (CL/EL/LAP/etc.)
- Date range picker with auto-calculation of days
- Reason and remarks fields
- Direct submit or mark as absent

### 3. Leave Trends Chart
- Monthly comparison of Applied vs Approved leaves
- Visual bar chart with Chart.js
- **Print button** to export chart as image

### 4. Availability Calendar (Heatmap)
- Color-coded calendar showing leave density per day
- Designation filter (Motorman, LPS, Guard, etc.)
- Click any day to see staff on leave
- Month navigation

### 5. Submitted Leaves List
- Grouped by designation (office order)
- **Search filter** - Filter by staff name/CMS/HRMS
- **Status filter** - All/Pending/Forwarded/Approved/Rejected/Absent
- **Date range filter**
- **Sort options** - By from date, to date, days, status
- **Overdue highlight** - Pending items >3 days old shown with red border and badge
- **Action buttons**:
  - Edit (Pending/Forwarded/Approved)
  - Forward (Pending/Absent)
  - Approve (Pending/Forwarded)
  - Reject (Pending/Forwarded)
  - Regularize (Absent)

### 6. Print Functionality
- **Submitted Leaves Print**
  - Option: All entries or Pending & Absent only
  - Grouped by designation with tables
  - Overdue items highlighted
  - Respects current search filter
- **Chart Print**
  - Exports chart as image
- **Print Header**: Office name + Lobby (for office users)
- **Print Footer**: Sr DEE TRSO-BB, crtms.in, developer credit

### 7. Absenteeism Report
- Period filter (This month/Last month/Year/All time)
- Office filter
- Statistics: Total absent days, instances, staff affected, regularization rate
- Top absentees by days
- Chronic absentees by frequency
- Absence by designation breakdown
- Pending regularization list with action buttons

### 8. Edit/Update Actions
- Edit leave details (type, dates, reason, remarks)
- Update status (Forward/Approve/Reject)
- Regularize absences (partial regularization supported)
- Actions available from:
  - KPI card popups
  - Calendar day popups
  - Submitted leaves list

---

## Technical Details

### API Endpoints
- `GET /api/division/leave/dashboard` - KPI counts
- `GET /api/division/leave/calendar` - Calendar heatmap data
- `GET /api/division/leave/day-details` - Staff on leave for specific day
- `GET /api/division/leave/submitted` - Submitted leaves list
- `GET /api/division/leave/chart-data` - Monthly trends data
- `GET /api/division/leave/absenteeism-report` - Absenteeism statistics
- `POST /api/division/leave` - Create new leave entry
- `PUT /api/division/leave/:id` - Update leave entry

### Database Table
- `div_leave_tracking` - Main leave records
- `div_staff_master` - Staff details (joined)

### User Roles
- **Division Admin** - Can see all offices, office filter available
- **Office User** - Limited to their office data only

---

## Bug Fixes Applied
- [x] Timezone issue in calendar (UTC vs IST) - Fixed with DATE() in SQL
- [x] Date input format issue - Fixed with local date components
- [x] Edit buttons missing in popups - Added to KPI and calendar popups
- [x] Submitted leaves section visibility - Fixed scroll and show logic

---

## Future Enhancements (Wishlist)
See `WISHLIST-LEAVE-MANAGEMENT.md` for planned improvements:
- Batch actions (multi-select approve/reject)
- Leave balance display
- Leave conflict detection
- Email notifications
- Mobile responsive design

---

*Last updated: 2026-01-10*
*Module: Division Leave Management*
