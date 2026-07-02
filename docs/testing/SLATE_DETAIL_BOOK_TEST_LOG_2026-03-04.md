# Slate & Detail Book - Test Execution Log

**Test Date:** 2026-03-04
**Tester:** Neeraja
**Server:** localhost:3000
**Test Data:** 2026-03-03 slate (96 slots, all ONLINE)

---

## Test Data Setup

**SQL Script:** `sql/test_data_populate_slate.sql`

**Quick Commands:**
```bash
# Clear and populate slate for testing
mysql -u jay -p bbtro < sql/test_data_populate_slate.sql

# Or run specific parts:
mysql -u jay -p bbtro -e "DELETE FROM div_daily_slate WHERE office_code = 'PNVL-ML';"
mysql -u jay -p bbtro < sql/test_data_populate_slate.sql
```

**Variables in script:**
- `@test_date` - Date to populate (default: '2026-03-03')
- `@office` - Office code (default: 'PNVL-ML')
- `@num_slots` - Number of slots (default: 96)

---

## Progress Summary

| Section | Total | Passed | Failed | Pending |
|---------|-------|--------|--------|---------|
| 1.1 Returning Crew Cards | 5 | 4 | 0 | 1 |
| 1.2 Manual Entry Mode | 6 | 0 | 0 | 6 |
| 1.3 Sign-Off Time & Date | 5 | 0 | 0 | 5 |
| 1.4 Rest Rules & Slot Calc | 8 | 0 | 0 | 8 |
| 1.5 Staff Warnings | 6 | 0 | 0 | 6 |
| 1.6 Slot Collision | 6 | 3 | 0 | 3 |
| 1.7 SAFE Pending Flow | 5 | 0 | 0 | 5 |
| 1.8 Forecast Panel | 9 | 0 | 0 | 9 |
| 1.9 Incoming Detail Dot | 3 | 0 | 0 | 3 |
| 1.10 Submit & Arrival | 5 | 0 | 0 | 5 |
| 2.1 Date & Shift Nav | 5 | 0 | 0 | 5 |
| 2.2 Booking Modal | 10 | 0 | 0 | 10 |
| 2.3 ALP Selection | 6 | 0 | 0 | 6 |
| 2.4 Extra ALP | 7 | 0 | 0 | 7 |
| 2.5 SAFE Marking | 7 | 0 | 0 | 7 |
| 2.6 Clear Booking | 5 | 0 | 0 | 5 |
| 2.7 Exception Marking | 9 | 0 | 0 | 9 |
| 2.8 Status Display | 8 | 0 | 0 | 8 |
| 2.9 Vacancy Summary | 4 | 0 | 0 | 4 |
| 2.10 Auto-Refresh | 3 | 0 | 0 | 3 |
| 3.x Integration Tests | 11 | 0 | 0 | 11 |
| 4.x Edge Cases | 9 | 0 | 0 | 9 |
| **TOTAL** | **132** | **7** | **0** | **125** |

---

## PART 1: DETAIL BOOK

### 1.1 Returning Crew Cards

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.1.1 | Crews 5+ hrs duty appear | ✅ | All crews >5hrs appear |
| 1.1.2 | Search by name | ✅ | Works |
| 1.1.3 | Search by CMS ID | ✅ | Works |
| 1.1.4 | Click card fills form | ✅ | Works |
| 1.1.5 | Leave warning on card | ⏳ | Need to add leave data |

### 1.2 Manual Entry Mode

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.2.1 | Toggle manual entry | ⏳ | |
| 1.2.2 | LP search autocomplete | ⏳ | |
| 1.2.3 | ALP search autocomplete | ⏳ | |
| 1.2.4 | Night streak indicator | ⏳ | |
| 1.2.5 | Off reason dropdown | ⏳ | |
| 1.2.6 | Current time display | ⏳ | |

### 1.3 Sign-Off Time & Date

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.3.1 | Sign-off time entry | ⏳ | |
| 1.3.2 | Sign-off date TODAY | ⏳ | |
| 1.3.3 | Sign-off date PREV | ⏳ | |
| 1.3.4 | Pilot checkbox shows station | ⏳ | |
| 1.3.5 | Pilot ex-station select | ⏳ | |

