# Signal book: keeping local and prod in step

**Status 2026-09-10 (evening):** the outbox below is **built and tested locally**
on `feature/signal-sync` (worktree `/Users/neeraja/bbtro-signal-sync`). Not merged,
not on prod. Local and prod `div_signals` are identical (3,069 signals, checksum
verified from prod that morning; prod had no rows updated later that day).

## How to use it (once deployed)

1. CLI-HQ edits and publishes in the signal-book editor on prod, as today.
2. Settings → **Audit Log** (`/div/audit-log.html`, division_admin) lists every
   signal edited since the last sync.
3. **Download sync SQL** → save the file into `sql/` on the dev machine, run it
   against local, commit it.
4. **Mark all synced**. Rows stay in the table with a `synced_at`; "Queued ever"
   keeps counting them. That is by design.

Deploy needs `sql/2026-09-10_signal_sync_queue.sql` on prod, then pull + restart.

## What the generated SQL does and does not touch

- An **UPDATE** sets only the 18 columns the editor can write (`signal_number`,
  placement, flags, type/function, arms, description, notes …). Never lat/long,
  `km_from_csmt`, `magnet_id`, `seq_order`: those land on local first and prod's
  NULLs must not overwrite them.
- A **renumber** also re-creates the two `div_signal_aliases` rows the editor
  writes on prod (`INSERT IGNORE`).
- A **CREATED** signal is inserted in full with its prod id, guarded by
  `NOT EXISTS`; a following `SELECT` prints a CONFLICT line if that id already
  belongs to a different signal locally. Resolve those by hand.
- Every statement is guarded on `id` + current `signal_number`, the whole file is
  one transaction, and re-running it is a no-op.

## Bug found by the first test (fixed on master 18dff82, deployed to prod)

The first test edit — one placement on TMBY S-541 — queued **three** signals.
Publish rewrote every signal in the section, and for a signal with arm counts
but no `book_description`, `parseRiSpec()` returns an empty spec that
serialised back to `ri_left_arms = ri_right_arms = 0`. CLA S-19 and CLA YD S-2
lost `ri_left_arms = 2` (recovered from the local binary log, `binlog_row_image=FULL`).
47 signals were in that state. History never showed it because arms were not a
logged column.

Fix: an empty spec keeps the stored counts, publish writes **only signals whose
fields differ from the draft**, and arm changes are now logged as history type
`Other`. Prod was checked before the hotfix: the 10 Sep column-by-column sync
had only upward arm corrections and no unexplained rows, so nothing was lost there.

This is the outbox doing its job — a change-detection that watches every column
caught what a hand-picked history logger missed.

---

## The problem

`div_signals` is edited from both ends:

- **local → prod** when a new corridor is imported and deployed
- **prod → local** when CLI-HQ renumbers or corrects a signal through the
  signal-book UI

The second direction had no path back. UI edits land in prod's database and
nowhere else — no migration, no source sheet, nothing in git — so local silently
fell 41 signals behind between 12 Aug and 10 Sep. Left alone the gap only grows,
and MMR-BSL renumbering is expected next (it matched on 10 Sep, so it has not
landed yet).

Why it matters: AWS resolves signals through this table, and local testing
against stale signal numbers is testing against something the division does not
run.

---

## READ THIS BEFORE INVESTIGATING ANY DRIFT

Two mechanisms already exist. **Use them. Do not start with checksums.**

### 1. `div_signals.updated_at`
`ON UPDATE CURRENT_TIMESTAMP`, live and accurate. Which signals changed since a
date is one query:

```sql
SELECT id, section, signal_number, updated_at
  FROM div_signals WHERE updated_at > '2026-09-10' ORDER BY updated_at DESC;
```

### 2. `div_signal_history` — the good one
Already written by the signal-book `publish` endpoint
(`routes/division/signalBookRoutes.js`, ~line 398). Records `signal_id`,
`change_type` (`Renumbered`, `Placement Changed`, `Location Changed`,
`Description Changed`, …), `old_value`, `new_value`, `change_date`,
`changed_by_user_id`.

```sql
SELECT h.id, h.signal_id, s.signal_number, s.section, h.change_type,
       h.old_value, h.new_value, h.change_date, h.changed_by_user_id
  FROM div_signal_history h LEFT JOIN div_signals s ON s.id = h.signal_id
 WHERE h.change_date > '<last sync>' ORDER BY h.id;
```

On 10 Sep this covered **all 41** drifted signals exactly — no gaps, nothing
spurious. It reads like a changelog: *"PYJE S-8 renumbered to S-12 by user 30 on
12 Aug"*.

**What the history CANNOT do — do not replay it blindly:**

- It is an **operation log, not a state diff**. Signal 2240 has two entries:
  `GATE-60 → LP-56A` then `LP-56A → LP-55A` (someone typed the wrong number and
  corrected it). Taking the first entry lands you on a number belonging to a
  different signal.
- It **does not record every column that changed**. `TGN S-3` is logged as
  `Placement Changed: Left → Extreme Left`, but `is_lhs` (1→0) and `is_ext_lhs`
  (0→1) changed with it and are not logged. Likewise
  `normalized_signal_number` on every `Renumbered` row, and `ri_left_arms` at
  CSMT S-34 (0→2) and VSH S-2 (0→1), both logged only as "Description Changed".

