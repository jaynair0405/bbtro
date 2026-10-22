-- TS-040b: CSMT Trip Shed's TI-train list, seeded from the CR loco-link PDF (12.09.2025):
-- UP trains terminating at CSMT whose arrival is followed by a "TI" marker in their link.
-- departs_as is the follow-on working read from the two-column PDF and may need a CSMT
-- supervisor's correction on screen. IGP and LNL are banker sheds and get no list.
-- Idempotent.
INSERT INTO div_trip_ti_trains (shed_id, train_no, arrival_station, departs_as, source, remark)
SELECT s.id, v.train_no, 'CSMT', v.departs_as, 'LINK-PDF-12.09.2025', 'verify departs_as'
  FROM div_trip_sheds s
  JOIN (
    SELECT '10104' train_no, '12051' departs_as UNION ALL
    SELECT '11002', '22157' UNION ALL
    SELECT '11010', '12135 / 18237' UNION ALL
    SELECT '11030', '01027 / 11059 / 18844' UNION ALL
    SELECT '11058', '12111' UNION ALL
    SELECT '12112', '12137' UNION ALL
    SELECT '12124', '12115' UNION ALL
    SELECT '12128', '22221' UNION ALL
    SELECT '12138', '22177' UNION ALL
    SELECT '12533', '12071' UNION ALL
    SELECT '12597', '22183' UNION ALL
    SELECT '20112', '12133' UNION ALL
    SELECT '22158', '22107' UNION ALL
    SELECT '22178', '12859' UNION ALL
    SELECT '22222', '01026'
  ) v
 WHERE s.shed_code = 'CSMT'
ON DUPLICATE KEY UPDATE departs_as = VALUES(departs_as), source = VALUES(source), remark = VALUES(remark);

-- Rollback: DELETE x FROM div_trip_ti_trains x JOIN div_trip_sheds s ON s.id=x.shed_id WHERE s.shed_code='CSMT';
