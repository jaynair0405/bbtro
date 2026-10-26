-- TUH-VSH UP THB coordinates (local + prod). Date: 2026-10-26.
-- Match: signal_number + section + line + direction, NULL-guarded. Source: data/TNA_VSH/tuh_vsh_up.csv
-- Source mixes old numbers (confirmed by user): old S-11 = VSH S-3, old S-12 = VSH S-4, old S-16 = VSH S-8. Master holds the new numbers.

UPDATE div_signals SET latitude=19.06386, longitude=73.00007 WHERE signal_number='VSH S-3' AND section='TUH-VSH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06372, longitude=73.00005 WHERE signal_number='VSH S-4' AND section='TUH-VSH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06534, longitude=73.00643 WHERE signal_number='VSH S-8' AND section='TUH-VSH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.06631, longitude=73.01532 WHERE signal_number='TN-28' AND section='TUH-VSH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07019, longitude=73.01844 WHERE signal_number='TUH S-14' AND section='TUH-VSH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.07763, longitude=73.01725 WHERE signal_number='TUH S-6' AND section='TUH-VSH' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
