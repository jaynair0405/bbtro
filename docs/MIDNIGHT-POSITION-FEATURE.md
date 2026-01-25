# Midnight Position (00:00 Hrs) Feature Documentation

> **Last Updated:** 2026-01-12
> **Status:** In Progress
> **Primary Files:**
> - `/public/div/midnight-position.html` (Entry Page)
> - `/public/div/midnight-position-report.html` (Consolidated Report)
> - `/routes/division/midnightPositionRoutes.js` (Backend API)
> - `/sql/div_midnight_position.sql` (Database Schema)

---

## 1. Feature Overview

The Midnight Position feature tracks staff availability at 00:00 hours for each lobby/office. It replaces the current Google Sheets workflow.

### Key Components:
1. **Entry Page** - Lobby users enter daily position data
2. **Consolidated Report** - Division Admin views all lobbies
3. **Sanction Settings** - Admin manages sanction strength per office/designation
4. **Staff List** - Track individual staff under categories (MU, SPAD, etc.)

### Lobbies Supported:
- **Mainline:** KYN, PNVL-ML, CSMT, CLA
- **Suburban:** CSMT_SUB
- **Ghat:** IGP, LNL

### Designations:
- **Common:** LPG, LPS, ALP
- **CSMT specific:** LPM, LPP
- **Ghat specific:** LPGHAT
- **Suburban:** MOTORMAN

---

## 2. Database Schema

### 2.1 `div_sanction_strength_master`
Stores sanction strength per office/designation. Admin manages this.

```sql
CREATE TABLE div_sanction_strength_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  office_code VARCHAR(20) NOT NULL,      -- From offices table (KYN, PNVL-ML, etc.)
  designation_code VARCHAR(20) NOT NULL, -- LPG, LPS, ALP, LPM, LPP, LPGHAT, MOTORMAN
  sanction_strength INT DEFAULT 0,
  updated_by VARCHAR(100),
  updated_at TIMESTAMP,
  UNIQUE KEY (office_code, designation_code)
);
```

**Current Data (example):**
| office_code | designation_code | sanction_strength |
|-------------|------------------|-------------------|
| PNVL-ML     | LPG              | 383               |
| PNVL-ML     | LPS              | 67                |
| PNVL-ML     | ALP              | 454               |

---

### 2.2 `div_position_row_master`
Defines what rows appear in the Position Summary table. Supports dynamic rows.

```sql
CREATE TABLE div_position_row_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  row_code VARCHAR(50) NOT NULL UNIQUE,   -- SLATE_YARDS, LEAVE_NH, etc.
  row_name VARCHAR(100) NOT NULL,         -- Display name
  section ENUM('STRENGTH','NON_EFFECTIVE','WORKING_DETAILS','RESULT','CUSTOM'),
  is_staff_linked TINYINT(1) DEFAULT 0,   -- 1 = count from staff list
  is_editable TINYINT(1) DEFAULT 1,       -- 1 = user can edit
  applicable_offices TEXT,                 -- NULL = all, or comma-separated
  display_order INT DEFAULT 0,
  is_system TINYINT(1) DEFAULT 0,         -- 1 = cannot delete
  is_active TINYINT(1) DEFAULT 1
);
```

**Default Rows (25 rows):**

| Section | row_code | row_name | is_staff_linked | is_editable |
|---------|----------|----------|-----------------|-------------|
| STRENGTH | SANCTION | Sanction Strength | 0 | 0 (readonly - from master) |
| STRENGTH | ON_ROLL | On Roll (MOR) | 0 | 1 |
| STRENGTH | VACANCY | Vacancy | 0 | 0 (calculated) |
| NON_EFFECTIVE | MEDICAL_UNFIT | Medical Unfit | 1 | 0 (auto from staff) |
| NON_EFFECTIVE | SPAD_CREW | SPAD Crew | 1 | 0 |
| NON_EFFECTIVE | SUSPENSION | Suspension/Enquiry | 1 | 0 |
| NON_EFFECTIVE | OFFICE_OUTSTATION | Office/Outstation | 1 | 0 |
| NON_EFFECTIVE | FROM_OTHER_LOBBY | From Other Lobby | 1 | 0 |
| NON_EFFECTIVE | TO_OTHER_LOBBY | To Other Lobby | 1 | 0 |
| WORKING_DETAILS | SLATE_YARDS | Slate + Yards | 0 | 1 |
| WORKING_DETAILS | BTN | BTN | 0 | 1 |
| WORKING_DETAILS | TW | TW | 0 | 1 |
| WORKING_DETAILS | LE_COACHING | LE + Coaching | 0 | 1 |
| WORKING_DETAILS | PROTECTION | Protection WTG | 0 | 1 |
| WORKING_DETAILS | LEAVE_NH | Leave & NH | 0 | 1 |
| WORKING_DETAILS | 30HRS_REST | 30 Hrs Rest | 0 | 1 |
| WORKING_DETAILS | SICK_IOD | Sick/IOD | 0 | 1 |
| WORKING_DETAILS | ABSENT | Absent/AUC/NF | 0 | 1 |
| WORKING_DETAILS | PME | PME | 0 | 1 |
| WORKING_DETAILS | LONG_TRAINING | Long Term Training | 0 | 1 |
| WORKING_DETAILS | MID_TRAINING | Mid Term Training | 0 | 1 |
| WORKING_DETAILS | SHORT_TRAINING | Short Term Training | 0 | 1 |
| WORKING_DETAILS | LRD | Under LRD/TW LRD | 0 | 1 |
| RESULT | NET_AVAILABLE | Net Available | 0 | 0 (calculated) |
| RESULT | UTILIZATION | Utilization | 0 | 1 |

