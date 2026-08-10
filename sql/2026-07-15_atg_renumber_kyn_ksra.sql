-- ATG (Atgaon) signal renumbering — KYN-KSRA, both directions.
-- Date: 2026-07-15
-- Source: user (S&T renumbering after our data was prepared). Same physical signals
-- (ids unchanged, coordinates unchanged) — only the number/label changes.
--
-- Mapping (old -> new):
--   UP NE:  S-27->S-48 (id 1265), S-18->S-43 (1266), S-19->S-44 (1926), S-17->S-41 (1267)
--   DN NE:  S-11->S-5  (id 1880), S-12->S-6  (1223), S-13->S-12 (1224)
-- Number reuse: DN old S-13 takes the number "12" that DN old S-12 vacates. Handled
-- by a two-phase update (vacate all -> reassign) so no transient duplicate on the
-- unique key (normalized_signal_number, section, line).
--
-- Aliases (AWS resolves tier-1 on normalized_alias, tier-2 on normalized_signal_number;
-- KYN-KSRA is in AWS_SECTIONS):
--   * keep each RETIRED old number as an alias so historical refs still resolve
--     (S-27/18/19/17, S-11, S-13),
--   * add each NEW number as an alias (convention + tier-1 hit),
--   * DROP the stale reused alias "ATG S-12" -> id 1223 (that number now belongs to
--     id 1224; leaving it would misdirect "ATG S-12" via tier 1).
-- Idempotent (safe to re-run).

-- Phase 1: vacate all seven old numbers to unique temp placeholders.
UPDATE div_signals
   SET signal_number = CONCAT('ATG TMP-', id),
       normalized_signal_number = CONCAT('ATGTMP', id)
 WHERE id IN (1265,1266,1926,1267,1880,1223,1224);

-- Phase 2: assign the final new numbers.
UPDATE div_signals SET signal_number='ATG S-48', normalized_signal_number='ATGS48' WHERE id=1265;
UPDATE div_signals SET signal_number='ATG S-43', normalized_signal_number='ATGS43' WHERE id=1266;
UPDATE div_signals SET signal_number='ATG S-44', normalized_signal_number='ATGS44' WHERE id=1926;
UPDATE div_signals SET signal_number='ATG S-41', normalized_signal_number='ATGS41' WHERE id=1267;
UPDATE div_signals SET signal_number='ATG S-5',  normalized_signal_number='ATGS5'  WHERE id=1880;
UPDATE div_signals SET signal_number='ATG S-6',  normalized_signal_number='ATGS6'  WHERE id=1223;
UPDATE div_signals SET signal_number='ATG S-12', normalized_signal_number='ATGS12' WHERE id=1224;

-- Drop the stale reused alias (old "ATG S-12" pointed at id 1223 = now ATG S-6).
DELETE FROM div_signal_aliases WHERE signal_id=1223 AND normalized_alias='ATGS12';

-- Annotate the retired old-number aliases (they already point to the correct id).
UPDATE div_signal_aliases
   SET remarks = 'Auto alias from section import | old number, renumbered 2026-07-15'
 WHERE (signal_id=1265 AND normalized_alias='ATGS27')
    OR (signal_id=1266 AND normalized_alias='ATGS18')
    OR (signal_id=1926 AND normalized_alias='ATGS19')
    OR (signal_id=1267 AND normalized_alias='ATGS17')
    OR (signal_id=1880 AND normalized_alias='ATGS11')
    OR (signal_id=1224 AND normalized_alias='ATGS13');

-- Add the new-number aliases (idempotent via unique normalized_alias).
INSERT IGNORE INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks, is_active)
VALUES
 (1265,'ATG S-48','ATGS48','manual','HIGH','New number after renumber 2026-07-15',1),
 (1266,'ATG S-43','ATGS43','manual','HIGH','New number after renumber 2026-07-15',1),
 (1926,'ATG S-44','ATGS44','manual','HIGH','New number after renumber 2026-07-15',1),
 (1267,'ATG S-41','ATGS41','manual','HIGH','New number after renumber 2026-07-15',1),
 (1880,'ATG S-5', 'ATGS5', 'manual','HIGH','New number after renumber 2026-07-15',1),
 (1223,'ATG S-6', 'ATGS6', 'manual','HIGH','New number after renumber 2026-07-15',1),
 (1224,'ATG S-12','ATGS12','manual','HIGH','New number after renumber 2026-07-15',1);
