-- Bind KJT-LNL sections to beats
-- Date: 2026-07-09
--
-- KJT-LNL ghat (Karjat–Lonavla): 4 sections
--   53 KJT_LNL_DN_SE, 54 KJT_LNL_UP_SE, 55 KJT_LNL_DN_SE_MID, 56 KJT_LNL_UP_SE_MID
-- Reading order = DN/UP per line-type (main pair, then middle pair), matching the
-- DN LOC/UP LOC/DN TH/UP TH ordering used in KYN_SUB.
-- Beats: CSMT_ML_MMR (5, append 11-14), KYN_GOODS (7, append 11-14),
--        PNVL_GOODS (1, first sections 1-4).
-- Idempotent: INSERT IGNORE on the unique (beat_id, section_id).

INSERT IGNORE INTO div_signal_beat_sections (beat_id, section_id, display_order) VALUES
  -- CSMT_ML_MMR
  (5, 53, 11), (5, 54, 12), (5, 55, 13), (5, 56, 14),
  -- KYN_GOODS
  (7, 53, 11), (7, 54, 12), (7, 55, 13), (7, 56, 14),
  -- PNVL_GOODS (empty beat — KJT-LNL is its first content)
  (1, 53, 1), (1, 54, 2), (1, 55, 3), (1, 56, 4);
