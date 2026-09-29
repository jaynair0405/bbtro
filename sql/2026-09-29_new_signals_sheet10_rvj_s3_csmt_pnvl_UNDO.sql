-- Undo of 2026-09-29_new_signals_sheet10_rvj_s3_csmt_pnvl.sql
START TRANSACTION;
UPDATE div_signals SET parallel_group_id = NULL WHERE signal_number IN ('RVJ S-3','RVJ S-4') AND direction = 'UP' AND section IN ('CSMT-PNVL','VDLR-GMN');
DELETE r FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id WHERE s.section = 'CSMT-PNVL' AND s.line = 'UP HB' AND s.signal_number = 'RVJ S-3';
DELETE FROM div_signals WHERE section = 'CSMT-PNVL' AND line = 'UP HB' AND signal_number = 'RVJ S-3';
COMMIT;
