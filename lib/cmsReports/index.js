'use strict';

/*
 * Registry of the CMS daily-position reports.
 *
 * The HQ drops a day's CMS downloads in one go; the file names say nothing
 * ("CMS  REPORT (2).csv"), so each file is recognised by its HEADER ROW. Adding a
 * report = one module in this folder + one line in REPORTS. A module exports:
 *
 *   key, label, order          identity, and its position on the daily sheet
 *   matchesHeader(headerRow)   true when the file is this report — must be strict;
 *                              two modules claiming one file is refused, not guessed
 *   parse(buffer)              -> parsed (throws with a readable message)
 *   tables(parsed)             -> [{ title, headers, rows, total|null, emptyText? }]
 *
 * Page, Excel and PDF all render that one generic table shape, so a new report
 * needs no UI or export code.
 *
 * The due list (lib/cmsReport.js) is deliberately NOT here: it is an interactive
 * per-crew list, not a table on the daily sheet.
 */

const { parse } = require('csv-parse/sync');

const REPORTS = [
  require('./wrwor'),
].sort((a, b) => a.order - b.order);

function headerOf(buffer) {
  const recs = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, to: 1 });
  return recs[0] || [];
}

/*
 * Recognise and process one uploaded file.
 * Returns { key, label, order, tables, warnings } or throws.
 */
function processFile(buffer) {
  // An image or .xlsx dropped by mistake: say so rather than echoing binary back.
  if (/[\x00-\x08\x0e-\x1f]/.test(buffer.subarray(0, 512).toString('latin1'))) {
    throw new Error('Not a CSV file. Download the report from CMS as CSV.');
  }
  const header = headerOf(buffer);
  if (header.length === 0) throw new Error('The file is empty.');

  const hits = REPORTS.filter((r) => r.matchesHeader(header));
  if (hits.length === 0) {
    throw new Error(
      `Not a report this page knows (${header.length} columns, starting ` +
      `"${header.slice(0, 4).join(', ')}"). Either it has not been added yet or CMS changed its layout.`
    );
  }
  if (hits.length > 1) {
    throw new Error(`Header matches more than one report (${hits.map((h) => h.label).join(', ')}) — cannot tell them apart.`);
  }

  const report = hits[0];
  const parsed = report.parse(buffer);
  return {
    key: report.key,
    label: report.label,
    order: report.order,
    tables: report.tables(parsed),
    warnings: parsed.warnings || [],
  };
}

// What the page lists as expected, so a report nobody uploaded shows as a gap.
function catalogue() {
  return REPORTS.map(({ key, label, order }) => ({ key, label, order }));
}

module.exports = { processFile, catalogue };
