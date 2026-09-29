# Local database restore runbook (bbtro + rrcms)

Written 2026-09-25 after the macOS 26.7 → 27 upgrade on 24 Sep. `bbtro`, `rrcms` and
the `jay` account appeared to vanish. **Corrected 2026-09-25 (later the same day):
nothing was wiped — the app had silently switched to a different, empty MySQL
server.** See "What really happened" below. The databases were rebuilt from prod
dumps (§1–§6); the original local data still exists and is recovered per §9.

Local now: MySQL **9.7** (Homebrew, arm64, `/opt/homebrew/var/mysql`). Prod: MySQL
**8.0** on Ubuntu, reached only via `ssh railway@93.127.198.125`. Claude cannot ssh
or sudo — the user runs those lines with `!`.

## What really happened on 2026-09-24

This Mac had **two** MySQL servers, both wanting port 3306:

| | Oracle MySQL 8.1.0 (old) | Homebrew MySQL 9.7 (now) |
|---|---|---|
| Binary / data | `/usr/local/mysql` → `mysql-8.1.0-macos13-x86_64`; data `/usr/local/mysql/data` (owner `_mysql`, needs sudo) | `/opt/homebrew/opt/mysql`; data `/opt/homebrew/var/mysql` |
| Started by | `/Library/LaunchDaemons/com.oracle.oss.mysql.mysqld.plist` at boot | `brew services` (`~/Library/LaunchAgents/homebrew.mxcl.mysql.plist`) |
| Architecture | **x86_64 — runs only under Rosetta 2** | arm64 native |
| Until 24 Sep | held 3306; **this is where bbtro/rrcms lived** (since Jul 2023) | crash-looped every ~10 s from 27 Jun: "Bind on TCP/IP port: Address already in use" (→ 83k empty `binlog.*` files, 220 MB `.err`) |

Timeline (IST): 08:53 old server shut down cleanly for the reboot → 08:53–08:58 macOS
27 installed → 09:03 `Rosetta flplugin: daemon port null!` (Rosetta no longer
installed) → the 8.1 LaunchDaemon cannot spawn (`last exit code = 78`) → 09:07:59
Homebrew 9.7 gets 3306 **for the first time ever** and the apps connect to its empty
datadir. Earlier macOS updates kept Rosetta, so the 8.1 server kept starting.

The old datadir (listed 2026-09-25) holds `bbtro` (last write 23 Sep 07:54, ~236
table files vs 182 tables in the rebuild), `rrcms` (10 Sep), and four databases not
rebuilt at all: `bbtro_dev`, `brain_game_data`, `employee`, `schlwork`.

**Do not delete `/usr/local/mysql` or its data until §9 is finished.**

---

## 0. Diagnose before touching anything

```bash
mysql -u root -p -e "show databases"          # only the 4 system schemas = wrong server, or wiped
lsof -nP -iTCP:3306 -sTCP:LISTEN              # WHICH mysqld holds 3306? (path tells 8.1 vs 9.7)
pgrep -lf mysqld
arch -x86_64 /usr/bin/true || echo "Rosetta missing"   # the 8.1 server needs it
sudo launchctl print system/com.oracle.oss.mysql.mysqld | grep -E "state|last exit"
ls -la /opt/homebrew/var/mysql/  ;  sudo ls -la /usr/local/mysql/data
```

A missing database is far more likely a server switch than a wipe: check `auto.cnf`
and the `mysql/` folder dates — if they are old, the datadir was not re-initialised.

Backups on this Mac: `~/rrcms19/backups/` (prod pulls, may be stale — check the
dates) and `~/rrcms19/backups/local/` (nightly local dumps, since 2026-09-25).

## 1. Take fresh prod dumps (user runs with `!`)

`--no-tablespaces` because the prod app user lacks PROCESS. **Two files for
bbtro**: everything except `div_signal_aliases`, then that table row-by-row —
see §5 for why.

