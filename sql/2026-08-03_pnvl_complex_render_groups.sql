-- PNVL-BSR/KYN/DIVA complex — book display groups (render the shared-trunk split as
-- named routes instead of fragmented DIVA/BSR sub-sections).
-- Date: 2026-08-03
-- Requires: display_group (2026-07-31) + lead_in_note (2026-08-03) columns.
--
-- The complex is stored finely split (each signal once, for magnet/AWS). For the BOOK we
-- group consecutive bound sections under one route heading via display_group, and stub the
-- shared junction blocks with a lead_in_note cross-reference. Applies to the three beats
-- that carry the complex: PNVL_GOODS(1), KYN_GOODS(7), CSMT_ML_MMR(5).
--
-- Section sequence rendered:
--   UP: 75 PNVL-DCC | 76 Dativali-Diva | 77+79+80 DAT-BSR | 81 DIVA-BSR(stub)
--       | 78 DCC-KYN | 82 KYN-BSR CHORD
--   DN: 83 BSR-KOPAR | 84 BSR-KYN CHORD | 85+87 DCC-PNVL | 86 DCC-DIVA(stub)
--
-- Topology notes (from LPC, 2026-08-02/03):
--   UP  BSR has two approaches converging at DCC S-27/28 -> DI S-8 -> DI S-5:
--         DAT side  : DCC S-3, S-11, S-27/28, DI S-8, DI S-5 -> KOPAR -> BSR   (main, full run)
--         DIVA side : DIVA starters, DCC S-8, S-27/28 -> (joins)               (stub)
--   DN  clean split after DI S-6; DCC S-35/S-19/S-22 are shared junction signals
--       (S-19 & S-22 both carry route indicators to either PNVL or DIVA); tracks
--       diverge only after them (S-20 -> PNVL, ME 4310 -> DIVA).
--   DCC S-8 (DCC cabin) and DI S-8 (DI cabin) are DIFFERENT signals.

-- ---------------------------------------------------------------------------
-- (a) Data fix: DIVA station header belongs after the approach signal DIVA S-69,
--     ahead of the PF starter cluster (was wedged between S-56 and S-57).
-- ---------------------------------------------------------------------------
UPDATE div_signal_book_rows SET row_order = 150
  WHERE book_section_id = 76 AND row_type = 'STATION_HEADER';

-- ---------------------------------------------------------------------------
-- (b) display_group + lead_in_note (identical across all three beats)
-- ---------------------------------------------------------------------------
UPDATE div_signal_beat_sections SET display_group='PNVL-DCC',       lead_in_note=NULL                                                     WHERE beat_id IN (1,5,7) AND section_id=75;
UPDATE div_signal_beat_sections SET display_group='Dativali-Diva',  lead_in_note=NULL                                                     WHERE beat_id IN (1,5,7) AND section_id=76;
UPDATE div_signal_beat_sections SET display_group='DAT-BSR',        lead_in_note='From DCC S-3'                                           WHERE beat_id IN (1,5,7) AND section_id=77;
UPDATE div_signal_beat_sections SET display_group='DAT-BSR',        lead_in_note=NULL                                                     WHERE beat_id IN (1,5,7) AND section_id=79;
UPDATE div_signal_beat_sections SET display_group='DAT-BSR',        lead_in_note=NULL                                                     WHERE beat_id IN (1,5,7) AND section_id=80;
UPDATE div_signal_beat_sections SET display_group='DIVA-BSR',       lead_in_note='To DI S-8, DI S-5; joins BSR (see DAT-BSR)'             WHERE beat_id IN (1,5,7) AND section_id=81;
UPDATE div_signal_beat_sections SET display_group='DCC-KYN',        lead_in_note='From DCC S-27/28'                                       WHERE beat_id IN (1,5,7) AND section_id=78;
UPDATE div_signal_beat_sections SET display_group='KYN-BSR CHORD',  lead_in_note='To DI S-5 for BSR'                                      WHERE beat_id IN (1,5,7) AND section_id=82;
UPDATE div_signal_beat_sections SET display_group='BSR-KOPAR',      lead_in_note=NULL                                                     WHERE beat_id IN (1,5,7) AND section_id=83;
UPDATE div_signal_beat_sections SET display_group='BSR-KYN CHORD',  lead_in_note='From DI S-6'                                            WHERE beat_id IN (1,5,7) AND section_id=84;
UPDATE div_signal_beat_sections SET display_group='DCC-PNVL',       lead_in_note='From DI S-6'                                            WHERE beat_id IN (1,5,7) AND section_id=85;
UPDATE div_signal_beat_sections SET display_group='DCC-PNVL',       lead_in_note=NULL                                                     WHERE beat_id IN (1,5,7) AND section_id=87;
UPDATE div_signal_beat_sections SET display_group='DCC-DIVA',       lead_in_note='From DI S-6 via DCC S-35, S-19/S-22 (see DCC-PNVL)'     WHERE beat_id IN (1,5,7) AND section_id=86;

