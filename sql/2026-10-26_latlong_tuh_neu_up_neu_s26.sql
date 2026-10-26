-- TUH-NEU UP THB: NEU S-26 (PF-1 STR) coordinates (local + prod). Date: 2026-10-26.
-- Given by user in chat, appended to data/TNA_VSH/tuh_neu_up.csv. Completes TUH-NEU.

UPDATE div_signals SET latitude=19.034927816037452, longitude=73.01847454820386 WHERE signal_number='NEU S-26' AND section='TUH-NEU' AND line='UP THB' AND direction='UP' AND (latitude IS NULL OR longitude IS NULL);
