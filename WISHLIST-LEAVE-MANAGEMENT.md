# Leave Management - Enhancement Wishlist

## Current Status
The leave management page is functional with:
- Leave entry form with staff search
- KPI cards (Pending, Forwarded, Approved, On Leave Today, Absent, Returning Tomorrow)
- Calendar heatmap with designation filtering
- Submitted leaves list with grouping by designation
- Edit/Approve/Reject/Regularize actions from multiple places
- Absenteeism report section

---

## Proposed Enhancements

### High Priority

| # | Enhancement | Description | Complexity |
|---|-------------|-------------|------------|
| 1 | **Quick filter from KPI** | Click a KPI card to auto-filter submitted list to that status (e.g., click "Pending" card -> show only pending in list) | Low |
| 2 | **Leave type column** | Show CL/EL/LAP/etc. in submitted list for quick reference | Low |
| 3 | **Overdue highlight** | Highlight pending items older than X days (e.g., 3 days) in red/orange | Low |
| 4 | **Search in list** | Add search box to filter submitted list by staff name | Medium |

### Medium Priority

| # | Enhancement | Description | Complexity |
|---|-------------|-------------|------------|
| 5 | **Batch actions** | Select multiple leaves with checkboxes and approve/reject all at once | Medium |
| 6 | **Print/Export** | Export submitted list to PDF or Excel for records | Medium |
| 7 | **Leave balance** | Show remaining CL/EL balance when applying for leave | Medium |
| 8 | **Notification/Alert** | Show count of pending approvals in sidebar badge | Low |

### Future Enhancements

| # | Enhancement | Description | Complexity |
|---|-------------|-------------|------------|
| 9 | **Leave calendar view** | Full calendar view showing all staff leaves (like a Gantt chart) | High |
| 10 | **Auto-forward rules** | Auto-forward to next approver after X days if not actioned | High |
| 11 | **Leave conflict detection** | Warn if too many staff from same designation on leave same day | Medium |
| 12 | **Mobile responsive** | Make page fully responsive for mobile/tablet use | Medium |
| 13 | **Email notifications** | Send email when leave is approved/rejected | High |
| 14 | **Leave policy rules** | Enforce rules like max consecutive days, advance notice period | High |

---

## Bug Fixes Applied

- [x] Timezone issue in calendar counting (used DATE() in SQL)
- [x] formatDateForInput using toISOString caused day shift (fixed to use local date components)
- [x] Edit button date format issue (added formatDateForEdit helper)
- [x] Missing edit buttons in KPI popup and day popup

---

## Related Pages (Pending)

- [ ] Slate entry page (depends on leave data)
- [ ] CTR entry page

---

*Last updated: 2026-01-10*