```bash
ssh railway@93.127.198.125 'cd ~/bbtro && set -a; . ./.env; \
  mysqldump -u "$DB_USER" -p"$DB_PASSWORD" --no-tablespaces --single-transaction --routines --triggers \
    --ignore-table="$DB_NAME".div_signal_aliases "$DB_NAME" | gzip > /tmp/bbtro-prod-$(date +%F).sql.gz && \
  mysqldump -u "$DB_USER" -p"$DB_PASSWORD" --no-tablespaces --single-transaction --skip-extended-insert \
    "$DB_NAME" div_signal_aliases | gzip > /tmp/bbtro-aliases-$(date +%F).sql.gz && ls -la /tmp/bbtro-*.sql.gz'

ssh railway@93.127.198.125 'cd /opt/rrcms && set -a; . ./.env; \
  mysqldump -u "$DB_USER" -p"$DB_PASSWORD" --no-tablespaces --single-transaction --routines --triggers \
    "$DB_NAME" | gzip > /tmp/rrcms-prod-$(date +%F).sql.gz && ls -la /tmp/rrcms-prod-*.sql.gz'

scp railway@93.127.198.125:/tmp/bbtro-prod-DATE.sql.gz railway@93.127.198.125:/tmp/bbtro-aliases-DATE.sql.gz \
    railway@93.127.198.125:/tmp/rrcms-prod-DATE.sql.gz ~/rrcms19/backups/
```

(rrcms lives at `/opt/rrcms` on prod. Do not use zsh `{a,b}` expansion in scp — it
silently copied only the first file.)

Verify: `gzip -t` each, and `gzip -dc X | grep -c '^CREATE TABLE'` (bbtro ≈ 169
without aliases, rrcms ≈ 97).

## 2. Recreate databases and accounts (root)

```sql
CREATE DATABASE bbtro;
CREATE DATABASE rrcms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jay'@'localhost' IDENTIFIED BY '<CLAUDE.md password>';
GRANT ALL ON bbtro.* TO 'jay'@'localhost';
GRANT ALL ON rrcms.* TO 'jay'@'localhost';           -- jay does the loads; the app uses rrcms_app
CREATE USER 'rrcms_app'@'localhost' IDENTIFIED BY '<password from ~/rrcms19/rrcms-app/.env>';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES, DROP ON rrcms.* TO 'rrcms_app'@'localhost';
GRANT RELOAD ON *.* TO 'jay'@'localhost', 'rrcms_app'@'localhost';   -- mysqldump --single-transaction on 9.x
SET GLOBAL log_bin_trust_function_creators = 1;      -- triggers; also in /opt/homebrew/etc/my.cnf
FLUSH PRIVILEGES;
```

## 3. Load bbtro — the four 9.7-vs-8.0 traps

A plain `gzip -dc | mysql` of the prod dump **fails four times** on MySQL 9.x.
Each stop is loud; none loses data if you restart from the top.

| Stops at | Why | Fix |
|---|---|---|
| `div_ctr_legs`: *disallowed function md5 in generated column* | 9.x refuses `md5()` in a GENERATED column | rewrite that one line to `sha2(...,256)` + `char(64)` while piping (filter below). Owed on prod: change it there too. |
| first trigger: *need SUPER, binary logging enabled* | error 1419 | `log_bin_trust_function_creators=1` (§2) |
| first procedure: *SUPER or ALLOW_NONEXISTENT_DEFINER* | objects carry `DEFINER=railway_user@localhost`, a prod-only account | strip `DEFINER=...` while piping |
| views come out as `select 1 AS col` stubs | the load died before the "Final view structure" section | replaying the view section fixes them |

One pass that handles all four:

```bash
cat > /tmp/fix_dump.py <<'PY'
import sys, re
for line in sys.stdin.buffer:
    if line.startswith(b'  `leg_fingerprint` char(32) GENERATED ALWAYS AS (md5('):
        line = line.replace(b'char(32)', b'char(64)', 1)
        line = re.sub(rb'AS \(md5\((.*)\)\) STORED', rb'AS (sha2(\1,256)) STORED', line, count=1)
    line = re.sub(rb'DEFINER=`[^`]*`@`[^`]*` ?', b'', line)
    sys.stdout.buffer.write(line)
PY
gzip -dc ~/rrcms19/backups/bbtro-prod-DATE.sql.gz | python3 /tmp/fix_dump.py | mysql -u jay -p bbtro
```

Verify (expect ≈ 169 tables, 9 views, 5 triggers, 3 procedures; no view may count 1):

```sql
SELECT (SELECT COUNT(*) FROM information_schema.tables  WHERE table_schema='bbtro' AND table_type='BASE TABLE') t,
       (SELECT COUNT(*) FROM information_schema.views    WHERE table_schema='bbtro') v,
       (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema='bbtro') tr,
       (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema='bbtro') r;
SELECT COUNT(*) FROM motormen;   -- ~800, not 1
```

`memu_pattern_summary` legitimately shows 1 row: it is a `select 1` stub **on prod
too** (pre-existing breakage, not a restore fault).