---

### 2.3 `div_midnight_position`
Main position record - one row per date per lobby.

```sql
CREATE TABLE div_midnight_position (
  id INT AUTO_INCREMENT PRIMARY KEY,
  position_date DATE NOT NULL,
  lobby_code VARCHAR(20) NOT NULL,
  finalized TINYINT(1) DEFAULT 0,
  finalized_by VARCHAR(100),
  finalized_at DATETIME,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE KEY (position_date, lobby_code)
);
```

---

### 2.4 `div_position_values`
Key-value storage for position data. Flexible - no schema changes for new rows.

```sql
CREATE TABLE div_position_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  position_id INT NOT NULL,           -- FK to div_midnight_position.id
  row_code VARCHAR(50) NOT NULL,      -- FK to div_position_row_master.row_code
  designation_code VARCHAR(20) NOT NULL, -- LPG, LPS, ALP, etc.
  value INT DEFAULT 0,
  UNIQUE KEY (position_id, row_code, designation_code),
  FOREIGN KEY (position_id) REFERENCES div_midnight_position(id) ON DELETE CASCADE
);
```

**Example Data:**
| position_id | row_code | designation_code | value |
|-------------|----------|------------------|-------|
| 1 | ON_ROLL | LPG | 320 |
| 1 | ON_ROLL | LPS | 55 |
| 1 | SLATE_YARDS | LPG | 25 |
| 1 | LEAVE_NH | LPG | 15 |

---

### 2.5 `div_midnight_position_staff`
Individual staff entries under categories (MU, SPAD, etc.)

```sql
CREATE TABLE div_midnight_position_staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  position_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,      -- MEDICAL_UNFIT, SPAD_CREW, etc.
  staff_hrms_id VARCHAR(20),
  staff_cms_id VARCHAR(20),
  staff_name VARCHAR(100) NOT NULL,
  designation VARCHAR(20) NOT NULL,   -- LPG, LPS, ALP
  working_from_as VARCHAR(200),
  reason VARCHAR(200),
  since_date DATE,
  remarks TEXT,
  FOREIGN KEY (position_id) REFERENCES div_midnight_position(id) ON DELETE CASCADE
);
```

---

### 2.6 `div_midnight_position_categories`
Categories for staff entry tabs (right panel).

```sql
CREATE TABLE div_midnight_position_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_code VARCHAR(50) NOT NULL UNIQUE,
  category_name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);
```

**Default Categories (13):**
1. MEDICAL_UNFIT - Medical Unfit
2. SPAD_CREW - SPAD Crew
3. OFFICE_OUTSTATION - Working In Office/Outstation
4. CLI_SR_CC_ROOM - Working In Home Lobby CLI/Sr CC Room
5. FROM_OTHER_LOBBY - Working From Other Lobby
6. TO_OTHER_LOBBY - Working To Other Lobby/Office
7. ON_LINE_OTHER - Working On Line Other Lobby
8. SUPERNUMERARY - Supernumerary
9. SUSPENSION - Suspension/Enquiry
10. LONG_TRAINING - Long Term Training (Promotional/ZRTI)
11. MID_TRAINING - Mid Term Training (Refresher/ZRTI)
12. SHORT_TRAINING - Short Term Training (MTC/DTC/KAVACH)
13. LRD - Under LRD/TW LRD/Goods Handling

---

## 3. API Routes

All routes under: `/api/division/midnight-position/`

### 3.1 Sanction Strength
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/sanction` | Get all sanction entries (optional: `?office_code=XXX`) |
| GET | `/sanction/offices` | Get offices for dropdown |
| POST | `/sanction` | Add/update sanction entry |
| PUT | `/sanction/:id` | Update sanction value |
| DELETE | `/sanction/:id` | Delete sanction entry |

### 3.2 Row Master (Dynamic Rows)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/rows` | Get all row definitions (optional: `?office_code=XXX` to filter) |
| POST | `/rows` | Add custom row |
| PUT | `/rows/:id` | Update row |
| DELETE | `/rows/:id` | Delete custom row (not system rows) |

