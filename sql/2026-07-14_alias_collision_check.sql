-- ============================================================================
-- Alias collision check — did the ghat sync land its aliases? (PRODUCTION)
-- 2026-07-14
--
-- 2026-07-13_signals_sync_kjt_lnl_ksra_igp.sql inserted 124 aliases with
-- INSERT IGNORE, deduped on the UNIQUE normalized_alias. Prod's alias count went
-- 1297 -> 1409, i.e. only 112 landed: TWELVE were skipped because prod ALREADY
-- had an alias with that text — pointing somewhere else, because prod had no
-- KJT-LNL / KSRA-IGP signals to point at.
--
-- Those twelve are the exact hazard the sync existed to remove: an alias reading
-- "KJT S-22" that resolves to the KJT-KHPI copy instead of the KJT-LNL one. The
-- alias tier runs FIRST in matchSignalFromDb, so it wins — silently, on a signal
-- that looks perfectly resolved.
--
-- This file only REPORTS. It changes nothing. Paste the output back.
-- ============================================================================

DROP TEMPORARY TABLE IF EXISTS expected_alias;
CREATE TEMPORARY TABLE expected_alias (
  normalized_alias VARCHAR(100) PRIMARY KEY,
  expected_signal_id INT,
  expected_signal   VARCHAR(64),
  expected_section  VARCHAR(32),
  expected_direction VARCHAR(8)
);

