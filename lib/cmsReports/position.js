'use strict';

/*
 * "Position (one view)" — the daily CMS position as the officers receive it: two A4
 * portrait pages, blocks in left/right pairs, laid out as the hand-made sheet
 * (data/cms-report/CMS POSITION 10102026.pdf, user 2026-10-10).
 *
 * PAGES lists, per page, its rows; a row is [left] , [left, right] or { full }.
 * A side is one or more report keys stacked top to bottom. Each block prints that
 * report's sheet tables (the first, plus any marked `sheet`). A report not loaded
 * still gets its block, saying so — a gap must show, never vanish.
 *
 * The DR / LTT without-biometric table stays a separate table inside the Sign On -
 * Sign Off Biometric block — never merged into the suburban one (user, 2026-10-10).
 */

const PAGES = [
  [
    // WR WOR HQ Wise sits under Lobby Wise (user, 2026-10-10).
    [['wrwor', 'wrworhq'], ['kiosk', 'fsd']],
    [['dutyhours'], ['subhours', 'contnight']],
    [['pdd'], ['bor', 'climon']],
    { full: ['subsonoff'] },
  ],
  [
    [['safetydue'], ['changeapproval']],
    { full: ['prdue'] },
    [['signonoff']],
  ],
];

// "2026-10-09" -> "09/10/2026", as the sheet prints block dates.
function slashDate(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

// Change on Approval: the report keeps Sign On and Sign Off as two tables (each with
// its own drill-down); the one view prints ONE table, a column each (user, 2026-10-10).
function mergeApproval(tables) {
  const [on, off] = tables;
  if (!off) return on;
  const kind = (t) => t.title.split('—').pop().trim();
  return {
    title: '',
    headers: ['Sr No.', 'Lobby', kind(on), kind(off)],
    rows: on.rows.map((r, i) => [...r, off.rows[i] ? off.rows[i][2] : '']),
    total: Array.isArray(on.total) ? [...on.total, off.total ? off.total[2] : ''] : null,
    alertCols: [2, 3],
  };
}

/*
 * catalogue: cmsReports.catalogue(), for the label of a report not loaded.
 * reports: the posted reports [{ key, label, dataDate, tables }] (sheet tables only,
 * or all — only sheet tables are used).
 * Returns pages: [ [ row ] ], row = { full: block } | { left: [block], right: [block] },
 * block = { key, heading, tables, missing }.
 */
function layout(reports, catalogue = []) {
  const byKey = new Map(reports.map((r) => [r.key, r]));
  const sheetTables = (r) => r.tables.filter((t, i) => i === 0 || t.sheet);

  const block = (key) => {
    const r = byKey.get(key);
    if (!r) return { key, heading: labelFor(catalogue, key).toUpperCase(), tables: [], missing: true };
    let tables = sheetTables(r);
    if (key === 'changeapproval') tables = [mergeApproval(tables)];
    // The block heading carries the name; a table titled the same need not repeat it.
    tables = tables.map((t) => (t.title === r.label ? { ...t, title: '' } : t));
    return { key, heading: `${r.label.toUpperCase()} (${slashDate(r.dataDate)})`, tables, missing: false };
  };

  return PAGES.map((rows) => rows.map((row) => (Array.isArray(row)
    ? { left: row[0].map(block), right: (row[1] || []).map(block) }
    : { full: block(row.full[0]) })));
}

// Report labels for a block of a report that was not loaded (the page knows them).
function labelFor(catalogue, key) {
  const c = catalogue.find((x) => x.key === key);
  return c ? c.label : key;
}

module.exports = { PAGES, layout, slashDate };
