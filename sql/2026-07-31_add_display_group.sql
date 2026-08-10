-- Add display_group to div_signal_beat_sections for book-display consolidation.
-- Date: 2026-07-31
--
-- The data is split into many shared-trunk sections (each signal stored once, for
-- magnet/AWS). For the BOOK, a route should read as ONE continuous list (e.g. the PDF
-- shows DIVA-PNVL as a single flowing section, branches shown compactly). display_group
-- lets consecutive bound sections (same beat, same display_group) render under ONE
-- heading = the display_group text, without changing the underlying data. NULL =
-- section renders standalone with its own section_title (current behaviour), so this
-- is a no-op until groups are assigned.

ALTER TABLE div_signal_beat_sections
  ADD COLUMN display_group VARCHAR(80) NULL AFTER display_order;
