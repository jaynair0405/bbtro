-- Full magnet_id backfill for all signals imported this session (magnet_id NULL).
-- Date: 2026-07-31
--
-- magnet_id = physical-magnet identity: rows that are the SAME physical signal (one
-- signal printing in several sections/lines/books) share one magnet_id. AWS counts
-- acts per magnet (JPO Rule 3b, chronic-repeaters); NULL/mismatched copies look like
-- separate magnets. Rendering ignores magnet_id.
--
-- Identity rule: same (station, signal_number, direction) = one magnet.
-- Every step only writes rows where magnet_id IS NULL — existing magnets (the older
-- suburban links + the 2026-07-14 ghat backfill) are never disturbed. A NULL copy
-- ADOPTS an existing twin's magnet when one exists, else the group takes its lowest id.
--
-- STEP 1 — station-coded signals: group by (station_code, number, direction). Covers
--   singletons (group of 1 -> own id), within-section MID/line duplicates, and the
--   cross-section boundary copies (e.g. BPT CLA S-2 adopts CSMT-PNVL's magnet). Safe
--   because two different signals cannot share a number at one station.
UPDATE div_signals t
JOIN (
  SELECT station_code, normalized_signal_number, direction,
         COALESCE(MIN(magnet_id), MIN(id)) AS canon
  FROM div_signals
  WHERE is_active=1 AND station_code IS NOT NULL AND station_code<>''
  GROUP BY station_code, normalized_signal_number, direction
) g
  ON g.station_code=t.station_code
 AND g.normalized_signal_number=t.normalized_signal_number
 AND g.direction=t.direction
SET t.magnet_id=g.canon
WHERE t.is_active=1 AND t.magnet_id IS NULL
  AND t.station_code IS NOT NULL AND t.station_code<>'';

-- STEP 2 — blank-station signals (automatics): group by (number, direction, km_text).
--   Same number+direction+km = the same physical automatic copied into another book
--   (H-41..H-50 -> CSMT-PNVL harbour; ME 48xx/49xx/50xx/51xx -> CLA-KYN 5TH/6TH), so
--   they link. Gates (GATE-*) repeat across sections at DIFFERENT km, so each stays in
--   its own single-row group and keeps its own id -- NOT merged (the GATE-7 trap).
UPDATE div_signals t
JOIN (
  SELECT normalized_signal_number, direction, km_text,
         COALESCE(MIN(magnet_id), MIN(id)) AS canon
  FROM div_signals
  WHERE is_active=1 AND (station_code IS NULL OR station_code='')
    AND km_text IS NOT NULL AND km_text<>''
  GROUP BY normalized_signal_number, direction, km_text
) g
  ON g.normalized_signal_number=t.normalized_signal_number
 AND g.direction=t.direction
 AND g.km_text=t.km_text
SET t.magnet_id=g.canon
WHERE t.is_active=1 AND t.magnet_id IS NULL
  AND (t.station_code IS NULL OR t.station_code='')
  AND t.km_text IS NOT NULL AND t.km_text<>'';

-- STEP 2b — blank-station automatics with BLANK km but a matching location twin
--   (harbour platform starters H-44 'GTBN PF-2', H-48 'CHF PF-2'): link by
--   (number, direction, location_text). Not gated on NULL so it also corrects rows a
--   km-only pass left as singletons; idempotent (re-sets to the group MIN). Gates are
--   excluded (they carry km, so km<>'' -> not in this set).
UPDATE div_signals t
JOIN (
  SELECT normalized_signal_number, direction, location_text, MIN(magnet_id) AS canon
  FROM div_signals
  WHERE is_active=1 AND (station_code IS NULL OR station_code='')
    AND (km_text IS NULL OR km_text='') AND location_text<>''
  GROUP BY normalized_signal_number, direction, location_text
  HAVING COUNT(*)>1
) g
  ON g.normalized_signal_number=t.normalized_signal_number
 AND g.direction=t.direction
 AND g.location_text=t.location_text
SET t.magnet_id=g.canon
WHERE t.is_active=1 AND (t.station_code IS NULL OR t.station_code='')
  AND (t.km_text IS NULL OR t.km_text='') AND t.location_text<>'';

-- STEP 3 — anything still NULL (blank station AND blank km/location, or any leftover) -> own id.
UPDATE div_signals SET magnet_id=id WHERE is_active=1 AND magnet_id IS NULL;