INSERT INTO expected_alias VALUES
('GATE30',2047,'Gate-30','KJT-LNL','UP'),
('GATE30MID',2092,'Gate-30 MID','KJT-LNL','UP'),
('GATE30MIDDISTANT',2091,'Gate 30 MID Distant','KJT-LNL','UP'),
('GATEDISTANT',2046,'Gate Distant','KJT-LNL','UP'),
('IGPS1',2123,'IGP S-1','KSRA-IGP','DN'),
('IGPS2',2153,'IGP S-2','KSRA-IGP','DN'),
('IGPS32',2154,'IGP S-32','KSRA-IGP','UP'),
('IGPS36',2156,'IGP S-36','KSRA-IGP','UP'),
('IGPS38',2155,'IGP S-38','KSRA-IGP','UP'),
('IGPS58',2130,'IGP S-58','KSRA-IGP','UP'),
('IGPS59',2157,'IGP S-59','KSRA-IGP','UP'),
('IGPS64',2124,'IGP S-64','KSRA-IGP','DN'),
('IGPS66',2125,'IGP S-66','KSRA-IGP','DN'),
('IGPS67',2126,'IGP S-67','KSRA-IGP','DN'),
('JBCDISTANT',2020,'JBC Distant','KJT-LNL','DN'),
('JBCS1',2021,'JBC S-1','KJT-LNL','DN'),
('KADDISTANT',2076,'KAD Distant','KJT-LNL','DN'),
('KADS1',2030,'KAD S-1','KJT-LNL','DN'),
('KADS11',2048,'KAD S-11','KJT-LNL','UP'),
('KADS12',2094,'KAD S-12','KJT-LNL','UP'),
('KADS15',2093,'KAD S-15','KJT-LNL','UP'),
('KADS1REP',2029,'KAD S-1 REP','KJT-LNL','DN'),
('KADS2',2077,'KAD S-2','KJT-LNL','DN'),
('KADS3',2078,'KAD S-3','KJT-LNL','DN'),
('KADS4',2031,'KAD S-4','KJT-LNL','DN'),
('KADS8',2049,'KAD S-8','KJT-LNL','UP'),
('KADS9',2095,'KAD S-9','KJT-LNL','UP'),
('KJTS106',2107,'KJT S-106','KJT-LNL','UP'),
('KJTS16',2060,'KJT S-16','KJT-LNL','DN'),
('KJTS21',2061,'KJT S-21','KJT-LNL','DN'),
('KJTS22',2062,'KJT S-22','KJT-LNL','DN'),
('KJTS28',2064,'KJT S-28','KJT-LNL','DN'),
('KJTS38',2013,'KJT S-38','KJT-LNL','DN'),
('KJTS39',2063,'KJT S-39','KJT-LNL','DN'),
('KJTS42',2065,'KJT S-42','KJT-LNL','DN'),
('KJTS61',2016,'KJT S-61','KJT-LNL','DN'),
('KJTS62',2066,'KJT S-62','KJT-LNL','DN'),
('KJTS72',2058,'KJT S-72','KJT-LNL','UP'),
('KJTS73',2105,'KJT S-73','KJT-LNL','UP'),
('KJTS81',2059,'KJT S-81','KJT-LNL','UP'),
('KJTS87',2106,'KJT S-87','KJT-LNL','UP'),
('KSRADISTANT',2166,'KSRA Distant','KSRA-IGP','UP'),
('KSRAS43',2111,'KSRA S-43','KSRA-IGP','DN'),
('KSRAS44',2112,'KSRA S-44','KSRA-IGP','DN'),
('KSRAS45',2113,'KSRA S-45','KSRA-IGP','DN'),
('KSRAS46',2141,'KSRA S-46','KSRA-IGP','DN'),
('KSRAS48',2142,'KSRA S-48','KSRA-IGP','DN'),
('KSRAS49',2143,'KSRA S-49','KSRA-IGP','DN'),
('KSRAS65',2114,'KSRA S-65','KSRA-IGP','DN'),
('KSRAS66',2144,'KSRA S-66','KSRA-IGP','DN'),
('KSRAS68',2140,'KSRA S-68','KSRA-IGP','UP'),
('KSRAS69',2167,'KSRA S-69','KSRA-IGP','UP'),
('LNLDISTANT',2079,'LNL Distant','KJT-LNL','DN'),
('LNLS1',2033,'LNL S-1','KJT-LNL','DN'),
('LNLS2',2080,'LNL S-2','KJT-LNL','DN'),
('LNLS3',2034,'LNL S-3','KJT-LNL','DN'),
('LNLS4',2081,'LNL S-4','KJT-LNL','DN'),
('LNLS6',2036,'LNL S-6','KJT-LNL','DN'),
('LNLS61',2045,'LNL S-61','KJT-LNL','UP'),
('LNLS62',2090,'LNL S-62','KJT-LNL','UP'),
('LNLS63',2086,'LNL S-63','KJT-LNL','UP'),
('LNLS64',2085,'LNL S-64','KJT-LNL','UP'),
('LNLS65',2083,'LNL S-65','KJT-LNL','UP'),
('LNLS66',2084,'LNL S-66','KJT-LNL','UP'),
('LNLS68',2089,'LNL S-68','KJT-LNL','UP'),
('LNLS69',2088,'LNL S-69','KJT-LNL','UP'),
('LNLS6REP',2035,'LNL S-6 REP','KJT-LNL','DN'),
('LNLS70',2087,'LNL S-70','KJT-LNL','UP'),
('LNLS8',2037,'LNL S-8','KJT-LNL','DN'),
('LNLS9',2082,'LNL S-9','KJT-LNL','DN'),
('MHLCDISTANT',2096,'MHLC Distant','KJT-LNL','UP'),
('MHLCS1',2026,'MHLC S-1','KJT-LNL','DN'),
('MHLCS10',2051,'MHLC S-10','KJT-LNL','UP'),
('MHLCS2',2074,'MHLC S-2','KJT-LNL','DN'),
('MHLCS3',2027,'MHLC S-3','KJT-LNL','DN'),
('MHLCS4',2075,'MHLC S-4','KJT-LNL','DN'),
('MHLCS7',2098,'MHLC S-7','KJT-LNL','UP'),
('MHLCS8',2052,'MHLC S-8','KJT-LNL','UP'),
('MHLCS9',2097,'MHLC S-9','KJT-LNL','UP'),
('NNCNDISTANT',2053,'NNCN Distant','KJT-LNL','UP'),
('NNCNS1',2054,'NNCN S-1','KJT-LNL','UP'),
('PDIDISTANT',2102,'PDI Distant','KJT-LNL','UP'),
('PDIS1',2017,'PDI S-1','KJT-LNL','DN'),
('PDIS11',2018,'PDI S-11','KJT-LNL','DN'),
('PDIS12',2068,'PDI S-12','KJT-LNL','DN'),
('PDIS14',2019,'PDI S-14','KJT-LNL','DN'),
('PDIS15',2069,'PDI S-15','KJT-LNL','DN'),
('PDIS17',2056,'PDI S-17','KJT-LNL','UP'),
('PDIS18',2103,'PDI S-18','KJT-LNL','UP'),
('PDIS2',2067,'PDI S-2','KJT-LNL','DN'),
('PDIS6',2057,'PDI S-6','KJT-LNL','UP'),
('PDIS7',2104,'PDI S-7','KJT-LNL','UP'),
('TGR1DISTANT',2151,'TGR-1 Distant','KSRA-IGP','DN'),
('TGR1S1',2122,'TGR-1 S-1','KSRA-IGP','DN'),
('TGR1S2',2152,'TGR-1 S-2','KSRA-IGP','DN'),
('TGR1S3',2159,'TGR-1 S-3','KSRA-IGP','UP'),
('TGR1S4',2158,'TGR-1 S-4','KSRA-IGP','UP'),
('TGR1S5',2132,'TGR-1 S-5','KSRA-IGP','UP'),
('TGR1S6',2131,'TGR-1 S-6','KSRA-IGP','UP'),
('TGR2DISTANT',2160,'TGR-2 Distant','KSRA-IGP','UP'),
('TGR2S2',2119,'TGR-2 S-2','KSRA-IGP','DN'),
('TGR2S3',2149,'TGR-2 S-3','KSRA-IGP','DN'),
('TGR2S4',2162,'TGR-2 S-4','KSRA-IGP','UP'),
('TGR2S5',2135,'TGR-2 S-5','KSRA-IGP','UP'),
('TGR2S6',2120,'TGR-2 S-6','KSRA-IGP','DN'),
('TGR2S7',2150,'TGR-2 S-7','KSRA-IGP','DN'),
('TGR2S8',2161,'TGR-2 S-8','KSRA-IGP','UP'),
('TGR2S9',2134,'TGR-2 S-9','KSRA-IGP','UP'),
('TGR3DISTANT',2163,'TGR-3 Distant','KSRA-IGP','UP'),
('TGR3S2',2116,'TGR-3 S-2','KSRA-IGP','DN'),
('TGR3S3',2146,'TGR-3 S-3','KSRA-IGP','DN'),
('TGR3S4',2165,'TGR-3 S-4','KSRA-IGP','UP'),
('TGR3S5',2138,'TGR-3 S-5','KSRA-IGP','UP'),
('TGR3S6',2117,'TGR-3 S-6','KSRA-IGP','DN'),
('TGR3S7',2147,'TGR-3 S-7','KSRA-IGP','DN'),
('TGR3S8',2164,'TGR-3 S-8','KSRA-IGP','UP'),
('TGR3S9',2137,'TGR-3 S-9','KSRA-IGP','UP'),
('TKWDISTANT',2099,'TKW Distant','KJT-LNL','UP'),
('TKWS1',2023,'TKW S-1','KJT-LNL','DN'),
('TKWS2',2071,'TKW S-2','KJT-LNL','DN'),
('TKWS3',2101,'TKW S-3','KJT-LNL','UP'),
('TKWS4',2024,'TKW S-4','KJT-LNL','DN'),
('TKWS5',2072,'TKW S-5','KJT-LNL','DN'),
('TKWS6',2100,'TKW S-6','KJT-LNL','UP');

