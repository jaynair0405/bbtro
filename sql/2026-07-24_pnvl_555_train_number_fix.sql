-- =====================================================================
-- Fix HB87-555 (PDF 555) — DW->PEN leg (09:40->11:15) carried the wrong
-- train number 61017 (that number belongs to 554's DW->PNVL run).
-- Per new PDF it is 61023. Scoped to 555 only (61017 stays on 554).
-- Times unchanged, so wheel movement is unaffected.
-- =====================================================================

UPDATE trains
   SET train_number = 'DW-PEN 61023'
 WHERE detail_id = 'HB87-555'
   AND train_number = 'DW-PEN 61017'
   AND start_time = '09:40:00';
