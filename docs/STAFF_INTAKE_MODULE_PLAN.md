# Staff Intake — bulk onboarding a new batch into `div_staff_master`

**Status:** proposed, not built. Written 2026-08-09 after the cadre-letter
Excel-import work made the same shape of problem obvious twice.

**Decision needed from the cadre desk before any code is written** — see §8.

---

## 1. The problem, stated plainly

When a batch of new running staff is appointed (63 and 11 PNVL ALPs so far, 69
in the current initial-ALP letter), each one has to be created in
`div_staff_master`. Doing that through **Biodata → Create New Staff**, one
screen per person, is not realistic for 69 people.

So the current process is the one in
[`STAFF_BULK_IMPORT_PLAYBOOK.md`](STAFF_BULK_IMPORT_PLAYBOOK.md): collect the
data, hand-format a CSV (dates converted to `YYYY-MM-DD`, names replaced by CLI
ids), then load it with MySQL Workbench or by `scp` + `SOURCE`. It works — two
batches have gone through it — but it is a developer procedure, not something
the cadre desk can run alone, and every batch needs a hand-written SQL file.

**What this module would do:** move that import into the portal, so the CLI does
it themselves, with validation before anything is written.

### What it does NOT solve

The portal cannot invent an **HRMS ID** or a **CMS ID**. `hrms_id` is the
PRIMARY KEY of `div_staff_master` and `NOT NULL` — no staff row can exist
without one. CMS ids are allotted by the receiving office after posting.

So the sequence is fixed, and no design changes it:

```
cadre letter (name + PF only)  →  DPO issues posting order  →  staff join,
HRMS + CMS known  →  intake
```

The module's job is to make the last step cheap and safe, and to avoid
retyping the names captured in the first.

---

## 2. Which of the two options

> **Option 1** — store name + PF in a temporary table, make it available for
> staff adding later, then delete the temp data.
> **Option 2** — reuse the Excel/paste route from the initial-ALP letter, paste
> HRMS and the rest in a fixed column order, set every CLI to "Not Assigned".

**Recommendation: build Option 2, on a staging table that is kept rather than
deleted, and let it optionally seed itself from a cadre letter.**

That keeps everything Option 1 was after, without its two problems:

- **The temporary table already exists.** The 69 names and PF numbers are
  already stored, in `div_cadre_letter_staff`, because the letter put them
  there. A second temp table would be a duplicate copy of the same list that
  can drift from it. Read the letter instead.
- **"Delete afterwards" throws away the audit trail.** When a PF turns out to
  be wrong three months later, the question is "what exactly did we load, and
  from which file?" A staging batch that is kept answers it; a deleted temp
  table does not. It costs a few hundred rows per batch.

Option 2 is also the more valuable half: it serves **every** batch, not only
ALPs off a cadre letter, and it replaces the CSV/Workbench dance rather than
adding a step to it.

---

## 3. Shape

Two tables, mirroring how the cadre letters work (a batch + its rows):

```
div_staff_intake_batches
  id, title, source_letter_id NULL → div_cadre_letters(id),
  source_filename, office_code, designation_id, default_cli_id,
  status enum('draft','committed'), committed_at, created_by, created_at

div_staff_intake_rows
  id, batch_id → batches(id) ON DELETE CASCADE, sr_no,
  hrms_id, pf_number, name, current_cms_id, original_cms_id,
  date_of_birth, date_of_appointment, reporting_date,
  <the rest of the biodata columns, all nullable>,
  raw JSON,                    -- the row exactly as it arrived
  errors JSON,                 -- validation findings, refreshed on every check
  state enum('new','ready','blocked','committed','skipped')
```

Every column is nullable **in staging** — that is the point. A row can sit at
`blocked` with "HRMS ID missing" until the CLI has it, without holding up the
rest of the batch. Nothing reaches `div_staff_master` until it is `ready`.

`raw` keeps the original cells, so a mis-mapped column can be re-read without
asking for the file again.

---

## 4. Dates — the part you flagged, and the good news

This is the main worry, and it is mostly solvable by reading the file
differently rather than by asking the user to reformat it.

**Excel does not store `18/05/2026` as text.** A real date cell is a *number*
(a serial day count) with a display format on top. Read with
`cellDates: true`, the `xlsx` library hands back a genuine JS `Date` — so
`dd/mm` vs `mm/dd` ambiguity **does not arise at all** for properly-typed date
cells. That covers most sheets that came out of a real system.

Note this is a deliberate difference from the cadre-letter import, which reads
everything *formatted* (`raw: false`) so PF numbers keep their leading zeros.
Intake needs both behaviours: **text for identifiers, real dates for dates.**
Read the sheet twice, or read raw and format per column by type.

What is left:

