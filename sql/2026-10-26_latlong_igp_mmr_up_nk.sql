-- IGP-MMR UP NE: NK S-66 (PF-3 STR) and NK S-55 (186/08) coordinates, given by user in chat (local + prod). Date: 2026-10-26.
-- Order checks out between NK S-67 (187/18) and NK S-41 (185/18A). NULL-guarded; no copies in other sections.

UPDATE div_signals SET latitude=19.944735074393893, longitude=73.84169943676872 WHERE signal_number='NK S-66' AND section='IGP-MMR' AND line='UP NE' AND direction='UP' AND is_active=1 AND (latitude IS NULL OR longitude IS NULL);
UPDATE div_signals SET latitude=19.9389485, longitude=73.8403214 WHERE signal_number='NK S-55' AND section='IGP-MMR' AND line='UP NE' AND direction='UP' AND is_active=1 AND (latitude IS NULL OR longitude IS NULL);
