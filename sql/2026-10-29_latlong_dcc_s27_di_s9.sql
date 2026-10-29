-- DCC S-27 (44/49) and DI S-9 (46/29) coordinates, given by user in chat (local + prod). Date: 2026-10-29.
-- DCC S-27 on DW-DCC BSR UP and its DAT-DCC DIVA UP copy (same magnet_id); DI S-9 on DCC-KYN DIVA DN.
-- DI S-9 latitude was typed with a leading '-' (-19.208...); used as 19.208... . NULL-guarded.

UPDATE div_signals SET latitude=19.20123855411829, longitude=73.0647284010977 WHERE signal_number='DCC S-27' AND ((section='DW-DCC' AND line='BSR UP') OR (section='DAT-DCC' AND line='DIVA UP')) AND direction='UP' AND is_active=1 AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.20833279861605, longitude=73.07476655601778 WHERE signal_number='DI S-9' AND section='DCC-KYN' AND line='DIVA DN' AND direction='DN' AND is_active=1 AND (latitude IS NULL OR longitude IS NULL);
