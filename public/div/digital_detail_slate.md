# Project Blueprint: Digital Booking Slate & Detail Book
**Project:** Central Railway - Mumbai Division Digital Workplace (crtms.in)
**Target Location:** PNVL Lobby (& KYN Lobby)
**Current Phase:** Phase 2 Complete (UI), Phase 3 Pending (Status Transitions)
**Last Updated:** 2026-02-27

---

## Quick Reference: Physical Slate Images
- `kyn-slate.jpeg` - KYN-ML physical whiteboard (reference)
- `pnvl-slate.jpeg` - PNVL-ML physical whiteboard (reference)

---

## 1. System Architecture

### 1.1 Technology Stack
| Component | Technology |
|-----------|------------|
| Backend | Node.js (Express) |
| Database | MySQL |
| Frontend | HTML/CSS/JS (Vanilla) |
| Big Screen | Raspberry Pi + Chromium Kiosk Mode |
| Displays | 4K TVs (55"/65" main, 43" secondary) |

### 1.2 Hardware Setup (Airport-Style Multi-Display)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PNVL LOBBY                                    │
│                                                                         │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐                               │
│  │ TV 1    │   │ TV 2    │   │ TV 3    │    ← Multiple 4K displays     │
│  │ (55")   │   │ (55")   │   │ (43")   │                               │
│  │ Pi #1   │   │ Pi #2   │   │ Pi #3   │    ← Each has Raspberry Pi    │
│  └────┬────┘   └────┬────┘   └────┬────┘                               │
│       │             │             │                                     │
│       └─────────────┼─────────────┘                                     │
│                     │                                                   │
│              ┌──────┴──────┐                                           │
│              │   NETWORK   │  ← All connect to same server             │
│              └──────┬──────┘                                           │
│                     │                                                   │
│  ┌──────────────────┴────────────────┐                                 │
│  │         JR CC DESK (PC)           │                                 │
│  │  ┌─────────────┐ ┌─────────────┐  │                                 │
│  │  │ Monitor 1   │ │ Monitor 2   │  │  ← Dual monitor setup           │
│  │  │ detail-book │ │ slate.html  │  │                                 │
│  │  │ .html       │ │ (booking)   │  │                                 │
│  │  └─────────────┘ └─────────────┘  │                                 │
│  │  May have 2 Jr CCs per shift      │                                 │
│  └───────────────────────────────────┘                                 │
│                                                                         │
│        ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  ← Staff waiting in lobby              │
│        (looking at TVs for their booking)                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│  detail-book    │     │   slate.html    │     │  slate.html         │
│  .html          │     │   (Jr CC)       │     │  ?display=1         │
│  (Jr CC)        │     │                 │     │  (Raspberry Pi)     │
├─────────────────┤     ├─────────────────┤     ├─────────────────────┤
│ Sign-off &      │     │ Train/Loco      │     │ Read-only           │
│ Assign future   │     │ booking         │     │ Airport-style       │
│ slots           │     │ Interactive     │     │ display             │
└────────┬────────┘     └────────┬────────┘     └──────────┬──────────┘
         │                       │                         │
         │ POST /arrival         │ POST /booking           │ GET /slots
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │ div_daily_slate│
                        │ (MySQL)        │
                        └────────────────┘
```

---

## 2. The Core Interfaces

### 2.1 Interface Overview

| Page | Purpose | User | Theme | Mode |
|------|---------|------|-------|------|
| `detail-book.html` | Sign-off + Assign future slots | Jr CC | Dark | Interactive |
| `slate.html` | Train/Loco booking | Jr CC | Dark | Interactive |
| `slate.html?display=1` | Lobby display board | Staff | Dark | Read-only |

### 2.2 The Detail Book (`detail-book.html`)

**Purpose:** Used by Jr CC to log returning crew arrivals and assign their next duty slots.

**Layout:** Split-screen Desktop UI
```
┌────────────────────────┬───────────────────────────────────────────────┐
│   LEFT PANEL (480px)   │           RIGHT PANEL (Forecast)              │
├────────────────────────┼───────────────────────────────────────────────┤
│                        │                                               │
│ ┌────────────────────┐ │  ┌─────────┬─────────┬─────────┐             │
│ │ Active/Returning   │ │  │  00-08  │  08-16  │  16-24  │             │
│ │ Crews (Cards)      │ │  ├─────────┼─────────┼─────────┤             │
│ └────────────────────┘ │  │ TIME|LP |TIME|LP  │TIME|LP  │             │
│                        │  │     |ALP|    |ALP │    |ALP │             │
│ ┌────────────────────┐ │  │         │         │         │             │
│ │ Sign-Off Form      │ │  │ Vacant  │ Vacant  │ Vacant  │             │
│ │ - Incoming Detail  │ │  │ slots   │ slots   │ slots   │             │
│ │ - LP / ALP Names   │ │  │ visible │ visible │ visible │             │
│ │ - Rest Rule        │ │  │         │         │         │             │
│ │ - Next Slot        │ │  └─────────┴─────────┴─────────┘             │
│ └────────────────────┘ │                                               │
│                        │  Date navigation: Today | Tomorrow | Pick... │
│ [Save & Update]        │                                               │
│                        │                                               │
└────────────────────────┴───────────────────────────────────────────────┘
```

**Phase 1 Features (Completed):**
- [x] Click-to-Arrive cards (Active crews with 8+ hours duty)
- [x] Auto-fill form on card click
- [x] Rest calculation (16h normal, 30h PR/1-day leave)
- [x] Collision detection with Adhoc option
- [x] Date picker up to 10 days ahead
- [x] LP/ALP independent slot assignment
- [x] Cross-slot pairing support
- [x] Timezone handling (formatLocalDate helper)

**Pending Features:**
- [ ] Leave integration guardrails
- [ ] Fatigue/Night streak warnings
- [ ] Staff search autocomplete

### 2.3 The Booking Slate (`slate.html`)

**Purpose:** Used by Jr CC to assign train/loco bookings to staff on the current day's slate.

**Layout:** Mirror layout with TIME as central anchor
```
┌─────────────────────────────────────────────────────────────────────────┐
│  PNVL BOOKING SLATE              🟢 08-16 SHIFT         27-02-2026     │
├─────────────────────────────────────────────────────────────────────────┤
│           LP SIDE                │ TIME │           ALP SIDE            │
├──────┬───────┬───────────────────┼──────┼───────────────────┬──────┬───┤
│ LOCO │ TRAIN │ LP NAME           │      │ ALP NAME          │TRAIN │LOCO│
├──────┼───────┼───────────────────┼──────┼───────────────────┼──────┼───┤
│30221 │ 12101 │ R.K. Singh        │08:00 │ Mohit Kumar       │12101 │30221│
│43478 │ 11010 │ H.A. Ansari       │08:15 │ Sumit Kr          │11010 │43478│
│      │       │                   │      │ ↳ from 08:30      │      │    │
│  --  │[+Book]│ D.K. Mahor        │08:30 │ (with LP 08:15)   │  --  │ -- │
│  --  │ P/KYN │ Satish S.         │08:45 │ Nayan Nand        │P/KYN │ -- │
│  --  │[+Book]│ Harish Rao        │09:00 │ Umesh D.          │[+Book]│ --│
└──────┴───────┴───────────────────┴──────┴───────────────────┴──────┴───┘
```

**Features:**
- Dark theme (light toggle available)
- Editable cells for train/loco (`[+Book]` buttons)
- Cross-slot linking display (`↳ from XX:XX`)
- Status colors on rows
- Click to edit inline

**URL Parameters:**
| Parameter | Value | Effect |
|-----------|-------|--------|
| (none) | - | Interactive mode for Jr CC |
| `display` | `1` | Read-only mode for big screen |
| `shift` | `0`, `1`, `2` | Force specific shift (00-08, 08-16, 16-24) |
| `theme` | `light` | Light theme (default is dark) |

### 2.4 The Big Screen Display (`slate.html?display=1`)

**Purpose:** Read-only, auto-refreshing dashboard for staff waiting in the lobby. Designed like airport departure boards.

**Design Philosophy:**
> Like airport flight status boards - big, clear rows where each staff booking is immediately visible from across the lobby. Each row is a distinct "card" showing one crew's status.

---

## 3. Big Screen Display Specifications

### 3.1 Layout: Single Shift Split View

The display shows **one shift at a time**, split into two halves for readability:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PNVL INTEGRATED LOBBY                   🟢 08-16         27-02-2026   │
│                                                                         │
│  ◀  🔵 00-08  │  🟢 08-16  │  🟠 16-24  ▶         12:34:56             │
│                                                                         │
╞═════════════════════════════════════════════════════════════════════════╡
│                                                                         │
│         🟢 08:00 - 12:00              │        🟢 12:00 - 16:00         │
│                                       │                                 │
│  ┌─────────────────────────────────┐  │  ┌─────────────────────────────┐│
│  │ 08:00  12101  30221  R.K.SINGH  │  │  │ 12:00  11057  43221  SATISH ││
│  │               MOHIT KUMAR   🟢  │  │  │               NAYAN     🟢 ││
│  └─────────────────────────────────┘  │  └─────────────────────────────┘│
│                                       │                                 │
│  ┌─────────────────────────────────┐  │  ┌─────────────────────────────┐│
│  │ 08:15  11010  43478  H.A.ANSARI │  │  │ 12:15   --     --   PENDING ││
│  │        SUMIT KR ↳08:30      🟡  │  │  │                --      ⬜  ││
│  └─────────────────────────────────┘  │  └─────────────────────────────┘│
│                                       │                                 │
│  ┌─────────────────────────────────┐  │  ┌─────────────────────────────┐│
│  │ 08:30   --     --   D.K.MAHOR   │  │  │ 12:30  12224  30111  ANSARI ││
│  │        (ALP with 08:15)     ⬜  │  │  │               RAHUL     🟡 ││
│  └─────────────────────────────────┘  │  └─────────────────────────────┘│
│                                       │                                 │
│  ┌─────────────────────────────────┐  │  ┌─────────────────────────────┐│
│  │ 08:45  P/KYN   --   SATISH S.   │  │  │ 12:45   --     --   WAITING ││
│  │               NAYAN NAND    🟢  │  │  │                --      ⬜  ││
│  └─────────────────────────────────┘  │  └─────────────────────────────┘│
│                                       │                                 │
│       ... (16 rows per half)          │       ... (16 rows per half)    │
│                                       │                                 │
└───────────────────────────────────────┴─────────────────────────────────┘

Status: ⬜ WAITING  🟡 SIGNED-ON  🟢 ONLINE  ▒▒ SIGNED-OFF (50% fade)
```

### 3.2 Shift Color Coding

Each shift has a distinct color for easy identification:

| Shift | Color | CSS Variable | Hex Code |
|-------|-------|--------------|----------|
| 00:00 - 08:00 | 🔵 Blue | `--shift-night` | `#3b82f6` |
| 08:00 - 16:00 | 🟢 Green | `--shift-day` | `#22c55e` |
| 16:00 - 24:00 | 🟠 Orange | `--shift-evening` | `#f97316` |

**Usage:**
- Shift navigation bar uses these colors
- Active shift is highlighted
- Row headers can have subtle shift color tint

### 3.3 Row Status Colors

Each row's background color indicates the crew's current status:

| Status | Background | Text | Description |
|--------|------------|------|-------------|
| WAITING | `#1e293b` (dark grey) | White | No booking assigned yet |
| FORECAST | `#1e3a5f` (dark blue) | White | Train assigned, crew not arrived |
| SIGNED_ON | `#78350f` (amber/brown) | White | Crew in lobby, ready to depart |
| ONLINE | `#14532d` (dark green) | White | Departed with train |
| SIGNED_OFF | 50% opacity | Faded | Returned and signed off |

### 3.4 Airport-Style Row Design

Each row is a distinct card/panel for maximum visibility:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ████████████████████████████████████████████████████████████████████   │
│  █                                                                  █   │
│  █   08:00    12101    30221    R.K. SINGH       MOHIT KUMAR   🟢  █   │
│  █                                                                  █   │
│  ████████████████████████████████████████████████████████████████████   │
│         ↑ Green background = ONLINE                                     │
│                                                                         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  ▓                                                                  ▓   │
│  ▓   08:15    11010    43478    H.A. ANSARI      SUMIT KR      🟡  ▓   │
│  ▓                                                    ↳ 08:30      ▓   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│         ↑ Amber background = SIGNED-ON                                  │
│                                                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░                                                                  ░   │
│  ░   08:30      --       --     D.K. MAHOR       AMIT PANDEY   ⬜  ░   │
│  ░                                                                  ░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│         ↑ Dark grey = WAITING for booking                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Row Specifications (4K Display):**
- Row height: ~120px (fits 16 rows per half at 2160px)
- Font size: 1.4rem (22px) for readability from 5+ meters
- Padding: 20px vertical, 16px horizontal
- Gap between rows: 8-10px
- Border radius: 8px for card effect

### 3.5 Navigation & Auto-Rotate

**Navigation Bar:**
```
◀  🔵 00-08  │  🟢 08-16  │  🟠 16-24  ▶
```

**Behavior:**
- **Auto-rotate:** Shows current shift based on time
  - 00:00-08:00 → Blue shift active
  - 08:00-16:00 → Green shift active
  - 16:00-24:00 → Orange shift active
- **Manual override:** Click `◀` or `▶` to view other shifts
- **Idle return:** Returns to current shift after 60 seconds of no interaction
- **Auto-refresh:** Data refreshes every 30 seconds

**Previous Shift Spillover:**
- At 09:00, if 07:45 staff still waiting for booking, they remain visible
- Staff stay in their original time position (no moving to top)
- When signed-off, row fades to 50% but stays visible

### 3.6 Cross-Slot Pairing Display

When LP (08:15) is paired with ALP from different slot (08:30):

**On the 08:15 row:**
```
│ 08:15  11010  43478  H.A. ANSARI    SUMIT KR         │
│                                     ↳ from 08:30     │
```

**On the 08:30 row:**
```
│ 08:30   --     --    N.K. SINGH    (with LP 08:15)   │
│                                    [greyed/faded]    │
```

### 3.7 Exception Markers

| Exception | Display | Color |
|-----------|---------|-------|
| AUC (Advised Unable to Come) | `HARISH RAO ᴬᵁᶜ` | Orange text |
| NF (Not Found) | `HARISH RAO ᴺᶠ` | Red text |

### 3.8 Screen Size Calculations

**For 4K (3840 × 2160):**
```
Header: 80px
Shift navigation: 60px
Available for rows: 2020px
Rows per half: 16
Row height: 2020 ÷ 16 = 126px ✓

Width per half: 3840 ÷ 2 = 1920px
Columns fit easily with large fonts
```

**For Full HD (1920 × 1080):**
```
Header: 60px
Shift navigation: 50px
Available for rows: 970px
Rows per half: 16
Row height: 970 ÷ 16 = 60px (tight but readable)
```

---

## 4. Slate Row Lifecycle

### 4.1 Status Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ROW LIFECYCLE                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PREVIOUS DAY          │        TODAY (Slate Day)                    │
│  ─────────────         │        ──────────────────                   │
│                        │                                             │
│  Detail Book           │   ┌─────────┐   ┌─────────┐   ┌─────────┐  │
│  assigns slot     ───────▶ │AVAILABLE│ → │FORECAST │ → │SIGNED_ON│  │
│  (forecast)            │   │(waiting)│   │(booked) │   │(in lobby│  │
│                        │   └─────────┘   └─────────┘   └────┬────┘  │
│                        │                                     │       │
│                        │                               ┌─────▼─────┐ │
│                        │                               │  ONLINE   │ │
│                        │                               │(departed) │ │
│                        │                               └─────┬─────┘ │
│                        │                                     │       │
│                        │   Signs off, gets new slot    ┌─────▼─────┐ │
│                        │   ◄─────────────────────────  │SIGNED_OFF │ │
│                        │   (cycle repeats)             │ (50% fade)│ │
│                        │                               └───────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Visual States on Display

| State | Row Appearance | Train/Loco | Staff Names |
|-------|----------------|------------|-------------|
| AVAILABLE | Dark grey bg | `--` / `--` | Names visible |
| FORECAST | Dark blue bg | Train assigned | Names visible |
| SIGNED_ON | Amber bg | Train assigned | Names visible |
| ONLINE | Green bg | Train assigned | Names visible |
| SIGNED_OFF | 50% opacity | Last train | Names faded |

---

## 5. Database Schema

### 5.1 Tables

**`div_daily_slate`** (Live Board):
```sql
CREATE TABLE div_daily_slate (
    id INT AUTO_INCREMENT PRIMARY KEY,
    office_code VARCHAR(20) NOT NULL,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    shift_code ENUM('00_08', '08_16', '16_24') NOT NULL,
    is_adhoc TINYINT DEFAULT 0,  -- 0=regular, 1+=adhoc counter

    -- LP Assignment
    lp_hrms_id VARCHAR(20),
    lp_status ENUM('AVAILABLE', 'FORECAST', 'SIGNED_ON', 'ONLINE') DEFAULT 'AVAILABLE',
    lp_exception ENUM('AUC', 'NF') DEFAULT NULL,

    -- ALP Assignment
    alp_hrms_id VARCHAR(20),
    alp_status ENUM('AVAILABLE', 'FORECAST', 'SIGNED_ON', 'ONLINE') DEFAULT 'AVAILABLE',
    alp_exception ENUM('AUC', 'NF') DEFAULT NULL,

    -- Cross-slot pairing
    cross_slot_alp_time TIME DEFAULT NULL,

    -- Booking
    train_no VARCHAR(20),
    loco_no VARCHAR(20),

    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_office_slot (office_code, slot_date, slot_time, is_adhoc)
);
```

**`div_detail_book_log`** (Arrival Records):
```sql
CREATE TABLE div_detail_book_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    office_code VARCHAR(20) NOT NULL,

    -- Incoming detail
    incoming_detail VARCHAR(50),
    loco_no VARCHAR(20),
    sign_on_time DATETIME,
    sign_off_time DATETIME NOT NULL,
    is_pilot BOOLEAN DEFAULT FALSE,
    pilot_station VARCHAR(20),

    -- LP Assignment
    lp_hrms_id VARCHAR(20) NOT NULL,
    lp_rest_type ENUM('NORMAL', 'PR', '1_DAY_LEAVE', 'MULTI_DAY_LEAVE'),
    lp_next_slot_date DATE,
    lp_next_slot_time TIME,

    -- ALP Assignment (independent)
    alp_hrms_id VARCHAR(20),
    alp_rest_type ENUM('NORMAL', 'PR', '1_DAY_LEAVE', 'MULTI_DAY_LEAVE'),
    alp_next_slot_date DATE,
    alp_next_slot_time TIME,
    alp_incoming_detail VARCHAR(50),  -- NULL = same as LP
    alp_sign_off_time DATETIME,
    alp_is_pilot BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50)
);
```

### 5.2 Status ENUM Values

| Status | Meaning | When Set |
|--------|---------|----------|
| `AVAILABLE` | Slot exists, no booking | Default state |
| `FORECAST` | Staff assigned, train assigned, not arrived | After booking |
| `SIGNED_ON` | Staff physically in lobby | On sign-on |
| `ONLINE` | Staff departed with train | On departure |

---

## 6. API Endpoints

### 6.1 Slate APIs (`/api/division/slate/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/slots` | Fetch slots for office/date |
| GET | `/active-crews` | Get returning crews (8+ hours duty) |
| POST | `/arrival` | Log arrival and assign future slot |
| POST | `/booking` | Assign train/loco to slot |
| POST | `/check-availability` | Collision detection |
| PUT | `/status` | Update slot status (sign-on, online) |

### 6.2 Request/Response Examples

**GET /slots**
```javascript
// Request
GET /api/division/slate/slots?date=2026-02-27&office=PNVL-ML

// Response
{
    "slots": [
        {
            "id": 1,
            "slot_time": "08:00:00",
            "shift_code": "08_16",
            "lp_hrms_id": "AABCDE",
            "lp_name": "R.K. Singh",
            "lp_status": "ONLINE",
            "alp_hrms_id": "AAXYZ",
            "alp_name": "Mohit Kumar",
            "alp_status": "ONLINE",
            "train_no": "12101",
            "loco_no": "30221",
            "cross_slot_alp_time": null
        },
        // ... more slots
    ]
}
```

**POST /booking**
```javascript
// Request
POST /api/division/slate/booking
{
    "slot_id": 1,
    "train_no": "12101",
    "loco_no": "30221",
    "is_pilot": false,
    "pilot_station": null
}
```

---

## 7. Implementation Phases

### Phase 1: Detail Book (✅ COMPLETED)
- [x] Database schema created
- [x] Active/Returning crews API
- [x] Click-to-Arrive cards
- [x] Sign-off form with rest calculation
- [x] Collision detection with adhoc support
- [x] Date picker up to 10 days
- [x] Timezone handling
- [x] Forecast grid display

### Phase 2: Booking Slate (🔄 IN PROGRESS)
- [x] Make `slate.html` dynamic (connect to API)
- [x] Dark theme with light toggle (`?theme=light`)
- [x] Editable cells for train/loco (click to edit)
- [x] Add `?display=1` read-only mode
- [x] Airport-style row design (display mode)
- [x] Shift color coding (Blue/Green/Orange)
- [x] Split-shift layout (00-04 | 04-08)
- [x] Navigation (auto-rotate + manual arrows)
- [x] Cross-slot pairing display (`↳ from XX:XX`)
- [x] Status colors (waiting/signed-on/online/signed-off)
- [x] 50% fade for signed-off rows
- [x] Auto-refresh (30 seconds)
- [ ] Sign-on/Sign-off action buttons (Phase 3)

### Phase 3: Status Transitions
- [ ] Sign-on button/action
- [ ] Online (departure) marking
- [ ] Sign-off from slate
- [ ] Status change API

### Phase 4: Real-time Updates
- [ ] WebSocket for instant updates
- [ ] 3-minute pulse on booking changes
- [ ] Multi-client sync

### Phase 5: Integration
- [ ] Leave management integration
- [ ] Fatigue/Night streak warnings
- [ ] Staff search autocomplete

### Phase 6: Hardware Deployment
- [ ] Raspberry Pi setup guide
- [ ] Chromium kiosk mode configuration
- [ ] Auto-start on boot
- [ ] Network resilience

---

## 8. Raspberry Pi Setup (Future)

### 8.1 Hardware Requirements
- Raspberry Pi 4 (4GB RAM recommended)
- 4K capable micro-HDMI cable
- SD Card (32GB+)
- Ethernet or WiFi connectivity

### 8.2 Software Setup
```bash
# Install Chromium
sudo apt install chromium-browser

# Create kiosk script
cat > /home/pi/kiosk.sh << 'EOF'
#!/bin/bash
xset s off
xset -dpms
xset s noblank
chromium-browser --kiosk --noerrdialogs \
    --disable-infobars --disable-session-crashed-bubble \
    "http://server-ip:3000/div/slate.html?display=1"
EOF

# Auto-start on boot
# Add to /etc/xdg/lxsession/LXDE-pi/autostart
@/home/pi/kiosk.sh
```

### 8.3 URL Configuration
Each Pi can show different content:
- Pi #1: `slate.html?display=1` (auto-rotate)
- Pi #2: `slate.html?display=1&shift=1` (always show 08-16)
- Pi #3: `slate.html?display=1&shift=2` (always show 16-24)

---

## 9. Resolved Questions Reference

### A. Slot Structure
- **96 slots per day** (3 shifts × 32 slots at 15-min intervals)
- **One crew per slot** normally, adhoc for extras
- **Train assignment by Jr CC**, not automatic

### B. LP/ALP Pairing
- **Independent assignment** - LP and ALP can have different rest rules
- **Cross-slot pairing allowed** - 08:00 LP with 08:45 ALP
- **No auto-pairing** - Jr CC decides

### C. Shift Visibility
- **All 32 slots per shift always shown** (depot is busy)
- **Previous shift spillover** - staff stay in original position
- **Signed-off rows stay visible** at 50% fade

### D. Display Layout
- **Single shift split view** - (00-04 | 04-08) side by side
- **16 rows per half** for readability
- **Auto-rotate + manual navigation**

---

## 10. File References

| File | Purpose |
|------|---------|
| `public/div/detail-book.html` | Jr CC sign-off interface (HTML only) |
| `public/div/slate.html` | Jr CC booking + Big screen display |
| `public/div/css/slate-theme.css` | Shared dark theme styles |
| `public/div/js/slate-common.js` | Shared utilities (config, helpers, API) |
| `public/div/js/detail-book.js` | Detail book page logic |
| `public/div/js/slate.js` | Slate page logic |
| `routes/division/slateRoutes.js` | API routes |
| `sql/2026-02-24_digital_slate_schema.sql` | Database schema |
| `kyn-slate.jpeg` | Physical slate reference (KYN) |
| `pnvl-slate.jpeg` | Physical slate reference (PNVL) |

---

*Document maintained by: Development Team*
*Last major revision: Phase 2 planning - Airport-style display design*
