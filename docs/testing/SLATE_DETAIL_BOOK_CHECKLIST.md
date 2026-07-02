# Test Checklist: Slate & Detail Book Features

**Test Date:** 2026-03-04
**Test Data:** 2026-03-03 slate populated with 96 crews (all ONLINE)

---

## PART 1: DETAIL BOOK TESTS

### 1.1 Returning Crew Cards
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.1.1 | Crews with 5+ hours duty appear | Open Detail Book | Cards show crews who signed on 5+ hours ago | [ ] |
| 1.1.2 | Search/filter works | Type name in search box | Cards filter by name | [ ] |
| 1.1.3 | Search by CMS ID | Type CMS ID | Cards filter by CMS ID | [ ] |
| 1.1.4 | Click card fills form | Click any crew card | Form populates with train, loco, sign-on time | [ ] |
| 1.1.5 | Leave warning shown | If crew has leave | Red warning text on card | [ ] |

### 1.2 Manual Entry Mode
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.2.1 | Toggle manual entry | Click "+ Manual Entry" button | Form switches to manual mode, Off Reason appears | [ ] |
| 1.2.2 | LP search autocomplete | Type LP name (2+ chars) | Dropdown shows matching LPs | [ ] |
| 1.2.3 | ALP search autocomplete | Type ALP name (2+ chars) | Dropdown shows matching ALPs | [ ] |
| 1.2.4 | Night streak indicator | Search LP with high streak | Shows warning icon (3N, 4N+) | [ ] |
| 1.2.5 | Off reason dropdown | Select different reasons | Options: Off/Rest, Off/Leave, Off/Training, Off/PME, Off/Other | [ ] |
| 1.2.6 | Current time display | In manual mode | Shows current time updating | [ ] |

### 1.3 Sign-Off Time & Date
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.3.1 | Sign-off time entry | Enter time in sign-off field | Time accepted in HH:MM format | [ ] |
| 1.3.2 | Sign-off date TODAY | Select "Today" | Uses today's date for sign-off | [ ] |
| 1.3.3 | Sign-off date PREV | Select "Prev" | Uses yesterday's date for sign-off | [ ] |
| 1.3.4 | Pilot checkbox | Check "Pilot" | Ex Station dropdown appears | [ ] |
| 1.3.5 | Pilot ex-station | Select station from dropdown | Station saved (KYN, LNL, PNVL, etc.) | [ ] |

### 1.4 Rest Rules & Slot Calculation
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.4.1 | Normal rest (16hr) | Select "Normal Rest (Min. 16hr)" | Next slot = sign-off + 16 hours | [ ] |
| 1.4.2 | PR rest (30hr) | Select "PR (Min. 30hr) / 1-Day Leave" | Next slot = sign-off + 30 hours | [ ] |
| 1.4.3 | Multi-day leave | Select "Multi-Day Leave" | Slot fields disabled, no assignment | [ ] |
| 1.4.4 | Date selector options | Click LP slot date dropdown | Shows Today, Tomorrow, Day After, Pick Date... | [ ] |
| 1.4.5 | Custom date picker | Select "Pick Date...", choose date | Date picker appears, max 10 days | [ ] |
| 1.4.6 | Slot time auto-calculation | Change sign-off time | Next slot time recalculates | [ ] |
| 1.4.7 | Date label shows day | After calculation | Label shows day name (e.g., "Tomorrow") | [ ] |
| 1.4.8 | LP & ALP independent | Set different rest rules for LP/ALP | Each calculates independently | [ ] |

### 1.5 Staff Warnings (Before Submit)
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.5.1 | Sanctioned leave block | Assign staff with approved leave on slot date | ERROR: Blocks submission | [ ] |
| 1.5.2 | Pending leave warning | Assign staff with pending leave | WARNING shown, allows submit | [ ] |
| 1.5.3 | Night streak 3 warning | Assign staff with 3 night streak | WARNING shown (amber) | [ ] |
| 1.5.4 | Night streak 4+ block | Assign staff with 4+ night streak | ERROR: Blocks submission | [ ] |
| 1.5.5 | Already assigned block | Assign staff already on same date | ERROR: Double booking blocked | [ ] |
| 1.5.6 | PR auto-suggestion | After 6 consecutive duty days | Auto-selects 30hr rest | [ ] |

