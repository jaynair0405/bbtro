-- KOPAR-BSR BSR DN (+ DCC S-35/S-19 on DAT-DCC DIVA DN) coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/BSR-KYN-PNVL-DW/bsr_dw_dn.csv
-- (source was named bsr_dw_up.csv but is the DN direction BSR -> DIVA; every location matches BSR DN, confirmed by user).
-- Generic source names mapped to div_signals by location (e.g. 'IBS DIST' 70/35 -> 'KARD IBS DIST', 'Gate Distant' 51/21 -> 'GATE-1 DIST').

UPDATE div_signals SET latitude=19.37763087, longitude=72.8345449 WHERE signal_number='BSR S-48' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.37765617, longitude=72.83447382 WHERE signal_number='BSR S-50' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.37242375, longitude=72.83710992 WHERE signal_number='BSR S-18' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.36936408, longitude=72.849092 WHERE signal_number='GATE-10 DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.36777308, longitude=72.85861287 WHERE signal_number='GATE-10' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.36411174, longitude=72.86632739 WHERE signal_number='BSR IBS DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.35947597, longitude=72.87392963 WHERE signal_number='BSR IBS S-16' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.34381385, longitude=72.90488535 WHERE signal_number='KARD DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.33963157, longitude=72.9128049 WHERE signal_number='KARD S-20' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.33472487, longitude=72.92224381 WHERE signal_number='KARD S-18' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.33298594, longitude=72.92577747 WHERE signal_number='KARD S-16' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.32531262, longitude=72.93575837 WHERE signal_number='KARD IBS DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.31926061, longitude=72.94050902 WHERE signal_number='KARD IBS' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.30633986, longitude=72.97039739 WHERE signal_number='KHBV DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.30146658, longitude=72.97866788 WHERE signal_number='KHBV S-30' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.29552913, longitude=72.98866076 WHERE signal_number='KHBV S-21' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.29294941, longitude=72.99312884 WHERE signal_number='KHBV S-20' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.29128074, longitude=73.01103516 WHERE signal_number='KHBV IBS DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.29130037, longitude=73.02033229 WHERE signal_number='KHBV IBS' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.2750476, longitude=73.02913981 WHERE signal_number='BIRD DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.27153895, longitude=73.03855933 WHERE signal_number='BIRD S-30' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.26728615, longitude=73.04981402 WHERE signal_number='BIRD S-23' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.2656523, longitude=73.05420008 WHERE signal_number='BIRD S-20' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.25464581, longitude=73.06658541 WHERE signal_number='IBS DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.24351516, longitude=73.07090461 WHERE signal_number='BIRD IBS S-19' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.23528102, longitude=73.07701251 WHERE signal_number='GATE-1 DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.2270786, longitude=73.07781901 WHERE signal_number='GATE-1' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.22089903, longitude=73.07492523 WHERE signal_number='KOPAR DIST' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.21271592, longitude=73.07918591 WHERE signal_number='DI S-3' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.19950459, longitude=73.07706938 WHERE signal_number='DI S-6' AND section='KOPAR-BSR' AND line='BSR DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.20212167, longitude=73.06730823 WHERE signal_number='DCC S-35' AND section='DAT-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.19623737, longitude=73.05832747 WHERE signal_number='DCC S-19' AND section='DAT-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