### 1.4 Rest Rules & Slot Calculation

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.4.1 | Normal rest 16hr calc | ⏳ | |
| 1.4.2 | PR rest 30hr calc | ⏳ | |
| 1.4.3 | Multi-day leave disables | ⏳ | |
| 1.4.4 | Date selector options | ⏳ | |
| 1.4.5 | Custom date picker | ⏳ | |
| 1.4.6 | Slot time auto-calc | ⏳ | |
| 1.4.7 | Date label shows day | ⏳ | |
| 1.4.8 | LP/ALP independent calc | ⏳ | |

### 1.5 Staff Warnings

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.5.1 | Sanctioned leave BLOCKS | ⏳ | |
| 1.5.2 | Pending leave WARNING | ⏳ | |
| 1.5.3 | Night streak 3 WARNING | ⏳ | |
| 1.5.4 | Night streak 4+ BLOCKS | ⏳ | |
| 1.5.5 | Already assigned BLOCKS | ⏳ | |
| 1.5.6 | PR auto-suggestion | ⏳ | |

### 1.6 Slot Collision Detection

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.6.1 | Collision modal shows | ✅ | |
| 1.6.2 | Shows occupied-by name | ✅ | |
| 1.6.3 | Add Here (Adhoc) works | ⏳ | |
| 1.6.4 | Next Slot works | ✅ | Fixed - now places in correct slot |
| 1.6.5 | Cancel returns to form | ⏳ | |
| 1.6.6 | Next Slot disabled when none | ⏳ | |

### 1.7 SAFE Pending Flow

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.7.1 | SAFE cards appear | ⏳ | |
| 1.7.2 | Click SAFE fills form | ⏳ | |
| 1.7.3 | Incoming shows "SAFE" | ⏳ | |
| 1.7.4 | Submit processes SAFE | ⏳ | |
| 1.7.5 | SAFE card disappears | ⏳ | |

### 1.8 Availability Forecast Panel

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.8.1 | Date tabs show (11 days) | ⏳ | |
| 1.8.2 | Today highlighted | ⏳ | |
| 1.8.3 | Scroll with < > buttons | ⏳ | |
| 1.8.4 | Keyboard nav (arrows) | ⏳ | |
| 1.8.5 | Vacancy summary shows | ⏳ | |
| 1.8.6 | Staff names display | ⏳ | |
| 1.8.7 | Adhoc orange border | ⏳ | |
| 1.8.8 | Late arrival cyan text | ⏳ | |
| 1.8.9 | Exception badge (AUC/NF) | ⏳ | |

### 1.9 Incoming Detail Dot

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.9.1 | Dot appears for incoming | ⏳ | |
| 1.9.2 | Click dot shows popup | ⏳ | |
| 1.9.3 | Pilot indicator in popup | ⏳ | |

### 1.10 Submit & Arrival Processing

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.10.1 | Successful submit | ⏳ | |
| 1.10.2 | Crew card removed | ⏳ | |
| 1.10.3 | Slot assigned in forecast | ⏳ | |
| 1.10.4 | Error: missing sign-off | ⏳ | |
| 1.10.5 | Error: missing staff | ⏳ | |

---

## PART 2: SLATE

### 2.1 Date & Shift Navigation

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.1.1 | Date buttons work | ⏳ | |
| 2.1.2 | Shift tabs work | ⏳ | |
| 2.1.3 | Shift colors correct | ⏳ | |
| 2.1.4 | Keyboard shift change | ⏳ | |
| 2.1.5 | Current shift default | ⏳ | |

### 2.2 Booking Modal

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.2.1 | Open modal (click train col) | ⏳ | |
| 2.2.2 | Slot info displays | ⏳ | |
| 2.2.3 | LP name shown | ⏳ | |
| 2.2.4 | ALP dropdown populated | ⏳ | |
| 2.2.5 | Error: train required | ⏳ | |
| 2.2.6 | Save booking works | ⏳ | |
| 2.2.7 | Pilot checkbox saves | ⏳ | |
| 2.2.8 | Loco number saves | ⏳ | |
| 2.2.9 | Remarks saves | ⏳ | |
| 2.2.10 | Cancel closes modal | ⏳ | |