-- ---------------------------------------------------------------------------
-- (c) display_order per beat (permutation within each beat's existing complex slots).
--     Park +1000 first to dodge the uk_beat_display_order unique key, then assign.
--     Ordered section list: 75,76,77,79,80,81,78,82, 83,84,85,87,86
-- ---------------------------------------------------------------------------
UPDATE div_signal_beat_sections SET display_order = display_order + 1000
  WHERE beat_id IN (1,5,7) AND section_id BETWEEN 75 AND 87;

-- PNVL_GOODS(1): base 11
UPDATE div_signal_beat_sections SET display_order=11 WHERE beat_id=1 AND section_id=75;
UPDATE div_signal_beat_sections SET display_order=12 WHERE beat_id=1 AND section_id=76;
UPDATE div_signal_beat_sections SET display_order=13 WHERE beat_id=1 AND section_id=77;
UPDATE div_signal_beat_sections SET display_order=14 WHERE beat_id=1 AND section_id=79;
UPDATE div_signal_beat_sections SET display_order=15 WHERE beat_id=1 AND section_id=80;
UPDATE div_signal_beat_sections SET display_order=16 WHERE beat_id=1 AND section_id=81;
UPDATE div_signal_beat_sections SET display_order=17 WHERE beat_id=1 AND section_id=78;
UPDATE div_signal_beat_sections SET display_order=18 WHERE beat_id=1 AND section_id=82;
UPDATE div_signal_beat_sections SET display_order=19 WHERE beat_id=1 AND section_id=83;
UPDATE div_signal_beat_sections SET display_order=20 WHERE beat_id=1 AND section_id=84;
UPDATE div_signal_beat_sections SET display_order=21 WHERE beat_id=1 AND section_id=85;
UPDATE div_signal_beat_sections SET display_order=22 WHERE beat_id=1 AND section_id=87;
UPDATE div_signal_beat_sections SET display_order=23 WHERE beat_id=1 AND section_id=86;

-- KYN_GOODS(7): base 21
UPDATE div_signal_beat_sections SET display_order=21 WHERE beat_id=7 AND section_id=75;
UPDATE div_signal_beat_sections SET display_order=22 WHERE beat_id=7 AND section_id=76;
UPDATE div_signal_beat_sections SET display_order=23 WHERE beat_id=7 AND section_id=77;
UPDATE div_signal_beat_sections SET display_order=24 WHERE beat_id=7 AND section_id=79;
UPDATE div_signal_beat_sections SET display_order=25 WHERE beat_id=7 AND section_id=80;
UPDATE div_signal_beat_sections SET display_order=26 WHERE beat_id=7 AND section_id=81;
UPDATE div_signal_beat_sections SET display_order=27 WHERE beat_id=7 AND section_id=78;
UPDATE div_signal_beat_sections SET display_order=28 WHERE beat_id=7 AND section_id=82;
UPDATE div_signal_beat_sections SET display_order=29 WHERE beat_id=7 AND section_id=83;
UPDATE div_signal_beat_sections SET display_order=30 WHERE beat_id=7 AND section_id=84;
UPDATE div_signal_beat_sections SET display_order=31 WHERE beat_id=7 AND section_id=85;
UPDATE div_signal_beat_sections SET display_order=32 WHERE beat_id=7 AND section_id=87;
UPDATE div_signal_beat_sections SET display_order=33 WHERE beat_id=7 AND section_id=86;

-- CSMT_ML_MMR(5): base 25
UPDATE div_signal_beat_sections SET display_order=25 WHERE beat_id=5 AND section_id=75;
UPDATE div_signal_beat_sections SET display_order=26 WHERE beat_id=5 AND section_id=76;
UPDATE div_signal_beat_sections SET display_order=27 WHERE beat_id=5 AND section_id=77;
UPDATE div_signal_beat_sections SET display_order=28 WHERE beat_id=5 AND section_id=79;
UPDATE div_signal_beat_sections SET display_order=29 WHERE beat_id=5 AND section_id=80;
UPDATE div_signal_beat_sections SET display_order=30 WHERE beat_id=5 AND section_id=81;
UPDATE div_signal_beat_sections SET display_order=31 WHERE beat_id=5 AND section_id=78;
UPDATE div_signal_beat_sections SET display_order=32 WHERE beat_id=5 AND section_id=82;
UPDATE div_signal_beat_sections SET display_order=33 WHERE beat_id=5 AND section_id=83;
UPDATE div_signal_beat_sections SET display_order=34 WHERE beat_id=5 AND section_id=84;
UPDATE div_signal_beat_sections SET display_order=35 WHERE beat_id=5 AND section_id=85;
UPDATE div_signal_beat_sections SET display_order=36 WHERE beat_id=5 AND section_id=87;
UPDATE div_signal_beat_sections SET display_order=37 WHERE beat_id=5 AND section_id=86;
