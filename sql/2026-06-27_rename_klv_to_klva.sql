-- ============================================================================
-- Rename Kalwa signals  KLV S-x  ->  KLVA S-x
-- Date : 2026-06-27
-- Why  : Kalwa signals were numbered "KLV S-x" while station_code is already
--        KLVA and the signal book / CMS abnormality logs use "KLVA". The KLV
--        prefix blocked AWS matching ("KLVA S 10" normalises to KLVAS10, the
--        signal to KLVS10). Align signal_number (and the matching self-aliases)
--        to KLVA. The matcher's KALVA->KLVA synonym still covers the typo form.
-- Idempotent: once renamed, the LIKE 'KLV %' guards no longer match.
-- ============================================================================

-- 1. div_signals: signal_number + normalized_signal_number
UPDATE div_signals
SET signal_number            = REPLACE(signal_number, 'KLV ', 'KLVA '),
    normalized_signal_number = CONCAT('KLVA', SUBSTRING(normalized_signal_number, 4))
WHERE station_code = 'KLVA' AND signal_number LIKE 'KLV %';

-- 2. div_signal_aliases: the self-aliases that mirror those signal numbers
UPDATE div_signal_aliases a
JOIN div_signals s ON s.id = a.signal_id
SET a.alias_text       = REPLACE(a.alias_text, 'KLV ', 'KLVA '),
    a.normalized_alias = CONCAT('KLVA', SUBSTRING(a.normalized_alias, 4))
WHERE s.station_code = 'KLVA' AND a.alias_text LIKE 'KLV %';

-- Verify
SELECT signal_number, normalized_signal_number, `line`, section
FROM div_signals WHERE station_code = 'KLVA' ORDER BY signal_number;
