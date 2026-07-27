'use strict';

/*
 * CMS Report processing core.
 *
 * Single source of truth for:
 *  - locating the columns of the CMS export (by HEADER NAME, not by position)
 *  - dd-mm-yyyy parsing
 *  - "overdue" computation against today in IST (due date <= today)
 *
 * Why by name: the CMS export has changed shape before. The older export had 24
 * columns; a later one inserted a STATUS column after DESIG., pushing every date
 * column right by one. Fixed indices parsed that file silently wrong (the Grading
 * due list simply came out empty). So the header row is read and each field is
 * matched by its name.
 *
 * The one wrinkle: DONE DATE, DUE DATE, MODE and # each appear three times — once
 * per parameter block. Their meaning comes from block order, so the repeated pair
 * is resolved by occurrence:
 *
 *   S.No. | CLI ID | CLI NAME | CREW ID | NAME | DESIG. | [STATUS] |
 *   PREVIOUS DATE | PREVIOUS GRADE | DONE DATE | CURRENT GRADE | DUE DATE |  <- 1st = Grading
 *   # | MODE | DONE DATE | DUE DATE |                                       <- 2nd = Counselling
 *   # | REMARK-[SUBJECT] | MODE | DONE DATE | DUE DATE |                     <- 3rd = Foot Plate
 *   REMARK | MODE | PLAY DATE | SCORE
 *
 * CURRENT GRADE is the safety category (A/B/C/D). If the header can't be matched at
 * all, we fall back to the legacy positional map and warn loudly — a silent
 * fallback is what let the last format change go unnoticed.
 */

const { parse } = require('csv-parse/sync');

// Parameter metadata, used by UI + exports
const PARAMETERS = {
  footplate:   { key: 'footplate',   label: 'Foot Plate Monitoring' },
  grading:     { key: 'grading',     label: 'Grading' },
  counselling: { key: 'counselling', label: 'Counselling' },
};

// ---- Header matching ----

// Uppercase, trim, collapse runs of whitespace (some CMS headers carry double spaces).
function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, ' ');
}

// Single-value fields: first alias that matches wins. `optional` fields may be absent.
const SIMPLE_FIELDS = [
  { key: 'sNo',          aliases: ['S.NO.', 'S.NO', 'SNO', 'SR.NO.', 'SR NO'] },
  { key: 'cliId',        aliases: ['CLI ID', 'CLI-ID', 'CLIID'] },
  { key: 'cliName',      aliases: ['CLI NAME'] },
  { key: 'crewId',       aliases: ['CREW ID', 'CREW-ID', 'CREWID'] },
  { key: 'name',         aliases: ['NAME', 'CREW NAME'] },
  { key: 'desig',        aliases: ['DESIG.', 'DESIG', 'DESIGNATION'] },
  { key: 'status',       aliases: ['STATUS'], optional: true },
  { key: 'currentGrade', aliases: ['CURRENT GRADE', 'CURRENT GRADE.'] },
];

// The legacy 24-column layout, used only as a fallback when the header is unusable.
// `shift` is 1 for the 25-column export (STATUS present), 0 for the original.
function positionalMap(shift) {
  return {
    sNo: 0,
    cliId: 1,
    cliName: 2,
    crewId: 3,
    name: 4,
    desig: 5,
    status: shift ? 6 : null,
    currentGrade: 9 + shift,
    grading:     { done: 8 + shift,  due: 10 + shift },
    counselling: { done: 13 + shift, due: 14 + shift },
    footplate:   { done: 18 + shift, due: 19 + shift },
  };
}

/*
 * Resolve the column map from a header row.
 * Returns { map, mode: 'header'|'positional', warnings: [...] }
 */