### 3.3 Position Values
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/values/:positionId` | Get all values for a position |
| POST | `/values` | Save/update values (bulk upsert) |

**POST /values Request Format:**
```json
{
  "positionId": 1,
  "values": {
    "ON_ROLL": { "LPG": 320, "LPS": 55, "ALP": 400 },
    "SLATE_YARDS": { "LPG": 25, "LPS": 10, "ALP": 30 }
  }
}
```

### 3.4 Staff Search (Autocomplete)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/staff-search?q=XXX` | Search staff by name/CMS ID from div_staff_master |

### 3.5 Categories
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/categories` | Get all categories for staff tabs |

### 3.6 Position CRUD (Existing)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Get position for date/lobby |
| POST | `/` | Create/update position |
| POST | `/carry-forward` | Carry forward from previous day |
| POST | `/finalize` | Finalize position |
| GET | `/summary` | Get division-wide summary |

---

## 4. Frontend Pages

### 4.1 Entry Page: `/div/midnight-position.html`

**Current State:**
- Header with back button, date picker, lobby name
- KPI Cards (LPG, LPS, ALP) showing SS, MOR, Vacancy, Net - COLOR CODED
- Left Panel: Position Summary table (STATIC - needs to be dynamic)
- Right Panel: Staff entry tabs with category-based staff list

**Color Scheme:**
- LPG: Blue (`#3b82f6`)
- LPS: Green (`#10b981`)
- ALP: Orange (`#f59e0b`)
- LPM: Purple (`#8b5cf6`)
- LPP: Pink (`#ec4899`)
- LPGHAT: Indigo (`#6366f1`)
- MOTORMAN: Teal (`#14b8a6`)

**Key Functions:**
- `loadSanction()` - Loads sanction from master table
- `loadPosition()` - Loads position data for date/lobby
- `updateSummary()` - Updates KPI cards and summary calculations
- `carryForward()` - Copies data from previous day

### 4.2 Report Page: `/div/midnight-position-report.html`

**Current State:**
- Header with back button, date picker, edit mode toggle
- Tabs: Mainline | Suburban | Ghat
- Consolidated table with color-coded lobby columns
- Uses sanction from master table

### 4.3 Sanction Settings: `/div/sanction-settings.html`

**Complete - Fully functional:**
- Office dropdown (from offices table)
- Designation input with presets (LPG, LPS, ALP, LPM, LPP, LPGHAT, MOTORMAN)
- Add new office/designation combinations
- Inline edit for sanction values
- Delete entries

---

## 5. Session & Authentication

The session endpoint returns `div_office_code` for division users:

```javascript
// server.js - /api/session endpoint
office_code: req.session.user.div_office_code || req.session.user.office_code || null
```

Users table field: `div_office_code` (e.g., "PNVL-ML", "KYN")

---

## 6. Completed Tasks

1. **Database Design:**
   - Row-based flexible schema (not column-based)
   - Sanction strength master table
   - Position row master (25 default rows)
   - Position values (key-value storage)
   - Staff entries table with CMS/HRMS ID support
   - Categories table

2. **API Routes:**
   - All CRUD for sanction strength
   - Row master management
   - Position values (bulk upsert)
   - Staff search autocomplete
   - Categories endpoint

3. **Frontend - Entry Page:**
   - Color-coded KPI cards (LPG/LPS/ALP)
   - Color-coded table headers
   - Sanction loaded from master table
   - Back button added
   - **DONE:** Dynamic summary table rendering from row master
   - **DONE:** Designation cards show/hide based on sanction data
   - **DONE:** Values saved/loaded using key-value API

4. **Frontend - Report Page:**
   - Sanction loaded from master table
   - Back button added

5. **Sanction Settings Page:**
   - Fully functional admin page

6. **Staff Autocomplete (COMPLETED):**
   - Search staff from `div_staff_master`
   - Autocomplete dropdown with debounced search
   - Auto-populates Name, CMS ID, HRMS ID, Designation
   - Works for both add and edit operations
   - CMS ID field added to staff modal

---

## 7. REMAINING TASKS

### ~~7.1 Frontend: Dynamic Summary Table (COMPLETED)~~

The summary table is now fully dynamic:
- Rows loaded from `/api/division/midnight-position/rows`
- Designation columns dynamically based on sanction data
- Staff-linked rows auto-calculate from staff entries
- Values saved using `/api/division/midnight-position/values` API

