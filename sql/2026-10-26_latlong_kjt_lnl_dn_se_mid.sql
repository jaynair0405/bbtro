-- KJT-LNL DN SE MID coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/KJT-LNL/kjt_lnl_dn_mid.csv
-- DN SE MID only: a separate line from DN SE, even where a MID Distant shares a magnet_id.
-- LNL S-2 excluded: its source coordinates are 1 m from LNL Distant (~1 km apart on track), a likely copy error; left NULL pending re-check.

UPDATE div_signals SET latitude=18.88808925, longitude=73.32005576 WHERE signal_number='PDI S-2' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88465197, longitude=73.32074698 WHERE signal_number='PDI S-12' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.88228861, longitude=73.32201897 WHERE signal_number='PDI S-15' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.84959267, longitude=73.36193686 WHERE signal_number='TKW Distant' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.83856713, longitude=73.36285448 WHERE signal_number='TKW S-2' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.83312304, longitude=73.36451259 WHERE signal_number='TKW S-5' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.79516893, longitude=73.37244317 WHERE signal_number='MHLC Distant' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.78853757, longitude=73.36789794 WHERE signal_number='MHLC S-2' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.78295892, longitude=73.36635089 WHERE signal_number='MHLC S-4' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75624879, longitude=73.36545676 WHERE signal_number='KAD Distant' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75356824, longitude=73.37175343 WHERE signal_number='KAD S-2' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75611234, longitude=73.38141747 WHERE signal_number='KAD S-3' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75938131, longitude=73.38888054 WHERE signal_number='LNL Distant' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.75394336, longitude=73.4009703 WHERE signal_number='LNL S-4' AND section='KJT-LNL' AND line='DN SE MID' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
