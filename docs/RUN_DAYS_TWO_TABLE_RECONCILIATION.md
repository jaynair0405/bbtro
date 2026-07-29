# run_days two-table reconciliation — deferred inspection

**Status:** open / deferred. The acute bug is fixed; ~97 unexplained divergences
remain to be inspected. This doc is the pick-up point for a fresh session.

---

## Background — what's already done

`run_days` (a train's weekly calendar, e.g. `1,3,6` = Mon/Wed/Sat, or `DAILY`)
is stored in **two** tables:

| Table | Column | Written by | Read by |
|---|---|---|---|
| `div_trains` | `run_days` | **Settings** (`PUT /trains`, `routes/division/locoLinkRoutes.js:4877`) | Settings display; loco-management |
| `div_loco_link_master` | `run_days` | the sheet's own edits | **the daily sheet** (`runsToday(m.run_days, dow)`, 6 filter sites) |

They drifted. An LPC curtailed a few KR trains for the **monsoon timetable** in
Settings (→ `div_trains`), but the sheet reads the master copy, so the change
never showed (22120 still ran Tuesday though Settings said 3,5,7).

**Fixed (on master, deployed):**
- **`38bee28`** — `PUT /trains` now *writes through* to `div_loco_link_master`
  for the fields that mean the same thing in both tables: **`run_days`,
  `train_name`, `traction_type`**. So future Settings edits reach the sheet.
  Deliberately does NOT mirror `from_station`/`to_station` (div_trains = real
  origin; master = LPC handover point — see [[bbtro_station_reference_levels]])
  or `direction` (train-level vs per-row).
- **`75512c1`** (`sql/2026-07-29_kr_monsoon_run_days_sync.sql`) — targeted
  one-time sync of the 3 confirmed monsoon KR trains: **22120** → 3,5,7,
  **11099** → 5,7, **11100** → 1,6. Applied local + prod.

The sheet still reads `div_loco_link_master.run_days`; write-through keeps it in
step going forward. We deliberately did **not** switch the sheet to read
`div_trains` wholesale, because `div_trains.run_days` is unreliable (below).

---

## What remains — the ~97 divergences

Snapshot (local == prod, 2026-07-29), after the 3-train sync:

| # | Category | Count | KR | Action |
|---|---|---|---|---|
| 1 | Settings **BLANK** (specials; sheet uses master) | 28 | 0 | ignore — no `div_trains` calendar, master is correct |
| 2 | **DAILY-equivalent** (`DAILY` vs `1,2,3,4,5,6,7`) | 3 | 1 | cosmetic only — no behavioural diff |
| 3 | Settings **SINGLE day** vs master multi-day | 94 | 8 | **the real work — see below** |
| 4 | Settings **multi-day, genuinely differs** | 2 | 2 | per-train decision (named below) |
| 5 | Settings **non-numeric text** (bad data) | 3 | 0 | fix the text (named below) |

> Note: the totals shift slightly as trains are fixed. Regenerate with the query
> at the bottom.

### Category 3 (94 trains) — the core problem
`div_trains.run_days` holds only a **single day** while the sheet has the full
multi-day calendar. Examples: `11005` sheet `1,5,7` / settings `1`; `22107`
sheet `1,2,4,7` / settings `1`; `12811` sheet `1,7` / settings `1`.

These are **not** curtailments — `div_trains.run_days` was populated
incompletely (looks like only the first running day was imported). **The master
copy is the fuller, likely-correct calendar.**

**Decision needed (domain input):** which source is authoritative for these?
- If **master is correct** (probable — the sheet has run on it): do a
  *reverse* sync `div_trains.run_days ← div_loco_link_master.run_days` for these
  94, so Settings finally shows the true calendar. Then the LPC curtails from a
  correct baseline. **Do NOT sync the other direction** (master ← settings) —
  that would cut 94 trains to a single day and hide them most of the week.
- If some `div_trains` single-day values are actually right: those need per-train
  correction from the real timetable/WTT.

Recommended: confirm with the LPC that master is the correct calendar for a
sample, then reverse-sync the 94. Low risk (only fills incomplete `div_trains`;
the sheet is unchanged since it already reads master).

### Category 4 (2 trains) — genuine multi-day differences
| Train | Sheet | Settings | Note |
|---|---|---|---|
| `12202` (KR-UP) | `5,1` | `1,5` | **same set, only order** — normalize, not a real diff |
| `22119` (KR-DN) | `2,3,5,6,7` | `2,4,6` | real conflict — settings has day 4 the sheet lacks. **Ask LPC** which is right |

### Category 5 (3 trains) — bad data in div_trains (day-name text)
| Train | Sheet | Settings |
|---|---|---|
| `11032` (PNVL-UP) | `6` | `SAT` |
| `15659` (LTT-DN) | `7` | `SUN` |
| `15660` (LTT-UP) | `6` | `SAT` |

`runsToday` only matches numeric day tokens, so `SAT`/`SUN` never match — if any
of these were edited in Settings, the write-through would push the broken text
onto the sheet. **Fix in Settings**: `SAT`→`6`, `SUN`→`7`. Harmless today (sheet
reads the numeric master value).

---

## Regenerate the working list

Full divergences, KR first:
```sql
SELECT m.sheet_source, m.train_no,
       m.run_days AS sheet_shows, t.run_days AS settings_says
FROM div_loco_link_master m JOIN div_trains t ON t.train_no = m.train_no
WHERE m.active = 1 AND COALESCE(m.run_days,'') <> COALESCE(t.run_days,'')
ORDER BY (m.sheet_source LIKE 'KR%') DESC, m.sheet_source, m.train_no;
```

Categorized counts:
```sql
SELECT CASE
    WHEN t.run_days IS NULL OR t.run_days='' THEN '1 blank'
    WHEN t.run_days REGEXP '[A-Za-z]' AND t.run_days<>'DAILY' THEN '5 non-numeric'
    WHEN (t.run_days='DAILY' OR t.run_days='1,2,3,4,5,6,7')
         AND (m.run_days='DAILY' OR m.run_days='1,2,3,4,5,6,7') THEN '2 daily-equiv'
    WHEN t.run_days NOT LIKE '%,%' THEN '3 settings-single-day'
    ELSE '4 multi-day-differs' END AS category,
  COUNT(*) n, SUM(m.sheet_source LIKE 'KR%') kr
FROM div_loco_link_master m JOIN div_trains t ON t.train_no = m.train_no
WHERE m.active = 1 AND COALESCE(m.run_days,'') <> COALESCE(t.run_days,'')
GROUP BY category ORDER BY category;
```

---

## Also related / deferred

- **"Monsoon timing" marker.** The LPC wants seasonal curtailments flagged so
  they can be identified and reverted after the monsoon. To be built **after**
  this reconciliation — otherwise every drifted row would read as "monsoon".
  Monsoon applies to **KR trains only**. Ties to the deferred monsoon-timetable
  feature (WTT has no seasonal-variant support either — 22630 LTT 15:00 vs 17:20
  monsoon).
- **Long-term:** once `div_trains.run_days` is trustworthy for all trains, the
  sheet could read it directly (single source) and drop the master copy — but
  that is blocked until the 94 are reconciled.

## Commits / files
- `38bee28` write-through · `75512c1` + `sql/2026-07-29_kr_monsoon_run_days_sync.sql`
- Filter sites reading `run_days`: `runsToday` at `locoLinkRoutes.js` lines
  ~765, ~1161, ~1297, ~1530, ~2360, ~2964 (all read `m.run_days`).
