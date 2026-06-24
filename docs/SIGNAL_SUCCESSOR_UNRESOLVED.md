# Signal Successor — Unresolved References

Generated 2026-06-22 (refreshed after GMN A-963 rename + VSH CSV remap) from `test_for_platform_parrallel_signals.csv` vs `div_signals`.

## Bucket A — line-name mismatch (signal exists on a different line name)
Fix: align names / normalize (`LL`→`LOC`, `5TH LINE`→`5TH`, `6TH LINE`→`6TH`).

| Signal | CSV line | In DB on | × |
|---|---|---|---|
| BY S-16 | UP LL | UP LOC | 2 |
| BY S-29 | DN LL | DN LOC | 1 |
| BY S-39 | UP LL | UP LOC | 2 |
| CLA S-1 | DN LL | DN LOC | 3 |
| CLA S-10 | DN LL | DN LOC | 2 |
| CLA S-21 | DN LL | DN LOC | 4 |
| CLA S-34 | UP LL | UP LOC | 2 |
| CLA S-41 | UP LL | UP LOC | 1 |
| CLA S-42 | UP LL | UP LOC | 1 |
| CLA S-8 | DN LL | DN LOC | 2 |
| CLA S-9 | DN LL | DN LOC | 2 |
| CSMT S-23 | UP LL | UP HB | 1 |
| CSMT S-24 | UP LL | UP LOC | 1 |
| CSMT S-26 | UP LL | UP LOC, UP TH | 2 |
| CSMT S-54 | UP LL | UP LOC | 4 |
| DI S-27 | DN LL | DN LOC | 2 |
| DI S-35 | UP LL | UP LOC | 1 |
| DI S-36 | UP LL | UP LOC | 1 |
| DI S-37 | DN LL | DN LOC | 2 |
| DI S-38 | DN LL | DN LOC | 2 |
| DR S-24 | DN LL | DN LOC | 1 |
| DR S-27 | UP LL | UP LOC | 2 |
| DR S-4 | DN LL | DN LOC | 1 |
| DW S-2 | DN LL | DN LOC | 2 |
| DW S-46 | UP LL | UP TH | 1 |
| DW S-5 | DN LL | DN LOC | 1 |
| DW S-54 | UP LL | UP TH | 1 |
| DW S-66 | UP LL | UP LOC | 2 |
| KYN S-10 | DN LL | DN LOC | 2 |
| KYN S-17 | UP LL | UP LOC | 6 |
| KYN S-2 | DN LL | DN LOC | 2 |
| KYN S-20 | UP LL | UP LOC | 3 |
| KYN S-21 | 6TH LINE | 6TH | 4 |
| KYN S-25 | 5TH LINE | 5TH | 1 |
| KYN S-28 | DN LL | DN LOC | 1 |
| KYN S-32 | DN LL | DN LOC | 4 |
| KYN S-37 | UP LL | UP LOC, UP NE | 1 |
| KYN S-37 | UP TH | UP LOC, UP NE | 1 |
| KYN S-49 | DN LL | DN LOC | 2 |
| KYN S-53 | DN LL | DN LOC | 3 |
| KYN S-54 | DN LL | DN LOC | 3 |
| KYN S-63 | UP NE | UP TH | 1 |
| KYN S-7 | UP LL | UP LOC | 2 |
| KYN S-9 | 5TH LINE | 5TH | 2 |
| L-053 | DN LL | DN LOC | 1 |
| L-3403 | DN LL | DN LOC | 1 |
| L-4702 | UP LL | UP LOC | 1 |
| L-4710 | UP LL | UP LOC | 3 |
| L-4811 | DN LL | DN LOC | 3 |
| L-4903 | DN LL | DN LOC | 1 |
| L-5014 | UP LL | UP LOC | 2 |
| L036 | UP LL | UP LOC | 2 |
| L055 | DN LL | DN LOC | 1 |
| L090 | UP LL | UP LOC | 1 |
| L097 | DN LL | DN LOC | 1 |
| L3403 | DN LL | DN LOC | 1 |
| L5014 | UP LL | UP LOC | 1 |
| MLND S-15 | UP LL | UP LOC | 1 |
| MLND S-17 | UP LL | UP LOC | 2 |
| NEU S-41 | DN THB | DN HB | 2 |
| PR S-21 | DN LL | DN LOC | 1 |
| PR S-3 | DN LL | DN LOC | 1 |
| TNA S-19 | DN LL | DN LOC | 3 |
| TNA S-2 | DN LL | DN LOC | 2 |
| TNA S-21 | DN LL | DN LOC | 3 |
| TNA S-28 | 5TH LINE | 5TH | 2 |
| TNA S-58 | UP LL | UP LOC | 1 |
| TNA S-59 | UP LL | UP LOC | 1 |
| TNA S-68 | DN LL | DN LOC | 3 |
| TNA S-69 | DN LL | DN LOC | 3 |
| TNA S-72 | UP LL | UP LOC | 1 |
| TNA S-77 | DN LL | DN LOC | 3 |
| TNA S-86 | UP LL | UP LOC | 3 |
| TNA S-88 | UP LL | UP LOC | 2 |
| VSH S-19 | UP HB | DN THB | 2 |
| VSH S-4 | DN HB | UP THB | 1 |
| VVH S-14 | UP LL | UP LOC | 1 |
| VVH S-33 | UP LL | UP LOC | 3 |
| VVH S-55 | UP LL | UP LOC | 1 |