### 1.6 Slot Collision Detection
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.6.1 | Collision detected | Submit to occupied slot | Modal shows "Slot Collision Detected" | [ ] |
| 1.6.2 | Shows occupied-by name | In collision modal | Displays who occupies the slot | [ ] |
| 1.6.3 | Add Here (Adhoc) | Click "Add Here (Adhoc)" | Creates adhoc entry at same time | [ ] |
| 1.6.4 | Next Slot | Click "Next Slot" | Bumps to next available slot | [ ] |
| 1.6.5 | Cancel | Click "Cancel" | Returns to form, no submission | [ ] |
| 1.6.6 | Next Slot disabled | When no next slot available | Button disabled | [ ] |

### 1.7 SAFE Pending Flow
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.7.1 | SAFE cards appear | After SAFE marked in Slate | Blinking cards appear above crew cards | [ ] |
| 1.7.2 | Click SAFE card | Click the SAFE pending card | Form populates with LP/ALP and sign-off time | [ ] |
| 1.7.3 | Incoming shows SAFE | After clicking SAFE card | Incoming field shows "SAFE" | [ ] |
| 1.7.4 | Submit processes SAFE | Fill rest and submit | SAFE pending cleared, slot assigned | [ ] |
| 1.7.5 | SAFE card disappears | After submission | Card removed from pending section | [ ] |

### 1.8 Availability Forecast Panel
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.8.1 | Date tabs show | On load | 11 date tabs visible (yesterday to +9) | [ ] |
| 1.8.2 | Today highlighted | On load | Today's tab has active/highlight style | [ ] |
| 1.8.3 | Scroll with buttons | Click < or > | Tabs scroll left/right | [ ] |
| 1.8.4 | Keyboard navigation | Press Left/Right arrow | Tabs scroll | [ ] |
| 1.8.5 | Vacancy summary | In panel header | Shows "LP: X \| ALP: Y vacant" | [ ] |
| 1.8.6 | Staff names display | In slot row | LP and ALP names shown | [ ] |
| 1.8.7 | Adhoc border | For adhoc slots | Orange left border | [ ] |
| 1.8.8 | Late arrival display | For late staff | Cyan text with "@ HH:MM" subscript | [ ] |
| 1.8.9 | Exception badge | For AUC/NF staff | Orange AUC or Red NF badge | [ ] |

### 1.9 Incoming Detail Dot
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.9.1 | Dot appears | For staff with incoming detail | Small dot before name | [ ] |
| 1.9.2 | Click dot popup | Click the dot | Shows train, loco, sign-off time | [ ] |
| 1.9.3 | Pilot indicator | If staff was pilot | Popup shows pilot info | [ ] |

### 1.10 Submit & Arrival Processing
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 1.10.1 | Successful submit | Fill form, click Submit | Toast "Arrival processed", form clears | [ ] |
| 1.10.2 | Crew card removed | After submit | Crew disappears from returning cards (0 hours duty now) | [ ] |
| 1.10.3 | Slot assigned | Check forecast panel | Staff appears at assigned slot | [ ] |
| 1.10.4 | Missing sign-off error | Submit without sign-off time | Error message shown | [ ] |
| 1.10.5 | Missing staff error | Submit without LP or ALP | Error: "At least one staff required" | [ ] |

---

## PART 2: SLATE TESTS

### 2.1 Date & Shift Navigation
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.1.1 | Date buttons | Click Yesterday/Today/Tomorrow | Slate loads for selected date | [ ] |
| 2.1.2 | Shift tabs | Click 00-08, 08-16, 16-24 | Displays selected shift | [ ] |
| 2.1.3 | Shift colors | View shift tabs | Blue (night), Green (day), Orange (evening) | [ ] |
| 2.1.4 | Keyboard shift change | Press Left/Right arrows | Shifts change | [ ] |
| 2.1.5 | Current shift default | On load | Shows current shift based on time | [ ] |

### 2.2 Booking Modal
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.2.1 | Open modal | Click on train column | Booking modal opens | [ ] |
| 2.2.2 | Slot info display | Modal header | Shows slot time and date | [ ] |
| 2.2.3 | LP name shown | In modal | LP name displayed with checkbox | [ ] |
| 2.2.4 | ALP dropdown | In modal | Shows ALP from slot + available ALPs | [ ] |
| 2.2.5 | Train number required | Leave empty, click Save | Error: "Train number required" | [ ] |
| 2.2.6 | Save booking | Enter train, save | Booking saved, modal closes, slate refreshes | [ ] |
| 2.2.7 | Pilot checkbox | Check "Pilot" | Pilot flag saved with booking | [ ] |
| 2.2.8 | Loco number | Enter loco | Loco saved (e.g., 21950+22998) | [ ] |
| 2.2.9 | Remarks | Enter remarks | Remarks saved | [ ] |
| 2.2.10 | Close/Cancel | Click Cancel | Modal closes, no save | [ ] |