function buildColumnMap(header) {
  const cells = (header || []).map(norm);
  const warnings = [];

  // First index per distinct name, plus every index for the repeated date columns.
  const firstIdx = new Map();
  const doneIdxs = [];
  const dueIdxs = [];
  cells.forEach((c, i) => {
    if (!firstIdx.has(c)) firstIdx.set(c, i);
    if (c === 'DONE DATE') doneIdxs.push(i);
    if (c === 'DUE DATE') dueIdxs.push(i);
  });

  const map = {};
  const missing = [];
  let namedHits = 0;
  for (const f of SIMPLE_FIELDS) {
    const hit = f.aliases.find((a) => firstIdx.has(a));
    if (hit !== undefined) {
      map[f.key] = firstIdx.get(hit);
      namedHits++;
    } else if (f.optional) {
      map[f.key] = null;
    } else {
      missing.push(f.aliases[0]);
    }
  }

  // Block order: 1st DONE/DUE pair = Grading, 2nd = Counselling, 3rd = Foot Plate.
  const BLOCKS = ['grading', 'counselling', 'footplate'];
  if (doneIdxs.length >= BLOCKS.length && dueIdxs.length >= BLOCKS.length) {
    BLOCKS.forEach((b, i) => { map[b] = { done: doneIdxs[i], due: dueIdxs[i] }; });
  } else {
    missing.push(
      `${BLOCKS.length}× DONE DATE / DUE DATE (found ${doneIdxs.length} / ${dueIdxs.length})`
    );
  }

  if (missing.length === 0) {
    return { map, mode: 'header', warnings };
  }

  // Fallback. Guess the layout from the row width and say so plainly.
  const shift = cells.length >= 25 ? 1 : 0;
  warnings.push(
    `Could not locate these columns by header name: ${missing.join(', ')}. ` +
    `Falling back to fixed column positions for a ${24 + shift}-column export — ` +
    `check the figures against CMS before circulating this list.`
  );
  // Nothing matched by name and row 0 carries a CLI ID -> the export has no header row.
  if (namedHits === 0 && /^[A-Z]{3,4}\d+$/.test(cells[1] || '')) {
    warnings.push('The first row looks like data, not a header — the file may have been exported without a header row.');
  }
  return { map: positionalMap(shift), mode: 'positional', warnings };
}

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
 * Each row: { id, cliId, cliName, crewId, name, desig, status, grade,
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

  const { map: col, warnings } = buildColumnMap(records[0]);
  const dataRows = records.slice(1);
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

  const rows = dataRows.map((row, i) => ({
    id: (row[col.sNo] || String(i + 1)).trim() || String(i + 1),
    cliId: (row[col.cliId] || '').trim(),
    cliName: (row[col.cliName] || '').trim(),
    crewId: (row[col.crewId] || '').trim(),
    name: (row[col.name] || '').trim(),
    desig: (row[col.desig] || '').trim(),
    status: col.status === null ? '' : (row[col.status] || '').trim(),
    grade: (row[col.currentGrade] || '').trim(),
    params: {
      footplate: buildParam(row, col.footplate),
      grading: buildParam(row, col.grading),
      counselling: buildParam(row, col.counselling),
    },
  }));

  warnings.push(...sanityCheck(rows));

  return { generatedAtIST: today, rows, warnings };
}

/*
 * Cheap post-parse check on a sample of rows: if a due column yielded no usable
 * date at all, the column map is probably wrong. Warn rather than fail — a genuinely
 * all-blank parameter is possible, just unlikely across a whole export.
 */
function sanityCheck(rows) {
  const sample = rows.slice(0, 20);
  if (sample.length === 0) return [];
  const anyDates = sample.some((r) =>
    Object.keys(PARAMETERS).some((p) => r.params[p].dueISO !== null));
  if (!anyDates) return [];

  return Object.keys(PARAMETERS)
    .filter((p) => sample.every((r) => r.params[p].due !== '' && r.params[p].dueISO === null))
    .map((p) =>
      `The ${PARAMETERS[p].label} due column holds values that aren't dd-mm-yyyy dates ` +
      `(e.g. "${sample[0].params[p].due}") — the CMS export format may have changed again.`);
}

// Overdue-only rows for one parameter
function dueListFor(rows, parameter) {
  if (!PARAMETERS[parameter]) throw new Error(`Unknown parameter: ${parameter}`);
  return rows.filter((r) => r.params[parameter].overdue);
}

module.exports = {
  PARAMETERS,
  buildColumnMap,
  istTodayISO,
  ddmmyyyyToISO,
  parseCmsReport,
  dueListFor,
};
