# Loco Availability & Assignment — 2026-07-20

Deployed to prod 2026-07-20. Commits `f14223a`, `ed6b950`, `02c2b6d`, `49dcb70` on `master`.

---

## 1. The reported problem

> "even after assigning to another train, the loco still shown available at sheds"

Locos assigned to a DN train kept appearing as available, so the terminal lists
grew without bound. The LPC was clearing them by hand: on **2026-07-19 between
19:15 and 19:54, `bblpc1` made 367 MANUAL position moves**, dropping the
terminals from 223 locos to 58. The week before that showed 673 MANUAL moves
against only 102 DEPARTUREs. That manual clearing was routine work caused
entirely by this bug.

### Root cause

`GET /assigned-today` decided "is this loco assigned?" with:

```sql
SELECT DISTINCT actual_loco_no FROM div_loco_link_log
WHERE direction = 'DN' AND working_date = ? AND actual_loco_no IS NOT NULL
```

Three classes of booking were invisible to it:

1. **Rear locos** — `actual_loco_no_rear` was never checked.
2. **Anything not dated exactly today** — links are entered ahead of the
   departure, often on the arrival day or for tomorrow's train. That is most
   bookings. (18-07 had 54 DN front-locos; 19-07 had 8. On the 19th the query
   saw 8 and read the other 54 as available.)
3. **Propagated rows** — `propagateLoco()` writes the loco onto the outgoing DN
   train but never fires a position update, so the loco stays parked.

It also trusted `div_loco_positions.current_location`, which cannot be trusted —
see §4.

### The fix

Availability is now derived from **bookings**, not position. A loco standing at
a terminal is out of the pool if it appears — front or rear, including `X+Y`
couplers — on a DN link row dated on/after the day it arrived. The arrival date
is the anchor and self-corrects: a loco that really left and came back gets a
fresh `arrived_at`, which ages out its old bookings.

Shared predicate `BOOKED_OUT_EXISTS` in `routes/division/locoLinkRoutes.js`,
used by `/assigned-today` and `/available`.

Effect on prod's 19-07 data: flagged **2 → 108**.

### Also fixed

**Dropped locos come back** (`ed6b950`). Changing a link's loco used to strand
the replaced one at `OUT_OF_DIV` while it stood at the terminal. `POST /log` now
captures the row's locos before the upsert and restores any that are no longer
on it. A loco moving front → rear is **not** dropped — a failed loco left
attached and towed dead leaves with the train and correctly stays out.

---

## 2. Loco Assignment Board

`/control-office/loco-assign.html` — the loco-first inverse of the daily sheet.
Locos standing at a terminal on the left, that terminal's DN workings on the
right, counts across the top (in loco **slots**, not trains — a push-pull
working with one loco still needs another).

Writes go through `POST /log`, the same endpoint the sheet uses, so the DN sheet
fills itself and propagation, position tracking, the duplicate-loco guard and
the dropped-loco restore all apply unchanged. **No parallel write path.**

### Traps already handled — do not regress

- **`POST /log` rewrites the whole row.** Any field omitted from the payload
  becomes NULL. The board echoes back `incoming_train`, `outgoing_train`,
  `outgoing_train_rear`, `remark`, `remarks_rear`, `failed_in_division` on every
  save. Verified: assigning to 12071 preserved `incoming_train = 12702`.
