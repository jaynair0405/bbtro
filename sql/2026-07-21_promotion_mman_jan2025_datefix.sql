-- =====================================================================
-- 2026-07-21  Correct promotion-to-Motorman date for Jan-2025 batch
-- Source: data/promotion-dates/promotion _date_mman_change.csv (71 staff)
-- These were recorded with a wrong Feb-2025 date; actual date = 2025-01-31.
-- Backup + UPDATE only (no inserts). Idempotent; 2nd run halts at backup.
-- REVERSE: restore posting_date from div_promotion_history_bak_20260721_janfix.
-- =====================================================================

CREATE TEMPORARY TABLE _fix (hrms_id VARCHAR(10));
INSERT INTO _fix (hrms_id) VALUES
  ('CDGRZH'),
  ('WKUPFC'),
  ('ZNUMKN'),
  ('ZWKIUX'),
  ('MKXLWS'),
  ('HJLQLF'),
  ('TLSZZC'),
  ('HYEEAI'),
  ('GBMRTJ'),
  ('XPSXWM'),
  ('LFGGAL'),
  ('BYXJBL'),
  ('MFWRXZ'),
  ('FPKBOA'),
  ('GXPBTE'),
  ('FPMKAA'),
  ('MONRXE'),
  ('FTPLDK'),
  ('LLOTUT'),
  ('OBBDYN'),
  ('HAWWTQ'),
  ('HXQNDY'),
  ('GOLXEX'),
  ('IHCDJJ'),
  ('QQPTRO'),
  ('EQDJRB'),
  ('YRTDFI'),
  ('ORRGNY'),
  ('WSXJKJ'),
  ('GMMGMT'),
  ('WGYDPJ'),
  ('XZWXRR'),
  ('PUZQBD'),
  ('YCTRCF'),
  ('WMPQZL'),
  ('RHDROH'),
  ('OLCCFR'),
  ('AUPTLR'),
  ('NRWEAP'),
  ('GMXRWZ'),
  ('OGUFOR'),
  ('PCWQTX'),
  ('RPTJLN'),
  ('CZFMAJ'),
  ('OOPQGU'),
  ('KCRQSM'),
  ('YKAKDN'),
  ('HBPRLC'),
  ('SRARPA'),
  ('TCQWTQ'),
  ('APCRBD'),
  ('MDJCNC'),
  ('KNFYAJ'),
  ('WRFOCH'),
  ('AIDRPZ'),
  ('BHOTXI'),
  ('TROYHZ'),
  ('BEQABR'),
  ('PBDJWL'),
  ('GJOZCS'),
  ('LHSBFY'),
  ('HQAJNS'),
  ('SCUQJA'),
  ('FFPBNH'),
  ('UGJPBB'),
  ('WCAHSQ'),
  ('BHXZCO'),
  ('TOYRJZ'),
  ('JHOAWZ'),
  ('XLAJWN'),
  ('HKTRFS');

-- Backup affected to-Motorman rows before change
CREATE TABLE div_promotion_history_bak_20260721_janfix AS
SELECT p.*
FROM div_promotion_history p
JOIN _fix f ON f.hrms_id = p.staff_hrms_id
WHERE p.to_designation_id = 8;

-- Correct the date to the actual 2025-01-31
UPDATE div_promotion_history p
JOIN _fix f ON f.hrms_id = p.staff_hrms_id
SET p.posting_date = '2025-01-31'
WHERE p.to_designation_id = 8
  AND p.posting_date <> '2025-01-31';

DROP TEMPORARY TABLE _fix;
