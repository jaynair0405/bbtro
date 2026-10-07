-- Undo 2026-10-07_promotion_alp_posting_csmt.sql
DELETE FROM div_promotion_history WHERE created_by = 'csmt_full_data_2026-10-07' AND to_designation_id = 1;
