'use strict';

/*
 * CMS "CLI monitoring counts" -> "CLI Monitoring Due" processing core.
 *
 * An ALL-INDIA table: one row per division across every zone (~72 rows). CMS has
 * already done the arithmetic — our CSTM row carries the sheet's figures as-is:
 *
 *   S.No. | ZONE | DIVISION | NO. OF CLI | CREW ALLOTED | FP OVERDUE TOTAL |
 *   FP OVERDUE (RUN) | FP OVERDUE (NONRUN) | % FP OVERDUE | COUNSELOVERDUE |
 *   % COUNSELOVERDUE | GRADINGOVERDUE | % GRADINGOVERDUE
 *
 * The sheet prints Footplate (with its Run / Non-run split), Counselling and
 * Grading for CSTM only — no total, no percentages (user, 2026-09-25). Everything
 * else (CLI count, crew, %, the other 71 divisions) is parsed and kept: the CR
 * peers are shown as a second table, all-India goes to the detail export.
 *
 * Checks, since a shifted column would still yield plausible numbers: RUN + NONRUN
 * must equal FP total, and each CMS % must equal overdue / crew (within rounding).
 *
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

const OUR_DIVISION = 'CSTM';
const OUR_ZONE = 'CR';

const FIELDS = [
  { key: 'zone',     aliases: ['ZONE'] },
  { key: 'division', aliases: ['DIVISION'] },
  { key: 'cli',      aliases: ['NO. OF CLI', 'NO OF CLI'] },
  { key: 'crew',     aliases: ['CREW ALLOTED', 'CREW ALLOTTED'] },
  { key: 'fp',       aliases: ['FP OVERDUE TOTAL'] },
  { key: 'fpRun',    aliases: ['FP OVERDUE (RUN)'] },
  { key: 'fpNonRun', aliases: ['FP OVERDUE (NONRUN)', 'FP OVERDUE (NON RUN)'] },
  { key: 'fpPct',    aliases: ['% FP OVERDUE'] },
  { key: 'couns',    aliases: ['COUNSELOVERDUE', 'COUNSEL OVERDUE'] },
  { key: 'counsPct', aliases: ['% COUNSELOVERDUE', '% COUNSEL OVERDUE'] },
  { key: 'grading',  aliases: ['GRADINGOVERDUE', 'GRADING OVERDUE'] },
  { key: 'gradingPct', aliases: ['% GRADINGOVERDUE', '% GRADING OVERDUE'] },
];

function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, ' ');
}

function columnMap(header) {
  const cells = (header || []).map(norm);
  const map = {};
  for (const f of FIELDS) {
    const i = cells.findIndex((c) => f.aliases.includes(c));
    if (i === -1) return null;
    map[f.key] = i;
  }
  return map;
}

// FP OVERDUE (RUN) + COUNSELOVERDUE + GRADINGOVERDUE together occur in no other download.
function matchesHeader(header) {
  return columnMap(header) !== null;
}

/*
 * Parse a CSV buffer/string.
 * Returns { rows, warnings }
 *   rows [{ zone, division, cli, crew, fp, fpRun, fpNonRun, fpPct, couns, counsPct, grading, gradingPct }]
 */
