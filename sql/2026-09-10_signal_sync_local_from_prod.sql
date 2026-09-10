-- =====================================================================
-- Bring LOCAL div_signals into line with PROD  (2026-09-10)
--
-- NOT a prod migration. Prod already holds every one of these values.
-- They are edits CLI-HQ made through the signal-book UI on prod, which
-- land in prod's database and nowhere else — no SQL file, no source
-- sheet, nothing in git. Local had drifted 41 signals behind.
--
-- Found by comparing checksums section by section, then column by
-- column. Of the 41: ~20 are whitespace normalisation the UI applies on
-- save, and the rest are real corrections — MAIN= route indications,
-- ri_left_arms counts, one placement fix, and the 12 renumberings.
-- The whitespace ones are included deliberately: leaving them out means
-- every future comparison reports known noise and stops being useful.
--
-- magnet_id, direction, line, km, lat/long, signal_type and
-- signal_function are identical on both sides, so AWS resolution is
-- untouched by any of this.
--
-- Every UPDATE is guarded on the CURRENT local value: running it twice
-- is a no-op, and it cannot overwrite a row that has changed since.
-- =====================================================================

-- id 2174  (LNL S-14)
--   book_description: RI: L1= BVT DN YD  ->  RI: L1=BVT DN YD
UPDATE div_signals SET book_description = 'RI: L1=BVT DN YD' WHERE id = 2174 AND book_description = 'RI: L1= BVT DN YD';

-- id 2176  (LNL-S 15)
--   book_description: RI: L1= DN YD 2; L2=DN YD 3  ->  RI: L1=DN YD 2;L2=DN YD 3
UPDATE div_signals SET book_description = 'RI: L1=DN YD 2;L2=DN YD 3' WHERE id = 2176 AND book_description = 'RI: L1= DN YD 2; L2=DN YD 3';

-- id 2210  (TGN S-3)
--   placement: Left  ->  Extreme Left
--   is_lhs: 1  ->  0
--   is_ext_lhs: 0  ->  1
UPDATE div_signals SET placement = 'Extreme Left', is_lhs = '0', is_ext_lhs = '1' WHERE id = 2210 AND placement = 'Left' AND is_lhs = '1' AND is_ext_lhs = '0';

-- id 2223  (DEHR S-2)
--   book_description: RI: L1=DN LOOP; L2= UP/DN LOOP  ->  RI: L1=DN LOOP;L2=UP/DN LOOP
UPDATE div_signals SET book_description = 'RI: L1=DN LOOP;L2=UP/DN LOOP' WHERE id = 2223 AND book_description = 'RI: L1=DN LOOP; L2= UP/DN LOOP';

-- id 2234  (CCH S-2)
--   book_description: RI: L1=DN LOOP-1; L2= DN LOOP-2  ->  RI: L1=DN LOOP-1;L2=DN LOOP-2
UPDATE div_signals SET book_description = 'RI: L1=DN LOOP-1;L2=DN LOOP-2' WHERE id = 2234 AND book_description = 'RI: L1=DN LOOP-1; L2= DN LOOP-2';

-- id 2240  (LP-55A)
--   signal_number: GATE-60  ->  LP-55A
--   normalized_signal_number: GATE60  ->  LP55A
UPDATE div_signals SET signal_number = 'LP-55A', normalized_signal_number = 'LP55A' WHERE id = 2240 AND signal_number = 'GATE-60' AND normalized_signal_number = 'GATE60';

-- id 2246  (KK S-2)
--   book_description: RI: L1=DN LOOP; R1= PF  ->  RI: L1=DN LOOP;R1=PF
UPDATE div_signals SET book_description = 'RI: L1=DN LOOP;R1=PF' WHERE id = 2246 AND book_description = 'RI: L1=DN LOOP; R1= PF';

-- id 2251  (SVJR S-2)
--   book_description: RI: L1=DN LOOP; R1= UP LOOP; R2= EMU PF  ->  RI: L1=DN LOOP;R1=UP LOOP;R2=EMU PF
UPDATE div_signals SET book_description = 'RI: L1=DN LOOP;R1=UP LOOP;R2=EMU PF' WHERE id = 2251 AND book_description = 'RI: L1=DN LOOP; R1= UP LOOP; R2= EMU PF';