- **`secondary_role='rear'` is push-pull only.** The API rejects it on an
  ordinary working (400). Roles offered follow the train: rear/coupler/assist/
  dead_in_tow for push-pull, coupler/assist/**assist default** for the rest.
- **The loco list is not date-filtered.** A loco standing three days is as
  assignable as one that arrived this morning. The date picks which DN *sheet*
  is being written, nothing else.
- **No confirm click.** The board reloads after every save; the "add another
  loco" strip is rebuilt from that fresh data. An earlier "Done" button both
  cost a click and left the board stale until pressed.

### Known limit

The schema holds **two** locos per working (`actual_loco_no` +
`actual_loco_no_rear`). A third rides in the rear field as `"X+Y"` — rare (2
rows in two months, both UP ghat assists). Position tracking still follows only
the first part. A child table (`div_loco_link_locos`) is the proper fix; revisit
if multi-loco entry becomes common.

---

## 3. DR stables at VVH

Dadar terminates nine train pairs but has no stabling shed. Locos run light to
VVH for maintenance and light back to DR to attach. Occasionally a loco is held
at DR itself and worked out from there.

- Arrivals at DR (and DR loco-change stations) position at **VVH**
  (`stablingTerminal` in `locoLinkRoutes.js`).
- DR-originating workings list on the **VVH** board.
- VVH and DR are treated as **one pool** — a loco held at DR still appears on
  the VVH board, badged `AT DR`, so the rare case stays assignable.
- `sql/2026-07-20_dr_locos_to_vvh.sql` moved the locos already at DR. Ran on
  prod 2026-07-20 — 1 loco (22926). Rollback tag: `updated_by = 'dr-to-vvh'`.

### OPEN QUESTION — eight trains on the wrong board?

`div_trains` says nine DN trains depart DR. In `div_loco_link_master` only
**11003** has `from_station = 'DR'`. The other eight —
**11005, 11021, 11027, 11035, 11041, 12131, 17318, 22147** — are recorded as
`from_station = 'LTT'` on the `LTT-DN` sheet.

So only 11003 moved to the VVH board. The other eight list on the LTT board
while their locos (arriving on DR-terminating UP trains 11006/11022/11028/
11036/11042/12132/17317/22148) now stand at VVH. An LPC on the LTT board will
not see them.

Two readings, unresolved:

- **Master data is stale** — they really start at DR and belong on the VVH board
  like 11003. One-line fix: prefer `div_trains.from_station` in `originOf()`.
- **Master is deliberate** — administered under LTT for sheet purposes, and
  something else supplies their locos at LTT.

This is pre-existing and nothing regressed, but if it is the first reading then
eight workings a day sit on the wrong board.

---

## 4. WATCH THIS — next review due 2026-07-27

**The measure of whether this worked is whether the LPC stops clearing by hand.**

```sql
SELECT DATE(moved_at) AS day, movement_type, COUNT(*) AS n, moved_by
FROM div_loco_position_history
WHERE moved_at >= CURDATE() - INTERVAL 14 DAY
GROUP BY day, movement_type, moved_by
ORDER BY day DESC, n DESC;
```

**How to read it**

| Result | Meaning | Action |
|---|---|---|
| `MANUAL` drops toward zero | The booking fix carried it | Nothing further |
| `MANUAL` stays ~300/week | Ghosts still forming | Do the derivation change below |
| `DEPARTURE` roughly matches `ARRIVAL` | Position tracking is healthy | — |
| `ARRIVAL` still far exceeds `DEPARTURE` | Locos still not checking out | Derivation change |

Baseline before the fix (week to 2026-07-19): ARRIVAL 327, DEPARTURE 102,
MANUAL 673.

Also useful — how full the terminals look:

```sql
SELECT current_location, COUNT(*) AS locos,
       SUM(arrived_at < CURDATE() - INTERVAL 3 DAY) AS standing_3plus_days
FROM div_loco_positions
WHERE current_location IN ('CSMT','LTT','DR','PNVL','VVH','KYN','TNA')
GROUP BY current_location WITH ROLLUP;
```

`standing_3plus_days` is the ghost count. It was **125 of 223** on 19-07.

> Note: VVH held only 1 loco right after deployment. That is the aftermath of
> the LPC's 367 manual clearings on 19-07, not the new code — the pool refills
> as UP trains are entered.

---

## 5. The remaining debt — position tracking

**`div_loco_positions.current_location` is still unreliable.** It is mutable
state written by an unordered event stream in `updateLocoPosition()`:

1. `propagateLoco()` never calls it at all — auto-created DN rows leave the loco
   parked forever.
2. Departure can fire **too early**. If the DN row is saved before the loco
   arrives, the guard `if (fromLocation === location && movementType !== 'MANUAL')`
   no-ops it (the loco is already OUT_OF_DIV); the later arrival then overwrites,
   and the real departure never generates a second event.
3. `ARRIVAL` is **replayable** — re-saving a log row with unchanged values
   re-fires the position update without bumping `updated_at`.

Today's fix works *around* this by not consulting position for availability. It
does not repair the position data. Locos that leave without any DN link entry
(light engine to shed, transfer out, link not filled) will still read as
available.

**Durable fix, not yet done:** derive current position from the daily sheets
(latest log row per loco by `working_date` + `event_time`) instead of maintaining
mutable state. Blast radius is small and was verified — `div_loco_positions` is
touched by only:

- `routes/division/locoLinkRoutes.js` — one writer (`updateLocoPosition`);
  readers `/positions`, `/position/:n`, `/position/:n/history`, `/available`,
  `/assign-board`, `/schedule-due`, `PATCH /loco-planning`
- `public/control-office/schedule-due.html`

Nothing in slate / midnight-position / crew modules — those match on the word
"availability" but mean **staff**, not locos.

**Deliberately NOT done:** making `propagateLoco` fire a position update.
Propagation often targets *tomorrow's* DN train, so it would mark a loco
OUT_OF_DIV a day before it physically leaves — making position less truthful to
fix a symptom the booking query already handles.

---

## 6. Files

| Path | Role |
|---|---|
| `routes/division/locoLinkRoutes.js` | `BOOKED_OUT_EXISTS`, `stablingTerminal`, `restoreDroppedLocoPosition`, `GET /assign-board` |
| `public/control-office/loco-assign.html` | Assignment board |
| `public/control-office/loco-availability.html` | Availability page (badge names the train + date) |
| `sql/2026-07-20_dr_locos_to_vvh.sql` | DR → VVH move. **Run on prod 2026-07-20** |
| `sql/2026-07-20_stale_loco_positions_cleanup.sql` | One-time ghost mop-up. **NOT run** — the LPC had already cleared prod by hand. Kept for next time |
