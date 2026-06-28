-- ============================================================================
-- Vashi PF-starter renumbering (signal-book): S-17 -> S-23, S-19 -> S-21
-- Date : 2026-06-28
-- Note : S-18 -> S-22 was already added directly as S-22, so only S-17 and S-19
--        need renaming. S-19 is renamed in BOTH copies (UP HB / CSMT-PNVL and
--        DN THB / TUH-VSH — same physical signal). Existing self-aliases
--        ("VSH S-17", "VSH S-19") are KEPT so old-number references still match;
--        the new numbers resolve via normalized_signal_number. Successor edge
--        text is relabelled in place so the resolved IDs are preserved.
-- Idempotent: old numbers no longer exist after the run.
-- ============================================================================

-- 1. div_signals — rename signal_number + normalized_signal_number
UPDATE div_signals SET signal_number = 'VSH S-23', normalized_signal_number = 'VSHS23'
 WHERE signal_number = 'VSH S-17' AND station_code = 'VSH';
UPDATE div_signals SET signal_number = 'VSH S-21', normalized_signal_number = 'VSHS21'
 WHERE signal_number = 'VSH S-19' AND station_code = 'VSH';   -- both UP HB and DN THB copies

-- 2. div_signal_successors — relabel edge text (keeps resolved from/to ids)
UPDATE div_signal_successors SET from_signal_text = 'VSH S-23' WHERE from_signal_text = 'VSH S-17';
UPDATE div_signal_successors SET to_signal_text   = 'VSH S-23' WHERE to_signal_text   = 'VSH S-17';
UPDATE div_signal_successors SET from_signal_text = 'VSH S-21' WHERE from_signal_text = 'VSH S-19';
UPDATE div_signal_successors SET to_signal_text   = 'VSH S-21' WHERE to_signal_text   = 'VSH S-19';

-- 3. Recompute seq_order (normalized numbers changed; parallel set keeps km 29.255)
UPDATE div_signals SET seq_order = NULL;
WITH ordered AS (
    SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY section, `line`, direction
            ORDER BY
                CASE WHEN km_from_csmt IS NULL THEN 1 ELSE 0 END,
                CASE WHEN direction = 'DN' THEN km_from_csmt ELSE -km_from_csmt END,
                normalized_signal_number
        ) AS rn
    FROM div_signals
    WHERE direction IN ('UP','DN')
)
UPDATE div_signals s JOIN ordered o ON o.id = s.id SET s.seq_order = o.rn;
