# Staff Identifier Correction (div_staff_master + related tables)

**Date:** 2026-06-10
**Status:** hrms_id SQL ready — run on server via MySQL Workbench
**Migration file:** `sql/2026-06-10_staff_hrms_id_correction.sql`

A reusable playbook for correcting a staff **hrms_id** (done now) or
**current_cms_id** (reference only, for when the need arises).

---

## 1. Current task — hrms_id correction

Two staff were entered with the **wrong hrms_id**. Because `hrms_id` is the
**primary key** of `div_staff_master` and the staff foreign key across many
tables, the wrong value has propagated and must be corrected everywhere.

| Staff name        | current_cms_id | Wrong hrms_id | Correct hrms_id |
|-------------------|----------------|---------------|-----------------|
| Manoj Kumar Singh | KYN5711        | `PMQHDW`      | `PMQHOW`        |
| SUBODH KUMAR      | IGP2588        | `ZWIGKE`      | `ZWIGLE`        |

### Requirements
1. **Change `hrms_id`** in `div_staff_master` and all related tables. — *done (SQL ready)*
2. **Change `current_cms_id`** — *not needed now*; cms values stay KYN5711 / IGP2588.
   Section 3 below is the ready reference for if/when a cms correction is needed.

### Key constraint (why it's not a plain UPDATE)
`hrms_id` is the **PRIMARY KEY** of `div_staff_master`, referenced by **19 FKs,
all `ON UPDATE NO ACTION`** → a direct UPDATE (parent- or child-first) is
**rejected**. The migration runs inside a transaction with
`FOREIGN_KEY_CHECKS = 0`, updates parent + children together, re-enables checks,
verifies, then `COMMIT`. `motormen` is a **VIEW** → updates automatically.

### Server may have more tables than local — how the SQL handles it
> **Local has 6 tables with these ids; the live server may have more.** The SQL
> does **not** rely on the local list. It is built in steps:
>
> - **STEP 1 – Discovery:** scans **every** base-table `*hrms*` column in the
>   *live* schema and lists which actually hold `PMQHDW`/`ZWIGKE`. Run this first
>   to confirm the real footprint on the server.
> - **STEP 2 – Apply:** updates **every** base-table `*hrms*` column (46 columns).
>   Tables with 0 matching rows are untouched (harmless). This covers any table
>   present in the schema, not just the local 6.
> - **STEP 3 – Fallback generator:** if STEP 1 shows a table not in STEP 2 (a
>   server-only table), regenerates the complete UPDATE list from the live schema.
> - **Verify:** re-run STEP 1 — it must return 0 rows before `COMMIT`.

Tables that hold the old ids in **local** (verified 2026-06-10): `div_staff_master`
(PK, 2), `div_cli_nominations` (2), `div_ctr_duties` (21), `div_lrd_segment_coverage`
(63), `div_training_records` (5), `motormen_old` (1, backup).

---

## 2. How to run (server)
1. Open `sql/2026-06-10_staff_hrms_id_correction.sql` in MySQL Workbench.
2. **STEP 0** — confirm the two staff/old ids.
3. **STEP 1** — discovery; note which tables hold the ids on the server.
4. **STEP 2** — run the FK-off transaction block.
5. Re-run **STEP 1** → must be 0 rows; run AFTER select → `PMQHOW` + `ZWIGLE`
   present, old ids gone. `COMMIT;` (else `ROLLBACK;`).
6. Only if STEP 1 had revealed an uncovered table → use **STEP 3** to regenerate.

---

## 3. Reference — current_cms_id correction (for future use)

When a staff's **cms id** is wrong, the fix mirrors the hrms one, with two
differences:
- `current_cms_id` is **NOT a primary key / not FK-referenced** → **no
  `FOREIGN_KEY_CHECKS` toggle needed**. Plain UPDATEs in a transaction.
- A staff's cms id appears under **different column names by role** (driver/cli/
  motorman/lp/alp). Update wherever the OLD cms value appears.

### cms-keyed base tables to update (verified 2026-06-10)
| Table | Column | Note |
|-------|--------|------|
| `div_staff_master` | `current_cms_id` | the master value |
| `div_staff_master` | `original_cms_id` | historical — usually leave as-is |
| `div_cli_master` | `cmsid` | when staff is a CLI |
| `div_ctr_duties` | `staff_cms_id` | |
| `div_lrd_status` | `staff_cms_id` | |
| `div_midnight_position_staff` | `staff_cms_id` | |
| `div_runsafe_sessions` | `staff_cms_id`, `cli_cms_id` | |
| `div_mainline_spm_runs` | `driver_cms_id` | |
| `div_sub_spm_runs` | `motorman_cms_id`, `nom_cli_cms_id`, `done_by_cli_cms_id` | |
| `div_transfer_history` | `from_cms_id`, `to_cms_id` | |
| `div_transfer_requests` | `current_cms_id`, `proposed_cms_id` | |
| `div_tw_detail` | `lp_cms_id` | |
| `reassignment_history` | `original_motorman_cmsid`, `new_motorman_cmsid` | |
| `motormen_old` | `cmsid` | backup table |

