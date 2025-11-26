# Division Portal - Complete Documentation

**Last Updated:** 2025-10-06
**Status:** ✅ Fully Functional

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Implemented Features](#implemented-features)
4. [API Endpoints](#api-endpoints)
5. [Frontend Pages](#frontend-pages)
6. [Key Implementation Notes](#key-implementation-notes)
7. [Future Tasks](#future-tasks)

---

## Overview

The Division Portal is a comprehensive staff management system for railway division offices. It manages:
- Staff biodata (37 fields per staff member)
- CLI (Chief Loco Inspector) management with nomination tracking
- Training records, awards, punishments
- Personnel stores (equipment issued to staff)
- Transfer requests

**Tech Stack:**
- Backend: Node.js + Express
- Database: MySQL
- Frontend: Vanilla HTML/CSS/JS
- Session-based authentication

---

## Database Schema

### Core Tables

#### 1. `div_staff_master` (37 fields)
Main staff biodata table.

**Primary Key:** `hrms_id` VARCHAR(10)

**Key Fields:**
- Personal: `name`, `date_of_birth`, `gender`, `fathers_name`, `caste`, `marital_status`, `vision`, `blood_group`
- Identification: `identification_mark_1`, `identification_mark_2`, `id_card_no`, `pf_number`, `aadhar_card_no`, `pan_card_no`
- Contact: `phone_number`, `cug_number`, `email`, `present_address`, `permanent_address`
- Service: `current_office_code`, `designation_id`, `current_cli_id`, `dept_rrb`, `reporting_date`, `qualification`
- Dates: `date_of_birth`, `date_of_appointment`, `reporting_date`
- Safety: `safety_category` (A/B/C)
- Status: `status` ENUM('Active','Transferred','Retired','Suspended','Promoted to CLI','Medically Decategorised')

**Staff Status Options:**
- `Active` - Currently working
- `Transferred` - Moved to another office
- `Retired` - Retired from service
- `Suspended` - Under suspension
- `Promoted to CLI` - Promoted to Chief Loco Inspector
- `Medically Decategorised` - Medical fitness changed

**Important:**
- Only 2 required fields: `hrms_id`, `name`
- Date format in DB: YYYY-MM-DD
- Date format for users: DD/MM/YYYY (Indian style)

#### 2. `div_cli_master` (9 fields)
Chief Loco Inspector master data.

**Primary Key:** `cli_id` INT AUTO_INCREMENT

**Fields:**
```sql
cli_id INT PRIMARY KEY AUTO_INCREMENT
staff_hrms_id VARCHAR(10) NULL            -- Optional: if CLI is also in staff_master
cmsid VARCHAR(15)                          -- CLI's CMS ID (like CSTM0027)
cli_name VARCHAR(100) NOT NULL
cli_mobile VARCHAR(15)
cli_dob DATE
cli_doa DATE                               -- Date of Appointment
date_promoted_to_cli DATE
current_office_code VARCHAR(15)
```

**Current Data:** 144 CLIs loaded (as of 2025-10-06)

#### 3. `div_cli_nominations` (12 fields)
Tracks staff nomination history under CLIs.

**Primary Key:** `nomination_id` INT AUTO_INCREMENT

**Fields:**
```sql
nomination_id INT PRIMARY KEY
staff_hrms_id VARCHAR(10)                  -- FK to div_staff_master
cli_id INT                                 -- FK to div_cli_master
nominated_from_date DATE
nominated_to_date DATE                     -- NULL if still active
nomination_order_no VARCHAR(50)
status ENUM('Active','Expired','Transferred') DEFAULT 'Active'
remarks TEXT
created_by VARCHAR(50)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_by VARCHAR(50)
updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**Usage:**
- Tracks current and historical CLI nominations
- Used for statistics and reporting
- One staff can have multiple nomination records over time

#### 4. `div_training_records`
Training history for staff.

**Key Fields:**
- `staff_hrms_id`, `training_id` (FK to `div_training_types`)
- `training_date`, `valid_until`, `status`

#### 5. `div_training_types`
Master list of training courses.

**Current Data:** 16 training types with validity periods

#### 6. `div_staff_personnel_stores`
Equipment issued to staff (flags, torches, detonators, etc.)

#### 7. `div_staff_awards` & `div_staff_punishments`
Awards and disciplinary records.

#### 8. `div_transfer_requests`
Transfer request tracking.

---

## Implemented Features

### ✅ 1. CLI Management System
**Status:** Fully Functional
**Access:** Division Admin Only
**Location:** Settings → CLI Management

**Features:**
- 📋 List all CLIs with active staff count
- 🔍 Search by name/CMSID
- 🏢 Filter by office
- 👁️ View detailed CLI info with statistics:
  - Total nominations (Active/Expired/Transferred)
  - Breakdown by safety category (A/B/C) with averages
  - Breakdown by designation with averages
  - Cross-tabulation (Designation × Category)
  - Duration range analysis (< 1yr, 1-3yr, 3-5yr, > 5yr)
  - Longest nomination record
- 👥 View staff list under each CLI with nomination details:
  - Nomination from/to dates
  - Days in nomination (calculated)
  - Status badges (Active/Expired/Transferred)
  - Average duration statistics
- ✏️ Add/Edit CLI data
- 🗑️ Delete CLI (only if no active nominations)

**UI Design:**
- Card-based grid layout
- Modal popups for details/edit
- Real-time statistics
- Color-coded categories (Green=A, Yellow=B, Red=C)

**Special Calculations:**
- CLI Since: Shows "5y 3m" or "2 years" or "8 months" based on `date_promoted_to_cli`
- Nomination Days: DATEDIFF between from_date and (to_date OR CURDATE())
- Average durations by category/designation

### ✅ 2. Training Types Management
**Status:** Functional
**Access:** Division Admin Only
**Location:** Settings → Training Types

**Features:**
- List all training types
- Add/Edit/Delete training types
- Set validity periods (in years)

### ✅ 3. Personnel Stores Management
**Status:** Functional
**Access:** Division Admin Only
**Location:** Settings → Personnel Store Items

**Features:**
- Manage store items (Flag, Torch, Detonator, etc.)
- Special tracking for detonators
- Issue/return tracking

### ✅ 4. Bulk Staff Upload (Prepared, Not Tested)
**Status:** Code Ready, Awaiting Data
**Access:** Division Admin Only
**Location:** Settings → Bulk Staff Data Upload

**Features:**
- Excel upload (7 sheets: Staff Master + 6 optional)
- DD/MM/YYYY date parsing
- ENUM validation
- Foreign key checks
- Partial import (skip bad rows)
- Detailed error reporting

**Files:**
- Backend: `/routes/division/bulkUploadRoutes.js`
- Frontend: `/public/div/bulk-upload-staff.html`
- Converter: `/cli_excel_to_sql_converter.js`
- Template: `/EXCEL_TEMPLATE_STRUCTURE.md`

**Note:** Decided to use direct SQL import instead for initial data load.

### ✅ 5. Authentication & Authorization
**Realms:** `suburban` and `division`
**Division Roles:**
- `division_admin` - Full access
- `division_user` - Limited access (office-level only)

**Session Management:**
- 8-hour session timeout
- Realm-based access control
- Role-based feature access

---

## API Endpoints

### CLI Management (`/api/division/cli`)

#### GET `/api/division/cli`
List all CLIs with basic info and active staff count.

**Query Params:**
- `search` - Search by name or CMSID
- `office` - Filter by office code

**Response:**
```json
[{
  "cli_id": 430,
  "cmsid": "CSTM0027",
  "cli_name": "VINOD KUMAR D",
  "current_office_code": "CSMT-SUB",
  "office_name": "CSMT Suburban",
  "years_as_cli": 5,
  "months_as_cli": 3,
  "active_staff_count": 25
}]
```

#### GET `/api/division/cli/:id`
Get single CLI details.

#### GET `/api/division/cli/:id/stats`
Get comprehensive statistics for a CLI.

**Response:**
```json
{
  "cli": { /* CLI details */ },
  "nominations": {
    "total": 32,
    "active": 25,
    "expired": 5,
    "transferred": 2,
    "byCategory": [
      { "safety_category": "A", "count": 15, "avg_days": 1320 }
    ],
    "byDesignation": [
      { "designation_name": "Loco Pilot", "count": 12, "avg_days": 1450 }
    ],
    "crossTabulation": [
      { "designation_name": "Loco Pilot", "safety_category": "A", "count": 8 }
    ],
    "durationRanges": [
      { "duration_range": "1-3 years", "count": 8 }
    ],
    "longestNomination": {
      "hrms_id": "HRMS001",
      "name": "Rajesh Kumar",
      "days": 1740
    }
  }
}
```

#### GET `/api/division/cli/:id/staff`
Get staff list under CLI with nomination details.

**Query Params:**
- `status` - Filter by nomination status (Active/Expired/Transferred)

**Response:**
```json
{
  "staff": [{
    "hrms_id": "HRMS001",
    "name": "Rajesh Kumar",
    "designation_name": "Loco Pilot",
    "safety_category": "A",
    "nominated_from_date": "2020-01-01",
    "nominated_to_date": null,
    "nomination_days": 1740,
    "nomination_status": "Active"
  }],
  "statistics": {
    "total": 25,
    "avgDays": 1245
  }
}
```

#### POST `/api/division/cli`
Add new CLI.

**Body:**
```json
{
  "cmsid": "CSTM0218",
  "cli_name": "John Doe",
  "current_office_code": "CSMT-SUB",
  "cli_dob": "1970-05-15",
  "cli_doa": "1992-06-01",
  "date_promoted_to_cli": "2020-01-15",
  "cli_mobile": "9876543210"
}
```

#### PUT `/api/division/cli/:id`
Update CLI.

#### DELETE `/api/division/cli/:id`
Delete CLI (only if no active nominations).

### Other Endpoints

#### GET `/api/division/offices`
Get all active offices.

#### GET `/api/division/training-types`
List all training types.

#### GET `/api/division/personnel-stores`
List all personnel store items.

---

## Frontend Pages

### 1. `/div/index.html`
Division Portal Dashboard (main page).

### 2. `/div/settings.html`
Settings & Master Data Management hub.

**Sections:**
- 📊 Master Data Management
  - Training Types
  - Personnel Store Items
  - Designations (Coming soon)
  - Office Management (Coming soon)
- 🔐 User & Access Management
  - User Accounts (Coming soon)
  - Audit Log (Coming soon)
- 💾 Data Management
  - **Bulk Staff Data Upload**
  - Export & Backup (Coming soon)
  - **CLI Management** ✅
- 🛠️ System Configuration
  - General Settings (Coming soon)
  - My Profile (Coming soon)

### 3. `/div/cli-management.html`
CLI Management interface.

**UI Components:**
- Header with "Add New CLI" button
- Toolbar with search and office filter
- CLI cards grid (responsive)
- Modals:
  - CLI Details (with statistics)
  - Add/Edit CLI form
  - Staff List

### 4. `/div/training-types-manager.html`
Training types CRUD interface.

### 5. `/div/personnel-stores-manager.html`
Personnel stores CRUD interface.

### 6. `/div/bulk-upload-staff.html`
Staff data bulk upload interface (ready, not tested).

### 7. `/div/biodataform.html` ✅
Comprehensive staff biodata entry/edit form.

**Features:**
- Multi-tab layout (Personal, Service, Training, Family, etc.)
- Designation dropdown (required field)
- View/Print button → opens staff-profile-report.html
- Promotion history management
- Training records management
- Family members management
- Awards and Punishments (admin only for punishments)
- Detonator stock tracking
- Staff status dropdown (Active, Transferred, Retired, Suspended, Promoted to CLI, Medically Decategorised)

**Fields Added (Nov 2025):**
- `identification_mark_1`, `identification_mark_2` - Physical identification marks
- `id_card_no` - Employee ID card number
- `qualification` - Educational qualification
- `dept_rrb` - Department/RRB details
- `reporting_date` - Date of reporting to current office
- `status` - Staff status with validation

**Required Fields:** HRMS ID, Name, CMS ID, Designation

### 8. `/div/staff-profile-report.html` ✅
Printable staff bio-profile report.

**Features:**
- Real-time data from 7 API endpoints
- Training matrix with designation-specific filtering (Motorman vs others)
- Awards visible to all, Punishments admin-only
- Print-optimized CSS (currently 3 pages, 2-page optimization documented)
- Retirement date calculation per railway rules

---

## Key Implementation Notes

### 1. Database Connection Pattern
All division routes use connection pooling:

```javascript
// Get connection
const conn = await req.app.locals.pool.getConnection();

try {
  // Use conn.query() for all queries
  const [results] = await conn.query(sql, params);

} finally {
  // ALWAYS release connection
  conn.release();
}
```

**Important:** Never use `db.query()` - always get connection from pool.

### 2. Designation Table JOIN Fix
The `designations` table uses `id` as primary key (NOT `designation_id`).

**Correct JOIN:**
```sql
JOIN designations d ON s.designation_id = d.id
```

**Wrong (will fail):**
```sql
JOIN designations d ON s.designation_id = d.designation_id
```

This affected 4 queries in CLI routes - all have been fixed.

### 3. Role Check
Division admin check uses `div_role` not `role`:

```javascript
if (req.session.user.div_role !== 'division_admin') {
  return res.status(403).json({ error: 'Admin access required' });
}
```

### 4. Date Handling
**Database:** YYYY-MM-DD
**User Display:** DD/MM/YYYY
**Excel Import:** DD/MM/YYYY (converted to YYYY-MM-DD)

**JavaScript conversion:**
```javascript
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
}
```

### 5. CLI Duration Calculation
```sql
-- Years
TIMESTAMPDIFF(YEAR, c.date_promoted_to_cli, CURDATE()) as years_as_cli

-- Remaining months (0-11)
TIMESTAMPDIFF(MONTH, c.date_promoted_to_cli, CURDATE()) % 12 as months_as_cli
```

**Display logic:**
- 5y 3m (if both years and months)
- 2 years (if only years)
- 8 months (if only months)
- Recently promoted (if < 1 month)

### 6. Office Codes
**Current active offices (10):**
- CSMT-SUB, CSMT-ML
- PNVL-SUB, PNVL-ML
- KYN-SUB, KYN-ML
- NRL, LNL, IGP, CLA

### 7. Safety Categories
- **A** (Green) - Highest safety category
- **B** (Yellow) - Medium
- **C** (Red) - Basic

### 8. Nomination Status
- **Active** - Currently under CLI
- **Expired** - Nomination period ended
- **Transferred** - Moved to another CLI/office

### 9. Data Validation & Integrity (Added 2025-11-26)

#### Auto-Uppercase Conversion
**Location:** `/public/div/biodataform.html` (lines 3472-3493)

All identity fields are automatically converted to uppercase for consistency:
- **HRMS ID:** `abcabc` → `ABCABC`
- **CMS ID:** `csmt9999` → `CSMT9999`

**Implementation:**
```javascript
// Real-time conversion on input (preserves cursor position)
field.addEventListener('input', function(e) {
  const start = this.selectionStart;
  const end = this.selectionEnd;
  this.value = this.value.toUpperCase();
  this.setSelectionRange(start, end);
});
```

#### Duplicate Prevention System
**Purpose:** Prevent data integrity issues from duplicate HRMS IDs or CMS IDs

**HRMS ID Duplication Checks:**
1. **Frontend Real-time** (`biodataform.html:3568`)
   - Triggers on field blur
   - Shows alert with existing staff name
   - Clears field and refocuses

2. **Backend Check Endpoint** (`dashboardRoutes.js:408`)
   - `GET /api/division/staff/check/:hrms_id`
   - Returns existing staff details

3. **Backend Creation Guard** (`dashboardRoutes.js:328`)
   - Validates during `POST /api/division/staff`
   - Returns 409 Conflict error

**CMS ID Duplication Checks (NEW):**
1. **On Staff Creation** (`dashboardRoutes.js:341-352`)
   - Checks both `current_cms_id` AND `original_cms_id`
   - Prevents creation if duplicate found
   - Error format: `"CMS ID CSMT9999 is already assigned to Mahtab Alam (jistlt)"`

2. **On Transfer Acceptance** (`transferRoutes.js:164-175`)
   - Validates when receiving office assigns new CMS ID
   - Checks before committing transaction
   - Prevents duplicate during transfer process

**SQL Check Pattern:**
```sql
-- Checks both current and original CMS ID
SELECT hrms_id, name FROM div_staff_master
WHERE current_cms_id = ? OR original_cms_id = ?
```

**Storage:** All IDs stored in uppercase in database for case-insensitive matching

#### Office Selection Validation
**Fixed Issues:**
1. **Regular Users:** Office dropdown now uses CSS readonly (not HTML disabled) so value is submitted
2. **Admin Users:** Added validation requiring office selection before creation
3. **Auto-fill:** Non-admin users get their office pre-filled and locked

**Implementation:**
```javascript
// Make readonly without disabling (so value is submitted)
select.style.pointerEvents = 'none';
select.style.backgroundColor = '#e9ecef';
select.setAttribute('data-locked', 'true');
```

---

## Future Tasks

### High Priority
1. ✅ ~~CLI Management~~ (DONE)
2. ✅ ~~Staff Biodata CRUD UI~~ (DONE)
   - ✅ List staff by office (Office Staff List in Quick Actions)
   - ✅ Add/Edit staff form (multi-tab with all fields)
   - ✅ Designation field in biodata entry
   - ✅ View/Print button linking to staff-profile-report
   - ✅ Office-level access control
3. ✅ ~~Staff Profile Report~~ (DONE)
   - ✅ Comprehensive bio-profile with all sections
   - ✅ Print-optimized CSS layout
   - ✅ Admin-only disciplinary section
4. 📝 Staff Nomination Management
   - Nominate staff under CLI
   - Transfer nominations
   - Historical tracking
5. 📝 Staff data collection and SQL import
   - Collect data from all offices
   - Use `staff_excel_to_sql_converter.js` (to be created)
   - Import in batches (100 staff per office)

### Medium Priority
5. 📝 Designation Management UI
6. 📝 Office Management UI
7. 📝 User Management UI
8. 📝 Audit Log Viewer
9. 📝 Export/Backup features
10. 📝 Reports and Analytics

### Low Priority
11. 📝 My Profile page
12. 📝 General Settings
13. 📝 Email notifications
14. 📝 Mobile responsive improvements

---

## Files Reference

### Backend Routes
- `/routes/division/cliRoutes.js` - CLI CRUD + Stats ✅
- `/routes/division/trainingTypesRoutes.js` - Training types ✅
- `/routes/division/personnelStoresRoutes.js` - Store items ✅
- `/routes/division/bulkUploadRoutes.js` - Bulk upload (ready)
- `/routes/division/dashboardRoutes.js` - Dashboard + offices

### Frontend Pages
- `/public/div/index.html` - Main dashboard
- `/public/div/settings.html` - Settings hub ✅
- `/public/div/cli-management.html` - CLI management ✅
- `/public/div/training-types-manager.html` - Training types ✅
- `/public/div/personnel-stores-manager.html` - Store items ✅
- `/public/div/bulk-upload-staff.html` - Bulk upload (ready)

### Data Files
- `/cli_master_import_complete.sql` - 144 CLIs ✅
- `/cli_excel_to_sql_converter.js` - CLI converter ✅
- `/EXCEL_TEMPLATE_STRUCTURE.md` - Staff upload template
- `/CLI_DATA_TEMPLATE.md` - CLI data guide

### Documentation
- `/DIVISION_PORTAL_DOCUMENTATION.md` - This file ✅
- `/BULK_UPLOAD_IMPLEMENTATION_SUMMARY.md` - Bulk upload details

### Server Configuration
- `/server.js` - Main server with all routes
  - Division routes start at line ~307
  - Protected page routes start at line ~70

---

## Quick Start Guide

### For New AI Assistant Session

1. **Read this file first** - Contains all implementation details
2. **Check database schema** - All tables prefixed with `div_`
3. **Connection pattern** - Always use `req.app.locals.pool.getConnection()`
4. **Role check** - Use `req.session.user.div_role` not `role`
5. **Designation JOIN** - Use `d.id` not `d.designation_id`

### For Testing

1. Start server: `node server.js`
2. Login as division_admin
3. Navigate to Settings
4. Test implemented features:
   - CLI Management ✅
   - Training Types ✅
   - Personnel Stores ✅

### For Development

**Next logical step: Staff Biodata UI**
1. Create `/routes/division/staffRoutes.js`
2. Create `/public/div/biodata.html` (list view)
3. Create `/public/div/biodataform.html` (comprehensive biodata form)
4. Add to sidebar menu
5. Add Quick Action "Add New Staff"

---

## Common Gotchas

1. ❌ Don't use `db.query()` → ✅ Use `conn.query()`
2. ❌ Don't forget `conn.release()` → ✅ Always in `finally` block
3. ❌ Don't use `role` → ✅ Use `div_role` for division
4. ❌ Don't JOIN on `d.designation_id` → ✅ JOIN on `d.id`
5. ❌ Don't use YYYY-MM-DD for display → ✅ Use DD/MM/YYYY
6. ❌ Don't show 1 year for all CLIs → ✅ Calculate from `date_promoted_to_cli`

---

## Staff Profile Report

**File:** `/public/div/staff-profile-report.html`
**Status:** Fully Functional
**Last Updated:** 2025-11-26

### Overview

Comprehensive staff bio-profile report with real-time data from multiple tables. Displays personal info, service details, training matrix, awards, and disciplinary records.

### Report Sections

| Section | Data Source | Notes |
|---------|-------------|-------|
| Header | `div_staff_master` + `div_cli_master` | Name, Designation, PF No, HRMS ID, CLI |
| Quick Stats | `div_staff_master` | CMS ID, Vision, Marital Status, Last PME, Status |
| Personal & Contact Overview | `div_staff_master` + `div_staff_family` | DOB, Age, Gender, Blood Group, Caste, Contacts, Identity Docs, Address |
| Service & Promotion Portfolio | `div_staff_master` + `div_promotion_history` + `div_cli_nominations` | DOA, Years of Service, Retirement Date, Current Posting, CLI Nomination |
| Family & Dependents | `div_staff_family` | Family members with relationships |
| Refresher & PME Matrix | `div_training_records` + `div_training_types` + `div_staff_detonator_stock` | Upcoming Milestone, Personal Store Issue, Major Matrices, Other Trainings |
| Awards & Recognitions | `div_staff_awards` | Visible to all users |
| Disciplinary Actions | `div_staff_punishments` | **Admin only** - hidden from regular users |
| Remarks & Notes | `div_staff_master` | CLI/Officer observations |

### Key Features

#### 1. Training Matrix - ID-Based Filtering
Training tables use `training_id` instead of name matching for reliability:

```javascript
// Major training IDs by designation
// Non-Motorman: 1 (PME), 2 (Refresher IC), 3 (Safety Camp), 5 (Automatic), 6 (Refresher Diesel), 7 (Refresher AC)
// Motorman (designation_id=8): 1 (PME), 3 (Safety Camp), 5 (Automatic), 17 (MEMU), 26 (Mman Promotion/Refresher)

const majorTrainingIds = isMotorman
    ? [1, 3, 5, 17, 26]
    : [1, 2, 3, 5, 6, 7];
```

#### 2. Retirement Date Calculation (Railway Rules)
```javascript
// DOB on 1st: retire last day of previous month at age 60
// DOB 2-31: retire last day of same month at age 60
const calculateRetirementDate = (dob) => {
    const birthDay = birthDate.getDate();
    if (birthDay === 1) {
        retirementMonth = birthMonth - 1; // Previous month
    } else {
        retirementMonth = birthMonth; // Same month
    }
    return new Date(retirementYear, retirementMonth + 1, 0); // Last day
};
```

#### 3. Vision Formatting
```javascript
// Normal → "Normal"
// NV → "With Spectacles for NV"
// DV → "With Spectacles for DV"
// Both → "With Spectacles for both NV & DV"
```

#### 4. Admin-Only Punishments Section
- API `/api/division/discipline/punishments/:hrms_id` requires `division_admin` role
- Section hidden with `display: none` for non-admin
- Uses `admin-print-visible` CSS class for print control

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/division/staff-search/:hrms_id` | Staff master data |
| `GET /api/division/family/:hrms_id` | Family members |
| `GET /api/division/promotions/:hrms_id` | Promotion history |
| `GET /api/division/training/:hrms_id` | Training records (latest per type) |
| `GET /api/division/detonators/:hrms_id` | Detonator stock |
| `GET /api/division/discipline/awards/:hrms_id` | Awards |
| `GET /api/division/discipline/punishments/:hrms_id` | Punishments (admin only) |

### Print Layout

#### Current Implementation (3 Pages)
CSS-based print optimization with:
- A4 page size, 12mm/10mm margins
- `page-break-inside: avoid` on sections and table rows
- Compact fonts (11px base, 9-10px labels)
- Hidden buttons in print
- Preserved background colors

#### 2-Page Optimization (TODO)
To reduce from 3 pages to 2 pages, implement these changes:

1. **Tighter Page Margins**
   ```css
   @page {
       size: A4;
       margin: 8mm 8mm;  /* Reduced from 12mm 10mm */
   }
   ```

2. **Smaller Base Fonts**
   ```css
   body { font-size: 10px; }  /* Reduced from 11px */
   .stat-value { font-size: 12px; }  /* Reduced from 13px */
   th, td { font-size: 9px; }  /* Reduced from 10px */
   ```

3. **Reduced Section Gaps**
   ```css
   .content { gap: 12px; }  /* Reduced from 16px */
   .info-grid { gap: 8px; }  /* Reduced from 10px */
   ```

4. **Hide Empty Sections**
   ```javascript
   // In populateReport(), hide sections with no data
   if (!data.awards || data.awards.length === 0) {
       document.getElementById('awardsSection').style.display = 'none';
   }
   ```

5. **Compact Info Cards**
   ```css
   .info-card { padding: 8px 10px; }  /* Reduced from 10px 12px */
   .info-list { gap: 4px; }  /* Reduced from 6px */
   ```

#### Alternative: Puppeteer PDF Generation
For best quality PDF output, implement server-side generation:

```javascript
// /routes/division/reportRoutes.js
const puppeteer = require('puppeteer');

router.get('/staff-report-pdf/:hrms_id', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000/div/staff-profile-report.html?hrms_id=${req.params.hrms_id}`, {
        waitUntil: 'networkidle0'
    });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
});
```

**Puppeteer considerations:**
- Requires `npm install puppeteer` (~200MB Chromium download)
- Each PDF uses ~50-100MB RAM briefly
- Best quality output, pixel-perfect rendering
- Need to pass session cookies for authentication

---

**End of Documentation**
*For questions or updates, modify this file and commit changes.*
