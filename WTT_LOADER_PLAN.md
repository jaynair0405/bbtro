# WTT Halts Loader — Plan & Coverage (`div_train_stops`)

Loads `data/wtt_db_data.csv` (working-timetable halt timings) into `div_train_stops`,
keyed by `train_id`. Part of the loco-link train_id rebuild (Step 5b).
See [LOCO_LINK_ARCHITECTURE_REVIEW.md](LOCO_LINK_ARCHITECTURE_REVIEW.md) §2.2.

Date: 2026-06-17. Source file: 2946 rows, 422 distinct train numbers.

**Status: ✅ loaded locally 2026-06-17** — 2946 stops across 422 trains; 268
next-day stops (midnight crossers); 3 trains auto-created (`61026`, `DO`, `MR`).
Ordering verified on appended+midnight (`12167`), appended (`11079`), midnight
(`20693`), UP reverse-listing (`10104`). Pending: run on production.

## Coverage status

| Boundary | Anchor → target | Status |
|---|---|---|
| SE (Pune) | LNL → PUNE | ✅ complete — 144/144 |
| NE (Manmad) | IGP → MMR | ✅ complete — 168/168 |
| KR (Ratnagiri) | ROHA → RN | ✅ complete — 86/92; the 6 "missing" are `61010–61016` ROHA⇄DIVA MEMU shuttles that terminate at ROHA (correctly no RN) |

### ⏳ PENDING — JL (Jalgaon) and BSL (Bhusaval) timings — TODO (user to prepare)
The WTT does **not** yet carry JL / BSL halt timings (NE section beyond Manmad).
No trains currently have these stations in the CSV. To be prepared and **appended
to the CSV + re-loaded later** — the loader is idempotent per train, so a top-up
load only needs the new rows. No schema change required to add them.

## Data decisions (settled with user)
- **Direction is per-stop.** Mumbai-division working terminology labels some terminal
  rows with the "opposite" direction (e.g. PNVL on 11031/11032, BSR on DO/MR) — this
  is operationally correct, not an error. Loader groups by **`train_no` → `train_id`**
  (NOT by direction) and stores the row's `direction` on each stop.
- **DO / MR** (Deccan Odyssey, Maharaja) kept as alphanumeric `train_no`; blank
  origin/destination is fine. No renumbering.
- **MEMU / 61xxx / 69xxx kept** even though not directly control-office trains.
- **Dwell times** (>20 min halts) reviewed against WTT and confirmed correct
  (regulation/precedence halts). User may update individually later.

## Quirks the loader absorbs (no source edits needed)
- **Row ordering**: ~18 trains list a station out of journey order ("appended block").
  Loader computes `seq_order` by **sorting each train's stops by time**, so order
  self-corrects.
- **Midnight crossings**: detected during the time-sort → `day_offset` incremented
  (0 = departure day, 1 = next day, …).
- **`event_type` normalization**: `arrive`→`arrive_or_pass` (already mostly fixed at source).
- **`train_name` variants** (~9 trains, e.g. `CSMT-MAO` vs `CSMT-MAO EXP`): loader
  picks the longest/canonical form per train.

## Schema changes needed before load
1. `div_train_stops.event_type` enum currently `('halt','pass_or_depart')` →
   **add `'arrive_or_pass'`**.
2. **Add `direction` column** to `div_train_stops` (`ENUM('UP','DN')` nullable) for the
   per-stop direction.
3. **Add `TGR 2`, `TGR 3`** to `div_stations` (cabin signals; the only 2 of 34 WTT
   station codes not already present). Codes contain a space — kept verbatim to match CSV.

## Loader algorithm
1. Read CSV; group rows by `train_no`.
2. Resolve `train_no` → `train_id` via `div_trains` / `div_train_aliases`
   (alias-aware). If a WTT train isn't catalogued, create a minimal `div_trains` row
   (number + canonical name + first-seen direction) + alias.
3. Per train: sort stops by clock time, tracking midnight rollover → `seq_order` + `day_offset`.
4. Normalize `event_type`; map blank arr/dep → NULL TIME.
5. Mark `is_mumbai_segment_start/_end` where derivable (optional, later pass).
6. Upsert into `div_train_stops` keyed on `(train_id, seq_order)` — idempotent, so
   re-runs and JL/BSL top-ups are safe.

## Re-run / top-up
Loader is safe to re-run. For JL/BSL (or any future additions): append rows to the
CSV and re-run — only affected trains change.
