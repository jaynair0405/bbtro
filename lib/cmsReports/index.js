'use strict';

/*
 * Registry of the CMS daily-position reports.
 *
 * The HQ drops a day's CMS downloads in one go; the file names say nothing
 * ("CMS  REPORT (2).csv"), so each file is recognised by its HEADER ROW. Adding a
 * report = one module in this folder + one line in REPORTS. A module exports:
 *
 *   key, label, order          identity, and its position on the daily sheet
 *   manual                     optional { fields:[{key,label}], grid?, build(values) -> parsed }:
 *                              the report can also be typed in on the page. grid =
 *                              { rows:[{key,label}], cols:[{key,label}] } lays the inputs out
 *                              as the sheet table; field key is "<col>|<row>"
 *   dateOffset                 days between the sheet date and the data date (0/1/2);
 *                              sign-off-dependent reports lag a day more
 *   matchesHeader(headerRow)   true when the file is this report — must be strict;
 *                              two modules claiming one file is refused, not guessed
 *   parse(buffer)              -> parsed (throws with a readable message)
 *   merge(a, b)                optional -> parsed: several files make one report (PDD:
 *                              summary + per-lobby crew lists); the route joins every file
 *                              of the upload with the day's stored files instead of
 *                              refusing a second file / replacing the saved load
 *   checkDate(parsed, { sheetDate, dataDate })
 *                              optional: does this file fit the sheet? -> null (fine),
 *                              { error } (file refused) or { unchecked: "why" } (warned)
 *   atSheet(parsed, sheetDate) optional: give a merged report what it needs from the
 *                              sheet date before tables() (PME/REFT/ASIG: its 4 months)
 *   slotOnly, PARTS, parseParts(files, ctx)
 *                              look-alike parts posted by slot (see processSlots)
 *   dropSlot(buffer, { dataDate })
 *                              optional, slot reports: which slot a file dropped with the
 *                              others belongs in, or throws "use its box"
 *   split(parsed)              optional -> [{ key, parsed }]: one file holding several
 *                              reports (Working Hours: mainline + suburban lobbies);
 *                              each key's own tables()/facts() then build it
 *   tables(parsed)             -> [{ title, headers, rows, total|null, emptyText?,
 *                                    note?, alertCols?, groups? }]
 *                              note      = one caption line printed under the title
 *                              alertCols = column indexes where a NON-ZERO count is the
 *                                          thing to look at; shown red in page and exports
 *                              drill     = optional [{ r, c, title, headers, rows }]: the
 *                                          count at row r ("T" = total row), column c is
 *                                          clickable on the page and lists these rows.
 *                                          Page only — exports print the counts.
 *                                          sortCols = drill columns sortable by header click
 *                                          crewCol  = column holding the CMS crew id; the
 *                                          route then adds Desig. from the staff master
 *                              noteOnSheet = true: the note shows on the one view (page,
 *                                          position PDF/Excel) too — normally notes are
 *                                          left off there to save space
 *                              sheet     = true: also printed in a sheet-only export
 *                                          (the first table always is)
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
  require('./changeapproval'),
  require('./kiosk'),
  require('./safetydue'),
  require('./prdue'),
  require('./signonoff'),
  require('./subsonoff'),
  require('./bor'),
].sort((a, b) => a.order - b.order);

function headerOf(buffer) {
  const recs = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, to: 1, record_delimiter: ['\r\n', '\n', '\r'] });
  return recs[0] || [];
}

/*
 * What a report stores (counts + crew, see store.js), from its module's facts(parsed).
 * Non-enumerable, so it is never sent to the page with the report — only saved.
 * null for a module that has no facts() yet.
 */
function withFacts(out, report, parsed) {
  Object.defineProperty(out, 'facts', { value: report.facts ? report.facts(parsed) : null, enumerable: false });
  // Kept for merge() — never sent to the page.
  Object.defineProperty(out, 'parsed', { value: parsed, enumerable: false });
  return out;
}

const build = (r, p) => withFacts({
  key: r.key,
  label: r.label,
  order: r.order,
  dateOffset: r.dateOffset,
  tables: withHead(r.tables(p)),
  warnings: p.warnings || [],
}, r, p);

// A report whose files join into one (merge above)?
const canMerge = (key) => !!(REPORTS.find((r) => r.key === key) || {}).merge;

/*
 * Join parsed files of one mergeable report, in order (later wins where they clash),
 * and build it for the sheet date. Same return shape as one processFile entry.
 */
