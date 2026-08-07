-- ============================================================================
-- Make IBS signals uniform on signal_type
-- 2026-08-07
--
-- IBS is a signal_function (role), and signal_function='IBS' is already set on
-- all 60 IBS signals. But signal_type (working class) is inconsistent:
--   * 52 IBS rows (UP copies + other sections) have signal_type='IBS'
--   * 8 KYN-KSRA DN IBS rows have signal_type='Manual'
-- so the same class is stored two different ways. This aligns the 8 outliers
-- with the 52-row convention: every IBS reads type=IBS AND function=IBS.
--
-- The 8 affected rows (all KYN-KSRA DN):
--   TLA S-9, KDV S-14, VSD S-12, ASO S-14, ATG S-14, THS S-5, KE S-14, OMB S-5
--
-- Note: this is cosmetic/consistency only. The AWS station-less-IBS alias guard
-- already detects IBS by (signal_type='IBS' OR signal_function='IBS'), so it is
-- correct with or without this change. Run on LOCAL and PROD.
-- ============================================================================

-- before
SELECT 'before' AS phase, signal_type, COUNT(*) n
  FROM div_signals
 WHERE is_active=1 AND signal_function='IBS'
 GROUP BY signal_type;

UPDATE div_signals
   SET signal_type = 'IBS'
 WHERE is_active = 1
   AND signal_function = 'IBS'
   AND signal_type <> 'IBS';

-- after (expect a single row: IBS = 60)
SELECT 'after' AS phase, signal_type, COUNT(*) n
  FROM div_signals
 WHERE is_active=1 AND signal_function='IBS'
 GROUP BY signal_type;
