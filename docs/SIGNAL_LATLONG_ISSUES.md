# Signal lat/long — open issues

Found while loading signal coordinates on 2026-10-26 (sql/2026-10-26_latlong_*.sql).
Every load only fills NULL coordinates, so none of these were overwritten — they are
left for a separate pass. Tick off as resolved.
Per-line progress (counts, source file, notes): `docs/signal_latlong_progress.csv`.

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
| CSMT-KYN DN LOC | CLA S-9, CLA S-10, KLVA S-10, L-4001 REP, DI S-38 | blank in source |
| CSMT-KYN DN LOC | KYN S-49/52/53/54 (DN PF starters), VVH S-5 | not in source |
| CSMT-KYN UP LOC | KYN S-35/14/16/36, TNA S-58/31/44/8, VVH S-55, CLA S-27 | blank in source |
| CSMT-KYN UP LOC | KLVA S-22 | not in source |
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
| NEU S-44, NU-2, NU-4 (NEU-KILLE UP BSU) | no location_text |
| KYN S-59 (PF-6 STR, all 3 copies) | seq_order is NULL (added 2026-09-29) — check where it prints in the book |
| VDLR-GMN DN HB location_text mangled by Excel into date serials | A-904 '46369' (= 13/12), STC A-922 '46159' (= 17/5), JOS A-950 '46379' (= 23/12); UP HB: MM S-88 '46216' (= 13/7) — correct from data/vdlr_gmn/vdlr_gmn_dn.csv / _up.csv; check other Excel-imported sections for 5-digit locations |
| ABH S-5 / BVS S-5 (KYN-KJT DN SE) | no location_text — source gives 'PF-2 DN STR' / 'INTERMEDIATE STR' |
| ABH S-9 (KYN-KJT UP SE, DN dir) | coords differ ~32 m: master 19.2093711/73.1860105 (Aug) vs kyn_kjt_kyn_missing.csv 19.20927909/73.18630854 — confirm which |
| VSH S-8 (TUH-VSH UP THB) | no location_text — source gives 29/T239 |
| TNA S-53 / S-54 (TNA-TUH UP THB) | location_text swapped: master S-53 = PF-10, S-54 = PF-9; correct is S-53 = PF-9 STR, S-54 = PF-10 STR (confirmed by user) |
| URAN S-7/SH-7, S-8/SH-8 (PF-1/PF-2 STR, DN BSU) | in source uran_dn.csv with coords (18.87828/72.95087, 18.87844/72.95087) but not in div_signals — add as signals |
| DW S-16 / DW S-19 | 2 m apart (PF-7 / PF-8 starters) — verify |
| CSMT-KYN DN LOC location_text | most rows empty in master; source csmt_kyn_dn_loc.csv has them all (and differs on PR S-19, DR S-20, L-043, CLA S-8, VVH S-29, VVH S-56, VK S-3, L-089, L-3511 where master says 'PF-1 STR' etc.) — fill from source |
| CSMT S-3/4/5/6 DN TH vs DN LOC | same magnet_id; DN TH (earlier load) and DN LOC (csmt_kyn_dn_loc.csv) coords differ 3–10 m — pick one |

## C. Source-file quirks (for whoever prepares the sheets)

- Generic names (`S-2`, `DIST`, `IBS DIST`, `Gate Distant`) instead of master names — matched by location; keep a location column in every file.
- `bsr_dw_up.csv` first arrived holding the DN direction (renamed `bsr_dw_dn.csv`).
- Stale rows: LX 20 on PNVL-ROHA UP (gate removed); "LX2" label for GATE-4.
- `kjt-lnl-ml-DN.csv` was dropped in `data/trip-shed/` (moved).
- `tuh_vsh_dn.csv`: old signal numbers — VSH S-4 is now S-29, VSH S-19 is now S-21 (renumbered; sheets should be updated).
- `tuh_vsh_up.csv`: old numbers alongside new — old S-11/S-12/S-16 are now VSH S-3/S-4/S-8.
- `csmt_kyn_dn_loc.csv`: L-025 lat typed 8.99111 (corrected to 18.99111); names 'L 057', 'L -4401', 'KLV' for KLVA (also in csmt_kyn_up_loc.csv).
