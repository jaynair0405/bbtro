'use strict';

/*
 * CMS Report processing core.
 *
 * Single source of truth for:
 *  - column positions in the CMS export (kept here so a format change is a one-line edit)
 *  - dd-mm-yyyy parsing
 *  - "overdue" computation against today in IST (due date <= today)
 *
 * The CMS export has 24 columns. The three due-date parameters are:
 *   K (idx 10) = Grading
 *   O (idx 14) = Counselling
 *   T (idx 19) = Foot Plate Monitoring of Nominated Staff
 * Column J (idx 9) = CURRENT GRADE = safety category (A/B/C).
 */

const { parse } = require('csv-parse/sync');

// ---- Column map (0-based indices into a CMS export row) ----
const COL = {
  sNo: 0,
  cliId: 1,
  cliName: 2,
  crewId: 3,
  name: 4,
  desig: 5,
  currentGrade: 9, // J - safety category A/B/C
  grading:    { done: 8,  due: 10 }, // K
  counselling:{ done: 13, due: 14 }, // O
  footplate:  { done: 18, due: 19 }, // T
};

// Parameter metadata, used by UI + exports
const PARAMETERS = {
  footplate:   { key: 'footplate',   label: 'Foot Plate Monitoring', dueCol: 'T' },
  grading:     { key: 'grading',     label: 'Grading',               dueCol: 'K' },
  counselling: { key: 'counselling', label: 'Counselling',           dueCol: 'O' },
};

const EXPECTED_COLUMNS = 24;

// ---- Date helpers ----

// "today" as a YYYY-MM-DD string in IST (Asia/Kolkata, UTC+5:30), date-only.
function istTodayISO() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // shift to IST wall-clock
  return ist.toISOString().slice(0, 10);
}

// Parse "dd-mm-yyyy" -> "yyyy-mm-dd" (sortable/comparable). Returns null if blank/invalid.
function ddmmyyyyToISO(value) {
  if (!value) return null;
  const v = String(value).trim();
  const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = Number(dd), mo = Number(mm);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${yyyy}-${mm}-${dd}`;
}

// ---- Main parse ----

/*
 * Parse a CSV buffer/string into structured rows.
 * Returns { generatedAtIST, rows: [...], warnings: [...] }
 * Each row: { id, cliId, cliName, crewId, name, desig, grade,
 *             params: { footplate:{done,due,dueISO,overdue}, grading:{...}, counselling:{...} } }
 */
function parseCmsReport(input) {
  const records = parse(input, {
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  if (records.length === 0) {
    throw new Error('The file is empty.');
  }

  const header = records[0];
  const warnings = [];
  if (header.length < EXPECTED_COLUMNS) {
    warnings.push(
      `Expected ${EXPECTED_COLUMNS} columns but the header has ${header.length}. ` +
      `Column positions may be off — verify this is a standard CMS export.`
    );
  }

  const today = istTodayISO();

  const buildParam = (row, def) => {
    const doneRaw = (row[def.done] || '').trim();
    const dueRaw = (row[def.due] || '').trim();
    const dueISO = ddmmyyyyToISO(dueRaw);
    return {
      done: doneRaw,
      due: dueRaw,
      dueISO,                         // null if blank/invalid
      overdue: dueISO !== null && dueISO <= today,
    };
  };

  const rows = records.slice(1).map((row, i) => ({
    id: (row[COL.sNo] || String(i + 1)).trim() || String(i + 1),
    cliId: (row[COL.cliId] || '').trim(),
    cliName: (row[COL.cliName] || '').trim(),
    crewId: (row[COL.crewId] || '').trim(),
    name: (row[COL.name] || '').trim(),
    desig: (row[COL.desig] || '').trim(),
    grade: (row[COL.currentGrade] || '').trim(),
    params: {
      footplate: buildParam(row, COL.footplate),
      grading: buildParam(row, COL.grading),
      counselling: buildParam(row, COL.counselling),
    },
  }));

  return { generatedAtIST: today, rows, warnings };
}

// Overdue-only rows for one parameter
function dueListFor(rows, parameter) {
  if (!PARAMETERS[parameter]) throw new Error(`Unknown parameter: ${parameter}`);
  return rows.filter((r) => r.params[parameter].overdue);
}

module.exports = {
  COL,
  PARAMETERS,
  EXPECTED_COLUMNS,
  istTodayISO,
  ddmmyyyyToISO,
  parseCmsReport,
  dueListFor,
};
