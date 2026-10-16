'use strict';

/*
 * Registry of the LOBBY lists — the per-crew CMS downloads a lobby uploads to explain a
 * count on the Daily Position (lib/cmsReports/index.js holds HQ's reports; the two
 * registries never share a file, so a lobby list dropped on the HQ page is refused and
 * vice versa). Adding a list = one module in lobby/ + one line here.
 *
 * A module exports:
 *   key, label, drills, dateOffset, measure   identity; drills = the HQ report key it
 *                                             explains; dateOffset copied from that report
 *   headers                                   display headers for the item rows
 *   matchesHeader(headerRow)  strict, as for HQ reports
 *   parse(buffer) -> parsed
 *   items(parsed) -> [{ lobby, cmsId, name, desig, measure, itemKey, eventTime, cols }]
 *   checkDate(parsed, { dataDate, sheetDate }) -> null | { error } | { unchecked }
 *   merge(a, b)               optional (WR/WOR: several lists make one)
 */
const { parse } = require('csv-parse/sync');

const LISTS = [
  require('./lobby/fsdn'),
  require('./lobby/wrworlist'),
];

function headerOf(buffer) {
  const recs = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, to: 1, record_delimiter: ['\r\n', '\n', '\r'] });
  return recs[0] || [];
}

const byKey = (key) => LISTS.find((l) => l.key === key) || null;

function processLobbyFile(buffer) {
  if (/[\x00-\x08\x0e-\x1f]/.test(buffer.subarray(0, 512).toString('latin1'))) {
    throw new Error('Not a CSV file. Download the list from CMS as CSV.');
  }
  const header = headerOf(buffer);
  if (header.length === 0) throw new Error('The file is empty.');
  const hits = LISTS.filter((l) => l.matchesHeader(header));
  if (hits.length === 0) {
    throw new Error(`Not a lobby list this page knows (${header.length} columns, starting "${header.slice(0, 4).join(', ')}"). ` +
      'Download the crew list behind the count, not the count report itself.');
  }
  if (hits.length > 1) throw new Error(`Header matches more than one list (${hits.map((h) => h.label).join(', ')}).`);
  const l = hits[0];
  return { key: l.key, drills: l.drills, label: l.label, dateOffset: l.dateOffset, measure: l.measure, parsed: l.parse(buffer) };
}

const catalogue = () => LISTS.map(({ key, label, drills, dateOffset, measure, headers }) => ({ key, label, drills, dateOffset, measure, headers }));

module.exports = { LISTS, processLobbyFile, byKey, catalogue, headerOf };
