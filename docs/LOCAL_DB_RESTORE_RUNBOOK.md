# Local database restore runbook (bbtro + rrcms)

Written 2026-09-25 after the macOS 26.2 → 27 upgrade on 24 Sep re-initialised the
Homebrew MySQL data directory. `bbtro`, `rrcms` and the `jay` account vanished with
no error in the log — just a fresh datadir at 09:07 IST. Nothing local had ever
been backed up. This is the procedure that rebuilt both databases, kept so the next
time is a checklist and not a day's archaeology.

Local: MySQL **9.7** (Homebrew). Prod: MySQL **8.0** on Ubuntu, reached only via
`ssh railway@93.127.198.125`. Claude cannot ssh — the user runs those lines with `!`.

---

## 0. Diagnose before touching anything

```bash
mysql -u root -p -e "show databases"          # only the 4 system schemas = wiped
ls -la /opt/homebrew/var/mysql/               # ibdata1 timestamp = when it was re-initialised
tail -50 /opt/homebrew/var/mysql/*.err        # look for "initialization has started" with no bbtro
```

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
