# WTT + train master — gaps and fixes (handover for a separate chat)

Written 27 October 2026 from the Trip Shed arrival-board work, where the gap showed up. Nothing below
has been changed yet — this is the brief for the WTT chat. Follow bbtro/CLAUDE.md (plan first, one step
at a time, dated `sql/` file for every data change, label local vs prod).

**First step in the new chat: verify every count below on PROD** (user runs `! ssh railway@93.127.198.125
'cd ~/bbtro && …'`). The figures here are from the LOCAL database, which may be older than prod — see
memory `bbtro_local_prod_sync_trap.md`.

## 0. Status, 29 October 2026

- **Prod verified:** 503 active trains, **81** with no WTT stops, **24** of them regular (local had 495 / 73 / 24 —
  8 trains exist only on prod, all without stops; §6 is the local list and is missing them).
- **01025/26/27/28 renumbered** — they were regularised as 11043/44/47/48 (LPC added the new numbers on 17 Aug
  but never ended the old rows). `sql/2026-10-29_renumber_01025-28_to_11043-48.sql`, run local + prod
  (commit 495752f): old link rows end 16 Aug (01027: 17 Aug), old trains `is_active=0`, 31 placeholder/duplicate
  sheet entries after the cut-off deleted, 4 real runs + 8 position rows renumbered. History up to the cut-off
  stays under the old numbers; backups in `*_bak_20261029_renum`. Supersedes §4.2.
- **01144 needs nothing** — prod has link row 518 effective 12 Oct – 24 Nov (local only had the old row ending
  3 Jul). Supersedes §4.3.
- **No one-stop / partial entries and no `source` column** (user decision). §3 times and §4.1 are dropped:
  stops get entered in full through the WTT edit UI (add/edit/delete, every field), which is the next build.
  Supersedes §4.1 and §4.4.

### Halts given by the user, to enter once the WTT edit UI exists (29 Oct)

Station order only — times still to come.

| Train | Halts |
|---|---|
| 01107 CSMT-BD One Way SPL | TNA, KYN, NK |
| 05557 RXL-LTT H/SPL | MMR, KYN, LTT |
| 05558 LTT-RXL H/SPL | LTT, KYN, MMR |
| 01463 LTT-TVCN H/SPL | LTT, TNA, PNVL, PEN, ROHA, KHED, CHI, SGMR, RN |

- **No halts needed:** 00199 Deccan Odyssey, E/COG (empty coaching).
- **Parcel trains, running:** 00111, 00112, 01149.
- **Finished holiday specials** are not coming back; a new holiday special is added fresh by the LPC as a
  new train. So specials with no recent run get ended (link row + `is_active=0`), not given a timetable.

## 1. The two tables

| Table | Grain | Holds | Filled by |
|---|---|---|---|
| `div_trains` (train master) | one row per train | number, name, direction, run days, `is_regular`, `is_active` | WTT import scripts; Control Office "add train" (`routes/division/locoLinkRoutes.js:~4984`); auto-created when an LPC types an unknown train on the daily sheet (`locoLinkRoutes.js:~2221`, `is_regular=0`) |
| `div_train_stops` (WTT) | one row per train per station | arrival, departure, `seq_order`, `day_offset`, platform, segment | **only** the import scripts `scripts/import-wtt.js`, `scripts/load_wtt_stops.js` (from the WTT book). No screen writes it. |

They are not duplicates: the WTT is the timetable detail under each train (`train_id`). The gap is that
a train added after the import gets a master row and **no stops**, because nothing in the app can add
stops. The WTT page (`public/control-office/wtt.html`) is read-only; its edit feature is pending —
memory `wtt_edit_feature_pending.md` (PUT/POST/DELETE `/wtt/stop`, re-run the circular-gap time sort so
`seq_order` + `day_offset` stay right, same logic as `scripts/load_wtt_stops.js`).

Also note: the link master's (`div_loco_link_master`) from/to and `event_time` are the **LPC handover
point** (LNL / IGP / ROHA …), not origin or terminal arrival (memory `bbtro_station_reference_levels.md`).
Anything that needs real arrival/departure times must read the WTT.

## 2. Size of the gap (LOCAL, 27 Oct 2026)

- 495 active trains in `div_trains`; **73 have no WTT stops**; **24 of those are regular** (`is_regular=1`).
- Full list (train, name, regular, link sheets) in §6.