### 2.3 ALP Selection Modes

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.3.1 | Same slot ALP | ⏳ | |
| 2.3.2 | Different slot ALP | ⏳ | |
| 2.3.3 | Out of Slate | ⏳ | |
| 2.3.4 | Other Depot | ⏳ | |
| 2.3.5 | Mutual exclusion | ⏳ | |
| 2.3.6 | Original ALP marked BOOKED | ⏳ | |

### 2.4 Extra ALP Feature

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.4.1 | Checkbox shows section | ⏳ | |
| 2.4.2 | Extra ALP dropdown | ⏳ | |
| 2.4.3 | Select from slate | ⏳ | |
| 2.4.4 | Extra Out of Slate | ⏳ | |
| 2.4.5 | Extra Other Depot | ⏳ | |
| 2.4.6 | Original marked BOOKED | ⏳ | |
| 2.4.7 | Clear clears extra | ⏳ | |

### 2.5 SAFE Marking

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.5.1 | SAFE button shows section | ⏳ | |
| 2.5.2 | Sign-off time default | ⏳ | |
| 2.5.3 | Confirm SAFE works | ⏳ | |
| 2.5.4 | Error: time required | ⏳ | |
| 2.5.5 | Row shows SAFE status | ⏳ | |
| 2.5.6 | Creates pending in DB | ⏳ | |
| 2.5.7 | Appears in Detail Book | ⏳ | |

### 2.6 Clear Booking

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.6.1 | Clear button visible | ⏳ | |
| 2.6.2 | Clear removes data | ⏳ | |
| 2.6.3 | Status resets AVAILABLE | ⏳ | |
| 2.6.4 | ALP source reset | ⏳ | |
| 2.6.5 | Extra ALP cleared | ⏳ | |

### 2.7 Exception Marking

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.7.1 | Open exception modal | ⏳ | |
| 2.7.2 | Mark LATE | ⏳ | |
| 2.7.3 | LATE + detention YES | ⏳ | |
| 2.7.4 | LATE + detention NO | ⏳ | |
| 2.7.5 | Mark AUC | ⏳ | |
| 2.7.6 | Mark NF | ⏳ | |
| 2.7.7 | Clear exception | ⏳ | |
| 2.7.8 | LATE disables AUC/NF | ⏳ | |
| 2.7.9 | AUC/NF disables LATE | ⏳ | |

### 2.8 Status Display

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.8.1 | AVAILABLE row style | ⏳ | |
| 2.8.2 | ONLINE row style | ⏳ | |
| 2.8.3 | BOOKED row style | ⏳ | |
| 2.8.4 | SAFE row style | ⏳ | |
| 2.8.5 | Adhoc orange border | ⏳ | |
| 2.8.6 | Late arrival cyan | ⏳ | |
| 2.8.7 | AUC badge orange | ⏳ | |
| 2.8.8 | NF badge red | ⏳ | |

### 2.9 Vacancy Summary

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.9.1 | Summary displays | ⏳ | |
| 2.9.2 | Updates on book | ⏳ | |
| 2.9.3 | Updates on clear | ⏳ | |
| 2.9.4 | Per-shift count | ⏳ | |

### 2.10 Auto-Refresh

| # | Test | Result | Notes |
|---|------|--------|-------|
| 2.10.1 | Auto-refresh 30s | ⏳ | |
| 2.10.2 | Maintains selection | ⏳ | |
| 2.10.3 | Time updates (display) | ⏳ | |

---

## PART 3: INTEGRATION

### 3.1 Detail Book → Slate

| # | Test | Result | Notes |
|---|------|--------|-------|
| 3.1.1 | Nav link "Slate →" | ⏳ | |
| 3.1.2 | Arrival updates slate | ⏳ | |
| 3.1.3 | Crew removed from cards | ⏳ | |