Views (`motormen`, `v_active_crews`, `v_fatigue_warnings`, `v_pilot_report`,
`v_runsafe_history`, `v_runsafe_weak_areas`, `v_training_letter_staff`) read from
base tables → **no update needed**.

cms columns have **no unique index and no FK**, so no `FOREIGN_KEY_CHECKS` toggle
and no transaction-lock concerns. Two methods, pick by what you know:

### Method A — hrms-anchored (preferred when you know the staff's hrms_id)
Use when correcting a staff's **identity cms** (e.g. a stuck `_TEMP_SWAP_` swap
placeholder, or any single-staff cms fix). Anchor every update on the (now
correct, unique) `hrms_id` and write only the staff's **own** cms columns. Each
statement touches only that staff's rows; tables where they have no rows are
harmless 0-row no-ops, so it's server-complete and needs no knowledge of the old
cms value.

Own-cms columns to set, with their hrms anchor:

| Table | cms column ← | hrms anchor |
|-------|--------------|-------------|
| `div_staff_master` | `current_cms_id` | `hrms_id` |
| `div_ctr_duties` | `staff_cms_id` | `staff_hrms_id` |
| `div_lrd_status` | `staff_cms_id` | `staff_hrms_id` |
| `div_midnight_position_staff` | `staff_cms_id` | `staff_hrms_id` |
| `div_runsafe_sessions` | `staff_cms_id` | `staff_hrms_id` |
| `div_sub_spm_runs` | `motorman_cms_id` | `motorman_hrms_id` |
| `div_tw_detail` | `lp_cms_id` | `lp_hrms_id` |
| `div_transfer_requests` | `current_cms_id` | `staff_hrms_id` |
| `div_cli_master` | `cmsid` | `cli_hrms_id` |
| `motormen_old` | `cmsid` | `hrms_id` |

**Do NOT** touch (different person / historical / proposed): `original_cms_id`,
`div_transfer_history.from_cms_id`/`to_cms_id`, `*.cli_cms_id`,
`nom_cli_cms_id`, `done_by_cli_cms_id`, `proposed_cms_id`. Tables with **no hrms
column** (`div_mainline_spm_runs.driver_cms_id`, `reassignment_history`) can't be
anchored this way — fix them via Method B only if the staff has rows there.

```sql
-- one line per own-cms column, e.g.:
UPDATE div_staff_master SET current_cms_id='NEW_CMS' WHERE hrms_id='HRMS';
UPDATE div_ctr_duties   SET staff_cms_id='NEW_CMS'   WHERE staff_hrms_id='HRMS';
-- ...etc (autocommit, no transaction needed)
```

### Method B — value-based (when you only know the bare/old cms value)
Use for a **malformed id correction** (e.g. a cms entered without its office
prefix: `5341 → PNVL5341`). The bad value IS this person's cms wherever it
appears, so rename it across **every** cms column (own + other-person +
historical) — that's correct here, it's the same identity being fixed.

First **discovery** (confirm the value maps to one person, no surprises):
```sql
SET SESSION group_concat_max_len = 1000000;
SET @sql = NULL;
SELECT GROUP_CONCAT(
  CONCAT('SELECT ''', TABLE_NAME, ''' AS tbl, ''', COLUMN_NAME,
         ''' AS col, COUNT(*) AS n FROM `', TABLE_NAME,
         '` WHERE `', COLUMN_NAME, '` = ''OLD_CMS''')   -- <-- set OLD_CMS
  SEPARATOR ' UNION ALL ')
INTO @sql
FROM information_schema.COLUMNS c
JOIN information_schema.TABLES t USING (TABLE_SCHEMA, TABLE_NAME)
WHERE c.TABLE_SCHEMA = DATABASE() AND t.TABLE_TYPE = 'BASE TABLE'
  AND (c.COLUMN_NAME LIKE '%cms_id%' OR c.COLUMN_NAME LIKE '%cmsid%')
  AND c.COLUMN_NAME <> 'unmapped_cms_ids';
SET @sql = CONCAT('SELECT * FROM (', @sql, ') x WHERE n > 0 ORDER BY tbl');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
```
Then **generate** the updates (one statement per cms column, exact-match rename):
```sql
SELECT CONCAT('UPDATE `', TABLE_NAME, '` SET `', COLUMN_NAME,
              '` = ''NEW_CMS'' WHERE `', COLUMN_NAME, '` = ''OLD_CMS'';')
