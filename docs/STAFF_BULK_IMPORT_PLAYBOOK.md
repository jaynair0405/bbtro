# Staff Bulk Import Playbook (new ALP/staff batches → div_staff_master)

Repeatable process for onboarding a new batch of staff (e.g. PNVL ALPs) from a
CSV into `div_staff_master`, plus their CLI nominations and training records.
Companion to [`STAFF_HRMS_ID_CORRECTION.md`](STAFF_HRMS_ID_CORRECTION.md) (which
covers *correcting* existing hrms_id / cms values).

> **These import files are one-time artifacts.** They are **gitignored**
> (`sql/*new_pnvl_alp*.sql`, `csv/new_pnvl_alp*` in `.gitignore`) and must **not**
> be committed (CSVs carry PII: Aadhaar/PAN/addresses). After running on the
> server, **delete them** from `~/bbtro/sql/` — see §7. The data lives in the DB;
> the scripts are disposable.

---

## 1. Reference IDs (verify against live DB before use)

**Designations** (`designations.id`): 1 ALP, 2 Sr.ALP, 3 LPS, 5 LPG, 6 LPP,
7 LPM, 8 MOTORMAN, 12 CLI. New ALP batch = **designation_id 1**.

**Offices** (`offices.office_code`, PK): CSMT-SUB, PNVL-SUB, KYN-SUB, CSMT-ML,
**PNVL-ML**, KYN-ML, NRL, LNL, IGP, CLA.

**Training types** (`div_training_types.training_id`):
| id | code | notes |
|----|------|-------|
| 1 | PME | Periodic Medical Exam — has due date (age-based) |
| 2 | REF_IC | Refresher IC — due = done + 3 years |
| 5 | AUTOMATIC | due = done + 6 months |
| 10 | WAG_12 | skill, no due |
| 14 | DSLAC_SIM | DSLAC simulator (ALP), skill, no due |
| 15 | WDG 4G/6G | skill, no due |
| 17 | MEMU | |
| 26 | MMPRC | Motorman promotion/refresher |

**Training centres** (`div_training_centers.center_id`): 1 ZRTI_BSL, 2 MTC_KYN,
3 MTC_CLA, 4 DTC_KYN, 5 DRH_KYN (hospital — PME), 6 BAMH_BY (hospital).

---

## 2. CSV format — staff master

Header = `div_staff_master` columns in table order, **excluding**
`retirement_date, retirement_type, is_yard_staff, remarks` (39 cols):
```
hrms_id,original_cms_id,current_cms_id,current_office_code,home_office_code,
designation_id,current_cli_id,name,pf_number,date_of_birth,date_of_appointment,
reporting_date,hq_station,dept_rrb,present_address,permanent_address,cug_number,
phone_number,fathers_name,qualification,caste,email,pan_card_no,vision,gender,
aadhar_card_no,marital_status,identification_mark_1,identification_mark_2,
blood_group,id_card_no,safety_category,assignment_status,
current_assignment_start_date,status,created_at,updated_at,pstore_last_updated,
pstore_next_due
```
- Dates: **`YYYY-MM-DD`** (strict mode: `STRICT_TRANS_TABLES` is on — bad dates/enums abort).
- Empty cell or literal `NULL` → SQL `NULL`.
- `created_at`/`updated_at` are **omitted** from the INSERT → DB defaults apply.

**ENUM gotchas** (these silently break or reject):
| column | valid values | seen-wrong |
|--------|--------------|-----------|
| `marital_status` | Married, Unmarried | `12` (rejected) |
| `vision` | Normal, NV, DV, Both | `NORMAL` ok (case-insensitive) |
| `safety_category` | A, B, C, D | |
| `assignment_status` | permanent, officiating, transferred | |
| `caste` | GEN, OBC, SC, ST | |
| `gender` | Male, Female, Other | |

---

## 3. Validate BEFORE generating (against local `bbtro`)

1. **Profile** the CSV: row count, no dup/empty hrms or cms, date formats,
   distinct enum values.
2. **FK refs exist**: every `current_cli_id` in `div_cli_master.cli_id`; office in
   `offices`; `designation_id` in `designations.id`.
3. **No overlap**: none of the batch `hrms_id` already in `div_staff_master`
   (dup PK → INSERT fails); none of `current_cms_id` already used by another staff
   (the collision problem — see corrections doc).