### 3.2 Slate → Detail Book

| # | Test | Result | Notes |
|---|------|--------|-------|
| 3.2.1 | Nav link "← Detail Book" | ⏳ | |
| 3.2.2 | SAFE pending appears | ⏳ | |
| 3.2.3 | SAFE processed | ⏳ | |

### 3.3 Status Transitions

| # | Test | Result | Notes |
|---|------|--------|-------|
| 3.3.1 | ONLINE → BOOKED | ⏳ | |
| 3.3.2 | AVAILABLE → BOOKED | ⏳ | |
| 3.3.3 | BOOKED → AVAILABLE | ⏳ | |
| 3.3.4 | Any → SAFE | ⏳ | |

### 3.4 Data Persistence

| # | Test | Result | Notes |
|---|------|--------|-------|
| 3.4.1 | Booking persists refresh | ⏳ | |
| 3.4.2 | Exception persists | ⏳ | |
| 3.4.3 | Arrival logged in DB | ⏳ | |
| 3.4.4 | Slot linked to log | ⏳ | |

---

## PART 4: EDGE CASES

### 4.1 Boundary Conditions

| # | Test | Result | Notes |
|---|------|--------|-------|
| 4.1.1 | Late slot 23:45 rollover | ⏳ | |
| 4.1.2 | Cross-midnight sign-off | ⏳ | |
| 4.1.3 | Max date 10 days | ⏳ | |
| 4.1.4 | Same staff LP & ALP | ⏳ | |
| 4.1.5 | Empty slot booking | ⏳ | |

### 4.2 Error Handling

| # | Test | Result | Notes |
|---|------|--------|-------|
| 4.2.1 | Network error | ⏳ | |
| 4.2.2 | Invalid time format | ⏳ | |
| 4.2.3 | Server error 500 | ⏳ | |
| 4.2.4 | Concurrent edit | ⏳ | |

---

## ISSUES LOG

| # | Test ID | Issue Description | Severity | Status |
|---|---------|-------------------|----------|--------|
| 1 | 1.1.4 | Slot time not rounded to 15-min intervals (e.g., 11:20 sign-off → 03:20 next slot, should be 03:30) | High | ✅ Fixed |
| 2 | 1.6.4 | "Next Slot" collision resolution replaces existing staff instead of using next available slot | Critical | ✅ Fixed |
| 3 | 1.6.4 | "Next Slot" sends ISO datetime instead of YYYY-MM-DD for date field | High | ✅ Fixed |
| 4 | 1.6.4 | Display uses form values instead of actual assigned slot from backend - causes visual replacement | Critical | ✅ Fixed |
| 5 | 1.9.1 | Incoming train dot only appears after page refresh, not immediately after submission | Medium | ✅ Fixed |

---

## DISCUSSION / PENDING DECISIONS

### D1. Leave vs Detail Conflict

**Scenario:** Staff has approved leave on date X, but is being assigned a detail slot on the same date.

**Current Behavior:**
- Sign-off is allowed (warning shown, not blocked)
- Staff ends up with both leave and detail on same date

**Options to Resolve:**
1. **Auto-cancel leave** when detail is assigned (system handles)
2. **Show conflict report** for manual resolution by supervisor
3. **Block booking from Slate side** if staff has leave on that date
4. **Mark as "Leave Cancelled"** in leave tracking when detail assigned

**Decision:** TBD

---

### D2. Partial Sign-off Custom Slot

**Scenario:** LP+ALP return together. LP wants slot 18:00, ALP wants custom slot 20:00.

**Current Workflow:**
1. Manual Entry → Sign off ALP with 20:00
2. Click card → LP available, ALP shows "already assigned"
3. Sign off LP normally

**Alternative Enhancement:** Add "Independent Slots" checkbox to allow different slot times in single submission.

**Decision:** Keep current 2-step workflow for now. Revisit if needed.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ⏳ | Pending |
| ✅ | Passed |
| ❌ | Failed |
| ⚠️ | Passed with issues |
| ➖ | Skipped |

---

*Last Updated: 2026-03-05*