function mergeReport(key, parsedList, sheetDate) {
  const r = REPORTS.find((x) => x.key === key);
  const parsed = parsedList.reduce((a, b) => r.merge(a, b));
  if (sheetDate && r.atSheet) r.atSheet(parsed, sheetDate);
  return build(r, parsed);
}

// A file's own date against the sheet (checkDate above); null when the report has none.
function checkFile(key, parsed, sheetDate) {
  const r = REPORTS.find((x) => x.key === key);
  if (!r.checkDate || !parsed) return null;
  const off = r.dateOffset || 0;
  const d = new Date(`${sheetDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - off);
  return r.checkDate(parsed, { sheetDate, dataDate: d.toISOString().slice(0, 10), dateOffset: off });
}

// Re-read a stored file of a mergeable report (the day's earlier upload) -> parsed.
function parseStored(key, buffer) {
  return REPORTS.find((x) => x.key === key).parse(buffer);
}

/*
 * Recognise and process one uploaded file.
 * Returns a LIST of { key, label, order, dateOffset, tables, warnings } — usually one,
 * more when the module splits the file (see split above) — or throws.
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
    throw new Error(`${report.label}: its files look alike — upload each in its own tab under "${report.label}".`);
  }
  const parsed = report.parse(buffer);
  const parts = report.split ? report.split(parsed) : [{ key: report.key, parsed }];
  return parts.map(({ key, parsed: p }) => build(REPORTS.find((x) => x.key === key), p));
}

/*
 * A slotOnly report (continuous night working, suburban sign on/off without
 * biometric): its parts look alike, so the page posts them by slot.
 * files = { <slot>: buffer } for that report's PARTS; ctx = { dataDate } for date checks.
 * Same return shape as processFile.
 */
function processSlots(key, files, ctx) {
  const report = REPORTS.find((r) => r.key === key && r.slotOnly);
  if (!report) throw new Error('This report is not uploaded by slot.');
  const parsed = report.parseParts(files, ctx);
  return withFacts({
    key: report.key,
    label: report.label,
    order: report.order,
    dateOffset: report.dateOffset,
    tables: withHead(report.tables(parsed)),
    warnings: parsed.warnings || [],
  }, report, parsed);
}

/*
 * A slot report's file dropped with the other reports (BOR: the summary, or a list whose
 * sign-ons are all yesterday): -> { key, slot } when a module's dropSlot places it,
 * null when no such module claims the header; throws when it is claimed but cannot be
 * placed (a list that needs its box).
 */
function dropSlot(buffer, sheetDate) {
  const header = headerOf(buffer);
  const r = REPORTS.find((x) => x.dropSlot && x.matchesHeader(header));
  if (!r) return null;
  const d = new Date(`${sheetDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - (r.dateOffset || 0));
  return { key: r.key, slot: r.dropSlot(buffer, { dataDate: d.toISOString().slice(0, 10) }) };
}

/*
 * A report typed in on the page instead of uploaded. values = { fieldKey: "12", ... }.
 * Same return shape as processFile.
 */
function processManual(key, values) {
  const report = REPORTS.find((r) => r.key === key && r.manual);
  if (!report) throw new Error('This report cannot be filled by hand.');
  const parsed = report.manual.build(values || {});
  return withFacts({
    key: report.key,
    label: report.label,
    order: report.order,
    dateOffset: report.dateOffset,
    tables: withHead(report.tables(parsed)),
    warnings: parsed.warnings || [],
  }, report, parsed);
}

// What the page lists as expected, so a report nobody uploaded shows as a gap.
// A slot report's handPart (one part typed in) is listed too, as its own Fill-by-hand
// entry: slotOf = the report it is saved into, field = the form field it posts as.
function catalogue() {
  const list = REPORTS.map(({ key, label, order, dateOffset, manual }) =>
    ({ key, label, order, dateOffset, manual: manual ? manual.fields : null, grid: manual ? manual.grid || null : null }));
  REPORTS.filter((r) => r.handPart).forEach((r) => {
    const h = r.handPart;
    list.push({ key: h.key, label: h.label, order: r.order, dateOffset: r.dateOffset, slotOf: r.key, field: h.field,
      manual: h.grid.rows.flatMap((row) => h.grid.cols.map((c) => ({ key: `${c.key}|${row.key}`, label: `${row.label} ${c.label}` }))),
      grid: h.grid });
  });
  return list;
}

const processNight = (files) => processSlots('contnight', files);

module.exports = { processFile, canMerge, mergeReport, parseStored, checkFile, dropSlot, processNight, processSlots, processManual, catalogue };