FROM information_schema.COLUMNS c
JOIN information_schema.TABLES t USING (TABLE_SCHEMA, TABLE_NAME)
WHERE c.TABLE_SCHEMA = DATABASE() AND t.TABLE_TYPE = 'BASE TABLE'
  AND (c.COLUMN_NAME LIKE '%cms_id%' OR c.COLUMN_NAME LIKE '%cmsid%')
  AND c.COLUMN_NAME <> 'unmapped_cms_ids'
ORDER BY TABLE_NAME, COLUMN_NAME;
```
(`unmapped_cms_ids` is a free-text list column — left out of both.)

## 4. Wrong staff selected during a transfer

Use this procedure when two real employees have similar names and a transfer is
completed against the wrong `hrms_id`. This is **not** an hrms-id correction and
the two staff records must not be merged or deleted.

Typical symptoms:

- the intended employee remains at the old office/cms;
- another employee receives the new office/cms;
- `div_transfer_requests` and `div_transfer_history` point to the wrong employee;
- some biodata fields on the wrong employee may also have been overwritten with
  the intended employee's values.

### Establish the two identities first

Compare both complete `div_staff_master` rows and the holder of the destination
cms. Names alone are not proof. Use HRMS/official records to compare `hrms_id`,
PF number, DOB, appointment date, designation and PAN.

```sql
SELECT *
FROM div_staff_master
WHERE hrms_id IN ('INTENDED_HRMS', 'WRONG_HRMS')
   OR current_cms_id = 'DESTINATION_CMS'
ORDER BY hrms_id;

SELECT * FROM div_transfer_requests
WHERE staff_hrms_id IN ('INTENDED_HRMS', 'WRONG_HRMS')
   OR current_cms_id = 'DESTINATION_CMS'
   OR proposed_cms_id = 'DESTINATION_CMS';

SELECT * FROM div_transfer_history
WHERE staff_hrms_id IN ('INTENDED_HRMS', 'WRONG_HRMS')
   OR from_cms_id = 'DESTINATION_CMS'
   OR to_cms_id = 'DESTINATION_CMS';
```

The last valid transfer for the wrongly selected employee is normally the safe
source for that employee's pre-error `current_cms_id` and office. It is not a
source for biodata.

### Check for operational records before reassigning the transfer

Inspect records from the erroneous transfer's effective/reporting date onward
for **both** hrms ids. At minimum check `div_ctr_duties`,
`div_cli_nominations`, `div_lrd_segment_coverage`, `div_lrd_status`,
`div_midnight_position_staff`, `div_runsafe_sessions`, `div_sub_spm_runs`,
`div_training_records`, `div_daily_slate` (LP/ALP/extra ALP) and
`div_detail_book_log` (LP/ALP).

Run these as separate SELECTs. A large `UNION ALL` can fail with **Error 1271**
because legacy tables use different collations. Date columns also differ:
`div_ctr_duties.duty_date`, `div_lrd_segment_coverage.last_worked_date`,
`div_daily_slate.slot_date`, `div_detail_book_log.shift_date`,
`div_runsafe_sessions.started_at` and `div_sub_spm_runs.date_of_working`.

- If all result sets are empty, only master + transfer rows need correction.
- If rows exist, decide row-by-row whether they describe work actually done by
  the intended employee. Never move all rows merely because they are dated
  after the transfer.

### Transaction template

Replace every placeholder and retain the guards. The wrong employee is restored
to their last confirmed position; the intended employee receives the new one.
Only the erroneous request/history rows are re-anchored.

```sql
START TRANSACTION;

UPDATE div_staff_master
SET current_cms_id = 'WRONG_STAFF_PREVIOUS_CMS',
    current_office_code = 'WRONG_STAFF_PREVIOUS_OFFICE',
    home_office_code = 'WRONG_STAFF_PREVIOUS_OFFICE',
    hq_station = 'WRONG_STAFF_PREVIOUS_OFFICE'
WHERE hrms_id = 'WRONG_HRMS'
  AND current_cms_id = 'DESTINATION_CMS'
  AND current_office_code = 'DESTINATION_OFFICE';

UPDATE div_staff_master
SET current_cms_id = 'DESTINATION_CMS',
    current_office_code = 'DESTINATION_OFFICE',
    home_office_code = 'DESTINATION_OFFICE',
    hq_station = 'DESTINATION_OFFICE'