### ~~7.2 Staff Autocomplete (COMPLETED)~~

Staff autocomplete is now fully functional:
- Search input at top of add staff modal
- Searches `div_staff_master` by name or CMS ID
- Auto-populates fields when staff is selected
- CMS ID added to staff table and modal

---

### 7.3 Add Custom Row Feature (LOW PRIORITY)

Allow admin to add custom rows via UI:
- UI to add row (row_code, row_name, section, applicable_offices)
- Save via POST `/rows`
- New rows appear in summary table
- API routes already exist, just need admin UI

---

### 7.4 Update Carry Forward for New Structure (MEDIUM PRIORITY)

The carry-forward feature needs to be updated to:
1. Copy position values from `div_position_values` table
2. Currently only copies basic position data and staff entries
3. Need to also copy key-value data

---

### 7.5 Working Details from Detail Book (FUTURE)

The WORKING_DETAILS section fields (Slate+Yards, BTN, TW, etc.) should eventually be auto-filled from the Detail Book module (under preparation).

For now: Manual entry by user.

---

## 8. File Locations

| File | Purpose |
|------|---------|
| `/public/div/midnight-position.html` | Entry page (lobby users) |
| `/public/div/midnight-position-report.html` | Consolidated report (div admin) |
| `/public/div/sanction-settings.html` | Sanction strength settings |
| `/routes/division/midnightPositionRoutes.js` | All backend API routes |
| `/sql/div_midnight_position.sql` | Database schema |
| `/public/div/index.html` | Navigation links added |
| `/server.js` | Route registration, session endpoint |

---

## 9. Navigation Links

Added to `/div/index.html`:

**Operations Section:**
- Midnight Position Entry → `/div/midnight-position.html`

**Reports Section:**
- 00:00 Hrs Position Report → `/div/midnight-position-report.html`

**System Section:**
- Sanction Strength → `/div/sanction-settings.html`

---

## 10. Design Decisions

1. **Row-based (EAV) vs Column-based:**
   - Chose row-based for flexibility
   - Different lobbies can have different rows
   - No ALTER TABLE needed for new rows

2. **Sanction from Master:**
   - Sanction stored in separate master table
   - Entry page shows readonly sanction
   - Div admin manages via settings page

3. **Staff-linked rows:**
   - MU, SPAD, Suspension, etc. counts come from staff entries
   - User adds staff with details in right panel
   - Summary auto-calculates counts

4. **Carry Forward:**
   - Staff list copies to new day
   - User can edit (add/remove staff)
   - Minimizes daily data entry

5. **Color Coding:**
   - Each designation has consistent color
   - Cards and table headers match
   - Visual consistency across pages

---

## 11. Testing Checklist

- [ ] Sanction settings page works
- [ ] Entry page loads sanction from master
- [ ] KPI cards show correct values
- [ ] Staff can be added to categories
- [ ] Staff count reflects in summary
- [ ] Position saves correctly
- [ ] Carry forward works
- [ ] Report page shows all lobbies
- [ ] Report uses sanction from master

---

## 12. Next Steps (Priority Order)

1. ~~**Dynamic Summary Table** - Render from row master~~ ✅ DONE
2. ~~**Staff Autocomplete** - Search from div_staff_master~~ ✅ DONE
3. **Test full workflow** - Entry → Save → Report
4. **Update Carry Forward** - Copy position values
5. **Custom rows** - Admin UI to add new rows

---

## 13. Recent Changes (2026-01-12)

### Dynamic Summary Table Implementation
- Summary table now renders dynamically from `div_position_row_master`
- Rows grouped by section (STRENGTH, NON_EFFECTIVE, WORKING_DETAILS, RESULT)
- Designation columns appear based on sanction master data
- Staff-linked rows auto-calculate counts from staff entries
- Values saved/loaded via `/api/division/midnight-position/values` API
- Designation cards show/hide dynamically

### Staff Autocomplete Implementation
- Added search input field in staff modal
- Debounced search (300ms) against `div_staff_master`
- Autocomplete dropdown with staff name, CMS ID, HRMS ID, office, designation
- Auto-populates form fields when staff is selected
- Added CMS ID field to staff entry form
- Updated staff table to show both CMS ID and HRMS ID
- Backend routes updated to handle `staff_cms_id`

### Key Functions Added
```javascript
loadRows()              // Loads row definitions from API
renderSummaryTable()    // Renders dynamic summary table
populateTableValues()   // Populates values from API
collectTableValues()    // Collects values for saving
updateSummaryCalculations() // Calculates staff-linked and computed values
onStaffSearch()         // Handles staff autocomplete search
selectStaffFromSearch() // Populates form from selected staff
updateDesignationCards() // Shows/hides designation cards
```

---

*End of Documentation*
