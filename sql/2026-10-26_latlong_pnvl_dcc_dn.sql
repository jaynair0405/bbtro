-- PNVL-DCC DIVA DN coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/PNVL_DVA/pnvl_diva_dn.csv
-- PNVL S-9/11/12/13/15 already filled (identical values, from pnvl_roha_dn) - NULL guard leaves them.
-- DW S-15/16/19/23/24 filled on DW-DCC BSR UP and DCC S-5 on PNVL-DW DN ML, where those signals live (locations match).
-- Not in source: DCC S-20, DCC S-4 (DCC chord).

UPDATE div_signals SET latitude=19.1899576, longitude=73.04563163 WHERE signal_number='DW S-15' AND section='DW-DCC' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.1899196, longitude=73.04582206 WHERE signal_number='DW S-16' AND section='DW-DCC' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18989807, longitude=73.04582676 WHERE signal_number='DW S-19' AND section='DW-DCC' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.19113807, longitude=73.04858649 WHERE signal_number='DW S-23' AND section='DW-DCC' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.19102522, longitude=73.04855425 WHERE signal_number='DW S-24' AND section='DW-DCC' AND line='BSR UP' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.19062995, longitude=73.05251565 WHERE signal_number='DCC S-5' AND section='PNVL-DW' AND line='DN ML' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.18451078, longitude=73.06325777 WHERE signal_number='GATE-1' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.17720157, longitude=73.06960609 WHERE signal_number='DP-1' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.1709389, longitude=73.07485927 WHERE signal_number='DP-3' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.16337757, longitude=73.0775262 WHERE signal_number='NILJ S-3' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15187432, longitude=73.08143324 WHERE signal_number='NILJ S-9' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.15284389, longitude=73.08115289 WHERE signal_number='NILJ S-8' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.14909468, longitude=73.08238898 WHERE signal_number='NILJ S-14' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.14049116, longitude=73.08227212 WHERE signal_number='DP-3A' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.13398607, longitude=73.08265135 WHERE signal_number='DP-5' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.12627533, longitude=73.0830828 WHERE signal_number='DP-7' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.11897484, longitude=73.0835074 WHERE signal_number='GATE-6' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.10913436, longitude=73.08403665 WHERE signal_number='DP-9' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.10040082, longitude=73.08455963 WHERE signal_number='DP-11' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.09385926, longitude=73.08493793 WHERE signal_number='TPND S-1' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.08724789, longitude=73.08529995 WHERE signal_number='TPND S-2' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07615295, longitude=73.08928217 WHERE signal_number='TPND S-3' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07708525, longitude=73.08902236 WHERE signal_number='TPND S-4' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07256295, longitude=73.09067978 WHERE signal_number='TPND S-8' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06621284, longitude=73.09388651 WHERE signal_number='GATE-11' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.05705844, longitude=73.10058846 WHERE signal_number='DP-13' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.04891607, longitude=73.10657904 WHERE signal_number='KLMG S-21' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.04053221, longitude=73.11434656 WHERE signal_number='KLMG S-25' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03063214, longitude=73.11471379 WHERE signal_number='KLMG S-33' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03067691, longitude=73.1147589 WHERE signal_number='KLMG S-31' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.03276757, longitude=73.11449615 WHERE signal_number='KLMG S-29' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.02571174, longitude=73.11491878 WHERE signal_number='KLMG S-35' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.01657145, longitude=73.115234 WHERE signal_number='DP-17' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.00812355, longitude=73.11550234 WHERE signal_number='DP-19' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.99890741, longitude=73.11580108 WHERE signal_number='PNVL S-3' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98888605, longitude=73.12398771 WHERE signal_number='PNVL S-9' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98842747, longitude=73.12430066 WHERE signal_number='PNVL S-11' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98857518, longitude=73.12382291 WHERE signal_number='PNVL S-15' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98779446, longitude=73.12479692 WHERE signal_number='PNVL S-12' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=18.98762254, longitude=73.12504093 WHERE signal_number='PNVL S-13' AND section='PNVL-DCC' AND line='DIVA DN' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