-- id 2254  (PUNE S-1)
--   book_description: RI: L1=PA YARD (S-502)  ->  RI: R1=PA YARD (S-502)
UPDATE div_signals SET book_description = 'RI: R1=PA YARD (S-502)' WHERE id = 2254 AND book_description = 'RI: L1=PA YARD (S-502)';

-- id 2255  (PUNE S-3)
--   book_description: RI: L1=PF-3; L2=S-18; L3=S-17  ->  RI: L1=PF-3;L2=S-18;L3=S-17
UPDATE div_signals SET book_description = 'RI: L1=PF-3;L2=S-18;L3=S-17' WHERE id = 2255 AND book_description = 'RI: L1=PF-3; L2=S-18; L3=S-17';

-- id 2256  (PUNE S-17)
--   book_description: RI: R1=PF-5  ->  RI: R1=PF-5;MAIN=Y=PF-6
UPDATE div_signals SET book_description = 'RI: R1=PF-5;MAIN=Y=PF-6' WHERE id = 2256 AND book_description = 'RI: R1=PF-5';

-- id 2257  (PUNE S-18)
--   book_description: RI: R1=PF-4  ->  RI: R1=PF-4;MAIN=Y=PF-5
UPDATE div_signals SET book_description = 'RI: R1=PF-4;MAIN=Y=PF-5' WHERE id = 2257 AND book_description = 'RI: R1=PF-4';

-- id 2258  (PUNE S-19)
--   book_description: RI: L1= PF-2; R1= UP M/L; R2=PF-1  ->  RI: L1=PF-2;R1=UP M/L;R2=PF-1;MAIN=Y=DN ML
UPDATE div_signals SET book_description = 'RI: L1=PF-2;R1=UP M/L;R2=PF-1;MAIN=Y=DN ML' WHERE id = 2258 AND book_description = 'RI: L1= PF-2; R1= UP M/L; R2=PF-1';

-- id 2260  (PUNE S-97)
--   book_description: RI: L1=YARD; L2=YARD  ->  RI: L1=YARD;L2=YARD
UPDATE div_signals SET book_description = 'RI: L1=YARD;L2=YARD' WHERE id = 2260 AND book_description = 'RI: L1=YARD; L2=YARD';

-- id 2274  (KK S-35)
--   book_description: RI: L1=UP LOOP; L2=KK YARD  ->  RI: L1=UP LOOP;L2=KK YARD
UPDATE div_signals SET book_description = 'RI: L1=UP LOOP;L2=KK YARD' WHERE id = 2274 AND book_description = 'RI: L1=UP LOOP; L2=KK YARD';

-- id 2283  (LP-56A)
--   signal_number: GATE-60  ->  LP-56A
--   normalized_signal_number: GATE60  ->  LP56A
UPDATE div_signals SET signal_number = 'LP-56A', normalized_signal_number = 'LP56A' WHERE id = 2283 AND signal_number = 'GATE-60' AND normalized_signal_number = 'GATE60';

-- id 2286  (CCH S-20)
--   book_description: RI: L1=UP LOOP-1; L2=UP LOOP-2  ->  RI: L1=UP LOOP-1;L2=UP LOOP-2
UPDATE div_signals SET book_description = 'RI: L1=UP LOOP-1;L2=UP LOOP-2' WHERE id = 2286 AND book_description = 'RI: L1=UP LOOP-1; L2=UP LOOP-2';

-- id 2297  (DEHR S-20)
--   book_description: RI: L1=UP LOOP; R1=DN MAIN/DN LOOP  ->  RI: L1=UP LOOP;R1=DN MAIN/DN LOOP
UPDATE div_signals SET book_description = 'RI: L1=UP LOOP;R1=DN MAIN/DN LOOP' WHERE id = 2297 AND book_description = 'RI: L1=UP LOOP; R1=DN MAIN/DN LOOP';

-- id 2344  (LNL S-80)
--   book_description: RI: L1=PF-3/4; R1=PF-1  ->  RI: L1=PF-3/4;R1=PF-1
UPDATE div_signals SET book_description = 'RI: L1=PF-3/4;R1=PF-1' WHERE id = 2344 AND book_description = 'RI: L1=PF-3/4; R1=PF-1';

-- id 2345  (LNL S-73)
--   location_text: YD STR  ->  YD  Common STR
--   book_description: RI: L1=UP YD; R1= PF- 3/2/1  ->  RI: L1=UP YD;R1=PF- 3/2/1
UPDATE div_signals SET location_text = 'YD  Common STR', book_description = 'RI: L1=UP YD;R1=PF- 3/2/1' WHERE id = 2345 AND location_text = 'YD STR' AND book_description = 'RI: L1=UP YD; R1= PF- 3/2/1';