## Bucket B — not a signal on any line (missing / not-yet-imported corridor)

| Signal | CSV line | × |
|---|---|---|
| ABH S-21 | UP SE | 2 |
| ABH S-4 | DN SE | 2 |
| ABH S-5 | DN SE | 2 |
| BA S-67 | DN HB | 1 |
| BEPR S-31 | DN BSU | 1 |
| BEPR S-33 | DN BSU | 1 |
| BEPR S-6 | UP HB | 2 |
| BEPR S-9 | DN HB | 1 |
| BUD S-8 | DN SE | 2 |
| CLA S-13 | DN HB | 1 |
| CMBR S-5 | UP HB | 1 |
| GATE 1 S-4 | UP SE | 3 |
| GATE 20 S-4 | UP SE | 3 |
| H-2814 | UP HB | 3 |
| KDV S-11 | DN NE | 2 |
| KILLE S-3 | DN BSU | 2 |
| KJT S-105 | UP SE | 4 |
| KJT S-106 | UP SE | 3 |
| KJT S-112 | UP SE | 5 |
| KJT S-14 | DN SE | 3 |
| KJT S-16 | DN SE | 5 |
| KJT S-21 | DN SE | 2 |
| KJT S-22 | DN SE | 3 |
| KJT S-28 | DN SE | 4 |
| KJT S-38 | DN SE | 4 |
| KJT S-39 | DN SE | 1 |
| KJT S-42 | DN SE | 4 |
| KJT S-62 | DN SE | 3 |
| KJT S-63 | DN SE | 4 |
| KJT S-64 | DN SE | 3 |
| KJT S-71 | UP SE | 4 |
| KJT S-81 | UP SE | 2 |
| KJT S-82 | UP SE | 2 |
| KJT S-87 | UP SE | 3 |
| KJT S-95 | UP SE | 3 |
| KSRA S-22 | UP NE | 1 |
| KSRA S-25 | UP NE | 1 |
| KYN S-58 | DN TH | 3 |
| KYN S-59 | DN TH | 2 |
| KYN S-66 | DN LL | 1 |
| KYN S-66 | DN NE | 1 |
| MNKD S-21 | UP HB | 2 |
| NEU S-32 | DN THB | 2 |
| NEU S-35 | DN BSU | 1 |
| NEU S-36 | DN BSU | 1 |
| NEU S-43 | DN BSU | 2 |
| NRL S-11 | UP SE | 2 |
| NRL S-22 | DN SE | 2 |
| NRL S-23 | DN SE | 2 |
| NU-42 | UP BSU | 2 |
| PDI S-16 | DN KHPI | 3 |
| PDI S-5 | UP KHPI | 1 |
| PNVL S-404 | DN HB | 1 |
| RVJ S-13 | UP HB | 1 |
| RVJ S-15 | DN HB | 3 |
| TNA S-61 | DN THB | 1 |
| URAN S-21 | UP BSU | 1 |
| URAN S-22 | UP BSU | 1 |
| VSH S-22 | UP HB | 2 |

## Notes
- Bucket A: 79 distinct;  Bucket B: 59 distinct.
- Fixed 2026-06-22: GMN A-963→A-963 (signal renamed); VSH S-1/11/12/13/16/18 → S-30/3/4/5/8/22 (CSV remapped).
- Still open from VSH remap: VSH S-22 [UP HB] (no such signal), VSH S-4 [DN HB] (exists only on UP THB — "same signal both lines" needs a DN-HB record), VSH S-19 [UP HB] (is a DN THB signal).
