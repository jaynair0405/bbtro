-- KYN-KSRA DN NE gap-signal coordinates backfill
-- Date: 2026-07-15
-- Source: data/KYN_KSRA/upload_lat_long_kyn_ksra_up.xlsx (user file bundled UP survey
-- + the 9 DN-gap signals). Split by DB membership: rows here belong to line "DN NE".
-- Matched by normalized signal_number within section=KYN-KSRA. Idempotent.

UPDATE div_signals SET latitude=19.2358369976952, longitude=73.1326397913647 WHERE is_active=1 AND section='KYN-KSRA' AND line='DN NE' AND normalized_signal_number='KYNS58';
UPDATE div_signals SET latitude=19.23689, longitude=73.13449 WHERE is_active=1 AND section='KYN-KSRA' AND line='DN NE' AND normalized_signal_number='KYNS66';
UPDATE div_signals SET latitude=19.2974378869155, longitude=73.2034626740569 WHERE is_active=1 AND section='KYN-KSRA' AND line='DN NE' AND normalized_signal_number='TLAS6';
UPDATE div_signals SET latitude=19.3586, longitude=73.223 WHERE is_active=1 AND section='KYN-KSRA' AND line='DN NE' AND normalized_signal_number='KDVS11';
UPDATE div_signals SET latitude=19.40823, longitude=73.26958 WHERE is_active=1 AND section='KYN-KSRA' AND line='DN NE' AND normalized_signal_number='VSDS4';
UPDATE div_signals SET latitude=19.40726, longitude=73.2679 WHERE is_active=1 AND section='KYN-KSRA' AND line='DN NE' AND normalized_signal_number='VSDS5';
UPDATE div_signals SET latitude=19.44361, longitude=73.30907 WHERE is_active=1 AND section='KYN-KSRA' AND line='DN NE' AND normalized_signal_number='ASOS6';
UPDATE div_signals SET latitude=19.50728, longitude=73.32684 WHERE is_active=1 AND section='KYN-KSRA' AND line='DN NE' AND normalized_signal_number='ATGS5';
UPDATE div_signals SET latitude=19.58291, longitude=73.39616 WHERE is_active=1 AND section='KYN-KSRA' AND line='DN NE' AND normalized_signal_number='KES11';
