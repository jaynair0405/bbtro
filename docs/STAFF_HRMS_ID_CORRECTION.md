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

## 4. Reference — every hrms-keyed table/column (schema as of 2026-07-16)

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

## 5. Log of corrections applied (server)
| Date | Field | hrms_id / old cms | → | Method |
|------|-------|-------------------|---|--------|
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
| 2026-07-17 | duplicate staff records (hrms twins, found via duplicate-PF scan) | 6 pairs — kept JWTDUH (Ravi Jatav), WNWUTP (Kailash Patel), JAFQIT (Manoj Prabhakar), QLDDXK (Vishnu M Chauthe), BFOWID (Prem Lokhande, prod-only pair), NJDCKT (Shyam Surat); deleted lookalike twins JWTDVH/WHWUTP/JAFQJT/GLDDXK/BEOWID/NIDCKT | (user-verified vs HRMS) | Merge method: (a) delete wrong-id child rows colliding on a unique key (8 keys: training_once, cli_nomination, lrd seg/status, runsafe test, letter_staff ×2, fatigue PK), (b) re-point children wrong→true, (c) delete wrong master. Local + prod COMMITTED 2026-07-17 (prod: 53 child rows re-pointed — training_records 25, cli_nominations 7, promotion_history 7, family_members 6, sub_spm_runs 3, transfer_requests 3, rtis_daily_entries 1, detonator_stock 1). GOTCHA: footprint UNION queries need CONVERT..COLLATE on the id column (error 1271 fails silently in scripts). Follow-through COMPLETE both DBs 2026-07-18: postings set (JWTDUH CSTS2156, WNWUTP CSTS2167, JAFQIT CSTS2160, BFOWID CSTS2220 all CSMT-SUB motormen; QLDDXK CSMT5976 + NJDCKT CSMT4722 CSMT-ML); phantom twin CLI nominations removed (biodata double-row cause), NJDCKT's Ompal Singh nomination ended as history, current_cli_id aligned (one Active nomination each, matching). JAFQIT DOB confirmed 1986-01-31 (kept record already correct; nothing to change) |
| 2026-07-17 | hrms_id (batch of 9, format-scan) | AAAY6J→AAAYGJ, DUDRX4→DUDRXL, RIKWQ2→RIKWQZ, IJMZY→IJYMZY, SSFTW→SSWFTW, UNMIL→UNMIIL, WGNWU→WGNLWU, YLLJBHJ→YLLJBJ, xzbjwd→XZBJWD | (user-verified vs HRMS portal) | FK-off (PK), single CASE-mapped transaction, all hrms cols per §4, BINARY matching. Found by format scan: valid id = exactly 6 uppercase letters (digits/5-char/7-char/lowercase = defect). Local: 151 rows / 8 tables. Prod: 762 rows / 21 hrms columns (ctr_duties 197, lrd_segment_coverage 175, rtis 177, training_records 63, detail_book_log 70, daily_slate 26, sub_spm_runs 15, promotion_history 5, others) — COMMITTED via Workbench 2026-07-17; one-time file deleted |
| 2026-07-17 | hrms_id | HMJKCV (HEMANT KUSHWAHA, cms CSMT6405) | HMJKCU | FK-off (PK), all hrms cols per §4 (one-time file, deleted after run). Local: 5 tables (96 rows). Prod: 12 tables, 154 rows — incl. rtis_analyses 40, rtis_braking_runs 40, rtis_daily_entries 25, rtis_violations 8, lrd_segment_coverage 25, training_records 8, ctr_duties 2, cli_nominations 2, transfer_history/requests 1+1 — COMMITTED via Workbench 2026-07-17 |
| 2026-07-16 | hrms_id | MGCT25 (GANESH LOHAR, cms CSMT6295) | MGCTZS | FK-off (PK), 47 hrms cols per §4 (one-time sql file deleted after run). Local: 3 tables (div_staff_master 1, div_cli_nominations 1, div_training_records 3). Prod: 4 tables (+ div_ctr_duties 1; div_training_records 5) — COMMITTED via Workbench 2026-07-16. adas/cvvrs skipped on prod (tables absent) |
