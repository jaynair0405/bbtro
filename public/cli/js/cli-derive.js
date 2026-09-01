/* ============================================================================
 * cli-derive.js -- pure derivation shared by the SERVER and the BROWSER.
 *
 * UMD-wrapped so routes/division/counsellingRoutes.js can require() the very
 * same file the PWA <script>-loads. That is the whole point: the consolidated
 * sheet is computed on the server for the XLSX/print path and in the browser
 * for the live view, and if the two ever disagreed the officers would be shown
 * one set of totals and the CLI another. (This repo has been bitten before --
 * scripts/extract_train_index.js drifted from the page that rendered it.)
 *
 * Pure functions only. No fetch, no DOM, no db.
 * ==========================================================================*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CliDerive = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* The columns of the officers' sheet, in the order they are printed.
   * They map onto `designations.id`. The sheet has no Sr. columns, so Sr.ALP
   * folds into ALP and Sr.LPS into LPS -- seniority is a pay grade, not a
   * different job for counselling purposes. */
  var DESIGNATION_COLUMNS = [
    { key: 'LPM',     label: 'LPM',     ids: [7] },
    { key: 'LPP',     label: 'LPP',     ids: [6] },
    { key: 'LP_GHAT', label: 'LP GHAT', ids: [9] },
    { key: 'MOTORMAN',label: 'M/Man',   ids: [8] },
    { key: 'LPG',     label: 'LPG',     ids: [5] },
    { key: 'LPS',     label: 'LPS',     ids: [3, 4] },
    { key: 'ALP',     label: 'ALP',     ids: [1, 2] }
  ];

  /* Every designation_id that counts as running staff, i.e. someone who can be
   * SPAD-counselled. Anything outside this is a CLI, controller, instructor. */
  var RUNNING_DESIGNATION_IDS = DESIGNATION_COLUMNS.reduce(function (acc, c) {
    return acc.concat(c.ids);
  }, []);

  var DESIGNATION_TO_COLUMN = (function () {
    var m = {};
    DESIGNATION_COLUMNS.forEach(function (c) {
      c.ids.forEach(function (id) { m[id] = c.key; });
    });
    return m;
  }());

  /* The sheet has one row per STATION, not per office. CLA is gone -- the lobby
   * has ceased to exist -- so it is absent here on purpose. */
  var DEPOT_ORDER = ['CSMT', 'KYN', 'PNVL', 'IGP', 'LNL', 'NRL'];

  /* `offices` has no bare CSMT/KYN/PNVL row; the depot label is the office code
   * with its -ML / -SUB suffix stripped. This is also why the ML/SUB split needs
   * no user input: a MOTORMAN's office is already CSMT-SUB, everyone else's is
   * CSMT-ML, and both roll up to CSMT. */
  function depotOf(officeCode) {
    if (!officeCode) return null;
    return String(officeCode).replace(/-(ML|SUB)$/i, '').toUpperCase();
  }

  function columnOf(designationId) {
    return DESIGNATION_TO_COLUMN[Number(designationId)] || null;
  }

  function emptyCounts() {
    var o = {};
    DESIGNATION_COLUMNS.forEach(function (c) { o[c.key] = 0; });
    return o;
  }

  /* Build the depot x designation matrix.
   *
   * rows: [{ office_code, designation_id, n }] -- pre-aggregated by the server,
   * or one row per attendee with n omitted (defaults to 1) from the browser.
   *
   * An attendee whose depot is not in DEPOT_ORDER lands in an explicit `other`
   * row and raises a warning rather than being dropped. Silently vanishing
   * counts are how a consolidated sheet quietly stops adding up. */
  function buildSheet(rows) {
    var byDepot = {};
    var warnings = [];
    var other = { depot: 'OTHER', counts: emptyCounts(), total: 0, offices: [] };

    DEPOT_ORDER.forEach(function (d) {
      byDepot[d] = { depot: d, counts: emptyCounts(), total: 0 };
    });

    (rows || []).forEach(function (r) {
      var n = r.n == null ? 1 : Number(r.n);
      if (!n) return;
      var col = columnOf(r.designation_id);
      if (!col) {
        warnings.push('Designation ' + r.designation_id + ' is not a running designation and is not on the sheet.');
        return;
      }
      var depot = depotOf(r.office_code);
      var target = byDepot[depot];
      if (!target) {
        target = other;
        if (other.offices.indexOf(r.office_code) === -1) other.offices.push(r.office_code);
      }
      target.counts[col] += n;
      target.total += n;
    });

    var depotRows = DEPOT_ORDER.map(function (d) { return byDepot[d]; });
    if (other.total > 0) {
      warnings.push(
        other.total + ' counselled staff belong to ' + other.offices.join(', ') +
        ', which is not a sheet depot. They are shown in the OTHER row.'
      );
      depotRows = depotRows.concat([other]);
    }

    var colTotals = emptyCounts();
    var grandTotal = 0;
    depotRows.forEach(function (row) {
      DESIGNATION_COLUMNS.forEach(function (c) { colTotals[c.key] += row.counts[c.key]; });
      grandTotal += row.total;
    });

    return { columns: DESIGNATION_COLUMNS, rows: depotRows, colTotals: colTotals, grandTotal: grandTotal, warnings: warnings };
  }

  /* --- coverage -------------------------------------------------------- */

  function toDate(v) {
    if (!v) return null;
    if (v instanceof Date) return v;
    var s = String(v).slice(0, 10);
    var p = s.split('-');
    if (p.length !== 3) return null;
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
  }

  function daysBetween(from, to) {
    var a = toDate(from), b = toDate(to);
    if (!a || !b) return null;
    return Math.round((b - a) / 86400000);
  }

  /* Never counselled counts as pending. A topic with no cycle_days is recorded
   * but never chased, so nothing is pending. */
  function isPending(lastDate, cycleDays, today) {
    if (!cycleDays) return false;
    if (!lastDate) return true;
    var d = daysBetween(lastDate, today);
    return d == null ? true : d > cycleDays;
  }

  return {
    DESIGNATION_COLUMNS: DESIGNATION_COLUMNS,
    RUNNING_DESIGNATION_IDS: RUNNING_DESIGNATION_IDS,
    DEPOT_ORDER: DEPOT_ORDER,
    depotOf: depotOf,
    columnOf: columnOf,
    emptyCounts: emptyCounts,
    buildSheet: buildSheet,
    daysBetween: daysBetween,
    isPending: isPending
  };
}));
