-- ============================================================================
-- Add signals missing from beat-book imports (AWS Phase 7 / rule-1 prep)
-- Date    : 2026-06-12
-- Context : Found while validating test_for_platform_parrallel_signals.csv.
--           None of these exist in any import csv, so they must ship as SQL.
--   1. TNA S-65  — proper UP TH signal (PF-6 KE = located near PF-6, KYN End).
--                  Was in original upth_signal.csv, dropped in corrected file.
--   2. TNA S-28  — PF-7 UP-direction starter standing on the physical 5th
--                  line (TNA turn-back trains; joins UP TH after departure).
--                  Stored as CLA-KYN / 5TH / UP — same physical line name,
--                  direction distinguishes it from the DN 5th-line partition.
--   3. KYN S-63  — PF-4 approach signal fed from UP NE (S-71) and UP SE
--                  (S-81). No named line of its own → assigned to the line it
--                  feeds into (UP TH). Connectivity via div_signal_successors.
--   4. K-001     — DN TH automatic between CSMT platform starters (S-4..S-7)
--                  and CSMT S-56. km approximate (user to confirm).
-- Idempotent: ON DUPLICATE KEY UPDATE refreshes in place.
-- After running: re-run seq_order populate (step 3 of
-- sql/2026-06-05_aws_signal_succession.sql) so new rows get sequenced.
-- ============================================================================

INSERT INTO div_signals
    (signal_number, normalized_signal_number, station_code, station_name,
     section, `line`, direction, location_text, km_from_csmt,
     latitude, longitude, signal_type, placement,
     is_rhs, is_lhs, has_legend_board, visibility_distance_m,
     technical_remarks, is_active)
VALUES
    ('TNA S-65', 'TNAS65', 'TNA', 'Thane',
     'CSMT-KYN', 'UP TH', 'UP', 'PF-6 KE', 33.318,
     19.18688, 72.97865, 'Semi-Automatic', 'Right',
     1, 0, 1, 200,
     'PF-6 KE = near PF-6 starting, KYN End. Restored 2026-06-12 (dropped from corrected upth csv).', 1),

    ('TNA S-28', 'TNAS28', 'TNA', 'Thane',
     'CLA-KYN', '5TH', 'UP', 'PF-7 UP STR', NULL,
     19.18468, 72.97168, 'Semi-Automatic', 'Left',
     0, 1, 0, 200,
     'Turn-back PF-7 UP starter on physical 5th line; departs onto UP TH. Sequence via div_signal_successors only.', 1),

    ('KYN S-63', 'KYNS63', 'KYN', 'Kalyan',
     'CSMT-KYN', 'UP TH', 'UP', 'PF-4 APPROACH', NULL,
     NULL, NULL, 'Semi-Automatic', 'Left',
     0, 1, 0, 200,
     'Approach into KYN PF-4 from UP NE (S-71) / UP SE (S-81). No named line; assigned to fed line UP TH. Sequence via div_signal_successors only.', 1),

    ('K-001', 'K001', 'CSMT', 'CSMT',
     'CSMT-KYN', 'DN TH', 'DN', 'Between CSMT starters and S-56', 0.300,
     NULL, NULL, 'Automatic', 'Left',
     0, 1, 0, 200,
     'km approximate (between CSMT PF starters S-4..S-7 and CSMT S-56) — user to confirm exact km.', 1)
ON DUPLICATE KEY UPDATE
    station_code      = VALUES(station_code),
    station_name      = VALUES(station_name),
    direction         = VALUES(direction),
    location_text     = VALUES(location_text),
    km_from_csmt      = VALUES(km_from_csmt),
    latitude          = VALUES(latitude),
    longitude         = VALUES(longitude),
    signal_type       = VALUES(signal_type),
    placement         = VALUES(placement),
    is_rhs            = VALUES(is_rhs),
    is_lhs            = VALUES(is_lhs),
    has_legend_board  = VALUES(has_legend_board),
    technical_remarks = VALUES(technical_remarks),
    is_active         = 1;

-- Aliases so AWS event matching finds them
INSERT INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks, is_active)
SELECT s.id, s.signal_number, s.normalized_signal_number, 'manual', 'HIGH', 'Added 2026-06-12 missing-signals fix', 1
FROM div_signals s
WHERE s.normalized_signal_number IN ('TNAS65','TNAS28','KYNS63','K001')
ON DUPLICATE KEY UPDATE signal_id = VALUES(signal_id), is_active = 1;

-- Verification
SELECT signal_number, section, `line`, direction, location_text, km_from_csmt
FROM div_signals
WHERE normalized_signal_number IN ('TNAS65','TNAS28','KYNS63','K001');
