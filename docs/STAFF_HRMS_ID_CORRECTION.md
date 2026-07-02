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

## 4. Log of corrections applied (server)
| Date | Field | hrms_id / old cms | → | Method |
|------|-------|-------------------|---|--------|
| 2026-06-10 | hrms_id | PMQHDW | PMQHOW | FK-off (PK) |
| 2026-06-10 | hrms_id | ZWIGKE | ZWIGLE | FK-off (PK) |
| 2026-06-11 | hrms_id | JNLRU | FJNLRU | FK-off (PK) |
| 2026-06-11 | current_cms_id | CFIEIR (SUNIL MAHARANA, was `_TEMP_SWAP_`) | CSMT6063 | A (hrms-anchored) — verified 2026-06-15 |
| 2026-06-11 | cms (prefix) | QEEQOL (AJAY KUMAR VERMA) / 5341 | PNVL5341 | A (hrms-anchored) — verified 2026-06-15 |
| 2026-06-11 | cms (prefix) | IDDRPA (GAJENDRA KR SHARMA) / 5348 | PNVL5348 | A (hrms-anchored) — verified 2026-06-15 |
| 2026-06-11 | cms (prefix) | QOOIBU (Sunil Kumar T Bhagat) / 5713 | KYN5713 | A (hrms-anchored) — verified 2026-06-15 |
| 2026-06-15 | hrms_id | NBCUYY (Jitendra Samaroo Prajapati, ALP, cms LNL2332) | NBCUYT | FK-off (PK) — 4 tables: div_staff_master(1), div_cli_nominations(2), div_ctr_duties(2), div_training_records(4) |
| 2026-06-15 | cms (malformed) | CSTS222 (Vikash Kumar, motorman QXLBBU) | CSTS2222 | B (value-based) — 3 cols: div_staff_master.current_cms_id, div_transfer_history.to_cms_id, div_transfer_requests.proposed_cms_id |
| 2026-06-24 | cms (truncated) | CSTS (Dinesh Kumar Mahor, motorman CITMPI) | CSTS2213 | B (value-based, unique to one staff). 3 cols: div_staff_master.current_cms_id, div_transfer_history.to_cms_id, div_transfer_requests.proposed_cms_id |
| 2026-07-01 | cms (duplicate) | EWYFQK (Ajay Kumar, PNVL-ML) / PNVL5341 shared with QEEQOL | PNVL5505 | A (hrms-anchored — 2 staff shared PNVL5341, value-based would corrupt both). 4 cols: div_staff_master.current_cms_id, div_ctr_duties.staff_cms_id, div_transfer_history.to_cms_id, div_transfer_requests.proposed_cms_id. PNVL5505 confirmed free; QEEQOL retains PNVL5341 |
| 2026-07-01 | cms (transposition) | TUFJUX (Abdul Matin, PNVL-ML) / PNVL5504 | PNVL5540 | A (hrms-anchored). 4 cols: div_staff_master.current_cms_id, div_ctr_duties.staff_cms_id, div_transfer_history.to_cms_id, div_transfer_requests.proposed_cms_id. PNVL5540 confirmed free |
