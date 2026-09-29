-- K-001 is the OLD number of CSMT S-45 (CSMT diversion diagram: "S-45 (OLD K-001)"); user 2026-09-29: retire it and keep
-- "K-001" as an alias of CSMT S-45 so old references (AWS reports, routes) still resolve.
--   alias K-001            -> CSMT S-45 (id 6)
--   routes CSMT S-6/S-7 -> K-001 now -> CSMT S-45 (the diagram shows Y = S-45 for both)
--   K-001 record (id 1058, no book row, no AWS events) -> is_active = 0, history 'Decommissioned'. Not deleted.
-- Undo: alias signal_id -> 1058; routes 92/93 -> 'K-001' / 1058; div_signals 1058 is_active = 1; delete the history row.
START TRANSACTION;
SET @s45 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND signal_number='CSMT S-45');
SET @k001 = (SELECT id FROM div_signals WHERE section='CSMT-KYN' AND line='DN TH' AND signal_number='K-001');
UPDATE div_signal_aliases SET signal_id = @s45, remarks = 'Old number of CSMT S-45 (K-001 retired 29 Sep 2026)'
 WHERE normalized_alias = 'K001' AND signal_id = @k001;
SELECT ROW_COUNT() AS alias_repointed;                                            -- expect 1
UPDATE div_signal_successors SET to_signal_text = 'CSMT S-45', to_signal_id = @s45
 WHERE to_signal_id = @k001 AND to_signal_text = 'K-001' AND from_signal_text IN ('CSMT S-6','CSMT S-7');
SELECT ROW_COUNT() AS routes_repointed;                                           -- expect 2
UPDATE div_signals SET is_active = 0 WHERE id = @k001 AND is_active = 1;
SELECT ROW_COUNT() AS k001_retired;                                               -- expect 1
INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)
  VALUES (@k001, 'Decommissioned', 'K-001', 'CSMT S-45', CURDATE(), 'Old number of CSMT S-45; alias kept (user 29 Sep)');
COMMIT;