function parseCliMon(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the CLI monitoring counts report: DIVISION, NO. OF CLI, FP OVERDUE (RUN), COUNSELOVERDUE and GRADINGOVERDUE columns are all required.');

  const warnings = [];
  const rows = records.slice(1).map((rec, i) => {
    const division = norm(rec[col.division]);
    const where = `Row ${i + 2} (${division || 'no division'})`;
    if (!division) throw new Error(`Row ${i + 2} has no division.`);
    const int = (k) => {
      const raw = String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`${where} has a non-numeric count "${raw}" in ${FIELDS.find((f) => f.key === k).aliases[0]}.`);
      return Number(raw);
    };
    const pct = (k) => {
      const raw = String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
      return /^\d+(\.\d+)?$/.test(raw) ? Number(raw) : null;
    };
    const r = {
      zone: norm(rec[col.zone]), division,
      cli: int('cli'), crew: int('crew'),
      fp: int('fp'), fpRun: int('fpRun'), fpNonRun: int('fpNonRun'), fpPct: pct('fpPct'),
      couns: int('couns'), counsPct: pct('counsPct'),
      grading: int('grading'), gradingPct: pct('gradingPct'),
    };
    if (r.fpRun + r.fpNonRun !== r.fp) {
      warnings.push(`${where}: Run ${r.fpRun} + Non-run ${r.fpNonRun} does not equal FP overdue ${r.fp}.`);
    }
    // Only police our own row's percentages; a shifted column shows up here first.
    if (division === OUR_DIVISION && r.crew > 0) {
      [['fp', 'fpPct', '% FP OVERDUE'], ['couns', 'counsPct', '% COUNSELOVERDUE'], ['grading', 'gradingPct', '% GRADINGOVERDUE']]
        .forEach(([n, p, label]) => {
          if (r[p] !== null && Math.abs(r[n] / r.crew * 100 - r[p]) > 0.011) {
            warnings.push(`${where}: ${label} is ${r[p]} but ${r[n]} / ${r.crew} crew = ${(r[n] / r.crew * 100).toFixed(2)} — a column may have shifted.`);
          }
        });
    }
    return r;
  });
  if (rows.length === 0) throw new Error('The file has a header but no data rows.');
  if (!rows.some((r) => r.division === OUR_DIVISION)) {
    warnings.push(`${OUR_DIVISION} is not in this download — check the CMS filter.`);
  }
  return { rows, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows } = parsed;
  const fpCell = (r) => `${r.fp} (${r.fpRun} / ${r.fpNonRun})`;
  const ours = rows.filter((r) => r.division === OUR_DIVISION);

  const main = {
    title: 'CLI Monitoring Due',
    note: 'Overdue counts as CMS reports them. Footplate is shown as total (Run / Non-run).',
    headers: ['Division', 'Footplate (Run / Non-run)', 'Counselling', 'Grading'],
    rows: ours.map((r) => [r.division, fpCell(r), r.couns, r.grading]),
    total: null,
    emptyText: `${OUR_DIVISION} not in the download.`,
    alertCols: [1, 2, 3],
  };

  const peers = rows.filter((r) => r.zone === OUR_ZONE);
  const cr = {
    title: `${OUR_ZONE} divisions — for comparison`,
    headers: ['Division', 'CLIs', 'Crew', 'Footplate (Run / Non-run)', 'Counselling', 'Grading'],
    rows: peers.map((r) => [r.division, r.cli, r.crew, fpCell(r), r.couns, r.grading]),
    total: null,
    emptyText: `No ${OUR_ZONE} rows in the download.`,
  };

  const allIndia = {
    title: 'All divisions (as downloaded)',
    note: `${rows.length} divisions. Percentages are CMS's: overdue as a share of crew allotted.`,
    headers: ['Zone', 'Division', 'CLIs', 'Crew', 'FP overdue', 'FP Run', 'FP Non-run', '% FP', 'Counselling', '% Couns.', 'Grading', '% Grading'],
    rows: rows.map((r) => [r.zone, r.division, r.cli, r.crew, r.fp, r.fpRun, r.fpNonRun,
      r.fpPct == null ? '' : r.fpPct.toFixed(2), r.couns, r.counsPct == null ? '' : r.counsPct.toFixed(2),
      r.grading, r.gradingPct == null ? '' : r.gradingPct.toFixed(2)]),
    total: null,
  };

  return [main, cr, allIndia];
}

module.exports = {
  key: 'climon',
  label: 'CLI Monitoring Due',
  order: 60,
  matchesHeader,
  parse: parseCliMon,
  tables,
};
