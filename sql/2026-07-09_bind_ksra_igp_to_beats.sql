-- Bind KSRA-IGP sections to beats
-- Date: 2026-07-09
--
-- KSRA-IGP ghat (Kasara–Igatpuri, NE): 4 sections
--   57 KSRA_IGP_DN_NE, 58 KSRA_IGP_UP_NE, 59 KSRA_IGP_DN_NE_MID, 60 KSRA_IGP_UP_NE_MID
-- Reading order = DN/UP per line-type (main pair, then middle pair).
-- Beats: CSMT_ML_MMR (5) + KYN_GOODS (7), appended after current max (14) -> 15-18.
-- PNVL_GOODS NOT applicable for KSRA-IGP (per user).
-- Boundary signals KSRA S-23/24/28 (KASARA UP platform starters) were EXCLUDED —
-- they live on KYN-KSRA/UP NE; onward routing goes in the NE route CSV.
-- Idempotent: INSERT IGNORE on unique (beat_id, section_id).

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order) VALUES
  -- CSMT_ML_MMR
  (5, 57, 15), (5, 58, 16), (5, 59, 17), (5, 60, 18),
  -- KYN_GOODS
  (7, 57, 15), (7, 58, 16), (7, 59, 17), (7, 60, 18);
