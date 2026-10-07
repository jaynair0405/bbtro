-- Undo 2026-10-07_pnvl_auto_kavach_wdg4.sql: removes exactly the rows it inserted (by tag).
DELETE FROM div_training_records WHERE general_remarks = 'pnvl_auto_sheet_2026-10-07' AND training_id IN (4, 5, 15);
