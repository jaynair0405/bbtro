-- Add lead_in_note to div_signal_beat_sections for book cross-reference captions.
-- Date: 2026-08-03
--
-- Complements display_group (sql/2026-07-31_add_display_group.sql). Where a route is
-- split into shared-junction blocks and stubs, the stub carries a "From … / To …"
-- pointer into the full-run heading (how a real signal book handles a convergence,
-- e.g. DIVA-BSR "To DI S-8, DI S-5; joins BSR (see DAT-BSR)"). The renderer prints it
-- as an italic caption under the section/group heading. NULL = no caption.

ALTER TABLE div_signal_beat_sections
  ADD COLUMN lead_in_note VARCHAR(160) NULL AFTER display_group;