SELECT '--- Aliases that do NOT point where local says they should ---' AS ``;

SELECT e.normalized_alias,
       a.alias_text                              AS alias_text,
       CONCAT(s.signal_number,' [',s.section,'/',IFNULL(s.direction,'?'),']')  AS points_at_now,
       CONCAT(e.expected_signal,' [',e.expected_section,'/',e.expected_direction,']') AS should_point_at,
       a.id AS alias_id, a.source
  FROM expected_alias e
  JOIN div_signal_aliases a ON a.normalized_alias = e.normalized_alias
  JOIN div_signals s        ON s.id = a.signal_id
 WHERE a.signal_id <> e.expected_signal_id
 ORDER BY e.normalized_alias;

-- One pass: a TEMPORARY table cannot be referenced twice in the same statement.
SELECT '--- counts ---' AS ``;
SELECT COUNT(*)                                                        AS expected_total,
       SUM(a.id IS NOT NULL AND a.signal_id =  e.expected_signal_id)   AS correct,
       SUM(a.id IS NOT NULL AND a.signal_id <> e.expected_signal_id)   AS wrong,
       SUM(a.id IS NULL)                                               AS missing
  FROM expected_alias e
  LEFT JOIN div_signal_aliases a ON a.normalized_alias = e.normalized_alias;
