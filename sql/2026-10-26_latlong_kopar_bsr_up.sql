-- KOPAR-BSR BSR UP coordinates (+ DCC/DI copies) (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/BSR-KYN-PNVL-DW/bsr_dw_up.csv
-- Generic source names mapped by location (e.g. 'IB DIST' 50/22 -> 'DI IBS DIST'). 'Gate Distant' 61/28 is KHBV DIST (61/20), confirmed by user.
-- KARD DIST excluded: source coordinates sit 7 m from KHBV IBS (~1.6 km apart on track), likely copy error; left NULL.
-- Copies: DCC S-28 on DW-DCC BSR UP + DAT-DCC DIVA UP; DI S-8 on DCC-KOPAR; DI S-5 on DCC-KOPAR + KYN-BSR.

UPDATE div_signals SET latitude=19.20121354, longitude=73.06476553 WHERE signal_number='DCC S-28' AND section='DW-DCC' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.20121354, longitude=73.06476553 WHERE signal_number='DCC S-28' AND section='DAT-DCC' AND line='DIVA UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.20128152, longitude=73.07461806 WHERE signal_number='DI S-8' AND section='DCC-KOPAR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.21070764, longitude=73.08085909 WHERE signal_number='DI S-5' AND section='DCC-KOPAR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.21070764, longitude=73.08085909 WHERE signal_number='DI S-5' AND section='KYN-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.21580121, longitude=73.07626262 WHERE signal_number='GATE-1 DIST' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.22401773, longitude=73.07607567 WHERE signal_number='GATE-1' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.24421807, longitude=73.07027128 WHERE signal_number='DI IBS DIST' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.25160397, longitude=73.06739444 WHERE signal_number='DI IBS S-2' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.25869721, longitude=73.06492115 WHERE signal_number='GATE-4 DIST' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.26423268, longitude=73.0576738 WHERE signal_number='GATE-4' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.2656582, longitude=73.05387436 WHERE signal_number='BIRD S-2' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.26993885, longitude=73.04253283 WHERE signal_number='BIRD S-5' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.27150176, longitude=73.03838377 WHERE signal_number='BIRD S-8' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.28264478, longitude=73.02800624 WHERE signal_number='BIRD IBS DIST' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.28980717, longitude=73.02245543 WHERE signal_number='BIRD IBS S-9' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.29113148, longitude=73.0104222 WHERE signal_number='KHBV DIST' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.29200049, longitude=72.99443765 WHERE signal_number='KHBV S-2' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.29922441, longitude=72.9822675 WHERE signal_number='KHBV S-6' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.30082599, longitude=72.97972564 WHERE signal_number='KHBV S-8' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.3143221, longitude=72.95302791 WHERE signal_number='KHBV IBS DIST' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.31640733, longitude=72.9438036 WHERE signal_number='KHBV IBS S-9' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.33226966, longitude=72.9268527 WHERE signal_number='KARD S-2' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.33779115, longitude=72.91621059 WHERE signal_number='KARD S-4' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.33957167, longitude=72.91269381 WHERE signal_number='KARD S-8' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.35344713, longitude=72.8871415 WHERE signal_number='KARD IBS DIST' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.35753314, longitude=72.87685008 WHERE signal_number='KARD IBS S-9' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.36180688, longitude=72.86991233 WHERE signal_number='GATE-10 DIST' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.36655791, longitude=72.8618902 WHERE signal_number='GATE-10' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.36939766, longitude=72.84838202 WHERE signal_number='BSR DIST' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.37131729, longitude=72.83838235 WHERE signal_number='BSR S-17' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.3756751, longitude=72.83529353 WHERE signal_number='BSR S-27' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.38377457, longitude=72.83155811 WHERE signal_number='BSR S-55' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.38415704, longitude=72.83151269 WHERE signal_number='BSR S-57' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.38343763, longitude=72.83185477 WHERE signal_number='BSR S-59' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.38366316, longitude=72.83187169 WHERE signal_number='BSR S-61' AND section='KOPAR-BSR' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