Robust CSV parsing (quoted commas in addresses) via a small Node parser — see the
inline `node -e` scripts used in the session transcript. Write hrms/cms lists to
`/tmp` for the SQL `IN (...)` checks.

---

## 4. Generate + apply — staff master

- Generate one `INSERT INTO div_staff_master (<cols>) VALUES (...);` per row,
  wrapped in `START TRANSACTION;` … `-- COMMIT;` (commented, manual).
- Numeric cols unquoted: `designation_id`, `current_cli_id`. Escape `'` → `''`.
- **Dry-run on local**: pipe inserts + a count SELECT + `ROLLBACK;` → confirms all
  rows insert under strict mode with nothing committed.
- **Apply on local**: `{ cat file.sql; echo "COMMIT;"; } | mysql -u jay -p4310jay bbtro`
- **Apply on server**: scp to `~/bbtro/sql/`, then in `mysql -u railway_user -p bbtro`:
  `SOURCE /home/railway/bbtro/sql/<file>.sql;` → check verify → `COMMIT;`
  (Keep the mysql session open between SOURCE and COMMIT or the txn rolls back.)

If the CSV lacks real `current_cli_id`/`reporting_date` (batch 1 used placeholder
cli 145, NULL reporting date), do a follow-up UPDATE step keyed on `hrms_id`.

---

## 5. CLI nominations (`div_cli_nominations`)

The custom report / CLI-name lookup joins `div_cli_nominations` (status='Active'),
**not** `current_cli_id` on the master — so new staff show blank CLI until a
nomination row exists.

- No cms column here; keys on `staff_hrms_id` + `cli_id`.
- Insert: `staff_hrms_id, cli_id, nominated_from_date, nominated_to_date=NULL,
  status='Active', created_by='div_admin'`.
- `nominated_from_date` = each staff's **reporting_date** (preferred; batch 1
  initially used a uniform date then corrected the outliers to reporting_date).
- Pre-check: none of the batch already have a nomination.

---

## 6. Training records (`div_training_records`)

**Wide template → long inserts.** Give the user a template pre-filled with
`hrms_id,name` and per-training columns; they fill dates + centre; convert to one
row per (staff, training) where a done date exists.

- Template cols: `<trg>_done, <trg>_due (only for 1/2/5), <trg>_centre`.
- Insert cols: `staff_hrms_id, training_id, done_date, due_date, training_center_id`
  (`status` defaults 'Completed').
- **Due dates**: PME (age-based, manual), REF_IC = done+3y, Automatic = done+6mo;
  skill trainings (10/14/15) → `due_date` NULL.
- **Data-quality check**: flag `due < done` (was a REF_IC typo in batch 2 — fixed
  to done+3y after confirming with user). Blank done → skip that training.
- **Dry-run** with `SET FOREIGN_KEY_CHECKS=0` if the staff don't yet exist locally
  (validates enums/dates without the FK), then `ROLLBACK`.
- Uniform centre? Fill it in during conversion rather than typing per row.

---

## 7. Cleanup (mandatory)

- Local: files are gitignored (`.gitignore` has `sql/*new_pnvl_alp*.sql`,
  `csv/new_pnvl_alp*`). Keep for reference, never commit.
- Server: `rm -v ~/bbtro/sql/*new_pnvl_alp*.sql` after import. They were never in
  the repo → untracked → safe to delete, and removes the only `git pull` edge case
  (untracked file blocking a same-name pulled file).

---

## 8. Log of batches

| Date | Batch | Staff | Office | Follow-ups |
|------|-------|-------|--------|-----------|
| 2026-07-01 | new_pnvl_alp Sheet1 | 63 ALP | PNVL-ML | cli+reporting UPDATE (cli was placeholder 145); 63 nominations; training PME/REF_IC/Automatic/WDG4G/DSLAC |
| 2026-07-02 | new_pnvl_alp alp_2 | 11 ALP | PNVL-ML | cli+reporting already in CSV; 11 nominations (from=reporting_date); training PME/REF_IC/Automatic/WDG4G/DSLAC/WAG12 |

All applied on **server + local**; import scripts removed from server.

**DB creds** (from CLAUDE.md): local `mysql -u jay -p4310jay bbtro`; server SSH
`railway@93.127.198.125`, DB user `railway_user` on `bbtro`. `railway_user` has no
terminal/global privileges — run server SQL via Workbench or the server's mysql
client, not remote `mysql -e`.
