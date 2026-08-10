-- PROD deploy: add missed signal ABH S-9 so AWS can detect it.
-- Date: 2026-08-06
--
-- PROD-SAFE: touches ONLY div_signals + div_signal_aliases (both exist on prod).
-- Does NOT touch the book tables (div_signal_book_rows / _book_sections) — those are
-- not on prod yet; the book rows for this signal stay local until the whole signal-book
-- book layer deploys. AWS matching needs only the div_signals row + its alias.
--
-- `on_curve` intentionally omitted (cosmetic; possible enum drift on prod) — it will
-- arrive with the eventual full div_signals sync. When that full sync runs, ABH S-9 will
-- already exist here: upsert/skip on uk_signal_section_line (KYN-KJT / UP SE / ABH S-9).

INSERT INTO div_signals
  (signal_number, normalized_signal_number, section, station_code, station_name,
   line, direction, location_text, km_from_csmt, latitude, longitude,
   signal_type, signal_function, placement,
   is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, has_legend_board, has_calling_on,
   has_shunt_signal, ri_left_arms, ri_right_arms, seq_order, book_description, is_active)
VALUES
  ('ABH S-9', 'ABHS9', 'KYN-KJT', 'ABH', 'Ambernath',
   'UP SE', 'DN', 'PF-3 KJT END STR', 59.795, 19.2093711, 73.1860105,
   'Manual', 'Starter', 'Left',
   0, 0, 1, 0, 0, 0,
   1, 0, 0, 1, 'FOR DN DIRECTION ONLY', 1);

SET @sid = LAST_INSERT_ID();
UPDATE div_signals SET magnet_id = @sid WHERE id = @sid;   -- self-magnet (unique)

INSERT INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks)
VALUES (@sid, 'ABH S-9', 'ABHS9', 'manual', 'HIGH', 'Missed signal, manual add 2026-08-06');

-- verify
SELECT id, signal_number, section, line, direction, magnet_id FROM div_signals WHERE id=@sid;
SELECT signal_id, alias_text, normalized_alias FROM div_signal_aliases WHERE signal_id=@sid;
