-- Undo 2026-10-07_csmt_kavach.sql: removes exactly the rows it inserted (by tag).
DELETE FROM div_training_records WHERE general_remarks = 'csmt_kavach_sheet_2026-10-07' AND training_id = 4;
