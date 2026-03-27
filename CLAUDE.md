# Project Memory - BBTRO

## Local Database Credentials
- **Database**: bbtro
- **User**: jay
- **Password**: 4310jay
- **Host**: localhost (default)

### Quick Commands
```bash
# Connect to MySQL
mysql -u jay -p4310jay bbtro

# Run SQL file
mysql -u jay -p4310jay bbtro < sql/filename.sql
```

## Project Info
- Division portal for railway operations (BB Division)
- Node.js + Express backend
- MySQL database
- Frontend: Static HTML with vanilla JS

## Training Letters Module

### Tables
- `div_training_types` - Master list (training_id, training_code, training_name)
- `div_training_records` - Actual training history (staff_hrms_id, training_id, done_date)
- `div_training_letters` - Letter metadata we create
- `div_training_letter_staff` - Staff assigned to each letter

### Course Type → Training ID Mapping
| Course Type | training_id | training_code | Notes |
|-------------|-------------|---------------|-------|
| ONE_DAY_INTENSIVE | 5 | AUTOMATIC | |
| REFRESHER | 26 | MMPRC | Official 3-year refresher |
| MEMU_INITIAL | 17 | MEMU | |
| MEMU_REFRESHER | 17 | MEMU | |
| OTHERS | null | - | Ad-hoc, no tracking |

### TODO / Notes
- **Training record update**: Do NOT update `div_training_records` when letter is prepared. Only update when training centre marks staff as "completed".
- **OTHERS type**: For informal refresher when staff completed training but hasn't worked on certain rakes for a while. Does NOT update `div_training_types` or `div_training_records`. User enters custom subject. Letter history only.