## 3. Data the user has given (to load)

User, 27 Oct 2026: "all regular trains must be in WTT ideally; holiday specials are added by LPC/admin."
Arrival times at the Trip Shed's stations (only the terminal stop is known so far):

| Train | Name | Station | Arrival | Note |
|---|---|---|---|---|
| 20436 | PRYJ-LTT Amrit Bharat | LTT | 15:45 | regular |
| 22112 | AYC-LTT Amrit Bharat | LTT | 15:45 | regular |
| 13379 | DHN-LTT | LTT | 13:40 | regular |
| 11304 | SUR-LTT Weekly | LTT | 04:00 | regular |
| 11048 | GKP-DR | DR | 03:35 | regular |
| 11044 | BUI-DR Tri Weekly | DR | 03:35 | regular |
| 05557 | RXL-LTT H/SPL | LTT | 05:50 | special |
| 01026 | BUI-DR H/SPL | — | — | **not running now** |
| 01028 | GKP-DR H/SPL | — | — | **not running now** |

Still to come from the user: 01144 (no train master entry; local link ended it 03/07 yet it ran on
22/10), 01435 SUR-LTT H/SPL, 04151 CNB-LTT H/SPL — and the rest of the §6 list in due course.

## 4. Decisions for the WTT chat

1. **One-stop entries now vs full run later.** Loading only the terminal stop makes the arrival-board
   right at once, but the WTT page will show those trains with a single stop until the full run is
   entered. Proposed: load them, and mark them partial (e.g. a `remarks`/`source` value, or a list in
   this doc) so they can be found and completed.
2. **Ending 01026 / 01028**: set `effective_until` on their `div_loco_link_master` rows (and
   `div_trains.is_active=0` if they are gone for good) — Control Office data, dated sql.
3. **01144**: on local the link row ends 2026-07-03 and there is no `div_trains` row, but it ran on
   22/10 — check prod; extend the link row / add the train as needed.
4. **Specials flow**: when an LPC/admin adds a special (auto-create or the add-train form), there is no
   way to give it a timetable. Options: build the WTT edit feature (pending, best), or add an optional
   "arrival at terminal" field to the add-train form that writes one stop.
5. The other regular trains without stops (§6, including DN mates such as 11043, 11047, 11303, 13380,
   20435, 22111 and the BYPASS / CSMT ones) need their WTT entered — user to supply or load from the
   WTT book with the existing loader (idempotent).

## 5. Who depends on this

- **Trip Shed arrival board** (`feature/trip-shed-arrivals`, worktree `/Users/neeraja/bbtro-trip-shed-arrivals`,
  spec `docs/superpowers/specs/2026-10-26-trip-shed-arrival-board-design.md` §4): expected arrivals come
  from the link sheets, but arrival station + time + "from" come from the WTT. A train with no WTT stop is
  ordered by the handover time and shown "≈". 01026/01028 keep showing on the board while their link rows
  are active — ending those rows (§4.2) removes them; nothing else is needed on the trip-shed side.
- Control Office sheets, the WTT page, loco-link availability — all read `div_train_stops`.

## 6. Active trains with no WTT stops (LOCAL, 27 Oct 2026)