WHERE hrms_id = 'INTENDED_HRMS'
  AND current_cms_id = 'INTENDED_PREVIOUS_CMS'
  AND current_office_code = 'INTENDED_PREVIOUS_OFFICE';

UPDATE div_transfer_requests
SET staff_hrms_id = 'INTENDED_HRMS',
    current_cms_id = 'INTENDED_PREVIOUS_CMS'
WHERE request_id = ERRONEOUS_REQUEST_ID
  AND staff_hrms_id = 'WRONG_HRMS'
  AND current_cms_id = 'WRONG_STAFF_PREVIOUS_CMS'
  AND proposed_cms_id = 'DESTINATION_CMS';

UPDATE div_transfer_history
SET staff_hrms_id = 'INTENDED_HRMS',
    from_cms_id = 'INTENDED_PREVIOUS_CMS'
WHERE transfer_id = ERRONEOUS_HISTORY_ID
  AND staff_hrms_id = 'WRONG_HRMS'
  AND from_cms_id = 'WRONG_STAFF_PREVIOUS_CMS'
  AND to_cms_id = 'DESTINATION_CMS';
```

Each UPDATE must affect exactly one row. Verify both master rows and the exact
request/history ids before `COMMIT`; otherwise `ROLLBACK`.

### Biodata is a separate correction

A transfer rollback restores posting fields only. If PF number, DOB,
appointment date, designation, PAN, father name, contact details or identifying
marks were copied between the two employees, restore each field from the HRMS
portal or another official source. Do not infer biodata from the other employee,
transfer history or a similar name. A backup table may be checked, but an empty
backup is not permission to guess.

Afterward, verify both identities together:

```sql
SELECT hrms_id, name, current_cms_id, current_office_code, designation_id,
       pf_number, date_of_birth, date_of_appointment, fathers_name, pan_card_no
FROM div_staff_master
WHERE hrms_id IN ('INTENDED_HRMS', 'WRONG_HRMS')
ORDER BY hrms_id;
```

### Workbench transaction caution

Execute only the intended selection. Old statements left in the editor can
produce unrelated errors (`1243`, `1054`, `1271`) while the transaction remains
open. After any error, verify `@@session.in_transaction`; do not assume that a
later syntax error rolled back successful earlier UPDATEs. Verify the rows, then
explicitly `COMMIT` or `ROLLBACK`.

## 5. Reference — every hrms-keyed table/column (schema as of 2026-07-16)

The complete checklist for an hrms_id correction: 47 columns across 37 base
tables. Update ALL of them inside the FK-off transaction (0-row tables are
harmless no-ops). Regenerate this list against the live schema with:
`SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS c JOIN
information_schema.TABLES t USING (TABLE_SCHEMA, TABLE_NAME) WHERE
c.TABLE_SCHEMA = DATABASE() AND t.TABLE_TYPE='BASE TABLE' AND c.COLUMN_NAME
LIKE '%hrms%';`

| Table | hrms column(s) |
|-------|----------------|
| `div_adas_reports` † | `cli_hrms_id`, `mman_hrms_id` |
| `div_aws_events` | `staff_hrms_id` |
| `div_category_change_history` | `staff_hrms_id` |
| `div_cli_master` | `cli_hrms_id` |
| `div_cli_nominations` | `staff_hrms_id` |
| `div_ctr_duties` | `staff_hrms_id` |
| `div_cvvrs_reports` † | `alp_hrms_id`, `cli_hrms_id`, `lp_hrms_id` |
| `div_daily_slate` | `alp_hrms_id`, `extra_alp_hrms_id`, `lp_hrms_id` |
| `div_detail_book_log` | `alp_hrms_id`, `lp_hrms_id` |
| `div_detonator_usage_log` | `staff_hrms_id` |
| `div_family_members` | `staff_hrms_id` |
| `div_leave_tracking` | `staff_hrms_id` |
| `div_lrd_segment_coverage` | `staff_hrms_id` |
| `div_lrd_status` | `staff_hrms_id` |
| `div_midnight_position_staff` | `staff_hrms_id` |
| `div_promotion_history` | `staff_hrms_id` |
| `div_rtis_analyses` | `alp_hrms_id`, `lp_hrms_id` |
| `div_rtis_braking_runs` | `alp_hrms_id`, `lp_hrms_id` |
| `div_rtis_daily_entries` | `alp_hrms_id`, `lp_hrms_id` |
| `div_rtis_violations` | `alp_hrms_id`, `lp_hrms_id` |
| `div_runsafe_dev_plans` | `staff_hrms_id` |
| `div_runsafe_sessions` | `staff_hrms_id` |
| `div_staff_awards` | `staff_hrms_id` |
| `div_staff_detonator_stock` | `staff_hrms_id` |
| `div_staff_drafting_records` | `staff_hrms_id` |
| `div_staff_fatigue_tracker` | `hrms_id` |
| `div_staff_master` | `hrms_id` (**PK — the parent**) |
| `div_staff_personnel_stores` | `staff_hrms_id` |
| `div_staff_punishments` | `staff_hrms_id` |
| `div_sub_spm_runs` | `motorman_hrms_id` |
| `div_training_letter_staff` | `staff_hrms_id` |
| `div_training_records` | `staff_hrms_id` |
| `div_transfer_history` | `staff_hrms_id` |
| `div_transfer_letter_staff` | `staff_hrms_id` |
| `div_transfer_requests` | `staff_hrms_id` |
| `div_tw_detail` | `lp_hrms_id` |
| `motormen_old` | `hrms_id` (backup table) |

† LOCAL ONLY as of 2026-07-16 — CVVRS/ADAS schema not deployed to prod yet
(`sql/2026-06-30_cvvrs_adas_schema.sql` pending). Skip on prod until deployed.

Views (`motormen` etc.) read from base tables — never update them.

### Format scan — run after every bulk import
A valid hrms_id is **exactly 6 uppercase letters**. Digits (lookalikes: 2↔Z,
5↔S, 6↔G, 4↔A…), wrong length, spaces, or lowercase are entry defects. Scan:
```sql
SELECT hrms_id, name, current_cms_id, current_office_code, status,
       CASE WHEN LENGTH(hrms_id) <> 6 THEN CONCAT('length ', LENGTH(hrms_id))
            WHEN hrms_id REGEXP '[0-9]' THEN 'contains digit'
            WHEN BINARY hrms_id <> BINARY UPPER(hrms_id) THEN 'lowercase'
            ELSE 'other' END AS problem
