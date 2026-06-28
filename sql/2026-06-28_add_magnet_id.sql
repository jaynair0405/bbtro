-- ============================================================================
-- Add div_signals.magnet_id — physical-magnet identity for AWS counting
-- Date : 2026-06-28
-- Why  : A signal at a junction/diversion is stored as several rows (one per
--        section/line) because the SIGNAL BOOK shows it in each route's book
--        (e.g. KYN S-56 in DN TH / DN NE / DN SE; RVJ S-7 in CSMT-PNVL +
--        VDLR-GMN). AWS counts S&T per signal_id, so one physical magnet's
--        events scatter across its rows and a real defect can miss the Rule-2
--        (>2/day) / Rule-3b (>=3/week) threshold. magnet_id ties the rows of one
--        physical magnet together; AWS rules group by magnet_id, the signal book
--        is untouched (keeps its per-section rows + order).
-- Rule : one signal_number is unique per station -> magnet = (station_code,
--        signal_number). EXCEPT distants (there can be one per direction) ->
--        magnet = (station_code, signal_number, direction). Automatics (L/K/ME)
--        and signals without a station stay on their own (magnet_id = id).
-- Idempotent.
-- ============================================================================

DROP PROCEDURE IF EXISTS _bbtro_add_magnet_id;
DELIMITER $$
CREATE PROCEDURE _bbtro_add_magnet_id()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_signals' AND COLUMN_NAME = 'magnet_id'
    ) THEN
        ALTER TABLE div_signals
            ADD COLUMN magnet_id INT NULL COMMENT 'Canonical id of the physical magnet (shared by per-section copies); for AWS counting',
            ADD KEY idx_magnet_id (magnet_id);
    END IF;
END$$
DELIMITER ;
CALL _bbtro_add_magnet_id();
DROP PROCEDURE _bbtro_add_magnet_id;

-- 1. Default: every signal is its own magnet.
UPDATE div_signals SET magnet_id = id;

-- 2. Non-distant station signals: canonical = min id per (station_code, signal_number).
UPDATE div_signals s
JOIN (
    SELECT station_code, signal_number, MIN(id) AS canon
    FROM div_signals
    WHERE station_code <> '' AND signal_number NOT LIKE '%DIST%' AND signal_type <> 'Automatic'
    GROUP BY station_code, signal_number
) g ON g.station_code = s.station_code AND g.signal_number = s.signal_number
SET s.magnet_id = g.canon
WHERE s.station_code <> '' AND s.signal_number NOT LIKE '%DIST%' AND s.signal_type <> 'Automatic';

-- 3. Distant signals: canonical = min id per (station_code, signal_number, direction).
UPDATE div_signals s
JOIN (
    SELECT station_code, signal_number, direction, MIN(id) AS canon
    FROM div_signals
    WHERE station_code <> '' AND signal_number LIKE '%DIST%'
    GROUP BY station_code, signal_number, direction
) g ON g.station_code = s.station_code AND g.signal_number = s.signal_number AND g.direction <=> s.direction
SET s.magnet_id = g.canon
WHERE s.station_code <> '' AND s.signal_number LIKE '%DIST%';

-- Verify: groups that now share a magnet_id
SELECT magnet_id, COUNT(*) copies, GROUP_CONCAT(DISTINCT signal_number) sigs
FROM div_signals GROUP BY magnet_id HAVING COUNT(*) > 1 ORDER BY copies DESC;
