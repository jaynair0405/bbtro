-- KYN-KJT UP SE signal coordinates backfill
-- Date: 2026-07-15
-- Source: data/KYN_KJT/upload_lat_long_kyn_kjt_up.xlsx (user-supplied), matched by
-- signal_number within section=KYN-KJT line="UP SE". Idempotent (normalized match).
-- NOTE: source rows ABH S-21 and BUD S-18 have no DB row in this section and are
-- excluded here (flagged to user: genuinely missing signals vs numbering variance?).

UPDATE div_signals SET latitude=18.91382, longitude=73.3211 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='KJTS137';
UPDATE div_signals SET latitude=18.91373, longitude=73.32088 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='KJTS134';
UPDATE div_signals SET latitude=18.91393, longitude=73.32073 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='KJTS132';
UPDATE div_signals SET latitude=18.91386, longitude=73.3208 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='KJTS133';
UPDATE div_signals SET latitude=18.91991, longitude=73.32236 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='KJTS142';
UPDATE div_signals SET latitude=18.92412, longitude=73.32459 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE27';
UPDATE div_signals SET latitude=18.93057, longitude=73.32641 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE9706';
UPDATE div_signals SET latitude=18.93653, longitude=73.32804 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE26';
UPDATE div_signals SET latitude=18.94192, longitude=73.32951 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE9602';
UPDATE div_signals SET latitude=18.94686, longitude=73.33086 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE25';
UPDATE div_signals SET latitude=18.95433, longitude=73.33179 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE9410';
UPDATE div_signals SET latitude=18.96159, longitude=73.33161 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='BVSS20';
UPDATE div_signals SET latitude=18.97274, longitude=73.33127 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='BVSS19';
UPDATE div_signals SET latitude=18.98133, longitude=73.33115 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='BVSS16';
UPDATE div_signals SET latitude=18.98916, longitude=73.33097 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE9012';
UPDATE div_signals SET latitude=18.99612, longitude=73.33081 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE22S3';
UPDATE div_signals SET latitude=19.00233, longitude=73.33066 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE8906';
UPDATE div_signals SET latitude=19.0102, longitude=73.32892 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE8808';
UPDATE div_signals SET latitude=19.01628, longitude=73.32346 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE8710';
UPDATE div_signals SET latitude=19.02079, longitude=73.3193 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='NRLS3';
UPDATE div_signals SET latitude=19.02866, longitude=73.31838 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='NRLS6';
UPDATE div_signals SET latitude=19.03716, longitude=73.31772 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='NRLS12';
UPDATE div_signals SET latitude=19.04322, longitude=73.31697 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE20';
UPDATE div_signals SET latitude=19.05074, longitude=73.31685 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE8308';
UPDATE div_signals SET latitude=19.05668, longitude=73.31722 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE8214';
UPDATE div_signals SET latitude=19.06139, longitude=73.31776 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE8206';
UPDATE div_signals SET latitude=19.06785, longitude=73.31729 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE19S3';
UPDATE div_signals SET latitude=19.07374, longitude=73.31513 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE8014';
UPDATE div_signals SET latitude=19.07955, longitude=73.31254 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE18';
UPDATE div_signals SET latitude=19.08474, longitude=73.31071 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE7912';
UPDATE div_signals SET latitude=19.0887, longitude=73.30668 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='VGIS25';
UPDATE div_signals SET latitude=19.09501, longitude=73.29962 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='VGIS24';
UPDATE div_signals SET latitude=19.09762, longitude=73.2953 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='VGIS21';
UPDATE div_signals SET latitude=19.10147, longitude=73.28597 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE16';
UPDATE div_signals SET latitude=19.10417, longitude=73.28196 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE7514';
UPDATE div_signals SET latitude=19.10826, longitude=73.2787 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE7504';
UPDATE div_signals SET latitude=19.11424, longitude=73.27339 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE7406';
UPDATE div_signals SET latitude=19.11985, longitude=73.26736 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE7308';
UPDATE div_signals SET latitude=19.12604, longitude=73.26289 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE7220';
UPDATE div_signals SET latitude=19.13372, longitude=73.26074 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE7114';
UPDATE div_signals SET latitude=19.14136, longitude=73.25664 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE7014';
UPDATE div_signals SET latitude=19.14847, longitude=73.25184 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE6914';
UPDATE div_signals SET latitude=19.15594, longitude=73.24854 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='BUDS28';
UPDATE div_signals SET latitude=19.16502, longitude=73.24391 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='BUDS24';
UPDATE div_signals SET latitude=19.16715, longitude=73.23663 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='BUDS17';
UPDATE div_signals SET latitude=19.16887, longitude=73.23334 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='BUDS16';
UPDATE div_signals SET latitude=19.17577, longitude=73.22725 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE6526';
UPDATE div_signals SET latitude=19.18184, longitude=73.22016 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE6410';
UPDATE div_signals SET latitude=19.18832, longitude=73.21174 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE7';
UPDATE div_signals SET latitude=19.19284, longitude=73.20878 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE6214';
UPDATE div_signals SET latitude=19.19741, longitude=73.20294 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE6202';
UPDATE div_signals SET latitude=19.20188, longitude=73.19573 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='ABHS38';
UPDATE div_signals SET latitude=19.20825, longitude=73.188 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='ABHS25';
UPDATE div_signals SET latitude=19.21065, longitude=73.18298 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='ABHS22';
UPDATE div_signals SET latitude=19.21325, longitude=73.17668 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='GATE4';
UPDATE div_signals SET latitude=19.21516, longitude=73.16655 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE5714';
UPDATE div_signals SET latitude=19.2193, longitude=73.16096 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE5616';
UPDATE div_signals SET latitude=19.22432, longitude=73.15486 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='SE5602';
UPDATE div_signals SET latitude=19.2305, longitude=73.14641 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='KYNS84';
UPDATE div_signals SET latitude=19.23603, longitude=73.13899 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='KYNS81';
UPDATE div_signals SET latitude=18.91314, longitude=73.3209 WHERE is_active=1 AND section='KYN-KJT' AND line='UP SE' AND normalized_signal_number='KJTS135';