### 2.3 ALP Selection Modes
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.3.1 | Same slot ALP | Keep default ALP | ALP from same slot booked | [ ] |
| 2.3.2 | Different slot ALP | Select ALP from dropdown | ALP from other slot booked, cross_slot_time saved | [ ] |
| 2.3.3 | Out of Slate | Check "Out of Slate", enter CMS/Name | Manual ALP saved with source=OUT_OF_SLATE | [ ] |
| 2.3.4 | Other Depot | Check "Other Depot", enter details | ALP saved with source=OTHER_DEPOT, depot name | [ ] |
| 2.3.5 | Mutual exclusion | Check Out of Slate then Other Depot | Only one can be active | [ ] |
| 2.3.6 | Original ALP marked | Select ALP from different slot | Original slot's ALP status = BOOKED | [ ] |

### 2.4 Extra ALP Feature
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.4.1 | Extra ALP checkbox | Check "+ Extra ALP" | Extra ALP section appears | [ ] |
| 2.4.2 | Extra ALP dropdown | Click dropdown | Shows available ALPs | [ ] |
| 2.4.3 | Select from slate | Select ALP from dropdown | Extra ALP saved with source=SLATE | [ ] |
| 2.4.4 | Extra Out of Slate | Check Out of Slate, enter details | Extra ALP saved with source=OUT_OF_SLATE | [ ] |
| 2.4.5 | Extra Other Depot | Check Other Depot, enter details | Extra ALP saved with depot name | [ ] |
| 2.4.6 | Original marked BOOKED | Select extra ALP from slate | Their original slot marked BOOKED | [ ] |
| 2.4.7 | Clear clears extra | Clear booking | Extra ALP fields also cleared | [ ] |

### 2.5 SAFE Marking
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.5.1 | SAFE button | Click "SAFE" in modal | SAFE section appears | [ ] |
| 2.5.2 | Sign-off time default | SAFE section shown | Current time pre-filled | [ ] |
| 2.5.3 | Confirm SAFE | Enter time, click "Confirm SAFE" | Status changed to SAFE | [ ] |
| 2.5.4 | Sign-off time required | Click Confirm without time | Error shown | [ ] |
| 2.5.5 | Row shows SAFE | After confirm | Row status indicator shows SAFE | [ ] |
| 2.5.6 | Creates pending | In database | is_safe_pending=TRUE in detail_book_log | [ ] |
| 2.5.7 | Appears in Detail Book | Open Detail Book | SAFE pending card appears | [ ] |

### 2.6 Clear Booking
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.6.1 | Clear button visible | Open modal on booked slot | Clear button shown | [ ] |
| 2.6.2 | Clear works | Click Clear | Train, loco, pilot, remarks cleared | [ ] |
| 2.6.3 | Status reset | After clear | LP/ALP status back to AVAILABLE | [ ] |
| 2.6.4 | ALP source reset | After clear | alp_source reset to SLATE | [ ] |
| 2.6.5 | Extra ALP cleared | After clear | All extra_alp fields cleared | [ ] |

### 2.7 Exception Marking
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.7.1 | Open exception modal | Click on staff name | Exception modal opens | [ ] |
| 2.7.2 | Mark LATE | Select LATE, enter time | Saves with signed_on_at | [ ] |
| 2.7.3 | LATE with detention YES | Select YES detention | Detention remark field appears | [ ] |
| 2.7.4 | LATE with detention NO | Select NO detention | No remark required | [ ] |
| 2.7.5 | Mark AUC | Select AUC | Saves exception=AUC | [ ] |
| 2.7.6 | Mark NF | Select NF | Saves exception=NF | [ ] |
| 2.7.7 | Clear exception | Click Clear | All exception data removed | [ ] |
| 2.7.8 | LATE disables AUC/NF | After marking LATE | AUC/NF options disabled | [ ] |
| 2.7.9 | AUC/NF disables LATE | After marking AUC | LATE option disabled | [ ] |

### 2.8 Status Display
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.8.1 | AVAILABLE row | Empty slot | White/default styling | [ ] |
| 2.8.2 | ONLINE row | Staff on duty | Green indicator | [ ] |
| 2.8.3 | BOOKED row | After booking | Purple background | [ ] |
| 2.8.4 | SAFE row | After SAFE marked | Muted/gray styling | [ ] |
| 2.8.5 | Adhoc row | Adhoc entry | Orange left border | [ ] |
| 2.8.6 | Late arrival text | Staff marked late | Cyan text with @ time | [ ] |
| 2.8.7 | AUC badge | Staff marked AUC | Orange AUC superscript | [ ] |
| 2.8.8 | NF badge | Staff marked NF | Red NF superscript | [ ] |