FROM div_staff_master
WHERE LENGTH(hrms_id) <> 6 OR hrms_id REGEXP '[^A-Za-z]'
   OR BINARY hrms_id <> BINARY UPPER(hrms_id)
ORDER BY problem, hrms_id;
```
Verify every suspected true id against the HRMS portal (never guess lookalikes),
then batch the fixes through the FK-off method (one CASE-mapped transaction,
BINARY matching so lowercase ids match exactly). 2026-07-17: swept 9 in one run.

### Workbench gotchas (learned 2026-07-16)
- **Error 1243 / NULL @sql**: the dynamic PREPARE-based discovery breaks if the
  block isn't run as one selection. Prefer a static UNION ALL discovery query
  (one `SELECT ... COUNT(*)` per column above, wrapped in
  `SELECT * FROM (...) x WHERE n > 0`).
- **Error 1175 safe update mode**: several hrms columns (daily_slate,
  detail_book_log, rtis_*, tw_detail) are NOT indexed, so Workbench safe mode
  blocks their UPDATEs. Put `SET SQL_SAFE_UPDATES = 0;` inside the transaction
  (restore `= 1` after), alongside `SET FOREIGN_KEY_CHECKS = 0/1`.
- After an errored partial run, `ROLLBACK;` first, then re-run the whole block.

### CLI-run gotchas (learned 2026-09-02)
- **`ssh host "mysql -p ... < file"` fails with Access denied 1045.** No TTY is
  allocated, so `mysql` cannot open `/dev/tty` and reads the password from
  **stdin** — i.e. the first line of your SQL file. Use `ssh -t`, or log in and
  run the `mysql` command there.
- **Never pass `--force`** to a one-shot run: it continues past a tripped guard
  and reaches `COMMIT`.
- A one-shot `mysql < file` run shows the verify SELECTs only *after* it is too
  late to react, so pair the PRE-guard with a **POST-guard** (same 1242
  multi-row-subquery trick) placed immediately before `COMMIT`. On abort the
  connection closes and the transaction rolls back.

## 6. Log of corrections applied (server)
| Date | Field | hrms_id / old cms | → | Method |
|------|-------|-------------------|---|--------|
| 2026-09-16 | wrong staff selected for transfer | Request 1544/history 1418 (2026-06-16, Promotion) moved ATACWQ (RISHIKESH MEENA, KYN3405/KYN-ML) to CSTS2216/CSMT-SUB; the real promotee was EKMSED (RISHIKESH N MEENA, CSMT6172/CSMT-ML) | EKMSED → CSTS2216/CSMT-SUB/desig 8/CLI 1; ATACWQ restored to KYN3405/KYN-ML/desig 5/CLI 106 | §4 guarded transaction, **no hrms_id change** (two real people, similar names, same mobile in the master). DECIDER: `div_promotion_history` from the official promotion import has EKMSED 5→8 on 2026-06-02 — the promotion the transfer implements. Re-anchored to EKMSED: request 1544, history 1418 (from CSMT-ML/CSMT6172), 7 `div_sub_spm_runs`, `div_family_members` 1162-1164 (created 09:21-09:23 on transfer day = his family), nomination 5332 (CLI 1); nomination 3759 (CLI 5) expired 2026-05-29; ATACWQ's 2928 (CLI 106) reopened Active. BIODATA: the KYN lobby had typed EKMSED's details over ATACWQ's row — restored from the Jan-2026 dump `div_staff_master.sql` (PF 00264110233, DOB 1987-12-20, DOA 2011-09-07, reporting 2025-03-18, cug 9004413936, father HARSAHAY MEENA, MAHAK PRIDE address, caste GEN, PAN BOMPM3946L, blood A+, id 1602273, safety A); EKMSED kept the values typed for him (father NAMONARAYAN MEENA, caste ST, blood AB+, id 370498, safety C) + user-confirmed PAN BLWPM9336D. Aadhaar/email/ID-marks were never overwritten. NOT done: the two 2026-05-29 training records (REF_IC, AUTOMATIC) still under ATACWQ — user fixes manually. `bak_20260902_*`/`stg_motnom_28aug` snapshots left untouched. Prod PRE+POST guard OK, COMMITTED 2026-09-16; local mirrored (different id space — new rows got local auto-increment ids; local-only CLI 71 nomination deleted to match prod) |
| 2026-09-02 | cms (malformed prefix) | PFECQF (RANJAN KUMAR PANDIT, motorman) / `CST2228` | `CSTS2228` | B (value-based) — prod-only; local still holds his pre-transfer state (CSMT5541/CSMT-ML/desig 5), the 2026-08-31 CSMT-ML→CSMT-SUB transfer was never mirrored. Footprint 3 cols / 1 row each: div_staff_master.current_cms_id, div_transfer_history.to_cms_id (2041), div_transfer_requests.proposed_cms_id (2196). `original_cms_id` KYN5084 left as-is. Self-guarded transaction with a PRE-guard (holder is PFECQF, target free) AND a POST-guard before COMMIT, so it is safe to run one-shot via `mysql < file` — error 1242 aborts and the txn rolls back at disconnect. CORROBORATION: `reassignment_history` already carried the correct `CSTS2228` for "R K PANDIT(2228)" (detail 364→303, 2026-07-26) — the suburban portal had the true id while the transfer entry typoed it, so the master row was the odd one out. Matches the CSTS↔CSMT-SUB invariant. Run via ssh 2026-09-02, verified, COMMITTED |
| 2026-08-12 | wrong staff selected for transfer | Request 2063/history 1873 incorrectly moved ANXYJF (Kamlesh Kumar) KYN5914→CSTS2250; intended staff was JKPBXL (Kamlesh Kr), then at KYN5674 | ANXYJF restored to KYN5914/KYN-ML; JKPBXL moved to CSTS2250/CSMT-SUB; request/history re-anchored to JKPBXL with from cms KYN5674 | Guarded transaction per §4. Post-2026-08-01 operational footprint was empty, so no duty/slate/LRD/training rows moved. ANXYJF biodata had also been contaminated; restored separately from official values (designation 1, PF 00229811701, DOB 1991-08-25, DOA 2020-10-20, PAN INXPK0137A). Both are real employees; no merge/delete and no hrms-id change |
| 2026-06-10 | hrms_id | PMQHDW | PMQHOW | FK-off (PK) |
| 2026-06-10 | hrms_id | ZWIGKE | ZWIGLE | FK-off (PK) |
| 2026-06-11 | hrms_id | JNLRU | FJNLRU | FK-off (PK) |
| 2026-06-11 | current_cms_id | CFIEIR (SUNIL MAHARANA, was `_TEMP_SWAP_`) | CSMT6063 | A (hrms-anchored) — verified 2026-06-15. RE-BROKE on prod ~2026-06-16 04:20 (stuck at `__TEMP_SWAP__` again, other half DNGWXH=CSMT6177 had completed); re-fixed on prod + local swap mirrored (CFIEIR→6063, DNGWXH→6177) 2026-07-16 |
| 2026-06-11 | cms (prefix) | QEEQOL (AJAY KUMAR VERMA) / 5341 | PNVL5341 | A (hrms-anchored) — verified 2026-06-15 |
| 2026-06-11 | cms (prefix) | IDDRPA (GAJENDRA KR SHARMA) / 5348 | PNVL5348 | A (hrms-anchored) — verified 2026-06-15 |
| 2026-06-11 | cms (prefix) | QOOIBU (Sunil Kumar T Bhagat) / 5713 | KYN5713 | A (hrms-anchored) — verified 2026-06-15 |
| 2026-06-15 | hrms_id | NBCUYY (Jitendra Samaroo Prajapati, ALP, cms LNL2332) | NBCUYT | FK-off (PK) — 4 tables: div_staff_master(1), div_cli_nominations(2), div_ctr_duties(2), div_training_records(4) |
| 2026-06-15 | cms (malformed) | CSTS222 (Vikash Kumar, motorman QXLBBU) | CSTS2222 | B (value-based) — 3 cols: div_staff_master.current_cms_id, div_transfer_history.to_cms_id, div_transfer_requests.proposed_cms_id |
| 2026-06-24 | cms (truncated) | CSTS (Dinesh Kumar Mahor, motorman CITMPI) | CSTS2213 | B (value-based, unique to one staff). 3 cols: div_staff_master.current_cms_id, div_transfer_history.to_cms_id, div_transfer_requests.proposed_cms_id |
| 2026-07-01 | cms (duplicate) | EWYFQK (Ajay Kumar, PNVL-ML) / PNVL5341 shared with QEEQOL | PNVL5505 | A (hrms-anchored — 2 staff shared PNVL5341, value-based would corrupt both). 4 cols: div_staff_master.current_cms_id, div_ctr_duties.staff_cms_id, div_transfer_history.to_cms_id, div_transfer_requests.proposed_cms_id. PNVL5505 confirmed free; QEEQOL retains PNVL5341 |
| 2026-07-01 | cms (transposition) | TUFJUX (Abdul Matin, PNVL-ML) / PNVL5504 | PNVL5540 | A (hrms-anchored). 4 cols: div_staff_master.current_cms_id, div_ctr_duties.staff_cms_id, div_transfer_history.to_cms_id, div_transfer_requests.proposed_cms_id. PNVL5540 confirmed free |
| 2026-07-16 | cms (reassignment chain) | IJPUNC (V R MAHADIK) CSMT6162 → CSMT6362, then AIHFBZ (NANDKISHOR JADHAV) CSMT6279 → CSMT6162 | — | A (hrms-anchored, double-anchored on old value, vacate-first). Prod side tables: div_ctr_duties 2, div_transfer_history.to_cms_id 1, div_transfer_requests.proposed_cms_id 1, div_runsafe_sessions 1. div_staff_master_backup (prod-only snapshot) deliberately untouched. Chain 2 same day: YXSFRN (SATISH NIMASE) 6054→6290, then APLPOU (SATISH KUMAR YADAV) 6219→6054 — the apparent 6290 collision was stale local data (PHDMKP had transferred to CSTS2212/CSMT-SUB on prod 2026-06-25; local reconciled, dup IAYPRY→CSMT6046 fixed, dup DJGZYY deleted). PHDMKP's 2 pre-transfer ctr_duties rows corrected CSMT6290→CSMT6219 on prod (his TRUE id as LPG at the time; the DB's 6290 was part of the same mis-numbering). LESSON (user-confirmed policy): div_ctr_duties.staff_cms_id is the ACTUAL id at the time of duty — correct it to the true historical id when the recorded one was wrong, but a genuine role/office change (new id issued, e.g. LP→motorman) does NOT rewrite old rows to the new id. staff_hrms_id is the identity key |
| 2026-07-23 | cms (malformed prefix) | DNPGTZ (Ajay Kumar Prajapati) / PMVL5511 | PNVL5511 | B (value-based, prod-only — local never had the value), self-guarded script, 19 cms cols, _backup snapshot untouched. Local record was stale on every axis (CSMT5227/CSMT-ML, NULL dates) — fully synced from prod (PNVL5511/PNVL-ML/LPG/1985-08-01/2017-07-15) |
| 2026-07-23 | hrms_id | IBQHVT (GUPESH KUMAR NIRALA, cms CSMT6051) | IBQHUT | Self-guarded FK-off script per §5. Local: 5 rows / 3 tables. Prod: guard OK, verified, COMMITTED 2026-07-23; file deleted |
| 2026-07-22 | hrms_id (batch of 10) | CHMPWZ→CMHPWZ, DJGFUI→DZGFUI, KURQQK→KURSQK, UKNPWI→UKNPWY, UQEFMC→UQEEMC, VTRBWX→UTRBWX, VUHWAX→UUHWAX, XYSDGL→XYSDGC, YXSFRN→YXSFRW, ZQXYOO←ZQXYOD | (user-verified) | FK-off CASE batch per §5, first run via scp+ssh with SELF-GUARD (IF+multi-row-subquery → error 1242 aborts before any change if an old id is missing or a target taken; replaces Workbench's manual STEP-0/COMMIT eyeballing). Local: 481 rows / 8 tables. Prod: 870 rows / 15 tables (ctr_duties 411, lrd_segment_coverage 241, detail_book_log 73, training_records 57, daily_slate 22, cli_nominations 16, leave_tracking 16, others) — run via ssh 2026-07-22, guard OK, verified; file deleted |
| 2026-07-22 | hrms_id (batch of 2) | PUZQBP→PUZQBD (RAM DHANI YADAV, IGP1613), HYEEAJ→HYEEAI (DEELIP KUMAR, PNVS1190) | (user-verified) | FK-off CASE batch per §5. Local: 9 rows / 3 tables. Prod: 64 rows / 6 tables (sub_spm_runs 48, training_records 8, cli_nominations 3, transfer_requests 2, staff_master 2, transfer_history 1) — COMMITTED via Workbench 2026-07-22; one-time file deleted |
| 2026-07-17 | duplicate staff records (hrms twins, found via duplicate-PF scan) | 6 pairs — kept JWTDUH (Ravi Jatav), WNWUTP (Kailash Patel), JAFQIT (Manoj Prabhakar), QLDDXK (Vishnu M Chauthe), BFOWID (Prem Lokhande, prod-only pair), NJDCKT (Shyam Surat); deleted lookalike twins JWTDVH/WHWUTP/JAFQJT/GLDDXK/BEOWID/NIDCKT | (user-verified vs HRMS) | Merge method: (a) delete wrong-id child rows colliding on a unique key (8 keys: training_once, cli_nomination, lrd seg/status, runsafe test, letter_staff ×2, fatigue PK), (b) re-point children wrong→true, (c) delete wrong master. Local + prod COMMITTED 2026-07-17 (prod: 53 child rows re-pointed — training_records 25, cli_nominations 7, promotion_history 7, family_members 6, sub_spm_runs 3, transfer_requests 3, rtis_daily_entries 1, detonator_stock 1). GOTCHA: footprint UNION queries need CONVERT..COLLATE on the id column (error 1271 fails silently in scripts). Follow-through COMPLETE both DBs 2026-07-18: postings set (JWTDUH CSTS2156, WNWUTP CSTS2167, JAFQIT CSTS2160, BFOWID CSTS2220 all CSMT-SUB motormen; QLDDXK CSMT5976 + NJDCKT CSMT4722 CSMT-ML); phantom twin CLI nominations removed (biodata double-row cause), NJDCKT's Ompal Singh nomination ended as history, current_cli_id aligned (one Active nomination each, matching). JAFQIT DOB confirmed 1986-01-31 (kept record already correct; nothing to change) |
| 2026-07-17 | hrms_id (batch of 9, format-scan) | AAAY6J→AAAYGJ, DUDRX4→DUDRXL, RIKWQ2→RIKWQZ, IJMZY→IJYMZY, SSFTW→SSWFTW, UNMIL→UNMIIL, WGNWU→WGNLWU, YLLJBHJ→YLLJBJ, xzbjwd→XZBJWD | (user-verified vs HRMS portal) | FK-off (PK), single CASE-mapped transaction, all hrms cols per §5, BINARY matching. Found by format scan: valid id = exactly 6 uppercase letters (digits/5-char/7-char/lowercase = defect). Local: 151 rows / 8 tables. Prod: 762 rows / 21 hrms columns (ctr_duties 197, lrd_segment_coverage 175, rtis 177, training_records 63, detail_book_log 70, daily_slate 26, sub_spm_runs 15, promotion_history 5, others) — COMMITTED via Workbench 2026-07-17; one-time file deleted |
| 2026-07-17 | hrms_id | HMJKCV (HEMANT KUSHWAHA, cms CSMT6405) | HMJKCU | FK-off (PK), all hrms cols per §5 (one-time file, deleted after run). Local: 5 tables (96 rows). Prod: 12 tables, 154 rows — incl. rtis_analyses 40, rtis_braking_runs 40, rtis_daily_entries 25, rtis_violations 8, lrd_segment_coverage 25, training_records 8, ctr_duties 2, cli_nominations 2, transfer_history/requests 1+1 — COMMITTED via Workbench 2026-07-17 |
| 2026-07-16 | hrms_id | MGCT25 (GANESH LOHAR, cms CSMT6295) | MGCTZS | FK-off (PK), 47 hrms cols per §5 (one-time sql file deleted after run). Local: 3 tables (div_staff_master 1, div_cli_nominations 1, div_training_records 3). Prod: 4 tables (+ div_ctr_duties 1; div_training_records 5) — COMMITTED via Workbench 2026-07-16. adas/cvvrs skipped on prod (tables absent) |
