# Staff Biodata Bulk Upload - Excel Template Structure

## Overview
This document describes the exact structure for the Excel template used for bulk staff biodata import.

---

## Sheet 1: STAFF_MASTER (Mandatory)

### Column Headers (37 columns - Row 1):
```
hrms_id | original_cms_id | current_cms_id | current_office_code | home_office_code | designation_id | current_cli_id | name | pf_number | date_of_birth | date_of_appointment | reporting_date | hq_station | dept_rrb | present_address | permanent_address | cug_number | phone_number | fathers_name | qualification | caste | email | pan_card_no | vision | gender | aadhar_card_no | marital_status | identification_mark_1 | identification_mark_2 | blood_group | id_card_no | safety_category | assignment_status | current_assignment_start_date | status
```

### Sample Data Rows:
```
HRMS001 | CMS12345 | CMS12345 | CSMT-SUB | CSMT-SUB | 1 | 1 | Rajesh Kumar Sharma | 12345678 | 15/03/1985 | 01/06/2010 | 05/06/2010 | CSMT | RRB Mumbai | 123 Palm Road Dadar Mumbai 400028 | 456 Station Road Thane 400601 | 9876543210 | 022-22334455 | Mohan Sharma | B.E. Mechanical | GEN | rajesh@railway.in | ABCDE1234F | Normal | Male | 123456789012 | Married | Mole on left cheek | Scar on right hand | O+ | ID12345 | A | permanent | 01/06/2010 | Active

HRMS002 | CMS12346 | CMS12346 | PNVL-SUB | PNVL-SUB | 2 | 2 | Priya Deshmukh | 12345679 | 22/07/1990 | 10/04/2015 | 15/04/2015 | PNVL | RRB Mumbai | 789 Hill View Panvel 410206 | 789 Hill View Panvel 410206 | 9876543211 | 022-27401234 | Prakash Deshmukh | Diploma Electrical | OBC | priya@railway.in | BCDEF2345G | NV | Female | 234567890123 | Married | Mole on right shoulder | None | A+ | ID12346 | B | permanent | 10/04/2015 | Active
```

---

## Sheet 2: TRAINING_RECORDS (Optional)

### Column Headers (6 columns):
```
hrms_id | training_id | due_date | completion_date | status | remarks
```

### Sample Data:
```
HRMS001 | 1 | 15/10/2025 | 20/09/2025 | Completed | PME completed at CSMT medical center
HRMS001 | 2 | 01/03/2026 |  | Pending | Safety training scheduled
HRMS002 | 1 | 30/11/2025 |  | Pending | PME due - reminder sent
```

---

## Sheet 3: PERSONNEL_STORES (Optional)

### Column Headers (7 columns):
```
hrms_id | item_id | issue_date | return_date | quantity | status | remarks
```

### Sample Data:
```
HRMS001 | 5 | 15/01/2024 |  | 1 | Issued | Safety helmet - yellow
HRMS001 | 12 | 15/01/2024 | 01/09/2025 | 1 | Returned | Old uniform set
HRMS002 | 5 | 10/02/2024 |  | 1 | Issued | Safety helmet
```

---

## Sheet 4: AWARDS (Optional)

### Column Headers (7 columns):
```
hrms_id | award_name | award_date | issued_by | description | remarks | created_by
```

### Sample Data:
```
HRMS001 | Best Performer 2024 | 15/08/2024 | DRM BB | Outstanding service record | Annual award | admin
HRMS003 | Safety Excellence Award | 25/12/2024 | DRM BB | Zero accidents in 2024 |  | admin
```

---

## Sheet 5: PUNISHMENTS (Optional)

### Column Headers (8 columns):
```
hrms_id | punishment_type | punishment_date | severity | description | issued_by | remarks | created_by
```

### Sample Data:
```
HRMS005 | Late Attendance | 10/06/2024 | Minor | Late to duty 3 times in June | Supervisor | Warning issued | admin
HRMS007 | Safety Violation | 20/08/2024 | Major | Not wearing safety equipment | Inspector | Final warning | admin
```

---

## Sheet 6: TRANSFER_REQUESTS (Optional)

### Column Headers (6 columns):
```
hrms_id | from_office_code | to_office_code | request_date | status | remarks
```

### Sample Data:
```
HRMS002 | CSMT-SUB | PNVL-SUB | 10/05/2024 | Approved | Family reasons
HRMS006 | PNVL-SUB | CSMT-SUB | 01/09/2024 | Pending | Hardship case
```

---

## Sheet 7: REFERENCE_DATA (Helper - Not Processed)

### Table 1: Valid Offices
```
office_code | office_name | type
CSMT-SUB | CSMT Suburban | Suburban
PNVL-SUB | Panvel Suburban | Suburban
KYN-SUB | Kalyan Suburban | Suburban
CSMT-ML | CSMT Mainline | Mainline
PNVL-ML | Panvel Mainline | Mainline
KYN-ML | Kalyan Mainline | Mainline
NRL | Neral | Station
LNL | Lonavala | Station
IGP | Igatpuri | Station
CLA | Kurla | Station
```

### Table 2: Valid Designations
```
designation_id | designation_name
1 | Loco Pilot
2 | Assistant Loco Pilot
3 | Shunting Staff
```

### Table 3: Training Types
```
training_id | training_name | validity_years
1 | PME (Periodic Medical Examination) | 1.0
2 | Safety Training | 2.0
3 | Fire Safety | 3.0
```

### Table 4: ENUM Values Reference

**Caste:** GEN, OBC, SC, ST

**Vision:** Normal, NV (Near Vision), DV (Distant Vision), Both

**Gender:** Male, Female, Other

**Marital Status:** Married, Unmarried

**Safety Category:** A, B, C

**Assignment Status:** permanent, officiating, transferred

**Status:** Active, Transferred, Retired, Suspended, Promoted to CLI, Medically Decategorised

**Punishment Severity:** Minor, Major, Severe

**Training Status:** Completed, Pending, Overdue

**Personnel Store Status:** Issued, Returned

**Transfer Status:** Pending, Approved, Rejected

---

## Instructions for Creating Excel Template:

1. Create new Excel workbook
2. Create 7 sheets with names exactly as shown above
3. Add column headers in Row 1 (bold, background color)
4. Add sample data in rows 2-3
5. Freeze first row (View → Freeze Panes → Freeze Top Row)
6. Add data validation for ENUM columns:
   - Select cells in column
   - Data → Data Validation → List
   - Enter comma-separated values
7. Format date columns as "DD/MM/YYYY"
8. Add instructions/notes in REFERENCE_DATA sheet
9. Save as: staff_biodata_bulk_upload_template.xlsx

---

## Date Format: DD/MM/YYYY
All date fields must use Indian date format: DD/MM/YYYY
Examples:
- 15/03/1985
- 01/06/2010
- 30/11/2025

---

## Required Fields:
Only 2 fields are mandatory:
- hrms_id (Primary Key)
- name (Staff name)

All other fields are optional but recommended for complete biodata.
