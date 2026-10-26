-- KYN S-59 (PF-6 STR, DN) coordinates on all three book copies (local + prod). Date: 2026-10-26.
-- Given by user in chat. Same magnet_id on KYN-KSRA DN NE, KYN-KJT DN SE, CSMT-KYN DN TH. NULL-guarded.
-- (Signal added 2026-09-29, sheet 5, after the original KYN-KSRA coordinate load.)

UPDATE div_signals SET latitude=19.235803666677516, longitude=73.13287488338763 WHERE signal_number='KYN S-59' AND ((section='KYN-KSRA' AND line='DN NE') OR (section='KYN-KJT' AND line='DN SE') OR (section='CSMT-KYN' AND line='DN TH')) AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