| Train | Name | Regular | Link sheets |
|---|---|---|---|
| 00113 | BIRD-MRZA Weekly Parcel SPL | yes | CSMT-DN |
| 00114 | MRZA-NGSM Weekly Parcel SPL | yes | CSMT-UP |
| 11043 | DR-BUI Tri Weekly | yes | LTT-DN |
| 11044 | BUI-DR Tri Weekly | yes | LTT-UP |
| 11047 | DR-GKP | yes | LTT-DN |
| 11048 | GKP-DR | yes | LTT-UP |
| 11203 | NGP-MAO Express | yes | BYPASS |
| 11204 | MAO-NGP Express | yes | BYPASS |
| 11303 | LTT-SUR Weekly | yes | LTT-DN |
| 11304 | SUR-LTT Weekly | yes | LTT-UP |
| 13379 | DHN-LTT | yes | LTT-UP |
| 13380 | LTT-DHN | yes | LTT-DN |
| 15087 | CSMT-SWV | yes | KR-DN |
| 15088 | SWV-CSMT | yes | KR-UP |
| 19057 | ST-MAJN Express | yes | BYPASS |
| 19058 | ST-MAJN Express | yes | BYPASS |
| 20153 | CSMT-REWA SF Express | yes | CSMT-DN |
| 20154 | REWA-CSMT SF Express | yes | CSMT-UP |
| 20435 | LTT-PRYJ AMRIT BHARAT | yes | LTT-DN |
| 20436 | PRYJ-LTT AMRIT BHARAT | yes | LTT-UP |
| 20685 | Gandhidham-Bengaluru SF express | yes | BYPASS-BSR-LNL |
| 20686 | Gandhidham-Bengaluru SF express | yes | BYPASS-LNL-BSR |
| 22111 | LTT-AYC Amrit Bharat | yes | LTT-DN |
| 22112 | AYC-LTT Amrit Bharat | yes | LTT-UP |
| 00111 | BIRD-SGTY Parcel SPL | no | CSMT-DN |
| 00112 | SGTY-BIRD Parcel SPL | no | CSMT-UP |
| 00171 | DR-SWV FTR SPL | no | NULL |
| 01003 | LTT-MAO SPL | no | KR-DN |
| 01004 | MAO-LTT | no | KR-UP |
| 01025 | DR-BUI H/SPL | no | LTT-DN |
| 01026 | BUI-DR H/SPL | no | LTT-UP |
| 01027 | DR-GKP H/SPL | no | LTT-DN |
| 01028 | GKP-DR H/SPL | no | LTT-UP |
| 01029 | CSMT-MAO H/SPL | no | NULL |
| 01030 | MAO-CSMT H/SPL | no | NULL |
| 01081 | CSMT-DNR | no | NULL |
| 01101 | BSL-MAO H/SPL | no | NULL |
| 01149 | BIRD-SGTY MIXED PARCEL | no | CSMT-DN |
| 01150 | SGTY-TNA MIXED PARCEL | no | CSMT-UP |
| 01161 | LTT-VLNK SPL | no | NULL |
| 01168 | RN-LTT Ganpati SPL | no | KR-UP |
| 01435 | SUR-LTT H/SPL | no | LTT-UP |
| 01436 | LTT-SUR H/SPL | no | LTT-DN |
| 01463 | LTT-TVCN H/SPL | no | NULL |
| 02197 | CBE-JBP H/SPL | no | BYPASS |
| 02198 | JBP-CBE H/SPL | no | BYPASS |
| 04115 | SFG-LTT H/SPL | no | NULL |
| 04116 | LTT-SFG H/SPL | no | NULL |
| 04151 | CNB-LTT H/SPL | no | LTT-UP |
| 04152 | LTT-CNB H/SPL | no | LTT-DN |
| 05557 | RXL-LTT H/SPL | no | LTT-UP |
| 05558 | LTT-RXL H/SPL | no | LTT-DN |
| 09013 | MMCT-TOK GANPATI SPL | no | BYPASS |
| 09019 | MMCT-SWV GANPATI SPL | no | BYPASS |
| 09110 | VS-RN GANPATI SPL | no | BYPASS |
| 09113 | RN-BRC GANPATI SPL | no | BYPASS |
| 09114 | BRC-RN GANPATI SPL | no | BYPASS |
| 09123 | RN-VS GANPATI SPL | no | BYPASS |
| 09124 | VS-RN GANPATI | no | BYPASS |
| 09323 | KK-INDB H/SPL | no | BYPASS-LNL-BSR |
| 09324 | INDB-KK H/SPL | no | BYPASS-BSR-LNL |
| 09419 | ADI-TPJ H/SPL | no | BYPASS |
| 09420 | TPJ-ADI H/SPL | no | BYPASS |
| 09423 | MAJN-ADI H/SPL | no | BYPASS |
| 09424 | ADI-MAJN H/SPL | no | BYPASS |
| 09627 | AII-SUR H/SPL | no | BYPASS |
| 09628 | SUR-AII H/SPL | no | BYPASS |
| BHARATGAUR | SAPTA JYOTIRLINGA | no | NULL |
| CRS SPL | NULL | no | NULL |
| CSMT-MAO | NULL | no | NULL |
| GM INSP SP | CSMT-NGP | no | NULL |
| OMS SPL | OMS SPL | no | NULL |
| TRC SPL | CSMT-KYN-CSMT-LL | no | NULL |
