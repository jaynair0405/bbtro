# Signal lat/long — open issues

Found while loading signal coordinates on 2026-10-26 (sql/2026-10-26_latlong_*.sql).
Every load only fills NULL coordinates, so none of these were overwritten — they are
left for a separate pass. Tick off as resolved.

## A. Coordinates missing or suspect (need a fresh reading)

| Section / line | Signal | Problem |
|---|---|---|
| KJT-LNL DN SE | KAD Distant (CH-40), KAD S-1 REP (CH-66) | blank in source |
| KJT-LNL DN SE MID | LNL S-2 | source coords 1 m from LNL Distant (~1 km apart on track) — copy error, held back |
| KOPAR-BSR BSR UP | KARD DIST (70/36) | source coords 7 m from KHBV IBS (69/20, ~1.6 km apart) — copy error, held back |
| LNL-PUNE UP | PUNE S-97/98/99/104/105/107, LNL S-67/68/69/70 | blank in source (LNL S-67..70 also have empty KJT-LNL UP copies) |
| KSRA-IGP DN NE | KSRA S-43/44/45/49 | blank in source |
| KSRA-IGP DN NE | IGP S-61/62/63/69 | not in source (yard) |
| KSRA-IGP UP NE (+ MID copies) | IGP S-36, S-38 | blank in source |
| KSRA-IGP UP NE (+ MID copies) | IGP S-45, S-26..S-29, S-31, S-37 | not in source — yard signals, to fill later |
| PNVL-ROHA DN KR | PEN S-7/8/9, NGTN S-7 | blank in source |
| PNVL-ROHA DN KR | ROHA S-3 | not in source |
| PNVL-ROHA UP KR | GATE-4 REP (76/29) | blank in source |
| PNVL-DCC DIVA DN | DCC S-20, DCC S-4 (DCC chord) | not in source |
| KOPAR-BSR BSR DN | BSR S-44/46/56/58/60/62/66, loop/UDL starters at BIRD/KHBV/KARD (14 total) | not in source |
| KOPAR-BSR BSR UP | KHBV S-1, KHBV S-5, BIRD S-3, BIRD S-4, KARD S-3 | not in source |
| DAT-DCC DIVA DN | DCC S-22 (loop starter) | not in source |
| KJT-LNL (all lines) | KJT station signals (S-16, 21, 22, 28, 38/39, 42, 61/62) | not in any source yet |
| IGP-MMR DN, MMR-IGP UP | whole line | source names did not match master — user to redo with proper signal numbers |

## B. Master data (div_signals) to correct

| Item | Detail |
|---|---|
| Wrong magnet_id links on MID Distants | KJT-LNL: TKW (2022), MHLC (2025), LNL (2032), KAD (2028) Distants share magnet_id with the DN SE Distant of the same name, but are separate signals at different km. Same pattern on KSRA-IGP TGR-1/2/3 and KSRA Distants (DN + UP). Publish propagates RI/type across the pair — give each MID Distant its own magnet_id. |
| LP-25 location (LNL-PUNE DN) | source 152/2, master 152/4 |
| LP-37 location (LNL-PUNE DN) | source 160/44, master 160/42 |
| DP-1 location (PNVL-DCC DN) | source 45/24, master 45/22 |
| NILJ S-3 location (PNVL-DCC DN) | source 47/18, master 47/22 |
| KHBV DIST (KOPAR-BSR UP) | source 61/28, master 61/20 |
| KHBV S-2 (KOPAR-BSR UP) | source 63/24, master 63/34 |
| GATE INN DIST (IGP-MMR DN, 214/29) | name lacks the gate number — should be GATE-98 INN DIST |
| BSR DN order vs km | GATE-10 (79/17) sits before BSR IBS DIST (80/15); coordinates agree with the order, so one km is wrong |
| IGP S-26/27/28/29/37 (KSRA-IGP UP) | no location_text |
| DW S-16 / DW S-19 | 2 m apart (PF-7 / PF-8 starters) — verify |

## C. Source-file quirks (for whoever prepares the sheets)

- Generic names (`S-2`, `DIST`, `IBS DIST`, `Gate Distant`) instead of master names — matched by location; keep a location column in every file.
- `bsr_dw_up.csv` first arrived holding the DN direction (renamed `bsr_dw_dn.csv`).
- Stale rows: LX 20 on PNVL-ROHA UP (gate removed); "LX2" label for GATE-4.
- `kjt-lnl-ml-DN.csv` was dropped in `data/trip-shed/` (moved).