| Case | Handling |
|---|---|
| Real Excel date cell | Unambiguous. Use it. |
| Text `2026-05-18` | Unambiguous. Use it. |
| Text `18/05/2026` | Ambiguous only when day ≤ 12. Resolve **per column**, not per cell: infer from any value in the column with day > 12, and state the conclusion ("read as DD/MM/YYYY — 41 of 69 confirm it"). Offer a switch. |
| Text `18-May-2026` | Parse by month name. |
| Blank | NULL — legitimate for `reporting_date`. |

Two rules that matter more than the parsing:

1. **Never silently guess a whole column.** Show what was parsed, in a preview,
   with the original alongside: `18/05/2026 → 2026-05-18`.
2. **Reject impossible dates rather than shifting them.** A date of birth in the
   future, an appointment before the birth, a birth date implying age < 18 or
   > 60 — these are near-certainly a format misread, and they are how a whole
   column silently lands wrong. Flag the row; don't coerce it.

---

## 5. Validation, before anything is written

Automating [playbook §3](STAFF_BULK_IMPORT_PLAYBOOK.md), which is currently done
by hand:

- `hrms_id` present, not already in `div_staff_master`, not duplicated inside
  the batch
- `current_cms_id` / `original_cms_id` not already held by another staff member
  (the collision problem from `STAFF_HRMS_ID_CORRECTION.md`)
- `pf_number` not already in `div_staff_master` — **PF is effectively unique
  today** (3,695 distinct of 3,697 rows, no duplicate groups), which is what
  makes it a reliable natural key
- FKs exist: `office_code` in `offices`, `designation_id` in `designations`,
  `current_cli_id` in `div_cli_master`
- ENUM values legal — `marital_status`, `vision`, `safety_category`,
  `assignment_status`, `caste`, `gender`. Under `STRICT_TRANS_TABLES` a bad
  enum **aborts the load**, which is exactly what must not happen halfway.
- Dates parse, and pass the sanity rules in §4

Results shown as a grid with the bad cells marked, and a plain count:
"69 rows · 64 ready · 5 blocked". **Commit is disabled while anything is
blocked**, unless the CLI explicitly skips those rows.

---

## 6. Commit

One transaction:

1. `INSERT INTO div_staff_master` for every `ready` row
2. `INSERT INTO div_cli_nominations` — `status='Active'`,
   `nominated_from_date = reporting_date`, `cli_id` = the batch default.
   **`cli_id` 145 is already "Not Assigned"**, so your suggested default needs
   no new record. This step is not optional: the reports and the CLI-name
   lookup join `div_cli_nominations`, **not** `current_cli_id` on the master, so
   staff created without a nomination show a blank CLI everywhere.
3. Mark rows `committed`, batch `committed`

Training records (playbook §6) stay a separate follow-up. They arrive on a
different sheet at a different time, and bundling them would hold up the staff
creation.

---

## 7. Seeding from a cadre letter

For an initial-ALP batch, the names and PF numbers are already in
`div_cadre_letter_staff`. "Start from letter BB.TRSO.TECH.04/03" creates a batch
of 69 rows with name, PF and proposed lobby filled, leaving HRMS, CMS and the
biodata columns to be pasted in — matched on **PF number**.

This is the piece that only exists because the letter module was built first,
and it is the direct answer to "we now have all the new staff list, can we use
it?". It is genuinely useful but it is **not** the core of the module: the
intake screen has to work standalone, for batches with no letter behind them.

---

## 8. What I need decided

1. **Option 2 on a kept staging table, seeded optionally from a letter** — agreed?
2. **Who runs it?** `division_admin` only, or the HQ CLI cadre desk too?
   This decides how much the validation has to protect against, and whether the
   commit needs a second pair of eyes.
3. **Does the joining data actually arrive as a spreadsheet?** The whole design
   assumes a file. If HRMS ids come back on paper from DPO, the paste/manual
   path carries the weight and the file drop is decoration.
4. **Scope now or later.** This is a bigger module than it looks — validation
   and the error grid are most of the work, not the import. It should not be
   started until the cadre letters are signed off.

Until it is built, `STAFF_BULK_IMPORT_PLAYBOOK.md` stays the procedure, and it
stays valid afterwards as the fallback for anything the screen refuses.

---

## 9. Honest risks

- **It replaces a process that works.** Two batches have gone through the CSV
  route successfully. A half-finished screen is worse than the playbook. Build
  it whole or not at all.
- **The validation is the product.** Loading rows is easy; catching the wrong
  ones is the entire value. If that is cut to save time, this becomes a faster
  way to corrupt the staff master — with `STRICT_TRANS_TABLES` a bad enum
  aborts mid-load, and a silently misread date column is worse than an abort.
- **PF uniqueness is a current fact, not a constraint.** There is no unique
  index on `pf_number` — two rows are blank today. If matching leans on PF, add
  the check; do not assume the DB enforces it.