So: **history to DETECT which signals, then fetch those rows in full to APPLY.**

### 3. Checksums — the backstop only
Neither mechanism catches an edit made by direct SQL on prod, outside the UI. An
occasional whole-table checksum proves nothing slipped past. Narrowing goes
whole-table → per-section → per-column → per-row; `scripts/signal-sync-check.js`
holds the queries. **This is the slow path. It cost an afternoon on 10 Sep
because nobody checked the schema for a change-tracking column first.**

---

## The design (user's, 10 Sep) — an outbox, not a diff

Rather than detecting drift after the fact, prod announces it.

1. **`div_signal_sync_queue`** — a table mirroring `div_signals`, holding a
   **full row snapshot** of every signal edited on prod.
   - **Upsert keyed on `signal_id`**, latest wins. Signal 2240 was edited twice
     in one day; one row per signal means ordering can never bite. The
     blow-by-blow stays in `div_signal_history`.
   - **`synced_at` — mark, do not DELETE.** Emptying the queue means one
     mistimed run loses the delta with no way back. `WHERE synced_at IS NULL`
     gives the same "pending" view and keeps the record. 41 rows in three weeks;
     storage is irrelevant.
   - A snapshot solves what the history cannot: every column, not just the
     logged one.
2. **Hook**: write the snapshot in the **same transaction** as the
   `div_signal_history` insert, in the `publish` endpoint. Same place, already
   proven to fire.
3. **Page**: the **Audit Log card** on `/div/settings.html` (line ~397) is a stub
   — `onclick="alert('Coming soon!')"`, hardcoded stats. Its stated purpose is
   "track changes to master data". Point it at a new `/div/audit-log.html`
   listing pending rows.
4. **"Download sync SQL"** on that page — emits a dated migration of guarded
   `UPDATE`/`INSERT` statements. Local becomes `mysql < file.sql`. No Workbench,
   no pasting, no ssh.
5. **"Mark synced"** sets `synced_at`.

### Where it lives (built)
```
server.js                            /div/settings.html + /div/audit-log.html enforce division_admin
sql/2026-09-10_signal_sync_queue.sql div_signal_sync_queue — mirror of div_signals + 5 bookkeeping cols
routes/division/signalBookRoutes.js  queueSignalSnapshot(): upsert in the publish transaction,
                                     only for signals that actually changed
routes/division/signalSyncRoutes.js  /api/division/signal-sync  pending | sql | mark-synced
public/div/audit-log.html            the page
public/div/settings.html             Audit Log card → live pending count
```

### No new role — decided, with a reason
A `sysadmin` role was considered so officers (who use `division_admin`) would not
see developer pages. Rejected on cost: **159 `division_admin` checks across 42
files**. Adding a role means editing all of them, and one missed check is an
invisible permission hole.

If it is ever revisited, do **not** edit those 159. Map it at login instead —
session carries `div_role: 'division_admin'` (effective) plus
`is_sysadmin: true`; every existing check passes untouched and new pages guard on
the flag. Document the indirection loudly at the one place it happens.

---

## Traps found the hard way, 10 Sep

- **`/div/settings.html` does not enforce admin.** Its guard checks only
  logged-in + `realm === 'division'`. The `admin-only` class is *cosmetic* (CSS,
  line 91) and the "Admin Only" badge enforces nothing. Any division login can
  reach it — including the Bulk Upload Staff, CLI Management and CLI Accounts
  cards. Pre-existing; worth fixing regardless of this feature.
- **`mysql -p` cannot be driven over ssh from Node.** `execFileSync` +
  `ssh -t` (needed for the password prompt) + piped stdout deadlocks. It hung
  even at 44 KB, so size is not the cause. Separately, `ssh -t … > file` sends
  the *password prompt into the file*, so it waits for input with no visible
  prompt and Ctrl+C will not escape raw mode (use `Enter ~ .`).
  **Workbench works. Use it.**
- **dotenv does not override an existing env var.** The shell exports
  `DB_NAME=rrcms` from the other project, so scripts connected to the wrong
  database and reported *"Table 'rrcms.div_signals' doesn't exist"*. Use
  `require('dotenv').config({ override: true })` and assert the database name.
- **`magnet_id` groups the same physical signal listed under several sections**
  (KYN S-56 appears in KYN-KJT and KYN-KSRA; both point at canonical id 114). A
  signal with no twin is its own magnet. AWS resolves through it — never
  renumber ids or reassign magnets casually.
- **Never sync `div_signals` wholesale in either direction.** Local holds new
  corridors prod lacks; prod holds UI edits local lacks. Additive, guarded
  statements only.

---

## Open

- **Merge + deploy** `feature/signal-sync` after a few days of local use: rebase,
  ff-merge to master, push, then on prod run the queue SQL, pull, `pm2 restart bbtro`.
- `scripts/signal-sync-check.js` — **uncommitted** in the main checkout.
  Comparison logic is sound; its ssh fetch does not work and should be stripped.
  Superseded by the queue for detection; keep it for the checksum backstop.
- The local queue table also collects local test edits. They mean nothing (local
  reaches prod via git, not via this queue) — delete them when they get in the way.
- `mysqlbinlog --read-from-remote-server -v --base64-output=DECODE-ROWS` recovers
  before-images of any `div_signals` write on local. Worth checking whether prod
  has `log_bin` on too; it turns "what did that publish overwrite" into a query.
