-- Signals whose placement and side flags (is_rhs/is_ext_rhs/is_lhs/is_ext_lhs) disagree.
--
-- placement and the four flags are two encodings of one fact; the book prints from
-- the flags. From 2026-10-14 the signal-book publish derives both from one side, so
-- the existing mismatches are corrected here first, with the side confirmed by the
-- user (2026-10-14). Matched by signal_number + section + line, not id, so it is
-- safe on both local and prod. Idempotent.
--
-- Rollback: div_signals_side_bak_20261014 holds the previous values.

CREATE TABLE IF NOT EXISTS div_signals_side_bak_20261014 AS
SELECT id, signal_number, section, line, placement, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs
  FROM div_signals
 WHERE (signal_number, section, line) IN (
        ('SMNE DIST', 'PNVL-ROHA', 'DN KR'), ('GATE-22',  'PNVL-ROHA', 'UP KR'),
        ('KYN S-48',  'CSMT-KYN',  'UP TH'), ('DW S-54',  'CSMT-KYN',  'UP TH'),
        ('BVS S-3',   'KYN-KJT',   'DN SE'),
        ('CLA S-47',  'CSMT-KYN',  'UP TH'), ('KDV S-12', 'KYN-KSRA',  'DN NE'));

-- Left
UPDATE div_signals SET placement = 'Left', is_lhs = 1, is_rhs = 0, is_ext_rhs = 0, is_ext_lhs = 0
 WHERE (signal_number, section, line) IN (('SMNE DIST', 'PNVL-ROHA', 'DN KR'), ('GATE-22', 'PNVL-ROHA', 'UP KR'));

-- RHS (were flagged LHS, so the book was not printing the RHS tag)
UPDATE div_signals SET placement = 'Right', is_rhs = 1, is_lhs = 0, is_ext_rhs = 0, is_ext_lhs = 0
 WHERE (signal_number, section, line) IN (('KYN S-48', 'CSMT-KYN', 'UP TH'), ('DW S-54', 'CSMT-KYN', 'UP TH'));

-- Extreme Left (was Gantry + LHS)
UPDATE div_signals SET placement = 'Extreme Left', is_ext_lhs = 1, is_lhs = 0, is_rhs = 0, is_ext_rhs = 0
 WHERE (signal_number, section, line) IN (('BVS S-3', 'KYN-KJT', 'DN SE'));

-- Gantry, no side flag
UPDATE div_signals SET placement = 'Gantry', is_lhs = 0, is_rhs = 0, is_ext_rhs = 0, is_ext_lhs = 0
 WHERE (signal_number, section, line) IN (('CLA S-47', 'CSMT-KYN', 'UP TH'), ('KDV S-12', 'KYN-KSRA', 'DN NE'));

-- Remaining mismatches (expect none, except any edited since — e.g. K-049 on prod,
-- which its next publish corrects).
SELECT id, signal_number, section, line, placement, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs
  FROM div_signals
 WHERE placement = 'Unknown'
    OR is_rhs + is_ext_rhs + is_lhs + is_ext_lhs > 1
    OR (placement = 'Left'          AND NOT (is_lhs = 1     AND is_rhs + is_ext_rhs + is_ext_lhs = 0))
    OR (placement = 'Right'         AND NOT (is_rhs = 1     AND is_lhs + is_ext_rhs + is_ext_lhs = 0))
    OR (placement = 'Extreme Right' AND NOT (is_ext_rhs = 1 AND is_rhs + is_lhs + is_ext_lhs = 0))
    OR (placement = 'Extreme Left'  AND NOT (is_ext_lhs = 1 AND is_rhs + is_ext_rhs + is_lhs = 0))
    OR (placement = 'Gantry'        AND is_rhs + is_ext_rhs + is_lhs + is_ext_lhs > 0);
