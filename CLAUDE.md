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

## Server Details
- **Host**: 93.127.198.125
- **User**: railway

### Quick Commands
```bash
# SCP file to server
scp /path/to/file railway@93.127.198.125:/path/to/destination/

# SSH to server
ssh railway@93.127.198.125
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

## Motormen View (Suburban Portal)

### Background
The `motormen` table was originally a standalone table for suburban portal (wheel movement analysis, reassignment, etc.). It required manual sync with division data and often had stale/outdated records.

### Migration (April 2026)
Replaced the `motormen` table with a **view** that reads from `div_staff_master`. This ensures suburban portal always has current motormen data.

### Current Structure
- `motormen` - **VIEW** (points to div_staff_master)
- `motormen_old` - **TABLE** (backup of original data)

### View Definition
```sql
CREATE VIEW motormen AS
SELECT
    current_cms_id COLLATE utf8mb4_unicode_ci AS cmsid,
    name COLLATE utf8mb4_unicode_ci AS motorman_name,
    cug_number COLLATE utf8mb4_unicode_ci AS mobile_number,
    pf_number COLLATE utf8mb4_unicode_ci AS pf_number,
    hrms_id COLLATE utf8mb4_unicode_ci AS hrms_id,
    CASE
        WHEN current_office_code = 'CSMT-SUB' THEN 'CSMT'
        WHEN current_office_code = 'KYN-SUB' THEN 'KYN'
        WHEN current_office_code = 'PNVL-SUB' THEN 'PNVL'
    END COLLATE utf8mb4_unicode_ci AS office,
    'active' COLLATE utf8mb4_unicode_ci AS status,
    created_at
FROM div_staff_master
WHERE designation_id = 8
  AND current_office_code IN ('CSMT-SUB', 'KYN-SUB', 'PNVL-SUB')
  AND status = 'Active';
```

### Field Mapping
| motormen (view) | div_staff_master |
|-----------------|------------------|
| cmsid | current_cms_id |
| motorman_name | name |
| mobile_number | cug_number |
| pf_number | pf_number |
| hrms_id | hrms_id |
| office | current_office_code (mapped CSMT-SUB→CSMT, etc.) |
| status | Always 'active' (filtered) |
| created_at | created_at |

### Filters Applied
- `designation_id = 8` (motormen only)
- `current_office_code IN ('CSMT-SUB', 'KYN-SUB', 'PNVL-SUB')` (suburban only)
- `status = 'Active'` (active staff only)

### Benefits
- Auto-syncs when div_staff_master is updated
- No dual maintenance
- Transfers/retirements reflected automatically
- Single source of truth

### Used By
- Wheel Movement Analysis
- Detail Reassignment (JFO Console)
- Duty Roster features

### Rollback (if needed)
```sql
DROP VIEW motormen;
RENAME TABLE motormen_old TO motormen;
```

### Convert to Table (if needed later)
```sql
CREATE TABLE motormen_new AS SELECT * FROM motormen;
DROP VIEW motormen;
RENAME TABLE motormen_new TO motormen;
```

## Git Workflow (branch-per-module)

`master` is the always-deployable trunk (it deploys to the server). Several modules
are built in parallel at different readiness levels (AWS, loco-link, signal-book,
control-office, training-letter, transfer-letter). Keep them from tangling:

- **master** = ready/deployable work only. Quick fixes and finished modules land here.
- **One branch per incomplete module**, branched off master: `feature/<module>`
  (e.g. `feature/signal-book`, `feature/training-letter`, `feature/control-office`).

### Rules
1. **One module per branch.** Before every commit, check `git branch --show-current`
   matches the module you're editing — switch first if not. Never mix modules in one branch.
2. **Push with plain `git push`** (repo is set to `push.default=current`, so it pushes the
   CURRENT branch). NEVER run `git push origin master` from a feature branch — it silently
   pushes an unchanged master and strands your commits.
3. **Sync regularly:** on a feature branch run `git fetch && git rebase origin/master`.
   Rebase auto-drops commits already on master (patch-id), keeping the branch = "master + my WIP".
4. **Ship a module:** rebase it on master → `git checkout master && git merge --ff-only
   feature/<module>` → `git push` → deploy → delete the branch.
5. Per-module DB changes: dated `sql/` files travel on the module's branch and deploy on merge
   (every DDL goes into a dated sql/ file).

### Repo git config (already set)
`push.default=current`, `pull.rebase=true`, `branch.autoSetupRebase=always`, `rerere.enabled=true`.

### Cleaning a branch that picked up other modules' commits
`git cherry -v master <branch>` lists unique (`+`) vs already-on-master (`-`) commits;
`git rebase origin/master` then drops the duplicates automatically.
