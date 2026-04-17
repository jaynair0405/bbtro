# Slate Analysis Feature

## Overview
The Slate Analysis feature allows JR CC/booking officials to check LRD (Learning Road Date) validity and training compliance for staff in the daily slate. It helps identify incompatible LP-ALP pairs and suggests alternatives.

## Access
- Click the **"Analysis"** button in the slate page header
- Opens a modal with 4 tabs: LRD Status, Training, Combined, Compliance

## Features

### 1. LRD Status Tab
- Shows LRD validity for each staff member against selected sections
- Color-coded badges:
  - **Green**: Valid (worked within 90 days)
  - **Yellow**: Expiring (within 15 days of expiry)
  - **Red**: Expired (> 90 days since last worked)
  - **Grey (-)**: Never worked on section

### 2. Training Tab
- Shows training completion status for selected trainings
- **Green checkmark**: Trained (with date)
- **Red X**: Not trained
- **Grey N/A**: LP-only training shown for ALP (e.g., TW TRG)

### 3. Combined Tab
- Matrix view showing both LRD and Training status
- Status column shows overall compliance (OK or warning)
- Rows with issues are highlighted in light red

### 4. Compliance Tab
- Shows slots with LP-ALP compliance issues
- Displays suggestions for alternative staff from other slots
- Issues detected:
  - LP/ALP missing LRD for selected sections
  - LP/ALP missing required training

## Configuration

### Sections Available (for PNVL office)
Excludes: JNPT_PNVL, PNVL_JNPT, PNVL_BSR, BSR_PNVL

Includes all SHARED sections:
- PNVL_DIVA / DIVA_PNVL
- KYN_PNVL / PNVL_KYN
- KJT_BVT / BVT_KJT (Ghat section)

### Trainings Available
| ID | Code | Name | LP Only |
|----|------|------|---------|
| 10 | WAG_12 | WAG-12 | No |
| 11 | SPIC | SPIC | No |
| 13 | TW_TRG | TW TRG | **Yes** |
| 15 | WDG 4G/6G | WDG 4G/WDG 6G | No |

**Note**: TW TRG (ID 13) is LP-only. ALPs are not marked non-compliant for this training.

## API Endpoints

### GET /api/division/slate/staff-analysis
Analyzes staff in slate for LRD and training compliance.

**Query Parameters:**
- `shift` (optional): 0=Night, 1=Day, 2=Evening
- `date` (optional): Target date (defaults to today)
- `sections` (optional): Comma-separated section IDs
- `trainings` (optional): Comma-separated training IDs

**Response:**
```json
{
  "success": true,
  "date": "2026-04-17",
  "shift": 1,
  "sections": [...],
  "trainings": [...],
  "summary": {
    "total_slots": 8,
    "lps": 8,
    "alps": 8,
    "lrd_compliant_lps": 5,
    "lrd_compliant_alps": 6,
    "training_compliant_lps": 7,
    "training_compliant_alps": 8,
    "incompatible_pairs": 2
  },
  "lps": [...],
  "alps": [...],
  "incompatible_pairs": [...]
}
```

### GET /api/division/slate/available-sections
Returns list of LRD sections for filter dropdown.

### GET /api/division/slate/available-trainings
Returns list of training types for filter dropdown.

## Table Display
- Staff sorted by slot time with LP and ALP of same slot together
- Columns: #, Time, Desg (LP/ALP), Name, CMS, [Sections...], [Trainings...]

## Files Modified
- `routes/division/slateRoutes.js` - Backend APIs
- `public/div/slate.html` - Frontend modal and UI
- `div_training_types` table - Updated WDG 4G/6G code