-- id 3010  (PNVL S-9)
--   book_description: RI: R1=ROHA; R2=JSLE  ->  RI: R1=ROHA;R2=JSLE
UPDATE div_signals SET book_description = 'RI: R1=ROHA;R2=JSLE' WHERE id = 3010 AND book_description = 'RI: R1=ROHA; R2=JSLE';

-- id 3011  (PNVL S-11)
--   book_description: RI: L1=KJT; R1=JSLE  ->  RI: L1=KJT;R1=JSLE
UPDATE div_signals SET book_description = 'RI: L1=KJT;R1=JSLE' WHERE id = 3011 AND book_description = 'RI: L1=KJT; R1=JSLE';

-- id 3012  (PNVL S-15)
--   book_description: RI: L1=ROHA; L2=KJT  ->  RI: L1=ROHA;L2=KJT
UPDATE div_signals SET book_description = 'RI: L1=ROHA;L2=KJT' WHERE id = 3012 AND book_description = 'RI: L1=ROHA; L2=KJT';

-- id 3013  (PNVL S-12)
--   book_description: RI: L1=KJT; R1=JSLE  ->  RI: L1=KJT;R1=JSLE
UPDATE div_signals SET book_description = 'RI: L1=KJT;R1=JSLE' WHERE id = 3013 AND book_description = 'RI: L1=KJT; R1=JSLE';

-- id 3014  (PNVL S-13)
--   book_description: RI: L1=ROHA; L2=KJT  ->  RI: L1=ROHA;L2=KJT
UPDATE div_signals SET book_description = 'RI: L1=ROHA;L2=KJT' WHERE id = 3014 AND book_description = 'RI: L1=ROHA; L2=KJT';

-- id 3017  (PYJE S-4)
--   signal_number: PYJE S-3  ->  PYJE S-4
--   normalized_signal_number: PYJES3  ->  PYJES4
--   book_description: RI: L1= UDL-1; R1= UDL-2  ->  RI: L1=UDL-1;R1=UDL-2
UPDATE div_signals SET signal_number = 'PYJE S-4', normalized_signal_number = 'PYJES4', book_description = 'RI: L1=UDL-1;R1=UDL-2' WHERE id = 3017 AND signal_number = 'PYJE S-3' AND normalized_signal_number = 'PYJES3' AND book_description = 'RI: L1= UDL-1; R1= UDL-2';

-- id 3018  (PYJE S-12)
--   signal_number: PYJE S-8  ->  PYJE S-12
--   normalized_signal_number: PYJES8  ->  PYJES12
UPDATE div_signals SET signal_number = 'PYJE S-12', normalized_signal_number = 'PYJES12' WHERE id = 3018 AND signal_number = 'PYJE S-8' AND normalized_signal_number = 'PYJES8';

-- id 3019  (PYJE S-11)
--   signal_number: PYJE S-7  ->  PYJE S-11
--   normalized_signal_number: PYJES7  ->  PYJES11
UPDATE div_signals SET signal_number = 'PYJE S-11', normalized_signal_number = 'PYJES11' WHERE id = 3019 AND signal_number = 'PYJE S-7' AND normalized_signal_number = 'PYJES7';

-- id 3020  (PYJE S-13)
--   signal_number: PYJE S-6  ->  PYJE S-13
--   normalized_signal_number: PYJES6  ->  PYJES13
UPDATE div_signals SET signal_number = 'PYJE S-13', normalized_signal_number = 'PYJES13' WHERE id = 3020 AND signal_number = 'PYJE S-6' AND normalized_signal_number = 'PYJES6';

-- id 3021  (PYJE S-16)
--   signal_number: PYJE S-9  ->  PYJE S-16
--   normalized_signal_number: PYJES9  ->  PYJES16
UPDATE div_signals SET signal_number = 'PYJE S-16', normalized_signal_number = 'PYJES16' WHERE id = 3021 AND signal_number = 'PYJE S-9' AND normalized_signal_number = 'PYJES9';

