-- VDLR-GMN UP HB coordinates (+ RVJ S-3 CSMT-PNVL UP HB copy) (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/vdlr_gmn/vdlr_gmn_up.csv
-- 'GMN A-963' -> 'A-963'. ADH S-58 given by user in chat (appended to the CSV).
-- RVJ S-4 CSMT-PNVL copy already holds a value ~5 m from this one - left as is.

UPDATE div_signals SET latitude=19.16315, longitude=72.84932 WHERE signal_number='GMN S-27' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.16316, longitude=72.84944 WHERE signal_number='GMN S-25' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15776, longitude=72.8498 WHERE signal_number='A-963' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15411, longitude=72.85001 WHERE signal_number='A-961' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15038, longitude=72.85006 WHERE signal_number='A-959' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.14676, longitude=72.85013 WHERE signal_number='A-957' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.14321, longitude=72.84976 WHERE signal_number='A-951' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.13926, longitude=72.84922 WHERE signal_number='A-949' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.13373, longitude=72.84851 WHERE signal_number='A-947' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.12967, longitude=72.84797 WHERE signal_number='A-941' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.12624, longitude=72.84753 WHERE signal_number='ADH S-82' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.12307, longitude=72.8471 WHERE signal_number='ADH S-72' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.11829, longitude=72.84642 WHERE signal_number='ADH S-45' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.11093, longitude=72.84549 WHERE signal_number='ADH S-42' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.1033, longitude=72.84447 WHERE signal_number='A-435' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.09889, longitude=72.84379 WHERE signal_number='A-429' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.09313, longitude=72.84314 WHERE signal_number='A-927' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.08842, longitude=72.84251 WHERE signal_number='A-921' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.08267, longitude=72.84172 WHERE signal_number='A-919' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07774, longitude=72.84109 WHERE signal_number='A-917' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07267, longitude=72.84043 WHERE signal_number='BA S-98' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06808, longitude=72.83999 WHERE signal_number='BA S-88' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06212, longitude=72.83943 WHERE signal_number='BA S-78' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.05875, longitude=72.83967 WHERE signal_number='BA S-68' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.05316, longitude=72.84153 WHERE signal_number='BA S-18' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.05315, longitude=72.84145 WHERE signal_number='BA S-42' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.04827, longitude=72.84361 WHERE signal_number='MM S-98' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.0443, longitude=72.84539 WHERE signal_number='MM S-88' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.04004, longitude=72.84764 WHERE signal_number='MM S-50' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03397, longitude=72.85368 WHERE signal_number='M-1106' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03163, longitude=72.85811 WHERE signal_number='RVJ S-28' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.02569, longitude=72.86128 WHERE signal_number='RVJ S-18' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01915, longitude=72.86092 WHERE signal_number='RVJ S-12' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01480845, longitude=72.85800317 WHERE signal_number='RVJ S-4' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01498, longitude=72.8581 WHERE signal_number='RVJ S-3' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01498, longitude=72.8581 WHERE signal_number='RVJ S-3' AND section='CSMT-PNVL' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.118398337807992, longitude=72.8463849749224 WHERE signal_number='ADH S-58' AND section='VDLR-GMN' AND line='UP HB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