### 2.9 Vacancy Summary
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.9.1 | Summary displays | In header | "LP: X \| ALP: Y vacant" | [ ] |
| 2.9.2 | Updates on book | After booking | Vacancy count decreases | [ ] |
| 2.9.3 | Updates on clear | After clearing | Vacancy count increases | [ ] |
| 2.9.4 | Per-shift count | Change shifts | Count changes per shift | [ ] |

### 2.10 Auto-Refresh
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 2.10.1 | Auto-refresh works | Wait 30 seconds | Data refreshes automatically | [ ] |
| 2.10.2 | Maintains selection | After refresh | Same date/shift still selected | [ ] |
| 2.10.3 | Time updates | In display mode | Header time updates every second | [ ] |

---

## PART 3: INTEGRATION TESTS

### 3.1 Detail Book → Slate Flow
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 3.1.1 | Nav link works | Click "Slate →" in Detail Book header | Opens Slate page | [ ] |
| 3.1.2 | Arrival updates slate | Submit arrival in Detail Book | Staff appears in Slate at assigned slot | [ ] |
| 3.1.3 | Crew removed | After arrival | Crew no longer in returning cards | [ ] |

### 3.2 Slate → Detail Book Flow
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 3.2.1 | Nav link works | Click "← Detail Book" in Slate header | Opens Detail Book page | [ ] |
| 3.2.2 | SAFE pending flow | Mark SAFE in Slate | Appears in Detail Book as blinking card | [ ] |
| 3.2.3 | SAFE processed | Click and submit in Detail Book | Staff assigned to new slot | [ ] |

### 3.3 Status Transitions
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 3.3.1 | ONLINE → BOOKED | Give booking to ONLINE crew | Status changes to BOOKED | [ ] |
| 3.3.2 | AVAILABLE → BOOKED | Give booking | Status changes to BOOKED | [ ] |
| 3.3.3 | BOOKED → AVAILABLE | Clear booking | Status resets to AVAILABLE | [ ] |
| 3.3.4 | Any → SAFE | Mark SAFE | Status changes to SAFE | [ ] |

### 3.4 Data Persistence
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 3.4.1 | Booking persists | Book, refresh page | Booking data still there | [ ] |
| 3.4.2 | Exception persists | Mark exception, refresh | Exception data still there | [ ] |
| 3.4.3 | Arrival logged | Submit arrival | Entry in div_detail_book_log | [ ] |
| 3.4.4 | Slot linked to log | Check database | lp_detail_book_id populated | [ ] |

---

## PART 4: EDGE CASES

### 4.1 Boundary Conditions
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 4.1.1 | Late slot (23:45) | Assign to 23:45 slot | Rolls over to next day correctly | [ ] |
| 4.1.2 | Cross-midnight sign-off | Sign-off at 00:30 | Date handled correctly | [ ] |
| 4.1.3 | Max date (10 days) | Pick date 11 days ahead | Should be blocked or limited | [ ] |
| 4.1.4 | Same staff both LP/ALP | Try to assign same person | Should be prevented | [ ] |
| 4.1.5 | Empty slot booking | Try to book slot with no staff | Appropriate error | [ ] |

### 4.2 Error Handling
| # | Test | Steps | Expected | Pass |
|---|------|-------|----------|------|
| 4.2.1 | Network error | Disconnect network, try action | Error toast shown | [ ] |
| 4.2.2 | Invalid time format | Enter bad time | Validation error | [ ] |
| 4.2.3 | Server error | Trigger 500 error | Error message displayed | [ ] |
| 4.2.4 | Concurrent edit | Edit same slot from 2 browsers | Conflict handled | [ ] |

---

## NOTES

**Test Environment:**
- Server: localhost:3000
- Office Code: PNVL-ML
- Database: bbtro

**Test Data Created:**
- 96 slots for 2026-03-03 (all shifts)
- All slots have LP + ALP assigned
- All marked as ONLINE with train numbers

**Test URLs:**
- Detail Book: http://localhost:3000/div/detail-book.html
- Slate: http://localhost:3000/div/slate.html
- Slate Display Mode: http://localhost:3000/div/slate.html?display=1

---

**Tester:** _________________
**Date Completed:** _________________
**Overall Result:** [ ] PASS  [ ] FAIL
**Issues Found:** _________________
