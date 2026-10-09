'use strict';

/*
 * Registry of the CMS daily-position reports.
 *
 * The HQ drops a day's CMS downloads in one go; the file names say nothing
 * ("CMS  REPORT (2).csv"), so each file is recognised by its HEADER ROW. Adding a
 * report = one module in this folder + one line in REPORTS. A module exports:
 *
 *   key, label, order          identity, and its position on the daily sheet
 *   manual                     optional { fields:[{key,label}], build(values) -> parsed }:
 *                              the report can also be typed in on the page
 *   dateOffset                 days between the sheet date and the data date (0/1/2);
 *                              sign-off-dependent reports lag a day more
 *   matchesHeader(headerRow)   true when the file is this report — must be strict;
 *                              two modules claiming one file is refused, not guessed
 *   parse(buffer)              -> parsed (throws with a readable message)
 *   tables(parsed)             -> [{ title, headers, rows, total|null, emptyText?,
 *                                    note?, alertCols?, groups? }]
 *                              note      = one caption line printed under the title
 *                              alertCols = column indexes where a NON-ZERO count is the
 *                                          thing to look at; shown red in page and exports
 *                              groups    = optional, one entry per column: a heading spanning
 *                                          neighbouring columns with the same label, or null;
 *                                          ungrouped columns fill both header rows.
 *                                          Several levels: [[outer...], [inner...]] —
 *                                          see headLayout.js
 *
 * Page, Excel and PDF all render that one generic table shape, so a new report
 * needs no UI or export code.
 *
 * The due list (lib/cmsReport.js) is deliberately NOT here: it is an interactive
 * per-crew list, not a table on the daily sheet.
 */

const { parse } = require('csv-parse/sync');
const { headLayout } = require('./headLayout');

// Attach the grouped-header layout the page draws from (null when ungrouped).
const withHead = (ts) => ts.map((t) => ({ ...t, head: headLayout(t) }));

const REPORTS = [
  require('./wrwor'),
  require('./wrworhq'),
  require('./fsd'),
  require('./dutyhours'),
  require('./pdd'),
  require('./subhours'),
  require('./climon'),
  require('./contnight'),
  require('./kiosk'),
  require('./safetydue'),
  require('./prdue'),
].sort((a, b) => a.order - b.order);

function headerOf(buffer) {
  const recs = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, to: 1, record_delimiter: ['\r\n', '\n', '\r'] });
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
  if (report.slotOnly) {
    throw new Error(`${report.label}: the 3 / 4 / >4 night files look identical — upload each in its own slot under "${report.label}".`);
  }
  const parsed = report.parse(buffer);
  return {
    key: report.key,
    label: report.label,
    order: report.order,
    dateOffset: report.dateOffset,
    tables: withHead(report.tables(parsed)),
    warnings: parsed.warnings || [],
  };
}

/*
 * Continuous night working: its three parts share one header, so the page posts
 * them by slot. files = { n3?, n4?, n5? } buffers. Same return shape as processFile.
 */
function processNight(files) {
  const report = REPORTS.find((r) => r.key === 'contnight');
  const parsed = report.parseParts(files);
  return {
    key: report.key,
    label: report.label,
    order: report.order,
    dateOffset: report.dateOffset,
    tables: withHead(report.tables(parsed)),
    warnings: parsed.warnings || [],
  };
}

/*
 * A report typed in on the page instead of uploaded. values = { fieldKey: "12", ... }.
 * Same return shape as processFile.
 */
function processManual(key, values) {
  const report = REPORTS.find((r) => r.key === key && r.manual);
  if (!report) throw new Error('This report cannot be filled by hand.');
  const parsed = report.manual.build(values || {});
  return {
    key: report.key,
    label: report.label,
    order: report.order,
    dateOffset: report.dateOffset,
    tables: withHead(report.tables(parsed)),
    warnings: parsed.warnings || [],
  };
}

// What the page lists as expected, so a report nobody uploaded shows as a gap.
function catalogue() {
  return REPORTS.map(({ key, label, order, dateOffset, manual }) =>
    ({ key, label, order, dateOffset, manual: manual ? manual.fields : null }));
}

module.exports = { processFile, processNight, processManual, catalogue };