-- id 3023  (CHOK S-4)
--   signal_number: CHOK S-3  ->  CHOK S-4
--   normalized_signal_number: CHOKS3  ->  CHOKS4
--   book_description: RI: L1= UDL-2; R1= UDL-1  ->  RI: L1=UDL-2;R1=UDL-1
UPDATE div_signals SET signal_number = 'CHOK S-4', normalized_signal_number = 'CHOKS4', book_description = 'RI: L1=UDL-2;R1=UDL-1' WHERE id = 3023 AND signal_number = 'CHOK S-3' AND normalized_signal_number = 'CHOKS3' AND book_description = 'RI: L1= UDL-2; R1= UDL-1';

-- id 3024  (CHOK S-12)
--   signal_number: CHOK S-8  ->  CHOK S-12
--   normalized_signal_number: CHOKS8  ->  CHOKS12
UPDATE div_signals SET signal_number = 'CHOK S-12', normalized_signal_number = 'CHOKS12' WHERE id = 3024 AND signal_number = 'CHOK S-8' AND normalized_signal_number = 'CHOKS8';

-- id 3025  (CHOK S-11)
--   signal_number: CHOK S-7  ->  CHOK S-11
--   normalized_signal_number: CHOKS7  ->  CHOKS11
UPDATE div_signals SET signal_number = 'CHOK S-11', normalized_signal_number = 'CHOKS11' WHERE id = 3025 AND signal_number = 'CHOK S-7' AND normalized_signal_number = 'CHOKS7';

-- id 3026  (CHOK S-13)
--   signal_number: CHOK S-6  ->  CHOK S-13
--   normalized_signal_number: CHOKS6  ->  CHOKS13
UPDATE div_signals SET signal_number = 'CHOK S-13', normalized_signal_number = 'CHOKS13' WHERE id = 3026 AND signal_number = 'CHOK S-6' AND normalized_signal_number = 'CHOKS6';

-- id 3027  (CHOK S-16)
--   signal_number: CHOK S-9  ->  CHOK S-16
--   normalized_signal_number: CHOKS9  ->  CHOKS16
UPDATE div_signals SET signal_number = 'CHOK S-16', normalized_signal_number = 'CHOKS16' WHERE id = 3027 AND signal_number = 'CHOK S-9' AND normalized_signal_number = 'CHOKS9';

-- id 3029  (KJT S-3)
--   book_description: RI: L1= EMU PF; L2= S-14; R1= RD-7  ->  RI: L1=EMU PF;L2=S-14;R1=RD-7
UPDATE div_signals SET book_description = 'RI: L1=EMU PF;L2=S-14;R1=RD-7' WHERE id = 3029 AND book_description = 'RI: L1= EMU PF; L2= S-14; R1= RD-7';

-- id 754  (CSMT S-34)
--   ri_left_arms: 0  ->  2
--   book_description: RI: L1= H-03; L2= S-34  ->  RI: L1=H-03;L2=S-34
UPDATE div_signals SET ri_left_arms = '2', book_description = 'RI: L1=H-03;L2=S-34' WHERE id = 754 AND ri_left_arms = '0' AND book_description = 'RI: L1= H-03; L2= S-34';

-- id 792  (MNKD S-1)
--   book_description: RI: R1=PF-2; R2=PF-3  ->  RI: R1=PF-2;R2=PF-3
UPDATE div_signals SET book_description = 'RI: R1=PF-2;R2=PF-3' WHERE id = 792 AND book_description = 'RI: R1=PF-2; R2=PF-3';

-- id 809  (VSH S-2)
--   ri_left_arms: 0  ->  1
--   book_description: (empty)  ->  RI: L1=PF-2;MAIN=PF-3
UPDATE div_signals SET ri_left_arms = '1', book_description = 'RI: L1=PF-2;MAIN=PF-3' WHERE id = 809 AND ri_left_arms = '0' AND book_description IS NULL;

-- id 851  (PNVL S-402)
--   book_description: RI: R1=S-404  ->  RI: R1=S-404;MAIN=S-403
UPDATE div_signals SET book_description = 'RI: R1=S-404;MAIN=S-403' WHERE id = 851 AND book_description = 'RI: R1=S-404';

-- id 852  (PNVL S-403)
--   book_description: RI: R1=PF-2  ->  RI: R1=PF-2;MAIN=PF-1
UPDATE div_signals SET book_description = 'RI: R1=PF-2;MAIN=PF-1' WHERE id = 852 AND book_description = 'RI: R1=PF-2';

-- 41 signals updated.
-- verify: re-run the per-section checksum against prod; all 37 must match.