## 4. Load `div_signal_aliases` (the table with duplicates)

Prod has 21 pairs of rows that violate the table's own UNIQUE key (bulk-loaded
with checks off in July 2026 — full story in `~/rrcms19/bbtro-restore-fault.md`).
A normal dump loads that table as one multi-row INSERT, which is rejected whole;
with `--force` the table silently comes back **empty**. Hence the row-by-row dump:

```bash
gzip -dc ~/rrcms19/backups/bbtro-aliases-DATE.sql.gz | mysql -u jay -p --force bbtro 2>&1 | grep -c 'ERROR 1062'
# expect 21 skipped; then:
mysql -u jay -p bbtro -e "SELECT COUNT(*), COUNT(DISTINCT normalized_alias) FROM div_signal_aliases"   -- 2662 2662
```

This keeps the first of each pair. For the three Lonavala pairs (LNLS68/69/70) that
is an arbitrary choice; the real fix is on prod (§7).

## 5. Replay the local-only schema (trip-shed)

Trip-shed exists only locally until it ships. Its schema is entirely in dated
`sql/` files on master — replay in this order, stopping on the first error:

```
sql/2026-08-31_trip_shed_vvh.sql          ← the FULL base (fixed on master 6351eea; the
sql/2026-09-18_trip_shed_vvh_step2 … step10 (numeric order, not alphabetical)   earlier copy was a stripped cut)
sql/2026-09-21_trip_shed_vvh_step11, step12
```

Then confirm every column the code references exists — the quick way is to start
the app and open `/div/trip-shed.html`. Rows entered into trip-shed since the last
backup are gone; the schema and templates are not.

## 6. Load rrcms

No DEFINERs in its dump, but `LOCK TABLES` needs more than `rrcms_app` has, so load
as `jay`:

```bash
gzip -dc ~/rrcms19/backups/rrcms-prod-DATE.sql.gz | mysql -u jay -p rrcms
cd ~/rrcms19/rrcms-app && node db/migrate.js status     # nothing pending
```

## 7. What stays different from prod until prod is fixed

| Item | Local (9.7) | Prod (8.0) | Fix |
|---|---|---|---|
| `div_ctr_legs.leg_fingerprint` | sha2, char(64) | md5, char(32) | change prod to sha2 (dated sql); it also blocks upgrading prod's MySQL |
| `div_signal_aliases` | 2,662 rows | 2,683 (21 dupes) | delete the 18 re-imports; resolve the 3 Lonavala `div_signals` duplicates (signal numbers are unique — one record of each pair is wrong); rebuild |
| view/procedure DEFINER | jay | railway_user | expected; nothing to do |

After those two prod fixes: re-dump, reload local with this runbook (§3's filter
then becomes a no-op), rehearse a `--force`-free restore into a scratch database,
and only then upgrade prod's MySQL.

## 8. Backups now

- **Local, nightly 02:00**: `~/rrcms19/backups/local/mysql-local-backup.sh` via
  launchd `in.crtms.mysql-local-backup`; both DBs, 14 days kept, FAIL logged if
  mysqldump exits non-zero. Check `backup.log` occasionally.
- **Prod pulls** into `~/rrcms19/backups/` (launchd job from the rrcms deploy kit)
  — failing on rsync since 2026-09-22; to be fixed.
- rrcms is **not in git** anywhere: code is `~/rrcms19/rrcms-app` and `/opt/rrcms`.

## 9. Recover the old 8.1 data (done 2026-09-26)

Run the old server by hand on **port 3307** so it never competes with 9.7 on 3306.

```bash
sudo cp -a /usr/local/mysql/data ~/mysql81-data-copy-2026-09-24      # safety copy first
sudo launchctl bootout system/com.oracle.oss.mysql.mysqld             # stop boot-time start
softwareupdate --install-rosetta --agree-to-license                   # 8.1 is x86_64
sudo -u _mysql /usr/local/mysql/bin/mysqld --basedir=/usr/local/mysql \
  --datadir=/usr/local/mysql/data --plugin-dir=/usr/local/mysql/lib/plugin \
  --early-plugin-load=keyring_file=keyring_file.so \
  --keyring-file-data=/usr/local/mysql/keyring/keyring \
  --port=3307 --socket=/tmp/mysql81.sock --mysqlx=OFF \
  --log-error=/usr/local/mysql/data/recovery.err &
```

Then (Claude can do these, no sudo):

