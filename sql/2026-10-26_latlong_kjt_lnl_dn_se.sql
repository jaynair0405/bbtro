-- KJT-LNL DN SE coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/KJT-LNL/kjt-lnl-ml-DN.csv
-- DN SE only: DN SE MID is a separate line with separate signals, even where a MID Distant shares a magnet_id.
-- KAD Distant (CH-40) and KAD S-1 REP (CH-66) have no coordinates in the source; left NULL.

UPDATE div_signals SET latitude=18.88814682, longitude=73.32021736 WHERE signal_number='PDI S-1' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88468917, longitude=73.32087993 WHERE signal_number='PDI S-11' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.8823263, longitude=73.32209335 WHERE signal_number='PDI S-14' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.8538533, longitude=73.33886413 WHERE signal_number='JBC Distant' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.85329759, longitude=73.35082029 WHERE signal_number='JBC S-1' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.8498075, longitude=73.36190966 WHERE signal_number='TKW Distant' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.83856418, longitude=73.36290885 WHERE signal_number='TKW S-1' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.83318395, longitude=73.36459907 WHERE signal_number='TKW S-4' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.79463384, longitude=73.37237516 WHERE signal_number='MHLC Distant' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.78656507, longitude=73.36748961 WHERE signal_number='MHLC S-1' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.78293577, longitude=73.36645046 WHERE signal_number='MHLC S-3' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75495531, longitude=73.3725933 WHERE signal_number='KAD S-1' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75611846, longitude=73.38128163 WHERE signal_number='KAD S-4' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.7595032, longitude=73.38906919 WHERE signal_number='LNL Distant' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75536583, longitude=73.39931104 WHERE signal_number='LNL S-1' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75314227, longitude=73.40229988 WHERE signal_number='LNL S-3' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75042974, longitude=73.40655232 WHERE signal_number='LNL S-6 REP' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.74907193, longitude=73.40893155 WHERE signal_number='LNL S-6' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.7483113, longitude=73.41159482 WHERE signal_number='LNL S-8' AND section='KJT-LNL' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
