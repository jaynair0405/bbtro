-- KYN-KJT: the 17 signals added in Sept 2026 (newly-added sheets) that had no coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/KYN_KJT/kyn_kjt_kyn_missing.csv
-- ABH S-9 excluded (already holds an Aug 2026 value; source differs by ~32 m) - user's call.
-- NRL S-23 is a DN-direction signal on the UP SE line (like ABH S-9), matched as such.

UPDATE div_signals SET latitude=19.09131238, longitude=73.30467548 WHERE signal_number='VGI S-4' AND section='KYN-KJT' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.02990681, longitude=73.31839822 WHERE signal_number='NRL S-22' AND section='KYN-KJT' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.96647315, longitude=73.33165731 WHERE signal_number='BVS S-4' AND section='KYN-KJT' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.96776814, longitude=73.33164013 WHERE signal_number='BVS S-5' AND section='KYN-KJT' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.16615856, longitude=73.24242846 WHERE signal_number='BUD S-8' AND section='KYN-KJT' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15895022, longitude=73.24759659 WHERE signal_number='BUD S-11' AND section='KYN-KJT' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.20987213, longitude=73.18511086 WHERE signal_number='ABH S-4' AND section='KYN-KJT' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.2093, longitude=73.18633 WHERE signal_number='ABH S-5' AND section='KYN-KJT' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.20383095, longitude=73.19343776 WHERE signal_number='ABH S-16' AND section='KYN-KJT' AND line='DN SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03714794, longitude=73.31753828 WHERE signal_number='NRL S-11' AND section='KYN-KJT' AND line='UP SE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.030303, longitude=73.31818364 WHERE signal_number='NRL S-23' AND section='KYN-KJT' AND line='UP SE' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.09500491, longitude=73.2996153 WHERE signal_number='VGI S-23' AND section='KYN-KJT' AND line='UP SE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.97275141, longitude=73.33126465 WHERE signal_number='BVS S-17' AND section='KYN-KJT' AND line='UP SE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.97196864, longitude=73.3312859 WHERE signal_number='BVS S-18' AND section='KYN-KJT' AND line='UP SE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15594062, longitude=73.24852659 WHERE signal_number='BUD S-23' AND section='KYN-KJT' AND line='UP SE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.20828228, longitude=73.18789338 WHERE signal_number='ABH S-26' AND section='KYN-KJT' AND line='UP SE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.21075, longitude=73.18304 WHERE signal_number='ABH S-21' AND section='KYN-KJT' AND line='UP SE' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