1. Connect: `mysql -h 127.0.0.1 -P 3307 -u jay -p` (old accounts, old passwords).
2. List tables in old `bbtro` that are not in the rebuilt one (~50 expected); decide
   keep/drop with the user.
3. Compare trip-shed row counts old vs new; the old server has entries up to 23 Sep
   that the prod rebuild lacks.
4. Dump old `bbtro`, `rrcms`, and whichever of `bbtro_dev`/`brain_game_data`/
   `employee`/`schlwork` the user wants, to `~/rrcms19/backups/old81-*.sql.gz`.
5. Show the missing rows **before** loading anything into 9.7; load only what is
   agreed.
6. Stop the old server: `mysqladmin -h 127.0.0.1 -P 3307 -u root -p shutdown`.
7. After everything is verified: retire 8.1 for good (keep the LaunchDaemon booted
   out; archive the data copy), so two servers never fight over 3306 again.

### 9a. What was done on 2026-09-26

- Datadir copied to `~/mysql81-data-copy-2026-09-24` (diff-identical); LaunchDaemon booted out; Rosetta installed; 8.1 started on 3307, dumped, shut down.
- Dumps: `~/rrcms19/backups/old81-{bbtro,rrcms,bbtro_dev,brain_game_data,employee,schlwork}-2026-09-23.sql.gz`
  (bbtro needs `--force`: view `div_active_staff` was already broken on 8.1).
- Old bbtro loaded into local **`bbtro_old`** (234 tables, counts identical). 9.7 refuses the FK
  `div_timetable_halts → div_timetable_trains(train_number)` (non-unique key): load with
  `SET SESSION restrict_fk_on_non_standard_key=OFF`.
- Merged into local `bbtro` (backup before: `backups/local/bbtro-2026-09-26_1124.sql.gz`):
  65 local-only tables + data; columns `users.can_access_ghat_spm`, `trains.train_code/service_type`,
  `div_training_records.source_course_id`, `div_cr_loco_transfers.created_by`; 10 views; 3 procedures;
  rows per `~/rrcms19/backups/local-merge-2026-09-26.sql` (training centre + prod-empty tables).
- Not merged, still in `bbtro_old`: `div_sub_spm_points` (orphan test runs, unused by code), trip-shed
  and counselling test rows, 24 other user logins, and old-only rows in prod-used tables (prod wins).
- **rrcms (checked 2026-09-29, nothing merged):** masters and contract setup match today's local by
  natural code (only ids differ); prod's later edits kept. Old-only data was dev logins, test entries
  (21 Aug–10 Sep) and 350 `call_sheet_trains` rows. **Decision 2026-09-29: do not copy the call
  sheet.** Those rows came from the static pilot file `rrcms-app/data/pilot/call-sheet.json`
  (`import-call-sheet.js --file`), which still exists. The call sheet is to be generated from bbtro
  instead: create `v_rr_call_sheet` (rrcms-app `db/crtms/v_rr_call_sheet.sql`, reads
  `div_loco_link_master`; never yet created anywhere), dry-run `node db/import-call-sheet.js`,
  compare with the pilot file. By design it is a re-runnable import, not a live read. The
  temporary `rr_*` comparison tables were dropped from `bbtro_old`; the full old rrcms remains in
  `~/rrcms19/backups/old81-rrcms-2026-09-23.sql.gz`.
- **Old 8.1 can no longer start at boot** (done 2026-09-29): `launchctl disable
  system/com.oracle.oss.mysql.mysqld` and its plist moved to `/Library/LaunchDaemons.disabled/`.
  (A plain `bootout` does not survive a restart, and with Rosetta back the 8.1 server would have
  retaken 3306 at boot, pointing the apps at the 23 Sep data.) After any restart check
  `lsof -nP -iTCP:3306 -sTCP:LISTEN` shows the Homebrew mysqld.
- **None of this is on prod.** Prod has none of the 65 tables / 5 columns: moving a feature to prod
  = schema first (dated `sql/` file), then only the data the user picks, one feature at a time.

## 10. Which MySQL going forward

**Local stays on Homebrew 9.7.** The 8.1 build is x86_64, depends on Rosetta (Apple
is winding Rosetta down after macOS 27), and 8.1 was a short-lived innovation release
that no longer gets fixes. Recovery (§9) only reads from it, then it is retired.

The real gap is **prod 8.0 vs local 9.7** — that caused every trap in §3. Close it by
upgrading prod (after the two prod fixes in §7), to 9.7 so both sides match. Until
then, keep using §3's filter for prod → local copies.
