-- MMR S-6 (PF-3 UP STR): fill its MMR-BSL UP NE copy (same magnet_id) with the IGP-MMR UP NE value. Date: 2026-10-26.
-- Source: data/IGP_MMR/igp_mmr_up_new.csv. NULL-guarded.

UPDATE div_signals SET latitude=20.2483135, longitude=74.4338875 WHERE signal_number='MMR S-6' AND section='MMR-BSL' AND line='UP NE' AND direction='UP' AND is_active=1 AND (latitude IS NULL OR longitude IS NULL);
