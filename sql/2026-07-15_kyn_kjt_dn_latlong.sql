-- ============================================================================
-- KYN-KJT DN — signal latitude / longitude (survey upload)
-- 2026-07-15
--
-- Source: data/KYN_KJT/upload_lat_long.xlsx, sheet kyn_kjt_dn (59 signals).
-- For RTIS / mapping only — NOT used by AWS. Each row keyed by the resolved
-- div_signals.id (section KYN-KJT, direction DN), so no name matching happens
-- at load. Every id was verified to match exactly one signal; the 7 Gate
-- signals that share a name across UP/DN are disambiguated because the survey
-- sheet is DN-only.
--
-- KYN S-56 and KYN S-58 are deliberately absent from the survey: they are the
-- same physical signal as the DN-through copy and are handled via magnet_id.
-- ============================================================================

SELECT COUNT(*) AS before_with_latlong FROM div_signals
 WHERE section='KYN-KJT' AND direction='DN' AND latitude IS NOT NULL;

UPDATE div_signals SET latitude=19.23361, longitude=73.14278 WHERE id=1061;  -- KYN S-82
UPDATE div_signals SET latitude=19.22757, longitude=73.15026 WHERE id=1062;  -- SE-5511
UPDATE div_signals SET latitude=19.2215, longitude=73.15826 WHERE id=1063;  -- SE-5609
UPDATE div_signals SET latitude=19.21709, longitude=73.16467 WHERE id=1064;  -- SE-5707
UPDATE div_signals SET latitude=19.21377, longitude=73.17434 WHERE id=1065;  -- Gate-4
UPDATE div_signals SET latitude=19.21242, longitude=73.17922 WHERE id=1066;  -- ABH S-2
UPDATE div_signals SET latitude=19.20953, longitude=73.18609 WHERE id=1067;  -- ABH S-6
UPDATE div_signals SET latitude=19.20436, longitude=73.19274 WHERE id=1068;  -- ABH S-15
UPDATE div_signals SET latitude=19.20037, longitude=73.19836 WHERE id=1069;  -- ABH S-18
UPDATE div_signals SET latitude=19.19683, longitude=73.20411 WHERE id=1070;  -- SE-6205
UPDATE div_signals SET latitude=19.19053, longitude=73.21041 WHERE id=1071;  -- Gate-7
UPDATE div_signals SET latitude=19.18567, longitude=73.21504 WHERE id=1072;  -- SE-6315
UPDATE div_signals SET latitude=19.18182, longitude=73.22033 WHERE id=1073;  -- SE-6411
UPDATE div_signals SET latitude=19.17767, longitude=73.22497 WHERE id=1074;  -- SE-6513
UPDATE div_signals SET latitude=19.17394, longitude=73.22953 WHERE id=1075;  -- SE-6515
UPDATE div_signals SET latitude=19.16968, longitude=73.23269 WHERE id=1076;  -- BUD S-2
UPDATE div_signals SET latitude=19.16654, longitude=73.24101 WHERE id=1077;  -- BUD S-9
UPDATE div_signals SET latitude=19.15892, longitude=73.24754 WHERE id=1078;  -- BUD S-12
UPDATE div_signals SET latitude=19.15597, longitude=73.24863 WHERE id=1079;  -- BUD S-14
UPDATE div_signals SET latitude=19.14863, longitude=73.25187 WHERE id=1080;  -- SE-6913
UPDATE div_signals SET latitude=19.14125, longitude=73.25686 WHERE id=1081;  -- SE-7013
UPDATE div_signals SET latitude=19.1337, longitude=73.26086 WHERE id=1082;  -- SE-7113
UPDATE div_signals SET latitude=19.12418, longitude=73.26437 WHERE id=1083;  -- SE-7223
UPDATE div_signals SET latitude=19.12068, longitude=73.26688 WHERE id=1084;  -- SE-7307
UPDATE div_signals SET latitude=19.11541, longitude=73.27188 WHERE id=1085;  -- SE-7403
UPDATE div_signals SET latitude=19.11122, longitude=73.2769 WHERE id=1086;  -- SE-7413
UPDATE div_signals SET latitude=19.10666, longitude=73.27983 WHERE id=1087;  -- SE-7507
UPDATE div_signals SET latitude=19.10316, longitude=73.28362 WHERE id=1088;  -- Gate-16
UPDATE div_signals SET latitude=19.09977, longitude=73.29025 WHERE id=1089;  -- SE-7613
UPDATE div_signals SET latitude=19.09829, longitude=73.29391 WHERE id=1090;  -- VGI S-2
UPDATE div_signals SET latitude=19.09665, longitude=73.29738 WHERE id=1091;  -- VGI S-7
UPDATE div_signals SET latitude=19.09132, longitude=73.30465 WHERE id=1092;  -- VGI S-3
UPDATE div_signals SET latitude=19.08869, longitude=73.30699 WHERE id=1093;  -- VGI S-8
UPDATE div_signals SET latitude=19.08286, longitude=73.31153 WHERE id=1094;  -- Gate-18
UPDATE div_signals SET latitude=19.07698, longitude=73.31381 WHERE id=1095;  -- SE-8009
UPDATE div_signals SET latitude=19.07122, longitude=73.31641 WHERE id=1096;  -- Gate-19
UPDATE div_signals SET latitude=19.06568, longitude=73.31767 WHERE id=1097;  -- SE-8115
UPDATE div_signals SET latitude=19.06088, longitude=73.31784 WHERE id=1098;  -- SE-8205
UPDATE div_signals SET latitude=19.05348, longitude=73.31714 WHERE id=1099;  -- SE-8303
UPDATE div_signals SET latitude=19.04651, longitude=73.31681 WHERE id=1100;  -- Gate- 20
UPDATE div_signals SET latitude=19.03997, longitude=73.31739 WHERE id=1101;  -- NRL S-27
UPDATE div_signals SET latitude=19.02991, longitude=73.31836 WHERE id=1102;  -- NRL S-21
UPDATE div_signals SET latitude=19.0248, longitude=73.31885 WHERE id=1103;  -- NRL S-18
UPDATE div_signals SET latitude=19.01868, longitude=73.32059 WHERE id=1104;  -- NRL S-17
UPDATE div_signals SET latitude=19.01389, longitude=73.32725 WHERE id=1105;  -- SE-8801
UPDATE div_signals SET latitude=19.00717, longitude=73.33003 WHERE id=1106;  -- SE-8813
UPDATE div_signals SET latitude=18.99972, longitude=73.33083 WHERE id=1107;  -- Gate-22
UPDATE div_signals SET latitude=18.99225, longitude=73.331 WHERE id=1108;  -- SE-9007
UPDATE div_signals SET latitude=18.98455, longitude=73.33118 WHERE id=1109;  -- SE-9105
UPDATE div_signals SET latitude=18.97691, longitude=73.33136 WHERE id=1110;  -- BVS S-2
UPDATE div_signals SET latitude=18.96647, longitude=73.33166 WHERE id=1111;  -- BVS S-3
UPDATE div_signals SET latitude=18.9585, longitude=73.33179 WHERE id=1112;  -- BVS S-8
UPDATE div_signals SET latitude=18.95036, longitude=73.33166 WHERE id=1113;  -- Gate-25
UPDATE div_signals SET latitude=18.94512, longitude=73.33049 WHERE id=1114;  -- SE-9511
UPDATE div_signals SET latitude=18.93995, longitude=73.32908 WHERE id=1115;  -- Gate-26
UPDATE div_signals SET latitude=18.93368, longitude=73.32737 WHERE id=1116;  -- SE-9615
UPDATE div_signals SET latitude=18.92737, longitude=73.32565 WHERE id=1117;  -- Gate-27
UPDATE div_signals SET latitude=18.92308, longitude=73.32427 WHERE id=1118;  -- SE-9803
UPDATE div_signals SET latitude=18.91913, longitude=73.32213 WHERE id=1119;  -- KJT S-2

SELECT COUNT(*) AS after_with_latlong FROM div_signals
 WHERE section='KYN-KJT' AND direction='DN' AND latitude IS NOT NULL;

-- Anything still without a coordinate on the DN road (expect KYN S-56, KYN S-58):
SELECT id, signal_number FROM div_signals
 WHERE section='KYN-KJT' AND direction='DN' AND latitude IS NULL AND is_active=1;
