-- TUH-VSH DN THB coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/TNA_VSH/tuh_vsh_dn.csv
-- Source uses old numbers (confirmed by user): VSH S-4 renumbered VSH S-29; VSH S-19 renumbered VSH S-21.
-- VSH S-21 value equals its existing CSMT-PNVL UP HB copy.

UPDATE div_signals SET latitude=19.06895, longitude=73.01868 WHERE signal_number='TN-27' AND section='TUH-VSH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06668, longitude=73.01343 WHERE signal_number='TN-29' AND section='TUH-VSH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.0648, longitude=73.0044 WHERE signal_number='VSH S-29' AND section='TUH-VSH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06254, longitude=72.99761 WHERE signal_number='VSH S-21' AND section='TUH-VSH' AND line='DN THB' AND direction='DN' AND (latitude IS NULL OR longitude IS NULL);
