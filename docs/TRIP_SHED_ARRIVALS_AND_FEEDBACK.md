# Trip Shed — arrival board (shed logs arrivals as they come) and SSE feedback

Recorded 23 October 2026 from the user's description and the first feedback of the VVH SSE after
the module went live on prod that day. Status: requirements + proposed design, not yet approved.

## 1. How the shed actually works

- Locos arrive through the day; the shed wants to **log each arrival as it comes**.
- **SLAM** (the railway's central application) is updated at the end of the day or the next day,
  after all work is over, and carries the work detail (purpose, defect, action, area checks, out
  time). So SLAM is the *record of work*, the shed's own log is the *record of arrival*.
- The best person to log an arrival is the **shunter / LPS who brings the loco** or the **lobby
  in-charge**, from a phone. Hence a mobile-first page, installable (PWA), like `/cli`.

## 2. Arrival board — the page the user described

One page per day: **all trains of the day listed in arrival-time order**, split into three shift
bands with borders and colours:

| Band | Hours |
|---|---|
| Night | 00:00 – 07:59 |
| Day | 08:00 – 15:59 |
| Evening | 16:00 – 23:59 |

Per train row:

| Field | Source / rule |
|---|---|
| Train, name, from, scheduled arrival at LTT / DR | link master UP workings (run days) + train master + WTT halts — **all UP arrivals at the shed's stations, not only the TI list**; TI-list trains carry a TI badge |
| Loco number | pre-filled from the Control Office daily sheet when the LPC has entered it; **editable by the shed** because the person who brings the loco knows it best |
| Shed arrival time | typed by the shed (defaults to now) |
| Platform the loco was brought from | column in the table now; shown in the UI later if the officer agrees |
| Brought by | LPS, chosen by CMS id or name search (see open point 2) |

Entering a loco number opens the **loco details window** (as on the Control Office page): base
shed, loco type, commissioned date, status, last schedule type and date (IA / IB / IC / IOH / TOH /
POH), current schedule due, sick status. The shed may **update last schedule type and date**.

The board **populates the day's arrivals table** and feeds the display pages: locos available in
the shed now, expected locos of the day, and the dashboard tiles. The technician / SSE can then
**mark a loco sick** (shed is the authority; Control Office marks only when the shed says so).

### Proposed design (for approval)

1. **One register, two sources.** A hand-logged arrival creates a row in the existing SLAM
   register `div_trip_loco_movements` with `source='SHED'` (new column), `received_at` = shed
   arrival time, purpose unknown until SLAM. The end-of-day **SLAM import matches** a staged row to
   a shed-logged visit of the same loco on the same day (received time within a tolerance, say
   6 hours) and **enriches it** (purpose, defect, action, checks, out time, `source='SLAM'`)
   instead of creating a second visit. Unmatched SLAM rows are inserted as today. New nullable
   columns on the register: `arrival_train_no`, `platform`, `brought_by_staff_id`,
   `brought_by_name`, `brought_by_cms_id`, `source`, `logged_by`, `logged_at`.
2. **Arrival board page** `/div/trip-shed-arrivals.html` (or a PWA route under `/div/trip-shed/`):
   date, three colour bands, rows as above, a row for an unscheduled / special arrival ("other
   train"), tap-to-fill loco, loco details sheet, mark-sick action for supervisors.
3. **Loco details** endpoint in the trip-shed API, read from `div_locos` + `div_loco_sick_records`
   (same fields as Control Office's autofill plus `commission_date`, `last_sched_type`,
   `last_sched_date`). Update of last schedule type/date by the shed: see open point 1.
4. **Mark sick / mark fit** from the shed: writes `div_loco_sick_records` with `sick_at_shed` =
   shed code and `sicked_by` = user (decision already taken 21 October).
5. **PWA**: manifest + service worker for the arrival board only, so the shunter can install it on
   a phone; the rest of the module stays a normal web page.

### Open points that need the user's decision

1. **Writing Control Office data.** The handover rule is "Trip Shed must never change loco
   links/assignments", and trip-shed roles are view-only in the Control Office module. The user's
   wish "this will update control office page as well" can be met two ways:
   - *(recommended)* the shed's arrival row is shown on the Control Office daily sheet as a
     pre-fill / suggestion for that train and date (Control Office reads the shed table; the LPC
     confirms with one tap);
   - or the shed writes the loco number straight into `div_loco_link_log` for that train and date,
     with an audit trail. This lifts the rule for one field.
   Same question for `div_locos.last_sched_type/date`: shed updates the master directly, or
   proposes and Loco Management confirms.
2. **Who is "brought by".** The shed staff register (`div_trip_shed_staff`) holds SSE / JE / MCM /
   E-F / M-F / Tech / ALS, no LPS or shunter. LPS are lobby crew in `div_staff_master` (CMS id).
   Proposal: search `div_staff_master` for designation LPS/shunter of the VVH lobby by CMS id or
   name, and separately allow a shed staff member (attends at shed) from the shed register.
3. **Matching tolerance** for SLAM-to-shed-log (6 hours proposed) and what to do when the shunter's
   loco number and SLAM's disagree (keep both, flag for the supervisor).

## 3. SSE feedback, 23 October 2026 (first day on prod)

| # | Feedback | Finding | Proposal |
|---|---|---|---|
| 1 | A loco details window like the Control Office page | Control Office has `/loco/:no/autofill` (type, traction, base, HOG, status, schedule, sick). Trip Shed has nothing. | Build it as part of the arrival board (section 2, item 3) and also open it from the inspection header's loco field. |
| 2 | Inspection header: more than one technician and supervisor | Header has single `technician_*` and `supervisor_*` columns. | Child table `div_trip_inspection_staff` (inspection_id, role, staff_id, name, hrms_id, sort); keep the existing columns as the first of each; print lists all. |
| 3 | With GC selected, header fields such as traction converter make, aux converter make are disabled | The make fields come from the 3-phase TI proforma. The approved GC form header has only Date, Loco No, Train No. The **conventional TI** proforma asks *SI Unit/ARNO* and *FDCS* instead of traction/aux converter, and those two fields do not exist in the header yet. | **Decided 23 Oct (officer):** traction converter make and aux converter make are enabled for GC too, optional. **Conventional TI:** add SI Unit/ARNO make and FDCS make (two additive columns), show them for conventional, hide the traction/aux fields there. 3-phase unchanged. |
| 4 | GC checklist shows "—" in the Standard column; TI shows "Checked", "Normal" etc. | The approved GC form (`Final GC FORM_17.08.25.docx`) has only "Items to be checked" and "Remarks" columns; 0 of 33 GC items carry a standard, 148/148 and 163/163 on the TI forms do. | Hide the Standard column for GC (form and print). If the SSE later supplies 33 standard texts, seed them and the column reappears by itself. |
| 5 | A staff roster-making page | Matches dashboard spec item 6 (monthly roster, editable by the in-charge; sample roster promised). | Build after the sample roster arrives: month grid, shifts 00/08, 08/16, 16/24, staff from the shed register, on-duty supervisor read by the dashboard. |

Source forms (not in git): `/Users/neeraja/Desktop/trip_shed_data/Final 3-Phase TI_17.08.25.docx`, `Final Conv TI _17.08.25.doc`, `Final GC FORM_17.08.25.docx`.

## 4. Order proposed

1. Arrival board + loco details + mark sick (section 2) — the shed needs this daily.
2. Feedback 2, 3, 4 (small inspection-form changes).
3. Roster page (feedback 5) once the sample arrives, then the dashboard phase 1 tiles.
4. Checklist review of legacy-font headings, as already deferred.
