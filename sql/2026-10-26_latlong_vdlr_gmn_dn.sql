-- VDLR-GMN DN HB coordinates (+ RVJ S-7/S-8 CSMT-PNVL DN HB copies) (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/vdlr_gmn/vdlr_gmn_dn.csv
-- RVJ S-6 / RVJ S-9 already filled (same values) from the CSMT-PNVL load - NULL guard leaves them.

UPDATE div_signals SET latitude=19.01746, longitude=72.85987 WHERE signal_number='RVJ S-6' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.0169, longitude=72.85954 WHERE signal_number='RVJ S-7' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.0169, longitude=72.85954 WHERE signal_number='RVJ S-7' AND section='CSMT-PNVL' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01686253, longitude=72.85960024 WHERE signal_number='RVJ S-8' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01686253, longitude=72.85960024 WHERE signal_number='RVJ S-8' AND section='CSMT-PNVL' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.02037, longitude=72.86103 WHERE signal_number='RVJ S-9' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.0258, longitude=72.86067 WHERE signal_number='RVJ S-21' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03054, longitude=72.85913 WHERE signal_number='RVJ S-27' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03313, longitude=72.85566 WHERE signal_number='M-1101' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03677, longitude=72.84889 WHERE signal_number='MM S-17' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.04228, longitude=72.84642 WHERE signal_number='MM S-57' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.0423, longitude=72.84644 WHERE signal_number='MM S-59' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.04732, longitude=72.84393 WHERE signal_number='A-904' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.05048, longitude=72.84253 WHERE signal_number='BA S-17' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.05564, longitude=72.84055 WHERE signal_number='BA S-57' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06393, longitude=72.83927 WHERE signal_number='BA S-77' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06688, longitude=72.83959 WHERE signal_number='BA S-87' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07078, longitude=72.84015 WHERE signal_number='STC A-918' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07511, longitude=72.84065 WHERE signal_number='STC A-920' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.0796, longitude=72.84123 WHERE signal_number='STC A-922' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.08525, longitude=72.84194 WHERE signal_number='STC A-924' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.08984, longitude=72.84257 WHERE signal_number='VLP A-928' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.09503, longitude=72.84327 WHERE signal_number='VLP A-430' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.1016, longitude=72.84408 WHERE signal_number='VLP A-436' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.1081, longitude=72.845 WHERE signal_number='ADH S-25' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.1124, longitude=72.84557 WHERE signal_number='ADH S-7' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.11624, longitude=72.84604 WHERE signal_number='ADH S-32' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.12129, longitude=72.84671 WHERE signal_number='ADH S-62' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.12625, longitude=72.84742 WHERE signal_number='ADH A-940' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.1301, longitude=72.84792 WHERE signal_number='ADH A-946' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.13421, longitude=72.84846 WHERE signal_number='ADH A-948' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.13805, longitude=72.84899 WHERE signal_number='JOS A-950' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.14226, longitude=72.84952 WHERE signal_number='A-952' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.14566, longitude=72.84995 WHERE signal_number='A-958' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.14932, longitude=72.85008 WHERE signal_number='A-960' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15305, longitude=72.84985 WHERE signal_number='RMAR A-962' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15637, longitude=72.84977 WHERE signal_number='GMN S-30' AND section='VDLR-GMN' AND line='DN HB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
