-- ============================================================================
-- AWS — reports the crew wrote that we could NOT act on
--
-- Every event still sitting in the review queue, with a plain-English reason so
-- a CLI can tell the motorman exactly what was missing from his entry. Dismissed
-- ("not an AWS event") rows are excluded — only genuine AWS reports we could not
-- complete.
--
-- Set the date range in the WHERE clause. As written it covers June 2026.
-- ============================================================================
SELECT
    r.abn_id                                       AS `CMS ID`,
    DATE_FORMAT(e.abn_date, '%d-%m-%Y')            AS `Date`,
    TIME_FORMAT(e.abn_time, '%H:%i')               AS `Time`,
    r.crew_id                                      AS `Crew ID`,
    r.crew_name                                    AS `Crew Name`,
    r.designation                                  AS `Desig`,
    r.train_number                                 AS `Train`,
    r.loco_raw                                     AS `D/Cab`,
    CONCAT_WS(' - ', r.from_station, r.to_station) AS `Trip`,
    COALESCE(NULLIF(CONCAT_WS('; ',
        IF(e.aws_code IS NULL,
           'Braking type not stated (A/B/C/D/E/AUX)', NULL),
        IF(e.aws_code = 'OTHER',
           'Braking type unclear — not one of A/B/C/D/E/AUX', NULL),
        IF(e.location_raw IS NULL,
           'Signal number / KM not stated', NULL),
        IF(e.location_type = 'SIGNAL' AND e.location_raw IS NOT NULL AND e.signal_id IS NULL,
           CONCAT('Signal "', e.location_raw, '" could not be identified'), NULL),
        IF((SELECT COUNT(*) FROM div_aws_events x WHERE x.raw_id = e.raw_id) > 1,
           'Two or more acts written in one entry', NULL)
    ), ''), 'Entry unclear — could not be read with confidence')  AS `What was missing`,
    e.aws_code                                     AS `Type read`,
    e.location_raw                                 AS `Location read`,
    r.detail                                       AS `Detail as written by crew`
FROM div_aws_events e
JOIN div_aws_cms_raw r ON r.id = e.raw_id
WHERE e.needs_manual_review = 1
  AND e.status <> 'DISMISSED'
  AND e.abn_date BETWEEN '2026-06-01' AND '2026-06-30'     -- <<< change the range here
ORDER BY r.crew_id, e.abn_date, e.abn_time;


-- ============================================================================
-- Crew-wise summary — who is repeatedly filing entries we cannot act on.
-- Same date range. Use this to pick who needs counselling; use the query above
-- for the actual case sheet handed to them.
-- ============================================================================
SELECT
    r.crew_id                                   AS `Crew ID`,
    r.crew_name                                 AS `Crew Name`,
    r.designation                               AS `Desig`,
    SUBSTRING_INDEX(r.abn_id, '/', 1)           AS `Lobby`,
    COUNT(*)                                    AS `Entries we could not act on`,
    SUM(e.aws_code IS NULL)                     AS `No braking type`,
    SUM(e.location_raw IS NULL)                 AS `No signal / KM`,
    SUM(e.location_type = 'SIGNAL' AND e.location_raw IS NOT NULL AND e.signal_id IS NULL)
                                                AS `Signal not identifiable`,
    GROUP_CONCAT(DATE_FORMAT(e.abn_date, '%d-%m') ORDER BY e.abn_date SEPARATOR ', ')
                                                AS `Dates`
FROM div_aws_events e
JOIN div_aws_cms_raw r ON r.id = e.raw_id
WHERE e.needs_manual_review = 1
  AND e.status <> 'DISMISSED'
  AND e.abn_date BETWEEN '2026-06-01' AND '2026-06-30'     -- <<< change the range here
GROUP BY r.crew_id, r.crew_name, r.designation, `Lobby`
ORDER BY `Entries we could not act on` DESC, r.crew_name;
